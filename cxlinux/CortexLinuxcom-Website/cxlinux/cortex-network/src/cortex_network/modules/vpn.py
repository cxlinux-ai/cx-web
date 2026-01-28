"""VPN management module supporting WireGuard and OpenVPN."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from rich.table import Table
from rich.panel import Panel

from ..core.system import run_command, require_root, is_service_active
from ..core.output import (
    console,
    print_error,
    print_success,
    print_warning,
    print_info,
    format_bytes,
)


@dataclass
class WireGuardConfig:
    """WireGuard configuration."""

    name: str
    private_key: str
    address: str
    dns: str | None = None
    peers: list[dict[str, str]] = field(default_factory=list)


@dataclass
class VPNConnection:
    """VPN connection information."""

    name: str
    type: str  # wireguard, openvpn
    status: str  # active, inactive
    interface: str | None = None
    endpoint: str | None = None
    rx_bytes: int = 0
    tx_bytes: int = 0


class VPNManager:
    """Manage VPN connections using WireGuard and OpenVPN."""

    def __init__(self) -> None:
        self.wireguard_dir = Path("/etc/wireguard")
        self.openvpn_dir = Path("/etc/openvpn")

    def _has_wireguard(self) -> bool:
        """Check if WireGuard is available."""
        return run_command(["which", "wg"]).success

    def _has_openvpn(self) -> bool:
        """Check if OpenVPN is available."""
        return run_command(["which", "openvpn"]).success

    def _get_wireguard_interfaces(self) -> list[str]:
        """Get list of WireGuard interfaces."""
        result = run_command(["wg", "show", "interfaces"])
        if result.success and result.stdout:
            return result.stdout.split()
        return []

    def _parse_wg_show(self, output: str) -> dict[str, Any]:
        """Parse wg show output."""
        info: dict[str, Any] = {
            "interface": None,
            "public_key": None,
            "listening_port": None,
            "peers": []
        }

        current_section = "interface"
        current_peer: dict[str, str] = {}

        for line in output.splitlines():
            line = line.strip()
            if not line:
                continue

            if line.startswith("interface:"):
                info["interface"] = line.split(":", 1)[1].strip()
            elif line.startswith("public key:"):
                if current_section == "interface":
                    info["public_key"] = line.split(":", 1)[1].strip()
                else:
                    current_peer["public_key"] = line.split(":", 1)[1].strip()
            elif line.startswith("listening port:"):
                info["listening_port"] = line.split(":", 1)[1].strip()
            elif line.startswith("peer:"):
                if current_peer:
                    info["peers"].append(current_peer)
                current_section = "peer"
                current_peer = {"public_key": line.split(":", 1)[1].strip()}
            elif line.startswith("endpoint:"):
                current_peer["endpoint"] = line.split(":", 1)[1].strip()
            elif line.startswith("allowed ips:"):
                current_peer["allowed_ips"] = line.split(":", 1)[1].strip()
            elif line.startswith("latest handshake:"):
                current_peer["latest_handshake"] = line.split(":", 1)[1].strip()
            elif line.startswith("transfer:"):
                transfer = line.split(":", 1)[1].strip()
                current_peer["transfer"] = transfer

        if current_peer:
            info["peers"].append(current_peer)

        return info

    def list_connections(self) -> list[VPNConnection]:
        """List all VPN connections."""
        connections: list[VPNConnection] = []

        # WireGuard connections
        if self._has_wireguard():
            # Active interfaces
            active_interfaces = self._get_wireguard_interfaces()

            # Config files
            if self.wireguard_dir.exists():
                for conf_file in self.wireguard_dir.glob("*.conf"):
                    name = conf_file.stem
                    is_active = name in active_interfaces

                    conn = VPNConnection(
                        name=name,
                        type="wireguard",
                        status="active" if is_active else "inactive",
                        interface=name if is_active else None,
                    )

                    # Get transfer stats if active
                    if is_active:
                        result = run_command(["wg", "show", name, "transfer"])
                        if result.success and result.stdout:
                            parts = result.stdout.split()
                            if len(parts) >= 3:
                                try:
                                    conn.rx_bytes = int(parts[1])
                                    conn.tx_bytes = int(parts[2])
                                except ValueError:
                                    pass

                    connections.append(conn)

        # OpenVPN connections
        if self._has_openvpn() and self.openvpn_dir.exists():
            for conf_file in self.openvpn_dir.glob("*.conf"):
                name = conf_file.stem
                service_name = f"openvpn@{name}"
                is_active = is_service_active(service_name)

                connections.append(VPNConnection(
                    name=name,
                    type="openvpn",
                    status="active" if is_active else "inactive",
                ))

            # Also check client configs
            client_dir = self.openvpn_dir / "client"
            if client_dir.exists():
                for conf_file in client_dir.glob("*.conf"):
                    name = conf_file.stem
                    service_name = f"openvpn-client@{name}"
                    is_active = is_service_active(service_name)

                    connections.append(VPNConnection(
                        name=name,
                        type="openvpn",
                        status="active" if is_active else "inactive",
                    ))

        return connections

    def show_status(self) -> None:
        """Display VPN status."""
        console.print()

        connections = self.list_connections()

        if not connections:
            print_info("No VPN connections configured")
            console.print("\nSupported VPN types:")
            if self._has_wireguard():
                console.print("  [green]●[/green] WireGuard")
            else:
                console.print("  [dim]○[/dim] WireGuard (not installed)")
            if self._has_openvpn():
                console.print("  [green]●[/green] OpenVPN")
            else:
                console.print("  [dim]○[/dim] OpenVPN (not installed)")
            console.print()
            return

        table = Table(title="VPN Connections", show_header=True, header_style="bold cyan")
        table.add_column("Name", style="bold")
        table.add_column("Type")
        table.add_column("Status")
        table.add_column("Traffic")

        for conn in connections:
            status = "[green]Active[/green]" if conn.status == "active" else "[dim]Inactive[/dim]"

            if conn.rx_bytes or conn.tx_bytes:
                traffic = f"↓{format_bytes(conn.rx_bytes)} ↑{format_bytes(conn.tx_bytes)}"
            else:
                traffic = "[dim]--[/dim]"

            table.add_row(
                conn.name,
                conn.type.upper(),
                status,
                traffic
            )

        console.print(table)

        # Show detailed info for active WireGuard connections
        active_wg = [c for c in connections if c.type == "wireguard" and c.status == "active"]
        for conn in active_wg:
            result = run_command(["wg", "show", conn.name])
            if result.success:
                info = self._parse_wg_show(result.stdout)
                if info["peers"]:
                    console.print(f"\n[bold]{conn.name} Details:[/bold]")
                    for peer in info["peers"]:
                        endpoint = peer.get("endpoint", "N/A")
                        handshake = peer.get("latest_handshake", "never")
                        console.print(f"  Endpoint: {endpoint}")
                        console.print(f"  Last handshake: {handshake}")

        console.print()

    def add_wireguard(
        self,
        name: str,
        config_content: str | None = None,
        config_file: Path | None = None,
    ) -> bool:
        """Add a WireGuard VPN configuration."""
        require_root()

        if not self._has_wireguard():
            print_error("WireGuard is not installed")
            print_info("Install with: sudo apt install wireguard")
            return False

        self.wireguard_dir.mkdir(parents=True, exist_ok=True)
        target_path = self.wireguard_dir / f"{name}.conf"

        if target_path.exists():
            print_error(f"Configuration '{name}' already exists")
            return False

        try:
            if config_file:
                # Copy from file
                if not config_file.exists():
                    print_error(f"Config file not found: {config_file}")
                    return False
                config_content = config_file.read_text()

            if not config_content:
                print_error("No configuration provided")
                return False

            # Validate config has required sections
            if "[Interface]" not in config_content:
                print_error("Invalid WireGuard config: missing [Interface] section")
                return False

            # Write config
            target_path.write_text(config_content)
            target_path.chmod(0o600)

            print_success(f"WireGuard configuration '{name}' added")
            print_info(f"Start with: cortex-network vpn connect {name}")
            return True

        except Exception as e:
            print_error(f"Failed to add configuration: {e}")
            return False

    def add_openvpn(
        self,
        name: str,
        config_file: Path,
    ) -> bool:
        """Add an OpenVPN configuration."""
        require_root()

        if not self._has_openvpn():
            print_error("OpenVPN is not installed")
            print_info("Install with: sudo apt install openvpn")
            return False

        client_dir = self.openvpn_dir / "client"
        client_dir.mkdir(parents=True, exist_ok=True)
        target_path = client_dir / f"{name}.conf"

        if target_path.exists():
            print_error(f"Configuration '{name}' already exists")
            return False

        try:
            if not config_file.exists():
                print_error(f"Config file not found: {config_file}")
                return False

            # Copy config
            import shutil
            shutil.copy2(config_file, target_path)
            target_path.chmod(0o600)

            print_success(f"OpenVPN configuration '{name}' added")
            print_info(f"Start with: cortex-network vpn connect {name}")
            return True

        except Exception as e:
            print_error(f"Failed to add configuration: {e}")
            return False

    def remove(self, name: str) -> bool:
        """Remove a VPN configuration."""
        require_root()

        # Check WireGuard
        wg_path = self.wireguard_dir / f"{name}.conf"
        if wg_path.exists():
            # Disconnect first if active
            if name in self._get_wireguard_interfaces():
                self.disconnect(name)

            wg_path.unlink()
            print_success(f"Removed WireGuard configuration '{name}'")
            return True

        # Check OpenVPN
        ovpn_path = self.openvpn_dir / "client" / f"{name}.conf"
        if ovpn_path.exists():
            # Stop service if running
            run_command(["systemctl", "stop", f"openvpn-client@{name}"])

            ovpn_path.unlink()
            print_success(f"Removed OpenVPN configuration '{name}'")
            return True

        print_error(f"VPN configuration '{name}' not found")
        return False

    def connect(self, name: str) -> bool:
        """Connect to a VPN."""
        require_root()

        # Check WireGuard
        wg_path = self.wireguard_dir / f"{name}.conf"
        if wg_path.exists():
            if name in self._get_wireguard_interfaces():
                print_warning(f"WireGuard '{name}' is already active")
                return True

            result = run_command(["wg-quick", "up", name])
            if result.success:
                print_success(f"Connected to WireGuard VPN '{name}'")
                return True
            else:
                print_error(f"Failed to connect: {result.stderr}")
                return False

        # Check OpenVPN
        ovpn_path = self.openvpn_dir / "client" / f"{name}.conf"
        if ovpn_path.exists():
            service_name = f"openvpn-client@{name}"
            result = run_command(["systemctl", "start", service_name])
            if result.success:
                print_success(f"Connected to OpenVPN '{name}'")
                return True
            else:
                print_error(f"Failed to connect: {result.stderr}")
                return False

        print_error(f"VPN configuration '{name}' not found")
        return False

    def disconnect(self, name: str) -> bool:
        """Disconnect from a VPN."""
        require_root()

        # Check WireGuard
        wg_path = self.wireguard_dir / f"{name}.conf"
        if wg_path.exists():
            if name not in self._get_wireguard_interfaces():
                print_warning(f"WireGuard '{name}' is not active")
                return True

            result = run_command(["wg-quick", "down", name])
            if result.success:
                print_success(f"Disconnected from WireGuard VPN '{name}'")
                return True
            else:
                print_error(f"Failed to disconnect: {result.stderr}")
                return False

        # Check OpenVPN
        ovpn_path = self.openvpn_dir / "client" / f"{name}.conf"
        if ovpn_path.exists():
            service_name = f"openvpn-client@{name}"
            result = run_command(["systemctl", "stop", service_name])
            if result.success:
                print_success(f"Disconnected from OpenVPN '{name}'")
                return True
            else:
                print_error(f"Failed to disconnect: {result.stderr}")
                return False

        print_error(f"VPN configuration '{name}' not found")
        return False

    def generate_wireguard_keys(self) -> tuple[str, str]:
        """Generate WireGuard private and public keys."""
        priv_result = run_command(["wg", "genkey"])
        if not priv_result.success:
            raise RuntimeError("Failed to generate private key")

        private_key = priv_result.stdout.strip()

        # Generate public key from private
        pub_result = run_command(["bash", "-c", f"echo '{private_key}' | wg pubkey"])
        if not pub_result.success:
            raise RuntimeError("Failed to generate public key")

        public_key = pub_result.stdout.strip()

        return private_key, public_key

    def create_wireguard_config(
        self,
        name: str,
        address: str,
        peer_public_key: str,
        peer_endpoint: str,
        peer_allowed_ips: str = "0.0.0.0/0, ::/0",
        dns: str | None = "1.1.1.1",
    ) -> bool:
        """Create a new WireGuard configuration interactively."""
        require_root()

        if not self._has_wireguard():
            print_error("WireGuard is not installed")
            return False

        try:
            private_key, public_key = self.generate_wireguard_keys()

            config = f"""[Interface]
PrivateKey = {private_key}
Address = {address}
"""
            if dns:
                config += f"DNS = {dns}\n"

            config += f"""
[Peer]
PublicKey = {peer_public_key}
Endpoint = {peer_endpoint}
AllowedIPs = {peer_allowed_ips}
PersistentKeepalive = 25
"""

            result = self.add_wireguard(name, config_content=config)

            if result:
                console.print(f"\n[bold]Your public key:[/bold] {public_key}")
                console.print("Share this with your VPN peer/server.")

            return result

        except Exception as e:
            print_error(f"Failed to create configuration: {e}")
            return False
