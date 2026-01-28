"""Nginx reverse proxy management."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from rich.console import Console
from jinja2 import Template

from ..utils import run_command, is_root


NGINX_PROXY_TEMPLATE = """upstream {{ upstream_name }} {
    server {{ backend }};
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name {{ domain }};

    {% if redirect_https %}
    return 301 https://$server_name$request_uri;
    {% else %}
    client_max_body_size {{ client_max_body_size }};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    {% if hsts %}
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    {% endif %}

    # Logging
    access_log /var/log/nginx/{{ domain }}_access.log;
    error_log /var/log/nginx/{{ domain }}_error.log;

    location / {
        proxy_pass http://{{ upstream_name }};
        proxy_http_version 1.1;
        {% if websocket %}
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        {% endif %}
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_buffering off;
        proxy_read_timeout {{ proxy_timeout }}s;
        proxy_send_timeout {{ proxy_timeout }}s;
    }

    {% if static_path %}
    location /static/ {
        alias {{ static_path }}/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    {% endif %}

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    {% endif %}
}

{% if ssl %}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name {{ domain }};

    ssl_certificate {{ ssl_cert }};
    ssl_certificate_key {{ ssl_key }};
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    client_max_body_size {{ client_max_body_size }};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/{{ domain }}_ssl_access.log;
    error_log /var/log/nginx/{{ domain }}_ssl_error.log;

    location / {
        proxy_pass http://{{ upstream_name }};
        proxy_http_version 1.1;
        {% if websocket %}
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        {% endif %}
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_buffering off;
        proxy_read_timeout {{ proxy_timeout }}s;
        proxy_send_timeout {{ proxy_timeout }}s;
    }

    {% if static_path %}
    location /static/ {
        alias {{ static_path }}/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    {% endif %}

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
{% endif %}
"""


@dataclass
class ProxyConfig:
    """Reverse proxy configuration."""

    domain: str
    backend: str  # e.g., "127.0.0.1:3000" or "unix:/run/gunicorn.sock"
    ssl: bool = False
    ssl_cert: Optional[str] = None
    ssl_key: Optional[str] = None
    websocket: bool = False
    static_path: Optional[str] = None
    client_max_body_size: str = "64M"
    proxy_timeout: int = 300
    hsts: bool = True
    redirect_https: bool = False


class NginxProxy:
    """Nginx reverse proxy manager."""

    def __init__(self, console: Optional[Console] = None) -> None:
        self.console = console or Console()
        self.sites_available = Path("/etc/nginx/sites-available")
        self.sites_enabled = Path("/etc/nginx/sites-enabled")

    def generate_config(self, config: ProxyConfig) -> str:
        """Generate nginx configuration."""
        template = Template(NGINX_PROXY_TEMPLATE)

        # Generate upstream name from domain
        upstream_name = config.domain.replace(".", "_").replace("-", "_")

        return template.render(
            domain=config.domain,
            upstream_name=upstream_name,
            backend=config.backend,
            ssl=config.ssl,
            ssl_cert=config.ssl_cert,
            ssl_key=config.ssl_key,
            websocket=config.websocket,
            static_path=config.static_path,
            client_max_body_size=config.client_max_body_size,
            proxy_timeout=config.proxy_timeout,
            hsts=config.hsts,
            redirect_https=config.ssl and config.redirect_https,
        )

    def add(self, config: ProxyConfig) -> bool:
        """Add a new reverse proxy configuration."""
        nginx_config = self.generate_config(config)
        config_path = self.sites_available / config.domain

        try:
            config_path.write_text(nginx_config)
            self.console.print(f"[green]✓[/] Created {config_path}")
        except PermissionError:
            self.console.print(f"[red]Permission denied: {config_path}[/]")
            return False

        return self.enable(config.domain)

    def enable(self, domain: str) -> bool:
        """Enable a site configuration."""
        available = self.sites_available / domain
        enabled = self.sites_enabled / domain

        if not available.exists():
            self.console.print(f"[red]Config not found: {available}[/]")
            return False

        if enabled.exists() or enabled.is_symlink():
            enabled.unlink()

        try:
            enabled.symlink_to(available)
            self.console.print(f"[green]✓[/] Enabled {domain}")
        except PermissionError:
            self.console.print(f"[red]Permission denied creating symlink[/]")
            return False

        return self.test() and self.reload()

    def disable(self, domain: str) -> bool:
        """Disable a site configuration."""
        enabled = self.sites_enabled / domain

        if enabled.exists() or enabled.is_symlink():
            try:
                enabled.unlink()
                self.console.print(f"[green]✓[/] Disabled {domain}")
            except PermissionError:
                self.console.print(f"[red]Permission denied[/]")
                return False

        return self.reload()

    def remove(self, domain: str) -> bool:
        """Remove a site configuration."""
        self.disable(domain)

        available = self.sites_available / domain
        if available.exists():
            try:
                available.unlink()
                self.console.print(f"[green]✓[/] Removed {domain}")
            except PermissionError:
                self.console.print(f"[red]Permission denied[/]")
                return False

        return True

    def test(self) -> bool:
        """Test nginx configuration."""
        result = run_command(["nginx", "-t"])
        if result.success:
            self.console.print("[green]✓[/] Nginx configuration valid")
        else:
            self.console.print(f"[red]✗[/] Configuration error:\n{result.stderr}")
        return result.success

    def reload(self) -> bool:
        """Reload nginx."""
        cmd = ["systemctl", "reload", "nginx"]
        if not is_root():
            cmd = ["sudo"] + cmd

        result = run_command(cmd)
        if result.success:
            self.console.print("[green]✓[/] Nginx reloaded")
        else:
            self.console.print(f"[red]✗[/] Reload failed: {result.stderr}")
        return result.success

    def list_sites(self) -> list[tuple[str, bool]]:
        """List all configured sites.

        Returns list of (domain, enabled) tuples.
        """
        sites = []

        if self.sites_available.exists():
            for site in self.sites_available.iterdir():
                if site.is_file():
                    enabled = (self.sites_enabled / site.name).exists()
                    sites.append((site.name, enabled))

        return sorted(sites)
