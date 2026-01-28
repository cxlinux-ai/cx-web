"""Auto-fix actions for Cortex Doctor."""

from dataclasses import dataclass
from enum import Enum
from typing import Callable

from rich.console import Console
from rich.prompt import Confirm

from cx_ops.utils.system import run_command, CommandResult


class FixRisk(Enum):
    """Risk level of a fix action."""

    SAFE = "safe"
    MODERATE = "moderate"
    RISKY = "risky"


@dataclass
class FixResult:
    """Result of applying a fix."""

    fix_id: str
    success: bool
    message: str
    details: dict[str, str]
    command_results: list[CommandResult]


@dataclass
class FixAction:
    """Definition of an auto-fix action."""

    id: str
    name: str
    description: str
    risk: FixRisk
    apply_fn: Callable[[], FixResult]
    requires_root: bool = True
    dry_run_fn: Callable[[], str] | None = None


def fix_disk_cleanup() -> FixResult:
    """Clean up disk space by removing unnecessary files."""
    results = []

    # Clean apt cache
    result = run_command(["apt-get", "clean"])
    results.append(result)

    # Remove old kernels (keep current)
    result = run_command(["apt-get", "autoremove", "-y"])
    results.append(result)

    # Clean journal logs older than 7 days
    result = run_command(["journalctl", "--vacuum-time=7d"])
    results.append(result)

    # Clean temp files
    result = run_command(["find", "/tmp", "-type", "f", "-atime", "+7", "-delete"])
    results.append(result)

    success = all(r.success for r in results)

    return FixResult(
        fix_id="disk_cleanup",
        success=success,
        message="Disk cleanup completed" if success else "Some cleanup steps failed",
        details={
            "apt_clean": "success" if results[0].success else results[0].stderr,
            "autoremove": "success" if results[1].success else results[1].stderr,
            "journal_vacuum": "success" if results[2].success else results[2].stderr,
            "tmp_cleanup": "success" if results[3].success else results[3].stderr,
        },
        command_results=results,
    )


def fix_apt_locks() -> FixResult:
    """Fix APT lock issues."""
    results = []

    # Kill any hanging apt/dpkg processes
    result = run_command(["pkill", "-9", "apt"])
    results.append(result)

    result = run_command(["pkill", "-9", "dpkg"])
    results.append(result)

    # Remove lock files
    lock_files = [
        "/var/lib/dpkg/lock",
        "/var/lib/dpkg/lock-frontend",
        "/var/lib/apt/lists/lock",
        "/var/cache/apt/archives/lock",
    ]

    for lock_file in lock_files:
        result = run_command(["rm", "-f", lock_file])
        results.append(result)

    # Reconfigure dpkg
    result = run_command(["dpkg", "--configure", "-a"])
    results.append(result)

    success = results[-1].success

    return FixResult(
        fix_id="apt_fix_locks",
        success=success,
        message="APT locks cleared and dpkg reconfigured" if success else "Failed to fix APT",
        details={"dpkg_configure": results[-1].stdout or results[-1].stderr},
        command_results=results,
    )


def fix_apt_dpkg() -> FixResult:
    """Fix dpkg database issues."""
    results = []

    # Reconfigure dpkg
    result = run_command(["dpkg", "--configure", "-a"])
    results.append(result)

    # Fix broken packages
    result = run_command(["apt-get", "install", "-f", "-y"])
    results.append(result)

    success = all(r.success for r in results)

    return FixResult(
        fix_id="apt_fix_dpkg",
        success=success,
        message="dpkg database repaired" if success else "Failed to repair dpkg",
        details={
            "dpkg_configure": results[0].stdout or results[0].stderr,
            "apt_fix": results[1].stdout or results[1].stderr,
        },
        command_results=results,
    )


def fix_apt_deps() -> FixResult:
    """Fix APT dependency issues."""
    results = []

    # Fix broken dependencies
    result = run_command(["apt-get", "install", "-f", "-y"])
    results.append(result)

    # Update package lists
    result = run_command(["apt-get", "update"], timeout=120)
    results.append(result)

    success = all(r.success for r in results)

    return FixResult(
        fix_id="apt_fix_deps",
        success=success,
        message="APT dependencies fixed" if success else "Failed to fix dependencies",
        details={
            "apt_fix": results[0].stdout or results[0].stderr,
            "apt_update": results[1].stdout or results[1].stderr,
        },
        command_results=results,
    )


def fix_systemd_restart_failed() -> FixResult:
    """Restart failed systemd units."""
    results = []

    # Get list of failed units
    result = run_command(["systemctl", "--failed", "--no-legend", "--no-pager"])
    results.append(result)

    if not result.success:
        return FixResult(
            fix_id="systemd_restart_failed",
            success=False,
            message="Could not query failed units",
            details={"error": result.stderr},
            command_results=results,
        )

    failed_units = [line.split()[0] for line in result.stdout.strip().splitlines() if line]
    restarted = []
    failed_restart = []

    for unit in failed_units:
        result = run_command(["systemctl", "restart", unit])
        results.append(result)
        if result.success:
            restarted.append(unit)
        else:
            failed_restart.append(unit)

    success = len(failed_restart) == 0

    return FixResult(
        fix_id="systemd_restart_failed",
        success=success,
        message=f"Restarted {len(restarted)}/{len(failed_units)} units",
        details={
            "restarted": ", ".join(restarted) if restarted else "none",
            "failed": ", ".join(failed_restart) if failed_restart else "none",
        },
        command_results=results,
    )


def fix_enable_ntp() -> FixResult:
    """Enable NTP time synchronization."""
    results = []

    result = run_command(["timedatectl", "set-ntp", "true"])
    results.append(result)

    if result.success:
        # Force sync
        result = run_command(["systemctl", "restart", "systemd-timesyncd"])
        results.append(result)

    success = results[0].success

    return FixResult(
        fix_id="enable_ntp",
        success=success,
        message="NTP enabled" if success else "Failed to enable NTP",
        details={"output": results[0].stdout or results[0].stderr},
        command_results=results,
    )


def fix_apply_security_updates() -> FixResult:
    """Apply pending security updates."""
    results = []

    # Update package lists
    result = run_command(["apt-get", "update"], timeout=120)
    results.append(result)

    if not result.success:
        return FixResult(
            fix_id="apply_security_updates",
            success=False,
            message="Failed to update package lists",
            details={"error": result.stderr},
            command_results=results,
        )

    # Install security updates only
    result = run_command(
        ["apt-get", "upgrade", "-y", "-o", "Dir::Etc::SourceList=/etc/apt/sources.list.d/security.list"],
        timeout=600,
    )
    results.append(result)

    # Fallback to regular upgrade if security-only fails
    if not result.success:
        result = run_command(["apt-get", "upgrade", "-y"], timeout=600)
        results.append(result)

    success = results[-1].success

    return FixResult(
        fix_id="apply_security_updates",
        success=success,
        message="Security updates applied" if success else "Failed to apply updates",
        details={"output": results[-1].stdout[-500:] if results[-1].stdout else results[-1].stderr},
        command_results=results,
    )


# Registry of all available fixes
ALL_FIXES: dict[str, FixAction] = {
    "disk_cleanup": FixAction(
        id="disk_cleanup",
        name="Disk Cleanup",
        description="Clean apt cache, old kernels, journal logs, and temp files",
        risk=FixRisk.SAFE,
        apply_fn=fix_disk_cleanup,
    ),
    "apt_fix_locks": FixAction(
        id="apt_fix_locks",
        name="Fix APT Locks",
        description="Remove stale APT/dpkg lock files",
        risk=FixRisk.MODERATE,
        apply_fn=fix_apt_locks,
    ),
    "apt_fix_dpkg": FixAction(
        id="apt_fix_dpkg",
        name="Fix dpkg Database",
        description="Reconfigure dpkg and fix broken packages",
        risk=FixRisk.MODERATE,
        apply_fn=fix_apt_dpkg,
    ),
    "apt_fix_deps": FixAction(
        id="apt_fix_deps",
        name="Fix APT Dependencies",
        description="Fix broken APT dependencies",
        risk=FixRisk.MODERATE,
        apply_fn=fix_apt_deps,
    ),
    "apt_fix": FixAction(
        id="apt_fix",
        name="Fix APT (All)",
        description="Comprehensive APT repair",
        risk=FixRisk.MODERATE,
        apply_fn=fix_apt_dpkg,
    ),
    "systemd_restart_failed": FixAction(
        id="systemd_restart_failed",
        name="Restart Failed Services",
        description="Attempt to restart all failed systemd units",
        risk=FixRisk.MODERATE,
        apply_fn=fix_systemd_restart_failed,
    ),
    "enable_ntp": FixAction(
        id="enable_ntp",
        name="Enable NTP",
        description="Enable time synchronization via NTP",
        risk=FixRisk.SAFE,
        apply_fn=fix_enable_ntp,
    ),
    "apply_security_updates": FixAction(
        id="apply_security_updates",
        name="Apply Security Updates",
        description="Install pending security updates",
        risk=FixRisk.RISKY,
        apply_fn=fix_apply_security_updates,
    ),
}


def apply_fix(
    fix_id: str,
    console: Console | None = None,
    confirm: bool = True,
    safe_only: bool = False,
) -> FixResult | None:
    """Apply a fix by ID."""
    console = console or Console()

    if fix_id not in ALL_FIXES:
        console.print(f"[red]Unknown fix: {fix_id}[/]")
        return None

    fix = ALL_FIXES[fix_id]

    if safe_only and fix.risk != FixRisk.SAFE:
        console.print(f"[yellow]Skipping {fix.name} (not safe)[/]")
        return None

    if confirm and fix.risk in (FixRisk.MODERATE, FixRisk.RISKY):
        risk_style = "yellow" if fix.risk == FixRisk.MODERATE else "red"
        console.print(f"\n[bold]{fix.name}[/]")
        console.print(f"  {fix.description}")
        console.print(f"  Risk: [{risk_style}]{fix.risk.value}[/]")

        if not Confirm.ask("Apply this fix?"):
            return FixResult(
                fix_id=fix_id,
                success=False,
                message="Skipped by user",
                details={},
                command_results=[],
            )

    console.print(f"[cyan]Applying fix: {fix.name}...[/]")
    result = fix.apply_fn()

    if result.success:
        console.print(f"[green]Fix applied: {result.message}[/]")
    else:
        console.print(f"[red]Fix failed: {result.message}[/]")

    return result
