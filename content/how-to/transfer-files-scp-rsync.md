---
title: "Transfer Files on Linux with scp and rsync (Examples)"
description: "Copy files between Linux servers and your computer with scp and rsync: single files, folders, custom SSH ports, resumable transfers and safe syncing."
h1: "How to Transfer Files Between Linux Servers (scp and rsync)"
primary: "scp for linux"
cluster: "Networking"
cxPrompt: "copy the database dump to the backup server"
related: "linux-backups, secure-linux-vps, cron-jobs-linux, linux-commands-cheat-sheet"
updated: 2026-11-18
---

Copy a file to a server with `scp`, or a whole folder with `rsync`:

```bash
scp report.pdf deploy@203.0.113.10:/home/deploy/
rsync -avz ./site/ deploy@203.0.113.10:/var/www/site/
```

Both use SSH, so they use the same login and keys as `ssh deploy@203.0.113.10`.

<!-- cx -->

## scp examples

| Task | Command |
|---|---|
| Upload a file | `scp file.txt user@host:/path/` |
| Download a file | `scp user@host:/path/file.txt .` |
| Copy a folder | `scp -r ./folder user@host:/path/` |
| Custom SSH port | `scp -P 2222 file.txt user@host:/path/` |
| Use a specific key | `scp -i ~/.ssh/id_ed25519 file.txt user@host:/path/` |
| Server to server | `scp user@a:/data/file user@b:/data/` |

Note the capital `-P` for the port with scp (ssh uses lowercase `-p`). Since OpenSSH 9.0, `scp` uses the SFTP protocol underneath.

## rsync: better for folders and repeat copies

rsync copies only what changed, can resume, and preserves permissions and timestamps.

```bash
rsync -avz --progress ./site/ user@host:/var/www/site/
rsync -avz user@host:/var/log/nginx/ ./nginx-logs/
rsync -avz -e "ssh -p 2222" ./site/ user@host:/var/www/site/
```

| Flag | Meaning |
|---|---|
| `-a` | Archive: recurse and keep permissions, times, links |
| `-v` | List files as they copy |
| `-z` | Compress during transfer |
| `--progress` | Show progress per file |
| `-P` | `--progress` plus keep partial files to resume |
| `-n` | Dry run: show what would happen |
| `--delete` | Remove files on the destination that aren't in the source |
| `--exclude` | Skip matching files, e.g. `--exclude 'node_modules/'` |

## The trailing slash matters

| Command | Result |
|---|---|
| `rsync -a site/ host:/var/www/site/` | Copies the **contents** of `site` into `/var/www/site/` |
| `rsync -a site host:/var/www/site/` | Creates `/var/www/site/site/` |

## Sync safely with --delete

`--delete` makes the destination an exact copy, which includes deleting files there. Always run a dry run (`-n`) first:

```bash
rsync -avn --delete ./site/ user@host:/var/www/site/
```

Check both paths and every line that starts with `deleting`. Only when that list is right, run the real sync:

```bash
rsync -av --delete ./site/ user@host:/var/www/site/
```

## Large or unreliable transfers

```bash
rsync -avP bigfile.iso user@host:/data/
```

If the connection drops, run the same command again and rsync continues where it stopped. For very long transfers, run it inside `tmux` or `screen` so closing your terminal doesn't stop it.

## Interactive transfers with sftp

```bash
sftp user@host
sftp> put local.txt
sftp> get remote.txt
sftp> ls
sftp> exit
```

## Common errors

**"Permission denied (publickey)".** The same login fails with plain `ssh`. Fix SSH access first (`ssh -v user@host` shows which key it tries).

**"rsync: command not found" on the remote side.** rsync must be installed on both machines: `sudo apt install rsync`.

**"Permission denied" writing the destination.** Your user can't write there. Copy to your home directory and move it with `sudo`, or use `--rsync-path="sudo rsync"` if the user has passwordless sudo.

**Copied into a nested folder by mistake.** That's the trailing slash. Add `/` to the end of the source path.

## Frequently asked questions

### Is scp deprecated?

The old SCP protocol is, but the `scp` command remains and now uses SFTP underneath by default. It's fine for one-off copies; rsync is better for anything repeated.

### Which is faster, scp or rsync?

For a first copy they're similar. rsync is much faster for repeat copies because it sends only changes.

### How do I copy files to a server without a password?

Set up SSH keys with `ssh-copy-id user@host`. Both scp and rsync then use the key.
