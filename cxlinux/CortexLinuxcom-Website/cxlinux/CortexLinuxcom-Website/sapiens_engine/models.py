"""
Data models for the Sapiens Reasoning Engine
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime
import json


class AgentRole(Enum):
    """Roles for supervisor agents in the multi-agent system"""
    PLANNER = "planner"
    EXECUTOR = "executor"
    VALIDATOR = "validator"
    CORRECTOR = "corrector"


@dataclass
class ReasoningStep:
    """A single step in the reasoning process"""
    agent_role: AgentRole
    input_data: str
    output_data: str
    confidence: float
    iteration: int
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_role": self.agent_role.value,
            "input_data": self.input_data,
            "output_data": self.output_data,
            "confidence": self.confidence,
            "iteration": self.iteration,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ReasoningStep":
        return cls(
            agent_role=AgentRole(data["agent_role"]),
            input_data=data["input_data"],
            output_data=data["output_data"],
            confidence=data["confidence"],
            iteration=data["iteration"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            metadata=data.get("metadata", {}),
        )


@dataclass
class ReasoningChain:
    """A chain of reasoning steps from start to solution"""
    steps: List[ReasoningStep] = field(default_factory=list)
    total_iterations: int = 0
    converged: bool = False
    final_confidence: float = 0.0
    
    def add_step(self, step: ReasoningStep) -> None:
        self.steps.append(step)
        self.final_confidence = step.confidence
        self.total_iterations = max(self.total_iterations, step.iteration)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "steps": [step.to_dict() for step in self.steps],
            "total_iterations": self.total_iterations,
            "converged": self.converged,
            "final_confidence": self.final_confidence,
        }


@dataclass
class ReasoningResult:
    """Final result of a reasoning task"""
    success: bool
    solution: str
    reasoning_chain: ReasoningChain
    task_type: str
    original_input: str
    processing_time_ms: float
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "solution": self.solution,
            "reasoning_chain": self.reasoning_chain.to_dict(),
            "task_type": self.task_type,
            "original_input": self.original_input,
            "processing_time_ms": self.processing_time_ms,
            "error": self.error,
        }
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)
