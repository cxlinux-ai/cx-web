"""Update checker for Cortex Linux."""

import json
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any

import httpx

from cx_ops.config import get_settings
from cx_ops.utils.system import run_command


class UpdateChannel(Enum):
    """Update release channels."""

    STABLE = "stable"
    BETA = "beta"
    NIGHTLY = "nightly"


@dataclass
class UpdateInfo:
    """Information about an available update."""

    version: str
    channel: UpdateChannel
    release_date: datetime
    changelog: str
    size_bytes: int
    checksum: str
    download_url: str
    is_security: bool = False
    requires_reboot: bool = False
    dependencies: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "UpdateInfo":
        """Create UpdateInfo from dictionary."""
        return cls(
            version=data["version"],
            channel=UpdateChannel(data.get("channel", "stable")),
            release_date=datetime.fromisoformat(data["release_date"]),
            changelog=data.get("changelog", ""),
            size_bytes=data.get("size_bytes", 0),
            checksum=data.get("checksum", ""),
            download_url=data["download_url"],
            is_security=data.get("is_security", False),
            requires_reboot=data.get("requires_reboot", False),
            dependencies=data.get("dependencies", []),
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "version": self.version,
            "channel": self.channel.value,
            "release_date": self.release_date.isoformat(),
            "changelog": self.changelog,
            "size_bytes": self.size_bytes,
            "checksum": self.checksum,
            "download_url": self.download_url,
            "is_security": self.is_security,
            "requires_reboot": self.requires_reboot,
            "dependencies": self.dependencies,
        }


@dataclass
class PackageUpdate:
    """Information about an available package update."""

    name: str
    current_version: str
    new_version: str
    is_security: bool = False
    size_bytes: int = 0


class UpdateChecker:
    """Checks for available updates.

    Supports checking both Cortex system updates and package updates
    from configured repositories.
    """

    UPDATE_URL = "https://updates.cortexlinux.com/api/v1"
    CACHE_FILE = "update_cache.json"
    CACHE_TTL_HOURS = 1

    def __init__(self) -> None:
        settings = get_settings()
        self.channel = UpdateChannel(settings.updates.update_channel)
        self.cache_dir = settings.cache_dir / "updates"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_current_version(self) -> str:
        """Get the current Cortex version."""
        version_file = Path("/etc/cortex/version")
        if version_file.exists():
            return version_file.read_text().strip()

        # Try to get from package manager
        result = run_command(["dpkg-query", "-W", "-f=${Version}", "cortex-base"])
        if result.success:
            return result.stdout.strip()

        return "unknown"

    def _get_cached_update(self) -> UpdateInfo | None:
        """Get cached update info if still valid."""
        cache_file = self.cache_dir / self.CACHE_FILE
        if not cache_file.exists():
            return None

        try:
            with open(cache_file) as f:
                data = json.load(f)

            cached_at = datetime.fromisoformat(data["cached_at"])
            if (datetime.now() - cached_at).total_seconds() > self.CACHE_TTL_HOURS * 3600:
                return None

            return UpdateInfo.from_dict(data["update"])
        except Exception:
            return None

    def _cache_update(self, update: UpdateInfo | None) -> None:
        """Cache update info."""
        cache_file = self.cache_dir / self.CACHE_FILE

        data = {
            "cached_at": datetime.now().isoformat(),
            "update": update.to_dict() if update else None,
        }

        with open(cache_file, "w") as f:
            json.dump(data, f, indent=2)

    async def check_system_update(self, force: bool = False) -> UpdateInfo | None:
        """Check for Cortex system updates.

        Args:
            force: Bypass cache and check remote

        Returns:
            UpdateInfo if update available, None otherwise
        """
        if not force:
            cached = self._get_cached_update()
            if cached:
                return cached

        current_version = self._get_current_version()

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    f"{self.UPDATE_URL}/check",
                    params={
                        "current_version": current_version,
                        "channel": self.channel.value,
                    },
                )

                if response.status_code == 204:
                    # No update available
                    self._cache_update(None)
                    return None

                response.raise_for_status()
                data = response.json()

            update = UpdateInfo.from_dict(data)
            self._cache_update(update)
            return update

        except httpx.HTTPError:
            # Network error - return cached if available
            return self._get_cached_update()

    async def check_package_updates(self) -> list[PackageUpdate]:
        """Check for package updates via apt.

        Returns:
            List of available package updates
        """
        # Update package lists first
        result = run_command(["apt-get", "update", "-qq"], timeout=120)
        if not result.success:
            return []

        # Get upgradable packages
        result = run_command(["apt", "list", "--upgradable", "-qq"])
        if not result.success:
            return []

        updates = []
        for line in result.stdout.strip().splitlines():
            if not line or "/" not in line:
                continue

            # Parse: package/suite version arch [upgradable from: old_version]
            try:
                parts = line.split()
                name_suite = parts[0]
                name = name_suite.split("/")[0]
                new_version = parts[1]

                old_version = ""
                if "upgradable from:" in line:
                    old_idx = line.index("upgradable from:") + len("upgradable from:")
                    old_version = line[old_idx:].strip().rstrip("]")

                is_security = "security" in line.lower()

                updates.append(PackageUpdate(
                    name=name,
                    current_version=old_version,
                    new_version=new_version,
                    is_security=is_security,
                ))
            except (IndexError, ValueError):
                continue

        return updates

    async def check_all(self, force: bool = False) -> dict[str, Any]:
        """Check for all available updates.

        Returns:
            Dictionary with system and package updates
        """
        system_update = await self.check_system_update(force)
        package_updates = await self.check_package_updates()

        security_packages = [p for p in package_updates if p.is_security]

        return {
            "system": system_update,
            "packages": {
                "total": len(package_updates),
                "security": len(security_packages),
                "updates": package_updates,
            },
            "checked_at": datetime.now().isoformat(),
        }

    def get_last_check(self) -> datetime | None:
        """Get timestamp of last update check."""
        cache_file = self.cache_dir / self.CACHE_FILE
        if not cache_file.exists():
            return None

        try:
            with open(cache_file) as f:
                data = json.load(f)
            return datetime.fromisoformat(data["cached_at"])
        except Exception:
            return None
