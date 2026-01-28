"""Tests for configuration."""

import pytest
from pathlib import Path
from unittest.mock import patch

from cortex_llm.config import get_settings, Settings


class TestSettings:
    """Test settings configuration."""

    def test_get_settings_returns_settings(self):
        """get_settings returns Settings instance."""
        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_settings_has_models_dir(self):
        """Settings has models directory."""
        settings = get_settings()
        assert hasattr(settings, "models_dir")
        assert isinstance(settings.models_dir, Path)

    def test_settings_has_inference_defaults(self):
        """Settings has inference defaults."""
        settings = get_settings()

        assert hasattr(settings, "default_max_tokens")
        assert hasattr(settings, "default_temperature")
        assert hasattr(settings, "default_top_p")

    def test_settings_has_server_config(self):
        """Settings has server configuration."""
        settings = get_settings()

        assert hasattr(settings, "host")
        assert hasattr(settings, "port")
        assert hasattr(settings, "cors_origins")

    def test_models_dir_is_absolute(self):
        """Models directory is absolute path."""
        settings = get_settings()
        assert settings.models_dir.is_absolute()

    def test_settings_singleton(self):
        """get_settings returns same instance."""
        s1 = get_settings()
        s2 = get_settings()
        assert s1 is s2


class TestSettingsValidation:
    """Test settings validation."""

    def test_temperature_bounds(self):
        """Temperature has valid bounds."""
        settings = get_settings()
        assert 0.0 <= settings.default_temperature <= 2.0

    def test_top_p_bounds(self):
        """Top-p has valid bounds."""
        settings = get_settings()
        assert 0.0 <= settings.default_top_p <= 1.0

    def test_port_valid(self):
        """Port is valid number."""
        settings = get_settings()
        assert 1 <= settings.port <= 65535

    def test_max_tokens_positive(self):
        """Max tokens is positive."""
        settings = get_settings()
        assert settings.default_max_tokens > 0
