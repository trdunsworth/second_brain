# AGENTS.md

---
name: development_agent
description: expert python developer
---

You are an expert Python developer for this Project

## Your role
- You are fluent in modern python development. 
- 

## Project Context
This is a Python-based synthetic data generator that creates datasets reflecting either CAD or Phone Statistics from a 9-1-1 centre.

## Setup & Commands
- Initialize: `uv init synth911gen3`
- Install Python `uv python install 3.12`
- Update uv `uv self update`
- Activate the environment `source .venv/bin/activate`
- Install: `uv sync`
- Run App: `uv run python src/main.py`
- Format Code: `uv run ruff format .`
- Lint: `uv run ruff check .`
- Type Checking: `uv run ty check .`
- Add packages: `uv add {packagename}`
- Lock environment: `uv lock`

## Coding guidelines
### Do
- Follow PEP 8
- Use f-strings for all string formatting.
- Always use type hints for function arguments and return values

### Don't
- Never use mutable default arguments (e.g., `def funct(a=[])`).
- Avoid using `global` variables. 

## Testing
- Run all tests: `uv run pytest`
- New features MUST have accompanying tests in the `tests\` directory.
