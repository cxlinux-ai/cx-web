---
title: "Ubuntu Server Setup: The Baseline Every Server Needs"
description: "Set up a fresh Ubuntu or Debian server step by step: hostname, time, users, SSH keys, swap, firewall, updates and the checks that confirm it all works."
h1: "How to Set Up an Ubuntu or Debian Server"
primary: "linux ubuntu server"
cluster: "Server operations"
cxPrompt: "set up a fresh Ubuntu server for a web app"
related: "secure-linux-vps, linux-firewall-ufw, systemctl-manage-services, linux-system-administration"
updated: 2026-11-18
---

A fresh Ubuntu or Debian server needs the same baseline every time: current packages, a correct name and clock, a sudo user with SSH keys, swap, a firewall and automatic security updates. These are the commands, in order.

```bash
sudo apt update && sudo apt full-upgrade -y
sudo hostnamectl set-hostname web-01
sudo timedatectl set-timezone UTC
```

<!-- cx -->

## Pick a release

Use a long-term support release for servers: Ubuntu LTS (24.04 or newer) or Debian stable. Both get security updates for years without forcing feature upgrades. Check what you're on with:

```bash
cat /etc/os-release
uname -r
```

## 1. Update packages

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt autoremove -y
```

`full-upgrade` can add or remove packages when dependencies change; plain `upgrade` never removes anything. On a new server, `full-upgrade` is what you want.

## 2. Set the hostname

```bash
sudo hostnamectl set-hostname web-01
hostnamectl
```

Add the name to `/etc/hosts` on the `127.0.1.1` line so `sudo` doesn't warn that it can't resolve the host.

## 3. Set the time zone and check the clock

Servers are easier to reason about in UTC. Ubuntu and Debian keep the clock correct with `systemd-timesyncd`.

```bash
sudo timedatectl set-timezone UTC
timedatectl
```

Look for `System clock synchronized: yes`.

## 4. Create your admin user and add SSH keys

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

From your own computer, copy your key with `ssh-copy-id deploy@your-server`, confirm you can log in with it, then turn off password and root logins. The exact, safe sequence is in [How to secure a Linux VPS](/how-to/secure-linux-vps).

## 5. Add swap

Small servers without swap get processes killed when memory runs out. Check first, then add a 2 GB swap file if there is none:

```bash
swapon --show
free -h
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 6. Turn on the firewall

```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw enable
```

Open web ports only when a web server is running: `sudo ufw allow 80,443/tcp`. Details in [Linux firewall with UFW](/how-to/linux-firewall-ufw).

## 7. Automatic security updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 8. Install what the server is for

Install only what you need. Common starting points:

| Role | Packages |
|---|---|
| Web server | `nginx` or `apache2` |
| Database | `postgresql` or `mariadb-server` |
| Containers | Docker Engine (see [Install Docker on Linux](/how-to/install-docker-linux)) |
| Basics | `curl git htop unzip` |

```bash
sudo apt install -y nginx curl git htop unzip
systemctl status nginx --no-pager
```

## Verify the baseline

```bash
hostnamectl
timedatectl | grep synchronized
swapon --show
sudo ufw status
sudo ss -tulpn
systemctl --failed
```

Every command should show what you set: the new hostname, a synchronized clock, swap in use, the firewall active, only expected ports listening and no failed services.

## Common errors

**"sudo: unable to resolve host web-01".** The new hostname isn't in `/etc/hosts`. Add `127.0.1.1 web-01` to it.

**`fallocate` fails with "Operation not supported".** Some filesystems don't support it. Use `sudo dd if=/dev/zero of=/swapfile bs=1M count=2048` instead, then continue with `chmod`.

**`ufw: command not found` on Debian.** Debian doesn't install it by default. Run `sudo apt install ufw`.

## Frequently asked questions

### Ubuntu Server or Debian for a server?

Both use `apt` and the same commands on this page. Ubuntu LTS has a fixed five-year support window and more cloud images; Debian changes less between releases. Pick the one your team already runs.

### Do I need a GUI on Ubuntu Server?

No. Servers are managed over SSH. A desktop adds packages to patch and memory to spend without adding anything a server needs.

### How much swap should a server have?

For most servers, 1 to 2 GB is enough to absorb short memory spikes. If a server relies on swap continuously, it needs more RAM.
