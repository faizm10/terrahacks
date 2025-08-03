from dataclasses import dataclass
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


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


class MedicalHistory(BaseModel):
    conditions: List[str] = []
    allergies: List[str] = []
    medications: List[str] = []
    family_history: List[str] = []
    surgeries: List[str] = []
    notes: Optional[str] = ""


class UserProfile(BaseModel):
    user_id: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    medical_history: MedicalHistory
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateUserProfileRequest(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    medical_history: MedicalHistory


class UpdateUserProfileRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    medical_history: Optional[MedicalHistory] = None


class FinishConversationRequest(BaseModel):
    user_id: Optional[str] = None


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