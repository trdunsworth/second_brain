"""
Street network generation package.

Modules:
- generator: Procedural street network (arterial → collector → local)
- topology: Topology cleanup, splitting, validation
- addressing: CLDXF-compliant address range assignment
- naming: Fictional street name generation
"""

from .generator import StreetNetworkGenerator
from .topology import clean_topology, split_at_intersections, validate_street_topology
from .addressing import assign_address_ranges, interpolate_address_point, Parity
from .naming import StreetNameGenerator

__all__ = [
    "StreetNetworkGenerator",
    "clean_topology",
    "split_at_intersections",
    "validate_street_topology",
    "assign_address_ranges",
    "interpolate_address_point",
    "Parity",
    "StreetNameGenerator",
]