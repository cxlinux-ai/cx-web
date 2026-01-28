"""Tests for hardware detection."""

import pytest
from cortex_llm.hardware import HardwareDetector, AcceleratorType, HardwareInfo


class TestHardwareDetector:
    """Test hardware detection."""

    def test_detect_returns_hardware_info(self):
        """Detection returns HardwareInfo dataclass."""
        detector = HardwareDetector()
        info = detector.detect()

        assert isinstance(info, HardwareInfo)
        assert isinstance(info.accelerator, AcceleratorType)
        assert isinstance(info.cpu_cores, int)
        assert info.cpu_cores > 0
        assert isinstance(info.memory_gb, float)
        assert info.memory_gb > 0

    def test_accelerator_type_enum(self):
        """AcceleratorType has expected values."""
        assert AcceleratorType.CUDA.value == "cuda"
        assert AcceleratorType.ROCM.value == "rocm"
        assert AcceleratorType.CPU.value == "cpu"

    def test_get_optimal_config(self):
        """Optimal config returns valid settings."""
        detector = HardwareDetector()
        config = detector.get_optimal_config()

        assert "n_gpu_layers" in config
        assert "n_ctx" in config
        assert "n_threads" in config
        assert isinstance(config["n_gpu_layers"], int)
        assert isinstance(config["n_ctx"], int)
        assert isinstance(config["n_threads"], int)

    def test_hardware_info_summary(self):
        """HardwareInfo has summary method."""
        info = HardwareInfo(
            accelerator=AcceleratorType.CPU,
            gpu_name=None,
            gpu_memory_mb=0,
            cpu_cores=8,
            memory_gb=16.0,
        )
        summary = info.summary()

        assert "CPU" in summary
        assert "8" in summary
        assert "16" in summary


class TestAcceleratorType:
    """Test accelerator type enum."""

    def test_all_types_have_values(self):
        """All accelerator types have string values."""
        for accel in AcceleratorType:
            assert isinstance(accel.value, str)
            assert len(accel.value) > 0
