---
type: learning-note
topic: Quarto parameterized reporting (Word + PDF) for all audiences
date: 2026-09-25
status: active
tags:
  - quarto
  - reporting
  - reproducibility
  - learning-plan
---

# Quarto Notes — Parameterized Reports for Every Audience

> Goal: turn analysis into **auditable weekly reports (Word + PDF), one per audience**, from a single parameterized source.
> This is the last mile of the Reporting Engine: [[Reporting Engine/TODO|TODO.md]] lists *"Quarto weekly PDF report per audience"* under Later, and every language spec (`PYTHON.md` §9, `R.md` §9, `JULIA.md` §9, `SQL.md` §9) names the static Quarto report as the auditable artifact that dashboards orbit around. Nothing in the vault teaches the pipeline itself — this note fills that gap.
> Related: [[julia_notes|julia_notes]] (compute), [[duckdb_notes|duckdb_notes]] (data), [[ggsql_notes|ggsql_notes]] (visuals), [[Templates/pdf_export_wrapper.qmd|pdf_export_wrapper.qmd]] (thin Typst wrapper), [[DMA_theme/README|DMA Theme]] (brand + palettes)

## How to use this note

1. Work top-to-bottom through **§2 Setup** once (Quarto 1.9.38 is already on this machine — verify with `quarto --version`).
2. Then follow **§3 Learning Plan** in order — each phase has an exit checklist.
3. Copy snippets from §5–§7 into a scratch project (`quarto-lab/`) and render them.
4. Track progress in **§10 Tracker**.

> Mindset: one parameterized template × (5 audiences × 4 periods) = 20 reports from one source. Parameters pick the audience and the week; the document picks the narrative, tables, and figures. If a number is challenged, you re-render — never hand-edit output.

---

## 1. Why Quarto for this job

| Strength | What it means for you |
|----------|-----------------------|
| Single source → Word + PDF | One `.qmd` renders to `docx` (editable, for ops mark-up) and PDF via Typst (archival, for execs). No parallel maintenance. |
| Four engines, one syntax | Python (Jupyter), R (knitr), Julia (`julia` engine), SQL-adjacent via exports — matches your whole stack. Mixed-engine projects work. |
| Parameters (`-P`) | `-P audience:ops -P week:2026-08-10` re-renders the same template per audience/period. This is the M/Q/Y scaling mechanism (Goals 5–6). |
| Typst PDFs, no LaTeX required | Quarto bundles the Typst CLI: fast compiles, no TinyTeX dependency unless you need LaTeX-specific features. |
| Tables that survive Word | `great_tables` (Python), `gt`/`gtsummary`/`flextable` (R) render natively in both HTML preview and docx/PDF outputs. |
| Projects + includes | `_quarto.yml` + `{{< include >}}` partials share KPI definitions, methods appendices, and threshold tables across all 20 reports. |
| Honest gaps | Word styling is coarser than PDF (custom Typst components don't transfer); cross-engine parameter plumbing differs per engine (§4.1); first render of a Julia document pays precompilation. |

---

## 2. Setup (do once, ~30 min)

### 2.1 Verify the toolchain

```powershell
quarto --version          # 1.9.38 on this machine
quarto check              # engines found: jupyter? knitr? julia?
```

| Engine | Requires | Check |
|--------|----------|-------|
| Python (Jupyter) | `jupyter` + `pip install great_tables plotnine pandas duckdb` | `quarto check jupyter` |
| R (knitr) | R + `install.packages(c("rmarkdown","knitr","gt","ggplot2"))` | `quarto check knitr` |
| Julia | Julia 1.10+ (engine runs via QuartoNotebookRunner.jl — no IJulia needed) | `quarto check julia` |
| PDF | Typst (bundled with Quarto — nothing to install) | render any `format: typst` doc |

> Recommendation: use `format: typst` for PDFs (zero extra installs, second-scale renders). Reach for LaTeX/TinyTeX only if a journal or AHJ mandates it.

### 2.2 Project pattern (always a project, never lone files)

```yaml
# _quarto.yml — one project, all audiences and periods
project:
  type: default
  output-dir: _out

format:
  docx:
    reference-doc: assets/reference.docx   # branded Word styles (optional, §6.4)
  typst:
    margin: {top: 2cm, bottom: 2cm, left: 2.5cm, right: 2.5cm}
    fontsize: 11pt
```

Render discipline: always from the project root so relative paths (`data/`, `../duckdb-lab/analytics.duckdb`) resolve identically on every machine.

---

## 3. Learning Plan

Total: **~3–4 weeks at 3–4 hrs/week**. Faster than the analysis tracks — your Julia/DuckDB/ggsql work supplies all content; this track is packaging.

### Phase 0 — First document (2–3 hrs)

**Learn:** YAML front matter, code-cell options (`#|`), `echo: false` discipline, HTML preview loop (`quarto preview`), dual `docx` + `typst` render.

- [ ] Render the minimal doc in §5.1 to both outputs.
- [ ] Exit check: explain what `echo: false`, `warning: false`, `fig-cap` each control, and why reports set them project-wide.

### Phase 1 — Audience report anatomy (Weeks 1–2, core focus #1)

**Learn:** the repeating structure every audience report shares — title block → KPI scorecard table → 2–3 figures with reference lines → findings bullets → methods appendix. KPI tables via `great_tables` (Python) / `gt` (R).

- [ ] Build one ops report: compliance KPI table + circadian figure + heatmap + NENA/NFPA appendix.
- [ ] Exit check: a non-technical reader can state the week's verdict from page 1 alone.

See **§5 Report Snippets**.

### Phase 2 — Parameters + batch rendering (Weeks 2–3, core focus #2)

**Learn:** per-engine parameter declaration (Jupyter `parameters` tag vs knitr `params:` vs Julia `params:`), `-P key:value` overrides, `--execute-params params.yml`, and a batch script that renders the audience × period matrix.

- [ ] Parameterize one doc by `audience` + `week_start`; render 2 audiences × 2 weeks = 4 outputs from one source.
- [ ] Exit check: `quarto render weekly.qmd -P audience:shift -P week_start:2026-08-10 --to docx` works from a clean checkout.

See **§6 Advanced Snippets**.

### Phase 3 — Project hardening (Week 3–4, core focus #3)

**Learn:** shared partials (`{{< include >}}`), `reference-doc` branding, `cache`/`freeze` for slow figures, conditional content (`when-format`), reproducibility appendix (seeds, package versions, data hash).

- [ ] Extract methods + thresholds into includes shared by all reports; freeze the slowest figure.
- [ ] Exit check: a full `_out/` rebuild from scratch with no absolute paths and no manual steps.

### Phase 4 — Capstone (ongoing)

1. **Weekly ops pack**: parameterized template rendering exec/ops/shift/QA/analyst variants for one real week, tables via `great_tables`/`gt`, figures from `duckdb-lab` views.
2. **M/Q/Y promotion**: same template with `period: month|quarter|year` + wider date window.
3. **Brand pass**: DMA palette in tables/figures (`Reporting Engine/palettes/`) + `reference-doc` for Word.

---

## 4. Engine / Format / Table Map

### 4.1 Parameters by engine (same idea, three dialects)

| Engine | Declare | Use in code | Render override |
|--------|---------|-------------|-----------------|
| Jupyter (Python) | Cell tagged `parameters` with defaults (`audience = "ops"`) | `audience` directly | `quarto render doc.ipynb -P audience:shift` |
| knitr (R) | YAML `params: {audience: ops, week_start: 2026-08-10}` | `params$audience` | Same `-P` flag |
| Julia | YAML `engine: julia` + `params:` (keys must be valid Julia names — `week_start` ok, `week-start` not) | `audience` directly | Same `-P` flag |

Batch alternative: `quarto render weekly.qmd --execute-params params-ops.yml` for file-driven runs.

### 4.2 Formats

| Format | Use | Notes |
|--------|-----|-------|
| `docx` | Ops/shift mark-up, email circulation | Style via `reference-doc`; keep styling simple — Word ignores Typst components |
| `typst` (PDF) | Exec archive, QA audit record | Bundled CLI, fast; margins/fonts in YAML; PDF/A options (`pdf-standard`) available |
| `html` | Preview + internal sharing | `quarto preview` loop; `code-fold` for analyst variant |

### 4.3 KPI tables

| Engine | Package | Notes |
|--------|---------|-------|
| Python | `great_tables` (`GT`) | Native in Quarto docs; `fmt_number`, conditional coloring, `gtsave` |
| R | `gt`, `gtsummary`, `flextable` | `gt` for scorecards; `flextable` when Word fidelity is paramount |
| Julia | `PrettyTables.jl` | Text/HTML backends; for publication tables prefer exporting to Python/R layer |

---

## 5. Report Snippets

### 5.1 Minimal dual-output document

```markdown
---
title: "Weekly 9-1-1 Operations — {{week}}"
author: "DMA Reporting Engine"
date: last-modified
params:
  audience: ops
  week_start: 2026-08-10
format:
  docx: default
  typst:
    margin: {top: 2cm, bottom: 2cm, left: 2.5cm, right: 2.5cm}
    fontsize: 11pt
execute:
  echo: false
  warning: false
---

## Verdict

{{< include _partials/verdict.qmd >}}

```{python}
#| label: tbl-kpi
#| tbl-cap: "Answering-line compliance vs NENA/APCO thresholds"
import duckdb
con = duckdb.connect("../duckdb-lab/analytics.duckdb")
kpi = con.execute("SELECT * FROM weekly_kpi WHERE week = $week_start").fetchdf()
kpi
```
```

```powershell
quarto preview weekly.qmd            # live HTML while editing
quarto render weekly.qmd --to docx   # Word only
quarto render weekly.qmd --to typst  # PDF only
```

### 5.2 Parameters per engine

````markdown
**Jupyter/Python** — tag the defaults cell `parameters`:
```{python}
#| tags: [parameters]
audience = "ops"
week_start = "2026-08-10"
```
Override: `quarto render weekly.ipynb -P audience:shift -P week_start:2026-08-10`

**knitr/R** — YAML only:
```yaml
params:
  audience: ops
  week_start: 2026-08-10
```
Use as `params$audience` in `{r}` cells. Same `-P` overrides.

**Julia** — YAML + `engine: julia`:
```yaml
engine: julia
params:
  audience: ops
  week_start: "2026-08-10"
```
Use `audience` directly in `{julia}` cells. Same `-P` overrides.
````

### 5.3 Batch render (audience × period matrix)

```powershell
# render-all.ps1 — 5 audiences x 1 week = 5 reports, both formats
$audiences = @("exec","ops","shift","qa","analyst")
foreach ($a in $audiences) {
  quarto render weekly.qmd -P audience:$a -P week_start:2026-08-10 `
    --output-file "$a-2026-08-10.docx" --to docx
  quarto render weekly.qmd -P audience:$a -P week_start:2026-08-10 `
    --output-file "$a-2026-08-10.pdf" --to typst
}
```

### 5.4 KPI scorecard tables

```python
# Python — great_tables (renders in docx + PDF + HTML)
from great_tables import GT
(GT(kpi)
 .fmt_number(columns=["pct_20s", "pct_15s"], decimals=1)
 .fmt_number(columns=["p90_queue"], decimals=0)
 .tab_header(title="Answering & Processing Compliance"))
```

```r
# R — gt (same role)
library(gt)
kpi |>
  gt() |>
  fmt_number(columns = c(pct_20s, pct_15s), decimals = 1) |>
  tab_header(title = "Answering & Processing Compliance")
```

### 5.5 Shared partials (write once, include everywhere)

```markdown
<!-- _partials/thresholds.qmd — NENA/NFPA lines, shared by all 20 reports -->
| Standard | Threshold |
|----------|-----------|
| NENA answering | 90% ≤ 15s, 95% ≤ 20s |
| NFPA 1710 alarm | 64s (90th), 106s (95th) |
```

```markdown
<!-- in weekly.qmd -->
## Methods & thresholds

{{< include _partials/thresholds.qmd >}}
```

---

## 6. Advanced Snippets

### 6.1 Audience-conditional narrative (one template, five voices)

````markdown
```{python}
#| output: asis
lead = {"exec": "Demand was typical; answering held above the NENA line.",
        "ops": "20s compliance averaged 90.4%; Tuesday 14:00–16:00 needs review.",
        "shift": "Night shift median handle time ran 8% above Day.",
        "qa": "UNDEFINED dispositions ticked up to 30.6%; see §4.",
        "analyst": "See appendix for backtests and bootstrap CIs."}[audience]
print(lead)
```
````

### 6.2 Format-conditional content (`when-format`)

```markdown
::: {when-format="html"}
Interactive preview figure (Plotly) — omitted from print outputs.
:::

::: {when-format="typst"}
Print-grade figure with full caption and reference lines.
:::
```

### 6.3 Cache + freeze (slow figures render once)

```yaml
execute:
  cache: true        # re-runs only changed cells
  freeze: auto       # frozen outputs committed; rebuilds skip execution
```

> Rule: freeze forecasts and bootstrap figures; never freeze the verdict paragraph — it must recompute from current data.

### 6.4 Word branding (`reference-doc`)

1. Render once, open the docx, restyle Normal/Heading/Table styles with DMA fonts/colors.
2. Save as `assets/reference.docx`, reference it in `_quarto.yml`.
3. All future renders inherit the styles — no per-report formatting.

### 6.5 Reproducibility appendix (every auditable report ends with this)

````markdown
## Appendix — reproducibility

- Data snapshot hash: `{python} print(hashlib.sha256(open("../duckdb-lab/data/ev.csv","rb").read()).hexdigest()[:12])`
- Week window: `{python} print(week_start)` · Audience: `{python} print(audience)`
- Random seeds: bootstrap 7, backtest deterministic (see [[julia_notes|julia_notes]] §6.5)
- Package lock: `Project.toml` / `Manifest.toml` (Julia), `requirements.txt` (Python)
````

---

## 7. Time-Series Reporting Patterns

```markdown
## 7-day outlook (exec + ops)

- Figure: daily volume line + seasonal-naive band (from [[duckdb_notes|duckdb_notes]] §7.5 `hod_bands` view; overlay exported SARIMA/ETS forecast as second series per [[ggsql_notes|ggsql_notes]] §7).
- Table: forecast vs actual with RMSE/MAPE per horizon (metrics from [[julia_notes|julia_notes]] §7.4).
- Rule: report the backtest error next to every forecast — a forecast without its RMSE is a rumor.

## M/Q/Y promotion (Goals 5–6)

- Same template, wider window: `-P period:month -P week_start:2026-08-01`.
- The SQL layer re-aggregates (`DATE_TRUNC('month', ...)`); the document only changes titles and window text.
- Keep threshold constants in one place (`standards.sql`); reports never hard-code 15s/20s/64s.
```

---

## 8. Quarto Gotchas

| Habit | Quarto reality |
|-------|---------------|
| Pretty Word output | Word honors `reference-doc` styles only — Typst components, custom callout CSS, and fine layout stay in PDF/HTML. Design tables/figures to survive all three. |
| PDF engine choice | `typst` = bundled, fast, no LaTeX. Only install TinyTeX if an AHJ/journal demands LaTeX features. |
| Julia first render | Pays precompilation once per env; `freeze: auto` or pre-warmed environments fix CI pain. |
| Parameter plumbing | Jupyter needs a tagged `parameters` cell; knitr/Julia use YAML `params:` — same `-P` flag, different declaration. Test each engine once. |
| `echo` discipline | Set `execute: {echo: false, warning: false}` project-wide; opt individual cells back in for the analyst variant only. |
| Paths | Render from project root, always. `../duckdb-lab/...` breaks the moment someone renders from inside `reports/`. |
| Papermill injection | Jupyter overrides inject a cell after the `parameters` cell — keep defaults runnable so plain `quarto render` (no `-P`) still works. |
| Frozen staleness | `freeze` skips execution — a frozen verdict can lie about new data. Freeze figures, never conclusions. |
| Cross-refs | Label tables/figures (`#| label: tbl-kpi`, `#| label: fig-circadian`) and reference with `@tbl-kpi` — renumbering is then automatic across all 20 reports. |

---

## 9. Project Layout (recommended)

```
quarto-lab/
  _quarto.yml            # formats (docx + typst), execute defaults, output-dir
  weekly.qmd             # parameterized template (audience x week_start x period)
  _partials/
    verdict.qmd          # audience-conditional lead (per §6.1)
    thresholds.qmd       # NENA/NFPA table (single source of truth)
    methods.qmd          # shared methods appendix
    reproducibility.qmd  # hash / seeds / locks (§6.5)
  assets/
    reference.docx       # branded Word styles (§6.4)
  params/
    ops.yml / exec.yml / shift.yml / qa.yml / analyst.yml   # file-driven runs
  _out/                  # rendered reports (gitignore; rebuild from source)
  render-all.ps1         # audience x period batch script (§5.3)
```

Convention: source (`.qmd`, partials, params) is committed; outputs (`_out/`) are rebuilt, never edited.

---

## 10. Progress Tracker

- [ ] Phase 0: minimal doc renders to both docx and typst-PDF from project root
- [ ] Phase 1: one ops report — KPI table + 2 figures + verdict + methods appendix
- [ ] Phase 1: same source renders a readable Word doc (no broken tables/figures)
- [ ] Phase 2: `audience` + `week_start` parameters drive 4+ outputs from one source
- [ ] Phase 2: batch script renders the full audience set unattended
- [ ] Phase 3: shared partials + reference-doc + frozen slow figures
- [ ] Phase 3: reproducibility appendix on every report (hash + seeds + locks)
- [ ] Capstone: weekly pack or M/Q/Y promotion finished

## 11. Resources (short, high-signal)

- Quarto docs: [Parameters](https://quarto.org/docs/computations/parameters.html) (per-engine dialects + `-P`/`--execute-params`), [Typst basics](https://quarto.org/docs/output-formats/typst.html) (bundled PDF engine), [Parameterized reports in Python](https://quarto.org/docs/blog/posts/2025-07-24-parameterized-reports-python/index.html) (Papermill pattern + batch script).
- Tables: `great_tables` ([PyPI](https://pypi.org/project/great-tables/)) for Python, `gt`/`flextable` for R.
- In-vault: [[Templates/pdf_export_wrapper.qmd|pdf_export_wrapper.qmd]] (minimal Typst front matter), [[Reporting Engine/TODO|TODO.md]] Later section (the deliverables this unlocks), `Reporting Engine/palettes/` (DMA colors for tables/figures).

---

## 12. Open Questions

- [ ] First report: ops weekly (widest use) or exec one-pager (highest visibility)?
- [ ] `reference-doc` branding now, or ship unbranded v0.1 and style after content settles?
- [ ] Primary PDF engine: Typst (fast, bundled) vs TinyTeX (LaTeX compatibility) — decide before `_quarto.yml` freezes.
- [ ] Build `quarto-lab/` scaffold next (mirroring `julia-eda-lab/`, `duckdb-lab/`), or prototype inside Reporting Engine first?

*Created 2026-09-25. Update §10 as phases complete; promote working partials from snippets into `quarto-lab/_partials/`.*
