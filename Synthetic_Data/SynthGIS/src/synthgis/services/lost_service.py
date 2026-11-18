"""
LoST (Location-to-Service Translation) Protocol Implementation.

RFC 5222: Location-to-Service Translation (LoST) Protocol
Used in NG9-1-1 to map a location (civic or geo) to the appropriate 
emergency service boundary (PSAP, Fire, Police, EMS) and return 
the service URI and contact information.

This is a scaffold implementation - full RFC compliance requires
XML processing, proper namespace handling, and extensive testing.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Literal
from pathlib import Path

from lxml import etree
from shapely.geometry import Point, Polygon
import geopandas as gpd

from ..config import TownSpec
from ..seeding import SeedState


# ─── LoST XML Namespaces ──────────────────────────────────────────

LOST_NS = "urn:ietf:params:xml:ns:lost1"
GML_NS = "http://www.opengis.net/gml"
SCHEMA_LOCATION = "urn:ietf:params:xml:ns:lost1 lost.xsd"

NAMESPACES = {
    "lost": LOST_NS,
    "gml": GML_NS,
}

# Service URNs per NENA
SERVICE_URNS = {
    "psap": "urn:emergency:service:sos.psap",
    "fire": "urn:emergency:service:sos.fire",
    "police": "urn:emergency:service:sos.police",
    "ems": "urn:emergency:service:sos.ems",
    "poison": "urn:emergency:service:sos.poison",
    "coastguard": "urn:emergency:service:sos.coastguard",
}


@dataclass(slots=True)
class ServiceBoundary:
    """Represents a service boundary with contact info."""
    service_type: str  # psap, fire, police, ems, etc.
    service_urn: str
    name: str
    contact_uri: str  # SIP URI for the service
    geometry: Polygon
    nguid: str


@dataclass(slots=True)
class LoSTRequest:
    """Parsed LoST FindService request."""
    service_boundary: str  # Service URN requested
    location: Point  # WGS84 coordinates
    location_type: Literal["civic", "geo"]
    civic_address: Optional[dict] = None  # CLDXF elements if civic
    recursive: bool = False


@dataclass(slots=True)
class LoSTResponse:
    """LoST FindService response."""
    service_urn: str
    service_boundary_name: str
    service_contact_uri: str
    service_boundary_geometry: Polygon  # The polygon that matched
    mapping_expires: Optional[str] = None  # ISO datetime
    path: Optional[list[str]] = None  # For recursive


class LoSTService:
    """
    LoST Protocol Service for NG9-1-1.
    
    Loads service boundaries from SynthGIS GeoPackage and responds
    to FindService requests with the appropriate service boundary.
    """
    
    def __init__(self, gpkg_path: str | Path):
        self.gpkg_path = Path(gpkg_path)
        self.boundaries: dict[str, gpd.GeoDataFrame] = {}
        self.crs = None
        self._load_boundaries()
    
    def _load_boundaries(self) -> None:
        """Load all service boundary layers from GeoPackage."""
        layer_map = {
            "psap": "PsapPolygon",
            "fire": "FirePolygon",
            "police": "PolicePolygon",
            "ems": "EmsPolygon",
        }
        
        for service_type, layer_name in layer_map.items():
            try:
                gdf = gpd.read_file(self.gpkg_path, layer=layer_name)
                if len(gdf) > 0:
                    # Ensure WGS84 for LoST (RFC 5222 requires geo coordinates)
                    if gdf.crs and gdf.crs.to_epsg() != 4326:
                        gdf = gdf.to_crs("EPSG:4326")
                    self.boundaries[service_type] = gdf
                    if self.crs is None:
                        self.crs = gdf.crs
            except Exception:
                pass
    
    def find_service(self, request: LoSTRequest) -> Optional[LoSTResponse]:
        """
        Find the service boundary containing the given location.
        
        Returns the most specific matching boundary (smallest area).
        """
        if request.service_boundary not in SERVICE_URNS.values():
            # Try to map common names
            service_map = {v: k for k, v in SERVICE_URNS.items()}
            if request.service_boundary in service_map:
                request.service_boundary = SERVICE_URNS[service_map[request.service_boundary]]
            else:
                return None
        
        # Find which service type this URN corresponds to
        service_type = None
        for k, v in SERVICE_URNS.items():
            if v == request.service_boundary:
                service_type = k
                break
        
        if service_type not in self.boundaries:
            return None
        
        gdf = self.boundaries[service_type]
        location = request.location
        
        # Ensure location is in the same CRS as boundaries
        if request.location_type == "geo":
            # Location is already WGS84 (lat/lon)
            point = Point(location.y, location.x)  # Note: GeoPandas expects (lon, lat) = (x, y)
        else:
            # Civic address - would need geocoding
            return None
        
        # Find containing polygons
        containing = gdf[gdf.geometry.contains(point)]
        
        if len(containing) == 0:
            # Try nearest (for edge cases)
            distances = gdf.geometry.distance(point)
            nearest_idx = distances.idxmin()
            containing = gdf.loc[[nearest_idx]]
        
        if len(containing) == 0:
            return None
        
        # Return the most specific (smallest area) match
        best = containing.loc[containing.geometry.area.idxmin()]
        
        return LoSTResponse(
            service_urn=request.service_boundary,
            service_boundary_name=best.get("Name", "Unknown"),
            service_contact_uri=best.get("ServiceNum", f"sip:{service_type}@example.org"),
            service_boundary_geometry=best.geometry,
            mapping_expires=None,  # Could add expiration logic
            path=[best.get("NGUID", "unknown")] if request.recursive else None,
        )
    
    def find_service_xml(self, xml_request: bytes) -> bytes:
        """
        Process a full LoST XML request and return XML response.
        
        This is the main entry point for RFC 5222 compliance.
        """
        try:
            request = self._parse_find_service_xml(xml_request)
            response = self.find_service(request)
            return self._build_find_service_response_xml(response)
        except Exception as e:
            return self._build_error_response_xml(str(e))
    
    def _parse_find_service_xml(self, xml_bytes: bytes) -> LoSTRequest:
        """Parse LoST FindService XML request."""
        root = etree.fromstring(xml_bytes)
        
        # Extract service boundary
        service_elem = root.find(".//lost:serviceBoundary", namespaces=NAMESPACES)
        service_boundary = service_elem.text if service_elem is not None else ""
        
        # Extract location
        location_elem = root.find(".//lost:location", namespaces=NAMESPACES)
        location_type = "geo"
        location = None
        civic_address = None
        
        if location_elem is not None:
            # Check for geo location (gml:Point)
            point_elem = location_elem.find(".//gml:Point", namespaces=NAMESPACES)
            if point_elem is not None:
                pos_elem = point_elem.find(".//gml:pos", namespaces=NAMESPACES)
                if pos_elem is not None:
                    coords = pos_elem.text.strip().split()
                    if len(coords) >= 2:
                        lat, lon = float(coords[0]), float(coords[1])
                        location = Point(lon, lat)  # gml:pos is "lat lon"
                        location_type = "geo"
            
            # Check for civic location
            civic_elem = location_elem.find(".//lost:civicAddress", namespaces=NAMESPACES)
            if civic_elem is not None:
                location_type = "civic"
                # Parse CLDXF elements
                civic_address = {}
                for child in civic_elem:
                    tag = etree.QName(child.tag).localname
                    civic_address[tag] = child.text
        
        recursive_elem = root.find(".//lost:recursive", namespaces=NAMESPACES)
        recursive = recursive_elem is not None and recursive_elem.text == "true"
        
        return LoSTRequest(
            service_boundary=service_boundary,
            location=location or Point(0, 0),
            location_type=location_type,
            civic_address=civic_address,
            recursive=recursive,
        )
    
    def _build_find_service_response_xml(self, response: Optional[LoSTResponse]) -> bytes:
        """Build LoST FindServiceResponse XML."""
        if response is None:
            return self._build_error_response_xml("No matching service boundary found")
        
        # Create root element
        root = etree.Element(
            f"{{{LOST_NS}}}findServiceResponse",
            nsmap={None: LOST_NS, "gml": GML_NS},
        )
        
        # Mapping element
        mapping_elem = etree.SubElement(root, f"{{{LOST_NS}}}mapping")
        
        # Service boundary
        sb_elem = etree.SubElement(mapping_elem, f"{{{LOST_NS}}}serviceBoundary")
        sb_elem.text = response.service_urn
        
        # Service contact URI
        contact_elem = etree.SubElement(mapping_elem, f"{{{LOST_NS}}}serviceContact")
        contact_elem.text = response.service_contact_uri
        
        # Service boundary geometry (GML)
        geom_elem = etree.SubElement(mapping_elem, f"{{{LOST_NS}}}serviceBoundaryGeometry")
        gml_polygon = self._polygon_to_gml(response.service_boundary_geometry)
        geom_elem.append(gml_polygon)
        
        # Expiry (optional)
        if response.mapping_expires:
            expiry_elem = etree.SubElement(mapping_elem, f"{{{LOST_NS}}}mappingExpires")
            expiry_elem.text = response.mapping_expires
        
        # Path (for recursive)
        if response.path:
            path_elem = etree.SubElement(mapping_elem, f"{{{LOST_NS}}}path")
            for step in response.path:
                step_elem = etree.SubElement(path_elem, f"{{{LOST_NS}}}pathStep")
                step_elem.text = step
        
        # Display name
        display_elem = etree.SubElement(mapping_elem, f"{{{LOST_NS}}}displayName")
        display_elem.text = response.service_boundary_name
        
        return etree.tostring(root, pretty_print=True, xml_declaration=True, encoding="UTF-8")
    
    def _polygon_to_gml(self, polygon: Polygon) -> etree.Element:
        """Convert Shapely Polygon to GML Polygon element."""
        gml_poly = etree.Element(f"{{{GML_NS}}}Polygon", nsmap={"gml": GML_NS})
        
        exterior = etree.SubElement(gml_poly, f"{{{GML_NS}}}exterior")
        linear_ring = etree.SubElement(exterior, f"{{{GML_NS}}}LinearRing")
        pos_list = etree.SubElement(linear_ring, f"{{{GML_NS}}}posList")
        
        coords = []
        for x, y in polygon.exterior.coords:
            coords.append(f"{y} {x}")  # GML uses lat lon (y x)
        pos_list.text = " ".join(coords)
        
        # Interiors (holes)
        for interior in polygon.interiors:
            interior_elem = etree.SubElement(gml_poly, f"{{{GML_NS}}}interior")
            linear_ring = etree.SubElement(interior_elem, f"{{{GML_NS}}}LinearRing")
            pos_list = etree.SubElement(linear_ring, f"{{{GML_NS}}}posList")
            coords = []
            for x, y in interior.coords:
                coords.append(f"{y} {x}")
            pos_list.text = " ".join(coords)
        
        return gml_poly
    
    def _build_error_response_xml(self, message: str) -> bytes:
        """Build LoST error response."""
        root = etree.Element(
            f"{{{LOST_NS}}}findServiceResponse",
            nsmap={None: LOST_NS},
        )
        error = etree.SubElement(root, f"{{{LOST_NS}}}error")
        error.text = message
        return etree.tostring(root, pretty_print=True, xml_declaration=True, encoding="UTF-8")


# ─── FastAPI Integration ──────────────────────────────────────────

def create_lost_app(gpkg_path: str | Path) -> "FastAPI":
    """Create FastAPI app with LoST endpoint."""
    from fastapi import FastAPI, Request, Response, HTTPException
    from fastapi.responses import Response as FastAPIResponse
    
    lost_service = LoSTService(gpkg_path)
    app = FastAPI(title="SynthGIS LoST Service", version="0.1.0")
    
    @app.post("/lost/findService")
    async def find_service(request: Request):
        body = await request.body()
        xml_response = lost_service.find_service_xml(body)
        return FastAPIResponse(content=xml_response, media_type="application/xml")
    
    @app.get("/lost/health")
    def health():
        return {"status": "healthy", "boundaries_loaded": list(lost_service.boundaries.keys())}
    
    return app


# ─── CLI Integration ──────────────────────────────────────────────

def serve_lost(
    gpkg_path: str | Path,
    host: str = "0.0.0.0",
    port: int = 8001,
) -> None:
    """Start LoST service server."""
    import uvicorn
    app = create_lost_app(gpkg_path)
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        serve_lost(sys.argv[1])
    else:
        print("Usage: python -m synthgis.services.lost_service <geopackage_path>")