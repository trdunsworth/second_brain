---
type: cheatsheet
topic: tmux key bindings, commands, and config reference
date: 2026-09-29
status: active
tags:
  - tmux
  - terminal
  - keybindings
  - cheatsheet
  - terminal_stuff
---

# tmux Cheatsheet

> Companion to [[Tmux_Tutorial]]. `prefix` = `C-b` by default, `C-a` in the recommended config. Type `prefix :` to run any tmux command directly. Help: `prefix ?` lists bindings; `man tmux` is excellent.

## 1. Sessions

| Command | Action |
|---------|--------|
| `tmux new -s NAME` | Create named session |
| `tmux new -A -s NAME` | Attach or create (shell-rc friendly) |
| `tmux ls` | List sessions |
| `tmux a -t NAME` | Attach (alias of `attach`) |
| `tmux kill-session -t NAME` | Kill one session |
| `tmux kill-server` | Kill everything |
| `tmux rename-session NAME` | Rename current session |
| `tmux switch-client -t NAME` | Switch from inside tmux |
| `prefix d` | Detach |
| `prefix s` | Session picker |
| `prefix $` | Rename session |

## 2. Windows

| Key | Action |
|-----|--------|
| `prefix c` | New window |
| `prefix ,` | Rename window |
| `prefix 0-9` / `prefix n` / `prefix p` | Go to N / next / previous |
| `prefix w` | Window picker (all sessions) |
| `prefix f` | Find window |
| `prefix &` | Kill window |
| `prefix l` | Last window (if not rebound to pane-left) |

## 3. Panes

| Key | Action |
|-----|--------|
| `prefix %` | Split left/right |
| `prefix "` | Split top/bottom |
| `prefix arrow` / `prefix h j k l`* | Move between panes |
| `prefix o` | Cycle panes |
| `prefix ;` | Last pane |
| `prefix q` | Pane numbers (then digit) |
| `prefix z` | Zoom / unzoom pane |
| `prefix {` / `}` | Swap with prev / next |
| `prefix !` | Break pane into window |
| `prefix x` | Kill pane |
| `prefix H J K L` / arrows | Resize (repeat with `-r`) |
| `prefix Space` | Cycle layouts |
| `prefix :set -w synchronize-panes on` | Type in all panes at once |
| `prefix *` (3.7+) | Floating pane (`new-pane`) |

\* if you install the §7-style config / tmux-navigator.

## 4. Copy mode & buffers

| Key / command | Action |
|---------------|--------|
| `prefix [` | Enter copy mode (scroll) |
| `q` | Exit copy mode |
| `/` `?` | Search forward / back in buffer |
| `Space` → move → `Enter` | Select and copy (vi mode) |
| `prefix ]` | Paste last buffer |
| `prefix =` | Choose buffer |
| `tmux capture-pane -p -S - -t win` | Dump entire pane history to stdout |
| `tmux set-buffer "text"` / `tmux show-buffer` | Set / show buffer |
| `tmux list-buffers` | All buffers |

## 5. Command-line essentials

| Command | Action |
|---------|--------|
| `prefix :` | Command prompt |
| `tmux list-keys` | All bindings (pipe to `less`) |
| `tmux show-options -g` | Global options |
| `tmux display-message '#{session_name}'` | Formats (status line language) |
| `tmux send-keys -t win:1.1 'make' Enter` | Type into another pane |
| `tmux pipe-pane -o 'tee -a log'` | Log pane output |
| `tmux respawn-pane -k 'cmd'` | Restart pane's command |
| `tmux detach-client -s other` | Detach someone else's client |
| `tmux source-file ~/.tmux.conf` | Reload config |
| `tmux info` / `tmux doctor` | Server/terminal diagnostics |

## 6. Config essentials (`~/.tmux.conf`)

```bash
set -g prefix C-a ; unbind C-b ; bind C-a send-prefix
set -g mouse on
set -g escape-time 10
set -g history-limit 50000
set -g base-index 1 ; setw -g pane-base-index 1 ; set -g renumber-windows on
set -g default-terminal "tmux-256color"
set -ga terminal-overrides ",*256col*:Tc"
setw -g mode-keys vi
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
bind r source-file ~/.tmux.conf \; display "reloaded"
```

| Option | Meaning |
|--------|---------|
| `mouse on` | Click switch, drag resize, wheel scroll |
| `escape-time 10` | No editor lag |
| `renumber-windows` | No gaps in window numbers |
| `mode-keys vi` | Vi keys in copy mode |
| `history-limit` | Scrollback size |
| `synchronize-panes` (window opt) | Broadcast input |

## 7. Plugins (TPM)

| Binding / cmd | Action |
|---------------|--------|
| `prefix I` | Install plugins |
| `prefix U` | Update plugins |
| `prefix Ctrl-s` / `Ctrl-r` | tmux-resurrect: save / restore |
| `tmux-resurrect` + `continuum` | Auto-restore after reboot (`set -g @continuum-restore 'on'`) |
| tmux-yank | Copy to system clipboard |
| tmux-navigator | `C-h/j/k/l` crosses nvim ↔ tmux |

## 8. Recipes

```bash
# attach-or-create in ~/.bashrc
[[ -z "$TMUX" ]] && exec tmux new -A -s main

# project cockpit in one shot
tmux new -s proj \; send-keys 'nvim' Enter \; split-window -h \; \
  send-keys 'git status' Enter \; split-window -v \; send-keys 'make watch' Enter

# run job in background session, capture tail when done
tmux new -d -s job './run.sh 2>&1 | tee job.log'
tmux capture-pane -p -t job | tail -20

# log a pane
tmux pipe-pane -o -t 1 'cat >> /tmp/pane.log'
```

## 9. Emergency reference

| Problem | Fix |
|---------|-----|
| Lost / "nothing responds" | New terminal: `tmux ls` → `tmux a -t NAME` |
| Inside copy mode accidentally | `q` |
| Esc lag in vim/nvim | `set -g escape-time 10` |
| Can't scroll | `prefix [` or enable `mouse on` |
| Colors wrong in nvim | `default-terminal tmux-256color` + Tc override; `tmux doctor` |
| Session gone after reboot | Add resurrect + continuum |
| Pasted text mangled | Use tmux-yank / `prefix ]`; check `set-clipboard` |
