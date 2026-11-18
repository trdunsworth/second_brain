"""
Parcel generation package.

Modules:
- tessellation: Morphological tessellation (momepy)
- subdivision: Block → parcel subdivision with setbacks
- zoning: Land use assignment
"""

from .tessellation import generate_morphological_tessellation, blocks_from_streets
from .subdivision import subdivide_blocks, ParcelConfig
from .zoning import assign_zoning, ZoningAssigner

__all__ = [
    "generate_morphological_tessellation",
    "blocks_from_streets",
    "subdivide_blocks",
    "ParcelConfig",
    "assign_zoning",
    "ZoningAssigner",
]