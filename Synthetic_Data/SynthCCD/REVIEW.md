# Code Audit: Efficiency, Speed, and Security

**Audited:** 2026-08-17
**Scope:** 10 source files across the hot path, config, export, API, and security layers
**Status:** Issues Found

---

## Summary

This audit covers the full generation pipeline — config loading, incident generation, name generation, address fetching, export, API serving, database export, and TLS handling — focusing on efficiency (CPU/memory), speed, and security defects. The codebase is generally well-structured and vectorized where it counts, but several issues range from security vulnerabilities (path traversal in the API) to hot-path inefficiencies (per-row Python loops in the incident generator) to redundant validation logic.

Findings are ordered by estimated combined impact.

---

## SECURITY

### SEC-01: Path Traversal via `params_file` in API

**File:** `src/synth911gen3/serve.py:36-38, 126-165`
**Issue:** The `params_file` field in `GenerationRequestModel` accepts an arbitrary server-side file path string from the HTTP client with no validation or sanitization. Line 164 does `load_params_file(Path(model.params_file))` directly. An attacker can read any file the process can access (e.g., `/etc/passwd`, `~/.ssh/id_rsa`), because params files support JSON/YAML/TOML — any valid file of those types would be parsed and its contents used as generation parameters. Even if parsing fails, the error message may leak file content.
**Fix:** Either remove `params_file` from the API model entirely (force callers to use the JSON body), or restrict it to a whitelist of allowed paths under a dedicated config directory. At minimum, validate the path is within an allowed directory and reject traversal.

### SEC-02: `output_dir` and `realism_config_path` Accept Arbitrary Server Paths

**File:** `src/synth911gen3/serve.py:48, 64, 140, 162, 188-198`
**Issue:** `output_dir`, `realism_config_path`, and the hardcoded `/tmp` in `get_schema` (line 194) allow the API caller to influence filesystem writes and reads. The `output_dir` field is set directly on the `GenerationRequest` and used for file writes. While `TemporaryDirectory` is used in `generate_data`, the `get_schema` endpoint writes to a fixed `/tmp` but accepts a `config` query parameter (line 181) that becomes a `realism_config_path` — allowing an attacker to make the server read an arbitrary YAML file.
**Fix:** Validate `output_dir` and `realism_config_path` against an allowed base directory. Never pass user-supplied paths directly to file I/O without boundary checks.

### SEC-03: SQL Injection Risk via String Interpolation in `_drop_table` and `_create_index`

**File:** `src/synth911gen3/db_exporter.py:305-314, 369-382`
**Issue:** Table names, schema names, and column names are interpolated into SQL strings via f-strings rather than using parameterized queries. Example at line 305: `text(f'DROP TABLE IF EXISTS "{table_name}"')`. While `table_name` comes from `GenerationRequest` (not raw user input), the quoting is dialect-specific and incomplete — the `"` quoting doesn't protect against identifiers containing `"` characters. A table name like `foo"; DROP TABLE users; --` would break out of the quotes.
**Fix:** Use SQLAlchemy's `identifier_preparer.quote()` to safely escape identifiers, or validate `db_table_incidents`, `db_table_phone`, and `db_schema` against a strict pattern (alphanumeric + underscore only) before they reach the SQL layer.

### SEC-04: `truststore.inject_into_ssl()` Affects Entire Process Globally

**File:** `src/synth911gen3/tls.py:37`
**Issue:** `truststore.inject_into_ssl()` patches the global `ssl` module, replacing the default SSL context for every library in the process (httpx, urllib3, etc.). This is opt-in via env var, which is fine, but there is no guard preventing it from being called multiple times, and no documentation that in a multi-tenant server context, one request cannot trigger it while another is in flight with standard verification.
**Fix:** Add a process-level guard (`if not already_injected: ...`) and document that this must be called once at startup, never per-request.

### SEC-05: Server Binds to `0.0.0.0` Without Authentication

**File:** `src/synth911gen3/serve.py:348`
**Issue:** The `run()` function binds to `0.0.0.0:8000` with no authentication, rate limiting, or CORS restrictions. Any client on the network can trigger expensive generation runs (address fetching from OSM, large memory allocations, database writes).
**Fix:** Add rate limiting middleware, consider binding to `127.0.0.1` by default, and add API key authentication for production use.

### SEC-06: Exception Detail Leakage in API

**File:** `src/synth911gen3/serve.py:281-282, 338-339`
**Issue:** The generic `except Exception` handler returns `f"Internal error: {exc}"` which can expose internal paths, database connection strings, stack details, or other sensitive information to the client.
**Fix:** Log the full exception server-side but return a generic error message to the client. Only surface known, safe error types.

---

## EFFICIENCY / SPEED

### EFF-01: Per-Row Python Loop in Seasonal Problem Nature Generation (HOT PATH)

**File:** `src/synth911gen3/generators/incidents.py:503-513`
**Issue:** Inside the problem nature generation, there is a **per-row Python `for` loop** over `mask_seasons`:
```python
for i, season in enumerate(mask_seasons):
    incident_weights = base_weights.copy()
    for idx, prob_name in enumerate(problem_names):
        multipliers = realism.seasonal_multipliers.get(prob_name, DEFAULT_SEASONAL_MULTIPLIER)
        incident_weights[idx] = base_weights[idx] * multipliers[season]
    incident_weights = incident_weights / incident_weights.sum()
    selected[i] = rng.choice(problem_names, p=incident_weights)
```
This is O(n × P) Python iterations where n = number of incidents in this agency/priority group and P = number of problems. For 1M rows, this can be millions of Python iterations with dict lookups and array copies per row.
**Fix:** Vectorize: pre-build a `(num_problems, 4)` seasonal multiplier matrix, then for each season group, compute all weights at once via broadcasting and use `rng.choice` with a 2D probability array (or batch the draws per-season group).

### EFF-02: Per-Row Python Loop for Problem Phone Multipliers

**File:** `src/synth911gen3/generators/incidents.py:518-524`
**Issue:** Line 520 does a dict lookup per element of `problem_nature`:
```python
problem_phone_multipliers = np.array(
    [realism.problem_phone_multipliers.get(problem, DEFAULT_PROBLEM_PHONE_MULTIPLIER)
     for problem in problem_nature],
    dtype=float,
)
```
This is a Python list comprehension over n elements with a dict lookup per element.
**Fix:** Pre-build a lookup vector indexed by a problem-name-to-integer mapping, then use vectorized indexing: `multiplier_vec[problem_index_array]`.

### EFF-03: Per-Row Python Loop for Zone Travel Multipliers

**File:** `src/synth911gen3/generators/incidents.py:542-545`
**Issue:** Same pattern — Python dict lookup per element:
```python
zone_multipliers = np.array(
    [realism.zone_travel_multipliers.get(zone, 1.0) for zone in address_columns["zone"]],
    dtype=float,
)
```
**Fix:** Build a zone-name-to-index mapping once, convert zones to integer codes, then index a pre-built multiplier array.

### EFF-04: Redundant `copy()` Import Inside Hot Path

**File:** `src/synth911gen3/generators/incidents.py:268`
**Issue:** `from copy import copy` is imported inside `_prepare()`, which is called once per generation run. While Python caches module imports, the pattern of importing inside a function adds overhead and is inconsistent with the top-of-file import style. More importantly, the import at line 257 (`from ..constants import PSAP_AGENCY_FILTERS`) is also inside `_prepare`.
**Fix:** Move both imports to the top of the file. They are module-level constants with no circular dependency risk.

### EFF-05: `RealismConfig` is Reconstructed on Every `validate()` Call

**File:** `src/synth911gen3/config.py:211`
**Issue:** Line 211: `self.get_realism_config()` is called inside `validate()`. This method (lines 157-163) either returns the existing config or creates a new `RealismConfig()` (which triggers `__post_init__` with extensive dict copying) or calls `RealismConfig.from_yaml()` (YAML parsing + validation). This means validation of the `GenerationRequest` triggers a full realism config load as a side effect.
**Fix:** Cache the result of `get_realism_config()` so repeated calls (including from `validate()` and from the generators) don't re-parse/re-build the config.

### EFF-06: `address_fields` Dict Comprehension Creates Per-Field NumPy Arrays from Python List Comprehension

**File:** `src/synth911gen3/generators/incidents.py:471-474`
**Issue:**
```python
address_fields = {
    field: np.asarray([getattr(address, field) for address in addresses], dtype=object)
    for field in _ADDRESS_FIELDS
}
```
This iterates over all addresses (potentially thousands) once per field (12 fields), creating 12 separate Python list comprehensions before converting to numpy. That's 12 × len(addresses) Python iterations.
**Fix:** Convert to a pandas DataFrame or structured numpy array once, then extract columns. Or batch the `getattr` calls into a single pass per address.

### EFF-07: `_records_for_serialization` Copies Entire DataFrame

**File:** `src/synth911gen3/exporters.py:76`
**Issue:** `serializable = frame.copy()` creates a full copy of the DataFrame just to convert datetime columns to strings. For large datasets (millions of rows), this doubles peak memory for the export step.
**Fix:** Use `frame.copy(deep=False)` and only copy the datetime columns when modifying them, or use `frame.assign(**{col: frame[col].dt.strftime(...)})`.

### EFF-08: `_build_geojson_features` Uses `iterrows()` (Very Slow)

**File:** `src/synth911gen3/exporters.py:85-107`
**Issue:** `frame.iterrows()` is notoriously slow — it creates a Series per row with full type inference. For 100K+ rows, this will be extremely slow.
**Fix:** Vectorize with `frame.to_dict(orient="records")` and filter/transform in bulk, or use `frame.apply(..., axis=1)` at minimum.

### EFF-09: Double `_prepare()` Calls in `resolve_chunk_rows` + `generate_chunks`

**File:** `src/synth911gen3/generators/incidents.py:324-334, 369-387`
**Issue:** `resolve_chunk_rows()` calls `_prepare()` (line 333) to build address pools, personnel rosters, and the RNG. Then `generate_chunks()` calls `_prepare()` again (line 383). If the caller first checks chunk size then generates, the entire address-fetching + personnel-building step runs twice. The `_resolve_chunk_rows` probe (lines 352-367) also builds full records just to measure memory.
**Fix:** Expose a method that accepts pre-prepared state, or cache `_prepare()` results on the instance.

### EFF-10: `_zipf_weights` Recomputes on Every Call

**File:** `src/synth911gen3/generators/incidents.py:123-126`
**Issue:** `_zipf_weights(count)` is called by both `_zipf_pick` and `_zipf_choice`, and each call to `_zipf_choice` in the chunk loop (line 593-594) recomputes the weights. For repeated calls with the same `count`, this is wasteful.
**Fix:** Cache weights by count in a module-level dict, or precompute once per shift pool.

---

## CODE QUALITY / CORRECTNESS

### QA-01: Duplicate Enum Definitions Between `config.py` and `schema.py`

**File:** `src/synth911gen3/config.py:47-67` vs `src/synth911gen3/schema.py:30-45`
**Issue:** `OutputFormat`, `DatasetKind`, `IdFormat`, and `DatabaseDialect` are defined in both files with identical values. `config.py` uses `StrEnum` while `schema.py` uses `str, Enum`. The API layer (`serve.py`) imports from `config.py`, but the pydantic models in `schema.py` define their own versions. This creates confusion about which is canonical and risks drift.
**Fix:** Define enums in one place and import them in the other. Since `schema.py` is the pydantic layer, either have it import from `config.py` or move the canonical enums to a shared module.

### QA-02: Duplicate Validation Logic Between `config.py` and `schema.py`

**File:** `src/synth911gen3/config.py:171-221` vs `src/synth911gen3/schema.py:221-272, 345-434`
**Issue:** Both files validate: output stem (reserved names, path separators), output dir (null bytes, `..`), PSAP agency, date ordering, database options, and weight sums. The pydantic validators in `schema.py` are more structured but overlap substantially with the manual validation in `config.py`. This means bugs could be fixed in one place but not the other.
**Fix:** Choose one validation layer (pydantic in `schema.py` is more maintainable) and have `config.py` delegate to it, or remove the duplicated checks.

### QA-03: `_to_ascii()` Uses Per-Character Branching Without Translation Table

**File:** `src/synth911gen3/names.py:55-96`
**Issue:** `_to_ascii()` is called for every generated name (via `_draw()` at line 330). It uses a character-by-character loop with multiple `if` branches for Unicode block detection. For names with many characters, this is slow. The Cyrillic and Arabic tables are dict lookups (fine), but the combining-mark stripping and block detection use ordinal comparisons per character.
**Fix:** Build a pre-computed `str.maketrans()` translation table at module load that maps all known characters to their ASCII equivalents, then use `text.translate(table)` which is C-optimized and much faster. For characters not in the table, use `unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()` as a fast fallback.

### QA-04: `Faker` Instance Created Per `PersonnelNameGenerator` Even When Unused

**File:** `src/synth911gen3/names.py:296-310`
**Issue:** Every `PersonnelNameGenerator.__init__` creates one `Faker` instance per locale (line 301-303) plus a fallback Faker (line 309). Faker initialization involves loading provider modules. For the common US case, this creates ~13 Faker instances (one per blend locale). If the name generator is created multiple times (e.g., in tests or multi-run scenarios), this repeats.
**Fix:** Lazily initialize Faker instances on first use, or use a class-level cache of Faker instances by locale+seed.

### QA-05: `RealismConfig.__post_init__` Deep-Copies All Defaults on Every Construction

**File:** `src/synth911gen3/realism_config.py:82-118`
**Issue:** Every time `RealismConfig()` is constructed (which happens during validation at `config.py:211`), `__post_init__` copies every default dict from `constants.py`. This involves nested dict comprehensions with `.copy()` calls on each level. For configs that will immediately be overridden by YAML, this is wasted work.
**Fix:** Use a lazy initialization pattern: only populate defaults when the field is actually accessed, or use `None` sentinels and resolve at access time.

### QA-06: `_build_reference_numbers` Uses Python Loop Over Agencies

**File:** `src/synth911gen3/generators/incidents.py:225-229`
**Issue:** The agency counter loop iterates in Python:
```python
for agency_index in range(int(agency_codes.max()) + 1):
    mask = agency_codes == agency_index
    count = int(mask.sum())
    counter[mask] = counters[agency_index] + np.arange(1, count + 1)
    counters[agency_index] += count
```
With 3-5 agencies this is fine, but the pattern of creating a boolean mask and summing per agency is O(n × A). For very large n, this could be vectorized with `np.unique` and `np.bincount`.
**Fix:** Use `np.unique(agency_codes, return_counts=True)` and `np.cumsum` for the counter assignment.

### QA-07: `address_columns` Repeatedly Indexes into `address_fields` for Every Field

**File:** `src/synth911gen3/generators/incidents.py:476`
**Issue:** `address_columns = {field: address_fields[field][address_index] for field in _ADDRESS_FIELDS}` — this creates n-element arrays by fancy-indexing into the address arrays. Each field creates a new array. This is 12 separate fancy-index operations on the same `address_index` array.
**Fix:** Use a single structured array or DataFrame for addresses and extract all columns in one pass.

### QA-08: `_active_shift_index` Creates Temporary Float64 Arrays

**File:** `src/synth911gen3/generators/incidents.py:187-202`
**Issue:** `best_score = np.full(n, np.inf)` and `score = np.where(in_group, minutes_since.astype(np.float64), np.inf)` — the `np.inf` sentinel and float64 conversion for scoring adds memory overhead proportional to n. For very large n, this could be avoided.
**Fix:** Use integer scoring with a large sentinel value instead of float inf, or use `np.argmax` with a structured score array.

### QA-09: `httpx.Client` Not Closed After Use

**File:** `src/synth911gen3/addresses.py:257-263`
**Issue:** `OpenStreetMapAddressProvider.__init__` creates an `httpx.Client` if none is provided (line 257-263), but there is no `__del__`, `__enter__/__exit__`, or `close()` method to ensure the client's connection pool is cleaned up. The client holds open TCP connections.
**Fix:** Implement `__enter__`/`__exit__` (context manager protocol) and a `close()` method. Or document that the caller must manage the client lifecycle.

### QA-10: `_write_cache` Is Not Atomic

**File:** `src/synth911gen3/addresses.py:357-376`
**Issue:** If the process crashes or is killed between `frame.to_parquet(path)` completing and the metadata being written, or during the parquet write itself, the cache file could be partially written. The next run would then try to read a corrupted cache. The `_load_cache` method (line 322-355) does catch `Exception` and returns `None` on corruption, so it's safe — but the retry would re-fetch from OSM unnecessarily.
**Fix:** Write to a temporary file then `os.rename()` for atomicity (rename is atomic on POSIX for same-filesystem).

### QA-11: `_mean_duration` Cumsum Pattern May Overflow for Large Call Volumes

**File:** `src/synth911gen3/generators/phone_metrics.py:55-63`
**Issue:** `draw_cum = np.concatenate(([0.0], np.cumsum(draws)))` — for very large `total` values (millions of calls), the cumulative sum of lognormal draws can approach float64 precision limits. While unlikely in practice, the pattern is fragile.
**Fix:** This is low risk but worth noting for documentation. No immediate fix needed unless call volumes exceed 10^15.

### QA-12: `resolve_chunk_rows` Creates Full Records Just to Measure Memory

**File:** `src/synth911gen3/generators/incidents.py:336-367`
**Issue:** `_resolve_chunk_rows` calls `_build_records` with `probe_n` rows, builds a full DataFrame, and measures its memory. This generates real data that is immediately discarded. The probe uses a separate RNG so it doesn't affect determinism, but it still performs the full generation pipeline (including the per-row Python loops from EFF-01).
**Fix:** Use a statistical estimate based on column dtypes and n, or cache the bytes-per-row measurement across calls.

---

## Summary Statistics

| Severity | Count |
|----------|-------|
| SECURITY | 6 |
| EFFICIENCY/SPEED | 10 |
| CODE QUALITY | 12 |
| **Total** | **28** |

---

## Priority Recommendations

1. **Immediate** (security): SEC-01 (path traversal via params_file), SEC-03 (SQL injection in db_exporter), SEC-06 (exception leakage)
2. **High** (speed on hot path): EFF-01 (per-row loop in problem nature), EFF-02/EFF-03 (per-row dict lookups), EFF-09 (double _prepare)
3. **Medium** (efficiency): EFF-07 (DataFrame copy), EFF-08 (iterrows), QA-03 (_to_ascii translation table), QA-05 (RealismConfig deepcopy)
4. **Low** (quality/maintainability): QA-01/QA-02 (duplicate enums/validation), QA-04 (Faker lazy init), QA-09 (httpx client lifecycle)
