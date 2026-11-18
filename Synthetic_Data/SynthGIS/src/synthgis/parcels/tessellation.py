"""
Morphological tessellation and block generation using momepy.

Creates block polygons from street network and generates
morphological tessellation cells for building placement.
"""

from __future__ import annotations

import geopandas as gpd
import momepy
import numpy as np
from shapely.geometry import Polygon, MultiPolygon, box
from shapely.ops import polygonize, unary_union
from shapely import make_valid, set_precision

from ..config import TownSpec
from ..seeding import SeedState


def blocks_from_streets(
    streets: gpd.GeoDataFrame,
    extent: gpd.GeoDataFrame | None = None,
    precision: float = 0.01,
) -> gpd.GeoDataFrame:
    """
    Generate block polygons from street centerlines.

    Uses shapely.ops.polygonize on noded street network.
    """
    if len(streets) == 0:
        return gpd.GeoDataFrame(columns=["geometry", "block_id"], crs=streets.crs)

    # Ensure clean topology first
    from ..streets.topology import clean_topology
    streets = clean_topology(streets, precision=precision)

    # Extract line geometries
    lines = [geom for geom in streets.geometry if not geom.is_empty and geom.geom_type in ("LineString", "MultiLineString")]

    # Explode MultiLineStrings
    simple_lines = []
    for line in lines:
        if line.geom_type == "MultiLineString":
            simple_lines.extend(list(line.geoms))
        else:
            simple_lines.append(line)

    # Polygonize
    polygons = list(polygonize(simple_lines))

    # Filter and clean
    blocks = []
    extent_geom = extent.geometry.unary_union if extent is not None else None

    for i, poly in enumerate(polygons):
        poly = make_valid(poly)
        if poly.is_empty or poly.area < 100:
            continue

        # Clip to extent if provided
        if extent_geom is not None:
            poly = poly.intersection(extent_geom)
            if poly.is_empty or poly.area < 100:
                continue

        # Ensure polygon (not multipolygon)
        if poly.geom_type == "MultiPolygon":
            # Take largest part
            poly = max(poly.geoms, key=lambda g: g.area)

        poly = set_precision(poly, precision)
        blocks.append({"geometry": poly, "block_id": i})

    if not blocks:
        return gpd.GeoDataFrame(columns=["geometry", "block_id"], crs=streets.crs)

    gdf = gpd.GeoDataFrame(blocks, crs=streets.crs)
    gdf["block_area"] = gdf.geometry.area
    gdf["block_perimeter"] = gdf.geometry.length

    return gdf.reset_index(drop=True)


def generate_morphological_tessellation(
    buildings: gpd.GeoDataFrame,
    streets: gpd.GeoDataFrame,
    buffer_m: float = 50,
    precision: float = 0.01,
) -> gpd.GeoDataFrame:
    """
    Generate morphological tessellation using momepy.

    Creates Voronoi-like cells around buildings, clipped to street network.
    This is the standard approach for urban morphology analysis.
    """
    if len(buildings) == 0:
        return gpd.GeoDataFrame(columns=["geometry", "cell_id"], crs=buildings.crs)

    # Ensure valid geometries
    buildings = buildings.copy()
    buildings.geometry = buildings.geometry.apply(lambda g: make_valid(set_precision(g, precision)))

    # Generate tessellation
    try:
        limit = momepy.buffered_limit(buildings, buffer=buffer_m)
        tessellation = momepy.morphological_tessellation(buildings, clip=limit)
    except Exception:
        # Fallback: simple Voronoi
        tessellation = _voronoi_tessellation(buildings, streets, buffer_m)

    # Add street index (nearest street)
    try:
        tessellation["street_index"] = momepy.get_network_id(tessellation, streets, "geometry")
    except Exception:
        tessellation["street_index"] = -1

    # Add morphometric attributes
    tessellation["cell_area"] = tessellation.geometry.area
    tessellation["cell_perimeter"] = tessellation.geometry.length

    return tessellation.reset_index(drop=True)


def _voronoi_tessellation(
    buildings: gpd.GeoDataFrame,
    streets: gpd.GeoDataFrame,
    buffer_m: float,
) -> gpd.GeoDataFrame:
    """Fallback Voronoi tessellation using shapely."""
    from shapely.ops import voronoi_diagram
    from shapely.geometry import MultiPoint

    # Get building centroids
    centroids = [geom.centroid for geom in buildings.geometry if not geom.is_empty]
    if len(centroids) < 2:
        # Single building: return buffered building as cell
        cells = [geom.buffer(buffer_m) for geom in buildings.geometry]
    else:
        points = MultiPoint(centroids)
        # Clip to street network envelope
        envelope = streets.geometry.unary_union.envelope
        voronoi = voronoi_diagram(points, envelope=envelope.buffer(buffer_m))
        cells = list(voronoi.geoms)

    # Match cells to buildings
    tess_data = []
    for i, (building, cell) in enumerate(zip(buildings.geometry, cells)):
        cell = make_valid(cell)
        tess_data.append({
            "geometry": cell,
            "cell_id": i,
            "building_id": i,
        })

    return gpd.GeoDataFrame(tess_data, crs=buildings.crs)


def tessellation_to_parcels(
    tessellation: gpd.GeoDataFrame,
    streets: gpd.GeoDataFrame,
    setback_m: float = 5.0,
) -> gpd.GeoDataFrame:
    """
    Convert tessellation cells to parcels by applying setbacks.

    Each cell is inset by setback distance to create buildable area.
    """
    parcels = []
    for _, cell in tessellation.iterrows():
        geom = cell.geometry
        if geom.is_empty:
            continue

        # Inset by setback
        buildable = geom.buffer(-setback_m)
        if buildable.is_empty or buildable.area < 50:
            continue

        parcels.append({
            "geometry": buildable,
            "cell_id": cell.get("cell_id", len(parcels)),
            "setback_m": setback_m,
            "buildable_area": buildable.area,
        })

    if not parcels:
        return gpd.GeoDataFrame(columns=["geometry", "cell_id"], crs=tessellation.crs)

    return gpd.GeoDataFrame(parcels, crs=tessellation.crs)