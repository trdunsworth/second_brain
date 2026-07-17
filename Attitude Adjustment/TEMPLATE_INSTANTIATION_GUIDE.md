# Template Instantiation Guide — Obsidian + Quarto Blog Workflow

> **Purpose**: Turn templates into daily notes & blog posts with minimal friction
> **Tools**: Obsidian (Templater plugin), Quarto, Git/GitHub, Netlify
> **Audience**: You (primary), close friends (secondary)

---

## 1. Prerequisites

### Required Obsidian Plugins
| Plugin | Purpose | Install Via |
|---|---|---|
| **Templater** | Template engine with JS logic, variables, prompts | Community Plugins → Templater |
| **Calendar** | Daily note creation, date navigation | Core Plugins → Calendar |
| **Dataview** | Query notes, build dashboards | Community Plugins → Dataview |
| **Git** (or **GitHub Copilot**) | Version control from Obsidian | Community Plugins → Obsidian Git |

### External Tools
| Tool | Version | Verify |
|---|---|---|
| **Quarto** | ≥ 1.5 | `quarto --version` |
| **Python** | ≥ 3.11 | `python --version` |
| **uv** (or pip/conda) | Latest | `uv --version` |
| **R** | ≥ 4.3 | `R --version` |
| **Julia** | ≥ 1.10 | `julia --version` |
| **Rust** | ≥ 1.75 | `rustc --version` |
| **Go** | ≥ 1.22 | `go version` |
| **Git** | ≥ 2.40 | `git --version` |

---

## 2. Directory Structure

```
attitude_adjustment/
├── templates/
│   ├── daily_log_template.md          # Daily note (Templater)
│   ├── blog_idea_capture_template.md  # Blog idea capture
│   ├── blog_post_template.qmd         # Quarto blog post
│   └── blog_post_template.md          # Markdown fallback
├── daily/                             # Daily notes (Calendar plugin target)
├── blog/
│   ├── ideas/                         # Captured ideas
│   ├── posts/                         # Quarto .qmd files (published)
│   ├── images/
│   │   └── posts/                     # Hero + figure images
│   ├── chunks/                        # Reusable Quarto chunks
│   ├── _templates/                    # Quarto template partials
│   └── _site/                         # Rendered output (gitignored)
├── src/                               # Reusable code modules
│   └── <slug>/
├── data/
│   ├── synthetic/                     # Synthetic datasets
│   └── raw/                           # Local-only raw data (gitignored)
├── notebooks/                         # Jupyter/Quarto notebooks
├── scripts/                           # One-off scripts
└── .github/workflows/                 # CI/CD (Netlify deploy)
```

**Create missing folders:**
```bash
mkdir -p daily blog/ideas blog/posts blog/images/posts blog/chunks blog/_templates src data/synthetic data/raw notebooks scripts
```

---

## 3. Templater Configuration

### 3.1 Enable Templater
1. Settings → Community Plugins → **Templater** → Enable
2. Settings → Templater → **Template folder location**: `attitude_adjustment/templates`
3. Settings → Templater → **Trigger on file creation**: ✅
4. Settings → Templater → **Folder to create new files**: `attitude_adjustment/daily` (for daily notes)

### 3.2 User Scripts (Templater → User Scripts)
Create `attitude_adjustment/templates/scripts/` and add:

**`templates/scripts/blog_slug.js`**
```javascript
// Generates URL-safe slug from title
module.exports = async function (app, tp) {
  const title = await tp.system.prompt("Blog post title:");
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};
```

**`templates/scripts/next_weekday.js`**
```javascript
// Returns next weekday (Mon-Fri) in YYYY-MM-DD
module.exports = async function (app, tp) {
  const today = moment();
  let next = today.clone().add(1, 'day');
  while (next.day() === 0 || next.day() === 6) {
    next.add(1, 'day');
  }
  return next.format('YYYY-MM-DD');
};
```

### 3.3 Template Hotkeys (Settings → Hotkeys)
| Action | Suggested Key | Template |
|---|---|---|
| **New daily note** | `Ctrl+Shift+N` | `daily_log_template.md` |
| **New blog idea** | `Ctrl+Shift+B` | `blog_idea_capture_template.md` |
| **New blog post** | `Ctrl+Shift+P` | `blog_post_template.qmd` |

---

## 4. Daily Note Instantiation

### 4.1 Automatic (Calendar Plugin)
1. Click today's date in Calendar sidebar → creates `daily/YYYY-MM-DD.md` from `daily_log_template.md`
2. Templater fires, prompts for variables, fills placeholders

### 4.2 Manual (Command Palette)
`Ctrl+P` → **Templater: Create new note from template** → Select `daily_log_template.md` → Save to `daily/`

### 4.3 Variables Templater Will Prompt For
| Variable | Prompt Example | Default Logic |
|---|---|---|
| `LOG_DATE` | "Date (YYYY-MM-DD)" | `tp.date.now("YYYY-MM-DD")` |
| `MORNING_START` | "Morning start" | `"05:30"` |
| `MORNING_END` | "Morning end" | `"08:30"` |
| `ALX_START` | "ALX work start" | `"08:30"` |
| `ALX_END` | "ALX work end" | `"17:00"` |
| `DMA_START` | "DMA work start" | `"17:30"` |
| `DMA_END` | "DMA work end" | `"20:00"` |
| `TM_TIME` | "Toastmasters time" | `"Tue/Thu 19:00-20:30"` |
| `AREA_NUM` | "TM Area #" | `"42"` |
| `MIDDAY_TIME` | "Midday check-in" | `"12:30"` |
| `AFTERNOON_START` | "Afternoon start" | `"13:00"` |
| `EVENING_END` | "Evening end" | `"21:00"` |
| `EVENING_REFLECTION_START` | "Evening reflection start" | `"21:00"` |
| `EVENING_REFLECTION_END` | "Evening reflection end" | `"21:30"` |
| `SLEEP_TARGET` | "Lights out" | `"22:30"` |

### 4.4 Advanced: Auto-Fill from Config
Create `templates/config/daily_vars.json`:
```json
{
  "MORNING_START": "05:30",
  "MORNING_END": "08:30",
  "ALX_START": "08:30",
  "ALX_END": "17:00",
  "DMA_START": "17:30",
  "DMA_END": "20:00",
  "TM_TIME": "Tue/Thu 19:00-20:30",
  "AREA_NUM": "42",
  "MIDDAY_TIME": "12:30",
  "AFTERNOON_START": "13:00",
  "EVENING_END": "21:00",
  "EVENING_REFLECTION_START": "21:00",
  "EVENING_REFLECTION_END": "21:30",
  "SLEEP_TARGET": "22:30"
}
```

Then in `daily_log_template.md`, replace `{{ VAR }}` with `<% tp.file.include("[[config/daily_vars.json]]").VAR %>` — or use a user script to inject all at once.

---

## 5. Blog Idea Capture Instantiation

### 5.1 Command
`Ctrl+P` → **Templater: Create new note from template** → `blog_idea_capture_template.md` → Save to `blog/ideas/`

### 5.2 Variables Prompted
| Variable | Source |
|---|---|
| `CREATED_DATE` | `tp.date.now("YYYY-MM-DD")` |
| `MODIFIED_DATE` | `tp.date.now("YYYY-MM-DD")` |
| `TITLE` | Prompt: "Working title" |
| `HOOK` | Prompt: "One-sentence hook" |
| `PUBLISH_DATE` | Prompt: "Target date (YYYY-MM-DD)" |
| `SLUG` | Auto: `tp.user.blog_slug()` |
| `CORE_IDEA` | Prompt: "Core idea (2-3 sentences)" |

### 5.3 Workflow
1. Capture idea → `blog/ideas/2026-07-17-staffing-duckdb.md`
2. Flesh out over days (research, code sketches)
3. When urgency ≥ 15 → promote to post

---

## 6. Blog Post Instantiation (Quarto)

### 6.1 From Idea to Post
```bash
# Option A: Manual copy
cp templates/blog_post_template.qmd blog/posts/{{ SLUG }}.qmd
mkdir -p blog/images/posts/{{ SLUG }}

# Option B: Templater (create template that runs this)
# See templates/scripts/create_post.js below
```

### 6.2 Templater Script for Post Creation
**`templates/scripts/create_post.js`**
```javascript
const fs = require('fs');
const path = require('path');

module.exports = async function (app, tp) {
  // 1. Pick idea file
  const ideasDir = path.join(app.vault.adapter.basePath, 'blog', 'ideas');
  const files = fs.readdirSync(ideasDir).filter(f => f.endsWith('.md'));
  const choices = files.map(f => f.replace('.md', ''));
  const selected = await tp.system.suggester(choices, choices, false, "Select idea to promote:");
  if (!selected) return;

  // 2. Read idea frontmatter
  const ideaContent = fs.readFileSync(path.join(ideasDir, selected + '.md'), 'utf-8');
  const fmMatch = ideaContent.match(/^---\n([\s\S]*?)\n---/);
  let fm = {};
  if (fmMatch) {
    fmMatch[1].split('\n').forEach(line => {
      const [k, ...v] = line.split(':');
      fm[k.trim()] = v.join(':').trim().replace(/^["']|["']$/g, '');
    });
  }

  // 3. Generate slug
  const slug = fm.slug || selected;

  // 4. Copy template
  const templatePath = path.join(app.vault.adapter.basePath, 'templates', 'blog_post_template.qmd');
  const postPath = path.join(app.vault.adapter.basePath, 'blog', 'posts', `${slug}.qmd`);
  const imgDir = path.join(app.vault.adapter.basePath, 'blog', 'images', 'posts', slug);
  
  fs.mkdirSync(imgDir, { recursive: true });
  let template = fs.readFileSync(templatePath, 'utf-8');

  // 5. Replace variables
  const replacements = {
    '{{ TITLE }}': fm.title || fm.TITLE || slug,
    '{{ SUBTITLE }}': fm.hook || fm.HOOK || '',
    '{{ DESCRIPTION }}': fm.core_idea?.slice(0, 155) || '',
    '{{ PUBLISH_DATE }}': fm.publish_date || fm.PUBLISH_DATE || tp.date.now('YYYY-MM-DD'),
    '{{ MODIFIED_DATE }}': tp.date.now('YYYY-MM-DD'),
    '{{ SLUG }}': slug,
    '{{ TAG1 }}': fm.category || 'staffing',
    '{{ TAG2 }}': fm.language || 'python',
    '{{ IMAGE_ALT }}': `Hero image for ${fm.title || slug}`,
    '{{ PROBLEM_ONE_LINER }}': fm.pain_point || '',
    '{{ METHOD_ONE_LINER }}': fm.method || '',
    '{{ RESULT_ONE_LINER }}': fm.result || '',
    '{{ PAIN_POINT }}': fm.pain_point || '',
    '{{ MENTAL_MODEL }}': fm.mental_model || '',
    '{{ ACADEMIC_REFS }}': fm.academic_refs || '',
    '{{ INDUSTRY_REFS }}': fm.industry_refs || '',
    '{{ PRIOR_POST_1 }}': fm.prior_post_1 || '',
    '{{ PRIOR_POST_2 }}': fm.prior_post_2 || '',
    '{{ GAP_FILLED }}': fm.gap_filled || '',
    '{{ PROBLEM_TYPE }}': fm.problem_type || 'Forecasting',
    '{{ TARGET }}': fm.target || 'hourly call volume per zone',
    '{{ HORIZON }}': fm.horizon || '1 week',
    '{{ ALGORITHM }}': fm.algorithm || 'LightGBM',
    '{{ ALGO_RATIONALE }}': fm.algo_rationale || '',
    '{{ FEATURE_RATIONALE }}': fm.feature_rationale || '',
    '{{ VALIDATION }}': fm.validation || 'Walk-forward',
    '{{ VALID_RATIONALE }}': fm.valid_rationale || '',
    '{{ UNCERTAINTY_METHOD }}': fm.uncertainty || 'Conformal prediction',
    '{{ UNCERT_RATIONALE }}': fm.uncert_rationale || '',
    '{{ BASELINE }}': fm.baseline || 'Seasonal naïve',
    '{{ BASELINE_RATIONALE }}': fm.baseline_rationale || '',
    '{{ PATTERN_1 }}': fm.pattern_1 || '',
    '{{ PATTERN_2 }}': fm.pattern_2 || '',
    '{{ PATTERN_3 }}': fm.pattern_3 || '',
    '{{ MAE_LGBM }}': fm.mae_lgbm || '',
    '{{ RMSE_LGBM }}': fm.rmse_lgbm || '',
    '{{ CRPS_LGBM }}': fm.crps_lgbm || '',
    '{{ IMPROVEMENT }}': fm.improvement || '',
    '{{ MAE_NP }}': fm.mae_np || '',
    '{{ RMSE_NP }}': fm.rmse_np || '',
    '{{ CRPS_NP }}': fm.crps_np || '',
    '{{ IMPROVEMENT_NP }}': fm.improvement_np || '',
    '{{ MAE_SN }}': fm.mae_sn || '',
    '{{ RMSE_SN }}': fm.rmse_sn || '',
    '{{ CRPS_SN }}': fm.crps_sn || '',
    '{{ FINDING_1 }}': fm.finding_1 || '',
    '{{ FINDING_2 }}': fm.finding_2 || '',
    '{{ FINDING_3 }}': fm.finding_3 || '',
    '{{ DIR_ACTION }}': fm.dir_action || '',
    '{{ DIR_TOOL }}': fm.dir_tool || '',
    '{{ ANALYST_ACTION }}': fm.analyst_action || '',
    '{{ ANALYST_TOOL }}': fm.analyst_tool || '',
    '{{ DEV_ACTION }}': fm.dev_action || '',
    '{{ DEV_TOOL }}': fm.dev_tool || '',
    '{{ TRAIN_ACTION }}': fm.train_action || '',
    '{{ TRAIN_TOOL }}': fm.train_tool || '',
    '{{ LIM_1 }}': fm.lim_1 || '',
    '{{ MIT_1 }}': fm.mit_1 || '',
    '{{ FUT_1 }}': fm.fut_1 || '',
    '{{ LIM_2 }}': fm.lim_2 || '',
    '{{ MIT_2 }}': fm.mit_2 || '',
    '{{ FUT_2 }}': fm.fut_2 || '',
    '{{ LIM_3 }}': fm.lim_3 || '',
    '{{ MIT_3 }}': fm.mit_3 || '',
    '{{ FUT_3 }}': fm.fut_3 || '',
    '{{ HONEST_ASSESSMENT }}': fm.honest_assessment || '',
  };

  Object.entries(replacements).forEach(([k, v]) => {
    template = template.replaceAll(k, v);
  });

  fs.writeFileSync(postPath, template);
  
  // 6. Open the new post
  const file = app.vault.getAbstractFileByPath(`blog/posts/${slug}.qmd`);
  if (file) app.workspace.getLeaf(false).openFile(file);
  
  return `Created blog/posts/${slug}.qmd`;
};
```

### 6.3 Usage
`Ctrl+P` → **Templater: Run user script** → `create_post.js` → Select idea → Opens new `.qmd` with frontmatter pre-filled

---

## 7. Quarto Project Setup

### 7.1 Initialize (One Time)
```bash
cd blog
quarto create project blog --no-open  # or use existing _quarto.yml
```

**`blog/_quarto.yml`** (key config):
```yaml
project:
  type: website
  output-dir: _site
  render:
    - "posts/*.qmd"
    - "!posts/draft-*.qmd"

website:
  title: "Dr. D's Data Science"
  description: "Data science for 911/PSAP operations"
  site-url: "https://drddatascience.com"
  repo-url: https://github.com/tonydunsworth/drddatascience-blog
  repo-actions: [edit, issue]
  favicon: images/favicon.ico
  open-graph: true
  twitter-card: true
  page-navigation: true
  back-to-top-navigation: true
  search: true
  sidebar:
    style: "docked"
    background: light
    tools: 
      - name: "GitHub"
        icon: github
        href: https://github.com/tonydunsworth
      - name: "LinkedIn"
        icon: linkedin
        href: https://linkedin.com/in/tonydunsworth

format:
  html:
    theme: 
      light: cosmo
      dark: [cosmo, custom-dark.scss]
    highlight-style: github
    code-fold: show
    code-tools: true
    code-links: ["github", "binder"]
    toc: true
    toc-depth: 3
    number-sections: false
    html-math-method: katex
    include-in-header:
      - text: |
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    css: styles/custom.css

execute:
  freeze: auto
  warning: false
  message: false
  echo: true

bibliography: references.bib
csl: apa.csl
```

### 7.2 Custom CSS (`blog/styles/custom.css`)
```css
/* Code block enhancements */
.code-tools { opacity: 0.6; transition: opacity 0.2s; }
.code-tools:hover { opacity: 1; }

/* Callout styling for 911 domain */
.callout-ne { border-left-color: #d62828; }
.callout-ps { border-left-color: #003087; }
.callout-tip { border-left-color: #1b998b; }

/* Hero image */
.hero-image { width: 100%; max-height: 400px; object-fit: cover; margin-bottom: 1.5rem; }

/* Table responsiveness */
table { width: 100%; overflow-x: auto; display: block; }
```

---

## 8. Development Loop

### 8.1 Local Preview
```bash
cd blog
quarto preview posts/your-post.qmd
# Opens http://localhost:4200 — auto-reloads on save
```

### 8.2 Code Development (in `src/`)
```bash
# Python
cd src/your-slug
uv init
uv add pandas duckdb plotly lightgbm shap scikit-learn
# Write src/your_slug/train.py, predict.py, features.py

# R
# renv::init()
# renv::install(c("tidyverse","tsibble","fable","fable.prophet","duckdb"))

# Julia
# pkg> add MLJ LightGBM DifferentialEquations JuMP HiGHS DataFrames CSV

# Rust
# cargo new --bin optimizer && cd optimizer
# cargo add polars linfa ndarray serde

# Go
# go mod init github.com/tonydunsworth/your-slug
# go get gonum.org/v1/gonum github.com/go-chi/chi/v5
```

### 8.3 Promote Notebook → Module
```bash
# 1. Explore in notebook
jupyter lab notebooks/explore-your-slug.ipynb

# 2. Refactor into src/your_slug/
# 3. Add tests: pytest tests/test_your_slug.py
# 4. Import in Quarto chunks:
# ```{python}
# #| label: train-model
# from your_slug import train
# model = train(config="config/prod.yaml")
# ```
```

### 8.4 Render & Freeze
```bash
# Full render (all posts)
quarto render

# Single post with compute freeze
quarto render posts/your-post.qmd --execute-freeze

# Check for broken links
quarto check
```

---

## 9. Publishing & CI/CD

### 9.1 GitHub Actions (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Quarto
        uses: quarto-dev/quarto-actions/setup@v2
        with:
          version: "1.5.5"
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install uv && uv sync --directory blog
      
      - name: Setup R
        uses: r-lib/actions/setup-r@v2
        with:
          r-version: "4.3"
      - run: R -e "renv::restore()" -d blog
      
      - name: Setup Julia
        uses: julia-actions/setup-julia@v1
        with:
          version: "1.10"
      - run: julia --project=blog -e 'using Pkg; Pkg.instantiate()'
      
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
      - run: cargo build --release --manifest-path blog/src/optimizer/Cargo.toml
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: "1.22"
      
      - name: Render Site
        run: cd blog && quarto render
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.1
        with:
          publish-dir: ./blog/_site
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 9.2 Netlify Setup
1. Connect GitHub repo → Netlify
2. Build command: `cd blog && quarto render`
3. Publish directory: `blog/_site`
4. Add environment variables: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` in GitHub repo secrets

---

## 10. Maintenance Commands

```bash
# Daily: create today's note (or click Calendar)
# Weekly: review blog/ideas/ → promote 1-2
# Per post: 
#   1. Capture idea (Ctrl+Shift+B)
#   2. Research & code (notebooks + src/)
#   3. Promote to post (Ctrl+Shift+P or script)
#   4. Draft in Quarto preview
#   5. Self-review (blind-spot checklist)
#   6. Peer review (share .qmd or rendered HTML)
#   7. Push → auto-deploy

# Update dependencies monthly
cd blog && uv sync --upgrade && renv::update() && julia --project -e 'using Pkg; Pkg.update()'

# Backup synthetic data
rsync -av data/synthetic/ ~/backups/drddatascience/synthetic/
```

---

## 11. Troubleshooting

| Issue | Fix |
|---|---|
| Templater not prompting | Check template folder path; restart Obsidian |
| Variables not replacing | Ensure `{{ VAR }}` matches exactly; check for spaces |
| Quarto render fails | Run `quarto check`; check `_freeze/` for cached errors |
| Python packages missing | `uv sync --directory blog` or `pip install -r blog/requirements.txt` |
| R packages missing | `R -e "renv::restore()" -d blog` |
| Netlify deploy fails | Check GitHub Actions logs; verify `_site/` exists |
| Images not loading | Ensure `blog/images/posts/slug/` exists; paths relative to `.qmd` |
| Code blocks not folding | Verify `code-fold: show` in frontmatter or `_quarto.yml` |

---

## 12. Quick Reference Card

```
DAILY NOTE          Ctrl+Shift+N  → daily/YYYY-MM-DD.md
BLOG IDEA           Ctrl+Shift+B  → blog/ideas/...
BLOG POST           Ctrl+Shift+P  → blog/posts/...qmd (via script)
PREVIEW             quarto preview blog/posts/x.qmd
RENDER              quarto render blog
DEPLOY              git push origin main
```

---

*Guide version: 1.0 | Update when tooling changes*