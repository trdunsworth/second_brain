---
type: reference
status: active
topic: "What Posit Software, PBC sells and stands for — the enterprise data science platform, its product families, solutions by team and industry, and the partner ecosystem."
created: 2026-10-30
tags:
  - posit
  - data-science
  - reference
aliases:
  - Posit Company
  - Posit Platform
  - posit.co
---

# Posit Company and Platform

Source: <https://posit.co> — captured 2026-10-30.

## Positioning

- **Mission:** "We help the world make sense of data." Open-source software for data science,
  research, and communication, "built to serve knowledge creators for the next century."
- **Legal form:** Posit Software, PBC — formerly RStudio, PBC. A Public Benefit Corporation
  committed to open source, freedom of choice, and being a long-term partner. Stated as
  "no vendor lock-in, no exit strategy."
- **Scale:** 10,000+ customers; trusted by about 1 in 5 Fortune 500 companies. Named customers
  include NASA, Mastercard, Pfizer, Walmart, NMDP, Gen Re, Trillium, KBRA, Novo Nordisk,
  TruDiagnostic, DairyNZ, Suffolk, Dow, Brown-Forman, Pinterest, AstraZeneca.
- **Contact:** 250 Northern Ave, Suite 420, Boston, MA 02210 · 844.448.1212
- Current marketing frame: **"Turn data science into business impact"** and **"From Plausible to
  Provable"** — the argument being that generative AI makes plausible output easy, but a governed
  environment is what makes results inspectable, verifiable, and repeatable.

## The three product families

Posit organizes products by job to be done rather than by tier.

### Analyze

| Product | What it is |
|---|---|
| **Posit Workbench** | Centrally managed environment for data scientists using Positron, RStudio, VS Code, or Jupyter. Scalable compute; IT keeps control of security and infrastructure. |
| **Positron Pro** | A secure, governed, scalable data science editor delivered *through* Workbench (not a separate desktop license). |
| **Posit AI Pass** | Subscription powering Posit Assistant in RStudio, Positron, and the terminal. |
| **Posit Cloud** | Hosted environment to code in RStudio or Jupyter notebooks and share. |
| **Posit Team Suite** | Workbench + Connect + Package Manager as one platform. |

### Publish

| Product | What it is |
|---|---|
| **Posit Connect** | Publish and update dynamic data insights and applications — apps, dashboards, APIs, reports — deployed from the IDE, governed from one console. |
| **Posit Connect Cloud** | Quickly publish and share Python and R work without self-hosting. |
| **shinyapps.io** | Hosted Shiny application deployment. |

### Govern

| Product | What it is |
|---|---|
| **Posit Package Manager** | Curated, secure, scalable R and Python package repositories with vulnerability reports, blocking rules, and date-based snapshots for regulatory compliance. Extends to AI coding assistants so their package recommendations stay inside approved boundaries. |
| **Public Package Manager** | Free access to CRAN, PyPI, and Bioconductor packages (also Bioconductor). Discover and install. |

## Posit AI

A shipped product family, not a roadmap item:

- **Posit Assistant** — an AI agent embedded in RStudio and Positron that reads the live session
  (loaded packages, variables, data frames) and answers from real data rather than generic
  assumptions. **Zero data retention:** code and data are never stored or used for training.
- **Next Edit Suggestions** — background code completions for joins, parameter updates, and
  patterns. Unlimited with a Posit AI subscription.
- **Pricing:** $20/month add-on to any edition, free trial, no credit card required, cancel
  anytime. Also sold as the Posit AI Pass.

## Solutions and industries

Solutions pages are written for four audiences — data scientists, data science leaders, IT
leaders, business leaders — plus an "AI for data people" angle and the Academy Apprenticeship
(see [[Posit Academy]]).

Industry pages: **Financial Services, Insurance, Pharma, Public Sector** (plus manufacturing
appearing in the customer-story carousel).

## Partners

| Type | Partners |
|---|---|
| Data platforms | Snowflake (Snowpark Container Services — run Posit where the data lives), Databricks (lakehouse), Amazon SageMaker |
| Cloud platforms | AWS (EC2 + native IAM), Google Cloud Platform, Microsoft Azure (Azure ML) |
| Channel | Partner Directory, Partner Program (resellers, MSPs, professional services), deal registration |

## Resources

- **Docs:** <https://docs.posit.co>
- **Content library, demo gallery, blog, videos, cheatsheets**
  (cheatsheets live at <https://opensource.posit.co/resources/cheatsheets/>)
- **Events:** <https://posit.co/events>, webinars, Data Science Hangouts, **posit::conf**
  (<https://conf.posit.co>), The Test Set podcast
- **Support:** enterprise support, community forum (<https://forum.posit.co>), knowledge base
  (<https://support.posit.co>)
- **Trust Center:** <https://trust.posit.co> · **PBC Report:** `/about/pbc-report`

## Notes for our own work

- The tier we would actually buy, if any, is **Team** (Workbench + Connect + Package Manager).
  Pricing is not published on posit.co — it is quote-gated behind `/pricing` and "Schedule a call,"
  so budget conversations need a sales contact.
- The free tier already covers the stack used in this vault: RStudio/Positron + Quarto + Shiny +
  tidyverse. Governance features (Package Manager snapshots, Connect access control) are the only
  things we would be paying for.
- See [[Posit Open Source]] for what sits underneath all of this, and [[RStudio IDE]] for the
  edition/pricing detail that overlaps this page.
