"""
Deterministic RNG management for reproducible synthetic generation.

Uses NumPy's PCG64 generator with substream derivation from a master seed.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from typing import Any

import numpy as np


@dataclass(frozen=True, slots=True)
class SeedState:
    """
    Immutable seed state containing master seed and derived substreams.

    Each module gets its own independent Generator derived from the master seed.
    This ensures:
    - Full reproducibility from a single integer
    - Module isolation (changes to one module don't affect others)
    - Deterministic substream derivation
    """
    master_seed: int
    substreams: dict[str, int] = field(default_factory=dict)

    # Module names that will receive substreams
    MODULES: tuple[str, ...] = (
        "boundaries",
        "hydrology",
        "streets.arterial",
        "streets.collector",
        "streets.local",
        "streets.addressing",
        "streets.naming",
        "parcels.tessellation",
        "parcels.subdivision",
        "parcels.zoning",
        "buildings.footprints",
        "buildings.subaddress",
        "address_points",
        "operational.stations",
        "operational.zones",
        "operational.run_cards",
        "routing",
        "validation",
    )

    @classmethod
    def from_master(cls, master_seed: int | None = None, modules: tuple[str, ...] | None = None) -> "SeedState":
        """
        Create SeedState from a master seed.

        Args:
            master_seed: Integer seed (None = random from system entropy)
            modules: Module names to derive substreams for (default: MODULES)

        Returns:
            SeedState with master_seed and all substreams populated
        """
        if master_seed is None:
            # Use system entropy for true randomness
            master_seed = int(np.random.default_rng().integers(2**32))

        rng = np.random.default_rng(master_seed)
        target_modules = modules or cls.MODULES

        # Derive substreams using hash of master_seed + module name
        # This ensures deterministic derivation even if module list changes
        substreams = {}
        for module in target_modules:
            # Create deterministic subseed: hash(master_seed + module)
            hash_input = f"{master_seed}:{module}".encode()
            subseed = int.from_bytes(hashlib.sha256(hash_input).digest()[:8], "little")
            substreams[module] = subseed

        return cls(master_seed=master_seed, substreams=substreams)

    @classmethod
    def from_json(cls, data: str) -> "SeedState":
        """Deserialize from JSON string."""
        d = json.loads(data)
        return cls(master_seed=d["master_seed"], substreams=d["substreams"])

    def to_json(self) -> str:
        """Serialize to JSON string."""
        return json.dumps(
            {"master_seed": self.master_seed, "substreams": self.substreams},
            sort_keys=True,
        )

    def rng(self, module: str) -> np.random.Generator:
        """
        Get a Generator for a specific module.

        Args:
            module: Module name (must be in substreams)

        Returns:
            Independent np.random.Generator for that module

        Raises:
            KeyError: If module not in substreams
        """
        if module not in self.substreams:
            raise KeyError(f"Module '{module}' not in seed state. Available: {list(self.substreams.keys())}")
        return np.random.default_rng(self.substreams[module])

    def fork(self, new_module: str) -> "SeedState":
        """
        Create a new SeedState with an additional module.

        Useful for dynamically adding modules during generation.
        """
        # Derive subseed for new module
        hash_input = f"{self.master_seed}:{new_module}".encode()
        subseed = int.from_bytes(hashlib.sha256(hash_input).digest()[:8], "little")

        new_substreams = {**self.substreams, new_module: subseed}
        return SeedState(master_seed=self.master_seed, substreams=new_substreams)

    def __contains__(self, module: str) -> bool:
        return module in self.substreams

    def get_substreams_summary(self) -> dict[str, int]:
        """Return copy of substreams for logging/debugging."""
        return dict(self.substreams)


def make_nguid(domain: str, layer: str, local_id: int) -> str:
    """
    Generate NENA-compliant NGUID.

    Format: urn:emergency:uid:gid:{domain}:{layer}-{local_id:06d}

    Args:
        domain: Fictional domain (e.g., "synthgis.local")
        layer: Layer short name (e.g., "rcl", "ssap", "psap")
        local_id: Sequential integer ID

    Returns:
        NGUID string
    """
    return f"urn:emergency:uid:gid:{domain}:{layer}-{local_id:06d}"


def parse_nguid(nguid: str) -> dict[str, str] | None:
    """Parse NGUID into components."""
    prefix = "urn:emergency:uid:gid:"
    if not nguid.startswith(prefix):
        return None
    rest = nguid[len(prefix):]
    if ":" not in rest:
        return None
    domain, local = rest.split(":", 1)
    return {"domain": domain, "local_id": local}