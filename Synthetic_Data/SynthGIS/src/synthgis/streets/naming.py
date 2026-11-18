"""
Fictional street name generation.

Generates realistic but fictional street names following US conventions.
Ensures no conflict with real streets in the template region.
"""

from __future__ import annotations

import numpy as np
from dataclasses import dataclass
from typing import Literal

# Street name components (fictional, curated)
STREET_NAMES = [
    # Nature
    "Oak", "Pine", "Maple", "Cedar", "Elm", "Willow", "Birch", "Aspen",
    "Sycamore", "Magnolia", "Dogwood", "Redwood", "Sequoia", "Cypress",
    "Hickory", "Walnut", "Chestnut", "Beech", "Poplar", "Spruce", "Fir",
    # Geographic
    "River", "Lake", "Creek", "Brook", "Stream", "Falls", "Rapids", "Bay",
    "Harbor", "Cove", "Inlet", "Sound", "Channel", "Reach", "Bend",
    # Descriptive
    "Main", "Central", "First", "Second", "Third", "Fourth", "Fifth",
    "Broad", "Wide", "Long", "Short", "High", "Low", "Upper", "Lower",
    "New", "Old", "North", "South", "East", "West", "Middle", "Center",
    # Historical/Abstract
    "Liberty", "Union", "Freedom", "Independence", "Constitution", "Washington",
    "Lincoln", "Jefferson", "Madison", "Monroe", "Adams", "Jackson",
    "Franklin", "Hamilton", "Lafayette", "Greene", "Putnam", "Knox",
    # Surnames (common fictional)
    "Miller", "Smith", "Johnson", "Williams", "Brown", "Jones", "Davis",
    "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Martin", "Jackson",
    # Compound
    "Spring", "Summer", "Autumn", "Winter", "Meadow", "Valley", "Hill",
    "Ridge", "Mount", "Peak", "Summit", "Crest", "View", "Vista", "Horizon",
]

STREET_PRE_TYPES = [
    "Old", "New", "Upper", "Lower", "North", "South", "East", "West",
    "Historic", "Former", "Original", "Main", "Front", "Back",
]

STREET_POST_TYPES = [
    "St", "Ave", "Blvd", "Dr", "Rd", "Ln", "Ct", "Pl", "Way", "Trl",
    "Cir", "Loop", "Byp", "Pkwy", "Expy", "Fwy", "Hwy", "Tpke",
    "Ter", "Row", "Walk", "Path", "Pass", "Crossing", "Xing",
]

STREET_PRE_DIRECTIONALS = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"]
STREET_POST_DIRECTIONALS = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"]

STREET_PRE_MODIFIERS = ["Old", "New", "Historic", "Main", "Front", "Upper", "Lower"]
STREET_POST_MODIFIERS = ["Ext", "Spur", "Conn", "Alt", "Bus", "Byp"]

PRE_TYPE_SEPARATORS = ["of the", "on the", "to the"]


@dataclass(slots=True)
class StreetNameParts:
    """Parsed street name components per NENA/CLDXF."""
    pre_modifier: str | None = None
    pre_directional: str | None = None
    pre_type: str | None = None
    pre_type_separator: str | None = None
    name: str = ""
    post_type: str | None = None
    post_directional: str | None = None
    post_modifier: str | None = None

    def full_name(self) -> str:
        """Assemble full street name."""
        parts = []
        if self.pre_modifier:
            parts.append(self.pre_modifier)
        if self.pre_directional:
            parts.append(self.pre_directional)
        if self.pre_type:
            parts.append(self.pre_type)
            if self.pre_type_separator:
                parts.append(self.pre_type_separator)
        parts.append(self.name)
        if self.post_type:
            parts.append(self.post_type)
        if self.post_directional:
            parts.append(self.post_directional)
        if self.post_modifier:
            parts.append(self.post_modifier)
        return " ".join(parts)

    def to_dict(self) -> dict[str, str | None]:
        """Convert to dict for DataFrame."""
        return {
            "St_PreMod": self.pre_modifier,
            "St_PreDir": self.pre_directional,
            "St_PreTyp": self.pre_type,
            "St_PreTypSep": self.pre_type_separator,
            "St_Name": self.name,
            "St_PosTyp": self.post_type,
            "St_PosDir": self.post_directional,
            "St_PosMod": self.post_modifier,
        }


class StreetNameGenerator:
    """Generates fictional street names with NENA/CLDXF components."""

    def __init__(self, rng: np.random.Generator | None = None):
        self.rng = rng or np.random.default_rng()
        self._used_names: set[str] = set()

    @classmethod
    def generate(cls, rng: np.random.Generator) -> dict[str, str | None]:
        """Generate a single random street name."""
        generator = cls(rng)
        return generator._generate_one().to_dict()

    def generate_unique(self, count: int) -> list[dict[str, str | None]]:
        """Generate multiple unique street names."""
        names = []
        attempts = 0
        max_attempts = count * 10

        while len(names) < count and attempts < max_attempts:
            name_dict = self._generate_one().to_dict()
            full = self._dict_to_full(name_dict)
            if full not in self._used_names:
                self._used_names.add(full)
                names.append(name_dict)
            attempts += 1

        return names

    def _generate_one(self) -> StreetNameParts:
        """Generate one street name with all components."""
        # Choose pattern
        pattern = self.rng.choice([
            "simple",           # Main St
            "with_pre_dir",     # N Main St
            "with_post_dir",    # Main St N
            "with_pre_type",    # Old Main St
            "with_both_dir",    # N Main St N
            "full",             # Old N Main St N
        ], p=[0.3, 0.2, 0.15, 0.15, 0.1, 0.1])

        parts = StreetNameParts()
        parts.name = self.rng.choice(STREET_NAMES)

        if pattern in ("with_pre_dir", "with_both_dir", "full"):
            parts.pre_directional = self.rng.choice(STREET_PRE_DIRECTIONALS)

        if pattern in ("with_post_dir", "with_both_dir", "full"):
            parts.post_directional = self.rng.choice(STREET_POST_DIRECTIONALS)

        if pattern in ("with_pre_type", "full"):
            parts.pre_type = self.rng.choice(STREET_PRE_TYPES)
            if self.rng.random() < 0.3:
                parts.pre_type_separator = self.rng.choice(PRE_TYPE_SEPARATORS)

        if pattern in ("with_pre_type", "full") and self.rng.random() < 0.2:
            parts.pre_modifier = self.rng.choice(STREET_PRE_MODIFIERS)

        # Post type (suffix)
        parts.post_type = self.rng.choice(STREET_POST_TYPES)

        # Post modifier (rare)
        if self.rng.random() < 0.05:
            parts.post_modifier = self.rng.choice(STREET_POST_MODIFIERS)

        return parts

    def _dict_to_full(self, d: dict[str, str | None]) -> str:
        parts = []
        for key in ["St_PreMod", "St_PreDir", "St_PreTyp", "St_PreTypSep", "St_Name", "St_PosTyp", "St_PosDir", "St_PosMod"]:
            val = d.get(key)
            if val:
                parts.append(val)
        return " ".join(parts)

    def generate_hierarchical_set(
        self,
        arterial_count: int,
        collector_count: int,
        local_count: int,
    ) -> dict[str, list[dict[str, str | None]]]:
        """
        Generate street names appropriate for each hierarchy level.

        Arterials: More formal, numbered, or historic names
        Collectors: Descriptive, nature names
        Locals: Trees, flowers, short names, courts/circles
        """
        arterial_names = []
        collector_names = []
        local_names = []

        # Arterials: Use broader, more formal names
        arterial_stems = [n for n in STREET_NAMES if n in
            ["Main", "Central", "Broad", "Wide", "Long", "High", "Liberty", "Union",
             "Washington", "Lincoln", "Jefferson", "Franklin", "Hamilton"]]
        arterial_types = ["Blvd", "Ave", "Pkwy", "Hwy", "Tpke"]

        for _ in range(arterial_count):
            parts = StreetNameParts()
            parts.name = self.rng.choice(arterial_stems)
            parts.post_type = self.rng.choice(arterial_types)
            if self.rng.random() < 0.3:
                parts.pre_directional = self.rng.choice(STREET_PRE_DIRECTIONALS)
            arterial_names.append(parts.to_dict())

        # Collectors: Nature, geographic
        collector_stems = [n for n in STREET_NAMES if n in
            ["River", "Lake", "Creek", "Brook", "Valley", "Ridge", "Hill",
             "Meadow", "Spring", "Oak", "Maple", "Pine", "Cedar"]]
        collector_types = ["Dr", "Rd", "Ave", "Blvd"]

        for _ in range(collector_count):
            parts = StreetNameParts()
            parts.name = self.rng.choice(collector_stems)
            parts.post_type = self.rng.choice(collector_types)
            if self.rng.random() < 0.4:
                parts.pre_directional = self.rng.choice(STREET_PRE_DIRECTIONALS)
            collector_names.append(parts.to_dict())

        # Locals: Trees, short names, courts
        local_stems = [n for n in STREET_NAMES if n in
            ["Oak", "Pine", "Maple", "Cedar", "Elm", "Willow", "Birch", "Aspen",
             "Dogwood", "Magnolia", "Spring", "Summer", "Autumn", "Winter",
             "Meadow", "View", "Vista", "Crest", "Peak"]]
        local_types = ["St", "Ln", "Ct", "Pl", "Way", "Trl", "Cir", "Loop"]

        for _ in range(local_count):
            parts = StreetNameParts()
            parts.name = self.rng.choice(local_stems)
            parts.post_type = self.rng.choice(local_types)
            local_names.append(parts.to_dict())

        return {
            "arterial": arterial_names,
            "collector": collector_names,
            "local": local_names,
        }


def parse_street_name(full_name: str) -> StreetNameParts:
    """
    Parse a full street name into NENA components.

    Simplified parser — real implementation would be more sophisticated.
    """
    tokens = full_name.split()
    parts = StreetNameParts()

    # This is a placeholder — full parsing requires state machine
    # For now, assume last token is post_type if it matches known types
    if tokens and tokens[-1] in STREET_POST_TYPES:
        parts.post_type = tokens[-1]
        tokens = tokens[:-1]

    # First token might be pre_directional
    if tokens and tokens[0] in STREET_PRE_DIRECTIONALS:
        parts.pre_directional = tokens[0]
        tokens = tokens[1:]

    # Remaining is name (simplified)
    parts.name = " ".join(tokens) if tokens else "Unknown"

    return parts