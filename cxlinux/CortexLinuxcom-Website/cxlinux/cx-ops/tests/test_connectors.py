"""Tests for the connectors module."""

import pytest

from cx_ops.connectors.base import (
    Connector,
    ConnectorConfig,
    Message,
    MessageRole,
    Response,
)


class TestMessage:
    """Tests for Message."""

    def test_create_message(self):
        msg = Message(
            role=MessageRole.USER,
            content="Hello",
        )
        assert msg.role == MessageRole.USER
        assert msg.content == "Hello"

    def test_system_helper(self):
        msg = Message.system("You are helpful")
        assert msg.role == MessageRole.SYSTEM
        assert msg.content == "You are helpful"

    def test_user_helper(self):
        msg = Message.user("Hello")
        assert msg.role == MessageRole.USER

    def test_assistant_helper(self):
        msg = Message.assistant("Hi there")
        assert msg.role == MessageRole.ASSISTANT


class TestResponse:
    """Tests for Response."""

    def test_create_response(self):
        response = Response(
            content="Hello!",
            model="gpt-4",
            finish_reason="stop",
            usage={"input_tokens": 10, "output_tokens": 5},
        )
        assert response.content == "Hello!"
        assert response.model == "gpt-4"

    def test_token_properties(self):
        response = Response(
            content="Test",
            model="claude-3",
            usage={"input_tokens": 100, "output_tokens": 50},
        )
        assert response.input_tokens == 100
        assert response.output_tokens == 50
        assert response.total_tokens == 150

    def test_empty_usage(self):
        response = Response(
            content="Test",
            model="test",
        )
        assert response.input_tokens == 0
        assert response.output_tokens == 0
        assert response.total_tokens == 0


class TestConnectorConfig:
    """Tests for ConnectorConfig."""

    def test_create_config(self):
        config = ConnectorConfig(
            api_key="test-key",
            model="gpt-4",
        )
        assert config.api_key == "test-key"
        assert config.model == "gpt-4"
        assert config.timeout == 60
        assert config.temperature == 0.7

    def test_custom_config(self):
        config = ConnectorConfig(
            api_key="key",
            model="model",
            timeout=120,
            temperature=0.5,
            max_tokens=8192,
        )
        assert config.timeout == 120
        assert config.temperature == 0.5
        assert config.max_tokens == 8192
