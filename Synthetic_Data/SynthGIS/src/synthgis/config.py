"""
Configuration models for SynthGIS using Pydantic.

All configuration is loaded from YAML and validated at startup.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator
from pydantic_yaml import parse_yaml_file_as


class RoadClass(str, Enum):
    """NENA RoadClass domain values."""
    INTERSTATE = "I"
    US_HIGHWAY = "US"
    STATE_HIGHWAY = "SH"
    COUNTY = "CO"
    LOCAL = "LO"
    PRIVATE = "PV"
    RAMP = "RA"


class Parity(str, Enum):
    """NENA address parity domain values."""
    EVEN = "E"
    ODD = "O"
    BOTH = "B"
    ZERO = "Z"


class OneWay(str, Enum):
    """NENA OneWay domain values."""
    BOTH = "B"
    FROM_TO = "FT"
    TO_FROM = "TF"


class PlaceType(str, Enum):
    """NENA SiteStructureAddressPoint PlaceType."""
    SITE = "S"
    STRUCTURE = "ST"
    BUILDING = "B"
    UNIT = "U"


class Placement(str, Enum):
    """NENA SiteStructureAddressPoint Placement."""
    CENTROID = "CEN"
    ENTRANCE = "ENT"
    STRUCTURE = "STR"
    PARCEL = "PAR"


class CRSConfig(BaseModel):
    """Coordinate Reference System configuration."""
    projected: str = Field(default="EPSG:2263", description="Projected CRS for generation (e.g., State Plane)")
    geographic: str = Field(default="EPSG:4326", description="Geographic CRS for export (WGS84)")

    @field_validator("projected", "geographic")
    @classmethod
    def validate_crs(cls, v: str) -> str:
        if not v.startswith("EPSG:"):
            raise ValueError("CRS must be EPSG code (e.g., EPSG:2263)")
        return v


class ExtentConfig(BaseModel):
    """Bounding box in projected CRS coordinates."""
    minx: float
    maxx: float
    miny: float
    maxy: float

    @property
    def width(self) -> float:
        return self.maxx - self.minx

    @property
    def height(self) -> float:
        return self.maxy - self.miny

    @property
    def area_sqm(self) -> float:
        return self.width * self.height

    @property
    def area_sqkm(self) -> float:
        return self.area_sqm / 1_000_000


class StreetHierarchyLevelConfig(BaseModel):
    """Configuration for one level of street hierarchy."""
    target_length_km: float = Field(ge=0, description="Target total length in km")
    spacing_m: float = Field(gt=0, description="Typical spacing between parallel streets")
    road_class: RoadClass
    speed_mph: int = Field(ge=5, le=80)
    lanes: int = Field(default=2, ge=1, le=6)
    divided: bool = False


class StreetHierarchyConfig(BaseModel):
    """Complete street hierarchy configuration."""
    arterial: StreetHierarchyLevelConfig
    collector: StreetHierarchyLevelConfig
    local: StreetHierarchyLevelConfig
    cul_de_sac: StreetHierarchyLevelConfig

    def total_target_km(self) -> float:
        return (
            self.arterial.target_length_km
            + self.collector.target_length_km
            + self.local.target_length_km
        )


class ZoningTypeConfig(BaseModel):
    """Configuration for one land use zone type."""
    proportion: float = Field(ge=0, le=1)
    min_parcel_sqm: float = Field(gt=0)
    max_parcel_sqm: float = Field(gt=0)
    setback_m: float = Field(ge=0)
    building_coverage: float = Field(ge=0, le=1)
    floors: list[int] = Field(min_length=1)

    @field_validator("max_parcel_sqm")
    @classmethod
    def max_gt_min(cls, v: float, info) -> float:
        if "min_parcel_sqm" in info.data and v <= info.data["min_parcel_sqm"]:
            raise ValueError("max_parcel_sqm must be > min_parcel_sqm")
        return v


class ZoningConfig(BaseModel):
    """Land use zoning configuration."""
    residential: ZoningTypeConfig
    commercial: ZoningTypeConfig
    industrial: ZoningTypeConfig
    civic: ZoningTypeConfig

    @field_validator("residential", "commercial", "industrial", "civic", mode="after")
    @classmethod
    def proportions_sum_to_one(cls, v: ZoningTypeConfig, info) -> ZoningTypeConfig:
        # Validation happens at model level after all fields parsed
        return v

    def validate_proportions(self) -> None:
        total = (
            self.residential.proportion
            + self.commercial.proportion
            + self.industrial.proportion
            + self.civic.proportion
        )
        if abs(total - 1.0) > 0.001:
            raise ValueError(f"Zoning proportions must sum to 1.0, got {total}")


class HydrologyConfig(BaseModel):
    """Hydrology (water features) configuration."""
    enabled: bool = True
    stream_count: int = Field(default=1, ge=0, le=5)
    min_width_m: float = Field(default=10, gt=0)
    max_width_m: float = Field(default=50, gt=0)


class AddressingScheme(str, Enum):
    GRID_QUADRANT = "grid_quadrant"
    MILE_MARKER = "mile_marker"
    SEQUENTIAL = "sequential"


class AddressingConfig(BaseModel):
    """Address range and point configuration."""
    scheme: AddressingScheme = AddressingScheme.GRID_QUADRANT
    quadrant_origin: Literal["center", "sw", "nw", "se", "ne"] = "center"
    base_interval: int = Field(default=100, ge=10, le=1000)
    parity: Literal["even_odd", "all_even", "all_odd"] = "even_odd"


class OperationalConfig(BaseModel):
    """Operational layers (CAD/Dispatch) configuration."""
    psap_count: int = Field(default=1, ge=1, le=5)
    fire_stations: int = Field(default=2, ge=1, le=10)
    police_stations: int = Field(default=1, ge=1, le=10)
    ems_stations: int = Field(default=2, ge=1, le=10)
    hospitals: int = Field(default=1, ge=1, le=5)
    response_zones_per_service: int = Field(default=4, ge=1, le=20)


class OutputConfig(BaseModel):
    """Output configuration."""
    geopackage: str = "output/synthetic_town.gpkg"
    postgis_dump: str = "output/synthetic_town.sql"
    include_metadata_layer: bool = True


class MetadataConfig(BaseModel):
    """Metadata for the synthetic town."""
    name: str = "Synthville"
    state: str = "SY"
    county: str = "Synthetic County"
    municipality: str = "Synthville"
    nguid_domain: str = "synthgis.local"
    disclaimer: str = "SYNTHETIC DATA - NOT FOR OPERATIONAL USE"
    license: str = "CC-BY-4.0"
    generation_date: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class TownSpec(BaseModel):
    """Complete town specification — root configuration object."""
    metadata: MetadataConfig = Field(default_factory=MetadataConfig)
    crs: CRSConfig = Field(default_factory=CRSConfig)
    extent: ExtentConfig
    street_hierarchy: StreetHierarchyConfig
    zoning: ZoningConfig
    hydrology: HydrologyConfig = Field(default_factory=HydrologyConfig)
    addressing: AddressingConfig = Field(default_factory=AddressingConfig)
    operational: OperationalConfig = Field(default_factory=OperationalConfig)
    output: OutputConfig = Field(default_factory=OutputConfig)
    seed: int | None = Field(default=None, description="Master RNG seed (None = random)")

    @field_validator("zoning", mode="after")
    @classmethod
    def validate_zoning_proportions(cls, v: ZoningConfig) -> ZoningConfig:
        v.validate_proportions()
        return v

    @classmethod
    def from_yaml(cls, path: str | Path) -> "TownSpec":
        """Load and validate town specification from YAML file."""
        return parse_yaml_file_as(cls, path)

    def to_yaml(self, path: str | Path) -> None:
        """Write specification to YAML file."""
        import yaml
        with open(path, "w") as f:
            yaml.dump(self.model_dump(), f, sort_keys=False, default_flow_style=False)


# Convenience function for loading config
def load_town_spec(path: str | Path) -> TownSpec:
    """Load town specification from YAML file."""
    return TownSpec.from_yaml(path)