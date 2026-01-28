"""System utility functions for Cortex Ops."""

import asyncio
import os
import platform
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path


@dataclass
class CommandResult:
    """Result of a command execution."""

    returncode: int
    stdout: str
    stderr: str

    @property
    def success(self) -> bool:
        return self.returncode == 0


@dataclass
class CPUInfo:
    """CPU information."""

    model: str
    cores: int
    threads: int
    frequency_mhz: float | None
    load_percent: float


@dataclass
class MemoryInfo:
    """Memory information."""

    total_bytes: int
    available_bytes: int
    used_bytes: int
    percent_used: float


@dataclass
class DiskInfo:
    """Disk information."""

    path: str
    total_bytes: int
    used_bytes: int
    free_bytes: int
    percent_used: float


@dataclass
class OSInfo:
    """Operating system information."""

    name: str
    version: str
    kernel: str
    architecture: str
    hostname: str


@dataclass
class ServiceStatus:
    """Systemd service status."""

    name: str
    active: bool
    running: bool
    enabled: bool
    description: str


def run_command(
    cmd: list[str],
    timeout: int = 30,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
) -> CommandResult:
    """Execute a command synchronously."""
    full_env = os.environ.copy()
    if env:
        full_env.update(env)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd,
            env=full_env,
        )
        return CommandResult(
            returncode=result.returncode,
            stdout=result.stdout,
            stderr=result.stderr,
        )
    except subprocess.TimeoutExpired:
        return CommandResult(returncode=-1, stdout="", stderr="Command timed out")
    except FileNotFoundError:
        return CommandResult(returncode=-1, stdout="", stderr=f"Command not found: {cmd[0]}")


async def run_command_async(
    cmd: list[str],
    timeout: int = 30,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
) -> CommandResult:
    """Execute a command asynchronously."""
    full_env = os.environ.copy()
    if env:
        full_env.update(env)

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=cwd,
            env=full_env,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
        return CommandResult(
            returncode=proc.returncode or 0,
            stdout=stdout.decode(),
            stderr=stderr.decode(),
        )
    except asyncio.TimeoutError:
        proc.kill()
        return CommandResult(returncode=-1, stdout="", stderr="Command timed out")
    except FileNotFoundError:
        return CommandResult(returncode=-1, stdout="", stderr=f"Command not found: {cmd[0]}")


def get_cpu_info() -> CPUInfo:
    """Get CPU information."""
    model = "Unknown"
    cores = os.cpu_count() or 1
    threads = cores
    frequency = None

    if Path("/proc/cpuinfo").exists():
        with open("/proc/cpuinfo") as f:
            for line in f:
                if line.startswith("model name"):
                    model = line.split(":")[1].strip()
                elif line.startswith("cpu cores"):
                    cores = int(line.split(":")[1].strip())
                elif line.startswith("siblings"):
                    threads = int(line.split(":")[1].strip())
                elif line.startswith("cpu MHz"):
                    frequency = float(line.split(":")[1].strip())

    load = 0.0
    if Path("/proc/loadavg").exists():
        with open("/proc/loadavg") as f:
            load_1min = float(f.read().split()[0])
            load = (load_1min / cores) * 100

    return CPUInfo(
        model=model,
        cores=cores,
        threads=threads,
        frequency_mhz=frequency,
        load_percent=min(load, 100.0),
    )


def get_memory_info() -> MemoryInfo:
    """Get memory information."""
    if Path("/proc/meminfo").exists():
        meminfo = {}
        with open("/proc/meminfo") as f:
            for line in f:
                parts = line.split(":")
                if len(parts) == 2:
                    key = parts[0].strip()
                    value = parts[1].strip().split()[0]
                    meminfo[key] = int(value) * 1024

        total = meminfo.get("MemTotal", 0)
        available = meminfo.get("MemAvailable", meminfo.get("MemFree", 0))
        used = total - available
        percent = (used / total * 100) if total > 0 else 0

        return MemoryInfo(
            total_bytes=total,
            available_bytes=available,
            used_bytes=used,
            percent_used=percent,
        )

    import resource

    return MemoryInfo(
        total_bytes=0,
        available_bytes=0,
        used_bytes=resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * 1024,
        percent_used=0,
    )


def get_disk_info(path: str = "/") -> DiskInfo:
    """Get disk information for a path."""
    usage = shutil.disk_usage(path)
    return DiskInfo(
        path=path,
        total_bytes=usage.total,
        used_bytes=usage.used,
        free_bytes=usage.free,
        percent_used=(usage.used / usage.total * 100) if usage.total > 0 else 0,
    )


def get_os_info() -> OSInfo:
    """Get operating system information."""
    name = "Unknown"
    version = "Unknown"

    if Path("/etc/os-release").exists():
        with open("/etc/os-release") as f:
            for line in f:
                if line.startswith("NAME="):
                    name = line.split("=")[1].strip().strip('"')
                elif line.startswith("VERSION="):
                    version = line.split("=")[1].strip().strip('"')

    return OSInfo(
        name=name,
        version=version,
        kernel=platform.release(),
        architecture=platform.machine(),
        hostname=platform.node(),
    )


def get_service_status(service_name: str) -> ServiceStatus:
    """Get systemd service status."""
    result = run_command(["systemctl", "show", service_name, "--no-pager"])

    if not result.success:
        return ServiceStatus(
            name=service_name,
            active=False,
            running=False,
            enabled=False,
            description=f"Service not found: {service_name}",
        )

    props = {}
    for line in result.stdout.splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            props[key] = value

    return ServiceStatus(
        name=service_name,
        active=props.get("ActiveState") == "active",
        running=props.get("SubState") == "running",
        enabled=props.get("UnitFileState") == "enabled",
        description=props.get("Description", ""),
    )
