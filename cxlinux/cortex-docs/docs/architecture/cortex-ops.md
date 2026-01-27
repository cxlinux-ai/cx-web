# Cortex Ops

Cortex Ops provides system diagnostics, repair tools, update management, and extensibility through plugins.

## Overview

```mermaid
graph LR
    subgraph Cortex Ops
        A[Doctor]
        B[Repair]
        C[Updates]
        D[Plugins]
    end

    A --> A1[Health Checks]
    A --> A2[Auto-Fix]
    A --> A3[Reports]

    B --> B1[APT Repair]
    B --> B2[Permissions]
    B --> B3[Services]

    C --> C1[Check]
    C --> C2[Install]
    C --> C3[Rollback]

    D --> D1[Load]
    D --> D2[Registry]
    D --> D3[Hooks]
```

## Doctor Module

### Health Checks

The doctor module includes 12+ built-in health checks:

| Check ID | Category | Description |
|----------|----------|-------------|
| `disk_space` | Disk | Root partition usage |
| `memory` | Memory | RAM utilization |
| `cpu_load` | Performance | CPU load average |
| `apt_status` | Packages | APT health |
| `systemd_failed` | Services | Failed units |
| `network_connectivity` | Network | Internet access |
| `dns_resolution` | Network | DNS lookup |
| `time_sync` | System | NTP status |
| `swap_usage` | Memory | Swap utilization |
| `security_updates` | Security | Pending updates |
| `zombie_processes` | Performance | Dead processes |
| `file_descriptors` | System | FD usage |

### Running Checks

```bash
# Run all checks
cortex-ops doctor

# Run with auto-fix
cortex-ops doctor --fix

# Run specific check
cortex-ops doctor --check disk_space

# Filter by category
cortex-ops doctor --category network

# JSON output
cortex-ops doctor --json

# Verbose mode
cortex-ops doctor --verbose
```

### Check Result Structure

```python
@dataclass
class CheckResult:
    check_id: str      # Unique identifier
    name: str          # Display name
    status: CheckStatus  # PASS, WARN, FAIL, SKIP, ERROR
    message: str       # Human-readable message
    details: dict      # Additional data
    fix_id: str | None # Associated fix action
    duration_ms: float # Execution time
```

### Creating Custom Checks

```python
from cortex_ops.doctor import Check, CheckCategory, CheckSeverity, CheckResult, CheckStatus

def check_custom_service() -> CheckResult:
    """Check if custom service is running."""
    result = run_command(["systemctl", "is-active", "my-service"])

    if result.success:
        return CheckResult(
            check_id="custom_service",
            name="Custom Service",
            status=CheckStatus.PASS,
            message="Service is running",
        )
    else:
        return CheckResult(
            check_id="custom_service",
            name="Custom Service",
            status=CheckStatus.FAIL,
            message="Service is not running",
            fix_id="restart_custom_service",
        )

# Register check
custom_check = Check(
    id="custom_service",
    name="Custom Service",
    description="Verify custom service is running",
    category=CheckCategory.SERVICES,
    severity=CheckSeverity.HIGH,
    check_fn=check_custom_service,
    fix_id="restart_custom_service",
)
```

## Repair Module

### APT Repair

```bash
# Diagnose APT issues
cortex-ops repair apt --dry-run

# Fix all APT issues
cortex-ops repair apt

# Clear locks only
cortex-ops repair apt --locks
```

Handles:

- Lock file conflicts
- Interrupted dpkg operations
- Broken package dependencies
- Corrupted package lists
- Cache issues

### Permissions Repair

```bash
# Check permissions
cortex-ops repair permissions --dry-run

# Fix Cortex directories only
cortex-ops repair permissions --cortex

# Fix user home directory
cortex-ops repair permissions --user developer
```

Fixes:

- Wrong file ownership
- Incorrect directory modes
- World-writable files in sensitive locations

### Services Repair

```bash
# Fix all service issues
cortex-ops repair services

# Restart failed services only
cortex-ops repair services --restart-failed

# Fix specific service
cortex-ops repair services --service nginx
```

## Update Module

### Architecture

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant Checker
    participant Installer
    participant Rollback

    User->>CLI: cortex-ops update check
    CLI->>Checker: Check for updates
    Checker-->>CLI: Update info

    User->>CLI: cortex-ops update apply
    CLI->>Rollback: Create snapshot
    Rollback-->>CLI: Snapshot ID
    CLI->>Installer: Install update
    Installer-->>CLI: Result

    alt Update Failed
        User->>CLI: cortex-ops update rollback
        CLI->>Rollback: Restore snapshot
    end
```

### Check for Updates

```bash
# Check all updates
cortex-ops update check

# Force check (bypass cache)
cortex-ops update check --force
```

Output:

```
╭─────────────────────────────────────────────╮
│              System Update                   │
├─────────────────────────────────────────────┤
│ Cortex 2024.2.0 available                   │
│ Released: 2024-01-15                        │
│ Security: Yes                               │
│ Reboot required: No                         │
╰─────────────────────────────────────────────╯

5 package update(s) available
2 security update(s)
```

### Apply Updates

```bash
# Apply system update
cortex-ops update apply --system

# Apply package updates
cortex-ops update apply --packages

# Security updates only
cortex-ops update apply --packages --security

# Skip confirmation
cortex-ops update apply --packages -y
```

### Rollback

```bash
# List available snapshots
cortex-ops update rollback --list

# Rollback to latest snapshot
cortex-ops update rollback

# Rollback to specific snapshot
cortex-ops update rollback 20240115-120000
```

Snapshot data:

| Data | Backed Up |
|------|-----------|
| `/etc/cortex/` | Configuration |
| `/var/lib/cortex/` | Application data |
| Package list | For restoration |

## Plugin System

### Plugin Architecture

```mermaid
graph TB
    subgraph Plugin System
        A[Loader] --> B[Registry]
        B --> C[Hook System]
    end

    subgraph Plugin Types
        D[Command Plugin]
        E[Check Plugin]
        F[Connector Plugin]
    end

    A --> D
    A --> E
    A --> F
```

### Creating a Plugin

1. Create plugin directory:

```bash
cortex-ops plugins create my-plugin --type command
```

2. Edit the generated files:

```python
# /etc/cortex/plugins/my-plugin/__init__.py
from cortex_ops.plugins import CommandPlugin, PluginInfo, PluginType

class MyPlugin(CommandPlugin):
    @property
    def info(self) -> PluginInfo:
        return PluginInfo(
            name="my-plugin",
            version="1.0.0",
            description="My custom plugin",
            author="Your Name",
            plugin_type=PluginType.COMMAND,
        )

    def activate(self) -> None:
        """Called when plugin loads."""
        print("Plugin activated!")

    def deactivate(self) -> None:
        """Called when plugin unloads."""
        print("Plugin deactivated!")

    def get_commands(self):
        return [self.my_command]

    def my_command(self, name: str = "World"):
        """My custom command."""
        print(f"Hello, {name}!")
```

3. Create plugin.yaml:

```yaml
# /etc/cortex/plugins/my-plugin/plugin.yaml
name: my-plugin
version: 1.0.0
description: My custom plugin
author: Your Name
plugin_type: command
main: __init__.py
cortex_version: ">=0.1.0"
```

### Plugin Management

```bash
# List installed plugins
cortex-ops plugins list

# List available plugins
cortex-ops plugins list --available

# Enable plugin
cortex-ops plugins enable my-plugin

# Disable plugin
cortex-ops plugins disable my-plugin
```

### Hook System

Plugins can hook into Cortex events:

```python
from cortex_ops.plugins.hooks import hooks, HookPriority

@hooks.on("post_check", priority=HookPriority.HIGH)
def log_check_result(result):
    """Called after each health check."""
    if result.status == CheckStatus.FAIL:
        send_alert(f"Check failed: {result.name}")

@hooks.on("pre_fix")
def confirm_fix(fix):
    """Called before applying a fix."""
    return confirm(f"Apply fix: {fix.name}?")
```

Available hooks:

| Hook | Trigger |
|------|---------|
| `pre_check` | Before running a check |
| `post_check` | After running a check |
| `pre_fix` | Before applying a fix |
| `post_fix` | After applying a fix |
| `startup` | When cortex-ops starts |
| `shutdown` | When cortex-ops exits |
| `plugin_loaded` | After a plugin loads |

## Configuration

```yaml
# /etc/cortex/config.yaml

# Doctor settings
doctor:
  timeout_seconds: 30     # Check timeout
  parallel_checks: true   # Run checks in parallel
  max_parallel: 4         # Max concurrent checks
  auto_fix_safe: false    # Auto-fix safe issues

# Update settings
updates:
  check_interval_hours: 24
  auto_check: true
  backup_before_update: true
  rollback_retention_days: 7
  channel: stable

# Plugin settings
plugins:
  enabled: true
  directory: /etc/cortex/plugins
  auto_load: true
  trusted_sources:
    - cortexlinux
```

## Monitoring Integration

### Prometheus Metrics

```python
# Exposed at /metrics
cortex_ops_checks_total{check="disk_space", status="pass"} 42
cortex_ops_checks_total{check="disk_space", status="fail"} 3
cortex_ops_check_duration_seconds{check="disk_space"} 0.234
cortex_ops_repairs_total{type="apt"} 5
cortex_ops_updates_applied_total{type="package"} 127
```

### Health Endpoint

```bash
# JSON health endpoint
curl http://localhost:8080/health

{
  "status": "healthy",
  "checks": {
    "disk_space": "pass",
    "memory": "pass",
    "cpu_load": "warn"
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### Alerting

```yaml
# alerts.yaml
alerts:
  - name: disk-critical
    check: disk_space
    status: fail
    actions:
      - type: email
        to: ops@example.com
      - type: pagerduty
        severity: critical

  - name: service-down
    check: systemd_failed
    status: fail
    actions:
      - type: slack
        channel: "#alerts"
```
