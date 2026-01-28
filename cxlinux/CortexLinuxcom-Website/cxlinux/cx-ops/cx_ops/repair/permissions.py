"""File permissions repair tools."""

import grp
import os
import pwd
import stat
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Callable

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

from cx_ops.utils.system import run_command, CommandResult


class PermissionIssueType(Enum):
    """Types of permission issues."""

    WRONG_OWNER = "wrong_owner"
    WRONG_GROUP = "wrong_group"
    WRONG_MODE = "wrong_mode"
    MISSING_EXECUTABLE = "missing_executable"
    WORLD_WRITABLE = "world_writable"
    SUID_SGID = "suid_sgid"


@dataclass
class PermissionIssue:
    """Detected permission issue."""

    path: Path
    issue_type: PermissionIssueType
    description: str
    current: str
    expected: str
    fixable: bool = True


@dataclass
class RepairResult:
    """Result of a repair operation."""

    success: bool
    message: str
    fixed: int
    failed: int
    details: list[str]


@dataclass
class PermissionRule:
    """Expected permissions for a path."""

    path: str
    owner: str | None = None
    group: str | None = None
    mode: int | None = None
    recursive: bool = False


class PermissionsRepair:
    """Diagnoses and repairs file permission issues.

    Checks and fixes permissions on system directories and files
    based on expected configurations.
    """

    # Default permission rules for Cortex directories
    DEFAULT_RULES = [
        PermissionRule("/etc/cortex", owner="root", group="root", mode=0o755, recursive=True),
        PermissionRule("/var/lib/cortex", owner="root", group="root", mode=0o755, recursive=True),
        PermissionRule("/var/log/cortex", owner="root", group="adm", mode=0o750, recursive=True),
        PermissionRule("/var/cache/cortex", owner="root", group="root", mode=0o755, recursive=True),
        PermissionRule("/etc/cortex/plugins", owner="root", group="root", mode=0o755, recursive=True),
    ]

    # System directories with known good permissions
    SYSTEM_RULES = [
        PermissionRule("/tmp", mode=0o1777),
        PermissionRule("/var/tmp", mode=0o1777),
        PermissionRule("/etc/passwd", owner="root", group="root", mode=0o644),
        PermissionRule("/etc/shadow", owner="root", group="shadow", mode=0o640),
        PermissionRule("/etc/sudoers", owner="root", group="root", mode=0o440),
        PermissionRule("/etc/ssh", owner="root", group="root", mode=0o755),
        PermissionRule("/root", owner="root", group="root", mode=0o700),
    ]

    def __init__(
        self,
        console: Console | None = None,
        rules: list[PermissionRule] | None = None,
    ) -> None:
        self.console = console or Console()
        self.rules = rules or (self.DEFAULT_RULES + self.SYSTEM_RULES)

    def _get_owner_group(self, path: Path) -> tuple[str, str]:
        """Get owner and group of a path."""
        try:
            stat_info = path.stat()
            owner = pwd.getpwuid(stat_info.st_uid).pw_name
            group = grp.getgrgid(stat_info.st_gid).gr_name
            return owner, group
        except (KeyError, FileNotFoundError):
            return "unknown", "unknown"

    def _get_mode(self, path: Path) -> int:
        """Get mode of a path."""
        return path.stat().st_mode & 0o7777

    def _format_mode(self, mode: int) -> str:
        """Format mode as octal string."""
        return f"{mode:04o}"

    def diagnose(self, include_system: bool = True) -> list[PermissionIssue]:
        """Diagnose permission issues.

        Args:
            include_system: Include system directory checks

        Returns:
            List of detected issues
        """
        issues = []
        rules = self.rules if include_system else self.DEFAULT_RULES

        for rule in rules:
            path = Path(rule.path)
            if not path.exists():
                continue

            # Check this path
            issues.extend(self._check_path(path, rule))

            # Check recursively if specified
            if rule.recursive and path.is_dir():
                for child in path.rglob("*"):
                    issues.extend(self._check_path(child, rule))

        # Check for world-writable files in sensitive locations
        sensitive_dirs = ["/etc", "/usr/bin", "/usr/sbin"]
        for dir_path in sensitive_dirs:
            path = Path(dir_path)
            if not path.exists():
                continue

            for f in path.rglob("*"):
                if f.is_file():
                    mode = self._get_mode(f)
                    if mode & stat.S_IWOTH:
                        issues.append(PermissionIssue(
                            path=f,
                            issue_type=PermissionIssueType.WORLD_WRITABLE,
                            description=f"World-writable file in {dir_path}",
                            current=self._format_mode(mode),
                            expected=self._format_mode(mode & ~stat.S_IWOTH),
                        ))

        return issues

    def _check_path(self, path: Path, rule: PermissionRule) -> list[PermissionIssue]:
        """Check a single path against a rule."""
        issues = []

        try:
            owner, group = self._get_owner_group(path)
            mode = self._get_mode(path)

            # Check owner
            if rule.owner and owner != rule.owner:
                issues.append(PermissionIssue(
                    path=path,
                    issue_type=PermissionIssueType.WRONG_OWNER,
                    description=f"Wrong owner on {path}",
                    current=owner,
                    expected=rule.owner,
                ))

            # Check group
            if rule.group and group != rule.group:
                issues.append(PermissionIssue(
                    path=path,
                    issue_type=PermissionIssueType.WRONG_GROUP,
                    description=f"Wrong group on {path}",
                    current=group,
                    expected=rule.group,
                ))

            # Check mode
            if rule.mode is not None and mode != rule.mode:
                issues.append(PermissionIssue(
                    path=path,
                    issue_type=PermissionIssueType.WRONG_MODE,
                    description=f"Wrong permissions on {path}",
                    current=self._format_mode(mode),
                    expected=self._format_mode(rule.mode),
                ))

        except (PermissionError, FileNotFoundError):
            pass

        return issues

    def repair_all(
        self,
        dry_run: bool = False,
        progress_callback: Callable[[str], None] | None = None,
    ) -> RepairResult:
        """Repair all detected permission issues.

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
                message="No permission issues detected",
                fixed=0,
                failed=0,
                details=[],
            )

        fixed = 0
        failed = 0
        details = []

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=self.console,
            transient=True,
        ) as progress:
            task = progress.add_task("Fixing permissions...", total=len(issues))

            for issue in issues:
                progress.update(task, description=f"Fixing {issue.path.name}...")

                if dry_run:
                    details.append(f"Would fix: {issue.path} ({issue.description})")
                    fixed += 1
                else:
                    success = self._fix_issue(issue)
                    if success:
                        fixed += 1
                        details.append(f"Fixed: {issue.path}")
                    else:
                        failed += 1
                        details.append(f"Failed: {issue.path}")

                progress.advance(task)

        return RepairResult(
            success=failed == 0,
            message=f"Fixed {fixed} issues, {failed} failed",
            fixed=fixed,
            failed=failed,
            details=details,
        )

    def _fix_issue(self, issue: PermissionIssue) -> bool:
        """Fix a single permission issue."""
        try:
            path = issue.path

            if issue.issue_type == PermissionIssueType.WRONG_OWNER:
                uid = pwd.getpwnam(issue.expected).pw_uid
                os.chown(path, uid, -1)
                return True

            elif issue.issue_type == PermissionIssueType.WRONG_GROUP:
                gid = grp.getgrnam(issue.expected).gr_gid
                os.chown(path, -1, gid)
                return True

            elif issue.issue_type in (
                PermissionIssueType.WRONG_MODE,
                PermissionIssueType.WORLD_WRITABLE,
            ):
                mode = int(issue.expected, 8)
                os.chmod(path, mode)
                return True

            elif issue.issue_type == PermissionIssueType.MISSING_EXECUTABLE:
                current_mode = path.stat().st_mode
                os.chmod(path, current_mode | stat.S_IXUSR | stat.S_IXGRP)
                return True

        except Exception:
            return False

        return False

    def fix_cortex_dirs(self) -> RepairResult:
        """Fix permissions on Cortex directories only."""
        rules = self.DEFAULT_RULES
        issues = []

        for rule in rules:
            path = Path(rule.path)
            if not path.exists():
                path.mkdir(parents=True, exist_ok=True)
            issues.extend(self._check_path(path, rule))

            if rule.recursive and path.is_dir():
                for child in path.rglob("*"):
                    issues.extend(self._check_path(child, rule))

        fixed = 0
        failed = 0
        details = []

        for issue in issues:
            if self._fix_issue(issue):
                fixed += 1
                details.append(f"Fixed: {issue.path}")
            else:
                failed += 1
                details.append(f"Failed: {issue.path}")

        return RepairResult(
            success=failed == 0,
            message=f"Fixed {fixed} Cortex permission issues",
            fixed=fixed,
            failed=failed,
            details=details,
        )

    def fix_home_dir(self, username: str) -> RepairResult:
        """Fix permissions on a user's home directory."""
        try:
            user_info = pwd.getpwnam(username)
            home_dir = Path(user_info.pw_dir)
        except KeyError:
            return RepairResult(
                success=False,
                message=f"User not found: {username}",
                fixed=0,
                failed=1,
                details=[],
            )

        if not home_dir.exists():
            return RepairResult(
                success=False,
                message=f"Home directory not found: {home_dir}",
                fixed=0,
                failed=1,
                details=[],
            )

        fixed = 0
        details = []

        # Fix home directory itself
        os.chown(home_dir, user_info.pw_uid, user_info.pw_gid)
        os.chmod(home_dir, 0o700)
        fixed += 1
        details.append(f"Fixed: {home_dir}")

        # Fix .ssh directory if exists
        ssh_dir = home_dir / ".ssh"
        if ssh_dir.exists():
            os.chown(ssh_dir, user_info.pw_uid, user_info.pw_gid)
            os.chmod(ssh_dir, 0o700)
            fixed += 1
            details.append(f"Fixed: {ssh_dir}")

            # Fix SSH files
            for ssh_file in ssh_dir.iterdir():
                os.chown(ssh_file, user_info.pw_uid, user_info.pw_gid)
                if ssh_file.name in ("authorized_keys", "known_hosts", "config"):
                    os.chmod(ssh_file, 0o644)
                else:
                    os.chmod(ssh_file, 0o600)
                fixed += 1
                details.append(f"Fixed: {ssh_file}")

        return RepairResult(
            success=True,
            message=f"Fixed {fixed} files in {home_dir}",
            fixed=fixed,
            failed=0,
            details=details,
        )
