# Data Governance

**Definition**: Data governance is the exercise of authority and control (planning, monitoring, and enforcement) over the management of data assets. (DAMA-DMBOK2)

---

## 1. Governance Framework

### 1.1 Governance Framework (DAMA-DMBOK2 / DGI)
```markdown
Data Governance Framework (DGI Framework):
├── 1. Governance Structure (Who decides?)
│   ├── Data Governance Council / Steering Committee
│   ├── Data Owners (accountable)
│   ├── Data Stewards (responsible)
│   └── Data Custodians (technical implementation)
├── 2. Policies & Standards (What are the rules?)
│   ├── Data Policies (access, retention, quality, privacy)
│   ├── Data Standards (naming, formats, definitions)
│   └── Reference & Master Data Management
├── 3. Processes (How work gets done)
│   ├── Data Quality Management
│   ├── Metadata Management
│   ├── Data Architecture
│   ├── Data Security & Privacy
│   ├── Reference & Master Data
│   └── Data Lifecycle Management
├── 4. Metrics & Measurement (How do we know?)
│   ├── KPIs / SLAs
│   ├── Maturity Assessments (CMMI, DCAM)
│   └── Audit & Compliance
└── 5. Culture & Communication (How do people engage?)
    ├── Training, Communication, Change Management
```

### 1.2 RACI Model for Data Governance
```markdown
| Activity                    | Data Owner | Data Steward | Custodian | Consumer | IT |
|-----------------------------|------------|--------------|-----------|----------|----|
| Define data requirements    | A          | R            | C         | I        | C  |
| Define quality rules        | A          | R            | C         | I        | C  |
| Approve access              | A          | R            | C         | I        | C  |
| Resolve quality issues      | A          | R            | C         | I        | C  |
| Approve data sharing        | A          | R            | C         | I        | C  |
| Define retention            | A          | R            | C         | I        | C  |
| Monitor quality             | I          | R            | C         | I        | C  |
| Enforce policies            | A          | R            | R         | I        | R  |

Legend: R=Responsible, A=Accountable, C=Consulted, I=Informed
```

---

## 2. Data Policies & Standards

### 2.1 Essential Data Policies
```markdown
| Policy | Purpose | Key Elements |
|--------|---------|--------------|
| **Data Classification** | Categorize sensitivity | Public, Internal, Confidential, Restricted |
| **Access Control** | Who can access what | RBAC, ABAC, least privilege |
| **Retention & Disposal** | How long to keep, how to destroy | Legal hold, schedules, secure deletion |
| **Data Quality** | Standards, monitoring, remediation | Dimensions, thresholds, SLAs |
| **Privacy & Consent** | GDPR, CCPA, HIPAA compliance | Consent, purpose limitation, DSR |
| **Data Sharing** | Internal/external sharing | Agreements, contracts, APIs |
| **Incident Response** | Breach notification, containment | 72hr GDPR, roles, comms |
| **Archival & Disposal** | Legal hold, secure destruction | Legal hold, crypto-shred, certificates |
```

### 2.2 Data Standards (Metadata)
```markdown
| Standard | Scope | Examples |
|----------|-------|----------|
| **Naming Conventions** | Tables, columns, files | snake_case, PascalCase, prefixes |
| **Data Types** | Standard types | ISO 8601 dates, ISO 4217 currency, ISO 3166 country |
| **Reference Data** | Codes, lookups | ISO 3166 (country), ISO 4217 (currency), NAICS, SIC |
| **Identifiers** | Keys, IDs | UUID, ULID, surrogate keys, natural keys |
| **Units & Formats** | Measurements | SI units, ISO 80000, UTC timestamps |
```

---

## 3. Data Stewardship

### 3.1 Roles & Responsibilities
```markdown
| Role | Accountability | Key Activities |
|------|----------------|----------------|
| **Data Owner** (Business) | Accountable for data asset | Define requirements, authorize access, prioritize quality, approve changes |
| **Data Steward** (Domain) | Responsible for data quality | Define rules, monitor quality, resolve issues, document metadata |
| **Data Custodian** (IT) | Technical implementation | Storage, backup, security, performance, availability |
| **Data Consumer** | Uses data responsibly | Follow policies, report issues, provide feedback |
| **Data Protection Officer (DPO)** | GDPR/Privacy compliance | DPIA, DSR, breach notification, training |
```

### 3.2 Stewardship Processes
```python
# Stewardship workflow example
class DataStewardshipWorkflow:
    def __init__(self):
        self.issue_tracker = IssueTracker()
        self.quality_rules = QualityRuleEngine()
        self.metadata_catalog = MetadataCatalog()
    
    def handle_quality_issue(self, issue):
        # 1. Triage: severity, impact, owner
        # 2. Root cause: data lineage, process gap
        # 3. Remediate: fix source, backfill, monitor
        # 4. Prevent: rules, automation, training
        # 5. Close: verify, document, communicate
        pass
```

---

## 4. Data Quality Management

### 4.1 Quality Management Lifecycle
```python
class DataQualityLifecycle:
    """
    Continuous Data Quality Management (CDQM)
    """
    def __init__(self):
        self.rules = QualityRuleEngine()
        self.monitors = ContinuousMonitor()
        self.remediation = RemediationEngine()
    
    def assess(self, dataset):
        # 1. Profile: statistics, patterns, anomalies
        profile = self.profile(dataset)
        
        # 2. Validate: rules, constraints, business rules
        violations = self.rules.validate(dataset)
        
        # 3. Score: dimensions, weights, thresholds
        score = self.score(dataset, violations)
        
        # 4. Alert & remediate
        if score < threshold:
            self.alert_stakeholders(violations)
            self.remediation.auto_remediate(violations)
        
        return QualityReport(profile, violations, score)
```

### 2. Quality Dimensions & Metrics
```python
# DAMA Dimensions + Metrics
DIMENSIONS = {
    'completeness': {
        'metric': 'null_count / total_rows',
        'threshold': '< 1%',
        'remediation': 'impute, collect, default'
    },
    'accuracy': {
        'metric': 'valid_values / total_rows',
        'threshold': '> 99%',
        'remediation': 'validate at source, cross-reference'
    },
    'consistency': {
        'metric': 'cross_system_agreement',
        'threshold': '100%',
        'remediation': 'reconcile, master reference'
    },
    'timeliness': {
        'metric': 'data_age_vs_sla',
        'threshold': '< SLA',
        'remediation': 'pipeline monitoring, alerts'
    },
    'validity': {
        'metric': 'constraint_violations',
        'threshold': '0',
        'remediation': 'constraints, validation at entry'
    },
    'uniqueness': {
        'metric': 'duplicate_key_count',
        'threshold': '0',
        'remediation': 'dedupe, constraints'
    }
}
```

---

## 5. Metadata Management

### 5.1 Metadata Categories (ISO 11179 / Dublin Core)
```markdown
| Category | Purpose | Examples |
|----------|---------|----------|
| **Descriptive** | Discovery, identification | title, description, keywords, creator, date |
| **Structural** | Organization, relationships | schema, foreign keys, hierarchy |
| **Administrative** | Management, rights | owner, created, access rights, retention |
| **Reference** | Quality, lineage | quality scores, lineage, provenance |
| **Statistical** | Content statistics | min, max, null%, distinct, distribution |
```

### 5.2 Data Catalog / Metadata Repository
```python
# Modern Data Stack Metadata Stack
METADATA_STACK = {
    'catalog': ['Amundsen', 'DataHub', 'OpenMetadata', 'Atlas', 'Purview'],
    'lineage': ['OpenLineage', 'Marquez', 'Atlas', 'Spline'],
    'quality': ['Great Expectations', 'Soda', 'Soda Core', 'dbt tests'],
    'observability': ['Monte Carlo', 'Metaplane', 'Metaplane', 'Elementary'],
    'governance': ['Collibra', 'Alation', 'Atlan', 'Ataccama']
}

# OpenLineage example
from openlineage.client import OpenLineageClient

client = OpenLineageClient(url="http://marquez:5000")
client.emit(
    JobEvent(
        job=Job(namespace="analytics", name="daily_etl"),
        run=Run(runId=str(uuid4())),
        inputs=[Dataset(namespace="warehouse", name="raw_events")],
        outputs=[Dataset(namespace="warehouse", name="daily_agg")],
        eventType=EventType.COMPLETE
    )
```

---

## 6. Master & Reference Data Management (MDM / RDM)

### 6.1 Master Data Management
```markdown
| Style | Description | Use Case |
|-------|-------------|----------|
| **Registry** | Golden record, read-only | Single source of truth |
| **Consolidation** | Merge, golden record, publish | MDM hub |
| **Coexistence** | Authoritative in multiple systems | Real-time sync |
| **Registry + Consolidation** | Hybrid | Most common enterprise |
```

### 6.2 Reference Data Management
```python
# Reference Data Management
REFERENCE_DATA = {
    'countries': 'ISO 3166-1 alpha-2/3',
    'currencies': 'ISO 4217',
    'currencies_ex': 'ISO 4217 + minor units',
    'languages': 'ISO 639-1/2/3',
    'industries': 'NAICS, SIC, GICS',
    'units': 'UCUM, SI',
    'timezones': 'IANA tz database',
    'legal_entities': 'LEI, GLEIF'
}

# Reference Data Governance
RDM_PROCESS = {
    'request': 'Submit request via catalog',
    'validate': 'Standards, uniqueness, hierarchy',
    'approve': 'Data steward + domain expert',
    'publish': 'Versioned, effective date, API',
    'deprecate': 'Deprecation policy, sunset date'
}
```

---

## 7. Data Architecture & Architecture Governance

### 7.1 Modern Data Architecture
```markdown
Modern Data Architecture Layers:
┌─────────────────────────────────────────────────┐
│           CONSUMPTION LAYER                     │
│  BI, Dashboards, ML, APIs, Data Apps, Notebooks │
├─────────────────────────────────────────────────┤
│           SEMANTIC / SERVING LAYER              │
│  Semantic Layer (Metrics, dbt, Cube, Cube.js)   │
│  Feature Store (Feast, Tecton, Hopsworks)       │
├─────────────────────────────────────────────────┤
│           PROCESSING / TRANSFORMATION           │
│  dbt, Spark, Flink, Flink SQL, Flink ML         │
├─────────────────────────────────────────────────┤
│           STORAGE LAYER                         │
│  Data Lake (Iceberg, Delta, Hudi)               │
│  Warehouse (Snowflake, BigQuery, Redshift)      │
│  Feature Store, Vector DB                       │
├─────────────────────────────────────────────────┤
│           INGESTION / INTEGRATION               │
│  Batch (Airflow, Dagster, Prefect, Dagster)     │
│  Streaming (Kafka, Flink, Redpanda, RisingWave) │
├─────────────────────────────────────────────────┤
│           GOVERNANCE & OBSERVABILITY            │
│  Catalog, Lineage, Quality, Policy, Access      │
└─────────────────────────────────────────────────┘
```

---

## 8. Regulatory Compliance Framework

### 8.1 Major Regulations
```markdown
| Regulation | Scope | Key Requirements | Penalties |
|------------|-------|------------------|-----------|
| **GDPR** | EU residents | Lawful basis, DSR, DPIA, DPO, 72hr breach | €20M / 4% revenue |
| **CCPA/CPRA** | CA residents | Access, delete, opt-out, non-discrimination | $7,500/violation |
| **HIPAA** | US PHI | Privacy, Security, Breach rules | $50k-$1.5M/violation |
| **SOX** | Financial reporting | Controls, audit trails, retention | Criminal/civil |
| **PCI DSS** | Cardholder data | 12 requirements, SAQ/ROC | $5K-$100K/month |
| **FedRAMP** | US Federal cloud | Authorization, continuous monitoring | Contract loss |
```

---

## 📚 Key References

| # | Citation | Link |
|---|----------|------|
| 1 | DAMA International. "DAMA-DMBOK2: Data Management Body of Knowledge." 2nd Ed. 2017. | [DAMA](https://dama.org) |
| 2 | Otto, B., & Österle, H. "Data Governance: A Research Framework." ECIS 2010. | [Link](https://aisel.aisnet.org/ecis2010/114/) |
| 3 | Khatri, V., & Brown, C. V. "Designing Data Governance." CACM 2010. | [DOI: 10.1145/1735223.1735253] |
| 4 | Plotkin, A. "Data Governance: How to Design, Deploy and Sustain." TDWI 2020. | [TDWI](https://tdwi.org) |
| 5 | Loshin, D. "Data Governance: The Definitive Guide." Technics Publications, 2021. | [ISBN: 978-1634624787] |
| 6 | Earley, S. "The Data Governance Playbook." DATAVERSITY 2022. | [Link](https://www.dataversity.net) |
| 7 | OpenDGI. "Data Governance Institute Framework." 2023. | [Link](https://opendgi.org/) |
| 8 | OpenLineage. "OpenLineage Specification." 2024. | [Link](https://openlineage.io/) |
| 9 | OpenLineage. "OpenLineage Specification." 2024. | [Link](https://openlineage.io/) |

---

## 🔗 Cross-References

| Topic | Related Notes |
|-------|---------------|
| **Data Literacy** | `Data Governance/01_Data_Literacy.md` |
| **Data Management** | `Data Governance/03_Data_Management.md` |
| **Data Security** | `Data Governance/04_Data_Security.md` |
| **Data Sovereignty** | `Data Governance/05_Data_Sovereignty.md` |
| **Data Ownership** | `Data Governance/06_Data_Ownership.md` |
| **Data Literacy** | `Data Governance/01_Data_Literacy.md` |
| **MLOps** | `Python Programming/MLOps/01_MLOps_Cheatsheet.md` |

---

*Last updated: 2024-11-05*
*Part of: 9-1-1 Data Whisperer knowledge base*