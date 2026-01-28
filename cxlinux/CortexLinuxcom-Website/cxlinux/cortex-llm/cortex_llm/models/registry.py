"""Model registry and catalog."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional
import json

import yaml

from ..config import get_settings


@dataclass
class ModelInfo:
    """Model metadata."""

    name: str
    filename: str
    size_mb: int
    quantization: str
    parameters: str
    context_length: int
    description: str
    source: str  # HuggingFace repo or direct URL
    sha256: str = ""
    license: str = ""
    tags: list[str] = field(default_factory=list)

    # Local state
    is_downloaded: bool = False
    local_path: Optional[Path] = None

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "name": self.name,
            "filename": self.filename,
            "size_mb": self.size_mb,
            "quantization": self.quantization,
            "parameters": self.parameters,
            "context_length": self.context_length,
            "description": self.description,
            "source": self.source,
            "sha256": self.sha256,
            "license": self.license,
            "tags": self.tags,
        }


# Default model registry
DEFAULT_MODELS: dict[str, ModelInfo] = {
    "mistral-7b-instruct-q4": ModelInfo(
        name="mistral-7b-instruct-q4",
        filename="mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        size_mb=4370,
        quantization="Q4_K_M",
        parameters="7B",
        context_length=8192,
        description="Mistral 7B Instruct v0.2 - Fast, capable instruction-following model",
        source="TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
        license="Apache-2.0",
        tags=["instruct", "chat", "general"],
    ),
    "llama-3-8b-instruct-q4": ModelInfo(
        name="llama-3-8b-instruct-q4",
        filename="Meta-Llama-3-8B-Instruct.Q4_K_M.gguf",
        size_mb=4920,
        quantization="Q4_K_M",
        parameters="8B",
        context_length=8192,
        description="Meta Llama 3 8B Instruct - Latest Llama model with strong performance",
        source="QuantFactory/Meta-Llama-3-8B-Instruct-GGUF",
        license="Llama 3 Community",
        tags=["instruct", "chat", "general"],
    ),
    "phi-3-mini-q4": ModelInfo(
        name="phi-3-mini-q4",
        filename="Phi-3-mini-4k-instruct-q4.gguf",
        size_mb=2390,
        quantization="Q4_K_M",
        parameters="3.8B",
        context_length=4096,
        description="Microsoft Phi-3 Mini - Compact yet capable model",
        source="microsoft/Phi-3-mini-4k-instruct-gguf",
        license="MIT",
        tags=["instruct", "compact", "efficient"],
    ),
    "qwen2-7b-instruct-q4": ModelInfo(
        name="qwen2-7b-instruct-q4",
        filename="qwen2-7b-instruct-q4_k_m.gguf",
        size_mb=4680,
        quantization="Q4_K_M",
        parameters="7B",
        context_length=32768,
        description="Qwen2 7B Instruct - Strong multilingual capabilities",
        source="Qwen/Qwen2-7B-Instruct-GGUF",
        license="Apache-2.0",
        tags=["instruct", "multilingual", "long-context"],
    ),
    "codellama-7b-instruct-q4": ModelInfo(
        name="codellama-7b-instruct-q4",
        filename="codellama-7b-instruct.Q4_K_M.gguf",
        size_mb=4080,
        quantization="Q4_K_M",
        parameters="7B",
        context_length=16384,
        description="Code Llama 7B Instruct - Optimized for code generation",
        source="TheBloke/CodeLlama-7B-Instruct-GGUF",
        license="Llama 2 Community",
        tags=["code", "instruct", "programming"],
    ),
}


class ModelRegistry:
    """Manages model catalog and local models."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.models_dir = self.settings.models_dir
        self.registry_file = self.models_dir / "registry.json"
        self._models: dict[str, ModelInfo] = {}
        self._load_registry()

    def _load_registry(self) -> None:
        """Load registry from disk and merge with defaults."""
        # Start with defaults
        self._models = {k: ModelInfo(**v.to_dict()) for k, v in DEFAULT_MODELS.items()}

        # Load custom models from registry file
        if self.registry_file.exists():
            try:
                with open(self.registry_file) as f:
                    data = json.load(f)
                for name, info in data.get("models", {}).items():
                    if name not in self._models:
                        self._models[name] = ModelInfo(**info)
            except Exception:
                pass

        # Update download status
        self._scan_local_models()

    def _scan_local_models(self) -> None:
        """Scan for downloaded models."""
        if not self.models_dir.exists():
            return

        for model in self._models.values():
            local_path = self.models_dir / model.filename
            if local_path.exists():
                model.is_downloaded = True
                model.local_path = local_path

    def _save_registry(self) -> None:
        """Save custom models to registry file."""
        # Only save non-default models
        custom_models = {
            k: v.to_dict()
            for k, v in self._models.items()
            if k not in DEFAULT_MODELS
        }

        self.models_dir.mkdir(parents=True, exist_ok=True)
        with open(self.registry_file, "w") as f:
            json.dump({"models": custom_models}, f, indent=2)

    def list_models(self, downloaded_only: bool = False) -> list[ModelInfo]:
        """List all available models."""
        models = list(self._models.values())
        if downloaded_only:
            models = [m for m in models if m.is_downloaded]
        return sorted(models, key=lambda m: m.name)

    def get_model(self, name: str) -> Optional[ModelInfo]:
        """Get model by name."""
        return self._models.get(name)

    def add_model(self, model: ModelInfo) -> None:
        """Add a custom model to the registry."""
        self._models[model.name] = model
        self._save_registry()

    def remove_model(self, name: str) -> bool:
        """Remove a model from the registry and disk."""
        model = self._models.get(name)
        if not model:
            return False

        # Delete local file
        if model.local_path and model.local_path.exists():
            model.local_path.unlink()

        # Remove from defaults? Only remove from custom
        if name not in DEFAULT_MODELS:
            del self._models[name]
            self._save_registry()
        else:
            # Just mark as not downloaded
            model.is_downloaded = False
            model.local_path = None

        return True

    def get_model_path(self, name: str) -> Optional[Path]:
        """Get local path for a downloaded model."""
        model = self._models.get(name)
        if model and model.is_downloaded and model.local_path:
            return model.local_path
        return None

    def mark_downloaded(self, name: str, path: Path) -> None:
        """Mark a model as downloaded."""
        model = self._models.get(name)
        if model:
            model.is_downloaded = True
            model.local_path = path

    def get_recommended_model(self, max_size_mb: int = 8000) -> Optional[ModelInfo]:
        """Get recommended model based on available resources."""
        candidates = [
            m for m in self._models.values()
            if m.size_mb <= max_size_mb
        ]
        if not candidates:
            return None

        # Prefer downloaded models
        downloaded = [m for m in candidates if m.is_downloaded]
        if downloaded:
            return downloaded[0]

        # Otherwise return smallest suitable model
        return min(candidates, key=lambda m: m.size_mb)
