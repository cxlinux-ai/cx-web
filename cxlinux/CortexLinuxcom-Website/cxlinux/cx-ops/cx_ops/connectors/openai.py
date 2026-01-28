"""OpenAI API connector."""

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


class OpenAIConnector(Connector):
    """Connector for OpenAI API.

    Supports GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, and compatible APIs.

    Example:
        config = ConnectorConfig(
            api_key="sk-...",
            model="gpt-4-turbo-preview",
        )
        connector = OpenAIConnector(config)
        response = await connector.chat([Message.user("Hello!")])
    """

    DEFAULT_BASE_URL = "https://api.openai.com/v1"

    @property
    def name(self) -> str:
        return "openai"

    @property
    def provider(self) -> str:
        return "OpenAI"

    def _get_base_url(self) -> str:
        return self.config.base_url or self.DEFAULT_BASE_URL

    def _get_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

    def _format_messages(self, messages: list[Message]) -> list[dict[str, Any]]:
        formatted = []
        for msg in messages:
            entry: dict[str, Any] = {
                "role": msg.role.value,
                "content": msg.content,
            }
            if msg.name:
                entry["name"] = msg.name
            formatted.append(entry)
        return formatted

    async def chat(
        self,
        messages: list[Message],
        **kwargs: Any,
    ) -> Response:
        """Send a chat completion request to OpenAI."""
        url = f"{self._get_base_url()}/chat/completions"

        payload = {
            "model": kwargs.get("model", self.config.model),
            "messages": self._format_messages(messages),
            "temperature": kwargs.get("temperature", self.config.temperature),
            "max_tokens": kwargs.get("max_tokens", self.config.max_tokens),
        }

        # Add optional parameters
        if "top_p" in kwargs:
            payload["top_p"] = kwargs["top_p"]
        if "frequency_penalty" in kwargs:
            payload["frequency_penalty"] = kwargs["frequency_penalty"]
        if "presence_penalty" in kwargs:
            payload["presence_penalty"] = kwargs["presence_penalty"]
        if "stop" in kwargs:
            payload["stop"] = kwargs["stop"]

        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            response = await client.post(
                url,
                headers=self._get_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        choice = data["choices"][0]
        usage = data.get("usage", {})

        return Response(
            content=choice["message"]["content"],
            model=data["model"],
            finish_reason=choice.get("finish_reason"),
            usage={
                "input_tokens": usage.get("prompt_tokens", 0),
                "output_tokens": usage.get("completion_tokens", 0),
            },
            metadata={
                "id": data.get("id"),
                "created": data.get("created"),
            },
        )

    async def chat_stream(
        self,
        messages: list[Message],
        **kwargs: Any,
    ) -> AsyncIterator[StreamChunk]:
        """Send a streaming chat completion request to OpenAI."""
        url = f"{self._get_base_url()}/chat/completions"

        payload = {
            "model": kwargs.get("model", self.config.model),
            "messages": self._format_messages(messages),
            "temperature": kwargs.get("temperature", self.config.temperature),
            "max_tokens": kwargs.get("max_tokens", self.config.max_tokens),
            "stream": True,
        }

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

                    data_str = line[6:]
                    if data_str == "[DONE]":
                        yield StreamChunk(content="", done=True)
                        break

                    import json

                    data = json.loads(data_str)
                    choice = data["choices"][0]
                    delta = choice.get("delta", {})
                    content = delta.get("content", "")
                    finish_reason = choice.get("finish_reason")

                    yield StreamChunk(
                        content=content,
                        done=finish_reason is not None,
                        finish_reason=finish_reason,
                    )

    async def test_connection(self) -> tuple[bool, str]:
        """Test the connection to OpenAI API."""
        try:
            url = f"{self._get_base_url()}/models"

            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(
                    url,
                    headers=self._get_headers(),
                )
                response.raise_for_status()

            return True, "Connection successful"
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                return False, "Invalid API key"
            return False, f"HTTP error: {e.response.status_code}"
        except Exception as e:
            return False, f"Connection failed: {str(e)}"

    async def list_models(self) -> list[str]:
        """List available models."""
        url = f"{self._get_base_url()}/models"

        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            response = await client.get(
                url,
                headers=self._get_headers(),
            )
            response.raise_for_status()
            data = response.json()

        return [model["id"] for model in data.get("data", [])]
