"""CX Stacks CLI."""

from pathlib import Path
from typing import Optional
import secrets

import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from .stacks import AVAILABLE_STACKS, get_stack, list_stacks, StackConfig
from .provisioner import StackDeployer, StackValidator
from .proxy import NginxProxy, CaddyProxy, SSLManager, ProxyConfig
from .docker import ComposeGenerator, ComposeManager
from .config import get_settings

app = typer.Typer(
    name="cx-stacks",
    help="Application stack provisioning for Cortex Linux",
    no_args_is_help=True,
)

console = Console()


# Stack commands
@app.command("list")
def list_available_stacks():
    """List available stacks."""
    table = Table(title="Available Stacks")
    table.add_column("Name", style="cyan")
    table.add_column("Description", style="white")
    table.add_column("Version", style="green")

    for name in list_stacks():
        stack_class = get_stack(name)
        if stack_class:
            table.add_row(name, stack_class.description, stack_class.version)

    console.print(table)


@app.command("info")
def stack_info(stack_name: str = typer.Argument(..., help="Stack name")):
    """Show stack details."""
    stack_class = get_stack(stack_name)
    if not stack_class:
        console.print(f"[red]Unknown stack: {stack_name}[/]")
        raise typer.Exit(1)

    stack = stack_class()

    console.print(Panel(f"[bold]{stack.name}[/] - {stack.description}"))
    console.print(f"\n[bold]Version:[/] {stack.version}")

    # Services
    console.print("\n[bold]Services:[/]")
    for service in stack.required_services:
        console.print(f"  • {service.name} (port {service.port})")

    # Default ports
    console.print("\n[bold]Ports:[/]")
    for name, port in stack.default_ports.items():
        console.print(f"  • {name}: {port}")

    # Packages (Debian)
    console.print("\n[bold]Packages (Debian):[/]")
    packages = stack.get_packages("debian")
    console.print(f"  {', '.join(packages[:5])}...")


@app.command("deploy")
def deploy_stack(
    stack_name: str = typer.Argument(..., help="Stack to deploy"),
    domain: Optional[str] = typer.Option(None, "--domain", "-d", help="Domain name"),
    ssl: bool = typer.Option(False, "--ssl", help="Enable SSL with Let's Encrypt"),
    port: int = typer.Option(80, "--port", "-p", help="Application port"),
    db_name: str = typer.Option("app_db", "--db-name", help="Database name"),
    db_user: str = typer.Option("app_user", "--db-user", help="Database user"),
    db_password: Optional[str] = typer.Option(None, "--db-password", help="Database password"),
    app_path: Optional[Path] = typer.Option(None, "--app", help="Application path"),
    project: Optional[str] = typer.Option(None, "--project", help="Project name (Django)"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Show what would be done"),
):
    """Deploy a stack."""
    stack_class = get_stack(stack_name)
    if not stack_class:
        console.print(f"[red]Unknown stack: {stack_name}[/]")
        raise typer.Exit(1)

    # Generate password if not provided
    if not db_password:
        db_password = secrets.token_urlsafe(16)
        console.print(f"[yellow]Generated DB password: {db_password}[/]")

    # Build config
    config = StackConfig(
        domain=domain,
        port=port,
        ssl=ssl,
        db_name=db_name,
        db_user=db_user,
        db_password=db_password,
        app_path=app_path,
        extra={"project": project} if project else {},
    )

    stack = stack_class(config)
    deployer = StackDeployer(console)

    result = deployer.deploy(stack, dry_run=dry_run)

    if not result.success:
        console.print(f"\n[red]Deployment failed: {result.message}[/]")
        raise typer.Exit(1)

    # SSL setup if requested
    if ssl and domain and not dry_run:
        ssl_manager = SSLManager(console)
        console.print("\n[bold]Setting up SSL...[/]")
        ssl_manager.obtain_certificate(domain, nginx=True)


@app.command("remove")
def remove_stack(
    stack_name: str = typer.Argument(..., help="Stack to remove"),
    domain: Optional[str] = typer.Option(None, "--domain", "-d", help="Domain name"),
):
    """Remove a deployed stack."""
    stack_class = get_stack(stack_name)
    if not stack_class:
        console.print(f"[red]Unknown stack: {stack_name}[/]")
        raise typer.Exit(1)

    config = StackConfig(domain=domain)
    stack = stack_class(config)
    deployer = StackDeployer(console)

    result = deployer.remove(stack)

    if not result.success:
        console.print(f"[red]Removal failed: {result.message}[/]")
        raise typer.Exit(1)


@app.command("status")
def stack_status(
    stack_name: str = typer.Argument(..., help="Stack to check"),
    domain: Optional[str] = typer.Option(None, "--domain", "-d", help="Domain name"),
):
    """Show stack status."""
    stack_class = get_stack(stack_name)
    if not stack_class:
        console.print(f"[red]Unknown stack: {stack_name}[/]")
        raise typer.Exit(1)

    config = StackConfig(domain=domain)
    stack = stack_class(config)
    validator = StackValidator(console)

    result = validator.validate_stack(stack)
    validator.print_summary(result)


@app.command("logs")
def stack_logs(
    stack_name: str = typer.Argument(..., help="Stack name"),
    domain: Optional[str] = typer.Option(None, "--domain", "-d", help="Domain name"),
    lines: int = typer.Option(50, "--lines", "-n", help="Number of lines"),
):
    """View stack logs."""
    stack_class = get_stack(stack_name)
    if not stack_class:
        console.print(f"[red]Unknown stack: {stack_name}[/]")
        raise typer.Exit(1)

    config = StackConfig(domain=domain)
    stack = stack_class(config)

    log_paths = stack.get_log_paths()

    for log_path in log_paths:
        if log_path.exists():
            console.print(f"\n[bold]{log_path}[/]")
            console.print("-" * 60)
            try:
                content = log_path.read_text()
                log_lines = content.strip().split("\n")[-lines:]
                for line in log_lines:
                    console.print(line)
            except PermissionError:
                console.print("[red]Permission denied[/]")


# Proxy commands
proxy_app = typer.Typer(help="Reverse proxy management")
app.add_typer(proxy_app, name="proxy")


@proxy_app.command("add")
def proxy_add(
    domain: str = typer.Argument(..., help="Domain name"),
    backend: str = typer.Argument(..., help="Backend (e.g., 127.0.0.1:3000)"),
    websocket: bool = typer.Option(False, "--websocket", "-w", help="Enable WebSocket"),
    proxy_type: str = typer.Option("nginx", "--type", "-t", help="Proxy type (nginx/caddy)"),
):
    """Add reverse proxy for a domain."""
    if proxy_type == "nginx":
        proxy = NginxProxy(console)
        config = ProxyConfig(
            domain=domain,
            backend=backend,
            websocket=websocket,
        )
        if not proxy.add(config):
            raise typer.Exit(1)
    elif proxy_type == "caddy":
        from .proxy.caddy import CaddyProxy, CaddyProxyConfig
        proxy = CaddyProxy(console)
        config = CaddyProxyConfig(
            domain=domain,
            backend=backend,
            websocket=websocket,
        )
        if not proxy.add(config):
            raise typer.Exit(1)


@proxy_app.command("remove")
def proxy_remove(
    domain: str = typer.Argument(..., help="Domain to remove"),
    proxy_type: str = typer.Option("nginx", "--type", "-t", help="Proxy type"),
):
    """Remove proxy for a domain."""
    if proxy_type == "nginx":
        proxy = NginxProxy(console)
        proxy.remove(domain)
    elif proxy_type == "caddy":
        proxy = CaddyProxy(console)
        proxy.remove(domain)


@proxy_app.command("list")
def proxy_list(
    proxy_type: str = typer.Option("nginx", "--type", "-t", help="Proxy type"),
):
    """List configured proxies."""
    table = Table(title="Configured Sites")
    table.add_column("Domain", style="cyan")
    table.add_column("Enabled", style="green")

    if proxy_type == "nginx":
        proxy = NginxProxy(console)
        for domain, enabled in proxy.list_sites():
            table.add_row(domain, "Yes" if enabled else "No")
    elif proxy_type == "caddy":
        proxy = CaddyProxy(console)
        for domain in proxy.list_sites():
            table.add_row(domain, "Yes")

    console.print(table)


@proxy_app.command("ssl")
def proxy_ssl(
    domain: str = typer.Argument(..., help="Domain for SSL"),
    email: Optional[str] = typer.Option(None, "--email", "-e", help="Email for Let's Encrypt"),
    staging: bool = typer.Option(False, "--staging", help="Use staging server"),
):
    """Enable SSL for a domain."""
    ssl_manager = SSLManager(console)
    if not ssl_manager.obtain_certificate(domain, email=email, staging=staging):
        raise typer.Exit(1)


@proxy_app.command("certs")
def proxy_certs():
    """List SSL certificates."""
    ssl_manager = SSLManager(console)
    ssl_manager.print_certificates()


# Docker commands
docker_app = typer.Typer(help="Docker stack management")
app.add_typer(docker_app, name="docker")


@docker_app.command("generate")
def docker_generate(
    stack_name: str = typer.Argument(..., help="Stack to generate"),
    output: Path = typer.Option(Path("."), "--output", "-o", help="Output directory"),
    domain: Optional[str] = typer.Option(None, "--domain", "-d", help="Domain name"),
):
    """Generate docker-compose.yml for a stack."""
    stack_class = get_stack(stack_name)
    if not stack_class:
        console.print(f"[red]Unknown stack: {stack_name}[/]")
        raise typer.Exit(1)

    config = StackConfig(domain=domain)
    stack = stack_class(config)
    generator = ComposeGenerator(console)

    compose_path = generator.generate(stack, output)
    console.print(f"\n[green]Generated {compose_path}[/]")
    console.print(f"Run with: cd {output} && docker compose up -d")


@docker_app.command("up")
def docker_up(
    path: Path = typer.Option(Path("."), "--path", "-p", help="Compose directory"),
    build: bool = typer.Option(False, "--build", help="Build images"),
):
    """Start Docker stack."""
    manager = ComposeManager(console)
    result = manager.up(path, build=build)
    if not result.success:
        raise typer.Exit(1)


@docker_app.command("down")
def docker_down(
    path: Path = typer.Option(Path("."), "--path", "-p", help="Compose directory"),
    volumes: bool = typer.Option(False, "--volumes", "-v", help="Remove volumes"),
):
    """Stop Docker stack."""
    manager = ComposeManager(console)
    result = manager.down(path, volumes=volumes)
    if not result.success:
        raise typer.Exit(1)


@docker_app.command("logs")
def docker_logs(
    service: Optional[str] = typer.Argument(None, help="Service name"),
    path: Path = typer.Option(Path("."), "--path", "-p", help="Compose directory"),
    follow: bool = typer.Option(False, "--follow", "-f", help="Follow logs"),
    tail: int = typer.Option(100, "--tail", "-n", help="Number of lines"),
):
    """View Docker stack logs."""
    manager = ComposeManager(console)
    result = manager.logs(path, service=service, follow=follow, tail=tail)
    console.print(result.output)


@docker_app.command("ps")
def docker_ps(
    path: Path = typer.Option(Path("."), "--path", "-p", help="Compose directory"),
):
    """Show Docker stack status."""
    manager = ComposeManager(console)
    result = manager.ps(path)
    console.print(result.output)


# Config commands
config_app = typer.Typer(help="Configuration management")
app.add_typer(config_app, name="config")


@config_app.command("show")
def config_show():
    """Show current configuration."""
    settings = get_settings()

    table = Table(title="Configuration")
    table.add_column("Setting", style="cyan")
    table.add_column("Value", style="white")

    table.add_row("Config Directory", str(settings.config_dir))
    table.add_row("Templates Directory", str(settings.templates_dir))
    table.add_row("Backup Directory", str(settings.backup_dir))
    table.add_row("Default Web Root", str(settings.default_web_root))
    table.add_row("Default Proxy", settings.default_proxy)
    table.add_row("SSL Email", settings.ssl_email or "(not set)")
    table.add_row("Docker Network", settings.docker_network)
    table.add_row("Dry Run", str(settings.dry_run))
    table.add_row("Auto Firewall", str(settings.auto_firewall))

    console.print(table)


@config_app.command("set")
def config_set(
    key: str = typer.Argument(..., help="Setting key"),
    value: str = typer.Argument(..., help="Setting value"),
):
    """Set a configuration value."""
    console.print(f"[yellow]Set CX_STACKS_{key.upper()}={value} in environment[/]")
    console.print("Or add to ~/.cx/stacks/.env")


if __name__ == "__main__":
    app()
