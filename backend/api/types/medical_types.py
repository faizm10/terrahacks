from dataclasses import dataclass
from typing import List, Optional
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


class Symptom(BaseModel):
    name: str
    confidence: float  # 0.0 to 1.0
    timestamp: Optional[str] = ""  # e.g., "00:15"
    labelColor: Optional[str] = "green"  # "green" | "yellow" | "red"


class FinishConversationResponse(BaseModel):
    # Session metadata
    session_id: str
    status: str
    duration_seconds: float
    transcript_count: int
    
    # Report fields matching frontend Report type
    reportId: str
    patientName: str
    patientId: str
    dateOfBirth: str
    providerName: str
    providerSpecialty: str
    consultationDate: str
    consultationTime: str
    consultationType: str
    mainComplaint: str
    detectedSymptoms: List[Symptom]
    consultationSummary: str
    potentialDiagnoses: List[str]
    recommendations: List[str]
    videoAttachmentUrl: str
    videoAttachmentName: str