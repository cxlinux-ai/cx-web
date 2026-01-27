"""Google Gemini API connector."""

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


class GoogleConnector(Connector):
    """Connector for Google Gemini API.

    Supports Gemini Pro, Gemini Pro Vision, and other Gemini models.

    Example:
        config = ConnectorConfig(
            api_key="AIza...",
            model="gemini-pro",
        )
        connector = GoogleConnector(config)
        response = await connector.chat([Message.user("Hello!")])
    """

    DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

    @property
    def name(self) -> str:
        return "google"

    @property
    def provider(self) -> str:
        return "Google"

    def _get_base_url(self) -> str:
        return self.config.base_url or self.DEFAULT_BASE_URL

    def _format_messages(
        self, messages: list[Message]
    ) -> tuple[str | None, list[dict[str, Any]]]:
        """Format messages for Gemini API.

        Returns (system_instruction, contents) tuple.
        """
        system_instruction = None
        contents = []

        for msg in messages:
            if msg.role == MessageRole.SYSTEM:
                system_instruction = msg.content
            else:
                role = "user" if msg.role == MessageRole.USER else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": msg.content}],
                })

        return system_instruction, contents

    async def chat(
        self,
        messages: list[Message],
        **kwargs: Any,
    ) -> Response:
        """Send a chat completion request to Gemini."""
        model = kwargs.get("model", self.config.model)
        url = f"{self._get_base_url()}/models/{model}:generateContent"

        system_instruction, contents = self._format_messages(messages)

        payload: dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": kwargs.get("temperature", self.config.temperature),
                "maxOutputTokens": kwargs.get("max_tokens", self.config.max_tokens),
            },
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        # Add optional parameters
        if "top_p" in kwargs:
            payload["generationConfig"]["topP"] = kwargs["top_p"]
        if "top_k" in kwargs:
            payload["generationConfig"]["topK"] = kwargs["top_k"]
        if "stop_sequences" in kwargs:
            payload["generationConfig"]["stopSequences"] = kwargs["stop_sequences"]

        # Add safety settings if provided
        if "safety_settings" in kwargs:
            payload["safetySettings"] = kwargs["safety_settings"]

        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            response = await client.post(
                url,
                params={"key": self.config.api_key},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        # Extract content from response
        candidates = data.get("candidates", [])
        if not candidates:
            return Response(
                content="",
                model=model,
                finish_reason="error",
                metadata={"error": "No candidates returned"},
            )

        candidate = candidates[0]
        content_parts = candidate.get("content", {}).get("parts", [])
        content = "".join(part.get("text", "") for part in content_parts)

        # Extract usage metadata
        usage_metadata = data.get("usageMetadata", {})

        return Response(
            content=content,
            model=model,
            finish_reason=candidate.get("finishReason"),
            usage={
                "input_tokens": usage_metadata.get("promptTokenCount", 0),
                "output_tokens": usage_metadata.get("candidatesTokenCount", 0),
            },
            metadata={
                "safety_ratings": candidate.get("safetyRatings"),
            },
        )

    async def chat_stream(
        self,
        messages: list[Message],
        **kwargs: Any,
    ) -> AsyncIterator[StreamChunk]:
        """Send a streaming chat completion request to Gemini."""
        model = kwargs.get("model", self.config.model)
        url = f"{self._get_base_url()}/models/{model}:streamGenerateContent"

        system_instruction, contents = self._format_messages(messages)

        payload: dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": kwargs.get("temperature", self.config.temperature),
                "maxOutputTokens": kwargs.get("max_tokens", self.config.max_tokens),
            },
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            async with client.stream(
                "POST",
                url,
                params={"key": self.config.api_key, "alt": "sse"},
                json=payload,
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue

                    import json

                    data = json.loads(line[6:])

                    candidates = data.get("candidates", [])
                    if not candidates:
                        continue

                    candidate = candidates[0]
                    content_parts = candidate.get("content", {}).get("parts", [])
                    content = "".join(part.get("text", "") for part in content_parts)

                    finish_reason = candidate.get("finishReason")

                    yield StreamChunk(
                        content=content,
                        done=finish_reason is not None,
                        finish_reason=finish_reason,
                    )

    async def test_connection(self) -> tuple[bool, str]:
        """Test the connection to Gemini API."""
        try:
            model = self.config.model
            url = f"{self._get_base_url()}/models/{model}"

            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(
                    url,
                    params={"key": self.config.api_key},
                )
                response.raise_for_status()
                data = response.json()

            return True, f"Connection successful (model: {data.get('name', model)})"
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 400:
                try:
                    error_data = e.response.json()
                    error_msg = error_data.get("error", {}).get("message", "")
                    if "API key" in error_msg:
                        return False, "Invalid API key"
                    return False, error_msg
                except Exception:
                    pass
            return False, f"HTTP error: {e.response.status_code}"
        except Exception as e:
            return False, f"Connection failed: {str(e)}"

    async def list_models(self) -> list[str]:
        """List available Gemini models."""
        url = f"{self._get_base_url()}/models"

        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            response = await client.get(
                url,
                params={"key": self.config.api_key},
            )
            response.raise_for_status()
            data = response.json()

        models = []
        for model in data.get("models", []):
            name = model.get("name", "")
            if name.startswith("models/"):
                name = name[7:]
            models.append(name)

        return models
