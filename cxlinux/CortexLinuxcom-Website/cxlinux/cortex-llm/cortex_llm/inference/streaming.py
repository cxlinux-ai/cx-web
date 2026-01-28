"""Streaming token generator."""

import asyncio
from typing import AsyncIterator, Iterator, Optional

from .engine import InferenceEngine, GenerationConfig


class StreamingGenerator:
    """Async streaming generator for inference."""

    def __init__(self, engine: InferenceEngine) -> None:
        self.engine = engine

    async def generate_async(
        self,
        prompt: str,
        config: Optional[GenerationConfig] = None,
    ) -> AsyncIterator[str]:
        """Generate text asynchronously with streaming."""
        loop = asyncio.get_event_loop()

        # Run sync generator in thread pool
        def sync_gen():
            return list(self.engine.generate_stream(prompt, config))

        tokens = await loop.run_in_executor(None, sync_gen)

        for token in tokens:
            yield token

    async def chat_async(
        self,
        messages: list[dict[str, str]],
        config: Optional[GenerationConfig] = None,
    ) -> AsyncIterator[str]:
        """Generate chat completion asynchronously with streaming."""
        loop = asyncio.get_event_loop()

        def sync_gen():
            return list(self.engine.chat_stream(messages, config))

        tokens = await loop.run_in_executor(None, sync_gen)

        for token in tokens:
            yield token

    def generate_sync(
        self,
        prompt: str,
        config: Optional[GenerationConfig] = None,
    ) -> Iterator[str]:
        """Generate text synchronously with streaming."""
        yield from self.engine.generate_stream(prompt, config)

    def chat_sync(
        self,
        messages: list[dict[str, str]],
        config: Optional[GenerationConfig] = None,
    ) -> Iterator[str]:
        """Generate chat completion synchronously with streaming."""
        yield from self.engine.chat_stream(messages, config)


class TokenBuffer:
    """Buffer for accumulating streamed tokens."""

    def __init__(self, flush_threshold: int = 4) -> None:
        self.buffer: list[str] = []
        self.flush_threshold = flush_threshold
        self.total_tokens = 0

    def add(self, token: str) -> Optional[str]:
        """Add token to buffer, return flushed text if threshold reached."""
        self.buffer.append(token)
        self.total_tokens += 1

        if len(self.buffer) >= self.flush_threshold:
            return self.flush()
        return None

    def flush(self) -> str:
        """Flush buffer and return accumulated text."""
        text = "".join(self.buffer)
        self.buffer = []
        return text

    def get_remaining(self) -> str:
        """Get remaining buffered text."""
        return "".join(self.buffer)

    def clear(self) -> None:
        """Clear the buffer."""
        self.buffer = []
        self.total_tokens = 0
