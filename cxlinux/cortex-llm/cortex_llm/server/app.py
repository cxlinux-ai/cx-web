"""FastAPI application factory."""

from pathlib import Path
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..config import get_settings
from ..inference import InferenceEngine
from ..models import ModelRegistry
from .routes import router
from .middleware import APIKeyMiddleware


def create_app(
    model_path: Optional[Path] = None,
    model_name: Optional[str] = None,
) -> FastAPI:
    """Create FastAPI application with loaded model."""
    settings = get_settings()

    app = FastAPI(
        title="Cortex LLM",
        description="Local LLM inference server for Cortex Linux",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API Key auth (if configured)
    if settings.api_key:
        app.add_middleware(APIKeyMiddleware, api_key=settings.api_key)

    # Initialize engine
    engine = InferenceEngine()
    registry = ModelRegistry()

    # Load model
    if model_path:
        engine.load_model(model_path)
    elif model_name:
        path = registry.get_model_path(model_name)
        if path:
            engine.load_model(path)

    # Store in app state
    app.state.engine = engine
    app.state.registry = registry
    app.state.settings = settings

    # Include routes
    app.include_router(router)

    return app


def get_engine(app: FastAPI) -> InferenceEngine:
    """Get engine from app state."""
    return app.state.engine


def get_registry(app: FastAPI) -> ModelRegistry:
    """Get registry from app state."""
    return app.state.registry
