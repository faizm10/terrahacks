import type React from "react"

type ReportSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
}

export function ReportSection({ title, children, className }: ReportSectionProps) {
  return (
    <div className={`mb-6 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 ${className}`}>
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">{title}</h2>
      <div className="grid grid-cols-1 gap-4">{children}</div>
    </div>
  )
}
