"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, Stethoscope, AlertTriangle, ClipboardList, Lightbulb, CalendarDays } from "lucide-react"

interface AnalysisResult {
  session_id: string
  status: string
  duration_seconds: number
  transcript_count: number
  symptoms: string[]
  severity: string
  potential_conditions: string[]
  recommendations: string
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Report Header */}
        <Card className="p-6 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              Health Consultation Report
            </CardTitle>
            <p className="text-gray-600 text-sm">Session ID: {analysis.session_id}</p>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Date: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>

        {/* Session Summary */}
        <Card className="p-6 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border border-blue-200 p-4 flex flex-col items-center text-center">
                <Clock className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-blue-900">Duration</h3>
                <p className="text-2xl font-bold text-blue-600">{formatDuration(analysis.duration_seconds)}</p>
              </Card>
              <Card className="bg-green-50 border border-green-200 p-4 flex flex-col items-center text-center">
                <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-green-900">Interactions</h3>
                <p className="text-2xl font-bold text-green-600">{analysis.transcript_count}</p>
              </Card>
              <Card className="bg-purple-50 border border-purple-200 p-4 flex flex-col items-center text-center">
                <Stethoscope className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-purple-900">Symptoms Found</h3>
                <p className="text-2xl font-bold text-purple-600">{analysis.symptoms.length}</p>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms Analysis */}
        <Card className="p-6 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-gray-600" />
              Symptoms Identified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-base font-medium text-gray-700">Severity Level:</span>
              <Badge variant={getSeverityVariant(analysis.severity)}>
                {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
              </Badge>
            </div>
            <ul className="space-y-2">
              {analysis.symptoms.map((symptom, index) => (
                <li key={index} className="bg-gray-50 rounded-md p-3 flex items-center gap-2 text-gray-800">
                  <span className="text-blue-500">•</span> {symptom}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Potential Conditions */}
        <Card className="p-6 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-gray-600" />
              Potential Conditions to Investigate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.potential_conditions.map((condition, index) => (
                <li
                  key={index}
                  className="bg-orange-50 border border-orange-200 rounded-md p-3 flex items-center gap-2 text-orange-800"
                >
                  <span className="text-orange-500">•</span> {condition}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-gray-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800">{analysis.recommendations}</p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-yellow-50 border border-yellow-200 p-6 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="font-semibold text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-700" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 text-sm">
              This analysis is for informational purposes only and should not be considered as medical advice. Please
              consult with a qualified healthcare professional for proper diagnosis and treatment.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-end">
          <Button onClick={() => router.push("/stream")} className="px-6 py-2">
            Start New Consultation
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="px-6 py-2">
            Print Report
          </Button>
        </div>
      </div>
    </div>
  )
}
