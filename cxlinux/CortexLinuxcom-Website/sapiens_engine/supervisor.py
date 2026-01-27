"""
SupervisorNode class for multi-agent reasoning
Each supervisor handles a specific role in the reasoning pipeline
"""

import logging
from typing import Dict, Any, Tuple, Optional
from abc import ABC, abstractmethod

from .models import AgentRole, ReasoningStep
from .config import SapiensConfig

logger = logging.getLogger(__name__)


class SupervisorNode(ABC):
    """
    Base class for supervisor agents in the multi-agent system.
    Each supervisor specializes in a specific reasoning task.
    """
    
    def __init__(self, role: AgentRole, model, tokenizer, config: SapiensConfig):
        self.role = role
        self.model = model
        self.tokenizer = tokenizer
        self.config = config
        self._system_prompt = self._get_system_prompt()
    
    @abstractmethod
    def _get_system_prompt(self) -> str:
        """Get the role-specific system prompt"""
        pass
    
    def process(self, input_data: str, context: Dict[str, Any], iteration: int) -> ReasoningStep:
        """
        Process input data and return a reasoning step.
        
        Args:
            input_data: The input to process
            context: Additional context from previous steps
            iteration: Current iteration number
            
        Returns:
            ReasoningStep with output and confidence score
        """
        prompt = self._build_prompt(input_data, context)
        output, confidence = self._generate(prompt)
        
        step = ReasoningStep(
            agent_role=self.role,
            input_data=input_data,
            output_data=output,
            confidence=confidence,
            iteration=iteration,
            metadata={"context_keys": list(context.keys())}
        )
        
        logger.debug(f"{self.role.value} produced output with confidence {confidence:.2f}")
        return step
    
    def _build_prompt(self, input_data: str, context: Dict[str, Any]) -> str:
        """Build the full prompt including system prompt and context"""
        context_str = ""
        if context:
            context_str = "\n\nContext from previous steps:\n"
            for key, value in context.items():
                if isinstance(value, str):
                    context_str += f"- {key}: {value[:500]}...\n" if len(value) > 500 else f"- {key}: {value}\n"
        
        return f"{self._system_prompt}\n\n{context_str}\n\nInput:\n{input_data}\n\nOutput:"
    
    def _generate(self, prompt: str) -> Tuple[str, float]:
        """Generate response using the model"""
        try:
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                max_length=1024,
                truncation=True
            )
            
            outputs = self.model.generate(
                inputs.input_ids,
                max_new_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
                output_scores=True,
                return_dict_in_generate=True,
            )
            
            generated_ids = outputs.sequences[0][inputs.input_ids.shape[1]:]
            response = self.tokenizer.decode(generated_ids, skip_special_tokens=True)
            
            confidence = self._calculate_confidence(outputs)
            
            return response.strip(), confidence
            
        except Exception as e:
            logger.error(f"Generation error in {self.role.value}: {e}")
            return f"Error: {str(e)}", 0.0
    
    def _calculate_confidence(self, outputs) -> float:
        """Calculate confidence score from generation outputs"""
        try:
            if hasattr(outputs, 'scores') and outputs.scores:
                import torch
                all_probs = []
                for score in outputs.scores[:10]:
                    probs = torch.softmax(score, dim=-1)
                    max_prob = probs.max().item()
                    all_probs.append(max_prob)
                return sum(all_probs) / len(all_probs) if all_probs else 0.5
            return 0.5
        except Exception:
            return 0.5


class PlannerSupervisor(SupervisorNode):
    """Plans the approach to solve a problem"""
    
    def __init__(self, model, tokenizer, config: SapiensConfig):
        super().__init__(AgentRole.PLANNER, model, tokenizer, config)
    
    def _get_system_prompt(self) -> str:
        return """You are a Planning Agent specialized in breaking down complex problems.
Your role is to:
1. Analyze the given problem or task
2. Identify key components and requirements
3. Create a step-by-step plan to solve it
4. Consider edge cases and potential issues

Output a clear, structured plan that can be executed."""


class ExecutorSupervisor(SupervisorNode):
    """Executes the plan and generates solutions"""
    
    def __init__(self, model, tokenizer, config: SapiensConfig):
        super().__init__(AgentRole.EXECUTOR, model, tokenizer, config)
    
    def _get_system_prompt(self) -> str:
        return """You are an Executor Agent specialized in implementing solutions.
Your role is to:
1. Follow the provided plan step by step
2. Generate concrete solutions, code, or commands
3. Be precise and practical in your implementations
4. Handle edge cases identified in the plan

Output working solutions that directly address each step."""


class ValidatorSupervisor(SupervisorNode):
    """Validates solutions for correctness and completeness"""
    
    def __init__(self, model, tokenizer, config: SapiensConfig):
        super().__init__(AgentRole.VALIDATOR, model, tokenizer, config)
    
    def _get_system_prompt(self) -> str:
        return """You are a Validator Agent specialized in quality assurance.
Your role is to:
1. Review the proposed solution against requirements
2. Check for errors, bugs, or logical issues
3. Verify completeness and correctness
4. Identify any missing components

Output a validation report with:
- VALID: if the solution is correct
- ISSUES: list any problems found
- SCORE: confidence score 0-100"""


class CorrectorSupervisor(SupervisorNode):
    """Corrects and improves solutions based on validation"""
    
    def __init__(self, model, tokenizer, config: SapiensConfig):
        super().__init__(AgentRole.CORRECTOR, model, tokenizer, config)
    
    def _get_system_prompt(self) -> str:
        return """You are a Corrector Agent specialized in fixing and improving solutions.
Your role is to:
1. Address all issues identified by the validator
2. Improve the solution quality
3. Optimize for efficiency and clarity
4. Ensure all requirements are met

Output the corrected solution with explanations of changes made."""


def create_supervisor(role: AgentRole, model, tokenizer, config: SapiensConfig) -> SupervisorNode:
    """Factory function to create supervisor nodes"""
    supervisors = {
        AgentRole.PLANNER: PlannerSupervisor,
        AgentRole.EXECUTOR: ExecutorSupervisor,
        AgentRole.VALIDATOR: ValidatorSupervisor,
        AgentRole.CORRECTOR: CorrectorSupervisor,
    }
    
    if role not in supervisors:
        raise ValueError(f"Unknown agent role: {role}")
    
    return supervisors[role](model, tokenizer, config)
