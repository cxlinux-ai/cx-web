---
title: "Cron Jobs on Linux: Schedule Tasks with crontab"
description: "Schedule tasks on Linux with cron: crontab syntax, ready-to-copy examples, logging output, checking that jobs ran, and when to use a systemd timer instead."
h1: "How to Schedule Jobs on Linux with Cron"
primary: "cron on linux"
cluster: "Shell & automation"
cxPrompt: "run backup.sh every night at 2am"
related: "linux-backups, systemctl-manage-services, linux-logs-journalctl, linux-system-administration"
updated: 2026-11-18
---

Open your crontab, add one line per job, and save:

```bash
crontab -e
```

```text
0 2 * * * /home/deploy/backup.sh >> /home/deploy/backup.log 2>&1
```

That runs `backup.sh` every day at 2:00 a.m. and appends its output and errors to a log.

<!-- cx -->

## The five time fields

```text
┌──────── minute (0–59)
│ ┌────── hour (0–23)
│ │ ┌──── day of month (1–31)
│ │ │ ┌── month (1–12)
│ │ │ │ ┌ day of week (0–7, Sunday is 0 or 7)
│ │ │ │ │
* * * * *  command
```

`*` means every value, `*/15` means every 15th, `1-5` is a range and `1,15` is a list.

## Copy-ready schedules

| Schedule | Line |
|---|---|
| Every 5 minutes | `*/5 * * * * command` |
| Every hour, on the hour | `0 * * * * command` |
| Daily at 2:30 a.m. | `30 2 * * * command` |
| Weekdays at 9:00 | `0 9 * * 1-5 command` |
| Sundays at 3:00 | `0 3 * * 0 command` |
| First of the month at midnight | `0 0 1 * * command` |
| At every boot | `@reboot command` |

Times use the server's time zone. Check it with `timedatectl`.

## Manage crontabs

```bash
crontab -l
crontab -e
sudo crontab -e
sudo crontab -u deploy -l
```

`sudo crontab -e` edits root's crontab, for jobs that need root. `crontab -r` deletes your whole crontab without asking, so be careful.

## System-wide jobs in /etc/cron.d

Files in `/etc/cron.d/` have an extra **user** field before the command:

```text
30 2 * * * root /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
```

Scripts placed in `/etc/cron.daily/`, `/etc/cron.weekly/` or `/etc/cron.monthly/` run on those schedules. They must be executable, and their file names can't contain dots.

## Make jobs reliable

Cron runs commands with a minimal environment: a short `PATH`, no aliases, and your home directory as the working directory. Most "works in my terminal, fails in cron" problems come from that.

- Use full paths for commands and files: `/usr/bin/python3 /srv/app/job.py`.
- Set what the job needs at the top of the crontab: `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`.
- Redirect output to a log with `>> /path/file.log 2>&1`.
- Escape `%` as `\%` inside the command line: `date +\%F`.
- Stop overlapping runs: `flock -n /tmp/backup.lock /usr/local/bin/backup.sh`.

## Check that a job ran

```bash
sudo journalctl -u cron --since today
grep CRON /var/log/syslog | tail
```

The journal works on Ubuntu and Debian; `/var/log/syslog` exists only on Ubuntu. You'll see one `CMD` line each time cron starts a job. Whether the job succeeded is in your own log file.

## When to use a systemd timer instead

Timers can catch up on runs missed while the server was off (`Persistent=true`), log to the journal automatically and depend on other services. For a job that must not be skipped, a timer is the better tool:

```bash
systemctl list-timers
```

## Common errors

**The job never runs.** Check the line in `crontab -l`, then the journal for a `CMD` entry. A crontab whose last line has no newline at the end skips that line on some systems; leave an empty line at the end.

**It runs but fails.** Usually `PATH` or a relative path. Add logging, then compare with what works interactively.

**"Permission denied".** The script isn't executable (`chmod +x script.sh`) or needs root; use `sudo crontab -e`.

## Frequently asked questions

### How do I run a cron job every 30 seconds?

Cron's smallest unit is one minute. Use a systemd timer with `OnUnitActiveSec=30s`, or two cron lines where the second starts with `sleep 30;`.

### Where are crontab files stored?

User crontabs are in `/var/spool/cron/crontabs/`. Edit them only with `crontab -e`, which checks the syntax.

### How do I test a cron schedule?

Write the expression into an online cron explainer, or set a temporary `* * * * *` entry that writes to a log and watch it run.
