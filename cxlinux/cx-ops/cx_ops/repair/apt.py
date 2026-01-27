"""APT package manager repair tools."""

from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Callable

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

from cx_ops.utils.system import run_command, CommandResult


class AptIssueType(Enum):
    """Types of APT issues."""

    LOCK = "lock"
    DPKG_INTERRUPTED = "dpkg_interrupted"
    BROKEN_PACKAGES = "broken_packages"
    MISSING_DEPENDENCIES = "missing_dependencies"
    CORRUPTED_LISTS = "corrupted_lists"
    CACHE_ISSUES = "cache_issues"
    GPG_KEYS = "gpg_keys"


@dataclass
class AptIssue:
    """Detected APT issue."""

    issue_type: AptIssueType
    description: str
    details: dict[str, str]
    fixable: bool = True


@dataclass
class RepairResult:
    """Result of a repair operation."""

    success: bool
    message: str
    commands_run: list[CommandResult]


class AptRepair:
    """Diagnoses and repairs APT package manager issues.

    Handles common problems like:
    - Lock file conflicts
    - Interrupted dpkg operations
    - Broken package dependencies
    - Corrupted package lists
    - Cache issues
    """

    LOCK_FILES = [
        Path("/var/lib/dpkg/lock"),
        Path("/var/lib/dpkg/lock-frontend"),
        Path("/var/lib/apt/lists/lock"),
        Path("/var/cache/apt/archives/lock"),
    ]

    def __init__(self, console: Console | None = None) -> None:
        self.console = console or Console()

    def diagnose(self) -> list[AptIssue]:
        """Diagnose APT issues.

        Returns:
            List of detected issues
        """
        issues = []

        # Check for lock files
        for lock_file in self.LOCK_FILES:
            if lock_file.exists():
                result = run_command(["fuser", str(lock_file)])
                if result.stdout.strip():
                    issues.append(AptIssue(
                        issue_type=AptIssueType.LOCK,
                        description=f"APT lock held: {lock_file}",
                        details={
                            "lock_file": str(lock_file),
                            "process": result.stdout.strip(),
                        },
                    ))

        # Check for interrupted dpkg
        result = run_command(["dpkg", "--audit"])
        if result.stdout.strip():
            issues.append(AptIssue(
                issue_type=AptIssueType.DPKG_INTERRUPTED,
                description="dpkg was interrupted",
                details={"audit_output": result.stdout[:500]},
            ))

        # Check for broken packages
        result = run_command(["dpkg", "--configure", "--pending", "--dry-run"])
        if not result.success:
            issues.append(AptIssue(
                issue_type=AptIssueType.DPKG_INTERRUPTED,
                description="Packages pending configuration",
                details={"error": result.stderr[:500]},
            ))

        # Check apt dependencies
        result = run_command(["apt-get", "check"], timeout=60)
        if not result.success:
            if "broken" in result.stderr.lower():
                issues.append(AptIssue(
                    issue_type=AptIssueType.BROKEN_PACKAGES,
                    description="Broken package dependencies",
                    details={"error": result.stderr[:500]},
                ))
            else:
                issues.append(AptIssue(
                    issue_type=AptIssueType.MISSING_DEPENDENCIES,
                    description="Missing dependencies",
                    details={"error": result.stderr[:500]},
                ))

        # Check package lists
        lists_dir = Path("/var/lib/apt/lists")
        if lists_dir.exists():
            partial_files = list(lists_dir.glob("*_Packages.diff_Index"))
            if len(partial_files) > 10:
                issues.append(AptIssue(
                    issue_type=AptIssueType.CORRUPTED_LISTS,
                    description="Package lists may be corrupted",
                    details={"partial_files": str(len(partial_files))},
                ))

        # Check cache
        cache_dir = Path("/var/cache/apt/archives")
        if cache_dir.exists():
            partial_debs = list(cache_dir.glob("*.deb.part"))
            if partial_debs:
                issues.append(AptIssue(
                    issue_type=AptIssueType.CACHE_ISSUES,
                    description="Incomplete package downloads",
                    details={"partial_files": str(len(partial_debs))},
                ))

        return issues

    def repair_all(
        self,
        dry_run: bool = False,
        progress_callback: Callable[[str], None] | None = None,
    ) -> RepairResult:
        """Repair all detected APT issues.

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
                message="No APT issues detected",
                commands_run=[],
            )

        commands_run = []
        failed = []

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=self.console,
            transient=True,
        ) as progress:
            task = progress.add_task("Repairing APT...", total=len(issues) + 3)

            # Step 1: Clear locks
            if any(i.issue_type == AptIssueType.LOCK for i in issues):
                progress.update(task, description="Clearing lock files...")
                if not dry_run:
                    # Kill hanging processes
                    run_command(["pkill", "-9", "apt"])
                    run_command(["pkill", "-9", "dpkg"])

                    for lock_file in self.LOCK_FILES:
                        if lock_file.exists():
                            run_command(["rm", "-f", str(lock_file)])

                progress.advance(task)

            # Step 2: Configure pending packages
            progress.update(task, description="Configuring pending packages...")
            if not dry_run:
                result = run_command(["dpkg", "--configure", "-a"])
                commands_run.append(result)
                if not result.success:
                    failed.append("dpkg --configure -a")
            progress.advance(task)

            # Step 3: Fix broken dependencies
            progress.update(task, description="Fixing dependencies...")
            if not dry_run:
                result = run_command(["apt-get", "install", "-f", "-y"])
                commands_run.append(result)
                if not result.success:
                    failed.append("apt-get install -f")
            progress.advance(task)

            # Step 4: Clean cache if needed
            if any(i.issue_type == AptIssueType.CACHE_ISSUES for i in issues):
                progress.update(task, description="Cleaning cache...")
                if not dry_run:
                    result = run_command(["apt-get", "clean"])
                    commands_run.append(result)
                progress.advance(task)

            # Step 5: Update package lists if needed
            if any(i.issue_type == AptIssueType.CORRUPTED_LISTS for i in issues):
                progress.update(task, description="Refreshing package lists...")
                if not dry_run:
                    # Clear lists
                    run_command(["rm", "-rf", "/var/lib/apt/lists/*"])
                    result = run_command(["apt-get", "update"], timeout=120)
                    commands_run.append(result)
                    if not result.success:
                        failed.append("apt-get update")
                progress.advance(task)

            # Step 6: Final check
            progress.update(task, description="Verifying repairs...")
            if not dry_run:
                result = run_command(["apt-get", "check"])
                commands_run.append(result)
            progress.advance(task)

        if failed:
            return RepairResult(
                success=False,
                message=f"Some repairs failed: {', '.join(failed)}",
                commands_run=commands_run,
            )

        return RepairResult(
            success=True,
            message="APT repairs completed successfully",
            commands_run=commands_run,
        )

    def repair_locks(self) -> RepairResult:
        """Clear APT lock files specifically."""
        commands_run = []

        # Kill any apt/dpkg processes
        run_command(["pkill", "-9", "apt"])
        run_command(["pkill", "-9", "dpkg"])

        # Remove lock files
        for lock_file in self.LOCK_FILES:
            if lock_file.exists():
                result = run_command(["rm", "-f", str(lock_file)])
                commands_run.append(result)

        # Reconfigure dpkg
        result = run_command(["dpkg", "--configure", "-a"])
        commands_run.append(result)

        return RepairResult(
            success=result.success,
            message="Lock files cleared" if result.success else "Failed to clear locks",
            commands_run=commands_run,
        )

    def repair_broken_packages(self) -> RepairResult:
        """Fix broken package dependencies."""
        commands_run = []

        # Configure pending
        result = run_command(["dpkg", "--configure", "-a"])
        commands_run.append(result)

        # Fix dependencies
        result = run_command(["apt-get", "install", "-f", "-y"])
        commands_run.append(result)

        return RepairResult(
            success=result.success,
            message="Dependencies fixed" if result.success else "Failed to fix dependencies",
            commands_run=commands_run,
        )

    def clean_cache(self) -> RepairResult:
        """Clean APT cache."""
        commands_run = []

        result = run_command(["apt-get", "clean"])
        commands_run.append(result)

        result = run_command(["apt-get", "autoclean"])
        commands_run.append(result)

        # Remove partial downloads
        partial_dir = Path("/var/cache/apt/archives/partial")
        if partial_dir.exists():
            for f in partial_dir.glob("*"):
                f.unlink()

        return RepairResult(
            success=True,
            message="Cache cleaned",
            commands_run=commands_run,
        )

    def refresh_lists(self) -> RepairResult:
        """Refresh package lists."""
        commands_run = []

        # Clear existing lists
        lists_dir = Path("/var/lib/apt/lists")
        if lists_dir.exists():
            for f in lists_dir.glob("*"):
                if f.is_file() and f.name != "lock":
                    f.unlink()

        # Update
        result = run_command(["apt-get", "update"], timeout=120)
        commands_run.append(result)

        return RepairResult(
            success=result.success,
            message="Package lists refreshed" if result.success else "Failed to refresh lists",
            commands_run=commands_run,
        )
