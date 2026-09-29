---
type: reference
topic: TUI programs catalog — terminal interfaces for system, git, files, data, containers, and more
date: 2026-09-29
status: active
tags:
  - tui
  - terminal
  - linux
  - cheatsheet
  - terminal_stuff
---

# TUI Programs — Catalog, Keys, and Best Practices

> Goal: a catalog of **terminal user interfaces worth installing** — what each one replaces, how to start, and its "get productive" keys. TUIs are the middle path: richer than flags, cheaper than GUIs, and they live happily inside [[Tmux_Tutorial|tmux]] panes over SSH.
> Related: [[Linux_Terminal_Toolkit]] (plain CLI tools), [[Obsidian_CLI]] (Obsidian's TUI), [[Terminal_Fluency_Program]] (where these fit in your training), [[Tmux_Tutorial]]

## 1. The universal TUI grammar

Almost every program below obeys the same contract — learn it once, guess keys everywhere:

| Key | Meaning |
|-----|---------|
| `q` / `Esc` | Quit (sometimes twice; rarely `Ctrl-C`) |
| `?` / `F1` | **Help — always pressed first in a new TUI** |
| `/` | Search/filter |
| `j k` or arrows | Navigate (vi-keys increasingly standard) |
| `Enter` | Open / confirm |
| `Tab` | Cycle panels/fields |
| `Ctrl-R` | Refresh (in some) |
| `Ctrl-C` | Emergency exit (last resort) |
| Mouse | Scroll & click where supported (`btop`, `yazi`, `lazygit`) |

**Best practices**
- Run long-lived TUIs inside [[Tmux_Tutorial|tmux]] — detachable, survives SSH drops.
- One TUI per pane; don't stack interactive programs in a pipeline (they want a tty).
- Install **one category at a time** (this is also [[Terminal_Fluency_Program#3. Weekly rhythm|the program's rule]]) — a launcher-full of TUIs you don't know is clutter.
- On headless servers prefer TUIs with no GUI deps — everything here is terminal-native.

## 2. System & monitoring

| TUI | Replaces / does | Start | Get-productive keys |
|-----|-----------------|-------|---------------------|
| **btop** | `top`+`htop`+graphing (CPU/mem/net/disk per-process, themes) | `btop` | Mouse works; `q` quit; arrows move between widgets; `/` filter processes; `?` full help |
| **htop** | interactive `top` | `htop` | `F5` tree, `F9` kill, `F4` filter, `F6` sort, `F2` setup |
| **bottom** (`btm`) | modern top (rust, mouse, graphs) | `btm` | arrows between widgets, `q` |
| **glances** | all-in-one system overview (cross-platform) | `glances` | `q`; `-w` web mode; auto-refresh |
| **procs** | `ps` (color, tree, search) | `procs` | search-as-you-type by name |
| **bandwhich** | per-process **network** bandwidth | `bandwhich` | pause with space; sort keys via `?` (needs sudo for full names) |
| **gping** | `ping` with a live graph (multi-host) | `gping example.com 1.1.1.1` | `p` add ping, `d` remove |
| **mtr** | traceroute+ping curses view | `mtr host` | `q` (use `-rw` for report mode in scripts) |

## 3. Disk & files

| TUI | Replaces / does | Start | Get-productive keys |
|-----|-----------------|-------|---------------------|
| **ncdu** | interactive `du` — find and delete space hogs | `ncdu /` (`-x` one filesystem) | arrows navigate, `d` delete, `?` full key list, `q` quit |
| **dust** | pretty top-N disk usage (non-interactive, instant) | `dust` / `dust -n 15` | pager arrows |
| **gdu** | `ncdu`-style in Go (fast on huge disks) | `gdu .` | vi-ish keys, `d` delete |
| **yazi** | terminal file **manager** with image/file previews (rust, async) | `yazi` | **vi keys**: `j/k` move, `Enter` open, `y`/`x`/`d` yank/cut/delete, `p` paste, `/` filter, `a` create, `?` help, `q` quit |
| **broot** | tree view + fuzzy find + `cd` | `broot` (or `br` shell function to cd on exit) | type to filter, `:tree` for tree mode, `Enter` descend/open, `e` open in `$EDITOR`, `q` quit, `?` help |
| **ranger** | vim-flavored file manager (python) | `ranger` | `j/k/h/l`, `Enter`, `v` visual, `yy`/`dd` yank/cut, `:shell`, `r` open with |
| **lf / joshuto / vifm** | ranger-class managers (go/rust/vim-style) | `lf` / `joshuto` / `vifm` | ranger-like; vifm is deliberately vim-like |
| **mc** | the classic Midnight Commander (F-keys, dual pane) | `mc` | `F1` help, `F3` view, `F5` copy, `F10` quit — still unbeatable on bare servers |

## 4. Search, cheatsheets, navigation

| TUI | Does | Start | Keys |
|-----|------|-------|------|
| **fzf** | fuzzy-find *anything* (files, history, git, processes) | `fzf`, `Ctrl-R` (history), `Ctrl-T` (files), `Alt-C` (cd) | type to filter; `Tab` multi-select; `Ctrl-J/K` scroll; `--preview` for previews |
| **zoxide** `zi` | interactive directory jump | `zi` | fzf-style pick then `cd` |
| **navi** | searchable **cheatsheet that fills in commands** | bind a key (commonly `Ctrl-G` or `;`) | type what you want; arrows pick; placeholders fill in |
| **cheat** / **cht.sh** | personal + community cheat sheets | `cheat tar`, `curl cht.sh/tar` | pager keys |
| **tealdeer** (`tldr`) | fast example-first man pages | `tldr git` | pager |
| **Obsidian TUI** | your vault, interactive | `obsidian` (bare) | see [[Obsidian_CLI]] |

## 5. Git (dev-flavored — your program's core)

| TUI | Does | Start | Get-productive keys |
|-----|------|-------|---------------------|
| **lazygit** | full git in one screen: stage, commit, branch, rebase, conflicts, stash, scrub | `lazygit` (inside a repo) | `space` stage, `c` commit, arrows/`Tab` between panels, `/` filter files, **`?` shows every key**, `q` quit |
| **gitui** | rust lazygit-alternative, very fast | `gitui` | `?` help first — everything lives behind it; `q` quit |
| **tig** | log / status / blame **browser** (read-mostly) | `tig`, `tig status`, `tig blame f` | `Enter` open, `u` refresh refs, `hjkl`/arrows, `q` |
| **gh dash** (`gh-dash`) | PR/issue dashboard in the terminal | `gh dash` | arrows, `Enter` open, `/` filter, `?` help |
| **delta** | not a TUI — the *pager* that makes `git diff`/`git log` readable | via git config (see [[Linux_Terminal_Toolkit]]) | — |
| **git (plain)** | still the real skill | — | the [[Terminal_Fluency_Program]] makes this muscle memory; TUIs are a multiplier, not a substitute |

> [!tip] lazygit + delta together
> lazygit's diffs flow through your configured pager — set delta up first (Toolkit §3), then lazygit becomes genuinely pleasant.

## 6. Data & databases

| TUI | Does | Start | Keys / tips |
|-----|------|-------|-------------|
| **visidata** | spreadsheet TUI for **any** data: CSV/TSV/JSON/log/Excel | `vd data.csv` (`vd -f jsonl f.jsonl`) | arrows, `/` search, `Space` select, `s` sort (column context via `?`), `q` quit; pipeline in: `jq … \| vd -` |
| **fx** | interactive JSON viewer/processor | `fx data.json` | `j`/arrows navigate, `/` search, `l` expand, `?` help (can run JS) |
| **jless** | pager for JSON like `less` is for text | `jless big.json` | `l`/`Enter` expand, `h` collapse, `/` search, `F` fold all |
| **pgcli** | `psql` with fuzzy autocomplete everywhere | `pgcli dbname` | type-and-tab tables/columns/keywords; `\d+ table`; `\h` help |
| **mycli** | same, for MySQL/MariaDB | `mycli db` | autocomplete, `\d` |
| **litecli** | same, for SQLite | `litecli f.db` | autocomplete |
| **usql** | one universal SQL CLI (postgres/mysql/sqlite/…) | `usql postgres://…` | `\d`, `\dt`; good when drivers vary |
| **lazysql** | TUI browser for SQL DBs (execute, edit, results panes) | `lazysql "dsn"` | panels via Tab; `?` help |
| **duckdb CLI** | your analytics SQL straight on files | `duckdb f.duckdb` | SQL + `.tables`; pair with [[duckdb_notes|duckdb_notes]] |

## 7. Containers & infrastructure

| TUI | Does | Start | Keys |
|-----|------|-------|------|
| **lazydocker** | docker/compose: containers, images, logs, stats | `lazydocker` | panels by arrows; `Enter` logs; `?` every key; `d` operations (confirm!) |
| **k9s** | Kubernetes — pods, logs, describe, shell, delete | `k9s` | `:` command mode (`:pods`, `:ns`), arrows, `l` logs, `d` describe, `s` shell, `x` delete (confirm), `?` help |
| **dive** | explore docker image layers / bloat | `dive image:tag` | `Tab` switches layer↔file views; `?` help |
| **termshark** | Wireshark's TUI (tshark capture browser) | `termshark` (or `tshark -r cap.pcap` + termshark) | Wireshark-like tree; `/` filter |

## 8. Viewers, logs, and reading

| TUI | Does | Start | Keys |
|-----|------|-------|------|
| **less** | *the original TUI* — every pipe ends here | `cmd \| less` | `/` search, `F` follow, `g`/`G` top/bottom, `q`, `:n` next file; `less -N` for line numbers |
| **glow** | render Markdown beautifully | `glow README.md` (or `glow` = browse) | arrows/`j`, `/`, `q` |
| **lnav** | log viewer: auto-detects syslog/apache/nginx formats, live tail | `lnav` / `lnav /var/log/syslog` | `/` search, `q` quit, `:open file`, `?` full keys |
| **bat** | `cat` with highlight + pager | `bat file.py` | less keys inside |
| **hexyl** | colored hex dump | `hexyl f.bin` | pager |
| **broot** | see §3 (also a great README/tree reader) | `broot` | — |

## 9. Editors (the TUIs you live in)

| Editor | Flavor | Start here |
|--------|--------|-----------|
| **micro** | nano-easy, mouse, real editing | `micro f.txt` — nano-like chords for save/quit (status bar + help in `Ctrl-G` docs); config in `~/.config/micro/` |
| **helix** (`hx`) | selection-first, built-in LSP + fuzzy picker | `hx f.py` — run `:tutor` for the built-in tutorial; modal like vim but selection comes first |
| **kakoune** | selection-first, scriptable | helix's ancestor; same "select, then act" philosophy |
| **nano** | the server default | `Ctrl-O` write, `Ctrl-X` exit, `Ctrl-W` search |
| **vim / neovim** | the full craft | [[Vim_Tutorial]] / [[Neovim_Tutorial]] |
| **emacs -nw** | the other philosophy, in-terminal | [[Emacs_Tutorial]] |

## 10. Mail, news, feeds

| TUI | Does | Start |
|-----|------|-------|
| **aerc** | modern email client in the terminal | `aerc` (config `~/.config/aerc/`) |
| **neomutt** | the battle-tested mutt fork | `neomutt` (needs `msmtp`/`offlineimap` plumbing) |
| **newsboat** | RSS/Atom reader (mutt-style keys) | `newsboat` (feeds in `~/.newsboat/urls`) |

Vault-style notes from the terminal: [[Obsidian_CLI]].

## 11. Install batches (Debian/Ubuntu + rustup)

```bash
# Batch A — monitoring & disk (apt)
sudo apt install btop htop ncdu glances duf

# Batch B — dev TUIs (check apt, else binaries)
sudo apt install lazygit tldr jq
# btop/gitui also ship via GitHub releases if apt lags

# Batch C — data
sudo apt install sqlite3            # + pgcli/mycli via pipx/uv:
uv tool install pgcli mycli litecli visidata

# Batch D — files & finders
sudo apt install fzf fd-find bat
cargo install yazi-cli broot gdu dust   # or GitHub release binaries

# Batch E — containers
sudo apt install lazydocker              # or release binary; k9s via k9s repo
```

(Debian name gotchas: `fd-find`→`fdfind`, `bat`→`batcat` — see [[Linux_Terminal_Toolkit]] §3.)

## 12. Suggested core stack (don't install all of this)

Minimum high-leverage set for a dev-flavored workflow:

1. **btop** — one pane, always-on system health
2. **lazygit** — git muscle, amplified (after learning plain git)
3. **yazi** or **broot** — file navigation with previews
4. **fzf** — the filter under everything else
5. **visidata** or **pgcli** — *one* data TUI matching your work (analytics → visidata + duckdb)
6. **Obsidian TUI** — your vault from the terminal ([[Obsidian_CLI]])

Everything else: add when a real need appears, one at a time, `?`-first.

## 13. Tracker

- [ ] Batch A installed; `btop` runs in a tmux pane
- [ ] lazygit opened in a real repo; `?` browsed once
- [ ] fzf keybindings active in bash (`Ctrl-R` fuzzy)
- [ ] One file TUI (yazi/broot) used for a whole session without ranger muscle-memory cheating
- [ ] visidata (or pgcli) opened your real work data
- [ ] `obsidian` TUI explored ([[Obsidian_CLI]] §4)
- [ ] Every TUI above you've tried: `?` pressed before README

### When stuck

| Problem | Fix |
|---------|-----|
| "TUI won't start / garbled" | Needs a real tty: run directly, not through `|`; inside tmux it's fine |
| "Can't exit" | `q`, `Esc`, `Ctrl-C`; `?` for the real quit key |
| "Mouse scroll hijacked" | Most TUIs want the mouse; `Ctrl-B`/page keys as fallback, or disable mouse in the app |
| "Which panel is focused?" | Look for the highlight border; `Tab` cycles — in btop/lazygit the cursor tells you |
| "Should this be a TUI or a script?" | Repeat 3× as a human → script it ([[Terminal_Fluency_Program]] §5); explore once → TUI |
