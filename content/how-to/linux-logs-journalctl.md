---
title: "Linux Logs: How to Read journalctl, syslog and dmesg"
description: "Find out why a Linux service failed: read logs with journalctl, filter by service, time and priority, follow live, check dmesg and manage log disk use."
h1: "How to Read Logs on Linux (journalctl, syslog, dmesg)"
primary: "linux logs"
cluster: "Server operations"
cxPrompt: "why did nginx fail last night"
related: "systemctl-manage-services, linux-system-administration, linux-processes, linux-server-security-hardening"
updated: 2026-11-18
---

On Ubuntu and Debian, systemd's journal holds the logs of every service. To see why one failed, read its recent entries:

```bash
sudo journalctl -u nginx --since "1 hour ago" --no-pager
systemctl status nginx --no-pager
```

`systemctl status` shows the last few lines and the exit code; `journalctl -u` shows everything for that unit.

<!-- cx -->

## Filter the journal

| You want | Command |
|---|---|
| One service | `journalctl -u nginx` |
| Follow live (like `tail -f`) | `journalctl -u nginx -f` |
| Since a time | `journalctl --since "2026-11-18 02:00" --until "03:00"` |
| Since yesterday | `journalctl --since yesterday` |
| Errors and worse | `journalctl -p err` |
| This boot only | `journalctl -b` |
| The previous boot | `journalctl -b -1` |
| Kernel messages | `journalctl -k` |
| Newest first, last 50 | `journalctl -r -n 50` |

Combine them: `sudo journalctl -u ssh -p warning --since today`.

## Why did the server reboot or crash?

```bash
journalctl --list-boots
sudo journalctl -b -1 -p err --no-pager
sudo journalctl -b -1 -n 100 --no-pager
```

The last lines of the previous boot show what happened just before it went down. A clean shutdown ends with systemd stopping services; a crash or power loss just stops.

## Kernel messages: dmesg

`dmesg` shows the kernel ring buffer: hardware errors, disk problems, the out-of-memory killer. Ubuntu restricts it to root.

```bash
sudo dmesg -T | tail -50
sudo dmesg -T | grep -iE 'error|fail|oom'
```

`-T` prints readable timestamps. "Out of memory: Killed process" lines explain processes that vanished.

## syslog and auth.log

Ubuntu also writes classic text logs through rsyslog. Debian 12 and newer don't install rsyslog, so use `journalctl` there.

| File (Ubuntu) | Contains |
|---|---|
| `/var/log/syslog` | Most system messages |
| `/var/log/auth.log` | Logins, `sudo`, SSH |
| `/var/log/kern.log` | Kernel messages |
| `/var/log/nginx/error.log` | Nginx errors (most apps keep their own logs) |

```bash
sudo tail -f /var/log/syslog
sudo grep "Failed password" /var/log/auth.log | tail
```

## Control how much disk logs use

```bash
journalctl --disk-usage
sudo journalctl --vacuum-time=2weeks
sudo journalctl --vacuum-size=500M
```

To set a permanent limit, set `SystemMaxUse=500M` in `/etc/systemd/journald.conf` and run `sudo systemctl restart systemd-journald`. Text logs in `/var/log` are rotated by `logrotate`, configured in `/etc/logrotate.d/`.

## Common errors

**"No journal files were found" or `-b -1` shows nothing.** The journal is stored only in memory, so it's lost at reboot. Make it persistent: `sudo mkdir -p /var/log/journal && sudo systemctl restart systemd-journald`.

**"Hint: You are currently not seeing messages from other users and the system."** Run `journalctl` with `sudo`, or add your user to the `adm` or `systemd-journal` group.

**`dmesg: read kernel buffer failed: Operation not permitted`.** Use `sudo dmesg`.

## Frequently asked questions

### Where are Linux logs stored?

The systemd journal is in `/var/log/journal/` (binary; read it with `journalctl`). Text logs from rsyslog and applications are in `/var/log/`.

### How do I search logs for a word?

Pipe the journal through grep, or use `journalctl -g`: `sudo journalctl -u nginx -g "upstream timed out"`.

### How long are logs kept?

Until the journal hits its size limit (by default up to 10% of the filesystem, capped at 4 GB) or a vacuum removes them. Text logs follow their logrotate rules, often four weekly files.
