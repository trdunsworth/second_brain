"""
Land use zoning assignment.

Assigns zone types to areas based on configuration proportions
and spatial constraints (e.g., commercial along arterials).
"""

from __future__ import annotations

import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon
from shapely import make_valid

from ..config import TownSpec
from ..seeding import SeedState


class ZoningAssigner:
    """Assigns land use zones to spatial units (blocks, parcels)."""

    def __init__(self, spec: TownSpec, seed_state: SeedState):
        self.spec = spec
        self.rng = seed_state.rng("parcels.zoning")
        self.zoning_config = spec.zoning

    def assign_to_blocks(self, blocks: gpd.GeoDataFrame, streets: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """
        Assign zone types to blocks.

        Strategy:
        - Commercial along arterials
        - Industrial in designated areas
        - Residential elsewhere
        - Civic at specific locations
        """
        blocks = blocks.copy()

        # Identify arterial streets
        arterials = streets[streets.get("RoadClass", "") == "SH"] if "RoadClass" in streets.columns else gpd.GeoDataFrame()

        # Buffer arterials for commercial corridor
        commercial_corridor = None
        if len(arterials) > 0:
            commercial_corridor = arterials.geometry.unary_union.buffer(200)  # 200m corridor

        # Assign zones
        zone_assignments = []
        for _, block in blocks.iterrows():
            centroid = block.geometry.centroid
            zone = self._determine_zone(block, centroid, commercial_corridor)
            zone_assignments.append(zone)

        blocks["zone_type"] = zone_assignments
        return blocks

    def _determine_zone(
        self,
        block: gpd.GeoSeries,
        centroid: Polygon,
        commercial_corridor: Polygon | None,
    ) -> str:
        """Determine zone type for a block."""
        # Civic: rare, specific locations (simplified: random small chance)
        if self.rng.random() < self.zoning_config.civic.proportion * 0.1:
            return "civic"

        # Commercial: along arterial corridors
        if commercial_corridor is not None and centroid.within(commercial_corridor):
            if self.rng.random() < 0.7:  # 70% chance in corridor
                return "commercial"

        # Industrial: random allocation in non-commercial areas
        # (Simplified: use proportion-based random)
        r = self.rng.random()
        cum = 0
        for zone_name in ["industrial", "commercial", "residential"]:
            zone_config = getattr(self.zoning_config, zone_name)
            cum += zone_config.proportion
            if r < cum:
                return zone_name

        return "residential"

    def assign_to_parcels(self, parcels: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Assign zone types to parcels (inherit from block or assign directly)."""
        parcels = parcels.copy()

        if "zone_type" not in parcels.columns:
            # Assign by block inheritance or random
            zone_assignments = []
            for _, parcel in parcels.iterrows():
                zone_assignments.append(self._random_zone())
            parcels["zone_type"] = zone_assignments

        return parcels

    def _random_zone(self) -> str:
        """Random zone selection by proportions."""
        r = self.rng.random()
        cum = 0
        for zone_name in ["residential", "commercial", "industrial", "civic"]:
            zone_config = getattr(self.zoning_config, zone_name)
            cum += zone_config.proportion
            if r < cum:
                return zone_name
        return "residential"


def assign_zoning(
    units: gpd.GeoDataFrame,
    spec: TownSpec,
    seed_state: SeedState,
    unit_type: str = "blocks",
    streets: gpd.GeoDataFrame | None = None,
) -> gpd.GeoDataFrame:
    """
    Convenience function to assign zoning to spatial units.

    Args:
        units: GeoDataFrame of blocks or parcels
        spec: Town specification
        seed_state: Seed state for RNG
        unit_type: "blocks" or "parcels"
        streets: Required if unit_type="blocks" for arterial detection

    Returns:
        Units with 'zone_type' column added
    """
    assigner = ZoningAssigner(spec, seed_state)

    if unit_type == "blocks":
        if streets is None:
            raise ValueError("streets required for block zoning")
        return assigner.assign_to_blocks(units, streets)
    elif unit_type == "parcels":
        return assigner.assign_to_parcels(units)
    else:
        raise ValueError(f"Unknown unit_type: {unit_type}")