"""Rich output utilities for consistent CLI formatting."""

from __future__ import annotations

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.theme import Theme

# Custom theme for Cortex branding
cortex_theme = Theme(
    {
        "info": "cyan",
        "success": "green",
        "warning": "yellow",
        "error": "red bold",
        "highlight": "magenta",
        "dim": "dim white",
        "header": "bold cyan",
        "value": "white",
        "key": "bold white",
    }
)

console = Console(theme=cortex_theme)


def print_error(message: str) -> None:
    """Print error message."""
    console.print(f"[error]ERROR:[/error] {message}")


def print_success(message: str) -> None:
    """Print success message."""
    console.print(f"[success]OK:[/success] {message}")


def print_warning(message: str) -> None:
    """Print warning message."""
    console.print(f"[warning]WARN:[/warning] {message}")


def print_info(message: str) -> None:
    """Print info message."""
    console.print(f"[info]INFO:[/info] {message}")


def create_status_table(title: str) -> Table:
    """Create a standardized status table."""
    table = Table(title=title, show_header=True, header_style="header")
    return table


def create_panel(content: str, title: str, style: str = "cyan") -> Panel:
    """Create a styled panel."""
    return Panel(content, title=title, border_style=style)


def format_status_indicator(active: bool) -> str:
    """Format a status indicator."""
    if active:
        return "[success]●[/success] Active"
    return "[dim]○[/dim] Inactive"


def format_enabled_indicator(enabled: bool) -> str:
    """Format an enabled/disabled indicator."""
    if enabled:
        return "[success]Enabled[/success]"
    return "[dim]Disabled[/dim]"


def format_connection_quality(signal: int) -> str:
    """Format WiFi signal quality."""
    if signal >= 80:
        return f"[success]Excellent ({signal}%)[/success]"
    elif signal >= 60:
        return f"[info]Good ({signal}%)[/info]"
    elif signal >= 40:
        return f"[warning]Fair ({signal}%)[/warning]"
    else:
        return f"[error]Weak ({signal}%)[/error]"


def format_interface_type(iface_type: str) -> str:
    """Format interface type with icon."""
    icons = {
        "wireless": "📶",
        "ethernet": "🔌",
        "bridge": "🌉",
        "virtual": "💻",
        "vpn": "🔐",
        "unknown": "❓",
    }
    icon = icons.get(iface_type, "❓")
    return f"{icon} {iface_type.capitalize()}"


def format_bytes(bytes_val: int) -> str:
    """Format bytes to human readable."""
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if abs(bytes_val) < 1024.0:
            return f"{bytes_val:.1f} {unit}"
        bytes_val = int(bytes_val / 1024)
    return f"{bytes_val:.1f} PB"


def format_speed(speed_mbps: int) -> str:
    """Format network speed."""
    if speed_mbps == 0:
        return "[dim]Unknown[/dim]"
    elif speed_mbps >= 1000:
        return f"[success]{speed_mbps / 1000:.1f} Gbps[/success]"
    else:
        return f"{speed_mbps} Mbps"
