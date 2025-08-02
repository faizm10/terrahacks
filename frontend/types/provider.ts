export type Provider = {
  id: string
  name: string
  specialty: string
  location: string
  rating: number
  bio: string
  imageUrl: string
  available: boolean
  phone?: string // New: Phone number
  email?: string // New: Email address
  videoCallLink?: string // New: Link for direct video call (e.g., a unique meeting URL)
  experience?: string // New: More detailed experience
  education?: string // New: Education background
  languages?: string[] // New: Languages spoken
}

export const mockProviders: Provider[] = [
  {
    id: "1",
    name: "Dr. Emily White",
    specialty: "Cardiology",
    location: "New York, NY",
    rating: 4.9,
    bio: "Dr. White is a board-certified cardiologist with over 15 years of experience in heart health, focusing on preventive care and complex cardiac conditions.",
    imageUrl: "/placeholder.svg?height=80&width=80&text=Dr. White",
    available: true,
    phone: "+1 (212) 555-0100",
    email: "emily.white@mediai.com",
    videoCallLink: "https://meet.google.com/abc-defg-hij", // Example link
    experience: "15+ years in Cardiology, Chief of Cardiology at NYC Health.",
    education: "MD from Harvard Medical School, Residency at Johns Hopkins.",
    languages: ["English", "Spanish"],
  },
  {
    id: "2",
    name: "Nurse John Doe",
    specialty: "Pediatrics",
    location: "Los Angeles, CA",
    rating: 4.7,
    bio: "John is a compassionate pediatric nurse specializing in child care, vaccinations, and developmental assessments for infants and adolescents.",
    imageUrl: "/placeholder.svg?height=80&width=80&text=N. Doe",
    available: true,
    phone: "+1 (310) 555-0101",
    email: "john.doe@mediai.com",
    videoCallLink: "https://zoom.us/j/1234567890",
    experience: "10 years as a Pediatric Nurse Practitioner at Children's Hospital LA.",
    education: "MSN from UCLA, BSN from University of Washington.",
    languages: ["English"],
  },
  {
    id: "3",
    name: "Dr. Sarah Chen",
    specialty: "Dermatology",
    location: "San Francisco, CA",
    rating: 4.8,
    bio: "Dr. Chen focuses on skin conditions, cosmetic dermatology, and advanced skin cancer screenings, providing personalized treatment plans.",
    imageUrl: "/placeholder.svg?height=80&width=80&text=Dr. Chen",
    available: false,
    phone: "+1 (415) 555-0102",
    email: "sarah.chen@mediai.com",
    videoCallLink: "https://teams.microsoft.com/l/meetup-join/...",
    experience: "12 years in Dermatology, published researcher in skin immunology.",
    education: "MD from Stanford University, Residency at UCSF Medical Center.",
    languages: ["English", "Mandarin"],
  },
  {
    id: "4",
    name: "Dr. Michael Brown",
    specialty: "General Practice",
    location: "Chicago, IL",
    rating: 4.5,
    bio: "Dr. Brown provides comprehensive primary care for patients of all ages, emphasizing preventative health and chronic disease management.",
    imageUrl: "/placeholder.svg?height=80&width=80&text=Dr. Brown",
    available: true,
    phone: "+1 (312) 555-0103",
    email: "michael.brown@mediai.com",
    videoCallLink: "https://whereby.com/mediai-brown",
    experience: "20+ years in Family Medicine, former Chief of Staff at Chicago General.",
    education: "DO from Midwestern University, Residency at Rush University Medical Center.",
    languages: ["English"],
  },
  {
    id: "5",
    name: "Nurse Jessica Lee",
    specialty: "Neurology",
    location: "Houston, TX",
    rating: 4.6,
    bio: "Jessica is an experienced neurology nurse assisting patients with neurological disorders, including stroke recovery and epilepsy management.",
    imageUrl: "/placeholder.svg?height=80&width=80&text=N. Lee",
    available: true,
    phone: "+1 (713) 555-0104",
    email: "jessica.lee@mediai.com",
    videoCallLink: "https://meet.jit.si/mediai-lee",
    experience: "8 years in Neuro-ICU and outpatient neurology clinics.",
    education: "BSN from University of Texas Health Science Center.",
    languages: ["English", "Vietnamese"],
  },
  {
    id: "6",
    name: "Dr. David Kim",
    specialty: "Orthopedics",
    location: "Miami, FL",
    rating: 4.9,
    bio: "Dr. Kim specializes in sports injuries, joint replacement, and musculoskeletal conditions, committed to restoring mobility and improving quality of life.",
    imageUrl: "/placeholder.svg?height=80&width=80&text=Dr. Kim",
    available: true,
    phone: "+1 (305) 555-0105",
    email: "david.kim@mediai.com",
    videoCallLink: "https://doxy.me/drkimortho",
    experience: "18 years in Orthopedic Surgery, team physician for local sports clubs.",
    education: "MD from Duke University, Residency at Hospital for Special Surgery.",
    languages: ["English", "Korean"],
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
