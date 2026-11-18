"""
Block subdivision into parcels with setbacks and zoning constraints.

Recursively splits blocks into parcels meeting minimum/maximum size
requirements for each land use zone.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon, LineString, Point
from shapely.ops import split
from shapely import make_valid, set_precision, minimum_rotated_rectangle

from ..config import TownSpec, ZoningTypeConfig
from ..seeding import SeedState


@dataclass(slots=True)
class ParcelConfig:
    """Configuration for parcel generation per zone."""
    zone_type: str
    min_area_sqm: float
    max_area_sqm: float
    setback_m: float
    building_coverage: float  # Fraction of parcel for building footprint
    max_floors: int
    min_frontage_m: float = 10.0
    max_depth_m: float = 100.0

    @classmethod
    def from_zone_config(cls, zone_config: ZoningTypeConfig, zone_type: str) -> "ParcelConfig":
        return cls(
            zone_type=zone_type,
            min_area_sqm=zone_config.min_parcel_sqm,
            max_area_sqm=zone_config.max_parcel_sqm,
            setback_m=zone_config.setback_m,
            building_coverage=zone_config.building_coverage,
            max_floors=max(zone_config.floors),
        )


def subdivide_blocks(
    blocks: gpd.GeoDataFrame,
    zoning: gpd.GeoDataFrame,  # Must have 'zone_type' column
    spec: TownSpec,
    seed_state: SeedState,
) -> gpd.GeoDataFrame:
    """
    Subdivide blocks into parcels according to zoning.

    Each block gets a zone type, then is recursively split until
    all parcels meet zone size constraints.
    """
    rng = seed_state.rng("parcels.subdivision")

    # Assign zone to each block
    blocks_with_zone = _assign_block_zones(blocks, zoning, rng, spec)

    all_parcels = []
    parcel_id = 0

    for _, block in blocks_with_zone.iterrows():
        zone_type = block["zone_type"]
        zone_config = _get_zone_config(spec, zone_type)
        parcel_config = ParcelConfig.from_zone_config(zone_config, zone_type)

        block_parcels = _subdivide_single_block(
            block.geometry,
            parcel_config,
            rng,
            parcel_id,
        )
        parcel_id += len(block_parcels)

        # Add zone info to parcels
        for p in block_parcels:
            p["zone_type"] = zone_type
            p["block_id"] = block.get("block_id", -1)

        all_parcels.extend(block_parcels)

    if not all_parcels:
        return gpd.GeoDataFrame(columns=["geometry", "parcel_id", "zone_type", "block_id"], crs=blocks.crs)

    gdf = gpd.GeoDataFrame(all_parcels, crs=blocks.crs)
    gdf["parcel_area"] = gdf.geometry.area
    gdf["parcel_perimeter"] = gdf.geometry.length

    return gdf.reset_index(drop=True)


def _assign_block_zones(
    blocks: gpd.GeoDataFrame,
    zoning: gpd.GeoDataFrame,
    rng: np.random.Generator,
    spec: TownSpec,
) -> gpd.GeoDataFrame:
    """Assign zone type to each block based on zoning proportions."""
    blocks = blocks.copy()

    # If zoning layer provided, use spatial join
    if len(zoning) > 0 and "zone_type" in zoning.columns:
        # Spatial join: assign each block the zone of its centroid
        centroids = blocks.geometry.centroid
        centroids_gdf = gpd.GeoDataFrame(geometry=centroids, crs=blocks.crs)
        joined = gpd.sjoin(centroids_gdf, zoning[["zone_type", "geometry"]], how="left", predicate="within")
        blocks["zone_type"] = joined["zone_type"].values
    else:
        # Random assignment by proportions
        zones = []
        for zone_name, zone_config in [
            ("residential", spec.zoning.residential),
            ("commercial", spec.zoning.commercial),
            ("industrial", spec.zoning.industrial),
            ("civic", spec.zoning.civic),
        ]:
            zones.extend([zone_name] * int(zone_config.proportion * 1000))

        blocks["zone_type"] = rng.choice(zones, size=len(blocks))

    # Fill any nulls with residential
    blocks["zone_type"] = blocks["zone_type"].fillna("residential")

    return blocks


def _get_zone_config(spec: TownSpec, zone_type: str) -> ZoningTypeConfig:
    """Get ZoningTypeConfig for a zone type."""
    mapping = {
        "residential": spec.zoning.residential,
        "commercial": spec.zoning.commercial,
        "industrial": spec.zoning.industrial,
        "civic": spec.zoning.civic,
    }
    return mapping.get(zone_type, spec.zoning.residential)


def _subdivide_single_block(
    block_geom: Polygon,
    config: ParcelConfig,
    rng: np.random.Generator,
    start_id: int,
) -> list[dict]:
    """
    Recursively subdivide a single block into parcels.

    Algorithm:
    1. Apply setback to get buildable area
    2. If buildable area within [min, max], keep as parcel
    3. Otherwise, split along longest axis and recurse
    """
    parcels = []

    def _recurse(geom: Polygon, depth: int = 0) -> None:
        nonlocal parcels

        if depth > 20:  # Max recursion depth
            return

        # Apply setback
        buildable = geom.buffer(-config.setback_m)
        if buildable.is_empty:
            return

        # Handle MultiPolygon (split into parts)
        if buildable.geom_type == "MultiPolygon":
            for part in buildable.geoms:
                _recurse(part, depth + 1)
            return

        area = buildable.area

        # Check if within target range
        if config.min_area_sqm <= area <= config.max_area_sqm:
            # Check frontage/depth constraints
            if _check_frontage_depth(buildable, config):
                parcels.append({
                    "geometry": buildable,
                    "parcel_id": start_id + len(parcels),
                    "source_block_area": geom.area,
                    "setback_m": config.setback_m,
                })
            else:
                # Split anyway
                _split_and_recurse(buildable, config, rng, depth)
        elif area > config.max_area_sqm:
            # Too large: split
            _split_and_recurse(buildable, config, rng, depth)
        else:
            # Too small: try to merge with neighbor (handled at higher level)
            # For now, keep if close to minimum
            if area >= config.min_area_sqm * 0.5:
                parcels.append({
                    "geometry": buildable,
                    "parcel_id": start_id + len(parcels),
                    "source_block_area": geom.area,
                    "setback_m": config.setback_m,
                })

    def _split_and_recurse(geom: Polygon, config: ParcelConfig, rng: np.random.Generator, depth: int) -> None:
        """Split polygon along longest axis and recurse."""
        # Get minimum rotated rectangle to find orientation
        mbr = minimum_rotated_rectangle(geom)
        coords = list(mbr.exterior.coords)

        # Calculate side lengths
        side1 = Point(coords[0]).distance(Point(coords[1]))
        side2 = Point(coords[1]).distance(Point(coords[2]))

        # Split along longer side (perpendicular to it)
        if side1 > side2:
            # Long side is coords[0]-coords[1], split perpendicular
            mid = LineString([coords[0], coords[1]]).centroid
            # Create splitting line through mid, perpendicular to long side
            dx = coords[1][0] - coords[0][0]
            dy = coords[1][1] - coords[0][1]
            # Perpendicular direction
            split_line = LineString([
                (mid.x - dy * 1000, mid.y + dx * 1000),
                (mid.x + dy * 1000, mid.y - dx * 1000),
            ])
        else:
            # Long side is coords[1]-coords[2]
            mid = LineString([coords[1], coords[2]]).centroid
            dx = coords[2][0] - coords[1][0]
            dy = coords[2][1] - coords[1][1]
            split_line = LineString([
                (mid.x - dy * 1000, mid.y + dx * 1000),
                (mid.x + dy * 1000, mid.y - dx * 1000),
            ])

        # Add small random offset to split line
        offset = rng.uniform(-0.1, 0.1) * max(side1, side2)
        # (Simplified: just use the line as-is)

        try:
            parts = split(geom, split_line)
            for part in parts.geoms:
                if part.area > 10:
                    _recurse(part, depth + 1)
        except Exception:
            # Split failed, keep as-is if reasonable
            if geom.area >= config.min_area_sqm * 0.5:
                parcels.append({
                    "geometry": geom,
                    "parcel_id": start_id + len(parcels),
                    "source_block_area": geom.area,
                    "setback_m": config.setback_m,
                })

    _recurse(block_geom)
    return parcels


def _check_frontage_depth(parcel: Polygon, config: ParcelConfig) -> bool:
    """Check if parcel meets frontage and depth requirements."""
    # Simplified: use minimum rotated rectangle
    mbr = minimum_rotated_rectangle(parcel)
    coords = list(mbr.exterior.coords)

    side1 = Point(coords[0]).distance(Point(coords[1]))
    side2 = Point(coords[1]).distance(Point(coords[2]))

    frontage = min(side1, side2)
    depth = max(side1, side2)

    return frontage >= config.min_frontage_m and depth <= config.max_depth_m