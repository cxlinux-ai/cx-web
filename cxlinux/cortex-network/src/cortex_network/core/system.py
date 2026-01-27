"""System utilities for network management."""

from __future__ import annotations

import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import psutil


@dataclass
class CommandResult:
    """Result of a shell command execution."""

    returncode: int
    stdout: str
    stderr: str

    @property
    def success(self) -> bool:
        return self.returncode == 0


@dataclass
class SystemInfo:
    """System information container."""

    hostname: str
    kernel: str
    distribution: str
    architecture: str
    network_manager: str
    firewall_backend: str


def check_root() -> bool:
    """Check if running as root."""
    return os.geteuid() == 0


def require_root() -> None:
    """Exit if not running as root."""
    if not check_root():
        print("Error: This operation requires root privileges.", file=sys.stderr)
        print("Please run with sudo or as root.", file=sys.stderr)
        sys.exit(1)


def run_command(
    cmd: list[str],
    capture: bool = True,
    check: bool = False,
    timeout: int = 30,
    env: dict[str, str] | None = None,
) -> CommandResult:
    """Execute a shell command and return the result."""
    try:
        process_env = os.environ.copy()
        if env:
            process_env.update(env)

        result = subprocess.run(
            cmd,
            capture_output=capture,
            text=True,
            timeout=timeout,
            env=process_env,
        )
        return CommandResult(
            returncode=result.returncode,
            stdout=result.stdout.strip() if result.stdout else "",
            stderr=result.stderr.strip() if result.stderr else "",
        )
    except subprocess.TimeoutExpired:
        return CommandResult(returncode=-1, stdout="", stderr="Command timed out")
    except FileNotFoundError:
        return CommandResult(returncode=-1, stdout="", stderr=f"Command not found: {cmd[0]}")
    except Exception as e:
        return CommandResult(returncode=-1, stdout="", stderr=str(e))


def get_distribution() -> str:
    """Get Linux distribution name."""
    os_release = Path("/etc/os-release")
    if os_release.exists():
        content = os_release.read_text()
        for line in content.splitlines():
            if line.startswith("PRETTY_NAME="):
                return line.split("=", 1)[1].strip('"')
    return "Unknown"


def get_kernel_version() -> str:
    """Get kernel version."""
    result = run_command(["uname", "-r"])
    return result.stdout if result.success else "Unknown"


def get_architecture() -> str:
    """Get system architecture."""
    result = run_command(["uname", "-m"])
    return result.stdout if result.success else "Unknown"


def get_hostname() -> str:
    """Get system hostname."""
    result = run_command(["hostname"])
    return result.stdout if result.success else "Unknown"


def detect_network_manager() -> str:
    """Detect which network manager is in use."""
    # Check for NetworkManager
    nm_result = run_command(["systemctl", "is-active", "NetworkManager"])
    if nm_result.success and nm_result.stdout == "active":
        return "NetworkManager"

    # Check for systemd-networkd
    networkd_result = run_command(["systemctl", "is-active", "systemd-networkd"])
    if networkd_result.success and networkd_result.stdout == "active":
        return "systemd-networkd"

    # Check for netplan
    if Path("/etc/netplan").exists():
        netplan_files = list(Path("/etc/netplan").glob("*.yaml"))
        if netplan_files:
            return "netplan"

    # Check for traditional networking
    if Path("/etc/network/interfaces").exists():
        return "ifupdown"

    return "unknown"


def detect_firewall_backend() -> str:
    """Detect which firewall backend is available."""
    # Check for ufw
    ufw_result = run_command(["which", "ufw"])
    if ufw_result.success:
        return "ufw"

    # Check for firewalld
    firewalld_result = run_command(["systemctl", "is-active", "firewalld"])
    if firewalld_result.success and firewalld_result.stdout == "active":
        return "firewalld"

    # Check for nftables
    nft_result = run_command(["which", "nft"])
    if nft_result.success:
        return "nftables"

    # Check for iptables
    ipt_result = run_command(["which", "iptables"])
    if ipt_result.success:
        return "iptables"

    return "none"


def get_system_info() -> SystemInfo:
    """Gather comprehensive system information."""
    return SystemInfo(
        hostname=get_hostname(),
        kernel=get_kernel_version(),
        distribution=get_distribution(),
        architecture=get_architecture(),
        network_manager=detect_network_manager(),
        firewall_backend=detect_firewall_backend(),
    )


def get_network_interfaces() -> list[dict[str, Any]]:
    """Get list of network interfaces with details."""
    interfaces = []

    for iface_name, addrs in psutil.net_if_addrs().items():
        if iface_name == "lo":
            continue

        iface_info: dict[str, Any] = {
            "name": iface_name,
            "ipv4": None,
            "ipv6": None,
            "mac": None,
            "type": "unknown",
        }

        # Determine interface type
        if iface_name.startswith("wl") or iface_name.startswith("wlan"):
            iface_info["type"] = "wireless"
        elif iface_name.startswith("en") or iface_name.startswith("eth"):
            iface_info["type"] = "ethernet"
        elif iface_name.startswith("br"):
            iface_info["type"] = "bridge"
        elif iface_name.startswith("docker") or iface_name.startswith("veth"):
            iface_info["type"] = "virtual"
        elif iface_name.startswith("wg") or iface_name.startswith("tun"):
            iface_info["type"] = "vpn"

        for addr in addrs:
            if addr.family.name == "AF_INET":
                iface_info["ipv4"] = addr.address
            elif addr.family.name == "AF_INET6" and not addr.address.startswith("fe80"):
                iface_info["ipv6"] = addr.address
            elif addr.family.name == "AF_PACKET":
                iface_info["mac"] = addr.address

        interfaces.append(iface_info)

    # Add interface stats
    stats = psutil.net_if_stats()
    for iface in interfaces:
        name = iface["name"]
        if name in stats:
            iface["up"] = stats[name].isup
            iface["speed"] = stats[name].speed
            iface["mtu"] = stats[name].mtu
        else:
            iface["up"] = False
            iface["speed"] = 0
            iface["mtu"] = 0

    return interfaces


def service_action(service: str, action: str) -> CommandResult:
    """Perform systemctl action on a service."""
    require_root()
    return run_command(["systemctl", action, service])


def is_service_active(service: str) -> bool:
    """Check if a systemd service is active."""
    result = run_command(["systemctl", "is-active", service])
    return result.success and result.stdout == "active"


def is_service_enabled(service: str) -> bool:
    """Check if a systemd service is enabled."""
    result = run_command(["systemctl", "is-enabled", service])
    return result.success and result.stdout == "enabled"
