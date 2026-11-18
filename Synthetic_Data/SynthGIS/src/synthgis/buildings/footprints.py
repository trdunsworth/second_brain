"""
Building footprint generation within parcels.

Places building polygons within parcel buildable areas according to
zoning constraints (coverage, floors, setbacks).
"""

from __future__ import annotations

import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon, Point, box
from shapely.ops import unary_union
from shapely import make_valid, set_precision, minimum_rotated_rectangle, affinity

from ..config import TownSpec
from ..seeding import SeedState, make_nguid


class BuildingFootprintGenerator:
    """Generates building footprints within parcels."""

    def __init__(self, spec: TownSpec, seed_state: SeedState):
        self.spec = spec
        self.rng = seed_state.rng("buildings.footprints")
        self.domain = spec.metadata.nguid_domain

    def generate(self, parcels: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Generate building footprints for all parcels."""
        buildings = []

        for _, parcel in parcels.iterrows():
            parcel_buildings = self._generate_for_parcel(parcel)
            buildings.extend(parcel_buildings)

        if not buildings:
            return gpd.GeoDataFrame(columns=["geometry", "building_id", "parcel_id", "zone_type"], crs=parcels.crs)

        gdf = gpd.GeoDataFrame(buildings, crs=parcels.crs)
        gdf["building_area"] = gdf.geometry.area
        gdf["building_perimeter"] = gdf.geometry.length

        return gdf.reset_index(drop=True)

    def _generate_for_parcel(self, parcel: gpd.GeoSeries) -> list[dict]:
        """Generate building(s) for a single parcel."""
        geom = parcel.geometry
        if geom.is_empty or geom.area < 50:
            return []

        zone_type = parcel.get("zone_type", "residential")
        zone_config = self._get_zone_config(zone_type)

        # Determine number of buildings
        num_buildings = self._determine_building_count(geom, zone_config)

        buildings = []
        for i in range(num_buildings):
            footprint = self._generate_single_footprint(geom, zone_config, i)
            if footprint is not None:
                buildings.append({
                    "geometry": footprint,
                    "building_id": len(buildings),
                    "parcel_id": parcel.get("parcel_id", -1),
                    "zone_type": zone_type,
                    "floors": self.rng.choice(zone_config.floors),
                    "building_type": self._determine_building_type(zone_type),
                })

        return buildings

    def _get_zone_config(self, zone_type: str):
        """Get zoning config for zone type."""
        mapping = {
            "residential": self.spec.zoning.residential,
            "commercial": self.spec.zoning.commercial,
            "industrial": self.spec.zoning.industrial,
            "civic": self.spec.zoning.civic,
        }
        return mapping.get(zone_type, self.spec.zoning.residential)

    def _determine_building_count(self, parcel_geom: Polygon, zone_config) -> int:
        """Determine how many buildings on this parcel."""
        # Based on parcel size and building coverage
        target_coverage = zone_config.building_coverage
        parcel_area = parcel_geom.area

        # Typical building footprint sizes by zone
        avg_footprint = {
            "residential": 150,   # ~150 sqm per house
            "commercial": 500,    # ~500 sqm per building
            "industrial": 2000,   # ~2000 sqm per building
            "civic": 1000,        # ~1000 sqm per building
        }.get(zone_config.zone_type if hasattr(zone_config, 'zone_type') else "residential", 150)

        max_buildings = max(1, int(parcel_area * target_coverage / avg_footprint))

        # Residential: usually 1 building per parcel
        # Commercial/industrial: can have multiple
        if "residential" in str(zone_config).lower():
            return 1

        return self.rng.integers(1, max(2, max_buildings + 1))

    def _determine_building_type(self, zone_type: str) -> str:
        """Determine building type based on zone."""
        types = {
            "residential": ["house", "duplex", "apartment", "townhouse"],
            "commercial": ["retail", "office", "restaurant", "strip_mall"],
            "industrial": ["warehouse", "factory", "storage", "light_industrial"],
            "civic": ["school", "government", "fire_station", "police_station", "hospital", "library"],
        }
        return self.rng.choice(types.get(zone_type, ["generic"]))

    def _generate_single_footprint(
        self,
        parcel_geom: Polygon,
        zone_config,
        building_index: int,
    ) -> Polygon | None:
        """Generate a single building footprint within parcel."""
        # Get buildable area (parcel minus setbacks)
        setback = zone_config.setback_m
        buildable = parcel_geom.buffer(-setback)

        if buildable.is_empty or buildable.area < 20:
            return None

        # Handle MultiPolygon
        if buildable.geom_type == "MultiPolygon":
            # Use largest part
            buildable = max(buildable.geoms, key=lambda g: g.area)

        # Target footprint area
        target_area = self._target_footprint_area(zone_config)
        target_area = min(target_area, buildable.area * 0.8)  # Max 80% of buildable

        # Generate footprint shape
        footprint = self._create_footprint_shape(buildable, target_area)

        if footprint is None or footprint.area < 10:
            return None

        # Ensure within buildable
        footprint = footprint.intersection(buildable)
        if footprint.is_empty or footprint.area < 10:
            return None

        return make_valid(set_precision(footprint, 0.01))

    def _target_footprint_area(self, zone_config) -> float:
        """Get target footprint area for zone."""
        ranges = {
            "residential": (80, 300),
            "commercial": (200, 2000),
            "industrial": (500, 10000),
            "civic": (300, 5000),
        }
        zone_name = getattr(zone_config, 'zone_type', 'residential')
        low, high = ranges.get(zone_name, (80, 300))
        return self.rng.uniform(low, high)

    def _create_footprint_shape(
        self,
        buildable: Polygon,
        target_area: float,
    ) -> Polygon | None:
        """Create a building footprint shape within buildable area."""
        # Get minimum rotated rectangle of buildable area
        mbr = minimum_rotated_rectangle(buildable)

        # Scale MBR to target area
        current_area = mbr.area
        if current_area <= 0:
            return None

        scale = np.sqrt(target_area / current_area)
        # Scale down slightly to fit
        scale *= 0.9

        # Center the footprint
        centroid = buildable.centroid
        footprint = affinity.scale(mbr, xfact=scale, yfact=scale, origin=centroid)

        # Ensure it's within buildable
        footprint = footprint.intersection(buildable)

        # If too complex, simplify to rectangle
        if footprint.geom_type != "Polygon" or len(list(footprint.exterior.coords)) > 20:
            # Simple rectangle aligned with MBR
            bounds = mbr.bounds
            width = (bounds[2] - bounds[0]) * scale
            height = (bounds[3] - bounds[1]) * scale
            footprint = box(
                centroid.x - width/2, centroid.y - height/2,
                centroid.x + width/2, centroid.y + height/2
            )
            footprint = footprint.intersection(buildable)

        return footprint if not footprint.is_empty else None


def generate_building_footprints(
    parcels: gpd.GeoDataFrame,
    spec: TownSpec,
    seed_state: SeedState,
) -> gpd.GeoDataFrame:
    """Convenience function to generate building footprints."""
    generator = BuildingFootprintGenerator(spec, seed_state)
    return generator.generate(parcels)