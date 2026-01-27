# CLI Reference

Complete reference for all Cortex CLI commands and options.

## Global Commands

### cortex

Main entry point for Cortex CLI.

```bash
cortex [OPTIONS] COMMAND [ARGS]
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

### cortex status

Display system status overview.

```bash
cortex status [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--components` | Show component details |

**Example:**

```bash
$ cortex status
╭─────────────────────────────────────────────────────────╮
│                    Cortex Linux Status                   │
├─────────────────────────────────────────────────────────┤
│ Version:     2024.1.0                                   │
│ Kernel:      6.5.0-cortex                               │
│ Uptime:      5 days, 3:21:45                            │
│ Components:  CLI ✓  Ops ✓  Security ✓  LLM ✓           │
╰─────────────────────────────────────────────────────────╯
```

### cortex config

Configuration management commands.

```bash
cortex config COMMAND [OPTIONS]
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
cortex config show

# Set value
cortex config set connectors.default anthropic

# Get value
cortex config get connectors.default

# Validate config
cortex config validate
```

---

## Cortex Ops Commands

### cortex-ops doctor

Run system health diagnostics.

```bash
cortex-ops doctor [OPTIONS]
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
cortex-ops doctor

# Run with auto-fix
cortex-ops doctor --fix

# Run specific check
cortex-ops doctor --check disk_space

# Filter by category
cortex-ops doctor --category network

# JSON output for scripting
cortex-ops doctor --json | jq '.summary'
```

**Exit Codes:**

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | One or more checks failed |
| 2 | Error during execution |

### cortex-ops doctor list

List all available health checks.

```bash
cortex-ops doctor list [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--category` | Filter by category |
| `--json` | JSON output |

### cortex-ops repair apt

Repair APT package manager issues.

```bash
cortex-ops repair apt [OPTIONS]
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
cortex-ops repair apt

# Clear locks only
cortex-ops repair apt --locks

# Preview changes
cortex-ops repair apt --dry-run
```

### cortex-ops repair permissions

Fix file permission issues.

```bash
cortex-ops repair permissions [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dry-run`, `-n` | Show what would be done |
| `--cortex` | Only fix Cortex directories |
| `--user`, `-u` | Fix user home directory |

### cortex-ops repair services

Fix systemd service issues.

```bash
cortex-ops repair services [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dry-run`, `-n` | Show what would be done |
| `--restart-failed` | Only restart failed services |
| `--service`, `-s` | Fix specific service |

### cortex-ops update check

Check for available updates.

```bash
cortex-ops update check [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--force`, `-f` | Bypass cache |
| `--json` | JSON output |

### cortex-ops update apply

Apply available updates.

```bash
cortex-ops update apply [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--system`, `-s` | Apply system update |
| `--packages`, `-p` | Apply package updates |
| `--security` | Security updates only |
| `--yes`, `-y` | Skip confirmation |

### cortex-ops update rollback

Rollback to previous snapshot.

```bash
cortex-ops update rollback [SNAPSHOT_ID] [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--list`, `-l` | List available snapshots |
| `--force` | Force rollback |

### cortex-ops plugins list

List plugins.

```bash
cortex-ops plugins list [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--available`, `-a` | Show available plugins |
| `--json` | JSON output |

### cortex-ops plugins install

Install a plugin.

```bash
cortex-ops plugins install NAME|PATH [OPTIONS]
```

### cortex-ops plugins create

Create a new plugin scaffold.

```bash
cortex-ops plugins create NAME [OPTIONS]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--type`, `-t` | Plugin type | command |
| `--output`, `-o` | Output directory | current |

### cortex-ops plugins enable/disable

Enable or disable a plugin.

```bash
cortex-ops plugins enable NAME
cortex-ops plugins disable NAME
```

### cortex-ops connectors list

List LLM connectors.

```bash
cortex-ops connectors list [OPTIONS]
```

### cortex-ops connectors test

Test LLM connector.

```bash
cortex-ops connectors test [NAME] [OPTIONS]
```

### cortex-ops connectors set-default

Set default LLM connector.

```bash
cortex-ops connectors set-default NAME
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORTEX_DEBUG` | Enable debug mode | `false` |
| `CORTEX_LOG_LEVEL` | Log level | `INFO` |
| `CORTEX_CONFIG_DIR` | Config directory | `/etc/cortex` |
| `CORTEX_DATA_DIR` | Data directory | `/var/lib/cortex` |
| `CORTEX_CACHE_DIR` | Cache directory | `/var/cache/cortex` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `GOOGLE_API_KEY` | Google AI API key | - |

---

## Output Formats

### Human-Readable (Default)

```bash
$ cortex-ops doctor
[PASS] Disk Space - Disk usage at 23.4%
[PASS] Memory Usage - Memory usage at 34.2%
[WARN] Security Updates - 3 security update(s) available
```

### JSON

```bash
$ cortex-ops doctor --json
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
eval "$(_CORTEX_OPS_COMPLETE=bash_source cortex-ops)"
```

### Zsh

```bash
# Add to ~/.zshrc
eval "$(_CORTEX_OPS_COMPLETE=zsh_source cortex-ops)"
```

### Fish

```bash
# Add to ~/.config/fish/completions/cortex-ops.fish
eval (env _CORTEX_OPS_COMPLETE=fish_source cortex-ops)
```
