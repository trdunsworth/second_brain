---
type: learning-plan
topic: Terminal fluency program — 8-week bash + git track for comfortable-basic → fluent
date: 2026-09-29
status: active
tags:
  - learning-plan
  - linux
  - bash
  - git
  - terminal
  - terminal_stuff
---

# Terminal Fluency Program — 8 Weeks to Fluent (bash, dev+git)

> Goal: go from **comfortable basic** (daily pipes/find/grep, copy-paste scripts) to **fluent**: reaching for the right command without deliberation, writing scripts that fail safely, and doing all real git work from the CLI. Calibrated to **5–8 hrs/week**, **bash**, **dev + git flavored** practice. This is the structured spine; [[Linux_Terminal_Toolkit]] is the lookup table, [[TUI_Programs]] the accelerants.
> Related: [[Linux_Terminal_Toolkit]] · [[Tmux_Tutorial]] · [[Obsidian_CLI]] · [[TUI_Programs]] · [[Vim_Tutorial]] / [[Neovim_Tutorial]]

## 0. What "fluent" means (exit criteria)

You're done when these are **true under time pressure**:

| Domain | Criterion |
|--------|-----------|
| Recall | 30+ core commands/flags from memory; unknown ones resolved via `--help`/`man` in ≤30s |
| Safety | Every destructive command previewed first, *without thinking about it*; quoting is automatic |
| Text | Any "transform this text/CSV/log" task answered with a pipeline in ≤2 min |
| Scripting | 30–60 line bash script written ShellCheck-clean on first or second pass; `set -euo pipefail`, args, dry-run, logging, meaningful exit codes — by default |
| Git (CLI) | branch → commits (staged granularity) → rebase/merge → conflicts → PR via `gh` → tags → bisect → reflog recovery, no GUI needed |
| Debugging | Read an error, `echo`/`pipefail`/`$?` your way to the cause instead of retyping blindly |
| Environment | Dotfiles in git; tmux + modern tools ([[TUI_Programs]]) habitual; scripts live in `~/bin` on PATH |

## 0.1 Baseline diagnostic (do this first, 20 min)

In a scratch dir (`mkdir ~/lab && cd ~/lab && git init`). If you can do all of these comfortably, you're placed correctly; **if you ace everything, fast-forward to Phase 3**.

1. Create files `a.log b.log data.csv`, fill with content using a loop and redirection.
2. Count the 5 most frequent error strings across both logs, case-insensitively.
3. Find every `*.py` modified in the last 3 days outside `.git`, and preview deleting them.
4. Convert `data.csv` column 3 to a sorted unique list.
5. Write a script taking two args that copies files matching arg1 into a dated directory, refusing to run with no matches (exit 1).
6. In git: make a repo, 3 commits, a branch, a conflict between branches, resolve it, show a graph of what happened.
7. Pipe a command's output to `jq`… if you haven't met `jq`, note it — Phase 1 covers it.

Score: <4 → do Phase 1 anyway (it's fast); 4–6 → program as written; 7 → start at Phase 3 and compress.

## 1. Program rules (non-negotiables)

1. **5–8 hrs/week**: one **long session** (90–120 min: new material + exercise) + **5 daily drills** (15–20 min each). Miss a day, fold it into the weekend session — never skip two in a row.
2. **Hands on keyboard ≥70% of time.** Reading is homework; the program is reps.
3. **Break things on purpose** — all practice happens in `~/lab` (a git repo you can `git reset --hard` or delete). Never learn on real data.
4. **Lookup log**: every command you had to look up goes into `drills.md` in the lab repo. Friday's speed round is drilled *from your own log* — this is spaced repetition, and it's the single highest-leverage habit.
5. **Time yourself.** Fluency = speed under mild pressure. Use `time` or a stopwatch on drill sets; beat last week.
6. **One tool, one week**: nothing from [[TUI_Programs]] gets installed mid-phase except what Phase 0 names. Depth first, breadth after.
7. **Capture wins to Obsidian**: Friday's session ends with `obsidian daily:append content="- [x] week N done: <skill>"` ([[Obsidian_CLI]] §3) — the program uses its own tools.
8. Plateau rule: if a drill set stays >2× target speed for 3 sessions, drop to a smaller drill and rebuild — speed comes from chunking, not force.

## 2. Phase 0 — Setup (once, 90 min)

Do before Week 1. Everything later assumes this environment.

- [ ] **Shell**: bash confirmed (`echo $BASH_VERSION` ≥ 5); `~/.bashrc` gets: `HISTCONTROL=ignoreboth`, `HISTSIZE=100000`, `shopt -s histappend`, `export PATH="$HOME/bin:$HOME/.local/bin:$PATH"`.
- [ ] **Modern basics** installed and aliased per [[Linux_Terminal_Toolkit]] §3: `ripgrep fd bat fzf zoxide tldr` (+ Debian gotchas `fdfind`/`batcat` aliased); fzf keybindings sourced (`source /usr/share/doc/fzf/examples/key-bindings.bash` or package path; `eval "$(zoxide init bash)"`).
- [ ] **Dev kit**: `git delta jq shellcheck` + `gh` authenticated (`gh auth status`); `git config --global core.pager delta`, `merge.conflictstyle zdiff3`, sensible `init.defaultBranch main`.
- [ ] **tmux**: baseline config from [[Tmux_Tutorial]] §7 installed; detach/reattach drill done once.
- [ ] **Lab**: `~/lab` created with `git init`, `drills.md`, and a `data/` dir seeded with sample logs/CSVs you generate (see drill bank §6).
- [ ] **Dotfiles repo**: `~/.bashrc`, `~/.gitconfig`, `~/.tmux.conf` committed to a private git repo (or the lab repo with subdirs) — from today, config changes are commits.
- [ ] **Editor**: pick [[Neovim_Tutorial]] or [[Vim_Tutorial]] path — or the selection-first pair [[Helix_Tutorial]] / [[Kakoune_Tutorial]] (or emacs) — you'll write scripts in it; `EDITOR` exported in bashrc.

## 3. Weekly rhythm (the operating loop)

| Day | Block | Time | What |
|-----|-------|------|------|
| Mon | Long session A | 90–120 min | New concepts (§4 phase table) + guided exercise |
| Tue | Drill | 15–20 min | 6–10 reps from §6 drill bank (current phase) |
| Wed | Drill | 15–20 min | Same set, beat Monday's time |
| Thu | Drill | 15–20 min | New set + 2 items from your lookup log |
| Fri | Long session B | 60–90 min | Phase exercise / mini-project; **speed round** on logged lookups; `daily:append` the win |
| Sat/Sun | Flex | 0–90 min | Catch-up OR extension (article, extra project) — protect at least one rest day |

Every session opens with `tmux new -s learn` and closes with `git add -A && git commit` in `~/lab`.

## 4. The eight weeks

### Phase 1 — Core fluency (Weeks 1–2)
*Target: the daily commands become reflexive; pipelines compose without hesitation.*

**Week 1 — Navigation, files, safety**
- Concepts: absolute vs relative paths; `..`, `-`, `~`; quoting (single/double) and globbing vs regex; `$()`; exit codes; `&&`/`||`; redirection order `>file 2>&1`; `tee`; `command -v`.
- Drills: path cold-starts (`cd` to a deep dir blind using tab completion only), `stat`/`file`/`find -maxdepth`, permission octals (`chmod 644/755/600` from a written spec), preview-then-act deletes with `find -print` → `-delete`.
- Exercise: **inventory script** — `inventory.sh dir` prints file counts by extension, 10 largest files, files modified in last 7d; `--dry-run` flag does nothing but print; ShellCheck-clean; exits 1 on missing dir.

**Week 2 — The text pipeline core**
- Concepts: `grep -rnE`, `sort -rn -k`, `uniq -c`, `cut`, `wc`, `head/tail -n`, `tr`, `xargs -0 -P`, `sed -n`/`s///`, `awk` fields + `BEGIN/END`, `rg` vs `grep`, `jq` basics (`.a`, `.[]`, `select`, `-r`, `|`).
- Drills: **log forensics** (§6 set A) until ≤ target time; CSV column surgery; `jq` against a saved API JSON (`curl -fsSL` a public API once, save it, query it forever).
- Exercise: **`report.sh`** — takes a log file; prints: total lines, error count, top-5 messages, busiest minute; all one pipeline per metric; test against your own generated logs.

### Phase 2 — Scripts that don't break (Weeks 3–4)
*Target: graduate from copy-paste to authoring.*

**Week 3 — Bash structure**
- Concepts: shebang `#!/usr/bin/env bash`, `set -euo pipefail`, `IFS`, `"$@"` and quoting arrays, positional args + a `--flag` parser (manual `case` is fine), functions, `readonly`, `trap`, `local`, exit codes as API (0/1/2 usage), `local` variable pitfalls.
- Drills: refactor Phase 1 scripts to the new standard; break them deliberately (unset var, bad path) and watch `set -u`/`pipefail` catch it; run `shellcheck` until clean *without* ignoring warnings.
- Exercise: **`greet.sh`** — `greet [--upper|-u] [--times N] name…`; wrong usage → usage message + exit 2; missing name → exit 1; ShellCheck-clean; `--dry-run` echoes actions.

**Week 4 — Robustness & dev utility**
- Concepts: temp files (`mktemp` + `trap` cleanup), dry-run patterns, logging with timestamps, `read -r`, stdin vs args, arrays for paths with spaces, when to use `find -exec` vs `xargs`, cron syntax preview.
- Drills: harden `report.sh`/`greet.sh` (input validation, `--help`, temp cleanup on Ctrl-C).
- Exercise: **`newrepo.sh`** — scaffolds a project: `git init`, `.gitignore`, `README.md`, `src/`, pre-commit hook stub, initial commit; refuses non-empty dir; `--dry-run` prints the plan. (Your first git *hook* — Phase 3 goes deep.)

### Phase 3 — Git from the CLI (Weeks 5–6) ← your flavor
*Target: git becomes a keyboard instrument; the GUI/TUI becomes optional.*

**Week 5 — Daily-driver mechanics**
- Concepts: the three trees (HEAD/index/worktree) — *this one model explains 90% of git confusion*; `status -sb`; staging granularity (`add -p`, `add -i`, `restore --staged`); `commit --amend` (safe only before push), `log --oneline --graph --decorate --all -n 20`, `log -p --stat`, `log -S`/`-G` pickaxe, `show`, `diff --staged`, branch/rebase/merge, `reflog` as the undo button, `stash` (with `push -m`), tags (`-a`, signed later).
- Drills (all in `~/lab`): scripted history — build a repo with 10 commits across 3 branches, rewrite history on one, merge, resolve conflicts **by hand with `diff` + editor**, `rebase -i` to squash/reword/drop, `bisect` with a `test.sh` that fails after a planted bug (time it!), recover a "deleted" branch from reflog.
- Exercise: **feature-branch runbook as a script** — `feature.sh start name` creates branch; `feature.sh finish` runs tests, rebases onto main, and prints the `gh pr create` line ready to paste (or runs it with `--push`).

**Week 6 — Remote, review, automation**
- Concepts: remotes/`fetch` vs `pull` (`--ff-only` default in your config), `push -u`, force-with-lease, `gh` (`pr create/checkout/checks view`, `issue list/create`, `run watch`), PR review flow from terminal, tags/releases, submodules awareness, worktrees (`worktree add` — parallel branches without stashing), hooks (pre-commit running shellcheck — wire Phase 2 to Phase 3!), delta integration everywhere.
- Drills: `gh pr create` → `gh pr checks --watch` → address review comment → merge via `gh pr merge --squash`; `git worktree add ../lab-fix hotfix` and work two branches "simultaneously"; `bisect run ./test.sh` fully scripted.
- Exercise: **repo toolkit** — `repo-stats.sh` (commits/author, churniest files via `git log --name-only | sort | uniq -c`), plus pre-commit hook enforcing ShellCheck in `~/lab`.
- *Now* install **lazygit** ([[TUI_Programs]] §5) — use it for exploration, but the week's drills stay CLI-first. You'll move faster in both.

### Phase 4 — Automation & systems (Weeks 7–8)
*Target: your machine works for you; everything so far compounds.*

**Week 7 — Processes, remote, scheduled**
- Concepts: `ssh` config aliases + key auth + `ControlMaster`; `rsync -avzn` → real sync with `--delete`; job control, `nohup`/`setsid` vs tmux (you know tmux — [[Tmux_Tutorial]] §9.4); `systemctl` + `journalctl -u -f`; cron syntax vs systemd timers; `env`/`export`/`PATH` surgery; `time` + `hyperfine`.
- Drills: rsync a lab dir to a backup location with dry-run→execute→verify (`diff -rq`); write a `status.sh` collecting uptime/disk/failed units; schedule it (cron *or* systemd user timer) and prove it ran via logs.
- Exercise: **dotfiles bootstrap** — `bootstrap.sh` on a clean-ish target (container if available, else a fresh dir simulating home): installs packages (apt list from a file), links dotfiles with `ln -s`, verifies with a checklist output; idempotent (runs twice safely).

**Week 8 — Capstone: `ci.sh` (the terminal as a factory)**
Build a single repo containing a real (small) project — pick a script suite or a tiny Python/Node tool — with:

1. `ci.sh` pipeline: **lint → test → build → package → report**; stages as functions; `--dry-run`; per-stage logging to `logs/ci-YYYYmmdd.log`; meaningful exit codes; parallel where trivial (`xargs -P`).
2. Pre-commit hook (ShellCheck/lint) wired in Week 6 style.
3. Scheduled or on-demand execution; failure path demonstrated (plant a bug, watch CI go red, `git bisect` it — full loop).
4. **Report lands in your vault**: on success, `obsidian daily:append content="- [x] ci green: $(git rev-parse --short HEAD)"` ([[Obsidian_CLI]]) and/or writes a `report.md` you review in Obsidian.
5. Optional accelerant: `gh workflow`-style echo — or actually push to GitHub and let `gh run watch` show a remote twin.

**Capstone exit review (15 min):** run it from cold shell in tmux, break it on purpose, recover, explain each part aloud. If you can teach it, you're fluent.

## 5. Phase map & checkoffs

| Week | Phase | Long-session exercise | Done |
|------|-------|----------------------|------|
| 0 | Setup | Environment + lab + dotfiles v1 | [ ] |
| 1 | Core | `inventory.sh` | [ ] |
| 2 | Core | `report.sh` (log forensics) | [ ] |
| 3 | Scripts | `greet.sh` with flags/validation | [ ] |
| 4 | Scripts | `newrepo.sh` + first hook | [ ] |
| 5 | Git | feature-branch runbook + bisect drill | [ ] |
| 6 | Git | `gh` PR flow + `repo-stats.sh` + worktrees | [ ] |
| 7 | Automation | `bootstrap.sh` idempotent | [ ] |
| 8 | Capstone | `ci.sh` green end-to-end | [ ] |

## 6. Drill bank (by phase)

### Set A — log forensics (Phase 1; target: 5 questions ≤ 3 min)
Given `app.log` (generated): ① case-insensitive count of `error|warn` ② top-5 messages ③ errors in last 20 lines after timestamp X ④ unique IP-ish fields with counts, desc ⑤ lines between two timestamps ⑥ pipe it all into a one-shot `awk` summary.

### Set B — file surgery (Phase 1–2; target: ≤ 90s each)
① `*.bak` older than 7d, preview-delete ② copy tree keeping structure, skip `.git` ③ 10 largest, human sizes, sorted ④ permission audit: world-writable files ⑤ symlink to its target printed as pairs.

### Set C — text/JSON (Phase 2)
① CSV → TSV → sorted JSON (`jq -R -s` warmup) ② API JSON → count/field list (`curl -fsSL | jq`) ③ replace across files with `sd`, verify with `rg -c` ④ `uniq -c` frequency of a field ⑤ extract all URLs from a file, HEAD-check them in parallel (`xargs -P8 -I{}`).

### Set D — git gyms (Phase 3; time each)
① 10-commit repo, `rebase -i` to 3 commits ② plant/resolve a conflict deliberately ③ `bisect` a bug with `bisect run` ④ recover branch via reflog after `reset --hard` ⑤ `stash` → apply elsewhere → drop ⑥ `worktree` two branches ⑦ `cherry-pick` a commit across branches ⑧ write and trigger a pre-commit hook failure.

### Set E — speed round (every Friday)
From `drills.md` lookup log: **reproduce 10 logged commands from memory**, timed. Add anything you miss back to the log. This single drill is the fluency engine.

## 7. Resources (small on purpose)

| Resource | Use for |
|----------|---------|
| `tldr <cmd>` / `--help` / `man 1 <cmd>` | First, always ([[Linux_Terminal_Toolkit]] §1.1) |
| **ShellCheck** (CLI + editor integration) | The script linter — zero config, argue with every warning |
| **learn git branching** (learngitbranching.js.org) | Phase 3 concepts visualized — do every level |
| `git help -g` + `git log --help` | Git's built-in guides ("committing", "errors", "interactive") are excellent |
| **Pro Git** (free, progit.org) | Depth when a drill confuses you |
| The Linux Command Line (free PDF) | Phase 1 reference if the Toolkit table feels thin |
| `explainshell.com` | Paste a cryptic pipeline, get it disassembled |
| Your own `drills.md` | The actual curriculum — it records *your* gaps |

## 8. After Week 8 (keep the gains)

- **Weekly cadence**: 1 speed round (Set E) + 1 mini-script + 1 new TUI from [[TUI_Programs]] (one per *month*, `?`-first).
- **Next ladders**: Python/`uv` from the terminal ([[Linux_Terminal_Toolkit]] §3), containers (`lazydocker` + `docker build` fluency), `make`/`just` for project commands, structured logging (`jq` on JSON logs), [[Obsidian_CLI]] automation (graph hygiene as a cron script).
- **Teach one thing per week** — write it as a note in this vault (`terminal_stuff/`). Teaching is the retention test.

### When stuck

| Symptom | Fix |
|---------|-----|
| "I forget drills by Friday" | Expected — that's what Set E + lookup log are for; slow down reps, not reading |
| "Phase feels too easy" | Double the speed target; add Set C/B volume; or start at Phase 3 per §0.1 |
| "Phase feels impossible" | Split the drill in half; rebuild from the smaller rep; check week 0 setup gaps |
| "Missed 4 days" | Don't restart the program — do one Set E + the week's exercise this weekend, continue Monday |
| "Bored of exercises" | Swap flavor for a week: automate something *real* (vault hygiene via [[Obsidian_CLI]], repo stats of a real project, log triage of a real service) — then return |
