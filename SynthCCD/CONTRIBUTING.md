# Contributing to SynthCCD

Thanks for contributing. This guide covers the development setup, code style,
testing expectations, and the pull-request process. It is a companion to
[[SynthCCD/AGENTS|AGENTS]] — when the two disagree, `AGENTS.md` wins.

## Development setup

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (the project uses `uv` for everything: env,
  deps, lockfile, and running commands)

Check that `uv` is installed and current before installing anything:

```powershell
uv --version
uv self update   # when available
```

### First-time setup

```powershell
uv init SynthCCD         # new project (skip if cloning)
uv venv
uv sync                  # install dependencies from uv.lock
```

The repo ships a committed `uv.lock`; always use `uv sync` (not `uv install`)
so your environment matches the locked dependency set.

### Local network notes (this machine)

This machine sits behind a TLS-inspecting proxy. Python's bundled CA list and
uv's default rustls roots do not trust the proxy's issuer, so TLS fails with
`invalid peer certificate: UnknownIssuer`. Safe workaround (verification stays
on):

- `uv sync` / `uv add`: prefix with `UV_SYSTEM_CERTS=true`
- Runtime OSM lookups: set `SYNTHCCD_SYSTEM_TRUST=1` (uses the dev-only
  `truststore` package via `synth911gen3.tls.maybe_inject_system_trust()`)

## Project structure

```
src/synth911gen3/  Live package (CLI, TUI, server, generators)
docs/              Read-only v2-era reference scripts and guidance (not part of the package)
output/            Generated datasets (gitignored)
tests/             pytest suite
config/            Example params and realism-config files
scripts/           Developer/CI helpers (e.g. scripts/audit_deps.py)
```

## Code style

- Python: PEP 8, enforced with `ruff`
- Formatting: `ruff format` / `ruff check`
- Type hinting: `ty` (see `pyproject.toml`)

Run per-file checks while developing (allowed without prompting):

```powershell
uv run ruff check src/synth911gen3/your_file.py
uv run ty check src/synth911gen3/your_file.py
uv run ruff format --check src/synth911gen3/your_file.py
```

The full gates before a PR:

```powershell
uv run ruff check .
uv run ty check src
uv run pytest tests/
uv run pytest tests/ --cov=synth911gen3 --cov-fail-under=80
uv run scripts/audit_deps.py
```

## Testing

- Framework: `pytest`, wired into `pyproject.toml` with
  `--cov --cov-report=term-missing` and `fail_under = 80`.
- Coverage requirement: 80%+ for new code; the CI gate runs
  `--cov-fail-under=80`.
- New features require tests. Place them in `tests/` following the existing
  naming (`test_<module>.py`).
- Run a single file:

```powershell
uv run pytest tests/test_your_module.py
```

- Statistical invariants are covered with `hypothesis` in
  `tests/test_properties.py` (distribution shapes, weight sums, temporal
  patterns). The `.hypothesis/` cache directory is gitignored; pass
  `--hypothesis-seed=<n>` to explore fresh examples deterministically.
- Realism drift across versions is covered by the regression suite
  (`tests/test_regression.py`), which compares freshly generated signatures
  against the committed baseline `tests/regression_baseline.json`. If you
  *intentionally* change realism defaults (weights, time profiles, phone
  metrics), refresh the baseline and review the value diff before committing:

  ```bash
  uv run python scripts/update_regression_baseline.py
  ```

  Commit the refreshed baseline together with the realism change. If the
  regression suite fails and you did not intend to change realism, treat it as
  a regression.

## Documentation maintenance

Every change that affects user-facing behavior must keep the guides in sync.
Before finishing any task, update:

- `USERSGUIDE.md` — CLI flags, TUI fields, configuration parameters, params-file
  keys, generated data schema/columns, examples, Python API usage, env vars.
- `REALISMGUIDE.md` — YAML realism configuration sections and validation rules,
  default distributions, and realism feature behavior.
- `TODO.md` — mark completed items done; split or note partially-completed
  items.

A change is not complete until the relevant guides are updated.

## Commit discipline

- Do not commit unless explicitly asked.
- Never commit secrets or credentials.
- Keep diffs small and focused on a single concern.
- When you do commit, run `uv run pytest && uv run ruff check .` first.

## Pull request process

- **Title format:** `[component] Brief description` (e.g. `[cli] Add --country flag`)
- Run all quality gates locally before opening the PR (see above).
- All CI checks must pass: ruff, ty, pytest, coverage ≥ 80%, and the
  dependency audit (`.github/workflows/ci.yml` runs these on every push/PR).
- Tests are required for new features.
- Do not alter files under `docs/` (read-only v2-era reference material) and never delete
  the project.

## Permissions summary

Allowed without prompting:

- Reading files, writing tests, listing directories
- Single-file lint/type-check/format and unit tests on specific files

Require approval:

- `uv add` (package installation outside the base files)
- Git operations (`git commit`, `git push`)
- File deletion
- Running the full build

Not allowed:

- Altering files in `docs/` (read-only v2-era reference material)
- Deleting the project
