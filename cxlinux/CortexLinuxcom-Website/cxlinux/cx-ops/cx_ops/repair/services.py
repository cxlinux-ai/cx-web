"""Systemd services repair tools."""

from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Callable

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

from cx_ops.utils.system import run_command, CommandResult, get_service_status


class ServiceIssueType(Enum):
    """Types of service issues."""

    FAILED = "failed"
    INACTIVE = "inactive"
    DISABLED = "disabled"
    MASKED = "masked"
    MISSING_UNIT = "missing_unit"
    DEPENDENCY_FAILED = "dependency_failed"


@dataclass
class ServiceIssue:
    """Detected service issue."""

    name: str
    issue_type: ServiceIssueType
    description: str
    details: dict[str, str]
    fixable: bool = True


@dataclass
class RepairResult:
    """Result of a repair operation."""

    success: bool
    message: str
    services_fixed: list[str]
    services_failed: list[str]
    commands_run: list[CommandResult]


class ServicesRepair:
    """Diagnoses and repairs systemd service issues.

    Handles common problems like:
    - Failed services
    - Inactive required services
    - Disabled services that should be enabled
    - Masked services
    - Dependency failures
    """

    # Critical services that should always be running
    CRITICAL_SERVICES = [
        "systemd-journald",
        "systemd-logind",
        "dbus",
        "networking",
        "ssh",
    ]

    # Services that should be enabled
    EXPECTED_ENABLED = [
        "ssh",
        "cron",
    ]

    def __init__(
        self,
        console: Console | None = None,
        critical_services: list[str] | None = None,
    ) -> None:
        self.console = console or Console()
        self.critical_services = critical_services or self.CRITICAL_SERVICES

    def diagnose(self) -> list[ServiceIssue]:
        """Diagnose service issues.

        Returns:
            List of detected issues
        """
        issues = []

        # Get all failed units
        result = run_command(["systemctl", "--failed", "--no-legend", "--no-pager"])
        if result.success:
            for line in result.stdout.strip().splitlines():
                if not line:
                    continue
                parts = line.split()
                if parts:
                    unit_name = parts[0]
                    issues.append(ServiceIssue(
                        name=unit_name,
                        issue_type=ServiceIssueType.FAILED,
                        description=f"Service {unit_name} is in failed state",
                        details={"status": "failed"},
                    ))

        # Check critical services
        for service in self.critical_services:
            status = get_service_status(service)

            if not status.active:
                issues.append(ServiceIssue(
                    name=service,
                    issue_type=ServiceIssueType.INACTIVE,
                    description=f"Critical service {service} is not active",
                    details={
                        "active": str(status.active),
                        "running": str(status.running),
                    },
                ))

        # Check expected enabled services
        for service in self.EXPECTED_ENABLED:
            status = get_service_status(service)

            if not status.enabled and status.description != f"Service not found: {service}":
                issues.append(ServiceIssue(
                    name=service,
                    issue_type=ServiceIssueType.DISABLED,
                    description=f"Service {service} should be enabled",
                    details={"enabled": str(status.enabled)},
                ))

        # Check for masked services that shouldn't be
        result = run_command([
            "systemctl", "list-unit-files",
            "--state=masked", "--no-legend", "--no-pager"
        ])
        if result.success:
            for line in result.stdout.strip().splitlines():
                parts = line.split()
                if parts:
                    unit_name = parts[0]
                    # Only flag if it's in our critical list
                    base_name = unit_name.replace(".service", "")
                    if base_name in self.critical_services:
                        issues.append(ServiceIssue(
                            name=unit_name,
                            issue_type=ServiceIssueType.MASKED,
                            description=f"Critical service {unit_name} is masked",
                            details={},
                        ))

        return issues

    def repair_all(
        self,
        dry_run: bool = False,
        progress_callback: Callable[[str], None] | None = None,
    ) -> RepairResult:
        """Repair all detected service issues.

        Args:
            dry_run: Show what would be done without making changes
            progress_callback: Optional callback for progress updates

        Returns:
            RepairResult with overall status
        """
        issues = self.diagnose()
        if not issues:
            return RepairResult(
                success=True,
                message="No service issues detected",
                services_fixed=[],
                services_failed=[],
                commands_run=[],
            )

        fixed = []
        failed = []
        commands_run = []

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=self.console,
            transient=True,
        ) as progress:
            task = progress.add_task("Repairing services...", total=len(issues))

            for issue in issues:
                progress.update(task, description=f"Fixing {issue.name}...")

                if dry_run:
                    fixed.append(issue.name)
                else:
                    result = self._fix_issue(issue)
                    commands_run.extend(result.commands_run)

                    if result.success:
                        fixed.append(issue.name)
                    else:
                        failed.append(issue.name)

                progress.advance(task)

        # Reload daemon after all fixes
        if not dry_run and fixed:
            result = run_command(["systemctl", "daemon-reload"])
            commands_run.append(result)

        return RepairResult(
            success=len(failed) == 0,
            message=f"Fixed {len(fixed)} services, {len(failed)} failed",
            services_fixed=fixed,
            services_failed=failed,
            commands_run=commands_run,
        )

    def _fix_issue(self, issue: ServiceIssue) -> RepairResult:
        """Fix a single service issue."""
        commands_run = []

        if issue.issue_type == ServiceIssueType.FAILED:
            # Reset failed state and restart
            result = run_command(["systemctl", "reset-failed", issue.name])
            commands_run.append(result)

            result = run_command(["systemctl", "restart", issue.name])
            commands_run.append(result)

            return RepairResult(
                success=result.success,
                message="",
                services_fixed=[issue.name] if result.success else [],
                services_failed=[] if result.success else [issue.name],
                commands_run=commands_run,
            )

        elif issue.issue_type == ServiceIssueType.INACTIVE:
            # Start the service
            result = run_command(["systemctl", "start", issue.name])
            commands_run.append(result)

            return RepairResult(
                success=result.success,
                message="",
                services_fixed=[issue.name] if result.success else [],
                services_failed=[] if result.success else [issue.name],
                commands_run=commands_run,
            )

        elif issue.issue_type == ServiceIssueType.DISABLED:
            # Enable the service
            result = run_command(["systemctl", "enable", issue.name])
            commands_run.append(result)

            return RepairResult(
                success=result.success,
                message="",
                services_fixed=[issue.name] if result.success else [],
                services_failed=[] if result.success else [issue.name],
                commands_run=commands_run,
            )

        elif issue.issue_type == ServiceIssueType.MASKED:
            # Unmask the service
            result = run_command(["systemctl", "unmask", issue.name])
            commands_run.append(result)

            if result.success:
                # Also enable and start
                run_command(["systemctl", "enable", issue.name])
                result = run_command(["systemctl", "start", issue.name])
                commands_run.append(result)

            return RepairResult(
                success=result.success,
                message="",
                services_fixed=[issue.name] if result.success else [],
                services_failed=[] if result.success else [issue.name],
                commands_run=commands_run,
            )

        return RepairResult(
            success=False,
            message=f"Unknown issue type: {issue.issue_type}",
            services_fixed=[],
            services_failed=[issue.name],
            commands_run=commands_run,
        )

    def restart_service(self, name: str) -> RepairResult:
        """Restart a specific service."""
        commands_run = []

        result = run_command(["systemctl", "restart", name])
        commands_run.append(result)

        return RepairResult(
            success=result.success,
            message=f"Restarted {name}" if result.success else f"Failed to restart {name}",
            services_fixed=[name] if result.success else [],
            services_failed=[] if result.success else [name],
            commands_run=commands_run,
        )

    def restart_failed(self) -> RepairResult:
        """Restart all failed services."""
        # Get failed services
        result = run_command(["systemctl", "--failed", "--no-legend", "--no-pager"])

        if not result.success:
            return RepairResult(
                success=False,
                message="Could not get failed services",
                services_fixed=[],
                services_failed=[],
                commands_run=[result],
            )

        failed_units = [
            line.split()[0]
            for line in result.stdout.strip().splitlines()
            if line
        ]

        if not failed_units:
            return RepairResult(
                success=True,
                message="No failed services to restart",
                services_fixed=[],
                services_failed=[],
                commands_run=[result],
            )

        fixed = []
        failed = []
        commands_run = [result]

        for unit in failed_units:
            # Reset and restart
            run_command(["systemctl", "reset-failed", unit])
            result = run_command(["systemctl", "restart", unit])
            commands_run.append(result)

            if result.success:
                fixed.append(unit)
            else:
                failed.append(unit)

        return RepairResult(
            success=len(failed) == 0,
            message=f"Restarted {len(fixed)}/{len(failed_units)} services",
            services_fixed=fixed,
            services_failed=failed,
            commands_run=commands_run,
        )

    def get_service_logs(self, name: str, lines: int = 50) -> str:
        """Get recent logs for a service."""
        result = run_command([
            "journalctl", "-u", name, "-n", str(lines), "--no-pager"
        ])
        return result.stdout if result.success else result.stderr
