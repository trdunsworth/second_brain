# R Programming - Index

A comprehensive R programming reference for data science, from fundamentals to advanced applications.

## 📚 Notes Index

| # | Topic | Description | Status |
|-----|-------|-------------|--------|
| 01 | [Best Practices](Best Practices/01_Best_Practices.md) | Modern R development workflow, renv, code style, testing, documentation, Git workflow | ✅ Complete |
| 02 | [Tidyverse Overview](tidyverse/01_tidyverse_Overview.md) | Complete guide to dplyr, tidyr, readr, purrr, tibble, stringr, forcats, and extended ecosystem | ✅ Complete |
| 03 | [Tidymodels](tidymodels/01_tidymodels_Overview.md) | Complete ML framework: parsnip, recipes, rsample, tune, workflows, yardstick, dials | ✅ Complete |
| 04 | [ggplot2 Tutorial](ggplot2/01_ggplot2_Tutorial.md) | Complete ggplot2 tutorial with Cedric Scherer's beautiful plotting guide | ✅ Complete |
| 05 | [reticulate Tutorial](reticulate/01_reticulate_Tutorial.md) | Python from R: environments, imports, conversion, NumPy/pandas, R Markdown/Quarto | ✅ Complete |
| 06 | [reticulate Cheatsheet](reticulate/02_reticulate_Cheatsheet.md) | Quick reference for reticulate commands and patterns | ✅ Complete |
| 07 | [Free R Books](09_Free_R_Books.md) | 165 free R books with author, synopsis, format, and link | ✅ Complete |
| 08 | [AI with R Overview](AI/01_AI_with_R_Overview.md) | Package landscape, providers, keys, cost, privacy, decision table | ✅ Complete |
| 09 | [ellmer Tutorial](AI/02_ellmer_Tutorial.md) | Chat objects, prompts, streaming, structured data, tools, Shiny, evaluation | ✅ Complete |
| 10 | [ellmer Cheatsheet](AI/03_ellmer_Cheatsheet.md) | Command-first reference for ellmer 0.5.0 | ✅ Complete |
| 11 | [Local LLMs & Agents](AI/04_Local_LLMs_and_Agents.md) | Ollama, ragnar RAG, mcptools MCP, agents, guardrails | ✅ Complete |

---

## 🚀 Quick Start - **Use `uvr` for R Project Setup**

**`uvr` is the recommended way to set up R projects** - it's an extremely fast R package installer and resolver, written in Rust.

**Official URL:** https://nbafrank.github.io/uvr/

```bash
# 1. Install uvr (once per machine)
# Linux/macOS:
curl -LsSf https://nbafrank.github.io/uvr/install.sh | sh
# Windows:
powershell -c "irm https://nbafrank.github.io/uvr/install.ps1 | iex"

# 2. Create project with uvr (recommended)
uvr init my_project
cd my_project

# 3. Create renv environment & install packages (fast!)
uvr renv init
uvr renv install renv renv::install

# Or use uvr for everything (renv + install in one)
uvr renv init && uvr renv install renv renv::install

# 5. Start coding!
R -e "library(tidyverse); library(tidymodels); print('Ready!')"

# Alternative: Use uvr run for one-off commands without activating renv
uvr run Rscript script.R
```

**Why uvr?**
- 🚀 **Fast** - Written in Rust, parallel downloads, caching
- 🔒 **Reproducible** - Lockfile (`renv.lock`) for reproducible builds
- 📦 **Unified tool** - renv + pak + pak's dependency resolution
- 🔒 **Secure** - Verifies hashes, supports lockfile
- 📦 **Cache** - Global package cache, no re-downloads

### Quick Reference

| Task | Note Section |
|------|--------------|
| Set up R project with renv | [Best Practices](Best Practices/01_Best_Practices.md#21-project-setup-with-renv) |
| Modern R syntax (pipes, functions) | [Best Practices](Best Practices/01_Best_Practices.md#3-modern-r-syntax--patterns) |
| Data manipulation (dplyr, tidyr) | [Tidyverse](tidyverse/01_tidyverse_Overview.md#21-dplyr---data-manipulation-grammar) |
| Data import/export (readr, vroom) | [Tidyverse](tidyverse/01_tidyverse_Overview.md#23-readr---data-import) |
| Functional programming (purrr) | [Tidyverse](tidyverse/01_tidyverse_Overview.md#24-purrr---functional-programming) |
| Factor handling (forcats) | [Tidyverse](tidyverse/01_tidyverse_Overview.md#27-forcats---factor-handling) |
| ML pipelines (tidymodels) | [Tidymodels](tidymodels/01_tidymodels_Overview.md) |
| Preprocessing (recipes) | [Tidymodels](tidymodels/01_tidymodels_Overview.md#2-recipes---preprocessing) |
| Hyperparameter tuning (tune) | [Tidymodels](tidymodels/01_tidymodels_Overview.md#4-tune---hyperparameter-tuning) |
| Model evaluation (yardstick) | [Tidymodels](tidymodels/01_tidymodels_Overview.md#5-yardstick---model-evaluation) |
| Basic ggplot2 plots | [ggplot2 Tutorial](ggplot2/01_ggplot2_Tutorial.md#3-building-your-first-plot) |
| Axis customization | [ggplot2 Tutorial](ggplot2/01_ggplot2_Tutorial.md#5-working-with-axes) |
| Legend customization | [ggplot2 Tutorial](ggplot2/01_ggplot2_Tutorial.md#7-working-with-legends) |
| Themes & styling | [ggplot2 Tutorial](ggplot2/01_ggplot2_Tutorial.md#12-working-with-themes) |
| Color palettes | [ggplot2 Tutorial](ggplot2/01_ggplot2_Tutorial.md#11-working-with-colors) |
| Faceting & multi-panel | [ggplot2 Tutorial](ggplot2/01_ggplot2_Tutorial.md#10-working-with-multi-panel-plots) |
| Saving plots | [ggplot2 Tutorial](ggplot2/01_ggplot2_Tutorial.md#18-saving--exporting) |
| Python interop (reticulate) | [reticulate Tutorial](reticulate/01_reticulate_Tutorial.md) |
| Python environment setup | [reticulate Tutorial](reticulate/01_reticulate_Tutorial.md#3-managing-python-environments) |
| R ↔ Python type conversion | [reticulate Tutorial](reticulate/01_reticulate_Tutorial.md#6-type-conversion) |
| Python in R Markdown/Quarto | [reticulate Tutorial](reticulate/01_reticulate_Tutorial.md#9-r-markdown-and-quarto) |
| reticulate commands | [reticulate Cheatsheet](reticulate/02_reticulate_Cheatsheet.md) |
| AI packages compared | [AI with R Overview](AI/01_AI_with_R_Overview.md#2-the-package-landscape) |
| First ellmer chat | [ellmer Tutorial](AI/02_ellmer_Tutorial.md#3-your-first-conversation) |
| Prompt design | [ellmer Tutorial](AI/02_ellmer_Tutorial.md#5-system-prompts-and-prompt-design) |
| Streaming responses | [ellmer Tutorial](AI/02_ellmer_Tutorial.md#7-streaming) |
| Extract structured data | [ellmer Tutorial](AI/02_ellmer_Tutorial.md#9-structured-data) |
| Call R functions as tools | [ellmer Tutorial](AI/02_ellmer_Tutorial.md#10-tools-function-calling) |
| Run many prompts in parallel | [ellmer Tutorial](AI/02_ellmer_Tutorial.md#11-parallel-and-batch-chats) |
| Build a Shiny chatbot | [ellmer Tutorial](AI/02_ellmer_Tutorial.md#13-shiny-and-shinychat) |
| Local models (Ollama) | [Local LLMs](AI/04_Local_LLMs_and_Agents.md#2-ollama) |
| RAG over documents | [Local LLMs](AI/04_Local_LLMs_and_Agents.md#4-rag-with-ragnar) |
| MCP tools | [Local LLMs](AI/04_Local_LLMs_and_Agents.md#5-mcp-with-mcptools) |
| ellmer commands | [ellmer Cheatsheet](AI/03_ellmer_Cheatsheet.md) |
| Free R books | [Free R Books](09_Free_R_Books.md) |

---

## 📚 External Resources

### Official Documentation
- [R for Data Science (2nd ed.)](https://r4ds.hadley.nz/) - Free online book
- [Tidyverse website](https://www.tidyverse.org/)
- [ggplot2 Reference](https://ggplot2.tidyverse.org/reference/)
- [Tidymodels website](https://www.tidymodels.org/)
- [reticulate documentation](https://rstudio.github.io/reticulate/) - R ↔ Python bridge
- [ellmer documentation](https://ellmer.tidyverse.org/) - LLMs from R
- [ragnar documentation](https://ragnar.tidyverse.org/) - Retrieval-augmented generation
- [vitals documentation](https://vitals.tidyverse.org/) - LLM evaluation
- [shinychat documentation](https://posit-dev.github.io/shinychat/r/) - Shiny chat UI
- [mcptools documentation](https://posit-dev.github.io/mcptools/) - Model Context Protocol in R

### Tutorials & Guides
- [Cedric Scherer's ggplot2 Tutorial](https://www.cedricscherer.com/2019/08/05/a-ggplot2-tutorial-for-beautiful-plotting-in-r/) - The tutorial integrated into our ggplot2 notes
- [R Graph Gallery](https://r-graph-gallery.com/)
- [Tidyverse Style Guide](https://style.tidyverse.org/)
- [Free R Books](09_Free_R_Books.md) - Curated list of 165 free R books (HTML-first)

### Key Packages Quick Reference

| Domain | Packages |
|--------|----------|
| **Core Tidyverse** | dplyr, tidyr, readr, purrr, tibble, stringr, forcats |
| **Data I/O** | vroom, arrow, duckdb, data.table |
| **Visualization** | ggplot2, patchwork, ggrepel, gghighlight, ggh4x, ggtext, ggdist |
| **Modeling** | tidymodels, parsnip, recipes, rsample, tune, yardstick, dials |
| **ML Algorithms** | xgboost, lightgbm, ranger, brulee |
| **AI / LLMs** | ellmer, tidyllm, ragnar, vitals, shinychat, mcptools |
| **Utilities** | janitor, skimr, visdat, naniar, inspectdf, correlation, performance |

---

*Last updated: 2026-11-05*