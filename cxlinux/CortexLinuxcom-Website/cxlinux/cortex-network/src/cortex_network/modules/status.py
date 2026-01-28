"""Network status and diagnostics module."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import psutil
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.text import Text

from ..core.system import (
    get_system_info,
    get_network_interfaces,
    run_command,
    detect_network_manager,
    detect_firewall_backend,
    is_service_active,
    SystemInfo,
)
from ..core.output import (
    console,
    create_status_table,
    format_status_indicator,
    format_interface_type,
    format_speed,
    format_bytes,
    print_info,
    print_warning,
)


@dataclass
class ConnectionStatus:
    """Network connection status."""

    connected: bool
    gateway: str | None
    public_ip: str | None
    dns_servers: list[str]
    latency_ms: float | None


class NetworkStatus:
    """Network status and diagnostics."""

    def __init__(self) -> None:
        self.system_info = get_system_info()

    def get_default_gateway(self) -> str | None:
        """Get default gateway address."""
        result = run_command(["ip", "route", "show", "default"])
        if result.success and result.stdout:
            parts = result.stdout.split()
            if len(parts) >= 3 and parts[0] == "default":
                return parts[2]
        return None

    def get_public_ip(self) -> str | None:
        """Get public IP address."""
        # Try multiple services for reliability
        services = [
            ["curl", "-s", "-m", "5", "https://api.ipify.org"],
            ["curl", "-s", "-m", "5", "https://ifconfig.me"],
            ["curl", "-s", "-m", "5", "https://icanhazip.com"],
        ]
        for cmd in services:
            result = run_command(cmd, timeout=10)
            if result.success and result.stdout:
                ip = result.stdout.strip()
                # Validate IP format
                if ip.count(".") == 3 or ":" in ip:
                    return ip
        return None

    def get_dns_servers(self) -> list[str]:
        """Get configured DNS servers."""
        servers: list[str] = []

        # Try systemd-resolve
        result = run_command(["resolvectl", "status"])
        if result.success:
            for line in result.stdout.splitlines():
                if "DNS Servers:" in line or "Current DNS Server:" in line:
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        server = parts[1].strip()
                        if server and server not in servers:
                            servers.append(server)

        # Fallback to /etc/resolv.conf
        if not servers:
            try:
                with open("/etc/resolv.conf") as f:
                    for line in f:
                        if line.startswith("nameserver"):
                            parts = line.split()
                            if len(parts) >= 2:
                                servers.append(parts[1])
            except FileNotFoundError:
                pass

        return servers

    def ping_test(self, host: str = "8.8.8.8", count: int = 3) -> float | None:
        """Perform ping test and return average latency."""
        result = run_command(["ping", "-c", str(count), "-W", "2", host], timeout=15)
        if result.success:
            for line in result.stdout.splitlines():
                if "avg" in line or "rtt" in line:
                    # Parse: rtt min/avg/max/mdev = 10.5/12.3/14.1/1.5 ms
                    parts = line.split("=")
                    if len(parts) >= 2:
                        times = parts[1].strip().split("/")
                        if len(times) >= 2:
                            try:
                                return float(times[1])
                            except ValueError:
                                pass
        return None

    def get_connection_status(self) -> ConnectionStatus:
        """Get overall connection status."""
        gateway = self.get_default_gateway()
        return ConnectionStatus(
            connected=gateway is not None,
            gateway=gateway,
            public_ip=self.get_public_ip() if gateway else None,
            dns_servers=self.get_dns_servers(),
            latency_ms=self.ping_test() if gateway else None,
        )

    def get_traffic_stats(self) -> dict[str, dict[str, int]]:
        """Get network traffic statistics per interface."""
        stats: dict[str, dict[str, int]] = {}
        counters = psutil.net_io_counters(pernic=True)
        for iface, data in counters.items():
            if iface == "lo":
                continue
            stats[iface] = {
                "bytes_sent": data.bytes_sent,
                "bytes_recv": data.bytes_recv,
                "packets_sent": data.packets_sent,
                "packets_recv": data.packets_recv,
                "errors_in": data.errin,
                "errors_out": data.errout,
                "drops_in": data.dropin,
                "drops_out": data.dropout,
            }
        return stats

    def display_full_status(self) -> None:
        """Display comprehensive network status."""
        # System info panel
        sys_info = self.system_info
        console.print()
        console.print(Panel(
            f"[bold]Hostname:[/bold] {sys_info.hostname}\n"
            f"[bold]Distribution:[/bold] {sys_info.distribution}\n"
            f"[bold]Kernel:[/bold] {sys_info.kernel}\n"
            f"[bold]Network Manager:[/bold] {sys_info.network_manager}\n"
            f"[bold]Firewall Backend:[/bold] {sys_info.firewall_backend}",
            title="System Information",
            border_style="cyan"
        ))

        # Connection status
        conn = self.get_connection_status()
        status_color = "green" if conn.connected else "red"
        status_text = "Connected" if conn.connected else "Disconnected"

        conn_info = f"[bold]Status:[/bold] [{status_color}]{status_text}[/{status_color}]\n"
        if conn.gateway:
            conn_info += f"[bold]Gateway:[/bold] {conn.gateway}\n"
        if conn.public_ip:
            conn_info += f"[bold]Public IP:[/bold] {conn.public_ip}\n"
        if conn.dns_servers:
            conn_info += f"[bold]DNS Servers:[/bold] {', '.join(conn.dns_servers)}\n"
        if conn.latency_ms is not None:
            latency_color = "green" if conn.latency_ms < 50 else "yellow" if conn.latency_ms < 100 else "red"
            conn_info += f"[bold]Latency:[/bold] [{latency_color}]{conn.latency_ms:.1f} ms[/{latency_color}]"

        console.print(Panel(conn_info, title="Connection Status", border_style=status_color))

        # Interface table
        interfaces = get_network_interfaces()
        if interfaces:
            iface_table = Table(title="Network Interfaces", show_header=True, header_style="bold cyan")
            iface_table.add_column("Interface", style="bold")
            iface_table.add_column("Type")
            iface_table.add_column("Status")
            iface_table.add_column("IPv4")
            iface_table.add_column("MAC")
            iface_table.add_column("Speed")

            for iface in interfaces:
                status = "[green]UP[/green]" if iface.get("up") else "[red]DOWN[/red]"
                ipv4 = iface.get("ipv4") or "[dim]--[/dim]"
                mac = iface.get("mac") or "[dim]--[/dim]"
                speed = format_speed(iface.get("speed", 0))

                iface_table.add_row(
                    iface["name"],
                    format_interface_type(iface["type"]),
                    status,
                    ipv4,
                    mac,
                    speed
                )

            console.print(iface_table)

        # Traffic statistics
        traffic = self.get_traffic_stats()
        if traffic:
            traffic_table = Table(title="Traffic Statistics", show_header=True, header_style="bold cyan")
            traffic_table.add_column("Interface", style="bold")
            traffic_table.add_column("Received")
            traffic_table.add_column("Sent")
            traffic_table.add_column("Errors")
            traffic_table.add_column("Drops")

            for iface_name, stats in traffic.items():
                errors = stats["errors_in"] + stats["errors_out"]
                drops = stats["drops_in"] + stats["drops_out"]
                error_style = "red" if errors > 0 else "dim"
                drop_style = "yellow" if drops > 0 else "dim"

                traffic_table.add_row(
                    iface_name,
                    format_bytes(stats["bytes_recv"]),
                    format_bytes(stats["bytes_sent"]),
                    f"[{error_style}]{errors}[/{error_style}]",
                    f"[{drop_style}]{drops}[/{drop_style}]"
                )

            console.print(traffic_table)

        console.print()

    def display_interfaces(self) -> None:
        """Display interface details only."""
        interfaces = get_network_interfaces()
        if not interfaces:
            print_warning("No network interfaces found")
            return

        for iface in interfaces:
            status = "[green]UP[/green]" if iface.get("up") else "[red]DOWN[/red]"
            console.print(Panel(
                f"[bold]Status:[/bold] {status}\n"
                f"[bold]Type:[/bold] {format_interface_type(iface['type'])}\n"
                f"[bold]IPv4:[/bold] {iface.get('ipv4') or 'Not assigned'}\n"
                f"[bold]IPv6:[/bold] {iface.get('ipv6') or 'Not assigned'}\n"
                f"[bold]MAC:[/bold] {iface.get('mac') or 'Unknown'}\n"
                f"[bold]Speed:[/bold] {format_speed(iface.get('speed', 0))}\n"
                f"[bold]MTU:[/bold] {iface.get('mtu', 'Unknown')}",
                title=f"Interface: {iface['name']}",
                border_style="cyan"
            ))

    def check_connectivity(self, verbose: bool = False) -> bool:
        """Run connectivity diagnostics."""
        console.print("\n[bold]Running connectivity checks...[/bold]\n")

        checks = [
            ("Local network (gateway)", self.get_default_gateway),
            ("DNS resolution", lambda: run_command(["nslookup", "google.com"]).success),
            ("Internet connectivity", lambda: self.ping_test("8.8.8.8") is not None),
            ("HTTPS connectivity", lambda: run_command(["curl", "-s", "-m", "5", "https://google.com"]).success),
        ]

        all_passed = True
        for name, check_func in checks:
            try:
                result = check_func()
                if result:
                    console.print(f"  [green]✓[/green] {name}")
                else:
                    console.print(f"  [red]✗[/red] {name}")
                    all_passed = False
            except Exception as e:
                console.print(f"  [red]✗[/red] {name} (error: {e})")
                all_passed = False

        console.print()
        if all_passed:
            console.print("[green]All connectivity checks passed[/green]")
        else:
            console.print("[red]Some connectivity checks failed[/red]")

        return all_passed
