---
title: "Linux Server Security: Hardening, Antivirus and Audits"
description: "Harden a Linux server beyond the basics: audit it with Lynis, scan uploads with ClamAV, check AppArmor, close unused ports and remove what you don't need."
h1: "Linux Server Security Hardening (Ubuntu & Debian)"
primary: "linux security"
cluster: "Server operations"
cxPrompt: "audit this server's security settings"
related: "secure-linux-vps, linux-firewall-ufw, linux-security-updates, linux-logs-journalctl"
updated: 2026-11-18
---

Start with an audit so you fix real gaps instead of guessing. Lynis checks hundreds of settings and lists concrete suggestions:

```bash
sudo apt install -y lynis
sudo lynis audit system
```

Read the **Warnings** and **Suggestions** at the end of the report, then work through the sections below. If you haven't done the first-hour basics (SSH keys, firewall, automatic updates), start with [How to secure a Linux VPS](/how-to/secure-linux-vps).

<!-- cx -->

## 1. Close ports you don't use

Every listening service is attack surface. List them:

```bash
sudo ss -tulpn
```

For each service you don't need, stop and disable it:

```bash
sudo systemctl disable --now cups
```

Services that only your server uses, such as a database, should listen on `127.0.0.1`, not `0.0.0.0`.

## 2. Remove packages you don't need

```bash
apt list --installed | wc -l
sudo apt purge telnet rsh-client
sudo apt autoremove --purge
```

## 3. Check AppArmor

Ubuntu and Debian ship AppArmor, which confines programs to the files and actions in their profile:

```bash
sudo aa-status
```

Profiles in **enforce** mode block violations; **complain** mode only logs them. Don't disable AppArmor to fix a permission error. Check the denial in `sudo journalctl -k | grep -i apparmor` and adjust the profile instead.

## 4. Antivirus: when it matters

Linux malware exists, but on a server the usual reason to scan is **files other people upload** (mail attachments, shared folders, user uploads) that Windows or macOS users will open later. ClamAV is the standard open-source scanner:

```bash
sudo apt install -y clamav clamav-daemon
sudo systemctl status clamav-freshclam --no-pager
ls /var/lib/clamav/
```

Right after installation, `clamav-freshclam` downloads the signature databases, which takes a few minutes. Scan once `/var/lib/clamav/` lists `main`, `daily` and `bytecode` files (`.cvd` or `.cld`). If a scan reports "No supported database files found", the download hasn't finished; wait and try again.

```bash
sudo clamscan -r -i /srv/uploads
```

`clamav-freshclam` keeps the signatures updated from then on. `-i` prints only infected files. Schedule the scan with cron (see [Cron jobs](/how-to/cron-jobs-linux)).

## 5. Watch logins

```bash
last -n 20
sudo lastb -n 20
sudo journalctl -u ssh --since today | grep -E 'Accepted|Failed'
```

`last` lists successful logins and `lastb` failed ones. On Ubuntu, failed SSH attempts also appear in `/var/log/auth.log`.

## 6. Check for unexpected admin accounts and keys

```bash
getent group sudo
awk -F: '$3 == 0 {print $1}' /etc/passwd
sudo find /home /root -name authorized_keys -exec ls -l {} \;
```

Only `root` should have UID 0. Review every key in each `authorized_keys` file.

## 7. Protect files with secrets

```bash
sudo find /etc /srv /var/www -name "*.env" -perm /o+r
sudo chmod 600 /srv/app/.env
```

The first command finds `.env` files anyone on the system can read.

## Hardening checklist

| Area | Check | Command |
|---|---|---|
| SSH | Keys only, no root | `sudo sshd -T \| grep -Ei 'permitroot\|passwordauth'` |
| Firewall | Only needed ports | `sudo ufw status` |
| Updates | Security updates automatic | `apt-config dump APT::Periodic::Unattended-Upgrade` (want `"1"`) and `systemctl list-timers 'apt-daily*'` |
| Services | Nothing unexpected listening | `sudo ss -tulpn` |
| AppArmor | Profiles enforcing | `sudo aa-status` |
| Accounts | One UID 0 | `awk -F: '$3==0' /etc/passwd` |
| Audit | Lynis hardening index | `sudo lynis audit system` |

## Common errors

**`clamscan` uses a lot of memory and CPU.** It loads all signatures on each run. For frequent scans, use the daemon: `sudo clamdscan --fdpass -m -i /srv/uploads`. The daemon runs as the `clamav` user; `--fdpass` lets it scan files that only root can read, so you never need to make private uploads readable by everyone.

**Lynis warnings you can't act on.** Some checks don't apply to every server. Note them in `/etc/lynis/custom.prf` with `skip-test=TEST-ID` so the report stays readable.

## Frequently asked questions

### Do Linux servers need antivirus?

Not to protect Linux itself in most cases. Scan where the server stores or forwards files that other systems will open.

### What is a good Lynis hardening index?

There is no pass mark. Track the number over time, and treat every warning as a task to fix or consciously accept.

### Is SELinux better than AppArmor?

Both are mandatory access control systems. Ubuntu and Debian are built around AppArmor; Red Hat-family systems use SELinux. Use the one your distribution supports.
