# CX Ops

**Operations toolkit for Cortex Linux**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-3776AB.svg)](https://python.org)

## Overview

CX Ops provides essential operations tools for managing Cortex Linux systems:

- **Doctor**: System diagnostics and health checks with auto-fix
- **Plugins**: SDK for extending Cortex functionality
- **Connectors**: Cloud LLM integrations (OpenAI, Anthropic, Google)
- **Updates**: Update orchestration with rollback support
- **Repair**: System repair tools for apt, permissions, and services

## Installation

```bash
pip install cx-ops
```

Or install with all LLM connectors:

```bash
pip install cx-ops[all-connectors]
```

## Quick Start

### System Health Check

```bash
# Run all health checks
cx-ops doctor

# Run with auto-fix for detected issues
cx-ops doctor --fix

# Run specific check
cx-ops doctor --check disk_space

# JSON output
cx-ops doctor --json
```

### Plugin Management

```bash
# List installed plugins
cx-ops plugins list

# Create a new plugin
cx-ops plugins create my-plugin --type command

# Enable/disable plugins
cx-ops plugins enable my-plugin
cx-ops plugins disable my-plugin
```

### LLM Connectors

```bash
# List configured connectors
cx-ops connectors list

# Test connector
cx-ops connectors test openai

# Set default connector
cx-ops connectors set-default anthropic
```

### Update Management

```bash
# Check for updates
cx-ops update check

# Apply updates
cx-ops update apply --packages
cx-ops update apply --system

# Rollback to previous state
cx-ops update rollback --list
cx-ops update rollback 20240115-120000
```

### System Repair

```bash
# Fix APT issues
cx-ops repair apt

# Fix file permissions
cx-ops repair permissions

# Fix systemd services
cx-ops repair services
cx-ops repair services --restart-failed
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `CORTEX_DEBUG` | Enable debug mode |
| `CORTEX_LOG_LEVEL` | Logging level (INFO, DEBUG, etc.) |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GOOGLE_API_KEY` | Google AI API key |

### Config File

Create `/etc/cortex/config.yaml`:

```yaml
debug: false
log_level: INFO

connectors:
  default: anthropic
  openai_model: gpt-4-turbo-preview
  anthropic_model: claude-3-opus-20240229
  google_model: gemini-pro

plugins:
  enabled: true
  directory: /etc/cortex/plugins
  auto_load: true

updates:
  check_interval_hours: 24
  auto_check: true
  backup_before_update: true
  update_channel: stable

doctor:
  timeout_seconds: 30
  parallel_checks: true
  max_parallel: 4
```

## Architecture

```
cx_ops/
├── cli.py              # Typer CLI entrypoint
├── doctor/             # System diagnostics
│   ├── checks.py       # Health check definitions
│   ├── runner.py       # Check executor
│   ├── reporter.py     # Rich diagnostic reports
│   └── fixes.py        # Auto-fix actions
├── plugins/            # Plugin SDK
│   ├── base.py         # Plugin base class
│   ├── loader.py       # Plugin discovery/loading
│   ├── registry.py     # Plugin registry
│   └── hooks.py        # Hook system
├── connectors/         # Cloud LLM connectors
│   ├── base.py         # Connector interface
│   ├── openai.py       # OpenAI API
│   ├── anthropic.py    # Claude API
│   ├── google.py       # Gemini API
│   └── manager.py      # Connector management
├── updates/            # Update orchestration
│   ├── checker.py      # Check for updates
│   ├── installer.py    # Apply updates
│   └── rollback.py     # Rollback support
├── repair/             # System repair
│   ├── apt.py          # Fix apt issues
│   ├── permissions.py  # Fix permissions
│   └── services.py     # Fix systemd services
├── config/
│   └── settings.py     # Pydantic settings
└── utils/
    └── system.py       # System utilities
```

## Plugin Development

Create a plugin by subclassing `Plugin`:

```python
from cx_ops.plugins import Plugin, PluginInfo, PluginType

class MyPlugin(Plugin):
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
        # Register commands, hooks, etc.
        pass

    def deactivate(self) -> None:
        # Cleanup
        pass
```

Generate a scaffold:

```bash
cx-ops plugins create my-plugin --type command
```

## Development

```bash
# Clone repository
git clone https://github.com/cortexlinux/cx-ops.git
cd cx-ops

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest -v

# Run linting
ruff check .

# Type checking
mypy cx_ops
```

## License

Apache 2.0 - See [LICENSE](LICENSE)
