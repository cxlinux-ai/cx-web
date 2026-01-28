"""WiFi management module."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from rich.table import Table
from rich.panel import Panel

from ..core.system import run_command, require_root, check_root
from ..core.output import (
    console,
    print_error,
    print_success,
    print_warning,
    print_info,
    format_connection_quality,
)


@dataclass
class WiFiNetwork:
    """WiFi network information."""

    ssid: str
    bssid: str
    signal: int
    frequency: str
    channel: int
    security: str
    connected: bool = False


@dataclass
class WiFiInterface:
    """WiFi interface information."""

    name: str
    mac: str
    state: str
    connected_ssid: str | None


class WiFiManager:
    """Manage WiFi connections using nmcli or iw/wpa_supplicant."""

    def __init__(self) -> None:
        self.backend = self._detect_backend()
        self.interface = self._get_wifi_interface()

    def _detect_backend(self) -> str:
        """Detect available WiFi management backend."""
        # Check for NetworkManager
        result = run_command(["which", "nmcli"])
        if result.success:
            nm_active = run_command(["systemctl", "is-active", "NetworkManager"])
            if nm_active.success and nm_active.stdout == "active":
                return "networkmanager"

        # Check for wpa_supplicant
        result = run_command(["which", "wpa_cli"])
        if result.success:
            return "wpa_supplicant"

        # Check for iwd
        result = run_command(["which", "iwctl"])
        if result.success:
            return "iwd"

        return "none"

    def _get_wifi_interface(self) -> str | None:
        """Get the primary WiFi interface name."""
        result = run_command(["iw", "dev"])
        if result.success:
            for line in result.stdout.splitlines():
                if "Interface" in line:
                    parts = line.split()
                    if len(parts) >= 2:
                        return parts[1]

        # Fallback: look for wl* or wlan* interfaces
        result = run_command(["ls", "/sys/class/net"])
        if result.success:
            for iface in result.stdout.split():
                if iface.startswith("wl") or iface.startswith("wlan"):
                    return iface

        return None

    def _parse_nmcli_networks(self, output: str) -> list[WiFiNetwork]:
        """Parse nmcli wifi list output."""
        networks: list[WiFiNetwork] = []
        lines = output.strip().split("\n")

        for line in lines[1:]:  # Skip header
            if not line.strip():
                continue

            # nmcli --terse output is colon-separated
            # IN-USE:BSSID:SSID:MODE:CHAN:RATE:SIGNAL:BARS:SECURITY
            parts = line.split(":")

            if len(parts) >= 8:
                in_use = parts[0] == "*"
                bssid = parts[1]
                ssid = parts[2]
                channel = int(parts[4]) if parts[4].isdigit() else 0
                signal = int(parts[6]) if parts[6].isdigit() else 0
                security = parts[8] if len(parts) > 8 else "Open"

                # Determine frequency band
                freq = "2.4 GHz" if channel <= 14 else "5 GHz"

                networks.append(WiFiNetwork(
                    ssid=ssid,
                    bssid=bssid,
                    signal=signal,
                    frequency=freq,
                    channel=channel,
                    security=security,
                    connected=in_use
                ))

        return networks

    def _parse_iw_scan(self, output: str) -> list[WiFiNetwork]:
        """Parse iw scan output."""
        networks: list[WiFiNetwork] = []
        current: dict[str, Any] = {}

        for line in output.splitlines():
            line = line.strip()

            if line.startswith("BSS "):
                if current.get("bssid"):
                    networks.append(WiFiNetwork(
                        ssid=current.get("ssid", "Hidden"),
                        bssid=current["bssid"],
                        signal=current.get("signal", 0),
                        frequency=current.get("frequency", "Unknown"),
                        channel=current.get("channel", 0),
                        security=current.get("security", "Open"),
                    ))
                # Start new network
                bssid_match = re.search(r"BSS ([0-9a-f:]+)", line, re.I)
                current = {"bssid": bssid_match.group(1) if bssid_match else ""}

            elif line.startswith("SSID:"):
                current["ssid"] = line.split(":", 1)[1].strip()

            elif line.startswith("signal:"):
                # Parse signal like "signal: -65.00 dBm"
                sig_match = re.search(r"-?(\d+)", line)
                if sig_match:
                    dbm = int(sig_match.group(1))
                    # Convert dBm to percentage (rough approximation)
                    current["signal"] = min(100, max(0, 2 * (dbm + 100)))

            elif line.startswith("freq:"):
                freq = int(line.split(":")[1].strip())
                current["frequency"] = "5 GHz" if freq > 3000 else "2.4 GHz"
                # Calculate channel
                if freq < 3000:
                    current["channel"] = (freq - 2407) // 5
                else:
                    current["channel"] = (freq - 5000) // 5

            elif "WPA" in line or "RSN" in line:
                current["security"] = "WPA2" if "RSN" in line else "WPA"
            elif "WEP" in line:
                current["security"] = "WEP"

        # Don't forget last network
        if current.get("bssid"):
            networks.append(WiFiNetwork(
                ssid=current.get("ssid", "Hidden"),
                bssid=current["bssid"],
                signal=current.get("signal", 0),
                frequency=current.get("frequency", "Unknown"),
                channel=current.get("channel", 0),
                security=current.get("security", "Open"),
            ))

        return networks

    def scan(self, rescan: bool = True) -> list[WiFiNetwork]:
        """Scan for available WiFi networks."""
        if self.backend == "networkmanager":
            if rescan:
                run_command(["nmcli", "device", "wifi", "rescan"], timeout=10)

            result = run_command([
                "nmcli", "-t", "-f",
                "IN-USE,BSSID,SSID,MODE,CHAN,RATE,SIGNAL,BARS,SECURITY",
                "device", "wifi", "list"
            ])

            if result.success:
                return self._parse_nmcli_networks(result.stdout)

        elif self.backend in ("wpa_supplicant", "iwd"):
            if not self.interface:
                print_error("No WiFi interface found")
                return []

            if rescan:
                run_command(["iw", self.interface, "scan", "trigger"], timeout=5)
                import time
                time.sleep(2)

            result = run_command(["iw", self.interface, "scan"], timeout=30)
            if result.success:
                return self._parse_iw_scan(result.stdout)

        return []

    def list_networks(self) -> None:
        """Display available WiFi networks."""
        console.print("\n[bold]Scanning for WiFi networks...[/bold]\n")

        networks = self.scan()

        if not networks:
            print_warning("No WiFi networks found")
            return

        # Sort by signal strength
        networks.sort(key=lambda n: n.signal, reverse=True)

        table = Table(title="Available WiFi Networks", show_header=True, header_style="bold cyan")
        table.add_column("", width=2)  # Connected indicator
        table.add_column("SSID", style="bold")
        table.add_column("Signal")
        table.add_column("Channel")
        table.add_column("Frequency")
        table.add_column("Security")

        for network in networks:
            connected = "[green]●[/green]" if network.connected else ""
            signal = format_connection_quality(network.signal)

            table.add_row(
                connected,
                network.ssid or "[dim]Hidden[/dim]",
                signal,
                str(network.channel),
                network.frequency,
                network.security
            )

        console.print(table)
        console.print()

    def connect(self, ssid: str, password: str | None = None) -> bool:
        """Connect to a WiFi network."""
        if self.backend == "networkmanager":
            cmd = ["nmcli", "device", "wifi", "connect", ssid]
            if password:
                cmd.extend(["password", password])

            console.print(f"[bold]Connecting to '{ssid}'...[/bold]")
            result = run_command(cmd, timeout=30)

            if result.success:
                print_success(f"Connected to '{ssid}'")
                return True
            else:
                print_error(f"Failed to connect: {result.stderr}")
                return False

        elif self.backend == "wpa_supplicant":
            if not self.interface:
                print_error("No WiFi interface found")
                return False

            require_root()

            # Generate wpa_supplicant config entry
            if password:
                result = run_command([
                    "wpa_passphrase", ssid, password
                ])
                if not result.success:
                    print_error("Failed to generate network config")
                    return False

                config = result.stdout

                # Append to wpa_supplicant.conf
                conf_path = Path("/etc/wpa_supplicant/wpa_supplicant.conf")
                with open(conf_path, "a") as f:
                    f.write(f"\n{config}\n")

            # Reconfigure wpa_supplicant
            result = run_command(["wpa_cli", "-i", self.interface, "reconfigure"])
            if result.success:
                print_success(f"Network '{ssid}' added")
                return True
            else:
                print_error(f"Failed to apply configuration: {result.stderr}")
                return False

        elif self.backend == "iwd":
            cmd = ["iwctl", "station", self.interface or "wlan0", "connect", ssid]
            if password:
                cmd.extend(["--passphrase", password])

            result = run_command(cmd, timeout=30)
            if result.success:
                print_success(f"Connected to '{ssid}'")
                return True
            else:
                print_error(f"Failed to connect: {result.stderr}")
                return False

        print_error(f"No supported WiFi backend found (detected: {self.backend})")
        return False

    def disconnect(self) -> bool:
        """Disconnect from current WiFi network."""
        if self.backend == "networkmanager":
            if not self.interface:
                print_error("No WiFi interface found")
                return False

            result = run_command(["nmcli", "device", "disconnect", self.interface])
            if result.success:
                print_success("Disconnected from WiFi")
                return True
            else:
                print_error(f"Failed to disconnect: {result.stderr}")
                return False

        elif self.backend == "wpa_supplicant":
            result = run_command(["wpa_cli", "-i", self.interface or "wlan0", "disconnect"])
            if result.success:
                print_success("Disconnected from WiFi")
                return True

        elif self.backend == "iwd":
            result = run_command(["iwctl", "station", self.interface or "wlan0", "disconnect"])
            if result.success:
                print_success("Disconnected from WiFi")
                return True

        print_error("Failed to disconnect")
        return False

    def forget(self, ssid: str) -> bool:
        """Remove a saved WiFi network."""
        if self.backend == "networkmanager":
            result = run_command(["nmcli", "connection", "delete", ssid])
            if result.success:
                print_success(f"Removed network '{ssid}'")
                return True
            else:
                print_error(f"Failed to remove network: {result.stderr}")
                return False

        elif self.backend == "iwd":
            # IWD stores networks in /var/lib/iwd/
            network_file = Path(f"/var/lib/iwd/{ssid}.psk")
            if network_file.exists():
                require_root()
                network_file.unlink()
                print_success(f"Removed network '{ssid}'")
                return True
            else:
                print_error(f"Network '{ssid}' not found in saved networks")
                return False

        print_error("Forget operation not supported with current backend")
        return False

    def list_saved(self) -> None:
        """List saved WiFi networks."""
        if self.backend == "networkmanager":
            result = run_command([
                "nmcli", "-t", "-f", "NAME,TYPE,DEVICE",
                "connection", "show"
            ])

            if not result.success:
                print_error("Failed to list saved networks")
                return

            table = Table(title="Saved WiFi Networks", show_header=True, header_style="bold cyan")
            table.add_column("Network Name", style="bold")
            table.add_column("Status")

            for line in result.stdout.splitlines():
                parts = line.split(":")
                if len(parts) >= 2 and parts[1] == "802-11-wireless":
                    name = parts[0]
                    active = parts[2] if len(parts) > 2 and parts[2] else ""
                    status = "[green]Active[/green]" if active else "[dim]Saved[/dim]"
                    table.add_row(name, status)

            console.print()
            console.print(table)
            console.print()

        elif self.backend == "iwd":
            iwd_dir = Path("/var/lib/iwd")
            if iwd_dir.exists():
                networks = list(iwd_dir.glob("*.psk")) + list(iwd_dir.glob("*.open"))
                if networks:
                    console.print("\n[bold]Saved Networks:[/bold]")
                    for net in networks:
                        console.print(f"  - {net.stem}")
                else:
                    print_info("No saved networks")
            else:
                print_warning("IWD configuration directory not found")

        else:
            print_error("List saved networks not supported with current backend")

    def get_current_connection(self) -> dict[str, Any] | None:
        """Get current WiFi connection details."""
        if self.backend == "networkmanager":
            result = run_command([
                "nmcli", "-t", "-f",
                "GENERAL.CONNECTION,GENERAL.DEVICE,GENERAL.STATE,WIFI.SSID,WIFI.SIGNAL,WIFI.SECURITY",
                "device", "show", self.interface or ""
            ])

            if result.success:
                info: dict[str, Any] = {}
                for line in result.stdout.splitlines():
                    if ":" in line:
                        key, value = line.split(":", 1)
                        key = key.replace("GENERAL.", "").replace("WIFI.", "").lower()
                        info[key] = value
                return info if info.get("ssid") else None

        return None

    def show_status(self) -> None:
        """Display current WiFi status."""
        console.print()

        if not self.interface:
            print_error("No WiFi interface detected")
            return

        conn = self.get_current_connection()

        if conn and conn.get("ssid"):
            signal = int(conn.get("signal", 0))
            console.print(Panel(
                f"[bold]Interface:[/bold] {self.interface}\n"
                f"[bold]Connected to:[/bold] {conn.get('ssid')}\n"
                f"[bold]Signal:[/bold] {format_connection_quality(signal)}\n"
                f"[bold]Security:[/bold] {conn.get('security', 'Unknown')}",
                title="WiFi Status",
                border_style="green"
            ))
        else:
            console.print(Panel(
                f"[bold]Interface:[/bold] {self.interface}\n"
                f"[bold]Status:[/bold] [yellow]Not connected[/yellow]\n"
                f"[bold]Backend:[/bold] {self.backend}",
                title="WiFi Status",
                border_style="yellow"
            ))

        console.print()
