# Data Security

**Definition**: Data security is the practice of protecting digital information from unauthorized access, corruption, or theft throughout its entire lifecycle. (NIST SP 800-53)

---

## 1. Security Framework

### 1.1 CIA Triad + Extensions
```markdown
CIA Triad + Extensions:
├── Confidentiality    → Only authorized access
├── Integrity          → Data accuracy & completeness
├── Availability       → Accessible when needed
├── Authenticity       → Verify identity/source
├── Non-repudiation    → Cannot deny actions
├── Accountability     → Traceable actions
└── Reliability        → Consistent behavior
```

### 1.2 Security Frameworks
```markdown
| Framework | Scope | Key Controls |
|-----------|-------|--------------|
| **NIST CSF** | US Federal/Critical Infra | Identify, Protect, Detect, Respond, Recover |
| **ISO 27001/27002** | International ISMS | 114 controls (Annex A) |
| **NIST 800-53** | US Federal Systems | 1000+ controls (20 families) |
| **ISO 27001/27002** | ISMS | 114 controls (14 domains) |
| **SOC 2** | Service Orgs | Security, Availability, Confidentiality, PI, Processing Integrity |
| **ISO 27017/27018** | Cloud Security | Cloud-specific controls |
| **CIS Controls** | Cyber Defense | 18 Critical Controls (v8) |
| **MITRE ATT&CK** | Threat Modeling | Tactics, Techniques, Procedures (TTPs) |
```

---

## 2. Data Classification & Handling

### 1. Data Classification Schema
```python
# Data Classification Standard
DATA_CLASSIFICATION = {
    'PUBLIC': {
        'label': 'PUBLIC',
        'description': 'No harm if disclosed',
        'examples': ['Marketing materials', 'Public docs', 'Press releases'],
        'controls': ['No encryption required', 'Public access OK'],
        'retention': 'Per policy'
    },
    'INTERNAL': {
        'label': 'INTERNAL',
        'description': 'Minor harm if disclosed',
        'examples': ['Internal memos', 'Org charts', 'Internal policies'],
        'controls': ['Auth required', 'Need-to-know', 'Encryption at rest'],
        'retention': 'Per policy'
    },
    'CONFIDENTIAL': {
        'label': 'CONFIDENTIAL',
        'description': 'Significant harm if disclosed',
        'examples': ['Financial data', 'PII', 'Contracts', 'IP'],
        'controls': ['Encryption at rest/transit', 'MFA', 'Need-to-know', 'DLP', 'Audit logging'],
        'retention': 'Per legal/regulatory'
    },
    'RESTRICTED': {
        'label': 'RESTRICTED',
        'description': 'Severe harm if disclosed',
        'examples': ['SSN, PHI, Keys, Secrets', 'Trade secrets', 'M&A data'],
        'controls': ['E2E encryption', 'HSM', 'Just-in-time access', 'Zero-trust', 'Watermarking'],
        'retention': 'Legal hold / per regulation'
    }
}
```

### 2.1 Data Handling Matrix
```markdown
| Classification | Storage | Transit | Sharing | Disposal | Access Review |
|----------------|---------|---------|---------|----------|---------------|
| PUBLIC         | Standard | TLS 1.2+ | Public | Standard delete | Annual |
| INTERNAL       | Encrypted at rest | TLS 1.2+ | Internal only | Secure delete | Annual |
| CONFIDENTIAL   | AES-256 | TLS 1.3, mTLS | Need-to-know, NDA | Crypto-shred | Quarterly |
| RESTRICTED     | HSM, envelope enc | mTLS, certificate pinning | Just-in-time, time-bound | Crypto-shred, witness | Monthly |
```

---

## 2. Identity & Access Management (IAM)

### 1. Zero Trust Architecture (NIST 800-207)
```python
# Zero Trust Principles
ZERO_TRUST_PRINCIPLES = {
    'verify_explicitly': 'Always authenticate and authorize',
    'least_privilege': 'Minimal access, just-in-time, just-enough',
    'assume_breach': 'Assume breach, verify continuously',
    'micro_segmentation': 'Micro-perimeters, micro-segmentation',
    'encryption_everywhere': 'Encrypt all data, at rest and in transit'
}

# Zero Trust Architecture Components
ZT_ARCHITECTURE = {
    'identity_provider': 'IdP (Okta, Entra ID, Okta, Ping)',
    'device_trust': 'MDM/EDR, device health attestation',
    'policy_engine': 'Policy Decision Point (PDP)',
    'policy_enforcement': 'Policy Enforcement Point (PEP)',
    'continuous_verification': 'Continuous authentication, risk scoring'
}
```

### 2.1 Access Control Models
```markdown
| Model | Description | Use Case |
|---------|-------------|----------|
| **RBAC** | Role-Based Access Control | Traditional, role-based |
| **ABAC** | Attribute-Based Access Control | Fine-grained, dynamic |
| **ReBAC** | Relationship-Based | Graph-based, social, hierarchical |
| **PBAC** | Policy-Based | Centralized policy engine (OPA, Cedar) |
| **ZTNA** | Zero Trust Network Access | Replace VPN, identity-centric |
```

### 2.2 Modern IAM Stack
```yaml
# Modern IAM Stack
IAM_STACK:
  identity_provider:
    - Okta / Entra ID / Auth0 / Keycloak / OIDC / SAML
  privileged_access:
    - CyberArk / BeyondTrust / HashiCorp Boundary / Teleport
  secrets_management:
    - HashiCorp Vault / AWS Secrets Manager / Azure Key Vault / Doppler
  secrets_rotation:
    - Automatic rotation, dynamic secrets, lease management
  just_in_time:
    - JIT access, ephemeral credentials, break-glass
  device_trust:
    - Kolide, Kolide, Fleet, MDM integration
  network:
    - Zero Trust Network (Tailscale, Tailscale, Cloudflare Access, Twingate)
```

---

## 3. Data Protection Technologies

### 1. Encryption
```python
# Encryption Standards
ENCRYPTION_STANDARDS = {
    'at_rest': {
        'algorithm': 'AES-256-GCM',
        'key_management': 'HSM / Cloud KMS (AWS KMS, GCP KMS, Azure Key Vault)',
        'key_hierarchy': 'DEK -> KEK -> Master Key -> Root',
        'rotation': 'Annual or on compromise'
    },
    'in_transit': {
        'protocol': 'TLS 1.3',
        'cipher_suites': ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
        'mutual_tls': True,
        'certificate_management': 'Automated (cert-manager, Let\'s Encrypt, Venafi)'
    },
    'in_use': {
        'confidential_computing': ['Intel SGX', 'AMD SEV-SNP', 'AWS Nitro Enclaves'],
        'homomorphic_encryption': 'CKKS, BFV, TFHE-rs',
        'secure_enclaves': ['AWS Nitro', 'Azure Confidential', 'GCP Confidential']
    }
}

# Key Management
KEY_MANAGEMENT = {
    'hierarchy': 'Root -> KEK -> DEK -> Data',
    'rotation': 'Automated, annual for KEK, per-policy for DEK',
    'backup': 'Split knowledge, split custody, geographic distribution',
    'destruction': 'Crypto-shred (key destruction = data destruction)'
}
```

### 2.1 Application-Level Encryption
```python
# Application-Level Encryption (ALE)
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

class FieldEncryption:
    def __init__(self, master_key: bytes):
        self.fernet = Fernet(master_key)
    
    def encrypt_field(self, value: str) -> str:
        return self.fernet.encrypt(value.encode()).decode()
    
    def decrypt_field(self, encrypted: str) -> str:
        return self.fernet.decrypt(encrypted.encode()).decode()

# Searchable Encryption (SSE)
# Use deterministic encryption for equality, OPE for range
# Or use encrypted search (CryptDB, EncryptedSearch)
```

### 2.2 Tokenization & Masking
```python
# Tokenization (Format-Preserving Encryption)
from fpe import FF1, FF3

# Format-Preserving Encryption (FPE)
fpe = FF1(key, tweak, radix=10)
token = fpe.encrypt("1234-5678-9012-3456")  # "4821-9034-5678-1234"

# Dynamic Data Masking (SQL)
# SQL Server: ALTER TABLE Users ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()')
# PostgreSQL: CREATE POLICY mask_email ON users USING (current_user != 'admin')
```

---

## 3. Data Loss Prevention (DLP)

### 1. DLP Patterns
```python
# DLP Rule Engine
DLP_RULES = {
    'pii': {
        'patterns': [
            r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
            r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit card
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  # Email
        ],
        'action': 'block, alert, quarantine'
    },
    'phi': {
        'patterns': [
            r'\b\d{10}\b',  # MRN
            r'\b\d{3}-\d{2}-\d{4}\b'  # SSN in medical
        ],
        'action': 'block, alert, encrypt'
    },
    'pci': {
        'patterns': ['credit_card', 'cvv', 'track_data'],
        'action': 'block, alert, tokenize'
    },
    'intellectual_property': {
        'patterns': ['confidential', 'proprietary', 'trade_secret'],
        'action': 'alert, watermark'
    }
}
```

### 2.1 DLP Deployment Patterns
```markdown
| Deployment | Use Case | Tools |
|-----------|----------|-------|
| **Network DLP** | Email, web, FTP, network shares | Forcepoint, Symantec, Digital Guardian |
| **Endpoint DLP** | Endpoints (laptop, mobile) | Microsoft Purview, Forcepoint, Digital Guardian |
| **Cloud DLP** | Cloud storage, SaaS (O365, GDrive, Slack) | Microsoft Purview, Nightfall, Cloud DLP |
| **Database DLP** | Structured data, databases | Oracle DLP, IBM Guardium, Imperva |
| **API DLP** | REST/GraphQL APIs | Nightfall, Bearer, custom middleware |
```

---

## 4. Cloud Data Security

### 1. Cloud Provider Security
```markdown
| Control | AWS | GCP | Azure |
|---------|-----|-----|-------|
| **KMS** | KMS | Cloud KMS | Key Vault |
| **HSM** | CloudHSM | Cloud HSM | Dedicated HSM |
| **Secrets** | Secrets Manager | Secret Manager | Key Vault |
| **DLP** | Macie | Cloud DLP | Purview DLP |
| **Encryption** | SSE-S3, SSE-KMS, CSE | CSEK, CMEK | SSE, CMK |
| **Network** | VPC, Security Groups, NACL | VPC, Firewall | VNet, NSG, Firewall |
| **Private Link** | PrivateLink, VPC Endpoints | Private Service Connect | Private Link |
| **WAF** | WAF, Shield | Cloud Armor | WAF, Front Door |
| **DDoS** | Shield Standard/Advanced | Cloud Armor | DDoS Protection |
| **Logging** | CloudTrail, GuardDuty | Cloud Audit Logs, SCC | Activity Log, Defender |
| **CSPM** | Security Hub | Security Command Center | Defender for Cloud |
```

### 2.1 Infrastructure Security (Terraform)
```hcl
# Terraform: S3 Bucket with Encryption
resource "aws_s3_bucket" "secure_bucket" {
  bucket = "secure-data-bucket"
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "AES256"
        kms_master_key_id = aws_kms_key.bucket_key.arn
      }
    }
  }
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    enabled = true
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
  
  # Block public access
  public_access_block {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }
}
```

---

## 5. Incident Response & Breach Management

### 1. Incident Response Plan (NIST 800-61)
```markdown
Incident Response Lifecycle:
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ PREPARATION │──▶│ DETECTION   │──▶│ CONTAINMENT │──▶│ ERADICATION │──▶│ RECOVERY    │──▶│ LESSONS     │
│   (Plan,    │   │   (Detect,  │   │  (Isolate,  │   │  (Remove    │   │  (Restore   │   │  (Root     │
│   Train,    │   │   Alert,    │   │   Contain)  │   │  Threat,    │   │  Systems,   │   │  Cause,    │
│   Tools)    │   │   Triage)   │   │             │   │  Clean)     │   │  Validate)  │   │  Improve)  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### 1.1 Data Breach Response (GDPR/CCPA)
```python
# Breach Notification Timeline
BREACH_TIMELINE = {
    'detection': 'T+0',           # Detect breach
    'assessment': 'T+4h',         # Assess scope, severity
    'notification_72h': 'T+72h',  # GDPR: 72 hours to supervisory authority
    'individual_notice': 'T+72h', # Notify affected individuals
    'regulatory_report': 'T+72h', # Report to authority
    'public_notice': 'T+30d',     # Public disclosure if required
    'remediation': 'T+30d',       # Remediate, document
    'audit': 'T+90d'              # Post-incident audit
}

# Evidence preservation
EVIDENCE_PRESERVATION = {
    'chain_of_custody': 'Document every handoff',
    'forensic_images': 'Bit-for-bit images, hash verification',
    'logs': 'Centralized, immutable, tamper-evident',
    'legal_hold': 'Immediate legal hold on relevant systems'
}
```

---

## 5. Application Security

### 1. Secure SDLC (DevSecOps)
```yaml
# Secure SDLC Pipeline
SECURE_SDLC:
  design:
    - threat_modeling: STRIDE, PASTA, attack trees
    - secure_design: least privilege, fail-safe defaults
    - privacy_by_design: PbD, privacy by default
  
  development:
    - secure_coding: OWASP Top 10, CWE Top 25
    - sast: SAST (SonarQube, CodeQL, Semgrep, CodeQL)
    - secrets: detect-secrets, truffleHog, git-secrets
    - dependencies: dependabot, renovate, Snyk, Dependabot
    - sbom: CycloneDX, SPDX, Syft
  
  testing:
    - dast: DAST (OWASP ZAP, Burp)
    - iast: IAST (Contrast, Contrast)
    - sast: SAST in CI/CD
    - sca: SCA (OWASP Dependency Check, Snyk, Grype)
    - secrets: GitLeaks, TruffleHog, GitGuardian
    - container: Trivy, Grype, Syft, Cosign
  
  deployment:
    - iac_scanning: tfsec, checkov, terrascan, kics
    - policy: OPA/Gatekeeper, Kyverno
    - admission: Kyverno, Gatekeeper
    - sbom: Syft, SPDX, CycloneDX
    - signing: Cosign, Sigstore, Notary
  
  runtime:
    - runtime_security: Falco, Tetragon, Tracee
    - runtime_protection: eBPF, Cilium, Falco
    - drift_detection: driftctl, terraform drift
    - compliance: Kyverno, Kyverno policies
```

---

## 6. Privacy Engineering

### 1. Privacy by Design (PbD - Cavoukian)
```markdown
7 Foundational Principles:
1. Proactive not Reactive; Preventative not Remedial
2. Privacy as the Default Setting
3. Privacy Embedded into Design
4. Full Functionality — Positive-Sum, not Zero-Sum
5. End-to-End Security — Full Lifecycle Protection
5. Visibility and Transparency — Keep it Open
7. Respect for User Privacy — Keep it User-Centric
```

### 2. Privacy Impact Assessment (DPIA)
```python
# DPIA Template (GDPR Article 35)
class DPIA:
    def __init__(self):
        self.sections = {
            'project_overview': {},
            'data_flow': {},
            'necessity_proportionality': {},
            'risk_assessment': {},
            'mitigation_measures': {},
            'consultation': {},
            'review_date': None
        }
    
    def assess_necessity(self, processing):
        # Is processing necessary for purpose?
        # Proportional? Minimal data?
        pass
    
    def assess_risks(self):
        # Likelihood x Severity
        # Rights & freedoms impact
        pass
```

### 2.1 Data Subject Rights (GDPR/CCPA)
```python
# Data Subject Rights Implementation
DSR_HANDLERS = {
    'access': lambda dsr: export_user_data(dsr.user_id),          # Art. 15
    'rectification': lambda dsr: rectify_data(dsr.user_id, dsr.corrections),  # Art. 16
    'erasure': lambda dsr: erase_personal_data(dsr.user_id),      # Art. 17 (Right to be Forgotten)
    'restrict': lambda dsr: restrict_processing(dsr.user_id),     # Art. 18
    'portability': lambda dsr: export_portable(dsr.user_id),      # Art. 20
    'objection': lambda dsr: object_processing(dsr.user_id),      # Art. 21
    'automated_decision': lambda dsr: review_automated(dsr.user_id)  # Art. 22
}

# CCPA/CPRA
CCPA_RIGHTS = {
    'know': 'What personal info collected, sold, shared',
    'delete': 'Right to deletion',
    'opt_out': 'Opt-out of sale/sharing',
    'non_discrimination': 'No discrimination for exercising rights',
    'limit_use': 'Limit use of sensitive personal information'
}
```

---

## 7. Compliance Automation

### 1. Compliance as Code
```python
# Compliance as Code (Open Policy Agent)
package compliance.gdpr

# GDPR Article 25 - Data Protection by Design
deny[msg] {
    input.resource.type == "database"
    not input.resource.encryption_at_rest
    msg := "Database must have encryption at rest (GDPR Art. 25)"
}

# Data retention
deny[msg] {
    input.resource.type == "table"
    not input.resource.ttl
    msg := "Table must have retention policy (GDPR Art. 5)"
}

# Data subject rights
deny[msg] {
    input.api.endpoint == "/api/user/data"
    input.method == "DELETE"
    not input.authenticated
    msg := "Data deletion requires authentication (GDPR Art. 17)"
}
```

---

## 6. Cloud Security Posture Management (CSPM)

```python
# Cloud Security Posture Management
CSPM_CHECKS = {
    'identity': [
        'No root access keys',
        'MFA enforced for all users',
        'No wildcard IAM policies',
        'MFA enforced for root'
    ],
    'network': [
        'No public S3 buckets',
        'No unrestricted security groups',
        'VPC flow logs enabled',
        'Private endpoints for PaaS'
    ],
    'data': [
        'Encryption at rest (default)',
        'Encryption in transit (TLS 1.2+)',
        'Key rotation enabled',
        'Public access blocked'
    ],
    'logging': [
        'CloudTrail enabled globally',
        'VPC Flow Logs enabled',
        'CloudTrail log validation',
        'Centralized logging'
    ],
    'monitoring': [
        'GuardDuty/Defender/SCC enabled',
        'Config rules for drift',
        'Security Hub/Defender/SCC enabled'
    ]
}
```

---

## 8. Incident Response Playbooks

### 1. Data Breach Playbook
```markdown
# Data Breach Response Playbook

## Phase 1: Detection (0-4 hours)
- [ ] Alert received (SIEM, DLP, user report, threat intel)
- [ ] Triage: severity, scope, data types affected
- [ ] Activate IR team (IR Lead, Legal, PR, Engineering, Exec)
- [ ] Preserve evidence (forensic images, logs, chain of custody)

### Phase 2: Containment (4-24 hours)
- [ ] Isolate affected systems (network segmentation, revoke creds)
- [ ] Preserve evidence (forensic images, logs, memory dumps)
- [ ] Deploy compensating controls (WAF rules, block IPs, revoke keys)
- [ ] Notify IR team, legal, PR, exec sponsor

### Phase 3: Eradication (24-72 hours)
- [ ] Root cause analysis (RCA)
- [ ] Remove threat actor access
- [ ] Patch vulnerabilities, rotate all credentials
- [ ] Validate clean environment

### Phase 4: Recovery (1-7 days)
- [ ] Restore from clean backups (verify integrity)
- [ ] Deploy enhanced monitoring
- [ ] Gradual service restoration
- [ ] Validate data integrity

### Phase 5: Post-Incident (30 days)
- [ ] Root Cause Analysis (RCA)
- [ ] Update IR plan, runbooks, detection rules
- [ ] Notify regulators (72h GDPR, state AGs, industry regulators)
- [ ] Notify affected individuals
- [ ] Update IR plan, run tabletop exercise
```

---

## 📚 Key References

| # | Citation | Link |
|---|----------|------|
| 1 | NIST SP 800-53 Rev. 5. "Security and Privacy Controls." NIST, 2020. | [Link](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) |
| 2 | NIST SP 800-207. "Zero Trust Architecture." NIST, 2020. | [Link](https://csrc.nist.gov/publications/detail/sp/800-207/final) |
| 3 | NIST SP 800-61 Rev. 2. "Computer Security Incident Handling Guide." 2012. | [Link](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final) |
| 4 | ISO/IEC 27001:2022. "Information Security Management Systems." | [ISO](https://www.iso.org/standard/27001) |
| 5 | ISO/IEC 27017:2015. "Cloud Security Controls." | [ISO](https://www.iso.org/standard/43757.html) |
| 6 | ISO/IEC 27018:2019. "PII Protection in Public Clouds." | [ISO](https://www.iso.org/standard/61498.html) |
| 7 | OWASP Top 10 2021. | [Link](https://owasp.org/www-project-top-ten/) |
| 6 | MITRE ATT&CK Framework. | [Link](https://attack.mitre.org/) |
| 7 | CIS Controls v8. | [Link](https://www.cisecurity.org/controls/) |
| 8 | Cloud Security Alliance. "Cloud Controls Matrix (CCM) v4." 2023. | [Link](https://cloudsecurityalliance.org/research/cloud-controls-matrix/) |
| 9 | OWASP Top 10 2021. | [Link](https://owasp.org/www-project-top-ten/) |
| 10 | Cloud Security Alliance. "STAR Registry." | [Link](https://cloudsecurityalliance.org/star/) |

---

## 🔗 Cross-References

| Topic | Related Notes |
|-------|---------------|
| **Data Governance** | `Data Governance/02_Data_Governance.md` |
| **Data Management** | `Data Governance/03_Data_Management.md` |
| **Data Sovereignty** | `Data Governance/05_Data_Sovereignty.md` |
| **Data Ownership** | `Data Governance/06_Data_Ownership.md` |
| **Data Literacy** | `Data Governance/01_Data_Literacy.md` |
| **MLOps Security** | `Python Programming/MLOps/01_MLOps_Cheatsheet.md` |
| **Data Engineering** | `Python Programming/07_Data_Engineering_Cheatsheet.md` |

---

*Last updated: 2024-11-05*
*Part of: 9-1-1 Data Whisperer knowledge base*