'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface AnalysisResult {
  session_id: string;
  status: string;
  duration_seconds: number;
  transcript_count: number;
  symptoms: string[];
  severity: string;
  potential_conditions: string[];
  recommendations: string;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        console.log(`Fetching analysis for session: ${sessionId}`);
        
        const response = await fetch(`http://localhost:8000/api/stream/analysis/${sessionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Analysis not found for this session. The session may have expired.');
          } else {
            setError(`Failed to load analysis: ${response.status}`);
          }
          setLoading(false);
          return;
        }
        
        const analysisData = await response.json();
        console.log('Analysis data received:', analysisData);
        
        setAnalysis(analysisData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis results');
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [sessionId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Analysis results not found'}</p>
          <button
            onClick={() => router.push('/stream')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start New Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Consultation Results</h1>
          <p className="text-gray-600">Session: {analysis.session_id}</p>
        </div>

        {/* Session Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900">Duration</h3>
              <p className="text-2xl font-bold text-blue-600">{formatDuration(analysis.duration_seconds)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900">Interactions</h3>
              <p className="text-2xl font-bold text-green-600">{analysis.transcript_count}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900">Symptoms Found</h3>
              <p className="text-2xl font-bold text-purple-600">{analysis.symptoms.length}</p>
            </div>
          </div>
        </div>

        {/* Symptoms Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Symptoms Identified</h2>
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700">Severity Level: </span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(analysis.severity)}`}>
              {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
            </span>
          </div>
          <div className="space-y-2">
            {analysis.symptoms.map((symptom, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-800">{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Potential Conditions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Potential Conditions to Investigate</h2>
          <div className="space-y-2">
            {analysis.potential_conditions.map((condition, index) => (
              <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <span className="text-orange-800">{condition}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{analysis.recommendations}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Disclaimer</h3>
          <p className="text-yellow-700 text-sm">
            This analysis is for informational purposes only and should not be considered as medical advice. 
            Please consult with a qualified healthcare professional for proper diagnosis and treatment.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/stream')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start New Consultation
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
}