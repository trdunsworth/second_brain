"""
Building generation package.

Modules:
- footprints: Building footprint placement within parcels
- subaddress: Sub-address (Building/Floor/Unit/Room/Seat) generation
"""

from .footprints import generate_building_footprints, BuildingFootprintGenerator
from .subaddress import generate_subaddresses, SubAddressGenerator

__all__ = [
    "generate_building_footprints",
    "BuildingFootprintGenerator",
    "generate_subaddresses",
    "SubAddressGenerator",
]