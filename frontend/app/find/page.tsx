"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProviderCard } from "@/components/provider-card";
import { SpecialtyFilter } from "@/components/specialty-filter";
import { SearchInput } from "@/components/search-input";
import { mockProviders, specialties } from "@/types/providers";

export default function FindProviderPage() {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProviders = useMemo(() => {
    let filtered = mockProviders;

    if (selectedSpecialty !== "All") {
      filtered = filtered.filter(
        (provider) => provider.specialty === selectedSpecialty
      );
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (provider) =>
          provider.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          provider.location.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return filtered;
  }, [selectedSpecialty, searchTerm]);

  const handleConnect = (providerId: string) => {
    console.log(`Connecting with provider ID: ${providerId}`);
    // In a real application, this would initiate a video call or chat
    // For now, it's a placeholder.
    alert(`Initiating connection with provider ID: ${providerId}`);
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
            Find a Provider
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <SpecialtyFilter
            specialties={specialties}
            onSelectSpecialty={setSelectedSpecialty}
          />
          <SearchInput onSearch={setSearchTerm} />
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onConnect={handleConnect}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-[var(--color-text-secondary)] text-lg">
              No providers found matching your criteria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
