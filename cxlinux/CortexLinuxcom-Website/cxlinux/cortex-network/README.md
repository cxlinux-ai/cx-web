# Cortex Network

Network configuration toolkit for Cortex Linux. Natural language wrapper for Netplan/NetworkManager, firewall management, VPN setup, and DNS configuration.

## Installation

```bash
pip install cortex-network
```

Or install from source:

```bash
git clone https://github.com/cortexlinux/cortex-network.git
cd cortex-network
pip install -e .
```

## Commands

### Network Status

```bash
# Full network status
cortex-network status

# List interfaces
cortex-network interfaces

# Connectivity diagnostics
cortex-network check
```

### WiFi Management

```bash
# Scan and list networks
cortex-network wifi list

# Connect to network
cortex-network wifi connect "MyNetwork" -p "password"

# Disconnect
cortex-network wifi disconnect

# Forget saved network
cortex-network wifi forget "MyNetwork"

# Show saved networks
cortex-network wifi saved

# Current connection status
cortex-network wifi status
```

### Firewall Management

```bash
# Show status and rules
cortex-network firewall status

# Enable firewall (default deny incoming)
cortex-network firewall enable

# Disable firewall
cortex-network firewall disable

# Allow port/service
cortex-network firewall allow 22
cortex-network firewall allow ssh
cortex-network firewall allow 443 -p tcp
cortex-network firewall allow 80 --from 192.168.1.0/24

# Block port
cortex-network firewall deny 3306

# Delete rule
cortex-network firewall delete 3

# Reset to defaults
cortex-network firewall reset
```

### VPN Management

```bash
# Show VPN status
cortex-network vpn status

# Add WireGuard config from file
cortex-network vpn add myvpn /path/to/wg.conf

# Add OpenVPN config
cortex-network vpn add work /path/to/client.ovpn --type openvpn

# Create new WireGuard config
cortex-network vpn create myvpn \
  --address 10.0.0.2/24 \
  --peer-key "PEER_PUBLIC_KEY" \
  --endpoint "vpn.example.com:51820"

# Connect/disconnect
cortex-network vpn connect myvpn
cortex-network vpn disconnect myvpn

# Remove config
cortex-network vpn remove myvpn
```

### DNS Management

```bash
# Show DNS status
cortex-network dns status

# Set DNS by provider
cortex-network dns set cloudflare
cortex-network dns set google
cortex-network dns set quad9

# Set custom DNS
cortex-network dns set 1.1.1.1 1.0.0.1

# List providers
cortex-network dns providers

# Reset to DHCP
cortex-network dns reset

# Flush cache
cortex-network dns flush

# Test resolution
cortex-network dns test google.com
```

## Supported Backends

### Network Management
- NetworkManager (nmcli)
- systemd-networkd
- netplan
- wpa_supplicant
- iwd

### Firewall
- ufw (Uncomplicated Firewall)
- nftables
- firewalld
- iptables (legacy)

### VPN
- WireGuard
- OpenVPN

### DNS
- systemd-resolved
- NetworkManager
- Direct /etc/resolv.conf

## Requirements

- Python 3.11+
- Linux with systemd
- Root privileges for configuration changes

## License

MIT
