"""Model downloader with progress tracking."""

import hashlib
from pathlib import Path
from typing import Callable, Optional

import httpx
from huggingface_hub import hf_hub_download, HfFileSystem
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, DownloadColumn, TransferSpeedColumn

from ..config import get_settings
from .registry import ModelInfo, ModelRegistry


class ModelDownloader:
    """Downloads models from HuggingFace or direct URLs."""

    def __init__(self, registry: Optional[ModelRegistry] = None) -> None:
        self.settings = get_settings()
        self.registry = registry or ModelRegistry()
        self.models_dir = self.settings.models_dir
        self.models_dir.mkdir(parents=True, exist_ok=True)

    def download(
        self,
        model_name: str,
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ) -> Path:
        """Download a model by name."""
        model = self.registry.get_model(model_name)
        if not model:
            raise ValueError(f"Unknown model: {model_name}")

        if model.is_downloaded and model.local_path:
            return model.local_path

        # Determine download method
        if model.source.startswith("http://") or model.source.startswith("https://"):
            path = self._download_direct(model, progress_callback)
        else:
            path = self._download_huggingface(model, progress_callback)

        # Validate if SHA provided
        if model.sha256:
            self._validate_checksum(path, model.sha256)

        # Update registry
        self.registry.mark_downloaded(model_name, path)

        return path

    def _download_huggingface(
        self,
        model: ModelInfo,
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ) -> Path:
        """Download from HuggingFace Hub."""
        local_path = self.models_dir / model.filename

        # Check if repo contains the file
        token = self.settings.hf_token or None

        try:
            downloaded_path = hf_hub_download(
                repo_id=model.source,
                filename=model.filename,
                local_dir=self.models_dir,
                local_dir_use_symlinks=False,
                token=token,
            )
            return Path(downloaded_path)
        except Exception as e:
            # Try alternative filename patterns
            fs = HfFileSystem(token=token)
            try:
                files = fs.ls(model.source, detail=False)
                gguf_files = [f for f in files if f.endswith(".gguf")]

                if gguf_files:
                    # Find closest match
                    for f in gguf_files:
                        fname = f.split("/")[-1]
                        if model.quantization.lower() in fname.lower():
                            downloaded_path = hf_hub_download(
                                repo_id=model.source,
                                filename=fname,
                                local_dir=self.models_dir,
                                local_dir_use_symlinks=False,
                                token=token,
                            )
                            return Path(downloaded_path)
            except Exception:
                pass

            raise RuntimeError(f"Failed to download {model.name}: {e}")

    def _download_direct(
        self,
        model: ModelInfo,
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ) -> Path:
        """Download from direct URL."""
        local_path = self.models_dir / model.filename

        with httpx.stream(
            "GET",
            model.source,
            follow_redirects=True,
            timeout=self.settings.download_timeout,
        ) as response:
            response.raise_for_status()

            total = int(response.headers.get("content-length", 0))

            with open(local_path, "wb") as f:
                downloaded = 0
                for chunk in response.iter_bytes(chunk_size=self.settings.chunk_size):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if progress_callback:
                        progress_callback(downloaded, total)

        return local_path

    def _validate_checksum(self, path: Path, expected_sha256: str) -> None:
        """Validate file checksum."""
        sha256 = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256.update(chunk)

        actual = sha256.hexdigest()
        if actual != expected_sha256:
            path.unlink()  # Remove invalid file
            raise ValueError(
                f"Checksum mismatch: expected {expected_sha256}, got {actual}"
            )

    def download_with_progress(self, model_name: str) -> Path:
        """Download with Rich progress bar."""
        model = self.registry.get_model(model_name)
        if not model:
            raise ValueError(f"Unknown model: {model_name}")

        if model.is_downloaded and model.local_path:
            return model.local_path

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            DownloadColumn(),
            TransferSpeedColumn(),
        ) as progress:
            task = progress.add_task(
                f"Downloading {model.name}...",
                total=model.size_mb * 1024 * 1024,
            )

            def update_progress(downloaded: int, total: int) -> None:
                progress.update(task, completed=downloaded)

            return self.download(model_name, progress_callback=update_progress)

    def get_available_quantizations(self, repo_id: str) -> list[str]:
        """List available GGUF quantizations in a HuggingFace repo."""
        token = self.settings.hf_token or None
        fs = HfFileSystem(token=token)

        try:
            files = fs.ls(repo_id, detail=False)
            gguf_files = [f.split("/")[-1] for f in files if f.endswith(".gguf")]
            return gguf_files
        except Exception:
            return []
