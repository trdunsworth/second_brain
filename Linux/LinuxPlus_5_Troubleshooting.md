---
type: study-guide
topic: CompTIA Linux+ XK0-006 domain 5.0 Troubleshooting — monitoring and SLA/SLI/SLO, hardware and storage, networking, security, performance triage
date: 2026-10-13
status: active
tags:
  - linux
  - comptia
  - linux-plus
  - troubleshooting
  - monitoring
  - performance
  - networking
---

# Domain 5.0 — Troubleshooting (22%)

> Goal: the second-heaviest domain. Monitoring concepts, then four diagnostic domains: hardware/storage/OS, network, security, performance.
> **Everything here is scenario-based.** Learn the *method* and the *first command*, not the trivia.
> Related: [[LinuxPlus_1_System_Management]] · [[LinuxPlus_2_Services_User_Management]] · [[LinuxPlus_3_Security]]

## 0. The troubleshooting methodology (apply to every scenario)

CompTIA scenario questions are graded on **process**, not just the final answer. Use this sequence:

```
1. IDENTIFY the problem      — read the symptom, question the assumption
2. ESTABLISH a theory        — one plausible cause at a time
3. TEST the theory           — cheapest, least invasive check first
4. ESTABLISH a plan          — consider impact, downtime, risk
5. VERIFY the full system    — did I fix it, and did I break anything?
6. DOCUMENT                  — root cause, fix, prevention
```

> [!tip] The pattern to spot in answers
> When an option says *"check X, then Y, then Z"* it is usually right.
> When an option says *"reinstall everything"* or *"immediately reboot / reinstall / wipe"* without diagnosis, it is wrong.
> **Read-only, reversible checks come first** (`journalctl`, `ip a`, `df -h`, `ss -tulpn`). Mutations come last.

---

## 1. 5.1 — Monitoring concepts

### SLA vs SLI vs SLO — the trio that's always tested

| Term | Full name | Definition | In your system |
|------|-----------|------------|----------------|
| **SLA** | Service Level **Agreement** | The **contract** with the customer — the promise you are legally/financially bound to | "99.9% monthly uptime, support response within 4 hours" |
| **SLI** | Service Level **Indicator** | The **actual measurement** of a service-level aspect | "99.87% of requests returned in under 200 ms last month" |
| **SLO** | Service Level **Objective** | The **internal target** you aim for, set to exceed the SLA | "We target 99.95% to leave headroom above the 99.9% SLA" |

> **The relationship the exam wants:** **SLO (goal) ≥ SLA (contract promise)**, measured by **SLIs**. You set SLOs higher than what you promise the customer so you have margin before breaching the SLA.
>
> Classic distractor: **"SLA is the metric you monitor."** No — SLIs are the metrics. The SLA is a legal document.

### Data acquisition methods

| Method | How it works | Notes |
|--------|--------------|-------|
| **SNMP** | Agents on devices expose counters pulled (or pushed) by a manager | **Traps** = unsolicited alerts sent when something crosses a threshold. **MIBs** = the schema describing what counters exist. UDP 161 (queries) / 162 (traps) |
| **Agent-based** | An agent installed on the host reports metrics | Accurate, sees internals, but the agent itself can fail |
| **Agentless** | Polled from outside (`ssh`, HTTP, `node_exporter`) | Nothing to install; sees it as an external client does. **Ansible is agentless** |
| **Webhooks** | Push notification on an event (CI/CD, SaaS) | Event-driven, near real-time |
| **Health checks** | Active probes: is the service answering? | `curl`, `/healthz`, `monit` |
| **Log aggregation** | Centralise logs (journald → rsyslog → SIEM) | Correlate across hosts; the basis of IoC hunting |

### Configuration concepts

| Term | Meaning |
|------|---------|
| **Threshold** | A value that defines normal; crossing it is notable |
| **Event** | A discrete, meaningful occurrence in the log |
| **Alert / Notification** | The human-facing message sent when a threshold is crossed |
| **Logging** | The persistent record |

> **Alert fatigue** is a real failure mode: too many noisy alerts get ignored. Good alerting is **actionable and low-volume** — an alert you can't act on should be a dashboard, not a page.

### Logging tools

```bash
journalctl -u nginx -f              # follow a service
journalctl -p err -b                 # errors this boot
journalctl -b -1                    # PREVIOUS boot (essential for crash loops)
journalctl --since "2 hours ago" -k # kernel messages
journalctl _PID=1234                 # by PID
```

| Location | Contents |
|----------|----------|
| `/var/log/syslog`, `/var/log/messages` | Everything (Debian / RHEL respectively) |
| `/var/log/auth.log`, `/var/log/secure` | Authentication — brute-force hunting |
| `/var/log/kern.log`, `dmesg` | Kernel |
| `/var/log/cron` | Scheduled jobs |
| `/var/log/audit/audit.log` | `auditd` |
| `/var/log/journal/` | systemd journal binary |

---

## 2. 5.2 — Hardware, storage, and Linux OS issues

### Boot failure — locate the stage first

The most important skill in this domain: **localise the failure to a boot stage** before touching anything.

| Failure point | Symptom | Diagnosis | Fix |
|---------------|---------|-----------|-----|
| **Firmware (BIOS/UEFI)** | No POST, no video, "no bootable device" | Check hardware, boot order | Enable the right device; boot from USB/ISO |
| **Bootloader (GRUB)** | Stops at a `grub>` prompt, or "error: unknown filesystem" | `ls`, `insmod normal`, `set prefix=(hd0,gpt2)/boot/grub` | Reinstall/repair GRUB; fix `/etc/fstab` UUIDs; `grub2-mkconfig` |
| **Kernel** | `Kernel panic - not syncing`, "VFS: Unable to mount root fs" | `dmesg` from rescue | Wrong kernel image, missing initramfs, wrong root=, missing storage driver |
| **initramfs** | Dracut/BusyBox prompt, "unable to mount /sysroot" | Boot into rescue, `ls /boot` | Rebuild: `dracut -f` / `update-initramfs -u` |
| **Root filesystem** | Panic, read-only root | `lsblk -f`, `blkid` | Wrong UUID, FS corrupted → `fsck` |
| **systemd** | Drops to `emergency.target`, "Failed to mount local-fs" | `systemctl --failed` | Usually a **bad `/etc/fstab` entry** |
| **Initramfs busybox** | Rescue shell only | — | Add `rd.break=break-root` to the kernel line for real root access |

```bash
# Recovery entry points
# In GRUB: append to the linux line, then Ctrl-X
rd.break=break-root     # drop to initramfs with root mounted read-only
systemd.unit=rescue.target
init=/bin/bash           # emergency shell; then `mount -o remount,rw /`
```

> [!danger] Read-only root after boot
> **A kernel panic is often the *symptom* of an underlying filesystem error.** Never run `fsck` on a mounted filesystem — it will cause damage. Unmount first, or better, boot rescue/live media and fsck there. And **always have backups before fsck** — it's a repair tool, not a magic wand.

### Storage troubleshooting

| Symptom | First commands | Usual cause |
|---------|----------------|-------------|
| **"No space left on device"** | `df -h` **and** `df -i` | See the six causes below |
| **Filesystem won't mount** | `dmesg \| tail`, `mount -v`, `journalctl -b -p err` | Bad UUID in fstab (changed after a clone), corruption, missing device |
| **Partition not writable** | `mount` (is it `ro`?), `dmesg \| grep -i readonly` | **Remounted read-only after an I/O error — a failing disk or controller.** Also: read-only FS, full FS, immutable attribute |
| **Device failure** | `dmesg \| grep -i error`, `smartctl -a /dev/sda`, `lsblk` | Failing disk, bad cable, bad controller, SMART reallocated sectors |
| **Inode exhaustion** | `df -i` | Too many small files; `mkfs.ext4` inode count too low |
| **Quota issues** | `quota -v`, `xfs_quota -c 'report -h'`, `repquota` | Per-user/per-group limit hit |
| **Mount didn't happen** | `findmnt`, `mount \| grep target` | Data wrote to the root filesystem instead |
| **Deleted file still using space** | `lsof +L1` | A process holds the fd |

```bash
smartctl -a /dev/sda              # SMART health, reallocated/pending sectors
dmesg -T | grep -iE 'error|fail|i/o'   # -T = human-readable timestamps
journalctl -k -p err -b
fsck -n /dev/sda2                 # -n = read-only check, safe on a live system
xfs_repair -n /dev/sda2           # XFS: always run -n first
```

> [!tip] "No space left on device" — six causes, check in this order
> 1. **Bytes** — `df -h` → find the big consumer with `du -xhd1 / | sort -h`
> 2. **Inodes** — `df -i` (bytes free, inodes exhausted)
> 3. **Quota** — `quota -v` (the filesystem has room, the *user* is capped)
> 4. **Mount missing** — the intended filesystem isn't mounted, so data filled root
> 5. **Deleted-but-open** — `lsof +L1`
> 6. **Read-only** — `mount` shows `ro`; the disk is failing and the kernel protected the data

**RAID recovery**
```bash
cat /proc/mdstat              # status, rebuild %, degraded arrays
mdadm --detail /dev/md0
mdadm --fail /dev/sda3 --remove /dev/md0    # remove a failed disk
mdadm --add /dev/sdf3 /dev/md0               # re-add
```
An array showing `degraded` with `recovery=` in progress is **rebuilding** — expect reduced performance and don't restart it.

### Common OS issues

| Issue | Recognise it by | Fix |
|-------|-----------------|-----|
| **Package dependency issues** | `apt-get -f install`, "unmet dependencies", broken `dpkg` | `sudo apt -f install`, `sudo dpkg --configure -a`; on RHEL `sudo dnf install` |
| **Killed processes** | `dmesg` says `Out of memory: Killed process 1234 (java)` | OOM killer. Raise RAM/swap, cap the process with a cgroup/`MemoryMax=`, reduce concurrency |
| **PATH misconfiguration** | `command: not found` | `command -v cmd`; check `$PATH`; absolute paths in cron/systemd |
| **systemd unit failures** | `systemctl --failed`, `systemctl status x` | `daemon-reload` after edits; check `ExecStart` path, the `User=`, the unit file syntax |
| **Missing/disabled drivers** | `lspci` shows `???` or `lspci -k` shows no driver | `modprobe`, install a DKMS package, rebuild the initramfs |
| **Unresponsive process** | High state, no I/O | `strace -p PID`; if stuck in `D` — **it's I/O**, check the disk |
| **Segmentation fault** | `Segmentation fault (core dumped)`; **signal 11** | Often a library/architecture mismatch (32-bit binary on 64-bit), bad RAM, or a genuine bug. `coredumpctl` |
| **GRUB misconfiguration** | grub prompt, wrong OS, missing entries | `grub2-mkconfig -o /boot/grub2/grub.cfg` |
| **Memory leak** | RSS grows monotonically over time | `pmap -x PID`, `smaps`; restart as a stopgap; find the allocation site |

```bash
systemd-analyze blame | head     # what's making boot slow
systemd-analyze critical-chain
systemd-analyze verify unit.service
journalctl -b -p err --no-pager  # this boot's errors
```

---

## 3. 5.3 — Networking issues

### The connectivity ladder (use this order — it's also the scenario answer order)

```
1. Is the interface up and addressed?   ip -br a ; ip link
2. Is there a route?                   ip r
3. Does it answer its own IP?          ping -c2 <own ip>     ← separates DNS from routing
4. Does the gateway answer?            ping -c2 <gateway>
5. Does the remote answer?             ping -c2 <remote>
6. Where does the path stop?           traceroute / mtr -rw
7. Is something LISTENING?             ss -tulpn | grep :PORT
8. Can we reach the port?              nc -zv host port ; curl -v
9. Is a firewall dropping it?          nft list ruleset ; ufw status ; firewall-cmd --list-all
10. Is it DNS or the network?           dig +short name ; dig @1.1.1.1 name
```

> **"Can I ping the server but not reach the web page?"** → ping is ICMP (layer 3), HTTP is TCP (layer 4). The service isn't listening on that port, the **firewall** is blocking that port, or the app is down. **Check `ss -tulpn` and the firewall** — not DNS, not routing.

### Issue-by-issue

| Issue | How it presents | Diagnosis | Fix |
|-------|----------------|-----------|-----|
| **Cannot ping server** | No reply | Is a **firewall** dropping ICMP? Check `sysctl net.ipv4.icmp_echo_ignore_all` | Allow ICMP in the firewall zone; check the interface |
| **Interface misconfiguration** | Wrong IP, wrong subnet, no address | `ip -br a`, compare to the expected subnet | `nmcli con up` / `netplan apply` |
| **Subnet mismatch** | Local hosts fine, remote fails; wrong gateway | `ip r`, `ipcalc` — same subnet? valid gateway? | Fix the address/prefix |
| **Routing / gateway issues** | "Destination host unreachable" | `ip r` — is there a default route? `traceroute` shows where it dies | Add default route / fix the gateway |
| **MTU mismatch** | Small packets (ping) work, **large transfers hang**, TLS hangs, SSH freezes on big output | `ping -M do -s 1472 -c2 host` fails but `-s 1400` works | Raise MTU (`ip link set eth0 mtu 1500`) or set `Clamp-MSS-To-PMTU` on the router |
| **IP conflicts** | Intermittent, wrong MAC in ARP, duplicate-IP warning | `ip neigh`, `arping -D -I eth0 <ip>` | Find and remove the duplicate; use DHCP reservations |
| **Link down** | No carrier | `ip link` shows `NO-CARRIER`; `ethtool eth0` | Cable, NIC, switch port, or the peer is down |
| **Link negotiation issues** | Speed/duplex mismatch (1 Gbps↔100 Mbps), duplex half/full errors | `ethtool eth0` → `Speed`, `Duplex`, `Link detected` | Force with `ethtool -s eth0 speed 1000 duplex full autoneg on` |
| **MAC spoofing** | Traffic on a port that isn't registered, ARP anomalies | Compare `ip link show` MAC with the switch's MAC table | Find the offending host; enforce port security |
| **Dual stack (IPv4/IPv6) issues** | Works on v4, fails on v6, or vice versa | `ping4` vs `ping6`, `dig A` vs `dig AAAA`, `ip -6 a` | Fix/disable the broken family — often a stale AAAA record or a v6 route/firewall gap |
| **DHCP issues** | No lease, wrong IP, no gateway/DNS | `journalctl -u NetworkManager`, `dhclient -v`, check `/etc/dhcp/dhcpd.conf` on the server | Renew lease, check the server's pool, scope, and reservations |
| **DNS issues** | "Name or service not known", slow resolution | `dig`, `dig @1.1.1.1`, `dig +trace`; `/etc/resolv.conf`, `/etc/hosts`, `/etc/nsswitch.conf` | Fix the nameserver, the hosts entry, or the nsswitch order |
| **Misconfigured firewalls** | Everything works locally, fails remotely | `nft list ruleset`, `firewall-cmd --list-all --zone=`, `ufw status` | Open the port **permanently** |
| **Server unreachable** | Timeouts | Full ladder above | Work up the ladder — don't guess |

```bash
ip -br a ; ip r ; ip link show eth0
ip neigh                                  # ARP table — check for FAILED entries
ss -tulpn | grep -E 'LISTEN|State'        # what's listening
ip -s link show eth0                      # errors/drops counters
ethtool eth0 | grep -E 'Speed|Duplex|Link'
ping -M do -s 1472 -c2 8.8.8.8            # MTU probe
traceroute -n 10.0.0.5 ; mtr -rw -c 10 10.0.0.5
dig +short example.com ; dig @1.1.1.1 example.com ; dig +trace example.com
tcpdump -i eth0 -nn host 10.0.0.5         # what's actually on the wire
```

> [!tip] The mental model for "which layer is this?"
> - **Can't ping your own IP** → the stack/interface is broken.
> - **Can't ping the gateway** → local link, cable, switch, or interface config.
> - **Ping gateway works, remote fails** → routing, gateway's rules, or the far-end firewall.
> - **Ping works, service doesn't** → **the service isn't listening, or the port is firewalled.** Always `ss -tulpn`.
> - **Everything works but names don't resolve** → **DNS only.** Compare `dig` with `getent hosts`.

---

## 4. 5.4 — Security issues

| Issue | Recognition | Correct action |
|-------|-------------|----------------|
| **SELinux — context** | Service denied; `ls -Z` shows a `default_t` or wrong type; `sealert` shows a denial | **`restorecon -Rv <path>`**. If the path is non-standard, `semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"` **permanently** |
| **SELinux — boolean** | `sealert` names a boolean, e.g. `httpd_can_network_connect` | **`setsebool -P httpd_can_network_connect on`** (`-P` = permanent) |
| **SELinux — policy** | Denials that no context/boolean change fixes | Review the local policy / custom module; consult `audit2allow`; report upstream |
| **File/dir permission issues** | `Permission denied` | `namei -l /path/to/file` — **checks every directory in the path.** A common miss: the file is fine but a parent dir lacks `x` |
| **ACL issues** | `+` in `ls -l` masks real access | `getfacl`; note the **mask** entry limits the effective ACL |
| **Attributes** | Can't write to a file that should be writable | `lsattr` — `i` (immutable) or `a` (append only) → `chattr -i` |
| **Account access** | "Permission denied (publickey,password)" | Key not in `~/.ssh/authorized_keys`, wrong perms (`700` on `.ssh`, `600` on the key), `PasswordAuthentication no`, expired account (`chage -l`), shell is `nologin`, SELinux context on `.ssh` |
| **Unpatched vulnerable system** | A CVE against the running version | Check the **changelog/backport status**, not just the version string. Then patch |
| **Exposed / misconfigured services** | Unexpected ports in `ss -tulpn` | Disable what isn't needed (`systemctl disable --now`); bind to the right interface; restrict in the firewall |
| **Remote access issues** | SSH refused / hangs | `sshd -t`, `systemctl status sshd`, `journalctl -u sshd`, `/etc/hosts.allow\|deny`, firewall |
| **Certificate issues** | TLS handshake fails, expiry warnings | `openssl x509 -enddate -noout -in cert.pem`, `openssl s_client -connect host:443`, check the chain, the SAN, the clock (`timedatectl`) — **a wrong system time breaks TLS** |
| **Misconfigured package repository** | GPG errors, hash mismatches, installs from an untrusted source | Use the distro's signed repos; verify with `gpg --verify`; re-import the vendor key |
| **Obsolete/insecure protocols & ciphers** | SSLv3, TLS 1.0/1.1, weak ciphers | Remove them from the config; force TLS 1.2/1.3 |
| **Cipher negotiation issues** | Handshake fails between specific hosts | `openssl s_client -cipher 'ECDHE-RSA-AES256-GCM-SHA384' -tls1_2`; align the allowed cipher lists; check for a **DH parameter/curve mismatch** |

```bash
# SELinux triage
getenforce
sealert -a /var/log/audit/audit.log       # READ THIS FIRST — it tells you exactly what to fix
ls -Z /var/www/html/index.html
restorecon -Rv /var/www
semanage fcontext -l | grep /srv
getsebool -a | grep httpd
setsebool -P httpd_can_network_connect on

# Permissions triage — every component of the path
namei -l /srv/app/data/config.yml
ls -ld /srv /srv/app /srv/app/data && lsattr -d /srv/app/data

# Certificates
openssl x509 -in cert.pem -noout -text -dates
openssl s_client -connect mail.example.com:443 -servername mail.example.com </dev/null
timedatectl                               # correct clock is a prerequisite for TLS
```

> [!danger] The security scenario answer
> When an application "should work but gets permission denied", the correct sequence is:
> 1. Check **POSIX permissions and every parent directory** (`namei -l`)
> 2. Check **attributes** (`lsattr`)
> 3. Check **ACLs** (`getfacl`)
> 4. Check **SELinux** (`ausearch`/`sealert`, `ls -Z`)
>
> **Never** start by adding `chmod 777`. That is the distractor — it masks the problem, ignores SELinux entirely, and reduces security. `chmod 777` is a *diagnosis failure*, not a fix.

---

## 5. 5.5 — Performance issues

### Symptom → cause mapping

| Symptom | Look at | Likely cause |
|---------|---------|--------------|
| **High CPU usage** | `top`/`htop` sorted by `%CPU`, `pidstat -u 1` | A runaway process; normal for a batch job |
| **High load average** | `cat /proc/loadavg`, `uptime` | Load = **runnable + uninterruptible** tasks. High load with **idle CPU** → **I/O wait or D-state processes**, not CPU |
| **Swapping** | `vmstat` `si`/`so` non-zero, `free -h` | Memory pressure — too little RAM for the working set |
| **Out of memory** | `dmesg`: `Out of memory: Killed process` | OOM killer fired. `journalctl -k \| grep -i oom` |
| **Slow application response** | Which specific app? CPU or I/O? | Narrow down; correlated with a specific process |
| **High context switching** | `vmstat` `cs`, `pidstat -w` | Too many threads, or thrashing |
| **High I/O wait** | `vmstat` `wa` (and `iowait` in `top`), `iostat -x 1` | Slow disk, heavy writes, storage contention |
| **High disk latency** | `iostat -x` → `await`, `%util` | Slow/failing disk, queue depth |
| **Slow startup** | `systemd-analyze blame`, `systemd-analyze critical-chain` | A slow unit — often a failing mount or a network service with a long timeout |
| **Slow remote storage response** | NFS mount; `nfsstat -c`, `mount` options | Network latency, `hard` vs `soft` mounts, no local caching |
| **Packet drops / jitter / random timeouts** | `ip -s link`, `nstat`, `tcpdump`, `mtr` | Congestion, bufferbloat, faulty NIC/cable, rate limiting |
| **High latency / slow response** | `mtr -rw`, `ping`, `iperf3` | Network latency or a saturated link |
| **Low throughput** | `iperf3`, `iostat -x`, `ss -ti` (retransmits) | Bandwidth limit, MTU/MSS issue, retransmissions |
| **Blocked processes** | `ps -eo state,pid,cmd \| grep '^D'` | Processes in **D state** — uninterruptible I/O. A **failing disk** is the usual cause |
| **Failed log-in attempts** | `lastb`, `/var/log/auth.log`, `journalctl -u sshd` | Brute force — `fail2ban`, disable password auth, `AllowUsers` |
| **Hardware errors** | `dmesg`, `smartctl -a`, `edac` (ECC), `ipmitool` | Failing disk, memory ECC errors, bad fan/PSU, overheating |
| **Exceeding baselines** | Compare current SLIs to the documented baseline | Capacity planning / regression |
| **System unresponsive** | `D` processes, high `wa`, full disk | See above |

### The tools

```bash
# --- Memory and CPU ---
free -h                        # look at "available", NOT "free" — page cache is reclaimable
vmstat 1 5                     # r b sw pd cs / si so / us sy id wa
top / htop                     # live; htop F5 tree, F4 filter
pidstat -u 1 5                 # per-process CPU and I/O
mpstat -P ALL 1                 # per-CPU
sar -u 1                       # historical sampling

# --- Disk and I/O ---
iostat -xz 1                    # await, %util, r/s, w/s, queue depth
iotop                          # per-process I/O, like top for disks
lsof                           # who is writing to that file
df -h ; df -i ; du -xhd1 / | sort -h
ps -eo state,pid,cmd | grep '^D'    # D-state = blocked on I/O

# --- Network ---
ss -s                          # socket summary
ss -ti                         # TCP stats incl. retransmits — retransmits = packet loss
sar -n DEV 1                   # interface throughput/errors
ip -s link show eth0
mtr -rwz -c 10 host            # latency + loss per hop
iperf3 -c target               # throughput test

# --- Boot ---
systemd-analyze blame
systemd-analyze critical-chain

# --- Hardware ---
smartctl -a /dev/sda
sensors                        # temperatures and fan RPM (lm_sensors)
dmesg -T | grep -iE 'thermal|throttl|mce|edac'
```

### The one mental model that answers most performance questions

```
                     load average
        ┌────────────────┼────────────────┐
   high │  CPU-bound     │  I/O / D-state │     (look at %idle vs %wa in top/vmstat)
        │  %us+%sy high   │  %wa high,     │
        │  %id low        │  D-state procs │
        └─────────────────┴────────────────┘
                     low  CPU idle
```

> [!danger] The classic trap
> **"Load average is high, so the CPU must be busy."** — Not necessarily.
> On a 4-core box, load 4 is normal. Load 12 means 12 tasks are waiting — but if `%idle` is 90% and `%wa` is 10%, those tasks are **blocked on I/O**, not CPU. Check `vmstat` (`b` column = blocked) and `iostat` **before** concluding it's a CPU problem. Prescribing "add CPU" when the disk is the bottleneck is the wrong answer.

### `vmstat` columns you must be able to read

| Column | Field | What to watch |
|--------|-------|---------------|
| `r` | runnable | Runnable processes — compare to core count |
| `b` | **blocked** | Tasks waiting on I/O. Non-zero sustained = storage problem |
| `sw`/`si`/`so` | swap in/out | **`si`/`so` non-zero = swapping = memory pressure** |
| `cs` | context switches | High = too many runnable tasks or thrashing |
| `us` `sy` `id` `wa` | user / system / **idle** / **iowait** | `id` low + `us` high = CPU-bound. `wa` high = I/O-bound |

---

## 6. Troubleshooting quick-reference card

| "The system…" | Check, in order |
|---------------|-----------------|
| **won't boot** | firmware → GRUB → kernel → initramfs → root FS → fstab → systemd. `dmesg`, `journalctl -b -1 -p err`, `lsblk -f` |
| **won't mount** | `journalctl -b -p err`, `blkid` (did the UUID change?), `fsck -n`, is the device present in `lsblk` |
| **is out of space** | `df -h` → `df -i` → `quota -v` → `findmnt` → `lsof +L1` → is it `ro`? |
| **service won't start** | `systemctl status`, `journalctl -u x -n 50`, `daemon-reload` after edits, `systemd-analyze verify` |
| **SSH won't accept logins** | `sshd -t`, `journalctl -u sshd`, `authorized_keys` perms, `getent passwd user`, `chage -l`, SELinux on `.ssh` |
| **DNS fails** | `dig` vs `getent hosts`, `/etc/resolv.conf`, `/etc/hosts`, `/etc/nsswitch.conf` |
| **port unreachable** | `ss -tulpn \| grep :PORT`, firewall, `nc -zv`, is the app bound to `127.0.0.1` only? |
| **is slow** | `vmstat 1 5` first → CPU (`%us`) or I/O (`%wa`) → then `iostat`/`pidstat` |
| **is rebooting/crashing** | `journalctl -b -1 -p err`, `dmesg -T \| grep -i oom`, `smartctl`, `systemd-analyze` |

**Never do these as a first action:** `rm -rf`, `chmod 777`, disable SELinux permanently, `kill -9` a process you haven't identified, reboot a production host to "see if it fixes it", or fsck a mounted filesystem. Each destroys the evidence you'll need.

---

## Objective self-check

- [ ] SLA vs SLI vs SLO — which is the contract, which is measured, which is internal?
- [ ] Why must the SLO exceed the SLA?
- [ ] What are MIBs and traps?
- [ ] Agent-based vs agentless monitoring — one advantage each?
- [ ] A machine is stuck at a `grub>` prompt — which boot stage failed, and what's the first thing to try?
- [ ] `df` shows 40% used but creating a file fails. What's the likely cause and the command?
- [ ] Why is `journalctl -b -1` essential?
- [ ] Why can't you fsck a mounted filesystem?
- [ ] A filesystem is read-only. What does that almost certainly mean?
- [ ] What does `/proc/mdstat` showing `degraded` and `recovery=` tell you?
- [ ] Ping works, HTTP doesn't. Which two things do you check?
- [ ] Small pings work, large ones hang. What is it, and how do you confirm?
- [ ] `ethtool` shows 100 Mbps on a 1 Gbps link. What's the answer?
- [ ] Load average is 12 on a 4-core box and `%idle` is 90%. What's actually wrong?
- [ ] Which `vmstat` columns tell you about swapping and blocked processes?
- [ ] Processes are stuck in `D` state. What does that suggest, and can `kill -9` fix it?
- [ ] A web app gets "Permission denied" with correct `chmod`. What's your diagnostic order?
- [ ] Which SELinux commands fix a wrong context, permanently fix a non-standard path, and toggle a boolean?
- [ ] Why is `chmod 777` the wrong answer in a permissions scenario?

## Status

- [x] All objectives 5.1–5.5 covered
- [ ] Self-check passed cold
- [ ] Deliberately filled a filesystem and diagnosed it (bytes, inodes, and a held-open file)
- [ ] Deliberately broke a service and systemd unit, then read the journal to fix it
- [ ] Broken a disk controller in a VM and traced the D-state diagnosis
- [ ] Deliberately misconfigured SELinux and fixed it with `restorecon`