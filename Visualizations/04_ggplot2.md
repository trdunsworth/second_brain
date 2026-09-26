# ggplot2 Learning Guide

## Overview
ggplot2 is the most widely used data visualization package in R, created by Hadley Wickham. It implements Leland Wilkinson's Grammar of Graphics: a layered, declarative system where plots are built by combining data, aesthetic mappings, geometric objects, statistical transformations, coordinate systems, and themes. Every plot is composed of layers, and each layer contributes a component to the final figure.

## Quick Template

```r
# Basic ggplot2 workflow
library(ggplot2)

ggplot(data = mtcars, aes(x = wt, y = mpg)) +
  geom_point(aes(color = factor(cyl)), size = 3, alpha = 0.7) +
  geom_smooth(method = "lm", se = TRUE, color = "black", linetype = "dashed") +
  scale_color_brewer(palette = "Set1", name = "Cylinders") +
  labs(
    title = "Fuel Economy vs Weight",
    subtitle = "1974 Motor Trend US Magazine",
    x = "Weight (1000 lbs)",
    y = "Miles per Gallon",
    caption = "Source: mtcars"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title = element_text(face = "bold", size = 16),
    legend.position = "bottom"
  )
```

```r
# Save publication-quality figure
ggsave(
  "plot.pdf",
  width = 8, height = 6,
  units = "in",
  dpi = 300,
  device = cairo_pdf
)
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| **ggplot object** | `ggplot(data, aes(x, y))` | `ggplot(mtcars, aes(wt, mpg))` |
| **Aesthetics** | `aes(x, y, color, fill, size, shape, alpha, linetype, group)` | `aes(x = wt, y = mpg, color = factor(cyl))` |
| **Layers** | `geom_*()` | `geom_point()`, `geom_line()`, `geom_bar()` |
| **Statistics** | `stat_*()` | `stat_smooth()`, `stat_summary()` |
| **Scales** | `scale_*_*()` | `scale_x_log10()`, `scale_color_viridis_d()` |
| **Facets** | `facet_wrap()`, `facet_grid()` | `facet_wrap(~cyl, ncol = 3)` |
| **Coordinates** | `coord_*()` | `coord_flip()`, `coord_polar()` |
| **Themes** | `theme_*()`, `theme()` | `theme_minimal()` |
| **Labels** | `labs()` | `labs(title = "T", x = "X", y = "Y")` |
| **Positions** | `position_*()` | `position_dodge()`, `position_jitter()` |
| **Guides** | `guides()` | `guides(color = guide_legend(ncol = 2))` |

## Grammar of Graphics Layers

### 1. Data & Aesthetic Mappings

```r
# Basic aesthetics
ggplot(mpg, aes(x = displ, y = hwy, color = class)) + geom_point()

# Aesthetics in ggplot() = inherited by all layers
# Aesthetics in geom_*() = local to that layer
ggplot(mpg, aes(displ, hwy)) +
  geom_point(aes(color = class)) +         # local: color mapped
  geom_smooth(method = "lm")                # inherits x, y only

# Grouping
ggplot(economics, aes(x = date, y = unemploy, group = 1)) + geom_line()
ggplot(mpg, aes(displ, hwy, group = class)) + geom_line()

# Compute aesthetics (stat transforms)
ggplot(mpg, aes(x = displ, y = hwy)) +
  stat_summary(aes(y = after_stat(mean)), geom = "line")
```

### 2. Geometric Objects (Geoms)

```r
# --- Points ---
geom_point(size = 3, alpha = 0.6, shape = 16)
geom_jitter(width = 0.2, height = 0.2)          # jittered points
geom_point(aes(size = pop))                     # variable point size

# --- Lines ---
geom_line(linewidth = 1.2, linetype = "dashed")
geom_path()                                      # follows data order
geom_step()                                      # step function
geom_hline(yintercept = 0, linetype = "dotted")
geom_vline(xintercept = 5, color = "red")

# --- Bars ---
geom_bar(stat = "count", fill = "steelblue")     # count by default
geom_col(fill = "steelblue")                     # pre-summarized values
geom_bar(position = "dodge")                     # side-by-side
geom_bar(position = "fill")                      # proportional stacking
geom_bar(position = position_stack(reverse = TRUE))

# --- Histograms / Density ---
geom_histogram(bins = 30, fill = "gray70", color = "white")
geom_density(fill = "steelblue", alpha = 0.4)
geom_density(adjust = 1.5, linetype = 2)

# --- Boxplot / Violin ---
geom_boxplot(width = 0.5, outlier.shape = NA, notch = TRUE)
geom_violin(alpha = 0.5, trim = FALSE)
geom_boxplot(outlier.color = NA) + geom_jitter(width = 0.1, alpha = 0.3)

# --- Error bars / Ribbons ---
geom_errorbar(aes(ymin = lower, ymax = upper), width = 0.2)
geom_errorbarh(aes(xmin = lower, xmax = upper), height = 0.2)
geom_ribbon(aes(ymin = lower, ymax = upper), alpha = 0.3)
geom_area(fill = "lightblue", alpha = 0.5)

# --- Text ---
geom_text(aes(label = name), size = 3, check_overlap = TRUE)
geom_label(aes(label = name), size = 3, label.size = 0.3)

# --- Smooth ---
geom_smooth(method = "lm", se = TRUE, formula = y ~ x)
geom_smooth(method = "loess", span = 0.75)
geom_smooth(method = "gam", formula = y ~ s(x, bs = "cs"))

# --- Ranges ---
geom_rug(sides = "bl", alpha = 0.5)

# --- Regression components ---
geom_abline(intercept = 0, slope = 1, linetype = "dashed")
```

### 3. Statistical Transformations (Stats)

```r
# Summary statistics
stat_summary(fun = mean, geom = "point", size = 4, color = "red")
stat_summary(fun.data = mean_se, geom = "errorbar", width = 0.2)
stat_summary(fun.data = mean_cl_boot, geom = "pointrange")

# Custom function
stat_summary(fun = function(x) quantile(x, 0.95), geom = "line")

# Bin statistics
stat_bin(bins = 20, geom = "bar")
stat_bin2d(bins = 10)                             # 2D binning
stat_binhex(bins = 30)                            # hexagonal binning
stat_density_2d(aes(fill = after_stat(level)), geom = "raster")

# Quantiles
stat_quantile(quantiles = c(0.25, 0.75), geom = "ribbon")

# ECDF
stat_ecdf(geom = "step")

# QQ plot
stat_qq(aes(sample = displ)) + stat_qq_line(color = "red")

# Function plotting
stat_function(fun = dnorm, args = list(mean = 5, sd = 2))

# Count
stat_count(geom = "col", fill = "steelblue")

# Identity
stat_identity()  # = geom without transformation
```

### 4. Scales

```r
# --- Position scales ---
scale_x_continuous(name = "X", breaks = seq(0, 10, 2),
                   limits = c(0, 10), expand = expansion(mult = 0.05))
scale_y_continuous(trans = "log10", labels = scales::label_comma())
scale_x_discrete(labels = c("A" = "Alpha", "B" = "Beta"))
scale_x_reverse()
scale_y_sqrt()
scale_x_date(date_breaks = "1 month", date_labels = "%b %Y")

# --- Color scales ---
scale_color_gradient(low = "blue", high = "red")
scale_color_gradientn(colors = c("blue", "white", "red"))
scale_color_viridis_d(option = "magma")            # discrete viridis
scale_color_viridis_c(option = "plasma")           # continuous viridis
scale_color_brewer(type = "div", palette = "RdBu") # ColorBrewer
scale_color_manual(values = c("A" = "#E41A1C", "B" = "#377EB8"))
scale_color_distiller(palette = "Spectral")

# --- Fill scales (mirror color scales) ---
scale_fill_viridis_d()
scale_fill_brewer(palette = "Set2")

# --- Size / Shape / Alpha / Linetype ---
scale_size_continuous(range = c(1, 10), breaks = c(1, 5, 10))
scale_shape_manual(values = c(16, 17, 15, 18))
scale_alpha_continuous(range = c(0.1, 1.0))
scale_linetype_manual(values = c("solid", "dashed", "dotted"))

# --- Continuous transformations ---
scale_x_log10()
scale_y_log10(labels = scales::label_number(big.mark = ","))
scale_x_sqrt()
scale_y_comma()

# --- Labels ---
scale_color_discrete(labels = c("Group A", "Group B"))
scale_x_continuous(labels = scales::label_percent())
```

### 5. Faceting

```r
# facet_wrap - single variable, wrap into grid
facet_wrap(~class, ncol = 3, scales = "free_y")
facet_wrap(vars(drv, cyl), nrow = 2)
facet_wrap(~interaction(cyl, am), labeller = "label_both")

# facet_grid - two variables, rows x columns
facet_grid(rows = vars(drv), cols = vars(cyl))
facet_grid(drv ~ .)                               # rows only
facet_grid(. ~ cyl)                               # columns only
facet_grid(vars(rows), vars(cols), scales = "free", space = "free")

# Labelling
facet_wrap(~class, labeller = labeller(class = toupper))
facet_wrap(~class, labeller = label_parsed)        # parse expressions
```

### 6. Coordinates

```r
coord_flip()                                       # swap x/y
coord_fixed(ratio = 1)                             # equal aspect ratio
coord_polar(theta = "x", start = 0, direction = 1) # polar (rose, radar)
coord_trans(x = "log10", y = "log10")              # transformed coords
coord_cartesian(xlim = c(0, 10), ylim = c(0, 5))   # zoom (keeps stats)
coord_sf(crs = st_crs(4326))                        # map coordinates
coord_quickmap()                                    # approximate map aspect
coord_equal()
```

### 7. Themes

```r
# Built-in themes
theme_bw()
theme_classic()
theme_dark()
theme_void()
theme_minimal()
theme_light()
theme_linedraw()
theme_gray()          # default

# Full theme customization
theme(
  plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
  plot.subtitle = element_text(size = 12, color = "gray40", hjust = 0.5),
  plot.caption = element_text(size = 8, color = "gray50", hjust = 1),
  axis.title = element_text(size = 13),
  axis.text = element_text(size = 10, color = "gray30"),
  axis.text.x = element_text(angle = 45, hjust = 1),
  axis.ticks = element_line(color = "gray80"),
  axis.line = element_line(color = "gray60"),
  legend.title = element_text(face = "bold", size = 11),
  legend.text = element_text(size = 10),
  legend.position = c(0.8, 0.2),        # numeric position
  legend.direction = "horizontal",
  legend.background = element_rect(fill = "white", color = NA),
  legend.key = element_rect(fill = "gray95"),
  panel.grid.major = element_line(color = "gray90"),
  panel.grid.minor = element_blank(),
  panel.background = element_rect(fill = "white"),
  panel.border = element_rect(color = "gray60", fill = NA),
  plot.background = element_rect(fill = "white"),
  strip.background = element_rect(fill = "gray90"),
  strip.text = element_text(face = "bold", size = 11),
  plot.margin = margin(10, 15, 10, 15)
)

# Reusable theme
my_theme <- theme_minimal(base_size = 12) +
  theme(plot.title = element_text(face = "bold"))
```

## Comprehensive ggplot2 Extension Add-Ons

### Category 1: Plot Arrangement & Composition

#### patchwork — Combine plots like expressions
```r
library(patchwork)

p1 <- ggplot(mtcars, aes(wt, mpg)) + geom_point()
p2 <- ggplot(mtcars, aes(factor(cyl), mpg)) + geom_boxplot()
p3 <- ggplot(mtcars, aes(disp, mpg)) + geom_point()
p4 <- ggplot(mtcars, aes(qsec, mpg)) + geom_point()

# Operators: | (side-by-side), / (stack), + (collect legends)
p1 | p2
p1 / p2
(p1 | p2) / (p3 | p4)
p1 | p2 | p3 | p4

# Fine control
(p1 | p2) /
  p3 +
  plot_layout(widths = c(2, 1), heights = c(1, 2)) +
  plot_annotation(
    title = "Combined Figure",
    caption = "Source: mtcars",
    tag_levels = "A"
  ) +
  plot_annotation(theme = theme(plot.title = element_text(face = "bold")))

# Area-based layout
wrap_plots(p1, p2, p3, p4, design = layout "
  AAB
  CCB
  DDD
")
```

#### cowplot — Publication-ready plot arrangements
```r
library(cowplot)

# plot_grid
plot_grid(p1, p2, p3, p4,
  labels = c("A", "B", "C", "D"),
  ncol = 2,
  align = "h",
  rel_widths = c(1, 1.2)
)

# Add background / draw labels
ggdraw() +
  draw_plot(p1, 0, 0.5, 1, 0.5) +
  draw_plot(p2, 0.55, 0.5, 0.45, 0.5) +
  draw_plot(p3, 0, 0, 1, 0.45) +
  draw_label("(A)", x = 0.02, y = 0.97, fontface = "bold") +
  draw_label("(B)", x = 0.57, y = 0.97, fontface = "bold")

# Save with shared legend
get_legend(p1)  # extract legend
save_plot("combined.png", plot_grid(...), base_width = 10, base_height = 7)
```

#### gridExtra — Table grob arrangement
```r
library(gridExtra)

grid.arrange(p1, p2, p3, p4, ncol = 2)
arrangeGrob(p1, p2, layout_matrix = rbind(c(1, 1), c(2, 3)))  # returns grob
grid.arrange(
  textGrob("Custom Layout"),
  p1, p2,
  ncol = 2,
  layout_matrix = rbind(c(NA, NA), c(1, 2))
)
```

#### ggpubr — Publication-ready arrangements
```r
library(ggpubr)

ggarrange(p1, p2, p3, p4,
  labels = c("A", "B", "C", "D"),
  ncol = 2, nrow = 2,
  common.legend = TRUE,
  legend = "bottom"
)

# With error bars and annotations
ggexport(p1, filename = "figure.pdf", width = 8, height = 6)

# Statistical annotations directly on plots
ggplot(mpg, aes(class, hwy)) +
  geom_boxplot() +
  stat_compare_means(comparisons = list(
    c("compact", "suv"), c("midsize", "suv")
  ), method = "t.test") +
  stat_compare_means(label = "p.signif")
```

#### ggalign — Layout grammar for aligned plots (patchwork successor for complex layouts)
```r
library(ggalign)

ggplot(mpg, aes(displ, hwy)) + geom_point() +
  align_plots(
    wrap_plots(p1, p2, ncol = 1),
    p3
  )
```

### Category 2: Text, Labels & Annotations

#### ggrepel — Non-overlapping text labels
```r
library(grepel)

ggplot(mtcars, aes(wt, mpg, label = rownames(mtcars))) +
  geom_point() +
  geom_text_repel(
    size = 3,
    box.padding = 0.5,
    point.padding = 0.3,
    max.overlaps = 20,
    segment.color = "gray60",
    segment.size = 0.3,
    arrow = arrow(length = unit(0.015, "npc"))
  )

# Direct labels at specific positions
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  geom_label_repel(
    data = subset(mpg, drv == "4"),
    aes(label = model),
    size = 2.5,
    min.segment.length = 0
  )
```

#### ggtext — Rich text labels with Markdown/HTML
```r
library(ggtext)

# Markdown in labels
ggplot(mpg, aes(displ, hwy, color = class)) +
  geom_point() +
  labs(
    title = "**Fuel Efficiency** by Engine Displacement",
    subtitle = "*Data from `mpg` dataset* — points colored by class",
    x = "Engine Displacement (L)",
    y = "Highway Miles per Gallon"
  ) +
  theme(
    plot.title = element_markdown(size = 16, face = "bold"),
    plot.subtitle = element_markdown(size = 11, color = "gray40"),
    axis.title = element_markdown()
  )

# HTML in axis labels and legends
ggplot(mpg, aes(displ, hwy)) +
  geom_point(aes(color = class)) +
  scale_color_discrete(labels = ~paste0("<b>", ., "</b>")) +
  theme(axis.title = element_markdown())

# Colored inline text
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  annotate(
    "richtext",
    x = 5, y = 40,
    label = "Larger engines<br><span style='color:#E41A1C'>tend to have lower MPG</span>",
    size = 4, hjust = 0
  )

# Colorbar labels with HTML
+ labs(color = "**Cylinder Count**") +
  theme(legend.title = element_markdown())
```

#### ggtext + grid — Arrows, grobs, and icons
```r
library(ggtext)
library(grid)

ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  annotation_custom(
    rasterGrob(png::readPNG("logo.png"),
      x = unit(0.8, "npc"), y = unit(0.8, "npc"),
      width = unit(0.15, "npc")
    )
  )
```

#### ggimage — Embed images as points
```r
library(ggimage)

df <- data.frame(
  x = 1:5, y = 1:5,
  img = c("icon1.png", "icon2.png", "icon3.png", "icon4.png", "icon5.png")
)

ggplot(df, aes(x, y)) +
  geom_image(aes(image = img), size = 0.1)
```

#### ggpointdensity — Density-colored points
```r
library(ggpointdensity)

ggplot(mpg, aes(displ, hwy)) +
  geom_pointdensity(aes(color = after_stat(density)), adjust = 0.5) +
  scale_color_viridis_c()

# hexbin alternative
ggplot(mpg, aes(displ, hwy)) + geom_hex(bins = 30) + scale_fill_viridis_c()
```

### Category 3: Distributions & Statistics

#### ggdist — Distributional visualization (Bayesian/posteriors)
```r
library(ggdist)

# Interval + point + slab (eye plot)
ggplot(mtcars, aes(x = factor(cyl), y = mpg)) +
  stat_halfeye(
    aes(fill = after_stat(density)),
    .width = c(0.5, 0.8, 0.95),
    point_interval = median_qi,
    slab_alpha = 0.6
  )

# Gradient interval
ggplot(mtcars, aes(x = factor(cyl), y = mpg)) +
  stat_gradientinterval(
    aes(fill = after_stat(density)),
    .width = c(0.5, 0.8, 0.95),
    point_interval = mean_qi
  )

# Dots + intervals (quantile dotplot)
ggplot(mtcars, aes(x = factor(cyl), y = mpg)) +
  stat_dotsinterval(
    .width = c(0.5, 0.95),
    scale = 0.5
  )

# Slab + box + point combo
ggplot(mtcars, aes(x = factor(cyl), y = mpg)) +
  stat_boxinterval(
    .width = c(0.5, 0.95),
    point_size = 3
  )

# Handy references
stat_median(), stat_qi(), stat_mean_qi(), stat_mcinterval()
```

#### ggside — Marginal/conditional plots (marginal densities)
```r
library(ggside)

ggplot(mpg, aes(displ, hwy)) +
  geom_point(alpha = 0.5) +
  geom_xsidedensity(fill = "steelblue", alpha = 0.6) +
  geom_ysidedensity(fill = "coral", alpha = 0.6) +
  theme(
    ggside.panel.scales.x = "free",
    ggside.panel.scales.y = "free"
  )

# Marginal boxplots
ggplot(mpg, aes(displ, hwy, color = class)) +
  geom_point() +
  geom_xsideboxplot(aes(y = class), orientation = "y") +
  geom_ysideboxplot(aes(x = class), orientation = "x")

# With facet
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  geom_xsidedensity() +
  facet_wrap(~drv)
```

#### ggalluvial — Alluvial/Sankey diagrams
```r
library(ggalluvial)

# Basic alluvial
ggplot(as.data.frame(Titanic),
  aes(axis1 = Class, axis2 = Survived, weight = Freq)
) +
  geom_alluvium(aes(fill = Sex), width = 1/12) +
  geom_stratum(width = 1/12, fill = "gray90", color = "gray60") +
  geom_text(stat = "stratum", aes(label = after_stat(stratum)), size = 3) +
  scale_x_discrete(limits = c("Class", "Survived"), expand = c(0.15, 0.05)) +
  scale_fill_brewer(palette = "Set2") +
  labs(title = "Titanic Survival by Class") +
  theme_minimal()

# Wide format
ggplot(titanic_wide,
  aes(axis1 = Class, axis2 = Age, weight = Freq,
    fill = Sex, subgroup = Survived)
) +
  geom_alluvium(width = 1/12) +
  geom_stratum(width = 1/12) +
  geom_text(stat = "stratum", aes(label = after_stat(stratum)), size = 3)
```

#### ggmosaic — Mosaic plots
```r
library(ggmosaic)

ggplot(mpg) +
  geom_mosaic(aes(weight = hwy, x = product(drv, class), fill = drv)) +
  scale_fill_brewer(palette = "Set2") +
  labs(x = "", y = "Proportion") +
  theme_minimal()
```

#### ggcorrplot — Correlation matrix plots
```r
library(ggcorrplot)

cor_matrix <- cor(mtcars[, 1:8], use = "complete.obs")

# Square with correlation values
ggcorrplot(cor_matrix,
  method = "square",
  type = "upper",
  lab = TRUE,
  lab_size = 3,
  colors = c("#6D9EC1", "white", "#E46726"),
  title = "Correlation Matrix"
)

# With clustering
ggcorrplot(cor_matrix,
  hc.order = TRUE,
  hc.method = "ward.D2",
  type = "lower",
  lab = TRUE,
  outline.color = "white"
)
```

#### GGally — Extension of ggpairs/ggcorr/ggscatmat
```r
library(GGally)

# Pairwise scatterplot matrix with stats
ggpairs(mtcars,
  columns = c("mpg", "disp", "hp", "wt"),
  aes(color = factor(cyl)),
  upper = list(continuous = wrap("cor", size = 3)),
  lower = list(continuous = wrap("points", alpha = 0.4, size = 1)),
  diag = list(continuous = wrap("densityDiag", alpha = 0.5))
)

# Correlation with significance
ggcorr(mtcars[, 1:8], label = TRUE, label_size = 3, layout.exp = 1)

# Scatterplot matrix
ggscatmat(mtcars, columns = 1:6, color = "cyl", alpha = 0.6)
```

#### ggpubr — Statistical tests & annotations
```r
library(ggpubr)

# Paired comparisons with p-values
ggplot(mpg, aes(class, hwy)) +
  geom_boxplot() +
  stat_compare_means(method = "anova") +
  stat_compare_means(
    comparisons = list(c("compact", "suv"), c("midsize", "suv")),
    method = "t.test",
    label = "p.signif"
  )

# Wilcoxon test
stat_compare_means(method = "wilcox.test", ref.group = ".all.")

# Correlation annotation
ggscatter(mtcars, x = "wt", y = "mpg",
  add = "reg.line",
  conf.int = TRUE,
  cor.coef = TRUE,
  cor.method = "pearson",
  cor.coeff.args = list(method = "pearson", size = 4)
)

# Draw annotations
ggscatter(mtcars, x = "wt", y = "mpg") +
  stat_regline_equation(label.x = 3, label.y = 30) +
  annotate("rect", xmin = 3, xmax = 5, ymin = 15, ymax = 35,
    fill = "yellow", alpha = 0.1)
```

#### ggstatsplot — Statistical analysis + visualization
```r
library(ggstatsplot)

# One-way ANOVA with effect sizes
ggbetweenstats(
  data = mtcars,
  x = factor(cyl),
  y = mpg,
  type = "parametric",
  pairwise.display = "s",
  p.adjust.method = "holm",
  effsize.type = "g"
)

# Correlation with confidence interval
ggscatterstats(
  data = mtcars,
  x = wt,
  y = mpg,
  conf.level = 0.95,
  marginal.type = "density",
  xlab = "Weight", ylab = "MPG"
)

# Within-subject (paired) test
gwithinstats(data, x, y, type = "parametric")

# Robust tests
ggbetweenstats(..., type = "robust")  # trimmed means
```

### Category 4: Specialized Geometries

#### ggbeeswarm — Categorical scatter (swarm)
```r
library(ggbeeswarm)

ggplot(mpg, aes(class, hwy, color = drv)) +
  geom_beeswarm(cex = 3, size = 2, alpha = 0.7) +
  geom_boxplot(alpha = 0.3, width = 0.3, outlier.shape = NA)

# Quasirandom (van der Corput)
ggplot(mpg, aes(class, hwy)) +
  geom_quasirandom(aes(color = drv), width = 0.3, cex = 3)

# Grouped beeswarm
ggplot(mpg, aes(class, hwy, color = drv)) +
  geom_beeswarm(groupOnX = TRUE, dodge.width = 0.6, cex = 3)
```

#### ggridges — Joy/rank ridgeline plots
```r
library(ggridges)

# Basic ridgeline
ggplot(diamonds, aes(x = price, y = cut, fill = cut)) +
  geom_density_ridges(
    scale = 1.5,
    alpha = 0.7,
    quantile_lines = TRUE,
    quantiles = 4,
    rel_min_height = 0.01
  ) +
  scale_x_log10() +
  scale_fill_brewer(palette = "Set2") +
  labs(title = "Diamond Price Distribution by Cut") +
  theme_ridges(grid = TRUE)

# Density with jittered points
ggplot(mpg, aes(x = hwy, y = class, fill = class)) +
  geom_density_ridges(
    jittered_points = TRUE,
    position = position_points_jitter(width = 0.05, height = 0),
    point_shape = "|", point_size = 2, point_alpha = 0.5
  )

# Joyplot with facets
ggplot(diamonds, aes(price, cut, fill = cut)) +
  geom_density_ridges(bandwidth = 1000) +
  facet_wrap(~color, nrow = 1)
```

#### ggstream — Streamgraph
```r
library(ggstream)

ggplot(data, aes(x = year, y = value, fill = category)) +
  geom_stream(
    type = "ridge",
    bw = 0.6,
    alpha = 0.8,
    color = "white",
    linewidth = 0.1
  ) +
  scale_fill_brewer(palette = "Set2") +
  theme_minimal()

# Wiggle stream
geom_stream(type = "wiggle")
geom_stream(type = "silhouette")
```

#### ggchicklet — Rounded bar charts
```r
library(ggchicklet)

ggplot(mpg, aes(class, fill = class)) +
  geom_chicklet(width = 0.75, radius = unit(6, "pt")) +
  coord_flip() +
  scale_fill_viridis_d() +
  theme_minimal()
```

#### ggWaffle — Waffle/rectangle charts
```r
library(ggWaffle)

df <- data.frame(
  category = rep(c("Completed", "In Progress", "Pending"), c(45, 30, 25)),
  value = 1
)

ggplot(df, aes(fill = category)) +
  geom_waffle(
    nrow = 10,
    na.rm = TRUE,
    width = 0.9,
    height = 0.9,
    make_proportional = FALSE
  ) +
  scale_fill_manual(values = c("#2ecc71", "#f39c12", "#e74c3c")) +
  coord_equal() +
  labs(title = "Project Status") +
  theme_minimal() +
  theme(
    legend.position = "bottom",
    panel.grid = element_blank()
  )
```

#### treemapify — Treemaps
```r
library(treemapify)

# treemapify: variable mapped to area
ggplot(gdp_data, aes(area = gdp, fill = continent, label = country)) +
  geom_treemap() +
  geom_treemap_text(
    place = "centre",
    grow = TRUE,
    colour = "white",
    reflow = TRUE,
    min.size = 0.02
  ) +
  scale_fill_viridis_d()

# With borders
geom_treemap(border.col = "white", border.size = 2)
```

#### ggwordcloud / wordcloud2 — Word clouds
```r
library(ggwordcloud)

text_data <- data.frame(
  word = c("R", "ggplot2", "data", "visualization", "grammar", "graphics"),
  freq = c(50, 45, 40, 35, 30, 25)
)

ggplot(text_data, aes(label = word, size = freq)) +
  geom_text_wordcloud_area(
    shape = "circle",
    rm_outside = TRUE,
    area.colors = "white"
  ) +
  scale_size_area(max_size = 40) +
  theme_minimal()
```

#### ggdist + geom_linerange — Confidence interval plots
```r
library(ggdist)
library(ggplot2)

# Forest plot style
data.frame(
  term = c("A", "B", "C", "D"),
  estimate = c(1.2, 0.8, 1.5, -0.3),
  lower = c(0.9, 0.5, 1.1, -0.7),
  upper = c(1.5, 1.1, 1.9, 0.1)
) |>
  ggplot(aes(x = estimate, y = reorder(term, estimate))) +
  geom_vline(xintercept = 0, linetype = "dashed", color = "gray50") +
  geom_pointinterval(aes(xmin = lower, xmax = upper), size = 4, fatten_point = 2) +
  labs(x = "Effect Size", y = NULL, title = "Forest Plot") +
  theme_minimal()
```

#### ggforce — Circles, fans, arcs, facets
```r
library(ggforce)

# Circles as points
ggplot(mtcars, aes(x = wt, y = mpg, color = factor(cyl))) +
  geom_circle(aes(r = 0.3), alpha = 0.5, linewidth = 0.5) +
  geom_point(size = 1)

# Arcs (for specialized charts)
ggplot(mtcars, aes(x0 = 0, y0 = 0, r = 1, start = 0, end = pi)) +
  geom_arc_bar(aes(fill = factor(cyl)), stat = "unique")

# Facet with nested groups
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  facet_wrap_paginate(~class, ncol = 2, nrow = 2, page = 1)

# Parenthesis/square facets
facet_matrix(~mpg + cyl + disp, rows = vars(drv))

# Elastic facets (variable sizes)
facet_wrap(~class, scales = "free") +
  facetted_pos_scales(x = list(class == "2seater" ~ scale_x_log10()))
```

#### ggraph — Network/graph layouts
```r
library(ggraph)
library(tidygraph)

# Create graph
gr <- as_tbl_graph(highschool)  # built-in network

ggraph(gr, layout = "fr") +   # Fruchterman-Reingold
  geom_edge_link(aes(alpha = weight), color = "gray70") +
  geom_node_point(aes(color = school), size = 4) +
  geom_node_text(aes(label = name), repel = TRUE, size = 3) +
  theme_graph()

# Available layouts: "fr", "kk", "lgl", "dh", "mds", "nicely", 
# "circle", "grid", "stress", "focus", "manual"
ggraph(gr, layout = "stress") +
  geom_edge_link0(aes(width = weight), color = "steelblue") +
  geom_node_point(size = 5) +
  scale_edge_width(range = c(0.2, 2))
```

#### gganimate — Animations
```r
library(gganimate)

p <- ggplot(gapminder, aes(gdpPercap, lifeExp, size = pop, color = continent)) +
  geom_point(alpha = 0.7) +
  scale_x_log10() +
  labs(title = "Year: {frame_time}", x = "GDP per Capita", y = "Life Expectancy") +
  theme_minimal() +
  transition_time(year) +
  ease_aes("linear")

animate(p, nframes = 200, fps = 10, width = 800, height = 500)
anim_save("gapminder.gif")

# Transition between states
ggplot(mpg, aes(class, fill = drv)) +
  geom_bar() +
  transition_states(drv, transition_length = 2, state_length = 1) +
  enter_grow() +
  exit_fade()

# Reveal along data
ggplot(economics, aes(date, unemploy)) +
  geom_line() +
  reveal_rows(date) +
  shadow_mark(past = TRUE, future = FALSE, color = "gray")
```

#### ggmap — Map visualization
```r
library(ggmap)

# Basemap + points
register_google(key = "YOUR_API_KEY")
base <- get_map("New York City", zoom = 11, maptype = "roadmap")

ggmap(base) +
  geom_point(data = nyc_crimes, aes(longitude, latitude, color = type), alpha = 0.6) +
  scale_color_brewer(palette = "Set1")

# Choropleth
ggmap(base, fullpage = FALSE) +
  geom_polygon(
    data = neighborhoods,
    aes(long, lat, group = group, fill = population_density),
    alpha = 0.6, color = "white", linewidth = 0.3
  ) +
  scale_fill_viridis_c() +
  theme_map()
```

#### ggspatial — Spatial data on maps
```r
library(ggspatial)

ggplot() +
  annotation_map_tile(zoomin = -1) +                # OpenStreetMap tiles
  geom_sf(data = some_sf_object, aes(fill = value), alpha = 0.7) +
  scale_fill_viridis_c() +
  annotation_scale(location = "bl", width_hint = 0.5) +  # scale bar
  annotation_north_arrow(location = "tr", style = north_arrow_fancy_orienteering()) +
  coord_sf(crs = 4326) +
  theme_void()
```

#### ggalt — Extra geoms (dumbbell, slope, etc.)
```r
library(ggalt)

# Dumbbell plot
ggplot(df, aes(x = y2010, xend = y2020, y = region)) +
  geom_dumbbell(color = "gray70", size = 1.5) +
  scale_color_manual(values = c("#E41A1C", "#377EB8")) +
  labs(x = "2010", y = NULL) +
  theme_minimal()

# Slope chart
ggplot(df, aes(x = year, y = value, group = group)) +
  geom_slope()

# Encoded bars (variable-width)
ggplot(mtcars, aes(x = factor(cyl), y = mpg)) +
  geom_encoded_bar(aes(width = wt))
```

#### ggchicklet + ggmosaic — Specialty charts
```r
# Lollipop chart (base ggplot2)
ggplot(mpg, aes(x = reorder(class, hwy), y = hwy)) +
  geom_segment(aes(xend = class, y = 0, yend = hwy), color = "gray70") +
  geom_point(size = 4, color = "steelblue") +
  coord_flip() +
  theme_minimal()

# Marimekko (mosaic + bar)
library(ggmosaic)
ggplot(titanic_data) +
  geom_mosaic(aes(weight = Freq, x = product(Class, Survived), fill = Survived)) +
  scale_fill_brewer(palette = "Set1")
```

### Category 5: Color & Aesthetics

#### ggradar — Radar/spider charts
```r
library(ggradar)

# Prepare data (first column = group name, rest = values)
df_radar <- data.frame(
  label = c("Group A", "Group B"),
  Speed = c(0.8, 0.6),
  Strength = c(0.7, 0.9),
  Intelligence = c(0.9, 0.7),
  Agility = c(0.6, 0.8),
  Luck = c(0.5, 0.7)
)

ggplot(df_radar, aes(group = label)) +
  geom_ggradar(
    aes(fill = label, color = label),
    geom_polygon = list(alpha = 0.15, linewidth = 1.2),
    point_size = 3,
    legend.position = "bottom"
  ) +
  scale_fill_manual(values = c("#E41A1C", "#377EB8")) +
  scale_color_manual(values = c("#E41A1C", "#377EB8")) +
  labs(title = "Group Comparison") +
  theme_minimal()
```

#### colorspace — Perceptually-based palettes
```r
library(colorspace)

# Qualitative
scale_fill_disqualitative(palette = "dynamic")
scale_color_disqualitative()

# Sequential (perceptually uniform)
scale_fill_sequential(palette = "viridis")
scale_color_sequential_hcl(palette = "Blues 3")

# Diverging
scale_fill_divergingx(palette = "Blue-Red 3")
scale_color_diverging_hcl(palette = "Blue-Red")

# Direct palette functions
qualitative_hcl(n = 5, palette = "Dark 3")
sequential_hcl(n = 5, palette = "Viridis")
diverging_hcl(n = 5, palette = "Blue-Red")
```

#### ggsci — Journal/science color palettes
```r
library(ggsci)

scale_color_npg()          # Nature Publishing Group
scale_fill_npg()
scale_color_aaas()         # American Association for Advancement of Science
scale_fill_aaas()
scale_color_lancet()       # The Lancet
scale_fill_lancet()
scale_color_jama()         # JAMA
scale_fill_jama()
scale_color_nejm()         # New England Journal of Medicine
scale_fill_nejm()
scale_color_igv()          # Integrative Genomics Viewer
scale_fill_igv()
scale_color_d3()           # D3.js categorical
scale_fill_d3()
scale_color_locuszoom()    # Genome-wide association
scale_color_startrek()     # Star Trek
scale_color_rickandmorty() # Rick and Morty
scale_color_simpsons()     # The Simpsons
```

#### ggthemes — Extended themes and palettes
```r
library(ggthemes)

# Themes
theme_economist()
theme_fivethirtyeight()
theme_tufte()
theme_excel()
theme_solarized()
theme_gdocs()
theme_wsj()                 # Wall Street Journal
theme_par()
theme_map()
theme_hc()                  # Highcharts

# Palettes
scale_color_economist()
scale_color_fivethirtyeight()
scale_color_stata()
scale_color_excel()
scale_color_tableau()
scale_color_pander()
```

#### ggprism — Prism/graphpad style
```r
library(ggprism)

ggplot(mpg, aes(class, hwy)) +
  geom_boxplot() +
  scale_y_continuous(prism_breaks(c(10, 20, 30, 40))) +
  theme_prism(base_size = 12) +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Prism palettes
scale_fill_prism(palette = "dark_matter")
scale_color_prism(palette = "beach")
```

#### MetBrewer — Met Museum art-inspired palettes
```r
library(MetBrewer)

scale_fill_met_d(name = "Vermeer")         # Discrete
scale_fill_met_c(name = "Cassatt2")        # Continuous
scale_color_met_d(name = "Hokusai")
scale_color_met_c(name = "VanGogh3")

# Palette options: "Vermeer", "Cassatt2", "Hokusai", "VanGogh3",
# "Kandinsky", "Munch", "Renoir", "Rousseau", "Signac", "Matisse", etc.
```

#### palettetown — Pokemon color palettes
```r
library(palettetown)

scale_fill_pt(pokemon = "charizard")
scale_color_pt(pokemon = "pikachu")
scale_fill_pt(pokemon = "bulbasaur")
```

### Category 6: Facet Extensions

#### ggh4x — Advanced faceting & scale control
```r
library(ggh4x)

# Nested facets (hierarchical)
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  facet_nested(~ drv + cyl)  # nested hierarchy

# Facetted scale transformations (different scales per facet)
ggplot(data, aes(x, y)) +
  geom_point() +
  facet_wrap(~group) +
  facetted_pos_scales(
    x = list(group == "A" ~ scale_x_log10(),
             group == "B" ~ scale_x_reverse())
  )

# Facetted plot margins
facet_wrap(~class) +
  facetted_pos_scales(
    y = list(class == "2seater" ~ scale_y_continuous(expand = expansion(mult = 0.2)))
  )

# Double/triple axis
ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  scale_x_continuous(sec.axis = dup_axis()) +
  scale_y_continuous(sec.axis = dup_axis(name = "Secondary Y"))

# Strips outside
facet_wrap(~class) +
  strip_themed(
    outside = element_text(angle = 0),
    strip = elem_list_text(color = c("red", "blue", "green"))
  )
```

#### facets & facetted_pos_scales — Free scales per facet
```r
library(ggh4x)

ggplot(mpg, aes(displ, hwy)) +
  geom_point() +
  facet_wrap(~drv, scales = "free") +
  facetted_pos_scales(x = list(drv == "f" ~ scale_x_log10()))
```

### Category 7: Interactive & Animated

#### plotly (ggplotly) — Convert to interactive
```r
library(plotly)

p <- ggplot(mpg, aes(displ, hwy, color = class)) +
  geom_point(size = 3) +
  geom_smooth(method = "lm") +
  theme_minimal()

# Convert
ggplotly(p, tooltip = c("x", "y", "color"))

# Or build with plotly directly
ggplotly(p) %>%
  layout(hoverlabel = list(bgcolor = "white"))
```

#### plotly + highlight — Interactive brushing
```r
library(plotly)

p <- ggplot(mpg, aes(displ, hwy, color = class, text = model)) +
  geom_point()

ggplotly(p, tooltip = "text") %>%
  highlight(on = "plotly_click", off = "plotly_doubleclick",
    opacityDim = 0.1, color = "red")
```

#### gganimate (see above) — Animations
```r
library(gganimate)

# GIF
ggplot(...) +
  transition_time(year) +
  enter_grow() + exit_fade() +
  labs(title = "Year: {frame_time}")

anim_save("animation.gif", animation = last_animation())
```

#### esquisse — GUI for building ggplot2 code
```r
library(esquisse)

esquisse::esquisse()  # Launches drag-and-drop builder
# Generates ggplot2 code you can copy and refine
```

### Category 8: Tables & Reporting

#### gt — Publication-quality tables
```r
library(gt)

mtcars %>%
  rownames_to_column("model") %>%
  gt() %>%
  tab_header(title = "Motor Trend Car Road Tests") %>%
  fmt_number(columns = c(mpg, disp, hp), decimals = 1) %>%
  tab_style(
    style = cell_fill(color = "lightblue"),
    locations = cells_body(columns = mpg, rows = mpg > 25)
  ) %>%
  tab_source_note(source_note = "Source: mtcars") %>%
  tab_options(table.font.size = 12)

# Pair with ggplot2 via patchwork/patchwork + gt (use gt_output in Shiny)
```

#### kableExtra — HTML/LaTeX tables
```r
library(kableExtra)

mtcars %>%
  kbl(caption = "Motor Trend Data") %>%
  kable_styling(bootstrap_options = c("striped", "hover", "condensed")) %>%
  column_spec(1, bold = TRUE) %>%
  row_spec(1:5, background = "lightyellow") %>%
  footnote(general = "Source: R datasets")
```

#### reactable (for Shiny interactive tables)
```r
library(reactable)

reactable(mtcars,
  columns = list(
    mpg = colDef(format = colFormat(digits = 1)),
    cyl = colDef(aggregate = "sum", footer = function(x) sum(x))
  ),
  defaultSorted = "mpg",
  defaultPageSize = 10,
  striped = TRUE,
  highlight = TRUE,
  resizable = TRUE
)
```

## Working with ggplot2 in Different Environments

### R Markdown / Quarto

````markdown
```{r setup}
library(ggplot2)
knitr::opts_chunk$set(fig.width = 8, fig.height = 5, dpi = 300)
```

```{r plot, fig.cap="A caption", fig.align="center", out.width="80%"}
ggplot(mpg, aes(displ, hwy)) + geom_point() + theme_minimal()
```
````

### Shiny

```r
# server.R
output$my_plot <- renderPlot({
  ggplot(filtered_data(), aes(x, y, color = group)) +
    geom_point(size = input$point_size) +
    geom_smooth(method = input$method) +
    theme_minimal()
})
```

### Export Options

```r
# ggsave with specific devices
ggsave("plot.png", dpi = 300, width = 10, height = 6)
ggsave("plot.pdf", device = cairo_pdf, width = 10, height = 6)
ggsave("plot.tiff", dpi = 600, compression = "lzw")
ggsave("plot.svg", width = 10, height = 6)

# Use ragg for high-quality raster output
library(ragg)
ggsave("plot.png", device = ragg::agg_png, res = 300, width = 10, height = 6)
```

## Common ggplot2 Uses

- **Exploratory Data Analysis** — Quick distribution/correlation plots
- **Statistical Reporting** — Confidence intervals, p-values, effect sizes
- **Publication Figures** — Multi-panel, journal-formatted graphics
- **Dashboards** — Paired with Shiny, Quarto, or Flexdashboard
- **Maps** — ggmap, ggspatial, sf integration
- **Networks** — ggraph for graph/network visualization
- **Animations** — gganimate for time-series and state transitions
- **Bayesian** — ggdist for posterior distributions

## ggplot2 Advantages

- **Grammar of Graphics** — Consistent, composable, declarative
- **Layered Design** — Add/modify layers without rewriting code
- **Extension Ecosystem** — 100+ extension packages (ggplot2-exts)
- **Publication Quality** — Fine control over every element
- **Consistency** — Same grammar across all geoms/stats/scales
- **Community** — Tidyverse, RStudio/Posit, StackOverflow support

## ggplot2 Pitfalls

- **Steep Learning Curve** — Grammar concepts take time to internalize
- **Performance** — Slow for >100k points without optimizations
- **Extension Conflicts** — Loading order matters; masking functions
- **Debugging** — Layer errors can be cryptic; check `last_plot()` and `layer_data()`
- **Interactivity** — Static output; requires plotly/ggiraph conversion
- **Dynamic Legends** — Complex guide control requires learning `guides()`/`guide_*()`

## Awesome ggplot2 Resources

- **[ggplot2 Docs](https://ggplot2.tidyverse.org)** — Official reference
- **[ggplot2 Book (3e)](https://ggplot2-book.org)** — Hadley Wickham's online book
- **[R Graphics Cookbook](https://r-graphics.org)** — 100+ practical recipes
- **[ggplot2 Extensions](https://exts.ggplot2.tidyverse.org/gallery.html)** — Official extension gallery
- **[R Graph Gallery](https://r-graph-gallery.com)** — 100+ ggplot2 examples
- **[Data Visualization: A Practical Introduction](https://socviz.co)** — Kieran Healy (free)
- **[Fundamentals of Data Visualization](https://clauswilke.com/dataviz/)** — Claus Wilke (free)
- **[ggplot2 Cheatsheet](https://github.com/rstudio/cheatsheets/blob/main/data-visualization-2.1.pdf)** — Posit cheatsheet
- **[Extension Cheatsheet](https://github.com/rstudio/cheatsheets/blob/main/ggplot2-extensions.pdf)** — Extensions cheatsheet
- **[Thomas Lin Pedersen](https://www.thomasp85.com)** — patchwork, gganimate, ggraph author
- **[David Robinson's ggplot2 Guide](https://twitter.com/drob/status/1487288477876463618)** — Quick reference
- **[patchwork](https://patchwork.data-imaginist.com)** — Plot composition
- **[ggdist](https://mjskay.github.io/ggdist/)** — Distribution visualization
- **[ggraph](https://ggraph.data-imaginist.com)** — Networks
- **[gganimate](https://gganimate.com)** — Animations

## ggplot2 vs Other R Plotting

| Feature | ggplot2 | Base R | Lattice | plotly |
|---------|---------|--------|---------|--------|
| Paradigm | Grammar of Graphics | Imperative | Trellis | Declarative/Imperative |
| Learning Curve | Medium | Low (basic) | Medium | Medium |
| Customization | Very High | Very High | Medium | High |
| Interactivity | Via extensions | Limited | Limited | Native |
| Extensions | 100+ | Some | Few | Many |
| Publication | Excellent | Good | Good | Good |
| Composability | patchwork/cowplot | gridExtra | — | subplot |

## ggplot2 Quick Checklist

1. **Start** — `ggplot(data, aes(x, y))` then add layers with `+`
2. **Geoms** — Choose the right geom for your data type
3. **Stats** — Understand which stats run by default for each geom
4. **Scales** — Control axes, colors, sizes, shapes explicitly
5. **Facets** — Use small multiples before overloading aesthetics
6. **Themes** — Use `theme_*()` as base; customize with `theme()`
7. **Labels** — Always set `labs()` for title, axes, caption
8. **Legends** — Control with `guides()` and `legend.position`
9. **Save** — Use `ggsave()` with explicit width, height, dpi
10. **Extend** — Check the extension gallery before writing custom code

---

*Last updated: 2024 | ggplot2 3.5+ compatible*
