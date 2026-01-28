# CORTEX-NETWORK - Network Management

## Purpose
Network configuration module: WiFi/Ethernet, firewall (UFW/nftables), VPN, DNS management via natural language.

## Repo Role in Ecosystem
- **Network subsystem** - handles all connectivity
- Depends on: cortex (core)
- Standalone network operations available

## Key Features
- WiFi scanning and connection via NetworkManager
- Firewall management (UFW abstraction)
- VPN configuration (WireGuard, OpenVPN)
- DNS configuration with DoH/DoT support
- Network diagnostics and troubleshooting

## Key Directories
```
cortex-network/
├── wifi/           # WiFi management
├── firewall/       # UFW/nftables abstraction
├── vpn/            # VPN configuration
├── dns/            # DNS settings
└── diagnostics/    # Network troubleshooting
```

## Development Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Key Commands
```bash
cortex-network wifi scan              # Scan for networks
cortex-network wifi connect "SSID"    # Connect to WiFi
cortex-network firewall status        # Show firewall rules
cortex-network vpn setup wireguard    # Configure VPN
cortex-network dns set cloudflare     # Set DNS provider
cortex-network diagnose               # Run network diagnostics
```

## Natural Language Examples
```bash
cortex network "connect to my home wifi"
cortex network "block all incoming except SSH"
cortex network "why is my internet slow"
```

## System Requirements
- NetworkManager
- UFW or nftables
- WireGuard tools (optional)
- Root/sudo for most operations

## Testing
```bash
pytest tests/ -v
pytest tests/ -v --network  # Integration tests (requires network)
```
