"""
Configuration for Sapiens Reasoning Engine
"""

import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class SapiensConfig:
    """Configuration for the Sapiens reasoning engine"""
    
    model_name: str = "agent-reasoning/Sapiens-0.27B-HF"
    max_iterations: int = 5
    confidence_threshold: float = 0.85
    max_tokens: int = 512
    temperature: float = 0.7
    device: str = "cpu"
    cache_dir: Optional[str] = None
    log_level: str = "INFO"
    
    api_host: str = "0.0.0.0"
    api_port: int = 8100
    api_debug: bool = False
    
    @classmethod
    def from_env(cls) -> "SapiensConfig":
        """Load configuration from environment variables"""
        return cls(
            model_name=os.getenv("SAPIENS_MODEL", cls.model_name),
            max_iterations=int(os.getenv("SAPIENS_MAX_ITERATIONS", cls.max_iterations)),
            confidence_threshold=float(os.getenv("SAPIENS_CONFIDENCE_THRESHOLD", cls.confidence_threshold)),
            max_tokens=int(os.getenv("SAPIENS_MAX_TOKENS", cls.max_tokens)),
            temperature=float(os.getenv("SAPIENS_TEMPERATURE", cls.temperature)),
            device=os.getenv("SAPIENS_DEVICE", cls.device),
            cache_dir=os.getenv("SAPIENS_CACHE_DIR", cls.cache_dir),
            log_level=os.getenv("SAPIENS_LOG_LEVEL", cls.log_level),
            api_host=os.getenv("SAPIENS_API_HOST", cls.api_host),
            api_port=int(os.getenv("SAPIENS_API_PORT", cls.api_port)),
            api_debug=os.getenv("SAPIENS_API_DEBUG", "false").lower() == "true",
        )


DEFAULT_CONFIG = SapiensConfig()
