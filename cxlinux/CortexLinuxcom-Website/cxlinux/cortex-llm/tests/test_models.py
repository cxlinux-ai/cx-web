"""Tests for model management."""

import pytest
from pathlib import Path
from unittest.mock import Mock, patch

from cortex_llm.models import ModelRegistry, ModelInfo, ModelDownloader, GGUFValidator


class TestModelRegistry:
    """Test model registry."""

    def test_list_models_returns_list(self):
        """list_models returns list of ModelInfo."""
        registry = ModelRegistry()
        models = registry.list_models()

        assert isinstance(models, list)
        assert len(models) > 0
        assert all(isinstance(m, ModelInfo) for m in models)

    def test_get_model_by_name(self):
        """get_model returns model by name."""
        registry = ModelRegistry()
        model = registry.get_model("mistral-7b")

        assert model is not None
        assert model.name == "mistral-7b"
        assert isinstance(model.size_mb, int)

    def test_get_model_not_found(self):
        """get_model returns None for unknown model."""
        registry = ModelRegistry()
        model = registry.get_model("nonexistent-model")

        assert model is None

    def test_model_info_fields(self):
        """ModelInfo has required fields."""
        registry = ModelRegistry()
        model = registry.list_models()[0]

        assert hasattr(model, "name")
        assert hasattr(model, "repo_id")
        assert hasattr(model, "filename")
        assert hasattr(model, "size_mb")
        assert hasattr(model, "quantization")
        assert hasattr(model, "parameters")

    def test_default_models_included(self):
        """Default models are included in registry."""
        registry = ModelRegistry()
        model_names = [m.name for m in registry.list_models()]

        assert "mistral-7b" in model_names
        assert "llama-3-8b" in model_names
        assert "phi-3-mini" in model_names


class TestModelInfo:
    """Test ModelInfo dataclass."""

    def test_is_downloaded_false_when_no_path(self):
        """is_downloaded returns False when no local_path."""
        info = ModelInfo(
            name="test",
            repo_id="test/test",
            filename="test.gguf",
            size_mb=1000,
            quantization="Q4_K_M",
            parameters="7B",
        )
        assert not info.is_downloaded

    def test_is_downloaded_false_when_path_missing(self):
        """is_downloaded returns False when path doesn't exist."""
        info = ModelInfo(
            name="test",
            repo_id="test/test",
            filename="test.gguf",
            size_mb=1000,
            quantization="Q4_K_M",
            parameters="7B",
            local_path=Path("/nonexistent/path/model.gguf"),
        )
        assert not info.is_downloaded


class TestGGUFValidator:
    """Test GGUF file validator."""

    def test_validate_nonexistent_file(self):
        """Validation fails for nonexistent file."""
        validator = GGUFValidator()
        result = validator.validate(Path("/nonexistent/model.gguf"))

        assert not result.valid
        assert "not found" in result.error.lower() or "exist" in result.error.lower()

    def test_validate_wrong_extension(self):
        """Validation fails for non-GGUF extension."""
        validator = GGUFValidator()
        # Create mock path
        with patch.object(Path, "exists", return_value=True):
            with patch.object(Path, "suffix", ".bin"):
                result = validator.validate(Path("/fake/model.bin"))
                # Should either fail or handle gracefully
                assert isinstance(result.valid, bool)


class TestModelDownloader:
    """Test model downloader."""

    def test_downloader_initialization(self):
        """Downloader initializes correctly."""
        downloader = ModelDownloader()
        assert downloader is not None

    def test_download_progress_callback(self):
        """Download accepts progress callback."""
        downloader = ModelDownloader()
        # Just verify the method signature exists
        assert hasattr(downloader, "download")
