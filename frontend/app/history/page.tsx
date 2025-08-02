"use client"
import type React from "react"
import { useState } from "react"
import { Timeline } from "@/components/timeline"
import { FileUpload } from "@/components/file-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

export type TimelineItem = {
  id: string
  date: string
  title: string
  description: string
  fileUrl?: string
  fileName?: string
  icon?: React.ReactNode
}

export default function MedicalHistoryPage() {
  const router = useRouter()
  const [timelineEvents, setTimelineEvents] = useState<TimelineItem[]>([
    {
      id: "1",
      date: "2023-10-26",
      title: "Annual Physical Check-up",
      description: "Routine check-up with Dr. Smith. All vitals normal. Discussed diet and exercise.",
      fileUrl: "/placeholder.svg?height=20&width=20",
      fileName: "Annual_Report_2023.pdf",
    },
    {
      id: "2",
      date: "2023-05-15",
      title: "Allergy Consultation",
      description: "Consultation for seasonal allergies. Prescribed antihistamines.",
      fileUrl: "/placeholder.svg?height=20&width=20",
      fileName: "Allergy_Prescription.pdf",
    },
    {
      id: "3",
      date: "2022-11-01",
      title: "Dental Cleaning",
      description: "Routine dental cleaning and check-up. No cavities detected.",
      fileUrl: "/placeholder.svg?height=20&width=20",
      fileName: "Dental_Report_2022.pdf",
    },
  ])

  const handleFileUpload = async (file: File) => {
    const path = `records/${Date.now()}_${file.name}`

    try {
      const { data, error: uploadError } = await supabase.storage.from("records").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Upload Error:", uploadError)
        toast.error("Upload Failed", {
          description: `Failed to upload ${file.name}. Please try again.`,
          icon: <XCircle className="h-4 w-4" />,
        })
        return
      }

      const { publicUrl, error: urlError } = supabase.storage.from("records").getPublicUrl(data.path)

      if (urlError) {
        console.error("Get public URL error:", urlError)
        toast.error("Upload Failed", {
          description: `Failed to get file URL for ${file.name}. Please try again.`,
          icon: <XCircle className="h-4 w-4" />,
        })
        return
      }

      const newEvent: TimelineItem = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        title: `Uploaded: ${file.name}`,
        description: `A new file, "${file.name}", was uploaded to your medical history.`,
        fileUrl: publicUrl,
        fileName: file.name,
      }

      setTimelineEvents((prevEvents) =>
        [newEvent, ...prevEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      )

      toast.success("Upload Successful", {
        description: `${file.name} has been successfully uploaded to your medical history.`,
        icon: <CheckCircle className="h-4 w-4" />,
      })
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("Upload Failed", {
        description: `An unexpected error occurred while uploading ${file.name}.`,
        icon: <XCircle className="h-4 w-4" />,
      })
    }
  }

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
            Your Medical History
          </h1>
        </div>

        <Card className="mb-8 bg-white shadow-card rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Upload New Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onFileUpload={handleFileUpload} />
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
              Upload medical reports, prescriptions, or any relevant health documents.
            </p>
          </CardContent>
        </Card>

        <Timeline events={timelineEvents} />
      </div>
      <Toaster />
    </div>
  )
}
