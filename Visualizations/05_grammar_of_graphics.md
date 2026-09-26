# The Grammar of Graphics — Companion Guide

## Overview
"The Grammar of Graphics" by Leland Wilkinson (Springer, 1999/2005) is the foundational text behind ggplot2, plotnine, Vega-Lite, and other declarative visualization systems. This page is a study companion for the book: it maps Wilkinson's theoretical framework to practical code (ggplot2 and plotnine), distills each chapter's core ideas, and provides a reference for understanding *why* visualizations are structured the way they are.

**Why this matters:** Once you understand the grammar, you stop thinking "how do I make this chart type?" and start thinking "what are my variables, what do I want to encode, and what layers do I need?" — the same question Wilkinson asks.

---

## The Book at a Glance

| Aspect | Detail |
|--------|--------|
| **Full Title** | The Grammar of Graphics (Statistics and Computing) |
| **Author** | Leland Wilkinson |
| **Publisher** | Springer (2nd ed. 2005) |
| **ISBN** | 978-0387245447 (hardcover), 978-0387245454 (paperback) |
| **Languages** | Implemented in SPSS (Nu-Windows), R (ggplot2), Python (plotnine), JS (Vega, Vega-Lite), D3 |
| **Companion Software** | SPSS Nu-Windows (original), now superseded by open-source implementations |

---

## Chapter-by-Chapter Companion

### Preface & Chapter 1 — Introduction: Why a Grammar?

**Core idea:** Every chart is a *language* — data values are words, visual properties are grammar rules. Without a grammar, chart choices are arbitrary. With one, you can decompose any chart into reusable components and compose new ones systematically.

**Key points:**
- Charts should be described by *rules*, not by chart-type menus.
- The grammar separates *what* you show (data) from *how* you show it (visual encoding).
- A small set of components (data → aesthetics → geometry → statistics → facets → coordinates → theme) can produce every chart type.

**In code:**
```r
# Every ggplot2 plot follows this grammar
ggplot(
  data    = <DATA>,       # 1. Data (the "what")
  mapping = aes(<AES>)    # 2. Aesthetic mappings (the "how")
) +
  <GEOM_FUNCTION>() +     # 3. Geometry (the "shape")
  <STAT_FUNCTION>() +     # 4. Statistical transformation
  <FACET_FUNCTION>() +    # 5. Faceting (small multiples)
  <COORD_FUNCTION>() +    # 6. Coordinate system
  <SCALE_FUNCTION>() +    # 7. Scales (mapping domain → range)
  <THEME_FUNCTION>()      # 8. Non-data ink
```

---

### Chapter 2 — Theoretical Foundations

**Core idea:** Graphics are built from a formal grammar with five basic components: **data**, **algebra** (operators like +, ×, |), **scales**, **coordinates**, and **graphics** (geometries, statistics, facets).

**The five-component framework:**

| Component | What it does | Wilkinson's term |
|-----------|-------------|-------------------|
| Data | The values you're plotting | Data |
| Algebra | Operators: overlay (+), nested (×), juxtapose (|), sequential (%>%) | Algebra |
| Scales | Map data values → visual values (position, color, size) | Scales |
| Coordinates | Space the marks occupy (Cartesian, polar, map projections) | Coordinates |
| Graphics | The visual marks and their statistical summaries | Graphics |

**Practical mapping:**
```r
# Wilkinson's five components → ggplot2
# Algebra (+, ×, |) → patchwork operators (|, /, +)
# Scales             → scale_*()
# Coordinates        → coord_*()
# Graphics (geoms)   → geom_*() + stat_*()

# Algebra example with patchwork:
library(patchwork)
p1 + p2            # overlay (Wilkinson: +)
p1 | p2            # juxtapose (Wilkinson: |)
p1 / p2            # nested (Wilkinson: ×)
```

**Takeaway for the book:** Wilkinson's "algebra" is the formal system of composition. In ggplot2, the `+` operator builds layers *within* one plot, while patchwork's `|` and `/` handle *between-plot* composition.

---

### Chapter 3 — Mapping Data to Aesthetics

**Core idea:** Visual properties (aesthetics) are divided into **constant** (fixed for all observations) and **variable** (mapped from data columns). The mapping is the *grammar's* core operation: data value → visual value via a scale.

**Aesthetic channels (Wilkinson's taxonomy):**

| Channel | Type | Examples | Wilkinson's category |
|---------|------|----------|---------------------|
| Position | 2D | x, y | Position |
| Color hue | Categorical | Color, fill | Color |
| Color luminance | Ordered | Color intensity | Color |
| Color saturation | Ordered | Color intensity | Color |
| Size | Ordered | Point size, line width | Size |
| Shape | Nominal | Point symbols | Shape |
| Rotation | Ordered | Line dash, text angle | Orientation |
| Texture | Nominal | Hatching, patterns | Texture |

**Key distinction:**
- **Aesthetics (aes())** — varies with data
- **Parameters** — fixed constants set in `geom_*()` or `scale_*()`

```r
# Aesthetic (varies with data)
ggplot(mpg, aes(x = displ, y = hwy, color = class)) + geom_point()

# Parameter (fixed)
ggplot(mpg, aes(x = displ, y = hwy)) + geom_point(color = "steelblue", size = 3, shape = 16)

# Both together: mapping + parameter
ggplot(mpg, aes(x = displ, y = hwy, color = class)) +
  geom_point(size = 3, alpha = 0.7)  # size & alpha are parameters (fixed)
```

**Scales as mappings (Chapter 5 territory):**
```r
# Wilkinson: data domain → visual range
scale_x_continuous(
  domain = c(0, 10),           # what the data means
  range  = c(0, 100),          # where it appears on the plot
  transform = "identity"       # how to transform
)

# In practice:
scale_x_continuous(limits = c(0, 10), breaks = seq(0, 10, 2))
scale_color_manual(values = c("A" = "red", "B" = "blue"))
```

**Takeaway:** Every visual encoding is a *scale* — a function from data space to visual space. When you ask "should I use a log scale?" you're asking "what transformation should this scale apply?"

---

### Chapter 4 — Scales

**Core idea:** Scales define the mapping between data values and visual values. Each aesthetic has its own scale. Scales have **domain** (data range), **range** (visual range), and optional **transformation**.

**Scale anatomy:**

| Property | ggplot2 equivalent | Example |
|----------|-------------------|---------|
| Domain | `limits` | `limits = c(0, 100)` |
| Range | internal | position on axis, color in palette |
| Transformation | `trans` / `transform` | `trans = "log10"` |
| Breaks | `breaks` | `breaks = seq(0, 100, 20)` |
| Labels | `labels` | `labels = c("Low", "High")` |
| Palettes | `values` | `values = c("red", "blue")` |
| Missing values | `na.value` | `na.value = "gray"` |

**Scale types by aesthetic:**
```r
# Position scales (x, y)
scale_x_continuous(), scale_y_discrete(), scale_x_log10(), scale_x_date()

# Color scales
scale_color_gradient(), scale_color_brewer(), scale_color_viridis_d(), scale_color_manual()

# Size scales
scale_size_continuous(range = c(1, 10))
scale_radius()

# Shape scales
scale_shape_manual(values = c(16, 17, 15))

# Alpha scales
scale_alpha_continuous(range = c(0.1, 1))

# Linetype scales
scale_linetype_manual(values = c("solid", "dashed", "dotted"))
```

**Takeaway:** Wilkinson emphasizes that scales are *independent* per aesthetic. You can have a continuous x-scale and a discrete color-scale in the same plot because they map different data domains to different visual channels.

---

### Chapter 5 — Aesthetics and Statistical Transformations

**Core idea:** Before geometry is drawn, data may be *statistically transformed*. Histograms bin data; smoothers fit models; boxplots compute quartiles. The stat is a function: data → transformed data → geometry.

**The pipeline (Wilkinson's "statistical transformation"):**
```
Raw Data → Statistic → Geometric Object → Visual Mark
```

```r
# Each geom has a default stat
geom_bar()       → stat_count()     # counts occurrences
geom_histogram() → stat_bin()       # bins values
geom_smooth()    → stat_smooth()    # fits a model
geom_boxplot()   → stat_boxplot()   # computes quartiles
geom_point()     → stat_identity()  # no transformation

# Override the default stat
ggplot(mpg, aes(x = class)) +
  geom_bar(stat = "count")          # explicit (default)

ggplot(mpg, aes(x = class)) +
  stat_count(geom = "bar")          # explicit stat + geometry

# Custom statistic
stat_summary(fun = median, geom = "point", size = 4)
stat_summary(fun.data = mean_cl_boot, geom = "errorbar")
```

**Key stats from the book:**
```r
# Histogram (binning)
geom_histogram(bins = 30)
stat_bin(bins = 30, geom = "bar")

# Density (kernel estimation)
geom_density(adjust = 1)
stat_density(geom = "line")

# Quantiles
stat_quantile(quantiles = c(0.25, 0.75), geom = "ribbon")

# QQ plot (theoretical vs sample quantiles)
stat_qq(aes(sample = displ))
stat_qq_line()

# 2D binning
stat_bin2d(bins = 20)
stat_binhex(bins = 30)
stat_density2d()

# Function plotting
stat_function(fun = dnorm, args = list(mean = 0, sd = 1))

# Summary
stat_summary(fun_y = mean, geom = "line")
stat_summary(fun_y = function(x) quantile(x, 0.95), geom = "point")
```

**Takeaway:** When you see a boxplot, a histogram, or a smoother, you're seeing a *stat* that transformed the data before the geom drew it. Wilkinson's contribution: treat stats as first-class, pluggable components.

---

### Chapter 6 — Geometric Objects (Geoms)

**Core idea:** Geoms are the visible marks: points, lines, bars, polygons, text, etc. Each geom has required aesthetics (must be mapped) and optional aesthetics (can be mapped or set).

**Geom catalog with required aesthetics:**

| Geom | Required Aesthetics | Optional | Use case |
|------|-------------------|----------|----------|
| `geom_point` | x, y | color, fill, size, shape, alpha | Scatter, dot plots |
| `geom_line` | x, y | color, linewidth, linetype | Time series, trends |
| `geom_path` | x, y | color, linewidth | Follows data order |
| `geom_bar` | x (or y) | fill, color, alpha | Counts (auto stat) |
| `geom_col` | x, y | fill, color | Pre-summarized bars |
| `geom_area` | x, y | fill, alpha | Area charts |
| `geom_ribbon` | x, ymin, ymax | fill, color | Confidence intervals |
| `geom_boxplot` | x, y | fill, color, width | Distribution summary |
| `geom_violin` | x, y | fill, color, alpha | Density + boxplot |
| `geom_histogram` | x | fill, color, bins | Distribution |
| `geom_density` | x | fill, color, alpha | Smoothed distribution |
| `geom_text` | x, y, label | color, size, angle | Labels |
| `geom_segment` | x, y, xend, yend | color, linewidth | Arrows, lines |
| `geom_errorbar` | x, ymin, ymax | color, width | Error bars |
| `geom_tile` | x, y | fill, color | Heatmaps |
| `geom_raster` | x, y | fill | Raster heatmaps |
| `geom_sf` | geometry | fill, color | Maps (sf objects) |
| `geom_smooth` | x, y | color, method | Trend lines |

```r
# Stacking geoms — order matters (bottom to top)
ggplot(mpg, aes(displ, hwy, color = class)) +
  geom_point(alpha = 0.5) +         # layer 1 (bottom)
  geom_smooth(method = "lm") +       # layer 2
  geom_rug(alpha = 0.3) +            # layer 3
  geom_text(aes(label = model),      # layer 4 (top)
    nudge_y = 1, size = 2.5) +
  theme_minimal()

# Position adjustments (for bars, points)
geom_bar(position = "dodge")         # side-by-side
geom_bar(position = "fill")          # proportional
geom_bar(position = position_stack(reverse = TRUE))
geom_point(position = position_jitter(width = 0.2))
geom_boxplot(position = position_dodge(width = 0.6))
```

**Takeaway:** Geoms are the *vocabulary* of the grammar. Wilkinson's insight: you don't need a separate "chart type" for every visual — you just need a set of geometric primitives combined with stats, scales, and coordinates.

---

### Chapter 7 — Coordinates (Coordinate Systems)

**Core idea:** Coordinates determine the space in which marks are placed. The default is Cartesian (x × y), but the grammar supports polar, map projections, and custom spaces.

**Coordinate systems in the grammar:**

| Coordinate | Function | What it does |
|-----------|----------|-------------|
| Cartesian | `coord_cartesian()` | Default; zoom without clipping stats |
| Fixed aspect | `coord_fixed(ratio)` | Equal x/y scaling |
| Flipped | `coord_flip()` | Swap x and y axes |
| Polar | `coord_polar(theta, start)` | Radial space (pie, radar, rose) |
| Transformed | `coord_trans(x, y)` | Transform coordinates (not scales) |
| Map | `coord_sf()`, `coord_map()` | Geographic projections |
| Quick map | `coord_quickmap()` | Approximate lat/lon aspect |
| Equal | `coord_equal()` | Same units on both axes |
| Bilinear | `coord_cartesian(clip)` | Zoom into region |

```r
# Polar coordinates → pie chart
ggplot(mpg, aes(x = 1, fill = class)) +
  geom_bar(width = 1) +
  coord_polar(theta = "y") +
  theme_void()

# Polar → rose/wind rose
ggplot(wind_data, aes(x = direction, fill = speed_cat)) +
  geom_bar(width = 1) +
  coord_polar()

# Flipped bar chart (horizontal)
ggplot(mpg, aes(x = reorder(class, hwy), y = hwy)) +
  geom_col() +
  coord_flip()

# Zoom (Cartesian) vs limits (scale) — key distinction!
# coord_cartesian() zooms (keeps data for stats)
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  geom_smooth(method = "lm") +
  coord_cartesian(xlim = c(2, 6), ylim = c(20, 40))

# scale_*_limits() removes data (affects stats)
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  geom_smooth(method = "lm") +
  scale_x_continuous(limits = c(2, 6))  # data outside range is dropped

# Coordinate transformation (different from scale transform)
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  coord_trans(x = "log10", y = "log10")
```

**Takeaway:** Wilkinson treats coordinates as a *separate layer* from scales. The distinction matters: scales map data → positions; coordinates determine the *space* those positions live in. Zoom vs. transform vs. limit are three different operations.

---

### Chapter 8 — Faceting (Small Multiples)

**Core idea:** Faceting divides the data into subsets and displays the same plot for each subset. This is the grammar's answer to "how do I show comparisons across categories without overplotting?"

**Faceting in the grammar:**
```r
# Wilkinson: conditioning on one or more variables
# facet_wrap — one variable, wraps into grid
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  facet_wrap(~class, ncol = 3)

# facet_grid — two variables, rows × columns
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  facet_grid(drv ~ cyl)

# Nested conditioning
facet_wrap(~interaction(drv, cyl))

# Free scales (different axis ranges per facet)
facet_wrap(~class, scales = "free_y")
facet_grid(drv ~ cyl, scales = "free", space = "free")
```

**Facet types from the book:**

| Type | ggplot2 | Description |
|------|---------|-------------|
| Conditioning on one variable | `facet_wrap(~var)` | Single panel per level |
| Cross-conditioning | `facet_grid(row ~ col)` | 2D grid |
| Nested conditioning | `facet_wrap(~interaction(a, b))` | Hierarchical |
| Free scales | `scales = "free"` | Independent axes |
| Fixed scales | `scales = "fixed"` | Shared axes (default) |

**Takeaway:** Wilkinson advocates small multiples (à la Tufte) over dual axes or color overload. Faceting is the grammar's structural mechanism for decomposition — split the data, repeat the plot.

---

### Chapter 9 — Statistics and Data Analysis

**Core idea:** Statistics and graphics are not separate — every plot is a statistical statement. The grammar makes statistical transformations explicit, so you always know what computation produced the visual.

**Statistical concepts in the grammar:**
```r
# Distribution → histogram/density
ggplot(data, aes(x = value)) +
  geom_histogram(bins = 30) +
  geom_density(fill = NA, color = "red")

# Relationship → scatter + smooth
ggplot(data, aes(x, y)) +
  geom_point() +
  geom_smooth(method = "lm", se = TRUE)

# Comparison → boxplot/violin + test
ggplot(data, aes(group, value)) +
  geom_boxplot() +
  stat_compare_means(method = "anova")

# Summary → point + interval
ggplot(data, aes(group, value)) +
  stat_summary(fun.data = mean_se, geom = "errorbar", width = 0.2) +
  stat_summary(fun = mean, geom = "point", size = 4)

# Uncertainty → ribbon
ggplot(data, aes(x, y)) +
  geom_ribbon(aes(ymin = lower, ymax = upper), alpha = 0.3) +
  geom_line()
```

**Takeaway:** Wilkinson argues that visualization *is* statistical analysis — the grammar provides the formal structure for encoding statistical claims visually. Every `stat_*()` makes an assumption explicit (bin width, smoothing method, confidence level).

---

### Chapter 10 — Replication and Statistical Control

**Core idea:** Replication (multiple observations per condition) is fundamental to statistical validity. The grammar should support replication through overplotting, jitter, transparency, and facets — not aggregation by default.

```r
# Show ALL data (replication), not just summaries
ggplot(mpg, aes(class, hwy)) +
  geom_boxplot(outlier.shape = NA, alpha = 0.3) +  # summary
  geom_jitter(width = 0.2, alpha = 0.5) +           # individual points
  stat_summary(fun = mean, geom = "point",
    shape = 18, size = 4, color = "red")            # mean marker

# Transparency for overlap
geom_point(alpha = 0.3, position = position_jitter(width = 0.1))

# Hexbin/binning for large data
geom_hex(bins = 30)
geom_bin2d(bins = 30)

# Facet instead of aggregate
facet_wrap(~group)
```

**Takeaway:** The grammar should let you show the *raw data* alongside summaries. Wilkinson was prescient about the "bar chart of means" problem — the grammar supports visualization of variance, not just central tendency.

---

### Chapter 11 — Creating New Data

**Core idea:** Creating new data — derived variables, predictions, simulations — is part of the analysis pipeline. The grammar should accommodate computed aesthetics and transformations.

```r
# after_stat() — use statistical transformations in aesthetics
ggplot(mpg, aes(x = displ)) +
  geom_histogram(aes(y = after_stat(density)), bins = 30) +
  geom_density(aes(y = after_stat(density)), color = "red")

# after_scale() — modify aesthetics after scale mapping
ggplot(mpg, aes(displ, hwy, color = class)) +
  geom_point(aes(color = class), size = 3) +
  scale_color_manual(values = c("red", "blue", "green")) +
  guides(color = guide_legend(override.aes = list(size = 5)))

# Computed variables in stat
ggplot(mpg, aes(x = displ)) +
  stat_ecdf(geom = "step")

# Predicted values
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  geom_smooth(method = "lm", se = TRUE)
```

**Takeaway:** The grammar distinguishes between *data* (input), *computed* (stat output), and *visual* (geom marks). `after_stat()` bridges stat → aesthetic; `after_scale()` bridges scale → aesthetic.

---

### Chapter 12 — Map Algebra and Spatial Data

**Core idea:** Maps have their own algebra — spatial joins, overlays, projections. The grammar extends to spatial data through coordinate systems and specialized geoms.

```r
library(sf)
library(ggspatial)

# Simple features (sf) integration
ggplot() +
  geom_sf(data = counties, aes(fill = population)) +
  scale_fill_viridis_c() +
  coord_sf(crs = st_crs(4326)) +
  annotation_scale(location = "bl") +
  annotation_north_arrow(location = "tr") +
  theme_void()

# Or via ggmap
library(ggmap)
ggmap(base_map) +
  geom_point(data = events, aes(lon, lat, color = type)) +
  geom_sf(data = boundaries, inherit.aes = FALSE, fill = NA)

# Spatial algebra (sf)
st_join(points, polygons)    # spatial join
st_intersection(a, b)         # overlay
st_transform(x, crs = 4326)   # projection
```

**Takeaway:** Wilkinson's map algebra extends the grammar to spatial data: coordinates become projected spaces, and geometric operations (union, intersection, buffer) become part of the data pipeline.

---

### Chapter 13 — Semantics

**Core idea:** Semantics connects the grammar to meaning — labels, titles, legends, and annotations turn visual marks into communicable claims.

```r
# Labels and semantic annotation
ggplot(mpg, aes(displ, hwy, color = class)) +
  geom_point() +
  labs(
    title    = "Larger engines get worse highway mileage",
    subtitle = "Each point is a vehicle model (1999-2008)",
    x = "Engine displacement (L)",
    y = "Highway miles per gallon",
    color = "Vehicle class",
    caption = "Source: EPA fuel economy data via `mpg`"
  ) +
  # Semantic annotations
  annotate("text", x = 6, y = 44, label = "Efficient", size = 4) +
  annotate("rect", xmin = 5, xmax = 7, ymin = 42, ymax = 46,
    fill = "yellow", alpha = 0.2) +
  annotate("segment", x = 2, xend = 4, y = 35, yend = 30,
    arrow = arrow(length = unit(0.3, "cm")), color = "red") +
  # Rich text (ggtext)
  theme(plot.title = element_markdown(face = "bold"))
```

**Takeaway:** The grammar's final layer is *meaning*. Wilkinson emphasizes that visualization is a communication act — labels, captions, and annotations are not decoration; they're the semantic payload.

---

## Mapping the Book to ggplot2 and plotnine

### Wilkinson's Components → Code

| Wilkinson Component | ggplot2 | plotnine | Notes |
|--------------------|---------|----------|-------|
| Data | `ggplot(data)` | `ggplot(df, ...)` | First argument |
| Algebra (overlay) | `+` (layer) | `+` (layer) | Same in both |
| Algebra (juxtapose) | `patchwork::|` | `patchwork` port | Between plots |
| Algebra (nested) | `patchwork::/` | `patchwork` port | Between plots |
| Algebra (sequential) | pipe `%>%` + function | pipe | Data transformation |
| Aesthetics | `aes(x, y, ...)` | `aes(x=, y=)` | Named args in plotnine |
| Geometry | `geom_*()` | `geom_*()` | Same names |
| Statistics | `stat_*()` | `stat_*()` | Same names |
| Scales | `scale_*_*()` | `scale_*_*()` | Same names |
| Coordinates | `coord_*()` | `coord_*()` | Same names |
| Facets | `facet_wrap/grid` | `facet_wrap/grid` | Same names |
| Theme | `theme_*()`, `theme()` | `theme_*()` | Different element names |
| Labels | `labs()` | `labs()` | Same |

### ggplot2 ↔ plotnine syntax differences

```r
# ggplot2 (R)
ggplot(mpg, aes(x = displ, y = hwy, color = class)) +
  geom_point(size = 3) +
  scale_color_brewer(palette = "Set1") +
  facet_wrap(~drv) +
  theme_minimal() +
  labs(title = "Title")

# plotnine (Python)
(
  ggplot(mpg, aes(x="displ", y="hwy", color="class")) +
  geom_point(size=3) +
  scale_color_brewer(palette="Set1") +
  facet_wrap("~drv") +
  theme_minimal() +
  labs(title="Title")
)
```

**Key differences:**

| Feature | ggplot2 | plotnine |
|---------|---------|----------|
| String aesthetics | `aes(displ, hwy)` or `aes(x = displ)` | `aes(x="displ", y="hwy")` — strings required |
| Factor | `factor(cyl)` | `factor(cyl)` or `C(cyl)` |
| Pipe | `%>%` (magrittr) | `|>` (native) or `%>%` |
| Wrap | `+` (all layers) | `+` inside parentheses `( ... )` |
| Component access | `$data`, `$layers` | `.data`, `.layers` |
| Save | `ggsave()` | `.save()` |
| Stat access | `stat_summary()` | `stat_summary()` |
| Element names | `element_text()` | `element_text()` |
| Theme options | `theme(plot.title=...)` | `theme(plot_title=...)` (dots → underscores) |

---

## Key Concepts Quick Reference

### The Layered Grammar (Hadley Wickham's extension)

```
Layer = Data + Mapping + Stat + Geom + Position + Params
Plot  = Layer + Scale + Facet + Coord + Theme + Labels
```

| Layer Type | Purpose | Examples |
|-----------|---------|----------|
| Data layer | What you're plotting | `ggplot(data, aes(...))` |
| Geom layer | Visual marks | `geom_point()`, `geom_bar()` |
| Stat layer | Statistical transformation | `stat_smooth()`, `stat_bin()` |
| Position layer | Adjust mark positions | `position_dodge()`, `position_jitter()` |
| Scale layer | Data → visual mapping | `scale_color_manual()` |
| Facet layer | Small multiples | `facet_wrap()`, `facet_grid()` |
| Coord layer | Coordinate space | `coord_flip()`, `coord_polar()` |
| Theme layer | Non-data ink | `theme_minimal()`, `theme()` |
| Guide layer | Legends, axes | `guides()`, `guide_legend()` |

### Visual Encoding Hierarchy (from the book)

```
Position (most accurate) > Length > Area > Angle > Color Luminance
                        > Color Hue > Shape > Texture (least accurate)
```

**Rule of thumb:** Use position for quantitative comparisons; use color hue for categories; use size/area for magnitude; avoid shape for more than 6 categories.

### When to Use Which Geom (decision guide)

| You want to show... | Use |
|--------------------|-----|
| Relationship between 2 continuous vars | `geom_point` + `geom_smooth` |
| Distribution of 1 continuous var | `geom_histogram` or `geom_density` |
| Comparison across categories | `geom_boxplot` or `geom_violin` or `geom_bar` |
| Trend over time | `geom_line` + `geom_point` |
| Proportion of whole | `geom_bar(position="fill")` or `geom_area` or pie |
| Uncertainty | `geom_ribbon`, `geom_errorbar`, `stat_summary` |
| Ranking | `geom_col` + `coord_flip()` or `geom_lollipop` |
| Flow between states | `geom_alluvial` (ggalluvial) |
| Network | `geom_edge_*` + `geom_node_*` (ggraph) |
| Spatial | `geom_sf`, `geom_map` |
| Distribution comparison | `geom_violin`, `geom_ridgeline` (ggridges) |

---

## Exercises (Practice the Grammar)

### Exercise 1: Decompose a chart
Pick any chart you see in the news. Identify:
1. What is the **data**?
2. What **aesthetics** are mapped? (x, y, color, size, etc.)
3. What **geoms** are used?
4. What **stats** are running?
5. What **scale** transforms are applied?
6. What **coordinate** system?
7. What **facet** structure (if any)?

### Exercise 2: Rebuild with grammar
Using the `mpg` dataset:
```r
# Rebuild this as separate layers:
ggplot(mpg, aes(displ, hwy, color = class)) +
  geom_point(size = 2, alpha = 0.6) +
  geom_smooth(method = "lm", se = FALSE) +
  facet_wrap(~drv) +
  scale_color_brewer(palette = "Set2") +
  theme_minimal() +
  labs(title = "MPG by Displacement", x = "Displacement (L)", y = "Highway MPG")
```
1. Remove each layer one at a time — what changes?
2. Replace `geom_smooth` with `geom_line` — what breaks?
3. Add `coord_flip()` — what happens to the facet?

### Exercise 3: Translate across systems
Take this ggplot2 code and translate to plotnine:
```r
ggplot(mpg, aes(x = class, fill = drv)) +
  geom_bar(position = "dodge") +
  scale_fill_brewer(palette = "Set1") +
  labs(title = "Drive Type by Class", fill = "Drive") +
  theme_minimal()
```
Then translate both to Wilkinson's five components (data, algebra, scales, coordinates, graphics).

---

## Recommended Reading Path

1. **Read Chapter 1-3** (Introduction, Foundations, Aesthetics) — understand the "why"
2. **Code along** with ggplot2 or plotnine for Chapters 4-7 (Scales, Stats, Geoms, Coords)
3. **Skim Chapters 8-10** (Facets, Statistics, Replication) — relate to your analysis work
4. **Reference Chapters 11-13** (New Data, Spatial, Semantics) as needed
5. **Complement with:**
   - *ggplot2: Elegant Graphics for Data Analysis* (Wickham) — practical ggplot2 guide
   - *Fundamentals of Data Visualization* (Wilke) — free, modern, practical
   - *R Graphics Cookbook* (Chang) — recipe-based
   - *The Elements of Graphing Data* (Cleveland) — complementary theory

---

## Quick Reference Card

```
THE GRAMMAR OF GRAPHICS — Quick Reference

DATA → AESTHETICS → GEOMETRY → STATISTICS → COORDINATES → FACETS → THEME

ggplot(data, aes(x, y, color=, size=, shape=)) +  # Data + Aesthetics
  geom_*() +                                        # Geometry (marks)
  stat_*() +                                        # Statistics (transform)
  scale_*_*() +                                     # Scales (mapping)
  facet_*() +                                       # Facets (small multiples)
  coord_*() +                                       # Coordinates (space)
  labs() +                                          # Labels (semantics)
  theme_*() + theme()                               # Theme (non-data ink)

KEY RULES:
1. Position encodes most accurately — use for quantitative data
2. Show raw data alongside summaries (replication)
3. Facet before overloading color/shape channels
4. Every chart is a statistical claim — make it explicit
5. Labels are semantics, not decoration
```

---

*Companion to: Wilkinson, L. (2005). The Grammar of Graphics (2nd ed.). Springer.*
*Compatible with: ggplot2 3.5+, plotnine 0.13+, ggplot2 extensions*
*Last updated: 2024*
