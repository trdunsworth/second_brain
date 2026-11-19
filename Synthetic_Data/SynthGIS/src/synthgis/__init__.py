"""
SynthGIS — Synthetic City GIS Generator for NG9-1-1 Compliance

A seed-locked procedural generator that produces NENA-STA-006.3-compliant
synthetic city data as GeoPackage/PostGIS for NG9-1-1 testing, training,
and SynthCCD incident generation.
"""

__version__ = "0.1.0"
__author__ = "Tony Dunsworth"
__license__ = "MIT"

from .config import TownSpec, CRSConfig, StreetHierarchyConfig, ZoningConfig
from .seeding import SeedState
from .services import create_routing_app, RoutingService, create_lost_app, LoSTService

__all__ = [
    "TownSpec",
    "CRSConfig",
    "StreetHierarchyConfig",
    "ZoningConfig",
    "SeedState",
    "create_routing_app",
    "RoutingService",
    "create_lost_app",
    "LoSTService",
]