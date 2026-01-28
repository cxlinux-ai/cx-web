"""API routes for inference server."""

import time
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ..inference import GenerationConfig


router = APIRouter()


# Request/Response Models
class GenerateRequest(BaseModel):
    """Text generation request."""

    prompt: str = Field(..., min_length=1, max_length=32768)
    max_tokens: int = Field(default=2048, ge=1, le=8192)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    top_p: float = Field(default=0.9, ge=0.0, le=1.0)
    top_k: int = Field(default=40, ge=0, le=100)
    repeat_penalty: float = Field(default=1.1, ge=1.0, le=2.0)
    stop: list[str] = Field(default_factory=list)
    stream: bool = Field(default=False)


class GenerateResponse(BaseModel):
    """Text generation response."""

    text: str
    tokens_generated: int
    tokens_per_second: float
    prompt_tokens: int
    total_time: float
    finish_reason: str


class ChatMessage(BaseModel):
    """Chat message."""

    role: str = Field(..., pattern="^(system|user|assistant)$")
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    """Chat completion request."""

    messages: list[ChatMessage] = Field(..., min_items=1)
    max_tokens: int = Field(default=2048, ge=1, le=8192)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    top_p: float = Field(default=0.9, ge=0.0, le=1.0)
    top_k: int = Field(default=40, ge=0, le=100)
    repeat_penalty: float = Field(default=1.1, ge=1.0, le=2.0)
    stop: list[str] = Field(default_factory=list)
    stream: bool = Field(default=False)


class ChatResponse(BaseModel):
    """Chat completion response."""

    message: ChatMessage
    tokens_generated: int
    tokens_per_second: float
    prompt_tokens: int
    total_time: float
    finish_reason: str


class ModelInfo(BaseModel):
    """Model information."""

    name: str
    size_mb: int
    quantization: str
    parameters: str
    is_loaded: bool


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    model_loaded: bool
    model_path: Optional[str]


class MetricsResponse(BaseModel):
    """Server metrics."""

    requests_total: int
    tokens_generated_total: int
    average_tokens_per_second: float
    uptime_seconds: float


# Global metrics
_metrics = {
    "requests_total": 0,
    "tokens_generated_total": 0,
    "total_generation_time": 0.0,
    "start_time": time.time(),
}


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    """Health check endpoint."""
    engine = request.app.state.engine
    return HealthResponse(
        status="ok",
        model_loaded=engine.is_loaded,
        model_path=str(engine.model_path) if engine.model_path else None,
    )


@router.get("/models", response_model=list[ModelInfo])
async def list_models(request: Request) -> list[ModelInfo]:
    """List available models."""
    registry = request.app.state.registry
    models = registry.list_models()

    engine = request.app.state.engine
    loaded_path = engine.model_path

    return [
        ModelInfo(
            name=m.name,
            size_mb=m.size_mb,
            quantization=m.quantization,
            parameters=m.parameters,
            is_loaded=m.local_path == loaded_path if m.local_path and loaded_path else False,
        )
        for m in models
    ]


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: Request, body: GenerateRequest):
    """Generate text completion."""
    engine = request.app.state.engine

    if not engine.is_loaded:
        raise HTTPException(status_code=503, detail="No model loaded")

    config = GenerationConfig(
        max_tokens=body.max_tokens,
        temperature=body.temperature,
        top_p=body.top_p,
        top_k=body.top_k,
        repeat_penalty=body.repeat_penalty,
        stop=body.stop,
    )

    if body.stream:
        async def generate_stream():
            for token in engine.generate_stream(body.prompt, config):
                yield f"data: {token}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
        )

    result = engine.generate(body.prompt, config)

    # Update metrics
    _metrics["requests_total"] += 1
    _metrics["tokens_generated_total"] += result.tokens_generated
    _metrics["total_generation_time"] += result.total_time

    return GenerateResponse(
        text=result.text,
        tokens_generated=result.tokens_generated,
        tokens_per_second=result.tokens_per_second,
        prompt_tokens=result.prompt_tokens,
        total_time=result.total_time,
        finish_reason=result.finish_reason,
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(request: Request, body: ChatRequest):
    """Chat completion endpoint."""
    engine = request.app.state.engine

    if not engine.is_loaded:
        raise HTTPException(status_code=503, detail="No model loaded")

    messages = [{"role": m.role, "content": m.content} for m in body.messages]

    config = GenerationConfig(
        max_tokens=body.max_tokens,
        temperature=body.temperature,
        top_p=body.top_p,
        top_k=body.top_k,
        repeat_penalty=body.repeat_penalty,
        stop=body.stop,
    )

    if body.stream:
        async def generate_stream():
            for token in engine.chat_stream(messages, config):
                yield f"data: {token}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
        )

    result = engine.chat(messages, config)

    # Update metrics
    _metrics["requests_total"] += 1
    _metrics["tokens_generated_total"] += result.tokens_generated
    _metrics["total_generation_time"] += result.total_time

    return ChatResponse(
        message=ChatMessage(role="assistant", content=result.text),
        tokens_generated=result.tokens_generated,
        tokens_per_second=result.tokens_per_second,
        prompt_tokens=result.prompt_tokens,
        total_time=result.total_time,
        finish_reason=result.finish_reason,
    )


@router.get("/metrics", response_model=MetricsResponse)
async def metrics() -> MetricsResponse:
    """Get server metrics."""
    uptime = time.time() - _metrics["start_time"]
    avg_tps = 0.0

    if _metrics["total_generation_time"] > 0:
        avg_tps = _metrics["tokens_generated_total"] / _metrics["total_generation_time"]

    return MetricsResponse(
        requests_total=_metrics["requests_total"],
        tokens_generated_total=_metrics["tokens_generated_total"],
        average_tokens_per_second=round(avg_tps, 2),
        uptime_seconds=round(uptime, 2),
    )


@router.post("/models/{model_name}/load")
async def load_model(request: Request, model_name: str):
    """Load a model by name."""
    registry = request.app.state.registry
    engine = request.app.state.engine

    model = registry.get_model(model_name)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model not found: {model_name}")

    if not model.is_downloaded or not model.local_path:
        raise HTTPException(status_code=400, detail="Model not downloaded")

    try:
        engine.load_model(model.local_path)
        return {"status": "loaded", "model": model_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/unload")
async def unload_model(request: Request):
    """Unload the current model."""
    engine = request.app.state.engine
    engine.unload_model()
    return {"status": "unloaded"}
