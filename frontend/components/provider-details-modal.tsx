"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  PhoneIcon,
  MailIcon,
  VideoIcon,
  StarIcon,
  MapPinIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  LanguagesIcon,
} from "lucide-react"
import type { Provider } from "@/types/provider"

type ProviderDetailsModalProps = {
  provider: Provider | null
  isOpen: boolean
  onClose: () => void
}

export function ProviderDetailsModal({ provider, isOpen, onClose }: ProviderDetailsModalProps) {
  if (!provider) return null

  const handleVideoCall = () => {
    if (provider.videoCallLink) {
      window.open(provider.videoCallLink, "_blank")
    } else {
      alert("Video call link not available for this provider.")
    }
    onClose()
  }

  const handlePhoneCall = () => {
    if (provider.phone) {
      window.open(`tel:${provider.phone}`)
    } else {
      alert("Phone number not available for this provider.")
    }
    onClose()
  }

  const handleEmail = () => {
    if (provider.email) {
      window.open(`mailto:${provider.email}`)
    } else {
      alert("Email address not available for this provider.")
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white text-[var(--color-text-primary)] rounded-lg shadow-lg p-6">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6 mb-4">
            <Avatar className="w-24 h-24 mb-4 sm:mb-0">
              <AvatarImage src={provider.imageUrl || "/placeholder.svg"} alt={`${provider.name}'s avatar`} />
              <AvatarFallback>
                {provider.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <DialogTitle className="text-3xl font-bold text-[var(--color-text-primary)]">{provider.name}</DialogTitle>
              <DialogDescription className="text-lg text-[var(--color-accent)] font-medium mb-2">
                {provider.specialty}
              </DialogDescription>
              <div className="flex items-center justify-center sm:justify-start text-sm text-[var(--color-text-secondary)] mb-1">
                <StarIcon className="w-4 h-4 text-[var(--color-stars)] fill-[var(--color-stars)] mr-1" />
                {provider.rating.toFixed(1)} ({Math.floor(provider.rating * 20)} reviews)
              </div>
              <div className="flex items-center justify-center sm:justify-start text-sm text-[var(--color-text-secondary)]">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {provider.location}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p className="text-[var(--color-text-primary)] text-base leading-relaxed">{provider.bio}</p>

          {provider.experience && (
            <div className="flex items-start gap-2 text-[var(--color-text-secondary)]">
              <BriefcaseIcon className="h-5 w-5 flex-shrink-0 mt-1" />
              <p>
                <span className="font-semibold">Experience:</span> {provider.experience}
              </p>
            </div>
          )}

          {provider.education && (
            <div className="flex items-start gap-2 text-[var(--color-text-secondary)]">
              <GraduationCapIcon className="h-5 w-5 flex-shrink-0 mt-1" />
              <p>
                <span className="font-semibold">Education:</span> {provider.education}
              </p>
            </div>
          )}

          {provider.languages && provider.languages.length > 0 && (
            <div className="flex items-start gap-2 text-[var(--color-text-secondary)]">
              <LanguagesIcon className="h-5 w-5 flex-shrink-0 mt-1" />
              <p>
                <span className="font-semibold">Languages:</span> {provider.languages.join(", ")}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center sm:justify-end">
          <Button
            onClick={handleVideoCall}
            disabled={!provider.available || !provider.videoCallLink}
            className="bg-[var(--color-accent)] text-white hover:bg-opacity-90 transition-colors duration-200 rounded-radius-button px-6 py-2 flex items-center gap-2"
          >
            <VideoIcon className="h-5 w-5" />
            Start Video Call
          </Button>
          <Button
            onClick={handlePhoneCall}
            disabled={!provider.phone}
            variant="outline"
            className="border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors duration-200 rounded-radius-button px-6 py-2 flex items-center gap-2 bg-transparent"
          >
            <PhoneIcon className="h-5 w-5" />
            Call
          </Button>
          <Button
            onClick={handleEmail}
            disabled={!provider.email}
            variant="outline"
            className="border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors duration-200 rounded-radius-button px-6 py-2 flex items-center gap-2 bg-transparent"
          >
            <MailIcon className="h-5 w-5" />
            Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
