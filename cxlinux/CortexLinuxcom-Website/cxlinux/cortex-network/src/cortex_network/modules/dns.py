"""DNS management module."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from rich.table import Table
from rich.panel import Panel

from ..core.system import run_command, require_root, detect_network_manager
from ..core.output import (
    console,
    print_error,
    print_success,
    print_warning,
    print_info,
)


# Well-known DNS providers
DNS_PROVIDERS = {
    "cloudflare": {
        "name": "Cloudflare",
        "ipv4": ["1.1.1.1", "1.0.0.1"],
        "ipv6": ["2606:4700:4700::1111", "2606:4700:4700::1001"],
        "description": "Fast, privacy-focused DNS",
    },
    "google": {
        "name": "Google Public DNS",
        "ipv4": ["8.8.8.8", "8.8.4.4"],
        "ipv6": ["2001:4860:4860::8888", "2001:4860:4860::8844"],
        "description": "Reliable and widely used",
    },
    "quad9": {
        "name": "Quad9",
        "ipv4": ["9.9.9.9", "149.112.112.112"],
        "ipv6": ["2620:fe::fe", "2620:fe::9"],
        "description": "Security-focused with threat blocking",
    },
    "opendns": {
        "name": "OpenDNS",
        "ipv4": ["208.67.222.222", "208.67.220.220"],
        "ipv6": ["2620:119:35::35", "2620:119:53::53"],
        "description": "Cisco-owned with filtering options",
    },
    "adguard": {
        "name": "AdGuard DNS",
        "ipv4": ["94.140.14.14", "94.140.15.15"],
        "ipv6": ["2a10:50c0::ad1:ff", "2a10:50c0::ad2:ff"],
        "description": "Ad and tracker blocking",
    },
    "nextdns": {
        "name": "NextDNS",
        "ipv4": ["45.90.28.0", "45.90.30.0"],
        "ipv6": ["2a07:a8c0::"],
        "description": "Customizable DNS filtering",
    },
}


@dataclass
class DNSConfig:
    """DNS configuration."""

    servers: list[str]
    search_domains: list[str]
    interface: str | None = None


class DNSManager:
    """Manage DNS configuration."""

    def __init__(self) -> None:
        self.network_manager = detect_network_manager()
        self.resolv_conf = Path("/etc/resolv.conf")

    def _get_systemd_resolve_status(self) -> dict[str, Any]:
        """Get systemd-resolved status."""
        info: dict[str, Any] = {
            "current_dns": [],
            "dns_over_tls": "unknown",
            "dnssec": "unknown",
        }

        result = run_command(["resolvectl", "status"])
        if result.success:
            current_section = "global"
            for line in result.stdout.splitlines():
                line = line.strip()
                if "Link" in line:
                    current_section = "link"
                elif "Current DNS Server:" in line:
                    server = line.split(":", 1)[1].strip()
                    if server:
                        info["current_dns"].append(server)
                elif "DNS Servers:" in line:
                    servers = line.split(":", 1)[1].strip().split()
                    info["current_dns"].extend(servers)
                elif "DNS over TLS:" in line:
                    info["dns_over_tls"] = line.split(":", 1)[1].strip()
                elif "DNSSEC:" in line:
                    info["dnssec"] = line.split(":", 1)[1].strip()

        return info

    def _get_resolv_conf_servers(self) -> list[str]:
        """Parse /etc/resolv.conf for DNS servers."""
        servers: list[str] = []
        try:
            content = self.resolv_conf.read_text()
            for line in content.splitlines():
                if line.startswith("nameserver"):
                    parts = line.split()
                    if len(parts) >= 2:
                        servers.append(parts[1])
        except FileNotFoundError:
            pass
        return servers

    def get_current_dns(self) -> list[str]:
        """Get currently configured DNS servers."""
        # Try systemd-resolved first
        result = run_command(["resolvectl", "status"])
        if result.success:
            info = self._get_systemd_resolve_status()
            if info["current_dns"]:
                return list(set(info["current_dns"]))

        # Fallback to resolv.conf
        return self._get_resolv_conf_servers()

    def show_status(self) -> None:
        """Display DNS status."""
        console.print()

        # Check if systemd-resolved is active
        resolved_active = run_command(["systemctl", "is-active", "systemd-resolved"]).success

        if resolved_active:
            info = self._get_systemd_resolve_status()

            console.print(Panel(
                f"[bold]Backend:[/bold] systemd-resolved\n"
                f"[bold]DNS over TLS:[/bold] {info['dns_over_tls']}\n"
                f"[bold]DNSSEC:[/bold] {info['dnssec']}",
                title="DNS Status",
                border_style="cyan"
            ))

            if info["current_dns"]:
                console.print("\n[bold]Active DNS Servers:[/bold]")
                for server in info["current_dns"]:
                    provider = self._identify_provider(server)
                    if provider:
                        console.print(f"  [green]●[/green] {server} ({provider})")
                    else:
                        console.print(f"  [green]●[/green] {server}")
        else:
            servers = self._get_resolv_conf_servers()
            console.print(Panel(
                f"[bold]Backend:[/bold] /etc/resolv.conf\n"
                f"[bold]Servers:[/bold] {len(servers)} configured",
                title="DNS Status",
                border_style="cyan"
            ))

            if servers:
                console.print("\n[bold]DNS Servers:[/bold]")
                for server in servers:
                    provider = self._identify_provider(server)
                    if provider:
                        console.print(f"  [green]●[/green] {server} ({provider})")
                    else:
                        console.print(f"  [green]●[/green] {server}")

        # Test DNS resolution
        console.print("\n[bold]Resolution Test:[/bold]")
        test_domains = ["google.com", "cloudflare.com"]
        for domain in test_domains:
            result = run_command(["nslookup", domain], timeout=5)
            if result.success and "Address" in result.stdout:
                console.print(f"  [green]✓[/green] {domain}")
            else:
                console.print(f"  [red]✗[/red] {domain}")

        console.print()

    def _identify_provider(self, ip: str) -> str | None:
        """Identify DNS provider from IP address."""
        for provider_id, info in DNS_PROVIDERS.items():
            if ip in info["ipv4"] or ip in info.get("ipv6", []):
                return info["name"]
        return None

    def list_providers(self) -> None:
        """List available DNS providers."""
        console.print()

        table = Table(title="Available DNS Providers", show_header=True, header_style="bold cyan")
        table.add_column("Provider", style="bold")
        table.add_column("Primary")
        table.add_column("Secondary")
        table.add_column("Description")

        for provider_id, info in DNS_PROVIDERS.items():
            table.add_row(
                f"{info['name']} ({provider_id})",
                info["ipv4"][0],
                info["ipv4"][1] if len(info["ipv4"]) > 1 else "-",
                info["description"]
            )

        console.print(table)
        console.print("\n[dim]Usage: cortex-network dns set <provider>[/dim]")
        console.print()

    def set_dns(
        self,
        servers: list[str] | None = None,
        provider: str | None = None,
        interface: str | None = None,
    ) -> bool:
        """Set DNS servers."""
        require_root()

        # Resolve provider to servers
        if provider:
            provider_lower = provider.lower()
            if provider_lower in DNS_PROVIDERS:
                servers = DNS_PROVIDERS[provider_lower]["ipv4"]
                print_info(f"Using {DNS_PROVIDERS[provider_lower]['name']}")
            else:
                print_error(f"Unknown provider: {provider}")
                print_info("Use 'cortex-network dns providers' to list available providers")
                return False

        if not servers:
            print_error("No DNS servers specified")
            return False

        # Validate server addresses
        for server in servers:
            if not self._is_valid_ip(server):
                print_error(f"Invalid IP address: {server}")
                return False

        # Try systemd-resolved first
        resolved_active = run_command(["systemctl", "is-active", "systemd-resolved"])
        if resolved_active.success and resolved_active.stdout == "active":
            return self._set_dns_systemd_resolved(servers, interface)

        # Try NetworkManager
        if self.network_manager == "NetworkManager":
            return self._set_dns_networkmanager(servers, interface)

        # Fallback to direct resolv.conf modification
        return self._set_dns_resolv_conf(servers)

    def _is_valid_ip(self, ip: str) -> bool:
        """Validate IP address format."""
        import re
        # IPv4
        ipv4_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
        # IPv6 (simplified)
        ipv6_pattern = r"^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$"

        if re.match(ipv4_pattern, ip):
            parts = ip.split(".")
            return all(0 <= int(part) <= 255 for part in parts)
        elif re.match(ipv6_pattern, ip) or "::" in ip:
            return True
        return False

    def _set_dns_systemd_resolved(self, servers: list[str], interface: str | None = None) -> bool:
        """Set DNS using systemd-resolved."""
        servers_str = " ".join(servers)

        if interface:
            result = run_command(["resolvectl", "dns", interface, servers_str])
        else:
            # Set globally by modifying resolved.conf
            resolved_conf = Path("/etc/systemd/resolved.conf")

            # Read existing config
            config_content = ""
            if resolved_conf.exists():
                config_content = resolved_conf.read_text()

            # Update DNS line
            lines = config_content.splitlines()
            dns_set = False
            new_lines = []

            for line in lines:
                if line.strip().startswith("DNS=") or line.strip().startswith("#DNS="):
                    new_lines.append(f"DNS={servers_str}")
                    dns_set = True
                else:
                    new_lines.append(line)

            if not dns_set:
                # Find [Resolve] section or add it
                if "[Resolve]" in config_content:
                    for i, line in enumerate(new_lines):
                        if line.strip() == "[Resolve]":
                            new_lines.insert(i + 1, f"DNS={servers_str}")
                            break
                else:
                    new_lines.append("[Resolve]")
                    new_lines.append(f"DNS={servers_str}")

            try:
                resolved_conf.write_text("\n".join(new_lines) + "\n")
                result = run_command(["systemctl", "restart", "systemd-resolved"])
            except Exception as e:
                print_error(f"Failed to update resolved.conf: {e}")
                return False

        if result.success:
            print_success(f"DNS servers set: {', '.join(servers)}")
            return True
        else:
            print_error(f"Failed to set DNS: {result.stderr}")
            return False

    def _set_dns_networkmanager(self, servers: list[str], interface: str | None = None) -> bool:
        """Set DNS using NetworkManager."""
        # Get active connection
        if not interface:
            result = run_command(["nmcli", "-t", "-f", "NAME,DEVICE", "connection", "show", "--active"])
            if result.success:
                for line in result.stdout.splitlines():
                    parts = line.split(":")
                    if len(parts) >= 2 and parts[1]:
                        interface = parts[1]
                        break

        if not interface:
            print_error("No active network connection found")
            return False

        # Get connection name
        conn_result = run_command([
            "nmcli", "-t", "-f", "NAME",
            "connection", "show", "--active"
        ])
        if not conn_result.success:
            print_error("Failed to get connection name")
            return False

        conn_name = conn_result.stdout.split("\n")[0].strip()

        # Set DNS
        dns_str = ",".join(servers)
        result = run_command([
            "nmcli", "connection", "modify", conn_name,
            "ipv4.dns", dns_str,
            "ipv4.ignore-auto-dns", "yes"
        ])

        if result.success:
            # Reactivate connection
            run_command(["nmcli", "connection", "up", conn_name])
            print_success(f"DNS servers set: {', '.join(servers)}")
            return True
        else:
            print_error(f"Failed to set DNS: {result.stderr}")
            return False

    def _set_dns_resolv_conf(self, servers: list[str]) -> bool:
        """Set DNS by directly modifying /etc/resolv.conf."""
        try:
            # Check if resolv.conf is a symlink (managed by systemd)
            if self.resolv_conf.is_symlink():
                print_warning("/etc/resolv.conf is managed by systemd-resolved")
                print_info("Changes may be overwritten")

            # Read existing content for search domains
            search_domains: list[str] = []
            if self.resolv_conf.exists():
                for line in self.resolv_conf.read_text().splitlines():
                    if line.startswith("search "):
                        search_domains = line.split()[1:]
                        break

            # Build new content
            content_lines = []
            content_lines.append("# Generated by cortex-network")

            if search_domains:
                content_lines.append(f"search {' '.join(search_domains)}")

            for server in servers:
                content_lines.append(f"nameserver {server}")

            self.resolv_conf.write_text("\n".join(content_lines) + "\n")
            print_success(f"DNS servers set: {', '.join(servers)}")
            return True

        except Exception as e:
            print_error(f"Failed to modify resolv.conf: {e}")
            return False

    def reset(self) -> bool:
        """Reset DNS to system defaults (DHCP)."""
        require_root()

        # Check if using NetworkManager
        if self.network_manager == "NetworkManager":
            result = run_command(["nmcli", "-t", "-f", "NAME", "connection", "show", "--active"])
            if result.success:
                conn_name = result.stdout.split("\n")[0].strip()
                if conn_name:
                    run_command([
                        "nmcli", "connection", "modify", conn_name,
                        "ipv4.dns", "",
                        "ipv4.ignore-auto-dns", "no"
                    ])
                    run_command(["nmcli", "connection", "up", conn_name])
                    print_success("DNS reset to DHCP defaults")
                    return True

        # Reset systemd-resolved
        resolved_active = run_command(["systemctl", "is-active", "systemd-resolved"])
        if resolved_active.success and resolved_active.stdout == "active":
            resolved_conf = Path("/etc/systemd/resolved.conf")
            if resolved_conf.exists():
                content = resolved_conf.read_text()
                # Comment out DNS line
                new_content = "\n".join(
                    f"#DNS=" if line.strip().startswith("DNS=") else line
                    for line in content.splitlines()
                )
                resolved_conf.write_text(new_content + "\n")
                run_command(["systemctl", "restart", "systemd-resolved"])
                print_success("DNS reset to defaults")
                return True

        print_warning("Could not determine how to reset DNS")
        return False

    def flush_cache(self) -> bool:
        """Flush DNS cache."""
        # systemd-resolved
        result = run_command(["resolvectl", "flush-caches"])
        if result.success:
            print_success("DNS cache flushed (systemd-resolved)")
            return True

        # Try systemd-resolve (older syntax)
        result = run_command(["systemd-resolve", "--flush-caches"])
        if result.success:
            print_success("DNS cache flushed")
            return True

        # Try nscd
        result = run_command(["nscd", "-i", "hosts"])
        if result.success:
            print_success("DNS cache flushed (nscd)")
            return True

        print_warning("No DNS cache service found to flush")
        return False

    def test_resolution(self, domain: str = "google.com") -> None:
        """Test DNS resolution for a domain."""
        console.print(f"\n[bold]Testing DNS resolution for: {domain}[/bold]\n")

        # Get current DNS servers
        servers = self.get_current_dns()
        if servers:
            console.print(f"[dim]Using DNS servers: {', '.join(servers)}[/dim]\n")

        # nslookup
        result = run_command(["nslookup", domain], timeout=10)
        if result.success:
            console.print("[bold]nslookup result:[/bold]")
            for line in result.stdout.splitlines():
                if "Address" in line and "#" not in line:
                    console.print(f"  [green]●[/green] {line.strip()}")
        else:
            console.print(f"[red]nslookup failed: {result.stderr}[/red]")

        # dig (if available)
        dig_result = run_command(["dig", "+short", domain], timeout=10)
        if dig_result.success and dig_result.stdout:
            console.print("\n[bold]dig result:[/bold]")
            for ip in dig_result.stdout.splitlines():
                if ip.strip():
                    console.print(f"  [green]●[/green] {ip.strip()}")

        # Response time
        console.print("\n[bold]Response time:[/bold]")
        time_result = run_command(["dig", "+stats", domain], timeout=10)
        if time_result.success:
            for line in time_result.stdout.splitlines():
                if "Query time:" in line:
                    console.print(f"  {line.strip()}")
                    break

        console.print()
