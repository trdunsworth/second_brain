# DMA Theme

A semantic color theme for editors, terminals, and Obsidian focused on blues, teals, turquoises, and greens with warm error/warning colors. Created by [Dunsworth, Mann, and Associates LLC](https://dunsworth-mann.com).

## Overview

DMA Theme provides a consistent visual language across different development environments. It features:

- **Semantic color system** — Colors have meaning (error, warning, info, success) rather than just syntax roles
- **Light and dark variants** — Defaults to light theme with softer white backgrounds and black text
- **Bold, non-pastel palette** — Deep, saturated colors for better readability and reduced eye strain
- **Cross-platform support** — VS Code, Positron, Emacs, Neovim, Kakoune, Helix, Zed, Notepad++, Ghostty, WezTerm, Cosmic Terminal, Yen, Warp, tmux, Microsoft Terminal, Obsidian

## Themes in Action

> Mock editor renderings generated from the shipped theme tokens. This is a
> self-contained image preview — open `assets/preview-light.png` /
> `assets/preview-dark.png` to inspect at full resolution.

**Light (default)**

![DMA Theme Light preview](assets/preview-light.png)

**Dark**

![DMA Theme Dark preview](assets/preview-dark.png)

## Accessibility & WCAG Compliance

DMA Theme is built to WCAG 2.1 contrast guidelines. The canonical `palette.json`
meets **AA (≥ 4.5:1)** for every body-text, syntax, UI, and semantic-status token in
both light and dark variants. De-emphasized tokens (comments, line numbers, subtle
foreground) intentionally sit in the AA-Large band, which is appropriate for
non-essential text. No text or UI token in `palette.json` falls below AA-Large.

Beyond the canonical palette, every shipped editor/terminal file is parsed directly
and checked against the background *it declares* — see the **Per-editor /
per-terminal validation** section of [CONTRAST.md](CONTRAST.md). That per-file check
confirms consistent backgrounds and most text tokens, and tracks the few remaining
light-theme *syntax* colors (500-stop teal/green/orange) that should move to the
700/800 stops for AA on `#F8FAFC`. The dark variants pass.

| Scope | Tokens | AA+ | AAA | AA Large | FAIL |
|-------|-------:|----:|----:|---------:|-----:|
| Light theme — text/UI | 56 | 34 | 20 | 22 | 0 |
| Dark theme — text/UI | 56 | 53 | 44 | 3 | 0 |
| Semantic status colors | 12 | 8 | 4 | 2 | 2* |

\* The two "FAIL" rows are the semantic **500** stops evaluated as text on white.
Those brighter stops are reserved for fills / large UI; status *text* on light
surfaces uses the documented **800** stop (`#9E5E00`), which passes AA.

The full, reproducible report (generated from `palette.json`) lives in
[CONTRAST.md](CONTRAST.md). Regenerate it any time with:

```bash
python3 scripts/contrast_report.py
```

## Color Palette

### Primary Colors

| Color | 900 | 800 | 700 | 600 | 500 | 400 | 300 | 200 | 100 | 50 |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| **Blue** | `#002B5C` | `#003D7A` | `#00529E` | `#0069C0` | `#0077CC` | `#1A91E6` | `#4DA8EE` | `#8FC3F5` | `#C5DEF9` | `#E8F4FC` |
| **Teal** | `#004D4D` | `#006666` | `#007F7F` | `#009999` | `#00B3B3` | `#1ACCCC` | `#4DE5E5` | `#99F0F0` | `#CCF7F7` | `#E6FBFB` |
| **Turquoise** | `#005C5C` | `#007373` | `#008A8A` | `#00A1A1` | `#00B8B8` | `#1ACECE` | `#4DDDDD` | `#99EDED` | `#CCF6F6` | `#E6FBFB` |
| **Green** | `#004D1A` | `#006622` | `#007F2A` | `#009933` | `#00B33B` | `#1ACC4D` | `#4DD966` | `#99E599` | `#CCF0CC` | `#E6F8E6` |

### Semantic Colors

| Role | 900 | 800 | 700 | 600 | 500 (Base) | 400 | 300 | 200 | 100 | 50 |
|------|-----|-----|-----|-----|------------|-----|-----|-----|-----|-----|
| **Error** | `#7A0000` | `#9E0000` | `#C40000` | `#E80000` | `#FF1A1A` | `#FF4D4D` | `#FF7A7A` | `#FFA8A8` | `#FFD4D4` | `#FFEAEA` |
| **Warning** | `#7A4A00` | `#9E5E00` | `#C47300` | `#E88800` | `#FF9F00` | `#FFAD33` | `#FFC466` | `#FFDB99` | `#FFF0CC` | `#FFF8E6` |
| **Info** | `#003D7A` | `#00529E` | `#0069C0` | `#007BDB` | `#0091E6` | `#33A8EE` | `#66BFFF` | `#99D4FF` | `#CCE9FF` | `#E6F4FF` |
| **Success** | `#004D1A` | `#006622` | `#007F2A` | `#009933` | `#00B33B` | `#33CC5A` | `#66D97A` | `#99E599` | `#CCF0CC` | `#E6F8E6` |

### Neutral Colors

**Light Theme (Default)**
- Background: `#F8FAFC`
- Background Alt: `#F0F4F8`
- Background Elevated: `#FFFFFF`
- Foreground: `#1A2A35` (near black)
- Foreground Muted: `#485C6E`
- Foreground Subtle: `#6E89A0`
- Border: `#A8C0D8`

> **Note on light theme syntax colors:** The light variant uses the brighter end of each scale (roughly the 400–600 stops — e.g. teal `#009999`, blue `#0077CC`, green `#009933`) for keywords, strings, functions, and types. This keeps every token clearly distinguishable from the near-black foreground instead of collapsing into it, while still meeting WCAG AA contrast (≥ 4.5:1) against the soft white background.

**Dark Theme**
- Background: `#0A0F14`
- Background Alt: `#101820`
- Background Elevated: `#182430`
- Foreground: `#E0E8EF`
- Foreground Muted: `#93ABC3`
- Foreground Subtle: `#6E89A0`
- Border: `#2D4058`

### Visual Color Reference

The tables above are the canonical reference. The rendered scale strips below
are generated directly from `palette.json` (see `scripts/generate_swatches.py`),
so they always match the shipped themes.

#### Primary Color Scales

![DMA primary color scales](assets/palette-primary.png)

#### Semantic Color Scales

![DMA semantic color scales](assets/palette-semantic.png)

#### ANSI Terminal Colors (16-color)

| Index | Name | Light Theme | Dark Theme |
|-------|------|-------------|------------|
| 0 | Black | `#1A2A35` | `#0A0F14` |
| 1 | Red | `#E80000` | `#FF1A1A` |
| 2 | Green | `#009933` | `#00B33B` |
| 3 | Yellow | `#E88800` | `#FF9F00` |
| 4 | Blue | `#0077CC` | `#1A91E6` |
| 5 | Magenta | `#007F7F` | `#1ACECE` |
| 6 | Cyan | `#00B3B3` | `#4DDDDD` |
| 7 | White | `#A8C0D8` | `#F0F4F8` |
| 8 | Bright Black | `#485C6E` | `#6E89A0` |
| 9 | Bright Red | `#FF1A1A` | `#FF4D4D` |
| 10 | Bright Green | `#00B33B` | `#33CC5A` |
| 11 | Bright Yellow | `#FF9F00` | `#FFAD33` |
| 12 | Bright Blue | `#1A91E6` | `#4DA8EE` |
| 13 | Bright Magenta | `#1ACECE` | `#4DE5E5` |
| 14 | Bright Cyan | `#4DDDDD` | `#99F0F0` |
| 15 | Bright White | `#F0F4F8` | `#E6FBFB` |

**Light theme ANSI**

![DMA light ANSI palette](assets/ansi-light.png)

**Dark theme ANSI**

![DMA dark ANSI palette](assets/ansi-dark.png)

## Supported Environments

### Editors
- **VS Code / Positron** — Full semantic highlighting with `semanticTokenColors`
- **Emacs** — Complete theme with org-mode, magit, lsp, and package support
- **Neovim** — Lua-based theme with TreeSitter, LSP, and plugin integrations
- **Kakoune** — kakrc configuration
- **Helix** — TOML theme configuration
- **Zed** — JSON theme configuration
- **Notepad++** — XML theme file

### Terminals
- **Ghostty** — Config file with full 256-color palette
- **WezTerm** — TOML theme with indexed colors
- **Cosmic Terminal** — TOML theme configuration
- **Yen** — YAML theme configuration
- **Warp** — YAML theme configuration
- **tmux** — Configuration with status line
- **Microsoft Terminal (Windows Terminal)** — JSON theme configuration

### Other
- **Obsidian** — CSS theme with light/dark variants

## Installation

### VS Code / Positron

#### From Marketplace (when published)
1. Open Extensions (`Ctrl+Shift+X`)
2. Search for "DMA Theme"
3. Click Install

#### Local Installation (from this repository)
1. Clone or download this repository
2. Copy the theme files to your VS Code extensions directory:
   - **Linux/macOS**: `~/.vscode/extensions/dma-theme-1.1.0/`
   - **Windows**: `%USERPROFILE%\.vscode\extensions\dma-theme-1.1.0\`
3. Or package as VSIX:
   ```bash
   npm install -g vsce
   cd themes/positron
   vsce package
   code --install-extension dma-theme-1.1.0.vsix
   ```

#### Manual Theme Selection
1. Open Settings (`Ctrl+,`)
2. Search "Color Theme"
3. Select "DMA Theme Light" or "DMA Theme Dark"

---

### Emacs

#### Manual Installation
```bash
# Create theme directory
mkdir -p ~/.emacs.d/themes/dma-theme

# Copy theme files (light and dark variants)
cp themes/emacs/dma-theme-theme.el themes/emacs/dma-theme-dark.el ~/.emacs.d/themes/dma-theme/
```

Add to your `init.el` or `.doom.d/config.el`:
```elisp
;; Load path
(add-to-list 'custom-theme-load-path "~/.emacs.d/themes/dma-theme")

;; Load theme (light or dark)
(load-theme 'dma-theme-light t)  ;; or 'dma-theme-dark
```

#### Doom Emacs
```elisp
;; In packages.el
(package! dma-theme :recipe (:host github :repo "trdunsworth/DMA_Theme_2"))

;; In config.el
(setq doom-theme 'dma-theme-light)  ;; or 'dma-theme-dark
```

#### Spacemacs
```elisp
;; In .spacemacs dotspacemacs-themes
dotspacemacs-themes '(dma-theme-light)  ;; or 'dma-theme-dark
```

---

### Neovim

#### Using lazy.nvim (recommended)
```lua
{
  "trdunsworth/DMA_Theme_2",
  priority = 1000,
  config = function()
    require("dma_theme").setup({ variant = "light" }) -- or "dark"
    vim.cmd.colorscheme("dma_theme")
  end
}
```

#### Using packer.nvim
```lua
use {
  "trdunsworth/DMA_Theme_2",
  config = function()
    require("dma_theme").setup({ variant = "light" })
    vim.cmd.colorscheme("dma_theme")
  end
}
```

#### Manual Installation
```bash
# Clone to packpath
git clone https://github.com/trdunsworth/DMA_Theme_2.git \
  ~/.local/share/nvim/site/pack/themes/start/dma-theme

# Or with lazy.nvim's local plugin support
-- In your lazy.lua
{ dir = "~/path/to/dma-theme/themes/neovim", name = "dma_theme" }
```

#### Configuration Options
```lua
require("dma_theme").setup({
  variant = "light",        -- "light" or "dark"
  transparent = false,      -- transparent background
  italic_comments = true,   -- italic comments
  bold_keywords = true,     -- bold keywords
  terminal_colors = true,   -- set terminal ANSI colors
})
```

---

### Kakoune

```bash
# Copy theme file
cp themes/kakoune/dma-theme-light.kak ~/.config/kak/colors/

# Or for dark theme
cp themes/kakoune/dma-theme-dark.kak ~/.config/kak/colors/
```

Add to your `kakrc`:
```kak
colorscheme dma-theme-light  # or dma-theme-dark
```

---

### Helix

```bash
# Copy theme file
cp themes/helix/dma-theme-light.toml ~/.config/helix/themes/

# Or for dark theme
cp themes/helix/dma-theme-dark.toml ~/.config/helix/themes/
```

Add to your `config.toml`:
```toml
theme = "dma-theme-light"  # or "dma-theme-dark"
```

---

### Zed

```bash
# Copy theme file
cp themes/zed/dma-theme-light.json ~/.config/zed/themes/

# Or for dark theme
cp themes/zed/dma-theme-dark.json ~/.config/zed/themes/
```

Then in Zed: `Cmd+Shift+P` → "Theme: Select Theme" → "DMA Theme Light"

---

### Notepad++

```bash
# Copy theme file
cp themes/notepadpp/dma-theme-light.xml "%APPDATA%\Notepad++\themes\"

# Or for dark theme
cp themes/notepadpp/dma-theme-dark.xml "%APPDATA%\Notepad++\themes\"
```

Then in Notepad++: Settings → Style Configurator → Select "DMA Theme Light" → Save & Close

---

### Ghostty

```bash
# Copy theme file
cp themes/ghostty/dma-theme-light ~/.config/ghostty/themes/

# Or for dark theme
cp themes/ghostty/dma-theme-dark ~/.config/ghostty/themes/
```

Add to your `~/.config/ghostty/config`:
```ini
theme = dma-theme-light  # or dma-theme-dark
```

---

### WezTerm

#### Option 1: Copy theme file
```bash
cp themes/wezterm/dma-theme-light.toml ~/.config/wezterm/dma-theme-light.toml
# Or dark
cp themes/wezterm/dma-theme-dark.toml ~/.config/wezterm/dma-theme-dark.toml
```

In your `wezterm.lua`:
```lua
local dma_theme = require('dma-theme-light')  -- or dma-theme-dark
return dma_theme
```

#### Option 2: Inline in wezterm.lua
```lua
-- Copy the [colors] section from themes/wezterm/dma-theme-light.toml
-- directly into your wezterm.lua
config.colors = {
  foreground = "#1A2A35",
  background = "#F8FAFC",
  cursor_bg = "#0077CC",
  -- ... rest of colors
}
```

---

### Cosmic Terminal

```bash
# Copy theme file
cp themes/cosmic/dma-theme-light.toml ~/.config/cosmic-term/themes/

# Or for dark theme
cp themes/cosmic/dma-theme-dark.toml ~/.config/cosmic-term/themes/
```

Select in Cosmic Terminal settings → Themes → DMA Theme Light

---

### Yen

```bash
# Copy theme file
cp themes/yen/dma-theme-light.yaml ~/.config/yen/themes/

# Or for dark theme
cp themes/yen/dma-theme-dark.yaml ~/.config/yen/themes/
```

Select in Yen settings → Themes → DMA Theme Light

---

### Warp

```bash
# Copy theme file
cp themes/warp/dma-theme-light.yaml ~/.warp/themes/

# Or for dark theme
cp themes/warp/dma-theme-dark.yaml ~/.warp/themes/
```

Open Warp settings (Ctrl+,) → Appearance → Theme → DMA Theme Light

---

### tmux

```bash
# Copy theme file
mkdir -p ~/.config/tmux
cp themes/tmux/dma-theme-light.conf ~/.config/tmux/

# Or for dark theme
cp themes/tmux/dma-theme-dark.conf ~/.config/tmux/
```

Add to your `~/.tmux.conf`:
```bash
# For light theme
source-file ~/.config/tmux/dma-theme-light.conf

# For dark theme
source-file ~/.config/tmux/dma-theme-dark.conf
```

Reload tmux: `tmux source-file ~/.tmux.conf`

#### Quick Theme Switching
Add to `~/.tmux.conf` for keybinding:
```bash
bind-key T run-shell "tmux source-file ~/.config/tmux/dma-theme-light.conf"
bind-key t run-shell "tmux source-file ~/.config/tmux/dma-theme-dark.conf"
```

---

### Microsoft Terminal (Windows Terminal)

Windows Terminal themes are installed by adding the color scheme to the `schemes` array in your `settings.json`. Windows Terminal uses **named color properties** (not a `colors` array).

#### Option 1: Via Settings UI (Recommended)

1. Open Windows Terminal
2. Press `Ctrl+,` to open Settings
3. Click **Open JSON file** at the bottom left (or use `Ctrl+Shift+,`)
4. Add the theme to the `schemes` array in your `settings.json`:

```json
"schemes": [
  {
    "name": "DMA Theme Light",
    "background": "#F8FAFC",
    "foreground": "#1A2A35",
    "cursorColor": "#0077CC",
    "selectionBackground": "#A8D0F0",
    "black": "#1A2A35",
    "red": "#E80000",
    "green": "#009933",
    "yellow": "#E88800",
    "blue": "#0077CC",
    "purple": "#007F7F",
    "cyan": "#00B3B3",
    "white": "#A8C0D8",
    "brightBlack": "#485C6E",
    "brightRed": "#FF1A1A",
    "brightGreen": "#00B33B",
    "brightYellow": "#FF9F00",
    "brightBlue": "#1A91E6",
    "brightPurple": "#1ACECE",
    "brightCyan": "#4DDDDD",
    "brightWhite": "#F0F4F8"
  },
  {
    "name": "DMA Theme Dark",
    "background": "#0A0F14",
    "foreground": "#E0E8EF",
    "cursorColor": "#1A91E6",
    "selectionBackground": "#003D7A",
    "black": "#1E282D",
    "red": "#E80000",
    "green": "#009933",
    "yellow": "#E88800",
    "blue": "#007BDB",
    "purple": "#007F7F",
    "cyan": "#00B3B3",
    "white": "#C8D6E3",
    "brightBlack": "#485C6E",
    "brightRed": "#FF1A1A",
    "brightGreen": "#00B33B",
    "brightYellow": "#FF9F00",
    "brightBlue": "#1A91E6",
    "brightPurple": "#1ACECE",
    "brightCyan": "#4DDDDD",
    "brightWhite": "#F0F4F8"
  }
]
```

5. Save the file — changes apply **immediately** to open windows (no restart needed)
6. In Settings, go to **Profiles** → **Defaults** → **Appearance** → **Color scheme** and select "DMA Theme Light" or "DMA Theme Dark"

#### Option 2: Use the theme JSON files directly

The theme files in `themes/microsoft-terminal/` are already in the correct format. Copy their content into your `settings.json` `schemes` array.

```bash
# Windows PowerShell
# View the theme files:
cat themes/microsoft-terminal/dma-theme-light.json
cat themes/microsoft-terminal/dma-theme-dark.json
```

#### Option 3: Apply to a specific profile

To apply a theme to a specific profile (e.g., PowerShell), add `colorScheme` to that profile:

```json
"profiles": {
  "list": [
    {
      "guid": "{574e775e-4f2a-5b96-ac1e-a2962a402336}",
      "name": "PowerShell",
      "commandline": "pwsh.exe",
      "colorScheme": "DMA Theme Dark"
    }
  ]
}
```

To apply to all profiles, add it to `profiles.defaults`:
```json
"profiles": {
  "defaults": {
    "colorScheme": "DMA Theme Light"
  }
}
```

---

### Obsidian

```bash
# Copy theme file
mkdir -p ".obsidian/themes"
cp themes/obsidian/dma-theme.css ".obsidian/themes/dma-theme.css"
```

1. Open Obsidian Settings (`Ctrl+,`)
2. Go to **Appearance** → **Themes**
3. Click **Manage** → Enable **DMA Theme**
4. Select **DMA Theme** from the theme dropdown

#### For Light/Dark Mode Switching
The theme automatically adapts to Obsidian's light/dark mode setting. To force a specific variant:

```css
/* In .obsidian/themes/dma-theme.css, add at the top for forced light: */
.theme-light, body:not(.theme-dark) { /* light styles */ }

/* Or forced dark: */
.theme-dark { /* dark styles */ }
```

---

## Language Support

Full semantic support for:
- **Python, R, Julia, Rust, Go**
- **Markdown, Typst, LaTeX, Quarto**
- **SQL, C#, HTML, CSS, JavaScript, TypeScript**
- **Node, Deno, Bun, YAML, JSON, TOML**

The theme provides semantic token colors for all major languages, ensuring consistent meaning across environments (e.g., keywords are always teal, functions are always blue, errors are always red).

## Palettes for Data Visualization

Brewer-style schemes (qualitative / sequential / diverging) synthesized from DMA brand colors — the scheme *taxonomy* follows ColorBrewer conventions, but every color comes from the DMA palette.

Rendered from `palette.json` via `scripts/generate_swatches.py`:

![DMA qualitative palette](assets/dv-qualitative.png)

![DMA sequential palettes](assets/dv-sequential.png)

![DMA diverging palettes](assets/dv-diverging.png)

### Schemes

| Type | Names | Notes |
|------|-------|-------|
| Qualitative | `qualitative` | 8 categorical colors, hue/lightness alternated |
| Sequential | `Blues` `Teals` `Turquoises` `Greens` `Oranges` | single-hue, light → dark |
| Sequential | `Cool` `Ocean` `Forest` | multi-hue |
| Diverging | `Red-Blue` `Red-Green` `Brown-Teal` | pale neutral center |
| Semantic | `error` `warning` `info` `success` | all ≥ 4.5:1 on white |

### Python (`palettes/python/`)

Zero-dependency core (`dma_palette.py`) plus integration modules:

```python
import dma_palette as dma
dma.qualitative(6)                    # 6 categorical colors
dma.sequential("Teals", 7)            # light -> dark ramp
dma.diverging("Red-Green", 9)         # end -> neutral -> end
dma.semantic()                        # status colors dict
```

```python
# matplotlib — colormaps register on import
import matplotlib_dma
plt.imshow(z, cmap="DMA Blues")       # also "DMA Cool", "DMA Div Red-Blue"
matplotlib_dma.use_dma_cycle()        # qualitative as default cycle

# plotnine / ggplot2-style scales (requires plotnine)
from ggplot2_dma import scale_color_dma, scale_fill_dma_c
gg + scale_color_dma()
gg + scale_fill_dma_c("Cool")

# seaborn
import seaborn_dma
sns.set_palette(seaborn_dma.qualitative())
```

See `demo_python.ipynb` for rendered examples of every scheme.

### R (`palettes/r/`)

Base-R core plus ggplot2/plotly helpers:

```r
source("dma_palette.R")
dma_qualitative(4)
dma_sequential("Teals", 7)   # Teals, Blues, Greens, Turquoises,
dma_diverging("Red-Blue", 9) # Oranges, Cool, Ocean, Forest
```

```r
source("ggplot2_dma.R")
ggplot(df, aes(x, y, colour = grp)) + geom_point() +
  scale_colour_dma()                          # categorical
ggplot(df, aes(x, y, fill = z)) +
  scale_fill_dma_continuous("Cool")           # gradient
  # or: scale_fill_dma_binned("Blues", 5), scale_fill_dma_diverging(...)
```

```r
source("plotly_dma.R")                        # plotly colorscales & layout defaults
plot_ly(df, x = ~x, y = ~y, color = ~z, colorscale = dma_colorscale("Ocean"))
```

See `demo_r.Rmd` for a knittable walkthrough.

## Contributing

See [GUIDELINES.md](GUIDELINES.md) for design principles and contribution guidelines.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Links

- [Website](https://dunsworth-mann.com)
- [GitHub Repository](https://github.com/trdunsworth/DMA_Theme_2)
- [Issues](https://github.com/trdunsworth/DMA_Theme_2/issues)