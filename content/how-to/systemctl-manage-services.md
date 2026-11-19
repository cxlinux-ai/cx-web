---
title: "systemctl: Start, Stop, Restart and Enable Linux Services"
description: "Manage Linux services with systemctl: start, stop, restart, reload, enable at boot, list running and failed services, and write your own service file."
h1: "How to Manage Services on Linux with systemctl"
primary: "show service linux"
cluster: "Server operations"
cxPrompt: "restart nginx and show me if it came back"
related: "linux-logs-journalctl, linux-processes, cron-jobs-linux, linux-system-administration"
updated: 2026-11-18
---

`systemctl` controls services on Ubuntu, Debian and every other systemd-based Linux. The commands you'll use most:

```bash
sudo systemctl restart nginx
systemctl status nginx --no-pager
sudo systemctl enable --now nginx
```

`restart` stops and starts it now, `status` shows whether it came back, and `enable --now` starts it and makes it start at every boot.

<!-- cx -->

## The everyday commands

| Command | What it does |
|---|---|
| `systemctl status nginx` | State, main PID, memory and the last log lines |
| `sudo systemctl start nginx` | Start now |
| `sudo systemctl stop nginx` | Stop now |
| `sudo systemctl restart nginx` | Stop, then start |
| `sudo systemctl reload nginx` | Re-read config without dropping connections (if the service supports it) |
| `sudo systemctl enable nginx` | Start automatically at boot |
| `sudo systemctl disable nginx` | Don't start at boot |
| `sudo systemctl enable --now nginx` | Enable and start in one step |
| `systemctl is-active nginx` | Prints `active` or `inactive` (good for scripts) |
| `systemctl is-enabled nginx` | Prints `enabled` or `disabled` |

Check a config file before you restart, so a typo doesn't take the service down: `sudo nginx -t`, `sudo sshd -t`, `sudo apachectl configtest`.

## List services

```bash
systemctl list-units --type=service --state=running
systemctl list-units --type=service --all
systemctl list-unit-files --type=service --state=enabled
systemctl --failed
```

## When a service won't start

```bash
systemctl status myapp --no-pager -l
sudo journalctl -u myapp -n 50 --no-pager
```

The status output gives the exit code; the journal gives the reason. More in [Linux logs](/how-to/linux-logs-journalctl).

After you fix it, clear the failed state so it stops showing in `systemctl --failed`:

```bash
sudo systemctl reset-failed myapp
```

## Stop a service from ever starting

`disable` only removes it from boot; another service can still start it. `mask` blocks it completely:

```bash
sudo systemctl mask cups
```

To undo it later:

```bash
sudo systemctl unmask cups
```

## Create a service for your own app

Save this as `/etc/systemd/system/myapp.service`:

```ini
[Unit]
Description=My app
After=network-online.target
Wants=network-online.target

[Service]
User=deploy
WorkingDirectory=/srv/myapp
ExecStart=/srv/myapp/bin/server --port 8080
Restart=on-failure
RestartSec=5
EnvironmentFile=-/srv/myapp/.env

[Install]
WantedBy=multi-user.target
```

Then load and start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now myapp
systemctl status myapp --no-pager
```

Run `daemon-reload` every time you edit a unit file. `Restart=on-failure` brings the app back if it crashes.

## Change a packaged service safely

Don't edit files in `/lib/systemd/system/`, because updates overwrite them. Create an override instead:

```bash
sudo systemctl edit nginx
```

Add only the lines you're changing (for example `[Service]` and `LimitNOFILE=65535`), save, then `sudo systemctl restart nginx`. `systemctl cat nginx` shows the merged result.

## Common errors

**"Unit nginx.service not found".** The package isn't installed, or the name is different (`apache2`, not `httpd`, on Ubuntu). Use `systemctl list-unit-files | grep -i name`.

**"Warning: The unit file changed on disk".** Run `sudo systemctl daemon-reload`.

**"start request repeated too quickly".** The service crashed several times in a row and systemd stopped retrying. Read `journalctl -u name`, fix the cause, then `sudo systemctl reset-failed name` and start it again.

## Frequently asked questions

### What is the difference between restart and reload?

`restart` stops the process and starts a new one, dropping open connections. `reload` asks the running process to re-read its configuration, if the service supports it.

### Is `service nginx restart` still OK?

Yes. On systemd systems the `service` command forwards to `systemctl`. New scripts should call `systemctl` directly.

### How do I see why a service is slow to start at boot?

`systemd-analyze blame` lists units by start time, and `systemd-analyze critical-chain` shows what the boot waited on.
