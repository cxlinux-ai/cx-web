"""GGUF file validation."""

import struct
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class GGUFMetadata:
    """GGUF file metadata."""

    magic: str
    version: int
    tensor_count: int
    metadata_kv_count: int
    architecture: str = ""
    context_length: int = 0
    embedding_length: int = 0
    block_count: int = 0
    quantization: str = ""


class GGUFValidator:
    """Validates GGUF model files."""

    GGUF_MAGIC = b"GGUF"
    SUPPORTED_VERSIONS = [2, 3]

    def validate(self, path: Path) -> tuple[bool, str]:
        """Validate a GGUF file."""
        if not path.exists():
            return False, f"File not found: {path}"

        if not path.suffix == ".gguf":
            return False, "File does not have .gguf extension"

        try:
            metadata = self.read_metadata(path)

            if metadata.magic != "GGUF":
                return False, f"Invalid magic bytes: {metadata.magic}"

            if metadata.version not in self.SUPPORTED_VERSIONS:
                return False, f"Unsupported GGUF version: {metadata.version}"

            return True, "Valid GGUF file"

        except Exception as e:
            return False, f"Failed to read GGUF file: {e}"

    def read_metadata(self, path: Path) -> GGUFMetadata:
        """Read GGUF file metadata."""
        with open(path, "rb") as f:
            # Read header
            magic = f.read(4).decode("ascii", errors="ignore")
            version = struct.unpack("<I", f.read(4))[0]
            tensor_count = struct.unpack("<Q", f.read(8))[0]
            metadata_kv_count = struct.unpack("<Q", f.read(8))[0]

            metadata = GGUFMetadata(
                magic=magic,
                version=version,
                tensor_count=tensor_count,
                metadata_kv_count=metadata_kv_count,
            )

            # Read key-value pairs for important metadata
            try:
                for _ in range(min(metadata_kv_count, 100)):  # Limit iterations
                    key = self._read_string(f)
                    value_type = struct.unpack("<I", f.read(4))[0]
                    value = self._read_value(f, value_type)

                    if key == "general.architecture":
                        metadata.architecture = str(value)
                    elif key == "llama.context_length" or key.endswith(".context_length"):
                        metadata.context_length = int(value) if value else 0
                    elif key == "llama.embedding_length" or key.endswith(".embedding_length"):
                        metadata.embedding_length = int(value) if value else 0
                    elif key == "llama.block_count" or key.endswith(".block_count"):
                        metadata.block_count = int(value) if value else 0
                    elif key == "general.quantization_version":
                        metadata.quantization = str(value)

            except Exception:
                pass  # Best effort metadata extraction

            return metadata

    def _read_string(self, f) -> str:
        """Read a GGUF string."""
        length = struct.unpack("<Q", f.read(8))[0]
        return f.read(length).decode("utf-8", errors="ignore")

    def _read_value(self, f, value_type: int):
        """Read a GGUF value based on type."""
        # Type definitions from GGUF spec
        if value_type == 0:  # UINT8
            return struct.unpack("<B", f.read(1))[0]
        elif value_type == 1:  # INT8
            return struct.unpack("<b", f.read(1))[0]
        elif value_type == 2:  # UINT16
            return struct.unpack("<H", f.read(2))[0]
        elif value_type == 3:  # INT16
            return struct.unpack("<h", f.read(2))[0]
        elif value_type == 4:  # UINT32
            return struct.unpack("<I", f.read(4))[0]
        elif value_type == 5:  # INT32
            return struct.unpack("<i", f.read(4))[0]
        elif value_type == 6:  # FLOAT32
            return struct.unpack("<f", f.read(4))[0]
        elif value_type == 7:  # BOOL
            return struct.unpack("<B", f.read(1))[0] != 0
        elif value_type == 8:  # STRING
            return self._read_string(f)
        elif value_type == 9:  # ARRAY
            array_type = struct.unpack("<I", f.read(4))[0]
            array_len = struct.unpack("<Q", f.read(8))[0]
            return [self._read_value(f, array_type) for _ in range(min(array_len, 100))]
        elif value_type == 10:  # UINT64
            return struct.unpack("<Q", f.read(8))[0]
        elif value_type == 11:  # INT64
            return struct.unpack("<q", f.read(8))[0]
        elif value_type == 12:  # FLOAT64
            return struct.unpack("<d", f.read(8))[0]
        else:
            return None

    def get_model_info(self, path: Path) -> dict:
        """Get human-readable model info from GGUF file."""
        metadata = self.read_metadata(path)

        return {
            "format": f"GGUF v{metadata.version}",
            "architecture": metadata.architecture or "unknown",
            "context_length": metadata.context_length,
            "embedding_length": metadata.embedding_length,
            "layers": metadata.block_count,
            "tensor_count": metadata.tensor_count,
            "file_size_mb": round(path.stat().st_size / (1024 * 1024), 1),
        }
