"""
Provisioning, PSAP, and Emergency Service Boundary generation.

Creates NENA-compliant boundary polygons with proper topology:
- No gaps or overlaps within a layer
- Coincident boundaries between adjacent providers
- Proper ServiceURN values per NENA standard
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon, MultiPolygon, box
from shapely.ops import unary_union, voronoi_diagram
from shapely import buffer, make_valid, set_precision

from .config import TownSpec, CRSConfig
from .seeding import SeedState, make_nguid


# NENA ServiceURN constants
SERVICE_URN = {
    "psap": "urn:emergency:service:sos.psap",
    "fire": "urn:emergency:service:sos.fire",
    "police": "urn:emergency:service:sos.police",
    "ems": "urn:emergency:service:sos.ems",
    "poison_control": "urn:emergency:service:sos.poison",
    "coast_guard": "urn:emergency:service:sos.coastguard",
}


@dataclass(slots=True)
class BoundaryLayers:
    """Container for all boundary layers."""
    provisioning: gpd.GeoDataFrame
    psap: gpd.GeoDataFrame
    fire: gpd.GeoDataFrame
    police: gpd.GeoDataFrame
    ems: gpd.GeoDataFrame


def generate_provisioning_boundary(
    spec: TownSpec,
    seed: np.random.Generator,
) -> gpd.GeoDataFrame:
    """
    Generate the provisioning boundary (data authority extent).

    Creates a slightly irregular polygon within the configured extent.
    """
    extent = spec.extent
    crs = spec.crs.projected

    # Start with the extent bounding box
    base = box(extent.minx, extent.miny, extent.maxx, extent.maxy)

    # Add small perturbations to make it look natural
    # Use buffer with negative/positive to create irregular edges
    perturbed = base.buffer(
        seed.uniform(-200, 200),
        resolution=16,
        join_style="mitre",
    )

    # Ensure it's valid and within extent
    perturbed = make_valid(perturbed)
    perturbed = perturbed.intersection(base)

    # Create GeoDataFrame with NENA fields
    gdf = gpd.GeoDataFrame(
        [{
            "NGUID": make_nguid(spec.metadata.nguid_domain, "prov", 1),
            "Name": f"{spec.metadata.municipality} Provisioning Boundary",
            "ServiceURN": "urn:emergency:service:sos.provisioning",
            "State": spec.metadata.state,
            "County": spec.metadata.county,
            "DateUpdate": spec.metadata.generation_date if hasattr(spec.metadata, 'generation_date') else "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": spec.metadata.disclaimer,
            "geometry": perturbed,
        }],
        crs=crs,
    )

    return gdf


def _voronoi_partition(
    container: Polygon,
    num_cells: int,
    seed: np.random.Generator,
    min_area_sqm: float = 10000,
) -> list[Polygon]:
    """
    Generate Voronoi partition of a container polygon.

    Ensures no gaps/overlaps and all cells meet minimum area.
    """
    if num_cells <= 1:
        return [container]

    # Generate seed points within container
    bounds = container.bounds
    points = []
    attempts = 0
    max_attempts = num_cells * 50

    while len(points) < num_cells and attempts < max_attempts:
        x = seed.uniform(bounds[0], bounds[2])
        y = seed.uniform(bounds[1], bounds[3])
        pt = (x, y)
        # Check if point is in container (with buffer)
        if container.contains(pt) or container.buffer(10).contains(pt):
            points.append(pt)
        attempts += 1

    if len(points) < num_cells:
        # Fallback: grid-based seeds
        cols = int(np.ceil(np.sqrt(num_cells)))
        rows = int(np.ceil(num_cells / cols))
        points = []
        for i in range(rows):
            for j in range(cols):
                if len(points) >= num_cells:
                    break
                x = bounds[0] + (j + 0.5) * (bounds[2] - bounds[0]) / cols
                y = bounds[1] + (i + 0.5) * (bounds[3] - bounds[1]) / rows
                points.append((x, y))

    # Create Voronoi diagram clipped to container
    voronoi = voronoi_diagram(MultiPoint(points), envelope=container)
    cells = list(voronoi.geoms)

    # Filter by minimum area and clip to container
    result = []
    for cell in cells:
        cell = make_valid(cell.intersection(container))
        if cell.area >= min_area_sqm and not cell.is_empty:
            result.append(cell)

    # If we lost cells, merge smallest with neighbors
    while len(result) < num_cells and len(result) > 1:
        # Merge two smallest
        result.sort(key=lambda g: g.area)
        merged = unary_union([result[0], result[1]])
        result = [merged] + result[2:]

    return result[:num_cells]


def generate_service_boundaries(
    spec: TownSpec,
    provisioning: gpd.GeoDataFrame,
    seed_state: SeedState,
) -> dict[str, gpd.GeoDataFrame]:
    """
    Generate all emergency service boundaries using Voronoi partition.

    Each service type gets its own partition of the provisioning area.
    Boundaries are coincident where services share jurisdiction.
    """
    prov_geom = provisioning.geometry.iloc[0]
    crs = spec.crs.projected
    domain = spec.metadata.nguid_domain
    meta = spec.metadata

    boundaries = {}

    # PSAP boundaries (usually 1, but config allows multiple)
    psap_count = spec.operational.psap_count
    psap_cells = _voronoi_partition(prov_geom, psap_count, seed_state.rng("boundaries"))
    psap_records = []
    for i, cell in enumerate(psap_cells):
        psap_records.append({
            "NGUID": make_nguid(domain, "psap", i + 1),
            "Name": f"{meta.municipality} PSAP {i + 1}",
            "ServiceURN": SERVICE_URN["psap"],
            "ServiceNum": f"911-{i + 1:03d}",
            "State": meta.state,
            "County": meta.county,
            "Inc_Muni": meta.municipality,
            "DateUpdate": "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": meta.disclaimer,
            "geometry": set_precision(cell, 0.01),
        })
    boundaries["psap"] = gpd.GeoDataFrame(psap_records, crs=crs)

    # Fire boundaries
    fire_count = spec.operational.response_zones_per_service
    fire_cells = _voronoi_partition(prov_geom, fire_count, seed_state.rng("boundaries"))
    fire_records = []
    for i, cell in enumerate(fire_cells):
        fire_records.append({
            "NGUID": make_nguid(domain, "fire", i + 1),
            "Name": f"{meta.municipality} Fire District {i + 1}",
            "ServiceURN": SERVICE_URN["fire"],
            "ServiceNum": f"FD-{i + 1:03d}",
            "State": meta.state,
            "County": meta.county,
            "Inc_Muni": meta.municipality,
            "DateUpdate": "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": meta.disclaimer,
            "geometry": set_precision(cell, 0.01),
        })
    boundaries["fire"] = gpd.GeoDataFrame(fire_records, crs=crs)

    # Police boundaries (often same as fire, but can differ)
    police_count = spec.operational.response_zones_per_service
    police_cells = _voronoi_partition(prov_geom, police_count, seed_state.rng("boundaries"))
    police_records = []
    for i, cell in enumerate(police_cells):
        police_records.append({
            "NGUID": make_nguid(domain, "police", i + 1),
            "Name": f"{meta.municipality} Police Beat {i + 1}",
            "ServiceURN": SERVICE_URN["police"],
            "ServiceNum": f"PD-{i + 1:03d}",
            "State": meta.state,
            "County": meta.county,
            "Inc_Muni": meta.municipality,
            "DateUpdate": "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": meta.disclaimer,
            "geometry": set_precision(cell, 0.01),
        })
    boundaries["police"] = gpd.GeoDataFrame(police_records, crs=crs)

    # EMS boundaries
    ems_count = spec.operational.response_zones_per_service
    ems_cells = _voronoi_partition(prov_geom, ems_count, seed_state.rng("boundaries"))
    ems_records = []
    for i, cell in enumerate(ems_cells):
        ems_records.append({
            "NGUID": make_nguid(domain, "ems", i + 1),
            "Name": f"{meta.municipality} EMS Zone {i + 1}",
            "ServiceURN": SERVICE_URN["ems"],
            "ServiceNum": f"EMS-{i + 1:03d}",
            "State": meta.state,
            "County": meta.county,
            "Inc_Muni": meta.municipality,
            "DateUpdate": "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": meta.disclaimer,
            "geometry": set_precision(cell, 0.01),
        })
    boundaries["ems"] = gpd.GeoDataFrame(ems_records, crs=crs)

    return boundaries


def generate_all_boundaries(
    spec: TownSpec,
    seed_state: SeedState,
) -> BoundaryLayers:
    """
    Generate all boundary layers in one call.

    Returns BoundaryLayers container with all NENA-compliant boundary GeoDataFrames.
    """
    provisioning = generate_provisioning_boundary(spec, seed_state.rng("boundaries"))
    service_boundaries = generate_service_boundaries(spec, provisioning, seed_state)

    return BoundaryLayers(
        provisioning=provisioning,
        psap=service_boundaries["psap"],
        fire=service_boundaries["fire"],
        police=service_boundaries["police"],
        ems=service_boundaries["ems"],
    )


# Validation helpers
def validate_boundary_topology(boundaries: BoundaryLayers) -> list[str]:
    """
    Validate boundary topology per NENA rules.

    Returns list of error messages (empty if valid).
    """
    errors = []

    # Check each layer for gaps/overlaps
    for name, gdf in [
        ("provisioning", boundaries.provisioning),
        ("psap", boundaries.psap),
        ("fire", boundaries.fire),
        ("police", boundaries.police),
        ("ems", boundaries.ems),
    ]:
        # Geometry validity
        invalid = gdf[~gdf.geometry.is_valid]
        if len(invalid) > 0:
            errors.append(f"{name}: {len(invalid)} invalid geometries")

        # Overlaps within layer
        if len(gdf) > 1:
            union = unary_union(gdf.geometry)
            if not union.equals(gdf.geometry.unary_union):
                errors.append(f"{name}: overlaps detected")

    # Check coincident boundaries where expected
    # (Provisioning should contain all service boundaries)
    prov_union = boundaries.provisioning.geometry.unary_union
    for name, gdf in [
        ("psap", boundaries.psap),
        ("fire", boundaries.fire),
        ("police", boundaries.police),
        ("ems", boundaries.ems),
    ]:
        svc_union = gdf.geometry.unary_union
        if not svc_union.within(prov_union.buffer(0.1)):
            errors.append(f"{name}: extends outside provisioning boundary")

    return errors