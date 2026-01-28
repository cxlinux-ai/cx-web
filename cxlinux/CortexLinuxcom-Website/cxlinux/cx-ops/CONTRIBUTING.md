# Contributing to CX Ops

Thank you for your interest in contributing to CX Ops!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/cx-ops.git`
3. Create a branch: `git checkout -b feat/your-feature`
4. Install dev dependencies: `pip install -e ".[dev]"`

## Development

```bash
# Run tests
pytest

# Run linter
ruff check .

# Run type checker
mypy cx_ops

# Format code
ruff format .
```

## Pull Request Process

1. Update tests for any new functionality
2. Ensure all checks pass (`pytest`, `ruff`, `mypy`)
3. Update documentation if needed
4. Submit PR with clear description

## Commit Convention

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

Open an issue or discussion!
