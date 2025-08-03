"use client";

import { useState, useCallback } from "react";
import { Report, Symptom } from "@/types/report";

interface MedicalReportProps {
  report: Report;
}

// Editable input component with PDF-like styling (moved outside to prevent re-creation)
const EditableField = ({ 
  value, 
  onChange, 
  className = "", 
  multiline = false,
  placeholder = "",
  fieldKey = ""
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  fieldKey?: string;
}) => {
  if (multiline) {
    return (
      <textarea
        key={fieldKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-blue-50 border-blue-300 focus:border-blue-500 focus:bg-blue-100 outline-none px-1 py-0.5 resize-none ${className}`}
        placeholder={placeholder}
        rows={2}
      />
    );
  }
  
  return (
    <input
      key={fieldKey}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-blue-50 border-blue-300 focus:border-blue-500 focus:bg-blue-100 outline-none px-1 py-0.5 ${className}`}
      placeholder={placeholder}
    />
  );
};

export default function MedicalReport({ report }: MedicalReportProps) {
  // State for editable fields
  const [editableReport, setEditableReport] = useState<Report>(report);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // Helper to safely get parts of the patient name
  const getPatientNamePart = (part: "first" | "last") => {
    const nameParts = editableReport.patientName.split(" ");
    if (part === "first") return nameParts[0] || "";
    if (part === "last") return nameParts.slice(1).join(" ") || "";
    return "";
  };

  // Handle field updates (memoized to prevent re-renders)
  const updateField = useCallback((field: keyof Report, value: any) => {
    setEditableReport(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle patient name updates (memoized)
  const updatePatientName = useCallback((part: "first" | "last", value: string) => {
    setEditableReport(prev => {
      const currentParts = prev.patientName.split(" ");
      if (part === "first") {
        const lastName = currentParts.slice(1).join(" ");
        return { ...prev, patientName: `${value} ${lastName}`.trim() };
      } else {
        const firstName = currentParts[0] || "";
        return { ...prev, patientName: `${firstName} ${value}`.trim() };
      }
    });
  }, []);

  // Handle symptoms updates (memoized)
  const updateSymptoms = useCallback((value: string) => {
    const symptoms = value.split(",").map(name => ({
      name: name.trim(),
      confidence: 0.5,
      timestamp: "",
      labelColor: "yellow" as const
    }));
    setEditableReport(prev => ({ ...prev, detectedSymptoms: symptoms }));
  }, []);

  // Handle recommendations updates (memoized)
  const updateRecommendation = useCallback((index: number, value: string) => {
    setEditableReport(prev => {
      const newRecommendations = [...prev.recommendations];
      newRecommendations[index] = value;
      return { ...prev, recommendations: newRecommendations };
    });
  }, []);

  // Save function
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Here you would typically send the data to your backend
      // For now, we'll just simulate saving to localStorage
      localStorage.setItem(`medical-report-${editableReport.reportId}`, JSON.stringify(editableReport));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save report:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center overflow-hidden">
      <div className="w-full max-w-[8.5in] bg-white border border-gray-300 shadow-lg relative text-black text-[10px] font-sans my-4 mx-4 overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="relative z-20 p-6 pb-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col items-start">
              <h1 className="text-lg font-bold mb-2">
                Medical Consultation Report – Patient Assessment
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-[8px] font-medium leading-tight">
                  <span>AI-Powered Medical</span>
                  <span>Consultation System</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-center mb-4">
            MEDICAL CONSULTATION REPORT
            <br />
            PATIENT ASSESSMENT SUMMARY
          </h2>
        </div>

        {/* Form Sections */}
        <div className="relative z-20 px-6 space-y-4">
          {/* PATIENT INFORMATION */}
          <div className="border border-black">
            <div className="bg-gray-200 p-1 font-bold text-[9px] border-b border-black">
              PATIENT INFORMATION
            </div>
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1 border-r border-black">
                <span className="font-medium">Family name</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value={getPatientNamePart("last")}
                    onChange={(value) => updatePatientName("last", value)}
                    placeholder="Last name"
                    fieldKey="patient-last-name"
                  />
                </div>
              </div>
              <div className="p-1">
                <span className="font-medium">Given name(s)</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value={getPatientNamePart("first")}
                    onChange={(value) => updatePatientName("first", value)}
                    placeholder="First name"
                    fieldKey="patient-first-name"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 border-b border-black">
              <div className="p-1 border-r border-black">
                <span className="font-medium">Date of Birth</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value={editableReport.dateOfBirth}
                    onChange={(value) => updateField("dateOfBirth", value)}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>
              <div className="p-1 border-r border-black">
                <span className="font-medium">Consultation Date</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value={editableReport.consultationDate}
                    onChange={(value) => updateField("consultationDate", value)}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>
              <div className="p-1">
                <span className="font-medium">Report ID</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value={editableReport.reportId}
                    onChange={(value) => updateField("reportId", value)}
                    placeholder="Report ID"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SYMPTOMS ASSESSMENT */}
          <div className="border border-black">
            <div className="bg-gray-200 p-1 font-bold text-[9px] border-b border-black">
              SYMPTOMS ASSESSMENT
            </div>
            <div className="p-2">
              <div className="mb-2">
                <span className="font-medium">Primary Symptoms:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value={editableReport.detectedSymptoms.map(s => s.name).join(", ") || "No specific symptoms reported"}
                    onChange={updateSymptoms}
                    placeholder="Enter symptoms separated by commas"
                    fieldKey="symptoms-list"
                  />
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Symptom Description:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value={editableReport.consultationSummary}
                    onChange={(value) => updateField("consultationSummary", value)}
                    placeholder="Symptom description"
                    multiline
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Onset Pattern:</span>
                  <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                    <EditableField
                      value="Gradual onset"
                      onChange={(value) => {
                        // You can add a new field to the report state if needed
                        console.log('Onset pattern updated:', value);
                      }}
                      placeholder="Onset pattern"
                    />
                  </div>
                </div>
                <div>
                  <span className="font-medium">Triggers:</span>
                  <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                    <EditableField
                      value="Stress, environmental factors"
                      onChange={(value) => {
                        // You can add a new field to the report state if needed
                        console.log('Triggers updated:', value);
                      }}
                      placeholder="Triggers"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CLINICAL STATUS */}
          <div className="border border-black">
            <div className="bg-gray-200 p-1 font-bold text-[9px] border-b border-black">
              CLINICAL STATUS
            </div>
            <div className="grid grid-cols-2 p-2 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="border border-black w-4 h-4 flex-shrink-0"></div>
                <span>Stable - No immediate medical intervention required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="border border-black w-4 h-4 flex-shrink-0"></div>
                <span>Requires follow-up monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="border border-black w-4 h-4 flex-shrink-0"></div>
                <span>Mild symptoms present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="border border-black w-4 h-4 flex-shrink-0"></div>
                <span>No acute distress</span>
              </div>
            </div>
          </div>

          {/* DURATION AND SEVERITY */}
          <div className="border border-black">
            <div className="bg-gray-200 p-1 font-bold text-[9px] border-b border-black">
              DURATION AND SEVERITY
            </div>
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1 border-r border-black">
                <span className="font-medium">Duration of Symptoms</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  2-4 weeks
                </div>
              </div>
              <div className="p-1">
                <span className="font-medium">Severity Level</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  Mild to Moderate
                </div>
              </div>
            </div>
            <div className="p-2">
              <span className="font-medium">Severity Assessment:</span>
              <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                Symptoms are manageable and do not significantly impact daily activities
              </div>
            </div>
          </div>

          {/* POTENTIAL CONSIDERATIONS */}
          <div className="border border-black">
            <div className="bg-gray-200 p-1 font-bold text-[9px] border-b border-black">
              POTENTIAL CONSIDERATIONS
            </div>
            <div className="p-2">
              <div className="mb-2">
                <span className="font-medium">Differential Diagnoses:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {editableReport.potentialDiagnoses.join(", ") || "Stress-related symptoms, mild anxiety, environmental factors"}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Risk Factors Identified:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  Stress, lifestyle factors, potential environmental triggers
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Red Flags (if any):</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  None identified during this consultation
                </div>
              </div>
              <div>
                <span className="font-medium">Additional Considerations:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  Monitor for symptom progression, consider lifestyle modifications
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div className="border border-black">
            <div className="bg-gray-200 p-1 font-bold text-[9px] border-b border-black">
              RECOMMENDATIONS
            </div>
            <div className="p-2">
              <div className="mb-2">
                <span className="font-medium">Immediate Actions:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {editableReport.recommendations[0] || "Monitor symptoms, maintain current activities, stress management"}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Lifestyle Modifications:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {editableReport.recommendations[1] || "Regular exercise, stress reduction techniques, adequate sleep"}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Follow-up Plan:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {editableReport.recommendations[2] || "Re-evaluate in 2-4 weeks if symptoms persist or worsen"}
                </div>
              </div>
              <div>
                <span className="font-medium">When to Seek Further Care:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {editableReport.recommendations[3] || "If symptoms worsen, new symptoms develop, or daily activities are affected"}
                </div>
              </div>
            </div>
          </div>

          {/* ATTACHMENTS */}
          <div className="border border-black">
            <div className="bg-gray-200 p-1 font-bold text-[9px] border-b border-black">
              ATTACHMENTS
            </div>
            <div className="p-2">
              <div className="mb-2">
                <span className="font-medium">Chat History:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value="Patient-AI conversation transcript available (45 exchanges, 12 min duration)"
                    onChange={(value) => {
                      console.log('Chat history updated:', value);
                    }}
                    placeholder="Chat history details"
                  />
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Patient's Medical History:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value="Previous consultations: 3 records, Last visit: 2024-01-15, Chronic conditions: None reported"
                    onChange={(value) => {
                      console.log('Patient history updated:', value);
                    }}
                    placeholder="Patient medical history"
                    multiline
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Video Recording:</span>
                  <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                    <EditableField
                      value="consultation_20241203_1445.mp4 (720p, 12:34 duration)"
                      onChange={(value) => {
                        console.log('Video recording updated:', value);
                      }}
                      placeholder="Video file details"
                    />
                  </div>
                </div>
                <div>
                  <span className="font-medium">Audio Recording:</span>
                  <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                    <EditableField
                      value="consultation_20241203_1445.wav (16kHz, 12:34 duration)"
                      onChange={(value) => {
                        console.log('Audio recording updated:', value);
                      }}
                      placeholder="Audio file details"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <span className="font-medium">Additional Files:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  <EditableField
                    value="Lab results: pending, Imaging: none, Referral documents: none"
                    onChange={(value) => {
                      console.log('Additional files updated:', value);
                    }}
                    placeholder="Additional attachments"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI PHYSICIAN DECLARATION */}
          <div className="border border-black">
            <div className="bg-gray-200 p-1 font-bold text-[9px] border-b border-black">
              AI PHYSICIAN DECLARATION
            </div>
            <div className="p-2">
              <div className="mb-2">
                <span className="font-medium">Assessment Confidence Level:</span>
                <div className="flex gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="border border-black w-4 h-4 flex-shrink-0"></div>
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="border border-black w-4 h-4 flex-shrink-0"></div>
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="border border-black w-4 h-4 flex-shrink-0"></div>
                    <span>Low</span>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Limitations of AI Assessment:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  This assessment is based on reported symptoms and may not capture all clinical nuances
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Recommendation for In-Person Evaluation:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  Consider in-person evaluation if symptoms persist or worsen
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-black">
              <div className="p-1 border-r border-black">
                <span className="font-medium">AI System</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {editableReport.providerName}
                </div>
              </div>
              <div className="p-1">
                <span className="font-medium">Report Generated</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {editableReport.consultationDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-20 flex justify-between items-end px-6 py-4 text-[8px] mt-4 mb-24">
          <span>AI Medical Consultation Report - {editableReport.reportId}</span>
          <span>Generated by AI-Powered Medical System</span>
        </div>
      </div>

      {/* Custom Liquid Glass Floating Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="liquid-glass w-[600px] h-20">
          <div className="liquid-glass-content flex items-center justify-between px-8 py-4 h-full">
            <button 
              onClick={() => window.location.href = '/stream'}
              className="flex flex-col items-center py-1 w-20 text-gray-700 hover:text-blue-600"
            >
              <div className="w-5 h-5 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-center">Consultation</span>
            </button>

            <button 
              onClick={() => window.open('tel:+1234567890')}
              className="flex flex-col items-center py-1 w-20 text-gray-700 hover:text-blue-600"
            >
              <div className="w-5 h-5 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-center">Appointment</span>
            </button>

            <button 
              onClick={() => window.location.href = '/history'}
              className="flex flex-col items-center py-1 w-20 text-gray-700 hover:text-blue-600"
            >
              <div className="w-5 h-5 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-center">History</span>
            </button>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`flex flex-col items-center py-1 w-20 ${
                saveStatus === 'saved' ? 'text-green-600' : 
                saveStatus === 'error' ? 'text-red-600' : 
                'text-gray-700 hover:text-blue-600'
              }`}
            >
              <div className="w-5 h-5 mb-1 flex items-center justify-center">
                {isSaving ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : saveStatus === 'saved' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium text-center">
                {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save'}
              </span>
            </button>

            <button 
              onClick={() => window.print()}
              className="flex flex-col items-center py-1 w-20 text-gray-700 hover:text-blue-600"
            >
              <div className="w-5 h-5 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-center">Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}