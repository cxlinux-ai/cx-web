# CX - The AI Layer for Linux

**Natural language system administration for Linux.**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-3776AB.svg)](https://python.org)

## What is CX?

CX translates plain English into Linux commands. No more memorizing syntax or reading man pages.

```bash
# Instead of this:
sudo apt-get update && sudo apt-get install -y apache2 php8.3 php8.3-mysql \
  mariadb-server && sudo a2enmod rewrite && sudo systemctl restart apache2

# Just say this:
cx setup lamp stack with php 8.3
```

## Quick Start

```bash
# Install
curl -fsSL https://cxlinux.com/install | bash

# Use natural language
cx install nginx
cx setup lamp stack with php 8.3
cx what packages use the most disk space
cx install cuda drivers for my nvidia gpu
```

## Features

| Feature | Description |
|---------|-------------|
| **Natural Language** | "install nginx" → apt install nginx |
| **Prompt-to-Plan** | Shows exactly what will execute before running |
| **No Silent Sudo** | Every privileged action requires explicit confirmation |
| **Hardware Aware** | Detects GPU, CPU, RAM and optimizes accordingly |
| **Sandbox Mode** | Commands run in isolated Firejail environments |

## Examples

### Install Packages
```bash
cx install nginx and configure it for reverse proxy
cx add docker and docker-compose
cx get the latest node.js
```

### Deploy Stacks
```bash
cx setup lamp stack with php 8.3
cx deploy wordpress with ssl
cx create a django project with postgres
```

### Query System
```bash
cx what packages use the most disk space
cx show me listening ports
cx which services are failing
```

### GPU & Hardware
```bash
cx install cuda drivers for my nvidia gpu
cx what gpu do i have
cx optimize for this hardware
```

## How It Works

1. **Parse**: Natural language is parsed to understand intent
2. **Plan**: A step-by-step plan is generated
3. **Confirm**: User reviews and approves the plan
4. **Execute**: Commands run in sandbox with audit logging

```
$ cx install nginx and enable ssl

📋 Plan:
  1. sudo apt update
  2. sudo apt install -y nginx certbot python3-certbot-nginx
  3. sudo systemctl enable --now nginx
  4. sudo certbot --nginx

⚠️  This requires elevated privileges.
   Commands will modify: apt packages, systemd, nginx config

[Execute] [Dry-run] [Cancel] >
```

## Configuration

```yaml
# ~/.cx/config.yaml
model: local          # or 'claude', 'openai'
sandbox: firejail     # or 'none' (not recommended)
log_level: info
confirm_sudo: true    # require confirmation for sudo
```

## Modules

CX is modular. Install only what you need:

| Module | Description | Install |
|--------|-------------|---------|
| cx | Core CLI | `pip install cx` |
| cx-stacks | LAMP, Node, Django stacks | `pip install cx-stacks` |
| cx-ops | Doctor, diagnostics, repair | `pip install cx-ops` |
| cx-llm | Local LLM inference | `pip install cx-llm` |

## Requirements

- Ubuntu 22.04+ / Debian 12+
- Python 3.11+
- Optional: Firejail (for sandboxing)
- Optional: Ollama (for local LLM)

## License

Apache 2.0 - See [LICENSE](LICENSE)

## Links

- [Website](https://cxlinux.com)
- [Documentation](https://docs.cxlinux.com)
- [GitHub](https://github.com/cxlinux-ai/cx)
