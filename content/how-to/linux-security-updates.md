---
title: "Linux Security Updates and Patching on Ubuntu & Debian"
description: "Patch Ubuntu and Debian servers safely: preview updates, install security patches, automate them with unattended-upgrades and handle reboots."
h1: "How to Install Security Updates on Linux (Ubuntu & Debian)"
primary: "patch management linux"
cluster: "Server operations"
cxPrompt: "apply security patches, show me first"
related: "secure-linux-vps, add-apt-repository, linux-system-administration, systemctl-manage-services"
updated: 2026-11-18
---

Refresh the package lists, preview what would change, then upgrade:

```bash
sudo apt update
apt list --upgradable
sudo apt upgrade
```

Check whether a reboot is needed afterwards with `[ -f /var/run/reboot-required ] && cat /var/run/reboot-required`.

<!-- cx -->

## Preview before you patch

`apt-get -s` simulates an upgrade and prints every package it would install, upgrade or remove, without changing the system. Run it before patching production:

```bash
apt-get -s upgrade
apt-get -s dist-upgrade
```

## `upgrade` vs `full-upgrade`

| Command | Installs new dependencies | Removes packages | Use it for |
|---|---|---|---|
| `apt upgrade` | Yes | No | Routine patching |
| `apt full-upgrade` | Yes | Yes, when needed | Kernel and dependency changes |
| `apt-get upgrade` | No (holds those packages back) | No | Most conservative option |

Packages shown as "kept back" need a new dependency. `sudo apt full-upgrade` or `sudo apt install <package>` installs them.

## Automate security updates

`unattended-upgrades` installs security updates every day. Install and enable it:

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

The defaults install only security updates. To check what it would do and what it did:

```bash
sudo unattended-upgrade --dry-run --debug
less /var/log/unattended-upgrades/unattended-upgrades.log
```

To reboot automatically when an update needs it, at a time of your choosing, set these in `/etc/apt/apt.conf.d/50unattended-upgrades`:

```text
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:30";
```

## Reboots and service restarts

Kernel and core library updates need a reboot. Other updates need the affected services restarted.

```bash
cat /var/run/reboot-required.pkgs
sudo needrestart
```

`needrestart` (installed by default on Ubuntu Server) lists services still running old library code and can restart them. On Debian, install it with `sudo apt install needrestart`.

On Ubuntu, Livepatch applies critical kernel fixes without a reboot. It is part of Ubuntu Pro, which is free for personal use on up to five machines: `sudo pro attach` then `sudo pro enable livepatch`.

## See which updates are security fixes

```bash
apt list --upgradable 2>/dev/null | grep -i security
pro security-status
```

`pro security-status` (Ubuntu) summarizes how many installed packages get security coverage and from which archive.

## Hold a package at its current version

When an update would break something, hold that one package while you test:

```bash
sudo apt-mark hold nginx
apt-mark showhold
sudo apt-mark unhold nginx
```

## Common errors

**"Could not get lock /var/lib/dpkg/lock-frontend".** Another apt process, usually unattended-upgrades, is running. Wait for it to finish; `ps aux | grep -i apt` shows it. Don't delete the lock file.

**"The following packages have been kept back".** They need new dependencies. Use `sudo apt full-upgrade` after reviewing the list.

**"dpkg was interrupted".** A previous upgrade stopped partway. Run `sudo dpkg --configure -a`, then `sudo apt -f install`.

## Frequently asked questions

### How often should I patch Linux servers?

Let security updates install daily with unattended-upgrades, and review the remaining updates on a fixed weekly or monthly schedule, with reboots in a maintenance window.

### Do I have to reboot after every update?

No. Only when `/var/run/reboot-required` exists, which is usually after kernel, glibc or systemd updates.

### Can updates break my server?

Occasionally. Simulate first with `apt-get -s upgrade`, hold packages your application pins, keep backups (see [Linux backups](/how-to/linux-backups)) and patch a staging server before production.
