# Contemporary Synthetic Geodata Generation — Research Summary (2023–2026)

> **Scope:** Procedural & ML-based city generation, urban morphology analysis, synthetic network generation, and GIS-native Python tooling relevant to SynthGIS.

---

## 1. Procedural Generation Frameworks

### 1.1 CityEngine / CGA Shape Grammar (Esri)
- **Status:** Commercial, mature, rule-based
- **Relevance:** Reference implementation for procedural zoning, setbacks, building extrusion
- **Limitation:** Not Python-native; closed ecosystem

### 1.2 PySGN — *Python for Synthetic Geospatial Networks* (Wang et al., 2026, JOSS)
- **Repo:** `github.com/wang-boyu/pysgn` | `pip install pysgn`
- **Built on:** NetworkX + GeoPandas
- **Models:** Geospatial Erdős-Rényi, Barabási-Albert, Watts-Strogatz
- **Key feature:** Edge probability decays with geographic distance (`p ∝ d⁻ᵃ`)
- **Use case:** Synthetic road/social networks with spatial constraints
- **Constraint API:** Custom edge filters (e.g., same zone, different zone)

### 1.3 CityGen (Deng et al., CVPR 2025 Workshop)
- **Approach:** Diffusion-based semantic layout → vectorized city plans
- **Control:** User-guided (OSM, semantic maps, satellite)
- **Output:** Infinite, controllable city layouts
- **Code:** `github.com/ZJU-CityGen/CityGen` (PyTorch)

### 1.4 CityX / City𝒳 (2024)
- **Multi-modal PCG:** OSM + semantic maps + satellite → unbounded 3D cities
- **Pipeline:** Blender agents + procedural plugins
- **Output:** Semantic/Instance/Depth annotations
- **Scale:** 383M triangles/km²

### 1.5 Proc-GS (CVPR 2025)
- **Innovation:** Procedural code → 3D Gaussian Splatting assets
- **Pipeline:** Base assets → procedural assembly → variance injection
- **Relevance:** Building-level detail for 3D visualization

---

## 2. Urban Morphology Analysis & Generation (Python-Native)

### 2.1 momepy (Fleischmann, 2019–2025) — **Core Dependency**
- **Repo:** `github.com/pysal/momepy` | `conda install -c conda-forge momepy`
- **Capabilities:**
  - **Morphological tessellation** — Voronoi-like cells from building footprints
  - **Street network → Graph** (`gdf_to_nx`, primal/dual)
  - **Graph → GeoDataFrame** (`nx_to_gdf`)
  - **Metrics:** Dimensions, shape, spatial distribution, density, diversity, connectivity
  - **Clustering:** Urban typology detection (Simpson diversity, quantile signatures)
- **Workshop materials:** `github.com/martinfleis/gisruk2025` (GISRUK 2025)

### 2.2 OSMnx v2.0 (Boeing, 2025)
- **Paper:** "Modeling and Analyzing Urban Networks and Amenities with OSMnx" (arXiv:2505.00736)
- **Modules:** 17 modules (bearing, building, distance, elevation, graph, io, network, etc.)
- **Integration:** NetworkX + GeoPandas + PySAL (momepy, libpysal)
- **Use for SynthGIS:** Reference real-world morphology stats, not data download

### 2.3 InstantCITY (ISPRS 2023)
- **Method:** Street network image → GAN → building footprints (raster → vector)
- **Validation:** 16 cities, morphological metrics (urban texture, grain, typologies)
- **Concept:** "Geographical Data Translation" — style transfer between cities
- **Code/Data:** Openly available

### 2.4 CityStack / citypy (ISPRS 2026)
- **Framework:** Layered urban stack (natural → streets → blocks → parcels → buildings → POIs)
- **Tool:** `github.com/OliverJPost/CityStack` (CLI: `citypy`)
- **Innovation:** Per-layer typologies + generation pipeline with constraints
- **Analysis:** 43 cities worldwide

### 2.5 VoxCity (2025)
- **Focus:** Voxel-based 3D city models + environmental simulation (solar, view index)
- **Data integration:** Auto-downloads heights, canopy, land cover, terrain
- **Python package:** Open source

---

## 3. Synthetic Population & Activity Generation

### 3.1 Large-Scale US Synthetic Population (2024, PMC11543939)
- **Method:** Census + travel survey → synthetic households → small-world social networks (NetworkX `newman_watts_strogatz_graph`)
- **Output:** GeoParquet/CSV, compatible with MATSim, NetLogo, GAMA
- **Code:** `github.com/njiang8/geo-synthetic-pop-usa`

### 3.2 CityChef (fredshone/citychef)
- **Generates:** Facilities, road networks, transit (GTFS), zones, population, activity plans
- **Output:** OSM format, GTFS, census marginals, OD matrices
- **Philosophy:** "Data generating process (DGP) produces outputs with distributions a real city"

### 3.3 Japanese Automated Synthetic City (Fukuda et al., 2025)
- **Pipeline:** Procedural 3D model (CityEngine-like) → Game engine (rendering) → DL image translation (seg → photo)
- **Result:** Detection performance ≥ real-data-trained models
- **Patent:** "Synthetic dataset generation method for deep learning of real urban landscapes"

---

## 4. Road Network Generation & Realism Metrics

### 4.1 Procedural Road Networks with Realism Metrics (IVCNZ 2022)
- **Metrics:** Entropy, orientation order, intersection density, block size distribution
- **Finding:** Objective metrics provide baseline for "realism" vs. subjective assessment
- **Method:** Exogenous (terrain, water) + endogenous (population) factors

### 4.2 NetworkX + momepy Primal/Dual Graphs
- **Primal:** Intersections = nodes, segments = edges (length weights)
- **Dual:** Streets = nodes, intersections = edges (angular weights)
- **Conversion:** `momepy.gdf_to_nx(approach="primal|dual")` ↔ `momepy.nx_to_gdf()`

### 4.3 PySAL / libpysal Spatial Weights
- **Alternative:** `libpysal.weights` for raw dual graph construction
- **Use:** Spatial autocorrelation, regionalization

---

## 5. 3D / Building Generation

| Method | Input | Output | Python? |
|--------|-------|--------|---------|
| **Digital Synthetic City (DSC)** | Satellite + pop + elevation | 3D urban canopy params | Partial (DL) |
| **Proc-GS** | Procedural code + 3DGS | Gaussian splatting buildings | Yes (PyTorch) |
| **CityX** | OSM/Semantic/Satellite | 3D semantic instances | Blender+Python |
| **VoxCity** | Open geospatial | Voxel grid + simulation | Yes |
| **momepy tessellation** | Building footprints | Morphological cells | **Yes (core)** |

---

## 6. Key Python Ecosystem for SynthGIS

### 6.1 Core Stack (Validated)
| Package | Version | Role |
|---------|---------|------|
| **geopandas** | ≥1.0 | Spatial DataFrames, I/O (GeoPackage) |
| **shapely** | ≥2.0 | Geometry ops, STRtree (replaces rtree) |
| **networkx** | ≥3.2 | Graph topology, routing, algorithms |
| **momepy** | ≥0.11 | Urban morphology, tessellation, graph↔gdf |
| **pyproj** | ≥3.6 | CRS handling, transformations |
| **pyogrio** | ≥0.8 | Fast GeoPackage I/O (replaces Fiona) |
| **numpy** | ≥1.26 | Seeded random generation (`default_rng`) |

### 6.2 Optional / Specialized
| Package | Purpose |
|---------|---------|
| **pysgn** | Synthetic geospatial networks (Erdős-Rényi, BA, WS) |
| **osmnx** | Reference morphology stats (not for synthetic generation) |
| **pandana / igraph** | Faster routing if networkx bottlenecks |
| **pgrouting** | PostGIS-native routing (drive-time polygons) |
| **scipy.spatial** | Voronoi/Delaunay for block/parcel seeding |
| **clustergram / scikit-learn** | Urban typology clustering (momepy workflow) |
| **sqlalchemy + geoalchemy2** | PostGIS authoring/validation |

### 6.3 Deprecated / Avoid
- **pygeos** → merged into Shapely 2.0
- **rtree** → optional; GeoPandas uses Shapely STRtree
- **fiona** → superseded by pyogrio
- **PyQGIS** → desktop only; don't make generator depend on it

---

## 7. Recommended Generation Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SEED & CONFIG                                                │
│    - numpy.random.default_rng(seed)                             │
│    - YAML config: extent, CRS, street hierarchy, zone specs    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. BOUNDARY & HYDROLOGY (Deterministic)                         │
│    - ProvisioningPolygon (outer bounds)                         │
│    - PSAP / ESB polygons (nested, no gaps)                      │
│    - River/creek (forces bridges, shapes blocks)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. STREET NETWORK (Seeded Procedural)                           │
│    a) Arterial backbone (grid + organic)                        │
│    b) Collector network (momepy gdf_to_nx + PySGN)              │
│    c) Local streets (subdivision, cul-de-sacs)                  │
│    d) Topology cleanup: split at intersections, snap, validate  │
│    e) Address range assignment (CLDXF parity)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. BLOCKS & PARCELS                                             │
│    a) momepy.morphological_tessellation(buildings) → blocks    │
│    b) shapely.ops.polygonize(streets) → block polygons         │
│    c) Subdivide blocks → parcels (setback offsets)              │
│    d) Land use zoning (residential/commercial/industrial)      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BUILDINGS & ADDRESS POINTS                                   │
│    a) Building footprints per parcel (stochastic, seeded)       │
│    b) SiteStructureAddressPoint per structure (CLDXF fields)    │
│    c) Sub-address: Building/Floor/Unit/Room/Seat               │
│    d) Placement: centroid / entrance / structure access         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. OPERATIONAL LAYERS (CAD/Dispatch)                            │
│    - Stations (Fire/Police/EMS)                                 │
│    - Response zones / beats                                     │
│    - Run cards (zone → apparatus mapping)                       │
│    - Hospitals / destinations                                   │
│    - Travel-time network (speed, one-way, class)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. VALIDATION & EXPORT                                          │
│    a) PostGIS load → topology checks (ST_IsValid, QC SQL)       │
│    b) QGIS visual review                                        │
│    c) Export GeoPackage (pyogrio) + metadata                    │
│    d) LoST-style point-in-polygon service (optional)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Morphological Realism Targets (from Literature)

| Metric | Typical Urban Range | Source |
|--------|---------------------|--------|
| **Intersection density** | 50–300 / km² | Boeing (OSMnx), momepy |
| **Block area (median)** | 2,000–20,000 m² | Fleischmann et al. 2021 |
| **Street orientation entropy** | 0.5–1.5 (grid→organic) | IVCNZ 2022 |
| **Meshedness (α)** | 0.01–0.15 | momepy `meshedness` |
| **Building coverage ratio** | 0.2–0.6 | InstantCITY |
| **Average street length** | 50–300 m | momepy `street_length` |
| **Cul-de-sac ratio** | 0.1–0.4 (suburban) | CityChef, CityGen |

---

## 9. Implementation Priorities for SynthGIS

| Priority | Component | Library | Effort |
|----------|-----------|---------|--------|
| **P0** | CRS handling (State Plane/UTM) | pyproj | Low |
| **P0** | Seeded RNG everywhere | numpy | Low |
| **P0** | RoadCenterLine + SSAP schemas | geopandas + NENA ref | Medium |
| **P0** | Provisioning/PSAP/ESB boundaries | shapely + geopandas | Medium |
| **P1** | Street network generation | networkx + momepy + pysgn | High |
| **P1** | Block parcelization | momepy tessellation + shapely | Medium |
| **P1** | Address range interpolation | Custom + CLDXF parity rules | Medium |
| **P2** | Building footprints | momepy + procedural rules | Medium |
| **P2** | Sub-address (Building/Floor/Unit) | CLDXF-US fields | Low |
| **P3** | Routing graph + travel time | networkx / pandana / pgRouting | Medium |
| **P3** | Synthetic population | CityChef patterns + NetworkX | High |
| **P3** | GeoPackage export + metadata | pyogrio | Low |

---

## 10. Key Papers to Reference in Documentation

1. **Fleischmann, M. (2019).** "momepy: Urban Morphology Measuring Toolkit." *JOSS* 4(43):1807. DOI:10.21105/joss.01807
2. **Wang, B. et al. (2026).** "PySGN: A Python package for constructing synthetic geospatial networks." *JOSS*. DOI:10.21105/joss.09346
3. **Boeing, G. (2025).** "Modeling and Analyzing Urban Networks and Amenities with OSMnx." arXiv:2505.00736
4. **Deng, J. et al. (2025).** "CityGen: Infinite and Controllable City Layout Generation." CVPR Workshop.
5. **Shaw, A. et al. (2023).** "Determining Realism of Procedurally Generated City Road Networks." *IVCNZ*, LNCS 13836.
6. **Liu, Y. et al. (2023).** "InstantCITY: Synthesising morphologically accurate geospatial data..." *ISPRS J.* 195:132–147.
7. **Post, O.J. et al. (2026).** "A proposed framework for generating plausible cities." *ISPRS Annals* XII-4/W1-2026.
8. **Fukuda, T. et al. (2025).** "Development of an automated synthetic dataset generation method for realistic fictional cities." Osaka U.

---

## 11. Data Formats & Interchange

| Format | Library | Use Case |
|--------|---------|----------|
| **GeoPackage (.gpkg)** | pyogrio | **Primary distribution** — single file, spatial index, QGIS/PostGIS |
| **GeoParquet** | geopandas | Cloud-native, columnar, analytics |
| **PostGIS** | sqlalchemy+geoalchemy2 | Authoring, validation, routing |
| **FlatGeobuf** | pyogrio | Streaming, web delivery |
| **NENA Flatfile YAML** | PyYAML | Schema-driven template generation |

---

## 12. Open Research Questions for SynthGIS

1. **How to calibrate morphological parameters** from target real-city statistics (momepy → target distributions)?
2. **Procedural zoning** that produces realistic land-use transitions (not random)?
3. **Sub-address generation** at scale (multi-unit residential, commercial towers)?
4. **Temporal versioning** (NENA `Effective`/`Expire` dates) for synthetic data evolution?
5. **3D vertical location** (NENA-REQ-003.1) — floor elevation, indoor routing?
6. **LoST service emulation** for synthetic call routing tests?