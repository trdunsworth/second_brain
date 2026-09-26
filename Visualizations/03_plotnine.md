# Plotnine (ggplot for Python) Learning Guide

## Overview
Plotnine is a Python implementation of ggplot2 (Grammar of Graphics) that brings the declarative, layered approach to visualization to the Python ecosystem. It provides a direct port of ggplot2's API with Pythonic conventions, enabling users familiar with R's ggplot2 to create publication-quality plots in Python.

## Quick Template

```python
# Basic plotnine workflow
from plotnine import *
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'x': np.random.randn(100),
    'y': np.random.randn(100),
    'group': np.random.choice(['A', 'B', 'C'], 100),
    'size': np.random.uniform(1, 10, 100)
})

# Grammar of Graphics: data -> aesthetics -> geometry -> facets -> stats -> coordinates -> theme
(
    ggplot(df, aes(x='x', y='y', color='group', size='size'))
    + geom_point(alpha=0.6)
    + geom_smooth(method='lm', se=False)
    + facet_wrap('~group')
    + theme_minimal()
    + labs(title="Plotnine Example", x="X Variable", y="Y Variable")
    + scale_color_brewer(type='qual', palette='Set1')
)
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| **GGplot Object** | `ggplot(data, aes(...))` | `ggplot(df, aes(x='x', y='y'))` |
| **Aesthetics** | `aes(x, y, color, fill, size, shape, alpha, linetype, group)` | `aes(x='x', y='y', color='group')` |
| **Geometries** | `geom_*()` | `geom_point()`, `geom_line()`, `geom_bar()` |
| **Statistics** | `stat_*()` | `stat_smooth()`, `stat_summary()`, `stat_density()` |
| **Scales** | `scale_*_*()` | `scale_color_gradient()`, `scale_x_log10()` |
| **Facets** | `facet_wrap()`, `facet_grid()` | `facet_wrap('~var')`, `facet_grid('row~col')` |
| **Coordinates** | `coord_*()` | `coord_flip()`, `coord_polar()`, `coord_fixed()` |
| **Themes** | `theme_*()`, `theme()` | `theme_minimal()`, `theme(axis_text=element_text(size=12))` |
| **Labels** | `labs()` | `labs(title="T", x="X", y="Y", color="Group")` |
| **Guides** | `guides()` | `guides(color=guide_legend(ncol=2))` |

## Grammar of Graphics Components

### 1. Data & Aesthetics

```python
from plotnine import *
import pandas as pd

df = pd.DataFrame({
    'x': range(10),
    'y': [1, 3, 2, 5, 4, 6, 8, 7, 9, 10],
    'group': ['A', 'B'] * 5,
    'category': ['X', 'Y'] * 5
})

# Aesthetic mappings
# aes(x, y, color, fill, size, shape, alpha, linetype, group, label)
base = ggplot(df, aes(x='x', y='y', color='group', shape='category', group='group'))
```

### 2. Geometries (Geoms)

```python
# Points
base + geom_point(size=3, alpha=0.7)

# Lines
base + geom_line(linewidth=1.2) + geom_point(size=2)

# Bars (stat='identity' for pre-summarized)
ggplot(df, aes(x='group', y='y', fill='group')) + geom_col(position='dodge')

# Histograms / Density
ggplot(df, aes(x='y')) + geom_histogram(bins=10, fill='steelblue', color='white')
ggplot(df, aes(x='y', fill='group')) + geom_density(alpha=0.5)

# Boxplot / Violin
ggplot(df, aes(x='group', y='y', fill='group')) + geom_boxplot(width=0.5)
ggplot(df, aes(x='group', y='y', fill='group')) + geom_violin(alpha=0.5) + geom_boxplot(width=0.1)

# Smooth / Regression
ggplot(df, aes(x='x', y='y')) + geom_point() + geom_smooth(method='lm', se=True, color='red')

# Text / Labels
ggplot(df, aes(x='x', y='y', label='y')) + geom_point() + geom_text(nudge_y=0.5, size=8)

# Area / Ribbon
ggplot(df, aes(x='x', ymin=0, ymax='y', fill='group')) + geom_ribbon(alpha=0.3)

# Error bars
summary_df = df.groupby('group')['y'].agg(['mean', 'std']).reset_index()
ggplot(summary_df, aes(x='group', y='mean', ymin='mean-std', ymax='mean+std')) + geom_errorbar(width=0.2) + geom_point(size=3)
```

### 3. Statistics (Stats)

```python
# stat_smooth - smoothing
ggplot(df, aes(x='x', y='y')) + geom_point() + stat_smooth(method='loess', span=0.75)

# stat_summary - custom summaries
ggplot(df, aes(x='group', y='y')) + stat_summary(fun_y='mean', geom='bar', fill='steelblue')
ggplot(df, aes(x='group', y='y')) + stat_summary(fun_data='mean_cl_boot', geom='errorbar', width=0.2)
ggplot(df, aes(x='group', y='y')) + stat_summary(fun_y='median', geom='point', size=4, color='red')

# stat_density / stat_bin
ggplot(df, aes(x='y')) + stat_density(geom='line', color='blue')
ggplot(df, aes(x='y')) + stat_bin(bins=10, geom='bar', fill='steelblue')

# stat_ecdf - empirical CDF
ggplot(df, aes(x='y', color='group')) + stat_ecdf(linewidth=1.2)

# stat_qq / stat_qq_line - Q-Q plots
ggplot(df, aes(sample='y')) + stat_qq() + stat_qq_line(color='red')

# stat_function - plot a function
import numpy as np
ggplot(pd.DataFrame({'x': [-3, 3]}), aes(x='x')) + stat_function(fun=np.sin, n=100, color='blue')
```

### 4. Scales

```python
# Continuous scales
+ scale_x_continuous(breaks=range(0, 11, 2), labels=['0', '2', '4', '6', '8', '10'])
+ scale_y_continuous(trans='log10', limits=(0.1, 100))
+ scale_color_gradient(low='blue', high='red')
+ scale_fill_gradient2(low='blue', mid='white', high='red', midpoint=0)
+ scale_size_continuous(range=(1, 10))

# Discrete scales
+ scale_color_brewer(type='qual', palette='Set1')  # ColorBrewer
+ scale_fill_viridis_d(option='plasma')  # Viridis discrete
+ scale_shape_manual(values=[16, 17, 15, 18])  # Custom shapes
+ scale_linetype_manual(values=['solid', 'dashed', 'dotted'])

# Date/Time scales
+ scale_x_datetime(date_breaks='1 month', date_labels='%b %Y')

# Manual scales
+ scale_color_manual(values={'A': 'red', 'B': 'blue', 'C': 'green'})
+ scale_fill_manual(values=['#E41A1C', '#377EB8', '#4DAF4A'])

# Reverse scales
+ scale_x_reverse()
+ scale_y_reverse()
```

### 5. Faceting

```python
# facet_wrap - 1D faceting
+ facet_wrap('~group', ncol=2, scales='free_y')
+ facet_wrap('~group + category', nrow=2)

# facet_grid - 2D faceting
+ facet_grid('row_var ~ col_var', scales='free', space='free')
+ facet_grid('. ~ group')  # columns only
+ facet_grid('group ~ .')  # rows only

# Facet labels
+ facet_wrap('~group', labeller=labeller(group={'A': 'Group A', 'B': 'Group B'}))
```

### 6. Coordinate Systems

```python
+ coord_flip()           # Flip x and y
+ coord_fixed(ratio=1)   # Fixed aspect ratio
+ coord_polar(theta='x', start=0)  # Polar coordinates
+ coord_trans(x='log10', y='sqrt') # Transformed coordinates
+ coord_cartesian(xlim=(0, 10), ylim=(0, 5))  # Zoom without clipping
+ coord_map(projection='mercator') # Map projections
```

### 7. Themes

```python
# Built-in themes
+ theme_minimal()
+ theme_bw()
+ theme_classic()
+ theme_void()
+ theme_dark()
+ theme_gray()  # Default ggplot2 theme
+ theme_linedraw()
+ theme_light()

# Theme customization
+ theme(
    figure_size=(10, 6),
    dpi=100,
    plot_title=element_text(size=16, face='bold', ha='center'),
    axis_title=element_text(size=12),
    axis_text=element_text(size=10, color='gray30'),
    axis_text_x=element_text(angle=45, hjust=1),
    legend_title=element_text(size=11, face='bold'),
    legend_text=element_text(size=10),
    legend_position='bottom',
    legend_direction='horizontal',
    panel_grid_major=element_line(color='gray90', size=0.5),
    panel_grid_minor=element_blank(),
    panel_background=element_rect(fill='white'),
    plot_background=element_rect(fill='white'),
    strip_background=element_rect(fill='gray90'),
    strip_text=element_text(size=11, face='bold')
)

# Save theme for reuse
my_theme = theme_minimal() + theme(
    plot_title=element_text(size=14, face='bold'),
    legend_position='bottom'
)
```

### 8. Labels & Annotations

```python
+ labs(
    title="Main Title",
    subtitle="Subtitle here",
    caption="Source: Data.gov",
    x="X Axis Label",
    y="Y Axis Label",
    color="Legend Title",
    fill="Fill Legend",
    size="Size Legend",
    shape="Shape Legend"
)

# Annotations
+ annotate('text', x=5, y=8, label='Annotation', size=12, color='red')
+ annotate('segment', x=2, xend=8, y=5, yend=5, color='blue', arrow=arrow())
+ annotate('rect', xmin=3, xmax=7, ymin=2, ymax=4, alpha=0.2, fill='yellow')
```

## Practical Examples

### 1. Publication-Quality Plot

```python
from plotnine import *
import pandas as pd
import numpy as np

# Generate sample data
np.random.seed(42)
n = 200
df = pd.DataFrame({
    'treatment': np.repeat(['Control', 'Treatment A', 'Treatment B'], n//3),
    'response': np.concatenate([
        np.random.normal(5, 1.5, n//3),
        np.random.normal(7, 1.2, n//3),
        np.random.normal(6.5, 1.8, n//3)
    ]),
    'time': np.tile(np.repeat([1, 2, 3, 4, 5], n//15), 3)
})

# Publication plot
p = (
    ggplot(df, aes(x='factor(time)', y='response', fill='treatment'))
    + geom_boxplot(width=0.6, outlier_shape='', alpha=0.7)
    + geom_jitter(aes(color='treatment'), width=0.15, alpha=0.5, size=1.5, show_legend=False)
    + stat_summary(fun_y=np.mean, geom='point', shape='D', size=3, color='black', 
                   position=position_dodge(0.6), show_legend=False)
    + scale_fill_manual(values=['#66C2A5', '#FC8D62', '#8DA0CB'])
    + scale_color_manual(values=['#66C2A5', '#FC8D62', '#8DA0CB'])
    + labs(
        title="Treatment Effects Over Time",
        subtitle="Boxplots with individual observations and mean (diamond)",
        x="Time Point",
        y="Response Value",
        fill="Treatment Group"
    )
    + theme_minimal()
    + theme(
        figure_size=(10, 6),
        plot_title=element_text(size=16, face='bold', ha='center'),
        plot_subtitle=element_text(size=12, ha='center', color='gray40'),
        axis_title=element_text(size=13),
        axis_text=element_text(size=11),
        legend_title=element_text(size=12, face='bold'),
        legend_text=element_text(size=11),
        legend_position='bottom',
        panel_grid_major_x=element_blank(),
        panel_grid_minor=element_blank()
    )
)

p.save('treatment_effects.png', dpi=300, width=10, height=6)
print(p)
```

### 2. Complex Faceted Visualization

```python
# Multi-panel figure with shared axes
from plotnine import *

p = (
    ggplot(df, aes(x='time', y='response', color='treatment', group='treatment'))
    + geom_line(stat='summary', fun_y=np.mean, linewidth=1.2)
    + geom_point(stat='summary', fun_y=np.mean, size=3)
    + geom_ribbon(
        aes(ymin='..y.. - ..se..', ymax='..y.. + ..se..', fill='treatment'),
        stat='summary', fun_data='mean_se', alpha=0.2, color=None
    )
    + facet_wrap('~treatment', ncol=3)
    + scale_color_manual(values=['#66C2A5', '#FC8D62', '#8DA0CB'])
    + scale_fill_manual(values=['#66C2A5', '#FC8D62', '#8DA0CB'])
    + labs(x="Time", y="Mean Response ± SE", title="Treatment Trajectories")
    + theme_minimal()
    + theme(
        legend_position='none',
        strip_background=element_rect(fill='gray90'),
        strip_text=element_text(size=12, face='bold')
    )
)
```

### 3. Custom Statistical Transformations

```python
from plotnine import *
from plotnine.stats import Stat
import numpy as np

# Custom stat: running mean
class stat_running_mean(Stat):
    required_aes = ['x', 'y']
    default_aes = {'window': 5}
    
    def compute_group(self, data, scales, window=5):
        data = data.sort_values('x')
        data['y'] = data['y'].rolling(window=window, center=True, min_periods=1).mean()
        return data

# Register and use
from plotnine import register_stat
register_stat(stat_running_mean)

# Usage
ggplot(df, aes(x='time', y='response', color='treatment')) + \
    geom_point(alpha=0.3) + \
    stat_running_mean(window=3, geom='line', linewidth=1.5)
```

### 4. Combining Plots with `patchwork` (via `plotnine.patchwork`)

```python
from plotnine import *
from plotnine.patchwork import *

p1 = ggplot(df, aes(x='time', y='response')) + geom_boxplot(aes(fill='treatment')) + theme_minimal()
p2 = ggplot(df, aes(x='response', fill='treatment')) + geom_density(alpha=0.5) + theme_minimal()
p3 = ggplot(df, aes(x='time', y='response', color='treatment')) + geom_line(stat='summary', fun_y=np.mean) + theme_minimal()

# Layouts
combined = (p1 | p2) / p3  # p1 and p2 side by side, p3 below
combined = p1 + p2 + p3 + plot_layout(ncol=2)  # Grid layout
combined = p1 / (p2 | p3)  # p1 top, p2/p3 bottom row

print(combined)
```

### 5. Animation with `plotnine.animation`

```python
from plotnine import *
from plotnine.animation import PlotnineAnimation
import numpy as np

# Create frames
def make_frame(year):
    df_year = gapminder[gapminder['year'] == year]
    return (
        ggplot(df_year, aes(x='gdpPercap', y='lifeExp', size='pop', color='continent'))
        + geom_point(alpha=0.7)
        + scale_x_log10()
        + scale_size(range=(2, 20))
        + scale_color_brewer(type='qual', palette='Set1')
        + labs(title=f"Year: {year}", x="GDP per Capita", y="Life Expectancy")
        + theme_minimal()
        + theme(legend_position='bottom')
    )

# Animate
anim = PlotnineAnimation(make_frame, frames=range(1952, 2007, 5))
anim.save('gapminder.gif', fps=2, dpi=100)
```

### 6. Interactive Plots with `plotly` Backend

```python
# Convert to interactive plotly
import plotly.io as pio
from plotnine import *

p = ggplot(df, aes(x='x', y='y', color='group')) + geom_point()

# Method 1: Using plotly directly
import plotly.graph_objects as go
fig = p.draw(show=False)
pio.write_html(fig, 'interactive.html')

# Method 2: Using plotnine's plotly backend (experimental)
# Requires plotnine 0.12+
p_interactive = p + theme(figure_size=(8, 6))
# p_interactive.show()  # Opens in browser
```

## Working with Plotnine in Different Environments

### Jupyter Notebooks

```python
# Inline display
from plotnine import *
p = ggplot(df, aes(x='x', y='y')) + geom_point()
p  # Displays inline

# Save with specific dimensions
p.save('plot.png', width=8, height=6, dpi=300, verbose=False)

# Multiple plots in one cell
from plotnine.patchwork import *
p1 + p2  # Side by side
```

### Integration with Polars

```python
import polars as pl
from plotnine import *

# Plotnine works with Polars DataFrames (via __dataframe__ protocol)
df_pl = pl.DataFrame({
    'x': [1, 2, 3, 4, 5],
    'y': [2, 4, 1, 5, 3],
    'group': ['A', 'A', 'B', 'B', 'A']
})

ggplot(df_pl, aes(x='x', y='y', color='group')) + geom_point(size=4) + geom_line()
```

### Export Formats

```python
# Static formats
p.save('plot.png', dpi=300)
p.save('plot.pdf', width=8, height=6)
p.save('plot.svg', width=8, height=6)

# High-res for publications
p.save('plot.tiff', dpi=600, compression='tiff_lzw')

# Data export
p.save('plot_data.csv')  # Saves underlying data
```

## Common Plotnine Uses

- **Publication Figures** - Journal-ready plots with precise control
- **Exploratory Analysis** - Quick grammar-based exploration
- **Teaching** - Grammar of Graphics pedagogy in Python
- **Reproducible Reports** - Integration with Quarto/Jupyter
- **Migration from R** - Direct ggplot2 code translation

## Plotnine Advantages

- **Grammar of Graphics** - Consistent, declarative syntax
- **ggplot2 Compatibility** - Near 1:1 API mapping
- **Publication Quality** - Fine-grained theme control
- **Extensible** - Custom stats, geoms, scales, coords
- **Python Native** - Works with pandas, polars, numpy
- **Patchwork** - Plot composition algebra

## Plotnine Pitfalls

- **Performance** - Slower than matplotlib/plotly for large data (>100k points)
- **Documentation** - Less comprehensive than ggplot2
- **Missing Features** - Some ggplot2 extensions not ported
- **Debugging** - Error messages can be cryptic
- **Interactivity** - Static only; requires conversion for interactive

## Awesome Plotnine Resources

- **[Plotnine Docs](https://plotnine.readthedocs.io)** - Official documentation
- **[Plotnine Gallery](https://plotnine.readthedocs.io/en/stable/gallery.html)** - Examples
- **[Plotnine GitHub](https://github.com/has2k1/plotnine)** - Source & issues
- **[ggplot2 Docs](https://ggplot2.tidyverse.org)** - Reference for R equivalent
- **[R Graphics Cookbook](https://r-graphics.org)** - Recipes (translate to plotnine)
- **[Grammar of Graphics](https://www.springer.com/gp/book/9780387245447)** - Wilkinson's book
- **[awesome-plotnine](https://github.com/has2k1/awesome-plotnine)** - Curated resources

## Plotnine vs Other Python Plotting

| Feature | Plotnine | Matplotlib | Seaborn | Plotly | Altair |
|---------|----------|------------|---------|--------|--------|
| Paradigm | Grammar of Graphics | Imperative | Declarative (partial) | Imperative/Declarative | Declarative (Vega-Lite) |
| ggplot2 Compatible | Yes | No | Partial | No | No |
| Publication Quality | Excellent | Good | Good | Good | Good |
| Interactivity | Via conversion | Limited | Limited | Native | Via Vega |
| Large Data | Slow | Fast | Fast | Fast | Fast |
| Learning Curve | Medium (if know ggplot2) | High | Low | Medium | Medium |
| Customization | Very High | Very High | Medium | High | High |

## Plotnine Quick Checklist

1. **Import** - `from plotnine import *` (standard convention)
2. **Data** - Use pandas/polars DataFrames; ensure tidy format
3. **Aesthetics** - Map variables in `aes()`; use `factor()` for categorical
4. **Layers** - Add geoms with `+`; order matters (bottom to top)
5. **Scales** - Control appearance with `scale_*_*()` functions
6. **Facets** - Use `facet_wrap`/`facet_grid` for small multiples
7. **Themes** - Start with `theme_minimal()` or `theme_bw()`; customize
8. **Labels** - Always add `labs()` for title, axes, legends
9. **Save** - Use `.save()` with `dpi=300` for publications
10. **Extend** - Create custom stats/geoms for specialized needs

---

*Last updated: 2024 | Plotnine 0.13+ compatible*