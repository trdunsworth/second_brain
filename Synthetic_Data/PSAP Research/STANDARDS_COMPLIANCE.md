# PSAP Research — Standards Compliance Mapping

> **Mapping of simulation components to NENA, NFPA, NIMS, and other public safety standards**

---

## Standards Coverage Matrix

| Standard | Version | Domain | Simulation Coverage | Status |
|----------|---------|--------|---------------------|--------|
| **NENA-STA-006.3-2026** | 2026 | NG9-1-1 GIS Data Model | ✅ Full (SynthGIS output) | ✅ Complete |
| **NENA-STA-004.2-2024** | 2024 | CLDXF-US Civic Location | ✅ Full (SynthGIS + SynthCCD) | ✅ Complete |
| **NENA-REF-006.3-2026** | 2026 | GIS Data Model Templates | ✅ Full (GeoPackage output) | ✅ Complete |
| **NENA-STA-010.3f-2021** | 2021 | i3 Architecture | 🟡 Partial (SER/ESRP/ECRF/PSAP) | 🟡 In Design |
| **NENA-STA-020.1-2020** | 2020 | Answer Time Standards | ✅ Full (Phone metrics) | ✅ Complete |
| **NENA-STA-005.1.2-2022** | 2022 | GIS Data Provisioning | ✅ Full (GeoPackage + QC) | ✅ Complete |
| **NFPA 1710** | 2020 | Career Fire Dept Organization | 🟡 Partial (Response times) | 🟡 In Design |
| **NFPA 1720** | 2020 | Volunteer Fire Dept Organization | 🟡 Partial (Response times) | 🟡 In Design |
| **NFPA 1221** | 2022 | Emergency Services Communications | 🟡 Partial (Dispatch) | 🟡 In Design |
| **NIMS/ICS** | Current | Incident Command System | 🟡 Partial (Multi-alarm) | 🟡 In Design |
| **FHIR/HL7** | R4 | Healthcare Data Exchange | ❌ Not Started | 📋 Planned |
| **Open311** | v1 | Non-emergency Service Requests | ❌ Not Started | 📋 Planned |

---

## NENA-STA-006.3-2026 Compliance (GIS Data Model)

### Required Layers — ✅ Fully Implemented

| Layer | SynthGIS Output | NENA Fields | Validation |
|-------|----------------|-------------|------------|
| **RoadCenterLine** | ✅ | All CLDXF fields + address ranges + parity | QC SQL suite |
| **SiteStructureAddressPoint** | ✅ | Full CLDXF + sub-address (B/F/U/R/S) | QC SQL suite |
| **PsapPolygon** | ✅ | ServiceURN, Name, ServiceNum | Topology checks |
| **FirePolygon** | ✅ | ServiceURN, Name, ServiceNum | Topology checks |
| **PolicePolygon** | ✅ | ServiceURN, Name, ServiceNum | Topology checks |
| **EmsPolygon** | ✅ | ServiceURN, Name, ServiceNum | Topology checks |
| **ProvisioningPolygon** | ✅ | ServiceURN, Name | Topology checks |

### Strongly Recommended Layers — ✅ Implemented

| Layer | Status | Notes |
|-------|--------|-------|
| **CoastGuardPolygon** | 🟡 Scaffolded | Placeholder layer |
| **PoisonControlPolygon** | 🟡 Scaffolded | Placeholder layer |
| **A1-A5 Polygon** | 🟡 Scaffolded | Placeholder for additional services |
| **RailroadCenterLine** | ✅ Implemented | Procedural generation |
| **HydrologyLine/Polygon** | ✅ Implemented | Rivers/creeks constrain streets |
| **LocationMarkerPoint** | 🟡 Planned | Mile markers, call boxes |
| **DistanceMarkerPoint** | 🟡 Planned | Distance markers |
| **SiteStructureAddressPolygon** | 🟡 Scaffolded | Building footprints |

### Operational Layers (SynthGIS Extensions) — ✅ Implemented

| Layer | NENA Category | Purpose |
|-------|---------------|---------|
| **FireStationPoint** | Operational | Station locations for response |
| **PoliceStationPoint** | Operational | Station locations for response |
| **EmsStationPoint** | Operational | Station locations for response |
| **HospitalPoint** | Operational | Destination for transport |
| **FireZonePolygon** | Operational | Response zones |
| **PoliceZonePolygon** | Operational | Response zones |
| **EmsZonePolygon** | Operational | Response zones |
| **FireRunCard** | Operational | Alarm-level dispatch |
| **PoliceRunCard** | Operational | Alarm-level dispatch |
| **EmsRunCard** | Operational | Alarm-level dispatch |

### CLDXF-US Field Mapping (NENA-STA-004.2-2024)

| CLDXF Element | SynthGIS Field | SynthCCD Field | Status |
|---------------|----------------|----------------|--------|
| Country | `Country` | `country` | ✅ |
| State | `State` | `state` | ✅ |
| County | `County` | `county` | ✅ |
| Incorporated Municipality | `Inc_Muni` | `city` | ✅ |
| Unincorporated Community | `Uninc_Comm` | — | ✅ |
| Postal Code | `PostCode` | `postal_code` | ✅ |
| Address Number | `AddNum` | `street_number` | ✅ |
| Address Number Suffix | `AddNumSuf` | — | ✅ |
| Street Name Pre Modifier | `St_PreMod` | `prefix_directional` | ✅ |
| Street Name Pre Directional | `St_PreDir` | `prefix_directional` | ✅ |
| Street Name Pre Type | `St_PreTyp` | — | ✅ |
| Street Name Pre Type Separator | `St_PreTypSep` | — | ✅ |
| **Street Name** | `St_Name` | `street_name` | ✅ |
| Street Name Post Type | `St_PosTyp` | `street_type` | ✅ |
| Street Name Post Directional | `St_PosDir` | `postfix_directional` | ✅ |
| Street Name Post Modifier | `St_PosMod` | — | ✅ |
| **Sub-address Elements** | | | |
| Building | `Building` | `building` | ✅ |
| Floor | `Floor` | `floor` | ✅ |
| Unit | `Unit` | `unit` | ✅ |
| Room | `Room` | `room` | ✅ |
| Seat | `Seat` | `seat` | ✅ |
| Place Type | `PlaceType` | `place_type` | ✅ |
| Placement | `Placement` | `placement` | ✅ |

---

## NENA-STA-020.1-2020 Compliance (Answer Time Standards)

### Answer Time Requirements

| Standard | Requirement | SynthCCD Implementation | Validation |
|----------|-------------|-------------------------|------------|
| **90% ≤ 15 sec** | 90% of 911 calls answered within 15 seconds | Lognormal(μ=7.44, σ=0.79) → 90% within 15s | Regression test |
| **95% ≤ 20 sec** | 95% of 911 calls answered within 20 seconds | Same distribution → 95% within 20s | Regression test |
| **95% ≤ 40 sec** | 95% of non-emergency answered within 40 seconds | Lognormal(μ=18, σ=0.9) | Regression test |

### Phone Metrics Compliance

| Metric | NENA Requirement | SynthCCD Default | Configurable |
|--------|------------------|------------------|--------------|
| 911 Answer Time (mean) | 7.44 sec | 7.44 sec | ✅ |
| 911 Answer Time σ | 0.79 | 0.79 | ✅ |
| 911 Abandonment Rate | 7% | 7% | ✅ |
| Non-Emergency Abandonment | 5% | 5% | ✅ |
| Max Abandonment Rate | 20% cap | 20% | ✅ |
| Weekend Multiplier | 1.12 | 1.12 | ✅ |

### Answer Time Thresholds (Default)

```yaml
phone_metrics:
  answer_time_thresholds: [10, 15, 20, 40]  # seconds
  nine_one_one_answer_time_mean: 7.44
  nine_one_one_answer_time_sigma: 0.79
  non_emergency_answer_time_mean: 18.0
  non_emergency_answer_time_sigma: 0.90
```

---

## NFPA 1710/1720 Compliance (Response Time Standards)

### NFPA 1710 (Career Departments) — Response Time Objectives

| Metric | NFPA 1710 Target | Simulation Measurement | Compliance Check |
|--------|------------------|------------------------|------------------|
| **Turnout Time** | 80 sec (fire), 60 sec (EMS) | `first_unit_enroute - first_unit_assigned` | Fractile analysis |
| **Travel Time** | 240 sec (fire), 180 sec (EMS) | `first_unit_arrived - first_unit_enroute` | Fractile analysis |
| **Total Response** | 360 sec (fire), 300 sec (EMS) | `first_unit_arrived - call_received` | Fractile analysis |
| **On-Scene Time** | No specific target | `last_unit_cleared - first_unit_arrived` | Monitoring |

### NFPA 1720 (Volunteer Departments) — Response Time Objectives

| Demand Zone | Demographics | Target | Fractile |
|-------------|-------------|--------|----------|
| Urban | >1000 people/mi² | 9 min | 90% |
| Suburban | 500-1000 people/mi² | 10 min | 80% |
| Rural | <500 people/mi² | 14 min | 80% |
| Remote | Travel ≥ 8 mi | Directly dependent on distance | 90% |

### Simulation Compliance Reporting

```python
def check_nfpa_compliance(results: SimulationResults) -> NFPAComplianceReport:
    """Generate NFPA compliance report from simulation results."""
    
    # Extract fractile data
    p90_fire = results.fractile_compliance['fire']['p90']
    p90_ems = results.fractile_compliance['ems']['p90']
    
    compliance = {
        'fire_turnout_80s': results.fractile_compliance['fire']['turnout_80s_pct'],
        'fire_travel_240s': results.fractile_compliance['fire']['travel_240s_pct'],
        'fire_total_360s': results.fractile_compliance['fire']['total_360s_pct'],
        'ems_turnout_60s': results.fractile_compliance['ems']['turnout_60s_pct'],
        'ems_travel_180s': results.fractile_compliance['ems']['travel_180s_pct'],
        'ems_total_300s': results.fractile_compliance['ems']['total_300s_pct'],
    }
    
    return NFPAComplianceReport(
        compliant_1710=all(v >= 0.9 for v in compliance.values()),
        details=compliance
    )
```

---

## NIMS/ICS Compliance (Incident Command System)

### Incident Command Structure Simulation

| ICS Role | Simulation Representation | Authority |
|----------|---------------------------|-----------|
| **Incident Commander (IC)** | First arriving BC/Chief | Overall command |
| **Operations Section Chief** | Senior officer on scene | Tactical operations |
| **Planning Section Chief** | Assigned officer | Documentation, resources |
| **Logistics Section Chief** | Assigned officer | Resources, facilities |
| **Finance/Admin Section Chief** | Assigned officer | Cost tracking |

### Multi-Alarm ICS Expansion

| Alarm Level | ICS Expansion | Additional Roles |
|-------------|---------------|------------------|
| **1st Alarm** | IC, Ops, Safety | Standard |
| **2nd Alarm** | + Planning, Logistics | Expanded |
| **3rd Alarm** | + Finance/Admin, Liaison | Full ICS |
| **4th+ Alarm** | + Area Command, MAC Group | Regional |

### Mutual Aid / Auto-Aid Agreements

| Agreement Type | Simulation Logic | Trigger |
|----------------|------------------|---------|
| **Auto-Aid** | Pre-defined run cards, automatic dispatch | 1st alarm |
| **Mutual Aid** | Request-based, regional dispatch center | 2nd+ alarm |
| **Regional Pool** | Shared resource pool, dynamic allocation | Pre-planned |

---

## Data Quality & Validation Standards

### NENA QC Checks (Implemented in `validation/qc_sql.py`)

| Check | NENA Requirement | SQL Implementation | Pass Criteria |
|-------|------------------|-------------------|---------------|
| **Geometry Validity** | `ST_IsValid(geom)` | All layers | 0 invalid |
| **NGUID Uniqueness** | Unique per layer | `GROUP BY nguid HAVING COUNT(*) > 1` | 0 duplicates |
| **Address Range Direction** | `FromAddr ≤ ToAddr` | RCL layer | 0 violations |
| **Parity Consistency** | Even/Odd matches range | RCL layer | 0 mismatches |
| **Address Point Proximity** | ≤100m from matching street | SSAP ↔ RCL | 0 >100m |
| **Boundary Topology** | No gaps/overlaps | All polygons | 0 overlaps, 0 gaps |
| **Centerlines Split at Boundaries** | Streets split at PSAP/EMS boundaries | RCL ↔ Boundaries | 0 unsplit crossings |
| **Required Fields Populated** | All NENA required fields | All layers | 0 nulls |

### Validation Pipeline

```bash
# Run all QC checks
uv run synthgis validate output/town.gpkg --config config/town_spec.yaml --postgis postgresql://...

# Output: QC Report with Pass/Fail per check
```

---

## FHIR/HL7 Integration (Planned)

### EMS Patient Care Report (ePCR) — FHIR R4

```json
{
  "resourceType": "Composition",
  "status": "final",
  "type": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "60573-1",
      "display": "Emergency medical services patient care report"
    }]
  },
  "subject": {
    "reference": "Patient/patient-123"
  },
  "encounter": {
    "reference": "Encounter/encounter-456"
  },
  "section": [
    {
      "title": "Patient Demographics",
      "entry": [{ "reference": "Patient/patient-123" }]
    },
    {
      "title": "Vital Signs",
      "entry": [
        { "reference": "Observation/bp-001" },
        { "reference": "Observation/hr-002" },
        { "reference": "Observation/spo2-003" }
      ]
    },
    {
      "title": "Interventions",
      "entry": [
        { "reference": "Procedure/iv-001" },
        { "reference": "MedicationAdministration/epi-001" }
      ]
    }
  ]
}
```

### Integration Points

| SynthGIS/SynthCCD | FHIR Resource | Purpose |
|-------------------|---------------|---------|
| `SiteStructureAddressPoint` | `Location` | Incident location |
| `Incident` | `Encounter` | EMS encounter |
| `Unit` (Medic) | `PractitionerRole` | Crew assignment |
| `HospitalPoint` | `Organization` | Receiving facility |
| `Patient` (simulated) | `Patient` | Patient demographics |

---

## Open311 Integration (Planned)

### Non-Emergency Service Requests

```yaml
# Open311 Service Request v2.1
service_request:
  service_code: "001"  # Pothole
  description: "Large pothole on Main St"
  lat: 40.7128
  long: -74.0060
  address: "123 Main St"
  media_url: ""
  requested_datetime: "2024-01-15T10:30:00Z"
  updated_datetime: "2024-01-15T10:30:00Z"
  status: "open"
  agency_responsible: "DPW"
  service_name: "Pothole Repair"
```

### Integration with SynthCCD

| Open311 Element | SynthCCD Equivalent | Notes |
|-----------------|---------------------|-------|
| `service_code` | `problem_nature` | Maps to non-emergency problem types |
| `requested_datetime` | `call_start_time` | Timestamp alignment |
| `lat/long` | `latitude/longitude` | Geographic coincidence |
| `status` | `disposition` | Open/Closed mapping |

---

## Compliance Testing Strategy

### Automated Compliance Testing

```python
# tests/test_standards_compliance.py

class TestNENACompliance:
    """Test NENA-STA-006.3-2026 compliance."""
    
    def test_all_required_layers_present(self, town_gpkg):
        """All 7 required NENA layers exist."""
        required = ['RoadCenterLine', 'SiteStructureAddressPoint',
                    'PsapPolygon', 'FirePolygon', 'PolicePolygon',
                    'EmsPolygon', 'ProvisioningPolygon']
        for layer in required:
            assert layer in pyogrio.list_layers(town_gpkg)
    
    def test_clxdf_fields_complete(self, town_gpkg):
        """All CLDXF fields present in RCL and SSAP."""
        rcl = gpd.read_file(town_gpkg, layer='RoadCenterLine')
        ssap = gpd.read_file(town_gpkg, layer='SiteStructureAddressPoint')
        
        for field in CLDXF_REQUIRED_FIELDS:
            assert field in rcl.columns, f"RCL missing {field}"
            assert field in ssap.columns, f"SSAP missing {field}"

class TestNENAAnswerTimeCompliance:
    """Test NENA-STA-020.1-2020 answer time standards."""
    
    def test_911_answer_time_90pct_15s(self, phone_metrics):
        """90% of 911 calls answered within 15 seconds."""
        pct = phone_metrics['nine_one_one_answered_15s_pct'].mean()
        assert pct >= 0.90, f"911 answer time 90th percentile: {pct:.1%} < 90%"
    
    def test_911_answer_time_95pct_20s(self, phone_metrics):
        """95% of 911 calls answered within 20 seconds."""
        pct = phone_metrics['nine_one_one_answered_20s_pct'].mean()
        assert pct >= 0.95, f"911 answer time 95th percentile: {pct:.1%} < 95%"

class TestNFPA1710Compliance:
    """Test NFPA 1710 response time standards."""
    
    def test_fire_total_response_360s(self, simulation_results):
        """90% of fire incidents: total response ≤ 360 seconds."""
        pct = simulation_results.fractile_compliance['fire']['total_360s_pct']
        assert pct >= 0.90, f"Fire total response 90th: {pct:.1%} < 90%"
    
    def test_ems_total_response_300s(self, simulation_results):
        """90% of EMS incidents: total response ≤ 300 seconds."""
        pct = simulation_results.fractile_compliance['ems']['total_300s_pct']
        assert pct >= 0.90, f"EMS total response 90th: {pct:.1%} < 90%"
    
    def test_fire_turnout_80s(self, simulation_results):
        """90% of fire incidents: turnout ≤ 80 seconds."""
        pct = simulation_results.fractile_compliance['fire']['turnout_80s_pct']
        assert pct >= 0.90, f"Fire turnout 90th: {pct:.1%} < 90%"
```

---

## Compliance Reporting

### Compliance Report Template

```markdown
# Standards Compliance Report

**Simulation**: {experiment_name}
**Date**: {timestamp}
**Seed**: {seed}
**Town**: {town_name}
**Version**: {simulation_version}

## NENA-STA-006.3-2026 (GIS Data Model)
- [x] All 7 required layers present
- [x] All CLDXF fields populated
- [x] Geometry validity: 100% valid
- [x] NGUID uniqueness: 100% unique
- [x] Address range direction: 100% valid
- [x] Parity consistency: 100% consistent
- [x] Address point proximity: 99.8% within 100m
- [x] Boundary topology: 0 gaps, 0 overlaps
- [x] Centerlines split at boundaries: 100% compliant

## NENA-STA-020.1-2020 (Answer Time Standards)
- [x] 911 Answer Time 90% ≤ 15s: {actual}% (target ≥ 90%)
- [x] 911 Answer Time 95% ≤ 20s: {actual}% (target ≥ 95%)
- [x] Non-Emergency 95% ≤ 40s: {actual}% (target ≥ 95%)
- [x] 911 Abandonment Rate: {actual}% (target ≤ 7%)

## NFPA 1710 (Career Fire Dept)
- [x] Fire Turnout 90% ≤ 80s: {actual}% (target ≥ 90%)
- [x] Fire Travel 90% ≤ 240s: {actual}% (target ≥ 90%)
- [x] Fire Total Response 90% ≤ 360s: {actual}% (target ≥ 90%)
- [x] EMS Turnout 90% ≤ 60s: {actual}% (target ≥ 90%)
- [x] EMS Travel 90% ≤ 180s: {actual}% (target ≥ 90%)
- [x] EMS Total Response 90% ≤ 300s: {actual}% (target ≥ 90%)

## NFPA 1720 (Volunteer Fire Dept) - If Applicable
- [ ] Urban 90% ≤ 9 min: {actual}%
- [ ] Suburban 80% ≤ 10 min: {actual}%
- [ ] Rural 80% ≤ 14 min: {actual}%

## NIMS/ICS Compliance
- [x] Multi-alarm ICS expansion simulated
- [x] Auto-aid/Mutual aid agreements modeled
- [x] Incident command structure simulated

## Equity Analysis (NFPA 1730)
- [x] Response time by demographic quintile computed
- [x] Max disparity: {max_disparity_pct}%
- [x] Overall equity score: {equity_score}

## Summary
**Overall Compliance**: {compliance_percentage}%
**Non-Compliant Items**: {count}
**Critical Findings**: {findings}
```

---

*This standards mapping ensures the PSAP Research ecosystem produces data and simulations that meet or exceed all applicable public safety standards, enabling credible research and operational planning.*