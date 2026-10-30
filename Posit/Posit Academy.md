---
type: reference
status: active
topic: "Posit's learning offering — the free self-paced platform at academy.posit.co and the paid, mentor-led Academy Apprenticeships with their course catalog and weekly rhythm."
created: 2026-10-30
tags:
  - posit
  - learning
  - data-science
aliases:
  - Academy Apprenticeships
  - Posit Academy Apprenticeship
---

# Posit Academy

Sources: <https://academy.posit.co> and <https://posit.co/products/enterprise/academy> —
captured 2026-10-30.

> The academy.posit.co catalog itself is a JavaScript application (Skilljar-powered), so its
> course list does not survive plain fetching. Course details below come from the Posit product
> page; sign in at <https://academy.posit.co> to see the current catalog.

## Two halves of one product

Posit Academy is positioned as "a free data science learning platform where you can instantly
access everything from self-paced courses to premium, mentor-led apprenticeships."

1. **Free, self-paced courses** on academy.posit.co — instant access, sign-in required.
2. **Academy Apprenticeships** — premium, mentor-led, project-based training for teams
   (contact-gated: `/contact-posit-academy`).

## Academy Apprenticeships

Teaches teams to write production-quality R code through hands-on practice,
industry-relevant data sets, and small-group collaboration. Pitching line: *"Build real skills
with mentors who know data science."*

### Three components

| Component | Detail |
|---|---|
| **Interactive, self-paced lessons** | Learn by writing code, not watching videos. Immediate feedback on R code so mistakes get corrected as they happen. Asynchronous — learners work on their own schedule. |
| **Industry-relevant projects** | Data sets from your industry rather than generic textbook examples. Every week includes an opportunity to work with your own data, so skills transfer to the job on day one. |
| **Mentor-facilitated small-group sessions** | Weekly live sessions with colleagues and an experienced data science mentor — questions, showing work, and a community of practice that outlives the course. |

### A typical week

| Rhythm | Activity |
|---|---|
| ~45 min/day | Interactive daily lessons in R, with feedback on every line; concepts introduced gradually and reinforced |
| Weekly | Project milestone on a real data science problem using industry data — some collaborative, some independent |
| ~2 hrs/week | Live small-group session with the mentor; best practices beyond what a tutorial covers |

### Course catalog (R; Python in development)

| Course | Duration | Prerequisites | Covers |
|---|---|---|---|
| **Foundations of the Tidyverse** | 8 weeks | None — no programming experience needed | Import, transform, clean, visualize with tidyverse packages. Final week is a chosen deep dive: reproducible reporting with Quarto, getting started with functions, or publication-quality tables and plots. Aimed at teams new to R, movers from SAS/Excel/SPSS, tidyverse best-practice adoption, and teams adding R alongside Python. |
| **Programming in R** | 8 weeks | Tidyverse proficiency (or the course above) | More reliable, reusable, production-ready R: debugging, complex functions, testing, production workflows. Ends with a simple R package. For R users expanding skills, preparing to build Shiny apps or internal packages, and teams focused on reproducibility and code quality. |
| **Intro to Shiny for R** | 6 weeks | Tidyverse proficiency + function writing (or Programming in R) | Fundamental components of a Shiny application, mental models for reactivity, and a capstone app chosen in consultation with the mentor. For experienced R users who need interactive applications and dashboards for stakeholders. |

**Python courses are in development.**

### Why Posit sells this when free resources exist

The argument made on the product page: free courses and tutorials teach only syntax; the
apprenticeship teaches applying data science to business problems in your industry context —
internal community of practice, a mentor, and a curriculum built by the creators of the
tidyverse.

## Customers cited

AstraZeneca (Director of Data Science Learning and Development — "experiential learning is key to
generating the motivation needed"), MMC Research Institute (would repeat for future cohorts), Dow
(300+ "citizen data scientists" upskilled through Academy alongside Workbench).

## Relevance here

- The **Foundations of the Tidyverse → Programming in R → Intro to Shiny** ladder is a sensible
  onboarding path for a PSAP analytics team already using RStudio.
- The curriculum is R-first. Our reporting work leans on R + Quarto + Shiny, so the R track fits;
  the Python track would matter more for [[Agents]]-adjacent work and is not yet available.
- Tier 1 material (Quarto reporting, tidyverse) is free on academy.posit.co; the paid tier buys
  mentorship and project structure, not content access.
