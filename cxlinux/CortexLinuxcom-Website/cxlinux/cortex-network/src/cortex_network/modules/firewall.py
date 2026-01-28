"""Firewall management module supporting ufw and nftables."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from rich.table import Table
from rich.panel import Panel

from ..core.system import run_command, require_root, check_root, detect_firewall_backend
from ..core.output import (
    console,
    print_error,
    print_success,
    print_warning,
    print_info,
    format_status_indicator,
)


@dataclass
class FirewallRule:
    """Firewall rule representation."""

    number: int
    action: str
    direction: str
    protocol: str
    port: str
    source: str
    destination: str


class FirewallManager:
    """Manage firewall rules using ufw or nftables."""

    def __init__(self) -> None:
        self.backend = detect_firewall_backend()

    def _parse_ufw_status(self, output: str) -> tuple[bool, list[FirewallRule]]:
        """Parse ufw status output."""
        active = "Status: active" in output
        rules: list[FirewallRule] = []

        if not active:
            return False, rules

        rule_num = 0
        for line in output.splitlines():
            # Skip headers and status line
            if not line or line.startswith("Status:") or line.startswith("To") or line.startswith("--"):
                continue

            # Parse rule lines like:
            # 22/tcp                     ALLOW       Anywhere
            # 80,443/tcp                 ALLOW       Anywhere
            parts = re.split(r"\s{2,}", line.strip())
            if len(parts) >= 3:
                rule_num += 1
                port_proto = parts[0]
                action = parts[1]
                source = parts[2] if len(parts) > 2 else "Anywhere"

                # Parse port and protocol
                if "/" in port_proto:
                    port, proto = port_proto.rsplit("/", 1)
                else:
                    port = port_proto
                    proto = "any"

                # Determine direction
                direction = "IN" if "(v6)" not in line else "IN (IPv6)"

                rules.append(FirewallRule(
                    number=rule_num,
                    action=action,
                    direction=direction,
                    protocol=proto,
                    port=port,
                    source=source,
                    destination="*"
                ))

        return active, rules

    def _parse_nft_rules(self, output: str) -> list[FirewallRule]:
        """Parse nftables rule output."""
        rules: list[FirewallRule] = []
        rule_num = 0

        for line in output.splitlines():
            line = line.strip()
            if not line or line.startswith("table") or line.startswith("chain"):
                continue

            if "accept" in line.lower() or "drop" in line.lower() or "reject" in line.lower():
                rule_num += 1

                # Determine action
                if "accept" in line.lower():
                    action = "ACCEPT"
                elif "drop" in line.lower():
                    action = "DROP"
                else:
                    action = "REJECT"

                # Extract port if present
                port_match = re.search(r"dport\s+(\d+)", line)
                port = port_match.group(1) if port_match else "*"

                # Extract protocol
                if "tcp" in line.lower():
                    proto = "tcp"
                elif "udp" in line.lower():
                    proto = "udp"
                else:
                    proto = "any"

                rules.append(FirewallRule(
                    number=rule_num,
                    action=action,
                    direction="IN",
                    protocol=proto,
                    port=port,
                    source="*",
                    destination="*"
                ))

        return rules

    def is_active(self) -> bool:
        """Check if firewall is active."""
        if self.backend == "ufw":
            result = run_command(["ufw", "status"])
            return result.success and "Status: active" in result.stdout

        elif self.backend == "nftables":
            result = run_command(["nft", "list", "ruleset"])
            return result.success and len(result.stdout.strip()) > 0

        elif self.backend == "iptables":
            result = run_command(["iptables", "-L", "-n"])
            if result.success:
                # Check if there are any rules beyond default
                return "ACCEPT" in result.stdout or "DROP" in result.stdout

        elif self.backend == "firewalld":
            result = run_command(["firewall-cmd", "--state"])
            return result.success and "running" in result.stdout

        return False

    def enable(self) -> bool:
        """Enable the firewall."""
        require_root()

        if self.backend == "ufw":
            # Enable ufw with default deny incoming
            run_command(["ufw", "default", "deny", "incoming"])
            run_command(["ufw", "default", "allow", "outgoing"])
            result = run_command(["ufw", "--force", "enable"])

            if result.success:
                print_success("Firewall enabled (ufw)")
                print_info("Default policy: deny incoming, allow outgoing")
                return True
            else:
                print_error(f"Failed to enable firewall: {result.stderr}")
                return False

        elif self.backend == "nftables":
            # Create basic nftables ruleset
            nft_rules = """
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;
        ct state established,related accept
        iif lo accept
        ip protocol icmp accept
        ip6 nexthdr icmpv6 accept
    }

    chain forward {
        type filter hook forward priority 0; policy drop;
    }

    chain output {
        type filter hook output priority 0; policy accept;
    }
}
"""
            nft_path = Path("/etc/nftables.conf")
            try:
                with open(nft_path, "w") as f:
                    f.write(nft_rules)
                result = run_command(["nft", "-f", str(nft_path)])
                if result.success:
                    run_command(["systemctl", "enable", "nftables"])
                    run_command(["systemctl", "start", "nftables"])
                    print_success("Firewall enabled (nftables)")
                    return True
            except Exception as e:
                print_error(f"Failed to enable firewall: {e}")

        elif self.backend == "firewalld":
            result = run_command(["systemctl", "start", "firewalld"])
            if result.success:
                run_command(["systemctl", "enable", "firewalld"])
                print_success("Firewall enabled (firewalld)")
                return True

        print_error(f"Firewall backend '{self.backend}' not supported for enable operation")
        return False

    def disable(self) -> bool:
        """Disable the firewall."""
        require_root()

        if self.backend == "ufw":
            result = run_command(["ufw", "disable"])
            if result.success:
                print_success("Firewall disabled")
                return True
            else:
                print_error(f"Failed to disable firewall: {result.stderr}")
                return False

        elif self.backend == "nftables":
            result = run_command(["nft", "flush", "ruleset"])
            if result.success:
                run_command(["systemctl", "stop", "nftables"])
                print_success("Firewall disabled (nftables)")
                return True

        elif self.backend == "firewalld":
            result = run_command(["systemctl", "stop", "firewalld"])
            if result.success:
                print_success("Firewall disabled")
                return True

        print_error("Failed to disable firewall")
        return False

    def allow(
        self,
        port: int | str,
        protocol: str = "tcp",
        source: str | None = None,
        comment: str | None = None,
    ) -> bool:
        """Allow incoming traffic on a port."""
        require_root()

        port_str = str(port)

        if self.backend == "ufw":
            cmd = ["ufw", "allow"]

            if source:
                cmd.extend(["from", source, "to", "any"])

            cmd.append(f"{port_str}/{protocol}")

            if comment:
                cmd.extend(["comment", comment])

            result = run_command(cmd)
            if result.success:
                print_success(f"Allowed {protocol.upper()} port {port_str}")
                return True
            else:
                print_error(f"Failed to add rule: {result.stderr}")
                return False

        elif self.backend == "nftables":
            chain = "input"
            rule = f"tcp dport {port_str} accept" if protocol == "tcp" else f"udp dport {port_str} accept"

            if source:
                rule = f"ip saddr {source} {rule}"

            result = run_command(["nft", "add", "rule", "inet", "filter", chain, rule])
            if result.success:
                print_success(f"Allowed {protocol.upper()} port {port_str}")
                return True
            else:
                print_error(f"Failed to add rule: {result.stderr}")
                return False

        elif self.backend == "firewalld":
            result = run_command(["firewall-cmd", "--permanent", f"--add-port={port_str}/{protocol}"])
            if result.success:
                run_command(["firewall-cmd", "--reload"])
                print_success(f"Allowed {protocol.upper()} port {port_str}")
                return True

        elif self.backend == "iptables":
            cmd = ["iptables", "-A", "INPUT", "-p", protocol, "--dport", port_str, "-j", "ACCEPT"]
            if source:
                cmd.extend(["-s", source])
            result = run_command(cmd)
            if result.success:
                print_success(f"Allowed {protocol.upper()} port {port_str}")
                return True

        print_error(f"Backend '{self.backend}' not fully supported")
        return False

    def deny(
        self,
        port: int | str,
        protocol: str = "tcp",
        source: str | None = None,
    ) -> bool:
        """Deny/block incoming traffic on a port."""
        require_root()

        port_str = str(port)

        if self.backend == "ufw":
            cmd = ["ufw", "deny"]

            if source:
                cmd.extend(["from", source, "to", "any"])

            cmd.append(f"{port_str}/{protocol}")

            result = run_command(cmd)
            if result.success:
                print_success(f"Blocked {protocol.upper()} port {port_str}")
                return True
            else:
                print_error(f"Failed to add rule: {result.stderr}")
                return False

        elif self.backend == "nftables":
            rule = f"tcp dport {port_str} drop" if protocol == "tcp" else f"udp dport {port_str} drop"

            if source:
                rule = f"ip saddr {source} {rule}"

            result = run_command(["nft", "add", "rule", "inet", "filter", "input", rule])
            if result.success:
                print_success(f"Blocked {protocol.upper()} port {port_str}")
                return True

        elif self.backend == "iptables":
            cmd = ["iptables", "-A", "INPUT", "-p", protocol, "--dport", port_str, "-j", "DROP"]
            if source:
                cmd.extend(["-s", source])
            result = run_command(cmd)
            if result.success:
                print_success(f"Blocked {protocol.upper()} port {port_str}")
                return True

        print_error("Failed to add deny rule")
        return False

    def delete_rule(self, rule_number: int) -> bool:
        """Delete a firewall rule by number."""
        require_root()

        if self.backend == "ufw":
            result = run_command(["ufw", "--force", "delete", str(rule_number)])
            if result.success:
                print_success(f"Deleted rule #{rule_number}")
                return True
            else:
                print_error(f"Failed to delete rule: {result.stderr}")
                return False

        print_error("Delete by rule number only supported for ufw")
        return False

    def allow_service(self, service: str) -> bool:
        """Allow a predefined service (ssh, http, https, etc.)."""
        require_root()

        # Service to port mapping
        service_ports = {
            "ssh": ("22", "tcp"),
            "http": ("80", "tcp"),
            "https": ("443", "tcp"),
            "dns": ("53", "tcp/udp"),
            "ftp": ("21", "tcp"),
            "smtp": ("25", "tcp"),
            "mysql": ("3306", "tcp"),
            "postgresql": ("5432", "tcp"),
            "redis": ("6379", "tcp"),
            "mongodb": ("27017", "tcp"),
        }

        service_lower = service.lower()

        if self.backend == "ufw":
            # ufw has built-in service definitions
            result = run_command(["ufw", "allow", service_lower])
            if result.success:
                print_success(f"Allowed service '{service}'")
                return True

            # Fallback to port mapping
            if service_lower in service_ports:
                port, proto = service_ports[service_lower]
                return self.allow(port, proto)

        elif self.backend == "firewalld":
            result = run_command(["firewall-cmd", "--permanent", f"--add-service={service_lower}"])
            if result.success:
                run_command(["firewall-cmd", "--reload"])
                print_success(f"Allowed service '{service}'")
                return True

        # Generic fallback using port mapping
        if service_lower in service_ports:
            port, proto = service_ports[service_lower]
            if "/" in proto:
                # Handle tcp/udp
                self.allow(port, "tcp")
                return self.allow(port, "udp")
            return self.allow(port, proto)

        print_error(f"Unknown service: {service}")
        return False

    def list_rules(self) -> None:
        """Display current firewall rules."""
        console.print()

        if self.backend == "ufw":
            result = run_command(["ufw", "status", "numbered"])

            if not result.success:
                print_error("Failed to get firewall status")
                return

            active, rules = self._parse_ufw_status(result.stdout)

            status = "[green]Active[/green]" if active else "[red]Inactive[/red]"
            console.print(Panel(
                f"[bold]Backend:[/bold] UFW (Uncomplicated Firewall)\n"
                f"[bold]Status:[/bold] {status}",
                title="Firewall Status",
                border_style="cyan"
            ))

            if active and rules:
                table = Table(title="Firewall Rules", show_header=True, header_style="bold cyan")
                table.add_column("#", style="dim")
                table.add_column("Action")
                table.add_column("Port/Proto")
                table.add_column("Source")

                for rule in rules:
                    action_color = "green" if rule.action == "ALLOW" else "red"
                    table.add_row(
                        str(rule.number),
                        f"[{action_color}]{rule.action}[/{action_color}]",
                        f"{rule.port}/{rule.protocol}",
                        rule.source
                    )

                console.print(table)
            elif active:
                print_info("No rules configured (default policy active)")

        elif self.backend == "nftables":
            result = run_command(["nft", "list", "ruleset"])

            if result.success:
                active = len(result.stdout.strip()) > 0
                status = "[green]Active[/green]" if active else "[red]Inactive[/red]"

                console.print(Panel(
                    f"[bold]Backend:[/bold] nftables\n"
                    f"[bold]Status:[/bold] {status}",
                    title="Firewall Status",
                    border_style="cyan"
                ))

                if active:
                    console.print("\n[bold]Current Ruleset:[/bold]")
                    console.print(result.stdout)

        elif self.backend == "firewalld":
            state_result = run_command(["firewall-cmd", "--state"])
            active = state_result.success and "running" in state_result.stdout

            status = "[green]Active[/green]" if active else "[red]Inactive[/red]"
            console.print(Panel(
                f"[bold]Backend:[/bold] firewalld\n"
                f"[bold]Status:[/bold] {status}",
                title="Firewall Status",
                border_style="cyan"
            ))

            if active:
                # List services
                services_result = run_command(["firewall-cmd", "--list-services"])
                if services_result.success:
                    console.print(f"\n[bold]Allowed Services:[/bold] {services_result.stdout}")

                # List ports
                ports_result = run_command(["firewall-cmd", "--list-ports"])
                if ports_result.success and ports_result.stdout:
                    console.print(f"[bold]Allowed Ports:[/bold] {ports_result.stdout}")

        elif self.backend == "iptables":
            result = run_command(["iptables", "-L", "-n", "--line-numbers"])

            console.print(Panel(
                f"[bold]Backend:[/bold] iptables\n"
                f"[bold]Status:[/bold] [yellow]Legacy[/yellow]",
                title="Firewall Status",
                border_style="cyan"
            ))

            if result.success:
                console.print("\n[bold]Current Rules:[/bold]")
                console.print(result.stdout)

        else:
            print_warning(f"No supported firewall backend detected (found: {self.backend})")
            print_info("Install ufw: sudo apt install ufw")

        console.print()

    def reset(self) -> bool:
        """Reset firewall to default state."""
        require_root()

        if self.backend == "ufw":
            result = run_command(["ufw", "--force", "reset"])
            if result.success:
                print_success("Firewall reset to defaults")
                return True

        elif self.backend == "nftables":
            result = run_command(["nft", "flush", "ruleset"])
            if result.success:
                print_success("Firewall rules cleared")
                return True

        elif self.backend == "iptables":
            run_command(["iptables", "-F"])
            run_command(["iptables", "-X"])
            run_command(["iptables", "-P", "INPUT", "ACCEPT"])
            run_command(["iptables", "-P", "FORWARD", "ACCEPT"])
            run_command(["iptables", "-P", "OUTPUT", "ACCEPT"])
            print_success("Firewall rules cleared")
            return True

        print_error("Reset operation failed")
        return False
