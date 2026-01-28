"""Cortex Network CLI - Network configuration toolkit for Cortex Linux."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated, Optional

import typer
from rich.console import Console

from . import __version__
from .modules.status import NetworkStatus
from .modules.wifi import WiFiManager
from .modules.firewall import FirewallManager
from .modules.vpn import VPNManager
from .modules.dns import DNSManager

console = Console()

# Main app
app = typer.Typer(
    name="cortex-network",
    help="Network configuration toolkit for Cortex Linux",
    no_args_is_help=True,
    rich_markup_mode="rich",
)

# Sub-command groups
wifi_app = typer.Typer(help="WiFi management commands")
firewall_app = typer.Typer(help="Firewall management commands")
vpn_app = typer.Typer(help="VPN management commands")
dns_app = typer.Typer(help="DNS management commands")

app.add_typer(wifi_app, name="wifi")
app.add_typer(firewall_app, name="firewall")
app.add_typer(vpn_app, name="vpn")
app.add_typer(dns_app, name="dns")


# ============================================================================
# Main Commands
# ============================================================================


@app.command()
def status(
    verbose: Annotated[bool, typer.Option("--verbose", "-v", help="Show detailed output")] = False,
) -> None:
    """Display comprehensive network status."""
    network = NetworkStatus()
    network.display_full_status()


@app.command()
def interfaces() -> None:
    """List network interfaces with details."""
    network = NetworkStatus()
    network.display_interfaces()


@app.command()
def check() -> None:
    """Run connectivity diagnostics."""
    network = NetworkStatus()
    network.check_connectivity(verbose=True)


@app.callback()
def main(
    version: Annotated[
        bool, typer.Option("--version", "-V", help="Show version and exit")
    ] = False,
) -> None:
    """Cortex Network - Network configuration toolkit for Cortex Linux."""
    if version:
        console.print(f"cortex-network version {__version__}")
        raise typer.Exit()


# ============================================================================
# WiFi Commands
# ============================================================================


@wifi_app.command("list")
def wifi_list() -> None:
    """List available WiFi networks."""
    wifi = WiFiManager()
    wifi.list_networks()


@wifi_app.command("connect")
def wifi_connect(
    ssid: Annotated[str, typer.Argument(help="Network SSID to connect to")],
    password: Annotated[Optional[str], typer.Option("--password", "-p", help="Network password")] = None,
) -> None:
    """Connect to a WiFi network."""
    wifi = WiFiManager()
    wifi.connect(ssid, password)


@wifi_app.command("disconnect")
def wifi_disconnect() -> None:
    """Disconnect from current WiFi network."""
    wifi = WiFiManager()
    wifi.disconnect()


@wifi_app.command("forget")
def wifi_forget(
    ssid: Annotated[str, typer.Argument(help="Network SSID to forget")],
) -> None:
    """Remove a saved WiFi network."""
    wifi = WiFiManager()
    wifi.forget(ssid)


@wifi_app.command("saved")
def wifi_saved() -> None:
    """List saved WiFi networks."""
    wifi = WiFiManager()
    wifi.list_saved()


@wifi_app.command("status")
def wifi_status() -> None:
    """Show current WiFi connection status."""
    wifi = WiFiManager()
    wifi.show_status()


# ============================================================================
# Firewall Commands
# ============================================================================


@firewall_app.command("status")
def firewall_status() -> None:
    """Show firewall status and rules."""
    firewall = FirewallManager()
    firewall.list_rules()


@firewall_app.command("enable")
def firewall_enable() -> None:
    """Enable the firewall with default deny policy."""
    firewall = FirewallManager()
    firewall.enable()


@firewall_app.command("disable")
def firewall_disable() -> None:
    """Disable the firewall."""
    firewall = FirewallManager()
    firewall.disable()


@firewall_app.command("allow")
def firewall_allow(
    port: Annotated[str, typer.Argument(help="Port number or service name (e.g., 22, 80, ssh, http)")],
    protocol: Annotated[str, typer.Option("--protocol", "-p", help="Protocol (tcp/udp)")] = "tcp",
    source: Annotated[Optional[str], typer.Option("--from", "-f", help="Source IP/network")] = None,
    comment: Annotated[Optional[str], typer.Option("--comment", "-c", help="Rule comment")] = None,
) -> None:
    """Allow incoming traffic on a port or service."""
    firewall = FirewallManager()

    # Check if it's a service name
    if not port.isdigit():
        firewall.allow_service(port)
    else:
        firewall.allow(int(port), protocol, source, comment)


@firewall_app.command("deny")
def firewall_deny(
    port: Annotated[int, typer.Argument(help="Port number to block")],
    protocol: Annotated[str, typer.Option("--protocol", "-p", help="Protocol (tcp/udp)")] = "tcp",
    source: Annotated[Optional[str], typer.Option("--from", "-f", help="Source IP/network")] = None,
) -> None:
    """Block incoming traffic on a port."""
    firewall = FirewallManager()
    firewall.deny(port, protocol, source)


@firewall_app.command("delete")
def firewall_delete(
    rule_number: Annotated[int, typer.Argument(help="Rule number to delete")],
) -> None:
    """Delete a firewall rule by number."""
    firewall = FirewallManager()
    firewall.delete_rule(rule_number)


@firewall_app.command("reset")
def firewall_reset() -> None:
    """Reset firewall to default state."""
    firewall = FirewallManager()
    if typer.confirm("This will remove all firewall rules. Continue?"):
        firewall.reset()


# ============================================================================
# VPN Commands
# ============================================================================


@vpn_app.command("status")
def vpn_status() -> None:
    """Show VPN connection status."""
    vpn = VPNManager()
    vpn.show_status()


@vpn_app.command("list")
def vpn_list() -> None:
    """List configured VPN connections."""
    vpn = VPNManager()
    vpn.show_status()


@vpn_app.command("add")
def vpn_add(
    name: Annotated[str, typer.Argument(help="Name for the VPN connection")],
    config: Annotated[Path, typer.Argument(help="Path to configuration file")],
    vpn_type: Annotated[str, typer.Option("--type", "-t", help="VPN type (wireguard/openvpn)")] = "wireguard",
) -> None:
    """Add a VPN configuration from file."""
    vpn = VPNManager()

    if vpn_type.lower() == "wireguard":
        vpn.add_wireguard(name, config_file=config)
    elif vpn_type.lower() == "openvpn":
        vpn.add_openvpn(name, config)
    else:
        console.print(f"[red]ERROR:[/red] Unsupported VPN type: {vpn_type}")
        console.print("Supported types: wireguard, openvpn")


@vpn_app.command("remove")
def vpn_remove(
    name: Annotated[str, typer.Argument(help="VPN connection name to remove")],
) -> None:
    """Remove a VPN configuration."""
    vpn = VPNManager()
    if typer.confirm(f"Remove VPN configuration '{name}'?"):
        vpn.remove(name)


@vpn_app.command("connect")
def vpn_connect(
    name: Annotated[str, typer.Argument(help="VPN connection name")],
) -> None:
    """Connect to a VPN."""
    vpn = VPNManager()
    vpn.connect(name)


@vpn_app.command("disconnect")
def vpn_disconnect(
    name: Annotated[str, typer.Argument(help="VPN connection name")],
) -> None:
    """Disconnect from a VPN."""
    vpn = VPNManager()
    vpn.disconnect(name)


@vpn_app.command("create")
def vpn_create(
    name: Annotated[str, typer.Argument(help="Name for the new VPN")],
    address: Annotated[str, typer.Option("--address", "-a", help="Interface address (e.g., 10.0.0.2/24)")],
    peer_key: Annotated[str, typer.Option("--peer-key", "-k", help="Peer's public key")],
    endpoint: Annotated[str, typer.Option("--endpoint", "-e", help="Peer endpoint (host:port)")],
    allowed_ips: Annotated[str, typer.Option("--allowed-ips", help="Allowed IPs")] = "0.0.0.0/0, ::/0",
    dns: Annotated[Optional[str], typer.Option("--dns", "-d", help="DNS server")] = "1.1.1.1",
) -> None:
    """Create a new WireGuard VPN configuration."""
    vpn = VPNManager()
    vpn.create_wireguard_config(
        name=name,
        address=address,
        peer_public_key=peer_key,
        peer_endpoint=endpoint,
        peer_allowed_ips=allowed_ips,
        dns=dns,
    )


# ============================================================================
# DNS Commands
# ============================================================================


@dns_app.command("status")
def dns_status() -> None:
    """Show DNS configuration and status."""
    dns = DNSManager()
    dns.show_status()


@dns_app.command("set")
def dns_set(
    servers: Annotated[
        Optional[list[str]],
        typer.Argument(help="DNS server IP addresses or provider name (cloudflare, google, quad9)")
    ] = None,
) -> None:
    """Set DNS servers (by IP or provider name)."""
    dns = DNSManager()

    if not servers:
        console.print("[red]ERROR:[/red] Specify DNS servers or provider name")
        console.print("\nExamples:")
        console.print("  cortex-network dns set cloudflare")
        console.print("  cortex-network dns set 1.1.1.1 1.0.0.1")
        return

    # Check if it's a provider name
    if len(servers) == 1 and not any(c.isdigit() for c in servers[0][:3]):
        dns.set_dns(provider=servers[0])
    else:
        dns.set_dns(servers=servers)


@dns_app.command("reset")
def dns_reset() -> None:
    """Reset DNS to system defaults (DHCP)."""
    dns = DNSManager()
    if typer.confirm("Reset DNS to DHCP defaults?"):
        dns.reset()


@dns_app.command("providers")
def dns_providers() -> None:
    """List available DNS providers."""
    dns = DNSManager()
    dns.list_providers()


@dns_app.command("flush")
def dns_flush() -> None:
    """Flush DNS cache."""
    dns = DNSManager()
    dns.flush_cache()


@dns_app.command("test")
def dns_test(
    domain: Annotated[str, typer.Argument(help="Domain to resolve")] = "google.com",
) -> None:
    """Test DNS resolution for a domain."""
    dns = DNSManager()
    dns.test_resolution(domain)


if __name__ == "__main__":
    app()
