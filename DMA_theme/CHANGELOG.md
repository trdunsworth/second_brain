# Changelog

All notable changes to DMA Theme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-08-20

### Added
- Initial release of DMA Theme
- Core semantic color palette (blue, teal, turquoise, green + error, warning, info, success)
- Light and dark theme variants (light is default)
- Editor themes:
  - VS Code / Positron (full semantic highlighting)
  - Emacs (complete with org, magit, lsp, package support)
  - Neovim (Lua-based with TreeSitter, LSP, plugin integrations)
  - Kakoune (light and dark)
  - Helix (light and dark)
  - Zed (light and dark)
  - Notepad++ (light and dark)
- Terminal themes:
  - Ghostty (light and dark)
  - WezTerm (light and dark)
  - Cosmic Terminal (light and dark)
  - Yen (light and dark)
  - Warp (light and dark)
  - tmux (light and dark with status line)
- Obsidian CSS theme (light and dark with CSS variables)
- Python palettes for matplotlib, seaborn, plotnine/ggplot2
- R palettes for ggplot2 and plotly
- Comprehensive documentation (README, GUIDELINES, TODO)

### Design Decisions
- Default to light theme (black text on softer white background)
- Bold, saturated colors (no pastels)
- Semantic color system (colors have meaning)
- Blue/teal/turquoise/green primary palette
- Warm red/orange for errors and warnings

## [1.1.0]

### Added
- **Data-visualization palettes** — Brewer-style schemes synthesized from DMA brand colors:
  - `palettes/python/`: zero-dependency core (`dma_palette.py`), matplotlib colormaps + cycle (`matplotlib_dma.py`, 11 registered cmaps), plotnine scales (`plotnine_dma.py`, incl. `ggplot2_dma.py` alias), seaborn helpers (`seaborn_dma.py`), demo notebook
  - `palettes/r/`: base-R core (`dma_palette.R`), ggplot2 scales discrete/continuous/binned/diverging (`ggplot2_dma.R`), plotly colorscales + layout defaults (`plotly_dma.R`), R Markdown demo
  - Schemes: qualitative (8), sequential single-hue (Blues/Teals/Turquoises/Greens/Oranges) and multi-hue (Cool/Ocean/Forest), diverging (Red-Blue/Red-Green/Brown-Teal)
  - Semantic status colors verified ≥ 4.5:1 contrast on white; warning required the 800 stop (#9E5E00)

### Changed
- **Brightened the light theme across all environments.** Syntax colors were using dark 700–900 scale stops that rendered nearly black against the soft white background, making tokens indistinguishable from each other and from plain text. All light variants now draw syntax colors from the brighter 400–600 stops:
  - Keywords/operators: teal `#004D4D`–`#005A5A` → `#009999`/`#007F7F` (teal 600)
  - Strings: green `#007F2A` → `#009933` (green 500/600)
  - Numbers/functions: blue `#00529E` → `#0077CC` (blue 500)
  - Types/classes: `#006666`/`#007373` → `#009999` (teal 500)
  - Constants/regex: brown `#8C5A00`/`#7A4A00` → orange `#D47800`
  - Foreground unified on `#1A2A35`; borders lightened to `#A8C0D8`
- Updated in: VS Code, Positron, Emacs, Neovim, Kakoune, Helix, Zed, Notepad++, Obsidian, Ghostty, WezTerm, Cosmic Terminal, Yen, Warp, tmux, and `palette.json`
- `palette.json`: `primary.blue.500` corrected `#007BDB` → `#0077CC` to match the accent already shipped in all v1.1.0 themes
- Dark theme unchanged

### Added
- "Light Theme Contrast Strategy" section in GUIDELINES.md documenting the shade-selection rules

### Planned
- VS Code Marketplace publication
- Sublime Text theme
- Nova theme
- Lapce theme
- Additional language-specific optimizations
- Web-based theme preview
- WCAG contrast compliance report