---
type: usage-note
topic: Kakoune usage — install, selection-first model, multi-select toolbox, client/server sessions, kakrc + hooks, kak-lsp LSP setup
date: 2026-11-26
status: active
tags:
  - editors
  - kakoune
  - modal-editing
  - setup
  - customization
---

# Kakoune — Usage Notes

> Goal: Kakoune running on **Mac and Fedora**, the selection-first model burned in, a `kakrc` you can read, and LSP working via **kak-lsp**. Kakoune 2026.05.21 (May 2026) is current; 2026.04.12 before it. No native Windows — Cygwin only. The model is **select → act** (noun then verb), with native multi-selection as the central editing primitive.
> Related: [[Kakoune_Tutorial]] (learning path) · [[Kakoune_Cheatsheet]] (keys) · [[Helix_Tutorial]] (the descendant: same model, built-in LSP) · [[Tmux_Tutorial]] (Kakoune has no splits — tmux is your window manager) · [[Lisp_Editor_Integrations]] (kak-lsp for Lisp) · [[Vault_Editor_Workflows]]

## How to use this note

1. **§1–§2** — install + survival keys (do once per machine).
2. **§3** — the selection model + multi-select toolbox (the "why Kakoune").
3. **§4** — client/server sessions (remote-friendly).
4. **§5** — config: `kakrc` + hooks + autoload.
5. **§6** — **kak-lsp** LSP setup (required for IDE features).
6. **§7** — customization primer.
7. **§8** — daily workflows + tmux integration.

---

## 1. Install

| Platform | Command |
|----------|---------|
| macOS | `brew install kakoune` |
| Fedora | `sudo dnf install kakoune` |
| Ubuntu/Debian | `sudo apt install kakoune` (often stale; consider `nix` or build) |
| Arch | `sudo pacman -S kakoune` |
| Build from source | `git clone https://github.com/mawww/kakoune && cd kakoune && make && sudo make install` |

Verify: `kak -v` → `kakoune 2026.05.21`.

### Runtime files

Kakoune installs system autoload scripts to `/usr/share/kak/rc/` (or `/usr/local/share/...`). Your user config lives at:

```
~/.config/kak/
├── kakrc                    -- main config
├── autoload/                -- your *.kak scripts (loaded at startup)
│   └── ...
└── colors/                  -- custom colorschemes
```

**Important**: if `~/.config/kak/autoload/` exists, Kakoune **does not load** the system autoload dir. Link it:

```bash
ln -s /usr/share/kak/autoload ~/.config/kak/autoload/default
```

## 2. First run — survival keys

| Keys | Action |
|------|--------|
| `<esc>` | Normal mode (home) |
| `i` / `a` | Insert before / after selection |
| `I` / `A` | Insert at start / end of each selection's line |
| `o` / `O` | New line below / above, enter Insert |
| `:` | Command prompt (`<ret>` run, `<esc>` cancel) |
| `<space>` | User mode (your/plugin custom commands) |
| `:w` `:q` `:wq` | Save / quit / both |
| `:q!` `:wq!` | Force quit / force save+quit |
| `u` / `U` | Undo / redo |
| `<c-c>` | Cancel long-running op (cannot be remapped) |
| `<a-;>` | Run **one** Normal command from Insert/prompt |

**Notation in this note**: `<a-x>` = Alt+x, `<c-x>` = Ctrl+x, `<ret>` = Enter, `<esc>` = Escape.

### The model: select → act

| Vim/Neovim | Kakoune |
|------------|---------|
| `dw` (delete word) | `w` (select word) → `d` (delete selection) |
| `ciw` (change inner word) | `<a-i>w` (select inner word) → `c` (change) |
| `:%s/foo/bar/g` | `%` (select all) `s` `foo` `<ret>` `c` `bar` `<esc>` |

**Selections are visible** — you always see what you're about to act on. This is the entire philosophy.

## 3. Motion, selection, multi-select toolbox

### Movement (extend selection with Shift)

| Key | Action |
|-----|--------|
| `h` `j` `k` `l` | Left / down / up / right |
| `H` `J` `K` `L` | Same, extending the **other end** of selection |
| `w` `b` `e` | Word forward / back / end |
| `<a-w>` `<a-b>` `<a-e>` | WORD versions (whitespace-delimited) |
| `f{c}` `t{c}` | To / till next char `c` |
| `<a-f>{c}` `<a-t>{c}` | To / till previous char `c` |
| `<a-.>` | Repeat last `f`/`t`/object selection |
| `m` / `M` | Next matching pair: select / extend |
| `%` | Select whole buffer |
| `<a-h>` / `<a-l>` | Line start / end (`Home` / `End`) |
| `x` | Expand to full lines (repeat = extend down) |
| `<a-x>` | Trim selection to full lines |
| `;` | Collapse selections to cursors |
| `<a-;>` | Flip selection direction |

### Objects (text-object selection)

| Prefix | Then key | Object |
|--------|----------|--------|
| `<a-a>` (whole) | `b` `(` `)` | Parens |
| `<a-a>` | `B` `{` `}` | Braces |
| `<a-a>` | `r` `[` `]` | Brackets |
| `<a-a>` | `a` `<` `>` | Angle brackets |
| `<a-a>` | `Q` `"` | Double-quoted string |
| `<a-a>` | `q` `'` | Single-quoted string |
| `<a-a>` | `w` / `<a-w>` | Word / WORD |
| `<a-a>` | `s` / `p` | Sentence / paragraph |
| `<a-i>` (inner) | same keys | Inner (excludes delimiters) |

Range keys after object: `[` `]` = to start/end, `{` `}` = extend to start/end. Nest: `2<a-a>b`. Repeat: `<a-.>`.

### Multi-selection (the superpower)

| Key | Action |
|-----|--------|
| `s` | Select every regex match **inside** current selections |
| `S` | Split selections on regex (captures work) |
| `<a-s>` | Split on line boundaries (one per line) |
| `<a-k>` / `<a-K>` | Keep / drop selections matching regex |
| `$` | Keep selections where shell command exits 0 |
| `C` / `<a-C>` | Copy selection to next / previous line (multi-cursor) |
| `,` / `<a-,>` | Keep main selection only / drop main selection |
| `)` / `(` | Rotate main selection forward / back |
| `<a-S>` | Select first + last char of each selection |

**Replace everywhere**: `%` `s` `old` `<ret>` `c` `new` `<esc>`.

## 4. Client/server sessions (remote-friendly)

Kakoune runs a **daemon session**; you connect clients to it. Multiple terminals share one editing session.

```bash
# Start a session (or connect to existing)
kak -s mysession file.txt

# In another terminal: connect to same session
kak -c mysession

# List sessions
kak -l

# Detach client: :q (session stays alive)
# Kill session: :kill
```

**Over SSH**: run `kak -s project` on the server; connect locally with `kak -c project` (needs same `$XDG_RUNTIME_DIR` or explicit `-s` path). Works beautifully inside tmux ([[Tmux_Tutorial]]).

## 5. Configuration — `kakrc` + hooks

### `~/.config/kak/kakrc` (main config)

```kak
# ~/.config/kak/kakrc
set-option global tabstop 2
set-option global indentwidth 2
set-option global ui.incsearch true
add-highlighter global/ number-lines relative

# Remap <a-s> to save
map global normal <a-s> ':w'<ret>

# Leader-ish: use <space> as user-mode prefix (default)
# Define user-mode commands:
define-command -user-mode mymode save-all %{
    wa
}
map global user s :save-all<ret>

# Hook: format on save for specific filetypes
hook global BufWritePre ".*\.py$" %{
    eval -draft %sh{
        black -q "$kak_buffile"
    }
}

# Hook: LSP enable per filetype (see §6)
hook global WinSetOption filetype=(rust|python|go|typescript|lua|markdown) %{
    lsp-enable-window
}
```

### Autoload scripts (`~/.config/kak/autoload/`)

Any `*.kak` file here is sourced at startup. Good for:

- Custom commands (`define-command`)
- Complex hooks
- Language-specific settings

```kak
# autoload/my-commands.kak
define-command -params 1..%arg{1} grep-it %{
    grep -r %arg{1} .
}
```

### Colorschemes

```kak
# kakrc
colorscheme default          # built-in
# or drop .kak files in ~/.config/kak/colors/
```

## 6. LSP — kak-lsp (required for IDE features)

Kakoune has **no built-in LSP**. You need **kak-lsp** (Rust client, separate binary).

### Install kak-lsp

| Platform | Command |
|----------|---------|
| macOS | `brew install kakoune-lsp/kakoune-lsp/kakoune-lsp` |
| Fedora | `sudo dnf copr enable atim/kakoune && sudo dnf install kakoune-lsp` |
| Arch | `sudo pacman -S kakoune-lsp` |
| Cargo | `cargo install --locked kak-lsp` |
| Manual | Download from GitHub releases (v22.0.0 Oct 2026) |

Verify: `kak-lsp --version` → `kak-lsp 22.0.0`.

### Configure Kakoune to use kak-lsp

```kak
# kakrc
eval %sh{kak-lsp}
lsp-enable
```

Or per-filetype (recommended):

```kak
hook global WinSetOption filetype=(rust|python|go|typescript|lua|markdown|c|cpp) %{
    lsp-enable-window
}
```

### Install language servers (kak-lsp doesn't manage them)

```bash
# Examples
npm install -g typescript-language-server vscode-langservers-extracted  # TS/JS/JSON/HTML/CSS
pip install python-lsp-server                                           # Python
rustup component add rust-analyzer                                      # Rust
go install golang.org/x/tools/gopls@latest                             # Go
npm install -g @vue/language-server                                    # Vue
cargo install lua-language-server                                      # Lua
npm install -g @microsoft/compose-language-service                     # Docker Compose
```

### Default server config

kak-lsp ships `rc/servers.kak` with defaults for 50+ languages. Override in `kakrc`:

```kak
# kakrc - custom server for a language
set-option global lsp_servers %{
    python = {
        cmd = "pylsp"
        root_markers = ["pyproject.toml", "setup.py", ".git"]
    }
    markdown = {
        cmd = "marksman"
    }
}
```

### LSP keys (after `lsp-enable`)

| Key | Action |
|-----|--------|
| `gd` | Go to definition |
| `gr` | References |
| `gi` | Implementation |
| `gy` | Type definition |
| `K` / `<a-h>` | Hover documentation |
| `<a-r>` | Rename |
| `<a-a>` | Code actions |
| `[d` `]d` | Prev/next diagnostic |
| `gl` | Show diagnostic float |
| `<a-g>` | Goto (definition/type/ref/impl menu) |
| `<a-,>` | Outline / document symbols |

**Modeline breadcrumbs**: kak-lsp 22+ shows `module > class > function` in the modeline.

### Troubleshooting

- `:lsp-capabilities` — which LSP commands the current server supports
- `kak -e 'exec %{!kak-lsp<ret>/hook -group lsp-filetype<ret>vt}'` — list configured servers
- Version skew: kak-lsp version must match Kakoune version closely (see kak-lsp README)

## 7. Customization primer

### First five edits

1. **Indent + line numbers** (kakrc):
   ```kak
   set-option global tabstop 2
   set-option global indentwidth 2
   add-highlighter global/ number-lines relative
   ```

2. **Save binding** (kakrc):
   ```kak
   map global normal <a-s> ':w'<ret>
   ```

3. **Enable kak-lsp** (kakrc) — §6.

4. **Hook: format on save** (kakrc):
   ```kak
   hook global BufWritePre ".*\.rs$" %{ lsp-formatting-sync }
   hook global BufWritePre ".*\.py$" %{ eval -draft %sh{ black -q "$kak_buffile" } }
   ```

5. **Fuzzy finder** — Kakoune has no built-in picker. Options:
   - `fzf` + `kakoune-fzf` plugin (https://github.com/andreyorst/fzf-kakoune)
   - `skim` + similar
   - Plain `:grep` into a buffer (`:grep pattern *` → opens results buffer)

### Useful options

| Option | Values | Notes |
|--------|--------|-------|
| `autoinfo` | `modeline`, `popup`, `none` | Show completions/info |
| `incsearch` | `true`/`false` | Incremental search highlight |
| `scrolloff` | `5` | Lines kept above/below cursor |
| `wordchar` | regex | What counts as a word |
| `commentstring` | `# %s` | For `:comment-line` |

### Hooks you'll want

```kak
# Highlight trailing whitespace
add-highlighter global/ show-matching -trailing

# Auto-reload changed files
hook global FocusIn ".*" %{ try %sh{ kak -p %val{session} -c "edit -force %val{buffile}" } catch %{} }

# Strip trailing whitespace on save
hook global BufWritePre ".*" %{ eval -draft %sh{ sed -i 's/[[:space:]]*$//' "$kak_buffile" } }
```

## 8. Daily workflows

### Project work
- `kak -s project .` — start session in project root
- `:grep pattern *` — search → results buffer → `<ret>` jumps
- `:make` — run build, errors in `*make*` buffer, `<a-n>`/`<a-p>` jump
- tmux panes: editor left, REPL/logs right ([[Tmux_Tutorial]])

### Git
- No built-in git UI. Use terminal: `git` in tmux pane, or `:!git status` output in buffer.
- `gitsigns`-style: not available; diff via `:!git diff %val{buffile}`

### Sessions (survives disconnect)
```bash
# On server
kak -s mysession
# ... work ...
# Disconnect — session stays alive

# Reconnect from laptop
ssh server
kak -c mysession
```

### REPL-driven development
No built-in eval. Use tmux pattern ([[Tmux_Tutorial]] §7, [[Lisp_Editor_Integrations]] §7):
- Editor in tmux pane 1
- REPL (`clj`, `sbcl`, `python`, `R`) in pane 2
- Select form → send to REPL via `tmux send-keys` or clipboard

```kak
# kakrc - send selection to tmux pane 'repl'
map global normal <c-return> %{
    eval -draft %sh{
        tmux send-keys -t repl "$(cat /tmp/kakoune-send)" Enter
    }
}
```

## 9. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | Install on Mac + Fedora; `kak file.txt` | `kak -v` 2026.05.21 |
| 2 | Survival keys §2; selection-first motion | Edit without arrow keys, select→act |
| 3 | Multi-select toolbox §3; `s` `S` `<a-k>` | Replace all occurrences in file |
| 4 | Client/server §4; `kak -s` / `kak -c` | Two terminals sharing one session |
| 5 | kak-lsp §6; install servers for your langs | `gd`/`K`/rename work in Python/Rust |
| 6 | kakrc + hooks §5/§7; commit `~/.config/kak` | Config in dotfiles, formats on save |
| 7 | Tmux integration; REPL pane workflow | Send form to REPL from editor |
| 8 | Vault workflow — [[Vault_Editor_Workflows]] | Open/edit vault notes from Kakoune |

- [ ] Phase 2 · [ ] Phase 5 · [ ] Phase 8

---

**Quick reference**

| Need | Answer |
|------|--------|
| Any key | `:doc keys` (in-editor docs) |
| Hooks | `:doc hooks` |
| Options | `:doc options` |
| Sessions | `kak -s name` / `kak -c name` |
| LSP enable | `lsp-enable-window` (per filetype) |
| LSP keys | `gd` `gr` `K` `<a-r>` `<a-a>` `[d` `]d` |
| Config file | `~/.config/kak/kakrc` |
| Autoload dir | `~/.config/kak/autoload/` |
| Colors | `~/.config/kak/colors/` |
| Quit session | `:kill` |
| Format | `lsp-formatting-sync` or shell hook |

---

**Next**: [[Vault_Editor_Workflows]] §Kakoune for vault integration, or [[Kakoune_Tutorial]] for the learning path.