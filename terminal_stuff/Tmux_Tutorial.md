---
type: learning-note
topic: tmux tutorial — sessions, windows, panes, and persistent workflows
date: 2026-09-29
status: active
tags:
  - tmux
  - terminal
  - linux
  - tutorial
  - terminal_stuff
  - learning-plan
---

# tmux Tutorial — Work That Survives Disconnects

> Goal: make tmux muscle memory for the three things it's for: **(1) work that survives SSH drops**, **(2) parallel views of one project**, **(3) repeatable session layouts**. tmux is a *terminal multiplexer* — a server you attach clients to; your shell lives inside it, not inside your SSH connection.
> Related: [[Tmux_Cheatsheet]] (quick keys), [[Linux_Terminal_Toolkit]] (the tools that run *inside* the panes), [[TUI_Programs]] (what to put in those panes), [[Neovim_Tutorial]] / [[Vim_Tutorial]] (editors that pair beautifully with tmux)

## How to use this note

1. **§1–§4 once** — install, the mental model, survival keys.
2. **§5–§8 daily** — windows/panes, copy mode, config, plugins.
3. **§9 recipes** — the real workflows (SSH, logs, editor pairs).
4. Keep [[Tmux_Cheatsheet]] open in another pane (yes, already).

---

## 1. Install

| Platform | Command |
|----------|---------|
| Debian/Ubuntu | `sudo apt install tmux` |
| Fedora | `sudo dnf install tmux` |
| Arch | `sudo pacman -S tmux` |
| macOS | `brew install tmux` |
| Windows | **Use WSL** — tmux is a Unix-pty tool; run it inside `wsl` (WSL2 + Windows Terminal recommended) |

Current stable: **tmux 3.7c** (Aug 2026; 3.7 added *floating panes*, 3.6 added scrollbars and better clipboard/theme queries, 3.5 revamped extended keys). Check: `tmux -V`.

```bash
tmux                        # start a session (auto-names it)
tmux new -s work            # start named session
tmux ls                     # list sessions
tmux attach -t work         # reattach (alias: tmux a -t work)
tmux kill-session -t work   # destroy one
```

## 2. The mental model (four nouns)

```
server (one per user; holds everything)
 └── client (your terminal, attached or not)
      └── session (a named workspace that persists)
           └── window (a tab: one layout of panes)
                └── pane (a split: one running shell each)
```

- **Detach ≠ exit.** `prefix d` leaves; everything keeps running. Close the SSH window — still running. Reattach from anywhere: `tmux a -t work`.
- Buffers (copy mode's clipboard) also persist across detach.
- Everything is addressable: `-s session`, `-t window`, `-p pane` — e.g. `tmux send-keys -t work:2.1 'ls' Enter`.
- One server per user by default; `tmux ls` talks to it (or says "no server running").

> [!tip] The one-sentence version
> Your shell is a process; SSH is a cable. tmux moves the process off the cable onto a server you control.

## 3. Survival keys (the prefix)

tmux commands from the keyboard start with a **prefix key**, default `C-b`. Most people rebind to **`C-a`** (easier reach; also what screen veterans expect) — see §7.

| Key | Action |
|-----|--------|
| `prefix` `d` | **Detach** (come back with `tmux a`) |
| `prefix` `c` | New window |
| `prefix` `d`… then `tmux ls` | Find your sessions again |
| `prefix` `s` | Session picker (switch interactively) |
| `prefix` `w` | Window/pane picker (all sessions) |
| `prefix` `%` / `"` | Split horiz / vert |
| `prefix` arrows or `prefix` `o` | Move between panes |
| `prefix` `[` | Copy mode (scroll!) |
| `prefix` `?` | List all key bindings |

If lost: `tmux ls` in a fresh terminal, `tmux a` back in.

## 4. Sessions — the SSH insurance policy

```bash
tmux new -s deploy          # named session for a task
# ... run a 2-hour pipeline ...
# network dies. Reconnect 40 minutes later:
tmux a -t deploy            # exactly where you left off

tmux new -A -s main         # "attach if exists, else create" — ideal for shell rc
tmux ls                     # list with names, sizes, activity
tmux rename-window 'etl'    # rename current window (prefix , does this too)
tmux kill-session -t deploy # cleanup when done
tmux switch-client -t main  # switch from inside tmux (prefix s does this)
```

### Conventions worth adopting
- **One session per project**: `tmux new -s second_brain` when you start the day.
- Name windows by role (`vim`, `server`, `logs`, `shell`), not by tool order.
- `prefix s` to hop sessions; don't keep 15 unnamed `0`, `1`, `2` sessions.
- On servers: add to `~/.bashrc` — `[[ -z "$TMUX" ]] && tmux new -A -s main` → attach-or-create on every login (exits you to shell if you deliberately quit tmux).

## 5. Windows and panes — arrange your views

### Windows (tabs)
| Key | Action |
|-----|--------|
| `prefix c` | New window |
| `prefix ,` | Rename window |
| `prefix 0–9` | Go to window N |
| `prefix n` / `p` | Next / previous window |
| `prefix w` | Visual window list |
| `prefix &` | Kill window (asks) |
| `prefix f` | Find window by name |

Automatic naming: window names follow the running command by default (3.x); `prefix ,` to override, `set -g automatic-rename on` to restore.

### Panes (splits)
| Key | Action |
|-----|--------|
| `prefix %` | Split left/right (vertical divider) |
| `prefix "` | Split top/bottom |
| `prefix arrow` | Move to pane in that direction |
| `prefix o` | Cycle panes |
| `prefix q` | Show pane numbers (then digit to jump) |
| `prefix {` / `}` | Swap pane with previous/next |
| `prefix z` | **Zoom** pane (toggle full-screen) — the unsung hero |
| `prefix !` | Break pane out into its own window |
| `prefix x` | Kill pane |
| `prefix ;` | Last active pane |
| `prefix arrows` / `prefix H/J/K/L` | Resize (repeatable; add `-r` in config to hold prefix) |
| `prefix t` | Clock |
| `prefix *` (3.7+) | Floating pane via `new-pane` — pop a pane above the layout |

Layouts: `prefix Space` cycles presets (even-horizontal, main-horizontal, tiled…). `main-horizontal` mirrored variants exist since 3.5.

**Broadcast mode** (run one command in all panes): `prefix :` type `set -w synchronize-panes on` — brilliant for repeating installs across servers; **turn it off** the moment you're done (`off`).

## 6. Copy mode — scrolling and yanking

Terminals scrollback lies to you (alt-screen apps, cleared buffers); tmux copy mode reads the pane's real buffer.

| Key | Action |
|-----|--------|
| `prefix [` | Enter copy mode (defaults to **emacs** keys — set `mode-keys vi` in §7 for hjkl) |
| `q` | Exit copy mode |
| `/` `?` | Search in buffer |
| `Space` (vi) / `v` (emacs) | Begin selection |
| `Enter` | Copy selection to tmux buffer |
| `prefix ]` | Paste tmux buffer |
| `prefix =` | Choose from clipboard buffers |
| `mouse` (if on) | Drag to select → auto-copy (with `set -g mouse on` + copy-mode mouse) |

System clipboard integration (Linux/macOS): use the **tmux-yank** plugin (§8), or OSC52 on capable terminals. On servers where clipboard is useless, tmux buffers still work — copy on the remote, `prefix ]` pastes on the remote.

Capture whole pane to file (great for logs/CI):

```bash
tmux capture-pane -p -t work:0.1 > pane.txt          # visible lines
tmux capture-pane -p -S - -t work:0.1 > full.txt     # -S - : entire history
```

## 7. Configuration — `~/.tmux.conf`

Reload with `prefix :` → `source-file ~/.tmux.conf` (bind that to `prefix r`).

```bash
# ~/.tmux.conf — sensible modern baseline (tmux 3.x)
set -g prefix C-a               # friendlier prefix
unbind C-b
bind C-a send-prefix            # C-a C-a sends C-a to inner program

set -g mouse on                 # click to switch, drag to resize, wheel to scroll
set -g escape-time 10           # don't lag your editor's Esc (default is already 10 in 3.5+)
set -g history-limit 50000      # bigger scrollback
set -g base-index 1             # windows start at 1 (and:)
set -w -g pane-base-index 1    # panes start at 1
set -g renumber-windows on      # keep window numbers tidy
set -g default-terminal "tmux-256color"
set -ga terminal-overrides ",*256col*:Tc"   # true color

setw -g mode-keys vi            # vi keys in copy mode
bind | split-window -h -c "#{pane_current_path}"   # | and - split, cwd-aware
bind - split-window -v -c "#{pane_current_path}"
bind r source-file ~/.tmux.conf \; display "reloaded"
bind h select-pane -L           # C-a h/j/k/l like vim/tmux-navigator
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# resize without holding prefix
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# quick logs: pipe pane output to a file (prefix P)
bind P pipe-pane -o "cat >> /tmp/tmux-#W.log" \; display "toggled logging to /tmp/tmux-#W.log"
```

Keep `~/.tmux.conf` in git — it's dotfile material ([[Linux_Terminal_Toolkit#9. Safety checklist (print this)|dotfile hygiene]]).

## 8. Plugins (TPM)

**TPM** (tmux-plugins/TPM):

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
# then in ~/.tmux.conf:
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'    # sane defaults
set -g @plugin 'tmux-plugins/tmux-resurrect'   # save/restore sessions (files, panes)
set -g @plugin 'tmux-plugins/tmux-continuum'   # auto-save every 15 min
set -g @plugin 'tmux-plugins/tmux-yank'        # system clipboard copy
set -g @plugin 'tmux-plugins/tmux-navigator'   # C-h/j/k/l crosses vim/nvim/pane
set -g @plugin 'tmux-plugins/tmux-pain-control' # more pane bindings
# at bottom of config:
run '~/.tmux/plugins/tpm/tpm'
```

Install/reload: `prefix I` (capital i) installs; `prefix U` updates.

- **resurrect** (prefix `Ctrl-s` save, `prefix Ctrl-r` restore) + **continuum** (auto) means *reboots* stop losing your layout — restore apps, windows, panes (and optionally vim/nvim sessions).
- **tmux-navigator** makes `C-h/j/k/l` seamless across Neovim splits and tmux panes — pair with the Neovim plugin by the same author (see [[Neovim_Tutorial]] §5 keymaps).
- Resist plugin sprawl: sensible + resurrect + yank + navigator covers 95% of needs.

## 9. Recipes — why you're really here

### 9.1 Survive SSH (the killer use case)
```bash
ssh server
tmux new -s work      # do work inside
# laptop sleeps / wifi dies / ssh times out
ssh server && tmux a -t work     # identical state back
```

### 9.2 Project cockpit
```bash
tmux new -s second_brain \; \
  send-keys 'nvim' Enter \; \
  split-window -h \; send-keys 'git status' Enter \; \
  split-window -v \; send-keys 'npm run dev' Enter \; \
  select-pane -t 1
```
Save it as a script, or graduate to **tmuxinator**/**spm** project templates (`tmuxinator start project.yml`) for declarative layouts.

### 9.3 Watch logs like a pro
```bash
prefix |                     # toggle pipe-pane logging of this window
tmux pipe-pane -o 'tee -a /tmp/job.log'   # log + still see output
# inside a pane:
tail -f app.log | grep --line-buffered ERROR     # or use less +F
watch -n1 'docker ps'                            # polling in a pane
```

### 9.4 Long jobs that must not die
```bash
# inside tmux (preferred):
run_pipeline.sh 2>&1 | tee pipeline.log
# belt and suspenders (outside tmux):
nohup ./run_pipeline.sh > pipeline.log 2>&1 & disown
```
tmux already survives disconnect; `nohup`/`setsid` is for when tmux isn't available.

### 9.5 Editor pairing
`tmux + Neovim`: `prefix %` = code left, logs right; tmux-navigator unifies pane movement; `prefix z` zooms the code pane when you need flow state. (Emacs users: Emacs' own `C-x b`/frames cover much of this, but tmux still wraps the terminal — see [[Emacs_Tutorial]].)

### 9.6 Scripting tmux (automation)
```bash
tmux new-session -d -s ci 'bash -c "./ci.sh 2>&1 | tee ci.log; tmux wait-for -S ci_done"'
tmux wait-for ci_done
tmux capture-pane -p -t ci | tail -20
```
`send-keys`, `wait-for`, `capture-pane` = poor man's CI runner. For anything serious use CI proper — but for "kick off 4 jobs across panes and check them", tmux scripting is unbeatable.

## 10. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | Sessions: create, detach, kill, reattach (§4) | Survive a deliberate SSH drop with work intact |
| 2 | Prefix + windows/panes (§3, §5) | Build a 3-pane cockpit without touching arrows |
| 3 | Copy mode + scroll (§6) | Find a log line from 10k lines back, copy it |
| 4 | Config baseline (§7), rebind prefix, mouse on | Reload config live with `prefix r` |
| 5 | TPM + resurrect/continuum/navigator (§8) | Reboot, restore, keep working |
| 6 | Recipes (§9): project cockpit + logging | One saved layout per active project |
| 7 | `tmux send-keys`/`capture-pane` script | A 5-line script runs a job and prints its tail |

- [ ] Phase 1 …
- [ ] Phase 4 …
- [ ] Phase 7 …

### When stuck

| Problem | Fix |
|---------|-----|
| "Nothing happens when I type" | You're inside tmux but forgot the prefix; or you're in copy mode (`q` exits) |
| "I'm detached and lost" | Fresh terminal → `tmux ls` → `tmux a -t NAME` |
| "Esc is slow in vim/nvim" | `set -g escape-time 10` (already low in 3.5+) |
| "Can't scroll" | `prefix [` or just use mouse wheel with `set -g mouse on` |
| "Colors look wrong in nvim" | `default-terminal tmux-256color` + truecolor overrides (§7); run `tmux doctor` |
| "Config change didn't apply" | `source-file ~/.tmux.conf`; some options need a new pane/window |
| "Session vanished after reboot" | Expected — add resurrect+continuum (§8) |
| "Paste pastes garbage" | Set vi copy mode, use tmux-yank, or `prefix ]`; in editors disable bracketed paste confusion (`set -g set-clipboard`) |
