# CORTEX-CLI - Natural Language Shell

## Purpose
Interactive shell interface that converts natural language to system commands with safety features.

## Repo Role in Ecosystem
- **User-facing shell** - primary interaction point for power users
- Depends on: cortex (core)
- Optional: cortex-llm (for local inference)

## Key Features
- Prompt-to-plan pipeline: natural language → command plan → user approval → execution
- Firejail sandboxing for untrusted commands
- Command history with semantic search
- Tab completion for natural language

## Key Directories
```
cortex-cli/
├── shell/          # Interactive shell implementation
├── planner/        # Prompt-to-plan conversion
├── executor/       # Command execution with sandbox
└── history/        # Semantic history search
```

## Development Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Running
```bash
cortex-shell              # Start interactive shell
cortex-shell -c "..."     # Run single command
```

## Key Patterns
- All LLM-generated commands require user confirmation by default
- Use `--trust` flag for auto-execution (dangerous)
- History stored in `~/.cortex/history/`

## Testing
```bash
pytest tests/ -v
```

## Integration Points
- Calls `cortex` library for package operations
- Can use `cortex-llm` for offline inference
