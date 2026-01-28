"""Stack definitions."""

from .base import BaseStack, StackConfig, StackStatus, ServiceInfo
from .lamp import LAMPStack
from .lemp import LEMPStack
from .node import NodeStack
from .python import PythonStack
from .django import DjangoStack
from .fastapi import FastAPIStack
from .wordpress import WordPressStack
from .ghost import GhostStack

AVAILABLE_STACKS: dict[str, type[BaseStack]] = {
    "lamp": LAMPStack,
    "lemp": LEMPStack,
    "node": NodeStack,
    "python": PythonStack,
    "django": DjangoStack,
    "fastapi": FastAPIStack,
    "wordpress": WordPressStack,
    "ghost": GhostStack,
}


def get_stack(name: str) -> type[BaseStack] | None:
    """Get stack class by name."""
    return AVAILABLE_STACKS.get(name.lower())


def list_stacks() -> list[str]:
    """List available stack names."""
    return list(AVAILABLE_STACKS.keys())


__all__ = [
    "BaseStack",
    "StackConfig",
    "StackStatus",
    "ServiceInfo",
    "LAMPStack",
    "LEMPStack",
    "NodeStack",
    "PythonStack",
    "DjangoStack",
    "FastAPIStack",
    "WordPressStack",
    "GhostStack",
    "AVAILABLE_STACKS",
    "get_stack",
    "list_stacks",
]
