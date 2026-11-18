"""
FastAPI-based routing service for SynthGIS.

Provides REST endpoints for:
- Point-to-point routing (shortest path, travel time)
- Drive-time isochrones
- Nearest station/facility lookup
- Network statistics

Uses NetworkX graph built from SynthGIS street network.
"""

from __future__ import annotations

import pickle
from pathlib import Path
from typing import List, Optional, Literal

from fastapi import FastAPI, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from shapely.geometry import Point, LineString, mapping
import networkx as nx
import geopandas as gpd

from ..config import TownSpec
from ..routing import build_routing_graph, shortest_path, drive_time_isochrone, compute_response_times
from ..export.geopackage import export_geopackage
from ..streets.generator import StreetNetwork


# ─── Request/Response Models ────────────────────────────────────────

class Coordinate(BaseModel):
    x: float = Field(..., description="X coordinate in projected CRS")
    y: float = Field(..., description="Y coordinate in projected CRS")

    def to_point(self) -> Point:
        return Point(self.x, self.y)


class RouteRequest(BaseModel):
    origin: Coordinate
    destination: Coordinate
    weight: Literal["travel_time", "length"] = "travel_time"


class RouteResponse(BaseModel):
    path: List[List[float]] = Field(..., description="List of [x, y] coordinates")
    distance_m: float = Field(..., description="Total path length in meters")
    time_seconds: float = Field(..., description="Total travel time in seconds")
    geometry: dict = Field(..., description="GeoJSON LineString geometry")
    weight_used: str


class IsochroneRequest(BaseModel):
    origin: Coordinate
    max_time_seconds: float = Field(..., description="Maximum travel time in seconds")
    weight: Literal["travel_time", "length"] = "travel_time"


class IsochroneResponse(BaseModel):
    reachable_nodes: List[List[float]] = Field(..., description="Node coordinates within time")
    geometry: dict = Field(..., description="GeoJSON Polygon (convex hull of reachable area)")
    max_time_seconds: float
    node_count: int


class NearestFacilityRequest(BaseModel):
    origin: Coordinate
    facility_type: Literal["fire", "police", "ems", "hospital", "all"] = "all"
    max_results: int = 5


class FacilityInfo(BaseModel):
    facility_id: str
    facility_type: str
    name: str
    coordinates: List[float]
    distance_m: float
    travel_time_seconds: float


class NearestFacilityResponse(BaseModel):
    facilities: List[FacilityInfo]


class NetworkStatsResponse(BaseModel):
    nodes: int
    edges: int
    total_length_km: float
    connected_components: int
    avg_degree: float
    is_connected: bool


# ─── Application State ────────────────────────────────────────────

class RoutingService:
    """Manages the routing graph and associated data."""
    
    def __init__(self):
        self.graph: Optional[nx.MultiDiGraph] = None
        self.stations: dict[str, gpd.GeoDataFrame] = {}
        self.street_network: Optional[StreetNetwork] = None
        self.spec: Optional[TownSpec] = None
        self.crs: Optional[str] = None

    def load_from_geopackage(self, gpkg_path: str | Path) -> None:
        """Load routing graph and data from GeoPackage."""
        gpkg_path = Path(gpkg_path)
        
        # Load streets
        streets = gpd.read_file(gpkg_path, layer="RoadCenterLine")
        self.crs = streets.crs
        
        # Load stations
        for layer in ["FireStationPoint", "PoliceStationPoint", "EmsStationPoint", "HospitalPoint"]:
            try:
                self.stations[layer] = gpd.read_file(gpkg_path, layer=layer)
            except Exception:
                self.stations[layer] = gpd.GeoDataFrame(columns=["geometry"], crs=self.crs)
        
        # Build graph
        # Create a minimal StreetNetwork object
        from ..streets.generator import StreetNetwork
        self.street_network = StreetNetwork(
            arterials=gpd.GeoDataFrame(),
            collectors=gpd.GeoDataFrame(),
            locals=gpd.GeoDataFrame(),
            combined=streets,
            graph=nx.MultiGraph(),
            blocks=gpd.GeoDataFrame(),
        )
        
        # Build routing graph
        # Need spec for speed limits, etc. - create minimal one
        self.graph = build_routing_graph(self.street_network, self._minimal_spec(), None)

    def load_from_pickle(self, pickle_path: str | Path) -> None:
        """Load pre-computed graph from pickle file."""
        with open(pickle_path, "rb") as f:
            data = pickle.load(f)
        self.graph = data["graph"]
        self.stations = data.get("stations", {})
        self.crs = data.get("crs")

    def save_pickle(self, pickle_path: str | Path) -> None:
        """Save graph and data to pickle for fast startup."""
        data = {
            "graph": self.graph,
            "stations": self.stations,
            "crs": self.crs,
        }
        with open(pickle_path, "wb") as f:
            pickle.dump(data, f)

    def _minimal_spec(self) -> TownSpec:
        """Create minimal spec for routing (speed limits, etc.)."""
        from ..config import (
            TownSpec, MetadataConfig, CRSConfig, ExtentConfig,
            StreetHierarchyConfig, StreetHierarchyLevelConfig,
            ZoningConfig, ZoningTypeConfig, HydrologyConfig,
            AddressingConfig, OperationalConfig, OutputConfig
        )
        return TownSpec(
            metadata=MetadataConfig(),
            crs=CRSConfig(),
            extent=ExtentConfig(minx=0, maxx=10000, miny=0, maxy=10000),
            street_hierarchy=StreetHierarchyConfig(
                arterial=StreetHierarchyLevelConfig(target_length_km=10, spacing_m=500, road_class="SH", speed_mph=45),
                collector=StreetHierarchyLevelConfig(target_length_km=20, spacing_m=200, road_class="CO", speed_mph=35),
                local=StreetHierarchyLevelConfig(target_length_km=50, spacing_m=100, road_class="LO", speed_mph=25),
                cul_de_sac=StreetHierarchyLevelConfig(max_length_m=150, road_class="LO", speed_mph=15),
            ),
            zoning=ZoningConfig(
                residential=ZoningTypeConfig(proportion=0.6, min_parcel_sqm=400, max_parcel_sqm=2000, setback_m=6, building_coverage=0.35, floors=[1,2]),
                commercial=ZoningTypeConfig(proportion=0.2, min_parcel_sqm=1000, max_parcel_sqm=10000, setback_m=10, building_coverage=0.5, floors=[1,3]),
                industrial=ZoningTypeConfig(proportion=0.1, min_parcel_sqm=5000, max_parcel_sqm=50000, setback_m=15, building_coverage=0.6, floors=[1,2]),
                civic=ZoningTypeConfig(proportion=0.1, min_parcel_sqm=2000, max_parcel_sqm=20000, setback_m=10, building_coverage=0.4, floors=[1,3]),
            ),
            hydrology=HydrologyConfig(),
            addressing=AddressingConfig(),
            operational=OperationalConfig(),
            output=OutputConfig(),
        )

    def is_ready(self) -> bool:
        return self.graph is not None and len(self.graph) > 0


# Global service instance
routing_service = RoutingService()


# ─── FastAPI App ──────────────────────────────────────────────────

app = FastAPI(
    title="SynthGIS Routing Service",
    description="REST API for routing on synthetic NG9-1-1 street networks",
    version="0.1.0",
)


def get_service() -> RoutingService:
    """Dependency injection for routing service."""
    if not routing_service.is_ready():
        raise HTTPException(status_code=503, detail="Routing service not initialized")
    return routing_service


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    # Will be initialized via CLI command or explicit load
    pass


# ─── Health & Info ────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "healthy" if routing_service.is_ready() else "not_ready",
        "graph_nodes": len(routing_service.graph) if routing_service.graph else 0,
        "graph_edges": routing_service.graph.number_of_edges() if routing_service.graph else 0,
        "stations_loaded": {k: len(v) for k, v in routing_service.stations.items()},
        "crs": str(routing_service.crs) if routing_service.crs else None,
    }


@app.get("/stats", response_model=NetworkStatsResponse)
def network_stats(service: RoutingService = Depends(get_service)):
    """Get network topology statistics."""
    graph = service.graph
    total_length = sum(
        data.get("length", 0) 
        for _, _, data in graph.edges(data=True)
    )
    
    components = list(nx.weakly_connected_components(graph))
    degrees = [d for _, d in graph.degree()]
    
    return NetworkStatsResponse(
        nodes=graph.number_of_nodes(),
        edges=graph.number_of_edges(),
        total_length_km=total_length / 1000,
        connected_components=len(components),
        avg_degree=sum(degrees) / len(degrees) if degrees else 0,
        is_connected=len(components) == 1,
    )


# ─── Routing Endpoints ────────────────────────────────────────────

@app.post("/route", response_model=RouteResponse)
def route(request: RouteRequest, service: RoutingService = Depends(get_service)):
    """Calculate shortest path between two points."""
    result = shortest_path(service.graph, request.origin.to_point(), request.destination.to_point(), request.weight)
    
    if result is None:
        raise HTTPException(status_code=404, detail="No path found between points")
    
    coords, cost = result
    line = LineString(coords)
    
    # Calculate distance
    distance = sum(
        Point(coords[i]).distance(Point(coords[i+1]))
        for i in range(len(coords) - 1)
    )
    
    return RouteResponse(
        path=coords,
        distance_m=distance,
        time_seconds=cost if request.weight == "travel_time" else 0,
        geometry=mapping(line),
        weight_used=request.weight,
    )


@app.post("/isochrone", response_model=IsochroneResponse)
def isochrone(request: IsochroneRequest, service: RoutingService = Depends(get_service)):
    """Calculate drive-time isochrone (reachable area within time)."""
    nodes = drive_time_isochrone(service.graph, request.origin.to_point(), request.max_time_seconds, request.weight)
    
    if not nodes:
        raise HTTPException(status_code=404, detail="No reachable nodes from origin")
    
    # Create convex hull of reachable nodes
    node_points = [Point(n) for n in nodes]
    from shapely.ops import unary_union
    from shapely.geometry import MultiPoint
    multipoint = MultiPoint(node_points)
    hull = multipoint.convex_hull
    
    return IsochroneResponse(
        reachable_nodes=[list(n) for n in nodes],
        geometry=mapping(hull),
        max_time_seconds=request.max_time_seconds,
        node_count=len(nodes),
    )


@app.post("/nearest", response_model=NearestFacilityResponse)
def nearest_facility(request: NearestFacilityRequest, service: RoutingService = Depends(get_service)):
    """Find nearest emergency facilities to a point."""
    origin = request.origin.to_point()
    
    # Determine which station layers to search
    layers_to_search = {}
    if request.facility_type == "all":
        layers_to_search = service.stations
    else:
        layer_map = {
            "fire": "FireStationPoint",
            "police": "PoliceStationPoint",
            "ems": "EmsStationPoint",
            "hospital": "HospitalPoint",
        }
        layer_name = layer_map.get(request.facility_type)
        if layer_name and layer_name in service.stations:
            layers_to_search = {layer_name: service.stations[layer_name]}
    
    all_facilities = []
    
    for layer_name, gdf in layers_to_search.items():
        if len(gdf) == 0:
            continue
        
        for _, facility in gdf.iterrows():
            # Calculate travel time
            try:
                time_sec = nx.shortest_path_length(
                    service.graph,
                    service._nearest_node(origin),
                    service._nearest_node(facility.geometry),
                    weight="travel_time"
                )
                distance = origin.distance(facility.geometry)
            except (nx.NetworkXNoPath, AttributeError):
                # Fallback to straight-line
                distance = origin.distance(facility.geometry)
                time_sec = distance / 10  # Rough estimate
            
            all_facilities.append(FacilityInfo(
                facility_id=facility.get("NGUID", facility.get("StationNum", "unknown")),
                facility_type=layer_name.replace("StationPoint", "").replace("Point", "").lower(),
                name=facility.get("StationName", facility.get("HospitalName", "Unknown")),
                coordinates=[facility.geometry.x, facility.geometry.y],
                distance_m=distance,
                travel_time_seconds=time_sec,
            ))
    
    # Sort by travel time
    all_facilities.sort(key=lambda f: f.travel_time_seconds)
    
    return NearestFacilityResponse(facilities=all_facilities[:request.max_results])


# ─── Graph Management ─────────────────────────────────────────────

@app.post("/graph/load")
def load_graph(
    gpkg_path: str = Query(..., description="Path to GeoPackage file"),
    service: RoutingService = Depends(get_service),
):
    """Load routing graph from GeoPackage."""
    try:
        service.load_from_geopackage(gpkg_path)
        return {"status": "loaded", "nodes": len(service.graph), "edges": service.graph.number_of_edges()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load graph: {e}")


@app.post("/graph/save")
def save_graph(
    pickle_path: str = Query(..., description="Path to save pickle file"),
    service: RoutingService = Depends(get_service),
):
    """Save routing graph to pickle for fast startup."""
    try:
        service.save_pickle(pickle_path)
        return {"status": "saved", "path": pickle_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save graph: {e}")


@app.post("/graph/load_pickle")
def load_pickle(
    pickle_path: str = Query(..., description="Path to pickle file"),
    service: RoutingService = Depends(get_service),
):
    """Load routing graph from pickle file."""
    try:
        service.load_from_pickle(pickle_path)
        return {"status": "loaded", "nodes": len(service.graph), "edges": service.graph.number_of_edges()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load pickle: {e}")


# ─── Internal Helpers ─────────────────────────────────────────────

def _nearest_node(self, point: Point):
    """Find nearest graph node to a point."""
    if not self.graph:
        return None
    
    min_dist = float("inf")
    nearest = None
    for node in self.graph.nodes():
        dist = (node[0] - point.x) ** 2 + (node[1] - point.y) ** 2
        if dist < min_dist:
            min_dist = dist
            nearest = node
    return nearest

# Monkey-patch the service
RoutingService._nearest_node = _nearest_node


# ─── CLI Entry Point ──────────────────────────────────────────────

def create_app() -> FastAPI:
    """Factory for creating the FastAPI app (for testing)."""
    return app


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)