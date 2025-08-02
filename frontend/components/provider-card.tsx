"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StarIcon } from "lucide-react"
import type { Provider } from "@/types/provider"

type ProviderCardProps = {
  provider: Provider
  onViewDetails: (provider: Provider) => void // Changed prop name
}

export function ProviderCard({ provider, onViewDetails }: ProviderCardProps) {
  return (
    <Card
      className="flex flex-col sm:flex-row items-center p-4 bg-white shadow-card rounded-lg transition-all hover:shadow-lg cursor-pointer"
      onClick={() => onViewDetails(provider)} // Make the whole card clickable
    >
      <Avatar className="w-20 h-20 mb-4 sm:mb-0 sm:mr-6">
        <AvatarImage src={provider.imageUrl || "/placeholder.svg"} alt={`${provider.name}'s avatar`} />
        <AvatarFallback>
          {provider.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <CardContent className="flex-1 p-0 text-center sm:text-left">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">{provider.name}</h3>
        <p className="text-sm text-[var(--color-accent)] font-medium mb-2">{provider.specialty}</p>
        <div className="flex items-center justify-center sm:justify-start mb-2">
          <StarIcon className="w-4 h-4 text-[var(--color-stars)] fill-[var(--color-stars)] mr-1" />
          <span className="text-sm text-[var(--color-text-secondary)]">
            {provider.rating.toFixed(1)} ({Math.floor(provider.rating * 20)} reviews)
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">{provider.bio}</p>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">Location: {provider.location}</p>
        {/* The button below is now primarily for visual indication, the card click handles the modal */}
        <Button
          onClick={(e) => {
            e.stopPropagation() // Prevent card click from firing again
            onViewDetails(provider)
          }}
          disabled={!provider.available}
          className="w-full sm:w-auto bg-[var(--color-accent)] text-white hover:bg-opacity-90 transition-colors duration-200 rounded-radius-button px-6 py-2"
        >
          {provider.available ? "View Details" : "Not Available"}
        </Button>
      </CardContent>
    </Card>
  )
}
