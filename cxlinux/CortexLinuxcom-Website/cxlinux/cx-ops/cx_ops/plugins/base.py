"""Base plugin class and types for Cortex plugins."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any


class PluginType(Enum):
    """Type of plugin."""

    COMMAND = "command"
    CHECK = "check"
    CONNECTOR = "connector"
    THEME = "theme"
    HOOK = "hook"


@dataclass
class PluginInfo:
    """Plugin metadata."""

    name: str
    version: str
    description: str
    author: str
    plugin_type: PluginType
    homepage: str = ""
    license: str = "Apache-2.0"
    tags: list[str] = field(default_factory=list)
    dependencies: list[str] = field(default_factory=list)
    cortex_version: str = ">=0.1.0"

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "PluginInfo":
        """Create PluginInfo from dictionary."""
        plugin_type = data.get("plugin_type", "command")
        if isinstance(plugin_type, str):
            plugin_type = PluginType(plugin_type)
        return cls(
            name=data["name"],
            version=data["version"],
            description=data.get("description", ""),
            author=data.get("author", "Unknown"),
            plugin_type=plugin_type,
            homepage=data.get("homepage", ""),
            license=data.get("license", "Apache-2.0"),
            tags=data.get("tags", []),
            dependencies=data.get("dependencies", []),
            cortex_version=data.get("cortex_version", ">=0.1.0"),
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "author": self.author,
            "plugin_type": self.plugin_type.value,
            "homepage": self.homepage,
            "license": self.license,
            "tags": self.tags,
            "dependencies": self.dependencies,
            "cortex_version": self.cortex_version,
        }


class Plugin(ABC):
    """Base class for all Cortex plugins.

    Plugins extend Cortex functionality through a standardized interface.
    To create a plugin:

    1. Subclass Plugin
    2. Implement required methods
    3. Define plugin.yaml with metadata
    4. Package in a directory under /etc/cortex/plugins/

    Example:
        class MyPlugin(Plugin):
            @property
            def info(self) -> PluginInfo:
                return PluginInfo(
                    name="my-plugin",
                    version="1.0.0",
                    description="Does something useful",
                    author="Your Name",
                    plugin_type=PluginType.COMMAND,
                )

            def activate(self) -> None:
                # Register commands, hooks, etc.
                pass

            def deactivate(self) -> None:
                # Cleanup
                pass
    """

    _path: Path | None = None
    _enabled: bool = True

    @property
    @abstractmethod
    def info(self) -> PluginInfo:
        """Return plugin metadata."""
        ...

    @abstractmethod
    def activate(self) -> None:
        """Activate the plugin.

        Called when the plugin is loaded. Use this to register
        commands, hooks, or other functionality.
        """
        ...

    @abstractmethod
    def deactivate(self) -> None:
        """Deactivate the plugin.

        Called when the plugin is unloaded. Clean up any resources
        or unregister hooks.
        """
        ...

    @property
    def path(self) -> Path | None:
        """Return the plugin's installation path."""
        return self._path

    @path.setter
    def path(self, value: Path) -> None:
        """Set the plugin's installation path."""
        self._path = value

    @property
    def enabled(self) -> bool:
        """Check if plugin is enabled."""
        return self._enabled

    @enabled.setter
    def enabled(self, value: bool) -> None:
        """Enable or disable plugin."""
        self._enabled = value

    def configure(self, config: dict[str, Any]) -> None:
        """Configure the plugin with settings.

        Override to accept configuration from plugin.yaml or settings.
        """
        pass

    def get_config_schema(self) -> dict[str, Any] | None:
        """Return JSON schema for plugin configuration.

        Override to provide configuration validation.
        """
        return None

    def health_check(self) -> tuple[bool, str]:
        """Check plugin health.

        Override to provide custom health checks.
        Returns (healthy, message).
        """
        return True, "OK"

    def __repr__(self) -> str:
        return f"<Plugin {self.info.name}@{self.info.version}>"


class CommandPlugin(Plugin):
    """Base class for command plugins.

    Command plugins add new CLI commands to cx-ops.
    """

    @abstractmethod
    def get_commands(self) -> list[Any]:
        """Return list of Typer command functions to register."""
        ...


class CheckPlugin(Plugin):
    """Base class for check plugins.

    Check plugins add new health checks to cx-ops doctor.
    """

    @abstractmethod
    def get_checks(self) -> list[Any]:
        """Return list of Check objects to register."""
        ...


class ConnectorPlugin(Plugin):
    """Base class for connector plugins.

    Connector plugins add new LLM connectors.
    """

    @abstractmethod
    def get_connector(self) -> Any:
        """Return the connector instance."""
        ...
