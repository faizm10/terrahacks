"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, Stethoscope, AlertTriangle, ClipboardList, Lightbulb, CalendarDays, FileText } from "lucide-react"
import MedicalReport from "@/components/medical-report"
import { Report, Symptom } from "@/types/report"

interface AnalysisResult {
  session_id: string
  status: string
  duration_seconds: number
  transcript_count: number
  // Report fields
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
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        console.log(`Fetching analysis for session: ${sessionId}`)
        const response = await fetch(`http://localhost:8000/api/stream/analysis/${sessionId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Analysis not found for this session. The session may have expired.")
          } else {
            setError(`Failed to load analysis: ${response.status}`)
          }
          setLoading(false)
          return
        }
        const analysisData = await response.json()
        console.log("Analysis data received:", analysisData)
        setAnalysis(analysisData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching analysis:", err)
        setError("Failed to load analysis results")
        setLoading(false)
      }
    }
    fetchAnalysis()
  }, [sessionId])

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "outline" // Greenish tint for outline
      case "medium":
        return "secondary" // Yellowish tint for secondary
      case "high":
        return "destructive" // Red for destructive
      default:
        return "default"
    }
  }

  const getSeverityFromSymptoms = (symptoms: Symptom[]) => {
    const avgConfidence = symptoms.reduce((acc, s) => acc + s.confidence, 0) / symptoms.length
    if (avgConfidence > 0.8) return "high"
    if (avgConfidence > 0.5) return "medium"
    return "low"
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-600 mb-4">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || "Analysis results not found"}</p>
            <Button onClick={() => router.push("/stream")}>Start New Consultation</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const severity = getSeverityFromSymptoms(analysis.detectedSymptoms)
  
  const report: Report = {
    reportId: analysis.reportId,
    patientName: analysis.patientName,
    patientId: analysis.patientId,
    dateOfBirth: analysis.dateOfBirth,
    providerName: analysis.providerName,
    providerSpecialty: analysis.providerSpecialty,
    consultationDate: analysis.consultationDate,
    consultationTime: analysis.consultationTime,
    consultationType: analysis.consultationType,
    mainComplaint: analysis.mainComplaint,
    detectedSymptoms: analysis.detectedSymptoms,
    consultationSummary: analysis.consultationSummary,
    potentialDiagnoses: analysis.potentialDiagnoses,
    recommendations: analysis.recommendations,
    videoAttachmentUrl: analysis.videoAttachmentUrl,
    videoAttachmentName: analysis.videoAttachmentName
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Summary UI */}
      <div className="w-1/2 overflow-y-auto bg-[#E8E2DB]">
        <div className="min-h-full p-8 pb-24 space-y-6">
          {/* MediCare Branding */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-[#2C3E50] mb-2">MediCare</h1>
            <div className="flex justify-center items-center gap-2 text-[#5B8BDF]">
              <div className="w-8 h-8 bg-[#5B8BDF] rounded-sm flex items-center justify-center">
                <span className="text-white text-xl font-bold">+</span>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Consultation Summary</h2>
            <p className="text-[#6B7280] text-sm mb-4">Session ID: {analysis.session_id}</p>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-black text-[#5B8BDF]">{formatDuration(analysis.duration_seconds)}</div>
                <p className="text-sm text-[#6B7280] mt-1">Duration</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#5B8BDF]">{analysis.transcript_count}</div>
                <p className="text-sm text-[#6B7280] mt-1">Interactions</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#5B8BDF]">{analysis.detectedSymptoms.length}</div>
                <p className="text-sm text-[#6B7280] mt-1">Symptoms</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl p-6 space-y-6">
            {/* Chief Complaint */}
            <div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">Chief Complaint</h3>
              <p className="text-[#2C3E50] font-semibold mb-2">{analysis.mainComplaint}</p>
              <p className="text-[#6B7280] text-sm leading-relaxed">{analysis.consultationSummary}</p>
            </div>

            {/* Symptoms */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-[#2C3E50]">Detected Symptoms</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  severity === 'high' ? 'bg-red-100 text-red-600' :
                  severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {severity.toUpperCase()}
                </span>
              </div>
              <div className="space-y-2">
                {analysis.detectedSymptoms.map((symptom, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
                    <span className="text-[#2C3E50] font-medium">{symptom.name}</span>
                    <span className={`text-sm font-bold ${
                      symptom.confidence > 0.8 ? 'text-green-600' :
                      symptom.confidence > 0.5 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {(symptom.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Potential Conditions */}
            <div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">Potential Conditions</h3>
              <div className="space-y-2">
                {analysis.potentialDiagnoses.map((condition, index) => (
                  <div key={index} className="p-3 bg-[#FEF3E2] rounded-lg">
                    <span className="text-[#E97132] font-medium">• {condition}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">Recommendations</h3>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-[#E8F3FF] rounded-lg">
                    <span className="text-[#5B8BDF] font-medium">{index + 1}. {rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions - Bottom Navigation Style */}
          <div className="fixed bottom-0 left-0 w-1/2 bg-white border-t border-gray-200 p-4">
            <div className="flex gap-4 max-w-2xl mx-auto">
              <button 
                onClick={() => router.push("/stream")} 
                className="flex-1 flex flex-col items-center py-3 text-[#5B8BDF] hover:bg-[#F9FAFB] rounded-lg transition-colors"
              >
                <MessageSquare className="w-6 h-6 mb-1" />
                <span className="text-sm font-semibold">Start Consultation</span>
              </button>
              <button 
                onClick={() => window.print()} 
                className="flex-1 flex flex-col items-center py-3 text-[#5B8BDF] hover:bg-[#F9FAFB] rounded-lg transition-colors"
              >
                <FileText className="w-6 h-6 mb-1" />
                <span className="text-sm font-semibold">Print Report</span>
              </button>
              <button 
                className="flex-1 flex flex-col items-center py-3 text-[#5B8BDF] hover:bg-[#F9FAFB] rounded-lg transition-colors"
              >
                <CalendarDays className="w-6 h-6 mb-1" />
                <span className="text-sm font-semibold">Book Appointment</span>
              </button>
              <button 
                className="flex-1 flex flex-col items-center py-3 text-[#5B8BDF] hover:bg-[#F9FAFB] rounded-lg transition-colors"
              >
                <ClipboardList className="w-6 h-6 mb-1" />
                <span className="text-sm font-semibold">Medical History</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Full Medical Report */}
      <div className="w-1/2 overflow-y-auto bg-gray-100">
        <MedicalReport report={report} />
      </div>
    </div>
  )
}