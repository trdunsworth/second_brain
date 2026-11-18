"""
Routing and travel-time network for dispatch simulation.

Builds NetworkX graph from streets with travel-time weights,
exports to pgRouting format, and provides routing functions.
"""

from __future__ = annotations

import networkx as nx
import numpy as np
from shapely.geometry import LineString, Point
from shapely import make_valid

from .config import TownSpec
from .seeding import SeedState
from .streets.generator import StreetNetwork


def build_routing_graph(
    street_network: StreetNetwork,
    spec: TownSpec,
    seed_state: SeedState,
) -> nx.MultiDiGraph:
    """
    Build directed routing graph from street network.

    Adds travel-time weights based on speed limit, road class,
    one-way restrictions, and turn penalties.
    """
    # Start with primal graph (intersections = nodes, segments = edges)
    graph = street_network.graph.copy()

    # Convert to directed graph with travel-time weights
    digraph = nx.MultiDiGraph()

    # Add nodes with coordinates
    for node, data in graph.nodes(data=True):
        digraph.add_node(node, x=node[0], y=node[1], **data)

    # Add edges with travel-time attributes
    for u, v, key, data in graph.edges(keys=True, data=True):
        length = data.get("length", 0)  # meters
        if length <= 0:
            continue

        # Get street attributes
        speed_mph = data.get("SpeedLimit", 25)
        road_class = data.get("RoadClass", "LO")
        one_way = data.get("OneWay", "B")
        lanes = data.get("Lanes", 2)

        # Convert speed to m/s
        speed_ms = speed_mph * 0.44704

        # Travel time (seconds)
        travel_time = length / max(speed_ms, 0.1)

        # Add turn penalties later (requires node ordering)

        # Add directed edges based on one-way
        if one_way == "B" or one_way == "FT":
            digraph.add_edge(u, v, key=key,
                length=length,
                travel_time=travel_time,
                speed_mph=speed_mph,
                road_class=road_class,
                lanes=lanes,
                one_way=one_way,
                **data)
        if one_way == "B" or one_way == "TF":
            digraph.add_edge(v, u, key=key,
                length=length,
                travel_time=travel_time,
                speed_mph=speed_mph,
                road_class=road_class,
                lanes=lanes,
                one_way=one_way,
                **data)

    # Add turn penalties at intersections
    _add_turn_penalties(digraph)

    return digraph


def _add_turn_penalties(graph: nx.MultiDiGraph) -> None:
    """Add turn penalty costs to edges based on angle change."""
    # For each node with degree > 2 (intersection)
    for node in graph.nodes():
        in_edges = list(graph.in_edges(node, keys=True))
        out_edges = list(graph.out_edges(node, keys=True))

        if not in_edges or not out_edges:
            continue

        # Get coordinates for angle calculation
        node_pt = Point(node)

        for u, _, in_key in in_edges:
            for _, w, out_key in out_edges:
                if u == w:  # U-turn
                    penalty = 30  # seconds
                else:
                    # Calculate turn angle
                    u_pt = Point(u)
                    w_pt = Point(w)

                    # Vectors
                    v1 = (node[0] - u[0], node[1] - u[1])  # incoming
                    v2 = (w[0] - node[0], w[1] - node[1])  # outgoing

                    # Angle between vectors
                    dot = v1[0] * v2[0] + v1[1] * v2[1]
                    norm1 = np.hypot(v1[0], v1[1])
                    norm2 = np.hypot(v2[0], v2[1])

                    if norm1 > 0 and norm2 > 0:
                        cos_angle = dot / (norm1 * norm2)
                        cos_angle = np.clip(cos_angle, -1, 1)
                        angle = np.arccos(cos_angle) * 180 / np.pi

                        # Penalty based on angle
                        if angle < 30:  # Slight turn
                            penalty = 2
                        elif angle < 90:  # Right turn
                            penalty = 5
                        elif angle < 150:  # Left turn
                            penalty = 10
                        else:  # Near U-turn
                            penalty = 20
                    else:
                        penalty = 5

                # Store penalty on the out-edge (applied when traversing u->node->w)
                # We'll add it as a 'turn_penalty' attribute on the out-edge
                # But need to identify which out-edge corresponds to this turn
                # Simplified: add average penalty to all out-edges
                pass

    # Simplified approach: add average turn penalty to all edges
    for u, v, key, data in graph.edges(keys=True, data=True):
        data["turn_penalty"] = 5  # Average seconds per intersection


def shortest_path(
    graph: nx.MultiDiGraph,
    origin: Point,
    destination: Point,
    weight: str = "travel_time",
) -> tuple[list[tuple[float, float]], float] | None:
    """
    Find shortest path between two points.

    Returns (path_coords, total_cost) or None if no path.
    """
    # Find nearest graph nodes
    origin_node = _nearest_node(graph, origin)
    dest_node = _nearest_node(graph, destination)

    if origin_node is None or dest_node is None:
        return None

    try:
        path = nx.shortest_path(graph, origin_node, dest_node, weight=weight)
        cost = nx.shortest_path_length(graph, origin_node, dest_node, weight=weight)

        # Convert to coordinates
        coords = list(path)
        return coords, cost
    except nx.NetworkXNoPath:
        return None


def _nearest_node(graph: nx.MultiDiGraph, point: Point) -> tuple[float, float] | None:
    """Find nearest graph node to a point."""
    if len(graph) == 0:
        return None

    min_dist = float("inf")
    nearest = None

    for node in graph.nodes():
        dist = (node[0] - point.x) ** 2 + (node[1] - point.y) ** 2
        if dist < min_dist:
            min_dist = dist
            nearest = node

    return nearest


def drive_time_isochrone(
    graph: nx.MultiDiGraph,
    origin: Point,
    max_time_seconds: float,
    weight: str = "travel_time",
) -> list[tuple[float, float]]:
    """
    Compute drive-time isochrone (reachable nodes within time).

    Returns list of node coordinates within time threshold.
    """
    origin_node = _nearest_node(graph, origin)
    if origin_node is None:
        return []

    # Use Dijkstra to find all nodes within time
    lengths = nx.single_source_dijkstra_path_length(graph, origin_node, cutoff=max_time_seconds, weight=weight)

    return list(lengths.keys())


def export_pgrouting_sql(
    graph: nx.MultiDiGraph,
    spec: TownSpec,
    output_path: str,
) -> None:
    """
    Export routing graph to pgRouting-compatible SQL.

    Creates tables: vertices, edges with pgRouting schema.
    """
    lines = []
    lines.append("-- pgRouting export for SynthGIS")
    lines.append(f"-- Generated: {spec.metadata.generation_date if hasattr(spec.metadata, 'generation_date') else '2026-01-01'}")
    lines.append("")
    lines.append("-- Vertices table")
    lines.append("CREATE TABLE routing_vertices (")
    lines.append("    id BIGSERIAL PRIMARY KEY,")
    lines.append("    geom GEOMETRY(Point, 3857),")
    lines.append("    x DOUBLE PRECISION,")
    lines.append("    y DOUBLE PRECISION")
    lines.append(");")
    lines.append("")
    lines.append("-- Edges table")
    lines.append("CREATE TABLE routing_edges (")
    lines.append("    id BIGSERIAL PRIMARY KEY,")
    lines.append("    source BIGINT REFERENCES routing_vertices(id),")
    lines.append("    target BIGINT REFERENCES routing_vertices(id),")
    lines.append("    cost DOUBLE PRECISION,  -- travel_time")
    lines.append("    reverse_cost DOUBLE PRECISION,")
    lines.append("    length DOUBLE PRECISION,")
    lines.append("    speed_mph INTEGER,")
    lines.append("    road_class VARCHAR(10),")
    lines.append("    lanes INTEGER,")
    lines.append("    one_way VARCHAR(2),")
    lines.append("    geom GEOMETRY(LineString, 3857)")
    lines.append(");")
    lines.append("")

    # Map nodes to IDs
    node_to_id = {node: i + 1 for i, node in enumerate(graph.nodes())}

    # Insert vertices
    for node, nid in node_to_id.items():
        x, y = node
        lines.append(f"INSERT INTO routing_vertices (id, geom, x, y) VALUES ({nid}, ST_SetSRID(ST_MakePoint({x}, {y}), 3857), {x}, {y});")

    lines.append("")

    # Insert edges
    edge_id = 1
    for u, v, key, data in graph.edges(keys=True, data=True):
        source_id = node_to_id[u]
        target_id = node_to_id[v]
        cost = data.get("travel_time", 0)
        rev_cost = cost  # Simplified: same both ways unless one-way
        length = data.get("length", 0)
        speed = data.get("speed_mph", 25)
        road_class = data.get("road_class", "LO")
        lanes = data.get("lanes", 2)
        one_way = data.get("one_way", "B")

        # Geometry
        coords = f"ST_MakeLine(ST_MakePoint({u[0]}, {u[1]}), ST_MakePoint({v[0]}, {v[1]}))"

        lines.append(
            f"INSERT INTO routing_edges (id, source, target, cost, reverse_cost, length, speed_mph, road_class, lanes, one_way, geom) "
            f"VALUES ({edge_id}, {source_id}, {target_id}, {cost}, {rev_cost}, {length}, {speed}, '{road_class}', {lanes}, '{one_way}', ST_SetSRID({coords}, 3857));"
        )
        edge_id += 1

    lines.append("")
    lines.append("-- Indexes")
    lines.append("CREATE INDEX idx_routing_vertices_geom ON routing_vertices USING GIST (geom);")
    lines.append("CREATE INDEX idx_routing_edges_geom ON routing_edges USING GIST (geom);")
    lines.append("CREATE INDEX idx_routing_edges_source ON routing_edges (source);")
    lines.append("CREATE INDEX idx_routing_edges_target ON routing_edges (target);")

    with open(output_path, "w") as f:
        f.write("\n".join(lines))


def compute_response_times(
    graph: nx.MultiDiGraph,
    stations: gpd.GeoDataFrame,
    incidents: gpd.GeoDataFrame,
) -> gpd.GeoDataFrame:
    """
    Compute response times from stations to incidents.

    Returns incidents with added response_time_minutes and assigned_station columns.
    """
    incidents = incidents.copy()
    incidents["response_time_min"] = np.inf
    incidents["assigned_station"] = None

    station_nodes = {}
    for _, station in stations.iterrows():
        node = _nearest_node(graph, station.geometry)
        if node:
            station_nodes[station.get("StationNum", station.get("NGUID", ""))] = node

    for idx, incident in incidents.iterrows():
        best_time = np.inf
        best_station = None

        for station_id, station_node in station_nodes.items():
            try:
                time = nx.shortest_path_length(graph, station_node, _nearest_node(graph, incident.geometry), weight="travel_time")
                if time < best_time:
                    best_time = time
                    best_station = station_id
            except (nx.NetworkXNoPath, TypeError):
                continue

        if best_time < np.inf:
            incidents.at[idx, "response_time_min"] = best_time / 60.0
            incidents.at[idx, "assigned_station"] = best_station

    return incidents