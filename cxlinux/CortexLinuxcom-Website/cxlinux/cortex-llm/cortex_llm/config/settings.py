"""Application settings."""

import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

import yaml
from pydantic import Field
from pydantic_settings import BaseSettings


def get_data_dir() -> Path:
    """Get data directory for models and config."""
    if os.geteuid() == 0:
        return Path("/var/lib/cortex/llm")
    return Path.home() / ".local" / "share" / "cortex" / "llm"


def get_config_dir() -> Path:
    """Get config directory."""
    if os.geteuid() == 0:
        return Path("/etc/cortex/llm")
    return Path.home() / ".config" / "cortex" / "llm"


class Settings(BaseSettings):
    """Application settings loaded from environment and config file."""

    # Paths
    models_dir: Path = Field(default_factory=lambda: get_data_dir() / "models")
    cache_dir: Path = Field(default_factory=lambda: get_data_dir() / "cache")
    config_file: Path = Field(default_factory=lambda: get_config_dir() / "config.yaml")

    # Inference defaults
    default_model: str = "mistral-7b-instruct-q4"
    context_length: int = 4096
    max_tokens: int = 2048
    temperature: float = 0.7
    top_p: float = 0.9
    top_k: int = 40
    repeat_penalty: float = 1.1

    # Hardware
    gpu_layers: int = -1  # -1 = auto (all layers to GPU if available)
    threads: int = 0  # 0 = auto
    batch_size: int = 512

    # Server
    server_host: str = "127.0.0.1"
    server_port: int = 8080
    api_key: str = ""  # Empty = no auth required
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])

    # Download
    hf_token: str = ""
    download_timeout: int = 3600
    chunk_size: int = 8192

    class Config:
        env_prefix = "CORTEX_LLM_"

    def save(self) -> None:
        """Save current settings to config file."""
        self.config_file.parent.mkdir(parents=True, exist_ok=True)

        data = {
            "default_model": self.default_model,
            "context_length": self.context_length,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "top_p": self.top_p,
            "top_k": self.top_k,
            "repeat_penalty": self.repeat_penalty,
            "gpu_layers": self.gpu_layers,
            "threads": self.threads,
            "batch_size": self.batch_size,
            "server_host": self.server_host,
            "server_port": self.server_port,
        }

        with open(self.config_file, "w") as f:
            yaml.dump(data, f, default_flow_style=False)

    @classmethod
    def load(cls) -> "Settings":
        """Load settings from config file and environment."""
        settings = cls()

        if settings.config_file.exists():
            with open(settings.config_file) as f:
                data = yaml.safe_load(f) or {}

            for key, value in data.items():
                if hasattr(settings, key):
                    setattr(settings, key, value)

        # Ensure directories exist
        settings.models_dir.mkdir(parents=True, exist_ok=True)
        settings.cache_dir.mkdir(parents=True, exist_ok=True)

        return settings


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings.load()
