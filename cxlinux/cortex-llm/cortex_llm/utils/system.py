"""System utilities."""

import os
import platform
import psutil
from dataclasses import dataclass


@dataclass
class SystemInfo:
    """System information."""

    hostname: str
    platform: str
    cpu_count: int
    cpu_model: str
    ram_total_gb: float
    ram_available_gb: float


def get_system_info() -> SystemInfo:
    """Get system information."""
    cpu_model = "Unknown"
    try:
        if platform.system() == "Linux":
            with open("/proc/cpuinfo") as f:
                for line in f:
                    if line.startswith("model name"):
                        cpu_model = line.split(":")[1].strip()
                        break
        elif platform.system() == "Darwin":
            import subprocess
            result = subprocess.run(
                ["sysctl", "-n", "machdep.cpu.brand_string"],
                capture_output=True,
                text=True,
            )
            if result.returncode == 0:
                cpu_model = result.stdout.strip()
    except Exception:
        pass

    mem = psutil.virtual_memory()

    return SystemInfo(
        hostname=platform.node(),
        platform=f"{platform.system()} {platform.release()}",
        cpu_count=os.cpu_count() or 1,
        cpu_model=cpu_model,
        ram_total_gb=round(mem.total / (1024**3), 2),
        ram_available_gb=round(mem.available / (1024**3), 2),
    )


def format_bytes(size: int) -> str:
    """Format bytes to human-readable string."""
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if size < 1024:
            return f"{size:.1f} {unit}"
        size //= 1024
    return f"{size:.1f} PB"


def format_duration(seconds: float) -> str:
    """Format duration to human-readable string."""
    if seconds < 1:
        return f"{seconds * 1000:.0f}ms"
    if seconds < 60:
        return f"{seconds:.1f}s"
    minutes = int(seconds // 60)
    secs = seconds % 60
    if minutes < 60:
        return f"{minutes}m {secs:.0f}s"
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours}h {mins}m"
