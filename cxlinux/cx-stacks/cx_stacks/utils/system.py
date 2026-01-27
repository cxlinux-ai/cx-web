"""System utilities."""

import os
import shutil
import socket
import subprocess
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

import httpx


@dataclass
class CommandResult:
    """Result of a shell command."""

    returncode: int
    stdout: str
    stderr: str

    @property
    def success(self) -> bool:
        return self.returncode == 0


def run_command(
    cmd: list[str],
    check: bool = False,
    capture: bool = True,
    cwd: Optional[Path] = None,
    env: Optional[dict[str, str]] = None,
) -> CommandResult:
    """Run a shell command and return result."""
    merged_env = {**os.environ, **(env or {})}

    result = subprocess.run(
        cmd,
        capture_output=capture,
        text=True,
        cwd=cwd,
        env=merged_env,
    )

    cmd_result = CommandResult(
        returncode=result.returncode,
        stdout=result.stdout if capture else "",
        stderr=result.stderr if capture else "",
    )

    if check and not cmd_result.success:
        raise subprocess.CalledProcessError(
            result.returncode, cmd, result.stdout, result.stderr
        )

    return cmd_result


def is_root() -> bool:
    """Check if running as root."""
    return os.geteuid() == 0


@dataclass
class DistroInfo:
    """Linux distribution information."""

    id: str  # ubuntu, debian, fedora, arch
    version: str
    codename: str
    family: str  # debian, rhel, arch


def detect_distro() -> DistroInfo:
    """Detect Linux distribution."""
    os_release = Path("/etc/os-release")

    if not os_release.exists():
        return DistroInfo(id="unknown", version="", codename="", family="unknown")

    info = {}
    for line in os_release.read_text().splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            info[key] = value.strip('"')

    distro_id = info.get("ID", "unknown")
    version = info.get("VERSION_ID", "")
    codename = info.get("VERSION_CODENAME", "")

    # Determine family
    id_like = info.get("ID_LIKE", "")
    if distro_id in ("ubuntu", "debian") or "debian" in id_like:
        family = "debian"
    elif distro_id in ("fedora", "rhel", "centos", "rocky", "alma") or "rhel" in id_like:
        family = "rhel"
    elif distro_id == "arch" or "arch" in id_like:
        family = "arch"
    else:
        family = "unknown"

    return DistroInfo(id=distro_id, version=version, codename=codename, family=family)


def detect_init_system() -> str:
    """Detect init system (systemd, openrc, etc)."""
    if Path("/run/systemd/system").exists():
        return "systemd"
    if Path("/sbin/openrc").exists():
        return "openrc"
    if Path("/sbin/init").exists():
        result = run_command(["/sbin/init", "--version"])
        if "upstart" in result.stdout.lower():
            return "upstart"
    return "sysvinit"


def service_exists(name: str) -> bool:
    """Check if a systemd service exists."""
    result = run_command(["systemctl", "cat", name])
    return result.success


def service_is_running(name: str) -> bool:
    """Check if a systemd service is active."""
    result = run_command(["systemctl", "is-active", name])
    return result.stdout.strip() == "active"


def port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Check if a port is in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(1)
        try:
            sock.connect((host, port))
            return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            return False


def get_public_ip() -> Optional[str]:
    """Get public IP address."""
    services = [
        "https://api.ipify.org",
        "https://ifconfig.me/ip",
        "https://icanhazip.com",
    ]

    for url in services:
        try:
            response = httpx.get(url, timeout=5.0)
            if response.status_code == 200:
                return response.text.strip()
        except httpx.RequestError:
            continue

    return None


def backup_file(path: Path, backup_dir: Path) -> Optional[Path]:
    """Backup a file before modification."""
    if not path.exists():
        return None

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{path.name}.{timestamp}.bak"
    backup_path = backup_dir / backup_name

    backup_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, backup_path)

    return backup_path


def restore_file(backup_path: Path, original_path: Path) -> bool:
    """Restore a file from backup."""
    if not backup_path.exists():
        return False

    shutil.copy2(backup_path, original_path)
    return True


def ensure_directory(path: Path, owner: Optional[str] = None, mode: int = 0o755) -> None:
    """Ensure directory exists with correct permissions."""
    path.mkdir(parents=True, exist_ok=True)
    path.chmod(mode)

    if owner and is_root():
        run_command(["chown", "-R", owner, str(path)])


def get_available_memory_mb() -> int:
    """Get available system memory in MB."""
    try:
        with open("/proc/meminfo") as f:
            for line in f:
                if line.startswith("MemAvailable:"):
                    kb = int(line.split()[1])
                    return kb // 1024
    except (FileNotFoundError, ValueError):
        pass
    return 0


def get_cpu_count() -> int:
    """Get CPU core count."""
    return os.cpu_count() or 1
