# CX LINUX - ORGANIZATION STANDARDS

## Project Overview
CX Linux is an AI-native operating system layer for Debian/Ubuntu. Natural language system administration, intelligent infrastructure automation, and agentic AI operations.

## Branding
- **Name**: CX Linux (never "Cortex Linux")
- **GitHub Org**: github.com/cxlinux-ai
- **Website**: cxlinux.ai
- **Package prefix**: cx-* (e.g., cx-core, cx-llm)
- **Config paths**: ~/.cx/, /etc/cx/

## Repository Map
| Repo | Purpose | Language | Dependencies |
|------|---------|----------|--------------|
| `cx` | CX Terminal - AI-native terminal emulator | Rust | - |
| `cortex` | Core package - CLI, LLM routing, package resolver | Python | - |
| `cortex-cli` | Natural language shell interface | Python/Rust | cortex |
| `cortex-llm` | Local LLM inference (Ollama/llama.cpp) | Python/C++ | - |
| `cortex-network` | Network management module | Python | cortex |
| `cx-distro` | Custom ISO builder | Shell/Python | cx, cx-llm |
| `cortex-docs` | Documentation site (MkDocs) | Markdown | - |
| `apt-repo` | Debian package repository | Shell | - |
| `cx-ops` | Operations & DevOps tools | Shell/Python | - |
| `cx-stacks` | Pre-configured application stacks | Docker/Shell | - |

## Architecture Principles
1. **Modular**: Each repo is standalone, communicates via defined APIs
2. **Safety-first**: Dry-run by default, Firejail sandbox, rollback capability
3. **Multi-LLM**: Support Claude, GPT-4, Ollama - never lock to one provider
4. **Hardware-aware**: Detect GPU/CPU/RAM for optimized recommendations

## Code Standards

### Rust (CX Terminal)
- Edition: 2021
- Format: `cargo fmt`
- Lint: `cargo clippy`
- Mark additions with `// CX Terminal:` comments

### Python
- Formatter: Black (line-length 100)
- Type hints required on all public functions
- Docstrings: Google style
- Testing: pytest with >80% coverage target

### Shell
- ShellCheck compliant
- Use `set -euo pipefail`
- Quote all variables

### Documentation
- MkDocs Material theme
- API docs auto-generated from docstrings
- Every feature needs a usage example

## Git Workflow
- Branch naming: `feature/`, `fix/`, `docs/`, `refactor/`, `test/`
- Commit format: `type(scope): description`
  - Types: feat, fix, docs, refactor, test, chore, ci
- Never force push to main/master
- PRs require passing CI before merge
- Squash merge for feature branches

## Cross-Repo Coordination
- Read `~/cxlinux/.cx-state.json` for current project state
- Read `~/cxlinux/MILESTONES.json` for version targets
- When making breaking changes, note affected repos in commit message

## CLI Interface Standards
All CX CLI tools must support:
```
--dry-run     Preview actions without executing
--json        Output in JSON format
--verbose     Detailed logging
--quiet       Suppress non-error output
--version     Show version
--help        Show help
```

## Configuration Paths
- System: `/etc/cx/`
- User: `~/.cx/` or `~/.config/cx/`
- Cache: `~/.cache/cx/`
- Logs: systemd journal (`journalctl -u cx*`)
- Terminal: `~/.cx.lua` or `~/.config/cx/cx.lua`

## Testing Commands
```bash
# Rust (CX Terminal)
cargo test
cargo clippy

# Python repos
pytest tests/ -v --cov=cx

# Shell scripts
shellcheck scripts/*.sh

# Docs
mkdocs serve  # local preview
```

## Release Process
1. Update version in Cargo.toml / pyproject.toml
2. Update CHANGELOG.md
3. Create PR to main
4. After merge, tag with `v{version}`
5. CI builds and publishes to apt-repo

## Security Requirements
- No hardcoded credentials ever
- API keys via environment variables only
- Sandbox all LLM-suggested commands
- Log all system-modifying operations
- Learning data: owner-only permissions (0o700)
- IPC sockets: secure user directories only
