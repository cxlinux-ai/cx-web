"""Hardware detection for GPU acceleration."""

import os
import shutil
import subprocess
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

from ..utils.system import get_system_info, SystemInfo


class AcceleratorType(str, Enum):
    """Type of hardware accelerator."""

    NONE = "cpu"
    CUDA = "cuda"
    ROCM = "rocm"
    METAL = "metal"


@dataclass
class GPUInfo:
    """GPU information."""

    index: int
    name: str
    memory_total_mb: int
    memory_free_mb: int
    compute_capability: str = ""
    driver_version: str = ""
    temperature_c: Optional[float] = None
    utilization_percent: Optional[float] = None


@dataclass
class HardwareInfo:
    """Complete hardware information."""

    system: SystemInfo
    accelerator: AcceleratorType
    gpus: list[GPUInfo] = field(default_factory=list)
    recommended_layers: int = 0
    recommended_threads: int = 0

    @property
    def has_gpu(self) -> bool:
        return len(self.gpus) > 0 and self.accelerator != AcceleratorType.NONE

    @property
    def total_vram_mb(self) -> int:
        return sum(gpu.memory_total_mb for gpu in self.gpus)

    @property
    def free_vram_mb(self) -> int:
        return sum(gpu.memory_free_mb for gpu in self.gpus)


class HardwareDetector:
    """Detects available hardware acceleration."""

    def __init__(self) -> None:
        self._cuda_detector: Optional["CUDADetector"] = None
        self._rocm_detector: Optional["ROCmDetector"] = None

    def detect(self) -> HardwareInfo:
        """Detect all available hardware."""
        from .cuda import CUDADetector
        from .rocm import ROCmDetector

        system = get_system_info()
        gpus: list[GPUInfo] = []
        accelerator = AcceleratorType.NONE

        # Try CUDA first
        cuda = CUDADetector()
        if cuda.is_available():
            cuda_gpus = cuda.get_gpus()
            if cuda_gpus:
                gpus = cuda_gpus
                accelerator = AcceleratorType.CUDA

        # Try ROCm if no CUDA
        if not gpus:
            rocm = ROCmDetector()
            if rocm.is_available():
                rocm_gpus = rocm.get_gpus()
                if rocm_gpus:
                    gpus = rocm_gpus
                    accelerator = AcceleratorType.ROCM

        # Check for Metal on macOS
        if not gpus and system.platform.startswith("Darwin"):
            if self._check_metal():
                accelerator = AcceleratorType.METAL
                # Metal doesn't report VRAM the same way
                gpus = [GPUInfo(
                    index=0,
                    name="Apple Silicon GPU",
                    memory_total_mb=int(system.ram_total_gb * 1024 * 0.75),  # Estimate
                    memory_free_mb=int(system.ram_available_gb * 1024 * 0.75),
                )]

        # Calculate recommendations
        recommended_layers = self._calculate_layers(gpus, accelerator)
        recommended_threads = self._calculate_threads(system.cpu_count)

        return HardwareInfo(
            system=system,
            accelerator=accelerator,
            gpus=gpus,
            recommended_layers=recommended_layers,
            recommended_threads=recommended_threads,
        )

    def _check_metal(self) -> bool:
        """Check for Metal support on macOS."""
        try:
            result = subprocess.run(
                ["system_profiler", "SPDisplaysDataType"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            return "Metal" in result.stdout
        except Exception:
            return False

    def _calculate_layers(
        self, gpus: list[GPUInfo], accelerator: AcceleratorType
    ) -> int:
        """Calculate recommended GPU layers based on VRAM."""
        if not gpus or accelerator == AcceleratorType.NONE:
            return 0

        total_vram_mb = sum(gpu.memory_free_mb for gpu in gpus)

        # Rough estimation: ~500MB per layer for 7B models
        # Leave some headroom for KV cache
        available_for_layers = total_vram_mb - 1024  # Reserve 1GB

        if available_for_layers < 500:
            return 0

        # Estimate layers (capped at typical model depth)
        estimated_layers = available_for_layers // 500
        return min(estimated_layers, 80)  # Cap at 80 layers

    def _calculate_threads(self, cpu_count: int) -> int:
        """Calculate recommended thread count."""
        # Use physical cores, leave some for system
        if cpu_count <= 4:
            return max(1, cpu_count - 1)
        return max(4, cpu_count - 2)

    def get_llama_cpp_args(self, info: HardwareInfo) -> dict:
        """Get recommended llama.cpp arguments."""
        args = {
            "n_threads": info.recommended_threads,
            "n_batch": 512,
        }

        if info.has_gpu:
            args["n_gpu_layers"] = info.recommended_layers

            if info.accelerator == AcceleratorType.CUDA:
                args["use_cuda"] = True
            elif info.accelerator == AcceleratorType.ROCM:
                args["use_rocm"] = True
            elif info.accelerator == AcceleratorType.METAL:
                args["use_metal"] = True

        return args
