"""Cortex LLM CLI - Main entrypoint."""

import sys
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, DownloadColumn, TransferSpeedColumn
from rich.prompt import Prompt
from rich.table import Table

console = Console()
app = typer.Typer(
    name="cortex-llm",
    help="Local LLM runtime for Cortex Linux",
    no_args_is_help=True,
)

# Sub-command groups
models_app = typer.Typer(help="Model management")
hardware_app = typer.Typer(help="Hardware detection and benchmarking")
config_app = typer.Typer(help="Configuration management")

app.add_typer(models_app, name="models")
app.add_typer(hardware_app, name="hardware")
app.add_typer(config_app, name="config")


def print_success(message: str) -> None:
    console.print(f"[bold green]✓[/] {message}")


def print_error(message: str) -> None:
    console.print(f"[bold red]✗[/] {message}")


def print_info(message: str) -> None:
    console.print(f"[bold blue]ℹ[/] {message}")


# ============================================================================
# Models Commands
# ============================================================================


@models_app.command("list")
def models_list(
    downloaded: bool = typer.Option(False, "--downloaded", "-d", help="Show only downloaded models"),
) -> None:
    """List available models."""
    from .models import ModelRegistry

    registry = ModelRegistry()
    models = registry.list_models(downloaded_only=downloaded)

    table = Table(title="Available Models")
    table.add_column("Name", style="cyan")
    table.add_column("Parameters", style="magenta")
    table.add_column("Quantization", style="blue")
    table.add_column("Size", justify="right")
    table.add_column("Status", style="green")

    for model in models:
        status = "[green]✓ Downloaded[/]" if model.is_downloaded else "[dim]Not downloaded[/]"
        table.add_row(
            model.name,
            model.parameters,
            model.quantization,
            f"{model.size_mb} MB",
            status,
        )

    console.print(table)


@models_app.command("pull")
def models_pull(
    model_name: str = typer.Argument(..., help="Model name to download"),
) -> None:
    """Download a model from the registry."""
    from .models import ModelRegistry, ModelDownloader

    registry = ModelRegistry()
    model = registry.get_model(model_name)

    if not model:
        print_error(f"Unknown model: {model_name}")
        raise typer.Exit(1)

    if model.is_downloaded:
        print_info(f"Model already downloaded: {model.local_path}")
        return

    console.print(f"[bold]Downloading {model.name}...[/]")
    console.print(f"  Source: {model.source}")
    console.print(f"  Size: {model.size_mb} MB")
    console.print()

    downloader = ModelDownloader(registry)

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        DownloadColumn(),
        TransferSpeedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task(f"Downloading...", total=model.size_mb * 1024 * 1024)

        def update(downloaded: int, total: int) -> None:
            progress.update(task, completed=downloaded)

        try:
            path = downloader.download(model_name, progress_callback=update)
            print_success(f"Downloaded to: {path}")
        except Exception as e:
            print_error(f"Download failed: {e}")
            raise typer.Exit(1)


@models_app.command("remove")
def models_remove(
    model_name: str = typer.Argument(..., help="Model name to remove"),
    force: bool = typer.Option(False, "--force", "-f", help="Skip confirmation"),
) -> None:
    """Remove a downloaded model."""
    from .models import ModelRegistry

    registry = ModelRegistry()
    model = registry.get_model(model_name)

    if not model:
        print_error(f"Unknown model: {model_name}")
        raise typer.Exit(1)

    if not model.is_downloaded:
        print_info("Model is not downloaded")
        return

    if not force:
        confirm = Prompt.ask(f"Remove {model_name}?", choices=["y", "n"], default="n")
        if confirm != "y":
            print_info("Cancelled")
            return

    if registry.remove_model(model_name):
        print_success(f"Removed: {model_name}")
    else:
        print_error("Failed to remove model")


@models_app.command("info")
def models_info(
    model_name: str = typer.Argument(..., help="Model name"),
) -> None:
    """Show detailed model information."""
    from .models import ModelRegistry, GGUFValidator

    registry = ModelRegistry()
    model = registry.get_model(model_name)

    if not model:
        print_error(f"Unknown model: {model_name}")
        raise typer.Exit(1)

    console.print(Panel(f"[bold]{model.name}[/]\n{model.description}", title="Model Info"))

    table = Table(show_header=False, box=None)
    table.add_column("Key", style="dim")
    table.add_column("Value")

    table.add_row("Parameters", model.parameters)
    table.add_row("Quantization", model.quantization)
    table.add_row("Context Length", str(model.context_length))
    table.add_row("Size", f"{model.size_mb} MB")
    table.add_row("Source", model.source)
    table.add_row("License", model.license or "Unknown")
    table.add_row("Status", "[green]Downloaded[/]" if model.is_downloaded else "[dim]Not downloaded[/]")

    if model.local_path:
        table.add_row("Local Path", str(model.local_path))

        # Show GGUF metadata if downloaded
        validator = GGUFValidator()
        if model.local_path.exists():
            try:
                info = validator.get_model_info(model.local_path)
                table.add_row("Format", info.get("format", "Unknown"))
                table.add_row("Architecture", info.get("architecture", "Unknown"))
                table.add_row("Layers", str(info.get("layers", "Unknown")))
            except Exception:
                pass

    console.print(table)


# ============================================================================
# Inference Commands
# ============================================================================


@app.command("run")
def run(
    model_name: str = typer.Argument(..., help="Model to use"),
    prompt: str = typer.Option(..., "--prompt", "-p", help="Prompt text"),
    max_tokens: int = typer.Option(512, "--max-tokens", "-m", help="Maximum tokens to generate"),
    temperature: float = typer.Option(0.7, "--temperature", "-t", help="Sampling temperature"),
) -> None:
    """Run one-shot inference."""
    from .models import ModelRegistry
    from .inference import InferenceEngine, GenerationConfig

    registry = ModelRegistry()
    model = registry.get_model(model_name)

    if not model:
        print_error(f"Unknown model: {model_name}")
        raise typer.Exit(1)

    if not model.is_downloaded or not model.local_path:
        print_error(f"Model not downloaded. Run: cortex-llm models pull {model_name}")
        raise typer.Exit(1)

    with console.status(f"[bold blue]Loading {model_name}..."):
        engine = InferenceEngine()
        engine.load_model(model.local_path)

    config = GenerationConfig(
        max_tokens=max_tokens,
        temperature=temperature,
    )

    console.print("\n[bold]Response:[/]")
    for token in engine.generate_stream(prompt, config):
        console.print(token, end="")

    console.print("\n")


@app.command("chat")
def chat(
    model_name: str = typer.Argument(..., help="Model to use"),
    system_prompt: str = typer.Option(
        "You are a helpful AI assistant.",
        "--system", "-s",
        help="System prompt",
    ),
) -> None:
    """Interactive chat session."""
    from .models import ModelRegistry
    from .inference import InferenceEngine, ContextManager, GenerationConfig

    registry = ModelRegistry()
    model = registry.get_model(model_name)

    if not model:
        print_error(f"Unknown model: {model_name}")
        raise typer.Exit(1)

    if not model.is_downloaded or not model.local_path:
        print_error(f"Model not downloaded. Run: cortex-llm models pull {model_name}")
        raise typer.Exit(1)

    with console.status(f"[bold blue]Loading {model_name}..."):
        engine = InferenceEngine()
        engine.load_model(model.local_path)

    context = ContextManager(system_prompt=system_prompt)
    config = GenerationConfig()

    console.print(Panel(
        f"[bold]Chat with {model_name}[/]\n"
        f"Type 'exit' or 'quit' to end the session.\n"
        f"Type 'clear' to clear conversation history.",
        title="Cortex LLM Chat",
    ))

    while True:
        try:
            user_input = Prompt.ask("\n[bold cyan]You[/]")

            if user_input.lower() in ["exit", "quit"]:
                print_info("Goodbye!")
                break

            if user_input.lower() == "clear":
                context.clear()
                print_info("Conversation cleared")
                continue

            if not user_input.strip():
                continue

            context.add_user_message(user_input)
            messages = context.get_messages()

            console.print("\n[bold green]Assistant[/]: ", end="")
            response_text = ""

            for token in engine.chat_stream(messages, config):
                console.print(token, end="")
                response_text += token

            console.print()
            context.add_assistant_message(response_text)

        except KeyboardInterrupt:
            print_info("\nGoodbye!")
            break


@app.command("serve")
def serve(
    model_name: str = typer.Argument(..., help="Model to serve"),
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host to bind"),
    port: int = typer.Option(8080, "--port", "-p", help="Port to bind"),
) -> None:
    """Start the inference API server."""
    import uvicorn
    from .models import ModelRegistry
    from .server import create_app

    registry = ModelRegistry()
    model = registry.get_model(model_name)

    if not model:
        print_error(f"Unknown model: {model_name}")
        raise typer.Exit(1)

    if not model.is_downloaded or not model.local_path:
        print_error(f"Model not downloaded. Run: cortex-llm models pull {model_name}")
        raise typer.Exit(1)

    console.print(f"[bold]Starting Cortex LLM Server[/]")
    console.print(f"  Model: {model_name}")
    console.print(f"  Endpoint: http://{host}:{port}")
    console.print(f"  Docs: http://{host}:{port}/docs")
    console.print()

    app = create_app(model_path=model.local_path)
    uvicorn.run(app, host=host, port=port, log_level="info")


# ============================================================================
# Hardware Commands
# ============================================================================


@hardware_app.command("detect")
def hardware_detect() -> None:
    """Detect available hardware."""
    from .hardware import HardwareDetector

    with console.status("[bold blue]Detecting hardware..."):
        detector = HardwareDetector()
        info = detector.detect()

    console.print(Panel(
        f"[bold]System:[/] {info.system.hostname}\n"
        f"[bold]Platform:[/] {info.system.platform}\n"
        f"[bold]CPU:[/] {info.system.cpu_model}\n"
        f"[bold]Cores:[/] {info.system.cpu_count}\n"
        f"[bold]RAM:[/] {info.system.ram_total_gb:.1f} GB ({info.system.ram_available_gb:.1f} GB available)",
        title="System Information",
    ))

    if info.gpus:
        console.print(f"\n[bold]Accelerator:[/] {info.accelerator.value.upper()}")

        table = Table(title="GPU Information")
        table.add_column("Index")
        table.add_column("Name", style="cyan")
        table.add_column("VRAM Total", justify="right")
        table.add_column("VRAM Free", justify="right")
        table.add_column("Temp", justify="right")

        for gpu in info.gpus:
            temp = f"{gpu.temperature_c:.0f}°C" if gpu.temperature_c else "-"
            table.add_row(
                str(gpu.index),
                gpu.name,
                f"{gpu.memory_total_mb} MB",
                f"{gpu.memory_free_mb} MB",
                temp,
            )

        console.print(table)
    else:
        console.print("\n[yellow]No GPU detected - will use CPU inference[/]")

    console.print(f"\n[bold]Recommended Settings:[/]")
    console.print(f"  GPU Layers: {info.recommended_layers}")
    console.print(f"  Threads: {info.recommended_threads}")


@hardware_app.command("benchmark")
def hardware_benchmark(
    model_name: Optional[str] = typer.Argument(None, help="Model to benchmark"),
    iterations: int = typer.Option(3, "--iterations", "-n", help="Number of iterations"),
) -> None:
    """Run inference benchmark."""
    from .models import ModelRegistry
    from .inference import InferenceEngine, GenerationConfig
    import time

    registry = ModelRegistry()

    # Find a model to use
    if model_name:
        model = registry.get_model(model_name)
    else:
        downloaded = registry.list_models(downloaded_only=True)
        if not downloaded:
            print_error("No downloaded models. Run: cortex-llm models pull <model>")
            raise typer.Exit(1)
        model = downloaded[0]

    if not model or not model.is_downloaded or not model.local_path:
        print_error("Model not available for benchmarking")
        raise typer.Exit(1)

    console.print(f"[bold]Benchmarking with {model.name}...[/]")

    with console.status("[bold blue]Loading model..."):
        engine = InferenceEngine()
        engine.load_model(model.local_path)

    test_prompt = "Write a short poem about artificial intelligence."
    config = GenerationConfig(max_tokens=100, temperature=0.7)

    results = []

    for i in range(iterations):
        console.print(f"\n[dim]Iteration {i + 1}/{iterations}...[/]")
        start = time.time()
        result = engine.generate(test_prompt, config)
        elapsed = time.time() - start
        results.append({
            "tokens": result.tokens_generated,
            "time": elapsed,
            "tps": result.tokens_per_second,
        })
        console.print(f"  Generated {result.tokens_generated} tokens in {elapsed:.2f}s ({result.tokens_per_second:.1f} tok/s)")

    avg_tps = sum(r["tps"] for r in results) / len(results)
    avg_tokens = sum(r["tokens"] for r in results) / len(results)

    console.print(Panel(
        f"[bold]Average:[/] {avg_tps:.1f} tokens/second\n"
        f"[bold]Tokens per run:[/] {avg_tokens:.0f}\n"
        f"[bold]Iterations:[/] {iterations}",
        title="Benchmark Results",
    ))


# ============================================================================
# Config Commands
# ============================================================================


@config_app.command("show")
def config_show() -> None:
    """Show current configuration."""
    from .config import get_settings

    settings = get_settings()

    table = Table(title="Configuration")
    table.add_column("Setting", style="cyan")
    table.add_column("Value")

    table.add_row("Models Directory", str(settings.models_dir))
    table.add_row("Config File", str(settings.config_file))
    table.add_row("Default Model", settings.default_model)
    table.add_row("Context Length", str(settings.context_length))
    table.add_row("Max Tokens", str(settings.max_tokens))
    table.add_row("Temperature", str(settings.temperature))
    table.add_row("GPU Layers", str(settings.gpu_layers))
    table.add_row("Threads", str(settings.threads))
    table.add_row("Server Host", settings.server_host)
    table.add_row("Server Port", str(settings.server_port))

    console.print(table)


@config_app.command("set")
def config_set(
    key: str = typer.Argument(..., help="Configuration key"),
    value: str = typer.Argument(..., help="Configuration value"),
) -> None:
    """Set a configuration value."""
    from .config import Settings

    settings = Settings.load()

    valid_keys = [
        "default_model", "context_length", "max_tokens", "temperature",
        "top_p", "top_k", "repeat_penalty", "gpu_layers", "threads",
        "batch_size", "server_host", "server_port",
    ]

    if key not in valid_keys:
        print_error(f"Invalid key: {key}")
        console.print(f"Valid keys: {', '.join(valid_keys)}")
        raise typer.Exit(1)

    # Convert value to appropriate type
    attr_type = type(getattr(settings, key))
    try:
        if attr_type == int:
            typed_value = int(value)
        elif attr_type == float:
            typed_value = float(value)
        else:
            typed_value = value
    except ValueError:
        print_error(f"Invalid value type for {key}")
        raise typer.Exit(1)

    setattr(settings, key, typed_value)
    settings.save()

    print_success(f"Set {key} = {typed_value}")


@app.command("version")
def version() -> None:
    """Show version information."""
    from . import __version__

    console.print(f"[bold]Cortex LLM[/] v{__version__}")


@app.callback()
def main() -> None:
    """Cortex LLM - Local LLM runtime for Cortex Linux."""
    pass


if __name__ == "__main__":
    app()
