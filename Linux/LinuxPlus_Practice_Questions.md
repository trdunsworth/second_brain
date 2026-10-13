---
type: practice
topic: CompTIA Linux+ XK0-006 practice questions with answers and distractor explanations across all five domains
date: 2026-10-13
status: active
tags:
  - linux
  - comptia
  - linux-plus
  - practice-questions
  - exam-prep
---

# Linux+ XK0-006 — Practice Questions

> Goal: **retrieval practice**. Read a question, answer it out loud *before* looking, then check. Reading these passively teaches you almost nothing.
> 40 questions weighted to the blueprint. Answers and — importantly — **why the distractors are wrong** are in §2.
> Related: [[LinuxPlus_Exam_Overview]] · [[LinuxPlus_Cheatsheet]]

## How to use this

1. Cover §2. Work through §1 one domain at a time.
2. Mark each: ✅ correct · 🟡 right idea, wrong reason · ❌ wrong.
3. Score by domain against the blueprint weight. That tells you where to spend the next hour.
4. Re-do the ❌ ones **three days later**. Retrieval, not rereading, is what moves retention.
5. Anything below ~80% on a domain → re-read that note, then come back.

---

## 1. Questions

### Domain 1.0 — System Management (23%)

**1.** A technician has just run `lvextend -L +10G /dev/vg0/data` to expand a logical volume. `df -h` still reports the original size. What should the technician do next?

**2.** Which partition table supports more than four primary partitions and disks larger than 2 TB?

**3.** A RAID 5 array is built from five 1 TB drives. What is the usable capacity, and how many drives may fail without data loss?

**4.** The output of `ls -la` on a directory shows `drwxrwxrwt`. What does the final `t` indicate?

**5.** An administrator must grant a user in the `finance` group write access to a single file they don't own, without changing the file's owner or the parent directory's permissions. What is the correct tool?

**6.** A web server should be reachable from other machines on the LAN by its own IP address. Which virtual machine network type is correct?

**7.** `cmd > output.txt 2>&1` and `cmd 2>&1 > output.txt` are both valid syntax. Which one actually captures the error output in the file?

**8.** A user runs `crontab -e` and adds `*/5 * * * * /usr/local/bin/backup.sh`, but the job never produces output and no log is written. The same script works when run manually from an interactive shell. What is the most likely cause, and how should the entry be fixed?

**9.** On a modern Linux distribution, what is `/bin`?

**10.** An administrator needs to back up a directory, compress it with gzip, and extract it into `/opt/app` without leaving a wrapper directory. Which command achieves all three?

### Domain 2.0 — Services and User Management (20%)

**11.** An administrator runs `usermod -G docker tony` and immediately afterwards Tony can no longer use `sudo`. Why?

**12.** Where are a user's encrypted passwords stored on a standard Linux system, and which file contains the login names but no passwords?

**13.** A process is consuming CPU and the administrator wants to reduce its scheduling priority. Which command accomplishes this on an already-running process?

**14.** An administrator must stop a service cleanly so that it flushes its buffers and closes database connections. Which signal should be sent?

**15.** `kill -9 1234` returns immediately but the process remains, showing state `D`. What does this indicate?

**16.** A service works after `systemctl start nginx` but is missing after a reboot. Which single command makes it start automatically at boot?

**17.** An administrator edits `/etc/systemd/system/myapp.service`, changing the `ExecStart` path, then runs `systemctl start myapp` and the old behaviour persists. Why?

**18.** What is the difference between `chmod 4000`, `chmod 2000`, and `chmod 1000` on a file?

**19.** A user needs a home directory but after `useradd tony` there is no `/home/tony` and no `.bashrc`. What was missed?

**20.** An administrator installs a `.deb` with `dpkg -i`, and it reports unmet dependencies. What is the correct way to resolve this?

### Domain 3.0 — Security (18%)

**21.** A web server cannot read files in `/srv/web`. `ls -l` shows correct `755` permissions, and `getenforce` returns `Enforcing`. `sealert -a` shows a denial mentioning `httpd_sys_content_t`. What is the correct fix?

**22.** An administrator wants to confirm that a firewall rule survives a reboot on a RHEL-family system using `firewall-cmd`. What is correct?

**23.** What is the correct reason to put SELinux into Permissive mode?

**24.** An administrator edits `/etc/sudoers` with `nano` and introduces a syntax error, then reboots. What is the likely consequence?

**25.** Which statement correctly describes NAT?

**26.** A user must be able to run one specific restart command as root without typing a password, and must not be able to obtain a root shell from that command. Which directive combination achieves this?

**27.** A developer needs to permanently destroy encryption keys on a solid-state drive where block overwriting is unreliable due to wear levelling. What is the best approach?

**28.** A server's certificate is served fine on one client and rejected by another. Which two checks are most relevant?

### Domain 4.0 — Automation, Orchestration, and Scripting (17%)

**29.** What is the primary architectural difference between Ansible and Puppet?

**30.** A bash script needs to run a command only if the previous command succeeded, and must fail the script if any variable is unset. Which line is correct?

**31.** What does `[[ -z "$var" ]]` evaluate to when `var` is set to an empty string?

**32.** An administrator has been working on a feature branch and wants a clean, linear history before opening a pull request. What should they use?

**33.** Why should a Python script run inside a virtual environment rather than installing packages into the system interpreter?

**34.** A developer copies an AI-generated Ansible playbook into production without reading it, and it provisions the wrong security group. Which principle was violated, and what should have happened instead?

**35.** What does `trap 'cleanup' EXIT` accomplish in a shell script?

### Domain 5.0 — Troubleshooting (22%)

**36.** A server has a high load average of 14 on a 4-core system, but `top` shows 90% idle and `vmstat` shows a non-zero `b` column. What is the most likely cause?

**37.** Creating a new file on a filesystem returns `No space left on device`, but `df -h` reports 40% used. What should the administrator check next?

**38.** A user can `ping` a server successfully but cannot reach its web page on port 443. What are the two most likely causes?

**39.** An SLA commits to 99.9% uptime. The team sets an internal target of 99.95% and measures monthly availability. Identify the SLA, the SLO, and the SLI.

**40.** A filesystem has been remounted read-only. What does this almost certainly indicate?

---

## 2. Answers

### Domain 1.0

**1.** ✅ Run `resize2fs /dev/vg0/data` (ext4) or `xfs_growfs /mnt/data` (XFS).
> Extending the logical volume grows the block device; the filesystem must be told to use the new space — a **separate operation**. XFS specifically needs the **mount point**, not the device path.
> *❌ Distractor:* "`lvextend` failed" — it succeeded. *❌:* "Re-create the LV" — unnecessary and risky.

**2.** ✅ **GPT** (GUID Partition Table).
> 128 partitions, ~9.4 ZB, and requires an EFI System Partition for UEFI boot. **MBR** allows only 4 primary partitions and caps at ~2 TB.
> *❌:* "Extended partitions" — those are an MBR concept and still don't remove the 2 TB limit.

**3.** ✅ **4 TB usable; 1 drive may fail.**
> RAID 5 needs at least 3 disks, uses distributed single parity, and yields (n−1) disks. With five 1 TB drives: 5 − 1 = 4 TB.
> *❌:* "5 TB" — that's RAID 0, which has no redundancy at all. *❌:* "2 drives" — RAID 5 survives only one.

**4.** ✅ The **sticky bit** is set.
> On a directory it means only the owner of a file (or root) may delete or rename entries. That's why `/tmp` is `drwxrwxrwt`. Note the first two `rwx` groups would have been `rwx`/`rwx`; the `t` replaces the final execute bit with the sticky flag.

**5.** ✅ An **ACL**, using `setfacl -m u:USER:rw file`.
> ACLs grant access to a specific user or group without altering ownership or the directory's permissions — exactly the stated constraint. The file will show a `+` in `ls -l`.

**6.** ✅ **Bridged**.
> Bridged attaches the VM directly to the physical LAN, so it has its own IP address reachable from other machines. Under NAT the VM would only exist behind the host's IP.
> *❌:* "NAT" — outbound works but the VM is not directly addressable from the LAN. *❌:* "Host-only" — that isolates the VM from the LAN entirely.

**7.** ✅ `cmd > output.txt 2>&1`.
> Redirections are processed left to right. `> output.txt` points stdout at the file; `2>&1` then sends stderr wherever stdout points — the file. In the reversed form, `2>&1` copies stderr to the *original* stdout (the terminal) before stdout is ever redirected, so stderr stays on the screen.

**8.** ✅ **cron runs with a minimal environment, and its output goes to mail rather than a log.** The fix is to redirect explicitly and make every path absolute.
> cron gets almost no `PATH` (commonly just `/usr/bin:/bin`), so if the script calls anything by bare name — or relies on an environment variable set in your `.bashrc` — it fails silently. Separately, cron's default stdout/stderr is **mailed**, which goes nowhere on most systems, so failures vanish. The corrected entry:
> ```bash
> */5 * * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
> ```
> Other things to verify in order: the script has a valid `#!/usr/bin/env bash` shebang **and is executable** (`chmod +x`); any `cd` or relative paths inside it are absolute (cron starts in `$HOME`, not your project directory); and `systemctl status cron` shows the daemon running. Note the schedule `*/5 * * * *` itself is correct.
> *❌:* "The crontab syntax is wrong" — `*/5 * * * *` is valid. *❌:* "cron needs a full path to the crontab file" — `crontab -e` is correct.

**9.** ✅ A **symbolic link to `/usr/bin`**.
> Since the "usrmerge", `/bin`, `/sbin`, and `/lib` are symlinks into `/usr` on Fedora 30+, RHEL 8+, and Debian/Ubuntu ~19.04+. Custom admin scripts belong in `/usr/local/sbin`, not `/sbin`.

**10.** ✅ `tar -xzf backup.tar.gz -C /opt/app --strip-components=1`
> `x` extract, `z` gzip, `f` file, `C` change to directory, `--strip-components=1` removes the single leading directory wrapper. *(If you only need one of them: `tar -czf backup.tar.gz dir/` creates it.)*
> *❌:* `tar -xvzf archive` — extracts but doesn't strip the wrapper and dumps every file name.

### Domain 2.0

**11.** ✅ `usermod -G` **replaces** the user's entire supplementary group list.
> Without `-a` (append), Tony lost `sudo`, `docker`, and every other supplementary group he had. The fix is `usermod -aG docker tony`. He must then log out and back in, because existing processes don't pick up group changes.
> *❌:* "The `docker` group grants root and broke sudo" — plausible-sounding, but the mechanism is the missing `-a`.

**12.** ✅ `/etc/shadow` (readable only by root, mode 600); `/etc/passwd` (world-readable) contains the login names, UIDs, and GIDs but the password field is just an `x` placeholder.
> *❌:* "/etc/passwd" — explicitly not the password file. *❌:* "/etc/group" — no passwords, and not world-restricted.

**13.** ✅ `renice -n 10 -p 1234`
> `renice` changes the priority of a **running** process. `nice` applies at start. **Lower** the priority with a **higher** nice value — that's the detail the exam tests.
> *❌:* `nice 10 -p 1234` — `nice` starts new processes; it doesn't retune a running one.

**14.** ✅ **SIGTERM** (`kill -TERM <pid>`).
> SIGTERM (15) is the catchable, graceful signal that lets a daemon flush buffers, close connections, and remove its PID file. SIGKILL (9) gives no opportunity for cleanup.
> *❌:* `SIGKILL` / `kill -9` — forced termination, data-loss risk.

**15.** ✅ The process is in **uninterruptible sleep (`D` state)**, blocked on I/O.
> `D`-state tasks cannot be killed by any signal, including SIGKILL, until the kernel operation completes. A process stuck in `D` for a long time usually means **failing storage**. Check `dmesg -T | grep -i error` and SMART data.
> *❌:* "The PID is a zombie" — a zombie (`Z`) is already dead and cannot be killed either way.

**16.** ✅ `systemctl enable nginx`
> `enable` marks the unit to start at boot. `start` only affects the current session. `systemctl enable --now nginx` does both.
> *❌:* `systemctl start nginx` — that only runs it now (and the scenario says it already works).

**17.** ✅ **systemd caches unit definitions.** The administrator must run `systemctl daemon-reload` after editing a unit file so systemd re-reads it.
> *❌:* "The edit failed because of permissions" — the file was written (no error mentioned). *❌:* "systemd caches only for enabled units" — not true.

**18.** ✅ `setuid` (run with the owner's privileges), `setgid` (run with the group's privileges; on a directory, new files inherit its group), and the **sticky bit** (on a directory, only the file's owner or root may delete it).
> *❌:* "Owner / group / other permissions" — those are the leading three octal digits, not the special bit.

**19.** ✅ The **`-m`** option was omitted (`useradd -m tony`).
> Without `-m`, no home directory is created, and nothing is copied from `/etc/skel` — which is where `.bashrc` and `.profile` come from.
> *❌:* "Tony needs to run `chsh`" — changes the shell, not the home directory. *❌:* "The `/etc/skel` directory is missing" — not indicated.

**20.** ✅ Run `sudo apt install <package>` (or `sudo apt -f install`) to resolve dependencies.
> **`dpkg` installs only the single `.deb` and does not fetch dependencies**; `apt` resolves them. `apt-get -f install` specifically fixes broken installs, and `sudo dpkg --configure -a` completes an interrupted unpack.
> *❌:* "Re-run `dpkg -i`" — same result. *❌:* "Download the dependencies by hand" — unnecessary.

### Domain 3.0

**21.** ✅ Run **`restorecon -Rv /srv/web`**.
> The permissions are already correct, so this is a **SELinux context** problem: the files are labelled with a type the web server's policy doesn't permit. `restorecon` resets the context to the policy default. If `/srv/web` is a non-standard path, also add a **permanent** rule with `semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"` so the label survives a relabel.
> *❌:* "`chmod 777`" — masks the symptom, ignores SELinux, and reduces security. *❌:* "Disable SELinux" — removes all MAC enforcement. *❌:* "`chcon`" — manual and temporary; overwritten by the next relabel.

**22.** ✅ `firewall-cmd --permanent --add-port=8080/tcp` **followed by** `firewall-cmd --reload`.
> A change made without `--permanent` exists only in the **runtime** configuration and vanishes on reload or reboot. The permanent configuration is the one that persists.
> *❌:* `firewall-cmd --add-port=8080/tcp` alone — works immediately, gone after reboot. *❌:* Editing `/etc/firewalld/zones/public.xml` while firewalld is running — it overwrites the file on the next reload.

**23.** ✅ To **confirm SELinux is the cause** while still collecting the denial messages in the log.
> Permissive logs violations but doesn't block them, which tells you whether SELinux is responsible **before** you change labels or policy. The correct full sequence is: Permissive → read `sealert`/`ausearch` → **fix the actual context or boolean** → return to **Enforcing**.
> *❌:* "To improve security" — Enforcing is the secure mode. *❌:* "Because it's faster" — irrelevant. *❌:* "To make the service work permanently" — the proper fix is to correct the context.

**24.** ✅ The system may **fail to boot into a usable state**, or sudo becomes unusable — the administrator can lock themselves out of root escalation.
> A syntax error in `/etc/sudoers` means sudo can't parse its own policy file. `visudo` exists precisely to validate syntax before writing and refuses invalid changes.
> *❌:* "SELinux will block the boot" — unrelated. *❌:* "Only that one rule is lost" — the whole file is unparseable.

**25.** ✅ **SNAT modifies the source address of outbound traffic; DNAT modifies the destination address of inbound traffic; PAT extends SNAT by also translating the port so many hosts can share one public IP.**
> The distinguishing feature is which end of the packet is rewritten and in which direction traffic is crossing the boundary.
> *❌:* "NAT is stateless" — modern NAT implementations track connection state. *❌:* "NAT provides encryption" — it provides address translation, not confidentiality.

**26.** ✅ `tony ALL=(root) NOPASSWD: /usr/bin/systemctl restart myapp, NOEXEC: /usr/bin/systemctl restart myapp`
> Practically, you'd use the NOEXEC variant (or restrict the command so it can't spawn a shell): **`tony ALL=(root) NOPASSWD: NOEXEC: /usr/bin/systemctl restart myapp`**. `NOPASSWD:` satisfies "without typing a password"; `NOEXEC:` prevents the process from spawning other programs, so the user can't pivot to a root shell.
> *❌:* "`NOPASSWD: ALL`" — meets the first requirement but lets the user run anything as root, including a shell. *❌:* "Add the user to `wheel`" — that grants all root commands with a password.

**27.** ✅ **Cryptographic erasure** — destroy the LUKS key so the ciphertext is unrecoverable.
> `shred` and multi-pass `dd` overwrite rely on the same physical blocks being written. On SSDs, wear levelling and over-provisioning remap blocks, so overwritten data may be intact elsewhere. Destroying the key (or running `cryptsetup-luksClose` and wiping the keyfile) removes the plaintext-ciphertext relationship instantly, regardless of the medium.
> *❌:* "Use `shred -n 3`" — listed on the objectives and correct for a single file on spinning disk, but unreliable on flash. *❌:* "Run `badblocks -w`" — also overwrite-based, same limitation.

**28.** ✅ **The certificate's validity dates and the system clock**; and **whether the client's trust store contains the issuing CA** (and the full chain).
> Common real causes: an expired certificate, a **wrong system time on the client** (TLS validation fails), a missing intermediate CA in the chain, or a hostname mismatch against the certificate's SAN.
> *❌:* "Check the firewall" — the connection is being made, so it's a TLS-layer problem, not a port problem.

### Domain 4.0

**29.** ✅ **Ansible is agentless** (it connects over SSH and needs only Python on the target); **Puppet runs an agent on every managed node** and authenticates using certificates.
> Secondary differences: Ansible uses YAML playbooks; Puppet uses its own DSL and compiles a catalog delivered to the agent. Port 22 vs 8140.
> *❌:* "Ansible uses agents" — the reverse. *❌:* "Both require root access via SSH keys" — Puppet doesn't.

**30.** ✅ `set -euo pipefail`
> `-e` exits on command failure, `-u` errors on unset variables, `-o pipefail` makes a pipeline fail if any stage fails (otherwise only the last command's status counts).
> *❌:* `set -eo` — leaves unset variables unguarded. *❌:* `set -u` alone — a failing command wouldn't stop the script.

**31.** ✅ **True (0 / success).**
> `-z` tests for **zero length**, and an empty string has zero length. Remember the mnemonic: `-n` = **n**on-empty, `-z` = **z**ero-length. Getting these backwards is a classic exam trap — the condition here passes because the variable *is* empty.
> *❌:* "False" — that would be `[[ -n "$var" ]]`.

**32.** ✅ `git rebase` onto the main branch, or `git merge --squash`.
> Rebase replays the feature branch's commits on top of the target branch, producing a **linear** history; squashing collapses the work into a **single** commit. Both are appropriate for your own unshared branch before a review.
> *❌:* "Use `reset --hard` on the shared branch" — destroys other people's work. *❌:* "Rebase after the branch is merged and shared" — rewrites published history and breaks everyone who pulled it.

**33.** ✅ **Isolation and reproducibility** — the venv keeps project dependencies separate from the system Python, so the script gets exactly the versions it was tested with.
> As root, `pip install` writes into the **system** `site-packages`, which can shadow distribution-managed modules and cause `apt`/`dnf` upgrades to fail or remove packages the OS needs.
> *❌:* "So Python runs faster" — negligible. *❌:* "Because pip can't write to system directories otherwise" — it can, which is exactly the problem.

**34.** ✅ The violated principle is **verify AI output / human review before use**.
> LLM output is a **draft**, not a deployable artefact — it can be plausible, syntactically valid, and functionally wrong. The correct workflow: generate → **read and understand every line** → test in a non-production environment → review against policy → then deploy with normal peer review and version control.
> *❌:* "The model was trained on outdated Ansible versions" — speculative and not the principle being tested. *❌:* "The prompt was too short" — plausible but the scenario's failure is the missing review step.

**35.** ✅ It registers a handler that runs **`cleanup` whenever the script exits**, however it exits — normal completion, an `exit` call, or a fatal error under `set -e`.
> Paired with `set -euo pipefail`, it guarantees temp files are removed and logs flushed even on failure. `trap ... ERR` fires on error specifically; `trap ... EXIT` fires on all exits.
> *❌:* "It retries the failing command" — no. *❌:* "It sends a signal to the parent" — no.

### Domain 5.0

**36.** ✅ The system is **I/O-bound, not CPU-bound** — tasks are blocked waiting on storage.
> Load average counts both **runnable** and **uninterruptible** tasks. 90% idle CPU rules out a CPU bottleneck; a non-zero `b` column in `vmstat` means tasks are blocked on I/O. The next step is `iostat -xz 1` and `ps -eo state,pid,cmd | grep '^D'` to find the stalled processes and the device.
> *❌:* "Add more CPU" — the CPU is 90% idle. *❌:* "Too many runnable processes" — that would show low `%idle`.

**37.** ✅ **Check inode usage with `df -i`.**
> `df -h` reports bytes; `No space left on device` can also mean **inode exhaustion** — too many small files with no bytes consumed. Other candidates in order: a quota (`quota -v`), a missing mount (`findmnt`), a deleted-but-open file (`lsof +L1`), or a read-only filesystem.
> *❌:* "Delete more log files" — may not help if bytes aren't the constraint. *❌:* "Run fsck" — the filesystem is intact; there's simply nothing left to allocate.

**38.** ✅ **(1)** The service isn't listening on port 443 (`ss -tulpn | grep :443`), and **(2)** a firewall rule is blocking that port.
> Ping is **ICMP at layer 3**; HTTPS is **TCP at layer 4**. Successful ping proves basic IP connectivity and rules out DNS and routing — so the fault is at the port/service/firewall layer.
> *❌:* "The DNS configuration is wrong" — a hostname that resolves to the wrong address would break ping too. *❌:* "The default gateway is incorrect" — ping already succeeded.

**39.** ✅
| Element | Answer |
|---------|--------|
| **SLA** | **99.9% uptime** — the commitment in the customer contract |
| **SLO** | **99.95%** — the internal target, set *above* the SLA for margin |
| **SLI** | **The actual measured monthly availability** — the metric computed from real data |
> The relationship to remember: **the SLO is set higher than the SLA so the SLA isn't breached**, and the **SLIs are the measurements** that tell you whether you're meeting the SLO.
> *❌:* "The SLA is the metric being monitored" — that describes an SLI. *❌:* "The SLI is the internal goal" — that's the SLO.

**40.** ✅ **The kernel detected an I/O or filesystem error and remounted the filesystem read-only to prevent further damage.**
> This is **data-preserving behaviour**, not a configuration choice — the filesystem will stay read-only until an administrator runs `fsck` (from rescue media, with the filesystem unmounted) and reboots. The underlying cause — a failing disk, bad cable, or controller — must be investigated with `dmesg -T | grep -i error` and `smartctl -a`.
> *❌:* "Someone mounted it with `-o ro`" — that wouldn't survive a remount automatically. *❌:* "The disk quota was reached" — quotas cause write failures, not a remount.

---

## 3. Scoring

| Domain | Questions | Weight | Your score |
|--------|----------:|-------:|------------|
| 1.0 System Management | 10 | 23% | __/10 |
| 2.0 Services & User Mgmt | 10 | 20% | __/10 |
| 3.0 Security | 8 | 18% | __/8 |
| 4.0 Automation & Scripting | 7 | 17% | __/7 |
| 5.0 Troubleshooting | 5 | 22% | __/5 |
| **Total** | **40** | | **__%** |

**Interpretation**
| Score | Action |
|------:|--------|
| 90%+ | Sit the mock exams. Focus on PBQ speed. |
| 75–89% | Re-read the notes for every domain under 80%. |
| 60–74% | Go back to the domain notes properly — don't just re-drill questions. |
| <60% | Rebuild from [[LinuxPlus_Exam_Overview]] §5. Hands-on lab time before more questions. |

> [!tip] A note on practice questions
> CompTIA explicitly prohibits "brain dumps" — sites selling real exam questions. Using them risks **revocation and a testing ban**. Build your own drills from the objectives instead: write a scenario, answer it, then check the note. See [[LinuxPlus_Resources]] §5 for legitimate practice options.

## Status

- [x] 40 questions written with distractor analysis
- [ ] Completed cold, scored
- [ ] Re-completed the ❌ items after 3 days
- [ ] Re-completed the 🟡 items after 7 days