"""Connector manager for handling multiple LLM providers."""

from functools import lru_cache
from typing import Any

from cx_ops.config import get_settings
from cx_ops.connectors.base import Connector, ConnectorConfig, Message, Response
from cx_ops.connectors.openai import OpenAIConnector
from cx_ops.connectors.anthropic import AnthropicConnector
from cx_ops.connectors.google import GoogleConnector


class ConnectorManager:
    """Manages multiple LLM connectors.

    Provides a unified interface for working with different LLM providers,
    handling configuration, and switching between connectors.

    Example:
        manager = ConnectorManager()
        manager.set_default("anthropic")
        response = await manager.chat([Message.user("Hello!")])
    """

    CONNECTOR_CLASSES = {
        "openai": OpenAIConnector,
        "anthropic": AnthropicConnector,
        "google": GoogleConnector,
    }

    def __init__(self) -> None:
        self._connectors: dict[str, Connector] = {}
        self._default: str | None = None
        self._initialize_from_settings()

    def _initialize_from_settings(self) -> None:
        """Initialize connectors from settings."""
        settings = get_settings()
        connector_settings = settings.connectors

        # Initialize OpenAI if configured
        if connector_settings.openai_api_key:
            self.register(
                "openai",
                ConnectorConfig(
                    api_key=connector_settings.openai_api_key,
                    model=connector_settings.openai_model,
                ),
            )

        # Initialize Anthropic if configured
        if connector_settings.anthropic_api_key:
            self.register(
                "anthropic",
                ConnectorConfig(
                    api_key=connector_settings.anthropic_api_key,
                    model=connector_settings.anthropic_model,
                ),
            )

        # Initialize Google if configured
        if connector_settings.google_api_key:
            self.register(
                "google",
                ConnectorConfig(
                    api_key=connector_settings.google_api_key,
                    model=connector_settings.google_model,
                ),
            )

        # Set default
        if connector_settings.default in self._connectors:
            self._default = connector_settings.default
        elif self._connectors:
            self._default = next(iter(self._connectors.keys()))

    def register(
        self,
        name: str,
        config: ConnectorConfig,
        connector_class: type[Connector] | None = None,
    ) -> Connector:
        """Register a new connector.

        Args:
            name: Name to register the connector under
            config: Connector configuration
            connector_class: Optional custom connector class

        Returns:
            The created connector instance
        """
        if connector_class is None:
            if name not in self.CONNECTOR_CLASSES:
                raise ValueError(f"Unknown connector type: {name}")
            connector_class = self.CONNECTOR_CLASSES[name]

        connector = connector_class(config)
        self._connectors[name] = connector

        if self._default is None:
            self._default = name

        return connector

    def unregister(self, name: str) -> bool:
        """Unregister a connector."""
        if name not in self._connectors:
            return False

        del self._connectors[name]

        if self._default == name:
            self._default = next(iter(self._connectors.keys()), None)

        return True

    def get(self, name: str) -> Connector | None:
        """Get a connector by name."""
        return self._connectors.get(name)

    def get_default(self) -> Connector | None:
        """Get the default connector."""
        if self._default is None:
            return None
        return self._connectors.get(self._default)

    def set_default(self, name: str) -> bool:
        """Set the default connector."""
        if name not in self._connectors:
            return False
        self._default = name
        return True

    def list_connectors(self) -> list[str]:
        """List all registered connector names."""
        return list(self._connectors.keys())

    def list_available(self) -> list[str]:
        """List all available connector types."""
        return list(self.CONNECTOR_CLASSES.keys())

    async def chat(
        self,
        messages: list[Message],
        connector_name: str | None = None,
        **kwargs: Any,
    ) -> Response:
        """Send a chat request using specified or default connector."""
        connector = self._get_connector(connector_name)
        return await connector.chat(messages, **kwargs)

    async def complete(
        self,
        prompt: str,
        connector_name: str | None = None,
        **kwargs: Any,
    ) -> Response:
        """Send a completion request using specified or default connector."""
        connector = self._get_connector(connector_name)
        return await connector.complete(prompt, **kwargs)

    def _get_connector(self, name: str | None) -> Connector:
        """Get a connector by name or return default."""
        if name:
            connector = self._connectors.get(name)
            if connector is None:
                raise ValueError(f"Connector not found: {name}")
            return connector

        connector = self.get_default()
        if connector is None:
            raise ValueError("No connectors configured")
        return connector

    async def test_all(self) -> dict[str, tuple[bool, str]]:
        """Test all registered connectors."""
        results = {}
        for name, connector in self._connectors.items():
            results[name] = await connector.test_connection()
        return results

    async def test(self, name: str) -> tuple[bool, str]:
        """Test a specific connector."""
        connector = self._connectors.get(name)
        if connector is None:
            return False, f"Connector not found: {name}"
        return await connector.test_connection()

    def get_status(self) -> dict[str, Any]:
        """Get status of all connectors."""
        return {
            "default": self._default,
            "connectors": {
                name: {
                    "provider": conn.provider,
                    "model": conn.model,
                }
                for name, conn in self._connectors.items()
            },
        }


@lru_cache
def get_manager() -> ConnectorManager:
    """Get the global connector manager instance."""
    return ConnectorManager()
