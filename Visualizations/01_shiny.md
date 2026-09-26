# Shiny Learning Guide

## Overview
Shiny is an R package that makes it easy to build interactive web applications straight from R. It combines the computational power of R with the interactivity of the modern web, enabling data scientists to create dashboards, data explorers, and interactive reports without knowing HTML, CSS, or JavaScript.

## Quick Template

```r
# app.R - Minimal Shiny App
library(shiny)

ui <- fluidPage(
  titlePanel("My First Shiny App"),
  sidebarLayout(
    sidebarPanel(
      sliderInput("bins", "Number of bins:", min = 1, max = 50, value = 30)
    ),
    mainPanel(
      plotOutput("distPlot")
    )
  )
)

server <- function(input, output, session) {
  output$distPlot <- renderPlot({
    x    <- faithful$waiting
    bins <- seq(min(x), max(x), length.out = input$bins + 1)
    hist(x, breaks = bins, col = "#75AADB", border = "white",
         xlab = "Waiting time to next eruption (in mins)",
         main = "Histogram of waiting times")
  })
}

shinyApp(ui = ui, server = server)
```

```r
# Modular structure for larger apps
# app.R
source("R/ui.R")
source("R/server.R")
source("R/modules.R")
shinyApp(ui = ui, server = server)
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| UI Layout | `fluidPage()`, `navbarPage()` | `fluidPage(titlePanel("App"), ...)` |
| Sidebar | `sidebarLayout()` | `sidebarLayout(sidebarPanel(...), mainPanel(...))` |
| Inputs | `*Input("id", "label", ...)` | `sliderInput("n", "N:", 1, 100, 50)` |
| Outputs | `*Output("id")` | `plotOutput("plot")`, `tableOutput("table")` |
| Render | `render*({ expr })` | `renderPlot({ hist(rnorm(input$n)) })` |
| Reactive | `reactive({ expr })` | `data <- reactive({ read.csv(input$file$datapath) })` |
| Observe | `observe({ expr })` | `observe({ print(input$click) })` |
| Event | `eventReactive(event, { expr })` | `eventReactive(input$go, { compute() })` |
| Isolate | `isolate({ expr })` | `isolate({ print(input$x) })` |
| Module UI | `moduleUI(id, ui)` | `modUI("mod1", plotOutput("plot"))` |
| Module Server | `moduleServer(id, function)` | `modServer("mod1", function(i,o,s) {...})` |

## Practical Examples

### 1. Reactive Data Pipeline

```r
# R/server.R
server <- function(input, output, session) {
  
  # Reactive data source
  raw_data <- reactive({
    req(input$file)
    readr::read_csv(input$file$datapath)
  })
  
  # Filtered data (depends on raw_data + inputs)
  filtered_data <- reactive({
    df <- raw_data()
    if (!is.null(input$date_range)) {
      df <- df %>% filter(date >= input$date_range[1], date <= input$date_range[2])
    }
    if (!is.null(input$category)) {
      df <- df %>% filter(category %in% input$category)
    }
    df
  })
  
  # Summary stats (depends on filtered_data)
  summary_stats <- reactive({
    filtered_data() %>%
      summarise(
        n = n(),
        mean_val = mean(value, na.rm = TRUE),
        median_val = median(value, na.rm = TRUE),
        .groups = "drop"
      )
  })
  
  # Outputs
  output$summary_table <- renderTable({ summary_stats() })
  output$plot <- renderPlot({
    ggplot(filtered_data(), aes(x = date, y = value)) +
      geom_line() +
      theme_minimal()
  })
}
```

### 2. Dynamic UI with `renderUI`

```r
# Dynamic inputs based on data
output$var_selector <- renderUI({
  req(filtered_data())
  vars <- names(filtered_data())[sapply(filtered_data(), is.numeric)]
  selectInput("y_var", "Y Variable:", choices = vars, selected = vars[1])
})

# Dynamic tabs
output$dynamic_tabs <- renderUI({
  req(filtered_data())
  cats <- unique(filtered_data()$category)
  tabs <- lapply(cats, function(cat) {
    tabPanel(cat, plotOutput(paste0("plot_", cat)))
  })
  do.call(tabsetPanel, tabs)
})
```

### 3. Shiny Modules (Reusable Components)

```r
# R/modules.R
# Module UI
scatterUI <- function(id) {
  ns <- NS(id)
  tagList(
    selectInput(ns("x"), "X Variable", choices = NULL),
    selectInput(ns("y"), "Y Variable", choices = NULL),
    plotOutput(ns("plot")),
    downloadButton(ns("download"), "Download Plot")
  )
}

# Module Server
scatterServer <- function(id, data) {
  moduleServer(id, function(input, output, session) {
    observe({
      req(data())
      nums <- names(data())[sapply(data(), is.numeric)]
      updateSelectInput(session, "x", choices = nums, selected = nums[1])
      updateSelectInput(session, "y", choices = nums, selected = nums[2])
    })
    
    plot_obj <- reactive({
      req(data(), input$x, input$y)
      ggplot(data(), aes(.data[[input$x]], .data[[input$y]])) +
        geom_point(alpha = 0.6) +
        geom_smooth(method = "lm", se = FALSE, color = "red") +
        theme_minimal()
    })
    
    output$plot <- renderPlot({ plot_obj() })
    
    output$download <- downloadHandler(
      filename = function() paste0("scatter_", Sys.Date(), ".png"),
      content = function(file) ggsave(file, plot_obj(), width = 8, height = 6)
    )
  })
}

# Usage in main server
server <- function(input, output, session) {
  scatterServer("scatter1", filtered_data)
  scatterServer("scatter2", reactive({ mtcars }))
}
```

### 4. Async Operations with `future` & `promises`

```r
library(future)
library(promises)
plan(multisession)

server <- function(input, output, session) {
  
  # Long-running computation
  future_data <- reactive({
    future({
      Sys.sleep(5)  # Simulate slow computation
      compute_heavy_model(input$params)
    }) %...>% 
      (function(result) {
        showNotification("Computation complete!", type = "message")
        result
      })
  })
  
  output$result <- renderPrint({
    req(future_data())
    future_data()
  })
}
```

### 5. Bookmarking & State Persistence

```r
# Enable bookmarking
enableBookmarking(store = "url")

# Custom bookmark state
onBookmark(function(state) {
  state$values$custom_param <- "my_value"
})

onRestore(function(state) {
  if (!is.null(state$values$custom_param)) {
    updateTextInput(session, "custom", value = state$values$custom_param)
  }
})
```

### 6. Testing with `shinytest2`

```r
# tests/testthat/test_app.R
library(shinytest2)

test_that("app works", {
  app <- AppDriver$new(app_dir = ".", name = "basic")
  app$set_inputs(bins = 20)
  app$wait_for_idle()
  
  # Check plot exists
  expect_true(app$get_value(output = "distPlot")$visible)
  
  # Snapshot test
  app$expect_values()
})
```

## Common Shiny Uses

- **Interactive Dashboards** - KPI monitoring, business metrics
- **Data Explorers** - Filter, brush, drill-down on datasets
- **Model Builders** - Parameter tuning, what-if analysis
- **Report Generators** - Parameterized R Markdown/Quarto
- **Teaching Tools** - Interactive statistics demonstrations
- **Prototyping** - Rapid ML model interfaces

## Shiny Advantages

- **Pure R** - No web dev skills required
- **Reactive Programming** - Automatic dependency tracking
- **Rich Ecosystem** - 100+ extension packages
- **Deployment Options** - ShinyApps.io, Posit Connect, Docker, Kubernetes
- **Integration** - Works with ggplot2, plotly, DT, leaflet, reactable
- **Modules** - Encapsulated, reusable components

## Shiny Pitfalls

- **Reactivity Confusion** - Understand invalidation, isolation, dependencies
- **Performance** - Large datasets need `data.table`, `arrow`, or database backends
- **State Management** - Bookmarking, modules, `reactiveVal` vs `reactive`
- **Deployment** - Memory limits, worker processes, scaling
- **Debugging** - Use `browser()`, `reactlogShow()`, `shiny::showReactLog()`

## Awesome Shiny Resources

- **[Shiny Official Site](https://shiny.posit.co)** - Tutorials, gallery, reference
- **[Mastering Shiny](https://mastering-shiny.org)** - Hadley Wickham's free book
- **[Engineering Production-Grade Shiny Apps](https://engineering-shiny.org)** - Colin Fay et al.
- **[Shiny Gallery](https://shiny.posit.co/gallery/)** - Example applications
- **[awesome-shiny](https://github.com/nanxstats/awesome-shiny)** - Curated resources
- **[shinyextensions](https://github.com/daattali/shinyextensions)** - Useful extensions
- **[bslib](https://rstudio.github.io/bslib/)** - Bootstrap theming for Shiny
- **[shinydashboard](https://rstudio.github.io/shinydashboard/)** - Dashboard layouts
- **[bs4Dash](https://rinterface.github.io/bs4Dash/)** - Bootstrap 4 dashboards
- **[imola](https://github.com/braverock/imola)** - Flexbox/grid layouts
- **[shinyMobile](https://rinterface.github.io/shinyMobile/)** - Mobile-first apps
- **[shiny.semantic](https://appsilondatascience.github.io/shiny.semantic/)** - Semantic UI
- **[shiny.fluent](https://appsilon.github.io/shiny.fluent/)** - Microsoft Fluent UI
- **[shiny.router](https://github.com/Appsilon/shiny.router)** - Client-side routing
- **[shiny.react](https://github.com/Appsilon/shiny.react)** - React integration

## Shiny Extensions Ecosystem

| Category | Packages |
|----------|----------|
| **Layouts** | bslib, bs4Dash, shinydashboard, imola, shinyMobile |
| **Tables** | DT, reactable, rhandsontable, formattable |
| **Plots** | plotly, highcharter, echarts4r, ggiraph, girafe |
| **Maps** | leaflet, mapdeck, tmap, sf |
| **Inputs** | shinyWidgets, shinyjs, colourpicker, sortables |
| **Auth** | shinymanager, polaroid, firebase |
| **Testing** | shinytest2, testthat, shinytest |
| **Performance** | promises, future, mirai, callr |

## Shiny Quick Checklist

1. **Structure** - Use `app.R` or `ui.R`/`server.R`; modularize with modules
2. **Reactivity** - Minimize reactive chains; use `req()`, `validate()`
3. **Performance** - Cache with `bindCache()`; use `data.table`/`duckdb` for large data
4. **Inputs** - Namespace with `NS(id)` in modules; debounce with `debounce()`
5. **Outputs** - Use `renderPlot(..., res = 96)` for crisp plots
6. **Errors** - `validate(need(...))` for user-friendly messages
7. **Testing** - Write `shinytest2` tests for critical paths
8. **Deployment** - `rsconnect::deployApp()`; configure `manifest.json`
9. **Security** - Sanitize inputs; use `shinymanager` for auth
10. **Monitoring** - `shiny::showReactLog()` for debugging; logging in production

---

*Last updated: 2024 | Shiny 1.8+ compatible*