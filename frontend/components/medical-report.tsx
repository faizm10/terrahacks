"use client";

import { Report } from "@/types/report";

interface MedicalReportProps {
  report: Report;
}

export default function MedicalReport({ report }: MedicalReportProps) {
  // Helper to safely get parts of the patient name
  const getPatientNamePart = (part: "first" | "last") => {
    const nameParts = report.patientName.split(" ");
    if (part === "first") return nameParts[0] || "";
    if (part === "last") return nameParts.slice(1).join(" ") || "";
    return "";
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center overflow-hidden">
      <div className="w-full max-w-[8.5in] bg-white border border-gray-300 shadow-lg relative text-black text-[10px] font-sans my-4 mx-4 overflow-y-auto">
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
                  {getPatientNamePart("last")}
                </div>
              </div>
              <div className="p-1">
                <span className="font-medium">Given name(s)</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {getPatientNamePart("first")}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 border-b border-black">
              <div className="p-1 border-r border-black">
                <span className="font-medium">Date of Birth</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {report.dateOfBirth}
                </div>
              </div>
              <div className="p-1 border-r border-black">
                <span className="font-medium">Consultation Date</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {report.consultationDate}
                </div>
              </div>
              <div className="p-1">
                <span className="font-medium">Report ID</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {report.reportId}
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
                  {report.detectedSymptoms.map(s => s.name).join(", ") || "No specific symptoms reported"}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Symptom Description:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {report.consultationSummary.substring(0, 80)}...
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Onset Pattern:</span>
                  <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                    Gradual onset
                  </div>
                </div>
                <div>
                  <span className="font-medium">Triggers:</span>
                  <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                    Stress, environmental factors
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
                  {report.potentialDiagnoses.join(", ") || "Stress-related symptoms, mild anxiety, environmental factors"}
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
                  {report.recommendations[0] || "Monitor symptoms, maintain current activities, stress management"}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Lifestyle Modifications:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {report.recommendations[1] || "Regular exercise, stress reduction techniques, adequate sleep"}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Follow-up Plan:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {report.recommendations[2] || "Re-evaluate in 2-4 weeks if symptoms persist or worsen"}
                </div>
              </div>
              <div>
                <span className="font-medium">When to Seek Further Care:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {report.recommendations[3] || "If symptoms worsen, new symptoms develop, or daily activities are affected"}
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
                  {report.providerName}
                </div>
              </div>
              <div className="p-1">
                <span className="font-medium">Report Generated</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  {report.consultationDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-20 flex justify-between items-end px-6 py-4 text-[8px] mt-4 mb-20">
          <span>AI Medical Consultation Report - {report.reportId}</span>
          <span>Generated by AI-Powered Medical System</span>
        </div>
      </div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="backdrop-blur-md bg-white/80 border-t border-gray-200/50 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-center gap-8">
            <button 
              onClick={() => window.location.href = '/stream'}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Start Consultation</span>
            </button>

            <button 
              onClick={() => window.open('tel:+1234567890')}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Book Appointment</span>
            </button>

            <button 
              onClick={() => window.location.href = '/history'}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Medical History</span>
            </button>

            <button 
              onClick={() => window.print()}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Print Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}