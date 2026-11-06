---
type: reference
status: active
topic: "Posit AI — the Posit AI product family: Posit Assistant, Next Edit Suggestions, and the Posit AI Pass subscription, and which surfaces run them."
created: 2026-11-01
tags:
  - posit
  - posit-ai
  - ai
  - data-science
  - reference
---

# Posit AI

Sources: <https://posit.ai/> · <https://posit.co/products/ai> · <https://positron.posit.co/assistant.html> —
captured 2026-11-01.

## Positioning

Posit AI is a **shipped product family**, not a roadmap item: a subscription that powers
context-aware AI assistance across the Posit data science stack, plus background code assistance.

The core product — **Posit Assistant** — is an AI agent embedded in the data science IDEs that reads
the **live data session** (loaded packages, variables, data frames) and answers from real data rather
than generic assumptions. Paired with **zero data retention** — code and data are never stored or used
for training.

## Components

- **Posit Assistant** — the IDE-embedded agent; surfaces in [[RStudio IDE]], [[Positron]], and the
  terminal via the subscription.
- **Next Edit Suggestions** — background code completions for joins, parameter updates, and
  patterns; unlimited with a Posit AI subscription.

## Pricing

- **$20/month** add-on to any edition; also sold as the **Posit AI Pass**.
- Free trial, no credit card required, cancel anytime.

## Why it is differentiated

- **Governed-environment AI:** the assistant runs inside a governed environment and can see the live
  data session — unlike generic assistants that answer from assumptions.
- **Zero data retention:** code and data are never stored or used for training.

## Relevance here

- The free tier of the stack this vault already uses ([[RStudio IDE]] / [[Positron]] + Quarto + Shiny +
  tidyverse) is what runs without AI; Posit AI is the paid layer on top — see
  [[Posit Company and Platform]] for the enterprise framing.

## Related vault notes

- [[01_AI_with_R_Overview|AI with R — Overview]] — the open-source AI-with-R landscape, including `chat_posit()`
- [[02_ellmer_Tutorial|ellmer Tutorial]] — using Posit AI and other providers through ellmer
- [[04_Local_LLMs_and_Agents|Local LLMs and Agents]] — local and agentic alternatives
- [[Posit Open Source Software Catalog]] — ellmer, ragnar, vitals, shinychat

## Sources

- <https://posit.ai/>
- <https://posit.co/products/ai>
- <https://positron.posit.co/assistant.html>
