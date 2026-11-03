# ggplot2 Tutorial - Beautiful Plotting in R

A comprehensive guide to creating beautiful, publication-ready plots with ggplot2, incorporating the excellent tutorial by [Cedric Scherer](https://www.cedricscherer.com/2019/08/05/a-ggplot2-tutorial-for-beautiful-plotting-in-r/).

## 1. Introduction to ggplot2

ggplot2 is a system for declaratively creating graphics based on [The Grammar of Graphics](https://link.springer.com/chapter/10.1007/978-3-642-21551-3_13). You provide the data, tell ggplot2 how to map variables to aesthetics, what graphical primitives to use, and it takes care of the details.

### Core Components (The Grammar of Graphics)

A ggplot is built up from these basic elements:

| Element | Function | Description |
|---------|----------|-------------|
| **Data** | `ggplot(data = df)` | The raw data to plot |
| **Geometries** | `geom_*()` | Geometric shapes (points, lines, bars, etc.) |
| **Aesthetics** | `aes()` | Mapping variables to visual properties (x, y, color, size, shape, alpha) |
| **Scales** | `scale_*()` | Maps data values to aesthetic values |
| **Stats** | `stat_*()` | Statistical transformations (smoothing, binning, etc.) |
| **Coordinates** | `coord_*()` | Coordinate systems (cartesian, polar, map) |
| **Facets** | `facet_*()` | Small multiples / small multiples |
| **Themes** | `theme()` | Non-data visual elements |

### Basic ggplot Structure
```r
ggplot(data = df, aes(x = var1, y = var2)) +
  geom_point() +
  labs(title = "Title", x = "X Label", y = "Y Label") +
  theme_minimal()
```

---

## 2. Getting Started

### Setup
```r
# Load packages
library(ggplot2)
# library(tidyverse)  # includes ggplot2

# Load the dataset used in this tutorial
chic <- readr::read_csv("https://cedricscherer.com/data/chicago-nmmaps-custom.csv")

# Quick look at data
tibble::glimpse(chic)
```

### Dataset Overview (Chicago NMMAPS)
- **1,461 rows** (daily data for Chicago, 1997-2000)
- **Variables**: city, date, temp, o3, dewpoint, pm10, season, yday, month, year

---

## 3. Building Your First Plot

### The Three Essentials
Every ggplot needs three things:
1. **Data** - `ggplot(chic, ...)`
2. **Aesthetics** - `aes(x = date, y = temp)`
3. **Geometry** - `geom_point()`, `geom_line()`, etc.

```r
# Basic ggplot object (no geometry yet)
(g <- ggplot(chic, aes(x = date, y = temp)))

# Add geometry - scatter plot
g + geom_point()

# Line plot
g + geom_line()

# Combine geometries
g + geom_line() + geom_point()
```

**Key insight**: Use parentheses to print immediately: `(g <- ggplot(...))`

---

## 4. Working with Geometries

### Changing Geometry Properties
```r
# Inside geom_*()
ggplot(chic, aes(x = date, y = temp)) +
  geom_point(color = "firebrick", shape = "diamond", size = 2)

# Different properties per geom
ggplot(chic, aes(x = date, y = temp)) +
  geom_point(color = "firebrick", shape = "diamond", size = 2) +
  geom_line(color = "firebrick", linetype = "dotted", linewidth = 0.3)

# ggplot2 understands both color/colour
ggplot(chic, aes(x = date, y = temp)) +
  geom_point(colour = "firebrick")
```

### Color Options
```r
# Named colors
color = "firebrick"
color = "dodgerblue4"

# Hex codes
color = "#FF3030"

# RGB
color = rgb(1, 0, 0, alpha = 0.5)

# Full list: http://www.stat.columbia.edu/~tzheng/files/Rcolor.pdf
```

---

## 5. Working with Axes

### Axis Titles
```r
# Via labs()
ggplot(chic, aes(x = date, y = temp)) +
  geom_point(color = "firebrick") +
  labs(x = "Year", y = "Temperature (°F)")

# Expression for symbols
ggplot(chic, aes(x = date, y = temp)) +
  geom_point(color = "firebrick") +
  labs(x = "Year", y = expression(paste("Temperature (", degree ~ F, ")")))
```

### Axis Title Positioning
```r
# vjust (vertical justification)
theme(axis.title.x = element_text(vjust = 0, size = 15),
      axis.title.y = element_text(vjust = 2, size = 15))

# Using margins (more precise)
theme(
  axis.title.x = element_text(margin = margin(t = 10), size = 15),
  axis.title.y = element_text(margin = margin(r = 10), size = 15)
)
# margin(t, r, b, l) - remember: "t-r-o-u-b-l-e"
```

### Axis Title Styling
```r
theme(
  axis.title = element_text(size = 15, color = "firebrick", face = "italic"),
  axis.title.x = element_text(color = "sienna", size = 15),
  axis.title.y = element_text(color = "orangered", size = 15)
)

# Bold and italic
face = "bold.italic"
```

### Axis Text (Numbers/Labels)
```r
theme(
  axis.text = element_text(color = "dodgerblue", size = 12),
  axis.text.x = element_text(face = "italic")
)
```

### Rotate Axis Text
```r
theme(axis.text.x = element_text(angle = 50, vjust = 1, hjust = 1, size = 12))
```

### Remove Axis Elements
```r
# Remove axis text
theme(axis.text.y = element_blank())

# Remove ticks
theme(axis.ticks.y = element_blank())

# Remove axis titles
labs(x = NULL, y = "")  # NULL removes, "" keeps space
```

### Axis Limits
```r
# ylim (subsets data - REMOVES points outside)
ylim(c(0, 50))

# coord_cartesian (zooms - keeps data)
coord_cartesian(ylim = c(0, 50))

# expand_limits (force to include)
expand_limits(x = 0, y = 0)

# Force origin at (0,0)
coord_cartesian(expand = FALSE, clip = "off") +
expand_limits(x = 0, y = 0)
```

### Force Origin at (0,0)
```r
ggplot(chic_high, aes(x = temp, y = o3)) +
  geom_point(color = "darkcyan") +
  expand_limits(x = 0, y = 0) +
  coord_cartesian(expand = FALSE, clip = "off")
# clip = "off" allows drawing outside panel
```

### Equal Scales
```r
coord_fixed()           # ratio = 1
coord_fixed(ratio = 1/5) # y units 5x x units
```

### Label Functions
```r
scale_y_continuous(
  label = function(x) paste(x, "Degrees Fahrenheit")
)
```

---

## 6. Working with Titles

### Adding Titles
```r
# ggtitle()
ggplot(chic, aes(x = date, y = temp)) +
  geom_point(color = "firebrick") +
  labs(x = "Year", y = "Temperature (°F)") +
  ggtitle("Temperatures in Chicago")

# labs() - more comprehensive
ggplot(chic, aes(x = date, y = temp)) +
  geom_point(color = "firebrick") +
  labs(
    x = "Year", 
    y = "Temperature (°F)",
    title = "Temperatures in Chicago",
    subtitle = "Seasonal pattern of daily temperatures from 1997 to 2001",
    caption = "Data: NMMAPS",
    tag = "Fig. 1"
  )
```

### Title Styling
```r
theme(
  plot.title = element_text(
    face = "bold",
    margin = margin(10, 0, 10, 0),  # t, r, b, l
    size = 14
  ),
  plot.subtitle = element_text(
    margin = margin(0, 0, 10, 0),
    size = 12
  ),
  plot.caption = element_text(
    hjust = 0,  # left-align
    size = 10
  )
```

### Title Positioning
```r
# Horizontal alignment (hjust: 0=left, 0.5=center, 1=right)
theme(plot.title = element_text(hjust = 0.5))

# New in ggplot2 3.3+: position relative to plot area
theme(
  plot.title.position = "plot",     # "panel" (default) or "plot"
  plot.caption.position = "plot"
)
```

### Custom Fonts
```r
library(showtext)
font_add_google("Playfair Display", "Playfair")
font_add_google("Bangers", "Bangers")
font_add_google("Roboto Condensed", "Roboto Condensed")

ggplot(chic, aes(x = date, y = temp)) +
  geom_point(color = "firebrick") +
  labs(title = "Temperatures in Chicago",
       subtitle = "Daily temperatures in °F from 1997 to 2001") +
  theme(
    plot.title = element_text(family = "Bangers", hjust = .5, size = 25),
    plot.subtitle = element_text(family = "Playfair", hjust = .5, size = 15)
  )

# Set default font for all text
theme_set(theme_bw(base_size = 12, base_family = "Roboto Condensed"))
```

### Multi-line Titles
```r
ggtitle("Temperatures in Chicago\nfrom 1997 to 2001") +
theme(plot.title = element_text(lineheight = .8, size = 16))
```

---

## 7. Working with Legends

### Basic Legend Control
```r
# Map variable to aesthetic
ggplot(chic, aes(x = date, y = temp, color = season)) +
  geom_point()

# Remove legend entirely
theme(legend.position = "none")

# Remove specific legend
guides(color = "none")
guides(color = "none", shape = "none")
```

### Legend Title
```r
# Remove title
theme(legend.title = element_blank())

# Via labs
labs(color = NULL)

# Via scale
scale_color_discrete(name = NULL)

# Custom title
labs(color = "Seasons\nindicated\nby colors:")
```

### Legend Position
```r
# Predefined positions
theme(legend.position = "top")    # "right", "bottom", "left", "none"

# Inside plot (coordinates 0-1)
theme(legend.position = c(.15, .15),
      legend.background = element_rect(fill = "transparent"))
```

### Legend Direction
```r
theme(legend.position = c(.5, .97),
      legend.background = element_rect(fill = "transparent")) +
guides(color = guide_legend(direction = "horizontal"))
```

### Legend Title Styling
```r
theme(legend.title = element_text(
  family = "Playfair", color = "chocolate", size = 14, face = "bold"
))
```

### Legend Labels
```r
scale_color_discrete(
  name = "Seasons:",
  labels = c("Mar—May", "Jun—Aug", "Sep—Nov", "Dec—Feb")
) +
theme(legend.title = element_text(family = "Playfair", color = "chocolate", size = 14, face = 2))
```

### Legend Key Styling
```r
# Key background
theme(legend.key = element_rect(fill = "darkgoldenrod1"))

# Remove keys
theme(legend.key = element_rect(fill = NA))

# Symbol size
guides(color = guide_legend(override.aes = list(size = 6)))
```

### Exclude Layers from Legend
```r
geom_rug(show.legend = FALSE)
```

### Manual Legend Creation
```r
# Force legend for geom without mapping
ggplot(chic, aes(x = date, y = o3)) +
  geom_line(aes(color = "line")) +
  geom_point(aes(color = "points")) +
  labs(x = "Year", y = "Ozone") +
  scale_color_manual(name = NULL,
                     guide = "legend",
                     values = c("points" = "darkorange2", "line" = "gray")) +
  guides(color = guide_legend(override.aes = list(
    linetype = c(1, 0),  # line then no line
    shape = c(NA, 16)    # no shape then point
  )))
```

### Continuous Colorbar
```r
ggplot(chic, aes(x = date, y = temp, color = temp)) +
  geom_point() +
  labs(x = "Year", y = "Temperature (°F)", color = "Temperature (°F)")

# Continuous uses guide_colorbar by default
```

---

## 8. Working with Backgrounds & Grid Lines

```r
# Built-in themes
theme_bw()
theme_minimal()
theme_classic()
theme_void()
theme_dark()

# Customize grid
theme(
  panel.grid.major = element_line(color = "gray90", linewidth = 0.5),
  panel.grid.minor = element_line(color = "gray95", linewidth = 0.25),
  panel.grid.major.x = element_blank(),
  panel.grid.minor.y = element_blank()
)

# Panel background
theme(panel.background = element_rect(fill = "gray95"))

# Remove all
theme_void()
```

---

## 9. Working with Margins

```r
# Plot margins
theme(plot.margin = margin(10, 10, 10, 10))  # t, r, b, l

# Remember: "t-r-o-u-b-l-e" = t-r-o-u-b-l-e (top, right, bottom, left)
```

---

## 10. Working with Multi-Panel Plots

### Faceting
```r
# Facet wrap (1D)
facet_wrap(~ season, ncol = 2)

# Facet grid (2D)
facet_grid(season ~ year)

# Free scales
facet_wrap(~ season, scales = "free_y")
facet_grid(season ~ year, scales = "free")

# Labels
facet_wrap(~ season, labeller = label_both)
```

### Patchwork (Combining Separate Plots)
```r
library(patchwork)

p1 <- ggplot(...) + geom_point()
p2 <- ggplot(...) + geom_line()

# Side by side
p1 + p2

# Stacked
p1 / p2

# Complex layout
(p1 | p2) / p3
(p1 + p2) / (p3 + p4)

# With guides
(p1 + p2) + plot_layout(guides = "collect")
```

---

## 11. Working with Colors

### Color Palettes
```r
# Viridis (perceptually uniform)
scale_color_viridis_d()      # discrete
scale_color_viridis_c()      # continuous

# RColorBrewer
scale_color_brewer(palette = "Set1")
scale_color_brewer(palette = "Set2", direction = -1)

# Scientific color palettes
library(scico)
scale_color_scico_d(palette = "vik")
scale_color_scico_c(palette = "roma")

# RCartaColor
library(rcartocolor)
scale_color_carto_d(palette = "Safe")

# ggsci (journal palettes)
library(ggsci)
scale_color_npg()    # Nature Publishing Group
scale_color_aaas()   # AAAS
scale_color_lancet() # Lancet
scale_color_nejm()   # NEJM

# Prismatic (color manipulation)
library(prismatic)
clr_lighten("#FF0000", 0.3)
clr_darken("#FF0000", 0.3)
clr_mix("#FF0000", "#0000FF", 0.5)
```

### Manual Colors
```r
scale_color_manual(values = c("A" = "red", "B" = "blue", "C" = "green"))

# For continuous
scale_color_gradient(low = "blue", high = "red")
scale_color_gradient2(low = "blue", mid = "white", high = "red", midpoint = 0)
scale_color_gradientn(colors = c("blue", "white", "red"))
```

### Color for Specific Values
```r
# Color by continuous variable
ggplot(chic, aes(x = date, y = temp, color = temp)) +
  geom_point() +
  scale_color_viridis_c()

# Color by discrete with custom palette
ggplot(chic, aes(x = date, y = temp, color = season)) +
  geom_point() +
  scale_color_manual(values = c(
    "Winter" = "blue",
    "Spring" = "green",
    "Summer" = "orange",
    "Autumn" = "brown"
  ))
```

---

## 12. Working with Themes

### Built-in Themes
```r
theme_bw()
theme_minimal()
theme_classic()
theme_linedraw()
theme_light()
theme_dark()
theme_void()

# Set globally
theme_set(theme_bw(base_size = 12, base_family = "Roboto Condensed"))
```

### Custom Theme
```r
my_theme <- function() {
  theme_bw(base_size = 12, base_family = "Roboto Condensed") %+replace%
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
}

# Use it
ggplot(...) + my_theme()
```

### Theme Elements Reference
| Element | Controls |
|---------|----------|
| `plot.title` | Main title |
| `plot.subtitle` | Subtitle |
| `plot.caption` | Caption |
| `plot.tag` | Tag (Fig. 1) |
| `axis.title` | Axis titles |
| `axis.title.x/y` | Specific axis title |
| `axis.text` | Axis tick labels |
| `axis.text.x/y` | Specific axis text |
| `axis.ticks` | Tick marks |
| `axis.ticks.x/y` | Specific ticks |
| `legend.title` | Legend title |
| `legend.text` | Legend labels |
| `legend.position` | Position |
| `legend.background` | Background box |
| `legend.key` | Symbol keys |
| `panel.background` | Plot area background |
| `panel.grid.major/minor` | Grid lines |
| `panel.border` | Panel border |
| `strip.background` | Facet label background |
| `strip.text` | Facet labels |

---

## 13. Working with Lines

### Line Properties
```r
geom_line(
  color = "firebrick",
  linetype = "dotted",    # solid, dashed, dotted, dotdash, longdash, twodash
  linewidth = 0.5,        # lwd deprecated
  lineend = "round",      # butt, round, square
  linejoin = "round"      # round, mitre, bevel
)
```

### Multiple Lines
```r
ggplot(chic, aes(x = date, y = temp, group = season, color = season)) +
  geom_line(linewidth = 0.8) +
  scale_color_brewer(palette = "Set1")

# With points
geom_line() + geom_point()
```

### Ribbons (Confidence Intervals, AUC)
```r
ggplot(df, aes(x = x, y = y, ymin = lower, ymax = upper)) +
  geom_ribbon(fill = "blue", alpha = 0.2) +
  geom_line(color = "blue")

# With grouping
ggplot(df, aes(x = x, y = y, ymin = lower, ymax = upper, fill = group)) +
  geom_ribbon(alpha = 0.3) +
  geom_line(aes(color = group))
```

---

## 14. Working with Text

### Geom Text/Label
```r
# Text
geom_text(aes(label = label), size = 3, hjust = 0, vjust = 0)

# Label with background
geom_label(aes(label = label), fill = "white", label.size = 0.5)

# Repel overlapping labels
library(ggrepel)
geom_text_repel(aes(label = label), size = 3, max.overlaps = 10)

# Annotate (fixed position)
annotate("text", x = 5, y = 10, label = "Important!", size = 5, color = "red")
annotate("segment", x = 2, xend = 4, y = 8, yend = 10, arrow = arrow())
annotate("rect", xmin = 2, xmax = 4, ymin = 5, ymax = 9, alpha = 0.2, fill = "yellow")
```

### Rich Text (ggtext)
```r
library(ggtext)

ggplot(...) +
  labs(title = "**Bold** and *italic* with <span style='color:red'>color</span>") +
  theme(plot.title = element_markdown())
```

---

## 15. Working with Coordinates

```r
# Cartesian (default)
coord_cartesian(xlim = c(0, 100), ylim = c(0, 50), expand = TRUE, clip = "on")

# Fixed aspect ratio
coord_fixed(ratio = 1)

# Polar coordinates
coord_polar(theta = "x", start = 0, direction = 1)

# Flipped
coord_flip()

# Map projections
coord_map("mercator")
coord_quickmap()  # faster approximation

# Transformed
coord_trans(x = "log10", y = "sqrt")
```

---

## 16. Chart Types Gallery

### Scatter Plot
```r
ggplot(df, aes(x, y)) +
  geom_point(alpha = 0.6, size = 2) +
  geom_smooth(method = "lm", se = FALSE, color = "red")
```

### Line Plot
```r
ggplot(df, aes(x = date, y = value, group = group, color = group)) +
  geom_line(linewidth = 1) +
  geom_point(size = 1.5)
```

### Bar Chart
```r
# Counts
ggplot(df, aes(x = category)) + geom_bar(fill = "steelblue")

# Values
ggplot(df, aes(x = category, y = value)) +
  geom_col(fill = "steelblue")  # geom_col = stat="identity"

# Dodged
ggplot(df, aes(x = category, y = value, fill = group)) +
  geom_col(position = "dodged")

# Stacked
ggplot(df, aes(x = category, y = value, fill = group)) +
  geom_col(position = "stack")

# Proportions
position = "fill"
```

### Histogram / Density
```r
ggplot(df, aes(x = value)) +
  geom_histogram(bins = 30, fill = "steelblue", color = "white")

ggplot(df, aes(x = value, fill = group)) +
  geom_density(alpha = 0.5)

# Frequency polygon
geom_freqpoly(bins = 30, aes(color = group))
```

### Box Plot
```r
ggplot(df, aes(x = group, y = value, fill = group)) +
  geom_boxplot(outlier.shape = NA) +
  geom_jitter(width = 0.2, alpha = 0.3)

# Violin plot
geom_violin(fill = "steelblue", alpha = 0.5)
```

### Ridge Plot
```r
library(ggridges)
ggplot(df, aes(x = value, y = group, fill = group)) +
  geom_density_ridges(alpha = 0.7, scale = 1.5) +
  theme_ridges()
```

### Pie Chart (if you must)
```r
ggplot(df, aes(x = "", y = value, fill = category)) +
  geom_col(width = 1) +
  coord_polar("y", start = 0) +
  theme_void()
```

### Heatmap
```r
ggplot(df, aes(x = x, y = y, fill = value)) +
  geom_tile() +
  scale_fill_viridis_c()
```

---

## 17. Smoothings & Trendlines

```r
# LOESS (default)
geom_smooth(method = "loess", se = TRUE, level = 0.95, span = 0.75)

# Linear model
geom_smooth(method = "lm", se = FALSE, color = "red")

# GLM
geom_smooth(method = "glm", method.args = list(family = "binomial"))

# GAM
library(mgcv)
geom_smooth(method = "gam", formula = y ~ s(x, bs = "cs"))

# Quantile regression
library(quantreg)
geom_smooth(method = "rq", method.args = list(tau = 0.5))
```

---

## 18. Interactive Plots

### plotly
```r
library(plotly)
p <- ggplot(...) + geom_point()
ggplotly(p, tooltip = c("x", "y", "label"))

# Highlight
ggplotly(p) %>% highlight(on = "plotly_hover", off = "plotly_doubleclick")
```

### ggiraph
```r
library(ggiraph)
ggplot(df, aes(x, y, tooltip = label, data_id = id)) +
  geom_point_interactive()
girafe(ggobj = p)
```

---

## 18. Saving & Exporting

```r
# ggsave (recommended)
ggsave("plot.png", width = 8, height = 6, dpi = 300)
ggsave("plot.pdf", width = 8, height = 6)
ggsave("plot.svg", width = 8, height = 6)

# Multiple formats
ggsave("plot.png", plot = p, width = 8, height = 6, dpi = 300)
ggsave("plot.pdf", plot = p, width = 8, height = 6, device = cairo_pdf)

# Patchwork
ggsave("combined.png", p1 + p2, width = 12, height = 6, dpi = 300)
```

---

## 19. Best Practices & Tips

### 19.1 Do's and Don'ts
```r
# ✅ DO
ggplot(df, aes(x, y)) + geom_point()
ggplot(df) + aes(x, y) + geom_point()
df |> ggplot(aes(x, y)) + geom_point()

# ❌ DON'T
ggplot(aes(x, y), data = df) + geom_point()  # data first!
aes(x, y) |> ggplot(df) + geom_point()       # wrong order
```

### 19.2 Performance Tips
```r
# For large datasets: sample or summarize first
df |> slice_sample(n = 10000) |> ggplot(...)

# Use geom_hex/geom_bin2d for dense scatterplots
geom_hex(bins = 30)
geom_bin2d(bins = 30)

# Reduce overplotting
geom_point(alpha = 0.1, size = 0.5)
geom_jitter(width = 0.2, height = 0)
```

### 19.3 Debugging
```r
# Check data
glimpse(df)
head(df)
summary(df)

# Debug aesthetics
ggplot(df, aes(x, y, color = z)) + 
  geom_point() +
  scale_color_viridis_c()  # Check if z is numeric

# Check ggplot object
str(g)
g$layers
g$mapping
g$data
```

---

## 20. Resources

### Official Documentation
- [ggplot2 Reference](https://ggplot2.tidyverse.org/reference/)
- [R for Data Science - Visualization](https://r4ds.hadley.nz/data-visualisation.html)
- [ggplot2 Extensions](https://exts.ggplot2.tidyverse.org/)

### Tutorials & Inspiration
- [Cedric Scherer's Tutorial](https://www.cedricscherer.com/2019/08/05/a-ggplot2-tutorial-for-beautiful-plotting-in-r/)
- [R Graph Gallery](https://r-graph-gallery.com/)
- [Data to Viz](https://www.data-to-viz.com/)
- [ggplot2 Extensions Gallery](https://exts.ggplot2.tidyverse.org/)

### Books
- [R for Data Science](https://r4ds.hadley.nz/) - Hadley Wickham
- [ggplot2: Elegant Graphics for Data Analysis](https://ggplot2-book.org/) - Hadley Wickham
- [Fundamentals of Data Visualization](https://clauswilke.com/dataviz/) - Claus Wilke

---

## Quick Reference Card

### Essential One-Liners
```r
# Basic scatter
ggplot(df, aes(x, y)) + geom_point()

# Colored by group
ggplot(df, aes(x, y, color = group)) + geom_point()

# Line + points
ggplot(df, aes(x, y, group = g)) + geom_line() + geom_point()

# Faceted
ggplot(df, aes(x, y)) + geom_point() + facet_wrap(~ group)

# Themed
ggplot(df, aes(x, y)) + geom_point() + theme_minimal()

# Saved
ggsave("plot.png", width = 8, height = 6, dpi = 300)
```

---

## Summary: Key Takeaways

1. **ggplot(data, aes()) + geom_*()** - The fundamental formula
2. **Aesthetics inside `aes()`** - map variables to visual properties
3. **Layers add up** - `+ geom_point() + geom_line() + geom_smooth()`
4. **Scales control mapping** - `scale_color_*`, `scale_x_*`, etc.
5. **Themes control non-data ink** - `theme()`, `theme_bw()`, etc.
6. **Facets for small multiples** - `facet_wrap()`, `facet_grid()`
7. **Patchwork for composition** - `p1 + p2`, `p1 / p2`
8. **Save with `ggsave()`** - specify dimensions and DPI
8. **Iterate** - build plots incrementally, save intermediate objects