"""Tests for Docker support."""

import pytest
from pathlib import Path
import tempfile

from cx_stacks.docker import ComposeGenerator, ComposeManager
from cx_stacks.stacks import LAMPStack, NodeStack, StackConfig


class TestComposeGenerator:
    """Test Docker Compose generator."""

    def test_generate_creates_files(self):
        """generate creates docker-compose.yml."""
        config = StackConfig(domain="test.local")
        stack = LAMPStack(config)
        generator = ComposeGenerator()

        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir)
            compose_path = generator.generate(stack, output_dir)

            assert compose_path.exists()
            assert compose_path.name == "docker-compose.yml"

            # Check .env was created
            env_path = output_dir / ".env"
            assert env_path.exists()

    def test_compose_has_services(self):
        """Generated compose has services."""
        config = StackConfig(domain="test.local")
        stack = LAMPStack(config)
        generator = ComposeGenerator()

        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir)
            compose_path = generator.generate(stack, output_dir)

            content = compose_path.read_text()
            assert "services:" in content
            assert "web:" in content or "db:" in content

    def test_env_file_has_credentials(self):
        """Generated .env has database credentials."""
        config = StackConfig(
            domain="test.local",
            db_name="testdb",
            db_user="testuser",
        )
        stack = LAMPStack(config)
        generator = ComposeGenerator()

        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir)
            generator.generate(stack, output_dir)

            env_path = output_dir / ".env"
            content = env_path.read_text()

            assert "DB_NAME=testdb" in content
            assert "DB_USER=testuser" in content
            assert "DB_PASSWORD=" in content


class TestComposeManager:
    """Test Docker Compose manager."""

    def test_initialization(self):
        """Compose manager initializes."""
        manager = ComposeManager()
        assert manager is not None
