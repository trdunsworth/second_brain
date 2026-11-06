# R Programming - Cross-References & Navigation

A comprehensive index linking all R Programming notes with related content across the knowledge base.

---

## 📚 Complete R Programming Index

| # | Note | Path | Primary Focus |
|-----|------|------|---------------|
| 00 | [Index](00_Index.md) | `R Programming/00_Index.md` | Master navigation |
| 01 | [Best Practices](Best Practices/01_Best_Practices.md) | `Best Practices/01_Best_Practices.md` | Modern R workflow, renv, testing, docs |
| 02 | [Tidyverse Overview](tidyverse/01_tidyverse_Overview.md) | `tidyverse/01_tidyverse_Overview.md` | dplyr, tidyr, readr, purrr, tibble, stringr, forcats |
| 03 | [Tidyverse Cheatsheet](tidyverse/02_tidyverse_Cheatsheet.md) | `tidyverse/02_tidyverse_Cheatsheet.md` | Quick reference for daily use |
| 04 | [Tidymodels](tidymodels/01_tidymodels_Overview.md) | `tidymodels/01_tidymodels_Overview.md` | Complete ML framework guide |
| 05 | [Tidymodels Cheatsheet](tidymodels/02_tidymodels_Cheatsheet.md) | `tidymodels/02_tidymodels_Cheatsheet.md` | Quick ML reference |
| 06 | [ggplot2 Tutorial](ggplot2/01_ggplot2_Tutorial.md) | `ggplot2/01_ggplot2_Tutorial.md` | Complete Cedric Scherer tutorial |
| 07 | [ggplot2 Cheatsheet](ggplot2/02_ggplot2_Cheatsheet.md) | `ggplot2/02_ggplot2_Cheatsheet.md` | Quick ggplot2 reference |
| 08 | [reticulate Tutorial](reticulate/01_reticulate_Tutorial.md) | `reticulate/01_reticulate_Tutorial.md` | Python from R: envs, conversion, NumPy/pandas |
| 09 | [reticulate Cheatsheet](reticulate/02_reticulate_Cheatsheet.md) | `reticulate/02_reticulate_Cheatsheet.md` | Quick reticulate reference |
| 10 | [Free R Books](09_Free_R_Books.md) | `09_Free_R_Books.md` | Curated free HTML-first R books |
| 11 | [AI with R Overview](AI/01_AI_with_R_Overview.md) | `AI/01_AI_with_R_Overview.md` | Package landscape, providers, keys, cost, privacy |
| 12 | [ellmer Tutorial](AI/02_ellmer_Tutorial.md) | `AI/02_ellmer_Tutorial.md` | Chat, prompts, streaming, structured data, tools, Shiny |
| 13 | [ellmer Cheatsheet](AI/03_ellmer_Cheatsheet.md) | `AI/03_ellmer_Cheatsheet.md` | Quick ellmer 0.5.0 reference |
| 14 | [Local LLMs & Agents](AI/04_Local_LLMs_and_Agents.md) | `AI/04_Local_LLMs_and_Agents.md` | Ollama, ragnar, mcptools, agents, guardrails |

---

## 🔗 Cross-References Map

### From Machine Learning Notes
```
Machine Learning Cheatsheet
  ├── Tidymodels Overview → tidymodels/01_tidymodels_Overview.md
  ├── Recipes/Preprocessing → tidymodels/01_tidymodels_Overview.md#2-recipes---preprocessing
  ├── Model Specs → tidymodels/01_tidymodels_Overview.md#1-parsnip---model-specification
  ├── Hyperparameter Tuning → tidymodels/02_tidymodels_Cheatsheet.md#4-tune---hyperparameter-tuning
  ├── Model Evaluation → tidymodels/02_tidymodels_Cheatsheet.md#5-yardstick---model-evaluation
  └── Deployment → tidymodels/01_tidymodels_Overview.md#9-production-deployment
```

### From Time Series Notes
```
Time Series Cheatsheet
  ├── Tidymodels Time Series → tidymodels/01_tidymodels_Overview.md (Panel Data section)
  ├── Feature Engineering → 02_Time_Series_Cheatsheet.md#2-time-series-feature-engineering
  ├── Time Series CV → 02_Time_Series_Cheatsheet.md#3-time-series-modeling
  └── Visualization → 02_Time_Series_Cheatsheet.md#5-advanced-visualization
```

### From Statistics Notes
```
Advanced Statistics Cheatsheet
  ├── Linear Models → tidymodels (linear_reg, linear_reg with glmnet)
  ├── Mixed Models → tidymodels (parsnip with lme4 engine)
  ├── Bayesian → tidymodels (Bayesian engines in parsnip)
  └── Model Selection → tidymodels (tune, cross-validation)
```

### From Python / Interop Notes
```
reticulate Tutorial
  ├── Environment setup → reticulate/01_reticulate_Tutorial.md#3-managing-python-environments
  ├── Type conversion → reticulate/01_reticulate_Tutorial.md#6-type-conversion
  ├── NumPy arrays → reticulate/01_reticulate_Tutorial.md#7-numpy-and-arrays
  ├── pandas → reticulate/01_reticulate_Tutorial.md#8-pandas-dataframes
  ├── R Markdown/Quarto → reticulate/01_reticulate_Tutorial.md#9-r-markdown-and-quarto
  └── Quick commands → reticulate/02_reticulate_Cheatsheet.md
```

### From AI / LLM Notes
```
AI with R Overview
  ├── Package landscape → AI/01_AI_with_R_Overview.md#2-the-package-landscape
  ├── Provider choice → AI/01_AI_with_R_Overview.md#3-providers-and-models
  ├── API keys → AI/01_AI_with_R_Overview.md#4-api-keys-and-credentials
  ├── Cost and tokens → AI/01_AI_with_R_Overview.md#5-cost-and-tokens
  ├── Privacy and governance → AI/01_AI_with_R_Overview.md#6-privacy-security-and-governance
  └── Task decision table → AI/01_AI_with_R_Overview.md#7-what-to-use-for-what

ellmer Tutorial
  ├── First chat → AI/02_ellmer_Tutorial.md#3-your-first-conversation
  ├── Prompt design → AI/02_ellmer_Tutorial.md#5-system-prompts-and-prompt-design
  ├── Streaming → AI/02_ellmer_Tutorial.md#7-streaming
  ├── Async → AI/02_ellmer_Tutorial.md#8-async
  ├── Structured data → AI/02_ellmer_Tutorial.md#9-structured-data
  ├── Tools → AI/02_ellmer_Tutorial.md#10-tools-function-calling
  ├── Parallel/batch → AI/02_ellmer_Tutorial.md#11-parallel-and-batch-chats
  ├── Shiny → AI/02_ellmer_Tutorial.md#13-shiny-and-shinychat
  └── Evaluation → AI/02_ellmer_Tutorial.md#14-evaluation-with-vitals

Local LLMs and Agents
  ├── Ollama → AI/04_Local_LLMs_and_Agents.md#2-ollama
  ├── Model sizing → AI/04_Local_LLMs_and_Agents.md#3-choosing-a-local-model
  ├── RAG with ragnar → AI/04_Local_LLMs_and_Agents.md#4-rag-with-ragnar
  ├── MCP with mcptools → AI/04_Local_LLMs_and_Agents.md#5-mcp-with-mcptools
  ├── Agents → AI/04_Local_LLMs_and_Agents.md#6-agents-in-r
  └── Guardrails → AI/04_Local_LLMs_and_Agents.md#7-guardrails
```

---

## 🔗 Cross-Reference Matrix

| From Topic | → | Related R Notes |
|------------|---|-----------------|
| **EDA** | → | `01_EDA_Cheatsheet.md` → `tidyverse/01_tidyverse_Overview.md` (dplyr/tidyr) |
| **Time Series** | → | `02_Time_Series_Cheatsheet.md` → `tidymodels` (Panel Data, Modeltime) |
| **ML Pipeline** | → | `03_Machine_Learning_Cheatsheet.md` ↔ `tidymodels/01_tidymodels_Overview.md` |
| **Visualization** | → | `ggplot2/01_ggplot2_Tutorial.md` ↔ `ggplot2/02_ggplot2_Cheatsheet.md` |
| **Tidyverse** | → | `tidyverse/01_tidyverse_Overview.md` ↔ `tidyverse/02_tidyverse_Cheatsheet.md` |
| **ML Pipeline** | → | `tidymodels/01_tidymodels_Overview.md` ↔ `03_Machine_Learning_Cheatsheet.md` |
| **Stats** | → | `04_Advanced_Statistics_Cheatsheet.md` → `tidymodels` (model specs) |
| **Python Interop** | → | `reticulate/01_reticulate_Tutorial.md` ↔ `reticulate/02_reticulate_Cheatsheet.md` |
| **AI / LLMs** | → | `AI/01_AI_with_R_Overview.md` ↔ `AI/02_ellmer_Tutorial.md` ↔ `AI/03_ellmer_Cheatsheet.md` |
| **Local LLMs / RAG** | → | `AI/04_Local_LLMs_and_Agents.md` → `Agents/RAG Systems — Retrieval-Augmented Generation.md` |
| **MCP / Agents** | → | `AI/04_Local_LLMs_and_Agents.md` → `Agents/MCP — Model Context Protocol Guide.md` |
| **LLM Evaluation** | → | `AI/02_ellmer_Tutorial.md#14-evaluation-with-vitals` → `Agents/Testing and Evaluation Strategies for Agents.md` |
| **Book References** | → | `09_Free_R_Books.md` → topic-specific notes |
| **MLOps** | → | `MLOps/` notes → `tidymodels` (Deployment section) |

---

## 🎯 Quick Navigation Shortcuts

### By Task Type

| Task | Start Here | Deep Dive |
|------|----------|-----------|
| **Start R Project** | `Best Practices/01_Best_Practices.md#21-project-setup-with-renv` | `Best Practices/01_Best_Practices.md` |
| **Data Wrangling** | `tidyverse/02_tidyverse_Cheatsheet.md` | `tidyverse/01_tidyverse_Overview.md` |
| **Data Viz** | `ggplot2/02_ggplot2_Cheatsheet.md` | `ggplot2/01_ggplot2_Tutorial.md` |
| **EDA** | `01_EDA_Cheatsheet.md` | `tidyverse/01_tidyverse_Overview.md` |
| **Time Series** | `02_Time_Series_Cheatsheet.md` | `tidymodels/01_tidymodels_Overview.md` |
| **ML Pipeline** | `03_Machine_Learning_Cheatsheet.md` | `tidymodels/01_tidymodels_Overview.md` |
| **Hyperparameter Tuning** | `tidymodels/02_tidymodels_Cheatsheet.md#4-tune---hyperparameter-tuning` | `tidymodels/01_tidymodels_Overview.md#4-tune---hyperparameter-tuning` |
| **Model Deployment** | `tidymodels/01_tidymodels_Overview.md#9-production-deployment` | `MLOps/Real-time Serving/01_Real-time_Serving.md` |
| **Model Monitoring** | `MLOps/Model Monitoring/01_Model_Monitoring.md` | `tidymodels/01_tidymodels_Overview.md` |
| **Python Interop** | `reticulate/02_reticulate_Cheatsheet.md` | `reticulate/01_reticulate_Tutorial.md` |
| **AI / LLM Chat** | `AI/02_ellmer_Tutorial.md#3-your-first-conversation` | `AI/03_ellmer_Cheatsheet.md` |
| **Structured Extraction** | `AI/02_ellmer_Tutorial.md#9-structured-data` | `AI/03_ellmer_Cheatsheet.md#7-structured-data` |
| **Tool Calling** | `AI/02_ellmer_Tutorial.md#10-tools-function-calling` | `AI/03_ellmer_Cheatsheet.md#8-tools` |
| **Local Models** | `AI/04_Local_LLMs_and_Agents.md#2-ollama` | `AI/04_Local_LLMs_and_Agents.md#3-choosing-a-local-model` |
| **RAG** | `AI/04_Local_LLMs_and_Agents.md#4-rag-with-ragnar` | `Agents/RAG Systems — Retrieval-Augmented Generation.md` |
| **MCP** | `AI/04_Local_LLMs_and_Agents.md#5-mcp-with-mcptools` | `Agents/MCP — Model Context Protocol Guide.md` |
| **Free R Books** | `09_Free_R_Books.md` | Topic-specific book sections |
| **A/B Testing** | `MLOps/A/B Testing/01_A-B_Testing_Platform.md` | `03_Machine_Learning_Cheatsheet.md` |
| **Cost Optimization** | `MLOps/Cost Optimization/01_Cost_Optimization.md` | `03_Machine_Learning_Cheatsheet.md` |

---

## 📚 Learning Paths

### Path 1: R Fundamentals → Tidyverse → Viz
```
1. Best Practices/01_Best_Practices.md (Setup, renv, style)
   ↓
2. tidyverse/01_tidyverse_Overview.md (Core packages)
   ↓
3. tidyverse/02_tidyverse_Cheatsheet.md (Quick ref)
   ↓
4. ggplot2/01_ggplot2_Tutorial.md (Deep dive)
   ↓
5. ggplot2/02_ggplot2_Cheatsheet.md (Quick ref)
```

### Path 2: ML Pipeline (Tidymodels)
```
1. tidymodels/01_tidymodels_Overview.md (Framework)
   ↓
2. tidymodels/02_tidymodels_Cheatsheet.md (Quick ref)
   ↓
3. 03_Machine_Learning_Cheatsheet.md (Extended ML)
   ↓
4. MLOps/Real-time Serving/01_Real-time_Serving.md (Deployment)
```

### Path 3: Data Science Workflow
```
1. 01_EDA_Cheatsheet.md (Explore)
   ↓
2. 02_Time_Series_Cheatsheet.md (if temporal)
   ↓
3. 03_Machine_Learning_Cheatsheet.md (Model)
   ↓
4. 04_Advanced_Statistics_Cheatsheet.md (Validate)
   ↓
5. MLOps/ notes (Deploy/Monitor)
```

### Path 4: AI with R
```
1. AI/01_AI_with_R_Overview.md (Landscape, keys, cost, privacy)
   ↓
2. AI/02_ellmer_Tutorial.md (Chat, prompts, structured data, tools)
   ↓
3. AI/03_ellmer_Cheatsheet.md (Keep open while coding)
   ↓
4. AI/04_Local_LLMs_and_Agents.md (Ollama, ragnar, mcptools, guardrails)
   ↓
5. vitals evaluation → shinychat deployment
   ↓
6. Agents/ notes (RAG, MCP, evaluation, security)
```

---

## 🔗 External Resource Links

### Official Documentation
| Resource | URL |
|----------|-----|
| R for Data Science (2e) | https://r4ds.hadley.nz/ |
| Tidyverse | https://www.tidyverse.org/ |
| Tidymodels | https://www.tidymodels.org/ |
| ggplot2 | https://ggplot2.tidyverse.org/ |
| Tidy Modeling with R | https://www.tmwr.org/ |
| reticulate | https://rstudio.github.io/reticulate/ |
| ellmer | https://ellmer.tidyverse.org/ |
| tidyllm | https://edubruell.github.io/tidyllm/ |
| ragnar | https://ragnar.tidyverse.org/ |
| vitals | https://vitals.tidyverse.org/ |
| shinychat | https://posit-dev.github.io/shinychat/r/ |
| mcptools | https://posit-dev.github.io/mcptools/ |
| Ollama | https://ollama.com/ |

### Key Tutorials
| Tutorial | Source |
|----------|--------|
| ggplot2 Tutorial | Cedric Scherer |
| Tidy Modeling with R | Kuhn & Wickham |
| R for Data Science | Wickham & Grolemund |
| Tidy Modeling with R | Kuhn & Silge |
| Free R Books | Internal list: `09_Free_R_Books.md` |

### Package References
| Package | Reference |
|---------|-----------|
| dplyr | https://dplyr.tidyverse.org/reference/ |
| ggplot2 | https://ggplot2.tidyverse.org/reference/ |
| tidymodels | https://www.tidymodels.org/reference/ |
| recipes | https://recipes.tidymodels.org/reference/ |
| parsnip | https://parsnip.tidymodels.org/reference/ |
| tune | https://tune.tidymodels.org/reference/ |
| yardstick | https://yardstick.tidymodels.org/reference/ |
| reticulate | https://rstudio.github.io/reticulate/reference/ |
| ellmer | https://ellmer.tidyverse.org/reference/ |
| ragnar | https://ragnar.tidyverse.org/reference/ |
| vitals | https://vitals.tidyverse.org/reference/ |
| shinychat | https://posit-dev.github.io/shinychat/r/reference/ |
| mcptools | https://posit-dev.github.io/mcptools/reference/ |

---

## 🏷️ Tag-Based Navigation

### By Skill Level
| Level | Notes |
|-------|-------|
| **Beginner** | Best Practices → Tidyverse Overview → ggplot2 Tutorial |
| **Intermediate** | Tidyverse Cheatsheet → Tidymodels Overview → ML Cheatsheet |
| **Advanced** | Tidymodels Cheatsheet → ML Cheatsheet → Advanced Stats → MLOps → AI/LLM notes |

### By Domain
| Domain | Notes |
|--------|-------|
| **Data Wrangling** | tidyverse Overview + Cheatsheet |
| **Visualization** | ggplot2 Tutorial + Cheatsheet |
| **EDA** | EDA Cheatsheet |
| **Time Series** | Time Series Cheatsheet |
| **ML** | Tidymodels + ML Cheatsheet |
| **Stats** | Advanced Stats Cheatsheet |
| **Python Interop** | reticulate Tutorial + Cheatsheet |
| **AI / LLMs** | AI Overview + ellmer Tutorial + Cheatsheet |
| **Local LLMs / RAG** | Local LLMs and Agents → ragnar → Agents/RAG guide |
| **MCP / Agents** | Local LLMs and Agents → Agents/MCP guide |
| **LLM Evaluation** | ellmer Tutorial (vitals) → Agents/Testing guide |
| **MLOps** | MLOps folder |

---

## 🔍 Search Tips

### In Obsidian/VS Code
```
# Search within R Programming folder
path:"R Programming" tag:#cheatsheet

# Find all ggplot2 references
path:"R Programming" "ggplot2"

# Find all tidymodels references
path:"R Programming" "tidymodels"

# Find all cheatsheets
path:"R Programming" "Cheatsheet"
```

### In Terminal
```bash
# Find all cheatsheets
find "R Programming" -name "*Cheatsheet*.md"

# Find all tutorials
find "R Programming" -name "*Tutorial*.md"

# Find all overviews
find "R Programming" -name "*Overview*.md"

# Search for specific function
grep -r "pivot_longer" "R Programming/"
grep -r "rand_forest" "R Programming/"
grep -r "geom_point" "R Programming/"
```

---

## 📝 Contribution Guidelines

### Adding New Notes
1. Follow naming: `XX_Topic_Name.md`
2. Add to `00_Index.md` table
3. Update cross-references in this file
3. Add to relevant Learning Path in `Learning Path.md`

### Note Template
```markdown
# Topic Name

Brief description.

## 1. Section

Content with code examples.

## 2. Section

More content.

---

## Key Takeaways
1. Point 1
2. Point 2

---

## Resources
- [R for Data Science](https://r4ds.hadley.nz/) - Free online book
- [Tidyverse style guide](https://style.tidyverse.org/) - Coding standards
```

---

*Last updated: 2026-11-05*
*Part of: Data Science Second Brain*