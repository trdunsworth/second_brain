---
type: reference
topic: CompTIA Linux+ XK0-006 study resources — KVM lab on a dedicated Linux host, free courses, books, practice exams, communities
date: 2026-10-13
status: active
tags:
  - linux
  - comptia
  - linux-plus
  - resources
  - lab
  - study-plan
---

# Linux+ XK0-006 — Resources & Lab Setup

> Goal: **a machine to practise on** and a short list of legitimate sources. Quality over quantity — the exam rewards hands-on, and nothing substitutes for a live shell.
> Related: [[LinuxPlus_Exam_Overview]] §5 (the 6-week plan) · [[Linux_Terminal_Toolkit]] §10

## 1. Build a lab (do this first — it's the whole ballgame)

The exam has **performance-based questions**. You cannot pass those by reading. Set up a target **before** week 1.

> [!success] This vault's setup: a dedicated Linux box used daily
> You already run Linux day to day, so **use that machine as the hypervisor host.** It beats the alternatives on every axis that matters here: KVM and libvirt are native, which turns objective 1.7 from something you memorise into something you operate; the guests get real bootloaders, real SELinux, and real firewalld; and nothing is nested inside Windows.
>
> **Target: one KVM host (your existing Linux box) running two guests** — one RPM-family, one Debian-family. Run the storage, RAID, and LVM exercises on the **host itself**, because that's real block devices rather than a virtual disk.

### Step 1 — Confirm KVM works on the host

```bash
lscpu | grep -i virtualization          # VT-x / AMD-V must be enabled in BIOS/UEFI
ls -l /dev/kvm                          # must exist
egrep -c '(vmx|svm)' /proc/cpuinfo      # > 0 means the extensions are exposed
```

`/dev/kvm` missing almost always means **VT-x/AMD-V is disabled in UEFI**. Enable it and reboot before doing anything else.

```bash
# Debian/Ubuntu host
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients virtinst virt-manager

# RHEL family host
sudo dnf install -y qemu-kvm libvirt-daemon-driver-qemu virt-manager libvirt-client
sudo systemctl enable --now libvirtd
sudo usermod -aG libvirt $USER          # log out and back in for group membership
```

### Step 2 — Create the two guests

```bash
virt-manager          # GUI — the easiest path
```

or from the CLI:

```bash
virt-install \
  --name rocky9 --memory 2048 --vcpus 2 \
  --disk size=40,format=qcow2 \
  --cdrom ~/Downloads/Rocky-9-x86_64-dvd.iso \
  --os-variant rocky9 \
  --network network=default,model=virtio \
  --graphics vnc,listen=127.0.0.1
```

| Guest | Why this one |
|-------|--------------|
| **Rocky Linux 9** or **AlmaLinux 9** | RPM family — `dnf`/`yum`, `rpm`, **SELinux Enforcing by default**, firewalld |
| **Ubuntu 24.04 LTS** or **Debian 12** | Debian family — `apt`/`dpkg`, AppArmor, `ufw`, netplan (objective 1.4) |

Give each **1.5–2 GB RAM, 2 vCPUs, 40 GB disk**. On the RPM guest, **leave SELinux enforcing** — tripping a denial and reading `sealert` is objective 5.4, and you can't rehearse that with SELinux switched off.

### Step 3 — Snapshots are the whole workflow

This is what makes destructive experimentation safe. **Snapshot before every exercise.**

```bash
virsh snapshot-create-as rocky9 baseline "Clean install"
virsh snapshot-list rocky9
virsh revert rocky9 baseline              # instant rollback
virsh snapshot-delete rocky9 baseline
```

### Networking

Default **NAT** for both guests. When you want two guests talking to each other, or a guest with a real LAN IP, add a second interface:

```bash
virsh attach-interface rocky9 network default --model virtio
```

That's exactly the objective 1.7 network-types table — NAT, bridged, host-only — so you practise the distinction instead of memorising it.

### If the host is itself a VM (nested virtualization)

```bash
cat /sys/module/kvm_intel/parameters/nested    # Y = nested available
```

If that says `N`, nested virt is disabled **on the hypervisor above you** — you can still run guests, just emulated rather than accelerated. Usable for practising, unpleasant to work in. Ask whoever runs that layer to enable it.

### Fallbacks (only if `/dev/kvm` never appears)

| Option | Use when | Limitation |
|--------|----------|------------|
| **VirtualBox on the Linux box** | KVM unavailable | Slower; no nested virt |
| **A second physical machine** | You need raw disk/network practice | Needs another box |
| **Cloud instance** — AWS, GCP, Azure, Oracle free tier, Hetzner | Clean-state practice, PBQ rehearsal | Hourly cost; a real public attack surface — harden it or destroy it after the exam |

```bash
ssh -i ~/.ssh/id_ed25519 user@<instance-ip>
sudo dnf install -y bind-utils tcpdump wireshark-cli sysstat lsof vim-enhanced tree
```

### Suggested client installs on each VM

```bash
# Debian/Ubuntu
sudo apt update && sudo apt install -y \
  vim nano tree lsof sysstat dnsutils iputils-ping traceroute mtr-tcp \
  tcpdump wireshark-common nmap rsync acl attr cron \
  samba-common-bin cpio p7zip-full lvm2 mdadm

# RHEL family
sudo dnf install -y \
  vim-enhanced tree lsof sysstat bind-utils iputils traceroute mtr \
  tcpdump wireshark-cli nmap rsync acl attr cron \
  samba-common-tools cpio p7zip inxi smartmontools lvm2 mdadm
```

`lvm2` supplies `pvcreate`/`vgcreate`/`lvcreate` on Debian; `mdadm` supplies the software-RAID tools.

---

## 2. Free and low-cost courses

| Resource | Notes |
|----------|-------|
| **Professor Messer — Linux+ (YouTube)** | Free, complete, well-organised by domain. The default recommendation |
| **Jason Dion — CompTIA Linux+ (Udemy)** | Practice-question heavy. Frequently on sale |
| **The Total Course — CompTIA Linux+ (O'Reilly)** | Book + video set, with a lab companion |
| **Linux Journey** | Free interactive text — excellent for **shell and permissions** specifically |
| **OverTheWire: Bandit** | Free wargame; levels 0–20 cover exactly the shell/scripting objectives |
| **Linux Upskill Challenge** | Free 20-day server-admin curriculum |
| **Ansible for the Absolute Beginners** | Free Red Hat course, if 4.1 is weak |
| **TryHackMe / Hack The Box (Linux rooms)** | Guided labs for permissions, services, and enumeration |

---

## 3. Books and references

| Title | Why |
|-------|-----|
| **CompTIA Linux+ Study Guide** (any current XK0-006 edition) | Official-aligned structure |
| **The Linux Programming Interface** ( Kerrisk) | Deep reference — *too advanced for exam prep*, excellent for understanding |
| **Linux Command Line** (Shotts) | Free online, superb for shell and scripting (objectives 1.5 and 4.2) |
| **The Practice of System and Network Administration** (Humble/Dzubay) | Service and process management — the real-world framing |
| **`man` pages** | The authoritative answer for any flag. `man 7 signal`, `man 5 fstab`, `man 8 cron` |
| **`tldr pages`** | Quick example-first help while you're at a terminal |

---

## 4. Practice exams

### Legitimate

| Source | Notes |
|--------|-------|
| **CompTIA CertMaster Practice** | Official practice test with domain-level performance breakdown. Bundled with the exam voucher |
| **CompTIA CertMaster Learn** | Official guided courses and labs |
| **Jason Dion / MeasureUp / ExamSnap / Edureify** | Commercial practice with realistic PBQ simulations |
| **Professor Messer's practice exams** | Free-ish, close to real difficulty |

### Build your own (no copyright risk)

Generate scenarios straight from the objectives — this is the most valuable drill and it's completely free:

1. Pick one objective from [[LinuxPlus_Exam_Overview]] §3.
2. Write a 5-line scenario: context, symptom, four plausible actions.
3. Answer it.
4. Check the domain note and justify why each distractor fails.
5. Repeat — target 2–3 new items per objective. That's ~80 hand-made questions.

> [!warning] Brain dumps are a certification risk
> CompTIA's Candidate Agreement **revokes certifications and bans future testing** for anyone who uses unauthorised third-party material. If a site is selling real exam questions, that is exactly what it is. The value is in the objectives and hands-on practice, not recalled questions.

---

## 5. Documentation worth bookmarking

| Resource | URL |
|----------|-----|
| Official exam objectives | `comptia.org/en-us/certifications/linux` |
| Linux man pages | `man7.org` |
| Ubuntu Server documentation | `ubuntu.com/server/docs` |
| RHEL documentation | `docs.redhat.com` |
| `systemd.io` | `systemd.io` — units, timers, journal |
| `openssh.com` | The authoritative SSH manual page |
| Ansible docs | `docs.ansible.com` |
| Red Hat Security Guide (SELinux) | `access.redhat.com/documentation` |
| nftables wiki | `wiki.nftables.org` |
| `tldr` pages | `tldr.sh` |

---

## 6. Communities

| Place | Character |
|-------|-----------|
| **r/linux** | Broad. Good for distro-specific questions |
| **r/linuxadmin** | **The closest match to this exam.** Practical administration |
| **Unix & Linux Stack Exchange** | High-quality, well-moderated technical answers |
| **ServerFault** | Server-focused Q&A |
| **LinuxQuestions.org** | Long-running forum, lots of distro detail |
| **#linux on libera.chat** | Real-time help |
| **Arch Wiki** | Even if you don't run Arch, the wiki is one of the best Linux references in existence |

---

## 7. Drills that actually move retention

| Drill | Targets |
|-------|---------|
| **Rebuild the stack by hand** | `pvcreate` → `vgcreate` → `lvcreate` → `mkfs` → `mount` → `/etc/fstab` → reboot and verify it persists |
| **Extend an LV** | `lvextend` **then** `resize2fs`/`xfs_growfs` — feel the difference if you forget the second step |
| **Break and fix `sudoers`** | Introduce a syntax error, then recover with `visudo` and `visudo -c` |
| **Trip SELinux deliberately** | Serve from `/srv`, read the denial in `sealert`, fix with `restorecon`, then with `semanage fcontext` |
| **Fill a filesystem** | `fallocate` a big file, then diagnose the five "no space" causes in order |
| **Break DNS** | Wrong entry in `/etc/hosts`, then wrong `nameserver`, then wrong `nsswitch` order — learn to tell them apart |
| **Kill a service properly** | `kill -TERM`, watch it shut down cleanly, then compare with `kill -9` |
| **Find a D-state process** | Break a disk controller in a VM; observe the unkillable process |
| **Write one real script** | `set -euo pipefail`, a function, a `case`, a `trap`, `[[ ]]` tests, absolute paths, `shellcheck` clean |
| **Write one real Python script** | `argparse`, `shutil`, structured logging, meaningful exit code |
| **Run an Ansible playbook** | Ad hoc first (`ansible all -m ping`), then a playbook with a handler, `--check` first |

---

## 8. Pre-exam week

| Day | Do |
|----:|-----|
| 1 | Full review of [[LinuxPlus_Cheatsheet]] — every table, out loud |
| 2 | Timed mock #1 (90 min, closed book). Note every weak area |
| 3 | Fix the weak areas — re-read the notes, run the drills |
| 4 | Re-do all ❌/🟡 items in [[LinuxPlus_Practice_Questions]] |
| 5 | Hands-on lab catch-up — anything in §7 you haven't actually done |
| 6 | Timed mock #2. Domain-level comparison against mock #1 |
| 7 | Light review only. Early night. **Do not cram.** |

**Day-of**
- Photo ID matching the voucher name
- Arrive 15–20 min early — late forfeits the exam
- Budget ~20 min for PBQs, ~65 min for the rest, ~5 min to review

---

## Status

- [x] Lab plan documented (KVM host = the daily-use Linux box; fallbacks listed)
- [ ] `/dev/kvm` confirmed on the host; VT-x/AMD-V enabled in UEFI if not
- [ ] `libvirt` installed and `$USER` in the `libvirt` group
- [ ] Rocky/Alma guest created, SELinux **left Enforcing**, baseline snapshot taken
- [ ] Ubuntu/Debian guest created, baseline snapshot taken
- [ ] Client tools installed on both
- [ ] A spare disk/loopback file set aside for the host-side LVM and RAID drills
- [ ] Registered for one legitimate practice exam
- [ ] All §7 drills completed at least once
