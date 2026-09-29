---
type: reference
topic: Linux terminal tools with key parameters and best practices
date: 2026-09-29
status: active
tags:
  - linux
  - cli
  - terminal
  - best-practices
  - cheatsheet
  - terminal_stuff
---

# Linux Terminal Toolkit — Tools, Parameters, Best Practices

> Goal: a single reference for **which command to reach for, its parameters that matter, and how to use it safely** — classic Unix first, modern Rust/Go replacements second. Aimed at Linux (GNU coreutils) environments; macOS/BSD differences flagged inline. Pair with [[Tmux_Tutorial]] (session wrapper) and the editor notes.
> Related: [[Tmux_Cheatsheet]] · [[TUI_Programs]] (interactive tools) · [[Terminal_Fluency_Program]] (structured practice) · [[Neovim_Tutorial]] · [[Emacs_Tutorial]]

## How to use this note

1. **§1 once** — the hygiene rules that apply to every command below.
2. Keep §2–§8 as lookup: table rows = tool → **parameters you'll actually use** → best practice.
3. §10 is a 2-week adoption plan (modern tools first — they pay off fastest).

---

## 1. Command-line best practices (the universal layer)

### 1.1 Reading before typing
- `tldr cmd` (modern tools) → `man cmd` (full) → `cmd --help` (flags). Never guess a flag on a destructive command.
- `man -k keyword` / `apropos keyword` — search man pages when you don't know the tool name.

### 1.2 Quoting and expansion
```bash
grep "two words" .            # double quotes: variables expand
grep '^\s*$' file             # single quotes: literal (regex, $, *)
echo "$var"                   # always quote variables — empty vars vanish, spaces split
echo ${var:-default}          # default if unset
```
- Assume filenames contain spaces until proven otherwise: `"${file}"`, `find … -print0 | xargs -0`.
- Use `$(cmd)` not backticks. Brace expansion is not globbing: `file{1..9}.txt` (literal) vs `file*.txt` (pattern).

### 1.3 Exit codes and control flow
```bash
cmd && next                   # run only if previous succeeded
cmd || echo "failed"          # run only on failure
echo $?                       # last exit code (0 = success)
```
In scripts: `set -euo pipefail` (exit on error/unset var/pipe failures), `trap 'cleanup' EXIT`.

### 1.4 Safety before destructive actions
| Rule | Practice |
|------|----------|
| Preview first | `rsync -n` (`--dry-run`), `find … ! -delete` → review → add `-delete` |
| Prefer overwrite-protection | `mv -n`, `cp -n` (GNU) / `cp -i` interactive |
| Back up what you mutate | `cp -a file file.bak-$(date +%F)` |
| Guard `rm` | Never `rm -rf "$dir"` without `: "${dir:?}"` check; no glob-expanding bare vars |
| Redirect root writes | `echo x \| sudo tee -a /etc/hosts` (not `sudo > file`) |
| One-shot in a container first | When scripting against prod data, dry-run against a copy |

### 1.5 I/O plumbing
```bash
cmd > out.txt 2> err.txt      # separate streams
cmd > out.txt 2>&1            # both to file (order matters!)
cmd &> everything             # bash shorthand for above
cmd 2>/dev/null               # silence errors
cmd | tee -a log.txt          # show AND append to file
cmd | less                    # long output → pager (q quits, / searches)
less +F logfile               # live-follow like tail -f, Ctrl-C to search
command -v grep               # "is it installed? where?" (use instead of `which`)
```
- Redirection order matters: `2>&1 >file` is wrong; `>file 2>&1` (or `&>file`) is right.

### 1.6 Scripts
```bash
#!/usr/bin/env bash           # portable interpreter lookup
set -euo pipefail
IFS=$'\n\t'
readonly LOG=/tmp/job.log
main() { … }
main "$@"                     # quoted "$@" preserves args
```
- **ShellCheck everything**: `shellcheck script.sh` (and `shfmt -w` for formatting).
- Aliases don't expand in non-interactive shells — put real logic in **functions** or **scripts on PATH** (`~/bin`), not aliases.
- `time cmd` for one-off timing; `hyperfine` for real comparisons (§3).

### 1.7 Secrets & hygiene
- Never put tokens/passwords in argv (visible in `ps`); use env vars, files with `0600`, or `read -rsp`.
- ssh: keys (`ed25519`), `ssh-keygen -t ed25519 -C "host"`, agent or `IdentityFile` in `~/.ssh/config`.
- `history` with `HISTCONTROL=ignoreboth` (no dupes, no leading-space secrets); **Atuin** (§3) for SQLite history.

## 2. Core Unix tools — parameters that matter

### 2.1 Files & navigation
| Tool | Key parameters | Example / practice |
|------|----------------|--------------------|
| `ls` | `-l` long, `-a` hidden, `-h` human sizes, `-t` by time, `-R` recursive | `ls -lht` = newest first, human sizes |
| `cd` | `-` (previous dir), `OLDPWD` | `cd -` jumps back; `cd ~/src/proj` |
| `cp` | `-a` archive (attrs, links), `-r` dirs, `-p` preserve, `-n` no-clobber | `cp -a db db.bak-$(date +%F)` |
| `mv` | `-n` don't overwrite, `-i` ask, `-v` verbose | preview with `mv -vn` (GNU shows would-move) |
| `rm` | `-r` recursive, `-i` ask, `-v` verbose, `-f` force | list first: `find dir -name '*.tmp' -print` |
| `mkdir` | `-p` parents, `-v` | `mkdir -p a/b/c` |
| `ln` | `-s` symbolic, `-sf` replace link | `ln -s ~/src/repo ~/dev/repo` (relative targets survive moves better) |
| `touch` | `-t` timestamp | create empty / update mtime |
| `stat` | file metadata, `%` formats | `stat -c '%y %s %n' *` |
| `file` | identify type | `file mystery.bin` |
| `tree` | `-L` depth, `-d` dirs only, `-I` ignore | `tree -L 2 -I node_modules` (or `eza --tree`) |

### 2.2 Finding things
| Tool | Key parameters | Example / practice |
|------|----------------|--------------------|
| `find` | `-name/-iname`, `-type f/d`, `-size`, `-mtime/-atime`, `-maxdepth`, `-perm`, `-empty`, `-newer ref`, `-path/-not -path`, `-exec/-delete`, `-print0` | `find . -maxdepth 3 -type f -name '*.log' -mtime +30 -delete` — **check with -print first** |
| `grep` | `-r` recurse, `-i` ignore case, `-n` line numbers, `-E` ERE, `-w` whole word, `-v` invert, `-c` count, `-l/-L` files-with/without, `-A/-B/-C` context, `--include/--exclude`, `-m1` stop after N, `-P` PCRE, `-q` quiet (for `if grep -q`) | `grep -rn --include='*.py' 'TODO' src/` |
| `which` → | `command -v` | portable "does it exist" |
| `man -k` / `apropos` | search man descriptions | `apropos 'copy file'` |

> [!tip] For huge trees or regex-heavy searches, jump to **ripgrep** (§3) — same mental model, much faster.

### 2.3 Text processing
| Tool | Key parameters | Example / practice |
|------|----------------|--------------------|
| `sed` | `s/old/new/g`, `/re/ cmd`, `-i` in-place (`-i.bak` = backup first), `-n`+`p` quiet print, `-e` multiple exprs, `\1` refs | `sed 's/old/new/g' f`; `sed -n '10,20p' f`; `sed -i.bak 's/\r$//' f` (strip CRLF) |
| `awk` | `$1…$n` fields, `/re/{…}`, `BEGIN/END`, `-F` field sep, `print`/`printf` | `awk -F: '{print $1, $3}' /etc/passwd`; `awk '{s+=$1} END {print s}' nums.txt` |
| `sort` | `-n` numeric, `-h` human sizes, `-r` reverse, `-u` unique, `-k` key, `-t` separator, `-c` check sorted, `-o` output | `du -sh * \| sort -h` ; `sort -t$'\t' -k3,3nr data.tsv` |
| `uniq` | `-c` count, `-d` dupes only, `-u` unique only | `sort f \| uniq -c \| sort -rn` = frequency table |
| `cut` | `-d` delim, `-f` fields, `-c` chars | `cut -d, -f1,3 data.csv` |
| `tr` | translate/delete chars | `tr -d '\r' < f`; `tr 'a-z' 'A-Z'` |
| `wc` | `-l` lines, `-w` words, `-c` bytes | `wc -l < file` |
| `head`/`tail` | `-n N`, `tail -f` follow, `tail -n +5` from line 5, `-F` follow by name | `tail -f /var/log/syslog` |
| `tee` | `-a` append | `cmd \| tee out.txt` (tee: write to file *and* stdout) |
| `diff` | `-u` unified, `-r` recursive, `-q` brief | `diff -u old new` (or `delta`) |
| `xargs` | `-0` null input, `-I{}` replace, `-P N` parallel, `-n N` per-cmd, `-p` ask each | `find . -name '*.log' -print0 \| xargs -0 rm -f`; `… \| xargs -P8 -I{} gzip {}` |
| `printf` | portable formatting | `printf '%-20s %s\n' "$name" "$val"` (better than `echo -e` in scripts) |

`sed`/`awk` on macOS are BSD-flavored (no `-i` without suffix, different regex) — Linux/GNU assumed here.

### 2.4 Archives & transfers
| Tool | Key parameters | Example / practice |
|------|----------------|--------------------|
| `tar` | `-c` create, `-x` extract, `-t` list, `-z` gzip, `-j` bz2, `-J` xz, `-f` file, `-C` dir, `-v` verbose, `--strip-components=N` | `tar -czf backup.tar.gz dir/`; `tar -xzf b.tgz -C /opt --strip-components=1` — **list with `-tf` before extracting unknown archives** |
| `gzip`/`zstd` | `-k` keep, `-d` decompress, `-9` level | `zstd -T0 file` for fast large-file compression |
| `scp` | `-P` port, `-r` recursive | prefer **rsync over ssh** (resumable) |
| `rsync` | `-a` archive, `-v` verbose, `-z` compress, `--delete`, `--dry-run`/`-n`, `--exclude`, `--progress`, `--stats`, `-e ssh`, `--remove-source-files` | `rsync -avzn --delete src/ host:/dst/` → drop `n` when satisfied |

### 2.5 Permissions & users
| Task | Command | Notes |
|------|---------|-------|
| Readable by all | `chmod -R a+rX dir` | capital `X` = dirs/executables only — the safe recursive grant |
| Octal modes | `chmod 644 f`, `chmod 755 script`, `chmod 600 ~/.ssh/id_ed25519` | owner rw / group r / other r |
| Ownership | `sudo chown -R user:group dir` | use sparingly on big trees |
| Sudo with env | `sudo VAR=x cmd`, `sudo -E` | not `VAR=x sudo cmd` (var dies before sudo) |
| Root write | `echo new \| sudo tee -a file` | redirection happens as *you* |
| Effective PATH lookup as root | `sudo -i` (login shell) vs `sudo cmd` | know which you mean |

## 3. Modern replacements (install these)

Debian/Ubuntu gotchas: package `fd-find` installs binary as **`fdfind`** (alias `fd=fdfind`); package `bat` installs **`batcat`** (alias `bat=batcat`). eza often needs cargo or a PPA.

```bash
sudo apt install ripgrep fd-find bat fzf jq yq tldr btop ncdu zoxide   # available
cargo install eza dust duf procs sd choose                            # latest via cargo
# or one-shot: bash <(curl -fsSL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh)
```

| Tool | Replaces | Key parameters | Best practice |
|------|----------|----------------|---------------|
| **ripgrep** `rg` | grep | `-i`, `-t py` type, `-g '*.js'` glob, `-w` word, `-l` files, `-c` count, `-A/-B/-C`, `-uu` include hidden+ignored, `--files` list, `-F` fixed string, `-r` replace, `--max-count 1` | Default search everywhere; respects `.gitignore` (that's the point). Use `-uu` when you *mean* everything (secrets hunt) |
| **fd** | find | `-e py` ext, `-t f/d`, `-d 3` depth, `-H` hidden, `-I` ignore .gitignore, `-s/-i` case, `-x cmd {} +` exec, `-0` null | Sensible defaults (gitignore, parallel, colors); `-x` beats `-exec` for speed/ergonomics |
| **fzf** | — (interactive filter) | `--preview 'bat -n {}'`, `--multi`, `--height 40%`, `--bind`, `--filter` (non-interactive), `-q` initial query | Pipe *anything* in: `git branch \| fzf \| xargs git checkout`. Bind `Ctrl-R` history + `Ctrl-T` files (`fzf --zsh`/`--bash` in rc) |
| **bat** | cat | `--language`, `--style=numbers`, `--diff` (diff mode), `--theme`, `--paging=never` (for pipes) | `bat` = view; `cat` = concatenate. In pipelines add `--paging=never` |
| **eza** | ls | `-l` long, `-a` all, `-h` human, `--git`, `--icons`, `-T` tree, `-L N` depth, `--sort=size\|modified`, `--group-directories-first` | `alias ls='eza --group-directories-first'`, `ll='eza -lah --git'`, `lt='eza --tree -L 2'`. Needs Nerd Font for icons (exa is dead; eza is the fork) |
| **zoxide** | cd | `z pattern` jump, `zi` interactive pick, `zoxide add/remove/query` | Add `eval "$(zoxide init bash)"` to rc; `z second` ≈ `cd ~/projects/second_brain`. Frecency-learned |
| **delta** (git-delta) | git diff pager | config: `git config --global core.pager delta`, `interactive.diffFilter 'delta --color-only'`, `merge.conflictstyle zdiff3`, `delta --side-by-side --line-numbers` | Syntax-highlighted diffs everywhere `git diff` appears (also inside lazygit) |
| **jq** | — (JSON) | `-r` raw, `.path`, `.[]`, `select()`, `map()`, `keys`, `length`, `-c` compact, `-s` slurp, `--arg k v`, `-e` exit code, `//` default | Every API response: `curl -s … \| jq '.items[] \| {id, name}'`. `-r` for plain strings into shells |
| **yq** | sed for YAML | `'.a.b'`, `-i` in-place (mikefarah/go version), `eval-all`, `-o=json` convert | K8s/CI configs: `yq '.spec.containers[].image' pod.yaml` |
| **sd** | sed (simple cases) | `sd 'pattern' 'replacement' file` | Intuitive find-replace; no delimiters/flags to remember |
| **choose** | cut | `choose 0 2-4 -d ':'` | Readable field selection (0-based) |
| **dust** | du | `-n 20` top N, `--invert`, `-b` bytes | "What's eating disk?" in one glance |
| **ncdu** | du+analysis | `-e` extended, delete inside UI | Interactive disk audit; `-x` stay on one filesystem |
| **duf** | df | `--sort size` | Pretty `df` |
| **btop** / **htop** | top | btop: mouse, `q`; htop: `F5` tree, `F9` kill, `F4` filter | Keep `btop` open in a [[Tmux_Tutorial\|tmux]] pane on servers |
| **procs** | ps | search by name/port | Colorized, tree view |
| **lazygit** | git CLI (UI) | keys: `space` stage, `c` commit, `r` rebase menu, `/` filter | Great for conflict surgery and wip commits; still learn plain git for scripts |
| **gh** | GitHub web | `gh pr create/checkout/view`, `gh issue list`, `gh repo clone`, `gh run watch` | `gh pr checkout 123`, `gh pr checks --watch` |
| **tldr** | man | `tldr tar` | Example-first help when you know the task but not the flags |
| **hyperfine** | time | `'cmd1' 'cmd2'`, `-r 10` runs, `--warmup 3`, `--prepare`, `--export-json` | Rigorous tool/machine comparisons (median ± stddev) |
| **httpie** `http` / **xh** | curl (human APIs) | `http GET url key==value`, `-A user:pass` auth, `--json` body, `-v`, `--session s.json` cookies | Debugging APIs readably; `xh` = faster compatible clone |
| **glow** | cat (markdown) | `glow file.md`, `-p` pager | Read READMEs/notes in-terminal |
| **yazi** / **broot** | ranger/ls | yazi: vi keys, `y` yank, `p` paste; broot: `:tree` | Visual file management with previews (yazi) / tree+fuzzy (broot) |
| **Atuin** | shell history | `Ctrl-R`, search by host/dir, sync | SQLite history with full-text search — `atuin import bash` once |
| **starship** | static prompt | `eval "$(starship init bash)"` | Fast cross-shell prompt (git, langs, duration) |
| **mise** (ex-rtx) | nvm/pyenv/… | `mise use node@22`, `mise install`, `mise ls` | Per-project tool versions (node, python, go, rust) via `mise.toml` |
| **uv** | pip/pipx/venv | `uv venv`, `uv pip install x`, `uv add pandas`, `uv run script.py`, `uvx ruff` | The current default for Python envs — fast, reproducible; **don't** `pip install` into system Python |
| **just** | Make (simpler) | `just recipe arg`, `just --list` | Project command runner via `justfile` |
| **watchexec** | watch loop | `watchexec -e py -- pytest` | Re-run on file change (respects gitignore with `-g`) |
| **tokei** | wc (code) | `tokei`, `-t` type | Lines of code per language |
| **lnav** | less (logs) | open syslog/auth logs auto-tail | Structured log viewer for multi-file hunting |

## 4. Data-in-the-terminal recipes

```bash
# Frequency table (classic)
sort access.log | uniq -c | sort -rn | head

# Column from CSV (mind quoted commas — use mlr/csvkit for real CSV)
cut -d, -f2 data.csv
mlr --csv cut -f name,amount data.csv            # Miller: proper CSV/TSV/JSON toolbox
mlr --csv filter '$amount > 100' then stats1 -a mean -f amount data.csv

# JSON from an API → plain values
curl -s https://api.example.com/items | jq -r '.[] | select(.active) | .name'

# JSON → TSV table
jq -r '["name","size"], (.[] | [.name, .size]) | @tsv' listing.json

# YAML → JSON (for jq pipelines)
yq -o=json deploy.yaml | jq '.spec.replicas'

# Extract, transform, load in one pipeline
cat events.jsonl | jq -c 'select(.type=="purchase") | {user: .uid, amt: .amount}' \
  | awk '{s[$1]+=$2} END {for (u in s) print u, s[u]}' | sort -k2 -rn > ltv.tsv

# Safe batch rename (examples; f2/rename for anything non-trivial)
for f in *.jpeg; do mv -n "$f" "${f%.jpeg}.jpg"; done
```

- Line-delimited JSON (`jq -c`, one object per line) + `rg` for filtering is a superb log pattern.
- Big files: `rg` (search), `mlr`/`xsv` (tabular), `duckdb` for SQL over files — see [[duckdb_notes|duckdb_notes]].

## 5. Networking

| Tool | Key parameters | Example / practice |
|------|----------------|--------------------|
| `curl` | `-I` headers only, `-o` output file, `-L` follow redirects, `-sS` silent-but-errors, `-w` metrics, `--retry N`, `-X` method, `-H` header, `-d` data, `-u` auth, `-T` upload, `--fail` (exit ≠0 on 4xx/5xx) | `curl -fsSL -o out.tgz https://…/v1.2.tar.gz`; timing: `curl -o /dev/null -w 'dns:%{time_namelookup} ttfb:%{time_starttransfer} total:%{time_total}\n' url` |
| `wget` | `-c` continue, `-r` recursive, `-q`, `-O -` | bulk/site mirroring; prefer curl for APIs |
| `ssh` | `-i` key, `-p` port, `-J host` jump, `-L l:host:r` local fwd, `-R` remote fwd, `-D` SOCKS, `-N` no cmd, `-n` no stdin, `-o Opt=val` | `ssh -J bastion user@internal`; tunnel: `ssh -N -L 5432:db:5432 user@jump` |
| ssh config | `Host`/`HostName`/`User`/`Port`/`IdentityFile`/`ControlMaster auto`/`ControlPath`/`ControlPersist 10m` | Aliases + connection multiplexing = fast repeated logins |
| `rsync` | see §2.4 | over ssh by default: `rsync -avz --delete src/ host:dst/` |
| `ss` | `-tulpn` (tcp/udp/listening/processes) | `ss -tulpn \| grep :8080` (netstat deprecated) |
| `ip` | `a`/`addr`, `r`/`route`, `link` | `ip -br a`, `ip r` (ifconfig deprecated) |
| `dig`/`host` | `+short`, `@resolver`, `MX`/`TXT` type | `dig +short example.com @1.1.1.1` |
| `ping`/`mtr` | `mtr -rw host` (report mode) | mtr = ping+traceroute continuous |
| `nc` (netcat) | `-zv` port scan-check, `-l` listen | `nc -zv host 443`; debugging pipes (careful on prod) |
| `nmap` | `-sV`, `-p-`, `-sn` ping sweep | only on networks you own/have permission for |

**Best practice:** prefer `curl` for APIs (scriptable exit codes with `--fail`), keep tunnels in [[Tmux_Tutorial|tmux]] (`ssh -N -L …` in a pane), never pass passwords on argv.

## 6. Processes & system

| Task | Command | Key parameters / notes |
|------|---------|------------------------|
| List processes | `ps aux` / `ps -ef` | `ps aux --sort=-%mem \| head`; tree: `ps auxf` |
| Find PID | `pgrep -af name` | `-a` shows full command line |
| Kill | `kill -TERM PID` → `kill -KILL PID` | **TERM first, KILL after grace period**; `pkill -f pattern` (careful: regex on full cmdline) |
| Live view | `btop` / `htop` | sort by mem/cpu, kill from UI, tree view |
| Watch a command | `watch -n2 -d cmd` | `-d` highlights changes |
| Service control | `sudo systemctl start/stop/restart/enable/status NAME` | `systemctl list-units --failed`; config edits → `daemon-reload` |
| Logs | `journalctl -u NAME -f -n 100` | `--since "1 hour ago"`, `-p err`, `journalctl -b` (this boot) |
| Open files/ports | `lsof -i :PORT`, `lsof +D dir` | who holds the port before you kill it |
| Memory | `free -h` | `available` column ≠ `free` (page cache is reclaimable) |
| Disk | `df -h -x tmpfs`, `du -sh dir/*` | `-x` excludes tmpfs; use **dust/ncdu** for the interactive version |
| Uptime/load | `uptime`, `cat /proc/loadavg` | load > ncores×1 sustained = investigate (vmstat, iostat) |
| Strace a hang | `strace -p PID -f -e trace=network` | or `strace -c cmd` for syscall summary |
| Environment | `env`, `printenv PATH`, `export VAR=x` | `VAR=x cmd` scopes to one command |

## 7. Package managers

| Distro family | Install | Update | Remove | Search/Info |
|---------------|---------|--------|--------|-------------|
| Debian/Ubuntu | `sudo apt install pkg` | `sudo apt update && sudo apt upgrade` (`-y` to confirm) | `sudo apt remove pkg` / `purge` (also config) | `apt search pkg`, `apt show pkg` |
| Maintenance | `sudo apt autoremove` | `sudo apt full-upgrade` (handles held-pkg removals) | `dpkg -i file.deb`, `apt -f install` (fix deps) | `apt list --upgradable` |
| Fedora/RHEL | `sudo dnf install pkg` | `sudo dnf upgrade` (`-y`) | `sudo dnf remove pkg` | `dnf search`, `dnf info` |
| Arch | `sudo pacman -S pkg` | `sudo pacman -Syu` (**always full**, partial upgrades break) | `sudo pacman -Rns pkg` | `pacman -Ss`, `pacman -Qi` |
| macOS | `brew install pkg` | `brew update && brew upgrade` | `brew uninstall pkg` | `brew info`, `brew search` |

**Best practices:** install with `apt install --no-install-recommends` on servers (lean images); `autoremove` monthly; never mix pip packages into system Python (use `uv`/`pipx`); pin versions in scripts (`apt-get install -y pkg=1.2.3` for reproducible builds); use `apt-get` (not `apt`) inside scripts — machine-readable, stable CLI.

## 8. Shell productivity

| Technique | How |
|-----------|-----|
| History done right | `export HISTCONTROL=ignoreboth`, `export HISTSIZE=100000`, `shopt -s histappend` — or install **Atuin** and get search across machines |
| Re-run last cmd | `!!` (esp. `sudo !!`), edit-last: `fc` |
| Re-run with substitution | `^old^new^` |
| Fuzzy history/files | fzf `Ctrl-R` / `Ctrl-T` / `Alt-C` bindings in rc |
| Shell functions | `mkcd() { mkdir -p "$1" && cd "$1"; }` — beats an alias |
| Job control | `cmd &`, `jobs`, `fg %1`, `bg`, `disown` — but long jobs belong in [[Tmux_Tutorial\|tmux]] |
| Parallel batch | `find … -print0 \| xargs -0 -P8 -I{} sh -c 'process "$1"' _ {}` or GNU `parallel` (`parallel -j8 ::: *.log`) |
| Snippets of output | `cmd \| tee result.txt`, command substitution `out=$(cmd)` with `"$out"` |
| Reusable one-liners | Keep a personal `~/.local/bin` + dotfiles repo; promote repeated history to a function/script |
| Tab completion | bash-completion package; `complete -F` custom; zsh/fish stronger — pick and commit |
| Prompt | **starship** (cross-shell, fast) |
| Portable edits | `fc -e vim` to edit last command in your editor |

## 9. Safety checklist (print this)

- [ ] Quoted every `"$var"` and `"${arr[@]}"`?
- [ ] Paths from `find` piped with `-print0 | xargs -0`?
- [ ] Destructive command **previewed** (`-n`/`-print`/`-v`) before executed?
- [ ] `2>&1` in the right order; stderr not silently lost?
- [ ] `command -v` (not `which`) in conditionals; scripts start `set -euo pipefail`?
- [ ] ShellCheck clean before any script touches prod?
- [ ] Secrets via env/files, never argv; no tokens in shell history (leading-space trick or Atuin)?
- [ ] Long-running/SSH work inside tmux (survives disconnect)?
- [ ] Root writes via `sudo tee`; permissions: keys `600`, scripts `755`, configs `644`?
- [ ] Exit codes checked (`&&`, `||`, `$?`) where failure must be handled?

## 10. Two-week adoption plan

| Day(s) | Do | Payoff |
|--------|----|--------|
| 1 | Install `ripgrep fd bat fzf tldr`; add fzf keybindings to rc | Immediate daily speedup |
| 2 | `eza`/`bat`/`fd` aliases; Debian alias gotchas | Muscle memory upgrade for ls/cat/find |
| 3 | `zoxide` init; stop typing full paths | Minutes/day |
| 4 | Shell history overhaul (`HISTCONTROL` + Atuin or fzf `Ctrl-R`) | Never lose a command again |
| 5–6 | `jq` for every API you touch; `yq` for configs | Scripting superpower |
| 7 | delta for git + lazygit for conflict work | Readable diffs, faster merges |
| 8 | ssh config: aliases + ControlMaster + jump hosts | Login friction → zero |
| 9 | rsync muscle memory (`-avzn` first habit) | Safe backups/syncs |
| 10 | systemd/journalctl drill on a server you own | Real ops confidence |
| 11–12 | Write one script: `set -euo pipefail`, ShellCheck, dry-run flag, logging to file with timestamps | Reusable template for all future scripts |
| 13–14 | Audit §9 checklist against your real workflows; dotfiles repo commit | Baseline locked in |

- [ ] Day 1–4 tools installed and aliased
- [ ] Day 7: delta + lazygit in use
- [ ] Day 12: first ShellCheck-clean script shipped
- [ ] Day 14: checklist audit done, dotfiles committed

### When stuck

| Question | Answer |
|----------|--------|
| "What's the modern tool for X?" | §3 table; install one at a time, not all at once |
| "Is this flag GNU or BSD?" | `man cmd` on the machine you're on; Linux assumed here |
| "Why did my pipe silently fail?" | `set -o pipefail`; check `$?` after each stage |
| "Command works manually, fails in script" | Aliases don't apply; quote vars; check PATH for non-interactive shells |
| "Too much output" | `less +F` / `rg` on a saved file / `--quiet` flags / redirect to file first |
