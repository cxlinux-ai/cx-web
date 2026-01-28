"""Tests for configuration."""

import pytest
from pathlib import Path

from cx_stacks.config import Settings, get_settings


class TestSettings:
    """Test settings configuration."""

    def test_get_settings_returns_settings(self):
        """get_settings returns Settings instance."""
        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_settings_has_config_dir(self):
        """Settings has config directory."""
        settings = get_settings()
        assert hasattr(settings, "config_dir")
        assert isinstance(settings.config_dir, Path)

    def test_settings_has_default_proxy(self):
        """Settings has default proxy."""
        settings = get_settings()
        assert settings.default_proxy in ("nginx", "caddy")

    def test_settings_has_docker_config(self):
        """Settings has Docker configuration."""
        settings = get_settings()
        assert hasattr(settings, "docker_network")
        assert hasattr(settings, "docker_compose_version")

    def test_settings_singleton(self):
        """get_settings returns same instance."""
        s1 = get_settings()
        s2 = get_settings()
        assert s1 is s2

    def test_default_web_root(self):
        """Default web root is /var/www."""
        settings = get_settings()
        assert str(settings.default_web_root) == "/var/www"
