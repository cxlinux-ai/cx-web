---
title: "Linux System Administration: Daily, Weekly, Monthly Checks"
description: "A practical Linux system administration checklist for Ubuntu and Debian servers, with the exact commands for health, disk, updates, security and backups."
h1: "Linux System Administration: The Checklist"
primary: "linux administration system"
cluster: "Server operations"
cxPrompt: "what should I check on this server every week"
related: "linux-logs-journalctl, linux-security-updates, linux-backups, linux-commands-cheat-sheet"
updated: 2026-11-18
---

Most Linux system administration is the same short list of checks, run on a schedule. The quick health check:

```bash
uptime
df -h
free -h
systemctl --failed
sudo journalctl -p err -b --no-pager | tail -20
```

That covers load, disk, memory, failed services and recent errors. The rest of this page is the full routine and what to do when a check fails.

<!-- cx -->

## Daily

| Check | Command | Act when |
|---|---|---|
| Load | `uptime` | Load average stays above the CPU count (`nproc`) |
| Disk space | `df -h` | Any filesystem is above 85% |
| Inodes | `df -i` | Above 85% (many small files) |
| Memory | `free -h` | `available` is near zero or swap keeps growing |
| Failed services | `systemctl --failed` | Anything is listed |
| Errors | `sudo journalctl -p err --since yesterday` | New or repeating errors |
| Backups | your backup log | The last run failed or is missing |

When disk is full, find what grew:

```bash
sudo du -xh / --max-depth=1 2>/dev/null | sort -h | tail
sudo du -xh /var --max-depth=2 2>/dev/null | sort -h | tail
```

Logs, Docker images and old kernels are the usual causes. See [Linux logs](/how-to/linux-logs-journalctl) and [Install Docker](/how-to/install-docker-linux).

## Weekly

```bash
apt list --upgradable
[ -f /var/run/reboot-required ] && echo "reboot needed"
last -n 20
sudo lastb -n 20
sudo ss -tulpn
```

Review pending updates (see [security updates](/how-to/linux-security-updates)), who logged in, failed login attempts and what's listening on the network.

## Monthly

- Restore one file from backup and check it (see [Linux backups](/how-to/linux-backups)).
- Review user accounts and SSH keys: `getent passwd | awk -F: '$3 >= 1000'` and every `authorized_keys` file.
- Check TLS certificate expiry: `sudo certbot certificates` if you use Let's Encrypt.
- Run a security audit: `sudo lynis audit system` (see [server hardening](/how-to/linux-server-security-hardening)).
- Remove what's unused: `sudo apt autoremove --purge`.

## Know your server

Information to have before something breaks:

```bash
hostnamectl
cat /etc/os-release
nproc && free -h
lsblk
ip -brief address
systemctl list-units --type=service --state=running
```

## Automate the checks

Run the daily checks from cron and get the output by email or in a log you read (see [Cron jobs](/how-to/cron-jobs-linux)), or install a monitoring agent such as Netdata or Prometheus node_exporter when you manage more than a handful of servers.

## Core skills, by page

| Task | Guide |
|---|---|
| Start, stop and debug services | [systemctl](/how-to/systemctl-manage-services) |
| Find and stop runaway processes | [Linux processes](/how-to/linux-processes) |
| Schedule jobs | [Cron jobs](/how-to/cron-jobs-linux) |
| Move files between servers | [scp and rsync](/how-to/transfer-files-scp-rsync) |
| Firewall | [UFW](/how-to/linux-firewall-ufw) |
| New server baseline | [Server setup](/how-to/ubuntu-server-setup) |
| Everyday commands | [Linux commands cheat sheet](/how-to/linux-commands-cheat-sheet) |

## Frequently asked questions

### What does a Linux system administrator do day to day?

Keeps servers patched, monitored, backed up and secure; manages users and access; troubleshoots services; and automates the repetitive parts.

### Which Linux should I learn system administration on?

Ubuntu Server LTS or Debian. They run a large share of cloud servers, and everything on these pages works on both.

### How do I know a server is healthy?

Load below the CPU count, disk and inodes below about 85%, memory available, no failed units, no new errors in the journal and a recent backup that restores.
