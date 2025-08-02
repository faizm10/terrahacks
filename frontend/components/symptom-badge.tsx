import { Badge } from "@/components/ui/badge"
import type { Symptom } from "@/types/symptoms"

type SymptomBadgeProps = {
  symptom: Symptom
}

export function SymptomBadge({ symptom }: SymptomBadgeProps) {
  const getBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return "default" // Green-ish, high confidence
    if (confidence >= 0.6) return "secondary" // Yellow-ish, medium confidence
    return "destructive" // Red-ish, low confidence
  }

  const getBadgeColorClass = (labelColor?: "green" | "yellow" | "red") => {
    switch (labelColor) {
      case "green":
        return "bg-green-100 text-green-800 border-green-200"
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "red":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Badge
      variant={getBadgeVariant(symptom.confidence)}
      className={`px-3 py-1 text-sm font-medium rounded-full ${getBadgeColorClass(symptom.labelColor)}`}
    >
      {symptom.name} ({Math.round(symptom.confidence * 100)}%{symptom.timestamp && ` @ ${symptom.timestamp}`})
    </Badge>
  )
}
