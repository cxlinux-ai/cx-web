# Configuration

Comprehensive guide to configuring Cortex Linux for your environment.

## Configuration Overview

```mermaid
graph TD
    A[Configuration Sources] --> B[Environment Variables]
    A --> C[Config Files]
    A --> D[CLI Arguments]

    C --> E[/etc/cortex/config.yaml]
    C --> F[~/.config/cortex/config.yaml]
    C --> G[./cortex.yaml]

    B --> H[CORTEX_* variables]

    D --> I[--config flag]
```

Configuration is loaded in order of precedence (highest to lowest):

1. CLI arguments
2. Environment variables
3. Local config (`./cortex.yaml`)
4. User config (`~/.config/cortex/config.yaml`)
5. System config (`/etc/cortex/config.yaml`)

## Main Configuration File

The primary configuration file is `/etc/cortex/config.yaml`:

```yaml
# /etc/cortex/config.yaml
# Cortex Linux System Configuration

# General Settings
debug: false
log_level: INFO  # DEBUG, INFO, WARNING, ERROR

# Directory paths
config_dir: /etc/cortex
data_dir: /var/lib/cortex
cache_dir: /var/cache/cortex
log_dir: /var/log/cortex

# LLM Connector Configuration
connectors:
  default: anthropic

  openai:
    api_key: ${OPENAI_API_KEY}  # Use environment variable
    model: gpt-4-turbo-preview
    timeout: 60
    max_tokens: 4096

  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    model: claude-3-opus-20240229
    timeout: 60
    max_tokens: 4096

  google:
    api_key: ${GOOGLE_API_KEY}
    model: gemini-pro

# Plugin Configuration
plugins:
  enabled: true
  directory: /etc/cortex/plugins
  auto_load: true
  trusted_sources:
    - cortexlinux
    - verified

# Update Configuration
updates:
  check_interval_hours: 24
  auto_check: true
  backup_before_update: true
  rollback_retention_days: 7
  channel: stable  # stable, beta, nightly

# Doctor Configuration
doctor:
  timeout_seconds: 30
  parallel_checks: true
  max_parallel: 4
  auto_fix_safe: false

# Security Configuration
security:
  audit_logging: true
  fail2ban_enabled: true
  firewall_enabled: true
  selinux_mode: enforcing  # enforcing, permissive, disabled
```

## Environment Variables

All configuration options can be set via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `CORTEX_DEBUG` | Enable debug mode | `false` |
| `CORTEX_LOG_LEVEL` | Logging level | `INFO` |
| `CORTEX_CONFIG_DIR` | Configuration directory | `/etc/cortex` |
| `CORTEX_DATA_DIR` | Data directory | `/var/lib/cortex` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `GOOGLE_API_KEY` | Google AI API key | - |

Set variables in your shell profile:

```bash
# ~/.bashrc or ~/.zshrc
export CORTEX_LOG_LEVEL=DEBUG
export OPENAI_API_KEY="sk-your-key-here"
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

Or in a systemd service:

```ini
# /etc/systemd/system/cortex.service.d/override.conf
[Service]
Environment="CORTEX_LOG_LEVEL=DEBUG"
Environment="OPENAI_API_KEY=sk-your-key"
```

## Network Configuration

### Static IP Configuration

Edit `/etc/netplan/01-netcfg.yaml`:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      addresses:
        - 192.168.1.100/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

Apply changes:

```bash
sudo netplan apply
```

### DNS Configuration

Edit `/etc/systemd/resolved.conf`:

```ini
[Resolve]
DNS=8.8.8.8 8.8.4.4
FallbackDNS=1.1.1.1 1.0.0.1
DNSSEC=yes
DNSOverTLS=yes
```

Restart resolved:

```bash
sudo systemctl restart systemd-resolved
```

### Firewall Configuration

Cortex uses `ufw` by default:

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow specific port
sudo ufw allow 8080/tcp

# Allow from specific IP
sudo ufw allow from 192.168.1.0/24

# View rules
sudo ufw status verbose
```

## Storage Configuration

### Add New Disk

```bash
# List disks
lsblk

# Create partition
sudo fdisk /dev/sdb
# n (new), p (primary), accept defaults, w (write)

# Create filesystem
sudo mkfs.ext4 /dev/sdb1

# Create mount point
sudo mkdir /data

# Mount temporarily
sudo mount /dev/sdb1 /data

# Add to fstab for permanent mount
echo '/dev/sdb1 /data ext4 defaults 0 2' | sudo tee -a /etc/fstab
```

### Configure LVM

```bash
# Create physical volume
sudo pvcreate /dev/sdb

# Create volume group
sudo vgcreate cortex-vg /dev/sdb

# Create logical volume
sudo lvcreate -L 100G -n data cortex-vg

# Create filesystem
sudo mkfs.ext4 /dev/cortex-vg/data

# Mount
sudo mount /dev/cortex-vg/data /data
```

### Configure ZFS

```bash
# Create pool
sudo zpool create cortex-pool /dev/sdb

# Create dataset
sudo zfs create cortex-pool/data

# Set properties
sudo zfs set compression=lz4 cortex-pool/data
sudo zfs set atime=off cortex-pool/data

# View status
zpool status
```

## User and Authentication

### Configure sudo

Edit `/etc/sudoers.d/cortex`:

```sudoers
# Allow cortex group full sudo
%cortex ALL=(ALL:ALL) ALL

# Allow specific commands without password
%operators ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
%operators ALL=(ALL) NOPASSWD: /usr/bin/cortex-ops doctor
```

### Configure PAM

For two-factor authentication, edit `/etc/pam.d/sshd`:

```
# Add after @include common-auth
auth required pam_google_authenticator.so
```

### Configure SSH Keys

```bash
# Generate key pair
ssh-keygen -t ed25519 -C "user@cortex"

# Copy public key to server
ssh-copy-id user@server

# Or manually add to ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Service Configuration

### Systemd Service

Create a custom service at `/etc/systemd/system/myapp.service`:

```ini
[Unit]
Description=My Application
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=app
Group=app
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/server
Restart=always
RestartSec=5

# Environment
Environment="NODE_ENV=production"
EnvironmentFile=/etc/myapp/env

# Security hardening
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable myapp
sudo systemctl start myapp
```

### Cron Jobs

Edit crontab:

```bash
# Edit user crontab
crontab -e

# Edit system crontab
sudo nano /etc/crontab
```

Example entries:

```cron
# Run health check every hour
0 * * * * /usr/bin/cortex-ops doctor --json > /var/log/cortex/health.json

# Backup daily at 2 AM
0 2 * * * /usr/local/bin/backup.sh

# Clean temp files weekly
0 0 * * 0 /usr/bin/find /tmp -type f -atime +7 -delete
```

## Logging Configuration

### Journald

Edit `/etc/systemd/journald.conf`:

```ini
[Journal]
Storage=persistent
Compress=yes
SystemMaxUse=1G
SystemMaxFileSize=100M
MaxRetentionSec=1month
```

Restart journald:

```bash
sudo systemctl restart systemd-journald
```

### Rsyslog

Edit `/etc/rsyslog.d/50-cortex.conf`:

```
# Log cortex messages to dedicated file
:programname, isequal, "cortex" /var/log/cortex/cortex.log
& stop

# Forward to remote syslog
*.* @syslog.example.com:514
```

### Log Rotation

Create `/etc/logrotate.d/cortex`:

```
/var/log/cortex/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root adm
    sharedscripts
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
```

## Performance Tuning

### Kernel Parameters

Edit `/etc/sysctl.d/99-cortex.conf`:

```ini
# Network performance
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# File handles
fs.file-max = 2097152

# Virtual memory
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# Security
kernel.randomize_va_space = 2
net.ipv4.conf.all.rp_filter = 1
```

Apply changes:

```bash
sudo sysctl --system
```

### Resource Limits

Edit `/etc/security/limits.d/cortex.conf`:

```
# Increase limits for cortex user
cortex soft nofile 65535
cortex hard nofile 65535
cortex soft nproc 32768
cortex hard nproc 32768
```

## Validation

After making configuration changes, validate:

```bash
# Test configuration syntax
cortex config validate

# Run diagnostics
cortex-ops doctor

# Check service status
systemctl status cortex

# View logs for errors
journalctl -u cortex -p err
```
