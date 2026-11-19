"""
Building generation package.

Modules:
- footprints: Building footprint placement within parcels
- subaddress: Sub-address (Building/Floor/Unit/Room/Seat) generation
- building_3d: 3D extrusion and NENA-REQ-003.1 compliance
"""

from .footprints import generate_building_footprints, BuildingFootprintGenerator
from .subaddress import generate_subaddresses, SubAddressGenerator
from .building_3d import (
    extrude_building,
    extrude_building_flat,
    extrude_building_gabled,
    extrude_building_hipped,
    generate_buildings_3d,
    add_ground_elevation_to_parcels,
    Building3DConfig,
    Building3D,
    RoofType,
)

__all__ = [
    "generate_building_footprints",
    "BuildingFootprintGenerator",
    "generate_subaddresses",
    "SubAddressGenerator",
    "extrude_building",
    "extrude_building_flat",
    "extrude_building_gabled",
    "extrude_building_hipped",
    "generate_buildings_3d",
    "add_ground_elevation_to_parcels",
    "Building3DConfig",
    "Building3D",
    "RoofType",
]