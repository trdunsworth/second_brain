"""
PostGIS loader for authoring and validation.

Loads SynthGIS layers into PostgreSQL/PostGIS for QC validation
using the NENA QC SQL checks.
"""

from __future__ import annotations

from typing import Any

import geopandas as gpd
from geoalchemy2 import Geometry, WKTElement
from sqlalchemy import create_engine, text, MetaData, Table, Column, Integer, String, DateTime, inspect
from sqlalchemy.dialects.postgresql import UUID

from ..config import TownSpec


# NENA table names (matching QC SQL)
NENA_TABLES = {
    "RoadCenterLine": "ng911_road_centerlines",
    "SiteStructureAddressPoint": "ng911_address_points",
    "PsapPolygon": "ng911_psap_polygon",
    "FirePolygon": "ng911_fire_polygon",
    "PolicePolygon": "ng911_police_polygon",
    "EmsPolygon": "ng911_ems_polygon",
    "ProvisioningPolygon": "ng911_provisioning_polygon",
    "RailroadCenterLine": "ng911_railroad_centerline",
    "HydrologyLine": "ng911_hydrology_line",
    "HydrologyPolygon": "ng911_hydrology_polygon",
    "LocationMarkerPoint": "ng911_location_marker_point",
    "DistanceMarkerPoint": "ng911_distance_marker_point",
    "SiteStructureAddressPolygon": "ng911_site_structure_address_polygon",
}


class PostGISLoader:
    """Loads SynthGIS layers into PostGIS."""

    def __init__(self, connection_string: str, spec: TownSpec):
        self.connection_string = connection_string
        self.spec = spec
        self.engine = create_engine(connection_string)

    def load_all(self, layers: dict[str, gpd.GeoDataFrame], if_exists: str = "replace") -> dict[str, int]:
        """
        Load all layers to PostGIS.

        Args:
            layers: Dict of layer_name -> GeoDataFrame
            if_exists: 'replace', 'append', or 'fail'

        Returns:
            Dict of layer_name -> row count loaded
        """
        counts = {}

        with self.engine.begin() as conn:
            # Ensure PostGIS extension
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))

            for layer_name, gdf in layers.items():
                if layer_name not in NENA_TABLES:
                    continue

                table_name = NENA_TABLES[layer_name]
                count = self._load_layer(conn, gdf, table_name, if_exists)
                counts[layer_name] = count

            # Create spatial indexes
            self._create_indexes(conn)

        return counts

    def _load_layer(
        self,
        conn,
        gdf: gpd.GeoDataFrame,
        table_name: str,
        if_exists: str,
    ) -> int:
        """Load a single layer to PostGIS."""
        if len(gdf) == 0:
            return 0

        # Ensure CRS is set
        if gdf.crs is None:
            gdf = gdf.set_crs(self.spec.crs.projected)

        # Convert to WGS84 for PostGIS (standard practice)
        gdf_wgs84 = gdf.to_crs("EPSG:4326")

        # Prepare data for insertion
        # Convert geometry to WKTElement
        gdf_wgs84 = gdf_wgs84.copy()
        gdf_wgs84["geom"] = gdf_wgs84.geometry.apply(
            lambda geom: WKTElement(geom.wkt, srid=4326)
        )

        # Drop the original geometry column
        gdf_wgs84 = gdf_wgs84.drop(columns=["geometry"])

        # Write to PostGIS using to_postgis
        gdf_wgs84.to_postgis(
            table_name,
            conn,
            if_exists=if_exists,
            index=False,
            dtype={"geom": Geometry(geometry_type=gdf_wgs84.geom_type.iloc[0].upper(), srid=4326)},
        )

        return len(gdf_wgs84)

    def _create_indexes(self, conn) -> None:
        """Create spatial indexes on all loaded tables."""
        for layer_name, table_name in NENA_TABLES.items():
            try:
                conn.execute(text(f"""
                    CREATE INDEX IF NOT EXISTS idx_{table_name}_geom
                    ON {table_name} USING GIST (geom);
                """))
            except Exception:
                pass  # Table might not exist

    def run_qc_checks(self, checks: list[str] | None = None) -> dict[str, list[dict[str, Any]]]:
        """Run NENA QC checks on loaded data."""
        from ..validation.qc_sql import QC_CHECKS, run_qc_checks
        return run_qc_checks(self.connection_string, checks)

    def close(self) -> None:
        """Close database connection."""
        self.engine.dispose()


def load_to_postgis(
    layers: dict[str, gpd.GeoDataFrame],
    spec: TownSpec,
    connection_string: str,
    if_exists: str = "replace",
) -> dict[str, int]:
    """Convenience function to load layers to PostGIS."""
    loader = PostGISLoader(connection_string, spec)
    try:
        return loader.load_all(layers, if_exists)
    finally:
        loader.close()