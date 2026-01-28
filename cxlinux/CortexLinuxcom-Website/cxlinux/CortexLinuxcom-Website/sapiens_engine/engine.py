"""
SapiensReasoningEngine - Main coordination class for multi-agent reasoning
"""

import logging
import time
from typing import Dict, Any, Optional

from .models import AgentRole, ReasoningChain, ReasoningResult
from .supervisor import create_supervisor, SupervisorNode
from .config import SapiensConfig, DEFAULT_CONFIG

logger = logging.getLogger(__name__)


class SapiensReasoningEngine:
    """
    Main reasoning engine that coordinates multiple supervisor agents
    for iterative problem solving.
    """
    
    def __init__(self, config: Optional[SapiensConfig] = None):
        self.config = config or DEFAULT_CONFIG
        self._model = None
        self._tokenizer = None
        self._supervisors: Dict[AgentRole, SupervisorNode] = {}
        self._initialized = False
        
        self._setup_logging()
    
    def _setup_logging(self) -> None:
        """Configure logging based on config"""
        logging.basicConfig(
            level=getattr(logging, self.config.log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def initialize(self) -> bool:
        """
        Initialize the model and supervisor agents.
        Returns True if successful, False otherwise.
        """
        if self._initialized:
            logger.info("Engine already initialized")
            return True
        
        try:
            logger.info(f"Loading model: {self.config.model_name}")
            start_time = time.time()
            
            from transformers import AutoModelForCausalLM, AutoTokenizer
            import torch
            
            self._tokenizer = AutoTokenizer.from_pretrained(
                self.config.model_name,
                cache_dir=self.config.cache_dir,
                trust_remote_code=True,
            )
            
            if self._tokenizer.pad_token is None:
                self._tokenizer.pad_token = self._tokenizer.eos_token
            
            self._model = AutoModelForCausalLM.from_pretrained(
                self.config.model_name,
                cache_dir=self.config.cache_dir,
                torch_dtype=torch.float32,
                device_map=self.config.device,
                trust_remote_code=True,
                low_cpu_mem_usage=True,
            )
            
            self._model.eval()
            
            for role in AgentRole:
                self._supervisors[role] = create_supervisor(
                    role, self._model, self._tokenizer, self.config
                )
            
            load_time = time.time() - start_time
            logger.info(f"Model loaded in {load_time:.2f}s")
            self._initialized = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize engine: {e}")
            return False
    
    def reason(self, problem: str, task_type: str = "general") -> ReasoningResult:
        """
        Main reasoning method that coordinates all agents.
        
        Args:
            problem: The problem or task to solve
            task_type: Type of task (general, plan, debug, optimize)
            
        Returns:
            ReasoningResult with solution and reasoning chain
        """
        if not self._initialized:
            if not self.initialize():
                return ReasoningResult(
                    success=False,
                    solution="",
                    reasoning_chain=ReasoningChain(),
                    task_type=task_type,
                    original_input=problem,
                    processing_time_ms=0,
                    error="Engine not initialized"
                )
        
        start_time = time.time()
        chain = ReasoningChain()
        context: Dict[str, Any] = {"original_problem": problem}
        current_solution = ""
        
        try:
            for iteration in range(1, self.config.max_iterations + 1):
                logger.info(f"Starting iteration {iteration}/{self.config.max_iterations}")
                
                plan_step = self._supervisors[AgentRole.PLANNER].process(
                    problem if iteration == 1 else f"Refine plan for: {problem}\nPrevious issues: {context.get('validation_issues', 'None')}",
                    context,
                    iteration
                )
                chain.add_step(plan_step)
                context["current_plan"] = plan_step.output_data
                
                exec_step = self._supervisors[AgentRole.EXECUTOR].process(
                    f"Execute this plan:\n{plan_step.output_data}",
                    context,
                    iteration
                )
                chain.add_step(exec_step)
                current_solution = exec_step.output_data
                context["current_solution"] = current_solution
                
                valid_step = self._supervisors[AgentRole.VALIDATOR].process(
                    f"Validate this solution:\n{current_solution}\n\nOriginal problem:\n{problem}",
                    context,
                    iteration
                )
                chain.add_step(valid_step)
                context["validation_result"] = valid_step.output_data
                
                if valid_step.confidence >= self.config.confidence_threshold:
                    logger.info(f"Converged at iteration {iteration} with confidence {valid_step.confidence:.2f}")
                    chain.converged = True
                    break
                
                if "VALID" in valid_step.output_data.upper() and valid_step.confidence > 0.7:
                    logger.info(f"Solution validated at iteration {iteration}")
                    chain.converged = True
                    break
                
                context["validation_issues"] = valid_step.output_data
                
                corr_step = self._supervisors[AgentRole.CORRECTOR].process(
                    f"Fix these issues:\n{valid_step.output_data}\n\nCurrent solution:\n{current_solution}",
                    context,
                    iteration
                )
                chain.add_step(corr_step)
                current_solution = corr_step.output_data
                context["current_solution"] = current_solution
            
            processing_time = (time.time() - start_time) * 1000
            
            return ReasoningResult(
                success=True,
                solution=current_solution,
                reasoning_chain=chain,
                task_type=task_type,
                original_input=problem,
                processing_time_ms=processing_time,
            )
            
        except Exception as e:
            logger.error(f"Reasoning error: {e}")
            processing_time = (time.time() - start_time) * 1000
            return ReasoningResult(
                success=False,
                solution="",
                reasoning_chain=chain,
                task_type=task_type,
                original_input=problem,
                processing_time_ms=processing_time,
                error=str(e)
            )
    
    def plan(self, project_description: str) -> ReasoningResult:
        """Specialized method for project planning tasks"""
        enhanced_prompt = f"""Create a detailed project plan for:

{project_description}

Include:
1. Project phases and milestones
2. Task breakdown with dependencies
3. Resource requirements
4. Risk assessment
5. Timeline estimates"""
        
        return self.reason(enhanced_prompt, task_type="plan")
    
    def debug(self, code: str, error_description: str = "") -> ReasoningResult:
        """Specialized method for code debugging tasks"""
        enhanced_prompt = f"""Debug the following code:

```
{code}
```

Error/Issue Description:
{error_description if error_description else "Analyze for potential bugs and issues"}

Provide:
1. Root cause analysis
2. Step-by-step fix
3. Explanation of the issue
4. Prevention recommendations"""
        
        return self.reason(enhanced_prompt, task_type="debug")
    
    def optimize(self, workflow: str, goals: str = "") -> ReasoningResult:
        """Specialized method for workflow optimization tasks"""
        enhanced_prompt = f"""Optimize the following workflow:

{workflow}

Optimization Goals:
{goals if goals else "Improve efficiency, reduce complexity, enhance reliability"}

Provide:
1. Current bottlenecks identified
2. Optimization recommendations
3. Implementation steps
4. Expected improvements
5. Trade-offs to consider"""
        
        return self.reason(enhanced_prompt, task_type="optimize")
    
    def get_status(self) -> Dict[str, Any]:
        """Get engine status information"""
        return {
            "initialized": self._initialized,
            "model_name": self.config.model_name,
            "device": self.config.device,
            "max_iterations": self.config.max_iterations,
            "confidence_threshold": self.config.confidence_threshold,
            "supervisors_loaded": list(self._supervisors.keys()) if self._supervisors else [],
        }
    
    def shutdown(self) -> None:
        """Clean up resources"""
        logger.info("Shutting down engine")
        self._model = None
        self._tokenizer = None
        self._supervisors.clear()
        self._initialized = False
