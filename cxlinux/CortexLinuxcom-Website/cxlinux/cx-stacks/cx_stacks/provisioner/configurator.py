"""Configuration file management."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from rich.console import Console

from ..config import get_settings
from ..utils import backup_file, run_command, is_root


@dataclass
class ConfigResult:
    """Configuration result."""

    success: bool
    files_written: list[Path]
    files_failed: list[Path]
    backups: list[Path]
    message: str


class Configurator:
    """Configuration file manager."""

    def __init__(self, console: Optional[Console] = None) -> None:
        self.console = console or Console()
        self.settings = get_settings()

    def write_config(
        self,
        path: Path,
        content: str,
        backup: bool = True,
        owner: Optional[str] = None,
        mode: int = 0o644,
    ) -> tuple[bool, Optional[Path]]:
        """Write a configuration file.

        Returns (success, backup_path).
        """
        backup_path = None

        try:
            # Create parent directories
            path.parent.mkdir(parents=True, exist_ok=True)

            # Backup existing file
            if backup and path.exists():
                backup_path = backup_file(path, self.settings.backup_dir)
                if backup_path:
                    self.console.print(f"[dim]Backed up {path} to {backup_path}[/]")

            # Write new content
            path.write_text(content)

            # Set permissions
            path.chmod(mode)

            # Set ownership if specified and running as root
            if owner and is_root():
                parts = owner.split(":")
                user = parts[0]
                group = parts[1] if len(parts) > 1 else user
                run_command(["chown", f"{user}:{group}", str(path)])

            return True, backup_path

        except PermissionError:
            self.console.print(f"[red]Permission denied: {path}[/]")
            return False, backup_path
        except Exception as e:
            self.console.print(f"[red]Error writing {path}: {e}[/]")
            return False, backup_path

    def apply_configs(
        self,
        configs: list[tuple[Path, str]],
        backup: bool = True,
    ) -> ConfigResult:
        """Apply multiple configuration files."""
        files_written: list[Path] = []
        files_failed: list[Path] = []
        backups: list[Path] = []

        for path, content in configs:
            self.console.print(f"[blue]Writing {path}...[/]")

            success, backup_path = self.write_config(path, content, backup=backup)

            if success:
                files_written.append(path)
                if backup_path:
                    backups.append(backup_path)
            else:
                files_failed.append(path)

        success = len(files_failed) == 0
        message = f"Wrote {len(files_written)} files"
        if files_failed:
            message += f", {len(files_failed)} failed"

        return ConfigResult(
            success=success,
            files_written=files_written,
            files_failed=files_failed,
            backups=backups,
            message=message,
        )

    def create_directory(
        self,
        path: Path,
        owner: Optional[str] = None,
        mode: int = 0o755,
    ) -> bool:
        """Create a directory with proper permissions."""
        try:
            path.mkdir(parents=True, exist_ok=True)
            path.chmod(mode)

            if owner and is_root():
                parts = owner.split(":")
                user = parts[0]
                group = parts[1] if len(parts) > 1 else user
                run_command(["chown", "-R", f"{user}:{group}", str(path)])

            return True
        except Exception as e:
            self.console.print(f"[red]Error creating {path}: {e}[/]")
            return False

    def enable_site(self, name: str, proxy: str = "nginx") -> bool:
        """Enable a site configuration."""
        if proxy == "nginx":
            available = Path(f"/etc/nginx/sites-available/{name}")
            enabled = Path(f"/etc/nginx/sites-enabled/{name}")

            if not available.exists():
                self.console.print(f"[red]Site config not found: {available}[/]")
                return False

            if enabled.exists() or enabled.is_symlink():
                enabled.unlink()

            enabled.symlink_to(available)
            return True

        elif proxy == "caddy":
            # Caddy uses a single Caddyfile, no enable/disable
            return True

        return False

    def disable_site(self, name: str, proxy: str = "nginx") -> bool:
        """Disable a site configuration."""
        if proxy == "nginx":
            enabled = Path(f"/etc/nginx/sites-enabled/{name}")

            if enabled.exists() or enabled.is_symlink():
                enabled.unlink()
                return True

        return False

    def test_nginx(self) -> tuple[bool, str]:
        """Test nginx configuration."""
        result = run_command(["nginx", "-t"])
        return result.success, result.stderr

    def reload_service(self, service: str) -> bool:
        """Reload a systemd service."""
        cmd = ["systemctl", "reload", service]
        if not is_root():
            cmd = ["sudo"] + cmd

        result = run_command(cmd)
        return result.success

    def restart_service(self, service: str) -> bool:
        """Restart a systemd service."""
        cmd = ["systemctl", "restart", service]
        if not is_root():
            cmd = ["sudo"] + cmd

        result = run_command(cmd)
        return result.success

    def enable_service(self, service: str) -> bool:
        """Enable a systemd service."""
        cmd = ["systemctl", "enable", service]
        if not is_root():
            cmd = ["sudo"] + cmd

        result = run_command(cmd)
        return result.success

    def daemon_reload(self) -> bool:
        """Reload systemd daemon."""
        cmd = ["systemctl", "daemon-reload"]
        if not is_root():
            cmd = ["sudo"] + cmd

        result = run_command(cmd)
        return result.success
