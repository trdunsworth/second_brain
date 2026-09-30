---
type: reference
topic: Lisp installation guide — Fedora dnf and Intel Mac paths for SBCL, Clojure, Racket, Guile, plus Quicklisp and editor prerequisites
date: 2026-09-30
status: active
tags:
  - installation
  - setup
  - data-science
  - lisp
---

# Lisp Installation — Fedora and Intel Mac

> Goal: a working REPL on the two machines that matter here — **Fedora Linux** (primary) and an **Intel Mac** (Homebrew 7 era). Every command below was checked against current package sources; the "verify" section proves it works before you go further.
> Related: [[Clojure_Tutorial]] (what to do once the REPL is up), [[Common_Lisp_Tutorial]] (SBCL track), [[Lisp_Editor_Integrations]] (editor hookup), [[Linux_Terminal_Toolkit]] (general package-management context)

## How to use this note

1. **§1 once** — the map: what each dialect needs.
2. **§2 or §3** — your machine's install path (Fedora first, Intel Mac second).
3. **§4–§5** — Quicklisp (Common Lisp) and the Clojure CLI, both platform-independent.
4. **§6 verify** — run the smoke tests; don't proceed until they pass.
5. **§7 gotchas** — read once, save yourself an afternoon.

---

## 1. What you're installing

| Dialect | Runtime | Package manager | REPL command | Data-science role |
|---------|---------|-----------------|--------------|-------------------|
| **Clojure** | JVM (Java 17+) | Clojure CLI (`deps.edn`) | `clj` | **Primary path** — tablecloth, tech.ml.dataset, hanami/oz |
| **Common Lisp** | native (SBCL) | Quicklisp (`ql:quickload`) | `sbcl` | **Classic path** — Lisp-Stat, high performance |
| **Racket** | native | `raco pkg install` | `racket` (or `raco repl`) | Language-oriented: `data-frame`, built-in `plot` |
| **Guile/Scheme** | native | `guile` + hall/AUR | `guile` | Learning + scripting, light data work |

You do **not** need all four. Minimum viable setup: **Java + Clojure CLI** (or **SBCL + Quicklisp** if you're taking the classic track first). Racket is optional and self-contained.

> [!note] Prerequisites shared by all paths
> - `curl` (downloads installers), `rlwrap` (line editing + history in raw REPLs), `git` (cloning examples), and an editor — see [[Lisp_Editor_Integrations]].
> - On Fedora: `sudo dnf install curl rlwrap git`

---

## 2. Fedora Linux

### 2.1 SBCL (Common Lisp)

```bash
sudo dnf install sbcl          # Fedora 43–46, SBCL 2.6.x
sbcl --version                 # verify
```

Fedora ships SBCL directly — no build needed. It's the native-code compiler, so it's fast enough for data work.

### 2.2 Clojure (JVM)

**Step 1 — Java.** Clojure runs on the JVM:

```bash
sudo dnf install java-21-openjdk    # Fedora 42/43 system JDK
java -version                       # verify
```

> [!warning] Fedora 44+
> The default system JDK line moves to OpenJDK 25 in F44+ and `java-21-openjdk` may no longer resolve. Run `dnf search openjdk | head` and install whatever current LTS `java-NN-openjdk` exists. Any JDK 17+ works with current Clojure.

**Step 2 — the Clojure CLI.** Two options:

| Option | Command | Gives you |
|--------|---------|-----------|
| Fedora package | `sudo dnf install clojure` | `clojure.main` REPL only — **no `deps.edn` tooling** |
| Official script (recommended) | see below | full CLI: `clj`, `clojure`, `-M`/`-X`/`-T`, `deps.edn` |

```bash
curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
chmod +x linux-install.sh
sudo ./linux-install.sh               # installs to /usr/local/bin/{clj,clojure}
clj -M -e '(println "hi" (+ 1 2))'    # verify — needs `rlwrap` for clj
```

Keep the Fedora `clojure` package only if you want a zero-JVM-config toy REPL; for real projects use the official script (it coexists fine — `clj` is the tooling entry point).

**Step 3 — rlwrap** (if not already): `sudo dnf install rlwrap`.

### 2.3 Racket and Guile

```bash
sudo dnf install racket           # full Racket + raco
sudo dnf search guile             # pick the current guile package (naming varies by release)
sudo dnf install guile
racket --version && guile --version
```

Racket from `dnf` includes `raco` (its package manager) — you'll use `raco pkg install data-frame` in [[Lisp_Data_Science_Snippets]].

### 2.4 Editor prerequisites (Fedora)

```bash
sudo dnf install emacs            # SLIME/CIDER path
# Neovim/Vim/Helix/Kakoune: install per [[Lisp_Editor_Integrations]]
sudo dnf copr enable atim/kakoune -y && sudo dnf install kakoune-lsp   # Kakoune LSP
```

---

## 3. Intel Mac

> [!warning] Homebrew on Intel, September 2026
> **Homebrew 7.0.0 (Sept 13, 2026) demoted Intel macOS to Tier 3: no new bottles.** Intel builds must compile from source (slow), and Homebrew plans to stop supporting Intel in/after **September 2027**. macOS 26 Tahoe is the **last Intel macOS**; macOS 27 (fall 2026) is Apple-Silicon-only. brew still *works* today — but treat it as a bridge, not a foundation. **MacPorts** is the durable Intel option (it keeps building Intel packages).

Three paths, pick one:

| Path | Best for | Command style |
|------|----------|---------------|
| **Homebrew** (Tier 3) | You already have brew and accept source builds | `brew install …` |
| **MacPorts** | Long-term Intel health | `sudo port install …` |
| **Official installers** | Racket, SBCL binaries, Java — bypass both | vendor `.pkg` / tarballs |

### 3.1 Java (any path)

```bash
# Homebrew cask (Temurin 21, x64 build available):
brew install --cask temurin@21
# or download the Intel .pkg from https://adoptium.net/  (no brew needed)
java -version
```

Casks install vendor packages, so they still work on Intel even while formulae stall.

### 3.2 SBCL

```bash
brew install sbcl          # may compile from source on Tier 3 — be patient
# or MacPorts (recommended long-term):
sudo port install sbcl
# or grab an x86-64 binary from https://www.sbcl.org/platform-table.html
sbcl --version
```

No Rosetta involved — an Intel Mac runs x86_64 natively. (Rosetta is for running Intel code *on Apple Silicon*; it's irrelevant here.)

### 3.3 Clojure

```bash
# Official POSIX installer — works on macOS, avoids brew's Tier-3 source builds:
curl -L -O https://github.com/clojure/brew-install/releases/latest/download/posix-install.sh
chmod +x posix-install.sh
sudo ./posix-install.sh

# OR the brew tap (fine if you don't mind source builds / already have a JDK):
brew install clojure/tools/clojure

clj -M -e '(println "ok")'
```

> [!warning] Installer conflict
> The POSIX script and `brew install clojure/tools/clojure` install to overlapping paths — pick **one**. The clojure.org docs note the POSIX script can conflict with Homebrew; on an Intel Mac the script is usually the smoother choice.

### 3.4 Racket, Guile

```bash
# Racket: official universal/Intel installer from https://racket-lang.org/ (best on Intel)
# or: brew install racket  /  sudo port install racket
# Guile: brew install guile (source build on Tier 3) or sudo port install guile
racket --version && guile --version
```

### 3.5 Homebrew bootstrap (if missing)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew doctor          # expect Tier-3 warnings on Intel — that's expected, not a failure
```

---

## 4. Quicklisp (Common Lisp) — all platforms

Quicklisp is to Common Lisp what `deps.edn` is to Clojure: the dependency manager + library ecosystem.

```bash
curl -O https://beta.quicklisp.org/quicklisp.lisp
sbcl --no-sysinit --no-userinit --load quicklisp.lisp \
     --eval '(quicklisp-quickstart:install)' \
     --eval '(ql:add-to-init-file)' \
     --quit
```

- `ql:add-to-init-file` appends `(load "~/quicklisp/setup.lisp")` to `~/.sbclrc`, so plain `sbcl` starts with Quicklisp ready.
- Verify: run `sbcl`, then at the REPL:

```lisp
(ql:quickload :alexandria)   ; a universally-present utility lib; downloads + loads
```

Sources: [lisp-lang.org getting started](https://lisp-lang.org/learn/getting-started), [quicklisp.org](https://www.quicklisp.org/beta/).

---

## 5. The Clojure CLI in 30 seconds

```bash
mkdir hello-clj && cd hello-clj
cat > deps.edn <<'EOF'
{:paths ["src"]
 :deps  {scicloj/tablecloth {:mvn/version "8.024"}}}
EOF
clj -M -e '(require (quote [tablecloth.api :as tc]))
            (println (tc/row-count (tc/dataset {:a [1 2 3]})))'
```

- `clj` = REPL with history/rlwrap; `clojure` = same tooling without rlwrap (scripts/CI).
- `-M` runs main opts, `-X` runs exec fns (data maps), `-T` runs tools, `-e` evaluates a string.
- First run downloads the JDK deps (tablecloth + tech.ml.dataset) — one-time cost.
- Coordinate format: `group/artifact {:mvn/version "…"}` (deps.edn) or `[group/artifact "…"]` (Lein). tablecloth lives on Clojars: `scicloj/tablecloth`.

---

## 6. Verify — smoke tests

Run these in order; each should print output and exit 0.

```bash
# Common Lisp track
sbcl --no-sysinit --no-userinit --eval '(format t "SBCL ~a OK~%" (lisp-implementation-version))' --quit

# Clojure track
clj -M -e '(println "Clojure" (clojure-version) "OK")'

# Racket track
racket -e '(displayln (format "Racket ~a OK" (version)))'

# Guile track
guile -c '(display "Guile OK\n")'
```

Then the interactive checks:

| REPL | Type this | Expect |
|------|-----------|--------|
| `sbcl` | `(+ 1 2)` then `C-d` | `3` |
| `clj` | `(require '[tablecloth.api :as tc])` | silent success, prompt returns |
| `clj` | `(tc/dataset {:x [1 2 3]})` | renders a 3-row table |
| `racket` | `(+ 1 2)` | `3` |

Common Lisp integration test (after §4):

```lisp
(ql:quickload :lisp-stat)     ; the data-science library — see [[Lisp_Data_Science_Snippets]]
```

---

## 7. Gotchas

1. **Fedora's `clojure` rpm ≠ Clojure CLI.** It lacks `deps.edn`/`tools.deps`. Use the official `linux-install.sh` for real work.
2. **`java-21-openjdk` may 404 on Fedora 44+.** `dnf search openjdk` and take the current LTS.
3. **Homebrew Tier 3 on Intel:** formulae compile from source (slow, occasionally broken), no new bottles, EOL Sept 2027. Prefer MacPorts or vendor installers for anything you rely on.
4. **`clj` needs `rlwrap`** or you get no line editing/history in the REPL — `sudo dnf install rlwrap` / `brew install rlwrap`.
5. **Two Clojure installers fight each other** (POSIX script vs `clojure/tools/clojure` tap) — pick one, don't stack them.
6. **Windows:** this vault runs Windows + WSL2/Ubuntu ([[Linux_Terminal_Toolkit]]) — do all Lisp work inside WSL or on the Fedora/Mac box. Raw Windows Lisp support (SBCL via MSYS2, Clojure via PowerShell) exists but is not the supported path here.
7. **Quicklisp first-run downloads** libaries to `~/quicklisp/` — needs network once per library; afterwards loads are local.
8. **Never `sudo` a REPL.** Install packages with sudo; run `sbcl`/`clj` as your user (Quicklisp writes to `$HOME`).

---

## What's next

→ [[Clojure_Tutorial]] (main path) or [[Common_Lisp_Tutorial]] (classic track), then [[Lisp_Editor_Integrations]] to wire it into your editor.
