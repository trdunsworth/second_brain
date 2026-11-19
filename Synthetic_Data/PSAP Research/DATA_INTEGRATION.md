# PSAP Research — Data Integration Patterns

> **Real data seeding, synthetic augmentation, and hybrid generation for realistic simulations**

---

## Overview

This document defines the data integration patterns for the PSAP Research ecosystem, enabling seamless blending of real-world data with synthetic generation to produce realistic, calibrated synthetic datasets for experimentation.

---

## Data Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        DATA INTEGRATION PIPELINE                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  REAL DATA   │    │  CALIBRATION │    │  SYNTHETIC   │    │  HYBRID      │     │
│  │  SOURCES     │───►│  & PROFILING │───►│  AUGMENTATION│───►│  OUTPUT      │     │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘     │
│        │                    │                    │                    │             │
│        ▼                    ▼                    ▼                    ▼             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                    VALIDATION & CALIBRATION LOOP                            │  │
│  │  Statistical fidelity  ◄──► Distributional match  ◄──► Expert review       │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Real Data Sources Required by Component

### 1. Geography & Infrastructure (SynthGIS Input)

| Data Need | Source | Format | Minimal | Ideal | Purpose |
|-----------|--------|--------|---------|-------|---------|
| **Road Network** | OpenStreetMap, DOT GIS | GeoJSON, Shapefile, GeoPackage | Centerlines only | Full attribution (lanes, speed, class, direction) | Seed street network topology |
| **Address Points** | County 911, USPS, MSAG | CSV, GeoPackage | Address + lat/lon | Full CLDXF + sub-address | Calibrate address interpolation |
| **Parcel Boundaries** | County Assessor, GIS | GeoPackage, Shapefile | Parcel polygons | Parcel + zoning + assessment | Parcel subdivision, building placement |
| **Building Footprints** | Microsoft, OSM, Local GIS | GeoPackage, GeoJSON | Footprint polygons | Height, use, occupancy, year built | 3D building generation |
| **Zoning/Land Use** | Municipal Planning | GeoPackage, CSV | Zone polygons | Zoning code + density + FAR | Land use assignment |
| **Hydrology** | NHD, USGS, Local | GeoPackage | Flowlines | Waterbodies, wetlands, flood zones | Natural constraints |
| **Elevation/DEM** | USGS 3DEP, LiDAR | GeoTIFF, COG | 10m resolution | 1m resolution | Terrain-aware routing |
| **Transit/Rail** | GTFS, FRA, Local | GTFS, GeoPackage | Routes | Schedules, stops, frequency | Multi-modal routing |
| **Administrative Boundaries** | Census, State GIS | GeoPackage | County/municipal | PSAP, fire, police, EMS, school districts | Service boundaries |

### 2. Workload & Demand (SynthCCD Input)

| Data Need | Source | Format | Minimal | Ideal | Purpose |
|-----------|--------|--------|---------|-------|---------|
| **Historical CAD Incidents** | PSAP CAD Export | CSV, Parquet | 6 months | 3+ years | Calibrate incident generation |
| **Call Volume by Hour** | PSAP Phone System | CSV, API | 30 days | 1+ year | Diurnal/seasonal calibration |
| **Response Time Records** | CAD + AVL | CSV, Parquet | 6 months | 2+ years | Time profile calibration |
| **Unit Status Logs** | CAD + AVL | CSV, Parquet | 30 days | 1+ year | Unit availability, UHU |
| **Staffing Records** | HR, Scheduling | CSV, Excel | Current | Historical | Shift config, staffing levels |
| **Disposition Codes** | CAD | CSV | Current | Historical | Disposition distributions |
| **Call Reception Method** | Phone System | CSV | Current | Historical | Reception method weights |
| **Abandonment Records** | Phone System | CSV | 30 days | 1+ year | Abandonment rate calibration |
| **Hospital/ED Data** | EMS, Hospital | CSV, HL7 | Current | Historical | Destination modeling |

### 3. Demographics & Equity (Calibration)

| Data Need | Source | Format | Minimal | Ideal | Purpose |
|-----------|--------|--------|---------|-------|---------|
| **Census Demographics** | Census ACS | CSV, GeoJSON | Tract-level | Block-group | Equity analysis, demand weighting |
| **Population Estimates** | Census, Local | CSV, API | Annual | Monthly | Population-based volume scaling |
| **Employment/Commute** | ACS, LODES | CSV, CSV | Tract | Block | Daytime population estimation |
| **Land Value/Assessment** | Assessor | CSV, GIS | Parcel | Parcel | Commercial density proxy |
| **Building Permits** | Building Dept | CSV, API | 1 year | 5+ years | Growth trends, new development |

### 4. Operational Calibration (Advanced)

| Data Need | Source | Format | Purpose |
|-----------|--------|--------|---------|
| **AVL/GPS Breadcrumbs** | CAD/AVL Vendor | CSV, Parquet | Travel time calibration, route choice |
| **Radio/MDT Logs** | CAD/Radio Vendor | CSV, Text | Communication load, dispatcher workload |
| **Training/Cert Records** | HR/Training | CSV, HRIS | Personnel competency modeling |
| **Maintenance/Out-of-Service** | Fleet/CAD | CSV | Unit availability modeling |
| **Weather History** | NOAA, Local | CSV, API | Weather impact calibration |
| **Special Events Calendar** | City/County | CSV, ICS | Planned event volume spikes |

---

## Integration Patterns

### Pattern 1: Real Data as Seed (Full Calibration)

```
Real Data → Profile Extraction → Parameter Calibration → Synthetic Generation
```

**Implementation**:

```python
# psap_research/integration/real_data_seeder.py
from dataclasses import dataclass
from typing import Dict, List, Optional
from pathlib import Path
import pandas as pd
import geopandas as gpd
from psap_research.config.schemas import TownSpec

@dataclass
class RealDataProfile:
    """Statistical profile extracted from real data."""
    # Geography
    road_density_km_per_km2: float
    intersection_density_per_km2: float
    block_area_stats: Dict  # mean, median, std, quantiles
    street_orientation_entropy: float
    road_class_distribution: Dict[str, float]
    
    # Address
    address_density_per_km2: float
    subaddress_rate: float  # fraction with building/floor/unit
    clxdf_field_completeness: Dict[str, float]
    
    # Demand
    incidents_per_1000_per_year: float
    agency_distribution: Dict[str, float]
    priority_distribution: Dict[int, float]
    problem_nature_distribution: Dict[str, float]
    hourly_weights: List[float]  # 24 values
    seasonal_multipliers: Dict[str, Dict[str, float]]
    
    # Response Times
    time_profiles: Dict[str, Dict[int, Dict[str, float]]]  # agency -> priority -> interval -> mean
    dispatch_init_fraction: Dict[int, tuple]  # priority -> (lo, hi)
    
    # Population
    total_population: int
    population_density: float
    daytime_population_ratio: float
    demographic_quintiles: Dict

class RealDataSeeder:
    """Extract statistical profiles from real data for synthetic calibration."""
    
    def __init__(self, random_seed: int = 42):
        self.rng = np.random.default_rng(random_seed)
    
    def profile_geography(
        self, 
        streets: gpd.GeoDataFrame,
        address_points: gpd.GeoDataFrame,
        parcels: gpd.GeoDataFrame,
        boundaries: gpd.GeoDataFrame
    ) -> Dict:
        """Extract geographic morphology statistics."""
        # Road density
        total_length = streets.length.sum() / 1000  # km
        area_km2 = boundaries.geometry.area.sum() / 1_000_000  # km²
        road_density = total_length / area_km2
        
        # Intersection density (via momepy)
        import momepy
        graph = momepy.gdf_to_nx(streets, approach="primal")
        intersections = len([n for n, d in graph.degree() if d > 2])
        intersection_density = intersections / area_km2
        
        # Block areas
        blocks = momepy.blocks(streets)
        block_areas = blocks.geometry.area
        
        # Street orientation entropy
        bearings = momepy.orientation(streets)
        orientation_entropy = self._entropy(bearings)
        
        # Road class distribution
        if 'RoadClass' in streets.columns:
            rc_dist = streets['RoadClass'].value_counts(normalize=True).to_dict()
        else:
            rc_dist = {}
        
        return {
            'road_density_km_per_km2': road_density,
            'intersection_density_per_km2': intersection_density,
            'block_area_stats': block_areas.describe().to_dict(),
            'street_orientation_entropy': orientation_entropy,
            'road_class_distribution': rc_dist,
        }
    
    def profile_addresses(self, address_points: gpd.GeoDataFrame) -> Dict:
        """Profile address point attributes."""
        completeness = {}
        for field in ['AddNum', 'St_Name', 'St_PosTyp', 'St_PreDir', 'St_PosDir',
                      'Building', 'Floor', 'Unit', 'Room', 'Seat']:
            if field in address_points.columns:
                completeness[field] = address_points[field].notna().mean()
            else:
                completeness[field] = 0.0
        
        subaddress_fields = ['Building', 'Floor', 'Unit', 'Room', 'Seat']
        subaddress_rate = sum(address_points[f].notna().sum() for f in subaddress_fields if f in address_points.columns) / len(address_points)
        
        return {
            'address_density_per_km2': len(address_points) / self.area_km2,
            'subaddress_rate': subaddress_rate,
            'clxdf_field_completeness': completeness,
        }
    
    def profile_incidents(self, incidents: pd.DataFrame) -> Dict:
        """Profile incident workload characteristics."""
        return {
            'incidents_per_1000_per_year': len(incidents) / (self.population / 1000) / self.years_of_data,
            'agency_distribution': incidents['agency'].value_counts(normalize=True).to_dict(),
            'priority_distribution': incidents['priority'].value_counts(normalize=True).sort_index().to_dict(),
            'problem_nature_distribution': incidents['problem_nature'].value_counts(normalize=True).head(20).to_dict(),
            'hourly_weights': self._compute_hourly_weights(incidents),
            'seasonal_multipliers': self._compute_seasonal_multipliers(incidents),
        }
    
    def profile_response_times(self, incidents: pd.DataFrame) -> Dict:
        """Profile response time intervals by agency/priority."""
        profiles = {}
        for agency in incidents['agency'].unique():
            agency_data = incidents[incidents['agency'] == agency]
            profiles[agency] = {}
            for priority in sorted(incidents['priority'].unique()):
                pri_data = agency_data[agency_data['priority'] == priority]
                profiles[agency][priority] = {
                    'pickup_mean': pri_data['pickup_seconds'].mean() if 'pickup_seconds' in pri_data else None,
                    'interview_mean': pri_data['interview_seconds'].mean() if 'interview_seconds' in pri_data else None,
                    'dispatch_mean': pri_data['dispatch_seconds'].mean() if 'dispatch_seconds' in pri_data else None,
                    'turnout_mean': pri_data['turnout_seconds'].mean() if 'turnout_seconds' in pri_data else None,
                    'travel_mean': pri_data['travel_seconds'].mean() if 'travel_seconds' in pri_data else None,
                    'scene_mean': pri_data['scene_seconds'].mean() if 'scene_seconds' in pri_data else None,
                    'closeout_mean': pri_data['closeout_seconds'].mean() if 'closeout_seconds' in pri_data else None,
                }
        return {'time_profiles': profiles}
    
    def calibrate_town_spec(self, profile: Dict, base_spec: TownSpec) -> TownSpec:
        """Calibrate TownSpec parameters from real data profile."""
        # Adjust extent to match road density
        # Adjust street hierarchy targets
        # Adjust zoning proportions
        # Adjust addressing parameters
        # Adjust operational parameters
        return calibrated_spec
    
    def _entropy(self, values):
        """Compute entropy of circular values (bearings)."""
        hist, _ = np.histogram(values, bins=36, range=(0, 360), density=True)
        probs = hist[hist > 0]
        return -np.sum(probs * np.log(probs))
```

### Pattern 2: Hybrid Generation (Real Seed + Synthetic Expansion)

```
Real Core Area → Synthetic Expansion Rings → Seamless Blending
```

```python
# psap_research/integration/hybrid_generator.py
from dataclasses import dataclass
from typing import Dict, List, Optional
from pathlib import Path
import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union

@dataclass
class HybridConfig:
    core_gpkg: Path  # Real data GeoPackage
    expansion_rings: int = 2
    ring_width_m: float = 1000
    density_gradient: str = "decreasing"  # decreasing, increasing, constant
    blend_zone_width_m: float = 500  # Transition zone
    preserve_real_core: bool = True

class HybridGenerator:
    """Generate hybrid real+synthetic towns."""
    
    def __init__(self, config: HybridConfig, seed: int = 42):
        self.config = config
        self.seed = seed
        self.rng = np.random.default_rng(seed)
    
    def generate(self) -> Dict[str, gpd.GeoDataFrame]:
        """Generate hybrid town."""
        # 1. Load real core
        core_layers = self._load_core_layers()
        
        # 2. Define expansion extent
        core_extent = self._get_core_extent(core_layers)
        expansion_extent = self._compute_expansion_extent(core_extent)
        
        # 3. Generate synthetic expansion
        expansion_layers = self._generate_expansion(expansion_extent)
        
        # 4. Blend core + expansion
        blended = self._blend_layers(core_layers, expansion_layers)
        
        # 5. Validate topology
        validated = self._validate_topology(blended)
        
        return validated
    
    def _load_core_layers(self) -> Dict[str, gpd.GeoDataFrame]:
        """Load real data layers from core GPKG."""
        layers = {}
        for layer_name in ['RoadCenterLine', 'SiteStructureAddressPoint', 
                           'PsapPolygon', 'FirePolygon', 'PolicePolygon', 'EmsPolygon',
                           'ProvisioningPolygon', 'BuildingFootprints', 'Parcels']:
            try:
                layers[layer_name] = gpd.read_file(self.config.core_gpkg, layer=layer_name)
            except:
                pass
        return layers
    
    def _blend_layers(
        self, 
        core: Dict[str, gpd.GeoDataFrame], 
        expansion: Dict[str, gpd.GeoDataFrame]
    ) -> Dict[str, gpd.GeoDataFrame]:
        """Blend real and synthetic layers with smooth transition."""
        blended = {}
        all_layer_names = set(core.keys()) | set(expansion.keys())
        
        for layer_name in all_layer_names:
            core_layer = core.get(layer_name)
            exp_layer = expansion.get(layer_name)
            
            if core_layer is not None and exp_layer is not None:
                # Both exist - blend with transition zone
                blended[layer_name] = self._blend_geodataframes(
                    core_layer, exp_layer, layer_name
                )
            elif core_layer is not None:
                blended[layer_name] = core_layer
            else:
                blended[layer_name] = exp_layer
        
        return blended
    
    def _blend_geodataframes(
        self, 
        core: gpd.GeoDataFrame, 
        expansion: gpd.GeoDataFrame,
        layer_name: str
    ) -> gpd.GeoDataFrame:
        """Blend two GeoDataFrames with spatial transition."""
        if layer_name in ['RoadCenterLine']:
            # For streets: merge and snap at boundary
            return self._blend_streets(core, expansion)
        elif layer_name in ['SiteStructureAddressPoint']:
            # For points: keep real, add synthetic in expansion zone
            return self._blend_points(core, expansion)
        else:
            # For polygons: union with attribute precedence to core
            return self._blend_polygons(core, expansion)
    
    def _blend_streets(self, core: gpd.GeoDataFrame, expansion: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Blend street networks with snapping at boundary."""
        # Identify boundary zone
        core_union = core.geometry.unary_union
        expansion_union = expansion.geometry.unary_union
        boundary = core_union.boundary
        
        # Snap expansion streets to core at boundary
        blended_expansion = expansion.copy()
        # ... snapping logic ...
        
        # Combine
        combined = gpd.GeoDataFrame(pd.concat([core, blended_expansion], ignore_index=True), crs=core.crs)
        
        # Clean topology at seam
        import momepy
        graph = momepy.gdf_to_nx(combined, approach="primal")
        cleaned = momepy.nx_to_gdf(graph, lines=True, points=False)
        
        return cleaned
```

### Pattern 3: Targeted Augmentation (Fill Gaps)

```
Real Data (Sparse/Incomplete) → Gap Detection → Synthetic Fill → Complete Dataset
```

```python
# psap_research/integration/gap_filler.py
from dataclasses import dataclass
from typing import List, Dict, Optional
import pandas as pd
import geopandas as gpd
import numpy as np

@dataclass
class GapFillConfig:
    min_address_density: float = 100  # per km²
    min_building_coverage: float = 0.3
    min_road_density: float = 5  # km/km²
    min_intersection_density: float = 50  # per km²
    max_gap_distance_m: float = 500

class GapFiller:
    """Fill gaps in real data with synthetic generation."""
    
    def __init__(self, config: GapFillConfig, seed: int = 42):
        self.config = config
        self.rng = np.random.default_rng(seed)
    
    def fill_address_gaps(
        self, 
        real_addresses: gpd.GeoDataFrame,
        streets: gpd.GeoDataFrame,
        parcels: gpd.GeoDataFrame
    ) -> gpd.GeoDataFrame:
        """Add synthetic addresses where real data is sparse."""
        # Identify gaps: street segments with few/no addresses
        street_address_counts = self._count_addresses_per_segment(real_addresses, streets)
        gap_segments = street_address_counts[street_address_counts < 5]
        
        synthetic_addresses = []
        for _, segment in gap_segments.iterrows():
            synthetic = self._generate_addresses_on_segment(
                segment.geometry, segment.street_name, segment
            )
            synthetic_addresses.extend(synthetic)
        
        if synthetic_addresses:
            synthetic_gdf = gpd.GeoDataFrame(synthetic_addresses, crs=real_addresses.crs)
            # Mark as synthetic
            synthetic_gdf['data_source'] = 'SYNTHETIC_AUGMENTED'
            return gpd.GeoDataFrame(pd.concat([real_addresses, synthetic_gdf], ignore_index=True), crs=real_addresses.crs)
        return real_addresses
    
    def fill_building_gaps(
        self,
        real_buildings: gpd.GeoDataFrame,
        parcels: gpd.GeoDataFrame
    ) -> gpd.GeoDataFrame:
        """Add buildings to parcels missing them."""
        # Find parcels without buildings
        parcels_with_buildings = self._parcels_with_buildings(parcels, real_buildings)
        empty_parcels = parcels[~parcels.index.isin(parcels_with_buildings.index)]
        
        synthetic_buildings = []
        for _, parcel in empty_parcels.iterrows():
            buildings = self._generate_buildings_on_parcel(parcel)
            synthetic_buildings.extend(buildings)
        
        if synthetic_buildings:
            synthetic_gdf = gpd.GeoDataFrame(synthetic_buildings, crs=real_buildings.crs)
            synthetic_gdf['data_source'] = 'SYNTHETIC_AUGMENTED'
            return gpd.GeoDataFrame(pd.concat([real_buildings, synthetic_gdf], ignore_index=True), crs=real_buildings.crs)
        return real_buildings
    
    def fill_street_gaps(
        self,
        real_streets: gpd.GeoDataFrame,
        target_density: float
    ) -> gpd.GeoDataFrame:
        """Add streets to reach target density."""
        current_density = self._compute_road_density(real_streets)
        if current_density >= target_density:
            return real_streets
        
        # Generate additional streets in low-density areas
        # ... implementation ...
        return augmented_streets
```

---

## Calibration & Validation Loop

```python
# psap_research/integration/calibration.py
from dataclasses import dataclass
from typing import Dict, List, Callable
import numpy as np
from scipy import stats

@dataclass
class CalibrationTarget:
    metric_name: str
    target_value: float
    tolerance: float  # absolute or relative
    weight: float = 1.0

@dataclass
class CalibrationResult:
    parameter_values: Dict[str, float]
    achieved_metrics: Dict[str, float]
    target_metrics: Dict[str, float]
    errors: Dict[str, float]
    converged: bool
    iterations: int

class CalibrationEngine:
    """Calibrate synthetic generator parameters to match real data targets."""
    
    def __init__(self, generator_fn: Callable, targets: List[CalibrationTarget]):
        self.generator_fn = generator_fn
        self.targets = targets
    
    def calibrate(
        self,
        initial_params: Dict[str, float],
        bounds: Dict[str, tuple],
        max_iterations: int = 50,
        learning_rate: float = 0.1
    ) -> CalibrationResult:
        """Calibrate using gradient-free optimization (Nelder-Mead or Bayesian)."""
        from scipy.optimize import minimize
        
        def objective(params):
            # Generate with current params
            params_dict = dict(zip(initial_params.keys(), params))
            result = self.generator_fn(params_dict)
            
            # Compute metrics
            metrics = self._compute_metrics(result)
            
            # Compute weighted error
            error = 0
            for target in self.targets:
                achieved = metrics.get(target.metric_name, 0)
                target_val = target.target_value
                error += target.weight * ((achieved - target_val) / target.tolerance) ** 2
            
            return error
        
        # Optimize
        result = minimize(
            objective,
            list(initial_params.values()),
            bounds=list(bounds.values()),
            method='Nelder-Mead',
            options={'maxiter': max_iterations, 'xatol': 1e-4}
        )
        
        # Final evaluation
        best_params = dict(zip(initial_params.keys(), result.x))
        final_result = self.generator_fn(best_params)
        final_metrics = self._compute_metrics(final_result)
        
        return CalibrationResult(
            parameter_values=best_params,
            achieved_metrics=final_metrics,
            target_metrics={t.metric_name: t.target_value for t in self.targets},
            errors={t.metric_name: final_metrics.get(t.metric_name, 0) - t.target_value 
                   for t in self.targets},
            converged=result.success,
            iterations=result.nit
        )
```

---

## Validation & Quality Gates

```python
# psap_research/integration/validation.py
from dataclasses import dataclass
from typing import Dict, List, Tuple
import numpy as np
from scipy import stats

@dataclass
class ValidationResult:
    passed: bool
    metrics: Dict[str, Dict]  # metric -> {real, synthetic, diff, p_value}
    distributional_tests: Dict[str, Dict]
    expert_flags: List[str]

class SyntheticDataValidator:
    """Validate synthetic data against real data benchmarks."""
    
    def __init__(self, real_data: Dict, synthetic_data: Dict):
        self.real = real_data
        self.synthetic = synthetic_data
    
    def validate_all(self) -> ValidationResult:
        """Run comprehensive validation suite."""
        metrics = {}
        dist_tests = {}
        flags = []
        
        # 1. Distributional tests (KS, AD, Wasserstein)
        for key in self._get_comparable_keys():
            real_vals = self._extract_values(self.real, key)
            synth_vals = self._extract_values(self.synthetic, key)
            
            if len(real_vals) > 10 and len(synth_vals) > 10:
                # KS test
                ks_stat, ks_p = stats.ks_2samp(real_vals, synth_vals)
                
                # Wasserstein distance
                from scipy.stats import wasserstein_distance
                w_dist = wasserstein_distance(real_vals, synth_vals)
                
                # Moment comparison
                moment_diff = {
                    'mean_diff': abs(np.mean(real_vals) - np.mean(synth_vals)),
                    'std_ratio': np.std(synth_vals) / np.std(real_vals),
                    'skew_diff': abs(stats.skew(real_vals) - stats.skew(synth_vals)),
                }
                
                dist_tests[key] = {
                    'ks_statistic': ks_stat,
                    'ks_p_value': ks_p,
                    'wasserstein_distance': w_dist,
                    'moment_diff': moment_diff,
                    'passed': ks_p > 0.05 and w_dist < 0.1 * np.std(real_vals)
                }
                
                if not dist_tests[key]['passed']:
                    flags.append(f"Distributional mismatch in {key}: KS p={ks_p:.3f}, W={w_dist:.3f}")
        
        # 2. Moment matching
        for key in ['response_times', 'travel_times', 'block_areas', 'street_lengths']:
            if key in self.real and key in self.synthetic:
                metrics[key] = self._compare_moments(key)
        
        # 3. Spatial pattern validation
        spatial_tests = self._validate_spatial_patterns()
        dist_tests.update(spatial_tests)
        
        # 4. Correlation structure
        corr_tests = self._validate_correlation_structure()
        dist_tests.update(corr_tests)
        
        passed = all(t.get('passed', True) for t in dist_tests.values())
        
        return ValidationResult(
            passed=passed,
            metrics=metrics,
            distributional_tests=dist_tests,
            expert_flags=flags
        )
    
    def _validate_spatial_patterns(self) -> Dict:
        """Validate spatial patterns match."""
        tests = {}
        
        # Ripley's K for clustering
        # Moran's I for spatial autocorrelation
        # Quadrat analysis for intensity variation
        
        return tests
    
    def _validate_correlation_structure(self) -> Dict:
        """Validate correlation matrices match."""
        real_corr = self._compute_correlation_matrix(self.real)
        synth_corr = self._compute_correlation_matrix(self.synthetic)
        
        # Frobenius norm of difference
        frob_norm = np.linalg.norm(real_corr - synth_corr, 'fro')
        
        return {
            'correlation_frobenius_diff': frob_norm,
            'passed': frob_norm < 0.2  # Threshold
        }
```

---

## CLI Integration

```bash
# psap_research/cli/integration_commands.py
import typer
from pathlib import Path

app = typer.Typer(name="psap-integrate", help="Data integration commands")

@app.command()
def profile_real_data(
    streets: Path = typer.Argument(..., help="Streets GeoPackage"),
    addresses: Path = typer.Argument(..., help="Addresses GeoPackage"),
    incidents: Path = typer.Option(None, help="Incidents Parquet"),
    parcels: Path = typer.Option(None, help="Parcels GeoPackage"),
    boundaries: Path = typer.Option(None, help="Boundaries GeoPackage"),
    output: Path = typer.Option("real_data_profile.json", "-o", "--output"),
    seed: int = 42
):
    """Extract statistical profile from real data for calibration."""
    from psap_research.integration.real_data_seeder import RealDataSeeder
    from psap_research.integration.real_data_seeder import RealDataSeeder
    import geopandas as gpd
    import pandas as pd
    
    seeder = RealDataSeeder(seed=seed)
    
    # Load data
    streets_gdf = gpd.read_file(streets)
    addresses_gdf = gpd.read_file(addresses)
    boundaries_gdf = gpd.read_file(boundaries)
    
    profile = {}
    profile.update(seeder.profile_geography(streets_gdf, None, None, boundaries_gdf))
    profile.update(seeder.profile_addresses(addresses_gdf))
    
    if incidents:
        incidents_df = pd.read_parquet(incidents)
        profile.update(seeder.profile_incidents(incidents_df))
    
    import json
    with open(output, 'w') as f:
        json.dump(profile, f, indent=2, default=str)
    
    typer.echo(f"Profile saved to {output}")

@app.command()
def generate_hybrid(
    core_gpkg: Path = typer.Argument(..., help="Real data core GeoPackage"),
    output: Path = typer.Option("hybrid_town.gpkg", "-o", "--output"),
    rings: int = typer.Option(2, "--rings"),
    ring_width: int = typer.Option(1000, "--ring-width"),
    density_gradient: str = typer.Option("decreasing", "--gradient"),
    seed: int = 42
):
    """Generate hybrid town from real core + synthetic expansion."""
    from psap_research.integration.hybrid_generator import HybridGenerator, HybridConfig
    
    config = HybridConfig(
        core_gpkg=core_gpkg,
        expansion_rings=rings,
        ring_width_m=ring_width,
        density_gradient=density_gradient
    )
    
    generator = HybridGenerator(config, seed=seed)
    layers = generator.generate()
    
    # Export
    import pyogrio
    for name, gdf in layers.items():
        pyogrio.write_dataframe(gdf, output, layer=name, driver="GPKG", 
                               overwrite=(name == list(layers.keys())[0]), append=(name != list(layers.keys())[0]))
    
    typer.echo(f"Hybrid town saved to {output}")

@app.command()
def augment_gaps(
    input_gpkg: Path = typer.Argument(..., help="Input GeoPackage with real data"),
    output: Path = typer.Option("augmented.gpkg", "-o", "--output"),
    min_address_density: float = 100,
    min_building_coverage: float = 0.3,
    seed: int = 42
):
    """Fill gaps in real data with synthetic augmentation."""
    import geopandas as gpd
    from psap_research.integration.gap_filler import GapFiller, GapFillConfig
    
    config = GapFillConfig(
        min_address_density=min_address_density,
        min_building_coverage=min_building_coverage
    )
    
    filler = GapFiller(config, seed=seed)
    
    # Load layers
    streets = gpd.read_file(input_gpkg, layer="RoadCenterLine")
    addresses = gpd.read_file(input_gpkg, layer="SiteStructureAddressPoint")
    parcels = gpd.read_file(input_gpkg, layer="Parcel")
    buildings = gpd.read_file(input_gpkg, layer="BuildingFootprint")
    
    # Fill gaps
    addresses = filler.fill_address_gaps(addresses, streets, gpd.read_file(input_gpkg, layer="Parcel"))
    buildings = filler.fill_building_gaps(buildings, gpd.read_file(input_gpkg, layer="Parcel"))
    streets = filler.fill_street_gaps(streets, target_density=8.0)
    
    # Write output
    import pyogrio
    layers = gpd.read_file(input_gpkg)  # Get all layers
    # ... replace augmented layers ...
    typer.echo(f"Augmented data saved to {output}")

@app.command()
def calibrate(
    target_profile: Path = typer.Argument(..., help="Real data profile JSON"),
    base_spec: Path = typer.Argument(..., help="Base town_spec.yaml"),
    output_spec: Path = typer.Option("calibrated_spec.yaml", "-o", "--output"),
    max_iterations: int = 50
):
    """Calibrate town spec to match real data profile."""
    import json
    import yaml
    from psap_research.integration.calibration import CalibrationEngine, CalibrationTarget
    from psap_research.config.schemas import TownSpec
    
    # Load target profile
    with open(target_profile) as f:
        target_profile = json.load(f)
    
    # Load base spec
    base_spec = TownSpec.from_yaml(base_spec)
    
    # Define calibration targets
    targets = [
        CalibrationTarget("road_density", target_profile["road_density_km_per_km2"], 
                         target_profile["road_density_km_per_km2"] * 0.1),
        CalibrationTarget("intersection_density", target_profile["intersection_density_per_km2"],
                         target_profile["intersection_density_per_km2"] * 0.1),
        CalibrationTarget("incidents_per_1000", target_profile["incidents_per_1000_per_year"],
                         target_profile["incidents_per_1000_per_year"] * 0.1),
        # ... more targets
    ]
    
    # Define parameters to calibrate
    initial_params = {
        "arterial_spacing": 800,
        "collector_spacing": 300,
        "local_spacing": 100,
        "residential_proportion": 0.65,
        "commercial_proportion": 0.20,
        # ...
    }
    
    bounds = {
        "arterial_spacing": (400, 2000),
        "collector_spacing": (150, 600),
        # ...
    }
    
    # Run calibration
    # ... implementation ...
    
    # Save calibrated spec
    with open(output_spec, 'w') as f:
        yaml.dump(calibrated_spec.__dict__, f, default_flow_style=False)
    
    typer.echo(f"Calibrated spec saved to {output_spec}")
```

---

## Pipeline Orchestration

```yaml
# config/integration_pipeline.yaml
pipeline:
  name: "psap_data_integration"
  
  stages:
    - name: "ingest_real_data"
      description: "Load and validate real data sources"
      inputs:
        - streets_gpkg
        - addresses_gpkg
        - incidents_parquet
        - parcels_gpkg
        - boundaries_gpkg
        - demographics_csv
      outputs:
        - real_data_profile.json
        - validated_layers/
      validation:
        - schema_check
        - geometry_validity
        - crs_consistency
    
    - name: "profile_extraction"
      description: "Extract statistical profiles"
      inputs:
        - validated_layers/
      outputs:
        - real_data_profile.json
      calibration_targets:
        - road_density
        - intersection_density
        - address_density
        - incident_rates
        - time_profiles
    
    - name: "calibration"
      description: "Calibrate synthetic generator to match real profiles"
      inputs:
        - base_town_spec.yaml
        - real_data_profile.json
      outputs:
        - calibrated_spec.yaml
        - calibration_report.json
      optimization:
        method: "nelder_mead"
        max_iterations: 50
        targets:
          - metric: "road_density_km_per_km2"
            weight: 1.0
          - metric: "intersection_density_per_km2"
            weight: 1.0
          - metric: "incidents_per_1000_per_year"
            weight: 2.0
    
    - name: "hybrid_generation"
      description: "Generate hybrid real+synthetic town"
      inputs:
        - core_gpkg (real data)
        - calibrated_spec.yaml
      outputs:
        - hybrid_town.gpkg
        - routing_graph.pkl
      modes:
        - radial_expansion
        - corridor_development
        - infill
        - satellite_towns
    
    - name: "gap_augmentation"
      description: "Fill remaining gaps in real data"
      inputs:
        - hybrid_town.gpkg
      outputs:
        - complete_town.gpkg
      fill_types:
        - address_gaps
        - building_gaps
        - street_gaps
    
    - name: "validation"
      description: "Validate synthetic output against real data"
      inputs:
        - complete_town.gpkg
        - real_data_profile.json
      outputs:
        - validation_report.json
        - validation_passed: bool
      thresholds:
        ks_p_value: 0.05
        wasserstein_threshold: 0.1
        correlation_frobenius: 0.2
```

---

## Summary: What Real Data You Need

| If You Have... | You Can Generate... | Quality Level |
|----------------|---------------------|---------------|
| **Only OSM** | Fully synthetic town | Baseline |
| **OSM + Local Streets** | Calibrated street network | Good |
| **+ Address Points** | Full address interpolation | Better |
| **+ Incidents (6mo+)** | Calibrated workload + response times | Good |
| **+ Parcels + Buildings** | Realistic parcels/buildings | High |
| **+ AVL/Travel Times** | Calibrated routing | High |
| **+ Demographics** | Equity-weighted incidents | High |
| **+ Full CAD (1yr+)** | Fully calibrated, high-fidelity | Production-grade |

**Minimum Viable**: OSM streets + synthetic everything else (baseline)
**Recommended**: Local streets + addresses + 1yr incidents + parcels (high fidelity)
**Gold Standard**: All above + AVL + demographics + weather + events (research-grade)

---

## CLI Quick Reference

```bash
# Profile real data
uv run psap-integrate profile-real-data \
  streets.gpkg addresses.gpkg incidents.parquet \
  -o real_profile.json

# Calibrate town spec
uv run psap-integrate calibrate \
  real_profile.json base_spec.yaml \
  -o calibrated_spec.yaml

# Generate hybrid town
uv run psap-integrate generate-hybrid \
  real_core.gpkg \
  -o hybrid.gpkg --rings 2 --ring-width 1000

# Augment gaps
uv run psap-integrate augment-gaps \
  hybrid.gpkg -o complete.gpkg

# Validate
uv run psap-integrate validate \
  complete.gpkg real_profile.json
```

---

*This data integration framework ensures that PSAP Research can leverage whatever real data is available—from minimal OSM to comprehensive CAD/AVL/demographics—producing the highest-fidelity synthetic data possible given the available inputs.*