"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  const [currentPage, setCurrentPage] = useState(1)

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
    <div className="relative">
      <MedicalReport report={report} currentPage={currentPage} />
      
      {/* Left Arrow - Previous Page */}
      {currentPage > 1 && (
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-white border border-gray-300 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {/* Right Arrow - Next Page */}
      {currentPage < 2 && (
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white border border-gray-300 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}