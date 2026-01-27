"""Rollback support for Cortex updates."""

import json
import shutil
import tarfile
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

from cx_ops.config import get_settings
from cx_ops.utils.system import run_command


@dataclass
class Snapshot:
    """A system snapshot for rollback."""

    id: str
    description: str
    created_at: datetime
    size_bytes: int = 0
    packages: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Snapshot":
        """Create Snapshot from dictionary."""
        return cls(
            id=data["id"],
            description=data.get("description", ""),
            created_at=datetime.fromisoformat(data["created_at"]),
            size_bytes=data.get("size_bytes", 0),
            packages=data.get("packages", []),
            metadata=data.get("metadata", {}),
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "size_bytes": self.size_bytes,
            "packages": self.packages,
            "metadata": self.metadata,
        }


class RollbackManager:
    """Manages system snapshots and rollback operations.

    Creates snapshots before updates and allows rolling back
    to previous states if issues occur.
    """

    BACKUP_DIRS = [
        "/etc/cortex",
        "/var/lib/cortex",
    ]

    def __init__(self) -> None:
        settings = get_settings()
        self.data_dir = settings.data_dir / "rollback"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.snapshots_dir = self.data_dir / "snapshots"
        self.snapshots_dir.mkdir(parents=True, exist_ok=True)
        self.registry_file = self.data_dir / "registry.json"
        self.retention_days = settings.updates.rollback_retention_days

    def _load_registry(self) -> dict[str, Snapshot]:
        """Load snapshot registry."""
        if not self.registry_file.exists():
            return {}

        try:
            with open(self.registry_file) as f:
                data = json.load(f)
            return {
                sid: Snapshot.from_dict(sdata)
                for sid, sdata in data.get("snapshots", {}).items()
            }
        except Exception:
            return {}

    def _save_registry(self, snapshots: dict[str, Snapshot]) -> None:
        """Save snapshot registry."""
        data = {
            "snapshots": {sid: s.to_dict() for sid, s in snapshots.items()},
            "updated_at": datetime.now().isoformat(),
        }

        with open(self.registry_file, "w") as f:
            json.dump(data, f, indent=2)

    def _generate_id(self) -> str:
        """Generate a unique snapshot ID."""
        return datetime.now().strftime("%Y%m%d-%H%M%S")

    def _get_installed_packages(self) -> list[str]:
        """Get list of installed packages with versions."""
        result = run_command([
            "dpkg-query", "-W", "-f=${Package}=${Version}\n"
        ])

        if not result.success:
            return []

        return [line.strip() for line in result.stdout.splitlines() if line.strip()]

    def create_snapshot(
        self,
        description: str = "",
        include_packages: bool = True,
    ) -> Snapshot:
        """Create a new system snapshot.

        Args:
            description: Description of the snapshot
            include_packages: Include package list for recovery

        Returns:
            Created Snapshot object
        """
        snapshot_id = self._generate_id()
        snapshot_path = self.snapshots_dir / snapshot_id
        snapshot_path.mkdir(parents=True, exist_ok=True)

        # Get package list
        packages = []
        if include_packages:
            packages = self._get_installed_packages()
            packages_file = snapshot_path / "packages.txt"
            packages_file.write_text("\n".join(packages))

        # Backup configuration directories
        total_size = 0
        for backup_dir in self.BACKUP_DIRS:
            src = Path(backup_dir)
            if not src.exists():
                continue

            archive_name = backup_dir.replace("/", "_").strip("_") + ".tar.gz"
            archive_path = snapshot_path / archive_name

            try:
                with tarfile.open(archive_path, "w:gz") as tar:
                    tar.add(src, arcname=src.name)
                total_size += archive_path.stat().st_size
            except Exception:
                continue

        # Create snapshot object
        snapshot = Snapshot(
            id=snapshot_id,
            description=description,
            created_at=datetime.now(),
            size_bytes=total_size,
            packages=packages[:100],  # Store first 100 for quick reference
            metadata={
                "dirs_backed_up": self.BACKUP_DIRS,
                "full_package_count": len(packages),
            },
        )

        # Save to registry
        snapshots = self._load_registry()
        snapshots[snapshot_id] = snapshot
        self._save_registry(snapshots)

        return snapshot

    def list_snapshots(self) -> list[Snapshot]:
        """List all snapshots, newest first."""
        snapshots = self._load_registry()
        return sorted(
            snapshots.values(),
            key=lambda s: s.created_at,
            reverse=True,
        )

    def get_snapshot(self, snapshot_id: str) -> Snapshot | None:
        """Get a specific snapshot by ID."""
        snapshots = self._load_registry()
        return snapshots.get(snapshot_id)

    def delete_snapshot(self, snapshot_id: str) -> bool:
        """Delete a snapshot."""
        snapshots = self._load_registry()
        if snapshot_id not in snapshots:
            return False

        # Delete snapshot files
        snapshot_path = self.snapshots_dir / snapshot_id
        if snapshot_path.exists():
            shutil.rmtree(snapshot_path)

        # Update registry
        del snapshots[snapshot_id]
        self._save_registry(snapshots)

        return True

    def rollback(self, snapshot_id: str) -> tuple[bool, str]:
        """Rollback to a specific snapshot.

        Args:
            snapshot_id: ID of snapshot to restore

        Returns:
            Tuple of (success, message)
        """
        snapshot = self.get_snapshot(snapshot_id)
        if snapshot is None:
            return False, f"Snapshot not found: {snapshot_id}"

        snapshot_path = self.snapshots_dir / snapshot_id
        if not snapshot_path.exists():
            return False, "Snapshot files not found"

        errors = []

        # Restore configuration directories
        for backup_dir in self.BACKUP_DIRS:
            archive_name = backup_dir.replace("/", "_").strip("_") + ".tar.gz"
            archive_path = snapshot_path / archive_name

            if not archive_path.exists():
                continue

            try:
                # Remove current directory
                target = Path(backup_dir)
                if target.exists():
                    shutil.rmtree(target)

                # Extract backup
                target.parent.mkdir(parents=True, exist_ok=True)
                with tarfile.open(archive_path, "r:gz") as tar:
                    tar.extractall(target.parent)

            except Exception as e:
                errors.append(f"Failed to restore {backup_dir}: {e}")

        # Restore packages if package list exists
        packages_file = snapshot_path / "packages.txt"
        if packages_file.exists():
            result = run_command([
                "xargs", "-a", str(packages_file),
                "apt-get", "install", "-y", "--allow-downgrades"
            ], timeout=600)

            if not result.success:
                errors.append(f"Package restoration had issues: {result.stderr[:200]}")

        if errors:
            return False, f"Rollback completed with errors: {'; '.join(errors)}"

        return True, f"Successfully rolled back to snapshot {snapshot_id}"

    def cleanup_old_snapshots(self) -> int:
        """Remove snapshots older than retention period.

        Returns:
            Number of snapshots removed
        """
        snapshots = self._load_registry()
        cutoff = datetime.now().timestamp() - (self.retention_days * 86400)

        removed = 0
        to_remove = []

        for snapshot_id, snapshot in snapshots.items():
            if snapshot.created_at.timestamp() < cutoff:
                to_remove.append(snapshot_id)

        for snapshot_id in to_remove:
            if self.delete_snapshot(snapshot_id):
                removed += 1

        return removed

    def get_latest_snapshot(self) -> Snapshot | None:
        """Get the most recent snapshot."""
        snapshots = self.list_snapshots()
        return snapshots[0] if snapshots else None

    def get_total_size(self) -> int:
        """Get total size of all snapshots in bytes."""
        total = 0
        for snapshot in self.list_snapshots():
            total += snapshot.size_bytes
        return total
