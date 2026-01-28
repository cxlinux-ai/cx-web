"""
Sapiens 0.27B Reasoning Engine
Multi-agent supervisor system for iterative reasoning on Linux systems
"""

__version__ = "1.0.0"
__author__ = "Cortex Linux Team"

from .engine import SapiensReasoningEngine
from .supervisor import SupervisorNode, AgentRole
from .models import ReasoningStep, ReasoningChain, ReasoningResult

__all__ = [
    "SapiensReasoningEngine",
    "SupervisorNode",
    "AgentRole",
    "ReasoningStep",
    "ReasoningChain",
    "ReasoningResult",
]
