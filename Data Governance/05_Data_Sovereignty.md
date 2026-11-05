# Data Sovereignty

**Definition**: Data sovereignty is the concept that data is subject to the laws and governance structures of the nation/region where it is collected, processed, or stored. It encompasses legal jurisdiction, regulatory compliance, and national control over data infrastructure.

---

## 1. Legal & Regulatory Landscape

### 1.1 Major Data Sovereignty Regulations
```markdown
| Regulation | Jurisdiction | Scope | Key Requirements |
|-----------|-------------|-------|------------------|
| **GDPR** | EU/EEA | Personal data of EU residents | Data localization (Schrems II), SCCs, adequacy decisions |
| **UK GDPR** | UK | UK residents | UK adequacy, IDTA, UK Addendum |
| **CCPA/CPRA** | California, USA | CA residents | Data localization not required, but cross-border transfer restrictions |
| **PIPL** | China | Personal info of Chinese citizens | Data localization for critical info, security assessment for cross-border |
| **LGPD** | Brazil | Brazilian residents | Data localization for sensitive data, ANPD oversight |
| **PDPA** | Singapore | Singapore residents | Data localization for public sector, cross-border consent |
| **APPI** | Japan | Japanese residents | Cross-border consent, adequacy assessment |
| **POPIA** | South Africa | SA residents | Cross-border transfer restrictions, Information Regulator |
| **Bill C-27** | Canada | Canadians | Data localization for public sector, CPPA |
| **DPDP Act** | India | Indian citizens | Data localization for sensitive personal data, Data Protection Board |
| **Privacy Act** | Australia | Australian residents | Cross-border disclosure accountability |
```

### 1.1 Data Localization Requirements
```markdown
| Country | Localization Requirement | Scope | Exceptions |
|---------|-------------------------|-------|------------|
| **China** | Critical information infrastructure, personal info of Chinese citizens | CII operators, critical data | Security assessment, CAC approval |
| **Russia** | Personal data of Russian citizens | All personal data | Consent, treaty, legal obligation |
| **India** | Sensitive personal data, critical personal data | Sensitive: health, finance, biometric | Contractual, consent, adequacy |
| **China (CSL/DSL/PIPL)** | Important data, core data | Critical sectors | Security assessment, CAC filing |
| **Germany (BSI)** | Critical infrastructure | KRITIS sectors | BSI certification |
| **France** | Health data, strategic sectors | Health data, defense | HDS certification, SecNumCloud |
| **Australia** | Government data, critical infra | Gov data, critical infra | IRAP, ASD certified |
| **Canada** | Public sector data | Government data | GC cloud, Protected B |
| **Indonesia** | Public services, finance | Public services, fintech | Local data center |
| **Vietnam** | User data in Vietnam | All user data | Local storage, MoIC license |
| **Indonesia (PDP)** | Public services, strategic sectors | Public data | Local DC, Kominfo registration |
```

---

## 2. Cross-Border Data Transfers

### 2.1 Transfer Mechanisms (GDPR)
```markdown
| Mechanism | Description | Status |
|-----------|-------------|--------|
| **Adequacy Decision** | EU Commission declares adequate protection | Andorra, Argentina, Canada (commercial), Faroe Islands, Guernsey, Israel, Isle of Man, Israel, Japan, Jersey, New Zealand, Switzerland, UK, Uruguay |
| **Standard Contractual Clauses (SCCs)** | 2021 SCCs (Controller-Controller, Controller-Processor, Processor-Processor, Processor-Controller) | Valid, modular, modular |
| **Binding Corporate Rules (BCRs)** | Internal rules for intra-group transfers | Approved by lead SA |
| **Codes of Conduct** | GDPR Art. 40 codes | Emerging (e.g., Cloud CoC) |
| **Certification** | GDPR Art. 42 certification | Emerging (Europrivacy) |
| **Derogations (Art. 49)** | Explicit consent, contract, public interest, legal claims, vital interests | Limited, specific situations |
```

### 2.2 Post-Schrems II Landscape
```markdown
### Schrems II Impact (C-311/18)
- **Invalidated**: Privacy Shield (US)
- **Requirement**: Case-by-case assessment of US surveillance laws (FISA 702, EO 12333)
- **Supplementary Measures**: Technical (encryption), Contractual (SCCs+), Organizational (policies, audits)
- **Transfer Impact Assessment (TIA)**: Required for each third-country transfer

### EU-US Data Privacy Framework (2023)
- **Executive Order 14086**: Safeguards for US signals intelligence
- **Data Protection Review Court (DPRC)**: Independent redress
- **Adequacy Decision**: July 2023 (Commission Implementing Decision (EU) 2023/1795)
- **Review**: Annual joint review, 4-year sunset review
```

### 2.2 China Cross-Border Rules (PIPL/CSL/DSL)
```python
# China Cross-Border Data Transfer
CHINA_CROSS_BORDER = {
    'thresholds': {
        'personal_info': '1 million+ individuals',
        'sensitive_personal': '10,000+ individuals',
        'critical_data': 'Any amount (CII operators)',
        'important_data': 'Per industry catalog'
    },
    'mechanisms': {
        'security_assessment': 'CAC (for thresholds exceeded)',
        'standard_contract': 'CAC standard contract (for < thresholds)',
        'certification': 'CAC-certified body',
        'certification_body': 'CAC-approved certification body'
    },
    'data_localization': {
        'critical_infrastructure': 'Mandatory in China',
        'state_secrets': 'Prohibited from export',
        'personal_info_critical': 'CAC security assessment required'
    }
}
```

---

## 3. Cloud & Infrastructure Sovereignty

### 1. Sovereign Cloud Concepts
```markdown
| Model | Description | Providers | Use Case |
|---------|-------------|-----------|----------|
| **Sovereign Cloud** | Cloud infrastructure physically/legally in jurisdiction | AWS EU Sovereign, Azure EU Sovereign, Google Cloud Sovereign, OVHcloud, OVHcloud, Scaleway, IONOS | Regulated workloads, public sector |
| **Government Cloud** | Government-only regions | AWS GovCloud, Azure Government, AWS GovCloud, Azure Government | Public sector, defense |
| **Sovereign Cloud (EU)** | EU-owned, EU-law governed | GAIA-X, EU Cloud, OpenStack-based | Gaia-X, OpenStack, OpenNebula |
| **Sovereign AI** | AI models trained/hosted locally | Mistral, Aleph Alpha, Silo AI, OpenGPT-X | AI sovereignty |
| **Data Spaces** | Federated data sharing | Gaia-X, IDSA, Dataspaces | Industrial data spaces |
```

### 1.1 Major Sovereign Cloud Offerings (2024)
```markdown
| Provider | Offering | Jurisdiction | Certification |
|-----------|----------|--------------|---------------|
| **AWS** | AWS EU Sovereign Cloud | EU (Frankfurt) | EU GDPR, C5, BSI |
| **Microsoft** | Azure EU Sovereign Cloud | EU (Netherlands, Ireland) | EU GDPR, C5 |
| **Google** | Google Cloud Sovereign Controls | EU, UK, Canada, Japan | Assured Workloads |
| **OVHcloud** | Sovereign Cloud | France, EU | SecNumCloud, HDS |
| **OVHcloud** | Sovereign Cloud | France, EU | SecNumCloud, HDS |
| **Scaleway** | Sovereign Cloud | France, EU | SecNumCloud |
| **IONOS** | Sovereign Cloud | Germany, EU | C5, BSI |
| **Deutsche Telekom** | Open Telekom Cloud | Germany | C5, BSI |
| **OVHcloud** | Sovereign Cloud | France, EU | SecNumCloud |
| **Stackit** | Sovereign Cloud | Germany, EU | C5, BSI |
| **Sovereign Cloud Stack** | Open Source | EU, DE | Gaia-X, OpenStack |
| **OVHcloud** | Sovereign Cloud | France, EU | SecNumCloud |
```

### 1.1 Sovereign Cloud Comparison
```markdown
| Feature | AWS EU Sovereign | Azure EU Sovereign | Google Sovereign | OVHcloud Sovereign | StackIT |
|---------|------------------|--------------------|------------------|---------------------|---------|
| **Jurisdiction** | EU (Frankfurt) | EU (Netherlands) | EU, UK, Canada, Japan | France (SecNumCloud) | Germany (STACKIT) |
| **Control Plane** | AWS (US parent) | Microsoft (US parent) | Google (US parent) | OVHcloud (EU) | STACKIT (Schwarz Gruppe) |
| **Data Residency** | EU only | EU only | Configurable | France/EU | Germany |
| **Certifications** | C5, GDPR | C5, GDPR | Assured Workloads | SecNumCloud | C5, BSI |
| **Data Access** | AWS personnel (US) | MS personnel (US) | Google personnel (US) | OVH staff (EU) | STACKIT (DE) |
| **Legal Immunity** | US CLOUD Act applies | US CLOUD Act applies | US CLOUD Act applies | French law | German law |
```

---

## 3. Data Residency vs. Sovereignty

### 1. Residency vs. Sovereignty vs. Control
```markdown
| Concept | Definition | Enforcement |
|---------|------------|-------------|
| **Data Residency** | Physical location of data at rest | Contractual, contractual penalty |
| **Data Sovereignty** | Legal jurisdiction & control | Legal mandate, regulatory enforcement |
| **Data Control** | Operational control (keys, access) | Technical (encryption, IAM, HSM) |
| **Operational Sovereignty** | Ability to operate without foreign dependency | Contractual, architectural |
| **Technological Sovereignty** | Independence from foreign tech stack | Open source, open standards, local vendors |
```

### 2. Data Localization Architecture
```python
# Multi-region Architecture for Data Sovereignty
class SovereignArchitecture:
    def __init__(self):
        self.regions = {
            'eu-central-1': {'jurisdiction': 'EU', 'certifications': ['GDPR', 'C5', 'ISO27001']},
            'us-east-1': {'jurisdiction': 'US', 'certifications': ['SOC2', 'FedRAMP', 'HIPAA']},
            'ap-southeast-1': {'jurisdiction': 'SG', 'certifications': ['PDPA', 'MTCS']},
            'cn-north-1': {'jurisdiction': 'CN', 'certifications': ['MLPS', 'CSL', 'PIPL']}
        }
    
    def route_data(self, data_subject, data_classification):
        """Route data to appropriate sovereign region"""
        jurisdiction = self.determine_jurisdiction(data_subject)
        return self.regions[jurisdiction]
    
    def enforce_data_residency(self, data, region):
        """Enforce data residency via policy"""
        policies = {
            'encryption_at_rest': 'AES-256',
            'key_residency': 'local_kms',
            'access_logging': 'enabled',
            'cross_border_transfer': 'restricted',
            'backup_region': 'same_jurisdiction'
        }
        return self.enforce_policies(data, policies)
```

---

## 2. Cloud Provider Data Residency Controls

### 1. AWS Data Residency
```python
# AWS Data Residency Controls
AWS_CONTROLS = {
    'region_selection': 'Choose region at creation',
    'data_residency_guardrails': 'SCP deny-other-regions',
    'kms_key_residency': 'KMS keys cannot leave region',
    's3_bucket_location_constraint': 'Bucket location constraint',
    'rds_availability_zone': 'AZ-level control',
    'lambda@edge': 'Lambda@Edge for edge processing',
    'outposts': 'On-premises AWS hardware',
    'local_zones': 'Single-digit ms latency zones',
    'wavelength': '5G edge locations'
}

# SCP for Data Residency
SCP_DENY_NON_EU = {
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "DenyNonEURegions",
        "Effect": "Deny",
        "Action": [
            "s3:CreateBucket",
            "rds:CreateDBInstance",
            "dynamodb:CreateTable",
            "redshift:CreateCluster"
        ],
        "Condition": {
            "StringNotEquals": {
                "aws:RequestedRegion": ["eu-west-1", "eu-central-1", "eu-west-2", "eu-west-3", "eu-north-1"]
            }
        }
    }]
}
```

### 2. Azure Data Residency
```bash
# Azure Policy for Data Residency
az policy assignment create \
  --name "data-residency-eu" \
  --display-name "Enforce EU Data Residency" \
  --policy "/providers/Microsoft.Authorization/policyDefinitions/..." \
  --params '{
    "listOfAllowedLocations": {"value": ["westeurope", "northeurope", "francecentral", "germanywestcentral"]}
  }'
```

### 3. GCP Data Residency
```bash
# GCP Organization Policy
gcloud org-policies set-policy \
  --organization=ORG_ID \
  --policy-file=gcp-data-residency.yaml

# gcp-data-residency.yaml
constraint: constraints/gcp.resourceLocations
listPolicy:
  allowedValues:
    - europe-west1
    - europe-west2
    - europe-west3
    - europe-west4
    - europe-west6
    - europe-north1
```

---

## 3. Data Sovereignty in Practice

### 1. Multi-Cloud Sovereignty Strategy
```python
class SovereignMultiCloud:
    def __init__(self):
        self.providers = {
            'eu': {
                'primary': 'AWS EU Sovereign Cloud',
                'secondary': 'Azure EU Sovereign',
                'k8s': 'EKS on AWS Sovereign / AKS on Azure Sovereign'
            },
            'us_gov': {
                'primary': 'AWS GovCloud',
                'secondary': 'Azure Government',
                'k8s': 'EKS on GovCloud / AKS on Azure Gov'
            },
            'china': {
                'primary': 'AWS China (Sinnet)',
                'secondary': 'Azure China (21Vianet)',
                'k8s': 'ACK on Alibaba Cloud / TKE on Tencent'
            }
        }
    
    def deploy_workload(self, workload, jurisdiction):
        provider = self.providers[jurisdiction]['primary']
        return self.deploy_to(workload, provider)
```

### 2. Kubernetes Sovereignty
```yaml
# K8s Sovereignty Controls
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: sovereign-workload
spec:
  allowedCapabilities: []
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: MustRunAsNonRoot
  seLinux:
    rule: RunAsAny
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  - 'downwardAPI'
  - 'persistentVolumeClaim'
---
# Node Affinity for Data Residency
apiVersion: v1
kind: Node
metadata:
  labels:
    topology.kubernetes.io/region: eu-west-1
    sovereignty.eu/data-residency: "eu"
    sovereignty.eu/legal-jurisdiction: "EU"
```

---

## 3. Legal & Compliance Frameworks

### 1. Contractual Safeguards
```markdown
### Contractual Clauses for Data Sovereignty

**Contractual Clauses Checklist:**
- [ ] Data processing agreement (DPA) with SCCs
- [ ] Data residency clause (specific region/zone)
- [ ] Subprocessor notification & approval (30 days)
- [ ] Audit rights (SOC 2 Type II, ISO 27001, ISO 27017/27018)
- [ ] Subprocessor flow-down (same obligations)
- [ ] Audit rights (SOC 2 Type II, on-site audit rights)
- [ ] Data return/destruction on termination
- [ ] Liability caps & indemnification
- [ ] Insurance requirements (cyber, E&O)
- [ ] Governing law & jurisdiction
- [ ] Dispute resolution (arbitration, jurisdiction)
```

### 2. Data Processing Addendum (DPA) Checklist
```markdown
**DPA Required Elements (GDPR Art. 28):**
- [ ] Subject matter, duration, nature, purpose
- [ ] Types of personal data, categories of data subjects
- [ ] Controller obligations & rights
- [ ] Processor obligations (Art. 28)
- [ ] Subprocessor management (prior written consent, flow-down)
- [ ] Data subject rights assistance
- [ ] Security measures (Art. 32)
- [ ] Breach notification (72 hours)
- [ ] Data deletion/return on termination
- [ ] Audit/inspection rights
- [ ] International transfers (SCCs, BCRs, adequacy)
- [ ] Liability & indemnification
- [ ] Governing law & jurisdiction
```

---

## 3. Emerging Trends

### 1. Digital Sovereignty Initiatives
```markdown
| Initiative | Region | Focus |
|-----------|--------|-------|
| **GAIA-X** | EU | Federated data infrastructure, data spaces |
| **EU Data Strategy** | EU | Data spaces, Data Act, Data Governance Act |
| **Gaia-X** | EU | Federated data infrastructure, identity, trust |
| **EU Data Act** | EU | Data access, switching, interoperability |
| **Data Governance Act** | EU | Data altruism, data intermediaries |
| **Digital Markets Act** | EU | Gatekeepers, interoperability |
| **Digital Services Act** | EU | Platform accountability, transparency |
| **AI Act** | EU | AI risk classification, high-risk AI systems |
| **NIS2 Directive** | EU | Cybersecurity, critical entities |
| **Cyber Resilience Act** | EU | Product security, vulnerability handling |
```

### 2. Emerging Standards
```markdown
| Standard | Organization | Focus |
|--------|-------------|-------|
| **ISO/IEC 27552** | ISO | Privacy information management (PIMS) |
| **ISO/IEC 27559** | ISO | Privacy-enhancing de-identification |
| **ISO/IEC 27550** | ISO | Privacy engineering |
| **ISO/IEC 27560** | ISO | Privacy-by-design |
| **IEEE 7000** | IEEE | Ethical system design |
| **IEEE 7002** | IEEE | Data privacy process |
| **IEEE 7005** | IEEE | Transparency of data use |
| **NIST Privacy Framework** | NIST | Privacy risk management |
| **ISO 27557** | ISO | Privacy requirements for IoT |
```

---

## 7. Vendor Assessment for Sovereignty

### Vendor Sovereignty Assessment
```python
class VendorSovereigntyAssessment:
    def __init__(self):
        self.criteria = {
            'headquarters': {'weight': 0.20, 'question': 'Where is vendor HQ? Legal jurisdiction?'},
            'data_centers': {'weight': 0.25, 'question': 'Where are DCs? Can you pin regions?'}, 
            'ownership': {'weight': 0.15, 'question': 'Parent company, investors, beneficial owners?'}, 
            'legal_jurisdiction': {'weight': 0.15, 'question': 'Governing law, jurisdiction clause?'}, 
            'data_access': {'weight': 0.15, 'question': 'Who can access? Government requests?'}, 
            'subprocessors': {'weight': 0.10, 'question': 'Subprocessor list, location, change notice?'},
            'encryption': {'weight': 0.10, 'question': 'Customer-managed keys (CMK), BYOK, HYOK?'}
        }
    
    def assess(self, vendor_info):
        score = sum(
            w * self.score_criterion(c, vendor_info.get(k)) 
            for k, (w, _) in self.criteria.items()
        )
        return {
            'score': score,
            'tier': self.tier(score),
            'recommendations': self.recommendations(score)
        }
```

---

## 5. Key Takeaways

1. **Sovereignty ≠ Residency** - Legal jurisdiction matters more than physical location
2. **Contractual ≠ Technical** - Need both contractual (DPA, SCCs) AND technical (encryption, keys) controls
3. **Vendor Lock-in Risk** - Evaluate exit strategy, data portability, open standards
4. **Supply Chain** - Assess sub-processors, sub-processors' subprocessors
5. **Regulatory Change** - Monitor: EU Data Act, Data Governance Act, AI Act, NIS2, CRA
6. **Sovereign Stack** - Evaluate full stack: IaaS, PaaS, SaaS, SaaS, Identity, Keys
6. **Exit Strategy** - Data portability, exit fees, transition assistance, format portability

---

## 📚 Key References

| # | Citation | Link |
|---|----------|------|
| 1 | European Commission. "Guidelines on Cross-Border Data Transfers." 2021. | [Link](https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection_en) |
| 2 | European Data Protection Board. "Recommendations 01/2020 on Supplementary Measures." | [Link](https://edpb.europa.eu/) |
| 3 | European Commission. "EU Standard Contractual Clauses (2021)." | [Link](https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection_en) |
| 4 | European Commission. "Adequacy Decisions." | [Link](https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection_en) |
| 5 | CNIL. "Guide on International Transfers." 2023. | [Link](https://www.cnil.fr/en) |
| 6 | ICO. "International Transfers After Schrems II." 2021. | [Link](https://ico.org.uk/) |
| 7 | BSA. "Global Data Localization Laws." 2023. | [Link](https://www.bsa.org/policy/data-localization) |
| 8 | BSA. "Global Cloud Computing Scorecard." 2023. | [Link](https://www.bsa.org/policy/cloud-computing) |
| 9 | CSA. "Cloud Controls Matrix v4.0." | [Link](https://cloudsecurityalliance.org/research/cloud-controls-matrix/) |
| 10 | GAIA-X. "GAIA-X Architecture." | [Link](https://www.data-infrastructure.eu/GAIAX/) |

---

## 🔗 Cross-References

| Topic | Related Notes |
|-------|---------------|
| **Data Governance** | `Data Governance/02_Data_Governance.md` |
| **Data Security** | `Data Governance/04_Data_Security.md` |
| **Data Ownership** | `Data Governance/06_Data_Ownership.md` |
| **Data Management** | `Data Governance/03_Data_Management.md` |
| **Cloud Security** | `Data Governance/04_Data_Security.md#4-cloud-data-security` |
| **MLOps** | `Python Programming/MLOps/01_MLOps_Cheatsheet.md` |

---

*Last updated: 2024-11-05*
*Part of: 9-1-1 Data Whisperer knowledge base*