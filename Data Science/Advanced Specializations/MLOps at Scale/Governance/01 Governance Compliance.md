# Governance & Compliance

Comprehensive ML governance framework covering model documentation, data lineage, regulatory compliance, and risk management.

## 1. Governance Framework

### 1.1 Governance Maturity Model
```
Governance Maturity Levels
├── Level 1: Ad-hoc
│   ├── No formal processes
│   ├── Manual documentation
│   └── Reactive compliance
├── Level 2: Managed
│   ├── Defined policies
│   ├── Automated documentation
│   └── Regular audits
├── Level 3: Defined
│   ├── Standardized processes
│   ├── Automated compliance checks
│   └── Integrated workflows
├── Level 4: Quantitatively Managed
│   ├── Metrics-driven governance
│   ├── Predictive risk assessment
│   └── Continuous compliance
└── Level 5: Optimizing
    ├── AI-driven governance
    ├── Self-healing compliance
    └── Adaptive policies
```

### 1.2 Governance Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE ORGANIZATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           ML Governance Board                             │    │
│  │  (C-suite, Legal, Risk, Security, ML Leadership)         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                     │
│         ┌─────────────────┼─────────────────┐                   │
│         ▼                 ▼                 ▼                   │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │ Model Risk  │   │ Data        │   │ Regulatory  │          │
│  │ Committee   │   │ Governance  │   │ Compliance  │          │
│  │             │   │ Team        │   │ Team        │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ML Engineering Teams                          │   │
│  │  (Data Scientists, ML Engineers, Platform Engineers)      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Model Cards (Documentation Standard)

### 2.1 Model Card Template (Google Model Card Toolkit)
```python
# model_card.json
{
  "model_details": {
    "name": "Customer Churn Predictor v2.1",
    "version": "2.1.0",
    "date": "2024-11-03",
    "type": "Classification",
    "architecture": "Random Forest (scikit-learn 1.3)",
    "training_data": "Customer transaction data (Jan 2023 - Oct 2024)",
    "license": "Proprietary",
    "contact": "ml-team@company.com",
    "owners": ["ml-team", "customer-success"],
    "reviewers": ["risk-team", "legal-team"]
  },
  "intended_use": {
    "primary_use": "Predict customer churn probability for retention campaigns",
    "target_users": ["Marketing team", "Customer Success"],
    "out_of_scope": ["Credit scoring", "Fraud detection", "Medical diagnosis"],
    "geography": ["US", "CA", "EU"],
    "languages": ["en"]
  },
  "training_data": {
    "source": "Customer Data Platform (CDP)",
    "collection_period": "2023-01-01 to 2024-10-01",
    "size": "2.5M records, 50 features",
    "preprocessing": [
      "Missing value imputation (median for numeric, mode for categorical)",
      "Feature encoding (target encoding for high-cardinality categorical)",
      "Train/val/test split: 70/15/15 (temporal split)"
    ],
    "known_limitations": [
      "Underrepresents new customers (< 30 days)",
      "Seasonal bias (holiday period overrepresented)",
      "No data for churned customers who deleted accounts"
    ]
  },
  "evaluation_data": {
    "test_set": "Holdout (Jan 2024 - Mar 2024)",
    "size": "375K records",
    "split_strategy": "Temporal holdout"
  },
  "metrics": {
    "overall": {
      "accuracy": 0.923,
      "precision": 0.891,
      "recall": 0.867,
      "f1": 0.879,
      "roc_auc": 0.956,
      "pr_auc": 0.892
    },
    "by_segment": {
      "high_value": {"precision": 0.91, "recall": 0.88, "support": 45000},
      "medium_value": {"precision": 0.89, "recall": 0.86, "support": 180000},
      "low_value": {"precision": 0.87, "recall": 0.85, "support": 150000}
    },
    "fairness": {
      "gender": {
        "male": {"precision": 0.89, "recall": 0.87, "fpr": 0.08},
        "female": {"precision": 0.88, "recall": 0.86, "fpr": 0.09},
        "parity_difference": {"precision": 0.01, "recall": 0.01, "fpr": 0.01}
      },
      "age_group": {
        "18-30": {"precision": 0.88, "recall": 0.85},
        "31-50": {"precision": 0.90, "recall": 0.88},
        "51+": {"precision": 0.90, "recall": 0.87}
      }
    }
  },
  "ethical_considerations": {
    "bias_mitigation": [
      "Stratified sampling for training",
      "Adversarial debiasing for gender/age",
      "Post-processing calibration per demographic"
    ],
    "privacy": [
      "PII removed before training",
      "Differential privacy (epsilon=1.0) on gradients",
      "No direct identifiers in features"
    ],
    "security": [
      "Model watermarking for IP protection",
      "Adversarial robustness testing (PGD, epsilon=0.1)",
      "Membership inference attack resistance verified"
    ]
  },
  "deployment": {
    "environment": "Production (Kubernetes, vLLM)",
    "hardware": "4x A100 80GB",
    "latency_sla": "p99 < 100ms",
    "throughput_sla": "1000 req/s",
    "monitoring": {
      "latency": "p50, p95, p99",
      "drift": "PSI, KS, ADWIN",
      "performance": "Accuracy, AUC, Calibration",
      "business": "Retention rate, Revenue impact"
    },
    "retraining": {
      "trigger": "PSI > 0.2 OR AUC drop > 0.02 OR monthly",
      "strategy": "Full retrain with expanded window"
    }
  }
}
```

### 2.2 Automated Model Card Generation
```python
from model_card_toolkit import ModelCardToolkit

def generate_model_card(model, eval_results, metadata):
    mct = ModelCardToolkit()
    
    model_card = mct.scaffold_assets()
    
    # Model details
    model_card.model_details.name = metadata["name"]
    model_card.model_details.version = metadata["version"]
    model_card.model_details.owners = metadata["owners"]
    
    # Intended use
    model_card.intended_use.primary_use = metadata["primary_use"]
    model_card.intended_use.out_of_scope = metadata["out_of_scope"]
    
    # Training data
    model_card.training_data.description = metadata["training_data"]["description"]
    model_card.training_data.preprocessing = metadata["training_data"]["preprocessing"]
    
    # Evaluation
    model_card.quantitative_analysis.performance_metrics = [
        {"type": k, "value": str(v)} 
        for k, v in eval_results["overall"].items()
    ]
    
    # Fairness
    for group, metrics in eval_results["fairness"].items():
        model_card.quantitative_analysis.fairness.append({
            "group": group,
            "metrics": [{"type": k, "value": str(v)} for k, v in metrics.items()]
        })
    
    # Generate
    mct.update_model_card_json(model_card)
    mct.export_format(model_card, "html")
    
    return model_card
```

---

## 3. Data Lineage (OpenLineage)

### 3.1 OpenLineage Integration
```python
from openlineage.client import OpenLineageClient
from openlineage.client.facet_v2 import (
    schema_dataset, data_source, data_quality_metrics,
    job, run, column_lineage, sql_job
)

client = OpenLineageClient(
    url="http://marquez:5000",
    api_key="your-api-key"
)

# Emit lineage event
def emit_lineage_event(
    job_name: str,
    namespace: str,
    inputs: list,
    outputs: list,
    run_id: str,
    job_facets: dict = None,
    run_facets: dict = None
):
    from openlineage.client.event_v2 import Job, Run, Dataset, Event
    from openlineage.client.event_v2 import JobType, RunState
    from uuid import uuid4
    from datetime import datetime
    
    job = Job(
        namespace=namespace,
        name=job_name,
        facets=job_facets or {}
    )
    
    run = Run(
        runId=run_id,
        facets=run_facets or {}
    )
    
    event = Event(
        eventTime=datetime.utcnow().isoformat() + "Z",
        eventType="COMPLETE",
        producer="ml-pipeline",
        job=job,
        run=run,
        inputs=inputs,
        outputs=outputs
    )
    
    client.emit(event)

# Example: Training job lineage
emit_lineage_event(
    job_name="train_model",
    namespace="ml-training",
    inputs=[
        Dataset(
            namespace="s3",
            name="bucket/training-data",
            facets={
                "schema": schema_dataset.SchemaDatasetFacet(
                    fields=[
                        {"name": "user_id", "type": "INT64"},
                        {"name": "features", "type": "ARRAY<FLOAT>"},
                        {"name": "target", "type": "INT64"}
                    ]
                ),
                "dataSource": data_source.DataSourceFacet(
                    name="S3",
                    uri="s3://bucket/training-data/"
                ),
                "dataQuality": data_quality_metrics.DataQualityMetricsFacet(
                    rowCount=2500000,
                    columnMetrics={
                        "user_id": {"nullCount": 0, "distinctCount": 2500000},
                        "target": {"nullCount": 0, "distinctCount": 2}
                    }
                )
            }
        ),
    outputs=[
        Dataset(
            namespace="ml-registry",
            name="model/customer-churn-v2.1",
            facets={
                "dataSource": data_source.DataSourceFacet(
                    name="ML Registry",
                    uri="mlflow://models:/customer-churn/2.1"
                )
            }
        ),
    run_id=str(uuid4()),
    job_facets={
        "job": job.JobFacet(
            jobName="train_model",
            jobType=JobType.BATCH
        ),
        "sql": sql_job.SQLJobFacet(query="SELECT * FROM training_data WHERE date < '2024-01-01'")
    },
    run_facets={
        "run": run.RunFacet(runId=uuid4()),
        "parentRun": run.ParentRunFacet(
            runId=parent_run_id,
            jobName="data_preprocessing"
        )
    }
)
```

### 3.2 Column-Level Lineage
```python
from openlineage.client.facet_v2 import column_lineage

# Column-level lineage for feature engineering
column_lineage_facet = column_lineage.ColumnLineageDatasetFacet(
    fields={
        "features": column_lineage.FieldLineage(
            inputFields=[
                column_lineage.FieldRef(name="age", namespace="s3", dataset="raw_data"),
                column_lineage.FieldRef(name="income", namespace="s3", dataset="raw_data"),
                column_lineage.FieldRef(name="education", namespace="s3", dataset="raw_data")
            ],
            transformationType="DERIVED",
            transformationDescription="PCA on normalized features (first 10 components)"
        ),
        "target": column_lineage.FieldLineage(
            inputFields=[
                column_lineage.FieldRef(name="churn_label", namespace="s3", dataset="labels")
            ],
            transformationType="IDENTITY",
            transformationDescription="Direct mapping from churn label"
        )
    }
```

---

## 3. Audit Trails

### 3.1 Immutable Audit Log
```python
import hashlib
import json
from datetime import datetime
from dataclasses import dataclass
from typing import Any, Dict, Optional
import boto3

@dataclass
class AuditEntry:
    timestamp: str
    event_type: str
    actor: str
    resource: str
    action: str
    details: Dict[str, Any]
    previous_hash: str
    hash: str

class ImmutableAuditLog:
    def __init__(self, storage_bucket: str):
        self.s3 = boto3.client('s3')
        self.bucket = storage_bucket
        self.chain_file = "audit-chain.jsonl"
        self._load_chain()
    
    def _load_chain(self):
        """Load and verify hash chain"""
        try:
            obj = self.s3.get_object(Bucket=self.bucket, Key=self.chain_file)
            lines = obj['Body'].read().decode('utf-8').strip().split('\n')
            self.chain = [json.loads(line) for line in lines if line]
            self._verify_chain()
        except self.s3.exceptions.NoSuchKey:
            self.chain = []
    
    def _verify_chain(self):
        for i in range(1, len(self.chain)):
            if self.chain[i]['previous_hash'] != self.chain[i-1]['hash']:
                raise ValueError(f"Hash chain broken at index {i}")
    
    def _compute_hash(self, entry: dict) -> str:
        entry_copy = entry.copy()
        entry_copy.pop('hash', None)
        content = json.dumps(entry_copy, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()
    
    def log_event(self, event_type: str, actor: str, resource: str, 
                  action: str, details: Dict[str, Any]) -> str:
        previous_hash = self.chain[-1]['hash'] if self.chain else "0" * 64
        
        entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "event_type": event_type,
            "actor": actor,
            "resource": resource,
            "action": action,
            "details": details,
            "previous_hash": previous_hash
        }
        
        entry["hash"] = self._compute_hash(entry)
        
        self.chain.append(entry)
        
        # Append to S3 (append-only)
        self.s3.put_object(
            Bucket=self.bucket,
            Key=self.chain_file,
            Body=(json.dumps(entry) + '\n').encode(),
            ContentType='application/jsonl'
        )
        
        return entry['hash']

# Usage
audit = ImmutableAuditLog("ml-audit-logs")

# Log model deployment
audit.log_event(
    event_type="MODEL_DEPLOYMENT",
    actor="ml-engineer@company.com",
    resource="model/customer-churn:v2.1",
    action="DEPLOY",
    details={
        "version": "2.1.0",
        "environment": "production",
        "deployed_by": "ci/cd-pipeline-123",
        "previous_version": "2.0.3",
        "approval_ticket": "CHG-12345"
    }
)

# Log data access
audit.log_event(
    event_type="DATA_ACCESS",
    actor="data-scientist@company.com",
    resource="s3://bucket/training-data/",
    action="READ",
    details={
        "purpose": "model_training",
        "query": "SELECT * FROM training_data WHERE date < '2024-01-01'",
        "rows_returned": 2500000
    }
)
```

### 3.3 Model Registry with Audit
```python
class AuditedModelRegistry:
    def __init__(self, registry_uri: str, audit_log: ImmutableAuditLog):
        self.client = MlflowClient(tracking_uri=registry_uri)
        self.audit = audit_log
    
    def register_model(self, name: str, version: str, 
                       model_uri: str, metadata: dict) -> str:
        # Register in MLflow
        mv = self.client.create_model_version(name, model_uri, version)
        
        # Audit
        self.audit.log_event(
            event_type="MODEL_REGISTRATION",
            actor="ml-system",
            resource=f"model/{name}:{version}",
            action="REGISTER",
            details={
                "model_uri": model_uri,
                "run_id": metadata.get("run_id"),
                "metrics": metadata.get("metrics"),
                "tags": metadata.get("tags")
            }
        )
        
        return mv.version
    
    def transition_stage(self, name: str, version: str, 
                         stage: str, actor: str) -> None:
        self.client.transition_model_version_stage(name, version, stage)
        
        self.audit.log_event(
            event_type="MODEL_STAGE_TRANSITION",
            actor=actor,
            resource=f"model/{name}:{version}",
            action=f"TRANSITION_TO_{stage.upper()}",
            details={"from_stage": self._get_current_stage(name, version)}
        )
    
    def _get_current_stage(self, name: str, version: str) -> str:
        mv = self.client.get_model_version(name, version)
        return mv.current_stage
```

---

## 4. Regulatory Compliance

### 4.1 EU AI Act Compliance
```python
class EUAIActCompliance:
    """EU AI Act compliance checker (Regulation (EU) 2024/1689)"""
    
    RISK_LEVELS = {
        "unacceptable": ["social_scoring", "realtime_biometric_surveillance"],
        "high": [
            "credit_scoring", "hiring", "medical_devices", 
            "critical_infrastructure", "education", "employment",
            "law_enforcement", "migration", "justice"
        ],
        "limited": ["chatbots", "deepfake_generation", "emotion_recognition"],
        "minimal": ["spam_filter", "recommendation", "inventory_optimization"]
    }
    
    def classify_risk(self, use_case: str, domain: str) -> str:
        """Classify AI system risk level"""
        for risk, use_cases in self.RISK_LEVELS.items():
            if any(uc in use_case.lower() for uc in use_cases):
                return risk
            if any(uc in domain.lower() for uc in use_cases):
                return risk
        return "minimal"
    
    def get_requirements(self, risk_level: str) -> dict:
        """Get compliance requirements by risk level"""
        requirements = {
            "unacceptable": {
                "prohibited": True,
                "action": "Must not deploy"
            },
            "high": {
                "conformity_assessment": True,
                "risk_management_system": True,
                "data_governance": True,
                "technical_documentation": True,
                "record_keeping": True,
                "transparency": True,
                "human_oversight": True,
                "accuracy_robustness": True,
                "cybersecurity": True,
                "post_market_monitoring": True,
                "registration": True
            },
            "limited": {
                "transparency": True,
                "information_obligations": True
            },
            "minimal": {
                "voluntary_codes": True
            }
        }
        return requirements.get(risk_level, {})
    
    def generate_compliance_report(self, model_metadata: dict) -> dict:
        """Generate AI Act compliance report"""
        risk = self.classify_risk(
            model_metadata.get("use_case", ""),
            model_metadata.get("domain", "")
        )
        requirements = self.get_requirements(risk)
        
        return {
            "model": model_metadata.get("name"),
            "version": model_metadata.get("version"),
            "risk_level": risk,
            "requirements": requirements,
            "compliance_status": self._check_compliance(model_metadata, requirements),
            "gaps": self._identify_gaps(model_metadata, requirements),
            "deadline": "2026-08-02" if risk_level == "high" else "N/A"
        }
```

### 4.2 GDPR Compliance
```python
class GDPRCompliance:
    def __init__(self):
        self.lawful_bases = [
            "consent", "contract", "legal_obligation",
            "vital_interests", "public_task", "legitimate_interests"
        ]
    
    def check_lawful_basis(self, processing_purpose: str, 
                           personal_data: bool, 
                           special_category: bool) -> dict:
        """Determine lawful basis for processing"""
        if not personal_data:
            return {"required": False, "basis": "not_personal_data"}
        
        if special_category:
            return {
                "required": True,
                "basis": "explicit_consent",
                "additional_safeguards": ["DPIA required", "DPO consultation"]
            }
        
        return {
            "required": True,
            "basis": "legitimate_interests"  # or consent, contract, etc.
        }
    
    def check_rights_compliance(self, system_capabilities: dict) -> dict:
        """Verify GDPR rights implementation"""
        rights = {
            "access": system_capabilities.get("data_export", False),
            "rectification": system_capabilities.get("data_update", False),
            "erasure": system_capabilities.get("data_delete", False),
            "portability": system_capabilities.get("data_export", False),
            "objection": system_capabilities.get("opt_out", False),
            "automated_decision": system_capabilities.get("human_review", False)
        }
        
        gaps = [r for r, v in rights.items() if not v]
        return {"rights": rights, "gaps": gaps, "compliant": len(gaps) == 0}
    
    def generate_ropa(self, processing_activities: list) -> str:
        """Generate Record of Processing Activities (ROPA)"""
        # Article 30 GDPR
        ropa = []
        for activity in processing_activities:
            ropa.append({
                "controller": "Company Name",
                "purpose": activity["purpose"],
                "lawful_basis": activity["lawful_basis"],
                "categories_of_data": activity["data_categories"],
                "recipients": activity["recipients"],
                "transfers": activity.get("international_transfers", []),
                "retention": activity["retention_period"],
                "security_measures": activity["security"]
            })
        return json.dumps(ropa, indent=2)
```

### 4.3 Sector-Specific Regulations
```python
# Financial Services (SR 11-7, Basel III)
class FinancialRegulation:
    SR11_7_REQUIREMENTS = {
        "model_risk_management": [
            "Model inventory with risk tiering",
            "Independent validation",
            "Ongoing monitoring",
            "Governance framework"
        ],
        "documentation": [
            "Model purpose and scope",
            "Development methodology",
            "Assumptions and limitations",
            "Validation results"
        ]
    }
    
    @staticmethod
    def validate_model_risk_tier(model) -> str:
        """Classify per SR 11-7: Tier 1 (high), Tier 2 (medium), Tier 3 (low)"""
        if model.use_case in ["credit_scoring", "trading", "risk_management"]:
            return "Tier 1"
        elif model.impact == "high" and model.complexity == "high":
            return "Tier 1"
        return "Tier 2"


# Healthcare (HIPAA, FDA)
class HealthcareCompliance:
    HIPAA_SAFEGUARDS = {
        "administrative": ["risk_analysis", "training", "access_control"],
        "physical": ["facility_access", "workstation_security"],
        "technical": ["encryption", "audit_controls", "integrity", "transmission_security"]
    }
    
    FDA_SAMED = {
        "class_I": "General controls",
        "class_II": "Special controls + 510(k)",
        "class_III": "PMA required"
    }
    
    @staticmethod
    def classify_medical_device(intended_use: str) -> str:
        """Classify per FDA: I, II, III"""
        if "diagnose" in intended_use or "treat" in intended_use:
            return "Class II or III"
        return "Class I"


# Insurance (NAIC Model Law)
class InsuranceCompliance:
    NAIC_REQUIREMENTS = {
        "transparency": "Disclose AI use in underwriting/claims",
        "fairness": "Test for proxy discrimination",
        "explainability": "Provide adverse action reasons",
        "governance": "Board oversight of AI systems"
    }
```

---

## 5. Model Risk Management

### 5.1 Model Risk Framework
```python
class ModelRiskManager:
    def __init__(self):
        self.risk_tiers = {
            "Tier 1": {"impact": "High", "frequency": "Monthly", "validation": "Independent"},
            "Tier 2": {"impact": "Medium", "frequency": "Quarterly", "validation": "Peer"},
            "Tier 3": {"impact": "Low", "frequency": "Annually", "validation": "Self"}
        }
    
    def assess_model_risk(self, model_metadata: dict) -> dict:
        """Assess model risk per SR 11-7 / SS1/23"""
        
        # Impact assessment
        financial_impact = model_metadata.get("financial_impact", "Medium")
        regulatory_impact = model_metadata.get("regulatory_impact", "Low")
        reputational_impact = model_metadata.get("reputational_impact", "Low")
        user_impact = model_metadata.get("user_impact", "Low")
        
        # Complexity
        complexity = model_metadata.get("model_complexity", "Medium")
        data_sensitivity = model_metadata.get("data_sensitivity", "Medium")
        
        # Scoring
        impact_score = self._score_impact(
            financial_impact, regulatory_impact, 
            reputational_impact, user_impact
        )
        
        complexity_score = self._score_complexity(complexity, data_sensitivity)
        
        # Determine tier
        if impact_score >= 8 or complexity_score >= 8:
            tier = "Tier 1"
        elif impact_score >= 5 or complexity_score >= 5:
            tier = "Tier 2"
        else:
            tier = "Tier 3"
        
        return {
            "tier": tier,
            "impact_score": impact_score,
            "complexity_score": complexity_score,
            "validation_frequency": self.risk_tiers[tier]["frequency"],
            "validation_type": self.risk_tiers[tier]["validation"],
            "requirements": self._get_tier_requirements(tier)
        }
    
    def _get_tier_requirements(self, tier: str) -> dict:
        reqs = {
            "Tier 1": {
                "independent_validation": True,
                "challenger_model": True,
                "stress_testing": True,
                "sensitivity_analysis": True,
                "documentation": "Comprehensive",
                "board_reporting": True
            },
            "Tier 2": {
                "independent_validation": True,
                "challenger_model": False,
                "stress_testing": True,
                "sensitivity_analysis": True,
                "documentation": "Standard",
                "board_reporting": False
            },
            "Tier 3": {
                "independent_validation": False,
                "peer_review": True,
                "documentation": "Basic"
            }
        }
        return reqs.get(tier, {})


class ModelLifecycleManager:
    def __init__(self, registry, risk_manager, audit_log):
        self.registry = registry
        self.risk = risk_manager
        self.audit = audit_log
    
    def onboard_model(self, model_package: dict) -> str:
        """Onboard new model with full governance"""
        
        # 1. Risk assessment
        risk = self.risk.assess_model_risk(model_package["metadata"])
        
        # 2. Validation
        validation_results = self._run_validation(model_package, risk["tier"])
        
        # 3. Register
        version = self.registry.register(
            name=model_package["name"],
            version=model_package["version"],
            artifacts=model_package["artifacts"],
            metadata={**model_package["metadata"], "risk": risk}
        )
        
        # 3. Audit
        self.audit.log_event(
            event_type="MODEL_ONBOARDED",
            actor="ml-system",
            resource=f"model/{model_package['name']}:{version}",
            action="ONBOARD",
            details={"risk_tier": risk["tier"], "validation": validation_results}
        )
        
        return version
    
    def decommission_model(self, name: str, version: str, reason: str):
        """Graceful model decommissioning"""
        # 1. Check dependencies
        dependents = self._find_dependents(name, version)
        if dependents:
            raise ValueError(f"Model has dependents: {dependents}")
        
        # 2. Archive
        self.registry.archive(name, version)
        
        # 3. Audit
        self.audit.log_event(
            event_type="MODEL_DECOMMISSIONED",
            actor="ml-system",
            resource=f"model/{name}:{version}",
            action="DECOMMISSION",
            details={"reason": reason}
        )
```

---

## 6. SOC2 / ISO 27001 Compliance

### 6.1 SOC2 Type II Controls
```python
class SOC2Controls:
    """SOC2 Type II Common Criteria"""
    
    CC1 = {  # Control Environment
        "CC1.1": "Integrity and ethical values",
        "CC1.2": "Board independence and oversight",
        "CC1.3": "Organizational structure",
        "CC1.4": "Competence and accountability",
        "CC1.5": "Enforcement of accountability"
    }
    
    CC6 = {  # Logical Access Controls
        "CC6.1": "Logical access security",
        "CC6.2": "Access provisioning/revocation",
        "CC6.3": "Network segregation",
        "CC6.4": "Restricted access to sensitive data",
        "CC6.5": "Access logging and monitoring",
        "CC6.6": "Privileged access management",
        "CC6.7": "Access removal on termination",
        "CC6.8": "Authentication mechanisms"
    }
    
    CC7 = {  # System Operations
        "CC7.1": "Incident detection",
        "CC7.2": "Incident response",
        "CC7.2": "System monitoring",
        "CC7.3": "Vulnerability management",
        "CC7.4": "Data backup and recovery",
        "CC7.5": "Change management"
    }
    
    @staticmethod
    def generate_evidence(control_id: str) -> dict:
        """Generate evidence for auditor"""
        evidence_map = {
            "CC6.1": ["IAM policies", "Access reviews", "MFA enforcement"],
            "CC6.2": ["Provisioning workflows", "Quarterly access reviews"],
            "CC6.3": ["VPC configs", "Security groups", "NACLs"],
            "CC6.4": ["KMS encryption", "S3 bucket policies", "DLP rules"],
            "CC6.5": ["CloudTrail logs", "GuardDuty findings", "SIEM alerts"],
            "CC6.6": ["Break-glass procedures", "PAM solution", "Just-in-time access"],
            "CC7.1": ["CloudWatch alarms", "GuardDuty", "Security Hub"],
            "CC7.2": ["Runbooks", "Escalation policies", "Postmortems"],
            "CC7.3": ["Inspector", "Trivy scans", "Patch management"],
            "CC7.4": ["Cross-region replication", "RTO/RPO docs", "DR tests"],
            "CC7.5": ["Change advisory board", "Deploy pipeline", "Rollback procedures"]
        }
        return {"control": control_id, "evidence": evidence_map.get(control_id, [])}
```

### 6.2 ISO 27001 Annex A
```python
class ISO27001Controls:
    """ISO 27001:2022 Annex A Controls for ML Systems"""
    
    CONTROLS = {
        "A.5.1": "Information security policies",
        "A.5.10": "Acceptable use of assets",
        "A.5.12": "Classification of information",
        "A.5.13": "Labelling of information",
        "A.5.24": "Information security incident management",
        "A.5.25": "Assessment of and decisions on information security events",
        "A.5.26": "Response to information security incidents",
        "A.5.27": "Learning from information security incidents",
        "A.5.28": "Collection of evidence",
        "A.6.1": "Screening",
        "A.6.2": "Terms and conditions of employment",
        "A.6.3": "Information security awareness",
        "A.6.4": "Disciplinary process",
        "A.6.5": "Responsibilities after termination",
        "A.6.6": "Confidentiality agreements",
        "A.7.1": "Inventory of assets",
        "A.7.2": "Ownership of assets",
        "A.7.3": "Acceptable use of assets",
        "A.7.4": "Return of assets",
        "A.7.5": "Classification of information",
        "A.7.10": "Storage media handling",
        "A.7.11": "Disposal of media",
        "A.8.1": "User access provisioning",
        "A.8.2": "Privileged access rights",
        "A.8.3": "Restriction of access rights",
        "A.8.4": "Source code access",
        "A.8.15": "Logging and monitoring",
        "A.8.16": "Clock synchronisation",
        "A.8.23": "Web filtering",
        "A.8.24": "Cryptographic controls",
        "A.8.25": "Secure development lifecycle",
        "A.8.26": "Application security requirements",
        "A.8.27": "Secure system architecture",
        "A.8.28": "Secure coding",
        "A.8.29": "Security testing",
        "A.8.30": "Outsourced development",
        "A.8.31": "Separation of environments",
        "A.8.32": "Change management",
        "A.8.33": "Test information",
        "A.8.34": "Protection of information systems during audit testing"
    }
    
    # ML-specific mappings
    ML_MAPPING = {
        "A.8.1": ["Model registry inventory", "Data catalog", "Feature store inventory"],
        "A.8.2": ["Model deployment permissions", "Training pipeline access"],
        "A.8.15": ["Model prediction logging", "Drift monitoring alerts", "Audit logs"],
        "A.8.24": ["Model encryption at rest", "TLS for inference", "Key rotation"],
        "A.8.25": ["ML pipeline CI/CD", "Model validation gates", "Dependency scanning"],
        "A.8.26": ["Adversarial testing", "Model watermarking", "Input validation"],
        "A.8.28": ["Secure coding standards", "Dependency scanning", "SAST/DAST"],
        "A.8.32": ["Model versioning", "Rollback procedures", "Canary deployments"],
        "A.8.33": ["A/B testing", "Shadow deployment", "Chaos engineering"]
    }
```

---

## 7. Key Takeaways

1. **Model Cards** = Standardized documentation for transparency and trust
2. **Data Lineage (OpenLineage)** = End-to-end traceability from data to model
3. **Audit Trails** = Immutable, hash-chained logs for accountability
3. **EU AI Act** = Risk-based compliance (unacceptable → minimal)
4. **GDPR** = Lawful basis, rights implementation, DPIA for high-risk
5. **Sector Regulations** = SR 11-7 (Finance), HIPAA/FDA (Healthcare), NAIC (Insurance)
5. **Model Risk Management** = Tiered by impact/complexity (SR 11-7)
6. **SOC2/ISO 27001** = Control frameworks with ML-specific mappings
7. **Governance Structure** = Board → Committees → Engineering teams
8. **Automation** = Automated documentation, lineage, compliance checks
9. **Audit Trails** = Immutable, hash-chained, append-only
10. **Governance = Enable, not Block** = Build guardrails, not gates