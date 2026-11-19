# QGIS Training Guide for SynthGIS

> **Why QGIS?** Free, open-source, cross-platform, handles GeoPackage natively, powerful styling/analysis, Python console for automation. Perfect for SynthGIS workflow.

---

## 1. Installation & Setup

### Install QGIS (Linux/macOS)
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install qgis qgis-plugin-grass

# Fedora
sudo dnf install qgis qgis-grass

# macOS (Homebrew)
brew install --cask qgis

# Or download from qgis.org/download
```

### Recommended Plugins (Plugins → Manage and Install Plugins)
| Plugin | Purpose |
|--------|---------|
| **DB Manager** | Built-in PostGIS/SpatiaLite management |
| **QuickOSM** | Pull real OSM data for comparison |
| **Geometry Checker** | Topology validation |
| **Topology Checker** | NENA-style topology rules |
| **Profile Tool** | Elevation profiles (for 3D) |
| **TimeManager** | Temporal animation (if you add dates) |
| **QGIS2ThreeJS** | 3D web export |
| **Data Plotly** | Charts from attribute data |

---

## 2. Loading SynthGIS Data

### Open the GeoPackage
1. **Layer → Add Layer → Add Vector Layer**
2. **Source Type**: `Directory`
3. **Vector Dataset(s)**: Browse to `output/synthetic_town.gpkg`
3. **Click Add** → Select layers to load

### Load All Layers at Once (Python Console)
```python
# Open Python Console (Ctrl+Alt+P)
gpkg_path = "/path/to/output/synthetic_town.gpkg"

# Get layer names
import subprocess
result = subprocess.run(["ogrinfo", gpkg_path], capture_output=True, text=True)
print(result.stdout)

# Load all layers
for layer_name in ["RoadCenterLine", "SiteStructureAddressPoint", "PsapPolygon", 
                   "FirePolygon", "PolicePolygon", "EmsPolygon", "ProvisioningPolygon",
                   "FireStationPoint", "PoliceStationPoint", "EmsStationPoint",
                   "HospitalPoint", "FireZonePolygon", "PoliceZonePolygon", "EmsZonePolygon"]:
    uri = f"{gpkg_path}|layername={layer_name}"
    layer = QgsVectorLayer(uri, layer_name, "ogr")
    if layer.isValid():
        QgsProject.instance().addMapLayer(layer)
    else:
        print(f"Failed to load {layer_name}")
```

### Load from PostGIS (if using database)
1. **Layer → Add Layer → Add PostGIS Layer**
2. **New Connection**: Host=localhost, Port=5432, DB=synthgis, User=synthgis
3. **Connect** → Select tables → **Add**

---

## 3. Essential Interface Tour

```
┌─────────────────────────────────────────────────────────────┐
│ Menu Bar: Project, Layer, View, Vector, Raster, Database   │
├───────────────┬─────────────────────────────────────────────┤
│ Browser Panel │              Map Canvas                     │
│ (Data sources)│  (Your map - pan/zoom/identify)             │
├───────────────┼─────────────────────────────────────────────┤
│ Layers Panel  │  Layer Styling Panel (F7)                   │
│ (Layer tree,  │  (Symbology, Labels, 3D View)               │
│  visibility,  │                                             │
│  order)       │                                             │
├───────────────┴─────────────────────────────────────────────┤
│ Status Bar: CRS, Scale, Coordinates, Magnifier, Messages   │
└─────────────────────────────────────────────────────────────┘
```

### Key Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+M` | Measure tool |
| `Ctrl+F` | Find feature |
| `F3` / `F4` | Zoom to layer / full extent |
| `Space` + drag | Pan |
| `Ctrl+Mouse Wheel` | Zoom |
| `F7` | Open Layer Styling Panel |
| `Ctrl+Alt+P` | Python Console |
| `F11` | Full screen |

---

## 4. Inspecting SynthGIS Layers

### Attribute Table (Right-click layer → Open Attribute Table)
```sql
-- Key fields to check per layer:

-- RoadCenterLine
NGUID, St_Name, St_PosTyp, FromAddr_L, ToAddr_L, FromAddr_R, ToAddr_R, 
Parity_L, Parity_R, RoadClass, SpeedLimit, OneWay

-- SiteStructureAddressPoint  
NGUID, AddNum, St_Name, St_PosTyp, Building, Floor, Unit, Room, Seat,
PlaceType, Placement, ESN

-- Service Boundaries (Psap, Fire, Police, EMS, Provisioning)
NGUID, Name, ServiceURN, ServiceNum, State, County
```

### Filter Features (Right-click → Filter)
```sql
-- Only arterial roads
"RoadClass" IN ('I', 'US', 'SH')

-- Only residential address points
"PlaceType" IN ('ST', 'B', 'U')

-- Fire stations only
"FacilityType" = 'fire'
```

### Identify Features (Ctrl+Shift+I → click feature)
- Shows all attributes
- Shows geometry details (length, area, vertices)

---

## 5. Styling for NENA Visualization

### RoadCenterLine by RoadClass
1. **Layer Styling (F7) → Single Symbol → Categorized**
2. **Column**: `RoadClass`
3. **Classify** → Set colors:
   - `I` (Interstate): Thick blue, 3pt
   - `US` (US Highway): Thick red, 2.5pt  
   - `SH` (State): Medium green, 2pt
   - `CO` (County): Medium orange, 1.5pt
   - `LO` (Local): Thin gray, 0.5pt
   - `PV` (Private): Dashed gray, 0.5pt

### Address Points by PlaceType
1. **Categorized** → Column: `PlaceType`
   - `ST` (Structure): Red circle, 3mm
   - `B` (Building): Blue square, 3mm
   - `U` (Unit): Green triangle, 2mm
   - `S` (Site): Yellow diamond, 4mm

### Service Boundaries (Transparency + Labels)
1. **Single Symbol** → Fill: Transparent (0%), Stroke: 2pt, distinct colors
2. **Labels** → **Single Labels** → `Name` field
   - **Placement**: Offset from centroid
   - **Buffer**: White, 1pt for readability

### 3D Buildings (if --3d flag used)
1. **Layer Styling → 3D View**
2. **Extrusion**: Enable → Height field: `height_m`
3. **Roof color**: By `roof_type` (flat=gray, gabled=brown, hipped=dark brown)
4. **View → New 3D Map View** → Navigate with mouse (Shift+drag = rotate)

---

## 6. Topology Validation (NENA QC)

### Built-in Geometry Checker
**Vector → Geometry Tools → Check Validity**
- **Input**: Select layer
- **Method**: GEOS (standard)
- **Output**: Creates error layer with invalid geometries

### Topology Checker (NENA-style rules)
**Vector → Topology Checker → Configure**
```
Rules to add:
☑ Must not have duplicates (NGUID)
☑ Must not have invalid geometries
☑ Must not have gaps (boundaries)
☑ Must not have overlaps (boundaries)
☑ Must not have dangles (roads - except cul-de-sacs)
☑ Must be covered by (address points → road buffer 100m)
```

### Custom SQL Validation (DB Manager)
**Database → DB Manager → PostGIS → SQL Window**
```sql
-- Run NENA QC checks
-- Address range direction
SELECT rcl_id, St_Name FROM ng911_road_centerlines 
WHERE FromAddr_L > ToAddr_L OR FromAddr_R > ToAddr_R;

-- Parity consistency
SELECT rcl_id, St_Name, Parity_L, FromAddr_L, ToAddr_L
FROM ng911_road_centerlines
WHERE (Parity_L = 'E' AND (FromAddr_L % 2 <> 0 OR ToAddr_L % 2 <> 0))
   OR (Parity_L = 'O' AND (FromAddr_L % 2 = 0 OR ToAddr_L % 2 = 0));

-- Address points far from streets
SELECT a.NGUID, a.AddNum, a.St_Name, ST_Distance(a.geom, r.geom) as dist_m
FROM ng911_address_points a
LEFT JOIN LATERAL (
  SELECT geom FROM ng911_road_centerlines r
  WHERE r.St_Name = a.St_Name
  ORDER BY ST_Distance(a.geom, r.geom) LIMIT 1
) r ON true
WHERE r.geom IS NULL OR ST_Distance(a.geom, r.geom) > 100;
```

---

## 7. Analysis Workflows

### Drive-Time Isochrones (from routing service)
```python
# In Python Console - call routing API
import requests, json

response = requests.post("http://localhost:8000/isochrone", json={
    "origin": {"x": 950000, "y": 200000},
    "max_time_seconds": 300  # 5 minutes
})
isochrone = response.json()

# Add as layer
layer = QgsVectorLayer(
    f"Polygon?crs=EPSG:2263&field=time:int",
    "5min_isochrone", "memory")
feat = QgsFeature()
feat.setGeometry(QgsGeometry.fromWkt(isochrone['geometry']['wkt']))
layer.dataProvider().addFeature(feat)
QgsProject.instance().addMapLayer(layer)
```

### Address Geocoding Test
```python
# Test local geocoding (interpolation)
layer = QgsProject.instance().mapLayersByName("RoadCenterLine")[0]
addr_layer = QgsProject.instance().mapLayersByName("SiteStructureAddressPoint")[0]

# Find address "123 Main St"
for feat in layer.getFeatures():
    if feat["St_Name"] == "Main" and feat["St_PosTyp"] == "St":
        # Check address range
        if feat["FromAddr_L"] <= 123 <= feat["ToAddr_L"] and 123 % 2 == 0:
            # Interpolate along line
            line = feat.geometry()
            fraction = (123 - feat["FromAddr_L"]) / (feat["ToAddr_L"] - feat["FromAddr_L"])
            pt = line.interpolate(fraction, QgsGeometry.Length)
            print(f"Interpolated: {pt.asWkt()}")
```

### Service Boundary Coverage
```python
# Check all address points fall within provisioning boundary
prov = QgsProject.instance().mapLayersByName("ProvisioningPolygon")[0]
addrs = QgsProject.instance().mapLayersByName("SiteStructureAddressPoint")[0]

prov_union = QgsGeometry.unaryUnion([f.geometry() for f in prov.getFeatures()])
outside = []
for addr in addrs.getFeatures():
    if not addr.geometry().within(prov_union):
        outside.append(addr["NGUID"])
        
print(f"Address points outside provisioning: {len(outside)}")
```

---

## 8. Cartographic Output

### Print Layout (Project → New Print Layout)
1. **Add Map** → Draw rectangle
2. **Item Properties** → Set scale, extent
3. **Add Legend** → Filter to show only needed layers
4. **Add Scale Bar** → Map units (feet/meters)
5. **Add North Arrow**
6. **Add Attribute Table** → Show key stats
7. **Export** → PDF, SVG, PNG (300 DPI for print)

### Atlas Generation (Multiple Maps)
1. **Layout → Atlas Settings** → Enable
2. **Coverage Layer**: `FireZonePolygon` (one map per zone)
3. **Page Name**: `[% "Name" %]`
4. **Atlas → Export Atlas** → PDF per zone

---

## 9. Python Automation (PyQGIS)

### Standalone Script (run outside QGIS)
```python
#!/usr/bin/env python3
# validate_synthgis.py
import sys
sys.path.append('/usr/share/qgis/python')  # Linux path

from qgis.core import QgsApplication, QgsVectorLayer, QgsProject

# Initialize QGIS (no GUI)
qgs = QgsApplication([], False)
qgs.initQgis()

try:
    gpkg = "output/synthetic_town.gpkg"
    
    # Load layers
    roads = QgsVectorLayer(f"{gpkg}|layername=RoadCenterLine", "roads", "ogr")
    addrs = QgsVectorLayer(f"{gpkg}|layername=SiteStructureAddressPoint", "addrs", "ogr")
    
    # Validation
    print(f"Roads: {roads.featureCount()} features")
    print(f"Addresses: {addrs.featureCount()} features")
    
    # Check validity
    invalid_roads = sum(1 for f in roads.getFeatures() if not f.geometry().isGeosValid())
    print(f"Invalid road geometries: {invalid_roads}")
    
finally:
    qgs.exitQgis()
```

### Run: `python3 validate_synthgis.py`

---

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| **Layers not loading** | Check file path, ensure `.gpkg` not corrupted (`ogrinfo file.gpkg`) |
| **CRS mismatch** | Right-click layer → Set Layer CRS → Match project CRS |
| **Slow rendering** | Enable **Render Caching** (Layer Properties → Rendering), simplify geometries |
| **3D view empty** | Ensure layer has Z values, enable 3D View in styling, check extrusion field |
| **PostGIS connection fails** | Check `pg_hba.conf`, firewall, host/port/db/user/password |
| **Python console errors** | Use `QgsApplication([], False)` for headless scripts |

---

## 11. Learning Path for SynthGIS

### Week 1: Basics
- [ ] Load GeoPackage, explore all layers
- [ ] Style roads by class, addresses by type
- [ ] Run topology checker, fix any errors
- [ ] Create print layout with all layers

### Week 2: Analysis
- [ ] Connect to PostGIS, run NENA QC SQL
- [ ] Test routing API from QGIS Python console
- [ ] Generate isochrones for all stations
- [ ] Validate address point placement

### Week 3: 3D & Automation
- [ ] Load 3D buildings, configure extrusion
- [ ] Create 3D map view, export to web (QGIS2ThreeJS)
- [ ] Write standalone validation script
- [ ] Build atlas of response zones

### Week 4: Integration
- [ ] Compare with real city (QuickOSM)
- [ ] Calibrate town_spec.yaml from OSM metrics
- [ ] Build SynthCCD incident visualization
- [ ] Document your workflow

---

## 12. Resources

| Resource | Link |
|----------|------|
| **QGIS Documentation** | https://docs.qgis.org/ |
| **PyQGIS Cookbook** | https://docs.qgis.org/latest/en/docs/pyqgis_developer_cookbook/ |
| **Training Manual** | https://docs.qgis.org/latest/en/docs/training_manual/ |
| **Planet QGIS (blogs)** | https://planet.qgis.org/ |
| **GIS StackExchange** | https://gis.stackexchange.com/ |
| **NENA Standards** | https://www.nena.org/page/standards |

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│ QGIS + SynthGIS Quick Commands                                 │
├────────────────────────────────────────────────────────────────┤
│ Load GPKG:     Layer → Add Layer → Add Vector Layer → Directory│
│ Style Roads:   F7 → Categorized → "RoadClass" → Classify       │
│ Check Topo:    Vector → Topology Checker → Configure Rules     │
│ Run SQL:       DB Manager → PostGIS → SQL Window               │
│ 3D View:       View → New 3D Map View → Shift+drag to rotate   │
│ Print Layout:  Project → New Print Layout → Add Map/Legend     │
│ Python Console: Ctrl+Alt+P → QgsProject.instance().mapLayers() │
│ Validate:      Vector → Geometry Tools → Check Validity        │
│ Atlas:         Layout → Atlas Settings → Coverage Layer        │
└────────────────────────────────────────────────────────────────┘
```

---

*QGIS is the presentation/analysis layer — SynthGIS generates the data. Together they form a complete NG9-1-1 GIS workflow without any proprietary software.*