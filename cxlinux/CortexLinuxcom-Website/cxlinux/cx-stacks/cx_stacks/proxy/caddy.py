"""Caddy reverse proxy management."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from rich.console import Console
from jinja2 import Template

from ..utils import run_command, is_root


CADDY_PROXY_TEMPLATE = """{{ domain }} {
    {% if not ssl %}
    # Disable automatic HTTPS
    http://
    {% endif %}

    # Reverse proxy
    reverse_proxy {{ backend }} {
        {% if websocket %}
        header_up Connection {>Connection}
        header_up Upgrade {>Upgrade}
        {% endif %}
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}

        transport http {
            read_timeout {{ proxy_timeout }}s
            write_timeout {{ proxy_timeout }}s
        }
    }

    {% if static_path %}
    handle_path /static/* {
        root * {{ static_path }}
        file_server {
            hide .git .env
        }
        header Cache-Control "public, max-age=2592000, immutable"
    }
    {% endif %}

    # Security headers
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        {% if ssl %}
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        {% endif %}
        -Server
    }

    # Compression
    encode gzip zstd

    # Logging
    log {
        output file /var/log/caddy/{{ domain }}.log {
            roll_size 10mb
            roll_keep 5
        }
    }
}
"""


@dataclass
class CaddyProxyConfig:
    """Caddy reverse proxy configuration."""

    domain: str
    backend: str  # e.g., "localhost:3000"
    ssl: bool = True  # Caddy enables SSL by default
    websocket: bool = False
    static_path: Optional[str] = None
    proxy_timeout: int = 300


class CaddyProxy:
    """Caddy reverse proxy manager."""

    def __init__(self, console: Optional[Console] = None) -> None:
        self.console = console or Console()
        self.caddyfile = Path("/etc/caddy/Caddyfile")
        self.sites_dir = Path("/etc/caddy/sites")

    def generate_config(self, config: CaddyProxyConfig) -> str:
        """Generate Caddy configuration block."""
        template = Template(CADDY_PROXY_TEMPLATE)

        return template.render(
            domain=config.domain,
            backend=config.backend,
            ssl=config.ssl,
            websocket=config.websocket,
            static_path=config.static_path,
            proxy_timeout=config.proxy_timeout,
        )

    def add(self, config: CaddyProxyConfig) -> bool:
        """Add a new reverse proxy configuration."""
        # Ensure sites directory exists
        self.sites_dir.mkdir(parents=True, exist_ok=True)

        # Write site config
        site_config = self.generate_config(config)
        site_path = self.sites_dir / f"{config.domain}.caddy"

        try:
            site_path.write_text(site_config)
            self.console.print(f"[green]✓[/] Created {site_path}")
        except PermissionError:
            self.console.print(f"[red]Permission denied: {site_path}[/]")
            return False

        # Update main Caddyfile to import sites
        self._update_main_caddyfile()

        return self.reload()

    def _update_main_caddyfile(self) -> None:
        """Update main Caddyfile to import site configs."""
        import_line = f"import {self.sites_dir}/*.caddy"

        if self.caddyfile.exists():
            content = self.caddyfile.read_text()
            if import_line not in content:
                content = f"{import_line}\n\n{content}"
                self.caddyfile.write_text(content)
        else:
            # Create basic Caddyfile
            content = f"""# Cortex Stacks Caddyfile
{{
    email admin@localhost
}}

{import_line}
"""
            self.caddyfile.write_text(content)

    def remove(self, domain: str) -> bool:
        """Remove a site configuration."""
        site_path = self.sites_dir / f"{domain}.caddy"

        if site_path.exists():
            try:
                site_path.unlink()
                self.console.print(f"[green]✓[/] Removed {domain}")
            except PermissionError:
                self.console.print(f"[red]Permission denied[/]")
                return False

        return self.reload()

    def test(self) -> bool:
        """Test Caddy configuration."""
        result = run_command(["caddy", "validate", "--config", str(self.caddyfile)])
        if result.success:
            self.console.print("[green]✓[/] Caddy configuration valid")
        else:
            self.console.print(f"[red]✗[/] Configuration error:\n{result.stderr}")
        return result.success

    def reload(self) -> bool:
        """Reload Caddy."""
        cmd = ["systemctl", "reload", "caddy"]
        if not is_root():
            cmd = ["sudo"] + cmd

        result = run_command(cmd)
        if result.success:
            self.console.print("[green]✓[/] Caddy reloaded")
        else:
            self.console.print(f"[red]✗[/] Reload failed: {result.stderr}")
        return result.success

    def list_sites(self) -> list[str]:
        """List all configured sites."""
        sites = []

        if self.sites_dir.exists():
            for site in self.sites_dir.glob("*.caddy"):
                sites.append(site.stem)

        return sorted(sites)

    def get_certificate_info(self, domain: str) -> Optional[dict]:
        """Get SSL certificate information for a domain."""
        # Caddy stores certificates in its data directory
        cert_path = Path("/var/lib/caddy/.local/share/caddy/certificates")

        for issuer_dir in cert_path.iterdir():
            cert_file = issuer_dir / domain / f"{domain}.crt"
            if cert_file.exists():
                # Parse certificate info
                result = run_command([
                    "openssl", "x509", "-in", str(cert_file),
                    "-noout", "-dates", "-issuer"
                ])
                if result.success:
                    lines = result.stdout.strip().split("\n")
                    info = {}
                    for line in lines:
                        if "=" in line:
                            key, value = line.split("=", 1)
                            info[key.strip()] = value.strip()
                    return info

        return None
