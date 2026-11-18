# NENA NG9-1-1 GIS Standards Reference & Distillation

> **Current Standard:** NENA-STA-006.3-2026 (ANSI Approved, March 11, 2026)  
> **Template Reference:** NENA-REF-006.3-2026 (v3.0, March 25, 2026)  
> **CLDXF-US:** NENA-STA-004.2-2024 (Civic Location Data Exchange Format)  
> **GitHub Templates:** https://github.com/NENA911/NG911GISDataModel

---

## 1. Layer Hierarchy (Table 4-1 from NENA-STA-006.3)

### REQUIRED Layers (Must exist for NGCS/ECRF/LVF operation)

| Layer | Primary Function | NGCS Services |
|-------|------------------|---------------|
| **RoadCenterLine** | Street centerlines with address ranges | ECRF, LVF, GCS, MCS, MDS |
| **SiteStructureAddressPoint** | Address points at structures/sites | ECRF, LVF, GCS, MCS, MDS |
| **PsapPolygon** | PSAP service boundaries | ECRF, LVF, MDS |
| **FirePolygon** | Fire service boundaries | ECRF, LVF |
| **PolicePolygon** | Law enforcement boundaries | ECRF, LVF, MDS |
| **EmsPolygon** | EMS service boundaries | ECRF, LVF, MDS |
| **ProvisioningPolygon** | Data authority extent | MDS |

### STRONGLY RECOMMENDED Layers

| Layer | Purpose |
|-------|---------|
| **Other service boundaries** (CoastGuard, PoisonControl, etc.) | ECRF, LVF, MDS |
| **A1–A5 Polygons** | Additional emergency service boundaries |

### RECOMMENDED Layers (CAD, mapping, planning)

| Layer | Purpose |
|-------|---------|
| **RailroadCenterLine** | Rail infrastructure |
| **HydrologyLine / HydrologyPolygon** | Water features |
| **LocationMarkerPoint** | Mile markers, call boxes |
| **DistanceMarkerPoint** | Distance references |
| **SiteStructureAddressPolygon** | Building footprints |

---

## 2. Core Layer Attribute Schemas (Distilled)

### 2.1 RoadCenterLine (RCL) — Critical Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **NGUID** | GUID | Yes | NENA Globally Unique ID (format: `urn:emergency:uid:gid:{domain}:{id}`) |
| **St_PreMod** | String(50) | No | Street pre-modifier (e.g., "Old") |
| **St_PreDir** | String(10) | No | Pre-directional (N, S, E, W, NE, NW, SE, SW) |
| **St_PreTyp** | String(50) | No | Pre-type (e.g., "Hwy", "Old") |
| **St_PreTypSep** | String(10) | No | Separator (e.g., "of the") |
| **St_Name** | String(100) | **Yes** | Street name (e.g., "Main") |
| **St_PosTyp** | String(50) | No | Post-type (St, Ave, Blvd, Dr, Rd, etc.) |
| **St_PosDir** | String(10) | No | Post-directional |
| **St_PosMod** | String(50) | No | Post-modifier |
| **FromAddr_L** | Integer | No | Left side from address |
| **ToAddr_L** | Integer | No | Left side to address |
| **FromAddr_R** | Integer | No | Right side from address |
| **ToAddr_R** | Integer | No | Right side to address |
| **Parity_L** | Domain | No | `E` (Even), `O` (Odd), `B` (Both), `Z` (Zero) |
| **Parity_R** | Domain | No | Same as Parity_L |
| **State** | String(2) | **Yes** | USPS state abbreviation |
| **County** | String(100) | **Yes** | County name |
| **Inc_Muni** | String(100) | No | Incorporated municipality |
| **Uninc_Comm** | String(100) | No | Unincorporated community |
| **PostCode** | String(10) | No | ZIP/ZIP+4 |
| **ESN_L / ESN_R** | String(5) | No | Emergency Service Number (legacy) |
| **MSAGComm_L / MSAGComm_R** | String(100) | No | MSAG community name |
| **OneWay** | Domain | No | `B` (Both), `FT` (From→To), `TF` (To→From) |
| **SpeedLimit** | Integer | No | Posted speed (mph or km/h) |
| **RoadClass** | Domain | No | `I` (Interstate), `US` (US Hwy), `SH` (State), `CO` (County), `LO` (Local), `PV` (Private), `RA` (Ramp) |
| **LaneCount** | Integer | No | Number of through lanes |
| **Divided** | Boolean | No | Median-divided roadway |
| **DateUpdate** | DateTime | **Yes** | Last update timestamp |
| **Effective / Expire** | DateTime | No | Temporal validity |
| **geom** | LineString | **Yes** | Projected CRS (recommended: State Plane / UTM) |

### 2.2 SiteStructureAddressPoint (SSAP) — Critical Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **NGUID** | GUID | Yes | NENA Globally Unique ID |
| **AddNum** | Integer | **Yes** | Address number |
| **AddNumSuf** | String(10) | No | Suffix (e.g., "B", "1/2") |
| **St_PreDir / St_PreTyp / St_Name / St_PosTyp / St_PosDir** | String | See RCL | Denormalized street name components |
| **SiteName** | String(100) | No | Site/Complex name (e.g., "Oak Creek Apartments") |
| **Building** | String(50) | No | Building identifier |
| **Floor** | String(30) | No | Floor level |
| **Unit** | String(30) | No | Unit/suite/apartment |
| **Room / Seat** | String(30) | No | Sub-unit detail |
| **PlaceType** | Domain | No | `S` (Site), `ST` (Structure), `B` (Building), `U` (Unit) |
| **Placement** | Domain | No | `CEN` (Centroid), `ENT` (Entrance), `STR` (Structure), `PAR` (Parcel) |
| **State / County / Inc_Muni / Uninc_Comm / PostCode** | String | See RCL | Locality (denormalized) |
| **ESN** | String(5) | No | Emergency Service Number |
| **MSAGComm** | String(100) | No | MSAG community |
| **DateUpdate** | DateTime | **Yes** | Last update |
| **geom** | Point | **Yes** | Same CRS as RCL |

### 2.3 Service Boundary Polygons (Psap, Fire, Police, EMS, Provisioning)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **NGUID** | GUID | Yes | Unique ID |
| **Name** | String(100) | **Yes** | Display name (appears in CHE/CPE) |
| **ServiceURN** | String(100) | **Yes** | e.g., `urn:emergency:service:sos.psap`, `urn:emergency:service:sos.fire` |
| **ServiceNum** | String(20) | No | Agency phone/identifier |
| **State / County** | String | **Yes** | Jurisdiction |
| **DateUpdate** | DateTime | **Yes** | Last update |
| **geom** | Polygon/MultiPolygon | **Yes** | No gaps/overlaps within layer |

---

## 3. Critical Business Rules (from NENA-STA-006.3)

### 3.1 Topology Rules
- **No gaps/overlaps** within ProvisioningPolygon or any service boundary layer
- **Coincident boundaries** between adjacent providers' ProvisioningPolygons
- **Centerlines split at** service boundary intersections
- **Address points** must fall within ProvisioningPolygon

### 3.2 Address Range Rules
- `FromAddr ≤ ToAddr` on each side
- Parity must match address numbers (Even→even, Odd→odd)
- No overlapping ranges on same street name within same community
- Ranges must be consistent with address point placement

### 3.3 Identifier Rules
- **NGUID Format:** `urn:emergency:uid:gid:{domain}:{local-id}`
  - Example: `urn:emergency:uid:gid:synthtown.example.org:rcl-000123`
- **Fictional domain** required for synthetic data (e.g., `synthtown.local`, `synthgis.example`)

### 3.4 CLDXF-US Alignment (NENA-STA-004.2-2024)
All street name components and address elements must map to CLDXF-US PIDF-LO elements:
- `St_Name` → `STREET` (street name)
- `St_PreDir` → `STREET_PRE_DIRECTIONAL`
- `St_PosTyp` → `STREET_POST_TYPE`
- `AddNum` → `HOUSE_NUMBER`
- `AddNumSuf` → `HOUSE_NUMBER_SUFFIX`
- `Building` → `BUILDING`
- `Floor` → `FLOOR`
- `Unit` → `UNIT`

---

## 4. NENA Template Formats (v3.0)

| Format | Description | Use Case |
|--------|-------------|----------|
| **GeoPackage (.gpkg)** | OGC standard, SQLite-based, spatial indexes | **Primary distribution format** — offline, portable, QGIS-native |
| **Esri File Geodatabase (.gdb)** | Esri proprietary | ArcGIS Pro workflows |
| **Relational Schema (PostgreSQL/PostGIS)** | Normalized tables with FK relationships | Authoring, validation, enterprise deployment |

**Template Repo:** `github.com/NENA911/NG911GISDataModel`
- `flatfile_templates/prebuilt_templates/` — Ready-to-use .gpkg/.gdb
- `flatfile_templates/schema/flatfile_schema_v3.yaml` — Machine-readable schema
- `relational_templates/schema/` — SQL DDL for PostGIS
- `vendor_arcgispro/` — Python scripts to generate templates
- `vendor_qgis/` — (Planned) QGIS processing scripts

---

## 5. QC/Validation Rules to Implement

| Check | SQL/Logic | Layer(s) |
|-------|-----------|----------|
| Geometry validity | `ST_IsValid(geom)` | All |
| No duplicate NGUIDs | `COUNT(*) GROUP BY nguid HAVING > 1` | All |
| Address range direction | `FromAddr <= ToAddr` | RCL |
| Parity consistency | `Addr % 2 = 0` for Even | RCL, SSAP |
| Points within street buffer | `ST_DWithin(pt, line, 100m)` | SSAP → RCL |
| No orphan road segments | `ST_Touches` or `ST_DWithin(endpoint, other, 0.01)` | RCL |
| Boundary topology | `ST_Overlaps`, `ST_Touches` (no gaps) | All polygons |
| Centerlines split at boundaries | `ST_Intersection(line, boundary)` count | RCL, boundaries |
| CLDXF field completeness | Required fields non-null | RCL, SSAP |
| DateUpdate populated | `DateUpdate IS NOT NULL` | All |

---

## 6. Key References for Implementation

| Document | URL | Purpose |
|----------|-----|---------|
| NENA-STA-006.3-2026 (PDF) | `nena.org/resource/resmgr/standards/standards1/NENA-STA-006.3_NG9-1-1_GIS_D.pdf` | Authoritative standard |
| NENA-REF-006.3-2026 (Templates) | `nena.org/resource/resmgr/standards/nena-ref-006.3_gis_data_temp.pdf` | Template guide |
| GitHub Templates | `github.com/NENA911/NG911GISDataModel` | Schema YAML, SQL, scripts |
| CLDXF-US Standard | `nena.org/resource/resmgr/standards/NENA-STA-004.2-2024_CLDXF_20.pdf` | Civic address format |
| FGDC↔CLDXF Crosswalk | `nena.org/resource/resmgr/standards/MovingData_FGDCCLDXF_NENA-RE.pdf` | Legacy migration |
| GIS Data Stewardship | `kb.nena.org/wiki/NENA_INF-028` | Operational guidance |

---

## 7. Synthetic Data Safeguards (Mandatory)

1. **Fictional jurisdiction hierarchy** — Create fake State/County/City names (e.g., "Synthetic County, SynthState")
2. **Fictional FIPS-like codes** — Use reserved ranges or custom scheme
3. **NGUID domain** — Register a synthetic domain (e.g., `synthgis.local`, `synthtown.example`)
4. **Metadata tag** — Every layer includes `DataSource = 'SYNTHETIC'` and `Disclaimer = 'Not for operational use'`
5. **License** — Apply CC-BY-4.0 or similar with explicit "synthetic/not operational" clause