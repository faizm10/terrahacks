"use client"

import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FamilyTree } from "@/components/family-tree"
import { mockPatientData } from "@/types/family-tree"

export default function FamilyTreePage() {
  const router = useRouter()
  const patientData = mockPatientData // Using mock data for demonstration

  return (
    <div className="min-h-screen bg-[var(--color-primary-background)] text-[var(--color-text-primary)] font-[var(--font-body)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
            Family Medical History
          </h1>
        </div>

        <FamilyTree patient={patientData} />
      </div>
    </div>
  )
}
