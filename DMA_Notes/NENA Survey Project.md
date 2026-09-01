---
type: project-status
project: NENA Survey Project
phase: Development
owner: Tony Dunsworth
last_updated: 2026-09-01
tags:
  - project
  - status
  - nena
  - survey
  - "911"
  - react
  - duckdb
  - motherduck
  - 9-1-1
---

# NENA Survey Project

## Current Phase

Development — v0.1.0. Core survey application is functional with transactional capture (local DuckDB), analytics ELT (DuckDB → MotherDuck), resume/token workflow, answer validation, and analytics dashboard. The backend has been migrated from sql.js (in-memory SQLite) to local DuckDB for faster writes, offline capability, and native analytics support. Working toward production deployment and pilot PSAP testing.

## Status

- [x] On Track
- [ ] At Risk
- [ ] Blocked

## Objectives

Build a web-based survey platform for NENA to collect standardized data from PSAPs (Public Safety Answering Points) across the United States. The survey captures PSAP classification, staffing, call volume, technology, training, and operational metrics to support NENA's research and advocacy for the 9-1-1 community.

**Core Goals:**
1. Deploy a 97-question survey covering PSAP classification, staffing, call center data, radio, technology, training, and additional duties
2. Provide a save/resume workflow so respondents can complete the survey across multiple sessions
3. Capture transactional survey responses with server-side validation and sanitization
4. Perform analytics ELT into DuckDB for OLAP-style analysis and dashboards
5. Mirror completed data to MotherDuck for cloud analytics and shared access
6. Export results to CSV and other formats for downstream analysis
7. Support pilot PSAP testing and iterative survey refinement based on working-group feedback

## Milestones

| Milestone | Due Date | Status |
|-----------|----------|--------|
| Core survey UI with 97 questions (React/Vite) | 2025 | ✅ Complete |
| Transactional capture store (sql.js SQLite) | 2025 | ✅ Complete |
| Auto-save with retry and offline queue | 2025 | ✅ Complete |
| Resume token issue/consume API | 2025 | ✅ Complete |
| Resume entry UX (code/paste from landing page) | 2025 | ✅ Complete |
| Server-side answer validation and sanitization | 2025 | ✅ Complete |
| API security hardening (CORS, rate limiting, helmet) | 2025 | ✅ Complete |
| DuckDB analytics ELT pipeline | 2025 | ✅ Complete |
| Analytics dashboard (KPIs, trends, completion rates) | 2025 | ✅ Complete |
| Automated test suite (Vitest + Testing Library + Supertest) | 2025 | ✅ Complete |
| Data retention policy (token expiry, purge, archival) | 2025 | ✅ Complete |
| MotherDuck integration for cloud analytics | 2025 | ✅ Complete |
| Static hosting build (no Node required) | 2025 | ✅ Complete |
| Deployment runbook and production checklist | 2025 | ✅ Complete |
| Pilot PSAP identification and outreach | TBD | ☐ Not Started |
| Working-group review of survey introduction and closing text | TBD | ☐ Not Started |
| PostgreSQL database for persistent results storage | 2026-09-01 | ✅ Complete |
| MotherDuck data dump pipeline | 2026-09-01 | ✅ Complete |
| Production health/readiness endpoint(s) | TBD | ☐ Not Started |
| Detailed answer-level export pipeline | TBD | ☐ Not Started |

## Blockers

<!-- What's preventing progress? -->

- [ ] Production deployment not yet validated with real PSAP respondents
- [ ] Survey introduction text needs estimated completion time and question count (per working-group feedback)
- [ ] Several questions flagged for rewording/clarity (see `todo_suggestions.txt` — Q7, Q25, Q35, Q38, Q40-43, Q66, Q68, Q78, Q82, Q96)
- [ ] Distribution strategy not yet finalized (state coordinators, NENA EPRC, The Call publication)
- [x] ~~PostgreSQL database for persistent results storage~~ — Resolved: Migrated to local DuckDB (faster, offline-capable, native analytics)

## Next Steps

1. **Deploy static build to web host** — Build with `npm run build:static`, upload `static/` folder contents to web host via FTP/SFTP
2. **Pilot PSAP outreach** — Identify and contact pilot PSAPs for testing and feedback
3. **Working-group review** — Circulate survey introduction, closing text, and reworded questions for approval
4. **Add production health/readiness endpoint(s)** — Deployment monitoring and startup checks
5. **Improve export pipeline** — Include detailed answer-level exports (not only submission headers)
6. **Environment-driven configuration documentation** — Document `PORT`, `API_BASE`, `VITE_API_URL`, CORS origin list
7. **Add responder guidance** — Plain-language instructions for save/return process
8. **Single canonical resume method** — Choose one user-facing method (code or link) and remove ambiguity

## Resources

- [[survey_site_dev/README.md]] — Runtime architecture, ELT workflow, env vars, API endpoints
- [[survey_site_dev/README_DATABASE.md]] — Two-store pattern (local DuckDB + MotherDuck), retention lifecycle
- [[survey_site_dev/TODO.md]] — Full task list with priorities and save-feature workflow
- [[survey_site_dev/TESTING.md]] — Vitest setup, test workflows, coverage, PR checklists
- [[survey_site_dev/deploy.txt]] — Production deployment guide and runbook
- [[survey_site_dev/DEPLOYMENT.md]] — Detailed deployment instructions (static + full stack modes)
- [[survey_site_dev/NENA Survey.md]] — Full survey instrument (97 questions across 12 sections)
- [[survey_site_dev/todo_suggestions.txt]] — Working-group feedback and suggested rewordings
- [[survey_site_dev/package.json]] — Dependencies (React, Express, DuckDB, RxJS)
- [[survey_site_dev/server/]] — Backend (Express + TypeScript): API routes, validation, analytics, retention
- [[survey_site_dev/server/duckdb.ts]] — Local DuckDB adapter for transactional storage
- [[survey_site_dev/server/pg.ts]] — PostgreSQL adapter (available as alternative)
- [[survey_site_dev/server/analytics.ts]] — DuckDB/MotherDuck ELT pipeline
- [[survey_site_dev/src/]] — Frontend (React + Vite): survey UI, components, services, hooks
- [[survey_site_dev/RXJS_INTEGRATION.md]] — RxJS integration notes
- [[survey_site_dev/TYPESCRIPT_MIGRATION.md]] — TypeScript migration notes
- License: MIT

## Log

### 2026-09-01
- **Database Migration: sql.js → Local DuckDB**
  - Created `server/duckdb.ts` — Local DuckDB adapter (`initDb`, `getConn`, `run`, `query`, `queryOne`)
  - Updated `server/database.ts` — Full rewrite for DuckDB: `?` placeholders, native `BOOLEAN`/`TIMESTAMP`/`JSON`, `run()`/`query()` API
  - Updated `server/server.ts` — Import `duckdb.ts`, default `DB_ENGINE=duckdb`
  - Updated `server/database.retention.test.ts` — Mock surface updated for DuckDB adapter
  - All 30 tests passing

- **PostgreSQL Adapter (available as alternative)**
  - Created `server/pg.ts` — PostgreSQL adapter with connection pool
  - Created `docker-compose.yml` + `docker/postgres/init.sql` — Local PostgreSQL container
  - Can switch via `DB_ENGINE=pg` environment variable

- **Configuration & Documentation**
  - Created `.env.example` — Documented all environment variables
  - Created `DEPLOYMENT.md` — Comprehensive deployment guide (static + full stack modes)
  - Updated `deploy.txt` — Added static mode commands, updated database references

- **Architecture Change**
  - Old: sql.js (in-memory SQLite) → DuckDB → MotherDuck
  - New: Local DuckDB (fast writes, offline) → DuckDB → MotherDuck (cloud analytics)
  - Benefits: Faster writes, offline-capable, native analytics support, no persistence() calls

### 2025
- Core survey application completed (97 questions, 12 sections)
- Transactional capture with sql.js SQLite
- Auto-save with debounce, retry, and offline queue
- Resume token issue/consume API with one-time semantics
- Resume entry UX (code paste from landing page)
- Server-side answer validation per question ID (`answerValidator.ts`)
- API security hardening (helmet, CORS, rate limiting, payload limits)
- DuckDB analytics ELT pipeline with self-updating dataframes
- Analytics dashboard (KPIs, 30-day trends, completion rates, answer type mix)
- Data retention policy (7-day token expiry, 7-day incomplete purge, 12-month archival)
- MotherDuck integration with local fallback
- Static hosting build (no Node required)
- Automated test suite covering routes, validation, analytics, retention, frontend
- Deployment runbook and production checklist
