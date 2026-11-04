# ggplot2 Cheatsheet - Quick Reference

A quick reference for ggplot2 functions, aesthetics, and common patterns.

---

## 1. Basic Plot Structure

```r
# Basic structure
ggplot(data = df, mapping = aes(x = x_var, y = y_var)) +
  geom_<type>() +
  scale_<aesthetic>_<type>() +
  labs(title = "Title", x = "X", y = "Y") +
  theme_minimal()

# Pipe-friendly
df |> ggplot(aes(x, y)) + geom_point()
```

---

## 1. Geometries (geom_*)

### Points
```r
geom_point(aes(x, y, color = var, size = var, shape = var, alpha = var))
geom_jitter(width = 0.2, height = 0)
geom_count()  # Count overlapping points
geom_rug(sides = "bl", alpha = 0.5)  # Rug plots
```

### Lines & Paths
```r
geom_line(aes(group = group), linewidth = 1, linetype = "solid")
geom_step(direction = "hv")  # Step function
geom_path()  # Connect in data order
geom_segment(aes(x = x1, y = y1, xend = x2, yend = y2))
geom_segment(aes(x = x, y = y, xend = x + dx, yend = y + dy), arrow = arrow())
```

### Bars & Columns
```r
# Counts
geom_bar(aes(fill = group), position = "stack")
geom_bar(position = "dodge")  # grouped
geom_bar(position = "fill")   # proportions

# Values
geom_col(aes(y = value), fill = "steelblue")
geom_col(position = "dodge")

# Error bars
geom_errorbar(aes(ymin = lower, ymax = upper), width = 0.2)
```

### Distributions
```r
# Continuous
geom_histogram(bins = 30, binwidth = 1, fill = "steelblue")
geom_density(alpha = 0.5, fill = "blue")
geom_freqpoly(bins = 30, aes(color = group))
geom_density_ridges(aes(fill = group), alpha = 0.7)  # ggridges

# Box/Violin
geom_boxplot(outlier.shape = NA, outlier.alpha = 0)
geom_violin(trim = TRUE, scale = "area")
geom_violin(aes(fill = group), alpha = 0.5) + geom_boxplot(width = 0.1)

# Dot plot
geom_dotplot(binaxis = "y", stackdir = "center", dotsize = 0.5)
```

### Ribbons & Areas
```r
geom_ribbon(aes(ymin = lower, ymax = upper), fill = "blue", alpha = 0.2)
geom_area(aes(fill = group), position = "stack", alpha = 0.5)
geom_area(position = "fill")  # 100% stacked
```

### Specialized
```r
# Hex/2D bin for dense scatter
geom_hex(bins = 30) + scale_fill_viridis_c()
geom_bin2d(bins = 30) + scale_fill_viridis_c()

# Text labels
geom_text(aes(label = label), size = 3, hjust = 0, vjust = 0)
geom_text_repel()  # ggrepel
geom_label()  # with background

# Annotation
annotate("text", x = 5, y = 10, label = "Note", size = 4)
annotate("segment", x = 1, xend = 3, y = 5, yend = 7, arrow = arrow())
annotate("rect", xmin = 2, xmax = 4, ymin = 5, ymax = 7, alpha = 0.2, fill = "yellow")
```

---

## 2. Aesthetics (aes())

### Mapping Variables
```r
aes(x = var1, y = var2)                    # Position
aes(color = var)                           # Color
aes(fill = var)                            # Fill
aes(size = var)                            # Size
aes(shape = var)                           # Shape (discrete)
aes(alpha = var)                           # Transparency
aes(linetype = var)                        # Line type
aes(linewidth = var)                       # Line width
aes(group = var)                           # Grouping
aes(order = var)                           # Layer order

# Grouping
aes(group = interaction(var1, var2))

# Calculated aesthetics
aes(x = x, y = stat(density))  # In stat_*()
```

### Setting vs Mapping
```r
# Mapping (inside aes) - varies with data
aes(color = variable)

# Setting (outside aes) - constant
geom_point(color = "red", size = 2)

# Manual scale for mapped aesthetics
scale_color_manual(values = c("A" = "red", "B" = "blue"))
```

---

## 3. Scales (scale_*)

### Continuous Scales
```r
# Position
scale_x_continuous(limits = c(0, 100), breaks = seq(0, 100, 10))
scale_x_log10()
scale_x_reverse()
scale_x_sqrt()

# Color/Fill continuous
scale_color_viridis_c(option = "plasma", direction = -1)
scale_fill_viridis_c(option = "viridis")
scale_color_gradient(low = "blue", high = "red")
scale_color_gradient2(low = "blue", mid = "white", high = "red", midpoint = 0)
scale_color_gradientn(colors = c("blue", "white", "red"))

# Date/Time
scale_x_date(date_labels = "%b %Y", date_breaks = "1 month")
scale_x_datetime(date_labels = "%H:%M", date_breaks = "2 hours")
```

### Discrete Scales
```r
# Color/Fill
scale_color_brewer(palette = "Set1")
scale_fill_brewer(palette = "Set2")
scale_color_viridis_d(option = "plasma")
scale_fill_viridis_d(option = "viridis")

# Manual
scale_color_manual(values = c("A" = "red", "B" = "blue", "C" = "green"))
scale_fill_manual(values = c("A" = "#FF0000", "B" = "#0000FF"))

# Shape
scale_shape_manual(values = c(16, 17, 18, 15))
scale_shape(solid = TRUE)  # Hollow shapes for fill

# Size
scale_size_continuous(range = c(1, 10))
scale_size_area(max_size = 10)

# Alpha
scale_alpha_continuous(range = c(0.2, 1))
```

### Scale Options
```r
scale_x_continuous(
  name = "X Axis",
  breaks = c(0, 50, 100),
  labels = c("Low", "Medium", "High"),
  limits = c(0, 100),
  expand = expansion(mult = c(0.05, 0.05)),
  trans = "log10"
)

# Remove axis
scale_x_continuous(guide = "none")
theme(axis.title.x = element_blank(), axis.text.x = element_blank())
```

---

## 3. Themes (theme())

### Built-in Themes
```r
theme_gray()       # Default
theme_bw()         # Black & white
theme_minimal()    # Minimal
theme_classic()    # Classic
theme_light()      # Light
theme_dark()       # Dark
theme_void()       # No axes/grid
theme_test()       # For testing

# Global theme
theme_set(theme_bw(base_size = 12, base_family = "Roboto Condensed"))
```

### Custom Theme
```r
my_theme <- theme_bw(base_size = 12, base_family = "Roboto Condensed") %+replace%
  theme(
    plot.title = element_text(face = "bold", size = 16, hjust = 0.5, margin = margin(0, 0, 10, 0)),
    plot.subtitle = element_text(size = 12, hjust = 0.5, margin = margin(0, 0, 10, 0)),
    plot.caption = element_text(hjust = 0, size = 9),
    axis.title = element_text(face = "bold", size = 11),
    axis.text = element_text(size = 10),
    legend.position = "top",
    legend.title = element_text(face = "bold"),
    panel.grid.minor = element_blank(),
    panel.grid.major = element_line(color = "gray90"),
    strip.background = element_rect(fill = "gray95"),
    strip.text = element_text(face = "bold")
  )

# Apply
ggplot(...) + my_theme
```

### Common Theme Elements
```r
theme(
  # Text
  plot.title = element_text(face = "bold", size = 16, hjust = 0.5, margin = margin(0, 0, 10, 0)),
  plot.subtitle = element_text(size = 12, hjust = 0.5, margin = margin(0, 0, 10, 0)),
  plot.caption = element_text(hjust = 0, size = 9),
  plot.title.position = "plot",  # "panel" (default) or "plot"
  plot.caption.position = "plot",

  # Axes
  axis.title = element_text(face = "bold", size = 11),
  axis.title.x = element_text(margin = margin(t = 10)),
  axis.title.y = element_text(margin = margin(r = 10)),
  axis.text = element_text(size = 10),
  axis.text.x = element_text(angle = 45, hjust = 1, vjust = 1),
  axis.ticks = element_line(color = "gray80"),
  axis.ticks.length = unit(3, "pt"),

  # Legend
  legend.position = "top",  # "right", "bottom", "left", "none", c(0.8, 0.2)
  legend.title = element_text(face = "bold"),
  legend.text = element_text(size = 10),
  legend.key = element_rect(fill = NA),
  legend.key.size = unit(1, "lines"),
  legend.background = element_rect(fill = "white", color = NA),

  # Panel
  panel.background = element_rect(fill = "white", color = NA),
  panel.grid.major = element_line(color = "gray90", linewidth = 0.5),
  panel.grid.minor = element_line(color = "gray95", linewidth = 0.25),
  panel.grid.major.x = element_blank(),
  panel.border = element_rect(fill = NA, color = "gray80"),

  # Strips (facets)
  strip.background = element_rect(fill = "gray95"),
  strip.text = element_text(face = "bold", size = 10),

  # Plot
  plot.background = element_rect(fill = "white", color = NA),
  plot.margin = margin(10, 10, 10, 10)  # t, r, b, l
)
```

### Element Functions
```r
element_text(face = c("plain", "bold", "italic", "bold.italic"), 
             size = 12, color = "black", hjust = 0.5, vjust = 0.5,
             angle = 0, lineheight = 1.2, margin = margin())

element_line(color = "black", linewidth = 0.5, linetype = 1, lineend = "butt")

element_rect(fill = "white", color = "black", linewidth = 0.5, linetype = 1)

element_blank()  # Remove element
```

---

## 4. Faceting

### facet_wrap
```r
facet_wrap(~ var, ncol = 3, nrow = 2)
facet_wrap(~ var, scales = "free_y")  # free_x, free_y, free
facet_wrap(~ var, labeller = label_both)  # Show variable name
facet_wrap(~ var, labeller = label_parsed)  # Parse expressions

# Custom labeller
facet_wrap(~ var, labeller = as_labeller(c("A" = "Group A", "B" = "Group B")))
```

### facet_grid
```r
facet_grid(row_var ~ col_var)
facet_grid(row_var ~ col_var, scales = "free")
facet_grid(. ~ col_var)  # Only columns
facet_grid(row_var ~ .)  # Only rows

# Margins
facet_grid(row ~ col, margins = TRUE)
facet_grid(row ~ col, margins = "row_var")
```

### Labellers
```r
library(ggplot2)
facet_grid(~ var, labeller = label_both)       # var = value
facet_grid(~ var, labeller = label_parsed)     # Parse expressions
facet_grid(~ var, labeller = label_value)      # Just values
facet_grid(~ var, labeller = label_context)    # Context-dependent

# Custom labeller
facet_wrap(~ var, labeller = as_labeller(c(
  "a" = "Group A",
  "b" = "Group B"
)))
```

---

## 5. Coordinates

```r
# Cartesian (default)
coord_cartesian(xlim = c(0, 100), ylim = c(0, 100), expand = TRUE, clip = "on")

# Fixed aspect ratio
coord_fixed(ratio = 1, xlim = NULL, ylim = NULL)

# Flipped
coord_flip()

# Polar
coord_polar(theta = "x", start = 0, direction = 1)

# Transformed
coord_trans(x = "log10", y = "sqrt")
coord_trans(x = "log10")

# Map projections
coord_map("mercator")
coord_quickmap()  # Fast approximation

# Limits without clipping
coord_cartesian(xlim = c(0, 100), clip = "off")
```

---

## 6. Faceting Helpers

```r
# Force same scales
facet_wrap(~ var, scales = "fixed")  # default

# Free scales
facet_wrap(~ var, scales = "free_y")

# Strip position
facet_wrap(~ var, strip.position = "top")  # "bottom", "left", "right"

# Switch strips
facet_grid(row ~ col, switch = "y")  # "x", "both"
```

---

## 7. Legends (guides)

```r
# Remove legend
theme(legend.position = "none")
guides(color = "none", fill = "none")

# Position
theme(legend.position = c(0.8, 0.2))  # Inside plot
theme(legend.position = "top")  # "right", "bottom", "left", "none"

# Legend direction
guides(color = guide_legend(direction = "horizontal"))

# Legend title
guides(color = guide_legend(title = "Custom Title"))
labs(color = "Custom Title")

# Legend layout
guides(color = guide_legend(nrow = 2, byrow = TRUE))
guides(color = guide_legend(ncol = 3))

# Reverse legend
guides(color = guide_legend(reverse = TRUE))

# Override aesthetics
guides(color = guide_legend(override.aes = list(
  size = 3,
  linetype = 1,
  shape = 16
)))

# Legend key
theme(legend.key = element_rect(fill = NA, color = NA))
theme(legend.key.size = unit(1, "cm"))
theme(legend.key.width = unit(1, "cm"))
theme(legend.key.height = unit(0.5, "cm"))
```

---

## 8. Annotations & Text

```r
# Geom text
geom_text(aes(label = label), size = 3, hjust = 0, vjust = 0)
geom_text_repel()  # ggrepel

# Labels with background
geom_label(aes(label = label), fill = "white", label.size = 0.5)

# Annotate (fixed)
annotate("text", x = 5, y = 10, label = "Note", size = 5)
annotate("segment", x = 2, xend = 4, y = 5, yend = 10, 
         arrow = arrow(length = unit(2, "mm")))
annotate("rect", xmin = 2, xmax = 4, ymin = 5, ymax = 9, 
         alpha = 0.2, fill = "yellow")

# Rich text (ggtext)
library(ggtext)
theme(plot.title = element_markdown())
labs(title = "**Bold** and *italic* with <span style='color:red'>color</span>") +
  theme(plot.title = element_markdown())
```

---

## 9. Saving & Export

```r
# ggsave (recommended)
ggsave("plot.png", plot = p, width = 8, height = 6, dpi = 300)
ggsave("plot.pdf", width = 8, height = 6, device = cairo_pdf)

# Multiple formats
ggsave("plot.png", p, width = 8, height = 6, dpi = 300)
ggsave("plot.pdf", p, width = 8, height = 6, device = cairo_pdf)
ggsave("plot.svg", p, width = 8, height = 6)

# Multiple formats
walk(c("png", "pdf", "svg"), ~ ggsave(paste0("plot.", .x), p, width = 8, height = 6))

# Base R export
png("plot.png", width = 800, height = 600)
print(p)
dev.off()
```

---

## Quick Reference: Complete Pipeline

```r
# Full pipeline example
df |> 
  ggplot(aes(x = x, y = y, color = group)) +
  geom_point(alpha = 0.6, size = 2) +
  geom_smooth(method = "lm", se = FALSE, color = "black") +
  scale_color_viridis_d(option = "plasma") +
  scale_x_log10() +
  labs(
    title = "Main Title",
    subtitle = "Subtitle",
    x = "X Axis",
    y = "Y Axis",
    color = "Group",
    caption = "Source: Data"
  ) +
  theme_minimal(base_size = 12, base_family = "Roboto Condensed") +
  theme(
    legend.position = "top",
    plot.title.position = "plot",
    panel.grid.minor = element_blank()
  ) +
  ggsave("plot.png", width = 8, height = 6, dpi = 300)
```

---

## Key Package Ecosystem

| Category | Packages |
|----------|----------|
| **Core** | ggplot2, scales, ggplot2 |
| **Extensions** | ggrepel, gghighlight, ggh4x, ggforce, ggridges, ggiraph |
| **Color** | viridis, scico, rcartocolor, ggsci, paletteer, prismatic |
| **Themes** | ggthemes, hrbrthemes, cowplot, ggthemr |
| **Faceting** | ggh4x, lemon, facetious |
| **Text** | ggtext, ggfittext, ggrepel, ggwordcloud |
| **Interactive** | plotly, ggiraph, highcharter, echarts4r |
| **Animation** | gganimate, gganimate |

---

## Quick Reference: Common Tasks

| Task | Code |
|------|------|
| Change theme | `+ theme_bw()` / `+ theme_minimal()` |
| Change colors | `+ scale_color_viridis_d()` / `scale_fill_viridis_c()` |
| Move legend | `+ theme(legend.position = "top")` |
| Remove legend | `+ theme(legend.position = "none")` |
| Rotate x labels | `+ theme(axis.text.x = element_text(angle = 45, hjust = 1))` |
| Facet | `+ facet_wrap(~ var)` |
| Two y-axes | `sec_axis(~ . * factor)` |
| Log scale | `+ scale_x_log10()` |
| Date axis | `+ scale_x_date(date_labels = "%b %Y")` |
| Save plot | `ggsave("plot.png", width=8, height=6, dpi=300)` |

---

*Last updated: 2024-11-04*
*Based on: [Cedric Scherer's ggplot2 Tutorial](https://www.cedricscherer.com/2019/08/05/a-ggplot2-tutorial-for-beautiful-plotting-in-r/)*