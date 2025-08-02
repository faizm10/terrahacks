"use client"

import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import type React from "react"

type SearchInputProps = {
  onSearch: (searchTerm: string) => void
  placeholder?: string
}

export function SearchInput({ onSearch, placeholder = "Search by name or location..." }: SearchInputProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value)
  }

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={handleInputChange}
        className="pl-9 pr-3 py-2 w-full bg-white text-[var(--color-text-primary)] border-gray-300 rounded-radius-button focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
      />
    </div>
  )
}
