---
title: "How to Secure a Linux VPS: First-Hour Checklist"
description: "Lock down a new Ubuntu or Debian VPS in under an hour: updates, a sudo user, SSH keys, no root or password logins, a firewall and fail2ban."
h1: "How to Secure a Linux VPS (Ubuntu & Debian)"
primary: "linux vps"
cluster: "Server operations"
cxPrompt: "harden this new VPS"
related: "linux-firewall-ufw, linux-security-updates, linux-server-security-hardening, ubuntu-server-setup"
updated: 2026-11-18
---

A new VPS is reachable from the whole internet the moment it boots, and automated scanners will start trying passwords on port 22 within minutes. Run these steps in order, the first time you log in.

```bash
sudo apt update && sudo apt full-upgrade -y
sudo adduser deploy && sudo usermod -aG sudo deploy
sudo apt install -y ufw fail2ban unattended-upgrades
```

<!-- cx -->

## 1. Update everything first

Provider images are often weeks old. Bring every package current before you change anything else, and reboot if the kernel was updated.

```bash
sudo apt update
sudo apt full-upgrade -y
[ -f /var/run/reboot-required ] && sudo reboot
```

## 2. Create a non-root user with sudo

Work as a normal user and use `sudo` when you need root. Replace `deploy` with the name you want.

```bash
adduser deploy
usermod -aG sudo deploy
```

Run those as root (on some providers you log in as root first). On images that log you in as a regular user (`ubuntu`, `debian`, `admin`), prefix them with `sudo`.

## 3. Switch to SSH keys

On **your own computer**, create a key if you don't have one and copy it to the server:

```bash
ssh-keygen -t ed25519 -C "you@example.com"
ssh-copy-id deploy@203.0.113.10
```

Open a **second** terminal and confirm `ssh deploy@203.0.113.10` works without a password before you continue. Keep your first session open until the end, so a mistake can't lock you out.

## 4. Turn off root login and passwords

OpenSSH uses the **first** value it reads for each setting, and files in `/etc/ssh/sshd_config.d/` are read in name order. Cloud images often ship `50-cloud-init.conf` with `PasswordAuthentication yes`, so put your settings in a file that sorts first:

```bash
sudo tee /etc/ssh/sshd_config.d/00-hardening.conf > /dev/null <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
EOF
sudo sshd -t && sudo systemctl restart ssh
sudo sshd -T | grep -Ei 'permitrootlogin|passwordauthentication'
```

`sshd -t` checks the configuration before the restart; the last line shows the values sshd is actually using. Both should read `no`.

## 5. Turn on the firewall

Allow SSH **before** enabling the firewall, then add only the ports you serve.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
sudo ufw status verbose
```

The full walkthrough, including rate limiting and removing rules, is in [Linux firewall with UFW](/how-to/linux-firewall-ufw).

## 6. Ban repeated failed logins

fail2ban watches login failures and blocks the source address. On Ubuntu and Debian the `sshd` jail is enabled as soon as the package is installed.

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

Debian 12 and newer don't install rsyslog, so there is no `/var/log/auth.log`. If the status command shows no log file being watched, tell the jail to read the systemd journal:

```bash
sudo tee /etc/fail2ban/jail.local > /dev/null <<'EOF'
[sshd]
backend = systemd
EOF
sudo systemctl restart fail2ban
```

## 7. Install security updates automatically

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

Choose **Yes**. By default only security updates install automatically. See [Linux security updates](/how-to/linux-security-updates) for reboots and checking what ran.

## Check your work

| Check | Command | What you want |
|---|---|---|
| Root login and passwords off | `sudo sshd -T \| grep -Ei 'permitrootlogin\|passwordauthentication'` | both `no` |
| Firewall on | `sudo ufw status` | `Status: active`, only your ports |
| fail2ban running | `sudo fail2ban-client status sshd` | a jail with a log source |
| Open ports | `sudo ss -tulpn` | only services you expect |
| Pending updates | `apt list --upgradable` | empty |

## Common errors

**"Permission denied (publickey)" after step 4.** The key isn't in `~/.ssh/authorized_keys` for that user, or the file's permissions are too open. Use your still-open session to run `chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`, or log in through your provider's web console.

**Passwords still work after step 4.** Another file set `PasswordAuthentication yes` first. Run `sudo grep -ri passwordauthentication /etc/ssh/sshd_config /etc/ssh/sshd_config.d/` and make sure your `00-` file sorts before it.

**Locked out after `ufw enable`.** SSH wasn't allowed. Use your provider's console, run `sudo ufw allow OpenSSH`, and reconnect.

## Frequently asked questions

### Should I change the SSH port?

It cuts log noise from scanners but isn't real protection. Keys with passwords off, plus fail2ban, matter far more. If you do change it, open the new port in the firewall first. Ubuntu 22.10 and newer start SSH through `ssh.socket`, so the port is also set there; follow Ubuntu's OpenSSH documentation for your release.

### Is a VPS secure out of the box?

Not fully. Most providers' images allow root or password logins and ship with the firewall off. The steps above close the common gaps.

### Do I need antivirus on a Linux server?

Usually not for the server itself, but it matters if the server stores files uploaded by users. See [Linux server security](/how-to/linux-server-security-hardening).
