"""
Topology validation using Shapely and momepy.

Validates geometric and topological correctness without requiring PostGIS.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import geopandas as gpd
import momepy
import networkx as nx
import numpy as np
from shapely.geometry import LineString, Point, Polygon
from shapely import make_valid, set_precision, get_precision

from ..config import TownSpec


@dataclass(slots=True)
class TopologyIssue:
    """Represents a single topology issue."""
    layer: str
    issue_type: str
    severity: Literal["error", "warning", "info"]
    feature_id: str | int
    description: str
    geometry_wkt: str | None = None


@dataclass(slots=True)
class TopologyReport:
    """Complete topology validation report."""
    issues: list[TopologyIssue] = field(default_factory=list)
    summary: dict[str, int] = field(default_factory=dict)

    @property
    def error_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == "error")

    @property
    def warning_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == "warning")

    @property
    def is_clean(self) -> bool:
        return self.error_count == 0

    def add_issue(self, issue: TopologyIssue) -> None:
        self.issues.append(issue)

    def to_dict(self) -> dict[str, Any]:
        return {
            "summary": {
                "total_issues": len(self.issues),
                "errors": self.error_count,
                "warnings": self.warning_count,
                "is_clean": self.is_clean,
            },
            "issues": [
                {
                    "layer": i.layer,
                    "type": i.issue_type,
                    "severity": i.severity,
                    "feature_id": i.feature_id,
                    "description": i.description,
                }
                for i in self.issues
            ],
        }


class TopologyValidator:
    """Validates topology for all SynthGIS layers."""

    def __init__(self, spec: TownSpec, precision: float = 0.01):
        self.spec = spec
        self.precision = precision
        self.report = TopologyReport()

    def validate_all(self, layers: dict[str, gpd.GeoDataFrame]) -> TopologyReport:
        """Validate all layers."""
        self.report = TopologyReport()

        # Validate each layer type
        if "RoadCenterLine" in layers:
            self._validate_road_centerlines(layers["RoadCenterLine"])

        if "SiteStructureAddressPoint" in layers:
            self._validate_address_points(layers["SiteStructureAddressPoint"], layers.get("RoadCenterLine"))

        for layer_name in ["PsapPolygon", "FirePolygon", "PolicePolygon", "EmsPolygon", "ProvisioningPolygon"]:
            if layer_name in layers:
                self._validate_boundary_polygons(layers[layer_name], layer_name)

        # Cross-layer validation
        self._validate_cross_layer(layers)

        # Build summary
        self.report.summary = {
            "total_issues": len(self.report.issues),
            "errors": self.report.error_count,
            "warnings": self.report.warning_count,
            "layers_checked": list(layers.keys()),
        }

        return self.report

    def _validate_road_centerlines(self, gdf: gpd.GeoDataFrame) -> None:
        """Validate road centerline topology."""
        if len(gdf) == 0:
            return

        # 1. Geometry validity
        invalid = gdf[~gdf.geometry.is_valid]
        for _, row in invalid.iterrows():
            self.report.add_issue(TopologyIssue(
                layer="RoadCenterLine",
                issue_type="invalid_geometry",
                severity="error",
                feature_id=row.get("rcl_id", row.get("NGUID", "unknown")),
                description=f"Invalid geometry: {row.geometry.wkt[:100]}",
            ))

        # 2. Zero-length segments
        zero_len = gdf[gdf.geometry.length < 0.01]
        for _, row in zero_len.iterrows():
            self.report.add_issue(TopologyIssue(
                layer="RoadCenterLine",
                issue_type="zero_length",
                severity="warning",
                feature_id=row.get("rcl_id", row.get("NGUID", "unknown")),
                description=f"Segment length < 0.01m: {row.geometry.length}",
            ))

        # 3. Build graph for connectivity checks
        try:
            graph = momepy.gdf_to_nx(gdf, approach="primal", multigraph=True)

            # Isolated segments (components of size 1)
            components = list(nx.connected_components(graph))
            for comp in components:
                if len(comp) == 1:
                    node = list(comp)[0]
                    # Find edges incident to this node
                    for u, v, key, data in graph.edges(node, keys=True, data=True):
                        self.report.add_issue(TopologyIssue(
                            layer="RoadCenterLine",
                            issue_type="isolated_segment",
                            severity="warning",
                            feature_id=data.get("rcl_id", data.get("NGUID", "unknown")),
                            description=f"Segment not connected to network at node {node}",
                        ))

            # Dangling ends (degree 1 nodes) - check if cul-de-sac
            for node, degree in graph.degree():
                if degree == 1:
                    # Find the edge
                    for u, v, key, data in graph.edges(node, keys=True, data=True):
                        road_class = data.get("RoadClass", "")
                        if road_class not in ("LO", "PV"):  # Not local/private
                            self.report.add_issue(TopologyIssue(
                                layer="RoadCenterLine",
                                issue_type="dangling_end",
                                severity="warning",
                                feature_id=data.get("rcl_id", data.get("NGUID", "unknown")),
                                description=f"Dangling end on {road_class} road at {node}",
                            ))

        except Exception as e:
            self.report.add_issue(TopologyIssue(
                layer="RoadCenterLine",
                issue_type="graph_build_failed",
                severity="error",
                feature_id="all",
                description=f"Failed to build topology graph: {e}",
            ))

        # 4. Duplicate NGUIDs
        if "NGUID" in gdf.columns:
            dup = gdf[gdf.duplicated(subset=["NGUID"], keep=False)]
            for _, row in dup.iterrows():
                self.report.add_issue(TopologyIssue(
                    layer="RoadCenterLine",
                    issue_type="duplicate_nguid",
                    severity="error",
                    feature_id=row["NGUID"],
                    description="Duplicate NGUID found",
                ))

        # 5. Address range checks
        self._validate_address_ranges(gdf)

    def _validate_address_ranges(self, gdf: gpd.GeoDataFrame) -> None:
        """Validate address range consistency."""
        required_cols = ["FromAddr_L", "ToAddr_L", "FromAddr_R", "ToAddr_R", "Parity_L", "Parity_R"]
        if not all(c in gdf.columns for c in required_cols):
            return

        for _, row in gdf.iterrows():
            # Direction check
            if row["FromAddr_L"] > row["ToAddr_L"]:
                self.report.add_issue(TopologyIssue(
                    layer="RoadCenterLine",
                    issue_type="address_range_direction",
                    severity="error",
                    feature_id=row.get("rcl_id", row.get("NGUID", "unknown")),
                    description=f"Left range reversed: {row['FromAddr_L']} > {row['ToAddr_L']}",
                ))
            if row["FromAddr_R"] > row["ToAddr_R"]:
                self.report.add_issue(TopologyIssue(
                    layer="RoadCenterLine",
                    issue_type="address_range_direction",
                    severity="error",
                    feature_id=row.get("rcl_id", row.get("NGUID", "unknown")),
                    description=f"Right range reversed: {row['FromAddr_R']} > {row['ToAddr_R']}",
                ))

            # Parity check
            for side, from_col, to_col, parity_col in [
                ("L", "FromAddr_L", "ToAddr_L", "Parity_L"),
                ("R", "FromAddr_R", "ToAddr_R", "Parity_R"),
            ]:
                parity = row[parity_col]
                from_a = row[from_col]
                to_a = row[to_col]

                if parity == "E" and (from_a % 2 != 0 or to_a % 2 != 0):
                    self.report.add_issue(TopologyIssue(
                        layer="RoadCenterLine",
                        issue_type="parity_mismatch",
                        severity="error",
                        feature_id=row.get("rcl_id", row.get("NGUID", "unknown")),
                        description=f"Left side parity Even but addresses odd: {from_a}-{to_a}",
                    ))
                if parity == "O" and (from_a % 2 == 0 or to_a % 2 == 0):
                    self.report.add_issue(TopologyIssue(
                        layer="RoadCenterLine",
                        issue_type="parity_mismatch",
                        severity="error",
                        feature_id=row.get("rcl_id", row.get("NGUID", "unknown")),
                        description=f"Left side parity Odd but addresses even: {from_a}-{to_a}",
                    ))

    def _validate_address_points(
        self,
        points_gdf: gpd.GeoDataFrame,
        streets_gdf: gpd.GeoDataFrame | None,
    ) -> None:
        """Validate address point placement and attributes."""
        if len(points_gdf) == 0:
            return

        # 1. Geometry validity
        invalid = points_gdf[~points_gdf.geometry.is_valid]
        for _, row in invalid.iterrows():
            self.report.add_issue(TopologyIssue(
                layer="SiteStructureAddressPoint",
                issue_type="invalid_geometry",
                severity="error",
                feature_id=row.get("point_id", row.get("NGUID", "unknown")),
                description="Invalid point geometry",
            ))

        # 2. Duplicate NGUIDs
        if "NGUID" in points_gdf.columns:
            dup = points_gdf[points_gdf.duplicated(subset=["NGUID"], keep=False)]
            for _, row in dup.iterrows():
                self.report.add_issue(TopologyIssue(
                    layer="SiteStructureAddressPoint",
                    issue_type="duplicate_nguid",
                    severity="error",
                    feature_id=row["NGUID"],
                    description="Duplicate NGUID",
                ))

        # 3. Proximity to streets
        if streets_gdf is not None and len(streets_gdf) > 0:
            # Build spatial index
            tree = streets_gdf.sindex

            for _, pt in points_gdf.iterrows():
                geom = pt.geometry
                if geom.is_empty:
                    continue

                # Find nearest street with matching name
                street_name = pt.get("St_Name")
                candidates = list(tree.query(geom.buffer(200)))  # 200m search

                matched = False
                for idx in candidates:
                    street = streets_gdf.iloc[idx]
                    if street.get("St_Name") == street_name:
                        if geom.distance(street.geometry) <= 100:
                            matched = True
                            break

                if not matched:
                    self.report.add_issue(TopologyIssue(
                        layer="SiteStructureAddressPoint",
                        issue_type="far_from_street",
                        severity="warning",
                        feature_id=pt.get("point_id", pt.get("NGUID", "unknown")),
                        description=f"Address point >100m from matching street '{street_name}'",
                    ))

    def _validate_boundary_polygons(self, gdf: gpd.GeoDataFrame, layer_name: str) -> None:
        """Validate boundary polygon topology."""
        if len(gdf) == 0:
            return

        # 1. Geometry validity
        invalid = gdf[~gdf.geometry.is_valid]
        for _, row in invalid.iterrows():
            self.report.add_issue(TopologyIssue(
                layer=layer_name,
                issue_type="invalid_geometry",
                severity="error",
                feature_id=row.get("NGUID", "unknown"),
                description="Invalid polygon geometry",
            ))

        # 2. Overlaps within layer
        if len(gdf) > 1:
            tree = gdf.sindex
            for idx, row in gdf.iterrows():
                candidates = list(tree.query(row.geometry))
                for cand_idx in candidates:
                    if cand_idx <= idx:
                        continue
                    other = gdf.iloc[cand_idx]
                    if row.geometry.overlaps(other.geometry):
                        self.report.add_issue(TopologyIssue(
                            layer=layer_name,
                            issue_type="overlap",
                            severity="error",
                            feature_id=f"{row.get('NGUID')} / {other.get('NGUID')}",
                            description=f"Polygons overlap: area={row.geometry.intersection(other.geometry).area:.1f} sqm",
                        ))

        # 3. Gaps (simplified: check if union has holes)
        if len(gdf) > 1:
            union = gdf.geometry.unary_union
            if union.geom_type == "Polygon" and len(union.interiors) > 0:
                self.report.add_issue(TopologyIssue(
                    layer=layer_name,
                    issue_type="gaps",
                    severity="warning",
                    feature_id="layer",
                    description=f"Union has {len(union.interiors)} holes (possible gaps)",
                ))

    def _validate_cross_layer(self, layers: dict[str, gpd.GeoDataFrame]) -> None:
        """Cross-layer validation."""
        # Provisioning boundary contains all service boundaries
        if "ProvisioningPolygon" in layers:
            prov_union = layers["ProvisioningPolygon"].geometry.unary_union

            for layer_name in ["PsapPolygon", "FirePolygon", "PolicePolygon", "EmsPolygon"]:
                if layer_name not in layers:
                    continue

                svc_union = layers[layer_name].geometry.unary_union
                if not svc_union.is_empty:
                    outside = svc_union.difference(prov_union)
                    if not outside.is_empty:
                        self.report.add_issue(TopologyIssue(
                            layer=layer_name,
                            issue_type="outside_provisioning",
                            severity="error",
                            feature_id="layer",
                            description=f"{layer_name} extends outside ProvisioningPolygon by {outside.area:.1f} sqm",
                        ))

        # Address points within provisioning boundary
        if "SiteStructureAddressPoint" in layers and "ProvisioningPolygon" in layers:
            prov_union = layers["ProvisioningPolygon"].geometry.unary_union
            points = layers["SiteStructureAddressPoint"]

            outside = points[~points.geometry.within(prov_union)]
            for _, pt in outside.iterrows():
                self.report.add_issue(TopologyIssue(
                    layer="SiteStructureAddressPoint",
                    issue_type="outside_provisioning",
                    severity="error",
                    feature_id=pt.get("point_id", pt.get("NGUID", "unknown")),
                    description="Address point outside ProvisioningPolygon",
                ))

        # Streets split at boundary intersections
        if "RoadCenterLine" in layers and "ProvisioningPolygon" in layers:
            prov_boundary = layers["ProvisioningPolygon"].geometry.boundary.unary_union
            streets = layers["RoadCenterLine"]

            for _, street in streets.iterrows():
                if street.geometry.crosses(prov_boundary):
                    self.report.add_issue(TopologyIssue(
                        layer="RoadCenterLine",
                        issue_type="not_split_at_boundary",
                        severity="warning",
                        feature_id=street.get("rcl_id", street.get("NGUID", "unknown")),
                        description="Street crosses provisioning boundary but not split",
                    ))


def validate_all_topology(
    layers: dict[str, gpd.GeoDataFrame],
    spec: TownSpec,
    precision: float = 0.01,
) -> TopologyReport:
    """Convenience function to validate all topology."""
    validator = TopologyValidator(spec, precision)
    return validator.validate_all(layers)