"""LLM inference engine using llama-cpp-python."""

import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterator, Optional

from llama_cpp import Llama

from ..config import get_settings
from ..hardware import HardwareDetector, HardwareInfo


@dataclass
class GenerationConfig:
    """Configuration for text generation."""

    max_tokens: int = 2048
    temperature: float = 0.7
    top_p: float = 0.9
    top_k: int = 40
    repeat_penalty: float = 1.1
    stop: list[str] = field(default_factory=list)
    stream: bool = False

    @classmethod
    def from_settings(cls) -> "GenerationConfig":
        """Create config from application settings."""
        settings = get_settings()
        return cls(
            max_tokens=settings.max_tokens,
            temperature=settings.temperature,
            top_p=settings.top_p,
            top_k=settings.top_k,
            repeat_penalty=settings.repeat_penalty,
        )


@dataclass
class GenerationResult:
    """Result of text generation."""

    text: str
    tokens_generated: int
    tokens_per_second: float
    prompt_tokens: int
    total_time: float
    finish_reason: str = "stop"


class InferenceEngine:
    """Manages LLM inference using llama-cpp-python."""

    def __init__(
        self,
        model_path: Optional[Path] = None,
        hardware_info: Optional[HardwareInfo] = None,
    ) -> None:
        self.settings = get_settings()
        self._llm: Optional[Llama] = None
        self._model_path: Optional[Path] = model_path
        self._hardware_info = hardware_info

        if model_path:
            self.load_model(model_path)

    @property
    def is_loaded(self) -> bool:
        """Check if a model is loaded."""
        return self._llm is not None

    @property
    def model_path(self) -> Optional[Path]:
        """Get current model path."""
        return self._model_path

    def load_model(
        self,
        model_path: Path,
        context_length: Optional[int] = None,
        gpu_layers: Optional[int] = None,
        threads: Optional[int] = None,
    ) -> None:
        """Load a model from disk."""
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        # Get hardware info if not provided
        if not self._hardware_info:
            detector = HardwareDetector()
            self._hardware_info = detector.detect()

        # Determine parameters
        n_ctx = context_length or self.settings.context_length
        n_gpu_layers = gpu_layers if gpu_layers is not None else self._hardware_info.recommended_layers
        n_threads = threads if threads is not None else self._hardware_info.recommended_threads

        # Ensure threads is at least 1
        if n_threads <= 0:
            n_threads = 4

        # Load model
        self._llm = Llama(
            model_path=str(model_path),
            n_ctx=n_ctx,
            n_gpu_layers=n_gpu_layers,
            n_threads=n_threads,
            n_batch=self.settings.batch_size,
            verbose=False,
        )

        self._model_path = model_path

    def unload_model(self) -> None:
        """Unload the current model."""
        if self._llm:
            del self._llm
            self._llm = None
            self._model_path = None

    def generate(
        self,
        prompt: str,
        config: Optional[GenerationConfig] = None,
    ) -> GenerationResult:
        """Generate text completion."""
        if not self._llm:
            raise RuntimeError("No model loaded")

        config = config or GenerationConfig.from_settings()
        start_time = time.time()

        response = self._llm(
            prompt,
            max_tokens=config.max_tokens,
            temperature=config.temperature,
            top_p=config.top_p,
            top_k=config.top_k,
            repeat_penalty=config.repeat_penalty,
            stop=config.stop or None,
            stream=False,
        )

        elapsed = time.time() - start_time

        # Extract response
        text = response["choices"][0]["text"]
        finish_reason = response["choices"][0].get("finish_reason", "stop")
        prompt_tokens = response["usage"]["prompt_tokens"]
        completion_tokens = response["usage"]["completion_tokens"]

        tokens_per_second = completion_tokens / elapsed if elapsed > 0 else 0

        return GenerationResult(
            text=text,
            tokens_generated=completion_tokens,
            tokens_per_second=tokens_per_second,
            prompt_tokens=prompt_tokens,
            total_time=elapsed,
            finish_reason=finish_reason,
        )

    def generate_stream(
        self,
        prompt: str,
        config: Optional[GenerationConfig] = None,
    ) -> Iterator[str]:
        """Generate text with streaming output."""
        if not self._llm:
            raise RuntimeError("No model loaded")

        config = config or GenerationConfig.from_settings()

        stream = self._llm(
            prompt,
            max_tokens=config.max_tokens,
            temperature=config.temperature,
            top_p=config.top_p,
            top_k=config.top_k,
            repeat_penalty=config.repeat_penalty,
            stop=config.stop or None,
            stream=True,
        )

        for chunk in stream:
            token = chunk["choices"][0].get("text", "")
            if token:
                yield token

    def chat(
        self,
        messages: list[dict[str, str]],
        config: Optional[GenerationConfig] = None,
    ) -> GenerationResult:
        """Generate chat completion."""
        if not self._llm:
            raise RuntimeError("No model loaded")

        config = config or GenerationConfig.from_settings()
        start_time = time.time()

        response = self._llm.create_chat_completion(
            messages=messages,
            max_tokens=config.max_tokens,
            temperature=config.temperature,
            top_p=config.top_p,
            top_k=config.top_k,
            repeat_penalty=config.repeat_penalty,
            stop=config.stop or None,
            stream=False,
        )

        elapsed = time.time() - start_time

        text = response["choices"][0]["message"]["content"]
        finish_reason = response["choices"][0].get("finish_reason", "stop")
        prompt_tokens = response["usage"]["prompt_tokens"]
        completion_tokens = response["usage"]["completion_tokens"]

        tokens_per_second = completion_tokens / elapsed if elapsed > 0 else 0

        return GenerationResult(
            text=text,
            tokens_generated=completion_tokens,
            tokens_per_second=tokens_per_second,
            prompt_tokens=prompt_tokens,
            total_time=elapsed,
            finish_reason=finish_reason,
        )

    def chat_stream(
        self,
        messages: list[dict[str, str]],
        config: Optional[GenerationConfig] = None,
    ) -> Iterator[str]:
        """Generate chat completion with streaming."""
        if not self._llm:
            raise RuntimeError("No model loaded")

        config = config or GenerationConfig.from_settings()

        stream = self._llm.create_chat_completion(
            messages=messages,
            max_tokens=config.max_tokens,
            temperature=config.temperature,
            top_p=config.top_p,
            top_k=config.top_k,
            repeat_penalty=config.repeat_penalty,
            stop=config.stop or None,
            stream=True,
        )

        for chunk in stream:
            delta = chunk["choices"][0].get("delta", {})
            content = delta.get("content", "")
            if content:
                yield content

    def tokenize(self, text: str) -> list[int]:
        """Tokenize text."""
        if not self._llm:
            raise RuntimeError("No model loaded")
        return self._llm.tokenize(text.encode())

    def detokenize(self, tokens: list[int]) -> str:
        """Detokenize tokens."""
        if not self._llm:
            raise RuntimeError("No model loaded")
        return self._llm.detokenize(tokens).decode()

    def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        return len(self.tokenize(text))

    def get_model_info(self) -> dict:
        """Get information about loaded model."""
        if not self._llm:
            return {}

        return {
            "model_path": str(self._model_path) if self._model_path else None,
            "context_length": self._llm.n_ctx(),
            "vocab_size": self._llm.n_vocab(),
        }
