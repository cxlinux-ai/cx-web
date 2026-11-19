---
title: "Linux Firewall with UFW: Setup, Rules and Fixes"
description: "Set up a Linux firewall with UFW on Ubuntu or Debian: allow SSH first, open only the ports you serve, rate-limit logins and remove rules safely."
h1: "How to Set Up a Firewall on Linux with UFW"
primary: "linux firewall"
cluster: "Server operations"
cxPrompt: "only allow ssh and https"
related: "secure-linux-vps, linux-server-security-hardening, install-docker-linux, ubuntu-server-setup"
updated: 2026-11-18
---

UFW (Uncomplicated Firewall) is the simplest way to manage the Linux firewall on Ubuntu and Debian. Allow SSH before you enable it, or you will lock yourself out:

```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw enable
```

<!-- cx -->

## Open the ports you serve

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 'Nginx Full'
```

`'Nginx Full'` is an application profile that opens 80 and 443 together. `sudo ufw app list` shows the profiles your installed packages provide.

Allow a port only from one address or network:

```bash
sudo ufw allow from 203.0.113.5 to any port 5432 proto tcp
sudo ufw allow from 10.0.0.0/24 to any port 22 proto tcp
```

## Rate-limit SSH

`limit` denies an address that opens six or more connections in 30 seconds, which slows password-guessing bots:

```bash
sudo ufw limit OpenSSH
```

## Check the rules

```bash
sudo ufw status verbose
sudo ufw status numbered
```

## Remove a rule

Delete by number (numbers change after each deletion, so list again before the next one) or by repeating the rule:

```bash
sudo ufw status numbered
sudo ufw delete 3
sudo ufw delete allow 80/tcp
```

## Turn it off, reset or log

```bash
sudo ufw disable
sudo ufw reset
sudo ufw logging on
```

`reset` deletes every rule and disables the firewall. Blocked connections are logged to the kernel log (`/var/log/ufw.log` on Ubuntu, `journalctl -k | grep UFW` everywhere).

## Docker bypasses UFW

Docker writes its own iptables rules, and ports you publish with `-p 8080:80` are reachable from outside **even if UFW denies them**. Either bind published ports to localhost (`-p 127.0.0.1:8080:80`) and put a reverse proxy in front, or filter in the `DOCKER-USER` chain. See [Install Docker on Linux](/how-to/install-docker-linux).

## UFW, iptables and nftables

UFW is a front end. On current Ubuntu and Debian it writes rules through the iptables commands, which are backed by nftables. Use one tool to manage the firewall; mixing hand-written nftables rules with UFW makes both hard to reason about.

## Common errors

**Locked out of SSH after enabling.** Use your provider's web console, run `sudo ufw allow OpenSSH` (or your custom SSH port with `sudo ufw allow 2222/tcp`), then reconnect.

**"ERROR: Could not find a profile matching 'OpenSSH'".** The SSH server isn't installed, or the profile has another name. Run `sudo ufw app list`, or allow the port directly: `sudo ufw allow 22/tcp`.

**A port is still reachable after `ufw deny`.** An earlier `allow` rule matches first, or the port is published by Docker. Check `sudo ufw status numbered` and `sudo docker ps`.

## Frequently asked questions

### Does Ubuntu have a firewall enabled by default?

UFW is installed on Ubuntu but inactive until you run `sudo ufw enable`. Debian doesn't install UFW at all.

### Should I also use my cloud provider's firewall?

Yes. A provider firewall blocks traffic before it reaches the server, and UFW protects the server if the provider rules are ever loosened. Use both.

### How do I allow a port range?

Give the range and protocol: `sudo ufw allow 60000:61000/udp`.
