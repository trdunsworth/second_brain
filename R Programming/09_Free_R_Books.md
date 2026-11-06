# Free R Books — A Linked Reading List

> A curated, link-checked list of **free books about R** that can be read online in **HTML**. Each entry gives the title, author(s), a direct link, the available format, a rough level, and a short synopsis.
>
> **Last link check: 2026-11-05.** All links were checked; a few sites block automated requests but open normally in a browser. Books that are only legally free as PDFs are collected separately in [Appendix A](#appendix-a-free-but-pdf-first-classics), so the main list stays HTML-first.

---

## How to Use This List

- **`HTML`** — free full text readable in a browser (the main focus of this note).
- **`HTML + PDF`** — free HTML edition plus a downloadable PDF.
- **`PDF`** — free PDF only; these are mostly in Appendix A.
- **Level** is a rough guide: *Beginner*, *Intermediate*, or *Advanced*.
- Links point to the **author's or publisher's free edition**, not to pirated copies.
- If a book has a paid print edition, the free online edition is still the one linked here.

### Quick Picks by Goal

| Goal | Start with | Then read |
|------|------------|-----------|
| Learn R from zero | [1.1 R for Data Science](#11-r-for-data-science-2nd-edition) | [1.2 Hands-On Programming with R](#12-hands-on-programming-with-r) |
| Already program in another language | [2.1 Advanced R](#21-advanced-r-2nd-edition) | [2.6 The Tidynomicon](#26-the-tidynomicon) |
| Tidy data wrangling | [1.1 R for Data Science](#11-r-for-data-science-2nd-edition) | [3.1 Tidyverse Cookbook](#31-tidyverse-cookbook) |
| Beautiful graphics | [4.1 ggplot2: Elegant Graphics](#41-ggplot2-elegant-graphics-for-data-analysis-3rd-edition) | [4.3 Fundamentals of Data Visualization](#43-fundamentals-of-data-visualization) |
| Statistics foundations | [5.1 Learning Statistics with R](#51-learning-statistics-with-r) | [A.1 An Introduction to Statistical Learning](#a1-an-introduction-to-statistical-learning) |
| Bayesian analysis | [6.1 Bayes Rules!](#61-bayes-rules) | [6.4 Statistical Rethinking with brms](#64-statistical-rethinking-with-brms-and-the-tidyverse) |
| Machine learning | [7.1 Tidy Modeling with R](#71-tidy-modeling-with-r) | [7.5 Hands-On Machine Learning with R](#75-hands-on-machine-learning-with-r) |
| Time series / forecasting | [8.1 Forecasting: Principles and Practice](#81-forecasting-principles-and-practice-3rd-edition) | [8.4 Applied Time Series Analysis](#84-applied-time-series-analysis-for-fisheries-and-environmental-sciences) |
| Causal inference / economics | [9.1 Causal Inference: The Mixtape](#91-causal-inference-the-mixtape) | [9.2 Causal Inference in R](#92-causal-inference-in-r) |
| Text analysis | [10.1 Text Mining with R](#101-text-mining-with-r) | [10.2 Supervised Machine Learning for Text](#102-supervised-machine-learning-for-text-analysis-in-r) |
| Maps and spatial data | [11.1 Geocomputation with R](#111-geocomputation-with-r) | [11.2 Spatial Data Science](#112-spatial-data-science) |
| Shiny apps | [12.1 Mastering Shiny](#121-mastering-shiny) | [12.2 Engineering Production-Grade Shiny Apps](#122-engineering-production-grade-shiny-apps) |
| Reports and reproducible documents | [13.1 Quarto: The Practical Guide](#131-quarto-the-practical-guide) | [13.3 R Markdown: The Definitive Guide](#133-r-markdown-the-definitive-guide) |
| Build an R package | [2.3 R Packages](#23-r-packages-2nd-edition) | [2.15 rOpenSci Packages](#215-ropensci-packages-development-maintenance-and-peer-review) |
| Health / epidemiology | [14.1 R for Health Data Science](#141-r-for-health-data-science) | [14.2 The Epidemiologist R Handbook](#142-the-epidemiologist-r-handbook) |

### Contents

1. [Start Here: Beginner Introductions](#1-start-here-beginner-introductions)
2. [Core Language, Advanced R & Workflow](#2-core-language-advanced-r--workflow)
3. [Data Science & the Tidyverse](#3-data-science--the-tidyverse)
4. [Data Visualization](#4-data-visualization)
5. [Statistics & Modeling](#5-statistics--modeling)
6. [Bayesian Analysis](#6-bayesian-analysis)
7. [Machine Learning & AI](#7-machine-learning--ai)
8. [Time Series & Forecasting](#8-time-series--forecasting)
9. [Causal Inference, Economics & Finance](#9-causal-inference-economics--finance)
10. [Text Analysis & NLP](#10-text-analysis--nlp)
11. [Geospatial Data](#11-geospatial-data)
12. [Shiny & Web Applications](#12-shiny--web-applications)
13. [Reporting, Reproducibility & Automation](#13-reporting-reproducibility--automation)
14. [Domain-Specific Books](#14-domain-specific-books)
15. [Official R Manuals & Reference](#15-official-r-manuals--reference)
- [Appendix A: Free but PDF-First Classics](#appendix-a-free-but-pdf-first-classics)
- [Appendix B: Where to Find More Free R Books](#appendix-b-where-to-find-more-free-r-books)

---

## 1. Start Here: Beginner Introductions

### 1.1 R for Data Science (2nd edition)
**Hadley Wickham, Mine Çetinkaya-Rundel & Garrett Grolemund** · [Read online](https://r4ds.hadley.nz/) · `HTML` · Beginner
The canonical modern introduction to doing data science with R. It walks through importing, tidying, transforming, visualising, and communicating data with the tidyverse, then moves into modelling and iteration. If you read only one R book, read this one.

### 1.2 Hands-On Programming with R
**Garrett Grolemund** · [Read online](https://rstudio-education.github.io/hopr/) · `HTML` · Beginner
A friendly, project-based introduction written for non-programmers. You build a dice simulator, a card game, and a slot machine while learning R objects, functions, environments, loops, and debugging.

### 1.3 An Introduction to R
**Alex Douglas, Deon Roos, Francesca Mancini, Ana Couto & David Lusseau** · [Read online](https://intro2r.com/) · `HTML` · Beginner
A gentle, modern introductory text aimed at getting new users over the initial learning curve. It covers the RStudio interface, data structures, importing data, tidyverse-style manipulation, and basic plotting without assuming a statistics background.

### 1.4 R Programming for Data Science
**Roger D. Peng** · [Read online](https://bookdown.org/rdpeng/rprogdatascience/) · `HTML` · Beginner
A concise introduction to the programming side of R: data types, subsetting, functions, scoping, debugging, simulation, and performance. It is less about statistics and more about becoming fluent in the language.

### 1.5 Data Science: A First Introduction
**Tiffany Timbers, Trevor Campbell & Melissa Lee** · [Read online](https://datasciencebook.ca/) · `HTML` · Beginner
An open textbook from the University of British Columbia that teaches data science through reproducible analysis. It integrates R, the tidyverse, version control, and communication from the very first chapter.

### 1.6 Introduction to Data Science
**Rafael A. Irizarry** · [Read online](https://rafalab.github.io/dsbook/) · `HTML` · Beginner–Intermediate
A broad, practical data-science course built around R. It covers R programming, data wrangling with dplyr, ggplot2, probability, inference, regression, and machine learning, with many real datasets and case studies.

### 1.7 Statistical Inference via Data Science: A ModernDive into R and the Tidyverse
**Chester Ismay & Albert Y. Kim** · [Read online](https://moderndive.com/) · `HTML` · Beginner
A very accessible bridge from data wrangling to statistical inference. It uses the tidyverse throughout and emphasises simulation-based and resampling approaches before introducing traditional theory.

### 1.8 R Cookbook (2nd edition)
**JD Long & Paul Teetor** · [Read online](https://rc2e.com/) · `HTML` · Beginner–Intermediate
A task-oriented collection of recipes for common R problems: vectors, data frames, strings, dates, factors, statistics, graphics, and I/O. Ideal for looking up "how do I do X in R?" without reading a linear tutorial.

### 1.9 Cookbook for R
**Winston Chang** · [Read online](http://www.cookbook-r.com/) · `HTML` · Beginner–Intermediate
A classic recipe site covering data manipulation, graphics, statistical analysis, and troubleshooting. It is especially strong on base R graphics and on explaining common error messages.

### 1.10 YaRrr! The Pirate's Guide to R
**Nathaniel D. Phillips** · [Read online](https://bookdown.org/ndphillips/YaRrr/) · `HTML` · Beginner
A playful, example-driven introduction to R written in pirate-speak. Beneath the jokes is a solid tour of vectors, data frames, plotting, functions, loops, and basic statistics.

### 1.11 Deep R Programming
**Marek Gagolewski** · [Read online](https://deepr.gagolewski.com/) · `HTML + PDF` · Intermediate
A rigorous and comprehensive modern introduction to R as a programming language for data science. It covers data types, vectorised computation, functional programming, object systems, performance, and reproducibility in unusual depth.

### 1.12 A Sufficient Introduction to R
**Derek L. Sonderegger** · [Read online](https://dereksonderegger.github.io/570L/) · `HTML` · Beginner
A course-style introduction that deliberately slows down to explain foundational details rather than only showing copy-and-paste code. Good for learners who want to understand why R behaves the way it does.

### 1.13 R for Excel Users
**Julie Lowndes & Allison Horst** · [Read online](https://rstudio-conf-2020.github.io/r-for-excel/) · `HTML` · Beginner
A friendly bridge for spreadsheet users moving to R. It introduces RStudio, the tidyverse, R Markdown, GitHub, and reproducible project workflows using examples that map onto familiar Excel tasks.

### 1.14 R for Graduate Students
**Y. Wendy Huynh** · [Read online](https://bookdown.org/yih_huynh/Guide-to-R-Book/) · `HTML` · Beginner
A practical, assignment-driven guide written for graduate students in the behavioural sciences. It focuses on the R skills needed for real research projects rather than a complete tour of the language.

---

## 2. Core Language, Advanced R & Workflow

### 2.1 Advanced R (2nd edition)
**Hadley Wickham** · [Read online](https://adv-r.hadley.nz/) · `HTML` · Advanced
The definitive deep dive into how R works: names and values, vectors, subsetting, functions, environments, condition handling, metaprogramming, object-oriented systems, debugging, and performance. Essential for package authors and anyone who wants to stop being surprised by R.

### 2.2 Advanced R Solutions
**Malte Grosser, Henning Bumann & Hadley Wickham** · [Read online](https://advanced-r-solutions.rbind.io/) · `HTML` · Advanced
Worked solutions to the exercises in *Advanced R* (2nd edition). Useful for self-study and for checking your mental model of R's evaluation and object systems.

### 2.3 R Packages (2nd edition)
**Hadley Wickham & Jennifer Bryan** · [Read online](https://r-pkgs.org/) · `HTML` · Intermediate–Advanced
The standard guide to turning R code into a package. It covers package structure, documentation with roxygen2, testing with testthat, dependencies, vignettes, namespaces, and release workflows.

### 2.4 Efficient R Programming
**Colin Gillespie & Robin Lovelace** · [Read online](https://csgillespie.github.io/efficientR/) · `HTML` · Intermediate
A practical guide to writing R code that is faster to write, faster to run, and easier to scale. Topics include profiling, vectorisation, memory, parallel computing, and project organisation.

### 2.5 The R Inferno
**Patrick Burns** · [Read online](https://www.burns-stat.com/pages/Tutor/R_inferno.pdf) · `PDF` · Intermediate
A short, witty, Dante-inspired catalogue of R's surprises and common mistakes. It is old but still remarkably useful for understanding lazy evaluation, vectorisation, subsetting, and other traps.

### 2.6 The Tidynomicon
**Greg Wilson** · [Read online](https://third-bit.com/tidynomicon/) · `HTML` · Intermediate
A guide to R for experienced programmers coming from Python or other languages. It explains R's unusual conventions — copy-on-modify, lazy evaluation, 1-based indexing, the tidyverse — by comparing them with what you already know.

### 2.7 Modern R with the tidyverse
**Bruno Rodrigues** · [Read online](https://b-rodrigues.github.io/modern_R/) · `HTML` · Beginner–Intermediate
A modern, opinionated introduction that moves from R basics to functional programming, package development, and advanced tidyverse workflows. Good for readers who want a single narrative rather than a reference.

### 2.8 What They Forgot to Teach You About R
**Jennifer Bryan & Jim Hester** · [Read online](https://rstats.wtf/) · `HTML` · Intermediate
A collection of practical habits that make R work less painful: project organisation, file naming, the working directory, debugging, dependency management, and reproducibility. It is the "lifestyle" book that fills gaps left by introductory courses.

### 2.9 Happy Git and GitHub for the useR
**Jennifer Bryan & Jim Hester** · [Read online](https://happygitwithr.com/) · `HTML` · Beginner–Intermediate
The friendliest guide to Git and GitHub for R users. It covers installation, authentication, the RStudio Git pane, pull requests, merge conflicts, and the workflows most common in R projects.

### 2.10 The tidyverse style guide
**Hadley Wickham** · [Read online](https://style.tidyverse.org/) · `HTML` · Beginner–Intermediate
The official style guide for tidyverse code: naming, spacing, pipes, functions, comments, and project layout. Short, practical, and worth skimming early so your code is readable from the start.

### 2.11 Tidyverse design guide
**The tidyverse team** · [Read online](https://design.tidyverse.org/) · `HTML` · Advanced
A guide to designing R APIs and packages in the tidyverse style. It discusses function design, argument names, error messages, vectorisation, and the principles behind consistent interfaces.

### 2.12 Field Guide to the R Ecosystem
**Mark Sellors** · [Read online](https://fg2re.sellorm.com/) · `HTML` · Beginner–Intermediate
A map of the R ecosystem: CRAN, Bioconductor, GitHub, RStudio/Posit, package types, documentation, and community resources. Useful for understanding how the pieces fit together rather than learning syntax.

### 2.13 Functional Programming
**Sara Altman, Bill Behrman & Hadley Wickham** · [Read online](https://dcl-prog.stanford.edu/) · `HTML` · Intermediate
A practical introduction to functional programming with the tidyverse, based on a Stanford course. It covers writing functions, mapping, purrr, list-columns, and reproducible workflows.

### 2.14 Rcpp for Everyone
**Masaki E. Tsuda** · [Read online](https://teuder.github.io/rcpp4everyone_en/) · `HTML` · Intermediate–Advanced
An accessible introduction to Rcpp for R users who do not know C++. It explains how to write fast C++ functions, handle R objects, use modules, and integrate compiled code into packages.

### 2.15 rOpenSci Packages: Development, Maintenance, and Peer Review
**rOpenSci** · [Read online](https://devguide.ropensci.org/) · `HTML` · Intermediate–Advanced
The rOpenSci guide to building a package that others can use and review: setup, documentation, testing, continuous integration, security, release, and the peer-review process. Pairs well with *R Packages*.

---

## 3. Data Science & the Tidyverse

### 3.1 Tidyverse Cookbook
**Garrett Grolemund (editor) and contributors** · [Read online](https://rstudio-education.github.io/tidyverse-cookbook/) · `HTML` · Beginner–Intermediate
A recipe collection for doing data science with the tidyverse. Each recipe solves one common task with minimal discussion, making it a good companion to *R for Data Science*.

### 3.2 Tidyverse Skills for Data Science
**Carrie Wright, Shannon E. Ellis, Stephanie C. Hicks & Roger D. Peng** · [Read online](https://jhudatascience.org/tidyversecourse/) · `HTML` · Beginner–Intermediate
A course-style book that introduces the tidyverse as a complete data-science workflow: importing, tidying, transforming, visualising, and communicating data. It includes exercises and a reproducible project structure.

### 3.3 R Basics
**Nick Ulle** · [Read online](https://ucdavisdatalab.github.io/workshop_r_basics/) · `HTML` · Beginner
A concise workshop introduction to R for reproducible data analysis. It covers programming basics, tabular data, problem decomposition, and organising code for clarity.

### 3.4 Introduction to Programming with R
**Reto Stauffer, Joanna Chimiak-Opoka, Thorsten Simon & Achim Zeileis** · [Read online](https://eeecon.uibk.ac.at/~discdown/rprogramming/index.html) · `HTML` · Beginner
A base-R-first programming course from the University of Innsbruck. It is deliberately focused on programming concepts rather than the package ecosystem, which makes it a good complement to tidyverse-heavy introductions.

### 3.5 An(other) Introduction to R
**Felix Lennert** · [Read online](https://bookdown.org/f_lennert/introduction-to-r/) · `HTML` · Beginner
A short, gentle introduction to R and data work, inspired by *R for Data Science*. It is useful as a quick refresher or as a first pass before a longer textbook.

### 3.6 Modern Data Science with R
**Benjamin S. Baumer, Daniel T. Kaplan & Nicholas J. Horton** · [Read online](https://mdsr-book.github.io/mdsr2e/) · `HTML` · Beginner–Intermediate
A broad undergraduate data-science textbook built around R. It covers data wrangling, visualisation, databases, regression, classification, text, and spatial data, with an emphasis on thinking with data.

### 3.7 Modern Statistics with R
**Måns Thulin** · [Read online](http://www.modernstatisticswithr.com/) · `HTML` · Beginner–Intermediate
A modern statistics textbook that teaches R and statistical reasoning together. It emphasises simulation, permutation tests, the bootstrap, Bayesian methods, regression, and predictive modelling, with many worked exercises.

### 3.8 Introduction to Data Science
**Hansjörg Neth** · [Read online](https://bookdown.org/hneth/i2ds/) · `HTML` · Beginner
A conceptual introduction to data science for students with little background. It focuses on data structures, cleaning, transformation, summary, and visualisation, with R as the computational companion.

### 3.9 Exploratory Data Analysis with R
**Roger D. Peng** · [Read online](https://bookdown.org/rdpeng/exdata/) · `HTML` · Beginner–Intermediate
A concise guide to exploring data graphically and numerically in R. It covers plotting systems, summarisation, dimensions, clustering, and the role of EDA in the analytical process.

### 3.10 edav.info
**Zach Bogart & Joyce Robbins** · [Read online](https://edav.info/) · `HTML` · Beginner
A curated collection of tools and references for working with data in R. It includes chart types, walkthroughs, and practical tips, and is designed to be dipped into rather than read linearly.

### 3.11 An Introduction to Data Analysis
**Michael Franke** · [Read online](https://michael-franke.github.io/intro-data-analysis/) · `HTML` · Beginner–Intermediate
An introduction to data analysis that uses R for wrangling, plotting, and modelling. It then introduces both Bayesian and frequentist approaches, making it a good bridge from coding to statistical inference.

### 3.12 Another Book on Data Science: Learn R and Python in Parallel
**Nailong Zhang** · [Read online](https://www.anotherbookondatascience.com/) · `HTML` · Intermediate
A side-by-side comparison of R and Python for data science. It is especially useful for readers who already know one language and want to translate concepts and code into the other.

### 3.13 R for Data Analysis
**Trevor French** · [Read online](https://trevorfrench.github.io/R-for-Data-Analysis/) · `HTML` · Beginner
A practical introduction that starts with setting up R and moves through data manipulation, visualisation, regression, and automated reporting. It is aimed at readers who want an applied, project-oriented path.

### 3.14 Yet Again: R + Data Science
**Albert Rapp** · [Read online](https://yards.albert-rapp.de/) · `HTML` · Beginner–Intermediate
A modern course-style book covering R, the tidyverse, visualisation, and data-science workflows, with accompanying video lectures. It is a good alternative if you prefer a lecture-like progression.

### 3.15 R for Data Science Solutions
**Jeffrey B. Arnold** · [Read online](https://jrnold.github.io/r4ds-exercise-solutions/) · `HTML` · Beginner
Worked solutions to the exercises in the first edition of *R for Data Science*. Useful for self-study, especially when you want to compare your approach with a more experienced one.

---

## 4. Data Visualization

### 4.1 ggplot2: Elegant Graphics for Data Analysis (3rd edition)
**Hadley Wickham, Danielle Navarro & Thomas Lin Pedersen** · [Read online](https://ggplot2-book.org/) · `HTML` · Beginner–Intermediate
The authoritative guide to ggplot2 and the grammar of graphics. It explains the layered grammar, scales, coordinates, facets, themes, and extensions, and is the natural next step after the visualisation chapters of *R for Data Science*.

### 4.2 R Graphics Cookbook (2nd edition)
**Winston Chang** · [Read online](https://r-graphics.org/) · `HTML` · Beginner–Intermediate
A large collection of ready-to-run recipes for ggplot2 and base R graphics. It is organised by task — bar charts, lines, distributions, annotations, legends, facets, colours — so it works well as a reference.

### 4.3 Fundamentals of Data Visualization
**Claus O. Wilke** · [Read online](https://clauswilke.com/dataviz/) · `HTML` · Beginner–Intermediate
A visual-design book rather than an R manual. It explains how to choose chart types, use colour and axes well, and avoid misleading graphics, with examples mostly made in ggplot2. Read it to improve your judgement, not just your code.

### 4.4 Data Visualization: A Practical Introduction
**Kieran Healy** · [Read online](https://socviz.co/) · `HTML` · Beginner–Intermediate
A hands-on introduction to making graphs with R and ggplot2, aimed at social scientists. It combines design principles with reproducible code and real datasets, and is especially good on effective communication.

### 4.5 Data Visualization with R
**Robert Kabacoff** · [Read online](https://rkabacoff.github.io/datavis/) · `HTML` · Beginner–Intermediate
A practical guide to creating everything from quick exploratory plots to publication-ready graphics. It leans on ggplot2 but also covers other approaches, and includes many complete examples.

### 4.6 ggplot2 Extended
**Antti Rask** · [Read online](https://ggplot2-extended-book.com/) · `HTML` · Intermediate
A guide to the wider ggplot2 ecosystem. It helps you choose among the many extension packages and shows how to use them for annotations, layouts, scales, themes, and specialised chart types.

### 4.7 The Art of Data Visualization with ggplot2
**Nicola Rennie** · [Read online](https://nrennie.rbind.io/art-of-viz/) · `HTML` · Intermediate
A creative, process-oriented book that walks through TidyTuesday visualisations from exploration and sketching to the final polished plot. It is excellent for learning iterative design and styling decisions.

### 4.8 BBC Visual and Data Journalism Cookbook for R Graphics
**BBC Visual and Data Journalism team** · [Read online](https://bbc.github.io/rcookbook/) · `HTML` · Intermediate
A cookbook for producing publication-quality graphics in the BBC's in-house style. It is a great source of ideas for annotation, typography, layout, and consistent editorial design with ggplot2.

### 4.9 Solutions to ggplot2: Elegant Graphics for Data Analysis
**Howard Baek** · [Read online](https://ggplot2-book-solutions-3ed.netlify.app/) · `HTML` · Beginner–Intermediate
Worked solutions to the exercises in the third edition of the ggplot2 book. Useful for checking your understanding and for seeing alternative ways to build the same graphic.

### 4.10 Data Visualisation Using R, for Researchers Who Don't Use R
**Emily Nordmann, Phil McAleer, Wilhelmiina Toivo, Helena Paterson & Lisa DeBruine** · [Read online](https://psyteachr.github.io/introdataviz/) · `HTML` · Beginner
A practical introduction to ggplot2 written for researchers who normally use point-and-click software. It starts with the grammar of graphics and builds up to publication-ready figures.

### 4.11 Interactive Web-Based Data Visualization with R, plotly, and shiny
**Carson Sievert** · [Read online](https://plotly-r.com/) · `HTML` · Intermediate
A comprehensive guide to interactive graphics with plotly in R. It covers the plotly interface, linking views, animation, shiny integration, and the principles behind effective interactive visualisation.

---

## 5. Statistics & Modeling

### 5.1 Learning Statistics with R
**Danielle Navarro** · [Read online](https://learningstatisticswithr.com/) · `HTML + PDF` · Beginner
A friendly introductory statistics textbook that teaches both the concepts and their implementation in R. It is written for psychology students but is widely used well beyond that field, and it explains the logic behind tests rather than only the mechanics.

### 5.2 Answering Questions with Data
**Matthew J. Crump** · [Read online](https://www.crumplab.com/statistics/) · `HTML` · Beginner
A free introductory statistics textbook for undergraduates, with a strong emphasis on simulation, visualisation, and understanding what the numbers mean. It is part of a larger open educational resource package.

### 5.3 Statistical Thinking for the 21st Century
**Russell A. Poldrack** · [Read online](https://statsthinking21.github.io/statsthinking21-core-site/) · `HTML` · Beginner–Intermediate
A modern statistics textbook that emphasises simulation, resampling, and Bayesian ideas alongside traditional methods. An R companion site provides code for every chapter.

### 5.4 Introduction to Modern Statistics
**Mine Çetinkaya-Rundel & Johanna Hardin** · [Read online](https://openintro-ims.netlify.app/) · `HTML` · Beginner–Intermediate
A modern, open introductory statistics textbook. It covers exploratory data analysis, inference, regression, and multiple regression with a strong emphasis on real data and reproducible analysis in R.

### 5.5 Applied Statistics with R
**David Dalpiaz** · [Read online](https://book.stat420.org/) · `HTML` · Intermediate
Course notes for an applied regression course at the University of Illinois. It covers linear regression, model diagnostics, transformations, and variable selection with a practical, code-first approach.

### 5.6 Beyond Multiple Linear Regression
**Paul Roback & Julie Legler** · [Read online](https://bookdown.org/roback/bookdown-BeyondMLR/) · `HTML` · Intermediate
An applied introduction to generalised linear models and multilevel models in R. It covers logistic and Poisson regression, zero-inflated models, bootstrapping, and correlated data, with real case studies and exercises.

### 5.7 Regression and Other Stories
**Andrew Gelman, Jennifer Hill & Aki Vehtari** · [Read online](https://avehtari.github.io/ROS-Examples/) · `HTML + PDF` · Intermediate
A practical book about using regression to solve real problems of comparison, estimation, prediction, and causal inference. The free online materials include examples and code; the book itself is free for personal use as a PDF.

### 5.8 Marginal Effects Zoo / Model to Meaning
**Vincent Arel-Bundock** · [Read online](https://marginaleffects.com/) · `HTML` · Intermediate
A book-length guide to interpreting statistical models with the marginaleffects package. It covers experiments, observational data, causal inference, machine learning, Bayesian models, multilevel models, and missing data.

### 5.9 Mixed Models with R: Getting Started with Random Effects
**Michael Clark** · [Read online](https://m-clark.github.io/mixed-models-with-R/) · `HTML` · Intermediate
A clear, applied introduction to mixed-effects models for clustered and longitudinal data. It explains when and why to use random effects and demonstrates the main R packages.

### 5.10 Model Estimation by Example
**Michael Clark** · [Read online](https://m-clark.github.io/models-by-example/) · `HTML` · Intermediate–Advanced
"By-hand" demonstrations of many statistical and machine-learning models in R. The goal is to demystify algorithms by showing clean, runnable code alongside the standard package implementations.

### 5.11 Probability, Statistics, and Data: A Fresh Approach Using R
**Darrin Speegle & Bryan Clair** · [Read online](https://probstatsdata.com/) · `HTML` · Intermediate
A calculus-based introduction to probability and statistics that integrates simulation, data wrangling, and visualisation in R. It is designed to teach probability and statistics together in one course.

### 5.12 A Little Book of R for Multivariate Analysis
**Avril Coghlan** · [Read online](https://little-book-of-r-for-multivariate-analysis.readthedocs.io) · `HTML` · Beginner–Intermediate
A short, gentle introduction to multivariate analysis with R. It covers principal components, factor analysis, multidimensional scaling, and clustering using simple examples.

### 5.13 Introduction to Regression Analysis in R
**Kayleigh Keller** · [Read online](https://www.kellerbiostat.com/introregression/) · `HTML` · Beginner–Intermediate
Course notes for an introductory regression course at Colorado State University. It emphasises applying regression methods and interpreting results, with R used throughout.

### 5.14 Analysing Data Using Linear Models
**Stéphanie M. van den Berg** · [Read online](https://bookdown.org/pingapang9/linear_models_bookdown/) · `HTML` · Beginner–Intermediate
A practical introduction to linear models for students in the social, behavioural, and management sciences. It covers regression, ANOVA, mixed models, and generalised linear models, with an emphasis on interpretation and reporting.

### 5.15 Common Statistical Tests Are Linear Models
**Steve Doogue (after Jonas Lindeløv)** · [Read online](https://steverxd.github.io/Stat_tests/) · `HTML` · Intermediate
A worked-through explanation of how t-tests, ANOVA, chi-squared tests, and many non-parametric tests can be understood as special cases of linear models. It is excellent for unifying your statistical intuition.

### 5.16 The Grammar of Experimental Designs
**Emi Tanaka** · [Read online](https://emitanaka.org/edibble-book/) · `HTML` · Intermediate
A book about designing experiments using the edibble package and the grammar of experimental designs. It is useful for anyone who needs to reason carefully about randomisation, blocking, and treatment structure.

### 5.17 Spatio-Temporal Statistics with R
**Christopher K. Wikle, Andrew Zammit-Mangion & Noel Cressie** · [Read online](https://spacetimewithr.org/) · `HTML` · Advanced
An accessible introduction to spatio-temporal statistical modelling, with R labs at the end of each chapter. It covers descriptive methods, dynamic models, spatial processes, and modern computational approaches.

### 5.18 Surrogates: Gaussian Process Modeling, Design and Optimization
**Robert B. Gramacy** · [Read online](https://bookdown.org/rbg/surrogates/) · `HTML` · Advanced
A graduate-level book on Gaussian-process surrogates and computer experiments. It connects machine learning, spatial statistics, design of experiments, and optimisation, with code and examples in R.

### 5.19 Doing Meta-Analysis with R: A Hands-On Guide
**Mathias Harrer, Pim Cuijpers, Toshi A. Furukawa & David D. Ebert** · [Read online](https://bookdown.org/MathiasHarrer/Doing_Meta_Analysis_in_R/) · `HTML` · Intermediate
A practical guide to conducting meta-analyses in R. It covers effect sizes, pooling, forest plots, heterogeneity, subgroup analysis, meta-regression, publication bias, and network meta-analysis.

---

## 6. Bayesian Analysis

### 6.1 Bayes Rules!
**Alicia A. Johnson, Miles Ott & Mine Dogucu** · [Read online](https://www.bayesrulesbook.com/) · `HTML` · Beginner–Intermediate
An accessible, applied introduction to Bayesian thinking and modelling. It uses modern computing and reproducible workflows, and balances conceptual explanation with hands-on data analysis.

### 6.2 Introduction to Bayesian Reasoning and Methods
**Kevin Ross** · [Read online](https://bookdown.org/kevin_davisross/bayesian-reasoning-and-methods/) · `HTML` · Beginner–Intermediate
A course-style introduction to Bayesian inference. It covers priors, likelihoods, posterior distributions, credible intervals, and model comparison, with comparisons to frequentist methods.

### 6.3 Probability and Bayesian Modeling
**Jim Albert & Jingchen Hu** · [Read online](https://bayesball.github.io/BOOK/probability-a-measurement-of-uncertainty.html) · `HTML` · Beginner–Intermediate
An undergraduate introduction to probability and Bayesian modelling. It comes with the ProbBayes R package and emphasises simulation and computation rather than formal derivations.

### 6.4 Statistical Rethinking with brms and the tidyverse
**A. Solomon Kurz** · [Read online](https://solomon.quarto.pub/sr2/) · `HTML` · Intermediate–Advanced
A free companion that reworks Richard McElreath's *Statistical Rethinking* using brms, ggplot2, and the tidyverse. It is useful if you want the conceptual depth of *Statistical Rethinking* with a more accessible R workflow.

### 6.5 An Introduction to Bayesian Data Analysis for Cognitive Science
**Bruno Nicenboim, Daniel Schad & Shravan Vasishth** · [Read online](https://vasishth.github.io/bayescogsci/book/) · `HTML` · Advanced
A Bayesian data-analysis textbook aimed at cognitive scientists. It uses Stan and brms and covers regression, hierarchical models, model comparison, and workflow, with realistic linguistic and psychological examples.

### 6.6 Applied Longitudinal Data Analysis in brms and the tidyverse
**A. Solomon Kurz** · [Read online](https://solomon.quarto.pub/alda/) · `HTML` · Advanced
A translation of Singer and Willett's classic *Applied Longitudinal Data Analysis* into brms and the tidyverse. It covers change over time, multilevel growth models, and event-occurrence models.

### 6.7 Doing Bayesian Data Analysis in brms and the tidyverse
**A. Solomon Kurz** · [Read online](https://solomon.quarto.pub/dbda2/) · `HTML` · Advanced
A brms/tidyverse translation of Kruschke's *Doing Bayesian Data Analysis*. It preserves the applied, example-driven spirit while using modern R tooling.

---

## 7. Machine Learning & AI

### 7.1 Tidy Modeling with R
**Max Kuhn & Julia Silge** · [Read online](https://www.tmwr.org/) · `HTML` · Intermediate
The definitive guide to tidymodels. It covers data splitting, feature engineering with recipes, model specification with parsnip, resampling, tuning, evaluation, and workflow sets, all with a strong emphasis on good statistical practice.

### 7.2 Feature Engineering and Selection
**Max Kuhn & Kjell Johnson** · [Read online](https://bookdown.org/max/FES/) · `HTML` · Intermediate
A practical guide to representing predictors and selecting features for predictive models. It covers transformations, encoding, imputation, dimension reduction, and selection methods in the context of a sound modelling process.

### 7.3 Applied Machine Learning for Tabular Data
**Max Kuhn & Kjell Johnson** · [Read online](https://aml4td.org/) · `HTML` · Intermediate
A practical, holistic guide to building quality predictive models from tabular data. It tightly couples feature engineering with model development and gives unusual attention to post-modelling activities.

### 7.4 Feature Engineering A-Z
**Emil Hvitfeldt** · [Read online](https://feaz-book.com/) · `HTML` · Intermediate
A reference-style guide to nearly every feature-engineering method you are likely to encounter. It is designed for dipping into, with explanations and code for each technique.

### 7.5 Hands-On Machine Learning with R
**Bradley Boehmke & Brandon Greenwell** · [Read online](https://bradleyboehmke.github.io/HOML/) · `HTML` · Intermediate
A hands-on tour of common machine-learning methods in R: regularised regression, random forests, gradient boosting, deep neural networks, clustering, autoencoders, and stacking. It focuses on practical implementation and interpretation.

### 7.6 Applied Machine Learning Using mlr3 in R
**Bernd Bischl, Raphael Sonabend, Lars Kotthoff & Michel Lang** · [Read online](https://mlr3book.mlr-org.com/) · `HTML` · Intermediate–Advanced
A comprehensive guide to the mlr3 ecosystem. It covers tasks, learners, resampling, benchmarking, tuning, pipelines, and mlr3pipelines, from simple examples to complex applied problems.

### 7.7 The caret Package
**Max Kuhn** · [Read online](https://topepo.github.io/caret/) · `HTML` · Intermediate
The documentation/book for the caret package, which streamlined predictive modelling in R before tidymodels. It remains useful for maintaining older code and for understanding the design ideas that tidymodels inherited.

### 7.8 Explanatory Model Analysis
**Przemysław Biecek & Tomasz Burzykowski** · [Read online](https://ema.drwhy.ai/) · `HTML` · Intermediate
A guide to explainable and responsible predictive modelling. It covers global and local explanations, variable importance, partial dependence, break-down plots, SHAP, and fairness, with R and Python examples.

### 7.9 Interpretable Machine Learning
**Christoph Molnar** · [Read online](https://christophm.github.io/interpretable-ml-book/) · `HTML` · Intermediate
A model-agnostic guide to making black-box models explainable. It covers interpretability goals, global and local methods, surrogate models, counterfactuals, and fairness, with examples in R and Python.

### 7.10 Deep Learning and Scientific Computing with R torch
**Sigrid Keydana** · [Read online](https://skeydan.github.io/Deep-Learning-and-Scientific-Computing-with-R-torch/) · `HTML` · Advanced
A book about torch, the R interface to PyTorch. It covers tensors, automatic differentiation, neural networks, training loops, and scientific computing, all from R without needing to learn Python.

### 7.11 Efficient Machine Learning with R
**Simon Couch** · [Read online](https://emlwr.org/) · `HTML` · Intermediate
A guide to low-compute predictive modelling with tidymodels. It focuses on reducing training time and memory use without sacrificing predictive performance, which is useful for large data or limited hardware.

### 7.12 Lightweight Machine Learning Classics with R
**Marek Gagolewski** · [Read online](https://lmlcr.gagolewski.com/) · `HTML` · Intermediate–Advanced
An unpretentious tour of fundamental machine-learning algorithms that have stood the test of time. It emphasises understanding and implementing the classics rather than chasing state-of-the-art performance.

### 7.13 The Hitchhiker's Guide to Responsible Machine Learning
**Przemysław Biecek, Anna Kozak & Aleksander Zawada** · [Read online](https://betaandbit.github.io/RML/) · `HTML` · Beginner–Intermediate
A graphic-novel-style introduction to responsible machine learning. It covers model development, explanation, fairness, and validation in an approachable visual format.

### 7.14 Model-Based Clustering, Classification, and Density Estimation Using mclust in R
**Luca Scrucca, Chris Fraley, T. Brendan Murphy & Adrian E. Raftery** · [Read online](https://mclust-org.github.io/mclust-book/) · `HTML` · Advanced
A systematic treatment of Gaussian mixture modelling with the mclust package. It covers clustering, classification, density estimation, model selection, and visualisation.

### 7.15 ISLR Tidymodels Labs
**Emil Hvitfeldt** · [Read online](https://emilhvitfeldt.github.io/ISLR-tidymodels-labs/) · `HTML` · Intermediate
A translation of the labs from *An Introduction to Statistical Learning* into tidymodels. It is a useful bridge if you know the ISLR material but want to use the modern tidymodels workflow.

---

## 8. Time Series & Forecasting

### 8.1 Forecasting: Principles and Practice (3rd edition)
**Rob J. Hyndman & George Athanasopoulos** · [Read online](https://otexts.com/fpp3/) · `HTML` · Intermediate
The standard free textbook on forecasting. It covers exploratory time-series analysis, exponential smoothing, ARIMA, dynamic regression, hierarchical forecasting, and practical evaluation, using the fable and feasts packages.

### 8.2 Forecasting: Principles and Practice (2nd edition)
**Rob J. Hyndman & George Athanasopoulos** · [Read online](https://otexts.com/fpp2/) · `HTML` · Intermediate
The previous edition, built around the forecast package. It remains useful for older codebases and for readers who need the classic forecast workflow rather than the newer tidyverts approach.

### 8.3 A Little Book of R for Time Series
**Avril Coghlan** · [Read online](https://a-little-book-of-r-for-time-series.readthedocs.io) · `HTML` · Beginner
A short, gentle introduction to time-series analysis in R. It covers decomposition, smoothing, ARIMA models, and forecasting with simple examples.

### 8.4 Applied Time Series Analysis for Fisheries and Environmental Sciences
**E. E. Holmes, M. D. Scheuerell & E. J. Ward** · [Read online](https://atsa-es.github.io/atsa-labs/) · `HTML` · Intermediate
Course materials for applied time-series analysis in ecology and environmental science. It covers state-space models, ARIMA, dynamic linear models, and forecasting, with R labs and real ecological data.

### 8.5 Fisheries Catch Forecasting
**Elizabeth Holmes** · [Read online](https://fish-forecast.github.io/Fish-Forecast-Bookdown/index.html) · `HTML` · Intermediate
A focused book on univariate time-series analysis and forecasting for fisheries catch data. It also touches on regression with autocorrelated errors and multivariate autoregressive models.

---

## 9. Causal Inference, Economics & Finance

### 9.1 Causal Inference: The Mixtape
**Scott Cunningham** · [Read online](https://mixtape.scunning.com/) · `HTML` · Intermediate
A highly readable introduction to causal inference for social scientists. It covers experiments, matching, regression discontinuity, difference-in-differences, instrumental variables, and synthetic control, with code in both R and Stata.

### 9.2 Causal Inference in R
**Malcolm Barrett, Lucy D'Agostino McGowan & Travis Gerke** · [Read online](https://www.r-causal.org/) · `HTML` · Intermediate
A practical guide to causal inference with observational data in R. It focuses on study design, estimands, confounding, weighting, matching, and sensitivity analysis, with modern R tooling.

### 9.3 The Effect: An Introduction to Research Design and Causality
**Nick Huntington-Klein** · [Read online](https://theeffectbook.net/) · `HTML` · Beginner–Intermediate
An intuitive introduction to research design and causality. It separates design from estimation, teaching you to think about what you want to learn before worrying about which model to run.

### 9.4 Targeted Learning in R: Causal Data Science with the tlverse Software Ecosystem
**Mark van der Laan, Jeremy Coyle, Nima Hejazi, Ivana Malenica, Rachael Phillips & Alan Hubbard** · [Read online](https://tlverse.org/tlverse-handbook/) · `HTML` · Advanced
A reproducible handbook for applying Targeted Learning with the tlverse ecosystem. It covers causal parameters, targeted maximum likelihood, super learning, and practical estimation workflows.

### 9.5 Introduction to Econometrics with R
**Florian Oswald, Vincent Viers, Jean-Marc Robin, Pierre Villedieu & Gustave Kenedi** · [Read online](https://scpoecon.github.io/ScPoEconometrics) · `HTML` · Intermediate
An undergraduate econometrics course built around R. It covers regression, inference, multiple regression, and causal methods with applied examples and reproducible code.

### 9.6 Using R for Introductory Econometrics
**Florian Heiss** · [Read online](http://urfie.net/) · `HTML` · Beginner–Intermediate
A free R companion to Wooldridge's *Introductory Econometrics*. It translates the textbook's examples into R and explains how to estimate and interpret the models.

### 9.7 Data Science for Economists and Other Animals
**Grant McDermott** · [Read online](https://grantmcdermott.com/ds4e/) · `HTML` · Intermediate
Course materials for a modern data-science toolkit aimed at economics graduate students. It covers R programming, data wrangling, visualisation, regression, and causal inference, with an emphasis on reproducibility and performance.

### 9.8 Principles of Econometrics with R
**Constantin Colonescu** · [Read online](https://bookdown.org/ccolonescu/RPoE4) · `HTML` · Intermediate
An R supplement to the *Principles of Econometrics* textbook. It reproduces the book's examples in R and adds commentary on estimation and interpretation.

### 9.9 Tidy Finance with R
**Christoph Scheuch, Stefan Voigt & Patrick Weiss** · [Read online](https://www.tidy-finance.org/) · `HTML` · Intermediate
A modern, reproducible approach to empirical finance in R. It covers portfolio sorts, factor models, regression analysis, and asset pricing using tidyverse tools and open data.

### 9.10 Machine Learning for Factor Investing
**Guillaume Coqueret & Tony Guida** · [Read online](http://www.mlfactor.com/) · `HTML` · Advanced
A book on applying machine-learning techniques to equity factor investing. It covers data preparation, penalised regressions, tree-based methods, neural networks, and backtesting in R.

### 9.11 Loss Data Analytics
**Actuarial community, edited by Ganapathi Hegde and contributors** · [Read online](https://openacttexts.github.io/Loss-Data-Analytics/) · `HTML` · Advanced
An open actuarial textbook on loss modelling and risk. It covers severity, frequency, aggregate loss models, risk measures, credibility, and simulation, with R examples.

### 9.12 R for Economic Research
**J. Renato Leripio** · [Read online](https://book.rleripio.com/) · `HTML` · Intermediate
An intermediate-level guide to using R for professional economic research. It focuses on practical workflows, data handling, analysis, and reproducible reporting rather than introductory syntax.

---

## 10. Text Analysis & NLP

### 10.1 Text Mining with R
**Julia Silge & David Robinson** · [Read online](https://www.tidytextmining.com/) · `HTML` · Beginner–Intermediate
The canonical tidy text-mining book. It covers tokenisation, sentiment analysis, word frequencies, tf-idf, topic modelling, and text classification using tidytext and the tidyverse.

### 10.2 Supervised Machine Learning for Text Analysis in R
**Emil Hvitfeldt & Julia Silge** · [Read online](https://smltar.com/) · `HTML` · Intermediate
A focused guide to predictive modelling with text. It covers text features, embeddings, model workflows, and evaluation using tidymodels, with a strong emphasis on good statistical practice.

### 10.3 An Introduction to Text Processing and Analysis with R
**Michael Clark** · [Read online](https://m-clark.github.io/text-analysis-with-R/) · `HTML` · Beginner–Intermediate
A practical introduction to working with text in R. It covers cleaning, tokenisation, sentiment, topic models, and common text-analysis workflows without assuming prior NLP experience.

### 10.4 Text Mining for Social Scientists
**Felix Lennert** · [Read online](https://bookdown.org/f_lennert/text-mining-book/) · `HTML` · Intermediate
A social-science-oriented introduction to text mining. It covers preprocessing, supervised and unsupervised approaches, and word embeddings, with an eye toward research applications.

### 10.5 An Introduction to Quantitative Text Analysis for Linguistics
**Jerid Francom** · [Read online](https://qtalr.com/book/) · `HTML` · Intermediate
A reproducible introduction to quantitative text analysis for linguists. It covers data acquisition, processing, visualisation, and statistical analysis of text while emphasising transparent research practices.

---

## 11. Geospatial Data

### 11.1 Geocomputation with R
**Robin Lovelace, Jakub Nowosad & Jannes Muenchow** · [Read online](https://r.geocompx.org/) · `HTML` · Intermediate
The standard free book on geographic data analysis in R. It covers vector and raster data, coordinate systems, spatial operations, mapping, and transport/accessibility modelling with sf, terra, and related packages.

### 11.2 Spatial Data Science
**Edzer Pebesma & Roger Bivand** · [Read online](https://r-spatial.org/book/) · `HTML` · Intermediate–Advanced
A conceptual and practical guide to spatial data science with R. It explains points, lines, polygons, rasters, data cubes, coordinate reference systems, and the consequences of geometry for analysis.

### 11.3 Spatial Statistics for Data Science: Theory and Practice with R
**Paula Moraga** · [Read online](https://www.paulamoraga.com/book-spatial/) · `HTML` · Intermediate–Advanced
A hands-on introduction to spatial statistics. It combines theory with real examples such as disease mapping, air pollution, species distribution, crime mapping, and real-estate analysis.

### 11.4 Introduction to Spatial Data Programming with R
**Michael Dorman** · [Read online](https://geobgu.xyz/r) · `HTML` · Beginner–Intermediate
A course-style introduction that starts with R basics and then moves into spatial workflows. It covers vector and raster processing, spatio-temporal data, and spatial interpolation.

### 11.5 Intro to GIS and Spatial Analysis
**Manuel Gimond** · [Read online](https://mgimond.github.io/Spatial/index.html) · `HTML` · Beginner–Intermediate
A well-structured introduction to GIS and spatial analysis. It covers geographic data, coordinate systems, point-pattern analysis, spatial autocorrelation, and interpolation.

### 11.6 Predictive Soil Mapping with R
**Tom Hengl & Robert A. MacMillan** · [Read online](https://soilmapper.org) · `HTML` · Advanced
A detailed guide to importing, processing, and modelling soil data in R. It combines spatial data handling, machine learning, and open-source GIS to produce spatial soil predictions.

### 11.7 Spatial Sampling with R
**Dick J. Brus** · [Read online](https://dickbrus.github.io/SpatialSamplingwithR/) · `HTML` · Advanced
A specialised book on classical and modern sampling designs for spatial surveys. It covers random sampling, stratification, cluster sampling, and designs for mapping.

---

## 12. Shiny & Web Applications

### 12.1 Mastering Shiny
**Hadley Wickham** · [Read online](https://mastering-shiny.org/) · `HTML` · Intermediate
The definitive guide to Shiny. It covers the reactive programming model, UI and server structure, layouts, modules, testing, performance, and deployment, and is aimed at app authors who want to go beyond the basics.

### 12.2 Engineering Production-Grade Shiny Apps
**Colin Fay, Sébastien Rochette, Vincent Guyader & Cervan Girard** · [Read online](https://engineering-shiny.org/) · `HTML` · Intermediate–Advanced
A book about the engineering process behind production Shiny apps, not introductory Shiny syntax. It covers project structure, prototyping, code quality, testing, deployment, and maintenance.

### 12.3 Outstanding User Interfaces with Shiny
**David Granjon** · [Read online](https://divadnojnarg.github.io/outstanding-shiny-ui/) · `HTML` · Advanced
A deep guide to building custom, polished Shiny interfaces. It covers HTML/CSS/JavaScript integration, custom layouts, input widgets, and the internals of Shiny's UI system.

### 12.4 JavaScript for R
**John Coene** · [Read online](https://book.javascript-for-r.com/) · `HTML` · Intermediate–Advanced
A guide to using JavaScript inside R packages and Shiny apps. It covers htmlwidgets, JavaScript for visualisation, and communication between R and the browser.

### 12.5 Shiny App-Packages
**Martin Frigaard** · [Read online](https://mjfrigaard.github.io/shiny-app-pkgs/) · `HTML` · Intermediate–Advanced
A guide to combining Shiny applications with R package development practices. It shows how to structure an app as a package to improve reusability, testing, and maintainability.

### 12.6 A gRadual intRoduction to Shiny
**Ted Laderas & Jessica Minnier** · [Read online](https://laderast.github.io/gradual_shiny/) · `HTML` · Beginner
A workshop-style introduction to Shiny. It covers the basic components of an app, how inputs and outputs communicate, and three common design patterns.

> For interactive graphics specifically, see also [4.11 Interactive Web-Based Data Visualization with R, plotly, and shiny](#411-interactive-web-based-data-visualization-with-r-plotly-and-shiny).

---

## 13. Reporting, Reproducibility & Automation

### 13.1 Quarto: The Practical Guide
**Mine Çetinkaya-Rundel & Charlotte Wickham** · [Read online](https://quarto-tdg.org/) · `HTML` · Beginner–Advanced
A current, example-driven guide to Quarto that complements the official documentation. It moves from writing content and adding code through options, HTML/PDF/presentations, projects, websites, and troubleshooting. Still a work in progress, but already broad and well structured.

### 13.2 Quarto for Scientists
**Nicholas Tierney** · [Read online](https://qmd4sci.njtierney.com/) · `HTML` · Beginner–Intermediate
A short, scientist-focused introduction to Quarto for reproducible reports. It covers the workflow, rendering to HTML/PDF/Word, figures and tables with captions, cross-references, equations, citations, and common problems.

### 13.3 R Markdown: The Definitive Guide
**Yihui Xie, J. J. Allaire & Garrett Grolemund** · [Read online](https://bookdown.org/yihui/rmarkdown/) · `HTML` · Beginner–Intermediate
The official book on R Markdown. It covers document structure, code chunks, tables, graphics, presentations, dashboards, books, websites, and the broader R Markdown ecosystem.

### 13.4 R Markdown Cookbook
**Yihui Xie, Christophe Dervieux & Emily Riederer** · [Read online](https://bookdown.org/yihui/rmarkdown-cookbook/) · `HTML` · Intermediate
A practical collection of tips and recipes for getting the most out of R Markdown. It explains how documents are processed and how to customise nearly every step, from chunk options to templates.

### 13.5 bookdown: Authoring Books and Technical Documents with R Markdown
**Yihui Xie** · [Read online](https://bookdown.org/yihui/bookdown/) · `HTML` · Intermediate
The guide to writing books and long-form technical documents with R Markdown. It covers cross-references, numbering, parts, appendices, citations, and publishing workflows.

### 13.6 blogdown: Creating Websites with R Markdown
**Yihui Xie, Amber Thomas & Alison Presmanes Hill** · [Read online](https://bookdown.org/yihui/blogdown/) · `HTML` · Beginner–Intermediate
A guide to building websites and blogs with R Markdown and Hugo. It covers site setup, content authoring, themes, deployment, and reproducible website workflows.

### 13.7 RMarkdown for Scientists
**Nicholas Tierney** · [Read online](https://rmd4sci.njtierney.com/) · `HTML` · Beginner
A short, scientist-focused guide to R Markdown. It covers the basics of reproducible reports, code chunks, tables, figures, and common workflows without unnecessary complexity.

### 13.8 Reproducible Research with R and RStudio
**Christopher Gandrud** · [Read online](https://christophergandrud.github.io/RepResR-RStudio/) · `HTML` · Beginner–Intermediate
A practical guide to the reproducible-research workflow: organising projects, documenting data, scripting analyses, and producing dynamic reports. It emphasises the full pipeline rather than isolated tools.

### 13.9 The targets R Package User Manual
**Will Landau** · [Read online](https://books.ropensci.org/targets/) · `HTML` · Intermediate–Advanced
The manual for the targets package, a pipeline toolkit for reproducible computation at scale. It covers dependency tracking, caching, parallel execution, and structuring large analysis projects.

### 13.10 knitr: Dynamic Documents with R
**Yihui Xie** · [Read online](https://yihui.org/knitr/) · `HTML` · Intermediate
The documentation and book site for knitr, the engine that powers R Markdown and many dynamic document workflows. It explains chunk options, output hooks, graphics, caching, and customisation.

### 13.11 Getting Used to R, RStudio, and R Markdown
**Chester Ismay** · [Read online](https://bookdown.org/chesterismay/rbasics/) · `HTML` · Beginner
A short onboarding guide for new users. It covers R, RStudio, R Markdown, reproducible research, and common error messages in plain language.

---

## 14. Domain-Specific Books

### 14.1 R for Health Data Science
**Ewen Harrison & Riinu Pius** · [Read online](https://argoshare.is.ed.ac.uk/healthyr_book/) · `HTML` · Beginner–Intermediate
A practical introduction to R for healthcare data. It takes readers from little or no experience to sophisticated analysis, with a strong emphasis on plotting, data understanding, and reproducible clinical workflows.

### 14.2 The Epidemiologist R Handbook
**Epidemiologist R Handbook authors** · [Read online](https://www.epirhandbook.com/) · `HTML` · Beginner–Intermediate
A comprehensive, practical R handbook written by epidemiologists for epidemiologists and public-health practitioners. It covers data cleaning, descriptive analysis, outbreak analysis, surveillance, and reporting with real-world examples.

### 14.3 Biostatistics for Biomedical Research
**Frank E. Harrell Jr.** · [Read online](http://hbiostat.org/bbr/) · `HTML` · Advanced
A detailed biostatistics text that emphasises methods making fewer assumptions, modern graphical displays, and reproducible analysis. It covers estimation, inference, regression, high-dimensional data, and observational treatment comparisons.

### 14.4 Computational Genomics with R
**Altuna Akalin** · [Read online](https://compgenomr.github.io/book/) · `HTML` · Intermediate–Advanced
A practical introduction to computational genomics in R. It covers sequencing data, preprocessing, differential expression, clustering, machine learning, and reproducible genomics workflows.

### 14.5 Orchestrating Single-Cell Analysis with Bioconductor
**Aaron Lun, Robert Amezquita, Stephanie Hicks & Raphael Gottardo** · [Read online](https://osca.bioconductor.org/) · `HTML` · Advanced
A comprehensive guide to single-cell RNA-seq analysis with Bioconductor. It covers quality control, normalisation, dimensionality reduction, clustering, annotation, and differential expression.

### 14.6 Modern Statistics for Modern Biology
**Susan Holmes & Wolfgang Huber** · [Read online](https://www.huber.embl.de/msmb/) · `HTML` · Intermediate–Advanced
A modern statistics textbook for biologists. It emphasises data exploration, simulation, multivariate methods, and reproducible analysis, with examples drawn from modern biological data.

### 14.7 Data Science for the Biomedical Sciences
**Daniel Chen & Anne Brown** · [Read online](https://ds4biomed.tech/) · `HTML` · Beginner
A gentle introduction to data science for biomedical researchers. It focuses on working with spreadsheet-like data, cleaning, transformation, and planning analyses, with R as the tool.

### 14.8 Handbook of Regression Modeling in People Analytics
**Keith McNulty** · [Read online](https://peopleanalytics-regression-book.org/) · `HTML` · Intermediate
An applied regression handbook aimed at people-analytics professionals. It covers linear, logistic, multinomial, and survival models, with an emphasis on interpretation and practical use in organisations.

### 14.9 Tidy Survey Analysis in R
**Stephanie Zimmer, Isabella Velásquez & contributors** · [Read online](https://tidy-survey-r.github.io/tidy-survey-book/) · `HTML` · Intermediate
A guide to analysing complex survey data with tidy principles. It covers survey design, weighting, variance estimation, and regression using the survey and srvyr packages.

### 14.10 Geospatial Health Data Modeling and Visualization with R-INLA and Shiny
**Paula Moraga** · [Read online](https://www.paulamoraga.com/book-geospatial/) · `HTML` · Advanced
A book on spatial and spatio-temporal statistical methods for georeferenced health data. It covers Bayesian hierarchical models, INLA, SPDE, disease mapping, and interactive visualisation with Shiny.

---

## 15. Official R Manuals & Reference

### 15.1 An Introduction to R
**W. N. Venables, D. M. Smith & the R Core Team** · [Read online](https://cran.r-project.org/doc/manuals/r-release/R-intro.html) · `HTML` · Beginner–Intermediate
The official introductory manual. It covers R basics, data structures, functions, graphics, statistical models, and the command-line environment. It is drier than the books above but authoritative and free.

### 15.2 The R Language Definition
**R Core Team** · [Read online](https://cran.r-project.org/doc/manuals/r-release/R-lang.html) · `HTML` · Advanced
The official specification of the R language: syntax, objects, evaluation, functions, and the object-oriented systems. Useful when you need precision about how the language is defined.

### 15.3 R Data Import/Export
**R Core Team** · [Read online](https://cran.r-project.org/doc/manuals/r-release/R-data.html) · `HTML` · Intermediate
The official manual on getting data into and out of R. It covers text files, spreadsheets, databases, binary formats, and connections.

### 15.4 Writing R Extensions
**R Core Team** · [Read online](https://cran.r-project.org/doc/manuals/r-release/R-exts.html) · `HTML` · Advanced
The official guide to extending R: package structure, documentation, namespaces, compiled code, foreign-language interfaces, and the R API. Essential for serious package developers.

### 15.5 R Internals
**R Core Team** · [Read online](https://cran.r-project.org/doc/manuals/r-release/R-ints.html) · `HTML` · Advanced
The official description of R's internal structures and mechanisms. It is aimed at developers working on R itself or writing code that interfaces deeply with its internals.

### 15.6 R Installation and Administration
**R Core Team** · [Read online](https://cran.r-project.org/doc/manuals/r-release/R-admin.html) · `HTML` · Advanced
The official guide to installing, configuring, and administering R on different platforms. Useful for system administrators and anyone managing shared R installations.

### 15.7 The R Manuals (restyled)
**R Development Core Team; restyled by Posit** · [Read online](https://rstudio.github.io/r-manuals/) · `HTML` · All levels
A cleaner, more readable presentation of the official R manuals. It is the same authoritative content as the CRAN manuals but easier to navigate in a browser.

---

## Appendix A: Free but PDF-First Classics

These are too important to omit, but their free editions are primarily PDFs rather than HTML. They are still legally free from the authors or publishers.

### A.1 An Introduction to Statistical Learning
**Gareth James, Daniela Witten, Trevor Hastie & Robert Tibshirani** · [Read online](https://www.statlearning.com/) · `PDF` · Intermediate
A broad, accessible introduction to statistical learning, with R labs in every chapter. It covers regression, classification, resampling, tree-based methods, support vector machines, unsupervised learning, and more.

### A.2 The Elements of Statistical Learning
**Trevor Hastie, Robert Tibshirani & Jerome Friedman** · [Read online](https://hastie.su.domains/ElemStatLearn/) · `PDF` · Advanced
The deeper, more mathematical companion to ISLR. It covers the theory and practice of statistical learning in greater depth, including regularisation, kernel methods, ensembles, and graphical models.

### A.3 Statistical Learning with Sparsity
**Trevor Hastie, Robert Tibshirani & Martin Wainwright** · [Read online](https://hastie.su.domains/StatLearnSparsity/) · `PDF` · Advanced
A rigorous treatment of sparse statistical methods: lasso, ridge, elastic net, group lasso, compressed sensing, and related topics. It includes R code and applications.

### A.4 Bayesian Data Analysis (3rd edition)
**Andrew Gelman, John B. Carlin, Hal S. Stern, David B. Dunson, Aki Vehtari & Donald B. Rubin** · [Read online](https://www.stat.columbia.edu/~gelman/book/BDA3.pdf) · `PDF` · Advanced
The standard graduate-level Bayesian text. It covers probability, single- and multi-parameter models, hierarchical models, model checking, and computation, with Stan code and real examples.

### A.5 Causal Inference: What If
**Miguel A. Hernán & James M. Robins** · [Read online](https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/) · `PDF` · Advanced
A rigorous but readable causal-inference textbook. It develops the counterfactual framework, confounding, inverse-probability weighting, standardisation, matching, and sensitivity analysis, with code and examples.

### A.6 OpenIntro Statistics
**David Diez, Mine Çetinkaya-Rundel & Christopher Barr** · [Read online](https://www.openintro.org/book/os/) · `PDF` · Beginner
A complete introductory statistics textbook, free under an open licence. It covers descriptive statistics, probability, inference, regression, and ANOVA, with R labs and exercises.

---

## Appendix B: Where to Find More Free R Books

- **[Big Book of R](https://www.bigbookofr.com/)** — Oscar Baruffa's enormous, continuously updated catalogue of 400+ R books. The best place to continue browsing; it includes paid and free titles across every domain.
- **[RStudio Education / Posit Resources](https://education.rstudio.com/)** — Cheatsheets, tutorials, videos, and book recommendations from Posit.
- **[Bookdown Gallery](https://bookdown.org/home/archive/)** — Hundreds of books written with bookdown, many of them free and domain-specific.
- **[CRAN Task Views](https://cran.r-project.org/web/views/)** — Curated package lists by topic; each view is a good starting point for finding the canonical book or vignette for a field.
- **[R Weekly](https://rweekly.org/)** — A weekly digest of new R books, tutorials, and packages.
- **[Free R books on GitHub](https://github.com/search?q=free+R+books&type=repositories)** — Many authors publish book source and HTML editions on GitHub; search for the topic you need.

### A Note on Quality and Currency

Free books vary in age, depth, and maintenance. Prefer books that:

1. Are actively maintained (check the last update or commit history).
2. Use current package APIs (for example, tidyverse 2.x, tidymodels, fable rather than forecast, sf/terra rather than sp/rgdal).
3. Include runnable code and exercises.
4. Cite their data sources and licensing.

When a book is older but conceptually strong — *The R Inferno*, *Advanced R* (1st edition), *The Elements of Statistical Learning* — read it for the ideas and check the code against current documentation.

---

*Part of: [R Programming Knowledge Base](00_Index.md)*
*See also: [Additional Resources & Links](08_Additional_Resources.md) · [Best Practices](Best Practices/01_Best_Practices.md) · [Tidyverse Overview](tidyverse/01_tidyverse_Overview.md)*
