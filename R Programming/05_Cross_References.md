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

### Key Tutorials
| Tutorial | Source |
|----------|--------|
| ggplot2 Tutorial | Cedric Scherer |
| Tidy Modeling with R | Kuhn & Wickham |
| R for Data Science | Wickham & Grolemund |
| Tidy Modeling with R | Kuhn & Silge |

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

---

## 🏷️ Tag-Based Navigation

### By Skill Level
| Level | Notes |
|-------|-------|
| **Beginner** | Best Practices → Tidyverse Overview → ggplot2 Tutorial |
| **Intermediate** | Tidyverse Cheatsheet → Tidymodels Overview → ML Cheatsheet |
| **Advanced** | Tidymodels Cheatsheet → ML Cheatsheet → Advanced Stats → MLOps |

### By Domain
| Domain | Notes |
|--------|-------|
| **Data Wrangling** | tidyverse Overview + Cheatsheet |
| **Visualization** | ggplot2 Tutorial + Cheatsheet |
| **EDA** | EDA Cheatsheet |
| **Time Series** | Time Series Cheatsheet |
| **ML** | Tidymodels + ML Cheatsheet |
| **Stats** | Advanced Stats Cheatsheet |
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
- [Link](url) - Description
```

---

*Last updated: 2024-11-04*
*Part of: Data Science Second Brain*