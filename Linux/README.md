---
type: index
topic: Linux folder index — CompTIA Linux+ (XK0-006 / V8) study guide, one note per exam domain plus cheatsheet, practice questions, and resources
date: 2026-10-13
status: active
tags:
  - moc
  - linux
  - comptia
  - linux-plus
  - certification
  - study-guide
---

# CompTIA Linux+ (XK0-006) — Index

> Goal: pass the **CompTIA Linux+ XK0-006 (V8)** exam. **Start with [[LinuxPlus_Exam_Overview]]** for format and the study plan, then work the domain notes **1.0 → 5.0 in order**. Keep [[LinuxPlus_Cheatsheet]] open while practicing and [[LinuxPlus_Practice_Questions]] for recall drills.
> This folder is **exam-focused**: it covers every published objective at the depth the exam tests it, and links out to deeper notes where the vault already has them.

## Exam card

| | |
|---|---|
| Exam | **XK0-006** (V8) |
| Launched | July 15, 2025 (retired XK0-005 on **Jan 13, 2026**) |
| Questions | Max 90 — multiple-choice **and performance-based (PBQ)** |
| Time | 90 minutes |
| Pass score | **720** (scaled 100–900) |
| Recommended | 12 months hands-on Linux server admin; A+/Network+/Server+ helpful |

> [!warning] Most third-party material is stale
> Anything showing **4 domains** or **System Management at 32%** is the retired XK0-005 blueprint. XK0-006 has **5 domains**.

## Domain weights

| Domain | Weight | ≈ items (of 90) | Note |
|--------|-------:|---------------:|------|
| 1.0 System Management | **23%** | ~21 | Boot, kernel, storage, network, shell, backup, virtualization |
| 2.0 Services and User Management | **20%** | ~18 | Files, accounts, processes, packages, systemd, containers |
| 3.0 Security | **18%** | ~16 | AAA, firewalls, hardening, crypto, audit |
| 4.0 Automation, Orchestration, and Scripting | **17%** | ~15 | IaC, shell, **Python**, Git, **AI** |
| 5.0 Troubleshooting | **22%** | ~20 | Monitoring, hardware/storage, network, security, performance |

> 1.0 + 5.0 = **45% of the exam**. Those two notes are the spine.

## Start here

| You want… | Go to |
|-----------|-------|
| Exam format, domains, study plan, day-of tactics | [[LinuxPlus_Exam_Overview]] ← **the gate** |
| Boot process, kernel, modules, storage/LVM/RAID, networking, shell, backup, virtualization | [[LinuxPlus_1_System_Management]] ← **biggest domain** |
| Files, users/groups, processes, packages, systemd, containers | [[LinuxPlus_2_Services_User_Management]] |
| AAA, sudo, permissions, SELinux, SSH hardening, firewalls, crypto | [[LinuxPlus_3_Security]] |
| Ansible/Puppet/OpenTofu, CI/CD, bash, Python, Git, responsible AI | [[LinuxPlus_4_Automation_Scripting]] |
| Monitoring/SLA/SLI/SLO, hardware, network, security, performance | [[LinuxPlus_5_Troubleshooting]] |
| Command + flag lookup while practicing | [[LinuxPlus_Cheatsheet]] |
| Self-test before booking the exam | [[LinuxPlus_Practice_Questions]] |
| Labs, courses, books, communities | [[LinuxPlus_Resources]] |

## The notes

| Note | What it is |
|------|------------|
| [[LinuxPlus_Exam_Overview]] | Blueprint, weights, question types, 6-week plan, PBQ tactics, day-of checklist |
| [[LinuxPlus_1_System_Management]] | 1.1–1.7: concepts/FHS/arch, kernel modules, storage, network config, shell, backup, virtualization |
| [[LinuxPlus_2_Services_User_Management]] | 2.1–2.6: file ops & links, `/etc/passwd`-`/etc/shadow`, processes/signals/scheduling, packages, systemd, containers |
| [[LinuxPlus_3_Security]] | 3.1–3.6: AAA, sudo/sudoers, permissions & ACLs, SELinux, SSH hardening, firewalld/ufw/nftables, NAT, LUKS/GPG/TLS |
| [[LinuxPlus_4_Automation_Scripting]] | 4.1–4.5: Ansible/Puppet/OpenTofu, CI/CD, bash constructs, Python for sysadmin, Git, responsible AI use |
| [[LinuxPlus_5_Troubleshooting]] | 5.1–5.5: SLA/SLI/SLO, monitoring, storage/boot failures, network faults, SELinux denials, performance triage |
| [[LinuxPlus_Cheatsheet]] | One-pagers: octal↔symbolic, signals, fstab, LVM/RAID, systemd, containers, ports, commands |
| [[LinuxPlus_Practice_Questions]] | 40 practice items across all 5 domains with answers + why the distractors are wrong |
| [[LinuxPlus_Resources]] | Lab setup (KVM on your Linux box), free courses, books, practice-test strategy |

## How they fit together

```
LinuxPlus_Exam_Overview  (know the blueprint, plan the 6 weeks)
  └─ 1 System_Management  ────────── 23%  boot → kernel → storage → network → shell
       └─ LinuxPlus_Cheatsheet        (lookup while practicing every domain)
  └─ 2 Services_User_Mgmt ───────── 20%  files → users → processes → packages → systemd → containers
  └─ 3 Security  ───────────────── 18%  AAA → sudo → perms/SELinux → SSH → firewalls → crypto
  └─ 4 Automation_Scripting ────── 17%  IaC/CI-CD → bash → Python → Git → AI
  └─ 5 Troubleshooting  ────────── 22%  monitoring → hardware → network → security → performance
       └─ LinuxPlus_Practice_Questions   (drill until retrieval is automatic)
  LinuxPlus_Resources  (where to practise hands-on)
```

## Related notes in this vault

These already exist and are **deeper** than this folder — use them for depth, not for the exam outline:

- [[Linux_Terminal_Toolkit]] — the command-line reference this exam leans on most. §1 safety rules, §2 utilities, §6 processes, §7 package managers. **Read this alongside 1.0 and 2.0.**
- [[Terminal_Fluency_Program]] — structured shell practice plan
- [[Tmux_Tutorial]] / [[Tmux_Cheatsheet]] — long-running CLI work survives disconnects
- [[Neovim_Tutorial]] / [[Vim_Tutorial]] / [[Emacs_Tutorial]] — the `vi`/`vim` editor objective
- [[TUI_Programs]] — terminal apps, useful for post-exam productivity (not tested)
- [[Lisp_Installation]] — Fedora/Ubuntu install paths (you'll need a box to practise on)

## Status

- [x] Folder created: 10 notes (9 content + this index), frontmatter verified 2026-10-13
- [x] Blueprint built from the official **XK0-006 objectives document** (weights, sub-objective lists, acronym list)
- [ ] Lab environment up — KVM host confirmed, Rocky + Ubuntu guests with baseline snapshots — **manual**: [[LinuxPlus_Resources]] §1
- [ ] Domain 1.0 drill — [[LinuxPlus_1_System_Management]]
- [ ] Domain 2.0 drill — [[LinuxPlus_2_Services_User_Management]]
- [ ] Domain 3.0 drill — [[LinuxPlus_3_Security]]
- [ ] Domain 4.0 drill — [[LinuxPlus_4_Automation_Scripting]]
- [ ] Domain 5.0 drill — [[LinuxPlus_5_Troubleshooting]]
- [ ] Practice questions ≥ 80% — [[LinuxPlus_Practice_Questions]]