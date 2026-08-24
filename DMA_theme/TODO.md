# DMA Theme - Task Tracker

## Project Status: In Development

---

## ✅ Completed

### Core Palette & Theme Definition
- [x] Define primary color palette (blue, teal, turquoise, green) with 10 shades each
- [x] Define semantic colors (error, warning, info, success) with 10 shades each
- [x] Define neutral colors for light and dark themes
- [x] Create semantic theme mappings for light variant
- [x] Create semantic theme mappings for dark variant
- [x] Create master `palette.json` with all colors and theme definitions
- [x] **Brighten light theme colors** - Updated light theme to use 300-400 range shades for better contrast and distinction

### VS Code / Positron
- [x] Light theme (`dma-theme-light-color-theme.json`) - **Updated with brighter syntax colors**
- [x] Dark theme (`dma-theme-dark-color-theme.json`)
- [x] Package.json with metadata and publishing config
- [x] Semantic highlighting support
- [x] Full tokenColors for TextMate grammars

### Emacs
- [x] Complete theme file (`dma-theme-theme.el`) with light variant
- [x] Support for core faces, mode line, minibuffer, completion
- [x] Font-lock faces for syntax highlighting
- [x] Tree-sitter faces
- [x] Org mode, Markdown, Magit support
- [x] LSP/Flycheck/Company/Ivy/Helm/Consult/Corfu/Vertico/Marginalia support
- [x] Language-specific faces (Python, Rust, Go, C/C++, Java, SQL, R, Julia, Typescript, Web)
- [x] ANSI terminal colors

### Ghostty
- [x] Light theme (`dma-theme-light`)
- [x] Full 256-color palette with semantic color extensions
- [x] Dark theme (`dma-theme-dark`)

### WezTerm
- [x] Light theme (`dma-theme-light.toml`) - **Updated with brighter colors**
- [x] Dark theme (`dma-theme-dark.toml`)
- [x] Full indexed color palette (16-255)
- [x] UI colors (scrollbar, split, copy mode, quick select, launcher)

### Neovim
- [x] Lua-based theme structure
- [x] Palette module with light/dark variants
- [x] Comprehensive highlights module (500+ highlight groups)
- [x] TreeSitter/LSP/Diagnostic highlights
- [x] Plugin integrations (Telescope, NvimTree, WhichKey, Lazy, Mason, Noice, Notify, Snacks, Gitsigns, IndentBlankline, Mini, Leap, Flash, Cmp, BlinkCmp, RainbowDelimiter)

### Helix
- [x] `dma-theme-light.toml` — Light theme - **Updated with brighter palette**
- [x] `dma-theme-dark.toml` — Dark theme

### Kakoune
- [x] `dma-theme-light.kak` — Light theme
- [x] `dma-theme-dark.kak` — Dark theme

### Notepad++
- [x] `dma-theme-light.xml` — Light theme
- [x] `dma-theme-dark.xml` — Dark theme

### Obsidian
- [x] `dma-theme.css` — CSS theme with light/dark variants using CSS variables

### Positron
- [x] `dma-theme-light.json` — Light theme (VS Code compatible) - **Updated with brighter colors**
- [x] `dma-theme-dark.json` — Dark theme (VS Code compatible)

### Zed
- [x] `dma-theme-light.json` — Light theme - **Updated with brighter colors**
- [x] `dma-theme-dark.json` — Dark theme

### Terminal Themes

#### Cosmic Terminal
- [x] `dma-theme-light.toml` — Light theme
- [x] `dma-theme-dark.toml` — Dark theme

#### Yen
- [x] `dma-theme-light.yaml` — Light theme - **Updated with brighter colors**
- [x] `dma-theme-dark.yaml` — Dark theme

#### Warp
- [x] `dma-theme-light.yaml` — Light theme - **Updated with brighter colors**
- [x] `dma-theme-dark.yaml` — Dark theme

#### tmux
- [x] `dma-theme-light.conf` — Light theme with status line
- [x] `dma-theme-dark.conf` — Dark theme with status line

#### Microsoft Terminal (Windows Terminal)
- [x] `dma-theme-light.json` — Light theme
- [x] `dma-theme-dark.json` — Dark theme

---

## 🔄 In Progress

### Documentation
- [x] README.md
- [x] TODO.md (this file)
- [x] GUIDELINES.md
- [x] CHANGELOG.md
- [x] LICENSE

---

## 📋 Pending - High Priority

### Remaining Light Theme Brightness Updates
- [x] `themes/cosmic/dma-theme-light.toml` — Update to brighter palette
- [x] `themes/ghostty/` — Update light theme colors
- [x] `themes/emacs/` — Update light theme colors
- [x] `themes/neovim/` — Update light theme palette/highlights
- [x] `themes/kakoune/dma-theme-light.kak` — Update to brighter colors
- [x] `themes/notepadpp/dma-theme-light.xml` — Update to brighter colors
- [x] `themes/obsidian/dma-theme.css` — Update CSS variables for light mode
- [x] `themes/tmux/dma-theme-light.conf` — Update to brighter colors
- [x] `themes/positron/dma-theme-light.json` — Synced from updated VS Code theme

### VSIX Packaging
- [x] Version bumped to 1.1.0 (`package.json`, `palette.json`, CHANGELOG)
- [x] `.vscodeignore` added (excludes logo, icon script)
- [x] `dma-theme-1.1.0.vsix` built and verified (42 KB, brightened colors confirmed)

### Data Visualization Palettes
- [x] **Python (`palettes/python/`)** — `dma_palette.py` (zero-dep core), `matplotlib_dma.py` (11 colormaps + cycle), `plotnine_dma.py` (ggplot2-style scales), `seaborn_dma.py`, `ggplot2_dma.py` (alias), `demo_python.ipynb`
- [x] **R (`palettes/r/`)** — `dma_palette.R`, `ggplot2_dma.R` (discrete/continuous/binned/diverging), `plotly_dma.R`, `demo_r.Rmd`
- [x] **Brewer-style schemes** — qualitative (8), sequential single-hue ×5, sequential multi-hue ×3 (Cool/Ocean/Forest), diverging ×3 (Red-Blue/Red-Green/Brown-Teal)
- [x] WCAG contrast verified: semantic status colors ≥ 4.5:1 on white (warning needed 800 stop)
- [x] Tested: Python core+matplotlib executed; R core via Rscript (ggplot2 figure builds skipped locally — library not installed)

---

## 📋 Pending - Medium Priority

### VS Code Extension
- [x] Create extension icon (`icon.png`) — shipped in VSIX v1.1.0
- [ ] Publish to VS Code Marketplace
- [ ] Add to Open VSX Registry

### Repository Setup
- [x] Initialize git repository
- [ ] Create GitHub repository
- [ ] Set up GitHub Actions for CI/CD
- [ ] Configure dependabot
- [ ] Add contribution templates (issue, PR)

---

## 📋 Pending - Low Priority

### Additional Features
- [x] Create theme preview images — mock editor renders (`assets/preview-light.png`, `preview-dark.png`) + scale strips (primary, semantic, ANSI light/dark, dataviz qualitative/sequential/diverging), generated from `palette.json` via `scripts/generate_swatches.py`; all embedded in README.md
- [x] Verify generated images programmatically (`scripts/verify_swatches.py`) — confirmed light bg lum ≈245, dark bg lum ≈18, all strips color-rich
- [ ] Add support for more editors (Sublime Text, Nova, Lapce, etc.)
- [ ] Create web-based theme preview
- [x] Generate color contrast report (WCAG compliance) — `scripts/contrast_report.py` → `CONTRAST.md`; 0 text/UI FAILs in both themes; semantic status text uses 800 stop on light
- [x] Fix stale GitHub repo links repo-wide (`dunsworth-mann-analytics/dma-theme` → `trdunsworth/DMA_Theme_2`): README, vscode/README+package.json, Emacs header, Python pyproject/setup/__init__, R DESCRIPTION, Neovim manifest
- [x] Sync light-variant warning/conflict/escape *text* tokens to `#9E5E00` (800 stop) across Positron, Zed, Helix, Kakoune, Notepad++, tmux, Neovim, Obsidian (palette.json `gitConflicting` too); terminal ANSI yellow / borders / fills retain `#E88800` by design
- [ ] Create npm package for web/CSS variables

---

## 🎨 Design Decisions Tracked

| Decision | Date | Rationale |
|----------|------|-----------|
| Default to light theme | 2024-08-20 | Per requirements: "Text should be black, background a softer white" |
| No pastels | 2024-08-20 | Per requirements: "bolder and darker colours where practical" |
| Semantic color system | 2024-08-20 | Per requirements: "semantic theme, using other semantic themes as examples" |
| Blue/teal/turquoise/green primary | 2024-08-20 | Per requirements: "focus on blues, teals, turquoises, and greens" |
| Warm red/orange for errors/warnings | 2024-08-20 | Per requirements: "Warm colours like reds and oranges should be used for errors and warnings" |
| Light theme syntax uses 400-600 range shades | 2026-08-22 | User feedback: colors too dark, appeared black on light background; 300s reserved for accents on tinted backgrounds |

---

## 📝 Notes

- All themes should use the exact colors from `palette.json` for consistency
- When creating new themes, reference existing implementations (VS Code, Emacs, Neovim) for semantic mapping patterns
- Test each theme in its target environment before marking complete
- Update CHANGELOG.md with each release
- Light theme syntax colors now use brighter shades (400-600 range): teal 600 (#009999), blue 500 (#0077CC), green 500 (#009933); see GUIDELINES.md "Light Theme Contrast Strategy"