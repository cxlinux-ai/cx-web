---
title: "How to List, Find and Kill Processes in Linux"
description: "List Linux processes, find what is using CPU, memory or a port, and stop it safely with kill, pkill and killall, from a polite signal up to kill -9."
h1: "How to List and Kill Processes in Linux"
primary: "linux list processes"
cluster: "System info & monitoring"
cxPrompt: "what is using the CPU right now"
related: "systemctl-manage-services, linux-logs-journalctl, linux-system-administration, linux-commands-cheat-sheet"
updated: 2026-11-18
---

List the processes using the most CPU, then stop one by its process ID (PID):

```bash
ps aux --sort=-%cpu | head
kill 12345
```

`kill` sends SIGTERM, which asks the program to shut down cleanly. Use `kill -9` only if it doesn't exit.

<!-- cx -->

## See what's running

| You want | Command |
|---|---|
| Everything | `ps aux` |
| Top CPU users | `ps aux --sort=-%cpu \| head` |
| Top memory users | `ps aux --sort=-%mem \| head` |
| A process by name | `pgrep -a nginx` |
| A process tree | `ps auxf` or `pstree -p` |
| Live view | `top` (press `P` for CPU, `M` for memory, `q` to quit) |

`htop` is a friendlier live view with mouse support: `sudo apt install htop`.

## Find what's using a port

```bash
sudo ss -ltnp 'sport = :3000'
sudo lsof -iTCP:3000 -sTCP:LISTEN
```

Both print the PID of the process listening on port 3000.

## Stop a process

| Command | Effect |
|---|---|
| `kill 12345` | Ask PID 12345 to exit (SIGTERM) |
| `kill -9 12345` | Force it to stop immediately (SIGKILL); it can't clean up |
| `pkill nginx` | Signal every process named `nginx` |
| `pkill -f "python app.py"` | Match the full command line |
| `killall node` | Signal every process with that exact name |
| `sudo fuser -k -TERM 3000/tcp` | Ask whatever is using TCP port 3000 to exit |
| `sudo fuser -k 3000/tcp` | Force it (fuser sends SIGKILL by default); only if the line above didn't work |

Try the polite signal first and give the process a few seconds. Programs use SIGTERM to finish writes and remove lock files, and SIGKILL skips all of that.

Check what `pkill` would match before you run it:

```bash
pgrep -af "python app.py"
```

## Services: use systemctl, not kill

If the process belongs to a systemd service, `kill` won't stick: systemd may restart it. Stop it through systemd:

```bash
systemctl status 12345
sudo systemctl stop nginx
```

`systemctl status <PID>` tells you which service a process belongs to. See [systemctl](/how-to/systemctl-manage-services).

## Lower a process's priority instead

To keep a heavy job running without starving everything else:

```bash
nice -n 10 ./backup.sh
sudo renice -n 10 -p 12345
```

Higher numbers mean lower priority (from -20 to 19).

## Processes that won't die

**Zombie (`Z` in the STAT column).** It has already exited; its parent hasn't collected the exit status. It uses no CPU or memory. Restarting or stopping the parent clears it: `ps -o ppid= -p 12345` shows the parent.

**Uninterruptible sleep (`D`).** It's waiting on the kernel, usually disk or network storage, and even `kill -9` waits until the I/O returns. Check storage with `sudo dmesg -T | tail`.

## Common errors

**"Operation not permitted".** The process belongs to another user or root. Use `sudo kill 12345`.

**"No such process".** It already exited, or the PID is wrong. List again with `pgrep -a name`.

**The process comes back after you kill it.** A service manager (systemd, Docker, pm2, supervisor) restarted it. Stop it through that tool.

## Frequently asked questions

### What is the difference between kill and kill -9?

`kill` sends SIGTERM, which the program can handle by shutting down cleanly. `kill -9` sends SIGKILL, which the kernel enforces immediately with no cleanup.

### How do I kill all processes of a user?

`sudo pkill -u username`. Check the list first with `pgrep -u username -a`.

### How do I see how long a process has been running?

`ps -o pid,etime,cmd -p 12345` shows the elapsed time since it started.
