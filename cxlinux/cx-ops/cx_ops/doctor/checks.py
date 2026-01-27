"""Health check definitions for Cortex Doctor."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Coroutine, Any
from pathlib import Path

from cx_ops.utils.system import (
    get_cpu_info,
    get_disk_info,
    get_memory_info,
    get_os_info,
    get_service_status,
    run_command,
)


class CheckStatus(Enum):
    """Result status of a health check."""

    PASS = "pass"
    WARN = "warn"
    FAIL = "fail"
    SKIP = "skip"
    ERROR = "error"


class CheckSeverity(Enum):
    """Severity level of a check."""

    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class CheckCategory(Enum):
    """Category of health checks."""

    SYSTEM = "system"
    DISK = "disk"
    MEMORY = "memory"
    NETWORK = "network"
    SECURITY = "security"
    SERVICES = "services"
    PACKAGES = "packages"
    PERFORMANCE = "performance"


@dataclass
class CheckResult:
    """Result of a health check execution."""

    check_id: str
    name: str
    status: CheckStatus
    message: str
    details: dict[str, Any] = field(default_factory=dict)
    fix_id: str | None = None
    duration_ms: float = 0.0


@dataclass
class Check:
    """Health check definition."""

    id: str
    name: str
    description: str
    category: CheckCategory
    severity: CheckSeverity
    check_fn: Callable[[], CheckResult] | Callable[[], Coroutine[Any, Any, CheckResult]]
    fix_id: str | None = None
    enabled: bool = True
    tags: list[str] = field(default_factory=list)


def check_disk_space() -> CheckResult:
    """Check available disk space on root partition."""
    disk = get_disk_info("/")
    threshold_warn = 80.0
    threshold_fail = 95.0

    if disk.percent_used >= threshold_fail:
        return CheckResult(
            check_id="disk_space",
            name="Disk Space",
            status=CheckStatus.FAIL,
            message=f"Critical: {disk.percent_used:.1f}% disk usage on /",
            details={
                "path": disk.path,
                "used_gb": disk.used_bytes / (1024**3),
                "total_gb": disk.total_bytes / (1024**3),
                "free_gb": disk.free_bytes / (1024**3),
                "percent_used": disk.percent_used,
            },
            fix_id="disk_cleanup",
        )
    elif disk.percent_used >= threshold_warn:
        return CheckResult(
            check_id="disk_space",
            name="Disk Space",
            status=CheckStatus.WARN,
            message=f"Warning: {disk.percent_used:.1f}% disk usage on /",
            details={
                "path": disk.path,
                "used_gb": disk.used_bytes / (1024**3),
                "total_gb": disk.total_bytes / (1024**3),
                "free_gb": disk.free_bytes / (1024**3),
                "percent_used": disk.percent_used,
            },
            fix_id="disk_cleanup",
        )
    return CheckResult(
        check_id="disk_space",
        name="Disk Space",
        status=CheckStatus.PASS,
        message=f"Disk usage at {disk.percent_used:.1f}%",
        details={
            "path": disk.path,
            "used_gb": disk.used_bytes / (1024**3),
            "total_gb": disk.total_bytes / (1024**3),
            "free_gb": disk.free_bytes / (1024**3),
            "percent_used": disk.percent_used,
        },
    )


def check_memory() -> CheckResult:
    """Check available memory."""
    mem = get_memory_info()
    threshold_warn = 85.0
    threshold_fail = 95.0

    if mem.percent_used >= threshold_fail:
        return CheckResult(
            check_id="memory",
            name="Memory Usage",
            status=CheckStatus.FAIL,
            message=f"Critical: {mem.percent_used:.1f}% memory usage",
            details={
                "total_gb": mem.total_bytes / (1024**3),
                "used_gb": mem.used_bytes / (1024**3),
                "available_gb": mem.available_bytes / (1024**3),
                "percent_used": mem.percent_used,
            },
        )
    elif mem.percent_used >= threshold_warn:
        return CheckResult(
            check_id="memory",
            name="Memory Usage",
            status=CheckStatus.WARN,
            message=f"Warning: {mem.percent_used:.1f}% memory usage",
            details={
                "total_gb": mem.total_bytes / (1024**3),
                "used_gb": mem.used_bytes / (1024**3),
                "available_gb": mem.available_bytes / (1024**3),
                "percent_used": mem.percent_used,
            },
        )
    return CheckResult(
        check_id="memory",
        name="Memory Usage",
        status=CheckStatus.PASS,
        message=f"Memory usage at {mem.percent_used:.1f}%",
        details={
            "total_gb": mem.total_bytes / (1024**3),
            "used_gb": mem.used_bytes / (1024**3),
            "available_gb": mem.available_bytes / (1024**3),
            "percent_used": mem.percent_used,
        },
    )


def check_cpu_load() -> CheckResult:
    """Check CPU load average."""
    cpu = get_cpu_info()
    threshold_warn = 80.0
    threshold_fail = 95.0

    if cpu.load_percent >= threshold_fail:
        return CheckResult(
            check_id="cpu_load",
            name="CPU Load",
            status=CheckStatus.FAIL,
            message=f"Critical: CPU load at {cpu.load_percent:.1f}%",
            details={
                "model": cpu.model,
                "cores": cpu.cores,
                "threads": cpu.threads,
                "load_percent": cpu.load_percent,
            },
        )
    elif cpu.load_percent >= threshold_warn:
        return CheckResult(
            check_id="cpu_load",
            name="CPU Load",
            status=CheckStatus.WARN,
            message=f"Warning: CPU load at {cpu.load_percent:.1f}%",
            details={
                "model": cpu.model,
                "cores": cpu.cores,
                "threads": cpu.threads,
                "load_percent": cpu.load_percent,
            },
        )
    return CheckResult(
        check_id="cpu_load",
        name="CPU Load",
        status=CheckStatus.PASS,
        message=f"CPU load at {cpu.load_percent:.1f}%",
        details={
            "model": cpu.model,
            "cores": cpu.cores,
            "threads": cpu.threads,
            "load_percent": cpu.load_percent,
        },
    )


def check_apt_status() -> CheckResult:
    """Check APT package manager status."""
    lock_files = [
        Path("/var/lib/dpkg/lock"),
        Path("/var/lib/dpkg/lock-frontend"),
        Path("/var/lib/apt/lists/lock"),
        Path("/var/cache/apt/archives/lock"),
    ]

    for lock_file in lock_files:
        if lock_file.exists():
            result = run_command(["fuser", str(lock_file)])
            if result.stdout.strip():
                return CheckResult(
                    check_id="apt_status",
                    name="APT Status",
                    status=CheckStatus.FAIL,
                    message=f"APT is locked by another process: {lock_file}",
                    details={"locked_file": str(lock_file), "process": result.stdout.strip()},
                    fix_id="apt_fix_locks",
                )

    result = run_command(["dpkg", "--audit"])
    if result.stdout.strip():
        return CheckResult(
            check_id="apt_status",
            name="APT Status",
            status=CheckStatus.WARN,
            message="dpkg audit found issues",
            details={"audit_output": result.stdout},
            fix_id="apt_fix_dpkg",
        )

    result = run_command(["apt-get", "check"], timeout=60)
    if not result.success:
        return CheckResult(
            check_id="apt_status",
            name="APT Status",
            status=CheckStatus.FAIL,
            message="APT dependency check failed",
            details={"error": result.stderr},
            fix_id="apt_fix_deps",
        )

    return CheckResult(
        check_id="apt_status",
        name="APT Status",
        status=CheckStatus.PASS,
        message="APT package manager healthy",
        details={},
    )


def check_systemd_failed() -> CheckResult:
    """Check for failed systemd units."""
    result = run_command(["systemctl", "--failed", "--no-legend", "--no-pager"])

    if not result.success:
        return CheckResult(
            check_id="systemd_failed",
            name="Systemd Units",
            status=CheckStatus.ERROR,
            message="Could not query systemd status",
            details={"error": result.stderr},
        )

    failed_units = [line.split()[0] for line in result.stdout.strip().splitlines() if line]

    if failed_units:
        return CheckResult(
            check_id="systemd_failed",
            name="Systemd Units",
            status=CheckStatus.FAIL,
            message=f"{len(failed_units)} failed systemd unit(s)",
            details={"failed_units": failed_units},
            fix_id="systemd_restart_failed",
        )

    return CheckResult(
        check_id="systemd_failed",
        name="Systemd Units",
        status=CheckStatus.PASS,
        message="All systemd units healthy",
        details={},
    )


def check_network_connectivity() -> CheckResult:
    """Check basic network connectivity."""
    targets = [
        ("1.1.1.1", "Cloudflare DNS"),
        ("8.8.8.8", "Google DNS"),
    ]

    reachable = []
    unreachable = []

    for ip, name in targets:
        result = run_command(["ping", "-c", "1", "-W", "2", ip])
        if result.success:
            reachable.append(name)
        else:
            unreachable.append(name)

    if len(unreachable) == len(targets):
        return CheckResult(
            check_id="network_connectivity",
            name="Network Connectivity",
            status=CheckStatus.FAIL,
            message="No network connectivity",
            details={"reachable": reachable, "unreachable": unreachable},
        )
    elif unreachable:
        return CheckResult(
            check_id="network_connectivity",
            name="Network Connectivity",
            status=CheckStatus.WARN,
            message=f"Partial connectivity ({len(reachable)}/{len(targets)})",
            details={"reachable": reachable, "unreachable": unreachable},
        )

    return CheckResult(
        check_id="network_connectivity",
        name="Network Connectivity",
        status=CheckStatus.PASS,
        message="Network connectivity OK",
        details={"reachable": reachable},
    )


def check_dns_resolution() -> CheckResult:
    """Check DNS resolution."""
    domains = ["google.com", "cloudflare.com", "github.com"]
    resolved = []
    failed = []

    for domain in domains:
        result = run_command(["host", "-W", "2", domain])
        if result.success:
            resolved.append(domain)
        else:
            failed.append(domain)

    if len(failed) == len(domains):
        return CheckResult(
            check_id="dns_resolution",
            name="DNS Resolution",
            status=CheckStatus.FAIL,
            message="DNS resolution failing",
            details={"resolved": resolved, "failed": failed},
        )
    elif failed:
        return CheckResult(
            check_id="dns_resolution",
            name="DNS Resolution",
            status=CheckStatus.WARN,
            message=f"Partial DNS resolution ({len(resolved)}/{len(domains)})",
            details={"resolved": resolved, "failed": failed},
        )

    return CheckResult(
        check_id="dns_resolution",
        name="DNS Resolution",
        status=CheckStatus.PASS,
        message="DNS resolution OK",
        details={"resolved": resolved},
    )


def check_time_sync() -> CheckResult:
    """Check time synchronization status."""
    result = run_command(["timedatectl", "show"])

    if not result.success:
        return CheckResult(
            check_id="time_sync",
            name="Time Sync",
            status=CheckStatus.ERROR,
            message="Could not query time sync status",
            details={"error": result.stderr},
        )

    props = {}
    for line in result.stdout.splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            props[key] = value

    ntp_sync = props.get("NTPSynchronized") == "yes"
    ntp_active = props.get("NTP") == "yes"

    if not ntp_active:
        return CheckResult(
            check_id="time_sync",
            name="Time Sync",
            status=CheckStatus.WARN,
            message="NTP is not enabled",
            details=props,
            fix_id="enable_ntp",
        )

    if not ntp_sync:
        return CheckResult(
            check_id="time_sync",
            name="Time Sync",
            status=CheckStatus.WARN,
            message="NTP enabled but not synchronized",
            details=props,
        )

    return CheckResult(
        check_id="time_sync",
        name="Time Sync",
        status=CheckStatus.PASS,
        message="Time synchronized via NTP",
        details=props,
    )


def check_swap_usage() -> CheckResult:
    """Check swap usage."""
    if not Path("/proc/swaps").exists():
        return CheckResult(
            check_id="swap_usage",
            name="Swap Usage",
            status=CheckStatus.SKIP,
            message="No swap configured",
            details={},
        )

    result = run_command(["free", "-b"])
    if not result.success:
        return CheckResult(
            check_id="swap_usage",
            name="Swap Usage",
            status=CheckStatus.ERROR,
            message="Could not query swap status",
            details={"error": result.stderr},
        )

    for line in result.stdout.splitlines():
        if line.startswith("Swap:"):
            parts = line.split()
            if len(parts) >= 3:
                total = int(parts[1])
                used = int(parts[2])

                if total == 0:
                    return CheckResult(
                        check_id="swap_usage",
                        name="Swap Usage",
                        status=CheckStatus.SKIP,
                        message="No swap configured",
                        details={},
                    )

                percent = (used / total * 100) if total > 0 else 0

                if percent >= 90:
                    return CheckResult(
                        check_id="swap_usage",
                        name="Swap Usage",
                        status=CheckStatus.FAIL,
                        message=f"Critical swap usage: {percent:.1f}%",
                        details={
                            "total_gb": total / (1024**3),
                            "used_gb": used / (1024**3),
                            "percent_used": percent,
                        },
                    )
                elif percent >= 50:
                    return CheckResult(
                        check_id="swap_usage",
                        name="Swap Usage",
                        status=CheckStatus.WARN,
                        message=f"High swap usage: {percent:.1f}%",
                        details={
                            "total_gb": total / (1024**3),
                            "used_gb": used / (1024**3),
                            "percent_used": percent,
                        },
                    )
                return CheckResult(
                    check_id="swap_usage",
                    name="Swap Usage",
                    status=CheckStatus.PASS,
                    message=f"Swap usage: {percent:.1f}%",
                    details={
                        "total_gb": total / (1024**3),
                        "used_gb": used / (1024**3),
                        "percent_used": percent,
                    },
                )

    return CheckResult(
        check_id="swap_usage",
        name="Swap Usage",
        status=CheckStatus.ERROR,
        message="Could not parse swap information",
        details={},
    )


def check_security_updates() -> CheckResult:
    """Check for pending security updates."""
    result = run_command(
        ["apt-get", "-s", "upgrade"],
        timeout=120,
    )

    if not result.success:
        return CheckResult(
            check_id="security_updates",
            name="Security Updates",
            status=CheckStatus.ERROR,
            message="Could not check for updates",
            details={"error": result.stderr},
        )

    security_updates = []
    for line in result.stdout.splitlines():
        if "security" in line.lower() and "Inst" in line:
            parts = line.split()
            if len(parts) >= 2:
                security_updates.append(parts[1])

    if security_updates:
        return CheckResult(
            check_id="security_updates",
            name="Security Updates",
            status=CheckStatus.WARN,
            message=f"{len(security_updates)} security update(s) available",
            details={"packages": security_updates},
            fix_id="apply_security_updates",
        )

    return CheckResult(
        check_id="security_updates",
        name="Security Updates",
        status=CheckStatus.PASS,
        message="No pending security updates",
        details={},
    )


def check_zombie_processes() -> CheckResult:
    """Check for zombie processes."""
    result = run_command(["ps", "aux"])

    if not result.success:
        return CheckResult(
            check_id="zombie_processes",
            name="Zombie Processes",
            status=CheckStatus.ERROR,
            message="Could not list processes",
            details={"error": result.stderr},
        )

    zombies = []
    for line in result.stdout.splitlines()[1:]:
        parts = line.split()
        if len(parts) >= 8 and parts[7] == "Z":
            zombies.append({"pid": parts[1], "command": " ".join(parts[10:])})

    if zombies:
        return CheckResult(
            check_id="zombie_processes",
            name="Zombie Processes",
            status=CheckStatus.WARN,
            message=f"{len(zombies)} zombie process(es) found",
            details={"zombies": zombies},
        )

    return CheckResult(
        check_id="zombie_processes",
        name="Zombie Processes",
        status=CheckStatus.PASS,
        message="No zombie processes",
        details={},
    )


def check_file_descriptors() -> CheckResult:
    """Check file descriptor usage."""
    if not Path("/proc/sys/fs/file-nr").exists():
        return CheckResult(
            check_id="file_descriptors",
            name="File Descriptors",
            status=CheckStatus.SKIP,
            message="Cannot check file descriptors on this system",
            details={},
        )

    with open("/proc/sys/fs/file-nr") as f:
        parts = f.read().strip().split()
        allocated = int(parts[0])
        max_fds = int(parts[2])

    percent = (allocated / max_fds * 100) if max_fds > 0 else 0

    if percent >= 90:
        return CheckResult(
            check_id="file_descriptors",
            name="File Descriptors",
            status=CheckStatus.FAIL,
            message=f"Critical: {percent:.1f}% file descriptors used",
            details={"allocated": allocated, "max": max_fds, "percent": percent},
        )
    elif percent >= 70:
        return CheckResult(
            check_id="file_descriptors",
            name="File Descriptors",
            status=CheckStatus.WARN,
            message=f"High file descriptor usage: {percent:.1f}%",
            details={"allocated": allocated, "max": max_fds, "percent": percent},
        )

    return CheckResult(
        check_id="file_descriptors",
        name="File Descriptors",
        status=CheckStatus.PASS,
        message=f"File descriptors: {percent:.1f}% used",
        details={"allocated": allocated, "max": max_fds, "percent": percent},
    )


# Registry of all available checks
ALL_CHECKS: list[Check] = [
    Check(
        id="disk_space",
        name="Disk Space",
        description="Check available disk space on root partition",
        category=CheckCategory.DISK,
        severity=CheckSeverity.HIGH,
        check_fn=check_disk_space,
        fix_id="disk_cleanup",
        tags=["essential"],
    ),
    Check(
        id="memory",
        name="Memory Usage",
        description="Check available system memory",
        category=CheckCategory.MEMORY,
        severity=CheckSeverity.HIGH,
        check_fn=check_memory,
        tags=["essential"],
    ),
    Check(
        id="cpu_load",
        name="CPU Load",
        description="Check CPU load average",
        category=CheckCategory.PERFORMANCE,
        severity=CheckSeverity.MEDIUM,
        check_fn=check_cpu_load,
        tags=["essential"],
    ),
    Check(
        id="apt_status",
        name="APT Status",
        description="Check APT package manager health",
        category=CheckCategory.PACKAGES,
        severity=CheckSeverity.CRITICAL,
        check_fn=check_apt_status,
        fix_id="apt_fix",
        tags=["essential", "debian"],
    ),
    Check(
        id="systemd_failed",
        name="Systemd Units",
        description="Check for failed systemd units",
        category=CheckCategory.SERVICES,
        severity=CheckSeverity.HIGH,
        check_fn=check_systemd_failed,
        fix_id="systemd_restart_failed",
        tags=["essential"],
    ),
    Check(
        id="network_connectivity",
        name="Network Connectivity",
        description="Check basic network connectivity",
        category=CheckCategory.NETWORK,
        severity=CheckSeverity.CRITICAL,
        check_fn=check_network_connectivity,
        tags=["essential", "network"],
    ),
    Check(
        id="dns_resolution",
        name="DNS Resolution",
        description="Check DNS resolution",
        category=CheckCategory.NETWORK,
        severity=CheckSeverity.HIGH,
        check_fn=check_dns_resolution,
        tags=["network"],
    ),
    Check(
        id="time_sync",
        name="Time Sync",
        description="Check time synchronization status",
        category=CheckCategory.SYSTEM,
        severity=CheckSeverity.MEDIUM,
        check_fn=check_time_sync,
        fix_id="enable_ntp",
        tags=["security"],
    ),
    Check(
        id="swap_usage",
        name="Swap Usage",
        description="Check swap memory usage",
        category=CheckCategory.MEMORY,
        severity=CheckSeverity.MEDIUM,
        check_fn=check_swap_usage,
        tags=["performance"],
    ),
    Check(
        id="security_updates",
        name="Security Updates",
        description="Check for pending security updates",
        category=CheckCategory.SECURITY,
        severity=CheckSeverity.HIGH,
        check_fn=check_security_updates,
        fix_id="apply_security_updates",
        tags=["security", "debian"],
    ),
    Check(
        id="zombie_processes",
        name="Zombie Processes",
        description="Check for zombie processes",
        category=CheckCategory.PERFORMANCE,
        severity=CheckSeverity.LOW,
        check_fn=check_zombie_processes,
        tags=["performance"],
    ),
    Check(
        id="file_descriptors",
        name="File Descriptors",
        description="Check file descriptor usage",
        category=CheckCategory.SYSTEM,
        severity=CheckSeverity.MEDIUM,
        check_fn=check_file_descriptors,
        tags=["performance"],
    ),
]
