"""Rich diagnostic report generation for Cortex Doctor."""

from rich.console import Console, Group
from rich.panel import Panel
from rich.progress import BarColumn, Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich.table import Table
from rich.text import Text
from rich.tree import Tree

from cx_ops.doctor.checks import CheckResult, CheckSeverity, CheckStatus
from cx_ops.doctor.runner import RunSummary
from cx_ops.utils.system import get_os_info


class DoctorReporter:
    """Generates rich diagnostic reports."""

    STATUS_STYLES = {
        CheckStatus.PASS: ("bold green", "[PASS]"),
        CheckStatus.WARN: ("bold yellow", "[WARN]"),
        CheckStatus.FAIL: ("bold red", "[FAIL]"),
        CheckStatus.SKIP: ("dim", "[SKIP]"),
        CheckStatus.ERROR: ("bold magenta", "[ERR!]"),
    }

    SEVERITY_STYLES = {
        CheckSeverity.CRITICAL: "bold red",
        CheckSeverity.HIGH: "red",
        CheckSeverity.MEDIUM: "yellow",
        CheckSeverity.LOW: "cyan",
        CheckSeverity.INFO: "dim",
    }

    def __init__(self, console: Console | None = None) -> None:
        self.console = console or Console()

    def create_progress(self) -> Progress:
        """Create a progress bar for running checks."""
        return Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            TimeElapsedColumn(),
            console=self.console,
        )

    def print_header(self) -> None:
        """Print the doctor header."""
        os_info = get_os_info()
        header = Text()
        header.append("Cortex Doctor", style="bold cyan")
        header.append(" - System Health Check\n", style="dim")
        header.append(f"{os_info.name} {os_info.version}", style="dim")
        header.append(f" ({os_info.kernel})", style="dim")

        self.console.print(Panel(header, border_style="cyan"))

    def print_result(self, result: CheckResult, verbose: bool = False) -> None:
        """Print a single check result."""
        style, badge = self.STATUS_STYLES[result.status]

        line = Text()
        line.append(f"{badge} ", style=style)
        line.append(result.name, style="bold")
        line.append(f" - {result.message}")

        if result.duration_ms > 0:
            line.append(f" ({result.duration_ms:.0f}ms)", style="dim")

        self.console.print(line)

        if verbose and result.details:
            for key, value in result.details.items():
                self.console.print(f"       {key}: {value}", style="dim")

    def print_summary(self, summary: RunSummary) -> None:
        """Print the run summary."""
        self.console.print()

        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("Label", style="dim")
        table.add_column("Value")

        table.add_row("Total checks", str(summary.total))
        table.add_row("Passed", Text(str(summary.passed), style="green"))
        table.add_row("Warnings", Text(str(summary.warned), style="yellow"))
        table.add_row("Failed", Text(str(summary.failed), style="red"))
        table.add_row("Skipped", Text(str(summary.skipped), style="dim"))
        table.add_row("Errors", Text(str(summary.errors), style="magenta"))
        table.add_row("Duration", f"{summary.duration_ms:.0f}ms")

        status_text = Text()
        if summary.success:
            status_text.append("HEALTHY", style="bold green")
        elif summary.failed > 0:
            status_text.append("ISSUES FOUND", style="bold red")
        else:
            status_text.append("WARNINGS", style="bold yellow")

        self.console.print(Panel(table, title=status_text, border_style="cyan"))

    def print_full_report(
        self,
        summary: RunSummary,
        verbose: bool = False,
        show_passed: bool = True,
    ) -> None:
        """Print a complete diagnostic report."""
        self.print_header()
        self.console.print()

        # Group results by status
        failed = [r for r in summary.results if r.status == CheckStatus.FAIL]
        warned = [r for r in summary.results if r.status == CheckStatus.WARN]
        errors = [r for r in summary.results if r.status == CheckStatus.ERROR]
        passed = [r for r in summary.results if r.status == CheckStatus.PASS]
        skipped = [r for r in summary.results if r.status == CheckStatus.SKIP]

        # Print failures first
        if failed:
            self.console.print("[bold red]Failed Checks[/]")
            for result in failed:
                self.print_result(result, verbose)
            self.console.print()

        # Then errors
        if errors:
            self.console.print("[bold magenta]Check Errors[/]")
            for result in errors:
                self.print_result(result, verbose)
            self.console.print()

        # Then warnings
        if warned:
            self.console.print("[bold yellow]Warnings[/]")
            for result in warned:
                self.print_result(result, verbose)
            self.console.print()

        # Optionally show passed
        if show_passed and passed:
            self.console.print("[bold green]Passed Checks[/]")
            for result in passed:
                self.print_result(result, verbose)
            self.console.print()

        # Show skipped if verbose
        if verbose and skipped:
            self.console.print("[dim]Skipped Checks[/]")
            for result in skipped:
                self.print_result(result, verbose)
            self.console.print()

        self.print_summary(summary)

        # Print fixable issues
        fixable = [r for r in summary.results if r.fix_id and r.status in (CheckStatus.FAIL, CheckStatus.WARN)]
        if fixable:
            self.console.print()
            self.console.print("[cyan]Tip:[/] Run [bold]cx-ops doctor --fix[/] to auto-fix some issues")

    def print_tree_report(self, summary: RunSummary) -> None:
        """Print results as a tree grouped by category."""
        self.print_header()

        tree = Tree("[bold]Health Check Results[/]")

        # Group by category
        by_category: dict[str, list[CheckResult]] = {}
        for result in summary.results:
            cat = result.details.get("category", "other")
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(result)

        for category, results in sorted(by_category.items()):
            cat_branch = tree.add(f"[bold]{category.title()}[/]")
            for result in results:
                style, badge = self.STATUS_STYLES[result.status]
                cat_branch.add(f"{badge} {result.name}: {result.message}", style=style)

        self.console.print(tree)
        self.print_summary(summary)

    def print_json_report(self, summary: RunSummary) -> None:
        """Print results as JSON."""
        import json

        data = {
            "summary": {
                "total": summary.total,
                "passed": summary.passed,
                "warned": summary.warned,
                "failed": summary.failed,
                "skipped": summary.skipped,
                "errors": summary.errors,
                "duration_ms": summary.duration_ms,
                "success": summary.success,
            },
            "results": [
                {
                    "check_id": r.check_id,
                    "name": r.name,
                    "status": r.status.value,
                    "message": r.message,
                    "details": r.details,
                    "fix_id": r.fix_id,
                    "duration_ms": r.duration_ms,
                }
                for r in summary.results
            ],
        }

        self.console.print_json(json.dumps(data, indent=2))
