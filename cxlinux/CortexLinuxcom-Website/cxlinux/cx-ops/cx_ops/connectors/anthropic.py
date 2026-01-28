"""Anthropic Claude API connector."""

from typing import Any, AsyncIterator

import httpx

from cx_ops.connectors.base import (
    Connector,
    ConnectorConfig,
    Message,
    MessageRole,
    Response,
    StreamChunk,
)


class AnthropicConnector(Connector):
    """Connector for Anthropic Claude API.

    Supports Claude 3 Opus, Sonnet, Haiku, and Claude 2.x models.

    Example:
        config = ConnectorConfig(
            api_key="sk-ant-...",
            model="claude-3-opus-20240229",
        )
        connector = AnthropicConnector(config)
        response = await connector.chat([Message.user("Hello!")])
    """

    DEFAULT_BASE_URL = "https://api.anthropic.com"
    API_VERSION = "2023-06-01"

    @property
    def name(self) -> str:
        return "anthropic"

    @property
    def provider(self) -> str:
        return "Anthropic"

    def _get_base_url(self) -> str:
        return self.config.base_url or self.DEFAULT_BASE_URL

    def _get_headers(self) -> dict[str, str]:
        return {
            "x-api-key": self.config.api_key,
            "anthropic-version": self.API_VERSION,
            "Content-Type": "application/json",
        }

    def _format_messages(
        self, messages: list[Message]
    ) -> tuple[str | None, list[dict[str, Any]]]:
        """Format messages for Anthropic API.

        Returns (system_prompt, messages) tuple.
        Anthropic handles system prompts separately.
        """
        system_prompt = None
        formatted = []

        for msg in messages:
            if msg.role == MessageRole.SYSTEM:
                system_prompt = msg.content
            else:
                formatted.append({
                    "role": msg.role.value,
                    "content": msg.content,
                })

        return system_prompt, formatted

    async def chat(
        self,
        messages: list[Message],
        **kwargs: Any,
    ) -> Response:
        """Send a chat completion request to Anthropic."""
        url = f"{self._get_base_url()}/v1/messages"

        system_prompt, formatted_messages = self._format_messages(messages)

        payload: dict[str, Any] = {
            "model": kwargs.get("model", self.config.model),
            "messages": formatted_messages,
            "max_tokens": kwargs.get("max_tokens", self.config.max_tokens),
        }

        if system_prompt:
            payload["system"] = system_prompt

        # Temperature is optional for Anthropic
        if "temperature" in kwargs or self.config.temperature != 0.7:
            payload["temperature"] = kwargs.get("temperature", self.config.temperature)

        # Add optional parameters
        if "top_p" in kwargs:
            payload["top_p"] = kwargs["top_p"]
        if "top_k" in kwargs:
            payload["top_k"] = kwargs["top_k"]
        if "stop_sequences" in kwargs:
            payload["stop_sequences"] = kwargs["stop_sequences"]

        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            response = await client.post(
                url,
                headers=self._get_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        content = ""
        for block in data.get("content", []):
            if block.get("type") == "text":
                content += block.get("text", "")

        usage = data.get("usage", {})

        return Response(
            content=content,
            model=data["model"],
            finish_reason=data.get("stop_reason"),
            usage={
                "input_tokens": usage.get("input_tokens", 0),
                "output_tokens": usage.get("output_tokens", 0),
            },
            metadata={
                "id": data.get("id"),
                "type": data.get("type"),
            },
        )

    async def chat_stream(
        self,
        messages: list[Message],
        **kwargs: Any,
    ) -> AsyncIterator[StreamChunk]:
        """Send a streaming chat completion request to Anthropic."""
        url = f"{self._get_base_url()}/v1/messages"

        system_prompt, formatted_messages = self._format_messages(messages)

        payload: dict[str, Any] = {
            "model": kwargs.get("model", self.config.model),
            "messages": formatted_messages,
            "max_tokens": kwargs.get("max_tokens", self.config.max_tokens),
            "stream": True,
        }

        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            async with client.stream(
                "POST",
                url,
                headers=self._get_headers(),
                json=payload,
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue

                    import json

                    data = json.loads(line[6:])
                    event_type = data.get("type")

                    if event_type == "content_block_delta":
                        delta = data.get("delta", {})
                        if delta.get("type") == "text_delta":
                            yield StreamChunk(
                                content=delta.get("text", ""),
                                done=False,
                            )

                    elif event_type == "message_delta":
                        stop_reason = data.get("delta", {}).get("stop_reason")
                        if stop_reason:
                            yield StreamChunk(
                                content="",
                                done=True,
                                finish_reason=stop_reason,
                            )

                    elif event_type == "message_stop":
                        yield StreamChunk(content="", done=True)
                        break

    async def test_connection(self) -> tuple[bool, str]:
        """Test the connection to Anthropic API."""
        try:
            # Send a minimal request to verify API key
            response = await self.chat(
                [Message.user("Say 'ok'")],
                max_tokens=10,
            )
            return True, f"Connection successful (model: {response.model})"
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                return False, "Invalid API key"
            if e.response.status_code == 400:
                # Try to extract error message
                try:
                    error_data = e.response.json()
                    return False, error_data.get("error", {}).get("message", str(e))
                except Exception:
                    pass
            return False, f"HTTP error: {e.response.status_code}"
        except Exception as e:
            return False, f"Connection failed: {str(e)}"
