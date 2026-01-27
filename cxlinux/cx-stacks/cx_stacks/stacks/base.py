"""Base stack class."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Optional

from ..config import get_settings


class StackStatus(Enum):
    """Stack deployment status."""

    NOT_DEPLOYED = "not_deployed"
    DEPLOYING = "deploying"
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"
    PARTIAL = "partial"


@dataclass
class ServiceInfo:
    """Information about a stack service."""

    name: str
    package: str
    service_name: str
    port: int
    config_paths: list[Path] = field(default_factory=list)
    is_installed: bool = False
    is_running: bool = False


@dataclass
class StackConfig:
    """Stack deployment configuration."""

    domain: Optional[str] = None
    port: int = 80
    ssl: bool = False
    ssl_email: Optional[str] = None
    web_root: Optional[Path] = None
    app_path: Optional[Path] = None
    db_name: str = "app_db"
    db_user: str = "app_user"
    db_password: Optional[str] = None
    extra: dict = field(default_factory=dict)


class BaseStack(ABC):
    """Base class for all stacks."""

    name: str = "base"
    description: str = "Base stack"
    version: str = "1.0"

    # Package requirements by distro family
    packages_debian: list[str] = []
    packages_rhel: list[str] = []

    # Services managed by this stack
    services: list[str] = []

    # Default ports
    default_ports: dict[str, int] = {}

    def __init__(self, config: Optional[StackConfig] = None) -> None:
        """Initialize stack with configuration."""
        self.config = config or StackConfig()
        self.settings = get_settings()
        self._services: list[ServiceInfo] = []

    @property
    @abstractmethod
    def required_services(self) -> list[ServiceInfo]:
        """Get list of required services for this stack."""
        ...

    @abstractmethod
    def get_packages(self, distro_family: str) -> list[str]:
        """Get packages to install for distro family."""
        ...

    @abstractmethod
    def configure(self) -> list[tuple[Path, str]]:
        """Generate configuration files.

        Returns list of (path, content) tuples.
        """
        ...

    @abstractmethod
    def post_install(self) -> list[str]:
        """Commands to run after package installation."""
        ...

    @abstractmethod
    def validate(self) -> tuple[bool, list[str]]:
        """Validate stack is working.

        Returns (success, list of issues).
        """
        ...

    def get_web_root(self) -> Path:
        """Get web root directory."""
        if self.config.web_root:
            return self.config.web_root
        if self.config.domain:
            return self.settings.default_web_root / self.config.domain
        return self.settings.default_web_root / "html"

    def get_log_paths(self) -> list[Path]:
        """Get log file paths for this stack."""
        return []

    def get_status_info(self) -> dict:
        """Get status information for display."""
        return {
            "name": self.name,
            "description": self.description,
            "version": self.version,
            "domain": self.config.domain,
            "ssl": self.config.ssl,
            "services": [s.name for s in self.required_services],
        }

    def get_docker_services(self) -> dict:
        """Get Docker Compose service definitions."""
        return {}

    def get_docker_volumes(self) -> dict:
        """Get Docker Compose volume definitions."""
        return {}

    def get_environment_vars(self) -> dict[str, str]:
        """Get environment variables for the stack."""
        return {}
