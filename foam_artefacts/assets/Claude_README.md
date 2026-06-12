# Emacs Configuration for Data Science

A comprehensive, well-organized Emacs configuration optimized for data science work with Python, R, Julia, Jupyter, SQL, JavaScript/TypeScript, Markdown, and Quarto. Includes AI coding assistant support via Ollama and GitHub Copilot.

## Features

### Core Functionality
- **Modern UI**: Doom themes, icons, and modeline
- **Smart Completion**: Vertico, Orderless, Marginalia, Consult
- **Project Management**: Projectile with ripgrep integration
- **Git Integration**: Magit with diff-hl for change tracking
- **Enhanced Help**: Which-key and helpful for better documentation

### Language Support

#### Python
- Tree-sitter syntax highlighting (Emacs 29+)
- LSP integration via Eglot
- Virtual environment management (pyvenv, poetry)
- Black formatter support
- Jupyter notebook integration
- pytest integration

#### R
- ESS (Emacs Speaks Statistics)
- R Markdown support with polymode
- Data viewer integration
- REPL integration

#### Julia
- Julia mode with tree-sitter
- Julia REPL integration
- Formatter support
- LSP integration

#### JavaScript/TypeScript
- Tree-sitter modes
- Node.js REPL
- Prettier formatting
- LSP integration

#### SQL
- Syntax highlighting and indentation
- Keyword capitalization
- SQLite mode extras

#### Markdown & Quarto
- GitHub Flavored Markdown support
- Quarto mode for .qmd files
- Live preview support

### Org Mode
- Literate programming with Org Babel
- Support for Python, R, Julia, SQL, and more
- Modern appearance with org-bullets and org-modern
- Capture templates for notes and tasks
- Pomodoro timer integration

### AI Coding Assistants
- **GitHub Copilot**: AI pair programming
- **Ellama**: Local LLM integration via Ollama
- **GPTel**: Alternative LLM interface

## Installation

### 1. Backup Your Current Configuration
```bash
mv ~/.emacs.d ~/.emacs.d.backup
mv ~/.emacs ~/.emacs.backup  # if it exists
```

### 2. Create Emacs Directory
```bash
mkdir -p ~/.emacs.d
```

### 3. Copy Configuration Files
```bash
cp init.el ~/.emacs.d/
cp myinit.org ~/.emacs.d/
```

### 4. Install Emacs (if needed)

**macOS**:
```bash
brew install emacs-plus@30 --with-native-comp
```

**Linux (Ubuntu/Debian)**:
```bash
sudo add-apt-repository ppa:kelleyk/emacs
sudo apt update
sudo apt install emacs29
```

**Windows**:
Download from [GNU Emacs](https://www.gnu.org/software/emacs/download.html)

### 5. First Launch
Start Emacs and wait for packages to install automatically. This may take a few minutes on first run.

```bash
emacs
```

## Post-Installation Setup

### Install Language Servers (LSP)

For the best coding experience, install language servers:

**Python**:
```bash
pip install python-lsp-server
# OR for better performance:
npm install -g pyright
```

**R**:
```R
install.packages("languageserver")
```

**Julia**:
```julia
using Pkg
Pkg.add("LanguageServer")
```

**JavaScript/TypeScript**:
```bash
npm install -g typescript typescript-language-server
```

**SQL** (optional):
```bash
npm install -g sql-language-server
```

### Install Tree-Sitter Grammars (Emacs 29+)

Tree-sitter grammars should auto-install, but if needed:
```elisp
M-x treesit-install-language-grammar
```

### Configure Python Virtual Environments

Set your virtualenv directory in your shell config:
```bash
export WORKON_HOME=~/.virtualenvs
```

Create a virtual environment:
```bash
python -m venv ~/.virtualenvs/data-science
```

Activate in Emacs:
```elisp
M-x pyvenv-workon RET data-science
```

### Set Up Ollama (Optional)

For local LLM support:

1. Install Ollama: https://ollama.ai
2. Pull a model:
```bash
ollama pull codellama:13b
# OR
ollama pull llama2
ollama pull mistral
```

3. Start Ollama:
```bash
ollama serve
```

4. Test in Emacs:
```elisp
M-x ellama-chat
```

### Set Up GitHub Copilot (Optional)

1. Ensure you have a GitHub Copilot subscription
2. Install Node.js (required)
3. In Emacs:
```elisp
M-x copilot-login
```
4. Follow authentication prompts

## Usage Guide

### Essential Keybindings

#### General
- `C-x C-f` - Find file (with Consult)
- `C-x b` - Switch buffer (with Consult)
- `C-c c` - Org capture
- `C-c a` - Org agenda
- `C-x g` - Magit status
- `M-x` - Execute command (with Consult)

#### Navigation
- `C-s` - Search (Consult)
- `M-g g` - Go to line
- `C-:` - Jump to character (Avy)
- `M-g f` - Jump to line (Avy)

#### Project Management
- `C-c p p` - Switch project (Projectile)
- `C-c p f` - Find file in project
- `C-c p s r` - Search in project (ripgrep)

#### Editing
- `C-=` - Expand region
- `C->` - Multiple cursors: mark next
- `C-<` - Multiple cursors: mark previous
- `M-;` - Comment/uncomment

#### Configuration
- `C-c C-,` - Open config file
- `C-c C-.` - Reload configuration

### Python Workflow

1. **Open a Python file**:
   ```elisp
   C-x C-f myproject/script.py
   ```

2. **Activate virtual environment**:
   ```elisp
   M-x pyvenv-workon
   ```

3. **Start LSP** (auto-starts with eglot-ensure):
   - Hover over code: `M-x eldoc-doc-buffer`
   - Go to definition: `M-.`
   - Find references: `M-?`
   - Rename symbol: `M-x eglot-rename`

4. **Run code**:
   ```elisp
   M-x python-shell-send-buffer  ; Send whole file
   M-x python-shell-send-region  ; Send selection
   ```

5. **Format code**:
   ```elisp
   M-x python-black-buffer
   ```

### R Workflow

1. **Open R file**:
   ```elisp
   C-x C-f analysis.R
   ```

2. **Start R session**:
   ```elisp
   M-x R
   ```

3. **Evaluate code**:
   - `C-c C-c` - Eval region/function/paragraph
   - `C-c C-b` - Eval buffer
   - `C-c C-n` - Eval line and step
   - `C-c C-z` - Switch to R console

4. **R Markdown**:
   - Open `.Rmd` file (auto-loads polymode)
   - `M-n v` - Eval chunk
   - `M-n b` - Eval all chunks
   - `M-n e` - Export (render)

### Jupyter Notebook Workflow

**Option 1: EIN (Emacs IPython Notebook)**
```elisp
M-x ein:run  ; Start local Jupyter
M-x ein:login  ; Connect to running Jupyter
```

**Option 2: Code Cells in Python files**
```python
# %% Cell 1
import numpy as np

# %% Cell 2
data = np.random.rand(100)
```
- `M-n` - Next cell
- `M-p` - Previous cell
- `C-c C-c` - Eval cell

### Org Mode for Literate Programming

Create a file `analysis.org`:

```org
#+TITLE: Data Analysis

* Setup
#+begin_src python :session :results output
import pandas as pd
import numpy as np
#+end_src

* Load Data
#+begin_src python :session :results output
df = pd.read_csv('data.csv')
print(df.head())
#+end_src

* Analysis
#+begin_src R :session :results output
summary(mtcars)
#+end_src
```

- `C-c C-c` - Execute code block
- `C-c '` - Edit code block in its own buffer
- `C-c C-v t` - Tangle (extract) code to files

### AI Assistant Usage

#### GitHub Copilot
- Start typing - suggestions appear automatically
- `<TAB>` - Accept suggestion
- `C-<TAB>` - Accept word-by-word

#### Ellama (Ollama)
- `C-c e c` - Start chat
- `C-c e s` - Ask about selection
- `C-c e r` - Rewrite selection
- `C-c e k` - Code review
- `C-c e e` - Enhance code

#### GPTel
- `C-c C-g` - Open GPTel chat
- `C-c g s` - Send query
- `C-c g r` - Rewrite with AI

## Customization

### Change Theme
Edit `myinit.org`, find the Theme section:
```elisp
(load-theme 'doom-one t)  ; Dark theme
; OR
(load-theme 'doom-tomorrow-day t)  ; Light theme
```

### Add New Packages
Add to `myinit.org`:
```elisp
(use-package package-name
  :config
  ;; Your configuration here
  )
```

Reload: `C-c C-.`

### Project-Specific Settings
Create `.dir-locals.el` in project root:
```elisp
((python-mode . ((pyvenv-activate . "/path/to/venv")
                 (python-black-on-save-mode . t)))
 (r-mode . ((ess-style . 'RStudio))))
```

## Troubleshooting

### Packages Won't Install
```elisp
M-x package-refresh-contents
M-x package-install RET package-name
```

### LSP Not Working
1. Check language server is installed
2. Restart LSP: `M-x eglot-reconnect`
3. Check server output: `M-x eglot-events-buffer`

### Slow Startup
1. Check startup time: `M-x emacs-init-time`
2. Enable benchmark-init (uncomment in config)
3. Consider lazy-loading more packages

### Tree-Sitter Issues
```elisp
M-x treesit-install-language-grammar
```
Select language when prompted.

## Resources

### Learning Emacs
- [Emacs Tutorial](https://www.gnu.org/software/emacs/tour/): Built-in `C-h t`
- [Mastering Emacs](https://www.masteringemacs.org/)
- [EmacsWiki](https://www.emacswiki.org/)

### Package Documentation
- [Org Mode Manual](https://orgmode.org/manual/)
- [Magit User Manual](https://magit.vc/manual/)
- [ESS Manual](https://ess.r-project.org/)

### Community
- [r/emacs](https://reddit.com/r/emacs)
- [Emacs StackExchange](https://emacs.stackexchange.com/)
- [Emacs Discord](https://discord.gg/emacs)

## FAQ

**Q: Can I use this with Doom Emacs or Spacemacs?**
A: This is a standalone config. For Doom/Spacemacs, you'd adapt the package choices to their frameworks.

**Q: How do I update packages?**
A: `M-x package-list-packages`, then `U` to mark upgrades, `x` to execute.

**Q: What if I want to use Vim keybindings?**
A: Install Evil mode: add `(use-package evil :init (evil-mode 1))` to config.

**Q: Can I use this on Windows?**
A: Yes, but some features (vterm, certain tools) won't work. Most core functionality is cross-platform.

**Q: How do I contribute or report issues?**
A: This is a template - fork and modify for your needs!

## License

This configuration is provided as-is for educational purposes. Feel free to use, modify, and share.

---

**Happy coding! 🚀**
