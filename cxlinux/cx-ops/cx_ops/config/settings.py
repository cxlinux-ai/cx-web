"""Pydantic settings for Cortex Ops configuration."""

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ConnectorSettings(BaseSettings):
    """LLM connector configuration."""

    default: str = "openai"
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    openai_model: str = "gpt-4-turbo-preview"
    anthropic_api_key: str | None = Field(default=None, alias="ANTHROPIC_API_KEY")
    anthropic_model: str = "claude-3-opus-20240229"
    google_api_key: str | None = Field(default=None, alias="GOOGLE_API_KEY")
    google_model: str = "gemini-pro"


class PluginSettings(BaseSettings):
    """Plugin system configuration."""

    enabled: bool = True
    directory: Path = Path("/etc/cortex/plugins")
    auto_load: bool = True
    trusted_sources: list[str] = Field(default_factory=lambda: ["cortexlinux"])


class UpdateSettings(BaseSettings):
    """Update system configuration."""

    check_interval_hours: int = 24
    auto_check: bool = True
    backup_before_update: bool = True
    rollback_retention_days: int = 7
    update_channel: str = "stable"


class DoctorSettings(BaseSettings):
    """Doctor diagnostics configuration."""

    timeout_seconds: int = 30
    parallel_checks: bool = True
    max_parallel: int = 4
    auto_fix_safe: bool = False


class Settings(BaseSettings):
    """Main application settings."""

    model_config = SettingsConfigDict(
        env_prefix="CORTEX_",
        env_file=".env",
        env_nested_delimiter="__",
        extra="ignore",
    )

    debug: bool = False
    log_level: str = "INFO"
    config_dir: Path = Path("/etc/cortex")
    data_dir: Path = Path("/var/lib/cortex")
    cache_dir: Path = Path("/var/cache/cortex")

    connectors: ConnectorSettings = Field(default_factory=ConnectorSettings)
    plugins: PluginSettings = Field(default_factory=PluginSettings)
    updates: UpdateSettings = Field(default_factory=UpdateSettings)
    doctor: DoctorSettings = Field(default_factory=DoctorSettings)

    @field_validator("config_dir", "data_dir", "cache_dir", mode="before")
    @classmethod
    def expand_path(cls, v: Any) -> Path:
        if isinstance(v, str):
            return Path(v).expanduser()
        return v

    @classmethod
    def from_yaml(cls, path: Path) -> "Settings":
        """Load settings from YAML file."""
        if not path.exists():
            return cls()
        with open(path) as f:
            data = yaml.safe_load(f) or {}
        return cls(**data)

    def to_yaml(self, path: Path) -> None:
        """Save settings to YAML file."""
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            yaml.dump(self.model_dump(), f, default_flow_style=False)


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    config_path = Path("/etc/cortex/config.yaml")
    if config_path.exists():
        return Settings.from_yaml(config_path)
    return Settings()
