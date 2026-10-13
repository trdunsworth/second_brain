---
type: cheatsheet
topic: CompTIA Linux+ XK0-006 quick-reference tables — permissions, signals, systemd, LVM, RAID, mount options, ports, troubleshooting commands
date: 2026-10-13
status: active
tags:
  - linux
  - comptia
  - linux-plus
  - cheatsheet
  - reference
---

# Linux+ XK0-006 — Cheatsheet

> Goal: one page of tables to scan from while practicing. Print it.
> Related: [[LinuxPlus_Exam_Overview]] · [[LinuxPlus_Cheatsheet]] ← *(this note)* · [[Linux_Terminal_Toolkit]] (deeper)

## 1. Permissions

| Octal | Symbolic | Use |
|-------|----------|-----|
| **600** | `rw-------` | Private file — SSH keys, `.env` |
| **644** | `rw-r--r--` | Ordinary file |
| **640** | `rw-r-----` | Owner + group |
| **700** | `rwx------` | Private directory, `~/.ssh` |
| **750** | `rwxr-x---` | Team directory |
| **755** | `rwxr-xr-x` | Script, public directory |
| 664 | `rw-rw-r--` | Group-writable file |
| 775 | `rwxrwxr-x` | Group-writable directory |
| **777** | `rwxrwxrwx` | ⚠️ **Always a security finding** |

`r`=4, `w`=2, `x`=1 → add them. `r-x`=5, `rw-`=6, `rwx`=7.

| Special | Octal | Symbolic | `ls -l` |
|---------|------:|----------|---------|
| setuid | **4000** | `u+s` | `rws` |
| setgid | **2000** | `g+s` | `r-s` |
| sticky | **1000** | `+t` | `rwt` |

**umask** (subtracts): `022` → files `644`, dirs `755`. `077` → `600`/`700`.

---

## 2. Signals

| # | Name | Default | Catchable | Use |
|--:|------|---------|-----------|-----|
| 1 | HUP | terminate | ✅ | Reload config; `nohup` ignores it |
| 2 | INT | terminate | ✅ | `Ctrl+C` |
| 3 | QUIT | core dump | ✅ | `Ctrl+\` |
| 6 | ABRT | abort | ✅ | assert failure |
| **9** | **KILL** | terminate | ❌ | Last resort — no cleanup |
| **11** | SEGV | core dump | ✅ | **Segmentation fault** |
| 13 | PIPE | **ignore** | ✅ | Writing to a closed pipe |
| **15** | **TERM** | terminate | ✅ | **Graceful — send this first** |
| 18 | CONT | continue | ✅ | Resume |
| 19 | STOP | stop | ❌ | `Ctrl+Z`; cannot be caught |

**Order: `kill -TERM` → wait → `kill -KILL`.**

### Process states
| Code | State |
|------|-------|
| `R` | Running |
| `S` | Sleeping (interruptible) |
| `D` | Uninterruptible sleep — **`kill -9` will not work**; suspect failing storage |
| `T` | Stopped |
| `Z` | Zombie — dead, parent hasn't reaped |

**PPID 1** = parent died, re-parented to systemd/init.

### Exit codes
| Code | Meaning |
|-----:|---------|
| 0 | Success |
| 1 | General error |
| 2 | Misuse |
| 126 | Found, not executable |
| **127** | **Command not found** |
| 128+n | Killed by signal n (137=9, 143=15) |

---

## 3. UID ranges

| UID | Type |
|----:|------|
| **0** | root |
| 1–499 / 1–999 | System accounts (no login) |
| ≥1000 | Normal users |

**Account files:** `/etc/passwd` (644, readable, no password) · `/etc/group` (644) · **`/etc/shadow`** (600 root, holds hashes). Templates: `/etc/skel`.

**usermod: always `-aG`** or you replace all supplementary groups.

---

## 4. Filesystem Hierarchy

| Path | Contents |
|------|----------|
| `/bin`, `/sbin`, `/lib` | **Symlinks into `/usr`** on modern distros |
| `/boot` | Kernel, initrd, GRUB |
| `/dev` | `b` block · `c` character |
| `/etc` | Configuration |
| `/proc` | **Processes** (virtual) |
| `/sys` | **Devices** |
| `/usr` | Programs and libraries |
| `/var` | Variable data — **`/var/log`** |
| `/tmp`, `/dev/shm` | tmpfs |

---

## 5. LVM

**PV → VG → LV** (bottom-up)

| Layer | Create | List | Extend | Remove |
|-------|--------|------|--------|--------|
| PV | `pvcreate` | `pvs` | `pvresize` | `pvremove` |
| VG | `vgcreate` | `vgs` | `vgextend` | `vgremove` |
| LV | `lvcreate` | `lvs` | `lvextend`/`lvresize` | `lvremove` |

```bash
pvcreate /dev/sdb1 && vgcreate vg0 /dev/sdb1
lvcreate -n data -L 10G vg0 && mkfs.ext4 /dev/vg0/data
mount /dev/vg0/data /mnt/data
```

> ⚠️ **Two steps to grow a filesystem:**
> `lvextend -L +5G /dev/vg0/data` **then** `resize2fs /dev/vg0/data`
> XFS: `xfs_growfs /mnt/data` (**mount point**, and **cannot shrink**).
> Other: `pvs`, `vgscan`, `vgimport`, `vgexport`, `pvdisplay`, `lvdisplay`, `pvmove`.

---

## 6. RAID

| Level | Min | Survives | Capacity | Redundancy |
|-------|----:|---------:|----------|------------|
| **0** | 2 | **0** | Sum | Stripe only |
| **1** | 2 | 1 | Smallest | Mirror |
| **5** | **3** | **1** | n−1 | Distributed parity |
| **6** | **4** | **2** | n−2 | Double parity |
| **10** | **4** | 1 per pair | Sum of mirrors | Stripe of mirrors |

Status: **`cat /proc/mdstat`** · Manage: `mdadm --detail /dev/md0`

---

## 7. `/etc/fstab`

```
<device> <mountpoint> <type> <options> <dump> <pass>
```
**dump** = always **0**. **pass**: `/`=**1**, others **2**, skip = **0** (swap, network).

| Option | Effect |
|--------|--------|
| `defaults` | `rw,suid,dev,exec,auto,nouser,async` |
| `ro` / `rw` | Read-only / read-write |
| `noexec` | **No binaries from this mount** |
| `nosuid` | Ignore setuid/setgid |
| `nodev` | No device files |
| `noatime` / `nodiratime` | No access-time updates |
| `nofail` | **Boot continues if this is missing** |
| `relatime` | Modern default |
| `_netdev` | Network fs — mount after networking |
| `x-systemd.automount` | Lazy mount on access |

**Filesystems:** `ext4` (`resize2fs`, shrinkable) · `XFS` (`xfs_growfs`, **no shrink**) · `btrfs` (CoW, snapshots) · `tmpfs` (RAM)
**Tools:** `df -h` `df -i` `du` `fsck` `resize2fs` `xfs_repair` `xfs_growfs` `tune2fs` **`fio`** · `lsblk -f` `blkid` `parted` `fdisk` (MBR) `gdisk` (GPT) `growpart`

---

## 8. Systemd

| Verb | Now | Survives reboot |
|------|-----|-----------------|
| `start` | ✔ | ✖ |
| `enable` | ✖ | ✔ |
| `enable --now` | ✔ | ✔ |
| `stop` / `restart` / `reload` | ✔ | ✖ |
| `mask` | **Blocks entirely** | ✔ |
| `daemon-reload` | After editing a unit file | — |

`systemctl --failed` · `systemctl is-enabled/is-active` · `systemd-analyze blame` · `journalctl -u x -f -b -1`
**Targets:** `multi-user.target` (no GUI) · `graphical.target` (GUI) · `rescue.target` · `emergency.target`
**Units:** `.service` `.socket` `.timer` `.mount` `.path` `.slice` `.target`

---

## 9. Boot sequence

```
BIOS/UEFI → GRUB → kernel (vmlinuz) → initrd → systemd (PID 1) → login
              /etc/default/grub     dracut│mkinitrd
```
`uname -r` (running kernel) · `dmesg` · `grub2-mkconfig -o /boot/grub2/grub.cfg` · `rd.break=break-root` (GRUB rescue)

**Modules:** `lsmod` `modprobe` `modprobe -r` `modinfo` `lsmod` · `insmod` (path, **no** dep resolution) `rmmod` `depmod`
**Devices:** `lspci -k` `lsusb` `lshw` `lscpu` `lsmem` `dmidecode` `dmesg` `ipmitool` `lm_sensors` `nvtop`

---

## 10. Shell

**Quoting:** `"$var"` always · `'$var'` literal · `${var:-default}` · `${var:?err}`
**Redirection:** `<` `>` `>>` `2>` `2>&1` `&>` `|` `<<EOF` heredoc `<<<` herestring
**Order matters:** `cmd > f 2>&1` ✔ / `cmd 2>&1 > f` ✘

**Startup files:** login shell → `/etc/profile`, `~/.bash_profile`, `~/.profile`. Interactive non-login → `~/.bashrc`. **Scripts read none — that's why aliases fail.**

**Tests:** `-e -f -d -s -r -w -x` file · `-n` **non-empty** · `-z` **empty**
**Numeric:** `-eq -ne -gt -ge -lt -le` · **String:** `==` `!=` `<` `>` · **Regex:** `=~`
Use `[[ ]]` (bash keyword, safer) not `[ ]`.
**Control:** `if/elif/else` · `case` · `for` · `while` (test first, may run 0×) · `until` (test first, runs until true)
**Expansion:** `${var}` parameter · `$(foo)` command substitution · `$((1+1))` arithmetic · `(foo)` subshell
**Safety:** `set -euo pipefail` · `trap '...' EXIT ERR` · `"$@"` · `${DIR:?}` guard · `shellcheck`

**vim:** `Esc` `i` `a` `o` `:w` `:q` **`:q!` (force quit)** `:wq` `dd` `yy` `p` `u` `/` `n` · **`:q` with changes = error**
**nano:** `^O` save · `^X` exit · `^W` search · `^K` cut

---

## 11. cron

```
 ┌─ minute (0-59)
 │ ┌─ hour (0-23)
 │ │ ┌─ day of month (1-31)
 │ │ │ ┌─ month (1-12)
 │ │ │ │ ┌─ day of week (0-7, 0=Sun)
 * * * * *  command
```
`*` every · `1-5` range · `*/5` step · `1,15` list · `@daily` `@hourly` `@weekly` `@reboot`
`crontab -e/-l/-r` · `/etc/crontab` (has user field) · `/etc/cron.d/` (**no dots in filename**, has user field)
**Failures:** no `PATH` (**use absolute paths**) · output not mailed (add `>> log 2>&1`) · daemon down · `%` is special

---

## 12. Networking

**Config:** `/etc/hosts` (static) · `/etc/resolv.conf` (nameservers) · **`/etc/nsswitch.conf` (`hosts: files dns` — order decides)**
**Managers:** `nmcli` (device vs connection) · `netplan` (`try` = reverts after 120s, `apply` = permanent)

**Commands:** `ip a` `ip r` `ip link` `ip neigh` · `ss -tulpn` · `arp -n` · `ping` `traceroute` `tracepath` `mtr` · `dig` `nslookup` `host` · `nc -zv` · `curl` `wget` · `tcpdump` · `nmap` · **`ethtool`** · `iperf3`

> **`dig` queries DNS directly and ignores `/etc/hosts`. `getent hosts` uses the full resolution stack.** If they disagree, the problem is `hosts`/`nsswitch`.

**SSH:** `-L` local · `-R` remote · `-D` SOCKS · `-i` key · `-p` port · `ssh-copy-id` · `ssh-agent` · `/etc/ssh/sshd_config`

**Env vars:** `HOME` `PATH` `USER` `SHELL` `PS1` `DISPLAY` `LANG` `IFS` `TZ`

---

## 13. Containers

**Docker/Podman:** `pull` `build` `run -d -it -p -v -e --name` `exec -it` `logs` `start/stop` `rm` `inspect` `ps` `tag` `push` `prune`
**Dockerfile:** `FROM` `RUN` **`CMD` (overridable)** **`ENTRYPOINT` (fixed)** `USER` `EXPOSE` `ENV` `COPY` `WORKDIR` `VOLUME`
**Networks:** `bridge` (default) · `host` (shares host netns) · `none` · `overlay` (multi-host) · `macvlan` (own MAC/LAN IP)
**Volumes:** `-v /host:/ctr` (bind) · `-v name:/ctr` (named, persists) · `:z`/`:Z` for **SELinux relabel**
**⚠️ Avoid `--privileged`** — use a non-root `USER` or rootless Podman

**Namespaces** = what a container sees · **cgroups** = how much it uses

---

## 14. Security

**AAA** = Authentication (who) · Authorization (what) · Accounting (did)
**Escalation:** `sudo -i` · `su -` · `sudoers` — **always `visudo`** · `NOPASSWD:` (removes the second factor) · `NOEXEC:` (blocks shell escapes) · groups `wheel`/`sudo`

**Files:** `chmod` `chown` `chgrp` `chattr +i`/`+a` `lsattr` · ACLs `setfacl`/`getfacl` (`ls -l` shows `+`)
**Audit SUID/SGID:** `find / -perm -4000 -o -perm -2000`

**SELinux:** `getenforce` `setenforce 0|1` `ls -Z` · **`restorecon` (the fix)** · `semanage fcontext -a` (permanent) · `getsebool`/`setsebool -P` · `audit2allow` `sealert`
States: **Enforcing / Permissive / Disabled**. Permissive = diagnose, then fix, then Enforcing.

**sshd_config:** `PermitRootLogin no` · `PasswordAuthentication no` · `AllowUsers` · `X11Forwarding no` · **`sshd -t` before restart**
**Avoid:** telnet · FTP · TFTP → use **SSH / SFTP / SCP**

**Firewall:** `firewall-cmd` (zones, **runtime vs `--permanent`** → `--reload`) · `ufw` · `nftables` (current) / `iptables` (legacy) · netfilter
**NAT:** **SNAT** (outbound) · **PAT** (outbound, port) · **DNAT** (inbound port forward)
**Forwarding:** `net.ipv4.ip_forward=1` in `/etc/sysctl.d/`

**Crypto:** `shred` (⚠️ unreliable on SSD) · `cryptsetup` **LUKS2** · **cryptographic erasure is the SSD answer** · GPG · OpenSSL · TLS **1.2/1.3** (drop 1.0/1.1) · **SHA-256** (drop MD5/SHA-1) · **HMAC** (keyed) · CA certificates, **avoid self-signed**

**Audit:** `auditd` + `/etc/audit/rules.d/audit.rules` · `rsyslog` · `logrotate` (retention!) · `journalctl` · `/var/log`

---

## 15. Virtualization

**KVM** (Type 1, in-kernel, `/dev/kvm`) + **QEMU** (emulator) → **libvirt** → **virsh** / `virt-manager`
**Ops:** clone · snapshot · migrate · convert/resize disk images · baseline template · paravirtualized (`virtio`) drivers
**virsh:** `list --all` `start` **`shutdown` (graceful)** **`destroy` (hard power-off)** `suspend/resume` `domifaddr` `snapshot-create`

| Network type | Own LAN IP | Internet | Isolated |
|---------------|:----------:|:--------:|:--------:|
| **Bridged** | ✔ | ✔ | ✖ |
| **NAT** | ✖ | ✔ (via host) | ✖ |
| **Host-only** | ✖ | ✖ | ✔ |
| Routed | ✔ via a router | ✔ | ✖ |
| Open | ✖ | ✖ | ✔ |

---

## 16. Automation

| Tool | Agent? | Language | Key terms |
|------|--------|----------|-----------|
| **Ansible** | **No** (SSH) | YAML | inventory, playbook, task, module, fact, collection, **idempotent**, ad hoc, `become` |
| **Puppet** | **Yes** | DSL (`.pp`) | manifest, catalog, class, fact, **certificates**, master |
| **OpenTofu** | n/a | HCL | provider, resource, **state**, plan/apply |
| Kubernetes | — | YAML | pod, deployment, **service**, **ConfigMap**, **Secret**, PVC |
| Swarm | — | — | node, service, task, `scale` |
| Compose | — | YAML | `compose.yaml`, `up`/`down`, `logs` |

Kickstart (RHEL) · cloud-init (cloud first boot) · CI/CD · **shift-left testing** · **GitOps** · DevSecOps
`ansible all -m ping` · `ansible-playbook site.yml --check` · `docker compose up -d`

---

## 17. Monitoring & performance

**SLA** = contract · **SLI** = the measurement · **SLO** = internal target (**SLO ≥ SLA**)
**SNMP** (161 queries / 162 traps, MIBs) · agent vs agentless · webhooks · health checks · log aggregation
Thresholds · events · alerts · logging

**Memory:** `free -h` (**`available`** not `free`)
**CPU/IO:** `vmstat 1 5` → **`si`/`so`** (swap) · **`b`** (blocked) · **`wa`** (iowait) · **`us`** vs **`id`**
**Disk:** `iostat -xz 1` (`await`, `%util`) · `iotop` · `df -h` · **`df -i`** (inodes)
**Network:** `ss -ti` (retransmits) · `mtr -rw` · `iperf3` · `ip -s link`
**Boot:** `systemd-analyze blame`
**Journals:** `journalctl -u x -f` · **`-b -1`** (previous boot — essential) · `-p err` · `-k`

> **Load average high + `%idle` high = I/O wait, not CPU.** `D`-state processes point at storage. `kill -9` cannot clear `D`.

---

## 18. Storage troubleshooting order

```bash
df -h                 # bytes?
df -i                 # inodes?    ← the forgotten one
quota -v              # user limit?
findmnt | grep target # did the mount happen?
lsof +L1              # deleted but still open?
mount | grep ro       # read-only → failing disk
dmesg -T | grep -i error
smartctl -a /dev/sda
```

---

## 19. Ports

| Port | Proto | Service |
|-----:|-------|---------|
| 20/21 | TCP | FTP *(insecure)* |
| 22 | TCP | **SSH / SFTP / SCP** |
| 23 | TCP | Telnet *(insecure)* |
| 25 | TCP | SMTP (send) |
| 53 | UDP/TCP | **DNS** |
| 67/68 | UDP | DHCP |
| 69 | UDP | TFTP *(insecure)* |
| 80 | TCP | HTTP |
| 110/143 | TCP | POP3 / **IMAP4** |
| 123 | UDP | NTP |
| 143/993 | TCP | IMAP4 / IMAPS |
| 161/162 | UDP | SNMP query / trap |
| 389/636 | TCP | LDAP / LDAPS |
| **443** | TCP | **HTTPS** |
| 587 | TCP | SMTP submission |
| 3306 | TCP | MySQL |
| 5432 | TCP | PostgreSQL |
| 6379 | TCP | Redis |

---

## 20. Exam numbers worth memorising

- **Pass score 720** / 900 · **90 questions** · **90 minutes**
- Domain weights: **23 / 20 / 18 / 17 / 22**
- **MBR** = 4 partitions, **2 TB** · **GPT** = 128, 9.4 ZB, needs an ESP
- **RAID 5** min **3**, survive **1** · **RAID 6** min **4**, survive **2**
- **UDP** ports: 53, 67/68, 123, 161/162 · **TCP**: 22, 25, 80, 443, 587
- **SELinux**: Enforcing / Permissive / Disabled
- **S3** storage · **SAN** block

## Status

- [x] All reference tables compiled from the official objectives
- [ ] Printed and used while practising