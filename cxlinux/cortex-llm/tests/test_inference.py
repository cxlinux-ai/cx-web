"""Tests for inference engine."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path

from cortex_llm.inference import InferenceEngine, GenerationConfig, GenerationResult


class TestGenerationConfig:
    """Test generation configuration."""

    def test_default_values(self):
        """Config has sensible defaults."""
        config = GenerationConfig()

        assert config.max_tokens == 2048
        assert 0.0 <= config.temperature <= 2.0
        assert 0.0 <= config.top_p <= 1.0
        assert config.top_k >= 0
        assert config.repeat_penalty >= 1.0

    def test_custom_values(self):
        """Config accepts custom values."""
        config = GenerationConfig(
            max_tokens=512,
            temperature=0.5,
            top_p=0.95,
            top_k=50,
            repeat_penalty=1.2,
        )

        assert config.max_tokens == 512
        assert config.temperature == 0.5
        assert config.top_p == 0.95
        assert config.top_k == 50
        assert config.repeat_penalty == 1.2

    def test_stop_sequences(self):
        """Config handles stop sequences."""
        config = GenerationConfig(stop=["###", "END"])

        assert len(config.stop) == 2
        assert "###" in config.stop
        assert "END" in config.stop


class TestInferenceEngine:
    """Test inference engine."""

    def test_engine_initialization(self):
        """Engine initializes without model."""
        engine = InferenceEngine()

        assert not engine.is_loaded
        assert engine.model_path is None

    def test_is_loaded_property(self):
        """is_loaded property works correctly."""
        engine = InferenceEngine()
        assert not engine.is_loaded

    def test_load_model_nonexistent(self):
        """Loading nonexistent model raises error."""
        engine = InferenceEngine()

        with pytest.raises(Exception):
            engine.load_model(Path("/nonexistent/model.gguf"))

    def test_unload_model(self):
        """Unload clears model state."""
        engine = InferenceEngine()
        engine.unload_model()

        assert not engine.is_loaded
        assert engine.model_path is None

    def test_generate_without_model_raises(self):
        """Generate without loaded model raises error."""
        engine = InferenceEngine()

        with pytest.raises(Exception):
            engine.generate("test prompt", GenerationConfig())

    def test_chat_without_model_raises(self):
        """Chat without loaded model raises error."""
        engine = InferenceEngine()
        messages = [{"role": "user", "content": "hello"}]

        with pytest.raises(Exception):
            engine.chat(messages, GenerationConfig())


class TestGenerationResult:
    """Test generation result dataclass."""

    def test_result_fields(self):
        """Result has all required fields."""
        result = GenerationResult(
            text="Generated text",
            tokens_generated=10,
            tokens_per_second=25.5,
            prompt_tokens=5,
            total_time=0.4,
            finish_reason="stop",
        )

        assert result.text == "Generated text"
        assert result.tokens_generated == 10
        assert result.tokens_per_second == 25.5
        assert result.prompt_tokens == 5
        assert result.total_time == 0.4
        assert result.finish_reason == "stop"
