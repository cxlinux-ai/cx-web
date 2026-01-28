"""CX Ops CLI - Operations toolkit for Cortex Linux."""

import asyncio
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from cx_ops import __version__

# Initialize Typer app
app = typer.Typer(
    name="cx-ops",
    help="Operations toolkit for Cortex Linux",
    no_args_is_help=True,
    rich_markup_mode="rich",
)

# Sub-apps
doctor_app = typer.Typer(help="System diagnostics and health checks")
plugins_app = typer.Typer(help="Plugin management")
connectors_app = typer.Typer(help="LLM connector management")
update_app = typer.Typer(help="Update management")
repair_app = typer.Typer(help="System repair tools")

app.add_typer(doctor_app, name="doctor")
app.add_typer(plugins_app, name="plugins")
app.add_typer(connectors_app, name="connectors")
app.add_typer(update_app, name="update")
app.add_typer(repair_app, name="repair")

console = Console()


def version_callback(value: bool) -> None:
    """Show version and exit."""
    if value:
        console.print(f"[bold cyan]cx-ops[/] version {__version__}")
        raise typer.Exit()


@app.callback()
def main(
    version: bool = typer.Option(
        None,
        "--version",
        "-v",
        callback=version_callback,
        is_eager=True,
        help="Show version and exit",
    ),
) -> None:
    """CX Ops - Operations toolkit for Cortex Linux."""
    pass


# =============================================================================
# Doctor Commands
# =============================================================================


@doctor_app.callback(invoke_without_command=True)
def doctor_main(
    ctx: typer.Context,
    fix: bool = typer.Option(False, "--fix", "-f", help="Auto-fix detected issues"),
    check: Optional[str] = typer.Option(None, "--check", "-c", help="Run specific check"),
    verbose: bool = typer.Option(False, "--verbose", "-V", help="Verbose output"),
    json_output: bool = typer.Option(False, "--json", "-j", help="JSON output"),
    category: Optional[str] = typer.Option(None, "--category", help="Filter by category"),
) -> None:
    """Run system health checks.

    Run all checks:
        cx-ops doctor

    Run with auto-fix:
        cx-ops doctor --fix

    Run specific check:
        cx-ops doctor --check disk_space
    """
    if ctx.invoked_subcommand is not None:
        return

    from cx_ops.doctor import CheckRunner, DoctorReporter, ALL_CHECKS, apply_fix
    from cx_ops.doctor.checks import CheckCategory, CheckStatus
    from cx_ops.doctor.runner import RunnerConfig

    # Build config
    config = RunnerConfig()

    if check:
        config.check_ids = [check]

    if category:
        try:
            config.categories = [CheckCategory(category)]
        except ValueError:
            console.print(f"[red]Unknown category: {category}[/]")
            raise typer.Exit(1)

    # Run checks
    runner = CheckRunner(config)
    reporter = DoctorReporter(console)

    with reporter.create_progress() as progress:
        task = progress.add_task("Running health checks...", total=100)
        summary = runner.run()
        progress.update(task, completed=100)

    # Output results
    if json_output:
        reporter.print_json_report(summary)
    else:
        reporter.print_full_report(summary, verbose=verbose)

    # Apply fixes if requested
    if fix:
        fixable = [r for r in summary.results if r.fix_id and r.status in (CheckStatus.FAIL, CheckStatus.WARN)]

        if fixable:
            console.print("\n[bold]Applying fixes...[/]\n")
            for result in fixable:
                if result.fix_id:
                    apply_fix(result.fix_id, console, confirm=not verbose)

    # Exit with appropriate code
    if summary.failed > 0:
        raise typer.Exit(1)


@doctor_app.command("list")
def doctor_list() -> None:
    """List all available health checks."""
    from cx_ops.doctor import ALL_CHECKS

    table = Table(title="Available Health Checks")
    table.add_column("ID", style="cyan")
    table.add_column("Name")
    table.add_column("Category")
    table.add_column("Severity")
    table.add_column("Fix")

    for check in ALL_CHECKS:
        table.add_row(
            check.id,
            check.name,
            check.category.value,
            check.severity.value,
            check.fix_id or "-",
        )

    console.print(table)


# =============================================================================
# Plugin Commands
# =============================================================================


@plugins_app.command("list")
def plugins_list(
    available: bool = typer.Option(False, "--available", "-a", help="Show available plugins"),
) -> None:
    """List installed plugins."""
    from cx_ops.plugins import PluginRegistry

    registry = PluginRegistry()

    if available:
        plugins = registry.list_available()
        if not plugins:
            console.print("[dim]No plugins available[/]")
            return

        table = Table(title="Available Plugins")
        table.add_column("Name", style="cyan")
        table.add_column("Version")
        table.add_column("Type")
        table.add_column("Description")

        for info in plugins:
            table.add_row(
                info.name,
                info.version,
                info.plugin_type.value,
                info.description[:50],
            )

        console.print(table)
    else:
        installed = registry.list_installed()
        if not installed:
            console.print("[dim]No plugins installed[/]")
            console.print("Install plugins to /etc/cortex/plugins/")
            return

        table = Table(title="Installed Plugins")
        table.add_column("Name", style="cyan")
        table.add_column("Version")
        table.add_column("Status")
        table.add_column("Type")

        for info, state in installed:
            status = "[green]enabled[/]" if state.enabled else "[dim]disabled[/]"
            if state.error:
                status = f"[red]error[/]"
            table.add_row(
                info.name,
                info.version,
                status,
                info.plugin_type.value,
            )

        console.print(table)


@plugins_app.command("install")
def plugins_install(
    name: str = typer.Argument(..., help="Plugin name or path"),
) -> None:
    """Install a plugin."""
    from cx_ops.plugins import PluginLoader

    loader = PluginLoader()
    path = Path(name)

    if path.exists():
        result = loader.load_plugin(path)
    else:
        console.print(f"[red]Plugin not found: {name}[/]")
        console.print("Provide a path to a plugin directory")
        raise typer.Exit(1)

    if result.success:
        console.print(f"[green]Installed:[/] {result.plugin.info.name}")
    else:
        console.print(f"[red]Failed:[/] {result.error}")
        raise typer.Exit(1)


@plugins_app.command("create")
def plugins_create(
    name: str = typer.Argument(..., help="Plugin name"),
    plugin_type: str = typer.Option("command", "--type", "-t", help="Plugin type"),
    output: Optional[Path] = typer.Option(None, "--output", "-o", help="Output directory"),
) -> None:
    """Create a new plugin scaffold."""
    from cx_ops.plugins.loader import create_plugin_scaffold

    output_dir = output or Path.cwd()
    plugin_path = create_plugin_scaffold(name, plugin_type, output_dir)

    console.print(f"[green]Created plugin scaffold:[/] {plugin_path}")
    console.print("\nNext steps:")
    console.print(f"  1. Edit {plugin_path}/__init__.py")
    console.print(f"  2. Copy to /etc/cortex/plugins/{name}")
    console.print("  3. Run: cx-ops plugins list")


@plugins_app.command("enable")
def plugins_enable(name: str = typer.Argument(..., help="Plugin name")) -> None:
    """Enable a plugin."""
    from cx_ops.plugins import PluginRegistry

    registry = PluginRegistry()
    if registry.enable(name):
        console.print(f"[green]Enabled:[/] {name}")
    else:
        console.print(f"[red]Plugin not found:[/] {name}")
        raise typer.Exit(1)


@plugins_app.command("disable")
def plugins_disable(name: str = typer.Argument(..., help="Plugin name")) -> None:
    """Disable a plugin."""
    from cx_ops.plugins import PluginRegistry

    registry = PluginRegistry()
    if registry.disable(name):
        console.print(f"[yellow]Disabled:[/] {name}")
    else:
        console.print(f"[red]Plugin not found:[/] {name}")
        raise typer.Exit(1)


# =============================================================================
# Connector Commands
# =============================================================================


@connectors_app.command("list")
def connectors_list() -> None:
    """List configured LLM connectors."""
    from cx_ops.connectors import get_manager

    manager = get_manager()
    status = manager.get_status()

    table = Table(title="LLM Connectors")
    table.add_column("Name", style="cyan")
    table.add_column("Provider")
    table.add_column("Model")
    table.add_column("Default")

    for name, info in status["connectors"].items():
        is_default = "[green]*[/]" if name == status["default"] else ""
        table.add_row(
            name,
            info["provider"],
            info["model"],
            is_default,
        )

    if not status["connectors"]:
        console.print("[dim]No connectors configured[/]")
        console.print("\nSet API keys in environment:")
        console.print("  OPENAI_API_KEY")
        console.print("  ANTHROPIC_API_KEY")
        console.print("  GOOGLE_API_KEY")
    else:
        console.print(table)


@connectors_app.command("test")
def connectors_test(
    name: Optional[str] = typer.Argument(None, help="Connector to test (or all)"),
) -> None:
    """Test LLM connector(s)."""
    from cx_ops.connectors import get_manager

    manager = get_manager()

    async def run_tests():
        if name:
            success, message = await manager.test(name)
            if success:
                console.print(f"[green]{name}:[/] {message}")
            else:
                console.print(f"[red]{name}:[/] {message}")
                raise typer.Exit(1)
        else:
            results = await manager.test_all()
            for connector_name, (success, message) in results.items():
                if success:
                    console.print(f"[green]{connector_name}:[/] {message}")
                else:
                    console.print(f"[red]{connector_name}:[/] {message}")

    asyncio.run(run_tests())


@connectors_app.command("set-default")
def connectors_set_default(
    name: str = typer.Argument(..., help="Connector name"),
) -> None:
    """Set the default LLM connector."""
    from cx_ops.connectors import get_manager

    manager = get_manager()
    if manager.set_default(name):
        console.print(f"[green]Default connector set to:[/] {name}")
    else:
        console.print(f"[red]Connector not found:[/] {name}")
        raise typer.Exit(1)


# =============================================================================
# Update Commands
# =============================================================================


@update_app.command("check")
def update_check(
    force: bool = typer.Option(False, "--force", "-f", help="Force check (bypass cache)"),
) -> None:
    """Check for available updates."""
    from cx_ops.updates import UpdateChecker

    checker = UpdateChecker()

    async def run_check():
        with console.status("Checking for updates..."):
            result = await checker.check_all(force)

        # System update
        if result["system"]:
            update = result["system"]
            console.print(Panel(
                f"[bold]Cortex {update.version}[/] available\n"
                f"Released: {update.release_date.strftime('%Y-%m-%d')}\n"
                f"Security: {'Yes' if update.is_security else 'No'}\n"
                f"Reboot required: {'Yes' if update.requires_reboot else 'No'}",
                title="System Update",
                border_style="cyan",
            ))
        else:
            console.print("[green]System is up to date[/]")

        # Package updates
        packages = result["packages"]
        if packages["total"] > 0:
            console.print(f"\n[bold]{packages['total']} package update(s) available[/]")
            if packages["security"] > 0:
                console.print(f"[red]{packages['security']} security update(s)[/]")
        else:
            console.print("\n[green]All packages are up to date[/]")

    asyncio.run(run_check())


@update_app.command("apply")
def update_apply(
    system: bool = typer.Option(False, "--system", "-s", help="Apply system update"),
    packages: bool = typer.Option(False, "--packages", "-p", help="Apply package updates"),
    security_only: bool = typer.Option(False, "--security", help="Security updates only"),
    yes: bool = typer.Option(False, "--yes", "-y", help="Skip confirmation"),
) -> None:
    """Apply available updates."""
    from cx_ops.updates import UpdateChecker, UpdateInstaller

    checker = UpdateChecker()
    installer = UpdateInstaller()

    async def run_update():
        # Check what's available
        result = await checker.check_all()

        if system and result["system"]:
            update = result["system"]

            if not yes:
                if not typer.confirm(f"Install Cortex {update.version}?"):
                    raise typer.Exit(0)

            console.print(f"\n[bold]Installing Cortex {update.version}...[/]\n")

            def progress_cb(stage: str, percent: int):
                console.print(f"  {stage}: {percent}%")

            install_result = await installer.install_system_update(
                update,
                progress_callback=progress_cb,
            )

            if install_result.success:
                console.print(f"\n[green]{install_result.message}[/]")
                if install_result.requires_reboot:
                    console.print("[yellow]Reboot required to complete update[/]")
            else:
                console.print(f"\n[red]{install_result.message}[/]")
                raise typer.Exit(1)

        if packages or (not system and not packages):
            pkg_updates = result["packages"]["updates"]
            if not pkg_updates:
                console.print("[green]No package updates available[/]")
                return

            if not yes:
                count = len([p for p in pkg_updates if not security_only or p.is_security])
                if not typer.confirm(f"Install {count} package update(s)?"):
                    raise typer.Exit(0)

            console.print("\n[bold]Installing package updates...[/]\n")

            def progress_cb(stage: str, percent: int):
                console.print(f"  {stage}: {percent}%")

            install_result = await installer.install_package_updates(
                packages=pkg_updates if not security_only else None,
                security_only=security_only,
                progress_callback=progress_cb,
            )

            if install_result.success:
                console.print(f"\n[green]{install_result.message}[/]")
            else:
                console.print(f"\n[red]{install_result.message}[/]")
                raise typer.Exit(1)

    asyncio.run(run_update())


@update_app.command("rollback")
def update_rollback(
    snapshot_id: Optional[str] = typer.Argument(None, help="Snapshot ID (or latest)"),
    list_snapshots: bool = typer.Option(False, "--list", "-l", help="List available snapshots"),
) -> None:
    """Rollback to a previous snapshot."""
    from cx_ops.updates import RollbackManager

    rollback = RollbackManager()

    if list_snapshots:
        snapshots = rollback.list_snapshots()
        if not snapshots:
            console.print("[dim]No snapshots available[/]")
            return

        table = Table(title="Available Snapshots")
        table.add_column("ID", style="cyan")
        table.add_column("Date")
        table.add_column("Description")
        table.add_column("Size")

        for s in snapshots:
            table.add_row(
                s.id,
                s.created_at.strftime("%Y-%m-%d %H:%M"),
                s.description[:40] if s.description else "-",
                f"{s.size_bytes / 1024 / 1024:.1f} MB",
            )

        console.print(table)
        return

    # Get snapshot to restore
    if snapshot_id:
        snapshot = rollback.get_snapshot(snapshot_id)
    else:
        snapshot = rollback.get_latest_snapshot()

    if not snapshot:
        console.print("[red]No snapshot found[/]")
        raise typer.Exit(1)

    console.print(f"Rolling back to snapshot [bold]{snapshot.id}[/]")
    console.print(f"Created: {snapshot.created_at}")

    if not typer.confirm("Proceed with rollback?"):
        raise typer.Exit(0)

    success, message = rollback.rollback(snapshot.id)

    if success:
        console.print(f"[green]{message}[/]")
    else:
        console.print(f"[red]{message}[/]")
        raise typer.Exit(1)


# =============================================================================
# Repair Commands
# =============================================================================


@repair_app.command("apt")
def repair_apt(
    dry_run: bool = typer.Option(False, "--dry-run", "-n", help="Show what would be done"),
    locks_only: bool = typer.Option(False, "--locks", help="Only clear lock files"),
) -> None:
    """Repair APT package manager issues."""
    from cx_ops.repair import AptRepair

    repair = AptRepair(console)

    # Diagnose first
    issues = repair.diagnose()

    if not issues:
        console.print("[green]No APT issues detected[/]")
        return

    console.print(f"[yellow]Found {len(issues)} issue(s):[/]\n")
    for issue in issues:
        console.print(f"  - {issue.description}")

    console.print()

    if locks_only:
        result = repair.repair_locks()
    else:
        result = repair.repair_all(dry_run=dry_run)

    if result.success:
        console.print(f"[green]{result.message}[/]")
    else:
        console.print(f"[red]{result.message}[/]")
        raise typer.Exit(1)


@repair_app.command("permissions")
def repair_permissions(
    dry_run: bool = typer.Option(False, "--dry-run", "-n", help="Show what would be done"),
    cortex_only: bool = typer.Option(False, "--cortex", help="Only fix Cortex directories"),
    user: Optional[str] = typer.Option(None, "--user", "-u", help="Fix user home directory"),
) -> None:
    """Repair file permission issues."""
    from cx_ops.repair import PermissionsRepair

    repair = PermissionsRepair(console)

    if user:
        result = repair.fix_home_dir(user)
    elif cortex_only:
        result = repair.fix_cortex_dirs()
    else:
        result = repair.repair_all(dry_run=dry_run)

    if result.success:
        console.print(f"[green]{result.message}[/]")
    else:
        console.print(f"[red]{result.message}[/]")
        raise typer.Exit(1)


@repair_app.command("services")
def repair_services(
    dry_run: bool = typer.Option(False, "--dry-run", "-n", help="Show what would be done"),
    restart_failed: bool = typer.Option(False, "--restart-failed", help="Only restart failed services"),
    service: Optional[str] = typer.Option(None, "--service", "-s", help="Restart specific service"),
) -> None:
    """Repair systemd service issues."""
    from cx_ops.repair import ServicesRepair

    repair = ServicesRepair(console)

    if service:
        result = repair.restart_service(service)
    elif restart_failed:
        result = repair.restart_failed()
    else:
        result = repair.repair_all(dry_run=dry_run)

    if result.success:
        console.print(f"[green]{result.message}[/]")
        if result.services_fixed:
            console.print(f"  Fixed: {', '.join(result.services_fixed)}")
    else:
        console.print(f"[red]{result.message}[/]")
        if result.services_failed:
            console.print(f"  Failed: {', '.join(result.services_failed)}")
        raise typer.Exit(1)


# =============================================================================
# Entry Point
# =============================================================================

if __name__ == "__main__":
    app()
