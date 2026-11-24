---
title: "How to Back Up a Linux Server (and Restore It)"
description: "Back up a Linux server the reliable way: what to include, tar and rsync basics, encrypted offsite backups with restic, database dumps and restore tests."
h1: "How to Back Up a Linux Server"
primary: "back up linux"
cluster: "Server operations"
cxPrompt: "back up /etc and /var/www every night"
related: "cron-jobs-linux, transfer-files-scp-rsync, linux-security-updates, linux-system-administration"
updated: 2026-11-18
---

A quick, one-off backup of the directories that matter is a single `tar` command:

```bash
sudo tar -czf /root/backup-$(date +%F).tar.gz /etc /home /var/www
```

A real backup also leaves the server, runs on a schedule and gets test-restored. The rest of this page sets that up.

<!-- cx -->

## What to back up

| Back up | Why |
|---|---|
| `/etc` | System and service configuration |
| `/home`, `/root` | User files, SSH keys, scripts |
| `/var/www`, `/srv`, `/opt` | Websites and applications |
| Database **dumps** | Copying live database files can produce a corrupt backup |
| A list of installed packages | Rebuilds the server quickly |

```bash
dpkg --get-selections > ~/packages.txt
```

You don't need `/proc`, `/sys`, `/dev`, `/run`, `/tmp` or `/var/cache`.

## Dump databases first

Write each dump to a temporary file and rename it only when the whole pipeline succeeded, so a failed dump never replaces a good one. The commands run in a root shell because `/var/backups` is writable only by root:

```bash
sudo bash -c 'set -o pipefail; f=/var/backups/postgres-$(date +%F).sql.gz; sudo -u postgres pg_dumpall | gzip > "$f.tmp" && mv "$f.tmp" "$f"'
sudo bash -c 'set -o pipefail; f=/var/backups/mysql-$(date +%F).sql.gz; mysqldump --all-databases --single-transaction | gzip > "$f.tmp" && mv "$f.tmp" "$f"'
```

If either command exits with an error, the previous dump is untouched; read the error before the next run. Then include `/var/backups` in the file backup.

## Copy offsite with rsync

`rsync` sends only what changed. Run a dry run (`-n`) first and read the lines that start with `deleting`:

```bash
sudo rsync -aHAXn --delete /etc /home /var/www /var/backups backup@backup.example.com:/backups/web-01/
```

When the list is what you expect, run the same command without `-n`:

```bash
sudo rsync -aHAX --delete /etc /home /var/www /var/backups backup@backup.example.com:/backups/web-01/
```

This keeps one up-to-date copy, not history. If a file is deleted or encrypted by ransomware, the next run copies that too. For history, use restic.

## Versioned, encrypted backups with restic

restic encrypts, deduplicates and keeps snapshots you can restore from any point.

Create the repository password first. restic reads it from the file but never creates the file:

```bash
sudo sh -c 'umask 077; openssl rand -base64 32 > /root/.restic-password'
sudo cat /root/.restic-password
```

Copy the password into your password manager now. Without it, the backup can't be decrypted by anyone, including you.

```bash
sudo apt install -y restic
export RESTIC_REPOSITORY=sftp:backup@backup.example.com:/backups/web-01
export RESTIC_PASSWORD_FILE=/root/.restic-password
sudo -E restic init
sudo -E restic backup /etc /home /var/www /var/backups
sudo -E restic snapshots
```

restic also writes to S3-compatible storage and Backblaze B2.

Keep a sensible history and delete the rest:

```bash
sudo -E restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune
```

## Schedule it

Put the commands in a script, for example `/usr/local/bin/backup.sh`, make it executable, and run it nightly from root's crontab (`sudo crontab -e`):

```text
30 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
```

See [Cron jobs on Linux](/how-to/cron-jobs-linux) for the format and for checking that it ran.

## Test a restore

A backup that has never been restored is a guess. Restore to a temporary directory and compare:

```bash
sudo -E restic restore latest --target /tmp/restore-test
sudo diff -r /etc /tmp/restore-test/etc | head
sudo tar -tzf /root/backup-2026-11-18.tar.gz | head
```

## The 3-2-1 rule

Keep **3** copies of your data, on **2** different kinds of storage, with **1** copy offsite. A snapshot from your VPS provider is useful but counts as one copy at the same company.

## Common errors

**"Permission denied" in the tar or rsync output.** Some files are readable only by root. Run the backup as root or with `sudo`.

**"tar: Removing leading '/' from member names".** This is a notice, not an error. Archives store relative paths so they restore safely.

**restic: "wrong password or no key found".** The password doesn't match the repository. Check `RESTIC_PASSWORD_FILE` points at the right file.

## Frequently asked questions

### How often should I back up a server?

At least daily for anything that changes, and before every upgrade or deployment. Databases with constant writes may need more frequent dumps or replication.

### Are provider snapshots enough?

They are a good extra copy and a fast rollback, but they live in the same account and company as the server. Keep at least one copy elsewhere.

### What's the difference between rsync and restic?

rsync mirrors files as they are now. restic keeps encrypted, deduplicated versions so you can restore yesterday's or last month's files.
