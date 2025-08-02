// Represents a medical condition
export type Condition = {
  id: string
  name: string
  description?: string
}

// Represents a family member in the tree
export type FamilyMemberNode = {
  id: string
  fullName: string
  relation: string // e.g., "Mother", "Father", "Sibling", "Child"
  age?: number
  deceased?: boolean
  deceasedAge?: number
  causeOfDeath?: string
  lifestyle?: string
  notes?: string
  conditions: Condition[] // Medical conditions associated with this member
  children?: FamilyMemberNode[] // Nested children for hierarchical display
}

// Represents the patient (user) at the root of the tree
export type PatientNode = {
  id: string
  fullName: string
  age?: number
  gender?: string
  familyTree: FamilyMemberNode[] // Direct family members of the patient
}

// --- Mock Data ---
const mockConditions: Condition[] = [
  { id: "c1", name: "Hypertension", description: "High blood pressure" },
  { id: "c2", name: "Type 2 Diabetes", description: "Chronic condition affecting blood sugar regulation" },
  { id: "c3", name: "Asthma", description: "Chronic respiratory condition" },
  { id: "c4", name: "Heart Disease", description: "Conditions affecting the heart" },
  { id: "c5", name: "Allergies", description: "Immune system reaction to substances" },
  { id: "c6", name: "Migraines", description: "Severe headaches" },
  { id: "c7", name: "Arthritis", description: "Joint inflammation" },
  { id: "c8", name: "Cancer (Colon)", description: "Malignant tumor in the colon" },
  { id: "c9", name: "Depression", description: "Mood disorder causing persistent sadness" },
]

export const mockPatientData: PatientNode = {
  id: "p1",
  fullName: "Alex Johnson",
  age: 35,
  gender: "Male",
  familyTree: [
    {
      id: "fm1",
      fullName: "Robert Johnson",
      relation: "Father",
      age: 65,
      deceased: false,
      lifestyle: "Active, non-smoker",
      conditions: [mockConditions[0], mockConditions[1]], // Hypertension, Type 2 Diabetes
      children: [],
    },
    {
      id: "fm2",
      fullName: "Maria Johnson",
      relation: "Mother",
      age: 62,
      deceased: false,
      lifestyle: "Healthy diet, occasional exercise",
      conditions: [mockConditions[4], mockConditions[6]], // Allergies, Arthritis
      children: [],
    },
    {
      id: "fm3",
      fullName: "Sarah Johnson",
      relation: "Sister",
      age: 38,
      deceased: false,
      lifestyle: "Sedentary, occasional alcohol",
      conditions: [mockConditions[5]], // Migraines
      children: [
        {
          id: "fm4",
          fullName: "Liam Smith",
          relation: "Nephew",
          age: 10,
          deceased: false,
          conditions: [mockConditions[2]], // Asthma
          children: [],
        },
      ],
    },
    {
      id: "fm5",
      fullName: "David Johnson",
      relation: "Brother",
      age: 32,
      deceased: false,
      lifestyle: "Athlete, healthy",
      conditions: [],
      children: [],
    },
    {
      id: "fm6",
      fullName: "Grandfather (Paternal)",
      relation: "Grandfather",
      deceased: true,
      deceasedAge: 78,
      causeOfDeath: "Heart Attack",
      conditions: [mockConditions[0], mockConditions[3]], // Hypertension, Heart Disease
      children: [], // In a real tree, Robert would be his child
    },
    {
      id: "fm7",
      fullName: "Grandmother (Paternal)",
      relation: "Grandmother",
      deceased: true,
      deceasedAge: 85,
      causeOfDeath: "Natural Causes",
      conditions: [mockConditions[1], mockConditions[6]], // Type 2 Diabetes, Arthritis
      children: [],
    },
    {
      id: "fm8",
      fullName: "Grandfather (Maternal)",
      relation: "Grandfather",
      deceased: true,
      deceasedAge: 90,
      causeOfDeath: "Natural Causes",
      conditions: [],
      children: [],
    },
    {
      id: "fm9",
      fullName: "Grandmother (Maternal)",
      relation: "Grandmother",
      deceased: true,
      deceasedAge: 70,
      causeOfDeath: "Colon Cancer",
      conditions: [mockConditions[8]], // Cancer (Colon)
      children: [],
    },
  ],
}
