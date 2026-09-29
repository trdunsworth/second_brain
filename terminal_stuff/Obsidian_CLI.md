---
type: learning-note
topic: Obsidian from the terminal — official CLI, built-in TUI, and terminal-native vault workflows
date: 2026-09-29
status: active
tags:
  - obsidian
  - cli
  - tui
  - terminal
  - tutorial
  - terminal_stuff
---

# Obsidian from the Command Line — CLI, TUI, and Terminal Workflows

> Goal: drive this vault **from the shell** — search, capture, tasks, backlinks, scripted automation — and use the **official Obsidian TUI** when you want interactive vault browsing without the mouse. Decision rule: *runtime/index features → `obsidian` CLI; plain file work → rg/fzf/bat like any other directory*.
> Related: [[TUI_Programs]] (the wider TUI catalog), [[Linux_Terminal_Toolkit]] (rg/fzf/jq used below), [[Neovim_Tutorial]] (editor-side integration), [[Tmux_Tutorial]] (keep it in a pane)

## How to use this note

1. **§1–§2 once** — enable and probe the official CLI.
2. **§3–§4** — daily commands and TUI mode (this is 90% of the value).
3. **§5** — recipes that combine the CLI with the terminal tools from [[Linux_Terminal_Toolkit]].
4. **§6** — third-party options when the official CLI doesn't fit (headless, no-app editing).

---

## 1. The official Obsidian CLI (what you have)

Obsidian ships a **first-party CLI with a built-in TUI** — "anything you can do in Obsidian you can do from the command line." It talks to the **running app**, so it sees indexes, settings, plugins, and workspace state that plain file tools can't.

### Requirements
| Requirement | Detail |
|-------------|--------|
| Obsidian installer | **1.12+** (1.12.7+ current) — installer version, not just app version |
| Enable | Settings → **General** → **Command line interface** on |
| Register | Follow the on-screen prompt (adds `obsidian` to PATH) |
| Platform specifics | macOS: symlink at `/usr/local/bin/obsidian` (admin prompt); Windows: `Obsidian.com` redirector next to `Obsidian.exe` (GUI app needs it); Linux: binary to `~/.local/bin/obsidian` (ensure it's in PATH) |
| App running | Required — first command launches Obsidian if it isn't |

### Probe before you rely on it

```bash
obsidian version     # must exit 0 — PATH presence alone proves nothing
obsidian help        # command overview
obsidian help search # per-command syntax (use when unsure)
```

> [!note] Division of labor
> The CLI is for **runtime/indexed operations** (backlinks, tasks, daily notes, workspace, plugins). For reading/moving plain files, `rg`/`fd`/`cat` are faster and don't need the app. Don't shell out to Obsidian to do `ls`'s job.

## 2. Syntax rules (learn once)

- Parameters are **`name=value`**, not flags: `query="meeting"`, `format=json`.
- Boolean flags take no value: `verbose`.
- **Quote anything with spaces**: `vault="My Vault"`.
- **Target precisely** — always prefix with the vault when you know it:
  ```bash
  obsidian vault="second_brain" backlinks path="journal/2026-09-29.md" format=json
  ```
- `path=` = exact vault-relative path (preferred). `file=` = Obsidian wikilink-style name resolution.
- `format=json` for anything you'll pipe to `jq`.
- In the TUI, command prefixes come off — you type `search query=…` directly; `vault:open <name>` switches vaults.

## 3. Command families (the daily drivers)

Exact syntax lives in `obsidian help <command>` — these are the families worth memorizing.

### Everyday capture & reading
| Command | Does | Example |
|---------|------|---------|
| `search` | Indexed vault search | `obsidian search query="standup" vault="second_brain" format=json \| jq -r '.[].path'` |
| `read` | Read active/target file | `obsidian read path="HOTKEYS.md"` |
| `daily:append` / `daily:prepend` | Add to today's note | `obsidian daily:append content="- [ ] Review PR #42"` |
| `daily` / `daily:read` | Open / read today's note | `obsidian daily:read format=json` |
| `diff` | Compare versions | `obsidian diff file=README from=1 to=3` |
| `vaults` | List vaults (`total`, `verbose` for paths) | `obsidian vaults verbose` |

### Tasks (indexed, line-stable)
```bash
obsidian tasks daily                          # list tasks in today's note
obsidian tasks format=json | jq '.[] | select(.status==" ")'
obsidian task ref="journal/2026-09-29.md:12" status="x"   # complete by stable ref
```
`ref=path:line` is the durable handle — don't parse text you can address.

### Link graph (the stuff file tools can't see)
| Command | Question it answers |
|---------|---------------------|
| `backlinks path=…` | Who links here? |
| `links path=…` | What does this note link to? |
| `unresolved` | Which `[[wikilinks]]` point nowhere? |
| `orphans` | Which notes are linked from nowhere? |
| `deadends` | Which notes link nowhere (dead ends)? |

Weekly hygiene one-liner:

```bash
obsidian vault="second_brain" orphans format=json | jq -r '.[].path'
obsidian vault="second_brain" unresolved format=json | jq -r '.[].link'
```

### Properties, tags, aliases
```bash
obsidian property:read path="Research/x.md" key="status"
obsidian property:set  path="Research/x.md" key="status" value="active" type=date
obsidian property:remove path="Research/x.md" key="stale"
obsidian tags format=json            # tag inventory
obsidian tag name=meeting            # notes carrying a tag
obsidian aliases path="note.md"
```

### Bases (database views) & templates
```bash
obsidian bases format=json                      # list bases
obsidian base:views name="Projects"
obsidian base:query name="Projects" view="Active" format=json | jq length
obsidian templates                             # configured templates
obsidian template:read path="Templates/daily.md" resolve   # tokens resolved
```

### Workspace (live app state)
```bash
obsidian tabs ids          # what's open right now (source of truth for open tabs)
obsidian workspace ids     # full workspace tree with item IDs
```

### Link-aware refactors (respects your vault setting)
```bash
obsidian move path="old/folder/note.md" to="Archive/note.md"
obsidian rename path="note.md" to="renamed.md"
```
Use these instead of `mv` **when internal links must be rewritten** — otherwise plain `mv`/`rg` is fine (and `[[…]]` links are filename-resilient anyway).

### Commands registry & scripting glue
```bash
obsidian commands filter="dataview:"            # discover plugin command IDs
obsidian command id="my-plugin:run-action"      # execute one (never guess IDs)
```

### The escape hatch: `eval`
Small read-only JavaScript against the app API:
```bash
obsidian eval code="app.workspace.getMostRecentLeaf()?.view.file?.path ?? ''"
```
`eval` that **mutates** state is a big-levers operation — treat as explicit-intent-only. Same for publishing, permanent deletes, plugin installs, and restores: don't automate what you haven't done by hand first.

## 4. TUI mode — the interactive answer

```bash
obsidian          # bare command opens the TUI
help              # inside: full help
search query=x    # commands without the `obsidian` prefix
```

- **Autocomplete**, **command history**, **`Ctrl-R`** reverse search — it behaves like a shell for your vault.
- `vault:open <name|id>` switches vaults without leaving.
- Use it in a [[Tmux_Tutorial|tmux]] pane next to your editor: TUI on the left (graph/tasks), `nvim`/`bat` on the right (content).

> [!tip] When to TUI vs one-shot
> **One-shot** (`obsidian search …`) for scripts, pipes, `$(...)` in bigger commands. **TUI** for exploratory work — poking at backlinks, checking tasks, trying syntax against live help. If you're typing the same one-shot 3×/day, alias or script it (§5).

## 5. Recipes — CLI × terminal toolkit

```bash
# 1. Capture to inbox from anywhere (add to shell rc as a function)
obs() { obsidian daily:append content="- [ ] $*" && echo "captured: $*"; }
obs "review duckdb notes"

# 2. Search vault → open in Neovim
obsidian search query="ESS keybindings" format=json \
  | jq -r '.[].path' \
  | fzf --preview "bat -n '$VAULT/{}'" \
  | xargs -I{} nvim "$VAULT/{}"

# 3. Plain-text fast path (no app needed): ripgrep the vault directory
VAULT=~/projects/second_brain
rg -n --glob '*.md' 'terminal_stuff' "$VAULT" | head -20

# 4. Unresolved links → a work queue
obsidian vault="second_brain" unresolved format=json | jq -r '.[].link' > /tmp/unresolved.txt

# 5. Daily note → task count on your prompt/statusline
n=$(obsidian tasks daily format=json | jq length); echo "open tasks: $n"

# 6. Scripted report: dead ends per folder
obsidian orphans format=json | jq -r '.[].path' | cut -d/ -f1 | sort | uniq -c | sort -rn

# 7. Diff note versions before/after an agent session
obsidian diff path="terminal_stuff/Linux_Terminal_Toolkit.md" from=2 to=5
```

**Best practices**
- Prefer `format=json` + `jq` over text-grepping CLI output.
- Script against `path=` (exact), never active-file state — scripts run headless of what you're looking at.
- Keep raw-file jobs on `rg`/`fd` (§ note above); keep `obsidian` for graph/properties/tasks/workspace.
- Quote every `content=`/`query=` (shell + spaces = sadness).
- Anything destructive or stateful (publish, delete, restore): do it by hand first, automate second.

## 6. Third-party & terminal-native options

| Tool | Kind | When to use | Key facts |
|------|------|-------------|-----------|
| **`ob`** (tulashvili/obsidian-cli) | **Vim-style TUI** (Python) | You want a real *editor* TUI: file tree, backlinks, `[[` autocomplete, quick switcher — no plugins | `ob` / `ob -v ~/vault`; reads `.obsidian/` config (daily notes, templates, attachments, bookmarks shared with the app); `ob graph`, `ob list`, `ob random`, `ob attach`; keys: `j/k`, `i` edit, `Ctrl-S` save, `/` search, `o` switcher, `d` daily, `t` tags |
| **nb/obsidian-cli** (Go) | One-shot CLI | Terminal-only edits — opens notes in **your editor**, not the app | `obsidian-cli search-content "term" --editor`, `create "n.md" --editor`, `daily`; `set-default` vault; `obs_cd` helper; works when you refuse to launch the GUI |
| ubuntupunk/obsidian-cli (Go) | One-shot CLI | Scripting open/create/move/delete with `--vault` | `obsidian-cli open "note" --vault V`, `move old new` (updates links) |
| **obsidian-cli** (PyPI) | Vault manager | Managing *vaults* from scripts | `uv tool install obsidian-cli`; `obsidian ls`, `obsidian open PATH`, `obsidian new PATH` (from template) |
| **obsidian.nvim** | Neovim plugin | Live inside your editor | `:ObsidianSearch`/`ObsidianQuickSwitch`-style commands, `[[` completion, link-aware notes — pair with [[Neovim_Tutorial]] |
| **telekasten.nvim** | Neovim plugin | Zettelkasten flavor in nvim | daily notes, templates, backlinks from the editor |
| **rg + fzf + bat + glow** | Raw files | Zero-app workflows | `fd . "$VAULT" \| fzf --preview 'bat -n {}'`; `glow` for reading notes; works on any server where Obsidian never runs |

> [!warning] Keep one source of truth
> Editing `.md` files behind Obsidian's back is fine (it's plain text), but plugins with their own indexes (Dataview et al.) need the app to rescan. Prefer the official CLI when plugin-visible state matters.

### Headless / remote
- The desktop CLI needs the **running app** (local GUI). For servers, the plain-file stack (`rg`/`fd`/`nvim`) or `nb/obsidian-cli --editor` covers most needs; Obsidian publishes a separate **Headless** offering for sync/server scenarios — check obsidian.md if you need vault sync without a desktop.
- SSH: your vault on a remote box = plain files; `nvim` + `rg` there, no CLI needed.

## 7. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | Enable CLI, `obsidian version` / `help` probe | Probe exits 0 on your shell |
| 2 | Syntax drill: `vault=`, `path=`, `format=json` (§2) | Search + `jq` path extraction from memory |
| 3 | Capture: `daily:append` wired as shell function (§5.1) | Append a task without thinking |
| 4 | Graph hygiene: orphans/unresolved/deadends run weekly | Four-command weekly ritual exists |
| 5 | Tasks by `ref=` | Complete a task from the terminal |
| 6 | TUI comfort: autocomplete + `Ctrl-R` + `vault:open` | Explore backlinks in TUI without docs |
| 7 | One recipe scripted (§5) in `~/bin` | Runs on demand, ShellCheck-clean |

- [ ] Phase 1 …
- [ ] Phase 4 …
- [ ] Phase 7 …

### Quick reference

| Need | Command |
|------|---------|
| Help | `obsidian help` / `obsidian help <cmd>` |
| Search | `obsidian search query="…" vault="…" format=json` |
| Capture | `obsidian daily:append content="- [ ] …"` |
| Who links here | `obsidian backlinks path=… format=json` |
| Graph holes | `orphans` `unresolved` `deadends` |
| Open tabs | `obsidian tabs ids` |
| Run a plugin command | `obsidian commands filter="p:"` → `command id=…` |
| TUI | `obsidian` (bare) |
| App state peek | `obsidian eval code="…"` (read-only) |
