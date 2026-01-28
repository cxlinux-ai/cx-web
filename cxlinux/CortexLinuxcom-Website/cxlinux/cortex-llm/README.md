# Cortex LLM

Local LLM inference runtime for Cortex Linux. Run large language models on your own hardware with GPU acceleration.

## Features

- **Hardware Detection** - Auto-detect CUDA, ROCm, or CPU-only configurations
- **Model Management** - Download, validate, and manage GGUF models
- **Inference Engine** - High-performance text generation with llama-cpp-python
- **REST API Server** - FastAPI server with streaming support
- **CLI Interface** - Full-featured command line interface

## Installation

```bash
# From source
pip install -e .

# With CUDA support
CMAKE_ARGS="-DLLAMA_CUDA=on" pip install -e .

# With ROCm support
CMAKE_ARGS="-DLLAMA_HIPBLAS=on" pip install -e .
```

## Quick Start

```bash
# Detect hardware capabilities
cortex-llm hardware detect

# Download a model
cortex-llm models pull mistral-7b

# Start interactive chat
cortex-llm chat mistral-7b

# Or run inference server
cortex-llm serve mistral-7b --port 8080
```

## CLI Commands

### Models

```bash
# List available models
cortex-llm models list

# Download a model
cortex-llm models pull <model-name>

# Remove a model
cortex-llm models remove <model-name>

# Show model info
cortex-llm models info <model-name>
```

### Inference

```bash
# Single prompt completion
cortex-llm run <model> --prompt "Your prompt here"

# Interactive chat session
cortex-llm chat <model>

# Start API server
cortex-llm serve <model> --host 0.0.0.0 --port 8080
```

### Hardware

```bash
# Detect GPU and system capabilities
cortex-llm hardware detect

# Run inference benchmark
cortex-llm hardware benchmark
```

### Configuration

```bash
# Show current config
cortex-llm config show

# Update config value
cortex-llm config set models_dir /path/to/models
```

## API Endpoints

When running the server with `cortex-llm serve`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/models` | GET | List available models |
| `/generate` | POST | Text completion |
| `/chat` | POST | Chat completion |
| `/metrics` | GET | Server metrics |
| `/models/{name}/load` | POST | Load specific model |
| `/models/unload` | POST | Unload current model |

### Generate Request

```json
{
  "prompt": "Once upon a time",
  "max_tokens": 2048,
  "temperature": 0.7,
  "top_p": 0.9,
  "stream": false
}
```

### Chat Request

```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "max_tokens": 2048,
  "temperature": 0.7,
  "stream": false
}
```

## Default Models

| Model | Parameters | Quantization | Size |
|-------|------------|--------------|------|
| mistral-7b | 7B | Q4_K_M | 4.4 GB |
| llama-3-8b | 8B | Q4_K_M | 4.9 GB |
| phi-3-mini | 3.8B | Q4_K_M | 2.4 GB |
| qwen2-7b | 7B | Q4_K_M | 4.4 GB |
| codellama-7b | 7B | Q4_K_M | 4.2 GB |

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CORTEX_MODELS_DIR` | `~/.cortex/models` | Model storage directory |
| `CORTEX_API_KEY` | None | API key for server auth |
| `CORTEX_HOST` | `127.0.0.1` | Server bind address |
| `CORTEX_PORT` | `8080` | Server port |

## Hardware Requirements

- **Minimum**: 8GB RAM, CPU-only inference
- **Recommended**: 16GB RAM, NVIDIA GPU with 8GB+ VRAM
- **Optimal**: 32GB RAM, NVIDIA RTX 3090/4090 or AMD RX 7900

## License

MIT License - AI Venture Holdings LLC
