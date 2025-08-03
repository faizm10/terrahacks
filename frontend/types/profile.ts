export interface MedicalHistory {
  conditions: string[]
  allergies: string[]
  medications: string[]
  family_history: string[]
  surgeries: string[]
  notes?: string
}

export interface UserProfile {
  user_id: string
  name: string
  age?: number
  gender?: string
  date_of_birth?: string
  medical_history: MedicalHistory
  created_at?: string
  updated_at?: string
}

export interface CreateUserProfileRequest {
  name: string
  age?: number
  gender?: string
  date_of_birth?: string
  medical_history: MedicalHistory
}

export interface UpdateUserProfileRequest {
  name?: string
  age?: number
  gender?: string
  date_of_birth?: string
  medical_history?: MedicalHistory
}

export interface ProfileApiResponse {
  user_id: string
  status: string
  message: string
}

// Default empty medical history
export const defaultMedicalHistory: MedicalHistory = {
  conditions: [],
  allergies: [],
  medications: [],
  family_history: [],
  surgeries: [],
  notes: ""
}

// Default profile form data
export const defaultProfileData: CreateUserProfileRequest = {
  name: "",
  age: undefined,
  gender: "",
  date_of_birth: "",
  medical_history: defaultMedicalHistory
}