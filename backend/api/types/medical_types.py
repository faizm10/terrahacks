from dataclasses import dataclass
from typing import List
from pydantic import BaseModel


@dataclass
class SymptomAnalysis:
    symptoms: List[str]
    severity: str  # "low", "medium", "high"
    potential_conditions: List[str]
    recommendations: str


@dataclass
class ConversationSummary:
    session_id: str
    duration_seconds: float
    transcript_count: int
    analysis: SymptomAnalysis


class FinishConversationResponse(BaseModel):
    session_id: str
    status: str
    duration_seconds: float
    transcript_count: int
    symptoms: List[str]
    severity: str
    potential_conditions: List[str]
    recommendations: str