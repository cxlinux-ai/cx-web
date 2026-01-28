# CORTEX-LLM - Local LLM Inference

## Purpose
Local LLM inference engine supporting Ollama and llama.cpp with automatic GPU detection and CUDA setup.

## Repo Role in Ecosystem
- **Offline AI capability** - enables air-gapped operation
- Standalone module, no dependencies on other cortex repos
- Used by: cortex, cortex-cli (optional)

## Key Features
- Ollama integration with model management
- llama.cpp for direct GGUF model loading
- Automatic GPU detection (NVIDIA, AMD, Apple Silicon)
- CUDA toolkit auto-installation
- Model quantization recommendations based on VRAM

## Key Directories
```
cortex-llm/
├── providers/
│   ├── ollama.py       # Ollama API wrapper
│   └── llamacpp.py     # llama.cpp bindings
├── gpu/
│   ├── detect.py       # GPU detection
│   └── cuda.py         # CUDA setup
├── models/
│   └── manager.py      # Model download/management
└── daemon/             # Background inference service
```

## Development Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Key Commands
```bash
cortex-llm status                    # Show GPU and model status
cortex-llm pull mistral:7b          # Download model
cortex-llm serve                     # Start inference server
cortex-llm benchmark                 # Run performance tests
```

## GPU Detection
```python
from cortex_llm.gpu import detect_gpu
gpu = detect_gpu()  # Returns GPUInfo with vendor, vram, compute capability
```

## Environment Variables
```
CORTEX_LLM_MODEL=mistral:7b
CORTEX_LLM_GPU=auto|cpu|cuda|rocm|metal
OLLAMA_HOST=http://localhost:11434
```

## Testing
```bash
pytest tests/ -v
pytest tests/gpu/ -v --gpu  # GPU tests (requires hardware)
```
