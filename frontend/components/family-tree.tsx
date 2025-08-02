import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, CalendarIcon, GroupIcon as GenderIcon } from "lucide-react"
import { FamilyMemberNodeComponent } from "@/components/family-member-node"
import type { PatientNode } from "@/types/family-tree"

type FamilyTreeProps = {
  patient: PatientNode
}

export function FamilyTree({ patient }: FamilyTreeProps) {
  return (
    <div className="space-y-6">
      {/* Patient (User) Node */}
      <Card className="bg-white shadow-card rounded-lg p-6 border-2 border-[var(--color-accent)]">
        <CardHeader className="p-0 pb-4 flex flex-row items-center gap-3 border-b border-gray-200 mb-4">
          <UserIcon className="h-8 w-8 text-[var(--color-accent)]" />
          <CardTitle className="text-2xl font-bold text-[var(--color-text-primary)]">
            {patient.fullName} (You)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          {patient.age && (
            <p className="text-base text-[var(--color-text-secondary)] flex items-center gap-1">
              <CalendarIcon className="h-5 w-5" />
              <span className="font-medium">Age:</span> {patient.age}
            </p>
          )}
          {patient.gender && (
            <p className="text-base text-[var(--color-text-secondary)] flex items-center gap-1">
              <GenderIcon className="h-5 w-5" />
              <span className="font-medium">Gender:</span> {patient.gender}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Family Members */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">Your Family History</h2>
        <div className="space-y-4">
          {patient.familyTree.map((member) => (
            <FamilyMemberNodeComponent key={member.id} member={member} level={0} />
          ))}
        </div>
      </div>
    </div>
  )
}
