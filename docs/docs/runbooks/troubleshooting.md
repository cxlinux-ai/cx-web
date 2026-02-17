# Troubleshooting Guide

Common issues and their solutions for CX Linux systems.

## Quick Diagnostics

Before diving into specific issues, run these diagnostic commands:

```bash
# System health check
cx-ops doctor --verbose

# View recent system logs
journalctl -p err -n 50

# Check disk space
df -h

# Check memory
free -h

# Check running services
systemctl list-units --failed
```

---

## Boot Issues

### System Won't Boot

**Symptoms:** System hangs at boot, black screen, or boot loop.

**Diagnosis:**

```bash
# From recovery mode or live USB
# Check filesystem
fsck /dev/sda1

# View boot logs
journalctl -b -1 -p err

# Check GRUB config
cat /boot/grub/grub.cfg
```

**Solutions:**

1. **Repair GRUB:**
   ```bash
   # Boot from live USB
   mount /dev/sda1 /mnt
   mount --bind /dev /mnt/dev
   mount --bind /proc /mnt/proc
   mount --bind /sys /mnt/sys
   chroot /mnt
   grub-install /dev/sda
   update-grub
   ```

2. **Fix fstab:**
   ```bash
   # Boot with init=/bin/bash
   mount -o remount,rw /
   nano /etc/fstab
   # Comment out problematic entries
   ```

3. **Kernel rollback:**
   ```bash
   # At GRUB menu, select "Advanced options"
   # Choose previous kernel version
   ```

### Kernel Panic

**Symptoms:** "Kernel panic - not syncing" message.

**Solutions:**

1. Boot with previous kernel from GRUB menu
2. Check hardware (RAM, disk)
3. Review recent kernel updates

```bash
# List installed kernels
dpkg --list | grep linux-image

# Remove problematic kernel
apt remove linux-image-x.x.x-cx
```

---

## Network Issues

### No Network Connectivity

**Diagnosis:**

```bash
# Check interfaces
ip link show

# Check IP addresses
ip addr show

# Check routes
ip route show

# Test connectivity
ping -c 3 8.8.8.8

# Test DNS
dig google.com
```

**Solutions:**

1. **Restart NetworkManager:**
   ```bash
   sudo systemctl restart NetworkManager
   ```

2. **Manually configure interface:**
   ```bash
   sudo ip link set eth0 up
   sudo dhclient eth0
   ```

3. **Reset network configuration:**
   ```bash
   # Remove and recreate connection
   nmcli connection delete "Wired connection 1"
   nmcli connection add type ethernet con-name "eth0" ifname eth0
   ```

### DNS Resolution Failing

**Symptoms:** Can ping IPs but not hostnames.

**Solutions:**

```bash
# Check resolv.conf
cat /etc/resolv.conf

# Set DNS manually
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# Or configure systemd-resolved
sudo nano /etc/systemd/resolved.conf
# Add: DNS=8.8.8.8 8.8.4.4
sudo systemctl restart systemd-resolved
```

### Firewall Blocking Traffic

```bash
# Check UFW status
sudo ufw status verbose

# Temporarily disable
sudo ufw disable

# Allow specific port
sudo ufw allow 80/tcp

# Allow from specific IP
sudo ufw allow from 192.168.1.100
```

---

## Disk Issues

### Disk Full

**Diagnosis:**

```bash
# Check disk usage
df -h

# Find large files
sudo du -h --max-depth=1 / | sort -hr | head -20

# Find large log files
sudo find /var/log -type f -size +100M
```

**Solutions:**

```bash
# Clean apt cache
sudo apt clean

# Remove old kernels
sudo apt autoremove

# Clean journal logs
sudo journalctl --vacuum-time=7d

# Find and remove large files
sudo find /tmp -type f -atime +7 -delete

# Use cx-ops
cx-ops repair apt --clean-cache
```

### Filesystem Errors

**Diagnosis:**

```bash
# Check filesystem
sudo fsck -n /dev/sda1

# Check for disk errors
sudo smartctl -a /dev/sda
```

**Solutions:**

```bash
# Boot to recovery mode and run fsck
sudo fsck -y /dev/sda1

# For mounted filesystem (read-only check)
sudo touch /forcefsck
sudo reboot
```

### Disk I/O Slow

```bash
# Check I/O stats
iostat -x 1 5

# Check for processes using disk
iotop

# Check for disk errors
dmesg | grep -i error
```

---

## Memory Issues

### Out of Memory (OOM)

**Diagnosis:**

```bash
# Check memory
free -h

# Check OOM logs
dmesg | grep -i "out of memory"

# Find memory-hungry processes
ps aux --sort=-%mem | head -10
```

**Solutions:**

1. **Increase swap:**
   ```bash
   # Create swap file
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile

   # Make permanent
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. **Kill memory-hungry processes:**
   ```bash
   # Find and kill
   ps aux --sort=-%mem | head -5
   kill -9 <PID>
   ```

3. **Configure OOM killer:**
   ```bash
   # Protect critical processes
   echo -1000 > /proc/<PID>/oom_score_adj
   ```

### High Memory Usage

```bash
# Check what's using memory
smem -tk

# Clear page cache
sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches
```

---

## Service Issues

### Service Won't Start

**Diagnosis:**

```bash
# Check service status
systemctl status service-name

# Check logs
journalctl -u service-name -n 50

# Check config syntax
service-name --test  # or similar
```

**Solutions:**

```bash
# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart service-name

# Check for port conflicts
sudo ss -tlnp | grep :8080

# Fix permissions
sudo chown -R service-user:service-group /var/lib/service/
```

### Failed Systemd Units

```bash
# List failed units
systemctl --failed

# Reset failed state
sudo systemctl reset-failed

# Restart failed units
cx-ops repair services --restart-failed
```

---

## Package Manager Issues

### APT Broken

**Diagnosis:**

```bash
# Check for issues
sudo apt-get check

# Check dpkg status
sudo dpkg --audit
```

**Solutions:**

```bash
# Use cx-ops (recommended)
cx-ops repair apt

# Or manually:
# Clear locks
sudo rm /var/lib/dpkg/lock*
sudo rm /var/lib/apt/lists/lock
sudo rm /var/cache/apt/archives/lock

# Reconfigure
sudo dpkg --configure -a

# Fix broken dependencies
sudo apt-get install -f
```

### Package Conflicts

```bash
# Find conflicting packages
apt-cache policy package-name

# Force install specific version
sudo apt install package-name=version

# Remove problematic package
sudo dpkg --remove --force-remove-reinstreq package-name
```

---

## Performance Issues

### High CPU Usage

**Diagnosis:**

```bash
# Find CPU-hungry processes
top -o %CPU

# Check load average
uptime

# Profile specific process
sudo perf top -p <PID>
```

**Solutions:**

```bash
# Limit process CPU
cpulimit -p <PID> -l 50

# Set nice value
renice 19 -p <PID>

# Kill runaway process
kill -9 <PID>
```

### System Slow

```bash
# Check system load
vmstat 1 10

# Check I/O wait
iostat -x 1 5

# Check network
ss -s

# Run full diagnostics
cx-ops doctor --verbose
```

---

## LLM Connector Issues

### Connection Failed

**Diagnosis:**

```bash
# Test connector
cx-ops connectors test openai

# Check API key
echo $OPENAI_API_KEY | head -c 10

# Test API directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Solutions:**

1. Verify API key is set correctly
2. Check network connectivity to API endpoint
3. Verify API key has correct permissions
4. Check rate limits

### Timeout Errors

```bash
# Increase timeout
export CX_CONNECTORS__TIMEOUT=120

# Or in config
echo "connectors:" >> /etc/cx/config.yaml
echo "  timeout: 120" >> /etc/cx/config.yaml
```

---

## Getting More Help

### Generate Support Bundle

```bash
cx support-bundle

# This creates a tarball with:
# - System info
# - Logs
# - Configuration (sanitized)
# - Doctor results
```

### Useful Log Locations

| Log | Location |
|-----|----------|
| System | `/var/log/syslog` |
| Kernel | `/var/log/kern.log` |
| Auth | `/var/log/auth.log` |
| Cortex | `/var/log/cx/` |
| Journal | `journalctl` |

### Community Support

- Discord: [discord.gg/cortexlinux](https://discord.gg/cortexlinux)
- GitHub Issues: [github.com/cortexlinux/cortex](https://github.com/cortexlinux/cortex)
- Documentation: [docs.cortexlinux.com](https://docs.cortexlinux.com)
