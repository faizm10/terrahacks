"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  DownloadIcon,
  FileTextIcon,
  CalendarIcon,
  ClockIcon,
  StethoscopeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReportSection } from "@/components/report-section";
import { SymptomBadge } from "@/components/symptom-badge";
import { mockReport } from "@/types/report";

export default function MedicalReportPage() {
  const router = useRouter();
  const report = mockReport; // Using mock data for demonstration

  const handleDownloadReport = () => {
    // In a real application, this would trigger a PDF generation or download
    alert("Downloading report (simulated)...");
    console.log("Report data:", report);
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-background)] text-[var(--color-text-primary)] font-[var(--font-body)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="relative mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-text-primary)] hover:bg-gray-200"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Button>
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-[var(--color-text-primary)] font-[var(--font-headline)]">
            Medical Consultation Report
          </h1>
        </div>

        <Card className="bg-white shadow-card rounded-lg p-6 sm:p-8">
          <CardHeader className="pb-6 border-b border-gray-200 mb-6">
            <CardTitle className="text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
              <FileTextIcon className="h-8 w-8 text-[var(--color-accent)]" />
              Report ID: {report.reportId}
            </CardTitle>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
              Generated on {report.consultationDate} at{" "}
              {report.consultationTime}
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            <ReportSection title="Patient Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="patientName"
                    className="text-[var(--color-text-secondary)]"
                  >
                    Patient Name
                  </Label>
                  <Input
                    id="patientName"
                    value={report.patientName}
                    readOnly
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="patientId"
                    className="text-[var(--color-text-secondary)]"
                  >
                    Patient ID
                  </Label>
                  <Input
                    id="patientId"
                    value={report.patientId}
                    readOnly
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="dob"
                    className="text-[var(--color-text-secondary)]"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    value={report.dateOfBirth}
                    readOnly
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </ReportSection>

            <ReportSection title="Provider Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="providerName"
                    className="text-[var(--color-text-secondary)]"
                  >
                    Provider Name
                  </Label>
                  <Input
                    id="providerName"
                    value={report.providerName}
                    readOnly
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="providerSpecialty"
                    className="text-[var(--color-text-secondary)]"
                  >
                    Specialty
                  </Label>
                  <Input
                    id="providerSpecialty"
                    value={report.providerSpecialty}
                    readOnly
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </ReportSection>

            <ReportSection title="Consultation Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[var(--color-accent)]" />
                  <Label className="text-[var(--color-text-secondary)]">
                    Date:
                  </Label>
                  <span className="font-medium">{report.consultationDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-[var(--color-accent)]" />
                  <Label className="text-[var(--color-text-secondary)]">
                    Time:
                  </Label>
                  <span className="font-medium">{report.consultationTime}</span>
                </div>
                <div className="flex items-center gap-2 col-span-full">
                  <StethoscopeIcon className="h-5 w-5 text-[var(--color-accent)]" />
                  <Label className="text-[var(--color-text-secondary)]">
                    Type:
                  </Label>
                  <span className="font-medium">{report.consultationType}</span>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="mainComplaint"
                  className="text-[var(--color-text-secondary)]"
                >
                  Main Complaint
                </Label>
                <Textarea
                  id="mainComplaint"
                  value={report.mainComplaint}
                  readOnly
                  className="bg-gray-50 border-gray-200 min-h-[80px]"
                />
              </div>
            </ReportSection>

            <ReportSection title="Detected Symptoms & Visual Cues">
              <div className="flex flex-wrap gap-2">
                {report.detectedSymptoms.map((symptom, index) => (
                  <SymptomBadge key={index} symptom={symptom} />
                ))}
              </div>
              {report.timestampedFrames &&
                report.timestampedFrames.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-md font-medium text-[var(--color-text-primary)] mb-2">
                      Timestamped Visuals:
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {report.timestampedFrames.map((frame, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center text-center"
                        >
                          <img
                            src={frame.imageUrl || "/placeholder.svg"}
                            alt={frame.description}
                            className="w-full h-auto rounded-md object-cover mb-1 border border-gray-200"
                          />
                          <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                            {frame.time}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {frame.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </ReportSection>

            <ReportSection title="Consultation Summary">
              <Textarea
                id="consultationSummary"
                value={report.consultationSummary}
                readOnly
                className="bg-gray-50 border-gray-200 min-h-[120px]"
              />
            </ReportSection>

            <ReportSection title="Potential Diagnoses">
              <ul className="list-disc list-inside text-[var(--color-text-primary)]">
                {report.potentialDiagnoses.map((diagnosis, index) => (
                  <li key={index}>{diagnosis}</li>
                ))}
              </ul>
            </ReportSection>

            <ReportSection title="Recommendations">
              <ul className="list-decimal list-inside text-[var(--color-text-primary)]">
                {report.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </ReportSection>

            <ReportSection title="Video Attachment">
              <div className="flex flex-col items-center">
                <video
                  controls
                  className="w-full max-w-xl rounded-lg shadow-md border border-gray-200"
                >
                  <source src={report.videoAttachmentUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                  {report.videoAttachmentName}
                </p>
              </div>
            </ReportSection>

            <div className="flex justify-center mt-8">
              <Button
                onClick={handleDownloadReport}
                className="bg-[var(--color-accent)] text-white hover:bg-opacity-90 transition-colors duration-200 rounded-radius-button px-8 py-3 text-lg flex items-center gap-2"
              >
                <DownloadIcon className="h-5 w-5" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
