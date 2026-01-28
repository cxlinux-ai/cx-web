"""Hook system for plugin extensibility."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, TypeVar, Generic

T = TypeVar("T")


class HookPriority(Enum):
    """Priority for hook execution order."""

    FIRST = 0
    HIGH = 25
    NORMAL = 50
    LOW = 75
    LAST = 100


@dataclass
class Hook(Generic[T]):
    """A registered hook callback."""

    name: str
    callback: Callable[..., T]
    priority: HookPriority = HookPriority.NORMAL
    plugin_name: str | None = None
    enabled: bool = True

    def __lt__(self, other: "Hook[Any]") -> bool:
        return self.priority.value < other.priority.value


class HookRegistry:
    """Registry for managing hooks across plugins.

    Hooks allow plugins to extend or modify Cortex behavior at
    defined extension points.

    Built-in hooks:
    - pre_check: Before running a health check
    - post_check: After running a health check
    - pre_command: Before executing a CLI command
    - post_command: After executing a CLI command
    - pre_fix: Before applying a fix
    - post_fix: After applying a fix
    - startup: When cx-ops starts
    - shutdown: When cx-ops exits
    - config_loaded: After configuration is loaded
    - plugin_loaded: After a plugin is loaded
    - plugin_unloaded: After a plugin is unloaded

    Example:
        registry = HookRegistry()

        @registry.on("post_check", priority=HookPriority.HIGH)
        def log_check_result(result):
            print(f"Check completed: {result.name}")
    """

    # Built-in hook names
    HOOKS = [
        "pre_check",
        "post_check",
        "pre_command",
        "post_command",
        "pre_fix",
        "post_fix",
        "startup",
        "shutdown",
        "config_loaded",
        "plugin_loaded",
        "plugin_unloaded",
    ]

    def __init__(self) -> None:
        self._hooks: dict[str, list[Hook[Any]]] = {name: [] for name in self.HOOKS}

    def register(
        self,
        hook_name: str,
        callback: Callable[..., T],
        priority: HookPriority = HookPriority.NORMAL,
        plugin_name: str | None = None,
    ) -> Hook[T]:
        """Register a hook callback."""
        if hook_name not in self._hooks:
            self._hooks[hook_name] = []

        hook = Hook(
            name=hook_name,
            callback=callback,
            priority=priority,
            plugin_name=plugin_name,
        )

        self._hooks[hook_name].append(hook)
        self._hooks[hook_name].sort()

        return hook

    def on(
        self,
        hook_name: str,
        priority: HookPriority = HookPriority.NORMAL,
        plugin_name: str | None = None,
    ) -> Callable[[Callable[..., T]], Callable[..., T]]:
        """Decorator for registering hooks.

        Example:
            @hooks.on("post_check")
            def my_handler(result):
                print(f"Check: {result.name}")
        """

        def decorator(func: Callable[..., T]) -> Callable[..., T]:
            self.register(hook_name, func, priority, plugin_name)
            return func

        return decorator

    def unregister(self, hook: Hook[Any]) -> bool:
        """Unregister a specific hook."""
        if hook.name in self._hooks:
            try:
                self._hooks[hook.name].remove(hook)
                return True
            except ValueError:
                pass
        return False

    def unregister_plugin(self, plugin_name: str) -> int:
        """Unregister all hooks for a plugin."""
        count = 0
        for hook_name in self._hooks:
            original_len = len(self._hooks[hook_name])
            self._hooks[hook_name] = [
                h for h in self._hooks[hook_name] if h.plugin_name != plugin_name
            ]
            count += original_len - len(self._hooks[hook_name])
        return count

    def trigger(self, hook_name: str, *args: Any, **kwargs: Any) -> list[Any]:
        """Trigger all callbacks for a hook.

        Returns list of results from each callback.
        """
        results = []

        if hook_name not in self._hooks:
            return results

        for hook in self._hooks[hook_name]:
            if not hook.enabled:
                continue

            try:
                result = hook.callback(*args, **kwargs)
                results.append(result)
            except Exception as e:
                results.append(e)

        return results

    async def trigger_async(self, hook_name: str, *args: Any, **kwargs: Any) -> list[Any]:
        """Trigger all callbacks for a hook asynchronously."""
        import asyncio
        import inspect

        results = []

        if hook_name not in self._hooks:
            return results

        for hook in self._hooks[hook_name]:
            if not hook.enabled:
                continue

            try:
                if inspect.iscoroutinefunction(hook.callback):
                    result = await hook.callback(*args, **kwargs)
                else:
                    result = await asyncio.get_event_loop().run_in_executor(
                        None, lambda: hook.callback(*args, **kwargs)
                    )
                results.append(result)
            except Exception as e:
                results.append(e)

        return results

    def trigger_filter(
        self, hook_name: str, value: T, *args: Any, **kwargs: Any
    ) -> T:
        """Trigger hooks as a filter chain.

        Each callback receives the value and can modify it.
        The final value is returned.
        """
        if hook_name not in self._hooks:
            return value

        for hook in self._hooks[hook_name]:
            if not hook.enabled:
                continue

            try:
                value = hook.callback(value, *args, **kwargs)
            except Exception:
                pass

        return value

    def get_hooks(self, hook_name: str) -> list[Hook[Any]]:
        """Get all registered hooks for a name."""
        return self._hooks.get(hook_name, []).copy()

    def get_all_hooks(self) -> dict[str, list[Hook[Any]]]:
        """Get all registered hooks."""
        return {name: hooks.copy() for name, hooks in self._hooks.items()}

    def clear(self, hook_name: str | None = None) -> None:
        """Clear all hooks or hooks for a specific name."""
        if hook_name:
            if hook_name in self._hooks:
                self._hooks[hook_name] = []
        else:
            for name in self._hooks:
                self._hooks[name] = []


# Global hook registry
hooks = HookRegistry()
