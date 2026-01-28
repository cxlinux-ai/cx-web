"""Plugin discovery and loading for Cortex plugins."""

import importlib.util
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

from cx_ops.config import get_settings
from cx_ops.plugins.base import Plugin, PluginInfo


@dataclass
class LoadResult:
    """Result of loading a plugin."""

    success: bool
    plugin: Plugin | None
    error: str | None = None


class PluginLoader:
    """Discovers and loads Cortex plugins."""

    def __init__(self, plugin_dirs: list[Path] | None = None) -> None:
        settings = get_settings()
        self.plugin_dirs = plugin_dirs or [settings.plugins.directory]
        self._loaded: dict[str, Plugin] = {}

    def discover(self) -> list[Path]:
        """Discover all plugin directories."""
        plugins = []

        for plugin_dir in self.plugin_dirs:
            if not plugin_dir.exists():
                continue

            for item in plugin_dir.iterdir():
                if item.is_dir() and (item / "plugin.yaml").exists():
                    plugins.append(item)

        return plugins

    def load_metadata(self, plugin_path: Path) -> PluginInfo | None:
        """Load plugin metadata from plugin.yaml."""
        yaml_path = plugin_path / "plugin.yaml"

        if not yaml_path.exists():
            return None

        try:
            with open(yaml_path) as f:
                data = yaml.safe_load(f)
            return PluginInfo.from_dict(data)
        except Exception:
            return None

    def load_plugin(self, plugin_path: Path) -> LoadResult:
        """Load a plugin from its directory."""
        # Check for plugin.yaml
        yaml_path = plugin_path / "plugin.yaml"
        if not yaml_path.exists():
            return LoadResult(
                success=False,
                plugin=None,
                error=f"Missing plugin.yaml in {plugin_path}",
            )

        # Load metadata
        try:
            with open(yaml_path) as f:
                metadata = yaml.safe_load(f)
        except Exception as e:
            return LoadResult(
                success=False,
                plugin=None,
                error=f"Invalid plugin.yaml: {e}",
            )

        # Find the main module
        main_module = metadata.get("main", "__init__.py")
        module_path = plugin_path / main_module

        if not module_path.exists():
            return LoadResult(
                success=False,
                plugin=None,
                error=f"Main module not found: {main_module}",
            )

        # Load the module
        try:
            plugin_name = metadata.get("name", plugin_path.name)
            module_name = f"cortex_plugins.{plugin_name}"

            spec = importlib.util.spec_from_file_location(module_name, module_path)
            if spec is None or spec.loader is None:
                return LoadResult(
                    success=False,
                    plugin=None,
                    error=f"Could not load module spec for {module_path}",
                )

            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)

            # Find the Plugin subclass
            plugin_class = None
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if (
                    isinstance(attr, type)
                    and issubclass(attr, Plugin)
                    and attr is not Plugin
                ):
                    plugin_class = attr
                    break

            if plugin_class is None:
                return LoadResult(
                    success=False,
                    plugin=None,
                    error="No Plugin subclass found in module",
                )

            # Instantiate the plugin
            plugin = plugin_class()
            plugin.path = plugin_path

            # Load configuration if present
            config = metadata.get("config", {})
            if config:
                plugin.configure(config)

            self._loaded[plugin_name] = plugin

            return LoadResult(success=True, plugin=plugin)

        except Exception as e:
            return LoadResult(
                success=False,
                plugin=None,
                error=f"Failed to load plugin: {e}",
            )

    def load_all(self) -> dict[str, LoadResult]:
        """Load all discovered plugins."""
        results = {}

        for plugin_path in self.discover():
            result = self.load_plugin(plugin_path)
            plugin_name = plugin_path.name
            results[plugin_name] = result

        return results

    def unload_plugin(self, name: str) -> bool:
        """Unload a plugin by name."""
        if name not in self._loaded:
            return False

        plugin = self._loaded[name]

        try:
            plugin.deactivate()
        except Exception:
            pass

        del self._loaded[name]

        # Remove from sys.modules
        module_name = f"cortex_plugins.{name}"
        if module_name in sys.modules:
            del sys.modules[module_name]

        return True

    def get_loaded(self) -> dict[str, Plugin]:
        """Return all loaded plugins."""
        return self._loaded.copy()

    def get_plugin(self, name: str) -> Plugin | None:
        """Get a loaded plugin by name."""
        return self._loaded.get(name)

    def reload_plugin(self, name: str) -> LoadResult:
        """Reload a plugin by name."""
        plugin = self._loaded.get(name)
        if plugin is None or plugin.path is None:
            return LoadResult(
                success=False,
                plugin=None,
                error=f"Plugin not found: {name}",
            )

        path = plugin.path
        self.unload_plugin(name)
        return self.load_plugin(path)


def create_plugin_scaffold(
    name: str,
    plugin_type: str = "command",
    output_dir: Path | None = None,
) -> Path:
    """Create a new plugin scaffold."""
    output_dir = output_dir or Path.cwd()
    plugin_dir = output_dir / name

    plugin_dir.mkdir(parents=True, exist_ok=True)

    # Create plugin.yaml
    yaml_content = f"""name: {name}
version: 0.1.0
description: A Cortex plugin
author: Your Name
plugin_type: {plugin_type}
main: __init__.py
license: Apache-2.0
cortex_version: ">=0.1.0"

config: {{}}
"""

    (plugin_dir / "plugin.yaml").write_text(yaml_content)

    # Create __init__.py based on type
    if plugin_type == "command":
        init_content = f'''"""Cortex plugin: {name}"""

from cx_ops.plugins.base import CommandPlugin, PluginInfo, PluginType
import typer


class {name.title().replace("-", "")}Plugin(CommandPlugin):
    """Example command plugin."""

    @property
    def info(self) -> PluginInfo:
        return PluginInfo(
            name="{name}",
            version="0.1.0",
            description="A Cortex command plugin",
            author="Your Name",
            plugin_type=PluginType.COMMAND,
        )

    def activate(self) -> None:
        """Register plugin commands."""
        pass

    def deactivate(self) -> None:
        """Cleanup plugin resources."""
        pass

    def get_commands(self) -> list:
        """Return commands to register."""
        return [self.hello]

    def hello(self, name: str = "World") -> None:
        """Say hello."""
        typer.echo(f"Hello, {{name}}!")
'''
    elif plugin_type == "check":
        init_content = f'''"""Cortex plugin: {name}"""

from cx_ops.plugins.base import CheckPlugin, PluginInfo, PluginType
from cx_ops.doctor.checks import Check, CheckCategory, CheckSeverity, CheckResult, CheckStatus


def example_check() -> CheckResult:
    """Example health check."""
    return CheckResult(
        check_id="{name}_check",
        name="Example Check",
        status=CheckStatus.PASS,
        message="Everything is fine",
    )


class {name.title().replace("-", "")}Plugin(CheckPlugin):
    """Example check plugin."""

    @property
    def info(self) -> PluginInfo:
        return PluginInfo(
            name="{name}",
            version="0.1.0",
            description="A Cortex check plugin",
            author="Your Name",
            plugin_type=PluginType.CHECK,
        )

    def activate(self) -> None:
        """Register plugin checks."""
        pass

    def deactivate(self) -> None:
        """Cleanup plugin resources."""
        pass

    def get_checks(self) -> list[Check]:
        """Return checks to register."""
        return [
            Check(
                id="{name}_check",
                name="Example Check",
                description="An example health check",
                category=CheckCategory.SYSTEM,
                severity=CheckSeverity.LOW,
                check_fn=example_check,
            )
        ]
'''
    else:
        init_content = f'''"""Cortex plugin: {name}"""

from cx_ops.plugins.base import Plugin, PluginInfo, PluginType


class {name.title().replace("-", "")}Plugin(Plugin):
    """Example plugin."""

    @property
    def info(self) -> PluginInfo:
        return PluginInfo(
            name="{name}",
            version="0.1.0",
            description="A Cortex plugin",
            author="Your Name",
            plugin_type=PluginType.HOOK,
        )

    def activate(self) -> None:
        """Activate plugin."""
        pass

    def deactivate(self) -> None:
        """Deactivate plugin."""
        pass
'''

    (plugin_dir / "__init__.py").write_text(init_content)

    # Create README
    readme_content = f"""# {name}

A Cortex plugin.

## Installation

```bash
cp -r {name} /etc/cortex/plugins/
```

## Usage

```bash
cx-ops plugins list
```
"""
    (plugin_dir / "README.md").write_text(readme_content)

    return plugin_dir
