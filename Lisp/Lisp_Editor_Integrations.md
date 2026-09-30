---
type: reference
topic: Lisp editor integrations — clojure-lsp, cl-lsp, SLIME, CIDER, Conjure, nvlime, fireplace, vim-sexp, and REPL-in-tmux patterns for Emacs, Neovim, Vim, Helix, and Kakoune
date: 2026-09-30
status: active
tags:
  - editor
  - setup
  - clojure
  - keybindings
  - lisp
---

# Lisp Editor Integrations

> Goal: make paren-heavy Lisp **pleasant in whatever editor you already use** — LSP for navigation, structural editing for balance, and a live REPL one keystroke away. Three layers: **(1) LSP**, **(2) structural editing**, **(3) REPL eval**. Any two of the three is workable; all three is ideal.
> Related: [[Clojure_Tutorial]] §8 / [[Common_Lisp_Tutorial]] (why this matters), [[Lisp_Installation]] (REPLs must exist first), editor tutorials: [[Emacs_Tutorial]] · [[Neovim_Tutorial]] · [[Vim_Tutorial]] · [[Helix_Tutorial]] · [[Kakoune_Tutorial]], [[Tmux_Tutorial]] (REPL pane pattern)

## How to use this note

1. **§1 once** — the three layers and universal tools.
2. **§2–§6** — jump to your editor.
3. **§7** — the tmux REPL pattern (for editors without built-in eval).
4. **§8** — decision table if you're choosing.

---

## 1. The three layers

| Layer | What it gives you | Tools |
|-------|-------------------|-------|
| **LSP** | go-to-definition, rename, hover docs, inline diagnostics | `clojure-lsp` (Clojure — includes clj-kondo linting), `cl-lsp` (Common Lisp) |
| **Structural editing** | move/manipulate by sexp; parens can't break | vim-sexp (+ mappings), Parinfer, paredit/Smartparens |
| **REPL eval** | send form to a live REPL, get the value back | CIDER, Conjure, SLIME/SLY, nvlime, fireplace, vim-slime, tmux paste |

Install the LSP servers first (they're standalone binaries):

```bash
# clojure-lsp — official installers: https://clojure-lsp.github.io (curl/brew/scoop script)
clojure-lsp --version
# cl-lsp (Common Lisp) — see Helix's languages.toml or the cl-lsp repo for builds
```

```bash
sudo dnf install clj-kondo        # Fedora also ships the linter clojure-lsp embeds
```

Sanity check: open a `.clj` file → `K`/hover shows docs, `gd` jumps to definition → LSP is live.

---

## 2. Emacs — the home team (CIDER + SLIME)

Full walkthrough: [[Emacs_Tutorial]]. Lisp adds two packages:

### Clojure — CIDER

```elisp
;; in ~/.emacs.d/… or M-x package-install
(use-package cider
  :hook (clojure-mode . cider-mode))
;; clojure-mode gives syntax/indent; CIDER gives the REPL
```

| Key | Action |
|-----|--------|
| `M-x cider-jack-in` | Start REPL for the project (uses `deps.edn`/`clj`) |
| `C-c C-e` | Eval expression before point → result inline |
| `C-c C-k` | Compile/load current buffer |
| `C-c C-z` | Switch to REPL buffer |
| `C-c C-d d` | Docs for symbol at point |
| `C-c C-t` | Run tests |

### Common Lisp — SLIME (or SLY)

```lisp
;; once, from SBCL: installs slime into Quicklisp + writes ~/.emacs.d/… init line
(ql:quickload :quicklisp-slime-helper)
;; then in Emacs:
;; (load "~/quicklisp/slime-helper.el")
;; (setq inferior-lisp-program "sbcl")
;; (add-hook 'lisp-mode-hook #'slime-mode)
```

| Key | Action |
|-----|--------|
| `M-x slime` | Connect Emacs ↔ SBCL (SWANK backend) |
| `C-c C-c` | Compile the defun at point |
| `C-x C-e` | Eval last sexp → result inline |
| `C-c C-l` | Load current file |
| `C-c C-z` | REPL buffer in other window |
| `C-c C-d d` | Describe symbol |
| `M-.` / `M-,` | Jump to definition / back |
| `,apropos` (in REPL minibuffer) | Find symbols |

**SLY** is the maintained SLIME fork with a better REPL — same keys, drop-in. Pick either.

### Structural editing in Emacs

- **Clojure:** `clojure-mode` + **Paredit** (`M-x paredit-mode`) or **Smartparens** — slurp/barf/raise by sexp.
- **CL:** `lisp-mode` ships `common-lisp-mode` basics; pair with Paredit (the classic Lisp editing experience).
- **org-babel:** evaluate Clojure/Lisp blocks literately inside `org` documents — the notes-as-programs workflow (see [[Emacs_Tutorial]] org section).

---

## 3. Neovim — Conjure (Clojure) + nvlime (CL)

Full walkthrough: [[Neovim_Tutorial]]. Recommended plugin set:

```lua
-- lazy.nvim style (check each plugin's README for the current spec)
{
  "Olical/conjure",                 -- REPL eval (Clojure + Racket + more)
  ft = { "clojure", "racket" },
},
{
  "monakoos/nvlime",                -- Common Lisp (needs a Swank server — see below)
  ft = { "lisp" },
},
{
  "guns/vim-sexp",                  -- structural editing
  dependencies = { "tpope/vim-sexp-mappings-for-regular-people" },
},
```

> [!note]
> nvlime needs a **Swank server** on the CL side (Quicklisp + ASDF, load nvlime's `start-nvlime.lisp` / parsley — see its README for the current procedure). Plugin specs evolve: check each repo's README before pasting.

### Conjure (Clojure — and Racket)

| Key / command | Action |
|---------------|--------|
| `:ConjureEvalCurrentForm` | Eval form under cursor → result shown as virtual text |
| `:ConjureEvalRootForm` | Eval top-level form |
| `:ConjureEvalBuf` | Eval whole buffer |
| `:ConjureConnect` | Attach to a REPL (`:ConjureConnect <port>` for remote) |
| default `<leader>e…` maps | Convenience wrappers — `:help conjure` for the current list |
| `K` / `gd` | Hover docs / definition **if** an LSP (clojure-lsp) is also attached |

Conjure starts the project REPL itself (it shells out to `clojure`/`clj`) — jack-in behavior with zero config for `deps.edn` projects.

### nvlime (Common Lisp)

1. Get a Swank server: Quicklisp + ASDF, load `nvlime`'s `start-nvlime.lisp` (or parsley — see nvlime README) → listens on a port.
2. In Neovim: start nvlime, connect with **`<leader>cc`** (choose host/port), run forms with **`<leader>rr`** etc.
3. Requires nvim 0.9.5+; the REPL panel mirrors SLIME's debugger.

### LSP + structure (Neovim)

```lua
-- nvim-lspconfig (modern: vim.lsp.config API)
require("lspconfig").clojure_lsp.setup{}   -- or vim.lsp.config
```

- **vim-sexp**: `f)`/`f(` jump, `>`/`<` slurp/barf, `S` surround — with `vim-sexp-mappings-for-regular-people` you get sensible `>-` style keys.
- **Parinfer** alternatives: `paredit.nvim` or let vim-sexp handle structure.
- Note: **vim-iced** (classic Clojure REPL plugin) was **archived Feb 2025** — its successor is **[Elin](https://github.com/liquidz/elin)** (Babashka-based, still alpha). Conjure remains the path of least resistance.

---

## 4. Vim — fireplace + vim-slime

Full walkthrough: [[Vim_Tutorial]]. Vim (non-Neovim) Lisp setup:

### Vim-fireplace (Clojure — works in Vim and Neovim)

| Key | Action |
|-----|--------|
| `cpp` | Eval the innermost form → result echoes |
| `cp` + motion | Eval a region (`cpp` again to go up a level) |
| `cqq` | Open cmdline window, type a form, eval it |
| `K` | Word under cursor → documentation |
| `]D` / `[D` | Definition / all definitions |
| `<C-]>` | Jump to definition |
| `gf` | Go to file (works for namespaces) |
| `:Source` `:Doc` `:FindDoc` | Buffer docs & sourcing |

fireplace discovers a running REPL (it nREPLs to whatever `clj` you have open) — start `clj` in a tmux pane and fireplace attaches.

### vim-slime — the universal sender (works for CL, Racket, anything)

```vim
" vim-slime: send selections/paragraphs to a terminal REPL
let g:slime_target = "tmux"          " or "neovim"
xmap <leader>s <Plug>vslime
nmap <leader>p <Plug>vslimeParagraph
```

Workflow: `clj` or `sbcl` running in a tmux pane; highlight the form; `SlimeSend` → answer comes back in the REPL pane. Dumb, universal, survives every editor quirk. Pairs with the layout in §7.

### Structural editing (Vim)

- `guns/vim-sexp` + `tpope/vim-sexp-mappings-for-regular-people` → `f(`/`f)` motions, slurp/barf, multi-cursor-friendly structure ops.
- Or **Parinfer** (`eraserhd/parinfer` / vim-parinfer): edit text, indentation fixes parens automatically — closest to "never think about parens again".

---

## 5. Helix — LSP built in, REPL via tmux

[[Helix_Tutorial]] covers keys; here's the Lisp-specific part:

- **Ships language configs:** `hx --health clojure` shows **`clojure-lsp`** configured out of the box; `hx --health common-lisp` shows **`cl-lsp`**. Install those binaries (§1) and LSP works with zero config — Helix's pitch is *zero plugins*.
- **Navigation:** `gd` definition, `K` hover, `gr` references, `:lsp diagnostics` — standard Helix LSP keys.
- **Matching parens:** `%` (with tree-sitter), `f`/`F` char find, `[d`/`]d` diagnostics.
- **Structural editing:** Helix has no sexp plugin — rely on `%` matching + multiple selections (`C-k` extend, `Alt-…` select) to edit safely. Acceptable, not sublime.
- **No built-in REPL eval.** Use the **tmux pattern (§7)**: editor in one pane, `clj` in another, copy/send forms across (or use `vim-slime`-style tooling only if you add a plugin).

**Verdict:** Helix = fastest LSP-only setup; add tmux for eval.

---

## 6. Kakoune — kak-lsp + tmux eval

[[Kakoune_Tutorial]] covers keys; Lisp-specific:

```bash
# LSP client for Kakoune (Fedora Copr — atim/kakoune)
sudo dnf copr enable atim/kakoune -y
sudo dnf install kakoune-lsp        # provides kak-lsp + config
# then install clojure-lsp / cl-lsp binaries (§1)
```

- **LSP:** kak-lsp wires `gd`, `K`, diagnostics, rename — same mental model as Helix but the *selection-first* order (`s` select matches → `K` describe selection).
- **REPL eval:** no plugin-free eval — two workable patterns:
  1. **Pipe to REPL:** keep `clj` in a tmux pane; select a form, `| tmux send-keys -t repl '<paste>' Enter` (wrap in a Kakoune `define-command` for one-key send).
  2. **vim-slime equivalent:** `kakoune-scripts`/`emacs` style senders exist; the tmux route is the reliable one.
- **Structure:** Kakoune's `%` (matching) + `(` `)` word motions cover 80%; sexp-aware editing is thinner than vim's ecosystem — lean on selections.

**Verdict:** Kakoune is excellent *around* Lisp (LSP + selections); eval leans on tmux.

---

## 7. The tmux REPL pattern (works everywhere)

For Helix/Kakoune — and as a fallback anywhere ([[Tmux_Tutorial]] has the pane mechanics):

```bash
tmux new -s lisp -n code
# pane 1 (left 70%): your editor
# pane 2 (right 30%): the REPL
tmux split-window -h -l 30%
#   in pane 2:  clj          (or sbcl, racket, guile)
```

Send forms across:

| Method | How |
|--------|-----|
| Clipboard copy (`y`) + `tmux paste-buffer` | simplest |
| `tmux send-keys -t lisp.1 'form…' Enter` | scriptable — bind it |
| vim-slime with `g:slime_target = "tmux"` | Vim/Neovim: highlight → send |
| Editor split instead of tmux | Emacs `C-c C-z`, Neovim `:terminal` split |

**The loop:** edit on the left → form evaluates on the right → value/printout appears → adjust → repeat. This *is* REPL-driven development; the editor integration just automates the send.

Remote/SSH: tmux makes the REPL survive disconnects ([[Tmux_Tutorial]] §3) — run `clj` inside tmux on Fedora, attach from anywhere.

---

## 8. Decision table

| You use… | LSP | Structure | Eval | Effort |
|----------|-----|-----------|------|--------|
| **Emacs + Clojure** | clojure-lsp | paredit | **CIDER** | low — best-in-class |
| **Emacs + CL** | — / cl-lsp | paredit | **SLIME/SLY** | low — canonical CL setup |
| **Neovim + Clojure** | clojure-lsp (nvim-lspconfig) | vim-sexp | **Conjure** | low |
| **Neovim + CL** | — | vim-sexp | **nvlime** (needs Swank) | medium |
| **Vim + Clojure** | clojure-lsp | vim-sexp/parinfer | **fireplace** | low |
| **Vim/Neovim + anything** | — | — | **vim-slime → tmux** | low, universal |
| **Helix (either)** | **built-in** | `%` + selections | tmux pane | minimal |
| **Kakoune (either)** | kak-lsp | `%` + selections | tmux pane + send-keys | minimal |

**Recommendations:** if you're committed to the Vim-family path from [[Terminal_Fluency_Program]], **Neovim + Conjure + clojure-lsp + vim-sexp** is the sweet spot. If you want the deepest Lisp culture, **Emacs + CIDER/SLIME**. If you want zero plugin tax, **Helix + tmux**.

---

## What's next

→ [[Lisp_Project_Ideas]] — pick a build and wire your editor around it; [[Tmux_Tutorial]] §7 for pane layouts worth stealing.
