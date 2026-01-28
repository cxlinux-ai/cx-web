# CX Stacks

Application stack provisioning for Cortex Linux. Deploy LAMP, LEMP, Node.js, Python, Django, FastAPI, WordPress, and Ghost stacks with a single command.

## Features

- **One-Command Deployment** - Deploy complete application stacks instantly
- **8 Ready-to-Use Stacks** - LAMP, LEMP, Node, Python, Django, FastAPI, WordPress, Ghost
- **Reverse Proxy Management** - Nginx and Caddy configuration
- **SSL Automation** - Let's Encrypt certificate management
- **Docker Support** - Generate docker-compose.yml for any stack
- **Health Validation** - Automatic deployment verification

## Installation

```bash
# From source
pip install -e .

# With development dependencies
pip install -e ".[dev]"
```

## Quick Start

```bash
# List available stacks
cx-stacks list

# Deploy a LAMP stack
cx-stacks deploy lamp --domain example.com --ssl

# Deploy Node.js app
cx-stacks deploy node --domain api.example.com --port 3000

# Deploy Django project
cx-stacks deploy django --domain mysite.com --project myproject

# Generate Docker Compose
cx-stacks docker generate wordpress --output ./my-wp-site
```

## Available Stacks

| Stack | Description | Components |
|-------|-------------|------------|
| `lamp` | Traditional web stack | Apache 2.4 + MariaDB 10.11 + PHP 8.3 |
| `lemp` | Modern PHP stack | Nginx + MariaDB 10.11 + PHP 8.3 |
| `node` | Node.js application | Node.js 20 + PM2 + Nginx |
| `python` | Python WSGI app | Python 3.11 + Gunicorn + Nginx |
| `django` | Django framework | Django 5 + PostgreSQL 16 + Nginx |
| `fastapi` | FastAPI framework | FastAPI + PostgreSQL 16 + Uvicorn |
| `wordpress` | WordPress CMS | WordPress 6 + MariaDB + Redis |
| `ghost` | Ghost CMS | Ghost 5 + MySQL + Nginx |

## CLI Commands

### Stack Management

```bash
# List available stacks
cx-stacks list

# Show stack details
cx-stacks info <stack>

# Deploy a stack
cx-stacks deploy <stack> [options]
  --domain, -d     Domain name
  --ssl            Enable SSL with Let's Encrypt
  --port, -p       Application port
  --db-name        Database name
  --db-user        Database user
  --db-password    Database password
  --app            Application path
  --project        Project name (Django)
  --dry-run        Show what would be done

# Remove a stack
cx-stacks remove <stack> --domain <domain>

# Check stack status
cx-stacks status <stack> --domain <domain>

# View stack logs
cx-stacks logs <stack> --domain <domain> --lines 100
```

### Reverse Proxy

```bash
# Add reverse proxy
cx-stacks proxy add <domain> <backend>
  --websocket, -w  Enable WebSocket support
  --type, -t       Proxy type (nginx/caddy)

# Remove proxy
cx-stacks proxy remove <domain>

# List configured proxies
cx-stacks proxy list

# Enable SSL
cx-stacks proxy ssl <domain> --email admin@example.com

# List SSL certificates
cx-stacks proxy certs
```

### Docker Support

```bash
# Generate docker-compose.yml
cx-stacks docker generate <stack>
  --output, -o     Output directory
  --domain, -d     Domain name

# Start Docker stack
cx-stacks docker up
  --path, -p       Compose directory
  --build          Build images

# Stop Docker stack
cx-stacks docker down
  --volumes, -v    Remove volumes

# View logs
cx-stacks docker logs [service]
  --follow, -f     Follow logs
  --tail, -n       Number of lines

# Show status
cx-stacks docker ps
```

### Configuration

```bash
# Show current config
cx-stacks config show

# Set config value (via environment)
cx-stacks config set <key> <value>
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CX_STACKS_CONFIG_DIR` | `~/.cx/stacks` | Configuration directory |
| `CX_STACKS_DEFAULT_WEB_ROOT` | `/var/www` | Default web root |
| `CX_STACKS_DEFAULT_PROXY` | `nginx` | Default proxy (nginx/caddy) |
| `CX_STACKS_SSL_EMAIL` | - | Email for Let's Encrypt |
| `CX_STACKS_DOCKER_NETWORK` | `cx-net` | Docker network name |

## Examples

### Deploy WordPress with SSL

```bash
cx-stacks deploy wordpress \
  --domain blog.example.com \
  --ssl \
  --db-name wp_blog \
  --db-user wp_user
```

### Deploy Django Project

```bash
cx-stacks deploy django \
  --domain myapp.example.com \
  --project myapp \
  --ssl
```

### Generate Docker Stack

```bash
# Generate compose file
cx-stacks docker generate fastapi \
  --domain api.example.com \
  --output ./api-stack

# Start containers
cd api-stack
docker compose up -d
```

### Add Custom Reverse Proxy

```bash
# Proxy to local app
cx-stacks proxy add api.example.com 127.0.0.1:8000

# With WebSocket support
cx-stacks proxy add ws.example.com 127.0.0.1:3000 --websocket

# Enable SSL
cx-stacks proxy ssl api.example.com --email admin@example.com
```

## Supported Distributions

- Ubuntu 22.04 / 24.04
- Debian 12 (Bookworm)

## License

MIT License - AI Venture Holdings LLC
