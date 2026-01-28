"""Docker Compose generation and management."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional
import secrets

import yaml
from rich.console import Console

from ..stacks.base import BaseStack
from ..config import get_settings
from ..utils import run_command


@dataclass
class ComposeResult:
    """Docker Compose operation result."""

    success: bool
    message: str
    output: str


class ComposeGenerator:
    """Docker Compose file generator."""

    def __init__(self, console: Optional[Console] = None) -> None:
        self.console = console or Console()
        self.settings = get_settings()

    def generate(self, stack: BaseStack, output_dir: Path) -> Path:
        """Generate docker-compose.yml for a stack."""
        services = stack.get_docker_services()
        volumes = stack.get_docker_volumes()

        compose = {
            "version": self.settings.docker_compose_version,
            "services": services,
        }

        if volumes:
            compose["volumes"] = volumes

        # Add default network
        compose["networks"] = {
            "default": {
                "name": self.settings.docker_network,
                "driver": "bridge",
            }
        }

        # Write compose file
        output_dir.mkdir(parents=True, exist_ok=True)
        compose_path = output_dir / "docker-compose.yml"
        compose_path.write_text(yaml.dump(compose, default_flow_style=False, sort_keys=False))

        self.console.print(f"[green]✓[/] Generated {compose_path}")

        # Generate .env file
        self._generate_env_file(stack, output_dir)

        return compose_path

    def _generate_env_file(self, stack: BaseStack, output_dir: Path) -> None:
        """Generate .env file for docker-compose."""
        env_vars = {
            "DOMAIN": stack.config.domain or "localhost",
            "DB_NAME": stack.config.db_name,
            "DB_USER": stack.config.db_user,
            "DB_PASSWORD": stack.config.db_password or secrets.token_urlsafe(16),
            "DB_ROOT_PASSWORD": secrets.token_urlsafe(24),
        }

        # Add stack-specific env vars
        env_vars.update(stack.get_environment_vars())

        env_content = "\n".join(f"{k}={v}" for k, v in env_vars.items())
        env_path = output_dir / ".env"
        env_path.write_text(env_content)

        # Secure permissions
        env_path.chmod(0o600)

        self.console.print(f"[green]✓[/] Generated {env_path}")

    def generate_dockerfile(
        self,
        base_image: str,
        commands: list[str],
        output_dir: Path,
        workdir: str = "/app",
        expose: list[int] | None = None,
        entrypoint: str | None = None,
    ) -> Path:
        """Generate a Dockerfile."""
        lines = [
            f"FROM {base_image}",
            "",
            f"WORKDIR {workdir}",
            "",
        ]

        # Add commands
        for cmd in commands:
            lines.append(f"RUN {cmd}")

        if expose:
            lines.append("")
            for port in expose:
                lines.append(f"EXPOSE {port}")

        if entrypoint:
            lines.append("")
            lines.append(f'ENTRYPOINT ["{entrypoint}"]')

        dockerfile_path = output_dir / "Dockerfile"
        dockerfile_path.write_text("\n".join(lines))

        self.console.print(f"[green]✓[/] Generated {dockerfile_path}")
        return dockerfile_path


class ComposeManager:
    """Docker Compose operations manager."""

    def __init__(self, console: Optional[Console] = None) -> None:
        self.console = console or Console()

    def _get_compose_cmd(self) -> list[str]:
        """Get docker compose command (v1 or v2)."""
        # Try docker compose (v2) first
        result = run_command(["docker", "compose", "version"])
        if result.success:
            return ["docker", "compose"]

        # Fallback to docker-compose (v1)
        result = run_command(["docker-compose", "version"])
        if result.success:
            return ["docker-compose"]

        raise RuntimeError("Docker Compose not found")

    def up(
        self,
        compose_dir: Path,
        detach: bool = True,
        build: bool = False,
    ) -> ComposeResult:
        """Start containers."""
        cmd = self._get_compose_cmd()
        cmd.extend(["-f", str(compose_dir / "docker-compose.yml"), "up"])

        if detach:
            cmd.append("-d")
        if build:
            cmd.append("--build")

        self.console.print("[blue]Starting containers...[/]")
        result = run_command(cmd, cwd=compose_dir)

        if result.success:
            self.console.print("[green]✓[/] Containers started")
            return ComposeResult(True, "Containers started", result.stdout)
        else:
            self.console.print(f"[red]✗[/] Failed: {result.stderr}")
            return ComposeResult(False, "Failed to start", result.stderr)

    def down(
        self,
        compose_dir: Path,
        volumes: bool = False,
    ) -> ComposeResult:
        """Stop and remove containers."""
        cmd = self._get_compose_cmd()
        cmd.extend(["-f", str(compose_dir / "docker-compose.yml"), "down"])

        if volumes:
            cmd.append("-v")

        self.console.print("[blue]Stopping containers...[/]")
        result = run_command(cmd, cwd=compose_dir)

        if result.success:
            self.console.print("[green]✓[/] Containers stopped")
            return ComposeResult(True, "Containers stopped", result.stdout)
        else:
            return ComposeResult(False, "Failed to stop", result.stderr)

    def restart(self, compose_dir: Path) -> ComposeResult:
        """Restart containers."""
        cmd = self._get_compose_cmd()
        cmd.extend(["-f", str(compose_dir / "docker-compose.yml"), "restart"])

        result = run_command(cmd, cwd=compose_dir)

        if result.success:
            self.console.print("[green]✓[/] Containers restarted")
            return ComposeResult(True, "Containers restarted", result.stdout)
        else:
            return ComposeResult(False, "Failed to restart", result.stderr)

    def logs(
        self,
        compose_dir: Path,
        service: Optional[str] = None,
        follow: bool = False,
        tail: int = 100,
    ) -> ComposeResult:
        """Get container logs."""
        cmd = self._get_compose_cmd()
        cmd.extend(["-f", str(compose_dir / "docker-compose.yml"), "logs"])

        if follow:
            cmd.append("-f")
        cmd.extend(["--tail", str(tail)])

        if service:
            cmd.append(service)

        result = run_command(cmd, cwd=compose_dir)
        return ComposeResult(result.success, "Logs retrieved", result.stdout)

    def ps(self, compose_dir: Path) -> ComposeResult:
        """List containers."""
        cmd = self._get_compose_cmd()
        cmd.extend(["-f", str(compose_dir / "docker-compose.yml"), "ps"])

        result = run_command(cmd, cwd=compose_dir)
        return ComposeResult(result.success, "Status retrieved", result.stdout)

    def exec(
        self,
        compose_dir: Path,
        service: str,
        command: list[str],
    ) -> ComposeResult:
        """Execute command in container."""
        cmd = self._get_compose_cmd()
        cmd.extend(["-f", str(compose_dir / "docker-compose.yml"), "exec", service])
        cmd.extend(command)

        result = run_command(cmd, cwd=compose_dir)
        return ComposeResult(result.success, "Command executed", result.stdout)

    def pull(self, compose_dir: Path) -> ComposeResult:
        """Pull latest images."""
        cmd = self._get_compose_cmd()
        cmd.extend(["-f", str(compose_dir / "docker-compose.yml"), "pull"])

        self.console.print("[blue]Pulling images...[/]")
        result = run_command(cmd, cwd=compose_dir)

        if result.success:
            self.console.print("[green]✓[/] Images pulled")
            return ComposeResult(True, "Images pulled", result.stdout)
        else:
            return ComposeResult(False, "Failed to pull", result.stderr)

    def build(self, compose_dir: Path, no_cache: bool = False) -> ComposeResult:
        """Build images."""
        cmd = self._get_compose_cmd()
        cmd.extend(["-f", str(compose_dir / "docker-compose.yml"), "build"])

        if no_cache:
            cmd.append("--no-cache")

        self.console.print("[blue]Building images...[/]")
        result = run_command(cmd, cwd=compose_dir)

        if result.success:
            self.console.print("[green]✓[/] Images built")
            return ComposeResult(True, "Images built", result.stdout)
        else:
            return ComposeResult(False, "Failed to build", result.stderr)

    def is_running(self, compose_dir: Path) -> bool:
        """Check if containers are running."""
        result = self.ps(compose_dir)
        return result.success and "Up" in result.output
