---
type: study-guide
topic: CompTIA Linux+ XK0-006 domain 1.0 System Management — Linux concepts, kernel modules, storage, networking, shell, backup, virtualization
date: 2026-10-13
status: active
tags:
  - linux
  - comptia
  - linux-plus
  - system-management
  - storage
  - lvm
  - networking
  - virtualization
---

# Domain 1.0 — System Management (23%)

> Goal: the heaviest domain. Boot → kernel → devices → storage → network → shell → backup → virtualization.
> Related: [[LinuxPlus_Exam_Overview]] · [[LinuxPlus_Cheatsheet]] · [[Linux_Terminal_Toolkit]] (deeper command reference) · [[Vim_Tutorial]]

## 1.1 — Basic Linux concepts

### Boot process (memorize the order)

```
Power on
   ↓
1. BIOS or UEFI firmware      ← POST, pick boot device
   ↓
2. Bootloader (GRUB2)         ← /etc/default/grub, /boot/grub2/grub.cfg
   ↓
3. Kernel                     ← vmlinuz, loads drivers
   ↓
4. initrd / initramfs         ← dracut (RHEL/Fedora) | mkinitrd (Debian)
   ↓                          early userspace; mounts root, finds real drivers
5. systemd (PID 1)            ← mounts fstab, starts units, reaches target
   ↓
6. Login shell / display manager
```

| Stage | Key files | Commands |
|-------|-----------|----------|
| Bootloader | `/etc/default/grub`, `/boot/grub2/grub.cfg` | `grub2-mkconfig -o /boot/grub2/grub.cfg` |
| Kernel | `/boot/vmlinuz-*` | `uname -r` |
| initrd | `/boot/initramfs-*.img` / `initrd.img-*` | `dracut` (RHEL), `mkinitrd` (Debian) |
| Kernel log | — | `dmesg`, `journalctl -k` |

**PXE (Preboot Execution Environment)** = network boot. No local disk — the firmware fetches a bootloader over the network from a TFTP server. Used for diskless systems and large deployments.

> [!tip] Exam trap
> `uname -r` gives the **running kernel version**. A kernel can be *installed* without being *running* — that's exactly why a kernel update requires a reboot. Questions will test this.

### Filesystem Hierarchy Standard (FHS)

| Path | Contains |
|------|----------|
| `/` | Root — everything else hangs off it |
| `/bin` | Essential binaries (**symlink → `/usr/bin`** on modern distros) |
| `/sbin` | Essential system admin binaries (**symlink → `/usr/sbin`**) |
| `/boot` | Kernel, initrd, GRUB, modules |
| `/dev` | Device files (block, character) |
| `/etc` | System-wide configuration files |
| `/home` | User home directories |
| `/lib` | Libraries (**symlink → `/usr/lib`**) |
| `/proc` | Virtual **process** filesystem (kernel ↔ userspace) |
| `/tmp` | Temporary files, often cleared on boot |
| `/usr` | Userland programs, libraries, share — "not from `/usr`, don't put it in `/usr`" |
| `/var` | Variable data: **logs (`/var/log`)**, spool, mail, databases, lib |

> [!warning] `/bin` is not a real directory anymore
> Since the "usrmerge" (Fedora 30+, Debian/Ubuntu ~19.04+), `/bin`, `/sbin`, and `/lib` are **symlinks into `/usr`**. If a question asks "where do I put a custom admin script", the answer is `/usr/local/sbin` — never `/sbin`, which isn't writable and doesn't exist as a real dir.

**`/proc` vs `/sys`** — memorise this pair:
- `/proc` — **processes** and kernel state. Pseudo-filesystem, nothing on disk. `/proc/cpuinfo`, `/proc/meminfo`, `/proc/PID/`, `/proc/loadavg`
- `/sys` — **devices** and kernel objects (device tree view of hardware). `/sys/class/net/`

### Server architectures

| Architecture | Notes |
|--------------|-------|
| `x86` (i386) | 32-bit Intel/AMD — legacy, 4 GB RAM ceiling |
| **`x86_64` / AMD64** | 64-bit x86 — what "amd64" means on your Linux box |
| **AArch64** (ARM64) | 64-bit ARM — Graviton, Ampere, Raspberry Pi, Apple Silicon |
| **RISC-V** | Open ISA — cloud providers piloting it |

Check with `uname -m`.

### Distributions

| Family           | Package manager                                       | Package format | Examples                                       |
| ---------------- | ----------------------------------------------------- | -------------- | ---------------------------------------------- |
| **RPM-based**    | `dnf` (modern), `yum` (legacy alias), `zypper` (SUSE) | `.rpm`         | RHEL, Rocky, AlmaLinux, Fedora, openSUSE, SLES |
| **Debian-based** | `apt` (user-facing), `dpkg` (low-level), `aptitude`   | `.deb`         | Debian, Ubuntu, Kali, Mint                     |
| **Arch-based**   | pacman (user-facing)                                  | .aur           | Arch Linux, Manjaro, EndeavourOS               |

### GUI stack (know the layers)

| Layer | Examples | Role |
|-------|----------|------|
| Display server | **X.Org (X11)**, **Wayland** | Provides the display |
| Display manager | GDM, SDDM, LightDM | Login screen; starts session |
| Window manager | Mutter, KWin, i3 | Window decoration/placement |
| Desktop environment | GNOME, KDE Plasma, XFCE | The full user experience |
| Toolkit | GTK, Qt | Widgets |

`X11` and `Wayland` are the modern alternatives — the exam will ask you to tell them apart.

### Software licensing

| Type | Meaning | Examples |
|------|---------|---------|
| **Open source** | Source available, modifiable; may have copyleft obligations | Linux kernel (GPLv2), Apache 2.0, MIT, BSD |
| **Free software** | FSF's stricter definition — the **four freedoms**: run, study, modify, redistribute | GNU GPL |
| **Proprietary** | Source closed, licensed, often per-seat | Red Hat Enterprise Linux, VMware vSphere, Windows |

> **Copyleft (GPL)** is the distinguishing concept: derivative works must also be released under the same license. Permissive licences (MIT, BSD, Apache) do not require that.

### Open source vs free software
These are **not synonyms**. Open source is about *source availability*; free software is about *user freedom*. The OSI (Open Source Initiative) and the FSF disagree about whether open source is genuinely "free". The exam tests this distinction.

---

## 2. 1.2 — Device management

### Kernel modules

```bash
lsmod                  # list loaded modules
lsmod | grep nvidia    # is this driver loaded?
modprobe nvidia        # load by module name  ← use this (handles deps)
modprobe -r nvidia     # unload (remove)
modinfo nvidia         # what is this module, what does it need?
insmod ./my.ko         # insert a specific file at an exact path
rmmod my_module        # remove by loaded name
depmod -a              # rebuild the dependency database
```

> [!tip] The key distinction the exam tests
> **`modprobe`** takes a *module name* and resolves dependencies + parameters from config. **`insmod`** takes a *file path* and loads exactly that file with no dependency resolution. In practice: **`modprobe` always, `insmod` almost never.**

Module files live in `/usr/lib/modules/$(uname -r)/kernel/`. Persistent settings in `/etc/modprobe.d/`.

### Device inspection tools

| Command | Shows |
|---------|-------|
| `lspci -k` | PCI devices **and the kernel driver each one is using** |
| `lsusb` | USB devices |
| `lshw -short` | Full hardware inventory |
| `lscpu` | CPU architecture, cores, flags |
| `lsmem` | Memory slots and sizes |
| `free -h` | RAM usage — look at **`available`**, not `free` |
| `dmidecode` | BIOS/DMI — hardware make, serial, UUID (**needs root**) |
| `dmesg` | Kernel ring buffer — driver probe failures land here |
| `ipmitool` | Out-of-band **BMC/IPMI** — remote power, sensors, console |
| `lm_sensors` | Temperatures, fan RPM, voltages |
| `nvtop` | Live GPU utilisation |

> [!tip] The framework of the answer
> Hardware problems come in four distinguishable layers, and questions are written around them:
> 1. The hardware **exists** (physically present / in the VM config)
> 2. The kernel **sees** it (`lspci`/`lsusb` list it)
> 3. A module is **loaded and bound** to it (`lsmod`, `lspci -k` shows the "Kernel driver in use")
> 4. It **works** (`ethtool`, functional test)
>
> A device failing at layer 2 → bus/PCIe problem. Failing at layer 3 → module missing, blacklisted, or incompatible. Failing at layer 4 → driver bound but device/firmware error.

**Hardware present but not usable:** check `dmesg` for probe failures, `lsmod` for a loaded module, `/etc/modprobe.d/` for a **blacklist** entry, and `/lib/modules/$(uname -r)/` for whether the module even exists for *this running kernel*.

### initrd management

| Task | RHEL/Fedora | Debian/Ubuntu |
|------|-------------|---------------|
| Build an initramfs | `dracut -f /boot/initramfs-$(uname -r).img $(uname -r)` | `update-initramfs -u -k all` |
| Rebuild after module change | `dracut -f` | `update-initramfs -u` |

If you install a module needed for early boot (disk controller, LVM, crypto), rebuild the initrd **or the system won't boot after the next kernel update**.

---

## 3. 1.3 — Storage management

### The dependency chain (how storage questions are framed)

```
block device → partition → [RAID] → [LVM] → filesystem → mount point → /etc/fstab
```

**A failure at any earlier layer makes every later layer look broken.** When a question says "the filesystem won't mount", the answer may be a layer *below* it. Always work down the chain, never up.

### Partitions

| Tool | Notes |
|------|-------|
| `lsblk -f` | Block devices, filesystems, mount points — the first thing you run |
| `blkid` | UUID and type of each filesystem (needed for fstab) |
| `fdisk /dev/sda` | **MBR** partitioning — 4 primary partitions max, **2 TB limit** |
| `gdisk /dev/sda` | **GPT** — 128 partitions, 9.4 ZB |
| `parted` | Scriptable partitioning; handles both |
| `growpart /dev/sda 1` | Grow a partition **after** the LV underneath it grew |

| | MBR | GPT |
|---|---|---|
| Max partitions | 4 primary (+ logical via extended) | 128 |
| Max disk size | ~2 TB | ~9.4 ZB |
| Boot for UEFI | — | Requires an **EFI System Partition** (FAT32, ~512 MB) |
| Backup | — | Backup GPT header at the **end** of the disk (`gdisk backup`) |

### LVM — three layers

**Physical Volume → Volume Group → Logical Volume** (bottom-up)

| Layer | Create | Inspect | Modify | Delete | Scan/Import |
|-------|--------|---------|--------|--------|------------|
| **PV** | `pvcreate` | `pvs`, `pvdisplay`, `pvscan` | `pvresize`, `pvmove` | `pvremove` | |
| **VG** | `vgcreate` | `vgs`, `vgdisplay` | `vgextend`, `vgchange`, `vgrename` | `vgremove` | `vgscan`, `vgimport`, `vgexport` |
| **LV** | `lvcreate` | `lvs`, `lvdisplay` | `lvextend`/`lvresize`, `lvchange`, `lvmove` | `lvremove` | |

```bash
# Full build, end to end
pvcreate /dev/sdb1
vgcreate vg0 /dev/sdb1
lvcreate -n data -L 10G vg0
mkfs.ext4 /dev/vg0/data
mkdir -p /mnt/data
mount /dev/vg0/data /mnt/data
```

> [!danger] The single most-tested LVM trap
> **Extending an LV and growing its filesystem are two separate operations.**
> ```bash
> lvextend -L +5G /dev/vg0/data          # 1. grow the block device
> resize2fs /dev/vg0/data                # 2a. grow ext4 to match
> xfs_growfs /mnt/data                   # 2b. XFS: needs a MOUNT POINT, not a device
> ```
> Do only step 1 and `df` still shows the old size. A question that gives you a stuck "disk full after an expansion" is testing exactly this.
>
> Two more LVM details worth free points: **XFS cannot be shrunk** (ext4 can, online). **`pvmove`** migrates data off a PV so you can remove it.

### Filesystems

| FS | Type | Key properties |
|----|------|----------------|
| **ext4** | Journaled | The common default. `resize2fs` both ways. |
| **XFS** | Journaled | High parallelism, large files. **Cannot shrink.** Grows online via `xfs_growfs`. |
| **btrfs** | CoW + checksums | Snapshots, subvolumes, built-in integrity, RAID |
| **tmpfs** | RAM | In-memory, in `/dev/shm`. Faster swap for hot files |

Create: `mkfs.ext4`, `mkfs.xfs`, `mkfs.btrfs`, `mkfs -t <type>`.

### Filesystem utilities

| Command | Use |
|---------|-----|
| `df -h` | Free space **per filesystem** — note `Use%` and `Mounted on` |
| `df -i` | **Inode** usage — catch "disk full" that isn't bytes |
| `du -sh dir/` | Space used by a directory — walks *upward* |
| `fsck /dev/sda2` | Check/repair (must be **unmounted** first) |
| `fsck -y` | Auto-accept repairs |
| `xfs_repair /dev/sda2` | XFS repair |
| `resize2fs` | Resize ext2/3/4 |
| `xfs_growfs` | Grow XFS (online) |
| `tune2fs` | Tune ext parameters (inode count, mount options) |
| `dumpe2fs -h` | Show superblock settings |
| **`fio`** | **Storage I/O benchmarking** — writes a test workload, reports IOPS/throughput/latency |

### RAID

| Level | Min disks | Redundancy | Capacity | Notes |
|-------|----------:|------------|----------|-------|
| **RAID 0** (striping) | 2 | None | Sum of all | Max performance, **any disk failure = total data loss** |
| **RAID 1** (mirroring) | 2 | 1 disk | Size of smallest | Read performance, redundancy |
| **RAID 5** (striped + distributed parity) | **3** | 1 disk | (n−1) disks | **Cannot survive 2 failures.** The classic exam answer |
| **RAID 6** | **4** | 2 disks | (n−2) disks | Double parity, survives 2 |
| **RAID 10** (stripe of mirrors) | **4** | 1 per mirror pair | Sum of mirrors | Fast rebuild, expensive |
| **RAID 50 / 60** | 6 / 8 | varies | — | Striped across parity sets |

```bash
cat /proc/mdstat          # ← THE command: status of all software RAID arrays
mdadm --detail /dev/md0
mdadm --create /dev/md0 --level=5 --raid-devices=3 /dev/sdb1 /dev/sdc1 /dev/sdd1
```

`/proc/mdstat` shows array state (`active`, `clean` / `degraded`, `recovery=` %), rebuild progress, and which devices are members.

> [!tip] RAID questions
> They're almost always "which level can survive N failures" or "which gives the most usable space with N disks at M capacity". RAID 5 with 3×1 TB = 2 TB usable, survives 1 failure. That's the one to know cold.

### Mounting

**`/etc/fstab` — 6 fields, one per line**

```
# <device>      <mount point>  <type>   <options>                        <dump>  <pass>
UUID=abc-123    /              ext4     defaults                          0       1
UUID=def-456    /boot          xfs      defaults,noatime                  0       2
UUID=ghi-789    swap           swap     sw                                 0       0
//server/share  /mnt/share     cifs     credentials=/etc/smbcreds,_netdev  0       0
```

| Field | Notes |
|-------|-------|
| **dump** | Legacy backup flag — **always 0** on modern systems (use `rdump`/`rsnapshot`) |
| **pass** | fsck order: `/` = **1**, other checkable = **2**, **0 = skip** (swap, network, exotic) |
| options | See below |

**Mount options**

| Option | Effect |
|--------|--------|
| `defaults` | `rw,suid,dev,exec,auto,nouser,async` |
| `ro` / `rw` | Read-only / read-write |
| `noexec` | **Refuse to execute binaries from this mount** |
| `nosuid` | Ignore setuid/setgid bits on this mount |
| `nodev` | Ignore device files on this mount |
| `noatime` | Don't update access times (big performance win) |
| `nodiratime` | Don't update directory access times |
| `nofail` | **Don't fail boot if this mount is missing** |
| `relatime` | Update atime only if older than a day or >1h old (the modern default) |
| `remount` | Change flags on an already-mounted fs |
| `_netdev` | It's a network fs — mount after networking |
| `x-systemd.automount` | Lazy automount on first access |

**Other mount tooling**

| File/Command | What |
|--------------|------|
| `/etc/fstab` | **Persistent** mount config — the source of truth |
| `/proc/mounts` | Kernel's live view (read-only) |
| `/etc/mtab` | Symlink to `/proc/mounts` on modern systems |
| `mount` / `umount` | Attach / detach |
| `autofs` | **On-demand automounting** — NFS mounts on first access |
| `findmnt` | Show the mount tree (better than parsing `mount`) |

**Network mounts**

| Type | Notes |
|------|-------|
| **NFS** | Linux-native. `mount -t nfs server:/export /mnt`. Add `_netdev,nofail`. NFSv4 uses the filesystem root. |
| **SMB/CIFS** | Windows/Samba. `mount -t cifs //server/share /mnt -o username=...`. Add `credentials=/etc/smbcreds` (mode `600`) |

### Inodes

An **inode** is a filesystem record holding everything about a file *except its name* — permissions, owner, timestamps, size, block pointers. The name→inode mapping is the directory entry.

- Inode count is **fixed at `mkfs` time** (`mkfs.ext4 -N`). You cannot add inodes later; only resize the filesystem (which may add inodes) or recreate it.
- **Inode exhaustion** = `df -i` at 100% while `df -h` shows free space. New files fail with `No space left on device`, but **existing files still work**. `df -i` is the diagnostic the exam wants.
- **Hard links** point to the same inode, so they consume no new inode.
- **Deleting a file doesn't free space if a process still holds it open** — the inode lives until the last file descriptor closes. Classic "disk full after deleting a 40 GB log".
- `/dev` has **dynamic major/minor numbers** instead of inodes.

> [!tip] Exam trap: "disk full"
> `No space left on device` has **six** possible causes, not one:
> 1. Bytes exhausted (`df -h`)
> 2. **Inodes exhausted** (`df -i`)
> 3. A quota was hit (`quota -v`, `xfs_quota`)
> 4. The mount **didn't happen**, so data filled the root filesystem instead (`mount`/`findmnt`)
> 5. A deleted file is **still held open** (`lsof +L1`)
> 6. Filesystem metadata is read-only / needs fsck

---

## 4. 1.4 — Network services and configuration

### Configuration files

| File | Purpose | Exam note |
|------|---------|-----------|
| `/etc/hosts` | **Static** name↔IP mappings | Local overrides that beat DNS — a very common "why can't it resolve" answer |
| `/etc/resolv.conf` | **DNS servers** and search domains | Nameserver lines, `search`, `options ndots` |
| `/etc/nsswitch.conf` | **Resolution order**: `hosts: files dns mdns4_minimal [NOTFOUND=return]` | Which source wins. `files` before `dns` = `/etc/hosts` wins |
| `/etc/hostname` | Hostname | `hostnamectl set-hostname` on systemd |
| `/etc/sysctl.conf` | Kernel tunables | `net.ipv4.ip_forward=1` |
| `/etc/hosts.allow` / `hosts.deny` | TCP wrappers (legacy) | Mostly historical |

### Name resolution order (memorise)

```
1. /etc/nsswitch.conf   decides the order
2. /etc/hosts          static entries (if "files" comes first)
3. DNS  →  /etc/resolv.conf → nameservers
```
**`dig`/`nslookup` skip `/etc/hosts`** — they query DNS directly. `getent hosts example.com` goes through the **full** resolution stack. This is the classic diagnostic: if `dig` works but `ping` doesn't, the problem is `/etc/hosts` or `nsswitch.conf`, not DNS.

### NetworkManager

```bash
nmcli device status                 # devices
nmcli connection show               # saved profiles
nmcli connection up "Wired connection 1"
nmcli connection add type ethernet ifname eth0 con-name lan ipv4.method manual \
       ipv4.addresses 10.0.0.5/24 ipv4.gateway 10.0.0.1 ipv4.dns 1.1.1.1
nmcli device show eth0              # active config
nm-connection-editor                # GUI editor
```

| `nmcli` term | Meaning |
|--------------|---------|
| **Device** | The physical/virtual NIC (`eth0`) |
| **Connection** | A saved *profile* for a device |
| `con down "name"` then `con up "name"` | The way to apply a change |

### Netplan (Ubuntu/Debian, YAML)

```yaml
# /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses: [10.0.0.5/24]
      gateway4: 10.0.0.1   # (newer: routes: [{to: default, via: 10.0.0.1}])
      nameservers:
        addresses: [1.1.1.1, 8.8.8.8]
```

```bash
netplan try     # APPLY TEMPORARILY — reverts after 120s unless you confirm
netplan apply   # apply permanently
netplan status  # show what's actually live
```

> [!tip] `netplan try` vs `netplan apply`
> `try` is the safe one — it auto-reverts if you lose your connection, so it never locks you out over SSH. `apply` is permanent and can cut your session.

### Network tools (all on the objectives)

| Command | Answers |
|---------|---------|
| `ip -br addr` / `ip a` | What addresses does this interface have? |
| `ip link` | Link state up/down, MTU |
| `ip route` | Routing table, default gateway |
| `ip neigh` | ARP / neighbour table |
| `ss -tulpn` | Listening TCP/UDP sockets **and the process holding them** (`netstat` is deprecated) |
| `arp -n` | ARP cache |
| `ping` / `ping6` | ICMP reachability |
| `traceroute` / `tracepath` | Path and where it stops |
| `mtr -rw` | Combined traceroute + ping, continuous |
| `dig` / `nslookup` / `host` | DNS queries (`dig +short`, `@1.1.1.1`) |
| `curl` / `wget` | HTTP |
| `nc -zv host port` | Is a TCP port open? |
| `tcpdump -i eth0 -nn port 80` | Packet capture |
| `nmap` | Port/host scanning (**only on networks you own or are authorised to scan**) |
| `ethtool eth0` | Link speed, **duplex**, driver, autonegotiate |
| `iperf3` | Bandwidth/latency testing between two hosts |
| `hostname -f` | Fully-qualified hostname |

> [!tip] The diagnostic ladder for "server is unreachable"
> 1. `ip -br a` — is the interface up, does it have an address?
> 2. `ip r` — is there a default route?
> 3. `ping <own IP>` — does the host answer itself? (rules out DNS)
> 4. `ping <gateway>` — is it on the local segment?
> 5. `ping <remote>` / `traceroute`
> 6. `ss -tulpn | grep :PORT` — is anything **listening**?
> 7. `nc -zv host port` / `curl` — layer above
> 8. Firewall (`nft list ruleset`, `ufw status`, `firewall-cmd --list-all`)

### SSH

```bash
ssh user@host -p 22 -i ~/.ssh/id_ed25519
ssh -L 5432:db.internal:5432 user@bastion   # local port forward
ssh -R 8080:localhost:80 user@bastion       # remote port forward
ssh -D 1080 user@bastion                   # SOCKS5 dynamic proxy
```

**`~/.ssh/config`** turns a command into an alias and speeds up repeat logins:

```
Host db
  HostName db.internal
  User admin
  Port 2222
  IdentityFile ~/.ssh/id_ed25519
  ServerAliveInterval 60
```

Key points:
- Ed25519 keys are the modern default (`ssh-keygen -t ed25519`).
- `ssh-copy-id user@host` installs your public key → enables passwordless login.
- `ssh-agent` holds decrypted keys in memory so you don't retype a passphrase.
- **Never pass passwords on the command line** — they're visible in `ps`.

---

## 5. 1.5 — Shell operations

### Environment variables (on the objectives)

| Variable | Meaning |
|----------|---------|
| `HOME` | User's home directory |
| `USER` | Current username |
| `PATH` | **Colon-separated search path** for executables |
| `SHELL` | Login shell |
| `PS1` | Primary prompt |
| `DISPLAY` | Which X display the GUI apps connect to (`:0`) |
| `LANG` / `LC_ALL` / `LC_*` | Locale and character set |
| `TZ` | Timezone |
| `IFS` | Internal Field Separator (word splitting) |
| `HISTSIZE` / `HISTFILESIZE` | Shell history length |
| `LD_LIBRARY_PATH`, `LD_PRELOAD` | Dynamic linker overrides — a classic rootkit hiding place |

```bash
export PATH=$PATH:/opt/bin      # append to PATH
echo "$PATH" | tr ':' '\n'      # read it one entry per line
env                              # show the whole environment
printenv PATH
```

> [!tip] The `PATH` diagnostic (objective 5.2 lists "PATH misconfiguration issues")
> `command: not found` almost always means the binary isn't in `PATH`. Check in this order:
> `command -v <cmd>` (is it installed?) → `echo $PATH` (is the directory in it?) → `ls -l $(command -v <cmd>)` (does it exist and is it executable?) → is it a **broken symlink**? → is it a script with a **missing `#!` interpreter** or a CRLF line ending?
>
> Also remember: **`PATH` is per-user**. Root's PATH differs from yours, which is why a script that works manually fails under `sudo` or `cron` (both run with a minimal PATH). Use absolute paths in cron jobs.

### Paths

| Type | Notation |
|------|----------|
| Absolute | `/etc/passwd`, `~/docs`, `~user` (that user's home) |
| Relative | `.` (this dir), `..` (parent), `-` (`cd -` returns to the previous dir) |

### Shell startup files (the classic PBQ)

| File | Read when |
|------|-----------|
| `/etc/profile` | **All login shells**, system-wide |
| `/etc/profile.d/*.sh` | Login shells, system-wide, drop-in scripts |
| `/etc/bash.bashrc` | System-wide interactive non-login shells |
| **`~/.bash_profile`** | **Login shells** — user-level first read |
| **`~/.bashrc`** | **Interactive non-login shells** — where your aliases and PATH go |
| `~/.profile` | Login shells, POSIX-ish (Debian's historical choice) |

> [!tip] Why my alias doesn't work in my script
> `.bashrc` is read by **interactive** shells. A script run with `bash script.sh` is **non-interactive**, so it never sources `.bashrc`. That is exactly why aliases must not be used in scripts — use **functions** or separate scripts. Login shells (ssh, `su -`) read `.bash_profile` / `.profile`, **not** `.bashrc`.

### Redirection

| Syntax | Effect |
|--------|--------|
| `< file` | Read stdin from file |
| `> file` | Write stdout to file (**truncates**) |
| `>> file` | Append stdout to file |
| `2> file` | Redirect **stderr** |
| `2>&1` | Send stderr wherever **stdout currently points** |
| `&> file` / `&>> file` | Both streams (bash shorthand) |
| `\|` | Pipe stdout of one to stdin of the next |
| `<< EOF` | **Here-document** — multi-line stdin from the script body |
| `<<< "string"` | **Here-string** — stdin from a single string |
| `2>/dev/null` | Discard stderr |
| `cmd \| tee f` | Show **and** save |

> [!danger] Order matters
> `cmd > out.txt 2>&1` — correct: stdout to the file, then stderr to the same place.
> `cmd 2>&1 > out.txt` — **wrong**: stderr goes to the *original* stdout (the terminal) because `2>&1` is processed **before** stdout is redirected.
> `cat <<EOF > file` heredocs with `<<-EOF` strip **leading tabs**.

### Core shell utilities

| Tool | Use it for |
|------|-----------|
| `echo` / `printf` | Output. `printf` for anything in a script (`echo -e` is unreliable) |
| `cat` | Concatenate/view. `cat -n` line numbers |
| `less` / `more` | Page. `less` is better — `/` search, `q` quit, `G` to end, `+F` live-follow |
| `head` / `tail` | `-n N`, `tail -f` follow, `tail -n +5` from line 5 |
| `grep` | Search: `-i -n -r -v -c -l -E -w -A/-B/-C --include` |
| `sed` | Stream edit: `s/a/b/g`, `-i`, `-n 'Np'`, `-e` |
| `awk` | Fields & reports: `$1`, `-F:`, `/re/{...}`, `BEGIN{}`, `END{}`, `printf` |
| `sort` / `uniq` | `-n -h -r -u -k -t`. `sort \| uniq -c \| sort -rn` = frequency table |
| `cut` / `tr` | `-d -f -c`; `tr 'a-z' 'A-Z'`, `tr -d '\r'` |
| `wc` | `-l -w -c` |
| `xargs` | Build commands from stdin: `-0` for NUL-safe, `-I{}`, `-P N` parallel |
| `tee` | Write to file **and** stdout |
| `bc` | Arbitrary-precision calculator |
| `uname` | `-a` all, `-r` kernel release, `-m` machine/arch, `-s` kernel name |
| `source` (`.`) | Execute a file **in the current shell** (needed for env changes) |
| `history` | `!!` last, `!$` last arg, `Ctrl-R` search |
| `alias` / `unalias` | Interactive convenience only — never in scripts |

### Text editors

**`vi` / `vim` — modal. The exam will test the mode switch.**

| Keys | Action |
|------|--------|
| `Esc` (or `Ctrl-[`) | Back to **Normal** mode |
| `i` / `a` / `o` | **Insert** — before / after cursor / new line |
| `I` / `A` / `O` | Insert at line start / end / new line above |
| `:w` / `:q` / `:x` / `:wq` | Write / quit / save+quit |
| `:q!` | **Quit without saving** (discards changes) |
| `:wq!` | Save even if not modified / force |
| `dd` / `yy` / `p` | Delete line / yank line / paste |
| `u` / `Ctrl-R` | Undo / redo |
| `/` / `?` / `n` / `N` | Search down / up / next / previous |
| `:s/old/new/g` | Substitute in line; `%` for whole file |
| `ZZ` / `ZQ` | Save+quit / quit without saving |
| `:q` with unsaved changes | **Errors** — you must use `q!` |

**`nano`** — modeless, `^` for Ctrl:
| Keys | Action |
|------|--------|
| `^O` | Write Out (save) |
| `^X` | Exit |
| `^W` | Where Is (search) |
| `^K` | Cut line |
| `^U` | Paste |
| `^G` | Help |

---

## 6. 1.6 — Backup and restore

### Archiving vs compression

- **Archiving** combines many files into one, preserving structure and permissions. `tar`, `cpio`.
- **Compression** reduces size. `gzip`, `bzip2`, `xz`, `zstd`, `zip`, `7-Zip`.

### `tar` — the flags to know cold

| Flag | Meaning |
|------|---------|
| `c` | **c**reate |
| `x` | E**x**tract |
| `t` | Lis**t** contents |
| `v` | **v**erbose |
| `f` | **f**ilename follows |
| `z` | **z**ip/gzip (`.gz`) |
| `j` | bun**j**ip2 (`.bz2`) |
| `J` | **J**ust xz (`.xz`) |
| `C` | change to directory **C** before operating |
| `p` | Preserve permissions on extract |
| `--strip-components=N` | Remove N leading path components (strip the wrapper folder) |

```bash
tar -czvf backup.tar.gz /etc/ssh          # create gzip'd archive
tar -xzvf backup.tar.gz -C /restore       # extract into a directory
tar -tf backup.tar.gz                     # LIST FIRST — never extract an unknown archive
tar -xzf app.tgz --strip-components=1     # clean extraction without the wrapper dir
```

> [!tip] Compression trade-offs
> `gzip` — fast, good default. `bzip2` — slower, better. `xz` — **slowest, smallest** (use for archiving, not daily logs). `zstd` — modern, parallel (`zstd -T0`), best speed/ratio. Archive extensions: `.tar.gz`/`.tgz`, `.tar.bz2`/`.tbz2`, `.tar.xz`/`.txz`, `.zip`, `.7z`.

**Viewing compressed content without unpacking:** `zcat file.gz` · `zgrep pattern file.gz` · `zless file.gz` (also `zgrep` works on bz2/xz variants).

### `cpio` — the older archiver
Still the right tool for **initramfs contents** and for streaming from a `find`:
```bash
find . | cpio -o > backup.cpio
cpio -id < backup.cpio
```

### Data transfer and recovery

| Tool | Use |
|------|-----|
| **`dd`** | Raw byte-level copy/zero a device |
| **`ddrescue`** | **Rescue data from a failing drive** — retries, skips errors, keeps a logfile. The answer for "recover data from a dying disk" |
| `rsync` | Efficient incremental sync, works over SSH |
| `tar` | Archival backup |

```bash
# dd — image a disk to a file (note bs= and conv=)
dd if=/dev/sda of=disk.img bs=4M status=progress
# zero a disk
dd if=/dev/zero of=/dev/sdb bs=1M
# clone with integrity
ddrescue /dev/sda /dev/sdb /var/log/ddrescue.log
```

**`rsync` flags that matter**
| Flag | Effect |
|------|--------|
| `-a` | archive mode (`-rlptgoD`) — use this |
| `-v` | verbose |
| `-z` | compress in transit |
| `--delete` | **Remove destination files not in source** — dangerous, always dry-run first |
| `-n` / `--dry-run` | **Preview. Always use this first.** |
| `-e ssh` | remote shell |
| `--exclude` | skip patterns |

### What a real backup rotation looks like
Full (Sunday) + incremental (daily) + offsite + **restore-tested**. The exam's implicit point: **an untested backup is not a backup**.

---

## 7. 1.7 — Virtualization

### Hypervisor types

| Type | Runs on | Examples |
|------|---------|----------|
| **Type 1 (bare metal)** | Directly on hardware | KVM, VMware ESXi, Hyper-V, Xen |
| **Type 2 (hosted)** | On top of an existing OS | VirtualBox, VMware Workstation |

**KVM** (Kernel-based Virtual Machine) — Type 1, built into the Linux kernel, uses `/dev/kvm`, near-native performance.
**QEMU** (Quick EMulator) — a **userspace emulator**. By itself it's software emulation (slow); **paired with KVM it becomes hardware-accelerated** and is what libvirt/qemu usually means in practice.

### The management stack

```
virt-manager  (GUI)
      ↓
  libvirt     (daemon/API — the stable interface)
      ↓
  virsh       (CLI)
      ↓
  QEMU + KVM  (the actual virtualisation engine)
```

### `virsh` essentials

```bash
virsh list --all                 # all VMs
virsh start web01
virsh shutdown web01             # graceful ACPI shutdown — like a power button
virsh destroy web01              # hard power-off — like pulling the plug
virsh suspend web01              # pause
virsh resume web01
virsh define web01.xml           # register a VM from XML
virsh undefine web01
virsh domifaddr web01           # guest IP addresses
virsh snapshot-create web01 pre-upgrade --name snap1
virsh domblk-list web01
virsh migrate web01 host2        # live migration
```

### VM operations

| Operation | Notes |
|-----------|-------|
| **Baseline image / template** | A golden VM you clone from |
| **Cloning** | Full (independent) vs linked (share the base, CoW) |
| **Snapshot** | Point-in-time state; **tree snapshots** grow with each subsequent snapshot |
| **Migration** | Live (zero-downtime) vs cold (downtime). Storage must be **shared** for live |
| **Disk image ops** | **Convert** (qcow2 ↔ raw), **resize**, inspect image properties |
| **Resources** | Storage, RAM, vCPU, network |
| **Paravirtualized drivers** | `virtio-*` — guest-aware, much faster than full emulation |
| **Nested virtualization** | A VM running a hypervisor that runs VMs |

> [!tip] `shutdown` vs `destroy` (tested in scenarios)
> `virsh shutdown` = pressing the power button → **graceful ACPI**, apps get to close.
> `virsh destroy` = yanking the power cord → **immediate, like a crash**. Filesystem corruption risk.
> A question asking "shut down the VM correctly" wants `shutdown`. A question asking "the VM is hung and must stop immediately" wants `destroy` — and usually asks whether you should fsck afterwards.

### Network types (the most-tested table in 1.7)

| Type | Guest ↔ Host | Guest ↔ LAN | Guest ↔ Internet | Typical use |
|------|-------------|-------------|-----------------|-------------|
| **Bridged** | ✔ | ✔ **Directly on the LAN with its own IP** | ✔ | Server that needs a real LAN IP |
| **NAT** | ✔ | ✘ | ✔ (via host's IP) | Default for desktops, ports must be forwarded |
| **Host-only / isolated** | ✔ | ✘ | ✘ | Isolated lab VM ↔ host only |
| **Routed** | ✔ | ✔ via an explicit **router** | ✔ | Host acts as a gateway between VLANs |
| **Open** | — | — | — | No connectivity — testing only |

> [!danger] The distractor you will see
> "A server VM needs to be reachable from other machines on the LAN by its **own IP address**." → **Bridged**, not NAT. Under NAT it would only exist behind the host's address.
>
> "A VM needs to reach the internet but must not be visible on the LAN." → **NAT**.
> "A malware-analysis VM must reach nothing outside the host." → **Host-only**.

**Bare metal vs VM:** bare metal is physical hardware — no hypervisor overhead, direct hardware access, but no isolation and no easy snapshotting. VMs trade a small amount of performance for isolation, density, snapshots, and portability.

---

## Objective self-check

Can you answer these cold?

- [ ] List the 6 stages of the boot process and the initrd tool for both package families
- [ ] Why does `/bin` not exist as a real directory on modern Linux?
- [ ] `modprobe` vs `insmod` — when do you use each?
- [ ] Build an LVM stack from an empty disk, including persistent mounting
- [ ] **What two commands do you run to extend an LV by 5 GB, and why two?**
- [ ] RAID 5 with four 2 TB disks: usable size? How many failures survivable?
- [ ] What does `df -i` tell you that `df -h` cannot?
- [ ] `ro`, `nodev`, `nosuid`, `noexec`, `nofail`, `_netdev` — which one stops a filesystem being used to escalate privileges?
- [ ] `dig` works but `ping` doesn't resolve. Where do you look?
- [ ] `netplan try` vs `netplan apply` — which is safe over SSH?
- [ ] Which startup file does a **non-interactive** script read? (Answer: none — that's why aliases fail)
- [ ] `cmd > f 2>&1` vs `cmd 2>&1 > f` — which actually captures stderr?
- [ ] `:q` with unsaved changes in vim — what happens?
- [ ] Which VM network type gives a server its own LAN IP?
- [ ] `virsh shutdown` vs `virsh destroy` — which is the power button?

## Status

- [x] All objectives 1.1–1.7 covered
- [ ] Self-check passed cold
- [ ] Ran the LVM build and `extend` lab end to end
- [ ] Rebuilt a GRUB config and a custom initramfs by hand