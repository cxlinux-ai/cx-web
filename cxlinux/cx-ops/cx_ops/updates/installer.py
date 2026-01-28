"""Update installer for Cortex Linux."""

import asyncio
import hashlib
import tempfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable

import httpx

from cx_ops.config import get_settings
from cx_ops.updates.checker import UpdateInfo, PackageUpdate
from cx_ops.updates.rollback import RollbackManager
from cx_ops.utils.system import run_command, run_command_async


@dataclass
class InstallResult:
    """Result of an update installation."""

    success: bool
    version: str
    message: str
    requires_reboot: bool = False
    rollback_id: str | None = None
    duration_seconds: float = 0.0


class UpdateInstaller:
    """Installs Cortex and package updates.

    Handles downloading, verification, backup, and installation
    of updates with rollback support.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.cache_dir = settings.cache_dir / "updates"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.rollback = RollbackManager()

    async def download_update(
        self,
        update: UpdateInfo,
        progress_callback: Callable[[int, int], None] | None = None,
    ) -> Path | None:
        """Download an update file.

        Args:
            update: Update information
            progress_callback: Optional callback(downloaded, total)

        Returns:
            Path to downloaded file or None on failure
        """
        download_path = self.cache_dir / f"cortex-{update.version}.deb"

        # Check if already downloaded and verified
        if download_path.exists():
            if self._verify_checksum(download_path, update.checksum):
                return download_path
            download_path.unlink()

        try:
            async with httpx.AsyncClient(timeout=300) as client:
                async with client.stream("GET", update.download_url) as response:
                    response.raise_for_status()

                    total = int(response.headers.get("content-length", 0))
                    downloaded = 0

                    with open(download_path, "wb") as f:
                        async for chunk in response.aiter_bytes(chunk_size=8192):
                            f.write(chunk)
                            downloaded += len(chunk)
                            if progress_callback:
                                progress_callback(downloaded, total)

            # Verify checksum
            if not self._verify_checksum(download_path, update.checksum):
                download_path.unlink()
                return None

            return download_path

        except Exception:
            if download_path.exists():
                download_path.unlink()
            return None

    def _verify_checksum(self, file_path: Path, expected: str) -> bool:
        """Verify file checksum."""
        if not expected:
            return True

        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256.update(chunk)

        return sha256.hexdigest() == expected

    async def install_system_update(
        self,
        update: UpdateInfo,
        create_snapshot: bool = True,
        progress_callback: Callable[[str, int], None] | None = None,
    ) -> InstallResult:
        """Install a Cortex system update.

        Args:
            update: Update to install
            create_snapshot: Whether to create a rollback snapshot
            progress_callback: Optional callback(stage, percent)

        Returns:
            InstallResult with status
        """
        start_time = datetime.now()
        rollback_id = None

        try:
            # Stage 1: Download
            if progress_callback:
                progress_callback("downloading", 0)

            download_path = await self.download_update(
                update,
                lambda d, t: progress_callback("downloading", int(d / t * 100)) if progress_callback and t > 0 else None,
            )

            if download_path is None:
                return InstallResult(
                    success=False,
                    version=update.version,
                    message="Failed to download update",
                )

            # Stage 2: Create snapshot
            if create_snapshot:
                if progress_callback:
                    progress_callback("snapshot", 0)

                snapshot = self.rollback.create_snapshot(
                    description=f"Before update to {update.version}"
                )
                rollback_id = snapshot.id

                if progress_callback:
                    progress_callback("snapshot", 100)

            # Stage 3: Install
            if progress_callback:
                progress_callback("installing", 0)

            result = await run_command_async(
                ["dpkg", "-i", str(download_path)],
                timeout=300,
            )

            if not result.success:
                # Try to fix dependencies
                fix_result = await run_command_async(
                    ["apt-get", "install", "-f", "-y"],
                    timeout=120,
                )
                if not fix_result.success:
                    return InstallResult(
                        success=False,
                        version=update.version,
                        message=f"Installation failed: {result.stderr}",
                        rollback_id=rollback_id,
                    )

            if progress_callback:
                progress_callback("installing", 100)

            # Stage 4: Post-install
            if progress_callback:
                progress_callback("configuring", 0)

            # Run post-install hooks if they exist
            post_install = Path("/etc/cortex/hooks/post-update")
            if post_install.exists():
                await run_command_async(["bash", str(post_install)], timeout=60)

            if progress_callback:
                progress_callback("configuring", 100)

            duration = (datetime.now() - start_time).total_seconds()

            return InstallResult(
                success=True,
                version=update.version,
                message=f"Successfully updated to {update.version}",
                requires_reboot=update.requires_reboot,
                rollback_id=rollback_id,
                duration_seconds=duration,
            )

        except Exception as e:
            return InstallResult(
                success=False,
                version=update.version,
                message=f"Installation error: {str(e)}",
                rollback_id=rollback_id,
            )

    async def install_package_updates(
        self,
        packages: list[PackageUpdate] | None = None,
        security_only: bool = False,
        progress_callback: Callable[[str, int], None] | None = None,
    ) -> InstallResult:
        """Install package updates.

        Args:
            packages: Specific packages to update, or None for all
            security_only: Only install security updates
            progress_callback: Optional callback(stage, percent)

        Returns:
            InstallResult with status
        """
        start_time = datetime.now()

        try:
            # Create snapshot
            if progress_callback:
                progress_callback("snapshot", 0)

            snapshot = self.rollback.create_snapshot(
                description="Before package updates"
            )

            if progress_callback:
                progress_callback("snapshot", 100)

            # Update package lists
            if progress_callback:
                progress_callback("updating", 0)

            result = await run_command_async(
                ["apt-get", "update", "-qq"],
                timeout=120,
            )

            if progress_callback:
                progress_callback("updating", 100)

            # Build install command
            if progress_callback:
                progress_callback("installing", 0)

            if packages:
                # Install specific packages
                package_names = [p.name for p in packages]
                if security_only:
                    package_names = [p.name for p in packages if p.is_security]

                cmd = ["apt-get", "install", "-y"] + package_names
            else:
                # Full upgrade
                if security_only:
                    cmd = [
                        "apt-get", "upgrade", "-y",
                        "-o", "Dir::Etc::SourceList=/etc/apt/sources.list.d/security.list"
                    ]
                else:
                    cmd = ["apt-get", "upgrade", "-y"]

            result = await run_command_async(cmd, timeout=600)

            if progress_callback:
                progress_callback("installing", 100)

            duration = (datetime.now() - start_time).total_seconds()

            if result.success:
                return InstallResult(
                    success=True,
                    version="",
                    message="Package updates installed successfully",
                    rollback_id=snapshot.id,
                    duration_seconds=duration,
                )
            else:
                return InstallResult(
                    success=False,
                    version="",
                    message=f"Package update failed: {result.stderr}",
                    rollback_id=snapshot.id,
                    duration_seconds=duration,
                )

        except Exception as e:
            return InstallResult(
                success=False,
                version="",
                message=f"Update error: {str(e)}",
            )

    def cleanup_downloads(self, keep_latest: bool = True) -> int:
        """Clean up downloaded update files.

        Returns:
            Number of files removed
        """
        files = list(self.cache_dir.glob("cortex-*.deb"))
        if not files:
            return 0

        if keep_latest:
            # Sort by modification time, keep newest
            files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
            files = files[1:]

        for f in files:
            f.unlink()

        return len(files)
