export type Symptom = {
  name: string
  confidence: number // 0.0 to 1.0
  timestamp?: string // e.g., "00:15"
  labelColor?: "green" | "yellow" | "red" // For severity/confidence indication
}

export type Report = {
  reportId: string
  patientName: string
  patientId: string
  dateOfBirth: string
  providerName: string
  providerSpecialty: string
  consultationDate: string
  consultationTime: string
  consultationType: string
  mainComplaint: string
  detectedSymptoms: Symptom[]
  consultationSummary: string
  potentialDiagnoses: string[]
  recommendations: string[]
  videoAttachmentUrl: string
  videoAttachmentName: string
  timestampedFrames?: { time: string; imageUrl: string; description: string }[]
}

export const mockReport: Report = {
  reportId: "MEDIREP-20240729-001",
  patientName: "Jane Doe",
  patientId: "JD7890123",
  dateOfBirth: "1990-03-15",
  providerName: "Dr. Emily White",
  providerSpecialty: "General Practice",
  consultationDate: "2024-07-29",
  consultationTime: "10:30 AM PST",
  consultationType: "Video Consultation",
  mainComplaint: "Persistent cough and fatigue for 5 days.",
  detectedSymptoms: [
    { name: "Dry Cough", confidence: 0.95, timestamp: "00:15", labelColor: "green" },
    { name: "Fatigue", confidence: 0.88, timestamp: "00:45", labelColor: "green" },
    { name: "Sore Throat", confidence: 0.7, timestamp: "01:20", labelColor: "yellow" },
    { name: "Mild Fever (self-reported)", confidence: 0.6, timestamp: "02:05", labelColor: "yellow" },
    { name: "Nasal Congestion", confidence: 0.55, timestamp: "02:30", labelColor: "red" },
  ],
  consultationSummary:
    "Patient presented with a 5-day history of dry cough and fatigue. Speech analysis indicated a hoarse voice. Visual analysis showed slight redness around the eyes. Patient reported mild fever and sore throat. No signs of respiratory distress observed during the video call. Advised rest and hydration.",
  potentialDiagnoses: ["Common Cold", "Viral Pharyngitis"],
  recommendations: [
    "Rest and adequate hydration.",
    "Over-the-counter pain relievers for sore throat/fever (e.g., Acetaminophen).",
    "Monitor symptoms; seek in-person consultation if symptoms worsen or new symptoms appear (e.g., difficulty breathing, high fever).",
    "Avoid close contact with others to prevent spread.",
  ],
  videoAttachmentUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Placeholder video URL
  videoAttachmentName: "Consultation_JaneDoe_20240729.mp4",
  timestampedFrames: [
    { time: "00:15", imageUrl: "/placeholder.svg?height=100&width=150", description: "Patient exhibiting dry cough" },
    { time: "00:45", imageUrl: "/placeholder.svg?height=100&width=150", description: "Signs of fatigue" },
    {
      time: "01:20",
      imageUrl: "/placeholder.svg?height=100&width=150",
      description: "Patient touching throat, indicating soreness",
    },
  ],
}
