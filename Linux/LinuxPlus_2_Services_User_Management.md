---
type: study-guide
topic: CompTIA Linux+ XK0-006 domain 2.0 Services and User Management — files and links, local accounts, processes and jobs, packages, systemd, containers
date: 2026-10-13
status: active
tags:
  - linux
  - comptia
  - linux-plus
  - users
  - permissions
  - processes
  - systemd
  - containers
---

# Domain 2.0 — Services and User Management (20%)

> Goal: files and links, the three account files, processes and signals, package managers, systemd verbs, containers.
> Related: [[LinuxPlus_1_System_Management]] · [[LinuxPlus_3_Security]] · [[Linux_Terminal_Toolkit]] §6–§7

## 1. 2.1 — Files and directories

### Core utilities

| Command | Notes |
|---------|-------|
| `pwd` | Current directory |
| `cd -` | Return to previous directory (`OLDPWD`) |
| `ls -lht` | Long, human sizes, newest first |
| `cp -a src dst` | Archive: recursive + preserve attributes/links |
| `mv -n` | **No-clobber** — won't overwrite |
| `rm -r` / `rm -i` | Recursive / interactive |
| `mkdir -p a/b/c` | Create parents |
| `rmdir` | Remove **empty** directory only (fails if it has contents) |
| `find` | `-name -type -size -mtime -maxdepth -perm -empty -newer -exec -delete -print0` |
| `locate` | Whole-filesystem index (fast, possibly stale) |
| `stat file` | Full metadata; `-c '%n %s %y %a'` for scripted output |
| `file x` | Identify type by content/magic |
| `diff -u a b` | Unified diff; `sdiff` is the side-by-side (interactive) version |
| `lsof` | **Who has this file/port open** — `lsof +D dir`, `lsof -i :8080` |
| `ln` | Links (below) |
| `touch` | Create empty file / update timestamp (`touch -t`) |

> [!tip] Exam-side `find` idioms
> ```bash
> find / -name '*.log' -mtime +30                  # logs older than 30 days
> find / -type f -size +100M                        # files over 100 MB
> find / -perm -4000                               # SUID files (security audit!)
> find / -user tony -group dev                     # by owner
> find . -type d -empty -delete                    # remove empty dirs
> find . -print0 | xargs -0 -P8 rm -f              # NULL-safe parallel delete
> ```
> `find / -perm -4000` is the classic **SUID audit** — an enormous number of them on a system is a finding.

### Hard links vs symbolic links

| | **Hard link** | **Symbolic (soft) link** |
|---|---|---|
| Points to | **The same inode** (the file data itself) | **A pathname** stored in its own file |
| `ls -l` shows | same link count (2+) | `file -> target` |
| Cross filesystems | ❌ **No** | ✅ Yes |
| Link a directory | ❌ **No** | ✅ Yes |
| Survives target deletion | ✅ (data still there) | ❌ **becomes a dangling/broken link** |
| Created with | `ln a b` | `ln -s a b` |

```bash
ln file1 hardlink        # same inode:  ls -li file1 hardlink  → same inode number
ln -s /opt/app/v2 current   # symlink to a directory
```

> [!tip] The one-liner the exam wants
> **A hard link is another name for the same inode; a symlink is a shortcut (a file containing a path).**
> Consequences that get tested:
> - Hard links can't cross filesystems or point at directories → **`ln` across devices gives `Invalid cross-device link`**.
> - A broken symlink is a *dangling* link — the **path** is gone, not the data.
> - `lsof +L1` shows deleted files still held open — deleting a file only drops the link count; space frees when the **last** link (or open fd) goes.

### `/dev` device types

| Type | Prefix | Behaviour | Examples |
|------|--------|-----------|----------|
| **Block** | `b` | Buffered, random-access I/O in blocks | `/dev/sda`, `/dev/sdb1`, `/dev/nvme0n1` |
| **Character** | `c` | Byte-at-a-time, unbuffered, stream | `/dev/tty`, `/dev/null`, `/dev/random`, `/dev/urandom`, `/dev/zero` |
| **Special char** | — | Device **partitions** of block devices, plus virtual | `/dev/sda1` is partition 1 of `/dev/sda`; `/dev/mapper/*`, `/dev/kvm` |

Memorise the useful ones:
| Device | Purpose |
|--------|---------|
| `/dev/null` | Black hole — discards everything. `cmd > /dev/null 2>&1` |
| `/dev/zero` | Endless stream of `\0` bytes |
| `/dev/random` | Cryptographically secure, **blocking** |
| `/dev/urandom` | Cryptographically secure, **non-blocking** — prefer this |
| `/dev/tty` | Current controlling terminal |
| `/dev/kvm` | KVM hypervisor interface |
| `/dev/shm` | **tmpfs** — default POSIX shared memory, half of RAM |

---

## 2. 2.2 — Local account management

### The three account files

| File | Mode | Contents | Format |
|------|------|----------|--------|
| **`/etc/passwd`** | `644` (world-readable) | Login name, **UID**, **GID**, comment, home, shell | `root:x:0:0:root:/root:/bin/bash` |
| **`/etc/group`** | `644` | Group name, **GID**, member list | `sudo:x:27:tony,alice` |
| **`/etc/shadow`** | `640`/`600` **root-only** | Encrypted password, last change, min/max/age/warn, **inactive**, expire | `tony:$6$SALT$HASH:19000:0:99999:7:::` |

| Field | `passwd` | `shadow` |
|-------|----------|----------|
| 1 | Login name | Login name |
| 2 | `x` (placeholder — password is in shadow) | **Hashed password** (`$6$` = SHA-512, `$y$` = yescrypt) |
| 3 | **UID** | Date of last password change (days since epoch) |
| 4 | **GID** | Minimum password age |
| 5 | GECOS/comment (full name) | Maximum password age |
| 6 | Home directory | Warn days before expiry |
| 7 | Login shell | Inactivity period → auto-lock |

> [!danger] `/etc/passwd` never contains the password
> The `x` in field 2 is a placeholder. Passwords live in **`/etc/shadow`, readable only by root**. A question asking "where are passwords stored" or "which file can a normal user not read" wants `shadow`. The only historical exception is the obsolete `/etc/passwd-` backup and `+` NIS entries.

### Identifiers

| Term | Meaning |
|------|---------|
| **UID** | Numeric user ID. **0 = root** |
| **GID** | Numeric group ID. **0 = root group** |
| **EUID** | **Effective** UID — what the process *actually* runs as right now. Equals UID normally; equals 0 for a setuid binary |
| **EGID** | **Effective** GID — same logic for groups |

### UID ranges

| Range | Purpose |
|-------|---------|
| **0** | `root` |
| **1–499** (or 1–999, distro-dependent) | **System accounts** — daemons (`apache`, `postgres`, `sshd`). No login |
| **500+ / 1000+** | **Normal user accounts** with login shells |

Distinguish three account types:
- **User accounts** — real humans, UID ≥1000, home dir, login shell
- **System accounts** — services, low UID, `/usr/sbin/nologin` shell
- **Service accounts** — service accounts created for a specific application's privileges (distinct from generic system accounts)

### Commands

| Task | Command | Notes |
|------|---------|-------|
| **Add user** | `useradd -m -s /bin/bash -g grp tony` | `-m` creates the home dir, `-s` shell, `-G` supplementary groups |
| Add user (Debian) | `adduser tony` | Wrapper that creates the group too, prompts interactively |
| **Add group** | `groupadd dev` | |
| **Delete user** | `userdel -r tony` | **`-r` also removes the home dir and mail spool** |
| Delete user (Debian) | `deluser --remove-home tony` | |
| Delete group | `groupdel dev` | Fails if it's a user's primary group |
| **Modify user** | `usermod -aG docker tony` | See the trap below |
| Modify group | `groupmod -g 1001 dev` | Changing GID orphans files owned by the old GID |
| Change shell | `chsh -s /bin/zsh tony` | |
| **Change password** | `passwd tony` | |
| **Lock** | `passwd -l tony` (prepend `!`), `usermod -L tony` | Also `chage -E 0` for expiry |
| **Unlock** | `passwd -u tony`, `usermod -U tony` | |
| Expire password now | `passwd -e tony` | Forces change at next login |
| Account expiry | `chage -E 2027-01-01 -M 90 -m 7 -W 14 tony` | `-E` expire, `-M` max days, `-m` min days, `-W` warn |

> [!danger] The `usermod` trap — the most-tested command detail in 2.2
> ```bash
> usermod -G docker tony        # ❌ REPLACES all supplementary groups → tony loses sudo, docker's old groups
> usermod -aG docker tony       # ✅ appends
> ```
> **`-a` (append) is mandatory** when adding a group to a user who already has groups. Also, `usermod` **does not update existing processes** — the user must log out and back in for group changes to take effect.
>
> And `usermod -d /new/home -m tony` moves the home dir; without `-m` it sets the path but leaves the files behind.

### Listing and inspecting users

| Command | Answers |
|---------|---------|
| `id` / `id tony` | Your UID, GID, **all** supplementary groups |
| `whoami` | Current **effective** user |
| `groups` | Groups the current user belongs to |
| `getent passwd` | **Reads passwd through NSS** (includes LDAP/SSSD) — better than `cat` |
| `getent group` | Groups via NSS |
| `last` | Recent logins (`/var/log/wtmp`) |
| `lastlog` | Last login **per user** (`/var/log/lastlog`) |
| `who` | Currently logged in |
| `w` | Who + what they're running |
| `finger` | Detailed user info |

`last -10` shows failed attempts too — useful for spotting brute force (objective 5.5: "high failed log-in attempts").

### Login files

| Path | Role |
|------|------|
| `/etc/profile` | System-wide login environment |
| `/etc/profile.d/*.sh` | Drop-in scripts sourced by `/etc/profile` |
| `/etc/skel/` | **Skeleton template** for new home dirs — `.bashrc`, `.profile`, `.forward` |
| `~/.bashrc`, `~/.bash_profile` | Per-user (see Domain 1 §5) |

> `useradd` copies **`/etc/skel`** into the new home dir — **only if you pass `-m`**. Missing `-m` is a top cause of "new user has no .bashrc".

---

## 3. 2.3 — Processes and jobs

### Process identification

| Term | Meaning |
|------|---------|
| **PID** | Process ID — unique while the process lives |
| **PPID** | **Parent** PID — who created it. `PPID 1` = started by systemd (an orphan adopted by init) |
| PGID / SID | Process group / session — how shells manage jobs |

`ps -ef` shows PID, PPID, and the full command. `ps aux --sort=-%mem | head` is the practical "what's eating memory".

### Process states

| State | Code | Meaning |
|-------|------|---------|
| **Running** | `R` | Actively executing or on the run queue |
| **Sleeping (interruptible)** | `S` | Waiting for an event; **can be woken** by a signal |
| **Uninterruptible / disk sleep** | `D` | Waiting on I/O that cannot be interrupted. **Not killable** even with `-9`. Long `D` state = failing disk |
| **Stopped** | `T` | Suspended by `Ctrl+Z` or `SIGSTOP` |
| **Zombie** | `Z` | Finished, but the parent hasn't reaped it. Still a PID entry |

> [!tip] Zombies and `D` state are the two the exam asks about
> - **Zombie** = process is dead but its parent never called `wait()`. Harmless in small numbers; a flood means the parent is buggy/not reaping. PID stays in the table, but no memory is used.
> - **`D` state** = the process is waiting on uninterruptible I/O. `kill -9` **will not** work. If it won't clear, the storage is failing — check `dmesg` for I/O errors, SMART, and cabling.

### Process inspection tools

| Tool | Best for |
|------|----------|
| `ps` | Snapshot (`-ef`, `-aux`, `--forest`) |
| `top` | Live view (`1` per-CPU, `P`/`M` sort by CPU/mem, `k` kill, `q` quit) |
| `htop` | Better interactive version — tree view `F5`, filter `F4`, search `F3` |
| `atop` | Records history — you can replay what happened 10 minutes ago. Ideal for intermittent problems |
| `pstree -p` | Process tree showing parent/child |
| **`/proc/<PID>/`** | The actual kernel data: `cmdline`, `status`, `environ`, `fd/`, `exe`, `cwd` |
| `lsof -p PID` | Files and sockets the process has open |
| **`strace`** | Trace **syscalls** — `-p PID` attach, `-f` follow forks, `-e trace=network`, `-c` summary |
| `mpstat` | Per-CPU utilisation |
| `pidstat` | Per-process statistics |

`cat /proc/PID/status` gives `PPid`, `State`, `Threads`, `VmRSS`. `cat /proc/loadavg` gives the load average.

### Priority (nice)

| Command | Effect |
|---------|--------|
| `nice -n 10 command` | Start with a **higher nice value = lower priority** |
| `nice command` | Default increment of 10 |
| `renice -n 5 -p 1234` | Change priority of running PID 1234 |

- Range **−20 (highest priority)** to **19 (lowest)**. Only `root` can use negative values.
- `top` shows `PR`; lower number = higher priority.
- Lowering priority = more polite to other users. **Raising it (negative) reduces responsiveness for everyone** — an anti-pattern on shared systems.
- **Higher nice value is lower priority** — the classic exam confusion.

### Process limits

```bash
ulimit -a                    # current user's limits
ulimit -n 4096               # max open files
ulimit -u 100                # max processes (nproc)
cat /etc/security/limits.conf
```
Related: `cgroups`/`systemd` unit limits (`MemoryMax=`, `TasksMax=`), disk **quotas**, and `nice` — different axes of the same "limit one process" idea.

### Signals — memorise this table

| Signal | Number | Default action | Catchable? | Use it for |
|--------|-------:|----------------|------------|------------|
| **SIGHUP** | **1** | Terminate | ✅ | Reload config / drop sessions — `ssh`, `nohup` detaches via this |
| **SIGINT** | **2** | Terminate | ✅ | Interactive interrupt — **Ctrl+C** |
| **SIGQUIT** | **3** | Terminate + core dump | ✅ | **Ctrl+\** |
| **SIGILL / SIGABRT / SIGFPE / SIGSEGV / SIGPIPE / SIGKILL** | 4 / 6 / 8 / **11** / 13 / **9** | **Terminate (core)** for most; **abort** for 6; SIGPIPE default is **ignore** | 4,6,8,11,13 ✅ · **9 ❌** | Faults — a **segfault is signal 11** |
| **SIGTERM** | **15** | Terminate | ✅ | **Graceful shutdown — this is what you send first** |
| **SIGCONT** | 18 | Continue | ✅ | Resume a stopped process |
| **SIGSTOP** | 19 | **Stop (suspend)** | ❌ | `kill -STOP` / **Ctrl+Z** — cannot be caught or ignored |
| **SIGKILL** | **9** | Terminate immediately | ❌ | **Last resort only** |

> [!danger] TERM before KILL — tested constantly
> ```bash
> kill 1234            # == kill -TERM 1234   (graceful; the process can clean up)
> kill -TERM 1234      # ✓ correct first step
> kill -KILL 1234      # ✗ first step is wrong — no cleanup, possible data loss/corruption
> kill -9 1234         # only after TERM has been given a grace period
> ```
> SIGTERM lets a daemon flush buffers, close DB connections, and remove its PID file. SIGKILL gives it no chance. **Always TERM, wait, then KILL.** If TERM doesn't work, the process is probably stuck in `D` state — KILL won't help either.

**Related commands:** `kill` (PID) · `killall name` · `pkill -f pattern` (matches the **full command line** — careful, it can match *your own* `pkill`) · `pidof name` · `killall5` / `kill -- -PGID` (kill a whole process group).

### Job control

| Command | Action |
|---------|--------|
| `cmd &` | Run in background |
| `jobs` | List background jobs of this shell |
| `fg %1` | Bring job 1 to the foreground |
| `bg %1` | Resume job 1 in the background |
| `Ctrl+Z` | **Suspend** the foreground job (SIGTSTP → `T` state) |
| `Ctrl+C` | **Interrupt** the foreground job (SIGINT) |
| `Ctrl+D` | **EOF** on stdin — end input / log out of a nested shell |
| `disown` | Remove from the shell's job table so it survives exit |
| `nohup cmd &` | Ignore SIGHUP — survives logout |
| `exec cmd` | **Replace** the current shell with `cmd` — the shell is gone afterwards |

> **`nohup` vs `disown` vs `&`** — the exam will ask what happens when you log out:
> `cmd &` → dies on logout (gets SIGHUP). `disown` → not in the job table, survives. `nohup cmd &` → **ignores SIGHUP**, survives. For anything long-running, prefer a [[Tmux_Tutorial|tmux]] session or a **systemd service** — that's the real-world answer and it also gets you logging and restart-on-failure.

### Scheduling

| Method | Runs | Use |
|--------|------|-----|
| **`at`** | **One time**, at a specified moment | `at 23:00`, `echo "cmd" \| at now + 1 hour`, `atq` (queue), `atrm` (remove) |
| **`crontab`** | **Recurring** on a schedule | The workhorse |
| **`anacron`** | Recurring, **catches up** after downtime | For laptops/desktops that are off at 3 am — runs the missed job at next boot |
| **systemd timers** | Recurring or calendar-based, with logging + dependencies | The modern replacement for cron |

#### `crontab` syntax

```
 ┌───────────── minute (0-59)
 │ ┌─────────── hour (0-23)
 │ │ ┌───────── day of month (1-31)
 │ │ │ ┌─────── month (1-12 or JAN-DEC)
 │ │ │ │ ┌───── day of week (0-7, 0 and 7 = Sunday, or SUN-SAT)
 │ │ │ │ │
 * * * * *  command
```

| Syntax | Meaning |
|--------|---------|
| `*` | Every |
| `5` | Exactly 5 |
| `1,15,30` | 1, 15, and 30 |
| `1-5` | 1 through 5 |
| `*/5` | Every 5th |
| `@daily` / `@hourly` / `@weekly` / `@monthly` / `@yearly` | Shorthand for `0 0 * * *` etc. |
| `@reboot` | Run once, at startup |

```bash
crontab -e                  # edit MY crontab
crontab -l                  # list it
crontab -r                  # delete it
30 2 * * 1-5 /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
@reboot /opt/app/start.sh
```

| Location | Purpose |
|----------|---------|
| `/etc/crontab` | System-wide, **has a user field**, managed by root |
| `/etc/cron.d/` | Drop-in files, **must include the user field**, filename **can't contain dots** |
| `/etc/cron.{hourly,daily,weekly,monthly}/` | Run-at-interval scripts |
| `/var/spool/cron/crontabs/<user>` | Per-user crontabs (RHEL). Debian: `/var/spool/cron/crontabs` too |

> [!danger] Four ways cron silently fails
> 1. **Environment is minimal.** cron gets almost no `PATH` (often just `/usr/bin:/bin`) and **no variables**. Always use **absolute paths**: `/usr/local/bin/backup.sh`, not `backup.sh`.
> 2. **Output is mailed** to a nonexistent address — so failures vanish. Redirect: `>> /var/log/job.log 2>&1`.
> 3. **Permissions.** The cron daemon must be able to `cd` into the directory and read the script. Don't write scripts to `/tmp` — it's mounted `noexec` on many systems.
> 4. **The daemon isn't running.** `systemctl status cron` / `crond`. And a **percent sign `%` in the command** is interpreted by cron as a newline — escape it as `\%`.

---

## 4. 2.4 — Configure and manage software

### Package managers by family

| Task | Debian/Ubuntu | RHEL/Rocky/Alma | openSUSE |
|------|---------------|-----------------|-----------|
| **Install** | `sudo apt install pkg` | `sudo dnf install pkg` (or `yum`) | `sudo zypper install pkg` |
| **Update index** | `sudo apt update` | *(automatic)* | `sudo zypper refresh` |
| **Upgrade packages** | `sudo apt upgrade` | `sudo dnf upgrade` | `sudo zypper update` |
| **Full upgrade** | `sudo apt full-upgrade` | `sudo dnf upgrade` | — |
| **Remove** | `sudo apt remove pkg` | `sudo dnf remove pkg` | `sudo zypper remove pkg` |
| **Remove + config** | `sudo apt purge pkg` | *(configs usually in a separate `.config` pkg)* | — |
| **Search** | `apt search pkg` | `dnf search pkg` | `zypper se pkg` |
| **Info** | `apt show pkg` | `dnf info pkg` | `zypper info pkg` |
| **List installed** | `dpkg -l` | `rpm -qa` | `rpm -qa` |
| **What owns this file** | `dpkg -S /usr/bin/foo` | `rpm -qf /usr/bin/foo` | `rpm -qf` |
| **Clean up** | `sudo apt autoremove` | `sudo dnf autoremove` | `zypper clean -a` |
| **Low-level install** | `sudo dpkg -i pkg.deb` | `sudo rpm -ivh pkg.rpm` | `rpm -Uvh` |
| **Fix broken deps** | `sudo apt -f install` | `sudo dnf install` (resolves) | — |

> [!tip] The one-liner the exam tests
> **`dpkg` installs; `apt` installs *and* resolves dependencies.** `dpkg -i` will happily install a broken `.deb` and leave you with unmet dependencies; `apt install` sorts that out automatically.
> Same on RHEL: **`rpm -i` does not resolve remote dependencies; `dnf`/`yum` does.**
>
> Also: **use `apt-get` inside scripts**, not `apt`. `apt` prints a progress bar and warns when used non-interactively; `apt-get` has a stable, machine-readable CLI.

### Repositories

| Concept | Meaning |
|---------|---------|
| **Repository** | A configured source of packages |
| **Source** | A URL to a repo, defined in `/etc/apt/sources.list` (`.d/*.list`) or `/etc/yum.repos.d/*.repo` |
| **GPG signature** | Verifies the package came from the publisher and is unmodified |
| **Third-party repo** | Extra vendor repo — must be **added with its key** |
| **Exclusion** | Prevent specific packages from a repo (`exclude=` in `.repo`, or apt pinning) |

```bash
# GPG key management
sudo rpm --import https://example.com/RPM-GPG-KEY-example
gpg --show-keys /path/to/key
# Verify a downloaded package
gpg --verify package.sig package
```

> **Security angle (3.4 / 5.4):** installing from an **unverified or HTTP third-party repo** is a security finding. The correct answer is always: use a signed HTTPS repo with a verified GPG key, and prefer the distro's own repos.

### Language-specific package managers

| Tool | Language | Commands |
|------|----------|----------|
| **pip** | Python | `pip install x`, `pip3`, `pipx` (CLI apps, isolated), requirements.txt |
| **cargo** | Rust | `cargo install x`, `cargo add`, built into the Rust toolchain |
| **npm** | Node.js | `npm install x`, `npm i -g`, package.json |

> **Never `pip install` into system Python** — it breaks `apt`/`dnf` upgrades. Use `venv`, `pipx`, or `uv`.

### `update-alternatives` / `alternatives`

Lets several programs claim the same name and be selected system-wide:

```bash
sudo update-alternatives --install /usr/bin/editor editor /usr/bin/nano 100
sudo update-alternatives --config editor     # interactive choice
update-alternatives --display editor         # show current
```

Used for `editor`, `python3`, `java`, `awk` (gawk/mawk/original-awk).

### Building from source

```bash
tar -xzf app-1.2.tar.gz && cd app-1.2
./configure --prefix=/usr/local     # or cmake / meson
make
make install                        # or sudo make install
make clean
```

- `./configure` generates the `Makefile` from `configure.in` (autotools); `./configure --help` lists every option.
- `make install` writes to `/usr/local` by default (not `/usr`), keeping it separate from distro-managed files.
- The modern step: `./autogen.sh` when you got it from git instead of a release tarball.
- **Always read `INSTALL` and `README`** first. Building from source does **not** get you security updates or dependency resolution — a trade-off the exam implies.

### Sandboxed applications

| Tool | Model |
|------|-------|
| **Flatpak** | Sandboxed, centralised repos (Flathub), system-wide, `flatpak install flathub org.x.Y` |
| **Snap** | Canonical, auto-updating, confined, `snap install` |
| **AppImage** | **Single self-contained file**, run and delete — no install at all. Needs `--appimage-extract` to inspect |

Commonality: all three bundle dependencies so the app can't break your system, and all three run in a **sandbox** with restricted access.

### Common services (objective 2.4)

| Service | Protocol | Typical daemon | Config |
|---------|----------|----------------|--------|
| **DNS** | 53 (UDP/TCP) | `bind9` (named), `dnsmasq`, `unbound` | `/etc/bind/named.conf` |
| **NTP** | 123 (UDP) | `chronyd`, `ntpd` | `chrony.conf` |
| **PTP** | 319/320 | `ptp4l` (Precision Time Protocol — hardware clock sync) | `ptp4l.conf` |
| **DHCP** | 67/68 (UDP) | `isc-dhcp-server`, `dnsmasq` | `/etc/dhcp/dhcpd.conf` |
| **HTTP** | 80 / 443 | **Apache `httpd`**, **Nginx** | `/etc/httpd/conf/httpd.conf`, `/etc/nginx/nginx.conf` |
| **SMTP** | 25 (send), 587 (submission) | `postfix`, `sendmail`, `exim` | `main.cf` |
| **IMAP4** | 143 / 993 | `dovecot`, `courier-imap` | `dovecot.conf` |

> `dhclient.conf` / NetworkManager dhcp options are the **client** side; `dhcpd.conf` is the **server** side. Reading objectives will trip on this.

---

## 5. 2.5 — Manage Linux using systemd

### systemd units

| Unit type | Ends in | What it does |
|-----------|---------|--------------|
| **Service** | `.service` | A managed process (sshd, nginx, cron) |
| **Socket** | `.socket` | Listens and activates a service on connection |
| **Target** | `.target` | Groups units; a **runlevel replacement** |
| **Timer** | `.timer` | Triggers a `.service` on a schedule |
| **Mount** | `.mount` | Filesystem mounts (fstab integration) |
| **Path** | `.path` | Triggers when a file/dir changes |
| **Slice** | `.slice` | Resource groups — a hierarchy for limits |

**Targets = the new runlevels:**
| Old init | systemd target |
|----------|----------------|
| runlevel 3 | `multi-user.target` (**no GUI**) |
| runlevel 5 | `graphical.target` (**with GUI**) |
| `init 0` | `poweroff.target` |
| `init 6` | `reboot.target` |
| — | `rescue.target`, `emergency.target`, `default.target` |

Files: `/etc/systemd/system/` (admin), `/usr/lib/systemd/system/` or `/lib/systemd/system/` (packages), `~/.config/systemd/user/` (user units).

### `systemctl` verbs — memorise this table

| Verb | Immediate effect | Survives reboot? |
|------|------------------|-----------------|
| **`start`** | **Now** | ❌ No |
| **`enable`** | **Nothing now** — sets it to start at boot | ✅ Yes |
| **`restart`** | Stop + start now | ❌ |
| **`reload`** | Re-read config without stopping (if supported) | ❌ |
| **`stop`** | Stop now | ❌ |
| **`status`** | Show state + recent logs | — |
| **`enable --now`** | **Both** | ✅ |
| **`disable`** | Don't start at boot | ❌ |
| **`mask`** | **Block entirely** — symlink to `/dev/null`. Even `start` fails | ✅ |
| **`unmask`** | Reverse a mask | — |
| **`edit`** | Drop into an editor for a drop-in override | ✅ |
| **`daemon-reload`** | Reload unit files after editing them | ❌ |
| **`is-enabled` / `is-active`** | Query state (`enabled`, `disabled`, `masked`, `static`; `active`, `inactive`, `failed`) | — |

> [!danger] start vs enable — the single most-tested systemd distinction
> A scenario: *"The service works now, but after a reboot it's gone."* → `systemctl enable foo`
> A scenario: *"The service stopped and isn't coming back right now."* → `systemctl start foo`
> Both? → **`systemctl enable --now foo`**
>
> And: **after editing any unit file, run `systemctl daemon-reload`** or systemd keeps using the old definition. This is the other half of the classic scenario question.

**Query commands**
```bash
systemctl status nginx
systemctl is-enabled nginx
systemctl list-units --type=service --state=running
systemctl list-units --failed          # ← first command for "something's broken"
systemctl list-unit-files --state=enabled
systemctl cat nginx                    # full unit definition
systemctl show nginx                   # all properties
```

### systemd utilities

| Command | Use |
|---------|-----|
| **`systemd-analyze`** | **`systemd-analyze blame` → what's making boot slow. Also `critical-chain`, `verify` |
| **`systemd-blame`** | Boot time per unit (shorthand for `systemd-analyze blame`) |
| **`hostnamectl`** | `set-hostname`, `set-chroot`, show OS/kernel/host info |
| **`timedatectl`** | Timezone, NTP sync, system clock (`set-timezone`, `set-ntp`) |
| **`resolvectl`** | systemd-resolved — DNS status and per-link DNS config |
| **`sysctl`** | Kernel parameters; `-w` writes, `-p` loads a file. Persist in `/etc/sysctl.d/` |
| **`journalctl`** | See Domain 5 §1 |
| **`loginctl`** | Sessions and users (`list-sessions`, `user-status`) |

### Journal

```bash
journalctl -u nginx -f              # follow this service's logs
journalctl -b                        # THIS boot
journalctl -b -1 -p err             # previous boot, errors only
journalctl --since "1 hour ago"
journalctl -k                        # kernel messages only
journalctl -e                        # jump to the end
journalctl -u nginx --since today -o export   # machine-readable
```

Persisted in `/var/log/journal/`. If `journalctl` shows nothing after a reboot, the journal is **volatile** — uncomment `Storage=persistent` in `/etc/systemd/journald.conf` and restart `systemd-journald`.

---

## 6. 2.6 — Manage applications in a container

### Runtimes

| Runtime | Notes |
|---------|-------|
| **Docker** | The market default; `docker` CLI + `dockerd` daemon |
| **Podman** | **Daemonless**, **rootless**, **UID-mapped**; Docker-compatible CLI — `alias docker=podman` |
| **containerd** | Industry-standard low-level runtime used by Kubernetes |
| **runC** | The actual low-level OCI runtime that containerd/containerd uses to create containers |

### Core command groups

```bash
# Lifecycle
docker pull nginx:1.27
docker build -t myapp:1.0 .
docker run -d --name web -p 8080:80 myapp:1.0
docker exec -it web bash          # ← run a shell INSIDE the running container
docker logs -f web
docker stop web && docker start web
docker rm web
docker inspect web                # full JSON metadata
docker ps -a                      # list (all)

# Images
docker images
docker tag myapp:1.0 registry.example.com/myapp:1.0
docker push / pull
docker system prune -a            # ⚠️ destructive

# Cleanup
docker container prune             # stopped containers
docker image prune                 # dangling images
docker volume prune                # unused volumes
```

> [!tip] `run` vs `exec` — tested in scenarios
> - **`docker run`** creates a **new** container from an image.
> - **`docker exec`** runs a command in an **already running** container.
> To debug a live problem, you **exec** in. To deploy, you **run**. "Inspect the environment inside the running server container" → `exec`, never `run`.

### `docker run` flags that matter

| Flag | Effect |
|------|--------|
| `-d` | Detached (background) |
| `-it` | Interactive + TTY — needed for shells |
| `-p 8080:80` | **Host:container** port map |
| `-v /host:/ctr` | **Volume** — bind mount or named volume |
| `--name web` | Give it a name |
| `-e KEY=VAL` | **Environment variable** |
| `--restart unless-stopped` | Restart policy |
| `--privileged` | ⚠️ **Almost all isolation removed** — host devices, capabilities |
| `--network` | Attach to a network |
| `--memory 512m --cpus 1` | Resource limits |

### Dockerfile directives (all on the objectives)

| Directive | Purpose | Exam note |
|-----------|---------|-----------|
| **`FROM`** | Base image | Everything builds on this. **Must be first** |
| **`RUN`** | Execute a command at build time | Creates a **new layer**. `RUN apt update && apt install -y x` — **always combine** so the update layer is cached |
| **`CMD`** | Default command/args | **Overridable** at runtime: `docker run img ls` |
| **`ENTRYPOINT`** | The main executable | **Not** easily overridable. `ENTRYPOINT ["nginx"]` + `CMD ["-g", "daemon off;"]` |
| **`USER`** | Run subsequent steps as non-root | **Security best practice** — a non-root container is a better answer on the exam |
| **`EXPOSE`** | Documents the port (does **not** publish it) | `-p` actually publishes |
| `ENV` | Environment variable | |
| `COPY` / `ADD` | Copy files in | `ADD` also extracts tarballs and fetches URLs |
| `WORKDIR` | Set working directory | |
| `VOLUME`, `LABEL`, `ARG`, `HEALTHCHECK` | | |

> [!danger] ENTRYPOINT vs CMD — the classic Dockerfile question
> - **`ENTRYPOINT`** = *what program runs*. Fixed. `docker run img bash` will **still run the entrypoint** with `bash` as arguments.
> - **`CMD`** = *default arguments*. `docker run img bash` **replaces it entirely**.
>
> Standard idiom: `ENTRYPOINT ["entrypoint.sh"]` + `CMD ["--default-flag"]` — so you can override the *flags* but keep the *entrypoint*.
> Also: `ENTRYPOINT ["nginx"]` in **exec form** (JSON array) is required because shell form makes nginx a child of `/bin/sh` and signals never reach it. The objective's `CMD`/`ENTRYPOINT` pairing is almost always about this.

### Volumes

| Type | Syntax | Notes |
|------|--------|-------|
| **Bind mount** | `-v /host/path:/ctr/path` | Maps a specific **host** directory. Use for config and logs |
| **Named volume** | `-v mydata:/ctr/path` | Docker-managed, in `/var/lib/docker/volumes/`. Survives container deletion |
| **Tmpfs** | `--tmpfs /tmp` | RAM-backed |

```bash
docker volume create pgdata
docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:16
docker volume ls
docker volume inspect pgdata
```

> **Volumes persist; the container's writable layer does not** when the container is removed. Data outside a volume is lost on `docker rm`. **SELinux context** matters for volume mounts on RHEL-family systems — use `-v /host:/ctr:z` (or `:Z`) so SELinux relabels the mount, or the container gets denied access. This is the explicit join between 2.6 and 3.1 the exam likes.

### Networks

| Type | Behaviour |
|------|-----------|
| **bridge** | Default. Containers get a private IP; outbound works via NAT; inbound needs `-p` |
| **host** | **Shares the host's network namespace** — no isolation, container binds directly on host ports |
| **none** | **No networking at all** — only loopback |
| **overlay** | Spans **multiple hosts** — the Docker Swarm / Kubernetes model |
| **macvlan** | Gives the container a **real MAC and its own IP on the LAN** |
| **ipvlan** | Shares the host's MAC, separate IP stack |

```bash
docker network create backend
docker network connect backend web
docker network ls
docker run --network none ...      # fully isolated
```

### Privileged vs unprivileged

| | Unprivileged (default) | **`--privileged`** |
|---|---|---|
| Capabilities | A small, curated subset | **ALL** |
| Devices | Only what's allowed | **All host devices** — `/dev`, `/sys` |
| Can load modules | ❌ | ✅ |
| Isolation | Meaningful | **Essentially none** — equivalent to root on the host |

> **The exam's correct answer is almost always unprivileged/rootless.** "Give the container root without giving it host root" → `podman run --user 0` or **rootless Podman with user namespace remapping** (which maps container root to an unprivileged host UID). Giving `--privileged` is the *distractor*.

### The layer model (understand this and containers make sense)

| Concept | Meaning |
|---------|---------|
| **Image** | Immutable template — layers + metadata |
| **Layer** | Each filesystem change in the Dockerfile creates one; layers are **shared and cached** |
| **Container** | A running **instance** of an image with a thin writable layer |
| **Tag** | A label like `nginx:1.27` or `:latest`. **Not immutable** — it moves |
| **Digest** | The content hash (`sha256:...`) — **immutable**, what you pin in production |
| **Namespace** | Isolation primitive: PID, mount, network, user, UTS, IPC |
| **cgroup** | **Resource control** — CPU/memory limits |
| **Registry** | Where images live (Docker Hub, GHCR, quay.io) |

> Namespaces = **what a container can see**. cgroups = **how much it can use**. Together they're Linux's native container tech. This distinction is directly testable.

---

## Objective self-check

- [ ] Hard link vs symlink — three concrete differences?
- [ ] `ln` across two filesystems — why does it fail?
- [ ] Which file holds the password hashes, and who can read it?
- [ ] `usermod -G docker tony` — what's wrong, and what's the fix?
- [ ] `userdel` vs `userdel -r` — what's left behind?
- [ ] New user's home dir has no `.bashrc` — why?
- [ ] SIGTERM vs SIGKILL — which first, and why?
- [ ] Why can't you kill a `D`-state process with `-9`?
- [ ] What's the difference between `chmod 4000`, `chmod 2000`, and `chmod 1000`?
- [ ] `start` vs `enable` — which makes it survive a reboot?
- [ ] You edited a unit file — what must you run next?
- [ ] `dpkg -i` vs `apt install` — what does each fail to do?
- [ ] Why does `pip install` into system Python break things?
- [ ] `docker run` vs `docker exec` — which for debugging a live container?
- [ ] `ENTRYPOINT` vs `CMD` — which one does `docker run img ls` replace?
- [ ] Name three container network types and when you'd use each.
- [ ] Why is `--privileged` the wrong answer to "container needs root"?

## Status

- [x] All objectives 2.1–2.6 covered
- [ ] Self-check passed cold
- [ ] Practised `usermod -aG` and confirmed group membership in a live session
- [ ] Ran a container with a non-root `USER`, a named volume, and `-p`