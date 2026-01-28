"""Tests for the plugins module."""

import pytest
from pathlib import Path
import tempfile

from cx_ops.plugins.base import Plugin, PluginInfo, PluginType
from cx_ops.plugins.hooks import Hook, HookPriority, HookRegistry
from cx_ops.plugins.loader import create_plugin_scaffold


class TestPluginInfo:
    """Tests for PluginInfo."""

    def test_create_info(self):
        info = PluginInfo(
            name="test-plugin",
            version="1.0.0",
            description="A test plugin",
            author="Test Author",
            plugin_type=PluginType.COMMAND,
        )
        assert info.name == "test-plugin"
        assert info.version == "1.0.0"
        assert info.plugin_type == PluginType.COMMAND

    def test_from_dict(self):
        data = {
            "name": "my-plugin",
            "version": "2.0.0",
            "description": "My plugin",
            "author": "Me",
            "plugin_type": "check",
        }
        info = PluginInfo.from_dict(data)
        assert info.name == "my-plugin"
        assert info.plugin_type == PluginType.CHECK

    def test_to_dict(self):
        info = PluginInfo(
            name="test",
            version="1.0.0",
            description="Test",
            author="Test",
            plugin_type=PluginType.HOOK,
        )
        data = info.to_dict()
        assert data["name"] == "test"
        assert data["plugin_type"] == "hook"


class TestHookRegistry:
    """Tests for HookRegistry."""

    def test_register_hook(self):
        registry = HookRegistry()
        results = []

        def callback(value):
            results.append(value)
            return value

        hook = registry.register("test_hook", callback)
        assert hook.name == "test_hook"

        registry.trigger("test_hook", "hello")
        assert results == ["hello"]

    def test_hook_priority(self):
        registry = HookRegistry()
        results = []

        registry.register("order_test", lambda: results.append("low"), HookPriority.LOW)
        registry.register("order_test", lambda: results.append("high"), HookPriority.HIGH)
        registry.register("order_test", lambda: results.append("normal"), HookPriority.NORMAL)

        registry.trigger("order_test")
        assert results == ["high", "normal", "low"]

    def test_unregister_hook(self):
        registry = HookRegistry()
        results = []

        hook = registry.register("test", lambda: results.append("called"))
        registry.trigger("test")
        assert len(results) == 1

        registry.unregister(hook)
        registry.trigger("test")
        assert len(results) == 1  # Still 1, not called again

    def test_unregister_by_plugin(self):
        registry = HookRegistry()

        registry.register("hook1", lambda: None, plugin_name="plugin_a")
        registry.register("hook1", lambda: None, plugin_name="plugin_b")
        registry.register("hook2", lambda: None, plugin_name="plugin_a")

        count = registry.unregister_plugin("plugin_a")
        assert count == 2

        hooks = registry.get_hooks("hook1")
        assert len(hooks) == 1
        assert hooks[0].plugin_name == "plugin_b"

    def test_trigger_filter(self):
        registry = HookRegistry()

        registry.register("filter", lambda x: x + 1)
        registry.register("filter", lambda x: x * 2)

        result = registry.trigger_filter("filter", 5)
        assert result == 12  # (5 + 1) * 2

    def test_decorator(self):
        registry = HookRegistry()
        results = []

        @registry.on("decorated_hook")
        def handler(value):
            results.append(value)

        registry.trigger("decorated_hook", "test")
        assert results == ["test"]


class TestPluginScaffold:
    """Tests for plugin scaffolding."""

    def test_create_command_plugin(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = create_plugin_scaffold(
                "test-command",
                "command",
                Path(tmpdir),
            )

            assert path.exists()
            assert (path / "plugin.yaml").exists()
            assert (path / "__init__.py").exists()
            assert (path / "README.md").exists()

            init_content = (path / "__init__.py").read_text()
            assert "CommandPlugin" in init_content

    def test_create_check_plugin(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = create_plugin_scaffold(
                "test-check",
                "check",
                Path(tmpdir),
            )

            init_content = (path / "__init__.py").read_text()
            assert "CheckPlugin" in init_content
            assert "CheckCategory" in init_content
