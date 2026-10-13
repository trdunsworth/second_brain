---
type: study-guide
topic: CompTIA Linux+ XK0-006 exam format, domain blueprint, study plan, and test-day tactics
date: 2026-10-13
status: active
tags:
  - linux
  - comptia
  - linux-plus
  - certification
  - exam-prep
  - study-plan
---

# Linux+ XK0-006 — Exam Overview & Study Plan

> Goal: know the blueprint cold, allocate study time by **weight**, and walk into the 90 minutes with a plan.
> Related: [[LinuxPlus_1_System_Management]] · [[LinuxPlus_2_Services_User_Management]] · [[LinuxPlus_3_Security]] · [[LinuxPlus_4_Automation_Scripting]] · [[LinuxPlus_5_Troubleshooting]] · [[LinuxPlus_Cheatsheet]] · [[LinuxPlus_Practice_Questions]]

## 1. Test details

| Item | Value |
|------|-------|
| Exam code | **XK0-006** |
| Version | **V8** |
| Released | **July 15, 2025** |
| Predecessor | XK0-005 — **retired January 13, 2026** |
| Questions | Maximum **90** |
| Formats | Multiple-choice **+ performance-based questions (PBQ)** |
| Duration | **90 minutes** |
| Pass mark | **720 / 900** scaled score |
| Language | English |
| Recommended experience | 12 months hands-on Linux servers; A+, Network+, Server+ or equivalent |
| Accreditation | ANSI / ISO 17024 |

> [!tip] Scaled score, no negative marking
> You are not scored 90/90. Wrong answers are simply not counted — there is no penalty. Guessing is free, so **never leave a question unanswered**. Unscored "pilot" questions may appear; treat everything as real.

## 2. The blueprint — domain weights

| Domain | % | ≈ items | Your weakest? |
|--------|--:|--------:|---------------|
| **1.0 System Management** | **23%** | ~21 | ☐ |
| **2.0 Services and User Management** | **20%** | ~18 | ☐ |
| **3.0 Security** | **18%** | ~16 | ☐ |
| **4.0 Automation, Orchestration, and Scripting** | **17%** | ~15 | ☐ |
| **5.0 Troubleshooting** | **22%** | ~20 | ☐ |

Convert weight into **hours**, not just questions. If you have 30 hours total:

| Domain | Hours |
|--------|------:|
| 1.0 System Management | 7 |
| 2.0 Services & User Mgmt | 6 |
| 3.0 Security | 5 |
| 4.0 Automation & Scripting | 5 |
| 5.0 Troubleshooting | 7 |

### What changed from XK0-005 (the exam's big trap)

| | XK0-005 (retired) | **XK0-006 (current)** |
|---|---|---|
| System Management | 32% | **23%** — user/service management split out |
| Services & User Mgmt | *(folded into Sys Mgmt)* | **20%** — its own domain |
| Security | 21% | 18% |
| Scripting/Containers/Automation | 19% | **17%** — renamed, containers moved out |
| Troubleshooting | 28% | 22% |
| Python | minor | **explicitly emphasized** |
| Containers | in Automation domain | **moved to Services & User Mgmt (2.6)** |
| AI-assisted development | absent | **new (4.5)** |

> [!warning] If your study material lists 4 domains, or puts containers under scripting, it is out of date.

## 3. Sub-objective map

| Objective | Title | Goes to |
|-----------|-------|---------|
| 1.1 | Explain basic Linux concepts | [[LinuxPlus_1_System_Management]] §1 |
| 1.2 | Summarize Linux device management concepts and tools | §2 |
| 1.3 | Given a scenario, manage storage in a Linux system | §3 |
| 1.4 | Given a scenario, manage network services and configurations | §4 |
| 1.5 | Given a scenario, manage a Linux system using shell operations | §5 |
| 1.6 | Given a scenario, perform backup and restore operations | §6 |
| 1.7 | Summarize virtualization on Linux systems | §7 |
| 2.1 | Given a scenario, manage files and directories | [[LinuxPlus_2_Services_User_Management]] §1 |
| 2.2 | Given a scenario, perform local account management | §2 |
| 2.3 | Given a scenario, manage processes and jobs | §3 |
| 2.4 | Given a scenario, configure and manage software | §4 |
| 2.5 | Given a scenario, manage Linux using systemd | §5 |
| 2.6 | Given a scenario, manage applications in a container | §6 |
| 3.1 | Summarize authorization, authentication, and accounting methods | [[LinuxPlus_3_Security]] §1 |
| 3.2 | Given a scenario, configure and implement firewalls | §2 |
| 3.3 | Given a scenario, apply OS hardening techniques | §3 |
| 3.4 | Explain account hardening techniques and best practices | §4 |
| 3.5 | Explain cryptographic concepts and technologies | §5 |
| 3.6 | Explain the importance of compliance and audit procedures | §6 |
| 4.1 | Summarize use cases/techniques of automation and orchestration | [[LinuxPlus_4_Automation_Scripting]] §1 |
| 4.2 | Given a scenario, perform automated tasks using shell scripting | §2 |
| 4.3 | Summarize Python basics used for Linux system administration | §3 |
| 4.4 | Given a scenario, implement version control using Git | §4 |
| 4.5 | Summarize best practices and responsible uses of AI | §5 |
| 5.1 | Summarize monitoring concepts and configurations | [[LinuxPlus_5_Troubleshooting]] §1 |
| 5.2 | Given a scenario, troubleshoot hardware, storage, and Linux OS issues | §2 |
| 5.3 | Given a scenario, analyze and troubleshoot networking issues | §3 |
| 5.4 | Given a scenario, analyze and troubleshoot security issues | §4 |
| 5.5 | Given a scenario, analyze and troubleshoot performance issues | §5 |

> [!note] Objective numbering
> Sub-objective numbers here follow the published objectives document. Domain **names and weights** are the thing to memorise — those are what the exam is scored against.

## 4. Recommended distros (from CompTIA's own hardware/software list)

Know at least **one RPM-based** and **one Debian-based** distro, and their package tools cold:

| Family | Distros on the list | Package tools |
|--------|---------------------|---------------|
| **RPM-based** | RHEL, Rocky Linux, AlmaLinux, Fedora, openSUSE/SLES | `dnf` / `yum` + `rpm` (openSUSE uses `zypper`) |
| **Debian-based** | Debian, Ubuntu, (Kali) | `apt` + `dpkg` |

The exam will ask "which command on Ubuntu…" vs "which on RHEL…". Mixing these up is one of the most common avoidable losses.

## 5. Six-week study plan

| Week | Focus | Deliverable |
|-----:|-------|-------------|
| **1** | Set up the lab: KVM on your Linux box, one Rocky guest + one Ubuntu guest, baseline snapshots ([[LinuxPlus_Resources]] §1). Read [[Linux_Terminal_Toolkit]] §1–§2. Domain **1.0** objectives 1.1, 1.2 | Can explain the full boot sequence cold |
| **2** | Domain **1.0** — storage (1.3), networking (1.4), shell (1.5) | Build an LV by hand: `pvcreate → vgcreate → lvcreate → mkfs → mount → fstab` |
| **3** | Domain **1.0** — backup (1.6), virtualization (1.7). Then Domain **2.0** — files/links, accounts | Explain `passwd` vs `shadow` vs `group`; hard vs symbolic link |
| **4** | Domain **2.0** — processes/signals/scheduling, packages, systemd, containers | `systemctl` verb table + signal table memorised |
| **5** | Domain **3.0** Security, then Domain **4.0** Automation | Explain SELinux permissive→fix→enforcing; write a bash script using a function + `case` + trap |
| **6** | Domain **5.0** Troubleshooting, then full review + timed mocks | Three timed 90-min mocks; weak-domain list is empty |

**Daily rhythm** (≈90 min): 45 min reading one objective, 30 min running the commands, 15 min recall-testing from [[LinuxPlus_Practice_Questions]].

## 6. Question-type tactics

### Multiple-choice
- **Read the last sentence first** — it states the goal. Many distractors do something else entirely.
- **Scenario questions reward the least-surprising admin action**, not the most thorough. They ask what a competent admin does *first*.
- Watch for **absolute words** — "all", "never", "guaranteed". Linux rarely has absolutes.
- Two commands that look similar: check which one is actually destructive vs read-only. `ls` vs `rm`; `mv` vs `cp`.

### Performance-based questions (PBQ)
PBQ weight **increased** in XK0-006. They are multi-step and often interactive (simulated terminal, config-file editing, matching lists).

- They come **first** on the exam in most sessions and you cannot skip back. Budget ~15–20 min for them.
- Build the answer incrementally — do the steps you're sure of before worrying about the uncertain ones.
- In a simulated shell, **the environment is unforgiving**: `rm` really deletes, `vi` really enters insert mode. Read before you type.
- Order matters in matching/ordering questions: read what the question calls "the best/most appropriate first".

## 7. Exam-day checklist

**The night before**
- [ ] Confirm voucher, ID, and test-centre requirements
- [ ] Know the testing-centre arrival time — you forfeit the exam if you're late
- [ ] Sleep. Cramming the night before measurably hurts performance-based questions

**The morning**
- [ ] Photo ID matching the name on the voucher
- [ ] Arrive 15–20 minutes early

**During — pacing**

| Block | Time | Content |
|-------|-----:|---------|
| PBQ | ~20 min | Performance-based items — do them first, carefully |
| Remaining ~70 questions | ~65 min | ≈ 55–60 sec per question |
| Review | ~5 min | Flag-and-return; with no negative marking, answer *everything* |

**If you're behind schedule:** stop reading the question text you're not getting. Flag it (`Ctrl+Flag`), guess, move on. Come back with the time you saved.

**Last-30-seconds check on any MCQ:** if you're torn between two answers, ask *which is the more conservative, reversible action* — the exam usually wants that one.

## 8. Common score-losers

1. **Confusing `start` vs `enable`** in systemd (2.5)
2. **Extending an LV without growing the filesystem** (1.3)
3. **`apt` vs `dnf` vs `rpm` vs `dpkg`** mixed up (2.4)
4. **`chcon` instead of `restorecon`** for SELinux (3.1)
5. **Editing `/etc/sudoers` directly instead of `visudo`** (3.1)
6. **Killing with `-9` first instead of `TERM`** (2.3)
7. **`usermod -G` without `-a`** silently dropping group memberships (2.2)
8. **Expecting `/bin` to be a real directory** on modern distros — it's a symlink to `/usr/bin` (1.1)
9. **Assuming a SELinux denial means the file is missing** — it's a *context* problem (5.4)
10. **Accepting AI-generated code without review** — 4.5 is new and tested

## Status

- [x] Blueprint verified against the published XK0-006 objectives and CompTIA's exam page
- [ ] Lab environment built — [[LinuxPlus_Resources]] §1
- [ ] Week 1 complete
- [ ] Three timed mocks completed