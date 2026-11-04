# Working with Geometries

### Changing Geometry Properties
```python
# Inside geom_*()
ggplot(chic, aes(x='date', y='temp')) +
    geom_point(color='firebrick', shape='D', size=2)

# Different properties per geom
ggplot(chic, aes(x='date', y='temp')) +
    geom_point(color='firebrick', shape='D', size=2) +
    geom_line(color='firebrick', linetype='dotted', size=0.3)

# plotnine understands both color/colour
ggplot(chic, aes(x='date', y='temp')) +
    geom_point(colour='firebrick')
```

### Color Options
```python
# Named colors
color='firebrick'
color='dodgerblue4'

# Hex codes
color='#FF3030'

# RGB
color='rgb(255, 0, 0)'
```

---

## 5. Working with Axes

### Axis Titles
```python
# Via labs()
ggplot(chic, aes(x='date', y='temp')) +
    geom_point(color='firebrick') +
    labs(x='Year', y='Temperature (°F)')

# Expression for symbols
from plotnine import labs
ggplot(chic, aes(x='date', y='temp')) +
    geom_point(color='firebrick') +
    labs(x='Year', y='Temperature (°F)')
```

### Axis Title Positioning
```python
# vjust (vertical justification)
theme(
    axis_title_x=element_text(vjust=0, size=15),
    axis_title_y=element_text(vjust=2, size=15)
)

# Using margins (more precise)
theme(
    axis_title_x=element_text(margin=dict(t=10), size=15),
    axis_title_y=element_text(margin=dict(r=10), size=15)
)
# margin(t, r, b, l) - remember: "t-r-o-u-b-l-e"
```

### Axis Title Styling
```python
theme(
    axis_title=element_text(size=15, color='firebrick', face='italic'),
    axis_title_x=element_text(color='sienna', size=15),
    axis_title_y=element_text(color='orangered', size=15)
)
```

### Axis Text (Numbers/Labels)
```python
theme(
    axis_text=element_text(color='dodgerblue', size=12),
    axis_text_x=element_text(face='italic')
)
```

### Rotate Axis Text
```python
theme(axis_text_x=element_text(angle=50, vjust=1, hjust=1, size=12))
```

### Remove Axis Elements
```python
# Remove axis text
theme(axis_text_y=element_blank())

# Remove ticks
theme(axis_ticks_y=element_blank())

# Remove axis titles
labs(x=None, y="")  # None removes, "" keeps space

# Limit axis range
ylim(0, 50)

# coord_cartesian (zooms - keeps data)
coord_cartesian(ylim=(0, 50))

# expand_limits (force to include)
expand_limits(x=0, y=0)

# Force origin at (0,0)
coord_cartesian(expand=False, clip='off') + expand_limits(x=0, y=0)
```

### Equal Scales
```python
coord_fixed()           # ratio = 1
coord_fixed(ratio=1/5)  # y units 5x x units
```

### Label Functions
```python
scale_y_continuous(
    label=lambda x: f"{x} Degrees Fahrenheit"
)
```

---

## 6. Working with Titles

### Adding Titles
```python
# ggtitle()
ggplot(chic, aes(x='date', y='temp')) +
    geom_point(color='firebrick') +
    labs(x='Year', y='Temperature (°F)') +
    ggtitle("Temperatures in Chicago")

# labs() - comprehensive
ggplot(chic, aes(x='date', y='temp')) +
    geom_point(color='firebrick') +
    labs(
        x='Year', y='Temperature (°F)',
        title='Temperatures in Chicago',
        subtitle='Seasonal pattern of daily temperatures from 1997 to 2001',
        caption='Data: NMMAPS',
        tag='Fig. 1'
    )
```

### Title Styling
```python
theme(
    plot_title=element_text(
        face='bold',
        margin=dict(t=0, r=0, b=10, l=0),  # t, r, b, l
        size=14
    ),
    plot_subtitle=element_text(
        margin=dict(t=0, r=0, b=10, l=0),
        size=12
    ),
    plot_caption=element_text(
        hjust=0,  # left-align
        size=10
    )
```

### Title Positioning
```python
# Horizontal alignment (hjust: 0=left, 0.5=center, 1=right)
theme(plot_title=element_text(hjust=0.5, size=16, face='bold.italic'))

# New in plotnine 0.10+: position relative to plot area
theme(
    plot_title_position='plot',      # 'panel' (default) or 'plot'
    plot_caption_position='plot'
)
```

### Custom Fonts
```python
from plotnine import *

ggplot(chic, aes(x='date', y='temp')) +
    geom_point(color='firebrick') +
    labs(title='Temperatures in Chicago',
         subtitle='Daily temperatures in °F from 1997 to 2001') +
    theme(
        plot_title=element_text(family='Bangers', hjust=.5, size=25),
        plot_subtitle=element_text(family='Playfair', hjust=.5, size=15)
    )

# Set default font for all text
theme_set(theme_bw(base_size=12, base_family='Roboto Condensed'))
```

### Multi-line Titles
```python
ggtitle("Temperatures in Chicago\nfrom 1997 to 2001") +
theme(plot_title=element_text(lineheight=0.8, size=16))
```

---

## 7. Working with Legends

### Turn Off Legend
```python
theme(legend_position='none')

# Remove specific legend
guides(color='none')
guides(color='none', shape='none')
```

### Legend Title
```python
theme(legend_title=element_blank())

# Via labs
labs(color=None)

# Via scale
scale_color_discrete(name=None)
```

### Legend Position
```python
theme(legend_position='top')    # 'right', 'bottom', 'left', 'none'
theme(legend_position='top')

# Inside plot
theme(legend_position=(0.15, 0.15),
      legend_background=element_rect(fill='transparent'))
```

### Legend Direction
```python
theme(
    legend_position=(0.5, 0.97),
    legend_background=element_rect(fill='transparent')
) +
guides(color=guide_legend(direction='horizontal'))
```

### Legend Title Styling
```python
theme(legend_title=element_text(
    family='Playfair', color='chocolate', size=14, face='bold'
))
```

### Change Legend Labels
```python
scale_color_discrete(
    name='Seasons:',
    labels=['Mar—May', 'Jun—Aug', 'Sep—Nov', 'Dec—Feb']
) +
theme(legend_title=element_text(
    family='Playfair', color='chocolate', size=14, face=2
))
```

### Legend Key Styling
```python
theme(
    legend_key=element_rect(fill='darkgoldenrod1'),
    legend_title=element_text(family='Playfair', color='chocolate', size=14, face=2)
)

# Remove keys
theme(legend_key=element_rect(fill=NA))

# Symbol size
guides(color=guide_legend(override_aes=dict(size=6)))
```

### Exclude Layers from Legend
```python
geom_rug(show_legend=False)
```

### Manual Legend Creation
```r
ggplot(chic, aes(x='date', y='o3')) +
  geom_line(aes(color='line')) +
  geom_point(aes(color='points')) +
  labs(x='Year', y='Ozone') +
  scale_color_manual(name=None,
                     guide='legend',
                     values={'points': 'darkorange2', 'line': 'gray'}) +
  guides(color=guide_legend(override_aes=dict(
      linetype=[1, 0],  # line then no line
      shape=['', 'o']   # no shape then point
  )))
```

### Continuous Colorbar
```python
ggplot(chic, aes(x='date', y='temp', color='temp')) +
  geom_point() +
  labs(x='Year', y='Temperature (°F)', color='Temperature (°F)')
```

---

## 8. Backgrounds & Grid Lines

```r
# Built-in themes
theme_bw()
theme_minimal()
theme_classic()
theme_void()
theme_dark()

# Customize grid
theme(
    panel_grid_major=element_line(color='gray90', linewidth=0.5),
    panel_grid_minor=element_line(color='gray95', linewidth=0.25),
    panel_grid_major_x=element_blank(),
    panel_grid_minor_y=element_blank()
)

# Panel background
theme(panel_background=element_rect(fill='gray95'))

# Remove all
theme_void()
```

---

## 9. Margins

```r
theme(plot_margin=margin(10, 10, 10, 10))  # t, r, b, l
# Remember: "t-r-o-u-b-l-e"
```

---

## 10. Multi-Panel Plots

### Faceting
```python
# facet_wrap (1D)
facet_wrap('~ var', ncol=2)

# facet_grid (2D)
facet_grid('x ~ y')

# Free scales
facet_wrap('~ var', scales='free_y')
facet_grid('x ~ y', scales='free')

# Labels
facet_wrap('~ var', labeller='label_both')
```

### Patchwork (Combining Separate Plots)
```python
from patchwork import *

p1 = ggplot(...) + geom_point()
p2 = ggplot(...) + geom_line()

# Side by side
p1 + p2

# Stacked
p1 / p2

# Complex layout
(p1 | p2) / p3
(p1 + p2) / (p3 + p4)

# With guides
(p1 + p2) + plot_layout(guides='collect')
```

---

## 11. Working with Colors

### Color Palettes
```r
# Viridis (perceptually uniform)
scale_color_viridis_d()      # discrete
scale_color_viridis_c()      # continuous

# RColorBrewer
scale_color_brewer(palette='Set1')
scale_color_brewer(palette='Set2')

# Scientific color palettes
library(scico)
scale_color_scico_d(palette='vik')
scale_color_scico_c(palette='roma')

# RCartaColor
library(rcartocolor)
scale_color_carto_d(palette='Safe')

# ggsci (journal palettes)
library(ggsci)
scale_color_npg()    # Nature Publishing Group
scale_color_aaas()   # AAAS
scale_color_lancet() # Lancet
scale_color_nejm()   # NEJM

# Prismatic (color manipulation)
library(prismatic)
clr_lighten('#FF0000', 0.3)
clr_darken('#FF0000', 0.3)
clr_mix('#FF0000', '#0000FF', 0.5)
```

### Manual Colors
```r
scale_color_manual(values=c('A'='red', 'B'='blue', 'C'='green'))
scale_fill_manual(values=c('A'='#FF0000', 'B'='#0000FF'))
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
theme_test()
```

### Custom Theme
```r
my_theme <- function() {
  theme_bw(base_size=12, base_family='Roboto Condensed') %+replace%
    theme(
      plot.title=element_text(face='bold', size=16, hjust=0.5, margin=margin(0,0,10,0)),
      plot.subtitle=element_text(size=12, hjust=0.5, margin=margin(0,0,10,0)),
      plot.caption=element_text(hjust=0, size=9),
      axis.title=element_text(face='bold', size=11),
      axis.text=element_text(size=10),
      legend.position='top',
      legend.title=element_text(face='bold'),
      panel.grid.minor=element_blank(),
      panel.grid.major=element_line(color='gray90'),
      strip.background=element_rect(fill='gray95'),
      strip.text=element_text(face='bold')
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
  color='firebrick',
  linetype='dotted',    # solid, dashed, dotted, dotdash, longdash, twodash
  linewidth=0.5,        # lwd deprecated
  lineend='round',      # butt, round, square
  linejoin='round'      # round, mitre, bevel
)
```

### Multiple Lines
```python
ggplot(df, aes(x='date', y='temp', group='season', color='season')) +
  geom_line(linewidth=1) +
  scale_color_brewer(palette='Set1')
```

### Ribbons (Confidence Intervals)
```r
ggplot(df, aes(x=x, y=y, ymin=lower, ymax=upper)) +
  geom_ribbon(fill='blue', alpha=0.2) +
  geom_line(color='blue')

# With grouping
ggplot(df, aes(x=x, y=y, ymin=lower, ymax=upper, fill=group)) +
  geom_ribbon(alpha=0.3) +
  geom_line(aes(color=group))
```

---

## 14. Working with Text

### Geom Text/Label
```r
# Text
geom_text(aes(label=label), size=3, hjust=0, vjust=0)

# Label with background
geom_label(aes(label=label), fill='white', label_size=0.5)

# Repel overlapping labels
library(ggrepel)
geom_text_repel(aes(label=label), size=3, max_overlaps=10)

# Annotate (fixed position)
annotate('text', x=5, y=10, label='Important!', size=5, color='red')
annotate('segment', x=2, xend=4, y=5, yend=10, arrow=arrow())
annotate('rect', xmin=2, xmax=4, ymin=5, ymax=9, alpha=0.2, fill='yellow')

# Rich text (ggtext)
library(ggtext)
theme(plot.title=element_markdown())
labs(title='**Bold** and *italic* with <span style="color:red">color</span>') +
theme(plot.title=element_markdown())
```

---

## 15. Working with Coordinates

```r
# Cartesian (default)
coord_cartesian(xlim=c(0,100), ylim=c(0,50), expand=TRUE, clip='on')

# Fixed aspect ratio
coord_fixed(ratio=1)

# Flipped
coord_flip()

# Polar
coord_polar(theta='x', start=0, direction=1)

# Map projections
coord_map('mercator')
coord_quickmap()

# Transformed
coord_trans(x='log10', y='sqrt')
```

---

## 16. Chart Types Gallery

### Scatter Plot
```python
ggplot(df, aes(x='x', y='y')) +
  geom_point(alpha=0.6, size=2) +
  geom_smooth(method='lm', se=False, color='red') +
  labs(x='X', y='Y')
```

### Line Plot
```r
ggplot(df, aes(x='date', y='value', group='group', color='group')) +
  geom_line(linewidth=1) +
  geom_point(size=1.5)
```

### Bar Chart
```r
# Counts
ggplot(df, aes(x='category')) + geom_bar(fill='steelblue')

# Values
ggplot(df, aes(x='category', y='value')) +
  geom_col(fill='steelblue')

# Dodged
ggplot(df, aes(x='category', y='value', fill='group')) +
  geom_col(position='dodge')

# Stacked
ggplot(df, aes(x='category', y='value', fill='group')) +
  geom_col(position='stack')

# Proportions
position='fill'
```

### Histogram / Density
```python
ggplot(df, aes(x='value')) +
  geom_histogram(bins=30, fill='steelblue', color='white')

ggplot(df, aes(x='value', fill='group')) +
  geom_density(alpha=0.5)

# Frequency polygon
geom_freqpoly(bins=30, aes(color='group'))
```

### Box Plot
```r
ggplot(df, aes(x='group', y='value', fill='group')) +
  geom_boxplot(outlier_shape=NA) +
  geom_jitter(width=0.2, alpha=0.3)
```

### Violin Plot
```r
ggplot(df, aes(x='group', y='value', fill='group')) +
  geom_violin(alpha=0.5) +
  geom_boxplot(width=0.1, fill='white')
```

### Ridge Plot
```python
library(ggridges)
ggplot(df, aes(x='value', y='group', fill='group')) +
  geom_density_ridges(alpha=0.7, scale=1.5) +
  theme_ridges()
```

### Pie Chart (if you must)
```python
ggplot(df, aes(x='', y='value', fill='category')) +
  geom_col(width=1) +
  coord_polar('y', start=0) +
  theme_void()
```

---

## 17. Smoothings & Trendlines

```r
# LOESS (default)
geom_smooth(method='loess', se=TRUE, level=0.95, span=0.75)

# Linear model
geom_smooth(method='lm', se=False, color='red')

# GAM
library(mgcv)
geom_smooth(method='gam', formula='y ~ s(x, bs="cs")')

# Quantile regression
library(quantreg)
geom_smooth(method='rq', method.args=list(tau=0.5))
```

---

## 18. Interactive Plots

### plotly
```python
library(plotly)
p <- ggplot(...) + geom_point()
ggplotly(p)

# Highlight
highlight(p, 'plotly_hover', 'plotly_doubleclick')
```

### ggiraph
```r
library(ggiraph)
ggplot(df, aes(x, y, tooltip=label, data_id=id)) +
  geom_point_interactive()
girafe(ggobj=p)
```

---

## 18. Saving & Exporting

```python
# ggsave (recommended)
ggsave('plot.png', width=8, height=6, dpi=300)
ggsave('plot.pdf', width=8, height=6, device=cairo_pdf)

# Multiple formats
ggsave('plot.png', p, width=8, height=6, dpi=300)
ggsave('plot.pdf', p, width=8, height=6, device=cairo_pdf)
ggsave('plot.svg', p, width=8, height=6)

# Patchwork
ggsave('combined.png', p1 + p2, width=12, height=6, dpi=300)
```

---

## 19. Best Practices

### 19.1 Do's and Don'ts
```python
# ✅ DO
ggplot(df, aes(x, y)) + geom_point()
ggplot(df) + aes(x, y) + geom_point()
df |> ggplot(aes(x, y)) + geom_point()

# ❌ DON'T
ggplot(aes(x, y), data=df) + geom_point()  # data first!
aes(x, y) |> ggplot(df) + geom_point()      # wrong order
```

### 19.2 Performance Tips
```python
# For large datasets: sample or summarize first
df |> slice_sample(n=10000) |> ggplot(...) + geom_point()

# Use geom_hex/geom_bin2d for dense scatterplots
geom_hex(bins=30)
geom_bin2d(bins=30)

# Reduce overplotting
geom_point(alpha=0.1, size=0.5)
geom_jitter(width=0.2, height=0)
```

### 19.3 Debugging
```python
# Check ggplot object
str(g)
g$layers
g$mapping
g$data

# Debug aesthetics
ggplot(df, aes(x, y, color=z)) + 
  geom_point() +
  scale_color_viridis_c()  # Check if z is numeric
```

---

## 20. Resources

### Official Documentation
- [plotnine Reference](https://plotnine.org/)
- [ggplot2 Reference](https://ggplot2.tidyverse.org/reference/) - applies to plotnine
- [plotnine Extensions](https://exts.ggplot2.tidyverse.org/)

### Tutorials & Inspiration
- [Cedric Scherer's Tutorial](https://www.cedricscherer.com/2019/08/05/a-ggplot2-tutorial-for-beautiful-plotting-in-r/) - Our source
- [R Graph Gallery](https://r-graph-gallery.com/)
- [Data to Viz](https://www.data-to-viz.com/)
- [plotnine Extensions](https://exts.ggplot2.tidyverse.org/)

### Books
- [R for Data Science](https://r4ds.hadley.nz/) - Free online book
- [ggplot2: Elegant Graphics for Data Analysis](https://ggplot2-book.org/) - Hadley Wickham
- [Fundamentals of Data Visualization](https://clauswilke.com/dataviz/) - Claus Wilke

---

## Quick Reference Card

### Essential One-Liners
```python
# Basic scatter
ggplot(df, aes(x, y)) + geom_point()

# Colored by group
ggplot(df, aes(x, y, color=group)) + geom_point()

# Line + points
ggplot(df, aes(x, y, group=g)) + geom_line() + geom_point()

# Faceted
ggplot(df, aes(x, y)) + geom_point() + facet_wrap('~ group')

# Themed
ggplot(df, aes(x, y)) + geom_point() + theme_minimal()

# Saved
ggsave('plot.png', width=8, height=6, dpi=300)
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
7. **Save with `ggsave()`** - specify dimensions and DPI
8. **Iterate** - build plots incrementally, save intermediate objects
8. **Use `theme_set()`** for consistent styling across plots

---

*Last updated: 2024-11-04*
*Based on: [Cedric Scherer's ggplot2 Tutorial](https://www.cedricscherer.com/2019/08/05/a-ggplot2-tutorial-for-beautiful-plotting-in-r/)*
*Adapted for Python's plotnine package*