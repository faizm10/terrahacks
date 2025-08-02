"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProviderCard } from "@/components/provider-card"
import { SpecialtyFilter } from "@/components/specialty-filter"
import { SearchInput } from "@/components/search-input"
import { ProviderDetailsModal } from "@/components/provider-details-modal" // New import
import { mockProviders, specialties, type Provider } from "@/types/provider" // Import Provider type
export default function FindProviderPage() {
  const router = useRouter()
  const [selectedSpecialty, setSelectedSpecialty] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false) // New state for modal
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null) // New state for selected provider

  const filteredProviders = useMemo(() => {
    let filtered = mockProviders

    if (selectedSpecialty !== "All") {
      filtered = filtered.filter((provider) => provider.specialty === selectedSpecialty)
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (provider) =>
          provider.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          provider.location.toLowerCase().includes(lowerCaseSearchTerm) ||
          provider.specialty.toLowerCase().includes(lowerCaseSearchTerm), // Also search by specialty
      )
    }

    return filtered
  }, [selectedSpecialty, searchTerm])

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProvider(null)
  }

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
            Find a Provider
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <SpecialtyFilter specialties={specialties} onSelectSpecialty={setSelectedSpecialty} />
          <SearchInput onSearch={setSearchTerm} placeholder="Search by name, location, or specialty..." />
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} onViewDetails={handleViewDetails} />
            ))
          ) : (
            <p className="col-span-full text-center text-[var(--color-text-secondary)] text-lg">
              No providers found matching your criteria.
            </p>
          )}
        </div>
      </div>

      {selectedProvider && (
        <ProviderDetailsModal provider={selectedProvider} isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  )
}
