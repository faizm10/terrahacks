export type Provider = {
  id: string
  name: string
  specialty: string
  location: string
  rating: number
  bio: string
  imageUrl: string
  available: boolean
}

export const mockProviders: Provider[] = [
  {
    id: "1",
    name: "Dr. Emily White",
    specialty: "Cardiology",
    location: "New York, NY",
    rating: 4.9,
    bio: "Dr. White is a board-certified cardiologist with over 15 years of experience in heart health.",
    imageUrl: "/placeholder.svg?height=80&width=80",
    available: true,
  },
  {
    id: "2",
    name: "Nurse John Doe",
    specialty: "Pediatrics",
    location: "Los Angeles, CA",
    rating: 4.7,
    bio: "John is a compassionate pediatric nurse specializing in child care and vaccinations.",
    imageUrl: "/placeholder.svg?height=80&width=80",
    available: true,
  },
  {
    id: "3",
    name: "Dr. Sarah Chen",
    specialty: "Dermatology",
    location: "San Francisco, CA",
    rating: 4.8,
    bio: "Dr. Chen focuses on skin conditions, cosmetic dermatology, and skin cancer screenings.",
    imageUrl: "/placeholder.svg?height=80&width=80",
    available: false,
  },
  {
    id: "4",
    name: "Dr. Michael Brown",
    specialty: "General Practice",
    location: "Chicago, IL",
    rating: 4.5,
    bio: "Dr. Brown provides comprehensive primary care for patients of all ages.",
    imageUrl: "/placeholder.svg?height=80&width=80",
    available: true,
  },
  {
    id: "5",
    name: "Nurse Jessica Lee",
    specialty: "Neurology",
    location: "Houston, TX",
    rating: 4.6,
    bio: "Jessica is an experienced neurology nurse assisting patients with neurological disorders.",
    imageUrl: "/placeholder.svg?height=80&width=80",
    available: true,
  },
  {
    id: "6",
    name: "Dr. David Kim",
    specialty: "Orthopedics",
    location: "Miami, FL",
    rating: 4.9,
    bio: "Dr. Kim specializes in sports injuries, joint replacement, and musculoskeletal conditions.",
    imageUrl: "/placeholder.svg?height=80&width=80",
    available: true,
  },
]

export const specialties = [
  "All",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "General Practice",
  "Neurology",
  "Orthopedics",
]
