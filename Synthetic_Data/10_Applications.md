# Synthetic Data Applications & Use Cases

A comprehensive guide to practical applications of synthetic data across industries and domains.

---

## 1. Machine Learning & AI Development

### 1.1 Data Augmentation for ML Training
```python
# Data augmentation for imbalanced datasets
from imblearn.over_sampling import SMOTE, ADASYN
from imblearn.over_sampling import RandomOverSampler

# Traditional oversampling
smote = SMOTE(sampling_strategy='auto', k_neighbors=5)
X_res, y_res = smote.fit_resample(X_train, y_train)

# Synthetic minority oversampling
from imblearn.over_sampling import SMOTE, ADASYN, BorderlineSMOTE
from imblearn.under_sampling import RandomUnderSampler

# Combined over/under sampling
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.combine import SMOTEENN, SMOTETomek

pipeline = ImbPipeline([
    ('over', SMOTE(sampling_strategy=0.5)),
    ('under', RandomUnderSampler(sampling_strategy=0.8)),
    ('clf', XGBClassifier())
])
```

### 2. Low-Resource / Few-Shot Learning
```python
# Few-shot learning with synthetic data
def few_shot_augmentation(few_shot_data, target_size=1000):
    """Augment few-shot dataset with synthetic samples"""
    from sdv.single_table import CTGANSynthesizer
    from sdv.metadata import SingleTableMetadata
    
    metadata = SingleTableMetadata()
    metadata.detect_from_dataframe(few_shot_df)
    
    synthesizer = CTGANSynthesizer(
        metadata,
        epochs=500,
        batch_size=32
    )
    synthesizer.fit(few_shot_data)
    
    # Generate to reach target size
    n_needed = target_size - len(few_shot_data)
    synthetic = synthesizer.sample(num_rows=target_size - len(few_shot_data))
    
    return pd.concat([few_shot_df, synthetic], ignore_index=True)

# Few-shot classification with synthetic support
def few_shot_classification(few_shot_data, test_data):
    # Generate synthetic support set
    synthetic_support = generate_synthetic_support(few_shot_data)
    
    # Train on combined
    model = train_classifier(
        pd.concat([few_shot_data, synthetic_data])
    )
    return evaluate_on_test(model, test_data)
```

### 3. Data Augmentation for Computer Vision
```python
# Image augmentation with Albumentations
import albumentations as A

transform = A.Compose([
    A.HorizontalFlip(p=0.5),
    A.RandomRotate90(p=0.5),
    A.RandomBrightnessContrast(p=0.3),
    A.GaussNoise(p=0.2),
    A.GaussianBlur(p=0.1),
    A.ElasticTransform(p=0.1),
    A.GridDistortion(p=0.1),
])

# For semantic segmentation
transform = A.Compose([
    A.HorizontalFlip(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.1, rotate_limit=15),
    A.RandomBrightnessContrast(0.2, 0.2),
], additional_targets={'mask': 'mask'})
```

---

## 2. Privacy-Enhancing Applications

### 1. Data Sharing & Collaboration
```python
# Secure Data Sharing with Synthetic Data
class SecureDataSharing:
    """
    Share synthetic data instead of real data for:
    - Cross-organization collaboration
    - Vendor/partner data sharing
    - Academic research partnerships
    - Regulatory sandbox testing
    """
    
    def share_data(self, real_data, partner, privacy_budget=1.0):
        # Generate synthetic version
        synthetic = self.generate_private_synthetic(
            real_data, 
            epsilon=1.0,
            delta=1e-5
        )
        
        # Validate utility
        utility_report = self.validate_utility(
            real_data, synthetic_data, test_suite
        )
        
        if utility_report.utility_preserved:
            return share_with_partner(synthetic_data, partner)
        else:
            raise ValueError("Utility not preserved")
```

### 2. Data Marketplace / Monetization
```python
class DataMarketplace:
    """
    Synthetic data marketplace for monetization
    """
    def list_dataset(self, synthetic_data, metadata, pricing_model):
        """
        Pricing models:
        - Per record: $X per 1K records
        - Subscription: $X/month for access
        - Revenue share: % of downstream revenue
        - Per-query: $X per API call
        """
        pass
    
    def license_data(self, buyer, license_type):
        """
        License types:
        - Perpetual: Unlimited use
        - Subscription: Time-limited
        - Project-based: Per project
        - Academic: Reduced rate
        """
        pass
```

### 3. Data Marketplaces with Synthetic Data
```python
class SyntheticDataMarketplace:
    """
    Platform for buying/selling synthetic data
    """
    def list_dataset(self, synthetic_data, metadata, license_type):
        listing = {
            'data': synthetic_data,
            'metadata': metadata,
            'license': LicenseType.COMMERCIAL,
            'pricing': PricingModel.PER_RECORD,
            'price_per_1k': 10.00
        }
        return self.list_dataset(listing)
    
    def purchase(self, buyer, dataset_id, license_type):
        # Verify buyer, process payment, deliver data
        pass
```

---

## 2. Testing & Quality Assurance

### 1. Test Data Generation
```python
# Test Data Generation for Software Testing
class TestDataGenerator:
    """Generate realistic test data for software testing"""
    
    def generate_test_cases(self, schema, n_cases=1000):
        """
        Generate test cases covering:
        - Happy path
        - Edge cases
        - Boundary values
        - Invalid inputs
        - Security edge cases
        """
        pass
    
    def generate_api_test_data(self, api_spec, n_cases=100):
        """Generate test cases from OpenAPI/Swagger spec"""
        pass
    
    def generate_boundary_tests(self, field_specs):
        """Generate boundary value tests"""
        pass

# Property-based testing with synthetic data
from hypothesis import given, strategies as st

@given(st.data())
def test_user_registration(data):
    user_data = data.draw(user_strategy())
    result = register_user(user_data)
    assert result.status_code in [200, 400, 409]

# Property-based testing with synthetic data
@given(st.data())
def test_user_registration(data):
    user_data = data.draw(
        st.fixed_dictionaries({
            'email': st.emails(),
            'age': st.integers(min_value=13, max_value=120),
            'username': st.text(min_size=3, max_size=30)
        })
    result = register_user(user_data)
    assert result.success or result.error_code in ['DUPLICATE', 'INVALID']
```

### 2. Chaos Engineering / Resilience Testing
```python
# Chaos engineering with synthetic faults
class ChaosTesting:
    def inject_failures(self, system, failure_mode):
        """
        Failure modes:
        - Network latency
        - Packet loss
        - Service unavailable
        - Data corruption
        - Latency spikes
        """
        pass
    
    def generate_chaos_scenarios(self, n_scenarios=100):
        """Generate synthetic failure scenarios"""
        pass
```

### 3. CI/CD Test Data
```yaml
# .github/workflows/test.yml
name: Test with Synthetic Data
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate test data
        run: python generate_test_data.py --n 10000 --output test_data.parquet
      - name: Run tests
        run: pytest tests/ --data-file test_data.parquet
```

---

## 3. Privacy-Enhancing Applications

### 1. Data Anonymization / De-identification
```python
# Synthetic data as de-identification technique
class SyntheticDeidentification:
    """
    Replace real PII with synthetic but realistic data
    """
    
    def deidentify(self, df, pii_columns, epsilon=1.0):
        """
        Replace PII columns with synthetic but realistic data
        Preserves statistical properties for analytics
        """
        pii_columns = self.identify_pii(df)
        
        for col in pii_columns:
            if col in df.columns:
                # Generate synthetic replacement
                synthetic_col = self.generate_synthetic_column(
                    df[col], column_type=self.infer_type(df[col])
                )
                df[col] = synthetic_column
        
        return df
    
    def identify_pii(self, df):
        """Auto-detect PII columns"""
        pii_patterns = {
            'email': r'[\w\.-]+@[\w\.-]+',
            'ssn': r'\d{3}-\d{2}-\d{4}',
            'phone': r'\d{3}-\d{3}-\d{4}',
            'credit_card': r'\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}',
            'ip': r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
        }
        # Use regex + NER to detect PII columns
        return detected_columns
```

### 2. Data Masking vs Synthetic Replacement
```python
class DataMasking:
    """
    Traditional masking vs Synthetic replacement
    """
    
    def mask_vs_synthetic(self, df, pii_columns):
        """
        Comparison:
        - Masking: XXXX-XXXX-XXXX-1234 (destroys utility)
        - Synthetic: 4532-1234-5678-9012 (preserves format, valid Luhn)
        """
        pass
    
    def synthetic_replacement(self, df, pii_columns):
        """
        Replace PII with synthetically generated but valid data
        Preserves:
        - Format/format validity (Luhn check for CC)
        - Statistical distributions
        - Cross-column correlations
        """
        pass
```

---

## 5. ML/AI Applications

### 1. Data Augmentation for ML
```python
# Augmentation for imbalanced classification
class ImbalancedDataAugmenter:
    def augment_minority_class(self, X, y, target_ratio=1.0):
        """
        Generate synthetic samples for minority class
        """
        from imblearn.over_sampling import SMOTE, ADASYN, BorderlineSMOTE
        from imblearn.over_sampling import SVMSMOTE, KMeansSMOTE
        
        # Advanced oversampling
        smote = SMOTE(sampling_strategy=0.5, k_neighbors=5)
        X_res, y_res = smote.fit_resample(X, y)
        
        # Or use synthetic data generation
        synth = self.generate_synthetic_minority(X, y, target_ratio=1.0)
        return pd.concat([X, synth_X]), pd.concat([y, synth_y])

# For deep learning
def augment_training_data(train_dataset, augmentation_factor=2.0):
    """
    Augment training data with synthetic samples
    """
    synthetic = generate_synthetic(len(train_data) * (augmentation_factor - 1))
    return ConcatDataset([train_dataset, SyntheticDataset(synth)])
```

### 2. Domain Adaptation with Synthetic Data
```python
# Domain adaptation with synthetic data
def domain_adaptation(source_domain, target_domain_unlabeled):
    """
    Generate synthetic target domain data from source
    """
    # Train domain translator
    translator = DomainTranslator()
    translator.fit(source_data, target_unlabeled)
    
    # Generate synthetic target data
    synthetic_target = translator.translate(source_data)
    
    # Train on source + synthetic target
    combined = pd.concat([source_data, synthetic_target])
    model = train_model(combined)
    return model
```

---

## 4. Privacy & Compliance Applications

### 1. GDPR / CCPA Compliance
```python
class GDPRCompliantSynthesis:
    """
    Generate synthetic data for GDPR compliance
    """
    
    def anonymize_for_gdpr(self, df, quasi_identifiers, sensitive_attrs):
        """
        Generate synthetic data that satisfies:
        - k-anonymity (k >= 5)
        - l-diversity (l >= 3)
        - t-closeness (t < 0.2)
        - Differential privacy (epsilon=1.0)
        """
        pass
    
    def generate_gdpr_compliant(self, df, quasi_ids, sensitive_attrs):
        # Generate synthetic data with privacy guarantees
        synth = self.generate_private_synthetic(
            df, 
            epsilon=1.0,
            quasi_identifiers=quasi_ids,
            sensitive_attrs=sensitive_attrs
        )
        
        # Verify compliance
        assert check_k_anonymity(synth, quasi_ids, k=5)
        assert check_l_diversity(synth, quasi_ids, sensitive_col, l=3)
        assert check_t_closeness(synth, quasi_ids, sensitive_col, t=0.2)
        
        return synth
```

### 2. HIPAA Safe Harbor
```python
def hipaa_safe_harbor_synthesis(df):
    """
    Generate HIPAA Safe Harbor compliant synthetic data
    Removes 18 identifiers per HIPAA Safe Harbor
    """
    HIPAA_IDENTIFIERS = [
        'names', 'geographic_subdivisions', 'dates', 'phone_numbers',
        'fax_numbers', 'email_addresses', 'ssn', 'medical_record_numbers',
        'health_plan_numbers', 'account_numbers', 'certificate_numbers',
        'vehicle_ids', 'device_ids', 'web_urls', 'ip_addresses',
        'biometric_ids', 'photos', 'any_unique_identifying_number'
    ]
    
    # Option 1: Remove identifiers, synthesize replacements
    df_safe = df.drop(columns=HIPAA_IDENTIFIERS, errors='ignore')
    synth = generate_synthetic_replacements(df, HIPAA_IDENTIFIERS)
    
    # Option 2: Expert determination (statistical expert certification)
    # Statistical expert certifies re-identification risk is very small
    return certify_expert_determination(df)
```

---

## 4. Domain-Specific Applications

### 1. Healthcare / Clinical Trials
```python
# Synthetic Patient Data for Clinical Research
class ClinicalTrialSynthesizer:
    """
    Generate synthetic patient data for:
    - Protocol feasibility assessment
    - Statistical analysis plan development
    - Statistical analysis plan (SAP) testing
    - Site feasibility assessment
    """
    
    def generate_patient_cohort(self, protocol, n_patients=1000):
        """
        Generate synthetic patient cohort matching:
        - Inclusion/exclusion criteria
        - Baseline characteristics
        - Comorbidities
        - Concomitant medications
        - Lab value distributions
        - Adverse event profiles
        """
        pass
    
    def simulate_trial_outcomes(self, protocol, n_simulations=1000):
        """Simulate trial outcomes under different assumptions"""
        pass

# Synthetic control arms
class SyntheticControlArm:
    """
    Generate synthetic control arms for clinical trials
    - Historical control synthesis
    - External control arm generation
    - Regulatory submission support (FDA/EMA)
    """
    pass
```

### 2. Financial Services
```python
class FinancialDataSynthesizer:
    """
    Synthetic financial data for:
    - Fraud detection model training
    - Credit risk modeling
    - Stress testing
    - Regulatory reporting (CCAR, Basel III)
    - Anti-money laundering (AML) training
    """
    
    def generate_transaction_data(self, n_transactions=1_000_000):
        """Generate realistic transaction data with:
        - Realistic merchant categories
        - Temporal patterns (daily/weekly/seasonal)
        - Fraud patterns (known typologies)
        - Geographic distributions
        - Customer behavior profiles
        """
        pass
    
    def generate_credit_portfolio(self, n_loans=100000):
        """Generate synthetic loan portfolio for stress testing"""
        pass
    
    def generate_aml_training_data(self, n_alerts=10000):
        """Generate synthetic SAR/STR training data"""
        pass
```

### 3. Insurance
```python
class InsuranceDataSynthesizer:
    """
    Synthetic insurance data for:
    - Pricing models
    - Claims prediction
    - Reserve estimation
    - Catastrophe modeling
    """
    
    def generate_claims(self, n_claims=100000, line_of_business='auto'):
        """
        Generate synthetic claims with:
        - Realistic severity distributions
        - Development patterns
        - Catastrophe events
        - Fraud patterns
        """
        pass
    
    def generate_policy_portfolio(self, n_policies=50000):
        """Generate synthetic policy portfolio"""
        pass
```

---

## 4. Software Testing & Development

### 1. Database Seeding
```python
class DatabaseSeeder:
    """Generate realistic test databases"""
    
    def seed_database(self, schema, n_rows_per_table=10000):
        """
        Generate consistent, referentially integral test data
        """
        # 1. Generate dimension tables (customers, products, stores)
        # 2. Generate fact tables with referential integrity
        # 2. Apply business rules
        # 4. Apply data quality rules
        pass
    
    def seed_staging(self, n_records=100000):
        """Seed staging environment"""
        pass
    
    def seed_production_like(self, scale_factor=0.1):
        """Create production-like staging data"""
        pass

# CI/CD Integration
# .github/workflows/test.yml
# - name: Generate test data
#   run: python scripts/generate_test_data.py --size 10000
# - name: Run tests
#   run: pytest tests/ --data-file test_data.parquet
```

### 2. API Mocking / Service Virtualization
```python
class APIMockServer:
    """Generate synthetic API responses for testing"""
    
    def __init__(self, openapi_spec):
        self.spec = load_openapi_spec(openapi_spec)
    
    def generate_mock_responses(self, endpoint, n_examples=100):
        """Generate realistic mock responses from OpenAPI spec"""
        pass
    
    def start_mock_server(self, port=8080):
        """Run mock API server with synthetic data"""
        pass

# Usage in tests
def test_api_with_synthetic_data():
    mock_server = APIMockServer(openapi_spec)
    mock_server.start()
    
    # Test with realistic but synthetic data
    response = client.get('/api/v1/users/123')
    assert response.status_code == 200
```

---

## 6. Research & Development

### 1. Algorithm Development
```python
# Algorithm development with synthetic benchmarks
class AlgorithmBenchmark:
    """
    Generate benchmark datasets for algorithm comparison
    """
    def generate_benchmark_suite(self, problem_type, n_datasets=100):
        """
        Generate diverse benchmark datasets for:
        - Classification (balanced, imbalanced, multi-class)
        - Regression (linear, nonlinear, heteroscedastic)
        - Clustering (varying cluster shapes, densities)
        - Anomaly detection (point, contextual, collective)
        - Time series forecasting
        - Ranking/recommendation
        """
        pass

# Benchmark suite generation
def generate_benchmark_suite():
    return {
        'classification': generate_classification_benchmarks(20),
        'regression': generate_regression_benchmarks(20),
        'clustering': generate_clustering_benchmarks(20),
        'anomaly': generate_anomaly_benchmarks(20),
        'timeseries': generate_ts_benchmarks(20)
    }
```

### 2. Hyperparameter Optimization with Synthetic Data
```python
# Use synthetic data for HPO when real data is limited
def hyperparameter_optimization_with_synthetic(real_data, search_space):
    """
    When real data is scarce, augment with synthetic for HPO
    """
    # 1. Train synthetic generator on available real data
    generator = train_generator(real_data)
    
    # 2. Generate large synthetic dataset
    large_synth = generator.sample(100000)
    
    # 3. Run HPO on large synthetic dataset
    best_params = optimize_hyperparameters(synth_data)
    
    # 4. Validate on real data
    final_model = train_with_best_params(real_data)
    return final_model
```

---

## 4. Public Sector / Government

### 1. Census / Statistical Agencies
```python
class StatisticalAgencySynthesizer:
    """
    Synthetic data for national statistical offices
    - Public use microdata files (PUMF)
    - Synthetic census data
    - Survey data synthesis
    - Small area estimation
    """
    
    def generate_pums(self, census_data, geography_level='PUMA'):
        """Generate Public Use Microdata Sample"""
        pass
    
    def generate_synthetic_census(self, census_data, geography='tract'):
        """Generate synthetic census microdata"""
        pass
    
    def small_area_estimation(self, survey_data, admin_data):
        """Small area estimation with synthetic data"""
        pass
```

### 2. Open Data / Open Government
```python
class OpenDataSynthesizer:
    """
    Generate synthetic versions of sensitive datasets for open data portals
    """
    def publish_synthetic_dataset(self, sensitive_df, metadata):
        """
        Publish synthetic version of sensitive dataset
        with formal privacy guarantees
        """
        pass
```

---

## 5. Research & Education

### 1. Teaching & Training
```python
# Educational synthetic datasets
EDUCATIONAL_DATASETS = {
    'intro_stats': 'Simple datasets for teaching stats',
    'ml_course': 'Datasets for ML courses (classification, regression, clustering)',
    'causal_inference': 'Datasets with known causal structure',
    'time_series_course': 'Time series with known properties',
    'survival_analysis': 'Clinical trial data with known ground truth'
}

def generate_teaching_dataset(topic, n_samples=1000):
    """Generate pedagogical datasets with known properties"""
    pass
```

### 2. Reproducible Research
```python
# Reproducible benchmarks
def generate_reproducible_benchmark(task, seed=42):
    """
    Generate benchmark dataset with fixed seed for reproducibility
    """
    np.random.seed(seed)
    # Generate dataset with known properties
    return dataset

# Reproducible ML benchmarks
BENCHMARKS = {
    'classification': ['breast_cancer', 'diabetes', 'wine', 'digits'],
    'regression': ['boston', 'diabetes', 'california_housing'],
    'clustering': ['blobs', 'circles', 'moons', 'aniso'],
}
```

---

## 13. Emerging Applications

### 1. Synthetic Data for LLMs
```python
# Synthetic data for LLM training/fine-tuning
class LLMSyntheticData:
    """Generate synthetic data for LLM training/fine-tuning"""
    
    def generate_instruction_data(self, n=10000):
        """Generate instruction-following data"""
        pass
    
    def generate_preference_data(self, n=10000):
        """Generate preference pairs for RLHF"""
        pass
    
    def generate_rlhf_data(self, n=10000):
        """Generate comparison data for reward modeling"""
        pass
    
    def generate_rag_data(self, n=1000):
        """Generate QA pairs for RAG"""
        pass
    
    def generate_code_data(self, n=10000):
        """Generate code + docstring pairs"""
        pass

# Synthetic instruction tuning data
def generate_instruction_data(n=50000):
    """Generate instruction-following data for fine-tuning"""
    templates = load_templates('instruction_templates.yaml')
    for template in templates:
        # Fill templates with synthetic entities
        pass
```

### 2. RAG (Retrieval-Augmented Generation)
```python
# Synthetic documents for RAG evaluation
def generate_rag_corpus(n_docs=10000, n_questions=1000):
    """
    Generate synthetic corpus + QA pairs for RAG evaluation
    """
    pass

# Generate synthetic corpus with known answers
def generate_rag_eval_set(n_docs=1000, n_questions=100):
    """
    Generate corpus + questions with known answers for RAG eval
    """
    pass
```

---

## 10. Emerging Applications

### 1. Digital Twins
```python
# Digital Twin Data Generation
class DigitalTwinSynthesizer:
    """
    Generate synthetic sensor data for digital twins
    """
    def simulate_asset(self, asset_config, duration_hours=24):
        """
        Generate synthetic sensor streams for:
        - Predictive maintenance
        - Process optimization
        - What-if scenarios
        - Operator training
        """
        pass
    
    def simulate_failure_modes(self, failure_modes, n_scenarios=100):
        """Generate synthetic failure scenarios"""
        pass
```

### 2. Synthetic Data for Digital Twins
```python
class DigitalTwinSynthesizer:
    def generate_sensor_streams(self, asset_config, scenarios):
        """
        Generate synthetic sensor streams for:
        - Predictive maintenance training
        - Anomaly detection training
        - Process optimization
        - Operator training simulators
        """
        pass
```

### 2. Smart Cities / IoT
```python
# Smart city synthetic data
def generate_smart_city_data(city_config, duration_days=30):
    """
    Generate synthetic:
    - Traffic flows
    - Environmental sensors
    - Energy consumption
    - Waste management
    - Public transport
    - Emergency incidents
    """
    pass
```

---

## 🔗 Cross-References

| Topic | Related Notes |
|-------|---------------|
| **Time Series** | `05_Time_Series.md` |
| **Text/NLP** | `06_Text_NLP.md` |
| **Images/Video** | `07_Images_Video.md` |
| **Geospatial/Graph** | `08_Geo_Graph.md` |
| **Privacy** | `09_Privacy.md` |
| **Evaluation** | `08_Evaluation.md` |
| **Tools** | `11_Tools_Platforms.md` |
| **Best Practices** | `12_Best_Practices.md` |
| **Advanced Topics** | `12_Advanced_Topics.md` |

---

*Last updated: 2024-11-05*
*Part of: Synthetic Data Knowledge Base*