---
type: usage-note
topic: Editing this Obsidian vault from Emacs, Neovim, Kakoune, Helix — obsidian.nvim, markdown LSP, clipboard/URIs, git commits, format matrix (Markdown ↔ Org ↔ other), capture flows
date: 2026-11-26
status: active
tags:
  - editors
  - obsidian
  - vault
  - workflow
  - markdown
  - org-mode
---

# Vault Editor Workflows — Using Any Editor with This Vault

> Goal: edit **this Obsidian vault** (`~/projects/second_brain`) from Emacs, Neovim, Kakoune, or Helix — search, capture, tasks, backlinks, git commits, format conversion — without breaking Obsidian's indexes. Each editor gets a **first wiring** section you can paste today.
> Related: [[Obsidian_CLI]] (official CLI/TUI) · [[Emacs_Usage]] · [[Emacs_Org_Mode]] · [[Neovim_Usage]] · [[Neovim_Distro_Guide]] · [[Kakoune_Usage]] · [[Helix_Usage]] · [[Tmux_Tutorial]] · [[Lisp_Editor_Integrations]]

## How to use this note

1. **§1** — vault layout + what editors can/can't see.
2. **§2** — format matrix: Markdown ↔ Org ↔ other.
3. **§3–§6** — per-editor first wiring (paste, done).
4. **§7** — shared workflows: search, capture, tasks, git, backlinks.
5. **§8** — pitfalls + hygiene.

---

## 1. Vault layout + editor visibility

```
~/projects/second_brain/
├── .obsidian/              -- Obsidian config, plugins, indexes (app-only)
├── journal/                -- daily notes (Dataview, Tasks plugin)
├── Inbox/                  -- capture landing zone
├── Templates/
│   └── scripts/            -- Templater templates
├── Editors/                -- THESE notes
├── terminal_stuff/         -- tutorials, cheatsheets
├── Python Programming/     -- .py files
├── R Programming/          -- .R files
├── Lisp/                   -- .clj, .lisp, .org
├── ... 60+ folders
```

| What | Visible to editors | Notes |
|------|-------------------|-------|
| `.md` files | **Yes** | Plain text — any editor |
| `.org` files | **Yes** | Emacs native; others need org-mode or ignore |
| Wikilinks `[[note]]` | **Yes** | Plain text; resolution is app-side |
| Frontmatter (`---`) | **Yes** | YAML — any editor |
| Dataview queries | **No** | App-only; results not in files |
| Tasks plugin data | **Partial** | `tasks` code blocks readable; status line parsing app-side |
| Canvas `.canvas` | **No** | JSON — editable but app renders |
| Properties (YAML) | **Yes** | Standard frontmatter |
| `.obsidian/` | **Don't edit** | App manages; indexes rebuilt on app start |

**Rule**: Edit `.md`/`.org`/code files freely. Don't hand-edit `.obsidian/`. For link-aware moves/renames, use [[Obsidian_CLI]] `obsidian move/rename` or the app.

---

## 2. Format matrix — Markdown ↔ Org ↔ other

| Source | Target | Tool | Command |
|--------|--------|------|---------|
| Org → Markdown | `.org` → `.md` | Emacs `org-md-export-to-markdown` | `C-c C-e m m` (subtree) |
| Org → Markdown (batch) | dir → dir | Emacs batch | `emacs --batch -l ~/.emacs.d/init.el --eval '(mapc (lambda (f) (with-current-buffer (find-file f) (org-md-export-to-markdown))) (directory-files-recursively "~/org" "\\.org$"))'` |
| Markdown → Org | `.md` → `.org` | Pandoc | `pandoc -f markdown -t org note.md -o note.org` |
| Markdown → Org (batch) | dir → dir | Pandoc + find | `fd -e md . | parallel 'pandoc -f markdown -t org {} -o {.}.org'` |
| Org → HTML/PDF | `.org` → `.html`/`.pdf` | Emacs export | `C-c C-e h h` / `C-c C-e l p` |
| Markdown → PDF | `.md` → `.pdf` | Pandoc + LaTeX | `pandoc note.md -o note.pdf --pdf-engine=xelatex` |
| Jupyter → Markdown | `.ipynb` → `.md` | `jupytext` | `jupytext --to markdown notebook.ipynb` |
| Quarto → Markdown | `.qmd` → `.md` | Quarto CLI | `quarto render note.qmd --to markdown` |

**For this vault**: Keep source in **Markdown** (Obsidian native). Use Org **only in `~/org/`** for planning/literate work, then export subtree → `Inbox/` or project folder as `.md`. Don't commit `.org` to vault unless team agrees.

---

## 3. Emacs — first wiring

### 3.1 Markdown + vault navigation

```elisp
;; init.el additions
(use-package markdown-mode
  :mode ("\\.md\\'" . gfm-mode)
  :hook (markdown-mode . (lambda ()
    (setq-local markdown-command "pandoc")
    (setq-local markdown-xhtml-header-content "<meta charset=\"utf-8\">")
    (visual-line-mode 1)
    (setq-local fill-column 100)
    (local-set-key (kbd "C-c C-o") 'my/obsidian-open-in-app))))

;; Open current file in Obsidian app
(defun my/obsidian-open-in-app ()
  (interactive)
  (let ((file (buffer-file-name)))
    (when file
      (shell-command (format "obsidian open \"%s\"" (file-relative-name file "~/projects/second_brain"))))))

;; Quick switch: find vault files
(use-package consult
  :bind (("C-c f" . consult-file)))
;; or fzf-lua via eglot-lsp
```

### 3.2 Org for planning, export to vault

```elisp
;; Use org for personal planning (~/org/), export to vault
(setq org-directory "~/org/")
(setq org-agenda-files '("~/org/agenda.org" "~/org/projects/"))

;; Capture template for vault notes
(setq org-capture-templates
  '(("v" "Vault note" entry (file "~/projects/second_brain/Inbox/quick-capture.md")
     "#+TITLE: %^{Title}\n#+DATE: %U\n#+TAGS: %^{Tags}\n\n%?\n\n%a" :empty-lines 1)))
```

### 3.3 LSP for Markdown (marksman)

```elisp
(use-package eglot
  :hook ((markdown-mode gfm-mode) . eglot-ensure))
;; Requires: npm install -g marksman
```

### 3.4 Git + Magit (best-in-class)

```elisp
(use-package magit
  :bind (("C-x g" . magit-status)))
;; Magit sees the vault as a git repo — stage, commit, push from Emacs
```

---

## 4. Neovim — first wiring

### 4.1 obsidian.nvim (plugin — recommended)

```lua
-- lua/plugins/obsidian.lua (lazy.nvim spec)
return {
  "epwalsh/obsidian.nvim",
  version = "*",
  lazy = true,
  ft = "markdown",
  dependencies = { "nvim-lua/plenary.nvim" },
  opts = {
    workspaces = {
      { name = "second_brain", path = "~/projects/second_brain" },
    },
    daily_notes = {
      folder = "journal",
      template = "Templates/scripts/daily_journal_template.md",
      date_format = "%Y-%m-%d",
      alias_format = "%B %-d, %Y",
    },
    completion = {
      nvim_cmp = true,  -- or blink.cmp
      min_chars = 2,
    },
    mappings = {
      ["<leader>on"] = { action = "new_note", desc = "New note" },
      ["<leader>os"] = { action = "search", desc = "Search vault" },
      ["<leader>ot"] = { action = "today", desc = "Today's daily note" },
      ["<leader>oy"] = { action = "yesterday", desc = "Yesterday's daily note" },
      ["<leader>ol"] = { action = "link", desc = "Link to note" },
      ["<leader>ob"] = { action = "backlinks", desc = "Show backlinks" },
      ["<leader>ot"] = { action = "tags", desc = "Show tags" },
    },
    note_id_func = function(title)
      local suffix = ""
      if title ~= nil then
        suffix = title:gsub(" ", "-"):gsub("[^A-Za-z0-9-]", ""):lower()
      else
        suffix = tostring(os.time())
      end
      return suffix
    end,
  },
  keys = {
    { "<leader>on", "<cmd>ObsidianNew<CR>", desc = "New note" },
    { "<leader>os", "<cmd>ObsidianSearch<CR>", desc = "Search vault" },
    { "<leader>ot", "<cmd>ObsidianToday<CR>", desc = "Today's daily note" },
    { "<leader>oy", "<cmd>ObsidianYesterday<CR>", desc = "Yesterday's daily note" },
    { "<leader>ol", "<cmd>ObsidianLink<CR>", desc = "Link to note" },
    { "<leader>ob", "<cmd>ObsidianBacklinks<CR>", desc = "Backlinks" },
    { "<leader>oT", "<cmd>ObsidianTags<CR>", desc = "Tags" },
  },
}
```

**What it gives you**:
- `<leader>os` → fuzzy find vault notes (Telescope/fzf-lua)
- `<leader>on` → create new note in `Inbox/` or workspace root
- `<leader>ot` → open today's daily note (`journal/2026-11-26.md`)
- `[[` completion → wikilink autocomplete
- `<leader>ob` → backlinks picker
- `<leader>oT` → tags picker
- Tasks: integrates with `obsidian-tasks-plugin` syntax

### 4.2 Markdown LSP (marksman) — works without obsidian.nvim

```lua
-- In your LSP config (lua/plugins/lsp.lua)
lspconfig.marksman.setup({})
-- Requires: npm install -g marksman
```

Gives: `gd` on `[[wikilink]]` → jumps to file, hover shows frontmatter, diagnostics for broken links.

### 4.3 Fuzzy find vault files (fzf-lua / telescope)

```lua
-- lua/plugins/vault.lua
return {
  {
    "ibhagwan/fzf-lua",
    keys = {
      { "<leader>vf", function() require("fzf-lua").files({ cwd = "~/projects/second_brain" }) end, desc = "Vault files" },
      { "<leader>vg", function() require("fzf-lua").live_grep({ cwd = "~/projects/second_brain" }) end, desc = "Vault grep" },
      { "<leader>vj", function() require("fzf-lua").files({ cwd = "~/projects/second_brain/journal" }) end, desc = "Journal files" },
    },
  },
}
```

### 4.4 Git (Neogit / gitsigns)

```lua
-- Already in Neovim_Usage §4 starter
{ "NeogitOrg/neogit", dependencies = "nvim-lua/plenary.nvim", config = true },
{ "lewis6991/gitsigns.nvim", config = true },
-- <leader>gs = Neogit, gitsigns hunks in buffer
```

### 4.5 Open in Obsidian app

```lua
-- keymaps.lua
map("n", "<leader>oo", function()
  local file = vim.fn.expand("%:p")
  local rel = vim.fn.fnamemodify(file, ":.")
  vim.fn.system("obsidian open \"" .. rel .. "\"")
end, { desc = "Open in Obsidian app" })
```

---

## 5. Kakoune — first wiring

### 5.1 kak-lsp for Markdown (marksman)

```kak
# kakrc
hook global WinSetOption filetype=markdown %{
    lsp-enable-window
}
# Requires: npm install -g marksman
```

### 5.2 Vault search + open (fzf + kakoune-fzf)

```kak
# autoload/vault.kak
# Requires: https://github.com/andreyorst/fzf-kakoune
define-command vault-files %{
    eval -draft %sh{
        cd ~/projects/second_brain
        fzf --preview 'bat -n {}' --preview-window=right:60%
    } | xargs -r kak -p %val{session} -c "edit"
}

define-command vault-grep %{
    eval -draft %sh{
        cd ~/projects/second_brain
        rg -n --glob '*.md' "$1" | fzf --preview 'bat -n {1} --highlight-line {2}' --preview-window=right:60% --delimiter=':' --with-nth=3..
    } %arg{1} | awk -F: '{print "edit " $1 " " $2}' | xargs -r kak -p %val{session} -c
}

map global user f :vault-files<ret>
map global user g :vault-grep<ret><c-r>=input("grep: ")<ret>
```

### 5.3 Daily note capture

```kak
# kakrc
define-command vault-daily %{
    eval -draft %sh{
        date=$(date +%Y-%m-%d)
        file=~/projects/second_brain/journal/$date.md
        if [ ! -f "$file" ]; then
            cat ~/projects/second_brain/Templates/scripts/daily_journal_template.md > "$file"
        fi
        echo "edit $file"
    } | xargs -r kak -p %val{session} -c
}
map global user d :vault-daily<ret>
```

### 5.4 Open in Obsidian app

```kak
# kakrc
define-command obsidian-open %{
    eval -draft %sh{
        obsidian open "$(realpath --relative-to=~/projects/second_brain "$kak_buffile")"
    }
}
map global user o :obsidian-open<ret>
```

### 5.5 Git (terminal in tmux)

```kak
# kakrc - run git in tmux pane
define-command git-status %{
    eval -draft %sh{
        tmux split-window -h -l 40% "cd ~/projects/second_brain && git status && read -p 'Press Enter...'"
    }
}
map global user s :git-status<ret>
```

---

## 6. Helix — first wiring

### 6.1 Built-in LSP for Markdown (marksman)

```toml
# languages.toml
[[language]]
name = "markdown"
language-servers = ["marksman"]
auto-format = true
formatter = { command = "prettier" }
# Requires: npm install -g marksman prettier
```

`hx --health markdown` → should show marksman OK.

### 6.2 Vault file picker (built-in)

```toml
# config.toml
[keys.normal]
# Vault files from project root
"Space v f" = { command = "sh", args = ["-c", "cd ~/projects/second_brain && hx $(fzf --preview 'bat -n {}')"] }
"Space v g" = { command = "sh", args = ["-c", "cd ~/projects/second_brain && hx $(rg -n --glob '*.md' '' | fzf --preview 'bat -n {1} --highlight-line {2}' --preview-window=right:60% --delimiter=':' | cut -d: -f1)"] }
"Space v j" = { command = "sh", args = ["-c", "cd ~/projects/second_brain/journal && hx $(fzf --preview 'bat -n {}')"] }
```

### 6.3 Daily note

```toml
# config.toml
[keys.normal]
"Space v d" = { command = "sh", args = ["-c", "date=$(date +%Y-%m-%d); file=~/projects/second_brain/journal/$date.md; [ -f $file ] || cp ~/projects/second_brain/Templates/scripts/daily_journal_template.md $file; hx $file"] }
```

### 6.4 Open in Obsidian app

```toml
# config.toml
[keys.normal]
"Space v o" = { command = "sh", args = ["-c", "obsidian open \"$(realpath --relative-to=~/projects/second_brain %:p)\""] }
```

### 6.5 Send selection to tmux REPL (from Helix_Usage §6)

```toml
# config.toml
[keys.normal]
"C-Enter" = { command = "sh", args = ["-c", "tmux send-keys -t repl '$(cat /tmp/hx-send)' Enter"] }
```

### 6.6 Git (terminal)

```toml
# config.toml
[keys.normal]
"Space v s" = { command = "sh", args = ["-c", "tmux split-window -h -l 40% 'cd ~/projects/second_brain && git status && read'"] }
```

---

## 7. Shared workflows

### 7.1 Search vault → open in editor

| Editor | Command |
|--------|---------|
| Emacs | `C-c f` (consult-file in vault) or `M-x rg` |
| Neovim | `<leader>vg` (fzf-lua live_grep) or `:Telescope live_grep` |
| Kakoune | `<space>g` (vault-grep) |
| Helix | `Space v g` |
| Any | `obsidian search query="term" vault="second_brain" format=json \| jq -r '.[].path' \| fzf --preview 'bat -n ~/projects/second_brain/{}' \| xargs -I{} $EDITOR ~/projects/second_brain/{}` |

### 7.2 Capture to vault from anywhere

```bash
# Shell function (add to .bashrc/.zshrc)
vault-capture() {
  obsidian daily:append content="- [ ] $*" && echo "captured: $*"
}
# Usage: vault-capture "review Helix notes"
```

Or editor-specific:
- Emacs: `M-x org-capture` → template "v" → writes to `Inbox/quick-capture.md`
- Neovim: `<leader>on` (obsidian.nvim) or custom command
- Kakoune/Helix: shell function above + `tmux send-keys`

### 7.3 Tasks workflow

| Tool | How |
|------|-----|
| Obsidian (Tasks plugin) | `obsidian tasks daily` → JSON; `obsidian task ref="journal/2026-11-26.md:12" status="x"` |
| Neovim + obsidian.nvim | `<leader>ot` → open daily note; edit checkboxes; `gcc` toggle |
| Emacs + Org | `C-c a t` → agenda TODO view; `C-c c` capture task |
| Kakoune/Helix | Edit `- [ ]` lines in daily note; use `obsidian` CLI to mark done |

**Hygiene**: Weekly run (cron or manual):
```bash
obsidian vault="second_brain" orphans format=json | jq -r '.[].path'
obsidian vault="second_brain" unresolved format=json | jq -r '.[].link'
```

### 7.4 Backlinks / graph

| Tool | How |
|------|-----|
| Obsidian app | Built-in graph view, backlinks pane |
| Neovim + obsidian.nvim | `<leader>ob` → backlinks picker |
| Emacs | `M-x org-olpath-open` (org) or `rg '\\[\\[.*\\]\\]'` |
| Kakoune/Helix | `obsidian backlinks path="note.md" format=json` |
| CLI | `obsidian backlinks path="note.md" format=json \| jq -r '.[].path'` |

### 7.5 Git commits from editor

| Editor | Workflow |
|--------|----------|
| Emacs | `C-x g` (Magit) → stage/commit/push |
| Neovim | `<leader>gs` (Neogit) or gitsigns hunks → `:Neogit commit` |
| Kakoune | `:sh git add %:p && git commit -m "msg"` in tmux |
| Helix | `:sh git add %:p && git commit -m "msg"` in tmux |
| Any | `git add -A && git commit -m "msg" && git push` in terminal |

---

## 8. Pitfalls + hygiene

| Pitfall | Prevention |
|---------|------------|
| Broken wikilinks after rename | Use `obsidian move/rename` (CLI) or app; not `mv` |
| Dataview queries not updating | Edit in app or run `obsidian command id="dataview:rebuild-index"` |
| Tasks plugin status out of sync | Mark done in app or via `obsidian task ref=...` CLI |
| Frontmatter YAML invalid | Validate with `yamllint` or editor LSP (marksman) |
| `.obsidian/` corruption | Never hand-edit; backup before app updates |
| Large vault = slow grep | Use `obsidian search` (indexed) for content; `rg` for code |
| Multiple editors editing same file | Save before switching; use `:checktime` (Vim) / auto-revert (Emacs) |

### Recommended hygiene script (weekly)

```bash
#!/bin/bash
# ~/bin/vault-hygiene.sh
VAULT=~/projects/second_brain
cd "$VAULT"

echo "=== Orphans ==="
obsidian vault="second_brain" orphans format=json | jq -r '.[].path' | head -20

echo "=== Unresolved links ==="
obsidian vault="second_brain" unresolved format=json | jq -r '.[].link' | sort -u

echo "=== Dead ends ==="
obsidian vault="second_brain" deadends format=json | jq -r '.[].path' | head -20

echo "=== Git status ==="
git status --short

echo "=== Large files > 1MB ==="
find . -name "*.md" -size +1M -exec ls -lh {} \;
```

---

## 9. First wiring checklist (per editor)

| Editor | Paste this section | Verify |
|--------|-------------------|--------|
| Emacs | §3.1–3.4 | `C-c f` finds vault files; `C-x g` Magit works; `C-c C-e m m` exports org→md |
| Neovim | §4.1–4.5 | `<leader>os` searches vault; `<leader>ot` opens daily; `[[` completes |
| Kakoune | §5.1–5.5 | `<space>f` finds files; `<space>d` opens daily; `gd` on wikilink works |
| Helix | §6.1–6.6 | `Space v f` finds files; `Space v d` opens daily; `gd`/`Space k` on wikilink works |

---

**Next**: Pick one editor, paste its first wiring, test the vault search + daily note flow. Then customize from each editor's customization primer.