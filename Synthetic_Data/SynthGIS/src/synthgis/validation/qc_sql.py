"""
NENA QC SQL Checks for PostGIS validation.

These queries implement the NENA-STA-006.3 required quality checks.
Run against a PostGIS database loaded with SynthGIS data.
"""

from __future__ import annotations

from typing import Any

# Core NENA QC Checks
QC_CHECKS: dict[str, str] = {
    # Geometry validity
    "rcl_geometry_valid": """
        SELECT rcl_id, nguid, street_name
        FROM ng911_road_centerlines
        WHERE NOT ST_IsValid(geom);
    """,
    "ssap_geometry_valid": """
        SELECT point_id, nguid, address_number, street_name
        FROM ng911_address_points
        WHERE NOT ST_IsValid(geom);
    """,
    "boundary_geometry_valid": """
        SELECT layer, nguid
        FROM (
            SELECT 'psap' as layer, nguid, geom FROM ng911_psap_polygon
            UNION ALL SELECT 'fire', nguid, geom FROM ng911_fire_polygon
            UNION ALL SELECT 'police', nguid, geom FROM ng911_police_polygon
            UNION ALL SELECT 'ems', nguid, geom FROM ng911_ems_polygon
            UNION ALL SELECT 'provisioning', nguid, geom FROM ng911_provisioning_polygon
        ) b
        WHERE NOT ST_IsValid(geom);
    """,

    # Duplicate NGUIDs
    "rcl_duplicate_nguid": """
        SELECT nguid, COUNT(*) as cnt
        FROM ng911_road_centerlines
        GROUP BY nguid HAVING COUNT(*) > 1;
    """,
    "ssap_duplicate_nguid": """
        SELECT nguid, COUNT(*) as cnt
        FROM ng911_address_points
        GROUP BY nguid HAVING COUNT(*) > 1;
    """,
    "boundary_duplicate_nguid": """
        SELECT layer, nguid, COUNT(*) as cnt
        FROM (
            SELECT 'psap' as layer, nguid FROM ng911_psap_polygon
            UNION ALL SELECT 'fire', nguid FROM ng911_fire_polygon
            UNION ALL SELECT 'police', nguid FROM ng911_police_polygon
            UNION ALL SELECT 'ems', nguid FROM ng911_ems_polygon
            UNION ALL SELECT 'provisioning', nguid FROM ng911_provisioning_polygon
        ) b
        GROUP BY layer, nguid HAVING COUNT(*) > 1;
    """,

    # Address range direction & parity
    "rcl_address_range_direction": """
        SELECT rcl_id, nguid, street_name,
               from_address_left, to_address_left,
               from_address_right, to_address_right
        FROM ng911_road_centerlines
        WHERE from_address_left > to_address_left
           OR from_address_right > to_address_right;
    """,
    "rcl_parity_consistency": """
        SELECT rcl_id, nguid, street_name,
               parity_left, from_address_left, to_address_left,
               parity_right, from_address_right, to_address_right
        FROM ng911_road_centerlines
        WHERE (parity_left = 'E' AND (from_address_left % 2 <> 0 OR to_address_left % 2 <> 0))
           OR (parity_left = 'O' AND (from_address_left % 2 = 0 OR to_address_left % 2 = 0))
           OR (parity_right = 'E' AND (from_address_right % 2 <> 0 OR to_address_right % 2 <> 0))
           OR (parity_right = 'O' AND (from_address_right % 2 = 0 OR to_address_right % 2 = 0));
    """,

    # Address point placement
    "ssap_near_street": """
        SELECT a.point_id, a.nguid, a.address_number, a.street_name,
               ST_Distance(a.geom, r.geom) as distance_m
        FROM ng911_address_points a
        LEFT JOIN LATERAL (
            SELECT geom FROM ng911_road_centerlines r
            WHERE r.street_name = a.street_name
              AND (r.inc_muni = a.inc_muni OR r.inc_muni IS NULL OR a.inc_muni IS NULL)
            ORDER BY ST_Distance(a.geom, r.geom)
            LIMIT 1
        ) r ON true
        WHERE r.geom IS NULL
           OR ST_Distance(a.geom, r.geom) > 100.0;
    """,
    "ssap_parity_match": """
        SELECT a.point_id, a.nguid, a.address_number, a.street_name,
               r.parity_left, r.parity_right,
               ST_Azimuth(ST_StartPoint(r.geom), ST_EndPoint(r.geom)) as street_azimuth
        FROM ng911_address_points a
        JOIN ng911_road_centerlines r
          ON r.street_name = a.street_name
         AND ST_DWithin(a.geom, r.geom, 50.0)
        WHERE (ST_Azimuth(ST_StartPoint(r.geom), ST_EndPoint(r.geom)) < 3.14159
               AND a.address_number % 2 = 0 AND r.parity_left = 'O')
           OR (ST_Azimuth(ST_StartPoint(r.geom), ST_EndPoint(r.geom)) >= 3.14159
               AND a.address_number % 2 = 0 AND r.parity_right = 'O')
           OR (ST_Azimuth(ST_StartPoint(r.geom), ST_EndPoint(r.geom)) < 3.14159
               AND a.address_number % 2 = 1 AND r.parity_left = 'E')
           OR (ST_Azimuth(ST_StartPoint(r.geom), ST_EndPoint(r.geom)) >= 3.14159
               AND a.address_number % 2 = 1 AND r.parity_right = 'E');
    """,

    # Boundary topology
    "boundary_gaps_provisioning": """
        -- Check for gaps in provisioning boundary coverage
        SELECT ST_IsValid(ST_Union(geom)) as is_valid,
               ST_Area(ST_Union(geom)) as total_area,
               ST_NRings(ST_Union(geom)) as num_rings
        FROM ng911_provisioning_polygon;
    """,
    "boundary_overlaps": """
        SELECT a.layer, a.nguid as nguid_a, b.nguid as nguid_b,
               ST_Area(ST_Intersection(a.geom, b.geom)) as overlap_area
        FROM (
            SELECT 'psap' as layer, nguid, geom FROM ng911_psap_polygon
            UNION ALL SELECT 'fire', nguid, geom FROM ng911_fire_polygon
            UNION ALL SELECT 'police', nguid, geom FROM ng911_police_polygon
            UNION ALL SELECT 'ems', nguid, geom FROM ng911_ems_polygon
        ) a
        JOIN (
            SELECT 'psap' as layer, nguid, geom FROM ng911_psap_polygon
            UNION ALL SELECT 'fire', nguid, geom FROM ng911_fire_polygon
            UNION ALL SELECT 'police', nguid, geom FROM ng911_police_polygon
            UNION ALL SELECT 'ems', nguid, geom FROM ng911_ems_polygon
        ) b
          ON a.layer = b.layer
         AND a.nguid < b.nguid
         AND ST_Overlaps(a.geom, b.geom);
    """,
    "boundary_service_within_provisioning": """
        SELECT b.layer, b.nguid,
               ST_Area(ST_Difference(b.geom, p.geom)) as outside_area
        FROM (
            SELECT 'psap' as layer, nguid, geom FROM ng911_psap_polygon
            UNION ALL SELECT 'fire', nguid, geom FROM ng911_fire_polygon
            UNION ALL SELECT 'police', nguid, geom FROM ng911_police_polygon
            UNION ALL SELECT 'ems', nguid, geom FROM ng911_ems_polygon
        ) b
        CROSS JOIN (
            SELECT ST_Union(geom) as geom FROM ng911_provisioning_polygon
        ) p
        WHERE NOT ST_Within(b.geom, p.geom);
    """,

    # Centerline topology
    "rcl_disconnected_segments": """
        SELECT r.rcl_id, r.nguid, r.street_name
        FROM ng911_road_centerlines r
        WHERE NOT EXISTS (
            SELECT 1 FROM ng911_road_centerlines o
            WHERE r.rcl_id <> o.rcl_id
              AND (ST_Touches(r.geom, o.geom)
                   OR ST_DWithin(ST_StartPoint(r.geom), o.geom, 0.1)
                   OR ST_DWithin(ST_EndPoint(r.geom), o.geom, 0.1))
        );
    """,
    "rcl_dangling_deadends": """
        -- Dead ends that are not cul-de-sacs
        SELECT r.rcl_id, r.nguid, r.street_name, r.road_class
        FROM ng911_road_centerlines r
        WHERE r.road_class NOT IN ('LO', 'PV')
          AND (
              NOT EXISTS (SELECT 1 FROM ng911_road_centerlines o WHERE ST_Touches(ST_StartPoint(r.geom), o.geom) AND r.rcl_id <> o.rcl_id)
              OR
              NOT EXISTS (SELECT 1 FROM ng911_road_centerlines o WHERE ST_Touches(ST_EndPoint(r.geom), o.geom) AND r.rcl_id <> o.rcl_id)
          );
    """,
    "rcl_split_at_boundaries": """
        SELECT r.rcl_id, r.nguid, r.street_name, COUNT(*) as segment_count
        FROM ng911_road_centerlines r
        JOIN ng911_provisioning_polygon p ON ST_Intersects(r.geom, p.geom)
        GROUP BY r.rcl_id, r.nguid, r.street_name
        HAVING COUNT(*) = 1 AND ST_Crosses(r.geom, ST_Boundary(p.geom));
    """,

    # Required field completeness
    "rcl_required_fields": """
        SELECT rcl_id, nguid
        FROM ng911_road_centerlines
        WHERE nguid IS NULL
           OR street_name IS NULL
           OR state IS NULL
           OR county IS NULL
           OR dateupdate IS NULL
           OR geom IS NULL;
    """,
    "ssap_required_fields": """
        SELECT point_id, nguid
        FROM ng911_address_points
        WHERE nguid IS NULL
           OR address_number IS NULL
           OR street_name IS NULL
           OR state IS NULL
           OR county IS NULL
           OR dateupdate IS NULL
           OR geom IS NULL;
    """,
    "boundary_required_fields": """
        SELECT layer, nguid
        FROM (
            SELECT 'psap' as layer, nguid, name, serviceurn, state, county, dateupdate, geom FROM ng911_psap_polygon
            UNION ALL SELECT 'fire', nguid, name, serviceurn, state, county, dateupdate, geom FROM ng911_fire_polygon
            UNION ALL SELECT 'police', nguid, name, serviceurn, state, county, dateupdate, geom FROM ng911_police_polygon
            UNION ALL SELECT 'ems', nguid, name, serviceurn, state, county, dateupdate, geom FROM ng911_ems_polygon
            UNION ALL SELECT 'provisioning', nguid, name, serviceurn, state, county, dateupdate, geom FROM ng911_provisioning_polygon
        ) b
        WHERE nguid IS NULL
           OR name IS NULL
           OR serviceurn IS NULL
           OR state IS NULL
           OR county IS NULL
           OR dateupdate IS NULL
           OR geom IS NULL;
    """,

    # CLDXF field validation
    "rcl_clxdf_street_name_parts": """
        SELECT rcl_id, nguid, street_name,
               st_predir, st_pretyp, st_postyp, st_postdir
        FROM ng911_road_centerlines
        WHERE street_name IS NOT NULL
          AND (st_predir NOT IN ('N','S','E','W','NE','NW','SE','SW') OR st_predir IS NULL)
          AND (st_postyp NOT IN ('St','Ave','Blvd','Dr','Rd','Ln','Ct','Pl','Way','Trl','Cir','Loop','Byp','Pkwy','Expy','Fwy','Hwy','Tpke','Ter','Row','Walk','Path','Pass','Crossing','Xing') OR st_postyp IS NULL);
    """,

    # Address range gaps/overlaps
    "rcl_address_range_overlaps": """
        SELECT r1.rcl_id, r1.nguid, r1.street_name, r1.inc_muni,
               r1.from_address_left, r1.to_address_left,
               r2.rcl_id as rcl_id_2, r2.from_address_left as from_2, r2.to_address_left as to_2
        FROM ng911_road_centerlines r1
        JOIN ng911_road_centerlines r2
          ON r1.street_name = r2.street_name
         AND r1.inc_muni = r2.inc_muni
         AND r1.rcl_id < r2.rcl_id
         AND r1.from_address_left <= r2.to_address_left
         AND r1.to_address_left >= r2.from_address_left;
    """,

    # DateUpdate currency
    "all_layers_dateupdate_populated": """
        SELECT 'rcl' as layer, COUNT(*) as missing_dateupdate
        FROM ng911_road_centerlines WHERE dateupdate IS NULL
        UNION ALL
        SELECT 'ssap', COUNT(*) FROM ng911_address_points WHERE dateupdate IS NULL
        UNION ALL
        SELECT 'psap', COUNT(*) FROM ng911_psap_polygon WHERE dateupdate IS NULL
        UNION ALL
        SELECT 'fire', COUNT(*) FROM ng911_fire_polygon WHERE dateupdate IS NULL
        UNION ALL
        SELECT 'police', COUNT(*) FROM ng911_police_polygon WHERE dateupdate IS NULL
        UNION ALL
        SELECT 'ems', COUNT(*) FROM ng911_ems_polygon WHERE dateupdate IS NULL
        UNION ALL
        SELECT 'provisioning', COUNT(*) FROM ng911_provisioning_polygon WHERE dateupdate IS NULL;
    """,
}


def run_qc_checks(
    connection_string: str,
    checks: list[str] | None = None,
) -> dict[str, list[dict[str, Any]]]:
    """
    Run QC checks against a PostGIS database.

    Args:
        connection_string: SQLAlchemy connection string (postgresql://...)
        checks: List of check names to run (default: all)

    Returns:
        Dict mapping check name to list of result rows (empty = pass)
    """
    from sqlalchemy import create_engine, text

    engine = create_engine(connection_string)
    to_run = checks or list(QC_CHECKS.keys())
    results = {}

    with engine.connect() as conn:
        for name in to_run:
            if name not in QC_CHECKS:
                results[name] = [{"error": f"Unknown check: {name}"}]
                continue

            try:
                result = conn.execute(text(QC_CHECKS[name]))
                rows = [dict(row._mapping) for row in result]
                results[name] = rows
            except Exception as e:
                results[name] = [{"error": str(e), "query": QC_CHECKS[name]}]

    return results


def generate_qc_report(
    results: dict[str, list[dict[str, Any]]],
    output_path: str | None = None,
) -> str:
    """Generate human-readable QC report."""
    lines = []
    lines.append("=" * 60)
    lines.append("SynthGIS NENA QC Report")
    lines.append("=" * 60)
    lines.append("")

    total_checks = len(results)
    passed = sum(1 for r in results.values() if len(r) == 0)
    failed = total_checks - passed

    lines.append(f"Total Checks: {total_checks}")
    lines.append(f"Passed: {passed}")
    lines.append(f"Failed: {failed}")
    lines.append("")

    for name, rows in results.items():
        status = "PASS" if len(rows) == 0 else "FAIL"
        lines.append(f"[{status}] {name}")
        if rows:
            for row in rows[:5]:  # Show first 5 violations
                lines.append(f"  - {row}")
            if len(rows) > 5:
                lines.append(f"  ... and {len(rows) - 5} more")
        lines.append("")

    report = "\n".join(lines)

    if output_path:
        with open(output_path, "w") as f:
            f.write(report)

    return report