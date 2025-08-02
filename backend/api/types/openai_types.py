from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class Message:
    role: str
    content: str


@dataclass
class ChatCompletionRequest:
    messages: List[Message]
    model: str = "gpt-4"
    temperature: Optional[float] = 1.0
    max_tokens: Optional[int] = None


@dataclass
class Choice:
    index: int
    message: Message
    finish_reason: str


@dataclass
class Usage:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


@dataclass
class ChatCompletionResponse:
    id: str
    object: str
    created: int
    model: str
    choices: List[Choice]
    usage: Usage