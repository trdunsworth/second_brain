"""
CLDXF-compliant address range assignment and interpolation.

Implements NENA address range standards:
- From/To address left/right of street direction
- Parity (Even/Odd/Both/Zero) consistency
- Address point interpolation along centerlines
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Literal

import geopandas as gpd
import numpy as np
from shapely.geometry import LineString, Point
from shapely import line_interpolate_point, line_locate_point

from ..config import TownSpec, AddressingConfig
from ..seeding import SeedState


class Parity(str, Enum):
    """NENA address parity codes."""
    EVEN = "E"
    ODD = "O"
    BOTH = "B"
    ZERO = "Z"


@dataclass(slots=True)
class AddressRange:
    """Address range for one side of a street segment."""
    from_addr: int
    to_addr: int
    parity: Parity

    def contains(self, address: int) -> bool:
        """Check if address falls in this range with correct parity."""
        if self.from_addr > self.to_addr:
            return False
        if not (self.from_addr <= address <= self.to_addr):
            return False
        if self.parity == Parity.EVEN:
            return address % 2 == 0
        if self.parity == Parity.ODD:
            return address % 2 == 1
        if self.parity == Parity.ZERO:
            return False
        return True  # BOTH

    def next_address(self, current: int) -> int | None:
        """Get next valid address in range after current."""
        step = 2 if self.parity in (Parity.EVEN, Parity.ODD) else 1
        nxt = current + step
        return nxt if nxt <= self.to_addr else None


@dataclass(slots=True)
class StreetAddressRanges:
    """Complete address ranges for a street segment (both sides)."""
    left: AddressRange
    right: AddressRange

    def get_side(self, side: Literal["L", "R"]) -> AddressRange:
        return self.left if side == "L" else self.right


def assign_address_ranges(
    streets: gpd.GeoDataFrame,
    blocks: gpd.GeoDataFrame,
    spec: TownSpec,
    seed_state: SeedState,
) -> gpd.GeoDataFrame:
    """
    Assign CLDXF-compliant address ranges to all street segments.

    Strategy:
    1. Group streets by street name + community
    2. For each group, establish a base address grid
    3. Interpolate addresses along street direction
    4. Assign left/right ranges with proper parity
    5. Ensure no overlaps within group
    """
    rng = seed_state.rng("streets.addressing")
    addr_config = spec.addressing
    streets = streets.copy()

    # Initialize address range columns
    streets["FromAddr_L"] = 0
    streets["ToAddr_L"] = 0
    streets["FromAddr_R"] = 0
    streets["ToAddr_R"] = 0
    streets["Parity_L"] = Parity.EVEN.value
    streets["Parity_R"] = Parity.ODD.value

    # Group by street name components (NENA grouping)
    group_cols = ["St_Name", "St_PosTyp", "St_PreDir", "St_PosDir", "Inc_Muni"]
    # Only group by columns that exist and have data
    available_cols = [c for c in group_cols if c in streets.columns]
    if not available_cols:
        available_cols = ["St_Name"]

    grouped = streets.groupby(available_cols, dropna=False)

    for name, group in grouped:
        _assign_ranges_to_group(group, addr_config, rng, spec)

    return streets


def _assign_ranges_to_group(
    group: gpd.GeoDataFrame,
    addr_config: AddressingConfig,
    rng: np.random.Generator,
    spec: TownSpec,
) -> None:
    """Assign address ranges to a single street name group."""
    # Sort segments by geometry to establish logical order
    # Use centroid x,y for rough sorting
    group = group.copy()
    group["_centroid_x"] = group.geometry.centroid.x
    group["_centroid_y"] = group.geometry.centroid.y

    # Sort by quadrant origin
    origin = addr_config.quadrant_origin
    if origin == "center":
        # Sort by distance from extent center
        cx = (spec.extent.minx + spec.extent.maxx) / 2
        cy = (spec.extent.miny + spec.extent.maxy) / 2
        group["_sort_key"] = np.sqrt((group._centroid_x - cx)**2 + (group._centroid_y - cy)**2)
    elif origin == "sw":
        group["_sort_key"] = group._centroid_x + group._centroid_y
    elif origin == "ne":
        group["_sort_key"] = -(group._centroid_x + group._centroid_y)
    else:
        group["_sort_key"] = group._centroid_x

    group = group.sort_values("_sort_key").reset_index(drop=True)

    # Assign ranges sequentially
    base_interval = addr_config.base_interval
    current_left = 100  # Start at 100 (typical)
    current_right = 101  # Opposite parity

    for idx, row in group.iterrows():
        length = row.geometry.length
        if length < 10:
            continue

        # Number of addresses on this segment
        num_addresses = max(1, int(length / 20))  # ~1 address per 20m
        addresses_per_side = num_addresses // 2

        # Left side (even)
        from_left = current_left
        to_left = current_left + (addresses_per_side - 1) * 2
        group.loc[idx, "FromAddr_L"] = from_left
        group.loc[idx, "ToAddr_L"] = to_left
        group.loc[idx, "Parity_L"] = Parity.EVEN.value
        current_left = to_left + base_interval

        # Right side (odd)
        from_right = current_right
        to_right = current_right + (addresses_per_side - 1) * 2
        group.loc[idx, "FromAddr_R"] = from_right
        group.loc[idx, "ToAddr_R"] = to_right
        group.loc[idx, "Parity_R"] = Parity.ODD.value
        current_right = to_right + base_interval

    # Clean up temp columns
    group.drop(columns=["_centroid_x", "_centroid_y", "_sort_key"], inplace=True, errors="ignore")


def interpolate_address_point(
    line: LineString,
    address_number: int,
    ranges: StreetAddressRanges,
    side: Literal["L", "R"],
    offset_m: float = 10.0,
    placement: Literal["fraction", "proportional"] = "proportional",
) -> Point | None:
    """
    Interpolate address point position along street centerline.

    Args:
        line: Street centerline geometry
        address_number: Target address number
        ranges: Address ranges for both sides
        side: "L" (left) or "R" (right) of street direction
        offset_m: Perpendicular offset from centerline
        placement: "fraction" = by address fraction, "proportional" = by distance

    Returns:
        Point geometry for address location, or None if not in range
    """
    range_side = ranges.get_side(side)
    if not range_side.contains(address_number):
        return None

    # Calculate fraction along segment
    if placement == "proportional":
        # Linear interpolation based on address position in range
        total = range_side.to_addr - range_side.from_addr
        if total == 0:
            fraction = 0.5
        else:
            fraction = (address_number - range_side.from_addr) / total
        fraction = np.clip(fraction, 0.0, 1.0)
    else:
        # Uniform fraction
        fraction = 0.5

    # Get point on line
    point_on_line = line_interpolate_point(line, fraction, normalized=True)

    # Offset perpendicular to line
    # Get line direction at that point
    # Use small delta to compute tangent
    delta = 0.001
    pt_before = line_interpolate_point(line, max(0, fraction - delta), normalized=True)
    pt_after = line_interpolate_point(line, min(1, fraction + delta), normalized=True)

    dx = pt_after.x - pt_before.x
    dy = pt_after.y - pt_before.y

    # Perpendicular vector (left side = -dy, dx)
    length = np.hypot(dx, dy)
    if length > 0:
        perp_x = -dy / length
        perp_y = dx / length
    else:
        perp_x, perp_y = 0, 0

    # Left of street direction = positive perpendicular
    # Right = negative
    sign = 1 if side == "L" else -1
    offset_x = point_on_line.x + sign * perp_x * offset_m
    offset_y = point_on_line.y + sign * perp_y * offset_m

    return Point(offset_x, offset_y)


def generate_address_points_for_segment(
    row: gpd.GeoSeries,
    spec: TownSpec,
    rng: np.random.Generator,
) -> list[dict]:
    """
    Generate SiteStructureAddressPoint records for a street segment.

    Creates address points at interpolated positions for all addresses
    in the segment's ranges.
    """
    from ..seeding import make_nguid

    points = []
    geometry = row.geometry
    if geometry.is_empty or geometry.length < 5:
        return points

    # Build ranges
    left_range = AddressRange(
        from_addr=int(row.get("FromAddr_L", 0)),
        to_addr=int(row.get("ToAddr_L", 0)),
        parity=Parity(row.get("Parity_L", "E")),
    )
    right_range = AddressRange(
        from_addr=int(row.get("FromAddr_R", 0)),
        to_addr=int(row.get("ToAddr_R", 0)),
        parity=Parity(row.get("Parity_R", "O")),
    )
    ranges = StreetAddressRanges(left=left_range, right=right_range)

    # Generate for left side
    addr = left_range.from_addr
    while addr <= left_range.to_addr:
        pt = interpolate_address_point(geometry, addr, ranges, "L")
        if pt:
            points.append(_make_address_point_record(row, addr, "L", pt, spec, rng))
        addr = left_range.next_address(addr)

    # Generate for right side
    addr = right_range.from_addr
    while addr <= right_range.to_addr:
        pt = interpolate_address_point(geometry, addr, ranges, "R")
        if pt:
            points.append(_make_address_point_record(row, addr, "R", pt, spec, rng))
        addr = right_range.next_address(addr)

    return points


def _make_address_point_record(
    street_row: gpd.GeoSeries,
    address_number: int,
    side: Literal["L", "R"],
    geometry: Point,
    spec: TownSpec,
    rng: np.random.Generator,
) -> dict:
    """Create a SiteStructureAddressPoint record."""
    from ..seeding import make_nguid

    # Determine place type and placement
    place_type = rng.choice(["ST", "B", "U"], p=[0.6, 0.3, 0.1])
    placement = rng.choice(["ENT", "STR", "CEN"], p=[0.5, 0.3, 0.2])

    # Sub-address components (occasionally)
    building = None
    floor = None
    unit = None
    room = None
    seat = None
    site_name = None

    if place_type == "B" and rng.random() < 0.3:
        building = f"Bldg {rng.integers(1, 10)}"
    if place_type == "U" and rng.random() < 0.5:
        floor = str(rng.integers(1, 5))
        unit = f"{rng.integers(1, 50):02d}"

    return {
        "NGUID": make_nguid(spec.metadata.nguid_domain, "ssap", rng.integers(1_000_000)),
        "AddNum": address_number,
        "AddNumSuf": None,
        "St_PreDir": street_row.get("St_PreDir"),
        "St_PreTyp": street_row.get("St_PreTyp"),
        "St_Name": street_row.get("St_Name"),
        "St_PosTyp": street_row.get("St_PosTyp"),
        "St_PosDir": street_row.get("St_PosDir"),
        "SiteName": site_name,
        "Building": building,
        "Floor": floor,
        "Unit": unit,
        "Room": room,
        "Seat": seat,
        "PlaceType": place_type,
        "Placement": placement,
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
    """Assign ZIP code based on location."""
    # Simplified: single ZIP for town
    return f"{rng.integers(10000, 99999):05d}"


def _assign_esn(geometry: Point, spec: TownSpec, rng: np.random.Generator) -> str:
    """Assign ESN (Emergency Service Number) based on location."""
    # Simplified: random ESN 1-999
    return f"{rng.integers(1, 999):03d}"