"""Application settings."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """CX Stacks configuration."""

    model_config = SettingsConfigDict(
        env_prefix="CX_STACKS_",
        env_file=".env",
        extra="ignore",
    )

    # Directories
    config_dir: Path = Field(
        default_factory=lambda: Path.home() / ".cx" / "stacks"
    )
    templates_dir: Path = Field(
        default_factory=lambda: Path(__file__).parent.parent / "templates"
    )
    backup_dir: Path = Field(
        default_factory=lambda: Path.home() / ".cx" / "stacks" / "backups"
    )

    # Web server defaults
    default_web_root: Path = Field(default=Path("/var/www"))
    default_proxy: Literal["nginx", "caddy"] = Field(default="nginx")

    # SSL settings
    ssl_email: str = Field(default="")
    ssl_staging: bool = Field(default=False)  # Use Let's Encrypt staging

    # Docker settings
    docker_network: str = Field(default="cx-net")
    docker_compose_version: str = Field(default="3.8")

    # System detection
    package_manager: Literal["apt", "dnf", "pacman"] = Field(default="apt")

    # Deployment settings
    dry_run: bool = Field(default=False)
    auto_firewall: bool = Field(default=True)
    auto_backup: bool = Field(default=True)

    def ensure_dirs(self) -> None:
        """Create required directories."""
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    settings = Settings()
    settings.ensure_dirs()
    return settings
