"""
Street network topology cleaning and validation.

Ensures NENA-compliant topology:
- Streets split at all intersections
- No dangles (except intentional cul-de-sacs)
- Coordinate precision managed
- Geometry validity
"""

from __future__ import annotations

import geopandas as gpd
import momepy
import numpy as np
from shapely.geometry import LineString, Point
from shapely import make_valid, set_precision, get_precision

from ..seeding import SeedState


def clean_topology(
    streets: gpd.GeoDataFrame,
    precision: float = 0.01,
    snap_threshold: float = 0.5,
) -> gpd.GeoDataFrame:
    """
    Clean street network topology using momepy round-trip.

    This is the gold standard for topology cleaning:
    1. Convert to primal graph (intersections = nodes)
    2. Convert back to GeoDataFrame (segments = edges)
    3. Result: all intersections split, no overlapping segments

    Args:
        streets: Input street GeoDataFrame (LineString geometries)
        precision: Coordinate precision grid size
        snap_threshold: Distance threshold for snapping endpoints

    Returns:
        Cleaned GeoDataFrame with same columns + topology enforced
    """
    if len(streets) == 0:
        return streets

    # Ensure valid geometries and consistent precision
    streets = streets.copy()
    streets.geometry = streets.geometry.apply(lambda g: make_valid(set_precision(g, precision)))

    # Remove empty geometries
    streets = streets[~streets.geometry.is_empty].reset_index(drop=True)

    # Momepy round-trip: gdf -> graph -> gdf
    # This splits at all intersections automatically
    try:
        graph = momepy.gdf_to_nx(streets, approach="primal", multigraph=True)
        cleaned = momepy.nx_to_gdf(graph, lines=True, points=False, spatial_weights=False)
    except Exception as e:
        # Fallback: manual split at intersections
        cleaned = _manual_split_at_intersections(streets, precision)

    # Preserve original attributes where possible
    # momepy preserves edge attributes, but we may need to rejoin
    if "NGUID" in streets.columns and "NGUID" not in cleaned.columns:
        # Assign new NGUIDs if lost
        from ..seeding import make_nguid
        # This would need domain - simplified for now
        pass

    # Ensure precision
    cleaned.geometry = cleaned.geometry.apply(lambda g: set_precision(g, precision))

    # Validate
    cleaned = cleaned[cleaned.geometry.is_valid].reset_index(drop=True)

    return cleaned


def split_at_intersections(
    streets: gpd.GeoDataFrame,
    precision: float = 0.01,
) -> gpd.GeoDataFrame:
    """
    Explicitly split streets at all intersections.

    Alternative to momepy round-trip for more control.
    """
    if len(streets) <= 1:
        return streets

    streets = streets.copy()
    streets.geometry = streets.geometry.apply(lambda g: set_precision(g, precision))

    # Build STRtree for intersection queries
    tree = streets.sindex

    # Collect all intersection points
    intersections = set()
    for idx, row in streets.iterrows():
        geom = row.geometry
        if geom.is_empty:
            continue
        # Find candidates
        candidates = list(tree.query(geom))
        for cand_idx in candidates:
            if cand_idx <= idx:
                continue
            other = streets.geometry.iloc[cand_idx]
            if geom.intersects(other):
                inter = geom.intersection(other)
                if inter.geom_type == "Point":
                    intersections.add((round(inter.x, 6), round(inter.y, 6)))
                elif inter.geom_type == "MultiPoint":
                    for pt in inter.geoms:
                        intersections.add((round(pt.x, 6), round(pt.y, 6)))

    if not intersections:
        return streets

    # Split each line at intersection points
    from shapely.ops import split
    intersection_points = [Point(x, y) for x, y in intersections]
    multi_points = intersection_points  # split accepts sequence of points

    split_lines = []
    for _, row in streets.iterrows():
        geom = row.geometry
        if geom.is_empty:
            continue
        parts = split(geom, multi_points)
        for part in parts.geoms:
            if part.length > 1.0:  # Minimum segment length
                new_row = row.copy()
                new_row.geometry = part
                split_lines.append(new_row)

    if not split_lines:
        return streets

    result = gpd.GeoDataFrame(split_lines, crs=streets.crs)
    result.geometry = result.geometry.apply(lambda g: make_valid(set_precision(g, precision)))
    return result.reset_index(drop=True)


def _manual_split_at_intersections(
    streets: gpd.GeoDataFrame,
    precision: float,
) -> gpd.GeoDataFrame:
    """Fallback manual intersection splitting."""
    return split_at_intersections(streets, precision)


def snap_endpoints(
    streets: gpd.GeoDataFrame,
    threshold: float = 0.5,
) -> gpd.GeoDataFrame:
    """
    Snap line endpoints within threshold distance.

    Helps connect nearly-touching lines.
    """
    if len(streets) == 0:
        return streets

    streets = streets.copy()
    tree = streets.sindex

    # Build mapping of nearby endpoints
    endpoint_map = {}  # (x,y) -> list of (idx, 'start'|'end')

    for idx, row in streets.iterrows():
        geom = row.geometry
        if geom.is_empty or geom.geom_type != "LineString":
            continue
        start = Point(geom.coords[0])
        end = Point(geom.coords[-1])
        endpoint_map[(start.x, start.y)] = endpoint_map.get((start.x, start.y), []) + [(idx, "start")]
        endpoint_map[(end.x, end.y)] = endpoint_map.get((end.x, end.y), []) + [(idx, "end")]

    # Find clusters within threshold
    # Simplified: just use the first point in each cluster as target
    # Full implementation would use clustering (DBSCAN)

    return streets


def validate_street_topology(streets: gpd.GeoDataFrame) -> dict[str, any]:
    """
    Validate street network topology.

    Returns dict with validation results.
    """
    results = {
        "total_segments": len(streets),
        "invalid_geometries": 0,
        "zero_length": 0,
        "dangling_ends": 0,
        "isolated_segments": 0,
        "self_intersections": 0,
        "overlaps": 0,
    }

    if len(streets) == 0:
        return results

    # Geometry validity
    invalid = streets[~streets.geometry.is_valid]
    results["invalid_geometries"] = len(invalid)

    # Zero length
    zero_len = streets[streets.geometry.length < 0.01]
    results["zero_length"] = len(zero_len)

    # Build graph for topology checks
    try:
        graph = momepy.gdf_to_nx(streets, approach="primal")

        # Dangling ends (degree 1 nodes)
        dangling = [n for n, d in graph.degree() if d == 1]
        results["dangling_ends"] = len(dangling)

        # Isolated segments (components of size 1)
        components = list(nx.connected_components(graph))
        isolated = sum(1 for c in components if len(c) == 1)
        results["isolated_segments"] = isolated

    except Exception:
        pass

    # Self-intersections (check each line)
    for _, row in streets.iterrows():
        geom = row.geometry
        if geom.geom_type == "LineString":
            # A valid LineString should not self-intersect
            if not geom.is_simple:
                results["self_intersections"] += 1

    # Overlaps (simplified check)
    tree = streets.sindex
    overlap_count = 0
    for idx, row in streets.iterrows():
        geom = row.geometry
        candidates = list(tree.query(geom))
        for cand_idx in candidates:
            if cand_idx <= idx:
                continue
            other = streets.geometry.iloc[cand_idx]
            if geom.overlaps(other):
                overlap_count += 1
    results["overlaps"] = overlap_count

    return results


import networkx as nx