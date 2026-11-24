---
title: "How to Add an APT Repository on Ubuntu and Debian"
description: "Add, list and remove APT repositories and PPAs on Ubuntu and Debian the current, secure way, with signed-by keys instead of the deprecated apt-key."
h1: "How to Add (and Remove) an APT Repository"
primary: "linux ubuntu repository"
cluster: "Server operations"
cxPrompt: "add the official Docker repository"
related: "install-docker-linux, linux-security-updates, linux-commands-cheat-sheet"
updated: 2026-11-18
---

To add a third-party APT repository safely, save the vendor's signing key in `/etc/apt/keyrings/`, add a source line that names that key with `signed-by`, then run `apt update`:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://example.com/apt/key.asc | sudo tee /etc/apt/keyrings/example.asc > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/example.asc] https://example.com/apt stable main" | sudo tee /etc/apt/sources.list.d/example.list
sudo apt update
```

Replace the URLs, suite (`stable`) and component (`main`) with the values from the vendor's install instructions.

<!-- cx -->

## Why `signed-by` and not `apt-key`

`apt-key add` put a vendor's key in a keyring trusted for **every** repository on the system, so one compromised key could sign packages that look like they come from Ubuntu. `apt-key` is deprecated and removed in current releases. With `signed-by`, each key is trusted only for the repository that names it.

## A real example: Docker's repository

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

On Debian, replace both `linux/ubuntu` paths with `linux/debian`. The `$(. /etc/os-release …)` part fills in your release codename (for example `noble`) so the line matches your system.

## Add a PPA (Ubuntu only)

Personal Package Archives are Launchpad repositories for Ubuntu. `add-apt-repository` fetches the key and writes the source file for you:

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
```

PPAs are maintained by individuals and teams, not by Ubuntu. Add only ones you trust, because their packages install as root. PPAs are built for Ubuntu and are not meant for Debian.

## List the repositories you have

```bash
ls /etc/apt/sources.list.d/
apt-cache policy
```

Ubuntu 24.04 and newer store the main Ubuntu sources in `/etc/apt/sources.list.d/ubuntu.sources` (the multi-line deb822 format) instead of `/etc/apt/sources.list`. `apt-cache policy` shows every repository APT is using, whatever the file format.

To see which repository a package will come from:

```bash
apt-cache policy docker-ce
```

## Remove a repository

```bash
sudo rm /etc/apt/sources.list.d/example.list /etc/apt/keyrings/example.asc
sudo add-apt-repository --remove ppa:deadsnakes/ppa
sudo apt update
```

Removing a repository doesn't uninstall packages you installed from it. They stay at their current version until you remove or replace them.

## Preview before installing from a new repository

A new repository can offer newer versions of packages you already have. Simulate first; nothing changes on disk:

```bash
apt-get -s upgrade
apt-get -s install docker-ce
```

## Common errors

**"NO_PUBKEY" or "The following signatures couldn't be verified".** The key file is missing, unreadable or named differently from the `signed-by` path. Check both paths match and run `sudo chmod a+r` on the key.

**"Conflicting values set for option Signed-By".** The same repository is listed twice with different keys, often once in an old `.list` file and once in a `.sources` file. Remove the duplicate.

**"does not have a Release file".** The suite or codename is wrong for your release, or the vendor doesn't publish for it yet. Check `cat /etc/os-release` against the vendor's supported list.

**"add-apt-repository: command not found".** Install `software-properties-common`.

## Frequently asked questions

### Is it safe to add third-party repositories?

Only from vendors you trust. Packages run their install scripts as root, so a repository has the same access to your server as you do. Prefer official vendor repositories and pin versions on production servers.

### What is the difference between `.list` and `.sources` files?

`.list` files hold one-line `deb …` entries. `.sources` files use the newer multi-line deb822 format. APT reads both from `/etc/apt/sources.list.d/`.

### How do I add a repository on Debian?

Use the `signed-by` method at the top of this page. `add-apt-repository` and PPAs are designed for Ubuntu.
