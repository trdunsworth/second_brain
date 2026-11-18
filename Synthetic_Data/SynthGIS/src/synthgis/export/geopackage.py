"""
GeoPackage export with NENA metadata.

Produces a single .gpkg file containing all NENA layers plus metadata.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import geopandas as gpd
import pyogrio

from ..config import TownSpec
from ..seeding import SeedState


# NENA layer order (required first, then strongly recommended, then recommended)
NENA_LAYER_ORDER = [
    # Required
    "RoadCenterLine",
    "SiteStructureAddressPoint",
    "PsapPolygon",
    "FirePolygon",
    "PolicePolygon",
    "EmsPolygon",
    "ProvisioningPolygon",
    # Strongly Recommended
    "CoastGuardPolygon",
    "PoisonControlPolygon",
    "A1Polygon",
    "A2Polygon",
    "A3Polygon",
    "A4Polygon",
    "A5Polygon",
    # Recommended
    "RailroadCenterLine",
    "HydrologyLine",
    "HydrologyPolygon",
    "LocationMarkerPoint",
    "DistanceMarkerPoint",
    "SiteStructureAddressPolygon",
    # Operational (SynthGIS extensions)
    "FireStationPoint",
    "PoliceStationPoint",
    "EmsStationPoint",
    "HospitalPoint",
    "FireZonePolygon",
    "PoliceZonePolygon",
    "EmsZonePolygon",
    "FireRunCard",
    "PoliceRunCard",
    "EmsRunCard",
]


class GeoPackageExporter:
    """Exports SynthGIS layers to GeoPackage."""

    def __init__(self, spec: TownSpec, seed_state: SeedState):
        self.spec = spec
        self.seed_state = seed_state

    def export(self, layers: dict[str, gpd.GeoDataFrame], output_path: str | Path) -> Path:
        """
        Export all layers to a single GeoPackage.

        Args:
            layers: Dict of layer_name -> GeoDataFrame
            output_path: Output .gpkg file path

        Returns:
            Path to created file
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Prepare metadata
        metadata = self._build_metadata(layers)

        # Write layers in NENA order
        first_layer = True
        for layer_name in NENA_LAYER_ORDER:
            if layer_name not in layers:
                continue

            gdf = layers[layer_name].copy()

            # Ensure CRS is set
            if gdf.crs is None:
                gdf.set_crs(self.spec.crs.projected, inplace=True)

            # Write layer
            pyogrio.write_dataframe(
                gdf,
                output_path,
                layer=layer_name,
                driver="GPKG",
                overwrite=first_layer,
                append=not first_layer,
            )
            first_layer = False

        # Write metadata table
        self._write_metadata_table(output_path, metadata)

        return output_path

    def _build_metadata(self, layers: dict[str, gpd.GeoDataFrame]) -> dict[str, Any]:
        """Build metadata dictionary for the GeoPackage."""
        feature_counts = {name: len(gdf) for name, gdf in layers.items()}

        return {
            "standard": "NENA-STA-006.3-2026",
            "standard_version": "3.0",
            "generator": "SynthGIS",
            "generator_version": "0.1.0",
            "generation_timestamp": datetime.utcnow().isoformat() + "Z",
            "master_seed": self.seed_state.master_seed,
            "substreams": self.seed_state.substreams,
            "town_name": self.spec.metadata.name,
            "state": self.spec.metadata.state,
            "county": self.spec.metadata.county,
            "municipality": self.spec.metadata.municipality,
            "nguid_domain": self.spec.metadata.nguid_domain,
            "crs_projected": self.spec.crs.projected,
            "crs_geographic": self.spec.crs.geographic,
            "extent": {
                "minx": self.spec.extent.minx,
                "maxx": self.spec.extent.maxx,
                "miny": self.spec.extent.miny,
                "maxy": self.spec.extent.maxy,
            },
            "disclaimer": self.spec.metadata.disclaimer,
            "license": self.spec.metadata.license,
            "feature_counts": feature_counts,
            "layer_count": len(layers),
        }

    def _write_metadata_table(self, gpkg_path: Path, metadata: dict[str, Any]) -> None:
        """Write metadata as a non-spatial table in the GeoPackage."""
        # Create a simple key-value table
        meta_gdf = gpd.GeoDataFrame({
            "key": list(metadata.keys()),
            "value": [json.dumps(v, default=str) if not isinstance(v, str) else v for v in metadata.values()],
        }, geometry=None, crs=None)

        pyogrio.write_dataframe(
            meta_gdf,
            gpkg_path,
            layer="metadata",
            driver="GPKG",
            append=True,
        )


def export_geopackage(
    layers: dict[str, gpd.GeoDataFrame],
    spec: TownSpec,
    seed_state: SeedState,
    output_path: str | Path,
) -> Path:
    """Convenience function to export to GeoPackage."""
    exporter = GeoPackageExporter(spec, seed_state)
    return exporter.export(layers, output_path)