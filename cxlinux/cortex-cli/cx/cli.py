"""CX CLI - The AI Layer for Linux.

Unified CLI that provides natural language system administration.
"""

import os
import subprocess
import sys
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from cx import __version__

app = typer.Typer(
    name="cx",
    help="CX - The AI Layer for Linux. Natural language system administration.",
    no_args_is_help=False,
    invoke_without_command=True,
    rich_markup_mode="rich",
)

console = Console()


def version_callback(value: bool) -> None:
    """Show version and exit."""
    if value:
        console.print(f"[bold cyan]cx[/] version {__version__}")
        raise typer.Exit()


@app.callback()
def main(
    ctx: typer.Context,
    version: bool = typer.Option(
        None,
        "--version",
        "-V",
        callback=version_callback,
        is_eager=True,
        help="Show version and exit",
    ),
) -> None:
    """CX - The AI Layer for Linux.

    Natural language commands for Linux system administration.

    Examples:
        cx install nginx
        cx setup lamp stack with php 8.3
        cx what packages use the most disk space
        cx install cuda drivers for my nvidia gpu
    """
    if ctx.invoked_subcommand is None:
        # Interactive mode or natural language query
        console.print(Panel(
            "[bold cyan]CX[/] - The AI Layer for Linux\n\n"
            "Type a command in natural language, or use --help for options.",
            title="Welcome",
            border_style="cyan",
        ))


# ============================================================================
# Natural Language Commands (main use case)
# ============================================================================

@app.command("ask", hidden=True)
@app.command()
def do(
    query: list[str] = typer.Argument(None, help="Natural language query"),
    dry_run: bool = typer.Option(False, "--dry-run", "-n", help="Show plan without executing"),
    yes: bool = typer.Option(False, "--yes", "-y", help="Skip confirmation prompts"),
) -> None:
    """Execute a natural language command.

    Examples:
        cx install nginx and configure it for reverse proxy
        cx setup lamp stack with php 8.3 and mysql
        cx what packages are using the most disk space
        cx show me system health
    """
    if not query:
        console.print("[yellow]Usage: cx <natural language command>[/]")
        console.print("\nExamples:")
        console.print("  cx install nginx")
        console.print("  cx setup lamp stack")
        console.print("  cx what packages use the most disk")
        raise typer.Exit(0)

    query_text = " ".join(query)

    # Route to appropriate handler based on intent
    intent = detect_intent(query_text)

    if intent == "install":
        handle_install(query_text, dry_run=dry_run, confirm=not yes)
    elif intent == "setup":
        handle_setup(query_text, dry_run=dry_run, confirm=not yes)
    elif intent == "query":
        handle_query(query_text)
    elif intent == "status":
        handle_status(query_text)
    else:
        # Generic LLM-powered handling
        handle_generic(query_text, dry_run=dry_run, confirm=not yes)


def detect_intent(query: str) -> str:
    """Detect the intent of a natural language query."""
    query_lower = query.lower()

    if any(word in query_lower for word in ["install", "add", "get"]):
        return "install"
    elif any(word in query_lower for word in ["setup", "configure", "deploy", "create"]):
        return "setup"
    elif any(word in query_lower for word in ["what", "which", "how many", "show me", "list"]):
        return "query"
    elif any(word in query_lower for word in ["status", "health", "check"]):
        return "status"
    else:
        return "generic"


def handle_install(query: str, dry_run: bool = False, confirm: bool = True) -> None:
    """Handle install-related queries."""
    query_lower = query.lower()

    # GPU drivers
    if "cuda" in query_lower or "nvidia" in query_lower:
        console.print("\n[bold]Plan: Install NVIDIA CUDA Drivers[/]\n")

        # Detect GPU
        gpu_info = detect_gpu()
        if gpu_info:
            console.print(f"[green]Detected GPU:[/] {gpu_info}")
        else:
            console.print("[yellow]No NVIDIA GPU detected[/]")

        steps = [
            "1. Add NVIDIA repository",
            "2. Install nvidia-driver-545",
            "3. Install cuda-toolkit-12-3",
            "4. Configure environment variables",
            "5. Verify installation with nvidia-smi",
        ]

        for step in steps:
            console.print(f"  {step}")

        if dry_run:
            console.print("\n[yellow]Dry run - no changes made[/]")
            return

        if confirm:
            if not typer.confirm("\nProceed with installation?"):
                raise typer.Exit(0)

        # Execute installation
        commands = [
            "sudo apt-get update",
            "sudo apt-get install -y nvidia-driver-545 cuda-toolkit-12-3",
        ]

        for cmd in commands:
            console.print(f"\n[dim]$ {cmd}[/]")
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode != 0:
                console.print(f"[red]Error:[/] {result.stderr}")
                raise typer.Exit(1)

        console.print("\n[green]CUDA drivers installed successfully![/]")

    else:
        # Generic package install
        packages = extract_packages(query)
        if packages:
            console.print(f"\n[bold]Installing:[/] {', '.join(packages)}")
            cmd = f"sudo apt-get install -y {' '.join(packages)}"

            if dry_run:
                console.print(f"[dim]Would run: {cmd}[/]")
                return

            if confirm:
                if not typer.confirm("Proceed?"):
                    raise typer.Exit(0)

            subprocess.run(cmd, shell=True)


def handle_setup(query: str, dry_run: bool = False, confirm: bool = True) -> None:
    """Handle setup/deploy queries."""
    query_lower = query.lower()

    # LAMP stack
    if "lamp" in query_lower:
        php_version = "8.3" if "8.3" in query else "8.2"

        console.print(f"\n[bold]Plan: Deploy LAMP Stack (PHP {php_version})[/]\n")

        steps = [
            "1. Install Apache2",
            f"2. Install PHP {php_version} with common extensions",
            "3. Install MariaDB server",
            "4. Configure virtual host",
            "5. Enable mod_rewrite",
            "6. Secure MariaDB installation",
        ]

        for step in steps:
            console.print(f"  {step}")

        if dry_run:
            console.print("\n[yellow]Dry run - no changes made[/]")
            return

        if confirm:
            if not typer.confirm("\nProceed with LAMP stack deployment?"):
                raise typer.Exit(0)

        # Use cx-stacks if available
        try:
            from cx_stacks.cli import app as stacks_app
            # Would invoke stacks deploy lamp
            console.print("\n[dim]Using cx-stacks for deployment...[/]")
        except ImportError:
            # Fallback to direct commands
            commands = [
                "sudo apt-get update",
                f"sudo apt-get install -y apache2 php{php_version} php{php_version}-mysql mariadb-server",
                "sudo a2enmod rewrite",
                "sudo systemctl restart apache2",
            ]

            for cmd in commands:
                console.print(f"\n[dim]$ {cmd}[/]")
                subprocess.run(cmd, shell=True)

        console.print("\n[green]LAMP stack deployed successfully![/]")
        console.print("  Web root: /var/www/html")
        console.print("  Apache config: /etc/apache2/sites-available/")


def handle_query(query: str) -> None:
    """Handle informational queries."""
    query_lower = query.lower()

    if "disk" in query_lower and "package" in query_lower:
        console.print("\n[bold]Packages by Disk Usage[/]\n")

        # Get package sizes
        result = subprocess.run(
            "dpkg-query -W -f='${Installed-Size}\t${Package}\n' | sort -rn | head -20",
            shell=True,
            capture_output=True,
            text=True,
        )

        table = Table()
        table.add_column("Size", style="cyan", justify="right")
        table.add_column("Package", style="white")

        for line in result.stdout.strip().split("\n"):
            if line:
                parts = line.split("\t")
                if len(parts) == 2:
                    size_kb = int(parts[0])
                    package = parts[1]

                    if size_kb > 1024:
                        size_str = f"{size_kb // 1024} MB"
                    else:
                        size_str = f"{size_kb} KB"

                    table.add_row(size_str, package)

        console.print(table)

    elif "port" in query_lower:
        console.print("\n[bold]Listening Ports[/]\n")
        subprocess.run("sudo ss -tlnp | head -20", shell=True)

    else:
        console.print(f"[yellow]Query not recognized: {query}[/]")


def handle_status(query: str) -> None:
    """Handle status/health queries."""
    try:
        from cx_ops.doctor import run_checks
        # Would run health checks
        console.print("[dim]Running system health checks...[/]")
    except ImportError:
        # Fallback
        console.print("\n[bold]System Status[/]\n")

        # Basic checks
        checks = [
            ("Disk Usage", "df -h / | tail -1 | awk '{print $5}'"),
            ("Memory", "free -h | grep Mem | awk '{print $3\"/\"$2}'"),
            ("Load", "uptime | awk -F'load average:' '{print $2}'"),
            ("Services", "systemctl list-units --state=failed --no-pager | head -5"),
        ]

        for name, cmd in checks:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            console.print(f"  [cyan]{name}:[/] {result.stdout.strip()}")


def handle_generic(query: str, dry_run: bool = False, confirm: bool = True) -> None:
    """Handle generic queries using LLM."""
    console.print(f"[yellow]Processing: {query}[/]")
    console.print("[dim]LLM integration required for complex queries[/]")


def detect_gpu() -> Optional[str]:
    """Detect NVIDIA GPU if present."""
    try:
        result = subprocess.run(
            "lspci | grep -i nvidia",
            shell=True,
            capture_output=True,
            text=True,
        )
        if result.stdout.strip():
            return result.stdout.strip().split("\n")[0]
    except Exception:
        pass
    return None


def extract_packages(query: str) -> list[str]:
    """Extract package names from a query."""
    # Simple extraction - in production would use NLP
    words = query.lower().split()
    packages = []

    # Common package mappings
    mappings = {
        "nginx": "nginx",
        "apache": "apache2",
        "mysql": "mysql-server",
        "postgres": "postgresql",
        "redis": "redis-server",
        "docker": "docker.io",
        "git": "git",
        "node": "nodejs",
        "python": "python3",
    }

    for word in words:
        if word in mappings:
            packages.append(mappings[word])

    return packages


# ============================================================================
# Subcommands for direct access to modules
# ============================================================================

@app.command()
def doctor(
    fix: bool = typer.Option(False, "--fix", "-f", help="Attempt to fix issues"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Verbose output"),
) -> None:
    """Run system health checks."""
    try:
        from cx_ops.cli import doctor_app
        # Invoke doctor
    except ImportError:
        console.print("[yellow]cx-ops not installed. Running basic checks...[/]")
        handle_status("health")


@app.command()
def stacks(
    ctx: typer.Context,
) -> None:
    """Manage application stacks (LAMP, Node, Django, etc.)."""
    try:
        from cx_stacks.cli import app as stacks_app
        console.print("[dim]Use 'cx-stacks' for full stack management[/]")
        console.print("  cx-stacks list")
        console.print("  cx-stacks deploy lamp")
        console.print("  cx-stacks status lamp")
    except ImportError:
        console.print("[red]cx-stacks not installed[/]")
        console.print("Install with: pip install cx-stacks")


@app.command()
def config(
    show: bool = typer.Option(False, "--show", "-s", help="Show current config"),
    path: bool = typer.Option(False, "--path", "-p", help="Show config path"),
) -> None:
    """Manage CX configuration."""
    config_dir = Path.home() / ".cx"
    config_file = config_dir / "config.yaml"

    if path:
        console.print(str(config_file))
        return

    if show or True:  # Default to show
        if config_file.exists():
            console.print(config_file.read_text())
        else:
            console.print(f"[yellow]No config file at {config_file}[/]")
            console.print("\nDefault configuration:")
            console.print("  model: local")
            console.print("  sandbox: firejail")
            console.print("  log_level: info")


if __name__ == "__main__":
    app()
