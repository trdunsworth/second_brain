---
type: study-guide
topic: CompTIA Linux+ XK0-006 domain 3.0 Security — AAA, privilege escalation, permissions, SELinux, SSH hardening, firewalls, NAT, encryption, hardening, audit
date: 2026-10-13
status: active
tags:
  - linux
  - comptia
  - linux-plus
  - security
  - selinux
  - firewall
  - encryption
  - hardening
---

# Domain 3.0 — Security (18%)

> Goal: AAA, sudo and file permissions, SELinux, SSH hardening, firewalls and NAT, account hardening, cryptography, audit and compliance.
> Related: [[LinuxPlus_2_Services_User_Management]] §2 · [[LinuxPlus_5_Troubleshooting]] §4 · [[Linux_Terminal_Toolkit]] §1.4

## 1. 3.1 — Authorization, authentication, and accounting (AAA)

### The three words (memorise the split)

| Term | Question it answers | Linux example |
|------|--------------------|---------------|
| **Authentication** | *Who are you?* | `pam_unix`, passwords, SSH keys, MFA, `/etc/shadow` |
| **Authorization** | *What may you do?* | `sudo`, file permissions, ACLs, SELinux |
| **Accounting** | *What did you do?* | `auditd`, `last`/`wtmp`, `journalctl`, `acct` |

> **Authentication ≠ Authorization.** A system can authenticate you perfectly and still deny everything you're allowed to do. Scenario questions that describe "the user proved who they are but still can't do the job" are testing this distinction.

### Privilege escalation

```bash
sudo -l                       # what am I allowed to run?
sudo -i                       # login shell as root — FULL root environment
sudo -s                       # shell as root, keep current environment
sudo -u alice command         # run as a specific user
su -                          # switch to root (login shell — full env)
su - alice                    # switch to another user with their environment
```

| Mechanism | Details |
|-----------|---------|
| **`sudo`** | Executes **one command** as another user; logs every use. Configured in `/etc/sudoers` + `/etc/sudoers.d/` |
| **`su`** | Switches the entire session. **No logging by default** — that's why sudo replaced it |
| **Setuid / SetGID** | `chmod u+s prog` — the program runs with the **owner's** privileges. Same idea, coarser |
| **Polkit** | Policy-based authorization for **GUI actions and system services** without full root |

**Groups that grant sudo:** `wheel` (RHEL family), `sudo` (Debian family).

### `sudoers` — the security-critical file

```sudoers
# /etc/sudoers.d/appadmin  — NEVER name these with dots (sudo ignores dot-containing files)
Defaults secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"

%docker ALL=(ALL) NOPASSWD: ALL        # ⚠️ docker group ≈ root
tony   ALL=(root) NOPASSWD: /usr/bin/systemctl restart myapp
tony   ALL=(ALL) NOEXEC: /usr/bin/vim   # can't run shell escapes from this sudo'd command
```

| Directive | Meaning | Risk if misused |
|-----------|---------|-----------------|
| **`NOPASSWD:`** | No password prompt | Convenient, but **removes the second factor** for that command. In a scenario asking "hardening", the correct answer is usually "remove NOPASSWD" |
| **`NOEXEC:`** | Don't allow the program to spawn other programs | Stops `sudo vim` becoming root shell via `:!sh` |
| **`PASSWD:`** | Explicitly require a password | |
| `Defaults` | Global options (timestamp timeout, secure_path, log settings) | |
| `secure_path` | PATH used by sudo | Prevents a writable-directory hijack |
| `Defaults log_input,log_output` | Log all input/output | |
| `Defaults timestamp_timeout=5` | Cached credential lifetime in minutes | |

> [!danger] Always edit with `visudo`
> ```bash
> sudo visudo                     # single file, syntax-checked
> sudo visudo -f /etc/sudoers.d/myfile
> ```
> **A syntax error in `/etc/sudoers` can lock you out of root entirely.** `visudo` validates before writing and refuses bad syntax. Drop-in files in `/etc/sudoers.d/` are read automatically — filenames **must not contain a dot** or sudo silently skips them. The objective explicitly lists `visudo`; "edit with `nano`" is the distractor.

### File attributes (beyond permissions)

```bash
chattr +i file        # immutable — cannot be modified, even by root (needs chattr -i to undo)
chattr +a log         # append only — can add lines, cannot change or delete existing
lsattr file           # view attributes
```

`+i` is the classic "protect the log file" answer, and also how ransomware/malware tries to lock itself in place. The catch: an immutable file can't be written to — including by legitimate log rotation, which is exactly why it's paired with `chattr -i` around rotation.

### Permissions — the core of 3.1

**Octal (numeric):** three digits, **owner / group / other**, each 0–7 = `r`(4) + `w`(2) + `x`(1)

| Digit | Binary | Permissions |
|-------|--------|-------------|
| 0 | 000 | `---` none |
| 1 | 001 | `--x` execute only |
| 2 | 010 | `-w-` write only |
| 3 | 011 | `-wx` |
| 4 | 100 | `r--` read |
| 5 | 101 | `r-x` read + execute |
| 6 | 110 | `rw-` |
| **7** | 111 | `rwx` |

| Octal | Symbolic | Meaning |
|-------|----------|---------|
| `644` | `rw-r--r--` | Regular file: owner edits, everyone reads |
| `755` | `rwxr-xr-x` | Script/dir: owner does everything, others read+execute |
| `600` | `rw-------` | Private — `~/.ssh/id_ed25519`, `.env` |
| **640** | `rw-r-----` | Owner + group read |
| **700** | `rwx------` | Private directory — `~/.ssh` |
| 750 | `rwxr-x---` | Group can work in it |
| 777 | `rwxrwxrwx` | **World-writable — always a security finding** |
| 666 | `rw-rw-rw-` | World-writable file — a finding |

**Convert both ways:**
- Permissions → octal: `rwx` = 4+2+1 = **7**; `r-x` = 4+1 = **5**; `rw-` = 4+2 = **6**
- Octal → permissions: **6** = 4+2 = `rw-`; **5** = 4+1 = `r-x`; **7** = `rwx`

**Symbolic mode:** `[ugoa][+-=][rwx]`
```bash
chmod 644 file
chmod u+x script
chmod go-w file          # remove write from group+other
chmod a+X dir            # capital X: only on dirs and already-executable files
chmod u=rw,go=r file
chown tony:dev file
chgrp dev file
chown -R tony:dev /srv/app
chown :dev file          # change group only
```

### Special permission bits

| Bit | Octal | Symbolic | Meaning | Real use |
|-----|------:|----------|---------|----------|
| **setuid** | **4000** / leading `4` | `u+s` | Run with the **owner's** privileges | `passwd`, `ping`, `sudo`, `mount` |
| **setgid** | **2000** / leading `2` | `g+s` | Run with the **group's** privileges; on a **directory**, new files inherit the directory's group | Shared team folders, `crontab` |
| **sticky bit** | **1000** / leading `1` | `+t` | On a directory, **only the file owner (or root) can delete/rename** | `/tmp`, `/var/tmp`, shared drop folders |

`ls -l` shows them as `s` or `t` replacing the `x`:
```
-rwsr-xr-x  1 root root  180000  sudo        # setuid
-rwxr-sr-x  2 tony dev  4096    shared/     # setgid on a dir
drwxrwxrwt  8 root root  4096    /tmp        # sticky
```

> **Every SUID binary on the system is a privilege-escalation target.** `find / -perm -4000 -o -perm -2000` is a standard hardening audit — an unexpected one is a finding.

### `umask` — the default creation mask

`umask` **subtracts** from the default permissions for new files and directories.

| | Base mode | With `umask 022` |
|---|---|---|
| Files | `666` (rw-rw-rw-) | `644` (rw-r--r--) |
| Directories | `777` (rwxrwxrwx) | `755` (rwxr-xr-x) |

Because directories **need** `x` to be traversable, umask is applied differently to each. `umask 077` gives the private `700`/`600` you'd want on a personal directory. Set in `~/.bashrc` or `/etc/profile`.

### Access Control Lists (ACLs) — beyond owner/group/other

Forgiving permission: allow a specific user or group access without changing ownership or a shared group's permissions.

```bash
setfacl -m u:tony:rw file          # grant user tony read+write
setfacl -m g:dev:rwx dir          # grant group dev on a directory
setfacl -m o:rx file              # others
setfacl -R -m u:tony:rwX dir/     # recursive, capital X = dirs + existing executables
setfacl -x u:tony file            # remove a user ACL
setfacl -b file                   # remove ALL extended ACLs
setfacl -m d:u:tony:rw dir/       # default ACL — inherited by new files
getfacl file                      # view
```

Marked in `ls -l` with a **`+`**: `-rw-rw----+ 1 root dev ...`

> **The classic ACL question:** *"A user needs write access to one file in a directory they don't own, and you must not change the file's owner or the directory's permissions."* → **ACL**, with `setfacl -m u:USER:rw`.

---

## 2. Access control — SELinux (also objective 3.1; troubleshoot in 5.4)

### The core model

SELinux is **mandatory access control**: even root is constrained by policy. Labels (contexts) on every file and process are checked against policy rules.

### States — memorise all three

| State | Behaviour | Use |
|-------|-----------|-----|
| **Enforcing** | Policy **enforced**; violations are **blocked and logged** | Production |
| **Permissive** | Policy **not enforced**, but violations are **still logged** | **Troubleshooting** |
| **Disabled** | SELinux **not loaded at all** — no labels, no checks | Boot with `selinux=0`; needs a relabel of the filesystem to re-enable |

```bash
getenforce                     # Enforcing | Permissive | Disabled
setenforce 0                   # → Permissive  (runtime only, lost on reboot)
setenforce 1                   # → Enforcing
sestatus                       # detailed status
```

> [!danger] The security answer the exam wants
> **Put SELinux in Permissive to confirm the diagnosis, then FIX THE PROBLEM, then return to Enforcing.**
> Disabling SELinux (or setting `enforcing=0` in the grub config) "fixes" the symptom by removing all MAC enforcement — that is the **distractor**, and in a hardening question it's the wrong answer. Permissive keeps collecting the evidence you need to fix it properly.

### Commands

| Command | Use |
|---------|-----|
| `getenforce` / `setenforce` | Mode |
| `ls -Z file` | Show the **context** |
| `ps -Z` / `ps -eZ` | Process contexts |
| **`chcon`** | Change a context — **temporarily, by hand**. Persists until a relabel. Fragile |
| **`restorecon`** | **Reset a path's context to the policy default.** The correct fix |
| `semanage fcontext -a -t httpd_sys_content_t "/web(/.*)?"` | Add a **permanent** custom context rule |
| `semanage fcontext -l` / `-d` / `-m` | List / delete / modify rules |
| **`getsebool` / `setsebool`** | Toggle a **boolean** (a single on/off policy switch) |
| `sealert -a /var/log/audit/audit.log` | **Interpret the denial** — the best troubleshooting tool |
| **`audit2allow`** | Generate policy rules from log entries |
| `restorecon -Rv /` | Relabel an entire filesystem (needed after SELinux was disabled) |

```bash
# The correct workflow
getenforce                                    # 1. confirm it's the cause
setenforce 0                                  # 2. permissive to gather evidence
sealert -a /var/log/audit/audit.log           # 3. read the actual denial
restorecon -Rv /var/www                       # 4a. fix: restore default context
semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"   # 4b. or: define the right context permanently
setenforce 1                                  # 5. back to enforcing
```

> [!danger] `chcon` vs `restorecon` — the most-tested pair in 3.1/5.4
> - **`restorecon`** = *"put this back the way policy says it should be."* ✅ **This is the answer.**
> - **`chcon`** = *"I am telling policy what to do, by hand."* ✅ for a quick test. ❌ as a fix — it's overwritten by the next relabel, doesn't survive `restorecon`, and doesn't scale.
>
> Scenario phrasing to watch for: "a file's permissions are correct but the service can't read it" → **SELinux context**, fix with **`restorecon`**. "It's in `/srv` which isn't a standard web root and Apache can't read it" → `semanage fcontext` for a permanent rule.

### Contexts and booleans

```
system_u:object_r:httpd_sys_content_t:s0
  user  : role  : type            : level (MLS/MCS)
```
The **type** is the part that matters. Common web types:

| Type | Meaning |
|------|---------|
| `httpd_sys_content_t` | Content Apache may **read** |
| `httpd_sys_rw_content_t` | Content Apache may **read and write** |
| `httpd_sys_script_exec_t` | Executable scripts |
| `httpd_log_t` | Apache log files |
| `httpd_config_t` | Config files |
| `default_t` | Unlabelled — usually means **nothing has claimed this path** |

Booleans are named switches for policy features: `httpd_can_network_connect`, `httpd_enable_homedirs`, `container_manage_cgroup` (Podman/Docker), `nis_enabled`.

---

## 3. Secure remote access

### SSHD configuration — `/etc/ssh/sshd_config`

| Directive | Secure value | Note |
|-----------|--------------|------|
| **`PermitRootLogin`** | **`no`** | `yes`, `prohibit-password` (keys only), `without-password`, `no` |
| **`PasswordAuthentication`** | **`no`** (with keys) | Keys beat passwords |
| `PubkeyAuthentication` | `yes` | Key auth |
| `AllowUsers alice bobby` | **Allowlist** | Stronger than `DenyUsers` — default-deny |
| `AllowGroups sshusers` | Allowlist by group | |
| `X11Forwarding` | `no` | Disabled — reduces attack surface |
| `MaxAuthTries` | `3` | Slows brute force |
| `Port` | non-standard | Security through obscurity only |
| `ClientAliveInterval` | `300` | Disconnect idle sessions |
| `AllowTcpForwarding` | restrict if not needed | |

```bash
sshd -t                       # SYNTAX CHECK — always do this before restarting
sudo systemctl restart sshd   # or: systemctl reload sshd
sudo journalctl -u sshd -n 50
```

> **Keep a second session open when changing SSH config.** A typo in `sshd_config` plus a restart locks everyone out. Verify with `sshd -t` and reload rather than restart.

### Key-based authentication

```bash
ssh-keygen -t ed25519 -C "tony@laptop"        # generate
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host # install the public key
ssh -i ~/.ssh/id_ed25519 user@host             # use it
eval "$(ssh-agent -s)"                         # agent caches the passphrase
ssh-add ~/.ssh/id_ed25519
```

- **RSA 4096** is the fallback when Ed25519 isn't available.
- **RSA 2048 is the minimum acceptable**; anything less is weak.
- `.ssh` mode `700`, private key `600`, public key `644`. Wrong modes = sshd refuses the key.
- **`ssh-agent`** holds decrypted keys in memory so you type the passphrase once, not per host.

### SSH tunneling

| Type | Command | Use |
|------|---------|-----|
| **Local** (`-L`) | `ssh -L 5432:db:5432 user@bastion` | Access a remote service as if local — reach an internal DB |
| **Remote** (`-R`) | `ssh -R 8080:localhost:80 user@bastion` | Expose a local service on the remote |
| **Dynamic** (`-D`) | `ssh -D 1080 user@bastion` | SOCKS5 proxy — browse through the bastion |

### SFTP and chroot

- **SFTP** over SSH is the secure replacement for FTP. `sftp user@host`, or `ssh -s sftp host`.
- **Chroot** (`ChrootDirectory /home/jail`) confines a user to a subdirectory — they can't navigate up with `..`.
- Requirements: the jail directory and every parent must be **root-owned and not group/world-writable**, or chroot silently fails.

### `fail2ban`

Scans logs for failed auth attempts and **bans the offending IPs** (adds a firewall rule / `hosts.deny` for a configured time).
- Config: `/etc/fail2ban/jail.local`, jails in `/etc/fail2ban/jail.conf`
- Enabled jails: `firewallcmd-ipset`, `sshd`, `apache-auth`

### Insecure services to avoid

| Insecure | Why | Replace with |
|-----------|-----|--------------|
| **Telnet** (23) | Everything in **cleartext**, including the password | SSH |
| **FTP** (21) | Credentials and data in cleartext | SFTP / SCP |
| **TFTP** (69) | No authentication, no encryption, UDP | SFTP |
| `rsh`, `rlogin`, `rexec` | Cleartext, legacy | SSH |
| FTP `anonymous` | Public write access | SFTP |

Other hardening steps in the same objective:
- **Disable unused services** — if it's not needed, `systemctl disable --now <svc>`. Every listening port is attack surface.
- **Disable unused filesystems** — noexec/nosuid/nodev (see Domain 1 §3).
- **Remove unnecessary SUID/SGID** binaries.
- **Secure boot** — **UEFI Secure Boot** validates the bootloader/kernel signature chain; prevents bootkits.

---

## 4. 3.2 — Firewalls

### The three front-ends

| Tool | Layer | Distro | Notes |
|------|-------|--------|-------|
| **`firewalld` / `firewall-cmd`** | nftables | RHEL, Fedora | **Zones**, runtime vs permanent, rich rules |
| **`ufw`** | iptables/nft | Ubuntu, Debian | Simple, "uncomplicated", application profiles |
| **`nftables` / `iptables`** | netfilter kernel module | All | Low-level. **`iptables` is legacy**; **`nftables` is current** |
| `ipset` | — | — | Named sets of IPs for bulk rules (Deny/Allow lists) |

All of them sit on the **`netfilter`** kernel module — that's the actual packet-filtering engine.

### `firewall-cmd` — runtime vs permanent (the key distinction)

```bash
firewall-cmd --list-all                       # runtime (current session)
firewall-cmd --permanent --add-service=https  # change the PERMANENT config
firewall-cmd --reload                         # apply permanent → runtime
```

> [!danger] The most-tested firewalld mistake
> **`firewall-cmd --add-port=8080/tcp` without `--permanent` works *right now* and disappears on reload or reboot.** The correct hardening/persistence answer is **`--permanent` then `--reload`**.
> Symmetrically: to *remove* something that keeps coming back, change the **permanent** rule and reload — deleting only the runtime rule lets the permanent one restore it.

**Zones** — firewalld's model. Each interface is assigned a zone, and each zone has its own rules:
```bash
firewall-cmd --get-active-zones
firewall-cmd --zone=public --add-interface=eth0
firewall-cmd --set-default-zone=public
```
Built-in zones: `public`, `private`, `trusted`, `work`, `home`, `dmz`, `block`, `internal`, `external`.

**Ports vs services**
```bash
firewall-cmd --permanent --add-service=https      # by service name (looks up port in /etc/services)
firewall-cmd --permanent --add-port=8080/tcp     # by port number
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.0.0.0/8" port port="3306" protocol="tcp" accept'
firewall-cmd --list-all --zone=public
```

| | ufw |
|---|---|
| By service | `sudo ufw allow ssh` |
| By port | `sudo ufw allow 22/tcp` |
| From an address | `sudo ufw allow from 10.0.0.0/8 to any port 5432` |
| Deny | `sudo ufw deny 23/tcp` |
| Enable / status | `sudo ufw enable` / `sudo ufw status verbose` |

**`iptables` / `nftables` chains:** `INPUT`, `OUTPUT`, `FORWARD`. Policies are `ACCEPT` or `DROP` (default `ACCEPT` historically — **set `INPUT` to `DROP` and explicitly allow**, or you're not filtering anything).

```
nftables:  table inet filter { chain input { type filter hook input priority 0; policy drop; } }
iptables: iptables -P INPUT DROP; iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

> If a question says "the user can ping the server but not reach port 443", check the **firewall first**, then the **service listening state** (`ss -tulpn`). That's the standard two-step.

---

## 5. NAT

| Type | What it rewrites | Direction | Typical use |
|------|------------------|-----------|-------------|
| **SNAT** — Source NAT | **source** IP | Outbound | Many internal hosts → one public IP |
| **PAT** — Port Address Translation | source IP **+ port** | Outbound | Many internal hosts share **one** public IP by using different source ports. **"Port forwarding" on many home routers is actually SNAT+PAT** |
| **DNAT** — Destination NAT | **destination** IP (and often port) | **Inbound** | Forward an external port to an internal server — "port forwarding" for a web server |
| **Masquerading** | Source IP (without recording the original) | Outbound | SNAT variant for dynamic IPs |

> [!tip] Which direction is which — get this right once
> **Source** NAT modifies who the packet claims to be **coming from**. Used when traffic **leaves** your network.
> **Destination** NAT modifies who the packet is **going to**. Used when traffic **enters** your network.
> Diagram it: draw the packet, arrow it out → SNAT/PAT. Arrow it in → DNAT.

### Stateful vs stateless

| | Stateful (connection tracking) | Stateless |
|---|---|---|
| Tracks | Full **connection state** in `conntrack` | Each packet **independently** |
| Knows | An inbound packet belongs to an outbound connection | Nothing about prior packets |
| Handles | Return traffic automatically | Must allow both directions explicitly |
| Default | **firewalld, ufw, nftables (modern)** | Older iptables ruleset, simple ACLs |
| Risk | Memory/CPU for the conntrack table | Easy to accidentally block return traffic |

A **stateful** firewall automatically permits replies to permitted outbound connections — which is why a default-drop stateful firewall can be simple.

### IP forwarding (routing between interfaces)

```bash
sysctl net.ipv4.ip_forward          # check (1 = enabled)
sysctl -w net.ipv4.ip_forward=1     # set now
echo 'net.ipv4.ip_forward = 1' > /etc/sysctl.d/99-router.conf   # persist
sysctl -p /etc/sysctl.d/99-router.conf
```

Required for a Linux box to route traffic between two networks — it's a **router**, not just a NAT box.

---

## 6. 3.3 — OS hardening

### Authentication infrastructure

| Component | Role |
|-----------|------|
| **PAM** (Pluggable Authentication Modules) | The pluggable layer between login programs and authentication. Config lives in **`/etc/pam.d/<service>`** (e.g. `sshd`, `login`, `sudo`). Stackable: `pam_unix.so`, `pam_pwquality.so`, `pam_limits.so`, `pam_time.so`, `pam_tally2.so` |
| **LDAP** | Directory services — centralised user/group lookup |
| **Kerberos** | Ticket-based network authentication (**single sign-on**) |
| **SSSD** | System Security Services Daemon — caches and provides LDAP/AD/Kerberos identity to the OS (so `getent passwd` sees domain users) |
| **Winbind** | Older Samba method for AD/Windows domain membership |
| **`realm`** | `realm join example.com` — join an Active Directory domain from the command line |
| **Samba** | SMB/CIFS file & print sharing, and Windows interoperability |
| **Polkit** | Policy-based authorization for privileged actions |

> **PAM config is a security control surface.** A world-writable `/etc/pam.d/` entry, or a `pam_wheel.so use_uid` mismatch, is an escalation path. `pam_tally2` handles **lockout after N failures**.

### Logging

| Tool | Purpose |
|------|---------|
| `journalctl` | systemd journal — binary, structured, queryable. The modern default |
| **rsyslog** | Traditional syslog daemon. Config `/etc/rsyslog.conf` + `/etc/rsyslog.d/*.conf`. Files in `/etc/rsyslog.d/*.conf` define `/var/log/...` routing |
| **logrotate** | Rotates, compresses, and **prunes** old logs. Config `/etc/logrotate.conf` + `/etc/logrotate.d/`. Cron/systemd timer runs it |
| `/var/log/` | Where it all lands: `syslog`, `messages`, `auth.log` (Debian) / `secure` (RHEL), `kern.log`, `cron`, `dmesg`, `boot.log`, `audit/audit.log` |

> **`logrotate` without retention = a full disk.** `rotate 7` + `daily` + `compress` is the baseline. This links straight to the "OS filesystem full" troubleshooting item.

### System audit — `auditd`

The Linux **audit** subsystem records security-relevant events (who did what, with what result) in `/var/log/audit/audit.log`.

```bash
sudo systemctl enable --now auditd
sudo augenrules --load
cat /etc/audit/rules.d/audit.rules
```

Example rules:
```
-w /etc/passwd -p wa -k identity          # watch a file for writes/attribute changes
-w /etc/sudoers -p wa -k sudoers
-a always,exit -F arch=b64 -S execve -F euid=0 -k rootcmds   # log all root commands
-w /var/log/ -p wa -k logaccess
```

Audit rules are deliberately **not** a shell command — they're the `-a/-w`, `-F`, `-S` grammar above. Reading `audit.rules` is a direct objective item.

### Detection and response

| Concept | Meaning |
|---------|---------|
| **Anti-malware** | ClamAV, etc. — scan files, quarantine |
| **IoC** (Indicator of Compromise) | Observable evidence of a breach: a hash, an IP, a filename, a registry-style key. **IoCs are what you correlate across hosts** |
| Detection | Finding it — file integrity, logs, network monitoring |
| Response | Containing and eradicating it |

### Vulnerability management

| Term | Meaning |
|------|---------|
| **CVE** (Common Vulnerabilities and Exposures) | The public ID for a known vulnerability, e.g. `CVE-2024-12345` |
| **CVSS** (Common Vulnerability Scoring System) | Severity score 0–10, vector string. 7.0+ = High, 9.0+ = Critical |
| **Backporting patches** | Distros fix a CVE by patching the **older** version rather than releasing a new one — so "the version number is old" does **not** mean "unpatched". Check the **changelog/package release**, not just `rpm -q` |
| **Service misconfiguration** | Default passwords, verbose errors, world-readable, outdated TLS. Frequently the real finding, not a missing patch |
| **Port scanners** | `nmap`, `nc -zv` — find exposed services |
| **Protocol analyzer** | `tcpdump`, Wireshark — what is actually on the wire |

> **Backporting is the concept the exam tests.** A scenario will show an "outdated" package version and ask if it's vulnerable. The correct answer checks **whether the fix was backported** — not the version number.

### Standards and compliance

| Framework | What |
|-----------|------|
| **CIS Benchmarks** | Center for Internet Security — consensus hardening baselines for Linux distros (CIS RHEL Benchmark, CIS Debian Benchmark). Widely cited in audits |
| **OpenSCAP** | Open Security Content Automation Protocol — automated compliance scanning against those benchmarks. Also used to report PCI-DSS/ HIPAA alignment |
| Compliance regimes | PCI-DSS (payments), HIPAA (health data), GDPR (privacy), SOX (financial) |

---

## 7. File integrity and secure data destruction

### File integrity monitoring

| Tool | Purpose |
|------|---------|
| **AIDE** | Builds a database of file hashes/metadata; reports what changed. The classic FIM tool on Linux |
| **rkhunter** | Scans for rootkits, backdoors, and known exploits |
| **Tripwire** | Original commercial FIM (AIDE's ancestor) |
| Signed package verification | `rpm -V` / `dpkg --verify` checks installed files against package metadata |
| Installed file verification | `rpm -Va` — flags unexpected changes; `dpkg --verify` for Debian |

### Secure deletion

| Method | Command | Verdict |
|--------|---------|---------|
| `shred` | `shred -n 3 -z file` | ✅ Overwrites with random data, then zeroes. The objective's answer for a single file. **Caveat: useless on SSD/flash** — wear-levelling remaps blocks |
| `dd` | `dd if=/dev/urandom of=file bs=1M count=1` | ✅ Basic overwrite |
| `badblocks -w` | `badblocks -w /dev/sdb` | ✅ Wipe a **whole device** (or `-n` non-destructively test) |
| **Cryptographic erasure** | Destroy/expire the LUKS key | ✅✅ **The modern answer.** `cryptsetup-luksClose`, `wipefs`, or shredding the key. Instant, works on SSD |
| `rm` | | ❌ Recoverable — only unlinks the directory entry |
| `dd if=/dev/zero` | Single pass | ⚠️ Often recoverable; multi-pass or random is better |

> **Scenario framing:** "Delete a customer's financial records so they cannot be recovered" → **cryptographic erasure / LUKS key destruction**, because it's reliable on SSDs. `shred` is the accepted answer for a single file on spinning disk.

---

## 8. 3.4 — Account hardening

| Technique | Implementation |
|-----------|----------------|
| **Password complexity** | `pam_pwquality.so` / `/etc/security/pwquality.conf`: `minlen=12`, `minclass=4`, `dcredit=-1`, `ucredit=-1`, `ocredit=-1`, `difok=3` |
| **Password length** | The single most effective control. `minlen=12+`; passphrases beat complexity rules |
| **Password expiration** | `max days` in `/etc/login.defs` or `pam_pwquality`. `chage -M 90 user`. Modern guidance favours **length over forced rotation** |
| **Password reuse prevention** | `remember=5` in pwquality → the last 5 hashes can't be reused |
| **Password history** | `remember=N`; `/etc/security/opasswd` stores the history |
| **Password checking against breach lists** | `pam_pwhistory`, or check against **Have I Been Pwned** breach lists |
| **MFA** | SSH keys, TOTP apps, PAM modules, smartcards. Second factor for admin access |
| **Restricted shells** | `usermod -s /sbin/nologin svcacct` (no shell at all) or `/bin/rbash` (restricted bash — can't `cd`, can't redirect) |
| **Lockout after failed attempts** | **`pam_tally2`** — lock the account after N failures. Pairs with `fail2ban` for IP-based banning |
| **Avoid running as root** | Everything as a normal user + `sudo` for specific commands. Auditable, least privilege |

```bash
# Password policy for a user
sudo chage -m 7 -M 90 -W 14 -I 30 tony     # min age, max age, warn, inactive
chage -l tony                                # view
```

> **The modern nuance the exam includes:** password *expiration* is now considered weaker than length + MFA + breached-password screening. If a scenario asks "which is the strongest improvement", rotating passwords every 30 days on a user with MFA is usually **not** it; lengthening the minimum and blocking breached passwords usually is.

---

## 9. 3.5 — Cryptographic concepts

### Data at rest

| Tool | Use |
|------|-----|
| **GPG (GnuPG)** | Encrypt/decrypt **individual files**, sign, and verify signatures. `gpg --symmetric file`, `gpg --encrypt -r alice file`, `gpg --decrypt`, `gpg --verify`, keyrings in `~/.gnupg` |
| **LUKS2** (Linux Unified Key Setup 2) | **Full-disk / partition encryption** using dm-crypt. `cryptsetup luksFormat`, `cryptsetup open`, `cryptsetup luksAddKey`, `cryptsetup luksClose`. Standard on LUKS2 is **AES-XTS** |
| **Argon2** | **Memory-hard key derivation function** — the modern KDF (successor to bcrypt/scrypt/PBKDF2). Resists GPU cracking |

```bash
cryptsetup luksFormat /dev/sdb1                       # format (destroys data)
cryptsetup open /dev/sdb1 vault                       # -> /dev/mapper/vault
mkfs.ext4 /dev/mapper/vault
mount /dev/mapper/vault /mnt/secret
cryptsetup luksClose vault                           # unmounts the mapping
```

### Data in transit

| Item | Notes |
|------|-------|
| **OpenSSL** | The toolkit: `openssl s_client`, `genrsa`, `req`, `x509`, `genpkey`, `s_enc`, `enc`, `dgst`. The standard Linux TLS tool |
| **LibreSSL** | OpenBSD's fork, used on OpenBSD/FreeBSD |
| **WireGuard** | Modern, simple, fast VPN using Noise protocol |
| **TLS versions** | **1.3** current, **1.2** acceptable. **1.0 and 1.1 are deprecated and must be removed** |

```bash
openssl s_client -connect example.com:443 -servername example.com   # inspect a TLS handshake
openssl x509 -in cert.pem -text -noout                              # read a certificate
openssl genrsa -out key.pem 4096
```

### Hashing and integrity

| Concept | Notes |
|---------|-------|
| **SHA-256** | Standard secure hash. One-directional — cannot be reversed |
| **HMAC** | **Keyed** hash — authenticates a message *and* proves you have the key. `HMAC = Hash(key || message)` |
| **Weak algorithms to remove** | **MD5**, **SHA-1** (collision attacks), **DES**, **3DES**, **RC4**, **SSLv3**, **TLS 1.0/1.1** |

> **Hashing vs encryption** — tested constantly:
> - **Hashing** is **one-way**. You *verify*; you cannot *decrypt*. Fixed length (SHA-256 = 256 bits regardless of input).
> - **Encryption** is **two-way** with a key. You *decrypt*.
> - **HMAC** adds a secret key to a hash for authentication.

### Certificates and PKI

| Term | Meaning |
|------|---------|
| **PKI** (Public Key Infrastructure) | The whole system: certificates, authorities, keys, revocation |
| **CA** (Certificate Authority) | The trusted signer that issues certificates |
| **Certificate** | Binds a public key to an identity. Contains: subject, issuer, validity dates, public key, signature, SANs, key usage |
| **Root CA** | Self-signed top of the trust chain, pre-installed in the OS trust store |
| **Chain of trust** | Leaf → intermediate CA → root CA |
| **Self-signed certificate** | Signs itself. **Avoid on servers** — clients can't validate it without manual trust. Valid for testing/internal use |

**Trusted root certificates:**
- **No-cost** — Let's Encrypt (automated, 90 days, must be renewed), and public CAs
- **Commercial** — paid CAs (DigiCert, Sectigo) — historically offered longer lifetimes and insurance/warranty
- Install the CA certificate into the system trust store: `/etc/pki/ca-trust/source/anchors/` + `update-ca-trust` (RHEL), or `/usr/local/share/ca-certificates/` + `update-ca-certificates` (Debian)

> **Scenario:** "A server presents a self-signed certificate and browsers warn." The *correct production* fix is to install a **properly issued certificate from a trusted CA** (or Let's Encrypt), **not** to tell users to click through the warning and not to disable certificate validation.

---

## 10. 3.6 — Compliance and audit procedures

| Control area | Linux implementation |
|--------------|----------------------|
| **Who did what** | `auditd` + rules → `/var/log/audit/audit.log` |
| **When did it happen** | Timestamps in logs; **`chrony`/`timedatectl`** for trustworthy time. Logs with wrong clocks are worthless evidence |
| **Log retention** | **`logrotate`** with `rotate N` + `compress`; forward to a SIEM for immutable storage |
| **Config compliance** | **OpenSCAP** against **CIS Benchmarks** |
| **Configuration drift** | Compare against baseline; Ansible/Puppet enforce (Domain 4) |
| **Accountability** | Unique individual accounts, no shared logins; `last`/`lastlog`/`who` evidence |
| **Proof of change** | Version control for configs; documented, approved change tickets |

> **The framing question to expect:** *"Which control proves the system was compliant on a given date?"* → **logging with reliable, synchronised timestamps, retained per policy, and protected from modification** (forwarded off-box or immutable). `auditd` + `logrotate` retention + NTP sync is the answer.

---

## Objective self-check

- [ ] Authentication vs authorization vs accounting — one example of each
- [ ] `sudo -i` vs `su -` — what is the difference in environment?
- [ ] Why `visudo` and never `nano /etc/sudoers`?
- [ ] What does `NOPASSWD:` cost you? What does `NOEXEC:` prevent?
- [ ] Convert `rwxr-x---` to octal, and `750` back. What is it?
- [ ] What's the octal for setuid, setgid, and the sticky bit? Where does each matter?
- [ ] With `umask 022`, what are a new file's and a new directory's permissions?
- [ ] `chcon` vs `restorecon` — which one is the fix?
- [ ] All three SELinux states, and which one you use for troubleshooting?
- [ ] Which `sshd_config` directive prevents anyone logging in as root?
- [ ] `--add-port` vs `--permanent --add-port` — what happens at reboot?
- [ ] firewalld zones — what are they for?
- [ ] DNAT vs SNAT vs PAT — which direction does each apply to?
- [ ] Stateful vs stateless — what does a stateful firewall know that a stateless one doesn't?
- [ ] Why can a firewall block a service that's listening?
- [ ] Which algorithms must you remove, and why?
- [ ] Hash vs encryption vs HMAC — what's the difference?
- [ ] Why is `shred` unreliable on SSDs, and what's the better answer?
- [ ] What does "backporting" mean and why does it change how you assess an "old" package?

## Status

- [x] All objectives 3.1–3.6 covered
- [ ] Self-check passed cold
- [ ] Deliberately broken a `sudoers` rule and recovered with `visudo`
- [ ] Triggered a real SELinux denial and fixed it with `restorecon`
- [ ] Written an `audit.rules` that logs root commands