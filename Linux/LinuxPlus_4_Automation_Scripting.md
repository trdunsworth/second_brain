---
type: study-guide
topic: CompTIA Linux+ XK0-006 domain 4.0 Automation, Orchestration, and Scripting — IaC, CI/CD, bash scripting, Python for sysadmin, Git, responsible AI use
date: 2026-10-13
status: active
tags:
  - linux
  - comptia
  - linux-plus
  - bash
  - scripting
  - python
  - git
  - ansible
  - automation
  - ai
---

# Domain 4.0 — Automation, Orchestration, and Scripting (17%)

> Goal: IaC and orchestration, bash constructs, Python for administration, Git, and responsible AI use.
> **New in XK0-006:** Python is explicitly emphasised and **4.5 AI best practices is brand-new content**. Don't skip either.
> Related: [[LinuxPlus_2_Services_User_Management]] §6 · [[Linux_Terminal_Toolkit]] §1.5–§1.6

## 1. 4.1 — Automation and orchestration

### Ansible (the one to know best — agentless, Python, on the objectives)

| Term | Meaning |
|------|---------|
| **Control node** | Where you run `ansible-playbook`. Needs `ansible` installed |
| **Managed node / managed host** | The target. Needs only **Python** — **no agent, no daemon** |
| **Inventory** | The list of targets: IP/name → group → variables. `hosts`, `groups`, `all` |
| **Playbook** | YAML: a list of **plays** (one per group) containing **tasks** |
| **Task** | A single action: `module` + arguments. The atomic unit |
| **Module** | The function that does the work (`apt`, `yum`, `copy`, `service`, `user`, `file`, `command`) |
| **Fact** | Gathered variable describing a host (OS, memory, interfaces) — `ansible.builtin.setup` |
| **Ad hoc** | One-off command: `ansible all -m ping`, `-m apt -a "name=nginx state=present"` |
| **Collection** | Installable package of modules, roles, and plugins (`ansible.posix`, `community.general`) |
| **Roles** | Reusable bundles: tasks + vars + handlers + templates |
| **Handlers** | Run **once**, when notified (`notify:` + `listen:`) |

```yaml
# site.yml
- name: Configure web servers
  hosts: webservers
  become: yes
  vars:
    http_port: 80
  tasks:
    - name: Install nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: yes
      notify: Restart nginx       # only fires if something changed

    - name: Deploy config
      ansible.builtin.copy:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        owner: root
        mode: '0644'
      notify: Restart nginx

  handlers:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

```bash
ansible all -m ping                    # ad hoc
ansible-playbook site.yml --check       # dry run
ansible-playbook site.yml --limit web01
ansible-inventory --graph              # show the group tree
ansible-galaxy collection install ansible.posix
```

> **Idempotence** is the concept the exam cares about: running a playbook twice should produce the same end state and report `ok` rather than `changed`. That is why modules (state-based) are preferred over raw `command`.

### Puppet (agent-based, its own language)

| Term | Meaning |
|------|---------|
| **Agent** | `puppet agent` runs on each **managed node** |
| **Master / Primary server** | Compiles and distributes configuration |
| **Manifest** | The `.pp` file declaring desired state |
| **Module** | Installable bundle of manifests, templates, files |
| **Class** | A reusable, parameterised block |
| **Facts** | `puppet facts` — structured variables the catalog is built from |
| **Certificates** | **SSL certs** are the agent↔server trust mechanism (a real security control) |
| Catalog | The compiled, fully-resolved configuration sent to the agent |

**Ansible vs Puppet — the comparison question:**

| | Ansible | Puppet |
|---|---|---|
| Architecture | **Agentless** (SSH) | **Agent** on every node (`puppet agent`) |
| Language | **YAML** (declarative, Python underneath) | **DSL** (`.pp`), Ruby |
| Transport | SSH (port 22) | HTTPS (8140) + cert auth |
| Install needed on target | Python only | Full agent |
| Style | Playbooks + ad hoc | Manifests + catalogs |
| Better when | You need speed, minimal footprint, and ad hoc | You have large fleets and want declarative convergence + reporting |

> **"A tool that requires an agent and uses certificates to authenticate" → Puppet. "An agentless YAML-driven tool using SSH" → Ansible.**

### OpenTofu (IaC)

| Term | Meaning |
|------|---------|
| **Provider** | The plugin to a target platform (AWS, Azure, local, Docker) |
| **Resource** | A declared infrastructure object (an instance, a bucket, a user) |
| **State** | The record of what OpenTofu believes it has created. **Must be stored remotely and securely** |
| **API** | How the provider talks to the platform |
| Plan / Apply | `tofu plan` = preview. `tofu apply` = execute |
| Modules | Reusable, versioned resource collections |

> **State file security** is the classic scenario: *if the state file is world-readable, anyone with write access can exfiltrate secrets or redirect resources — restrict it (0600) and store it remotely with encryption.* Terraform is the predecessor; **OpenTofu** is the open-source fork.

### Unattended deployment

| Tool | How |
|------|-----|
| **Kickstart** | Red Hat's answer file for **automated, non-interactive RHEL/Rocky/Alma installation**. Read at boot from NFS/HTTP by `inst.ks=` on the kernel command line |
| **cloud-init** | Cloud instance first-boot configuration — runs once, applies `user-data`, `meta-data`, vendor/user-data. Installed by default on Ubuntu, Debian, RHEL cloud images |

```bash
# cloud-init
cloud-init status --long
cloud-init clean --logs --seed
# Kickstart kernel line
linux inst.ks=http://server/ks.cfg quiet
```

### CI/CD

| Term | Meaning |
|------|---------|
| **Version control** | Git/DVS — the source of truth and history |
| **Pipeline** | The automated chain: build → test → deploy |
| **Shift-left testing** | Move testing **earlier** in the pipeline — catch defects before they reach production |
| **GitOps** | Git is the **single source of truth for deployment state**; a controller reconciles the cluster to the repo. Declarative, and every change is auditable via PR |
| **DevSecOps** | Security integrated into the CI/CD pipeline (SAST/DAST, dependency scanning, secrets scanning) |

> **Shift-left testing** is the term to define correctly: security and testing move *earlier* in the pipeline, not later.

### Deployment orchestration

**Kubernetes**
| Object | What it does |
|--------|--------------|
| **Pod** | The smallest deployable unit — one or more containers sharing a network/IP |
| **Deployment** | Declarative replica management + **rolling updates/rollbacks** |
| **Service** | A **stable virtual IP** and DNS name fronting a changing set of pods |
| **ConfigMap** | Non-confidential key/value config |
| **Secret** | Sensitive config — base64-encoded, **not encrypted by default** (needs etcd encryption or a vault) |
| **Volume / PVC** | Persistent storage |
| **Variables** | Environment/`env` values injected into containers |
| `kubectl` | The CLI |

> **`ConfigMap` vs `Secret`** — the tested pair. Secrets are base64, which is **encoding, not encryption**. Real protection needs etcd encryption at rest or external secrets management.

**Docker Swarm**
| Term | Meaning |
|------|---------|
| **Nodes** | Workers |
| **Services** | The declarative spec for a replicated workload |
| **Tasks** | The running container instance of a service |
| **Networks** | Overlay networks |
| **Scale** | `docker service scale svc=10` |

**Docker / Podman Compose**
```yaml
# compose.yaml
services:
  web:
    image: nginx:1.27
    ports: ["8080:80"]
    volumes: ["./site:/usr/share/nginx/html:ro"]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes:
  pgdata:
```
```bash
docker compose up -d      # start
docker compose down       # stop and REMOVE containers/network
docker compose logs -f web
```
> **Scenario:** "Docker Compose uses a variable for a password. What must be true?" → the value comes from the **environment or a `.env` file**, and it must **not** be committed to version control (`.gitignore` it).

---

## 2. 4.2 — Shell scripting

### Skeleton

```bash
#!/usr/bin/env bash          # interpreter directive — must be line 1
set -euo pipefail             # fail on error / unset var / pipe failure
IFS=$'\n\t'
readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG=/var/log/job.log

usage() {
  cat <<EOF
Usage: $(basename "$0") [-v] FILE
  -v  verbose output
EOF
}

main() {
  local verbose=false file
  while getopts ":vf:" opt; do
    case "$opt" in
      v) verbose=true ;;
      f) file=$OPTARG ;;
      \?) echo "Unknown option: -$OPTARG" >&2; usage; exit 1 ;;
      :)  echo "Option -$OPTARG requires an argument." >&2; exit 1 ;;
    esac
  done
  [[ -n "$file" ]] || { echo "Missing FILE" >&2; exit 1; }
  [[ -f "$file" ]] || { echo "Not a file: $file" >&2; exit 1; }
  $verbose && echo "Processing $file"
  printf '%s %s\n' "$(date -Is)" "$file" >> "$LOG"
}

trap 'echo "Error on line $LINENO" >&2' ERR
main "$@"
```

### Interpreter directive `#!`

- `#!/bin/bash`, `#!/usr/bin/env bash` (portable — finds `bash` on `PATH`), `#!/usr/bin/python3`
- Must be the **first line**; a file without it and without an explicit interpreter is executed by the **calling shell** — a real source of bugs.
- `chmod +x` makes it executable.

### Variables and expansion

```bash
name="Tony"                 # assignment (no spaces around =)
echo "$name"                # ALWAYS quote
echo "${name}Defender"      # braces: needed when text follows
echo "${name:-default}"     # default if unset OR empty
echo "${name:=default}"     # set if unset/empty
echo "${name:?not set}"     # error + exit if unset/empty  ← great for guarding rm
echo "${#name}"             # length
echo "${name:0:3}"          # substring
echo "${name^^}"            # uppercase
unset name                  # remove
readonly LOG=/var/log/x     # cannot be changed
local tmp                   # function-scope only
export API_KEY=abc          # add to environment (visible to child processes)
declare -i n=5              # integer
declare -a arr=(a b c)      # array
env | grep API_KEY          # confirm
```

**Special parameters**

| | Meaning |
|---|---|
| `$0` | Script name |
| `$1`…`$9`, `${10}` | Positional arguments — **always quote: `"$@"`** |
| **`$@`** | All args, each preserved as a separate word — use this |
| `$*` | All args joined into **one** string — rarely what you want |
| `$#` | Number of arguments |
| `$?` | **Exit status of the last command** |
| `$$` | PID of the script |
| `$!` | PID of the last background process |

### Expansion types (memorise these three names)

| Type | Syntax | What it does |
|------|--------|--------------|
| **Parameter expansion** | `${var}` | Substitutes a variable |
| **Command substitution** | **`$(foo)`** or `` `foo` `` | Runs a command, substitutes its output. **`$(...)` is preferred** — nestable, better parsing |
| **Arithmetic expansion** | `$(( 2 + 2 ))` | Arithmetic |
| **Subshell** | `(foo)` | Runs in a **child shell** — `cd /tmp; pwd` doesn't change the parent |
| Brace expansion | `{a,b}`, `{1..9}` | Generates multiple items — **not** globbing |

```bash
today=$(date -Is)            # ✓
files=$(find . -name '*.log')
count=$(( $(wc -l < file) + 1 ))
(cd /tmp && ls)              # subshell — parent unaffected
```

### Conditionals

```bash
if [[ -f "$file" ]]; then
  echo "regular file"
elif [[ -d "$dir" ]]; then
  echo "directory"
else
  echo "neither"
fi

if grep -q "error" app.log; then    # exit-status test
  echo "found"
fi

name=""
[[ -n "$name" ]] || { echo "empty" >&2; exit 1; }   # || short-circuit guard
```

**`[[ ... ]]` is a bash keyword** — no word splitting or glob expansion inside, supports `=~`, `&&`, `||`. **`[ ... ]` is a POSIX external command** with all the quoting hazards. In bash, always prefer `[[ ]]`.

**`case`** — cleaner than an `if` chain for discrete values:
```bash
case "$1" in
  start)   systemctl start "$SVC" ;;
  stop)    systemctl stop "$SVC" ;;
  restart) systemctl restart "$SVC" ;;
  status)  systemctl status "$SVC" ;;
  *)       echo "Usage: $0 {start|stop|restart|status}" >&2; exit 1 ;;
esac
```

### Tests — all on the objectives

| File test | Meaning |
|-----------|---------|
| `-e` | Exists (any type) |
| `-f` | Regular file |
| `-d` | Directory |
| `-s` | Exists and **size > 0** |
| `-r` / `-w` / `-x` | Readable / writable / executable |
| `-L` / `-h` | Symlink |

| String test | Meaning |
|--------------|---------|
| `-n "$s"` | **Non-empty** |
| `-z "$s"` | **Zero-length** (empty) |
| `[[ $a == $b ]]` | Equals (right side treated as a **pattern**!) |
| `[[ $a = "$b" ]]` | Equals, literal (`=` is the POSIX form) |
| `[[ $a == pattern ]]`, `[[ $a =~ regex ]]` | Glob / ERE regex |

> **`-n` and `-z` are the ones most often confused.** `-n` = **n**on-empty = TRUE. `-z` = zero length = TRUE. Read them as "`-n` means there **is** something."

### Comparison operators

| Numeric | | String | | Regex | |
|---------|---|--------|---|-------|---|
| `-eq` | equal | `=` / `==` | equal | `=~` | matches ERE |
| `-ne` | not equal | `!=` | not equal | | |
| `-gt` | greater than | `>` / `\>` | after | | |
| `-ge` | ≥ | `>=` | ≥ | | |
| `-lt` | less than | `<` / `\ <` | before | | |
| `-le` | ≤ | `<=` | ≤ | | |

> **Numeric comparisons `-eq -lt` take arithmetic operands; string comparisons use `=` `!=` `<` `>`.** `[[ "$a" -lt "b" ]]` is wrong when `a`/`b` are strings. And **inside `[[ ]]`, `<` and `>` mean comparison — you don't need to escape them** (escaping is only needed inside `[ ]`).

### Loops

```bash
for i in 1 2 3; do echo "$i"; done
for f in *.log; do gzip "$f"; done
for f in $(cat list.txt); do echo "$f"; done
for ((i=0; i<10; i++)); do echo "$i"; done

while read -r line; do echo "$line"; done < input.txt      # IFS= issues; use -r

n=0
until [[ $n -ge 3 ]]; do
  echo "attempt $n"
  n=$((n + 1))
done

select opt in a b c; do
  case "$opt" in a) ...;; *) break;; esac
done < menu.txt

for f in *; do
  [[ -d "$f" ]] && continue       # skip
  [[ "$f" == tmp* ]] && break      # stop
  process "$f"
done
```

> `while` = repeat **0+** times (tested first). `until` = repeat **until** true (tested first). `for` = iterate a list. Use `for` for iteration, `while` for "keep going until…".

### Regular expressions

```bash
[[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] && echo valid
grep -E '^(root|admin):' /etc/passwd         # ERE
grep -oE '[0-9]{1,3}(\.[0-9]{1,3}){3}' f    # extract IPs
sed -E 's/([0-9]+)/<\1>/g' f                 # capture groups \1
grep -oP '(?<=key=)\w+' secrets              # PCRE lookbehind (GNU grep)
```

| Element | Meaning |
|---------|---------|
| `.` | Any single character |
| `*` `+` `?` | 0+ / 1+ / 0 or 1 of the previous |
| `^` `$` | Start / end of line |
| `[abc]` `[a-z]` `[!abc]` | Character class / negated class |
| `(...)` | Group (captured as `\1` in `sed`) |
| `{n,m}` | Repeat n to m times |
| `\|` (BRE) / `\|` (ERE) | Alternation |
| `[[:digit:]]` `[[:alpha:]]` | POSIX classes |

> **`grep` default is BRE; `grep -E` is ERE.** `\d`, `\w`, lazy quantifiers, and lookarounds are **PCRE** — you need `grep -P`.

### Functions

```bash
log() {
  local level=$1; shift
  printf '%s [%s] %s\n' "$(date -Is)" "$level" "$*" >&2
}
usage() { cat >&2 <<EOF
Usage: ${0##*/} [-v] FILE
EOF
}
backup() {
  local src=$1
  log INFO "backing up $src"
  tar -czf "$src.tar.gz" "$src" || { log ERROR "tar failed"; return 1; }
}
backup /etc/ssh || log WARN "check that backup"
```
- `return` from a function, `exit` from a script
- `$?` captures the return code
- Functions share the parent's scope unless you declare `local`

### Arrays

```bash
files=("a.txt" "b.txt")
files+=("c.txt")
echo "${files[0]}" "${#files[@]}" "${files[@]}" "${!files[@]}"
for f in "${files[@]}"; do echo "$f"; done
```

> **Always `"${arr[@]}"` with the quotes.** Unquoted, an empty array becomes **zero arguments**, which silently breaks commands.

### I/O and redirection in scripts

```bash
read -p "Name: " name                 # prompt
read -rs password                     # silent read (no echo) — for secrets
read -ra arr <<< "a b c"              # read into an array
cat > file <<EOF
Unquoted heredoc: $var expands.
EOF
cat > file <<'EOF'
Quoted heredoc: $var does NOT expand.
EOF
```

### Exit codes and error handling

```bash
set -e            # exit on any command failure
set -u            # error on unset variable
set -o pipefail   # pipeline fails if ANY stage fails
set -x            # trace (bash -x)
set +e            # turn off

cmd && echo "ok"
cmd || echo "failed: $?"
if ! cmd; then echo "failed"; exit 1; fi

trap 'echo "cleanup"' EXIT             # always
trap 'echo "on error $?" ERR' ERR
trap '' SIGINT                        # ignore
trap cleanup_function SIGTERM
```

**Exit code conventions**
| Code | Meaning |
|-----:|---------|
| 0 | Success |
| 1 | General error |
| 2 | Misuse of shell builtin / bad usage |
| 126 | Found but **not executable** |
| 127 | **Command not found** |
| 128+n | Terminated by signal n (137 = 128+9 = SIGKILL, 143 = 128+15 = SIGTERM) |

> **`set -e` is a blunt instrument.** It's skipped in conditionals, `&&`/`||` chains, `if` conditions, and negated with `!`. Handle errors explicitly when the exit status matters.

### stdin/stdout/stderr plumbing

```bash
cmd 2>&1 | tee -a log.txt      # show + log, keep errors visible
cmd > /dev/null 2>&1          # silence completely
cmd | grep -q foo || echo "not found"
find . -name '*.log' -print0 | xargs -0 -P4 -I{} gzip {}
curl -fsS https://api.example.com/data | jq -r '.items[].name'
```

### Safe scripting rules (the security-flavored version)

```bash
set -euo pipefail
IFS=$'\n\t'
"$@"                                  # quote everything
[[ -n "${1:-}" ]] || { echo "usage" >&2; exit 1; }
: "${DIR:?DIR must be set}"            # guard destructive ops
find "$DIR" -depth -name '*.tmp' -print   # preview before deleting
```

---

## 3. 4.3 — Python basics for Linux administration

### Data types (all on the objectives)

| Type | Example | Notes |
|------|---------|-------|
| **String** | `"text"`, `f"{x}"` | Immutable. `f`-strings for formatting |
| **Integer** | `42` | Arbitrary precision — no overflow |
| **Floating point** | `3.14` | |
| **Boolean** | `True` / `False` | Note the **capital** letters (not `true`/`false`) |
| **List** | `[1, 2, 3]` | Mutable, ordered, indexable |
| **Dictionary** | `{"key": "value"}` | Mutable key→value map |
| Tuple | `(1, 2)` | Immutable |
| Set | `{1, 2}` | Unique, unordered |

```python
s = "hello"          # str
i = 42               # int
f = 3.14             # float
b = True             # bool (must be capitalised)
l = [1, 2, 3]        # list
d = {"host": "web01", "port": 80}   # dict
```

### Indentation defines blocks — no braces, no semicolons

```python
def check(disk):
    usage = shutil.disk_usage(disk)
    if usage.used / usage.total > 0.9:
        print(f"WARNING: {disk} is {usage.used/usage.total:.1%} full")
        return 1
    return 0
```
Use **4 spaces** (PEP 8), never tabs. Mixing tabs and spaces raises `TabError` (Python 3).

### Built-in modules worth knowing

| Module | Use |
|--------|-----|
| `os` | `os.path`, `os.environ`, `os.system`, `os.rename`, `os.stat` |
| **`sys`** | `sys.argv` (CLI args), `sys.exit(code)`, `sys.path`, `sys.stdin` |
| **`subprocess`** | Run external commands — `subprocess.run([...], capture_output=True, text=True, check=True)`. **Use a list, never `shell=True`** |
| `shutil` | `disk_usage`, `copy`, `move`, `rmtree`, `which` |
| `pathlib` | Modern object-oriented paths: `Path("/etc").glob("*.conf")` |
| `logging` | Structured logs with levels |
| `argparse` | Command-line argument parsing |
| `datetime` | `datetime.now(timezone.utc)` — never naive local time in production |
| `socket`, `ipaddress` | Network operations |
| `json`, `csv` | Parse structured data |

```python
#!/usr/bin/env python3
"""Check disk usage across mounts and exit non-zero if any exceeds a threshold."""
import argparse, shutil, subprocess, sys
from datetime import datetime, timezone

def usage_pct(path: str) -> float:
    u = shutil.disk_usage(path)
    return u.used / u.total

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--path", default="/")
    p.add_argument("--threshold", type=float, default=0.90)
    a = p.parse_args()

    pct = usage_pct(a.path)
    ts = datetime.now(timezone.utc).isoformat()
    print(f"{ts} {a.path} {pct:.1%}")

    if pct > a.threshold:
        print("ERROR: filesystem above threshold", file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())      # exit code matters to cron/systemd
```

> **Why Python, not bash, for sysadmin?** Cross-platform, testable, far better data structures, and large ecosystem libraries (Ansible, Boto3, Netmiko). The exam frames it as **"basic Python scripting for automation"** — you need to read it and write simple functions, not write production Python.

### Virtual environments and dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate         # or: . .venv/bin/activate
pip install requests
pip install -r requirements.txt
pip freeze > requirements.txt    # pin for reproducibility
deactivate

python3 -m venv --system-site-packages .venv   # inherit system packages
pipx install tool                # CLI tool, isolated
```

- A venv **isolates dependencies per project** and stops `pip` from breaking `apt`/`dnf`.
- `requirements.txt` pins versions so another host gets the same set.
- **PEP 8** is the style guide: 4-space indent, snake_case functions, UPPER_CASE constants, `main()` guard, docstrings.

---

## 4. 4.4 — Git version control

### The three states (memorise the flow)

```
working directory  ──git add──▶  staging (index)  ──git commit──▶  repository (HEAD)
        ▲                              │
        └──────────── git restore ───────┘
```

| Command | Does |
|---------|------|
| `git init` | Create a repo |
| `git clone <url>` | Copy an existing repo |
| `git config user.name "Tony"` / `user.email` | Identity (use `--global` for all repos) |
| `git status` | What has changed, what's staged |
| `git add .` | Stage files |
| `git commit -m "msg"` | Commit staged changes |
| `git log --oneline --graph --all` | History |
| `git diff` | Unstaged changes |
| `git diff --staged` | Staged changes |
| `git branch` / `git checkout -b feature` / `git switch -c` | Branches |
| `git merge feature` | Merge a branch **into** the current one |
| `git rebase main` | Replay your commits **on top of** main — linear history |
| `git pull` | Fetch **and** merge |
| `git push` | Publish commits |
| `git fetch` | Download only, **don't merge** |
| `git remote -v` / `git remote add origin <url>` | Remotes |
| `git stash` / `git stash pop` | Shelve changes temporarily |
| `git reset --soft/--mixed/--hard <ref>` | Move HEAD. **`--hard` discards work** |
| `git revert <sha>` | New commit that undoes an old one — **safe for shared history** |
| `git tag -a v1.0 -m "..."` | Annotated tag |
| `.gitignore` | Excluded from tracking |

### Merge vs rebase vs squash

| | What it does | Use when |
|---|---|---|
| **Merge** | Combines branches, keeps both histories, adds a merge commit | Shared branches; preserves true history |
| **Rebase** | Replays **your** commits on top of another branch → linear history | Your own unshared branch, before review |
| **Squash** | Merges many commits into **one** | Cleaning up a messy feature branch — "one logical change = one commit" |

> **Rules the exam expects you to know:**
> - **Never rebase a branch that's already pushed and shared** — you rewrite history other people are building on.
> - **`revert` is safe for published history; `reset --hard` on a shared branch destroys other people's work.**
> - **Squash before opening a PR** so reviewers see one logical change.

### Conflict resolution

```
<<<<<<< HEAD
ours
=======
theirs
>>>>>>> feature-branch
```
Edit, remove the markers, `git add`, `git commit`. `git merge --abort` / `git rebase --abort` bail out.

---

## 5. 4.5 — Best practices and responsible uses of AI (NEW in XK0-006)

### Legitimate use cases (all on the objectives)

| Use case | What it's for |
|----------|---------------|
| **Code generation** | Draft scripts, functions, config files |
| **Regex generation** | Build and explain patterns — genuinely one of the strongest uses |
| **Infrastructure as Code** | Generate Terraform/Ansible YAML |
| **Documentation** | Generate README content, docstrings, comments — "do document code" |
| **Compliance recommendations** | Suggest hardening against CIS benchmarks |
| **Security review** | Second pair of eyes on a diff |
| **Code optimization** | Suggest performance improvements |
| **Code linting** | Explain and fix style issues |

### Responsible use — what the exam wants you to say

| Principle | In practice |
|-----------|-------------|
| **Verify the output** | ✅ **The single most-tested principle.** AI output is a **draft**, never a deployable artefact. Read it, run it, test it first |
| **Never copy/paste without review** | ❌ Blanket pasting is the failure mode the objective is warning about |
| **Human review** | A person owns every line that ships |
| **Data governance — security of data** | Don't send **secrets, credentials, PII, or customer data** to a public LLM. It may be used for training |
| **LLM training** | Understand that prompts sent to a third-party service may be retained and used for model improvement |
| **Local models** | **Private vs public.** A local/on-prem model keeps data inside your control — the right answer when data is sensitive |
| **Adhere to corporate policy** | Approved tools only; organisational rules on what data may leave |

### Prompt engineering fundamentals

| Concept | What it is |
|---------|-----------|
| **Clear, specific instructions** | State the goal, the constraints, the input/output format, and the language version |
| **Context** | Give the relevant config, error text, or OS version — a generic answer is a useless answer |
| **Few-shot examples** | Show 1–3 input→output pairs to pin the format |
| **Iterate** | Refine; don't expect a first prompt to be final |
| **Specify constraints** | "Answer for RHEL 9 with `dnf`, POSIX sh, no external packages" |

```text
Bad:  "fix my script"
Good: "RHEL 9. Write a bash function that takes a directory and prints the
       10 largest files by size using du/awk. set -euo pipefail compatible.
       Only GNU coreutils. Return the function and a one-line example call."
```

> [!tip] The scenario pattern for 4.5
> A question will describe someone pasting AI-generated IaC straight into production. The **correct** answer is one of:
> - **Review and verify the output before use** ← the canonical answer
> - **Test in a non-production environment first**
> - **Route sensitive data to a local/private model**
> - **Follow corporate policy on approved tools**
>
> The **incorrect** answers are: *"LLM output is always correct because the model was trained on code"*, *"Use AI for everything to save time"*, *"Send the config file to any public assistant for context."*

> [!warning] AI and your own exam preparation
> These notes were built from CompTIA's published objectives document. AI is excellent for **generating practice questions** and **explaining a concept you already half-know** — but for retention you need to **retrieve from memory**, so use [[LinuxPlus_Practice_Questions]] cold, then use AI to check your reasoning. That's the same discipline the objective is testing, applied to yourself.

---

## Objective self-check

- [ ] Ansible vs Puppet — agent/agentless, language, transport
- [ ] What is idempotence, and why do Ansible modules make it easier?
- [ ] What's in an Ansible inventory vs a playbook vs a task?
- [ ] Why must the OpenTofu state file be protected?
- [ ] Define shift-left testing. Define GitOps.
- [ ] `ConfigMap` vs `Secret` — what's the security caveat?
- [ ] `[[ ]]` vs `[ ]` — why is one safer?
- [ ] `-n` vs `-z` — which means non-empty?
- [ ] Numeric `-lt` vs string `<` — when does each apply?
- [ ] `$@` vs `$*` — what's the difference?
- [ ] Why do you quote `"$@"` in a loop?
- [ ] What do `set -euo pipefail` do, one each?
- [ ] What's the exit code for "command not found"? For "found but not executable"?
- [ ] `while` vs `until` — what's tested first, and when does each run zero times?
- [ ] `git add` → `git commit` — name the three states in order.
- [ ] Merge vs rebase vs squash — when is rebase dangerous?
- [ ] `reset --hard` vs `revert` on a shared branch?
- [ ] Python: how does Python define blocks? What's the capitalisation of booleans?
- [ ] Why a venv instead of `pip install` as root?
- [ ] Give one AI use case and one responsible-use rule.
- [ ] Why is a local model preferred when the data is sensitive?

## Status

- [x] All objectives 4.1–4.5 covered
- [ ] Self-check passed cold
- [ ] Wrote and ran a bash script with a function, `case`, `trap`, and `[[ ]]` tests — passed `shellcheck`
- [ ] Wrote and ran a Python script with `argparse`, `shutil`, and a non-zero exit code
- [ ] Ran one Ansible ad-hoc command and one playbook with `--check`