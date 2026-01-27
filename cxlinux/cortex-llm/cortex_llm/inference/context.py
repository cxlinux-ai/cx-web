"""Context management for conversations."""

from dataclasses import dataclass, field
from typing import Literal


@dataclass
class Message:
    """A chat message."""

    role: Literal["system", "user", "assistant"]
    content: str


@dataclass
class ContextManager:
    """Manages conversation context and history."""

    system_prompt: str = "You are a helpful AI assistant."
    max_history: int = 20
    messages: list[Message] = field(default_factory=list)

    def add_message(self, role: Literal["system", "user", "assistant"], content: str) -> None:
        """Add a message to the conversation."""
        self.messages.append(Message(role=role, content=content))

        # Trim history if needed (keep system prompt)
        if len(self.messages) > self.max_history:
            # Keep first message if it's system, then trim old messages
            if self.messages and self.messages[0].role == "system":
                self.messages = [self.messages[0]] + self.messages[-(self.max_history - 1):]
            else:
                self.messages = self.messages[-self.max_history:]

    def add_user_message(self, content: str) -> None:
        """Add a user message."""
        self.add_message("user", content)

    def add_assistant_message(self, content: str) -> None:
        """Add an assistant message."""
        self.add_message("assistant", content)

    def set_system_prompt(self, prompt: str) -> None:
        """Set the system prompt."""
        self.system_prompt = prompt
        # Update or insert system message
        if self.messages and self.messages[0].role == "system":
            self.messages[0].content = prompt
        else:
            self.messages.insert(0, Message(role="system", content=prompt))

    def get_messages(self) -> list[dict[str, str]]:
        """Get messages in chat completion format."""
        messages = []

        # Always include system prompt first
        messages.append({"role": "system", "content": self.system_prompt})

        # Add conversation history (skip system if already in messages)
        for msg in self.messages:
            if msg.role == "system":
                continue
            messages.append({"role": msg.role, "content": msg.content})

        return messages

    def clear(self) -> None:
        """Clear conversation history."""
        self.messages = []

    def get_last_assistant_message(self) -> str:
        """Get the last assistant response."""
        for msg in reversed(self.messages):
            if msg.role == "assistant":
                return msg.content
        return ""

    def to_prompt(self, template: str = "chatml") -> str:
        """Convert messages to a prompt string."""
        if template == "chatml":
            return self._to_chatml()
        elif template == "llama":
            return self._to_llama()
        elif template == "alpaca":
            return self._to_alpaca()
        else:
            return self._to_simple()

    def _to_chatml(self) -> str:
        """Convert to ChatML format."""
        parts = []
        for msg in self.get_messages():
            parts.append(f"<|im_start|>{msg['role']}\n{msg['content']}<|im_end|>")
        parts.append("<|im_start|>assistant\n")
        return "\n".join(parts)

    def _to_llama(self) -> str:
        """Convert to Llama chat format."""
        parts = []
        messages = self.get_messages()

        for i, msg in enumerate(messages):
            if msg["role"] == "system":
                parts.append(f"<<SYS>>\n{msg['content']}\n<</SYS>>")
            elif msg["role"] == "user":
                if i == 0 or messages[i - 1]["role"] == "system":
                    parts.append(f"[INST] {msg['content']} [/INST]")
                else:
                    parts.append(f"[INST] {msg['content']} [/INST]")
            elif msg["role"] == "assistant":
                parts.append(f" {msg['content']} </s>")

        return "".join(parts)

    def _to_alpaca(self) -> str:
        """Convert to Alpaca format."""
        parts = []
        messages = self.get_messages()

        for msg in messages:
            if msg["role"] == "system":
                parts.append(f"### System:\n{msg['content']}\n")
            elif msg["role"] == "user":
                parts.append(f"### User:\n{msg['content']}\n")
            elif msg["role"] == "assistant":
                parts.append(f"### Assistant:\n{msg['content']}\n")

        parts.append("### Assistant:\n")
        return "\n".join(parts)

    def _to_simple(self) -> str:
        """Convert to simple format."""
        parts = []
        messages = self.get_messages()

        for msg in messages:
            role = msg["role"].capitalize()
            parts.append(f"{role}: {msg['content']}")

        parts.append("Assistant:")
        return "\n\n".join(parts)
