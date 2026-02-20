# Sapiens 0.27B Reasoning Engine

A multi-agent supervisor system for iterative reasoning on Linux systems using the Sapiens 0.27B model.

## Features

- **Multi-Agent System**: Planner, Executor, Validator, and Corrector agents
- **Iterative Refinement**: Up to 5 iterations until convergence
- **Confidence Scoring**: Early stopping when confidence > 85%
- **HTTP API**: RESTful endpoints for all reasoning tasks
- **Offline Capable**: Runs entirely on CPU, no GPU required
- **Production Ready**: Logging, error handling, systemd integration

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the API server
python run_sapiens.py --port 8100
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Generic Reasoning
```bash
POST /reason
Content-Type: application/json

{
  "problem": "How can I automate backup tasks on Linux?"
}
```

### Project Planning
```bash
POST /plan
Content-Type: application/json

{
  "project": "Build a CI/CD pipeline for a Python web application"
}
```

### Code Debugging
```bash
POST /debug
Content-Type: application/json

{
  "code": "def divide(a, b):\n    return a / b",
  "error": "ZeroDivisionError when b is 0"
}
```

### Workflow Optimization
```bash
POST /optimize
Content-Type: application/json

{
  "workflow": "Manual deployment: git pull, build, restart services",
  "goals": "Reduce deployment time, add rollback capability"
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SapiensReasoningEngine                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Planner │→ │Executor │→ │Validator│→ │Corrector│        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│       ↑                                       │              │
│       └───────────── Iteration Loop ──────────┘              │
├─────────────────────────────────────────────────────────────┤
│                    Sapiens 0.27B Model                       │
│                    (CPU, ~200MB RAM)                         │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

Environment variables:
- `SAPIENS_MODEL`: Model name (default: agent-reasoning/Sapiens-0.27B-HF)
- `SAPIENS_MAX_ITERATIONS`: Max reasoning iterations (default: 5)
- `SAPIENS_CONFIDENCE_THRESHOLD`: Confidence for early stop (default: 0.85)
- `SAPIENS_DEVICE`: Device to use (default: cpu)
- `SAPIENS_API_PORT`: API server port (default: 8100)
- `SAPIENS_LOG_LEVEL`: Logging level (default: INFO)

## Systemd Service

Install as a system service:

```bash
sudo cp sapiens.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sapiens
sudo systemctl start sapiens
```

## Response Format

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "solution": "The final solution...",
  "reasoning_chain": {
    "steps": [...],
    "total_iterations": 3,
    "converged": true,
    "final_confidence": 0.89
  },
  "task_type": "general",
  "original_input": "...",
  "processing_time_ms": 1234.56
}
```

## License

MIT License - Part of CX Linux
