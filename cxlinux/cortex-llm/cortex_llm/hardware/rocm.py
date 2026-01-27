"""AMD ROCm detection and configuration."""

import shutil
import subprocess
from typing import Optional

from .detector import GPUInfo


class ROCmDetector:
    """Detects AMD GPUs via rocm-smi."""

    def is_available(self) -> bool:
        """Check if ROCm is available."""
        return shutil.which("rocm-smi") is not None

    def get_version(self) -> Optional[str]:
        """Get ROCm version."""
        try:
            result = subprocess.run(
                ["rocm-smi", "--showversion"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                for line in result.stdout.split("\n"):
                    if "ROCm" in line or "version" in line.lower():
                        return line.strip()
        except Exception:
            pass
        return None

    def get_gpus(self) -> list[GPUInfo]:
        """Get list of AMD GPUs."""
        if not self.is_available():
            return []

        gpus = []

        try:
            # Get GPU info
            result = subprocess.run(
                ["rocm-smi", "--showproductname", "--showmeminfo", "vram", "--showtemp", "--showuse"],
                capture_output=True,
                text=True,
                timeout=10,
            )

            if result.returncode == 0:
                # Parse rocm-smi output (format varies by version)
                lines = result.stdout.strip().split("\n")
                current_gpu: dict = {}
                gpu_index = 0

                for line in lines:
                    line = line.strip()

                    if "GPU" in line and ":" in line:
                        # Start of new GPU section
                        if current_gpu:
                            gpus.append(self._parse_gpu_info(gpu_index - 1, current_gpu))
                        current_gpu = {}
                        gpu_index += 1

                    elif "Card series" in line or "Product Name" in line:
                        parts = line.split(":")
                        if len(parts) > 1:
                            current_gpu["name"] = parts[1].strip()

                    elif "Total Memory" in line or "VRAM Total Memory" in line:
                        parts = line.split(":")
                        if len(parts) > 1:
                            mem_str = parts[1].strip()
                            current_gpu["memory_total"] = self._parse_memory(mem_str)

                    elif "Used Memory" in line or "VRAM Used Memory" in line:
                        parts = line.split(":")
                        if len(parts) > 1:
                            mem_str = parts[1].strip()
                            current_gpu["memory_used"] = self._parse_memory(mem_str)

                    elif "Temperature" in line:
                        parts = line.split(":")
                        if len(parts) > 1:
                            try:
                                temp_str = parts[1].strip().replace("c", "").replace("C", "")
                                current_gpu["temperature"] = float(temp_str)
                            except ValueError:
                                pass

                    elif "GPU use" in line or "GPU Utilization" in line:
                        parts = line.split(":")
                        if len(parts) > 1:
                            try:
                                util_str = parts[1].strip().replace("%", "")
                                current_gpu["utilization"] = float(util_str)
                            except ValueError:
                                pass

                # Don't forget the last GPU
                if current_gpu:
                    gpus.append(self._parse_gpu_info(gpu_index - 1, current_gpu))

        except Exception:
            pass

        # Fallback: try simpler detection
        if not gpus:
            gpus = self._fallback_detection()

        return gpus

    def _parse_memory(self, mem_str: str) -> int:
        """Parse memory string to MB."""
        mem_str = mem_str.upper().strip()
        try:
            if "GB" in mem_str:
                return int(float(mem_str.replace("GB", "").strip()) * 1024)
            elif "MB" in mem_str:
                return int(float(mem_str.replace("MB", "").strip()))
            elif "KB" in mem_str:
                return int(float(mem_str.replace("KB", "").strip()) / 1024)
            else:
                # Assume bytes
                return int(float(mem_str) / (1024 * 1024))
        except ValueError:
            return 0

    def _parse_gpu_info(self, index: int, data: dict) -> GPUInfo:
        """Parse GPU info from collected data."""
        memory_total = data.get("memory_total", 0)
        memory_used = data.get("memory_used", 0)

        return GPUInfo(
            index=index,
            name=data.get("name", f"AMD GPU {index}"),
            memory_total_mb=memory_total,
            memory_free_mb=max(0, memory_total - memory_used),
            temperature_c=data.get("temperature"),
            utilization_percent=data.get("utilization"),
        )

    def _fallback_detection(self) -> list[GPUInfo]:
        """Fallback GPU detection using lspci."""
        gpus = []

        try:
            result = subprocess.run(
                ["lspci"],
                capture_output=True,
                text=True,
                timeout=5,
            )

            if result.returncode == 0:
                index = 0
                for line in result.stdout.split("\n"):
                    if "VGA" in line and ("AMD" in line or "ATI" in line or "Radeon" in line):
                        # Extract GPU name
                        parts = line.split(":")
                        name = parts[-1].strip() if len(parts) > 1 else f"AMD GPU {index}"

                        gpus.append(GPUInfo(
                            index=index,
                            name=name,
                            memory_total_mb=8192,  # Assume 8GB as fallback
                            memory_free_mb=6144,   # Assume 75% free
                        ))
                        index += 1

        except Exception:
            pass

        return gpus

    def is_sufficient_for_inference(self, min_vram_mb: int = 4096) -> bool:
        """Check if GPU has sufficient VRAM for inference."""
        gpus = self.get_gpus()
        if not gpus:
            return False
        return sum(gpu.memory_free_mb for gpu in gpus) >= min_vram_mb
