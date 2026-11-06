# Faker Deep Dive

Complete reference for the Faker library - the go-to library for generating fake data in Python.

---

## 1. Installation & Setup

```bash
pip install faker
# With extra providers
pip install faker[all]
```

---

## 1. Basic Usage

```python
from faker import Faker

fake = Faker()
# or with locale
fake = Faker('en_US')
fake = Faker(['en_US', 'ja_JP', 'de_DE'])  # Multiple locales

# Basic usage
fake.name()           # 'John Doe'
fake.email()          # 'john.doe@example.com'
fake.address()        # '123 Main St, City, State 12345'
fake.phone_number()   # '555-123-4567'
fake.company()        # 'Acme Corp'
fake.job()            # 'Software Engineer'
fake.company_email()  # 'john.doe@company.com'
fake.url()            # 'https://example.com'
fake.ipv4()           # '192.168.1.1'
fake.ipv6()
fake.mac_address()
fake.user_agent()
fake.uuid4()
fake.uuid3()
```

---

## 2. Core Providers Reference

### 2.1 Person & Identity
```python
fake.name()                    # 'John Doe'
fake.name_male()              # 'John Doe'
fake.name_female()            # 'Jane Smith'
fake.prefix()                 # 'Dr.', 'Mr.', 'Ms.'
fake.suffix()                 # 'Jr.', 'PhD', 'MD'
fake.first_name()
fake.last_name()
fake.name_nonbinary()
fake.prefix_nonbinary()
fake.ssn()                    # '123-45-6789' (US)
fake.itin()                   # Individual Taxpayer Identification Number
fake.ein()                    # Employer Identification Number
```

### 2.2 Address & Location
```python
fake.address()                    # '123 Main St\nCity, ST 12345'
fake.street_address()             # '123 Main St'
fake.street_name()                # 'Main St'
fake.street_suffix()              # 'St', 'Ave', 'Blvd'
fake.city()                       # 'Springfield'
fake.city_suffix()                # 'ville', 'town', 'city'
fake.state()                      # 'California'
fake.state_abbr()                 # 'CA'
fake.postcode()                   # '12345'
fake.zipcode()                    # '12345'
fake.zipcode_plus4()              # '12345-6789'
fake.country()                    # 'United States'
fake.country_code(representation='alpha-2')  # 'US'
fake.latitude()                   # -122.4194
fake.longitude()                  # -122.4194
fake.coordinate(center=..., radius=1000)  # Near a point
```

### 2.3 Contact & Communication
```python
fake.email()                      # 'john.doe@example.com'
fake.company_email()              # 'john.doe@company.com'
fake.free_email()                 # 'john@gmail.com'
fake.safe_email()                 # 'john.doe@example.com' (safe domains)
fake.phone_number()               # '555-123-4567'
fake.phone_number()               # '555-123-4567'
fake.cellphone_number()
fake.msisdn()                     # Mobile Station International Subscriber Directory Number
fake.imei()                       # International Mobile Equipment Identity
```

### 2.4 Internet & Web
```python
fake.url()                        # 'https://example.com'
fake.domain_name()                # 'example.com'
fake.domain_word()                # 'example'
fake.tld()                        # 'com', 'org', 'net'
fake.url(schemes=['http', 'https'])
fake.image_url(width=640, height=480)
fake.ipv4()                       # '192.168.1.1'
fake.ipv6()                       # '2001:db8::1'
fake.mac_address()                # '00:1a:2b:3c:4d:5e'
fake.mac_address()                # '00:1a:2b:3c:4d:5e'
fake.user_agent()                 # 'Mozilla/5.0...'
fake.chrome()                     # Chrome user agent
fake.firefox()
fake.safari()
fake.operating_system()
fake.mac_processor()
```

### 2.4 Financial & Business
```python
fake.currency_code()              # 'USD'
fake.currency_symbol()            # '$'
fake.currency()                   # ('USD', 'Dollar')
fake.credit_card_number()         # '4532 1234 5678 9012'
fake.credit_card_provider()       # 'Visa'
fake.credit_card_expire()         # '12/25'
fake.credit_card_security_code()  # '123'
fake.iban()                       # 'GB29NWBK60161331926819'
fake.swift()                      # 'BOFAUS3N'
fake.bank_country()               # 'US'
fake.bank_account()               # '1234567890'
fake.bban()                       # Basic Bank Account Number
fake.credit_card_number(card_type='visa')
fake.credit_card_expire()         # '12/25'
fake.credit_card_security_code()  # '123'
```

### 2.5 Company & Job
```python
fake.company()                    # 'Acme Corp'
fake.company_suffix()             # 'Inc', 'LLC', 'Corp'
fake.catch_phrase()               # 'Synergistic bandwidth-monitored parallelism'
fake.bs()                         # 'iterate integrated e-markets'
fake.job()                        # 'Software Engineer'
fake.job_descriptor()             # 'Senior'
fake.job_level()                  # 'Senior'
```

### 2.6 Date & Time
```python
fake.date()                       # '2023-06-15'
fake.date_this_year()             # datetime.date(2024, 6, 15)
fake.date_this_month()            # datetime.date(2024, 11, 5)
fake.date_this_year()
fake.date_this_decade()
fake.date_this_century()
fake.date_between(start_date='-1y', end_date='today')
fake.date_between(start_date='-1y', end_date='today')
fake.date_time_this_year()
fake.date_time_this_month()
fake.date_time_this_year()
fake.time()                       # '14:30:00'
fake.time_delta()                 # datetime.timedelta(seconds=3600)
fake.time_object()                # datetime.time(14, 30, 0)
fake.time_delta()                 # datetime.timedelta(days=365)
fake.unix_time()                  # 1700000000
fake.time_series()                # Generator of timestamps
```

### 2.6 File & System
```python
fake.file_name()                  # 'test.txt'
fake.file_extension()             # 'txt'
fake.file_path()                  # '/home/user/document.txt'
fake.mime_type()                  # 'text/plain'
fake.unix_device()                # '/dev/sda1'
fake.unix_partition()             # '/dev/sda1'
```

### 2.7 Automotive & Transportation
```python
fake.license_plate()              # 'ABC1234'
fake.vin()                        # '1HGBH41JXMN109186'
fake.vin()                        # Vehicle Identification Number
```

---

## 2. Localization (Locales)

```python
# Create with locale
fake = Faker('en_US')      # US English (default)
fake = Faker('en_GB')      # British English
fake = Faker('de_DE')      # German
fake = Faker('fr_FR')      # French
fake = Faker('ja_JP')      # Japanese
fake = Faker('zh_CN')      # Chinese (Simplified)
fake = Faker('zh_TW')      # Chinese (Traditional)
fake = Faker('ko_KR')      # Korean
fake = Faker('es_ES')      # Spanish (Spain)
fake = Faker('es_MX')      # Spanish (Mexico)
fake = Faker('pt_BR')      # Portuguese (Brazil)
fake = Faker('ru_RU')      # Russian
fake = Faker('ar_SA')      # Arabic (Saudi Arabia)

# Multiple locales
fake = Faker(['en_US', 'de_DE', 'ja_JP'])

# Get available locales
from faker.config import AVAILABLE_LOCALES
print(faker.config.AVAILABLE_LOCALES)
```

### Locale-Specific Providers
```python
# US-specific
fake = Faker('en_US')
fake.ssn()              # '123-45-6789'
fake.ein()              # '12-3456789'
fake.itin()             # Individual Taxpayer Identification Number

# UK
fake = Faker('en_GB')
fake.nino()             # National Insurance Number
fake.postcode()         # 'SW1A 1AA'

# Germany
fake = Faker('de_DE')
fake.german_id_card()   # 'X1234567A'

# Japan
fake = Faker('ja_JP')
fake.japanese_id_number()  # My Number
```

---

## 2. Custom Providers

```python
from faker.providers import BaseProvider
from faker import Faker

class MedicalProvider(BaseProvider):
    """Custom provider for medical data."""
    
    def diagnosis_code(self):
        """ICD-10 diagnosis code."""
        codes = ['I10', 'E11.9', 'J44.1', 'Z23', 'J18.9', 'I25.10', 'F32.9']
        return self.random_element(codes)
    
    def medication(self):
        """Common medication name."""
        meds = ['Metformin', 'Lisinopril', 'Atorvastatin', 'Levothyroxine', 
                'Metoprolol', 'Omeprazole', 'Amlodipine', 'Gabapentin']
        return self.random_element()

    def dosage(self):
        """Medication dosage."""
        return f"{self.random_int(1, 500)} {self.random_element(['mg', 'ml', 'units'])}"

# Register
fake = Faker()
fake.add_provider(MedicalProvider)

# Use
fake.diagnosis_code()    # 'E11.9'
fake.medication()        # 'Metformin'
fake.dosage()            # '500 mg'
```

### Creating Reusable Provider Package
```python
# my_custom_provider/__init__.py
from faker.providers import BaseProvider

class CustomProvider(BaseProvider):
    def __init__(self, generator):
        super().__init__(generator)
    
    def my_custom_field(self):
        return self.random_element(['A', 'B', 'C'])

# Register
def add_provider(faker):
    faker.add_provider(MyProvider)

# In your code
fake = Faker()
fake.add_provider(MyCustomProvider)
fake.my_custom_field()
```

---

## 3. Advanced Patterns

### 1. Structured Data Generation
```python
def generate_user_profile(fake: Faker) -> dict:
    """Generate a complete user profile."""
    return {
        'id': fake.uuid4(),
        'username': fake.user_name(),
        'email': fake.email(),
        'name': fake.name(),
        'address': {
            'street': fake.street_address(),
            'city': fake.city(),
            'state': fake.state_abbr(),
            'zip': fake.zipcode()
        },
        'phone': fake.phone_number(),
        'email': fake.email(),
        'dob': fake.date_of_birth(minimum_age=18, maximum_age=90),
        'ssn': fake.ssn(),
        'driver_license': fake.license_plate(),
        'created_at': fake.date_time_between('-5y', 'now'),
        'is_active': fake.boolean(chance_of_getting_true=0.9)
    }

# Generate batch
users = [generate_user_profile(fake) for _ in range(1000)]
df = pd.DataFrame(users)
```

### 2. Relational Data Generation
```python
def generate_relational_data(fake: Faker, n_users=1000, n_orders=5000):
    # Users
    users = [{
        'user_id': i,
        'name': fake.name(),
        'email': fake.email(),
        'created_at': fake.date_time_between('-2y', 'now')
    } for i in range(n_users)]
    
    # Orders
    orders = []
    for _ in range(n_orders):
        user = random.choice(users)
        orders.append({
            'order_id': fake.uuid4(),
            'user_id': user['user_id'],
            'total': round(random.uniform(10, 500), 2),
            'status': random.choice(['pending', 'shipped', 'delivered', 'cancelled']),
            'created_at': fake.date_time_between('-1y', 'now')
        })
    
    # Order items
    items = []
    for order in orders:
        for _ in range(random.randint(1, 5)):
            items.append({
                'order_id': order['order_id'],
                'product_id': fake.uuid4(),
                'quantity': random.randint(1, 5),
                'price': round(random.uniform(5, 500), 2)
            })
    
    return pd.DataFrame(users), pd.DataFrame(orders), pd.DataFrame(items)
```

### 3. Realistic Financial Data
```python
def generate_transactions(fake: Faker, n=10000):
    """Generate realistic transaction data."""
    merchants = ['Amazon', 'Walmart', 'Target', 'Starbucks', 'Uber', 'Amazon', 
                 'Netflix', 'Spotify', 'Uber', 'Lyft', 'Whole Foods', 'Costco']
    categories = ['groceries', 'dining', 'transport', 'entertainment', 
                  'shopping', 'utilities', 'healthcare', 'travel']
    
    transactions = []
    for _ in range(n):
        txn = {
            'transaction_id': fake.uuid4(),
            'date': fake.date_time_between('-1y', 'now'),
            'amount': round(random.lognormvariate(3, 1), 2),  # Log-normal
            'merchant': fake.random_element(merchants),
            'category': fake.random_element(categories),
            'card_last4': fake.credit_card_number()[-4:],
            'card_type': fake.random_element(['visa', 'mastercard', 'amex', 'discover']),
            'merchant_category': fake.random_element(categories),
            'is_fraud': random.random() < 0.01,  # 1% fraud
            'location': f"{fake.city()}, {fake.state_abbr()}"
        }
        transactions.append(txn)
    return pd.DataFrame(transactions)
```

---

## 3. Seeding & Reproducibility

```python
# Seed for reproducibility
fake = Faker()
Faker.seed(42)  # Global seed

# Or per instance
fake = Faker()
fake.seed_instance(42)

# Deterministic sequence
fake = Faker()
fake.seed_instance(42)
name1 = fake.name()  # Always same with seed 42

fake2 = Faker()
fake2.seed_instance(42)
name2 = fake2.name()  # Same as name1

# For threads/processes
import threading
thread_local = threading.local()

def get_faker():
    if not hasattr(thread_local, 'faker'):
        thread_local.faker = Faker()
        thread_local.faker.seed_instance(42 + threading.current_thread().ident)
    return thread_local.faker
```

---

## 3. Performance & Scale

### Batch Generation
```python
def generate_batch(fake, batch_size=10000):
    """Efficient batch generation."""
    records = []
    for _ in range(batch_size):
        records.append({
            'id': fake.uuid4(),
            'name': fake.name(),
            'email': fake.email(),
            'amount': round(random.lognormvariate(3, 1), 2),
            'date': fake.date_this_year(),
        })
    return pd.DataFrame(records)

# Vectorized with numpy (faster for large N)
def generate_vectorized(n):
    names = [fake.name() for _ in range(n)]
    emails = [fake.email() for _ in range(n)]
    amounts = np.random.lognormal(3, 1, n).round(2)
    return pd.DataFrame({'name': names, 'email': emails, 'amount': amounts})
```

### Parallel Generation
```python
from multiprocessing import Pool

def generate_batch(batch_size, seed):
    fake = Faker()
    fake.seed_instance(seed)
    return [generate_record(fake) for _ in range(batch_size)]

with Pool(4) as p:
    results = p.starmap(generate_batch, [(10000, i*42) for i in range(4)])
    
df = pd.concat([pd.DataFrame(r) for r in results])
```

---

## 7. Integration with pandas/polars

```python
# Pandas integration
def fake_dataframe(fake, n=1000):
    return pd.DataFrame([{
        'id': fake.uuid4(),
        'name': fake.name(),
        'email': fake.email(),
        'age': fake.random_int(18, 90),
        'income': round(np.random.lognormal(10, 0.5), 2),
        'city': fake.city(),
        'active': fake.boolean()
    } for _ in range(n)]

# Polars
import polars as pl

def fake_polars(n=1000):
    return pl.DataFrame({
        'id': [fake.uuid4() for _ in range(n)],
        'name': [fake.name() for _ in range(n)],
        'value': np.random.lognormal(10, 1, n)
    })
```

### Schema Validation
```python
from pydantic import BaseModel, Field, validator
from typing import Optional

class UserRecord(BaseModel):
    id: str = Field(default_factory=lambda: fake.uuid4())
    name: str = Field(..., min_length=1)
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(ge=0, le=120)
    income: float = Field(ge=0)
    active: bool = True
    
    @validator('email')
    def validate_email(cls, v):
        assert '@' in v
        return v

# Generate validated records
records = [UserRecord().model_dump() for _ in range(1000)]
df = pd.DataFrame(records)
```

---

## 6. Testing with Faker

### pytest Fixtures
```python
# conftest.py
import pytest
from faker import Faker

@pytest.fixture(scope='session')
def fake():
    return Faker()

@pytest.fixture
def fake_user(fake):
    return {
        'id': fake.uuid4(),
        'name': fake.name(),
        'email': fake.email()
    }

# Usage in tests
def test_user_creation(fake_user):
    user = create_user(fake_user)
    assert user['email'] == fake_user['email']
```

---

## 7. Testing with Hypothesis

```python
from hypothesis import given, strategies as st
from faker import Faker

@given(st.data())
def test_user_creation(data):
    fake = Faker()
    fake.seed_instance(42)
    user = generate_user(fake)
    assert '@' in user['email']
    assert len(user['name']) > 0
```

---

## 9. Common Gotchas & Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| **Same data every run** | Forgot to seed | `Faker.seed(42)` or `fake.seed_instance(42)` |
| **Locale not found** | Locale not installed | `Faker('en_US')` not `Faker('en-US')` |
| **Duplicate unique values** | Faker doesn't guarantee uniqueness | Use `fake.unique.uuid4()` or track manually |
| **Slow generation** | Large batches | Use `fake.unique` or batch generation |
| **Locale not found** | Locale not installed | Install locale: `apt-get install locales-all` |
| **Unicode errors** | Encoding issues | Use `fake = Faker('en_US')` explicitly |
| **Thread safety** | Faker not thread-safe | Use `fake.seed_instance()` per thread |

---

## Quick Reference Card

```python
# One-liner cheats
fake.name()              # 'John Doe'
fake.email()             # 'user@example.com'
fake.address()           # '123 Main St\nCity, ST 12345'
fake.phone_number()      # '555-123-4567'
fake.company()           # 'Acme Corp'
fake.job()               # 'Software Engineer'
fake.date_between('-1y', 'today')
fake.date_time_between('-1y', 'now')
fake.pyfloat(min=0, max=100)
fake.pyint(min=0, max=100)
fake.pybool()            # True/False
fake.pydecimal(left=5, right=2, positive=True)
fake.uuid4()             # UUID4
fake.uuid3()             # UUID3 (MD5)
fake.ssn()               # '123-45-6789'
fake.credit_card_number() # '4532 1234 5678 9012'
fake.iban()              # 'GB29NWBK60161331926819'
fake.credit_card_number(card_type='visa')
fake.credit_card_provider()  # 'Visa', 'Mastercard'
fake.credit_card_expire()    # '12/25'
fake.credit_card_security_code()  # '123'
fake.iban()              # 'GB29NWBK60161331926819'
fake.swift()             # 'BOFAUS3N'
fake.swift8()            # 'BOFAUS3NXXX'
fake.iban()              # 'GB29NWBK60161331926819'
fake.bban()              # 'NWBK60161331926819'
fake.swift()             # 'BOFAUS3N'
fake.swift8()            # 'BOFAUS3NXXX'
```

---

*Last updated: 2024-11-05*
*Part of: Synthetic Data Knowledge Base*