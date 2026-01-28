"""SSL certificate management with Let's Encrypt."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional
from datetime import datetime

from rich.console import Console
from rich.table import Table

from ..utils import run_command, is_root
from ..config import get_settings


@dataclass
class CertificateInfo:
    """SSL certificate information."""

    domain: str
    issuer: str
    not_before: datetime
    not_after: datetime
    path: Path
    is_valid: bool

    @property
    def days_until_expiry(self) -> int:
        return (self.not_after - datetime.now()).days


class SSLManager:
    """Let's Encrypt SSL certificate manager."""

    def __init__(self, console: Optional[Console] = None) -> None:
        self.console = console or Console()
        self.settings = get_settings()
        self.certbot_path = Path("/etc/letsencrypt")

    def is_certbot_installed(self) -> bool:
        """Check if certbot is installed."""
        result = run_command(["which", "certbot"])
        return result.success

    def install_certbot(self) -> bool:
        """Install certbot."""
        from ..provisioner import PackageInstaller

        installer = PackageInstaller(self.console)

        # Try snap first (recommended for certbot)
        result = run_command(["which", "snap"])
        if result.success:
            cmd = ["snap", "install", "certbot", "--classic"]
            if not is_root():
                cmd = ["sudo"] + cmd
            result = run_command(cmd)
            if result.success:
                # Create symlink
                run_command(["ln", "-sf", "/snap/bin/certbot", "/usr/bin/certbot"])
                return True

        # Fallback to apt
        result = installer.install(["certbot", "python3-certbot-nginx"])
        return result.success

    def obtain_certificate(
        self,
        domain: str,
        email: Optional[str] = None,
        webroot: Optional[Path] = None,
        nginx: bool = True,
        staging: bool = False,
    ) -> bool:
        """Obtain a new SSL certificate."""
        if not self.is_certbot_installed():
            self.console.print("[yellow]Certbot not installed, installing...[/]")
            if not self.install_certbot():
                self.console.print("[red]Failed to install certbot[/]")
                return False

        email = email or self.settings.ssl_email
        staging = staging or self.settings.ssl_staging

        if not email:
            self.console.print("[red]SSL email required. Set CX_STACKS_SSL_EMAIL[/]")
            return False

        cmd = ["certbot", "certonly"]

        if nginx:
            cmd.append("--nginx")
        elif webroot:
            cmd.extend(["--webroot", "-w", str(webroot)])
        else:
            cmd.append("--standalone")

        cmd.extend([
            "-d", domain,
            "--email", email,
            "--agree-tos",
            "--non-interactive",
        ])

        if staging:
            cmd.append("--staging")

        if not is_root():
            cmd = ["sudo"] + cmd

        self.console.print(f"[blue]Obtaining certificate for {domain}...[/]")
        result = run_command(cmd)

        if result.success:
            self.console.print(f"[green]✓[/] Certificate obtained for {domain}")
            return True
        else:
            self.console.print(f"[red]✗[/] Failed: {result.stderr}")
            return False

    def renew_certificate(self, domain: Optional[str] = None) -> bool:
        """Renew SSL certificate(s)."""
        cmd = ["certbot", "renew"]

        if domain:
            cmd.extend(["--cert-name", domain])

        cmd.append("--non-interactive")

        if not is_root():
            cmd = ["sudo"] + cmd

        self.console.print("[blue]Renewing certificates...[/]")
        result = run_command(cmd)

        if result.success:
            self.console.print("[green]✓[/] Certificates renewed")
            return True
        else:
            self.console.print(f"[red]✗[/] Renewal failed: {result.stderr}")
            return False

    def revoke_certificate(self, domain: str) -> bool:
        """Revoke an SSL certificate."""
        cert_path = self.certbot_path / "live" / domain / "cert.pem"

        if not cert_path.exists():
            self.console.print(f"[red]Certificate not found: {cert_path}[/]")
            return False

        cmd = [
            "certbot", "revoke",
            "--cert-path", str(cert_path),
            "--non-interactive",
        ]

        if not is_root():
            cmd = ["sudo"] + cmd

        result = run_command(cmd)
        return result.success

    def delete_certificate(self, domain: str) -> bool:
        """Delete a certificate."""
        cmd = ["certbot", "delete", "--cert-name", domain, "--non-interactive"]

        if not is_root():
            cmd = ["sudo"] + cmd

        result = run_command(cmd)
        return result.success

    def get_certificate_info(self, domain: str) -> Optional[CertificateInfo]:
        """Get certificate information."""
        cert_path = self.certbot_path / "live" / domain / "cert.pem"

        if not cert_path.exists():
            return None

        result = run_command([
            "openssl", "x509", "-in", str(cert_path),
            "-noout", "-dates", "-issuer", "-subject"
        ])

        if not result.success:
            return None

        # Parse output
        info = {}
        for line in result.stdout.strip().split("\n"):
            if "=" in line:
                key, value = line.split("=", 1)
                info[key.strip()] = value.strip()

        try:
            not_before = datetime.strptime(
                info.get("notBefore", ""),
                "%b %d %H:%M:%S %Y %Z"
            )
            not_after = datetime.strptime(
                info.get("notAfter", ""),
                "%b %d %H:%M:%S %Y %Z"
            )
        except ValueError:
            return None

        return CertificateInfo(
            domain=domain,
            issuer=info.get("issuer", "Unknown"),
            not_before=not_before,
            not_after=not_after,
            path=cert_path,
            is_valid=datetime.now() < not_after,
        )

    def list_certificates(self) -> list[CertificateInfo]:
        """List all certificates."""
        certs = []
        live_dir = self.certbot_path / "live"

        if not live_dir.exists():
            return certs

        for domain_dir in live_dir.iterdir():
            if domain_dir.is_dir() and not domain_dir.name.startswith("README"):
                info = self.get_certificate_info(domain_dir.name)
                if info:
                    certs.append(info)

        return sorted(certs, key=lambda c: c.domain)

    def print_certificates(self) -> None:
        """Print certificate table."""
        certs = self.list_certificates()

        if not certs:
            self.console.print("[yellow]No certificates found[/]")
            return

        table = Table(title="SSL Certificates")
        table.add_column("Domain", style="cyan")
        table.add_column("Expires", style="yellow")
        table.add_column("Days Left", justify="right")
        table.add_column("Status")

        for cert in certs:
            days = cert.days_until_expiry
            if days < 0:
                status = "[red]EXPIRED[/]"
            elif days < 30:
                status = "[yellow]EXPIRING[/]"
            else:
                status = "[green]VALID[/]"

            table.add_row(
                cert.domain,
                cert.not_after.strftime("%Y-%m-%d"),
                str(days),
                status,
            )

        self.console.print(table)

    def setup_auto_renewal(self) -> bool:
        """Setup automatic certificate renewal."""
        # Certbot typically sets this up automatically
        # Check if timer exists
        result = run_command(["systemctl", "is-enabled", "certbot.timer"])

        if not result.success:
            # Enable timer
            cmd = ["systemctl", "enable", "--now", "certbot.timer"]
            if not is_root():
                cmd = ["sudo"] + cmd
            result = run_command(cmd)

        return result.success

    def get_certificate_paths(self, domain: str) -> tuple[Optional[Path], Optional[Path]]:
        """Get certificate and key paths for a domain.

        Returns (cert_path, key_path).
        """
        live_dir = self.certbot_path / "live" / domain

        cert_path = live_dir / "fullchain.pem"
        key_path = live_dir / "privkey.pem"

        if cert_path.exists() and key_path.exists():
            return cert_path, key_path

        return None, None
