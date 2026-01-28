"""Tests for stack definitions."""

import pytest
from pathlib import Path

from cx_stacks.stacks import (
    AVAILABLE_STACKS,
    get_stack,
    list_stacks,
    StackConfig,
    BaseStack,
    LAMPStack,
    LEMPStack,
    NodeStack,
    PythonStack,
    DjangoStack,
    FastAPIStack,
    WordPressStack,
    GhostStack,
)


class TestStackRegistry:
    """Test stack registry."""

    def test_list_stacks_returns_list(self):
        """list_stacks returns list of stack names."""
        stacks = list_stacks()
        assert isinstance(stacks, list)
        assert len(stacks) > 0
        assert "lamp" in stacks
        assert "lemp" in stacks
        assert "node" in stacks

    def test_get_stack_by_name(self):
        """get_stack returns stack class."""
        stack_class = get_stack("lamp")
        assert stack_class is not None
        assert issubclass(stack_class, BaseStack)

    def test_get_stack_case_insensitive(self):
        """get_stack is case insensitive."""
        assert get_stack("LAMP") == get_stack("lamp")
        assert get_stack("Lemp") == get_stack("lemp")

    def test_get_stack_unknown(self):
        """get_stack returns None for unknown stack."""
        assert get_stack("nonexistent") is None

    def test_all_stacks_registered(self):
        """All expected stacks are registered."""
        expected = ["lamp", "lemp", "node", "python", "django", "fastapi", "wordpress", "ghost"]
        for name in expected:
            assert name in AVAILABLE_STACKS


class TestStackConfig:
    """Test stack configuration."""

    def test_default_config(self):
        """StackConfig has sensible defaults."""
        config = StackConfig()
        assert config.domain is None
        assert config.port == 80
        assert config.ssl is False
        assert config.db_name == "app_db"
        assert config.db_user == "app_user"

    def test_custom_config(self):
        """StackConfig accepts custom values."""
        config = StackConfig(
            domain="example.com",
            port=8080,
            ssl=True,
            db_name="mydb",
            db_user="myuser",
            db_password="secret",
        )
        assert config.domain == "example.com"
        assert config.port == 8080
        assert config.ssl is True
        assert config.db_name == "mydb"
        assert config.db_password == "secret"


class TestLAMPStack:
    """Test LAMP stack."""

    def test_stack_properties(self):
        """LAMP stack has correct properties."""
        stack = LAMPStack()
        assert stack.name == "lamp"
        assert "Apache" in stack.description
        assert "PHP" in stack.description

    def test_required_services(self):
        """LAMP stack has required services."""
        stack = LAMPStack()
        services = stack.required_services
        service_names = [s.name for s in services]
        assert "Apache" in service_names
        assert "MariaDB" in service_names
        assert "PHP-FPM" in service_names

    def test_get_packages_debian(self):
        """LAMP returns Debian packages."""
        stack = LAMPStack()
        packages = stack.get_packages("debian")
        assert "apache2" in packages
        assert "mariadb-server" in packages
        assert "php8.3-fpm" in packages

    def test_configure_returns_configs(self):
        """configure returns configuration tuples."""
        config = StackConfig(domain="test.local")
        stack = LAMPStack(config)
        configs = stack.configure()
        assert len(configs) > 0
        assert all(isinstance(c, tuple) for c in configs)
        assert all(len(c) == 2 for c in configs)

    def test_docker_services(self):
        """LAMP provides Docker services."""
        stack = LAMPStack()
        services = stack.get_docker_services()
        assert "web" in services
        assert "db" in services


class TestLEMPStack:
    """Test LEMP stack."""

    def test_stack_properties(self):
        """LEMP stack has correct properties."""
        stack = LEMPStack()
        assert stack.name == "lemp"
        assert "Nginx" in stack.description
        assert "PHP" in stack.description

    def test_required_services(self):
        """LEMP stack has required services."""
        stack = LEMPStack()
        services = stack.required_services
        service_names = [s.name for s in services]
        assert "Nginx" in service_names
        assert "MariaDB" in service_names


class TestNodeStack:
    """Test Node.js stack."""

    def test_stack_properties(self):
        """Node stack has correct properties."""
        stack = NodeStack()
        assert stack.name == "node"
        assert "Node" in stack.description

    def test_default_port(self):
        """Node stack uses port 3000 by default."""
        stack = NodeStack()
        assert stack.default_ports.get("app") == 3000


class TestDjangoStack:
    """Test Django stack."""

    def test_stack_properties(self):
        """Django stack has correct properties."""
        stack = DjangoStack()
        assert stack.name == "django"
        assert "Django" in stack.description
        assert "PostgreSQL" in stack.description

    def test_required_services_include_postgres(self):
        """Django stack requires PostgreSQL."""
        stack = DjangoStack()
        service_names = [s.name for s in stack.required_services]
        assert "PostgreSQL" in service_names


class TestFastAPIStack:
    """Test FastAPI stack."""

    def test_stack_properties(self):
        """FastAPI stack has correct properties."""
        stack = FastAPIStack()
        assert stack.name == "fastapi"
        assert "FastAPI" in stack.description

    def test_uvicorn_service(self):
        """FastAPI uses Uvicorn."""
        stack = FastAPIStack()
        service_names = [s.name for s in stack.required_services]
        assert "Uvicorn" in service_names


class TestWordPressStack:
    """Test WordPress stack."""

    def test_stack_properties(self):
        """WordPress stack has correct properties."""
        stack = WordPressStack()
        assert stack.name == "wordpress"
        assert "WordPress" in stack.description

    def test_includes_redis(self):
        """WordPress stack includes Redis."""
        stack = WordPressStack()
        service_names = [s.name for s in stack.required_services]
        assert "Redis" in service_names


class TestGhostStack:
    """Test Ghost stack."""

    def test_stack_properties(self):
        """Ghost stack has correct properties."""
        stack = GhostStack()
        assert stack.name == "ghost"
        assert "Ghost" in stack.description

    def test_ghost_port(self):
        """Ghost uses port 2368."""
        stack = GhostStack()
        assert stack.default_ports.get("ghost") == 2368
