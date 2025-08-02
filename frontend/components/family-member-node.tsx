import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserIcon, HeartPulseIcon, CalendarIcon, SkullIcon, InfoIcon, LeafIcon, FileTextIcon } from "lucide-react"
import type { FamilyMemberNode } from "@/types/family-tree"

type FamilyMemberNodeProps = {
  member: FamilyMemberNode
  level?: number // For indentation
}

export function FamilyMemberNodeComponent({ member, level = 0 }: FamilyMemberNodeProps) {
  const indentation = level * 24 // 24px per level

  return (
    <div style={{ marginLeft: `${indentation}px` }} className="mb-4">
      <Card
        className={`bg-white shadow-card rounded-lg p-4 transition-all hover:shadow-lg ${
          member.deceased ? "opacity-70 border-gray-300" : "border-[var(--color-accent)]"
        }`}
      >
        <CardHeader className="p-0 pb-2 flex flex-row items-center gap-3">
          <UserIcon className="h-6 w-6 text-[var(--color-accent)]" />
          <CardTitle className="text-xl font-semibold text-[var(--color-text-primary)]">
            {member.fullName}
            {member.deceased && <span className="text-sm text-gray-500 ml-2">(Deceased)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2 space-y-2">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="font-medium">Relation:</span> {member.relation}
          </p>
          {member.age && (
            <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium">Age:</span> {member.age}
            </p>
          )}
          {member.deceased && member.deceasedAge && (
            <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
              <SkullIcon className="h-4 w-4" />
              <span className="font-medium">Deceased Age:</span> {member.deceasedAge}
            </p>
          )}
          {member.deceased && member.causeOfDeath && (
            <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
              <InfoIcon className="h-4 w-4" />
              <span className="font-medium">Cause of Death:</span> {member.causeOfDeath}
            </p>
          )}
          {member.lifestyle && (
            <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
              <LeafIcon className="h-4 w-4" />
              <span className="font-medium">Lifestyle:</span> {member.lifestyle}
            </p>
          )}
          {member.notes && (
            <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
              <FileTextIcon className="h-4 w-4" />
              <span className="font-medium">Notes:</span> {member.notes}
            </p>
          )}

          {member.conditions.length > 0 && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-1 flex items-center gap-1">
                <HeartPulseIcon className="h-4 w-4 text-red-500" />
                Medical Conditions:
              </h4>
              <div className="flex flex-wrap gap-2">
                {member.conditions.map((condition) => (
                  <Badge key={condition.id} className="bg-blue-100 text-blue-800 border-blue-200">
                    {condition.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recursively render children */}
      {member.children && member.children.length > 0 && (
        <div className="mt-4 border-l-2 border-gray-300 pl-4">
          {member.children.map((child) => (
            <FamilyMemberNodeComponent key={child.id} member={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
