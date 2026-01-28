"""Tests for FastAPI server."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient

from cortex_llm.server import create_app


class TestHealthEndpoint:
    """Test health check endpoint."""

    def test_health_returns_ok(self):
        """Health endpoint returns ok status."""
        app = create_app()
        client = TestClient(app)

        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "model_loaded" in data

    def test_health_shows_model_not_loaded(self):
        """Health shows model not loaded initially."""
        app = create_app()
        client = TestClient(app)

        response = client.get("/health")
        data = response.json()

        assert data["model_loaded"] is False


class TestModelsEndpoint:
    """Test models endpoint."""

    def test_list_models(self):
        """List models returns available models."""
        app = create_app()
        client = TestClient(app)

        response = client.get("/models")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_model_info_structure(self):
        """Model info has correct structure."""
        app = create_app()
        client = TestClient(app)

        response = client.get("/models")
        data = response.json()

        if len(data) > 0:
            model = data[0]
            assert "name" in model
            assert "size_mb" in model
            assert "quantization" in model
            assert "is_loaded" in model


class TestGenerateEndpoint:
    """Test generate endpoint."""

    def test_generate_without_model(self):
        """Generate returns 503 when no model loaded."""
        app = create_app()
        client = TestClient(app)

        response = client.post("/generate", json={
            "prompt": "Hello, world!",
            "max_tokens": 100,
        })

        assert response.status_code == 503
        assert "No model loaded" in response.json()["detail"]

    def test_generate_validates_prompt(self):
        """Generate validates prompt field."""
        app = create_app()
        client = TestClient(app)

        response = client.post("/generate", json={
            "prompt": "",
            "max_tokens": 100,
        })

        assert response.status_code == 422


class TestChatEndpoint:
    """Test chat endpoint."""

    def test_chat_without_model(self):
        """Chat returns 503 when no model loaded."""
        app = create_app()
        client = TestClient(app)

        response = client.post("/chat", json={
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 100,
        })

        assert response.status_code == 503
        assert "No model loaded" in response.json()["detail"]

    def test_chat_validates_messages(self):
        """Chat validates message structure."""
        app = create_app()
        client = TestClient(app)

        response = client.post("/chat", json={
            "messages": [{"role": "invalid", "content": "Hello"}],
            "max_tokens": 100,
        })

        assert response.status_code == 422


class TestMetricsEndpoint:
    """Test metrics endpoint."""

    def test_metrics_returns_data(self):
        """Metrics endpoint returns metrics data."""
        app = create_app()
        client = TestClient(app)

        response = client.get("/metrics")

        assert response.status_code == 200
        data = response.json()
        assert "requests_total" in data
        assert "tokens_generated_total" in data
        assert "uptime_seconds" in data

    def test_metrics_initial_values(self):
        """Metrics start at zero."""
        app = create_app()
        client = TestClient(app)

        response = client.get("/metrics")
        data = response.json()

        assert data["requests_total"] == 0
        assert data["tokens_generated_total"] == 0


class TestAppFactory:
    """Test app factory."""

    def test_create_app_no_args(self):
        """App creates without arguments."""
        app = create_app()
        assert app is not None

    def test_app_has_routes(self):
        """App has expected routes."""
        app = create_app()
        routes = [r.path for r in app.routes]

        assert "/health" in routes
        assert "/models" in routes
        assert "/generate" in routes
        assert "/chat" in routes
        assert "/metrics" in routes

    def test_app_has_docs(self):
        """App has documentation endpoints."""
        app = create_app()
        client = TestClient(app)

        response = client.get("/docs")
        assert response.status_code == 200

        response = client.get("/redoc")
        assert response.status_code == 200
