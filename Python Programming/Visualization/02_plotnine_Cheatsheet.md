# plotnine Cheatsheet - Quick Reference

A quick reference for plotnine functions, aesthetics, and common patterns.

---

## 1. Basic Plot Structure

```python
from plotnine import *

ggplot(data=df, mapping=aes(x='x_var', y='y_var')) +
    geom_<type>() +
    scale_<aesthetic>_<type>() +
    labs(title="Title", x="X", y="Y") +
    theme_minimal()

# Pipe-friendly
df |> ggplot(aes(x='x', y='y')) + geom_point()
```

---

## 1. Geometries (geom_*)

### Points
```python
geom_point(aes(x='x', y='y', color='var', size='var', shape='var', alpha='var'))
geom_jitter(width=0.2, height=0)
geom_count()  # Count overlapping points
geom_rug(sides='bl', alpha=0.5)  # Rug plots
```

### Lines & Paths
```python
geom_line(aes(x='x', y='y', group='group'), linewidth=1, linetype='solid')
geom_step(direction='hv')  # Step function
geom_path()  # Connect in data order
geom_segment(aes(x='x1', y='y1', xend='x2', yend='y2'))
geom_segment(aes(x='x', y='y', xend='x+dx', yend='y+dy'), arrow=arrow())
```

### Bars & Columns
```python
# Counts
geom_bar(aes(fill='group'), position='stack')
geom_bar(position='dodge')  # grouped
geom_bar(position='fill')   # proportions

# Values
geom_col(aes(y='value'), fill='steelblue')
geom_col(position='dodge')
```

### Distributions
```python
# Continuous
geom_histogram(bins=30, fill='steelblue')
geom_density(alpha=0.5, fill='blue')
geom_freqpoly(bins=30, aes(color='group'))
geom_density_ridges(aes(fill='group'), alpha=0.7)  # ggridges

# Box/Violin
geom_boxplot(outlier_shape=NA, outlier_alpha=0)
geom_violin(fill='steelblue', alpha=0.5)
geom_violin(aes(fill='group'), alpha=0.5) + geom_boxplot(width=0.1)
```

### Ribbons & Areas
```python
geom_ribbon(aes(ymin='lower', ymax='upper'), fill='blue', alpha=0.2)
geom_area(aes(fill='group'), position='stack', alpha=0.5)
geom_area(position='fill')  # 100% stacked
```

### Specialized
```python
# Hex/2D bin for dense scatter
geom_hex(bins=30) + scale_fill_viridis_c()
geom_bin2d(bins=30) + scale_fill_viridis_c()

# Text labels
geom_text(aes(label='label'), size=3, hjust=0, vjust=0)
geom_text_repel()  # ggrepel
geom_label(aes(label='label'), fill='white', label_size=0.5)

# Annotation
annotate('text', x=5, y=10, label='Note', size=5, color='red')
annotate('segment', x=2, xend=4, y=5, yend=10, arrow=arrow())
annotate('rect', xmin=2, xmax=4, ymin=5, ymax=9, alpha=0.2, fill='yellow')
```

---

## 2. Aesthetics (aes())

### Mapping Variables
```python
aes(x='x_var', y='y_var')                    # Position
aes(color='var')                            # Color
aes(fill='var')                             # Fill
aes(size='var')                             # Size
aes(shape='var')                            # Shape (discrete)
aes(alpha='var')                            # Transparency
aes(linetype='var')                         # Line type
aes(linewidth='var')                        # Line width
aes(group='var')                            # Grouping
aes(order='var')                            # Layer order

# Calculated aesthetics
aes(x='x', y='stat(density)')  # In stat_*()
```

### Setting vs Mapping
```python
# Mapping (inside aes) - varies with data
aes(color='variable')

# Setting (outside aes) - constant
geom_point(color='red', size=2)
```

---

## 3. Scales (scale_*)

### Continuous Scales
```python
# Position
scale_x_continuous(limits=(0, 100), breaks=range(0, 101, 10))
scale_x_log10()
scale_x_reverse()
scale_x_sqrt()

# Color/Fill continuous
scale_color_viridis_c(option='plasma')
scale_fill_viridis_c(option='viridis')
scale_color_gradient(low='blue', high='red')
scale_color_gradient2(low='blue', mid='white', high='red', midpoint=0)
scale_color_gradientn(colors=['blue', 'white', 'red'])

# Date/Time
scale_x_date(date_labels='%b %Y', date_breaks='1 month')
scale_x_datetime(date_labels='%H:%M', date_breaks='2 hours')
```

### Discrete Scales
```python
# Color/Fill
scale_color_viridis_d(option='plasma')
scale_fill_viridis_d(option='viridis')
scale_color_brewer(palette='Set1')
scale_fill_brewer(palette='Set2')

# Manual
scale_color_manual(values={'A': 'red', 'B': 'blue', 'C': 'green'})
scale_fill_manual(values={'A': '#FF0000', 'B': '#0000FF'})

# Shape
scale_shape_manual(values=[16, 17, 18, 15])

# Size
scale_size_continuous(range=(1, 10))
scale_size_area(max_size=10)

# Alpha
scale_alpha_continuous(range=(0.2, 1))
```

### Scale Options
```python
scale_x_continuous(
    name='X Axis',
    breaks=[0, 50, 100],
    labels=['Low', 'Medium', 'High'],
    limits=(0, 100),
    expand=expansion(mult=(0.05, 0.05)),
    trans='log10'
)

# Remove axis
scale_x_continuous(guide='none')
theme(axis_title_x=element_blank(), axis_text_x=element_blank())
```

---

## 3. Themes (theme())

### Built-in Themes
```python
theme_gray()       # Default
theme_bw()         # Black & white
theme_minimal()    # Minimal
theme_classic()    # Classic
theme_void()       # No axes/grid
theme_dark()       # Dark
theme_test()       # For testing
```

### Custom Theme
```python
my_theme = theme_bw(base_size=12, base_family='Roboto Condensed') %+replace%
  theme(
    plot_title=element_text(face='bold', size=16, hjust=0.5, margin=dict(t=0, r=0, b=10, l=0)),
    plot.subtitle=element_text(size=12, hjust=0.5, margin=dict(t=0, r=0, b=10, l=0)),
    axis_title=element_text(face='bold', size=11),
    axis.text=element_text(size=10),
    legend.position='top',
    legend.title=element_text(face='bold'),
    panel.grid.minor=element_blank(),
    panel.grid.major=element_line(color='gray90'),
    strip.background=element_rect(fill='gray95'),
    strip.text=element_text(face='bold')
  )

# Global theme
theme_set(theme_minimal(base_size=12, base_family='Roboto Condensed'))
```

### Common Theme Elements
```python
theme(
  # Text
  plot_title=element_text(face='bold', size=16, hjust=0.5, margin=dict(t=0, r=0, b=10, l=0)),
  plot.subtitle=element_text(size=12, hjust=0.5, margin=dict(t=0, r=0, b=10, l=0)),
  plot.caption=element_text(hjust=0, size=9),
  
  # Axes
  axis_title=element_text(face='bold', size=11),
  axis.title.x=element_text(margin=dict(t=10)),
  axis_title_y=element_text(margin=dict(r=10)),
  axis.text=element_text(size=10),
  axis.text.x=element_text(angle=45, hjust=1, vjust=1),
  axis.ticks=element_line(color='gray80'),
  axis.ticks.length=unit(3, 'pt'),
  
  # Legend
  legend.position='top',
  legend.title=element_text(face='bold'),
  legend.text=element_text(size=10),
  legend.key=element_rect(fill=NA),
  legend.key.size=unit(1, 'lines'),
  
  # Panel
  panel.grid.major=element_line(color='gray90', linewidth=0.5),
  panel.grid.minor=element_blank(),
  panel.border=element_rect(fill=NA, color='gray80'),
  
  # Strips
  strip.background=element_rect(fill='gray95'),
  strip.text=element_text(face='bold'),
  
  # Plot
  plot.background=element_rect(fill='white', color=NA),
  plot.margin=margin(10, 10, 10, 10)
)
```

### Element Functions
```python
element_text(face=c('plain','bold','italic','bold.italic'), 
             size=12, color='black', hjust=0.5, vjust=0.5,
             angle=0, lineheight=1.2, margin=margin())

element_line(color='black', linewidth=0.5, linetype=1, lineend='butt')

element_rect(fill='white', color='black', linewidth=0.5, linetype=1)

element_blank()  # Remove element
```

---

## 3. Faceting

### facet_wrap
```python
facet_wrap('~ var', ncol=2, nrow=2)
facet_wrap('~ var', scales='free_y')  # free_x, free_y, free
facet_wrap('~ var', labeller='label_both')
```

### facet_grid
```python
facet_grid('x ~ y')
facet_grid('row ~ col', scales='free', space='free')
```

### Labels
```python
facet_wrap('~ var', labeller='label_both')
facet_grid('~ var', labeller='label_parsed')
```

---

## 4. Legend (guides)

```python
# Remove legend
theme(legend_position='none')
guides(color='none', fill='none')

# Position
theme(legend_position='top')  # 'right', 'bottom', 'left', 'none'
theme(legend_position=(0.8, 0.2))  # Inside plot

# Direction
guides(color=guide_legend(direction='horizontal'))

# Legend title
guides(color=guide_legend(title='Custom Title'))
labs(color='Custom Title')

# Legend layout
guides(color=guide_legend(nrow=2, byrow=True))
guides(color=guide_legend(ncol=3))

# Override aesthetics
guides(color=guide_legend(override_aes=dict(size=3, linetype=1, shape=16)))

# Legend key
theme(legend_key=element_rect(fill=NA, color=NA))
theme(legend_key.size=unit(1, 'cm'))
```

---

## 3. Faceting

### facet_wrap
```python
facet_wrap('~ var', ncol=2, nrow=2)
facet_wrap('~ var', scales='free')  # free_x, free_y, free
facet_wrap('~ var', labeller='label_both')
```

### facet_grid
```python
facet_grid('x ~ y')
facet_grid('row ~ col', scales='free', space='free')
```

### Labels
```python
facet_wrap('~ var', labeller='label_both')
facet_grid('x ~ y', labeller='label_both')
```

---

## 3. Legends (guides)

```python
# Remove legend
theme(legend_position='none')
guides(color='none', fill='none')

# Position
theme(legend_position='top')  # 'right', 'bottom', 'left', 'none'
theme(legend_position=(0.8, 0.2))  # Inside plot

# Direction
guides(color=guide_legend(direction='horizontal'))

# Multiple legends
guides(color=guide_legend(order=1), shape=guide_legend(order=2))

# Override aesthetics
guides(color=guide_legend(override_aes=dict(size=3, linetype=1, shape=16)))
```

---

## 5. Annotations & Text

```python
# Geom text
geom_text(aes(label='label'), size=3, hjust=0, vjust=0)
geom_text_repel()  # ggrepel

# Label with background
geom_label(aes(label='label'), fill='white', label_size=0.5)

# Annotate
annotate('text', x=5, y=10, label='Note', size=5, color='red')
annotate('segment', x=2, xend=4, y=5, yend=10, arrow=arrow())
annotate('rect', xmin=2, xmax=4, ymin=5, ymax=9, alpha=0.2, fill='yellow')

# Rich text (ggtext)
from plotnine import element_markdown
theme(plot_title=element_markdown())
labs(title='**Bold** and *italic* with <span style="color:red">color</span>') +
theme(plot_title=element_markdown())
```

---

## 5. Coordinates

```python
# Cartesian
coord_cartesian(xlim=(0, 100), ylim=(0, 50), expand=True, clip='on')

# Fixed aspect
coord_fixed(ratio=1)

# Flipped
coord_flip()

# Polar
coord_polar(theta='x', start=0, direction=1)

# Map
coord_map('mercator')
coord_quickmap()

# Transformed
coord_trans(x='log10', y='sqrt')

# Limits without clipping
coord_cartesian(xlim=(0, 100), clip='on')
```

---

## 5. Faceting

### facet_wrap
```python
facet_wrap('~ var', ncol=2, nrow=2)
facet_wrap('~ var', scales='free')  # free_x, free_y, free
facet_wrap('~ var', labeller='label_both')
```

### facet_grid
```python
facet_grid('x ~ y')
facet_grid('row ~ col', scales='free', space='free')
```

### Labels
```python
facet_wrap('~ var', labeller='label_both')
facet_grid('x ~ y', labeller='label_both')
```

---

## 6. Colors

### Color Palettes
```python
# Viridis
scale_color_viridis_d()  # discrete
scale_color_viridis_c()  # continuous

# Brewer
scale_color_brewer(palette='Set1')
scale_fill_brewer(palette='Set2')

# Scientific
scale_color_scico_d(palette='vik')
scale_fill_scico_c(palette='roma')

# RCartaColor
scale_color_carto_d(palette='Safe')

# ggsci
scale_color_npg()
scale_color_aaas()
scale_color_lancet()
scale_color_nejm()
```

### Manual Colors
```python
scale_color_manual(values={'A': 'red', 'B': 'blue', 'C': 'green'})
scale_fill_manual(values={'A': '#FF0000', 'B': '#0000FF'})
```

### Gradient
```python
scale_color_gradient(low='blue', high='red')
scale_color_gradient2(low='blue', mid='white', high='red', midpoint=0)
scale_color_gradientn(colors=['blue', 'white', 'red'])
```

---

## 5. Saving Plots

```python
# ggsave (recommended)
ggsave('plot.png', width=8, height=6, dpi=300)
ggsave('plot.pdf', width=8, height=6, device='cairo_pdf')

# vLLM + cairo_pdf
ggsave('plot.pdf', p, width=8, height=6, device='cairo_pdf')

# Multiple formats
ggsave('plot.png', p, width=8, height=6, dpi=300)
ggsave('plot.pdf', p, width=8, height=6, device='cairo_pdf')
ggsave('plot.svg', p, width=8, height=6)

# Patchwork
ggsave('combined.png', p1 + p2, width=12, height=6, dpi=300)
```

---

## 7. Best Practices

### 7.1 Do's and Don'ts
```python
# ✅ DO
ggplot(df, aes(x, y)) + geom_point()
ggplot(df) + aes(x, y) + geom_point()
df |> ggplot(aes(x, y)) + geom_point()

# ❌ DON'T
ggplot(aes(x, y), data=df) + geom_point()  # data first!
aes(x, y) |> ggplot(df) + geom_point()      # wrong order
```

### 7.2 Performance Tips
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

### 7.3 Debugging
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

## 8. Resources

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
4. **Themes control non-data ink** - `theme()`, `theme_bw()`, etc.
5. **Facets for small multiples** - `facet_wrap()`, `facet_grid()`
5. **Patchwork for composition** - `p1 + p2`, `p1 / p2`
6. **Save with `ggsave()`** - specify dimensions and DPI
7. **Iterate** - build plots incrementally, save intermediate objects
8. **Use `theme_set()`** for consistent styling across plots

---

*Last updated: 2024-11-04*
*Based on: [Cedric Scherer's ggplot2 Tutorial](https://www.cedricscherer.com/2019/08/05/a-ggplot2-tutorial-for-beautiful-plotting-in-r/)*
*Adapted for Python's plotnine package*