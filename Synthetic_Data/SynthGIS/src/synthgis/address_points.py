"""
SiteStructureAddressPoint generation.

Creates NENA/CLDXF-compliant address points by combining:
- Street address ranges (from streets)
- Building footprints (from parcels)
- Sub-addresses (from buildings)
- Placement logic (entrance, centroid, etc.)
"""

from __future__ import annotations

import geopandas as gpd
import numpy as np
from shapely.geometry import Point, LineString
from shapely import line_interpolate_point, make_valid, set_precision

from .config import TownSpec
from .streets.addressing import (
    interpolate_address_point,
    generate_address_points_for_segment,
    StreetAddressRanges,
    AddressRange,
    Parity,
)
from .buildings.subaddress import SubAddress, SubAddressGenerator
from .seeding import SeedState, make_nguid


def generate_address_points(
    streets: gpd.GeoDataFrame,
    parcels: gpd.GeoDataFrame,
    buildings: gpd.GeoDataFrame,
    spec: TownSpec,
    seed_state: SeedState,
) -> gpd.GeoDataFrame:
    """
    Generate complete SiteStructureAddressPoint layer.

    Combines:
    1. Street-based address interpolation (primary)
    2. Building-based sub-addresses (for multi-unit)
    3. CLDXF field population
    """
    rng = seed_state.rng("address_points")

    all_points = []

    # 1. Generate from street segments (covers all addressed locations)
    street_points = _generate_from_streets(streets, spec, rng)
    all_points.extend(street_points)

    # 2. Enhance with building sub-addresses
    building_points = _generate_from_buildings(buildings, streets, spec, rng)
    all_points.extend(building_points)

    # 3. Deduplicate (same address + location)
    all_points = _deduplicate_points(all_points)

    if not all_points:
        return gpd.GeoDataFrame(columns=["geometry"], crs=streets.crs)

    gdf = gpd.GeoDataFrame(all_points, crs=streets.crs)
    gdf.geometry = gdf.geometry.apply(lambda g: make_valid(set_precision(g, 0.01)))

    return gdf.reset_index(drop=True)


def _generate_from_streets(
    streets: gpd.GeoDataFrame,
    spec: TownSpec,
    rng: np.random.Generator,
) -> list[dict]:
    """Generate address points by interpolating along street segments."""
    points = []

    for _, row in streets.iterrows():
        segment_points = generate_address_points_for_segment(row, spec, rng)
        points.extend(segment_points)

    return points


def _generate_from_buildings(
    buildings: gpd.GeoDataFrame,
    streets: gpd.GeoDataFrame,
    spec: TownSpec,
    rng: np.random.Generator,
) -> list[dict]:
    """Generate sub-address points for buildings."""
    if len(buildings) == 0:
        return []

    sub_gen = SubAddressGenerator(spec, seed_state=None)  # Will create own RNG
    # Use a substream for subaddresses
    sub_rng = np.random.default_rng(rng.integers(2**32))
    sub_gen.rng = sub_rng

    points = []
    street_tree = streets.sindex

    for _, building in buildings.iterrows():
        bldg_geom = building.geometry
        if bldg_geom.is_empty:
            continue

        # Find nearest street for address interpolation
        nearest_idx = _find_nearest_street(bldg_geom, streets, street_tree)
        if nearest_idx is None:
            continue

        street_row = streets.iloc[nearest_idx]

        # Generate sub-addresses
        subaddresses = sub_gen.generate_for_building(building)

        for sub in subaddresses:
            # Determine address number from street
            addr_num = _get_address_for_building(bldg_geom, street_row, rng)

            # Interpolate point on street
            ranges = _street_row_to_ranges(street_row)
            side = _determine_side(bldg_geom, street_row)
            pt = interpolate_address_point(
                street_row.geometry,
                addr_num,
                ranges,
                side,
                offset_m=15.0,
            )

            if pt is None:
                # Fallback: building centroid
                pt = bldg_geom.centroid

            points.append(_make_ssap_record(
                building=building,
                sub=sub,
                street_row=street_row,
                addr_num=addr_num,
                geometry=pt,
                spec=spec,
                rng=rng,
            ))

    return points


def _find_nearest_street(
    building_geom: Point | Polygon,
    streets: gpd.GeoDataFrame,
    tree,
) -> int | None:
    """Find index of nearest street segment to building."""
    centroid = building_geom.centroid
    candidates = list(tree.nearest(centroid))
    if candidates:
        return candidates[0]
    return None


def _get_address_for_building(
    building_geom: Polygon,
    street_row: gpd.GeoSeries,
    rng: np.random.Generator,
) -> int:
    """Get address number for building from street ranges."""
    # Try left range first
    from_l = int(street_row.get("FromAddr_L", 0))
    to_l = int(street_row.get("ToAddr_L", 0))
    from_r = int(street_row.get("FromAddr_R", 0))
    to_r = int(street_row.get("ToAddr_R", 0))

    candidates = []
    if from_l <= to_l:
        candidates.extend(range(from_l, to_l + 1, 2))
    if from_r <= to_r:
        candidates.extend(range(from_r, to_r + 1, 2))

    if candidates:
        return rng.choice(candidates)

    # Fallback: generate plausible number
    return rng.integers(100, 9999)


def _determine_side(building_geom: Polygon, street_row: gpd.GeoSeries) -> Literal["L", "R"]:
    """Determine which side of street the building is on."""
    centroid = building_geom.centroid
    line = street_row.geometry

    # Get line direction
    coords = list(line.coords)
    if len(coords) < 2:
        return "L"

    # Vector along line
    dx = coords[-1][0] - coords[0][0]
    dy = coords[-1][1] - coords[0][1]

    # Vector from line start to building
    bx = centroid.x - coords[0][0]
    by = centroid.y - coords[0][1]

    # Cross product (z-component)
    cross = dx * by - dy * bx

    return "L" if cross > 0 else "R"


def _street_row_to_ranges(street_row: gpd.GeoSeries) -> StreetAddressRanges:
    """Convert street row to StreetAddressRanges object."""
    left = AddressRange(
        from_addr=int(street_row.get("FromAddr_L", 0)),
        to_addr=int(street_row.get("ToAddr_L", 0)),
        parity=Parity(street_row.get("Parity_L", "E")),
    )
    right = AddressRange(
        from_addr=int(street_row.get("FromAddr_R", 0)),
        to_addr=int(street_row.get("ToAddr_R", 0)),
        parity=Parity(street_row.get("Parity_R", "O")),
    )
    return StreetAddressRanges(left=left, right=right)


def _make_ssap_record(
    building: gpd.GeoSeries,
    sub: SubAddress,
    street_row: gpd.GeoSeries,
    addr_num: int,
    geometry: Point,
    spec: TownSpec,
    rng: np.random.Generator,
) -> dict:
    """Create a SiteStructureAddressPoint record."""
    return {
        "NGUID": make_nguid(spec.metadata.nguid_domain, "ssap", rng.integers(1_000_000)),
        "AddNum": addr_num,
        "AddNumSuf": None,
        "St_PreDir": street_row.get("St_PreDir"),
        "St_PreTyp": street_row.get("St_PreTyp"),
        "St_Name": street_row.get("St_Name"),
        "St_PosTyp": street_row.get("St_PosTyp"),
        "St_PosDir": street_row.get("St_PosDir"),
        "SiteName": building.get("SiteName") if "SiteName" in building else None,
        "Building": sub.building,
        "Floor": sub.floor,
        "Unit": sub.unit,
        "Room": sub.room,
        "Seat": sub.seat,
        "PlaceType": sub.place_type,
        "Placement": sub.placement,
        "State": spec.metadata.state,
        "County": spec.metadata.county,
        "Inc_Muni": spec.metadata.municipality,
        "Uninc_Comm": None,
        "PostCode": _assign_postcode(geometry, spec, rng),
        "ESN": _assign_esn(geometry, spec, rng),
        "DateUpdate": "2026-01-01",
        "DataSource": "SYNTHETIC",
        "Disclaimer": spec.metadata.disclaimer,
        "geometry": geometry,
    }


def _assign_postcode(geometry: Point, spec: TownSpec, rng: np.random.Generator) -> str:
    """Assign ZIP code."""
    return f"{rng.integers(10000, 99999):05d}"


def _assign_esn(geometry: Point, spec: TownSpec, rng: np.random.Generator) -> str:
    """Assign ESN."""
    return f"{rng.integers(1, 999):03d}"


def _deduplicate_points(points: list[dict]) -> list[dict]:
    """Remove duplicate address points (same address + location)."""
    seen = set()
    unique = []

    for pt in points:
        key = (pt.get("AddNum"), pt.get("St_Name"), pt.get("St_PosTyp"),
               pt.get("Unit"), pt.get("Floor"), round(pt["geometry"].x, 2), round(pt["geometry"].y, 2))
        if key not in seen:
            seen.add(key)
            unique.append(pt)

    return unique