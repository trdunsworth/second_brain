# Synthetic Town & NENA NG9-1-1 GIS Pipeline Blueprint

This document outlines the architecture, database schema, quality control rules, and Python export scripts for generating a deterministic, offline, cartographically accurate "synthetic town" compliant with **NENA NG9-1-1 GIS Data Model Standards (NENA-STA-006.2)** and **Civic Location Data Exchange Format (CLDXF)**.

---

## 1. Architecture Overview
To avoid runtime non-determinism from standard mock data generators (like `Faker`) and eliminate live external API reliance (like OpenStreetMap), this workflow uses a **Seed-Locked Procedural GIS Pipeline**:
1. **Deterministic Seeding:** Python's random and NumPy seeds lock the topology.
2. **Network Topology Graph:** Nodes and edges are generated and converted into closed polygon blocks using `momepy` and `Shapely`.
3. **Linear Referencing:** Address points are interpolated along street centerlines with side-of-street offsets.
4. **Persistence:** The spatial layers are stored in a self-contained, offline OGC GeoPackage (`.gpkg`) or a local PostgreSQL/PostGIS database.

---

## 2. PostGIS DDL Schema (NENA & CLDXF Compliant)

Run the following SQL script to create the core vector tables in PostGIS:

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. ROAD CENTERLINES (RCL) LAYER
CREATE TABLE ng911_road_centerlines (
    rcl_id SERIAL PRIMARY KEY,
    nguid VARCHAR(100) UNIQUE NOT NULL, -- NENA Globally Unique ID
    
    -- CLDXF Street Name Components
    street_pre_modifier VARCHAR(50),
    street_pre_directional VARCHAR(10),   -- e.g., N, S, E, W
    street_pre_type VARCHAR(50),          -- e.g., Old, Hwy
    street_pre_type_separator VARCHAR(10),
    street_name VARCHAR(100) NOT NULL,    -- e.g., "Main"
    street_post_type VARCHAR(50),         -- e.g., "St", "Ave", "Blvd"
    street_post_directional VARCHAR(10),  -- e.g., N, S
    street_post_modifier VARCHAR(50),
    
    -- Address Ranges (Left/Right Parity and Numbering)
    from_address_left INTEGER,
    to_address_left INTEGER,
    from_address_right INTEGER,
    to_address_right INTEGER,
    parity_left VARCHAR(10),              -- 'Even', 'Odd', 'Both', 'Zero'
    parity_right VARCHAR(10),
    
    -- Administrative Boundaries & Locality (CLDXF)
    state VARCHAR(2) NOT NULL,            -- e.g., "VA"
    county VARCHAR(100) NOT NULL,         -- e.g., "Essex"
    inc_muni VARCHAR(100),                -- Incorporated Municipality
    uninc_comm VARCHAR(100),              -- Unincorporated Community
    postal_code VARCHAR(10),
    
    -- Agency IDs
    agency_id_left VARCHAR(100),
    agency_id_right VARCHAR(100),
    
    -- Geometry (LineString)
    geom GEOMETRY(LineString, 3857) NOT NULL
);

-- 2. SITE / STRUCTURE ADDRESS POINTS LAYER
CREATE TABLE ng911_address_points (
    point_id SERIAL PRIMARY KEY,
    nguid VARCHAR(100) UNIQUE NOT NULL,
    
    -- Address Number Components (CLDXF)
    address_number INTEGER NOT NULL,      -- e.g., 1042
    addr_num_suffix VARCHAR(10),          -- e.g., "B", "1/2"
    
    -- Street Name Fields (Denormalized CLDXF components matching RCL)
    street_pre_directional VARCHAR(10),
    street_pre_type VARCHAR(50),
    street_name VARCHAR(100) NOT NULL,
    street_post_type VARCHAR(50),
    street_post_directional VARCHAR(10),
    
    -- Building, Unit, & Sub-address Details
    site_name VARCHAR(100),               -- e.g., "Oak Creek Apartments"
    building VARCHAR(50),
    floor VARCHAR(30),
    unit VARCHAR(30),
    room VARCHAR(30),
    seat VARCHAR(30),
    
    -- Locality Fields
    state VARCHAR(2) NOT NULL,
    county VARCHAR(100) NOT NULL,
    inc_muni VARCHAR(100),
    uninc_comm VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- Geometry (Point)
    geom GEOMETRY(Point, 3857) NOT NULL
);

-- Spatial Indices for high-performance offline lookup
CREATE INDEX idx_rcl_geom ON ng911_road_centerlines USING GIST (geom);
CREATE INDEX idx_addr_geom ON ng911_address_points USING GIST (geom);
```

---

## 3. Automated GIS Quality Control (QC) SQL Checks

Use these queries to validate your synthetic database for topological and structural integrity:

### Check 1: Disconnected Road Segments (Isolated Nodes)
```sql
SELECT rcl_id, nguid, street_name
FROM ng911_road_centerlines r
WHERE NOT EXISTS (
    SELECT 1 FROM ng911_road_centerlines other
    WHERE r.rcl_id <> other.rcl_id
      AND (
          ST_Touches(r.geom, other.geom) OR 
          ST_DWithin(ST_StartPoint(r.geom), other.geom, 0.01) OR 
          ST_DWithin(ST_EndPoint(r.geom), other.geom, 0.01)
      )
);
```

### Check 2: Address Range Direction & Parity Mismatches
```sql
SELECT rcl_id, street_name
FROM ng911_road_centerlines
WHERE (from_address_left > to_address_left)
   OR (from_address_right > to_address_right)
   OR (parity_left = 'Even' AND (from_address_left % 2 <> 0 OR to_address_left % 2 <> 0))
   OR (parity_left = 'Odd' AND (from_address_left % 2 = 0 OR to_address_left % 2 = 0));
```

### Check 3: Address Points Outside Street Buffers (>100m)
```sql
SELECT a.point_id, a.address_number, a.street_name
FROM ng911_address_points a
WHERE NOT EXISTS (
    SELECT 1 FROM ng911_road_centerlines r
    WHERE r.street_name = a.street_name
      AND ST_DWithin(a.geom, r.geom, 100.0)
);
```

---

## 4. Python Export Script (PostGIS to GeoPackage)

To package your database tables into a single standalone `.gpkg` file for offline distribution:

```python
import geopandas as gpd
from sqlalchemy import create_engine

# Connection string to your PostGIS database
db_url = "postgresql://username:password@localhost:5432/synthetic_town_db"
engine = create_engine(db_url)

# Load layers from PostGIS into GeoPandas DataFrames
print("Extracting layers from PostGIS...")
roads_gdf = gpd.read_postgis("SELECT * FROM ng911_road_centerlines", con=engine, geom_col="geom")
addresses_gdf = gpd.read_postgis("SELECT * FROM ng911_address_points", con=engine, geom_col="geom")

# Export to a self-contained offline GeoPackage (.gpkg)
output_gpkg = "synthetic_town_master.gpkg"
print(f"Exporting layers to {output_gpkg}...")

roads_gdf.to_file(output_gpkg, layer="roads", driver="GPKG")
addresses_gdf.to_file(output_gpkg, layer="addresses", driver="GPKG")

print("Export complete! File is ready for offline distribution and QGIS loading.")
```