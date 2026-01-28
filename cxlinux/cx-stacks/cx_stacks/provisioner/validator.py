"""Stack validation."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional
import httpx

from rich.console import Console
from rich.table import Table

from ..stacks.base import BaseStack
from ..utils import service_is_running, port_in_use


@dataclass
class ValidationResult:
    """Validation result."""

    success: bool
    checks_passed: int
    checks_failed: int
    issues: list[str]
    warnings: list[str]


class StackValidator:
    """Stack health and configuration validator."""

    def __init__(self, console: Optional[Console] = None) -> None:
        self.console = console or Console()

    def validate_stack(self, stack: BaseStack) -> ValidationResult:
        """Run all validation checks on a stack."""
        issues: list[str] = []
        warnings: list[str] = []
        checks_passed = 0
        checks_failed = 0

        # Check services
        self.console.print("[blue]Checking services...[/]")
        for service in stack.required_services:
            if service_is_running(service.service_name):
                checks_passed += 1
                self.console.print(f"  [green]✓[/] {service.name} running")
            else:
                checks_failed += 1
                issues.append(f"{service.name} is not running")
                self.console.print(f"  [red]✗[/] {service.name} not running")

        # Check ports
        self.console.print("[blue]Checking ports...[/]")
        for name, port in stack.default_ports.items():
            if port_in_use(port):
                checks_passed += 1
                self.console.print(f"  [green]✓[/] Port {port} ({name}) listening")
            else:
                if name in ("http", "https", "app"):
                    checks_failed += 1
                    issues.append(f"Port {port} ({name}) not listening")
                    self.console.print(f"  [red]✗[/] Port {port} ({name}) not listening")
                else:
                    warnings.append(f"Port {port} ({name}) not listening")
                    self.console.print(f"  [yellow]![/] Port {port} ({name}) not listening")

        # Check config files
        self.console.print("[blue]Checking configuration files...[/]")
        for service in stack.required_services:
            for config_path in service.config_paths:
                if config_path.exists():
                    checks_passed += 1
                    self.console.print(f"  [green]✓[/] {config_path} exists")
                else:
                    warnings.append(f"Config not found: {config_path}")
                    self.console.print(f"  [yellow]![/] {config_path} not found")

        # Check web root
        web_root = stack.get_web_root()
        self.console.print("[blue]Checking web root...[/]")
        if web_root.exists():
            checks_passed += 1
            self.console.print(f"  [green]✓[/] {web_root} exists")
        else:
            warnings.append(f"Web root not found: {web_root}")
            self.console.print(f"  [yellow]![/] {web_root} not found")

        # Run stack-specific validation
        self.console.print("[blue]Running stack validation...[/]")
        stack_valid, stack_issues = stack.validate()
        if stack_valid:
            checks_passed += 1
            self.console.print("  [green]✓[/] Stack validation passed")
        else:
            checks_failed += len(stack_issues)
            issues.extend(stack_issues)
            for issue in stack_issues:
                self.console.print(f"  [red]✗[/] {issue}")

        return ValidationResult(
            success=checks_failed == 0,
            checks_passed=checks_passed,
            checks_failed=checks_failed,
            issues=issues,
            warnings=warnings,
        )

    def check_http(
        self,
        url: str,
        expected_status: int = 200,
        timeout: float = 10.0,
    ) -> tuple[bool, str]:
        """Check HTTP endpoint."""
        try:
            response = httpx.get(url, timeout=timeout, follow_redirects=True)
            if response.status_code == expected_status:
                return True, f"HTTP {response.status_code}"
            return False, f"Expected {expected_status}, got {response.status_code}"
        except httpx.ConnectError:
            return False, "Connection refused"
        except httpx.TimeoutException:
            return False, "Timeout"
        except Exception as e:
            return False, str(e)

    def check_database(
        self,
        db_type: str,
        host: str = "localhost",
        port: int = 3306,
        user: str = "root",
        password: str = "",
        database: str = "",
    ) -> tuple[bool, str]:
        """Check database connection."""
        if db_type == "mysql" or db_type == "mariadb":
            from ..utils import run_command

            cmd = ["mysql", f"-h{host}", f"-P{port}", f"-u{user}"]
            if password:
                cmd.append(f"-p{password}")
            if database:
                cmd.append(database)
            cmd.extend(["-e", "SELECT 1"])

            result = run_command(cmd)
            if result.success:
                return True, "Connected"
            return False, result.stderr.strip()

        elif db_type == "postgres":
            from ..utils import run_command

            env = {"PGPASSWORD": password} if password else {}
            cmd = ["psql", f"-h{host}", f"-p{port}", f"-U{user}"]
            if database:
                cmd.extend(["-d", database])
            cmd.extend(["-c", "SELECT 1"])

            result = run_command(cmd, env=env)
            if result.success:
                return True, "Connected"
            return False, result.stderr.strip()

        return False, f"Unknown database type: {db_type}"

    def print_summary(self, result: ValidationResult) -> None:
        """Print validation summary table."""
        table = Table(title="Validation Summary")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")

        table.add_row("Status", "[green]PASS[/]" if result.success else "[red]FAIL[/]")
        table.add_row("Checks Passed", str(result.checks_passed))
        table.add_row("Checks Failed", str(result.checks_failed))
        table.add_row("Warnings", str(len(result.warnings)))

        self.console.print(table)

        if result.issues:
            self.console.print("\n[red]Issues:[/]")
            for issue in result.issues:
                self.console.print(f"  • {issue}")

        if result.warnings:
            self.console.print("\n[yellow]Warnings:[/]")
            for warning in result.warnings:
                self.console.print(f"  • {warning}")
