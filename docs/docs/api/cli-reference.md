# CLI Reference

Complete reference for all CX CLI commands and options.

## Global Commands

### cx

Main entry point for CX CLI.

```bash
cx [OPTIONS] COMMAND [ARGS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--version`, `-v` | Show version and exit |
| `--config PATH` | Path to config file |
| `--debug` | Enable debug mode |
| `--json` | Output as JSON |
| `--quiet`, `-q` | Suppress non-essential output |
| `--help` | Show help message |

### cx status

Display system status overview.

```bash
cx status [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--components` | Show component details |

**Example:**

```bash
$ cx status
╭─────────────────────────────────────────────────────────╮
│                    CX Linux Status                   │
├─────────────────────────────────────────────────────────┤
│ Version:     2024.1.0                                   │
│ Kernel:      6.5.0-cx                               │
│ Uptime:      5 days, 3:21:45                            │
│ Components:  CLI ✓  Ops ✓  Security ✓  LLM ✓           │
╰─────────────────────────────────────────────────────────╯
```

### cx config

Configuration management commands.

```bash
cx config COMMAND [OPTIONS]
```

**Subcommands:**

| Command | Description |
|---------|-------------|
| `show` | Display current configuration |
| `set KEY VALUE` | Set a configuration value |
| `get KEY` | Get a configuration value |
| `validate` | Validate configuration file |
| `edit` | Open config in editor |

**Examples:**

```bash
# Show all config
cx config show

# Set value
cx config set connectors.default anthropic

# Get value
cx config get connectors.default

# Validate config
cx config validate
```

---

## CX Ops Commands

### cx-ops doctor

Run system health diagnostics.

```bash
cx-ops doctor [OPTIONS]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--fix`, `-f` | Auto-fix detected issues | `false` |
| `--check`, `-c` | Run specific check | all |
| `--category` | Filter by category | all |
| `--verbose`, `-V` | Verbose output | `false` |
| `--json`, `-j` | JSON output | `false` |
| `--timeout` | Check timeout (seconds) | 30 |

**Categories:**

- `system` - System-level checks
- `disk` - Disk and storage checks
- `memory` - Memory and swap checks
- `network` - Network connectivity checks
- `security` - Security-related checks
- `services` - Systemd service checks
- `packages` - Package manager checks
- `performance` - Performance checks

**Examples:**

```bash
# Run all checks
cx-ops doctor

# Run with auto-fix
cx-ops doctor --fix

# Run specific check
cx-ops doctor --check disk_space

# Filter by category
cx-ops doctor --category network

# JSON output for scripting
cx-ops doctor --json | jq '.summary'
```

**Exit Codes:**

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | One or more checks failed |
| 2 | Error during execution |

### cx-ops doctor list

List all available health checks.

```bash
cx-ops doctor list [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--category` | Filter by category |
| `--json` | JSON output |

### cx-ops repair apt

Repair APT package manager issues.

```bash
cx-ops repair apt [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dry-run`, `-n` | Show what would be done |
| `--locks` | Only clear lock files |
| `--force` | Force repair without confirmation |

**Example:**

```bash
# Diagnose and repair
cx-ops repair apt

# Clear locks only
cx-ops repair apt --locks

# Preview changes
cx-ops repair apt --dry-run
```

### cx-ops repair permissions

Fix file permission issues.

```bash
cx-ops repair permissions [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dry-run`, `-n` | Show what would be done |
| `--cx` | Only fix Cortex directories |
| `--user`, `-u` | Fix user home directory |

### cx-ops repair services

Fix systemd service issues.

```bash
cx-ops repair services [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dry-run`, `-n` | Show what would be done |
| `--restart-failed` | Only restart failed services |
| `--service`, `-s` | Fix specific service |

### cx-ops update check

Check for available updates.

```bash
cx-ops update check [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--force`, `-f` | Bypass cache |
| `--json` | JSON output |

### cx-ops update apply

Apply available updates.

```bash
cx-ops update apply [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--system`, `-s` | Apply system update |
| `--packages`, `-p` | Apply package updates |
| `--security` | Security updates only |
| `--yes`, `-y` | Skip confirmation |

### cx-ops update rollback

Rollback to previous snapshot.

```bash
cx-ops update rollback [SNAPSHOT_ID] [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--list`, `-l` | List available snapshots |
| `--force` | Force rollback |

### cx-ops plugins list

List plugins.

```bash
cx-ops plugins list [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--available`, `-a` | Show available plugins |
| `--json` | JSON output |

### cx-ops plugins install

Install a plugin.

```bash
cx-ops plugins install NAME|PATH [OPTIONS]
```

### cx-ops plugins create

Create a new plugin scaffold.

```bash
cx-ops plugins create NAME [OPTIONS]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--type`, `-t` | Plugin type | command |
| `--output`, `-o` | Output directory | current |

### cx-ops plugins enable/disable

Enable or disable a plugin.

```bash
cx-ops plugins enable NAME
cx-ops plugins disable NAME
```

### cx-ops connectors list

List LLM connectors.

```bash
cx-ops connectors list [OPTIONS]
```

### cx-ops connectors test

Test LLM connector.

```bash
cx-ops connectors test [NAME] [OPTIONS]
```

### cx-ops connectors set-default

Set default LLM connector.

```bash
cx-ops connectors set-default NAME
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CX_DEBUG` | Enable debug mode | `false` |
| `CX_LOG_LEVEL` | Log level | `INFO` |
| `CX_CONFIG_DIR` | Config directory | `/etc/cx` |
| `CX_DATA_DIR` | Data directory | `/var/lib/cx` |
| `CX_CACHE_DIR` | Cache directory | `/var/cache/cx` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `GOOGLE_API_KEY` | Google AI API key | - |

---

## Output Formats

### Human-Readable (Default)

```bash
$ cx-ops doctor
[PASS] Disk Space - Disk usage at 23.4%
[PASS] Memory Usage - Memory usage at 34.2%
[WARN] Security Updates - 3 security update(s) available
```

### JSON

```bash
$ cx-ops doctor --json
{
  "summary": {
    "total": 12,
    "passed": 11,
    "failed": 0,
    "warned": 1,
    "success": true
  },
  "results": [
    {
      "check_id": "disk_space",
      "name": "Disk Space",
      "status": "pass",
      "message": "Disk usage at 23.4%",
      "details": {
        "percent_used": 23.4,
        "free_gb": 76.6
      }
    }
  ]
}
```

---

## Shell Completion

### Bash

```bash
# Add to ~/.bashrc
eval "$(_CX_OPS_COMPLETE=bash_source cx-ops)"
```

### Zsh

```bash
# Add to ~/.zshrc
eval "$(_CX_OPS_COMPLETE=zsh_source cx-ops)"
```

### Fish

```bash
# Add to ~/.config/fish/completions/cx-ops.fish
eval (env _CX_OPS_COMPLETE=fish_source cx-ops)
```
