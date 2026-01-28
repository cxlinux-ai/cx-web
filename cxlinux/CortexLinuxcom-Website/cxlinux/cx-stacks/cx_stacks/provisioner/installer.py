"""Package installation management."""

from dataclasses import dataclass
from typing import Callable, Optional

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

from ..utils import run_command, detect_distro, is_root


@dataclass
class InstallResult:
    """Package installation result."""

    success: bool
    installed: list[str]
    failed: list[str]
    message: str


class PackageInstaller:
    """System package installer."""

    def __init__(self, console: Optional[Console] = None) -> None:
        self.console = console or Console()
        self.distro = detect_distro()

    def _get_install_command(self) -> list[str]:
        """Get package install command for current distro."""
        if self.distro.family == "debian":
            return ["apt-get", "install", "-y"]
        elif self.distro.family == "rhel":
            return ["dnf", "install", "-y"]
        elif self.distro.family == "arch":
            return ["pacman", "-S", "--noconfirm"]
        return ["apt-get", "install", "-y"]

    def _get_update_command(self) -> list[str]:
        """Get package list update command."""
        if self.distro.family == "debian":
            return ["apt-get", "update"]
        elif self.distro.family == "rhel":
            return ["dnf", "check-update"]
        elif self.distro.family == "arch":
            return ["pacman", "-Sy"]
        return ["apt-get", "update"]

    def update_cache(self) -> bool:
        """Update package cache."""
        if not is_root():
            self.console.print("[yellow]Warning: Not running as root, using sudo[/]")

        cmd = self._get_update_command()
        if not is_root():
            cmd = ["sudo"] + cmd

        result = run_command(cmd)
        return result.success

    def is_installed(self, package: str) -> bool:
        """Check if a package is installed."""
        if self.distro.family == "debian":
            result = run_command(["dpkg", "-s", package])
            return result.success and "Status: install ok installed" in result.stdout
        elif self.distro.family == "rhel":
            result = run_command(["rpm", "-q", package])
            return result.success
        elif self.distro.family == "arch":
            result = run_command(["pacman", "-Q", package])
            return result.success
        return False

    def install(
        self,
        packages: list[str],
        progress_callback: Optional[Callable[[str, int, int], None]] = None,
    ) -> InstallResult:
        """Install packages."""
        if not packages:
            return InstallResult(
                success=True,
                installed=[],
                failed=[],
                message="No packages to install",
            )

        # Filter already installed
        to_install = [p for p in packages if not self.is_installed(p)]

        if not to_install:
            return InstallResult(
                success=True,
                installed=[],
                failed=[],
                message="All packages already installed",
            )

        # Update cache first
        self.update_cache()

        # Install command
        cmd = self._get_install_command()
        if not is_root():
            cmd = ["sudo"] + cmd

        installed = []
        failed = []

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=self.console,
        ) as progress:
            task = progress.add_task("Installing packages...", total=len(to_install))

            for i, package in enumerate(to_install):
                progress.update(task, description=f"Installing {package}...")

                if progress_callback:
                    progress_callback(package, i + 1, len(to_install))

                result = run_command(cmd + [package])

                if result.success:
                    installed.append(package)
                else:
                    failed.append(package)

                progress.advance(task)

        success = len(failed) == 0
        message = f"Installed {len(installed)} packages"
        if failed:
            message += f", {len(failed)} failed: {', '.join(failed)}"

        return InstallResult(
            success=success,
            installed=installed,
            failed=failed,
            message=message,
        )

    def remove(self, packages: list[str]) -> InstallResult:
        """Remove packages."""
        if not packages:
            return InstallResult(
                success=True,
                installed=[],
                failed=[],
                message="No packages to remove",
            )

        if self.distro.family == "debian":
            cmd = ["apt-get", "remove", "-y"]
        elif self.distro.family == "rhel":
            cmd = ["dnf", "remove", "-y"]
        elif self.distro.family == "arch":
            cmd = ["pacman", "-R", "--noconfirm"]
        else:
            cmd = ["apt-get", "remove", "-y"]

        if not is_root():
            cmd = ["sudo"] + cmd

        removed = []
        failed = []

        for package in packages:
            if not self.is_installed(package):
                continue

            result = run_command(cmd + [package])
            if result.success:
                removed.append(package)
            else:
                failed.append(package)

        return InstallResult(
            success=len(failed) == 0,
            installed=removed,
            failed=failed,
            message=f"Removed {len(removed)} packages",
        )

    def install_from_script(self, url: str, args: list[str] | None = None) -> bool:
        """Install from a remote script (e.g., Node.js setup)."""
        # Download script
        result = run_command(["curl", "-fsSL", url])
        if not result.success:
            return False

        # Execute
        cmd = ["bash", "-s", "--"]
        if args:
            cmd.extend(args)

        if not is_root():
            cmd = ["sudo"] + cmd

        # Pipe script to bash
        import subprocess
        proc = subprocess.run(
            cmd,
            input=result.stdout,
            text=True,
            capture_output=True,
        )

        return proc.returncode == 0
