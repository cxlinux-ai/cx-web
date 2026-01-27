# Quick Start

Get up and running with Cortex Linux in under 10 minutes.

## First Steps

After installing Cortex Linux, open a terminal and verify your installation:

```bash
# Check Cortex CLI version
cortex --version
# Cortex CLI 1.0.0

# View system status
cortex status
```

Expected output:

```
╭─────────────────────────────────────────────────────────╮
│                    Cortex Linux Status                   │
├─────────────────────────────────────────────────────────┤
│ Version:     2024.1.0                                   │
│ Kernel:      6.5.0-cortex                               │
│ Uptime:      0 days, 0:05:32                            │
│ Components:  CLI ✓  Ops ✓  Security ✓  LLM ✗           │
╰─────────────────────────────────────────────────────────╯
```

## Run System Diagnostics

The first thing you should do is run a health check:

```bash
cortex-ops doctor
```

This checks:

- Disk space and filesystem health
- Memory and swap configuration
- CPU load and thermals
- Network connectivity
- Package manager status
- Service health
- Security posture

Example output:

```
Cortex Doctor - System Health Check
Cortex Linux 2024.1 (6.5.0-cortex)

[PASS] Disk Space - Disk usage at 23.4%
[PASS] Memory Usage - Memory usage at 34.2%
[PASS] CPU Load - CPU load at 12.3%
[PASS] APT Status - APT package manager healthy
[PASS] Systemd Units - All systemd units healthy
[PASS] Network Connectivity - Network connectivity OK
[PASS] DNS Resolution - DNS resolution OK
[PASS] Time Sync - Time synchronized via NTP
[WARN] Security Updates - 3 security update(s) available

╭─────────────────────────────────────────╮
│              WARNINGS                    │
├─────────────────────────────────────────┤
│ Total checks    12                      │
│ Passed          11                      │
│ Warnings        1                       │
│ Failed          0                       │
│ Duration        1,234ms                 │
╰─────────────────────────────────────────╯

Tip: Run cortex-ops doctor --fix to auto-fix some issues
```

## Configure Your Environment

### Set Timezone

```bash
# View current timezone
timedatectl

# Set timezone
sudo timedatectl set-timezone America/New_York
```

### Configure Network

```bash
# View network configuration
nmcli device status

# Connect to WiFi
nmcli device wifi connect "SSID" password "password"

# Set static IP (Ethernet)
nmcli connection modify "Wired connection 1" \
  ipv4.addresses 192.168.1.100/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns "8.8.8.8,8.8.4.4" \
  ipv4.method manual
```

### Create User Account

```bash
# Create a new user
sudo adduser developer

# Add to sudo group
sudo usermod -aG sudo developer

# Add to docker group (if using containers)
sudo usermod -aG docker developer
```

## Install Packages

Cortex Linux uses APT for package management:

```bash
# Update package lists
sudo apt update

# Upgrade all packages
sudo apt upgrade

# Search for packages
apt search python3

# Install packages
sudo apt install python3 python3-pip nodejs npm
```

## Configure LLM Integration

If you plan to use AI features, configure your LLM connectors:

```bash
# Set environment variables
export OPENAI_API_KEY="sk-your-key"
export ANTHROPIC_API_KEY="sk-ant-your-key"

# Or add to your shell profile
echo 'export OPENAI_API_KEY="sk-your-key"' >> ~/.bashrc
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key"' >> ~/.bashrc

# Test the connection
cortex-ops connectors test
```

## Common Tasks

### Update the System

```bash
# Check for updates
cortex-ops update check

# Apply all updates
cortex-ops update apply --packages

# Apply security updates only
cortex-ops update apply --packages --security
```

### Monitor System Resources

```bash
# Real-time resource monitor
htop

# Disk usage
df -h

# Memory usage
free -h

# GPU status (if available)
nvidia-smi
```

### Manage Services

```bash
# View all services
systemctl list-units --type=service

# Start/stop/restart a service
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx

# Enable service at boot
sudo systemctl enable nginx

# View service logs
journalctl -u nginx -f
```

### Work with Containers

```bash
# Pull an image
docker pull nginx:latest

# Run a container
docker run -d -p 80:80 nginx

# List running containers
docker ps

# View container logs
docker logs container_id
```

## Enable SSH Access

```bash
# Check SSH service status
systemctl status sshd

# Start SSH if not running
sudo systemctl start sshd
sudo systemctl enable sshd

# Configure SSH (edit config)
sudo nano /etc/ssh/sshd_config

# Recommended settings:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

# Restart SSH after changes
sudo systemctl restart sshd
```

## Set Up Development Environment

### Python

```bash
# Install Python and tools
sudo apt install python3 python3-pip python3-venv

# Create virtual environment
python3 -m venv ~/myproject/venv
source ~/myproject/venv/bin/activate

# Install packages
pip install numpy pandas scikit-learn
```

### Node.js

```bash
# Install Node.js
sudo apt install nodejs npm

# Install yarn (optional)
npm install -g yarn

# Create a new project
mkdir myapp && cd myapp
npm init -y
```

### Rust

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Source the environment
source ~/.cargo/env

# Verify installation
rustc --version
```

## What's Next?

Now that you have Cortex Linux running:

1. **[Configuration](configuration.md)**: Deep dive into system configuration
2. **[Architecture](../architecture/overview.md)**: Understand Cortex components
3. **[Security Hardening](../security/hardening.md)**: Secure your installation
4. **[Troubleshooting](../runbooks/troubleshooting.md)**: Common issues and solutions

## Getting Help

If you run into issues:

```bash
# View system logs
journalctl -xe

# Run diagnostics with verbose output
cortex-ops doctor --verbose

# Generate support bundle
cortex support-bundle
```

Visit our [Discord community](https://discord.gg/cortexlinux) for real-time help.
