"""
Operational layers for CAD/Dispatch realism.

Generates:
- Fire/EMS/Police stations
- Response zones/beats
- Run cards (zone → apparatus mapping)
- Hospitals and other destinations
"""

from __future__ import annotations

import geopandas as gpd
import numpy as np
from shapely.geometry import Point, Polygon
from shapely import make_valid, set_precision

from .config import TownSpec
from .seeding import SeedState, make_nguid
from .streets.generator import StreetNetwork


def generate_stations(
    spec: TownSpec,
    streets: gpd.GeoDataFrame,
    boundaries: dict[str, gpd.GeoDataFrame],
    seed_state: SeedState,
) -> dict[str, gpd.GeoDataFrame]:
    """
    Generate fire, police, EMS stations.

    Places stations within their service boundaries,
    preferably near arterial streets.
    """
    rng = seed_state.rng("operational.stations")

    stations = {}

    # Fire stations
    stations["fire"] = _generate_service_stations(
        service="fire",
        count=spec.operational.fire_stations,
        boundary=boundaries["fire"],
        streets=streets,
        spec=spec,
        rng=rng,
    )

    # Police stations
    stations["police"] = _generate_service_stations(
        service="police",
        count=spec.operational.police_stations,
        boundary=boundaries["police"],
        streets=streets,
        spec=spec,
        rng=rng,
    )

    # EMS stations
    stations["ems"] = _generate_service_stations(
        service="ems",
        count=spec.operational.ems_stations,
        boundary=boundaries["ems"],
        streets=streets,
        spec=spec,
        rng=rng,
    )

    # Hospitals
    stations["hospital"] = _generate_hospitals(
        count=spec.operational.hospitals,
        boundary=boundaries["provisioning"],
        streets=streets,
        spec=spec,
        rng=rng,
    )

    return stations


def _generate_service_stations(
    service: str,
    count: int,
    boundary: gpd.GeoDataFrame,
    streets: gpd.GeoDataFrame,
    spec: TownSpec,
    rng: np.random.Generator,
) -> gpd.GeoDataFrame:
    """Generate stations for a specific service."""
    if len(boundary) == 0 or count <= 0:
        return gpd.GeoDataFrame(columns=["geometry", "station_id", "service"], crs=streets.crs)

    # Get boundary union
    boundary_union = boundary.geometry.unary_union

    # Prefer arterial streets for station placement
    arterials = streets[streets.get("RoadClass", "") == "SH"] if "RoadClass" in streets.columns else streets
    if len(arterials) == 0:
        arterials = streets

    # Generate candidate points along arterials within boundary
    candidates = []
    for _, street in arterials.iterrows():
        line = street.geometry
        if line.is_empty:
            continue
        # Sample points along line
        for i in range(max(1, int(line.length / 500))):
            frac = (i + 0.5) / max(1, int(line.length / 500) + 1)
            pt = line.interpolate(frac, normalized=True)
            if boundary_union.contains(pt):
                candidates.append(pt)

    if not candidates:
        # Fallback: random points in boundary
        bounds = boundary_union.bounds
        for _ in range(count * 10):
            x = rng.uniform(bounds[0], bounds[2])
            y = rng.uniform(bounds[1], bounds[3])
            pt = Point(x, y)
            if boundary_union.contains(pt):
                candidates.append(pt)

    # Select stations using k-means-like spacing (simplified: random sample)
    if len(candidates) <= count:
        selected = candidates
    else:
        selected = rng.choice(candidates, size=count, replace=False)

    # Create station records
    records = []
    for i, pt in enumerate(selected):
        records.append({
            "NGUID": make_nguid(spec.metadata.nguid_domain, f"{service}_station", i + 1),
            "StationName": f"{spec.metadata.municipality} {service.title()} Station {i + 1}",
            "StationNum": f"{service.upper()[:2]}-{i + 1:02d}",
            "ServiceType": service,
            "Address": f"{rng.integers(100, 9999)} {rng.choice(['Main', 'Oak', 'Pine', 'Maple'])} St",
            "City": spec.metadata.municipality,
            "State": spec.metadata.state,
            "Zip": f"{rng.integers(10000, 99999):05d}",
            "Phone": f"555-{rng.integers(100, 999):03d}-{rng.integers(1000, 9999):04d}",
            "Staffing": rng.choice(["Career", "Volunteer", "Combination"]),
            "Apparatus": _generate_apparatus_list(service, rng),
            "DateUpdate": "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": spec.metadata.disclaimer,
            "geometry": make_valid(set_precision(pt, 0.01)),
        })

    return gpd.GeoDataFrame(records, crs=streets.crs)


def _generate_hospitals(
    count: int,
    boundary: gpd.GeoDataFrame,
    streets: gpd.GeoDataFrame,
    spec: TownSpec,
    rng: np.random.Generator,
) -> gpd.GeoDataFrame:
    """Generate hospital locations."""
    if len(boundary) == 0 or count <= 0:
        return gpd.GeoDataFrame(columns=["geometry", "hospital_id"], crs=streets.crs)

    boundary_union = boundary.geometry.unary_union

    # Hospitals near major roads
    arterials = streets[streets.get("RoadClass", "").isin(["SH", "US", "I"])] if "RoadClass" in streets.columns else streets
    if len(arterials) == 0:
        arterials = streets

    candidates = []
    for _, street in arterials.iterrows():
        line = street.geometry
        for i in range(max(1, int(line.length / 1000))):
            frac = (i + 0.5) / max(1, int(line.length / 1000) + 1)
            pt = line.interpolate(frac, normalized=True)
            if boundary_union.contains(pt):
                candidates.append(pt)

    if not candidates:
        bounds = boundary_union.bounds
        for _ in range(count * 10):
            pt = Point(rng.uniform(bounds[0], bounds[2]), rng.uniform(bounds[1], bounds[3]))
            if boundary_union.contains(pt):
                candidates.append(pt)

    selected = rng.choice(candidates, size=min(count, len(candidates)), replace=False) if candidates else []

    records = []
    for i, pt in enumerate(selected):
        records.append({
            "NGUID": make_nguid(spec.metadata.nguid_domain, "hospital", i + 1),
            "HospitalName": f"{spec.metadata.municipality} Medical Center {i + 1}",
            "HospitalType": rng.choice(["General", "Trauma", "Specialty", "Critical Access"]),
            "TraumaLevel": rng.choice(["Level I", "Level II", "Level III", "Level IV", "None"]),
            "ED": rng.choice([True, False]),
            "Helipad": rng.choice([True, False]),
            "Address": f"{rng.integers(100, 9999)} {rng.choice(['Medical', 'Hospital', 'Health'])} Dr",
            "City": spec.metadata.municipality,
            "State": spec.metadata.state,
            "Zip": f"{rng.integers(10000, 99999):05d}",
            "Phone": f"555-{rng.integers(100, 999):03d}-{rng.integers(1000, 9999):04d}",
            "DateUpdate": "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": spec.metadata.disclaimer,
            "geometry": make_valid(set_precision(pt, 0.01)),
        })

    return gpd.GeoDataFrame(records, crs=streets.crs)


def _generate_apparatus_list(service: str, rng: np.random.Generator) -> str:
    """Generate comma-separated apparatus list for a station."""
    apparatus_by_service = {
        "fire": ["Engine", "Ladder", "Rescue", "Tanker", "Brush", "Medic", "Battalion Chief"],
        "police": ["Patrol", "Supervisor", "K9", "Traffic", "Detective", "SWAT"],
        "ems": ["Ambulance", "Medic", "Supervisor", "Mass Casualty", "Air"],
    }
    options = apparatus_by_service.get(service, ["Unit"])
    num = rng.integers(1, min(4, len(options) + 1))
    selected = rng.choice(options, size=num, replace=False)
    return ", ".join(selected)


def generate_response_zones(
    spec: TownSpec,
    boundaries: dict[str, gpd.GeoDataFrame],
    stations: dict[str, gpd.GeoDataFrame],
    streets: gpd.GeoDataFrame,
    seed_state: SeedState,
) -> dict[str, gpd.GeoDataFrame]:
    """
    Generate response zones/beats for each service.

    Zones are Voronoi partitions around stations within service boundaries.
    """
    rng = seed_state.rng("operational.zones")

    zones = {}

    for service in ["fire", "police", "ems"]:
        service_boundary = boundaries.get(service)
        service_stations = stations.get(service)

        if service_boundary is None or service_stations is None or len(service_stations) == 0:
            zones[service] = gpd.GeoDataFrame(columns=["geometry", "zone_id", "station_id"], crs=streets.crs)
            continue

        zones[service] = _voronoi_zones(
            stations=service_stations,
            boundary=service_boundary,
            service=service,
            spec=spec,
            rng=rng,
        )

    return zones


def _voronoi_zones(
    stations: gpd.GeoDataFrame,
    boundary: gpd.GeoDataFrame,
    service: str,
    spec: TownSpec,
    rng: np.random.Generator,
) -> gpd.GeoDataFrame:
    """Generate Voronoi zones around stations."""
    from shapely.ops import voronoi_diagram
    from shapely.geometry import MultiPoint

    station_points = [geom for geom in stations.geometry if not geom.is_empty]
    if len(station_points) <= 1:
        # Single station: whole boundary is one zone
        boundary_union = boundary.geometry.unary_union
        return gpd.GeoDataFrame([{
            "NGUID": make_nguid(spec.metadata.nguid_domain, f"{service}_zone", 1),
            "ZoneName": f"{spec.metadata.municipality} {service.title()} Zone 1",
            "ZoneNum": f"{service.upper()}-Z1",
            "StationID": stations.iloc[0].get("StationNum", f"{service.upper()}-01"),
            "ServiceType": service,
            "DateUpdate": "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": spec.metadata.disclaimer,
            "geometry": make_valid(boundary_union),
        }], crs=stations.crs)

    # Voronoi diagram
    points = MultiPoint([(p.x, p.y) for p in station_points])
    boundary_union = boundary.geometry.unary_union
    voronoi = voronoi_diagram(points, envelope=boundary_union)

    zones = []
    for i, cell in enumerate(voronoi.geoms):
        cell = cell.intersection(boundary_union)
        if cell.is_empty or cell.area < 1000:
            continue

        zones.append({
            "NGUID": make_nguid(spec.metadata.nguid_domain, f"{service}_zone", i + 1),
            "ZoneName": f"{spec.metadata.municipality} {service.title()} Zone {i + 1}",
            "ZoneNum": f"{service.upper()}-Z{i + 1}",
            "StationID": stations.iloc[i % len(stations)].get("StationNum", f"{service.upper()}-01"),
            "ServiceType": service,
            "DateUpdate": "2026-01-01",
            "DataSource": "SYNTHETIC",
            "Disclaimer": spec.metadata.disclaimer,
            "geometry": make_valid(cell),
        })

    return gpd.GeoDataFrame(zones, crs=stations.crs)


def generate_run_cards(
    spec: TownSpec,
    zones: dict[str, gpd.GeoDataFrame],
    stations: dict[str, gpd.GeoDataFrame],
    seed_state: SeedState,
) -> dict[str, gpd.GeoDataFrame]:
    """
    Generate run cards (zone → apparatus dispatch rules).

    Simple implementation: each zone maps to its station's apparatus
    plus mutual aid from adjacent zones.
    """
    rng = seed_state.rng("operational.run_cards")

    run_cards = {}

    for service in ["fire", "police", "ems"]:
        service_zones = zones.get(service)
        service_stations = stations.get(service)

        if service_zones is None or service_stations is None or len(service_zones) == 0:
            run_cards[service] = gpd.GeoDataFrame()
            continue

        records = []
        for _, zone in service_zones.iterrows():
            station_id = zone.get("StationID", "")
            station = service_stations[service_stations.get("StationNum", "") == station_id]

            apparatus = station.iloc[0].get("Apparatus", "") if len(station) > 0 else ""

            # First due
            records.append({
                "NGUID": make_nguid(spec.metadata.nguid_domain, f"{service}_runcard", len(records) + 1),
                "ZoneID": zone.get("ZoneNum", ""),
                "AlarmLevel": 1,
                "Apparatus": apparatus,
                "StationID": station_id,
                "ServiceType": service,
                "Order": 1,
                "DateUpdate": "2026-01-01",
                "DataSource": "SYNTHETIC",
                "Disclaimer": spec.metadata.disclaimer,
            })

            # Second due (mutual aid from adjacent zone)
            if rng.random() < 0.7:
                other_zones = service_zones[service_zones.get("ZoneNum", "") != zone.get("ZoneNum", "")]
                if len(other_zones) > 0:
                    other = other_zones.iloc[rng.integers(len(other_zones))]
                    other_station = other.get("StationID", "")
                    other_apparatus = ""
                    other_station_row = service_stations[service_stations.get("StationNum", "") == other_station]
                    if len(other_station_row) > 0:
                        other_apparatus = other_station_row.iloc[0].get("Apparatus", "")

                    records.append({
                        "NGUID": make_nguid(spec.metadata.nguid_domain, f"{service}_runcard", len(records) + 1),
                        "ZoneID": zone.get("ZoneNum", ""),
                        "AlarmLevel": 2,
                        "Apparatus": other_apparatus,
                        "StationID": other_station,
                        "ServiceType": service,
                        "Order": 2,
                        "DateUpdate": "2026-01-01",
                        "DataSource": "SYNTHETIC",
                        "Disclaimer": spec.metadata.disclaimer,
                    })

        run_cards[service] = gpd.GeoDataFrame(records) if records else gpd.GeoDataFrame()

    return run_cards


def generate_all_operational(
    spec: TownSpec,
    streets: gpd.GeoDataFrame,
    boundaries: dict[str, gpd.GeoDataFrame],
    seed_state: SeedState,
) -> dict[str, gpd.GeoDataFrame]:
    """Generate all operational layers."""
    stations = generate_stations(spec, streets, boundaries, seed_state)
    zones = generate_response_zones(spec, boundaries, stations, streets, seed_state)
    run_cards = generate_run_cards(spec, zones, stations, seed_state)

    return {
        **stations,
        **zones,
        **run_cards,
    }