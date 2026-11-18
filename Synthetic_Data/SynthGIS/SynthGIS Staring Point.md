# From Claude Earlier

You have the core vector/network stack. What’s missing is mostly the pieces that make the town reproducible, routable, and distributable without PostGIS or network access.

**Housekeeping on your list**

- **pygeos** is dead. Its code was merged into Shapely 2.0, so use Shapely ≥2 and drop it. Shapely 2 also has a built-in STRtree, which covers most of what rtree does.
- **rtree** is still useful for some GeoPandas paths, but it’s optional now. GeoPandas ≥0.14 uses Shapely’s STRtree for `sindex`.
- **qgis** (PyQGIS) is best treated as a desktop authoring tool rather than a pip dependency. It’s awkward to install in a venv, so don’t make the generator depend on it.

**What’s missing**

1. **Coordinate reference system handling: pyproj.** Pick one projected CRS for the town (a real state plane or UTM zone) and store everything in it, with WGS84 exports for interchange. Distances, areas, and street lengths are only meaningful in a projected CRS, which is a big part of looking “accurate.”
2. **I/O and distribution: pyogrio (or Fiona) and GeoPackage.** Ship the town as a single `.gpkg` file, not a PostGIS dump. It’s a self-contained, versionable, QGIS-native SQLite file with spatial indexes. This is the biggest win for restricted environments: users get the town with no database server. Keep PostGIS as your authoring and validation environment, and treat the GeoPackage as the release artifact. SpatiaLite is an alternative, but GeoPackage is better supported.
3. **Address and geocoding layer.** This is what SynthCCD will use most, and it’s not on your list. You need:
    - An **address point layer**, with each point snapped to a parcel and to a street segment, with a street name, house number, and parity (odd/even side).
    - A **street centerline layer with address ranges** (from/to left/right), the way TIGER does it. That gives you forward and reverse geocoding with plain interpolation.
    - A tiny local **geocoder**: a lookup table plus interpolation, or SQLite FTS for fuzzy matching. It doesn’t need Nominatim.
4. **Routing: pgRouting, or networkx plus OSMnx-style graph conventions.** networkx is fine for generating and analyzing. If you want drive-time realism for dispatch (travel time from station to incident), add edge attributes for speed, one-way, and road class, and consider **pgRouting** in PostGIS, or **pandana/igraph** if networkx gets slow. For a small town, networkx is enough.
5. **Seeded generation, which solves your Faker problem.** Use `numpy.random.default_rng(seed)` for every stochastic step, and persist the output. Determinism has two parts: seeded generation so you can regenerate, and a frozen artifact so users never have to. Also consider:
    - **Poisson-disk or Voronoi/Delaunay** (scipy.spatial) to seed blocks and parcels.
    - **Shapely `polygonize`, `split`, and `offset_curve`** to carve blocks into parcels and set building setbacks.
    - **momepy** (which you have) for morphological checks on the result.
6. **Topology and validation tooling.** This is what separates “looks like a map” from “is GIS-accurate.”
    - Validate in PostGIS with `ST_IsValid`, plus topology rules in QGIS (no gaps or overlaps between parcels, streets split at intersections, no dangles except cul-de-sacs).
    - `shapely.make_valid` and `shapely.set_precision` for snapping.
    - Consider **PostGIS Topology** or QGIS’s topology checker as part of a CI step.
7. **Realistic urban structure, not just geometry.** Things that make it believable to GIS people:
    - A street hierarchy (arterial/collector/local) with names that follow a plausible scheme.
    - Land-use zones, a hydrology feature (a creek or river that forces bridges), and varied block sizes.
    - Jurisdiction boundaries, **fire/EMS/law response zones (ESZ/ESN)**, and PSAP boundaries. For 9-1-1 work, these matter more than almost anything else.
    - Population and demand surfaces (census-block-like units), which let incident generation follow plausible spatial density.
8. **Metadata and standards.** Document it as a fictional place with a clear CRS, a data dictionary, and a license. If you want realism for 9-1-1 users, model the layers on **NENA NG9-1-1 GIS Data Model** conventions (road centerlines, site/structure address points, provisioning boundaries, emergency service boundaries). That makes the town a drop-in analog for what real PSAPs load.
9. **Fictional naming safeguards.** Use a fictional place name and street names that aren’t real streets in the real region you used as a template, and note that the town is entirely synthetic.

**Practical starting workflow**

1. Choose the CRS and a bounding box (roughly 3–5 km across is a good first town).
2. Generate the street network (networkx, seeded), then polygonize to blocks.
3. Subdivide blocks into parcels, place buildings and address points.
4. Load into PostGIS, run topology and validity checks, and review in QGIS.
5. Export to GeoPackage, version it, and have SynthCCD read only from that file.

Two design choices would change the details: whether you want the town hand-edited in QGIS after generation (which favors PostGIS as source of truth) or fully script-generated (which favors a pure-Python pipeline that emits the GeoPackage), and whether the town should resemble a particular real-world form (grid, suburban cul-de-sac, mixed rural edge). Which way are you leaning?

I will use NENA's standards to identify data layers and what else is needed.

Good choice. It gives you a ready-made layer list and attribute schema, and it makes the town a realistic stand-in for what a PSAP actually loads. I’m going from memory on the exact revision numbers, so confirm which version of the NG9-1-1 GIS Data Model (NENA-STA-006) is current before you freeze the schema.

**Layers to build, roughly by priority**

_Required or core in the model_

- Road centerlines, with address ranges, street-name parts, one-way, and speed attributes
- Site/structure address points
- PSAP boundary
- Emergency service boundaries for law, fire, and EMS
- Provisioning boundary, which also anchors the town’s extent
- Authoritative boundary (the area your synthetic GIS “owns”)

_Commonly included, and worth having for realism_

- Municipal, county, and state boundaries, plus unincorporated community or neighborhood boundaries
- Street name alias table
- Rail centerlines, hydrology, and mile markers
- Cell sector layer, if SynthCCD will simulate wireless Phase II location uncertainty
- Parcels, which are optional in the standard but useful for generating address points

**What NENA doesn’t cover but you’ll still need**

1. **Civic address standard (NENA-STA-004 / CLDXF, STA-015).** Use CLDXF field names for address parts so the town works with real geocoders and validators.
2. **Identifiers and lifecycle fields.** The model’s agency ID, NGUIDs, update dates, and effective/expire dates are easy to skip but needed for anything that mimics real provisioning. Pick a fictional domain for the NGUIDs.
3. **Legacy crosswalk.** If SynthCCD users might need an MSAG/ALI or ESN, generate those from the GIS layers so the two never drift apart.
4. **Operational layers for CAD realism.** The standard doesn’t define these, but dispatch data needs them:
    - station and unit home locations
    - response zones or beats
    - a response-plan or run-card table that maps zones to apparatus
    - hospitals and other destinations
5. **Network attributes for travel time.** Road class, speed, turn restrictions, and bridges over the creek or river. This is what lets incident-to-station drive times look plausible.
6. **Population and demand surface.** Census-block-like units with synthetic population and land use, so incident density follows something real. This is the link to your time series generation.
7. **QA/QC rules.** The model implies checks you should script and run on every build:
    - no address range overlaps or gaps
    - address points snap to the right centerline and side
    - ESBs nest inside the provisioning boundary with no gaps or overlaps
    - centerlines are split at the ESB boundaries
    - geometry validity
8. **Optional: location-based routing.** If you want to show call routing, a toy LoST-style point-in-polygon service that returns the PSAP and ESB for a coordinate is a small addition.

**Suggested build order**

1. Boundaries, with the provisioning boundary and PSAP boundary first.
2. Street network, with ranges and name parts.
3. Parcels, then address points.
4. ESBs, cut along street or geographic features rather than arbitrary lines, since real ones follow those.
5. Operational layers: stations, zones, and run cards.
6. Crosswalk tables, the QA suite, then the GeoPackage export.

Also use a fictional jurisdiction hierarchy (state, county, city) rather than real FIPS codes, and mark the data as synthetic in the metadata so it can never be mistaken for operational data.