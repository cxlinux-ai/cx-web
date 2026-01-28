"""Base connector interface for LLM APIs."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, AsyncIterator


class MessageRole(Enum):
    """Role of a message in a conversation."""

    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


@dataclass
class Message:
    """A message in a conversation."""

    role: MessageRole
    content: str
    name: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def system(cls, content: str) -> "Message":
        return cls(role=MessageRole.SYSTEM, content=content)

    @classmethod
    def user(cls, content: str) -> "Message":
        return cls(role=MessageRole.USER, content=content)

    @classmethod
    def assistant(cls, content: str) -> "Message":
        return cls(role=MessageRole.ASSISTANT, content=content)


@dataclass
class Response:
    """Response from an LLM API."""

    content: str
    model: str
    finish_reason: str | None = None
    usage: dict[str, int] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def input_tokens(self) -> int:
        return self.usage.get("input_tokens", 0)

    @property
    def output_tokens(self) -> int:
        return self.usage.get("output_tokens", 0)

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens


@dataclass
class StreamChunk:
    """A chunk from a streaming response."""

    content: str
    done: bool = False
    finish_reason: str | None = None


@dataclass
class ConnectorConfig:
    """Configuration for a connector."""

    api_key: str
    model: str
    base_url: str | None = None
    timeout: int = 60
    max_retries: int = 3
    temperature: float = 0.7
    max_tokens: int = 4096
    extra: dict[str, Any] = field(default_factory=dict)


class Connector(ABC):
    """Base class for LLM API connectors.

    Connectors provide a unified interface for interacting with
    different LLM providers (OpenAI, Anthropic, Google, etc).

    Example:
        connector = OpenAIConnector(config)
        response = await connector.chat([
            Message.system("You are a helpful assistant."),
            Message.user("Hello!"),
        ])
        print(response.content)
    """

    def __init__(self, config: ConnectorConfig) -> None:
        self.config = config

    @property
    @abstractmethod
    def name(self) -> str:
        """Return the connector name."""
        ...

    @property
    @abstractmethod
    def provider(self) -> str:
        """Return the provider name."""
        ...

    @property
    def model(self) -> str:
        """Return the configured model."""
        return self.config.model

    @abstractmethod
    async def chat(
        self,
        messages: list[Message],
        **kwargs: Any,
    ) -> Response:
        """Send a chat completion request.

        Args:
            messages: List of messages in the conversation
            **kwargs: Additional provider-specific options

        Returns:
            Response from the LLM
        """
        ...

    @abstractmethod
    async def chat_stream(
        self,
        messages: list[Message],
        **kwargs: Any,
    ) -> AsyncIterator[StreamChunk]:
        """Send a streaming chat completion request.

        Args:
            messages: List of messages in the conversation
            **kwargs: Additional provider-specific options

        Yields:
            StreamChunk objects as they arrive
        """
        ...

    async def complete(self, prompt: str, **kwargs: Any) -> Response:
        """Simple completion interface.

        Convenience method that wraps a single prompt in a user message.
        """
        return await self.chat([Message.user(prompt)], **kwargs)

    async def complete_stream(
        self, prompt: str, **kwargs: Any
    ) -> AsyncIterator[StreamChunk]:
        """Simple streaming completion interface."""
        async for chunk in self.chat_stream([Message.user(prompt)], **kwargs):
            yield chunk

    @abstractmethod
    async def test_connection(self) -> tuple[bool, str]:
        """Test the connection to the API.

        Returns:
            Tuple of (success, message)
        """
        ...

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} model={self.model}>"
