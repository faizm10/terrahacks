"use client";

import { mockReport } from "@/types/report";

export default function MedicalReportPage() {
  const report = mockReport; // Using mock data for demonstration

  // Helper to safely get parts of the patient name
  const getPatientNamePart = (part: "first" | "last") => {
    const nameParts = report.patientName.split(" ");
    if (part === "first") return nameParts[0] || "";
    if (part === "last") return nameParts.slice(1).join(" ") || "";
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-8">
      <div className="w-[8.5in] h-[11in] bg-white border border-gray-300 shadow-lg relative overflow-hidden text-black text-[10px] font-sans">
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
                  {report.detectedSymptoms.join(", ") || "No specific symptoms reported"}
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
                  Stress-related symptoms, mild anxiety, environmental factors
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
                  Monitor symptoms, maintain current activities, stress management
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Lifestyle Modifications:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  Regular exercise, stress reduction techniques, adequate sleep
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Follow-up Plan:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  Re-evaluate in 2-4 weeks if symptoms persist or worsen
                </div>
              </div>
              <div>
                <span className="font-medium">When to Seek Further Care:</span>
                <div className="border-b border-black mt-1 min-h-[1.5rem] flex items-center px-1">
                  If symptoms worsen, new symptoms develop, or daily activities are affected
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
        <div className="relative z-20 flex justify-between items-end px-6 py-4 text-[8px] mt-4">
          <span>AI Medical Consultation Report - {report.reportId}</span>
          <span>Generated by AI-Powered Medical System</span>
        </div>
      </div>
    </div>
  );
}
