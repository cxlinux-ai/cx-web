# Contributing to Cortex LLM

We welcome contributions! Cortex LLM is part of the Cortex Linux ecosystem.

## Bounty Program

We pay bounties for merged PRs:
- **$25** - Bug fixes, documentation
- **$50** - Minor features, tests
- **$100** - Medium features
- **$200** - Major features

Look for issues labeled `bounty` for current opportunities.

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make your changes
4. Run tests (`pytest`)
5. Commit with conventional commits (`feat:`, `fix:`, `docs:`)
6. Push and open a PR

## Code Style

- Python: Follow PEP 8, use type hints
- Run `ruff check` before committing
- GPU code requires testing on target hardware

## Testing GPU Features

For GPU-related contributions, please note:
- Test on both NVIDIA (CUDA) and AMD (ROCm) if possible
- Include fallback to CPU for compatibility

## Questions?

Open an issue or reach out at contribute@cortexlinux.com
