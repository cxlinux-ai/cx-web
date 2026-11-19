---
title: "Linux Commands Cheat Sheet: The Commands You'll Use Daily"
description: "A practical Linux commands cheat sheet for Ubuntu and Debian: files, search, permissions, processes, packages, disk, network and services, with examples."
h1: "Linux Commands Cheat Sheet"
primary: "linux commands"
cluster: "Learning"
cxPrompt: "show me common commands for managing files"
related: "linux-processes, systemctl-manage-services, transfer-files-scp-rsync, linux-system-administration"
updated: 2026-11-18
---

The Linux commands you'll use most, grouped by task. Every command works on Ubuntu and Debian; most work on any Linux. Add `--help` to any of them, or run `man command`, for every option.

```bash
ls -la
cd /var/www
sudo apt install htop
```

<!-- cx -->

## Files and directories

| Task | Command |
|---|---|
| List files, including hidden | `ls -la` |
| Change directory | `cd /path` (`cd ..` up, `cd ~` home) |
| Show current directory | `pwd` |
| Create a directory | `mkdir -p a/b/c` |
| Copy a file / a folder | `cp file copy` / `cp -r dir dir2` |
| Move or rename | `mv old new` |
| Delete a file | `rm file` |
| Delete a folder | `rm -r dir` (no trash, no undo) |
| Delete an empty folder | `rmdir dir` |
| Create an empty file | `touch file` |
| Link | `ln -s /target linkname` |

## Read and search

| Task | Command |
|---|---|
| Print a file | `cat file` |
| Page through a file | `less file` (`/word` to search, `q` to quit) |
| First / last lines | `head -20 file` / `tail -20 file` |
| Follow a growing log | `tail -f /var/log/syslog` |
| Find text in files | `grep -rn "timeout" /etc/nginx/` |
| Find files by name | `find / -name "*.conf" 2>/dev/null` |
| Files changed in 7 days | `find /etc -mtime -7` |
| Count lines | `wc -l file` |

## Permissions and users

| Task | Command |
|---|---|
| Make a script executable | `chmod +x script.sh` |
| Owner-only read/write | `chmod 600 file` |
| Change owner | `sudo chown user:group file` |
| Run as root | `sudo command` |
| Who am I | `whoami`, `id` |
| Add a user | `sudo adduser name` |
| Add to a group | `sudo usermod -aG group name` |
| Change password | `passwd` |

## Packages (APT)

| Task | Command |
|---|---|
| Refresh package lists | `sudo apt update` |
| Upgrade everything | `sudo apt upgrade` |
| Install | `sudo apt install nginx` |
| Remove | `sudo apt remove nginx` (`purge` removes config too) |
| Search | `apt search keyword` |
| Is it installed? | `apt list --installed \| grep nginx` |
| Preview without changing anything | `apt-get -s install nginx` |

More on keeping systems patched: [Linux security updates](/how-to/linux-security-updates).

## Processes and services

| Task | Command |
|---|---|
| Top CPU users | `ps aux --sort=-%cpu \| head` |
| Live view | `top` or `htop` |
| Stop a process | `kill PID` (`kill -9 PID` to force) |
| Service status | `systemctl status nginx` |
| Restart a service | `sudo systemctl restart nginx` |
| Service logs | `journalctl -u nginx -f` |

Guides: [processes](/how-to/linux-processes), [systemctl](/how-to/systemctl-manage-services), [logs](/how-to/linux-logs-journalctl).

## Disk and memory

| Task | Command |
|---|---|
| Free disk space | `df -h` |
| Size of a folder | `du -sh /var/log` |
| Biggest folders | `du -h --max-depth=1 / 2>/dev/null \| sort -h` |
| Memory | `free -h` |
| Disks and partitions | `lsblk` |

## Network

| Task | Command |
|---|---|
| IP addresses | `ip -brief address` |
| Listening ports | `sudo ss -tulpn` |
| Test a connection | `ping -c 4 example.com` |
| Fetch a URL | `curl -I https://example.com` |
| Download a file | `wget URL` or `curl -O URL` |
| Log in to a server | `ssh user@host` |
| Copy to a server | `scp file user@host:/path/` |

## Archives

| Task | Command |
|---|---|
| Create `.tar.gz` | `tar -czf backup.tar.gz dir/` |
| Extract `.tar.gz` | `tar -xzf backup.tar.gz` |
| List contents | `tar -tzf backup.tar.gz` |
| Unzip | `unzip file.zip` (install with `sudo apt install unzip`) |

## System information

| Task | Command |
|---|---|
| OS version | `cat /etc/os-release` |
| Kernel | `uname -r` |
| Uptime and load | `uptime` |
| CPU cores | `nproc` |
| Hostname | `hostnamectl` |

## Shell shortcuts

| Keys / syntax | Does |
|---|---|
| `Tab` | Complete a command or path |
| `Ctrl+R` | Search command history |
| `Ctrl+C` | Stop the running command |
| `!!` | Repeat the last command (`sudo !!`) |
| `cmd > file` / `cmd >> file` | Write / append output to a file |
| `cmd1 \| cmd2` | Send output of one command to another |
| `cmd1 && cmd2` | Run the second only if the first succeeds |

## Frequently asked questions

### What are the most important Linux commands to learn first?

`ls`, `cd`, `pwd`, `cp`, `mv`, `rm`, `cat`, `less`, `grep`, `sudo`, `apt`, `systemctl` and `journalctl` cover most daily work on a server.

### How do I find out what a command does?

Run `man command` for the manual, `command --help` for a summary, or `tldr command` (after `sudo apt install tldr`) for short examples.

### Are these commands the same on every Linux?

The core commands are. Package management differs: Ubuntu and Debian use `apt`, Fedora and RHEL use `dnf`, Arch uses `pacman`.
