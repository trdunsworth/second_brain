"""
Procedural street network generation.

Generates a hierarchical street network:
1. Arterial backbone (grid + organic perturbations)
2. Collector network (connects arterials, forms blocks)
3. Local streets (subdivides blocks, adds cul-de-sacs)

Uses momepy for graph↔GeoDataFrame conversion and topology enforcement.
"""

from __future__ import annotations

import pandas as pd
from dataclasses import dataclass
from typing import Literal

import geopandas as gpd
import networkx as nx
import numpy as np
from shapely.geometry import LineString, Point, Polygon, box, MultiPoint
from shapely.ops import linemerge, polygonize, split, unary_union
from shapely import make_valid, set_precision

import momepy
from pysgn import geo_watts_strogatz_network

from ..config import TownSpec, StreetHierarchyConfig, RoadClass
from ..seeding import SeedState, make_nguid


@dataclass(slots=True)
class StreetNetwork:
    """Container for street network at different hierarchy levels."""
    arterials: gpd.GeoDataFrame
    collectors: gpd.GeoDataFrame
    locals: gpd.GeoDataFrame
    combined: gpd.GeoDataFrame
    graph: nx.MultiGraph  # Primal graph (intersections=nodes, segments=edges)
    blocks: gpd.GeoDataFrame  # Polygonized blocks


class StreetNetworkGenerator:
    """Generates hierarchical street network from configuration."""

    def __init__(self, spec: TownSpec, seed_state: SeedState):
        self.spec = spec
        self.seed_state = seed_state
        self.crs = spec.crs.projected
        self.extent = spec.extent
        self.hierarchy = spec.street_hierarchy
        self.domain = spec.metadata.nguid_domain

    def generate(self) -> StreetNetwork:
        """Run complete generation pipeline."""
        # 1. Arterial backbone
        arterials = self._generate_arterials()

        # 2. Collector network
        collectors = self._generate_collectors(arterials)

        # 3. Local streets
        locals = self._generate_locals(arterials, collectors)

        # 4. Combine and clean topology
        combined = self._combine_and_clean(arterials, collectors, locals)

        # 5. Build graph and polygonize blocks
        graph = momepy.gdf_to_nx(combined, approach="primal")
        blocks = self._polygonize_blocks(combined)

        # 6. Assign address ranges
        combined = self._assign_address_ranges(combined, blocks)

        return StreetNetwork(
            arterials=arterials,
            collectors=collectors,
            locals=locals,
            combined=combined,
            graph=graph,
            blocks=blocks,
        )

    def _generate_arterials(self) -> gpd.GeoDataFrame:
        """Generate arterial backbone — grid with organic perturbations."""
        rng = self.seed_state.rng("streets.arterial")
        config = self.hierarchy.arterial
        extent_box = box(self.extent.minx, self.extent.miny, self.extent.maxx, self.extent.maxy)

        lines = []

        # Determine grid spacing
        spacing = config.spacing_m
        width = self.extent.width
        height = self.extent.height

        # Generate roughly N-S and E-W arterials
        num_ns = max(2, int(width / spacing))
        num_ew = max(2, int(height / spacing))

        # N-S arterials
        for i in range(num_ns + 1):
            x = self.extent.minx + (i / max(1, num_ns)) * width
            # Add organic perturbation
            x += rng.uniform(-spacing * 0.1, spacing * 0.1)
            line = LineString([(x, self.extent.miny), (x, self.extent.maxy)])
            lines.append(self._make_street_record(line, config, f"Arterial NS {i+1}", rng))

        # E-W arterials
        for i in range(num_ew + 1):
            y = self.extent.miny + (i / max(1, num_ew)) * height
            y += rng.uniform(-spacing * 0.1, spacing * 0.1)
            line = LineString([(self.extent.minx, y), (self.extent.maxx, y)])
            lines.append(self._make_street_record(line, config, f"Arterial EW {i+1}", rng))

        # Add diagonal/organic arterials (Watts-Strogatz on grid nodes)
        if len(lines) > 4:
            gdf = gpd.GeoDataFrame(lines, crs=self.crs)
            gdf = self._add_organic_connections(gdf, config, rng)
        else:
            gdf = gpd.GeoDataFrame(lines, crs=self.crs)

        return gdf

    def _generate_collectors(self, arterials: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Generate collector streets connecting arterials."""
        rng = self.seed_state.rng("streets.collector")
        config = self.hierarchy.collector

        # Build graph from arterials
        art_graph = momepy.gdf_to_nx(arterials, approach="primal")

        # Get arterial intersection nodes (degree > 2 or dead ends)
        arterial_nodes = [n for n, d in art_graph.degree() if d != 2]

        # Use PySGN to generate geospatial Watts-Strogatz network
        # between arterial nodes
        if len(arterial_nodes) < 4:
            return gpd.GeoDataFrame(columns=arterials.columns, crs=self.crs)

        # Create node GeoDataFrame for PySGN
        node_data = []
        for node in arterial_nodes:
            node_data.append({"geometry": Point(node), "node_id": node})
        nodes_gdf = gpd.GeoDataFrame(node_data, crs=self.crs)

        # Generate collector network
        try:
            collector_graph = geo_watts_strogatz_network(
                nodes_gdf,
                k=min(4, len(arterial_nodes) - 1),
                p=0.3,
                constraint=lambda u, v: True,  # Allow any connection
            )
        except Exception:
            # Fallback: simple grid collectors
            return self._fallback_collectors(config, rng)

        # Convert graph edges to GeoDataFrame
        collector_lines = []
        for u, v, data in collector_graph.edges(data=True):
            line = LineString([u, v])
            # Only keep if not too close to existing arterial
            if self._far_from_existing(line, arterials, min_dist=50):
                collector_lines.append(self._make_street_record(line, config, f"Collector {len(collector_lines)+1}", rng))

        if not collector_lines:
            return gpd.GeoDataFrame(columns=arterials.columns, crs=self.crs)

        return gpd.GeoDataFrame(collector_lines, crs=self.crs)

    def _generate_locals(self, arterials: gpd.GeoDataFrame, collectors: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Generate local streets within blocks."""
        rng = self.seed_state.rng("streets.local")
        config = self.hierarchy.local
        cul_config = self.hierarchy.cul_de_sac

        # Combine higher-order streets
        higher_order = gpd.GeoDataFrame(pd.concat([arterials, collectors], ignore_index=True), crs=self.crs)
        higher_order = clean_topology(higher_order)

        # Polygonize to get blocks
        blocks = self._polygonize_blocks(higher_order)

        local_lines = []

        for _, block in blocks.iterrows():
            block_lines = self._subdivide_block(block.geometry, config, cul_config, rng)
            local_lines.extend(block_lines)

        if not local_lines:
            return gpd.GeoDataFrame(columns=arterials.columns, crs=self.crs)

        return gpd.GeoDataFrame(local_lines, crs=self.crs)

    def _subdivide_block(
        self,
        block_poly: Polygon,
        config: StreetHierarchyLevelConfig,
        cul_config: StreetHierarchyLevelConfig,
        rng: np.random.Generator,
    ) -> list[dict]:
        """Recursively subdivide a block into local streets."""
        lines = []

        # Simple approach: add streets parallel to longest axis
        # at regular spacing until block is filled
        bounds = block_poly.bounds
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]

        # Determine orientation
        if width > height:
            # Long axis is E-W, add N-S streets
            spacing = config.spacing_m
            num_streets = max(1, int(width / spacing))
            for i in range(1, num_streets):
                x = bounds[0] + (i / (num_streets + 1)) * width
                x += rng.uniform(-spacing * 0.05, spacing * 0.05)
                line = LineString([(x, bounds[1]), (x, bounds[3])])
                clipped = line.intersection(block_poly)
                if clipped.length > 20:  # Minimum length
                    lines.append(self._make_street_record(clipped, config, f"Local {len(lines)+1}", rng))
        else:
            # Long axis is N-S, add E-W streets
            spacing = config.spacing_m
            num_streets = max(1, int(height / spacing))
            for i in range(1, num_streets):
                y = bounds[1] + (i / (num_streets + 1)) * height
                y += rng.uniform(-spacing * 0.05, spacing * 0.05)
                line = LineString([(bounds[0], y), (bounds[2], y)])
                clipped = line.intersection(block_poly)
                if clipped.length > 20:
                    lines.append(self._make_street_record(clipped, config, f"Local {len(lines)+1}", rng))

        # Add cul-de-sacs at dead ends (simplified)
        # In full implementation, detect dead ends in graph and add cul-de-sacs

        return lines

    def _combine_and_clean(
        self,
        arterials: gpd.GeoDataFrame,
        collectors: gpd.GeoDataFrame,
        locals: gpd.GeoDataFrame,
    ) -> gpd.GeoDataFrame:
        """Combine all levels and clean topology."""
        import pandas as pd

        all_lines = pd.concat([arterials, collectors, locals], ignore_index=True)
        gdf = gpd.GeoDataFrame(all_lines, crs=self.crs)

        # Clean topology: split at intersections, snap, validate
        gdf = clean_topology(gdf)

        return gdf

    def _polygonize_blocks(self, streets: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Polygonize street network to get block polygons."""
        # Ensure topology is clean
        streets = clean_topology(streets)

        # Extract line geometries
        lines = [geom for geom in streets.geometry if not geom.is_empty]

        # Polygonize
        polygons = list(polygonize(lines))

        # Filter: keep only polygons within extent, reasonable size
        extent_box = box(self.extent.minx, self.extent.miny, self.extent.maxx, self.extent.maxy)
        blocks = []
        for poly in polygons:
            poly = make_valid(poly)
            if poly.area > 1000 and poly.area < 1_000_000 and poly.within(extent_box.buffer(10)):
                blocks.append({"geometry": poly, "block_id": len(blocks)})

        if not blocks:
            return gpd.GeoDataFrame(columns=["geometry", "block_id"], crs=self.crs)

        return gpd.GeoDataFrame(blocks, crs=self.crs)

    def _assign_address_ranges(
        self,
        streets: gpd.GeoDataFrame,
        blocks: gpd.GeoDataFrame,
    ) -> gpd.GeoDataFrame:
        """Assign CLDXF-compliant address ranges to street segments."""
        # This is a simplified version — full implementation in addressing.py
        # For now, add placeholder fields
        streets = streets.copy()
        streets["FromAddr_L"] = 0
        streets["ToAddr_L"] = 0
        streets["FromAddr_R"] = 0
        streets["ToAddr_R"] = 0
        streets["Parity_L"] = "E"
        streets["Parity_R"] = "O"
        return streets

    def _make_street_record(
        self,
        geometry: LineString,
        config: StreetHierarchyLevelConfig,
        base_name: str,
        rng: np.random.Generator,
    ) -> dict:
        """Create a street record with NENA fields."""
        # Generate fictional street name
        name_parts = StreetNameGenerator.generate(rng)
        street_id = len(name_parts)  # placeholder

        return {
            "NGUID": make_nguid(self.domain, "rcl", street_id),
            "St_PreMod": name_parts.get("pre_mod"),
            "St_PreDir": name_parts.get("pre_dir"),
            "St_PreTyp": name_parts.get("pre_type"),
            "St_PreTypSep": name_parts.get("pre_type_sep"),
            "St_Name": name_parts["name"],
            "St_PosTyp": name_parts.get("post_type"),
            "St_PosDir": name_parts.get("post_dir"),
            "St_PosMod": name_parts.get("post_mod"),
            "RoadClass": config.road_class.value,
            "SpeedLimit": config.speed_mph,
            "Lanes": config.lanes,
            "Divided": config.divided,
            "OneWay": "B",
            "State": self.spec.metadata.state,
            "County": self.spec.metadata.county,
            "Inc_Muni": self.spec.metadata.municipality,
            "DateUpdate": "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": self.spec.metadata.disclaimer,
            "geometry": make_valid(set_precision(geometry, 0.01)),
        }

    def _add_organic_connections(
        self,
        gdf: gpd.GeoDataFrame,
        config: StreetHierarchyLevelConfig,
        rng: np.random.Generator,
    ) -> gpd.GeoDataFrame:
        """Add organic connections using PySGN Watts-Strogatz."""
        # Get intersection nodes
        graph = momepy.gdf_to_nx(gdf, approach="primal")
        nodes = list(graph.nodes())

        if len(nodes) < 4:
            return gdf

        # Create node GeoDataFrame
        node_data = [{"geometry": Point(n), "node_id": i} for i, n in enumerate(nodes)]
        nodes_gdf = gpd.GeoDataFrame(node_data, crs=self.crs)

        # Generate additional connections
        try:
            new_graph = geo_watts_strogatz_network(
                nodes_gdf,
                k=min(3, len(nodes) - 1),
                p=0.2,
            )

            # Add new edges as streets
            new_lines = []
            for u, v in new_graph.edges():
                if not graph.has_edge(u, v):  # Don't duplicate
                    line = LineString([u, v])
                    if self._far_from_existing(line, gdf, min_dist=30):
                        new_lines.append(self._make_street_record(line, config, f"Arterial Conn {len(new_lines)+1}", rng))

            if new_lines:
                import pandas as pd
                gdf = pd.concat([gdf, gpd.GeoDataFrame(new_lines, crs=self.crs)], ignore_index=True)

        except Exception:
            pass  # Skip organic connections on failure

        return gdf

    def _far_from_existing(self, line: LineString, existing: gpd.GeoDataFrame, min_dist: float) -> bool:
        """Check if line is far enough from existing streets."""
        if len(existing) == 0:
            return True
        # Use STRtree for efficiency
        tree = existing.sindex
        candidates = list(tree.query(line.buffer(min_dist)))
        for idx in candidates:
            if line.distance(existing.geometry.iloc[idx]) < min_dist:
                return False
        return True

    def _fallback_collectors(self, config: StreetHierarchyLevelConfig, rng: np.random.Generator) -> gpd.GeoDataFrame:
        """Fallback collector generation: simple grid."""
        lines = []
        spacing = config.spacing_m
        width = self.extent.width
        height = self.extent.height

        num_ns = max(1, int(width / spacing))
        num_ew = max(1, int(height / spacing))

        for i in range(num_ns):
            x = self.extent.minx + (i + 0.5) * width / num_ns
            line = LineString([(x, self.extent.miny), (x, self.extent.maxy)])
            lines.append(self._make_street_record(line, config, f"Collector NS {i+1}", rng))

        for i in range(num_ew):
            y = self.extent.miny + (i + 0.5) * height / num_ew
            line = LineString([(self.extent.minx, y), (self.extent.maxx, y)])
            lines.append(self._make_street_record(line, config, f"Collector EW {i+1}", rng))

        return gpd.GeoDataFrame(lines, crs=self.crs)