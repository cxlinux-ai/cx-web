"""NVIDIA CUDA detection and configuration."""

import shutil
import subprocess
from typing import Optional

from .detector import GPUInfo


class CUDADetector:
    """Detects NVIDIA GPUs via nvidia-smi."""

    def is_available(self) -> bool:
        """Check if CUDA is available."""
        return shutil.which("nvidia-smi") is not None

    def get_driver_version(self) -> Optional[str]:
        """Get NVIDIA driver version."""
        try:
            result = subprocess.run(
                ["nvidia-smi", "--query-gpu=driver_version", "--format=csv,noheader"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                return result.stdout.strip().split("\n")[0]
        except Exception:
            pass
        return None

    def get_cuda_version(self) -> Optional[str]:
        """Get CUDA version."""
        try:
            result = subprocess.run(
                ["nvidia-smi"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                for line in result.stdout.split("\n"):
                    if "CUDA Version" in line:
                        parts = line.split("CUDA Version:")
                        if len(parts) > 1:
                            return parts[1].strip().split()[0]
        except Exception:
            pass
        return None

    def get_gpus(self) -> list[GPUInfo]:
        """Get list of NVIDIA GPUs."""
        if not self.is_available():
            return []

        gpus = []
        driver_version = self.get_driver_version()

        try:
            result = subprocess.run(
                [
                    "nvidia-smi",
                    "--query-gpu=index,name,memory.total,memory.free,compute_cap,temperature.gpu,utilization.gpu",
                    "--format=csv,noheader,nounits",
                ],
                capture_output=True,
                text=True,
                timeout=10,
            )

            if result.returncode == 0:
                for line in result.stdout.strip().split("\n"):
                    if not line.strip():
                        continue

                    parts = [p.strip() for p in line.split(",")]
                    if len(parts) >= 4:
                        try:
                            gpu = GPUInfo(
                                index=int(parts[0]),
                                name=parts[1],
                                memory_total_mb=int(parts[2]),
                                memory_free_mb=int(parts[3]),
                                compute_capability=parts[4] if len(parts) > 4 else "",
                                driver_version=driver_version or "",
                                temperature_c=float(parts[5]) if len(parts) > 5 and parts[5] else None,
                                utilization_percent=float(parts[6]) if len(parts) > 6 and parts[6] else None,
                            )
                            gpus.append(gpu)
                        except (ValueError, IndexError):
                            continue

        except Exception:
            pass

        return gpus

    def get_compute_capability(self, gpu_index: int = 0) -> Optional[str]:
        """Get compute capability for a specific GPU."""
        gpus = self.get_gpus()
        for gpu in gpus:
            if gpu.index == gpu_index:
                return gpu.compute_capability
        return None

    def is_sufficient_for_inference(self, min_vram_mb: int = 4096) -> bool:
        """Check if GPU has sufficient VRAM for inference."""
        gpus = self.get_gpus()
        if not gpus:
            return False
        return sum(gpu.memory_free_mb for gpu in gpus) >= min_vram_mb
