"""Stack deployment orchestrator."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn

from ..stacks.base import BaseStack, StackConfig, StackStatus
from ..utils import run_command, detect_distro, is_root
from .installer import PackageInstaller
from .configurator import Configurator
from .validator import StackValidator


@dataclass
class DeployResult:
    """Deployment result."""

    success: bool
    status: StackStatus
    message: str
    logs: list[str]


class StackDeployer:
    """Stack deployment orchestrator."""

    def __init__(self, console: Optional[Console] = None) -> None:
        self.console = console or Console()
        self.installer = PackageInstaller(console)
        self.configurator = Configurator(console)
        self.validator = StackValidator(console)
        self.distro = detect_distro()

    def deploy(
        self,
        stack: BaseStack,
        dry_run: bool = False,
    ) -> DeployResult:
        """Deploy a stack."""
        logs: list[str] = []

        self.console.print(f"\n[bold blue]Deploying {stack.name} stack[/]")
        self.console.print(f"[dim]{stack.description}[/]\n")

        if not is_root():
            self.console.print("[yellow]Warning: Not running as root. Some operations may fail.[/]\n")

        # Step 1: Install packages
        self.console.print("[bold]Step 1/4: Installing packages[/]")
        packages = stack.get_packages(self.distro.family)
        logs.append(f"Packages: {', '.join(packages)}")

        if dry_run:
            self.console.print(f"[dim]Would install: {', '.join(packages)}[/]")
        else:
            result = self.installer.install(packages)
            if not result.success:
                logs.append(f"Package installation failed: {result.message}")
                return DeployResult(
                    success=False,
                    status=StackStatus.ERROR,
                    message=f"Package installation failed: {result.message}",
                    logs=logs,
                )
            logs.append(result.message)

        self.console.print("[green]✓[/] Packages installed\n")

        # Step 2: Configure
        self.console.print("[bold]Step 2/4: Writing configuration[/]")
        configs = stack.configure()
        logs.append(f"Config files: {len(configs)}")

        if dry_run:
            for path, _ in configs:
                self.console.print(f"[dim]Would write: {path}[/]")
        else:
            # Create web root directory
            web_root = stack.get_web_root()
            self.configurator.create_directory(web_root, owner="www-data:www-data")

            config_result = self.configurator.apply_configs(configs)
            if not config_result.success:
                logs.append(f"Configuration failed: {config_result.message}")
                return DeployResult(
                    success=False,
                    status=StackStatus.PARTIAL,
                    message=f"Configuration failed: {config_result.message}",
                    logs=logs,
                )
            logs.append(config_result.message)

        self.console.print("[green]✓[/] Configuration written\n")

        # Step 3: Post-install commands
        self.console.print("[bold]Step 3/4: Running post-install[/]")
        commands = stack.post_install()
        logs.append(f"Post-install commands: {len(commands)}")

        if dry_run:
            for cmd in commands:
                self.console.print(f"[dim]Would run: {cmd}[/]")
        else:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=self.console,
            ) as progress:
                task = progress.add_task("Running commands...", total=len(commands))

                for cmd in commands:
                    progress.update(task, description=f"Running: {cmd[:50]}...")

                    # Handle command
                    if cmd.startswith("cd "):
                        # Complex command with cd
                        result = run_command(["bash", "-c", cmd])
                    else:
                        result = run_command(["bash", "-c", cmd])

                    if not result.success:
                        # Log but continue - some commands may fail benignly
                        logs.append(f"Command failed (continuing): {cmd}")
                        self.console.print(f"[yellow]Warning: {cmd} returned non-zero[/]")

                    progress.advance(task)

        self.console.print("[green]✓[/] Post-install complete\n")

        # Step 4: Validate
        self.console.print("[bold]Step 4/4: Validating deployment[/]")

        if dry_run:
            self.console.print("[dim]Would validate stack[/]")
            return DeployResult(
                success=True,
                status=StackStatus.NOT_DEPLOYED,
                message="Dry run completed successfully",
                logs=logs,
            )

        validation = self.validator.validate_stack(stack)
        self.validator.print_summary(validation)

        if validation.success:
            self.console.print("\n[bold green]✓ Stack deployed successfully![/]")
            return DeployResult(
                success=True,
                status=StackStatus.RUNNING,
                message="Stack deployed and validated",
                logs=logs,
            )
        else:
            self.console.print("\n[bold yellow]Stack deployed with issues[/]")
            return DeployResult(
                success=False,
                status=StackStatus.PARTIAL,
                message=f"Validation found {validation.checks_failed} issues",
                logs=logs,
            )

    def remove(self, stack: BaseStack) -> DeployResult:
        """Remove a deployed stack."""
        logs: list[str] = []

        self.console.print(f"\n[bold red]Removing {stack.name} stack[/]\n")

        # Stop services
        self.console.print("[bold]Stopping services...[/]")
        for service in stack.services:
            result = run_command(["systemctl", "stop", service])
            if result.success:
                self.console.print(f"  [green]✓[/] Stopped {service}")
            else:
                self.console.print(f"  [yellow]![/] Could not stop {service}")
            logs.append(f"Stop {service}: {'ok' if result.success else 'failed'}")

        # Disable site
        domain = stack.config.domain or "localhost"
        self.configurator.disable_site(domain)

        # Note: We don't remove packages as they may be used by other stacks

        self.console.print("\n[green]✓[/] Stack removed")
        return DeployResult(
            success=True,
            status=StackStatus.NOT_DEPLOYED,
            message="Stack removed",
            logs=logs,
        )

    def status(self, stack: BaseStack) -> StackStatus:
        """Get stack status."""
        running = 0
        stopped = 0

        for service in stack.required_services:
            from ..utils import service_is_running
            if service_is_running(service.service_name):
                running += 1
            else:
                stopped += 1

        if running == 0:
            return StackStatus.STOPPED
        elif stopped == 0:
            return StackStatus.RUNNING
        else:
            return StackStatus.PARTIAL
