"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SpecialtyFilterProps = {
  specialties: string[]
  onSelectSpecialty: (specialty: string) => void
  defaultValue?: string
}

export function SpecialtyFilter({ specialties, onSelectSpecialty, defaultValue = "All" }: SpecialtyFilterProps) {
  return (
    <Select onValueChange={onSelectSpecialty} defaultValue={defaultValue}>
      <SelectTrigger className="w-full sm:w-[180px] bg-white text-[var(--color-text-primary)] border-gray-300 rounded-radius-button">
        <SelectValue placeholder="Select Specialty" />
      </SelectTrigger>
      <SelectContent className="bg-white text-[var(--color-text-primary)]">
        {specialties.map((specialty) => (
          <SelectItem key={specialty} value={specialty}>
            {specialty}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
