"""Plugin registry for managing installed plugins."""

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

from cx_ops.config import get_settings
from cx_ops.plugins.base import Plugin, PluginInfo, PluginType
from cx_ops.plugins.loader import PluginLoader


@dataclass
class PluginState:
    """State of an installed plugin."""

    name: str
    version: str
    enabled: bool
    installed_at: datetime
    last_activated: datetime | None = None
    config: dict[str, Any] = field(default_factory=dict)
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "name": self.name,
            "version": self.version,
            "enabled": self.enabled,
            "installed_at": self.installed_at.isoformat(),
            "last_activated": self.last_activated.isoformat() if self.last_activated else None,
            "config": self.config,
            "error": self.error,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "PluginState":
        """Create from dictionary."""
        return cls(
            name=data["name"],
            version=data["version"],
            enabled=data.get("enabled", True),
            installed_at=datetime.fromisoformat(data["installed_at"]),
            last_activated=(
                datetime.fromisoformat(data["last_activated"])
                if data.get("last_activated")
                else None
            ),
            config=data.get("config", {}),
            error=data.get("error"),
        )


class PluginRegistry:
    """Manages plugin installation, activation, and state."""

    def __init__(self) -> None:
        settings = get_settings()
        self.data_dir = settings.data_dir / "plugins"
        self.registry_file = self.data_dir / "registry.json"
        self.loader = PluginLoader()
        self._plugins: dict[str, Plugin] = {}
        self._states: dict[str, PluginState] = {}
        self._load_registry()

    def _load_registry(self) -> None:
        """Load plugin registry from disk."""
        if not self.registry_file.exists():
            return

        try:
            with open(self.registry_file) as f:
                data = json.load(f)
            for name, state_data in data.get("plugins", {}).items():
                self._states[name] = PluginState.from_dict(state_data)
        except Exception:
            pass

    def _save_registry(self) -> None:
        """Save plugin registry to disk."""
        self.data_dir.mkdir(parents=True, exist_ok=True)

        data = {
            "plugins": {name: state.to_dict() for name, state in self._states.items()},
            "updated_at": datetime.now().isoformat(),
        }

        with open(self.registry_file, "w") as f:
            json.dump(data, f, indent=2)

    def load_all(self) -> dict[str, str | None]:
        """Load and activate all enabled plugins."""
        results = {}

        # Load plugins from disk
        load_results = self.loader.load_all()

        for name, result in load_results.items():
            if not result.success:
                results[name] = result.error
                if name in self._states:
                    self._states[name].error = result.error
                continue

            plugin = result.plugin
            if plugin is None:
                continue

            # Check if plugin is enabled
            state = self._states.get(name)
            if state and not state.enabled:
                results[name] = "disabled"
                continue

            # Activate plugin
            try:
                plugin.activate()
                self._plugins[name] = plugin

                # Update state
                if name not in self._states:
                    self._states[name] = PluginState(
                        name=name,
                        version=plugin.info.version,
                        enabled=True,
                        installed_at=datetime.now(),
                    )

                self._states[name].last_activated = datetime.now()
                self._states[name].error = None
                results[name] = None

            except Exception as e:
                results[name] = str(e)
                if name in self._states:
                    self._states[name].error = str(e)

        self._save_registry()
        return results

    def get_plugin(self, name: str) -> Plugin | None:
        """Get an active plugin by name."""
        return self._plugins.get(name)

    def get_all(self) -> dict[str, Plugin]:
        """Get all active plugins."""
        return self._plugins.copy()

    def get_by_type(self, plugin_type: PluginType) -> list[Plugin]:
        """Get all active plugins of a specific type."""
        return [p for p in self._plugins.values() if p.info.plugin_type == plugin_type]

    def get_state(self, name: str) -> PluginState | None:
        """Get plugin state."""
        return self._states.get(name)

    def get_all_states(self) -> dict[str, PluginState]:
        """Get all plugin states."""
        return self._states.copy()

    def enable(self, name: str) -> bool:
        """Enable a plugin."""
        if name not in self._states:
            return False

        self._states[name].enabled = True
        self._save_registry()

        # Try to activate if loaded
        plugin = self.loader.get_plugin(name)
        if plugin:
            try:
                plugin.activate()
                self._plugins[name] = plugin
                self._states[name].last_activated = datetime.now()
                self._states[name].error = None
            except Exception as e:
                self._states[name].error = str(e)
                self._save_registry()
                return False

        self._save_registry()
        return True

    def disable(self, name: str) -> bool:
        """Disable a plugin."""
        if name not in self._states:
            return False

        self._states[name].enabled = False
        self._save_registry()

        # Deactivate if active
        if name in self._plugins:
            try:
                self._plugins[name].deactivate()
            except Exception:
                pass
            del self._plugins[name]

        return True

    def uninstall(self, name: str) -> bool:
        """Uninstall a plugin."""
        # Disable first
        self.disable(name)

        # Remove from registry
        if name in self._states:
            del self._states[name]
            self._save_registry()

        # Unload from loader
        self.loader.unload_plugin(name)

        return True

    def list_available(self) -> list[PluginInfo]:
        """List all available (discovered) plugins."""
        plugins = []
        for path in self.loader.discover():
            info = self.loader.load_metadata(path)
            if info:
                plugins.append(info)
        return plugins

    def list_installed(self) -> list[tuple[PluginInfo, PluginState]]:
        """List all installed plugins with their state."""
        result = []
        for name, state in self._states.items():
            plugin = self._plugins.get(name)
            if plugin:
                result.append((plugin.info, state))
            else:
                # Try to get info from loader
                loaded = self.loader.get_plugin(name)
                if loaded:
                    result.append((loaded.info, state))
        return result

    def configure(self, name: str, config: dict[str, Any]) -> bool:
        """Update plugin configuration."""
        if name not in self._states:
            return False

        self._states[name].config = config
        self._save_registry()

        # Apply to active plugin
        plugin = self._plugins.get(name)
        if plugin:
            plugin.configure(config)

        return True
