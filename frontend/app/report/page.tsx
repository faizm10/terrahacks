"use client";

import MedicalReport from "@/components/medical-report";
import { mockReport } from "@/types/report";

export default function MedicalReportPage() {
  const report = mockReport; // Using mock data for demonstration

  return <MedicalReport report={report} />;
}