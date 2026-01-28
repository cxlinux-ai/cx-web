# CORTEX-DOCS - Documentation Site

## Purpose
Official documentation site built with MkDocs Material. Includes API reference, tutorials, and guides.

## Repo Role in Ecosystem
- **Documentation hub** - single source of truth
- Standalone - no code dependencies
- Aggregates docs from all repos

## Key Directories
```
cortex-docs/
├── docs/
│   ├── index.md              # Homepage
│   ├── getting-started/      # Installation, quickstart
│   ├── guides/               # How-to guides
│   ├── reference/            # API reference
│   ├── architecture/         # Design docs
│   └── contributing/         # Contribution guides
├── mkdocs.yml                # MkDocs configuration
└── overrides/                # Theme customizations
```

## Local Development
```bash
# Install dependencies
pip install mkdocs-material mkdocstrings[python]

# Serve locally
mkdocs serve

# Build static site
mkdocs build
```

## Writing Guidelines
- Use clear, concise language
- Include code examples for every feature
- Add screenshots for UI elements
- Cross-reference related docs
- Keep pages focused (one topic per page)

## API Documentation
API docs are auto-generated from docstrings:
```python
def resolve_package(query: str) -> list[Package]:
    """Resolve a natural language query to packages.

    Args:
        query: Natural language description (e.g., "PDF editor")

    Returns:
        List of matching packages ranked by relevance.

    Example:
        >>> packages = resolve_package("something to edit videos")
        >>> packages[0].name
        'kdenlive'
    """
```

## Deployment
- Hosted on GitHub Pages
- Auto-deployed on push to main
- Custom domain: docs.cortexlinux.com

## Structure for New Features
When adding a new feature:
1. Add quickstart in `getting-started/`
2. Add detailed guide in `guides/`
3. Add API reference in `reference/`
4. Update navigation in `mkdocs.yml`
