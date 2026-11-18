"""
Sub-address generation for buildings.

Generates CLDXF-compliant sub-address components:
- Building (for multi-building sites)
- Floor
- Unit/Suite/Apartment
- Room
- Seat
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import numpy as np

from ..config import TownSpec
from ..seeding import SeedState


@dataclass(slots=True)
class SubAddress:
    """Complete sub-address for a unit within a building."""
    building: str | None = None
    floor: str | None = None
    unit: str | None = None
    room: str | None = None
    seat: str | None = None
    place_type: Literal["S", "ST", "B", "U"] = "ST"  # Site, Structure, Building, Unit
    placement: Literal["CEN", "ENT", "STR", "PAR"] = "ENT"  # Centroid, Entrance, Structure, Parcel


class SubAddressGenerator:
    """Generates sub-addresses for buildings based on type and floors."""

    def __init__(self, spec: TownSpec, seed_state: SeedState):
        self.spec = spec
        self.rng = seed_state.rng("buildings.subaddress")

    def generate_for_building(
        self,
        building: gpd.GeoSeries,
        num_units: int | None = None,
    ) -> list[SubAddress]:
        """Generate sub-addresses for a single building."""
        building_type = building.get("building_type", "generic")
        floors = building.get("floors", 1)

        if num_units is None:
            num_units = self._estimate_units(building_type, floors)

        subaddresses = []

        # Determine if multi-building site
        is_multi_building = building_type in ("apartment", "strip_mall", "campus")

        for i in range(num_units):
            sub = self._generate_unit_subaddress(
                building_type=building_type,
                floors=floors,
                unit_index=i,
                is_multi_building=is_multi_building,
            )
            subaddresses.append(sub)

        return subaddresses

    def _estimate_units(self, building_type: str, floors: int) -> int:
        """Estimate number of units based on building type and floors."""
        base_units = {
            "house": 1,
            "duplex": 2,
            "townhouse": 1,
            "apartment": max(4, floors * 4),  # ~4 units per floor
            "retail": max(1, floors * 2),
            "office": max(2, floors * 4),
            "restaurant": 1,
            "strip_mall": max(5, floors * 6),
            "warehouse": 1,
            "factory": max(1, floors),
            "storage": max(10, floors * 20),  # Storage units
            "light_industrial": max(1, floors * 2),
            "school": max(10, floors * 20),  # Classrooms
            "government": max(5, floors * 10),
            "fire_station": 1,
            "police_station": 1,
            "hospital": max(50, floors * 30),
            "library": max(5, floors * 10),
            "generic": max(1, floors),
        }
        base = base_units.get(building_type, 1)
        return self.rng.integers(max(1, base - 2), base + 3)

    def _generate_unit_subaddress(
        self,
        building_type: str,
        floors: int,
        unit_index: int,
        is_multi_building: bool,
    ) -> SubAddress:
        """Generate sub-address for a single unit."""
        sub = SubAddress()

        # Building identifier (for multi-building sites)
        if is_multi_building and self.rng.random() < 0.7:
            sub.building = f"Bldg {self.rng.choice(['A', 'B', 'C', '1', '2', '3'])}"

        # Floor
        if floors > 1 and self.rng.random() < 0.9:
            sub.floor = str(self.rng.integers(1, floors + 1))

        # Unit number
        if building_type in ("apartment", "office", "storage", "hotel"):
            # Apartment/office style: floor + unit number
            if sub.floor:
                sub.unit = f"{sub.floor}{self.rng.integers(1, 10):02d}"
            else:
                sub.unit = f"{self.rng.integers(1, 100):03d}"
        elif building_type in ("retail", "strip_mall"):
            # Suite numbers
            sub.unit = f"Suite {self.rng.integers(100, 999)}"
        elif building_type in ("warehouse", "factory", "light_industrial"):
            # Bay/Unit numbers
            sub.unit = f"Bay {self.rng.integers(1, 50)}"
        elif building_type in ("school", "government", "hospital"):
            # Room numbers
            sub.unit = f"Room {self.rng.integers(100, 999)}"
        else:
            # Generic
            if self.rng.random() < 0.5:
                sub.unit = str(self.rng.integers(1, 50))

        # Room (sub-unit)
        if sub.unit and self.rng.random() < 0.3:
            sub.room = f"{self.rng.integers(1, 20)}"

        # Seat (workstation)
        if building_type == "office" and self.rng.random() < 0.2:
            sub.seat = f"WS-{self.rng.integers(1, 100):03d}"

        # Determine place_type
        if sub.unit:
            sub.place_type = "U"
        elif sub.building:
            sub.place_type = "B"
        else:
            sub.place_type = "ST"

        # Placement
        sub.placement = self.rng.choice(["ENT", "STR", "CEN"], p=[0.6, 0.3, 0.1])

        return sub


def generate_subaddresses(
    buildings: gpd.GeoDataFrame,
    spec: TownSpec,
    seed_state: SeedState,
) -> list[list[SubAddress]]:
    """Generate sub-addresses for all buildings."""
    generator = SubAddressGenerator(spec, seed_state)
    return [generator.generate_for_building(b) for _, b in buildings.iterrows()]