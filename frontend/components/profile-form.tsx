"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, User, Heart, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { 
  CreateUserProfileRequest, 
  MedicalHistory, 
  defaultProfileData, 
  defaultMedicalHistory,
  ProfileApiResponse 
} from "@/types/profile"

interface ProfileFormProps {
  onProfileCreated?: (userId: string) => void
  initialData?: CreateUserProfileRequest
}

export default function ProfileForm({ onProfileCreated, initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState<CreateUserProfileRequest>(
    initialData || defaultProfileData
  )
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // State for array inputs
  const [newCondition, setNewCondition] = useState("")
  const [newAllergy, setNewAllergy] = useState("")
  const [newMedication, setNewMedication] = useState("")
  const [newFamilyHistory, setNewFamilyHistory] = useState("")
  const [newSurgery, setNewSurgery] = useState("")

  const handleInputChange = (field: keyof CreateUserProfileRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMedicalHistoryChange = (field: keyof MedicalHistory, value: any) => {
    setFormData(prev => ({
      ...prev,
      medical_history: {
        ...prev.medical_history,
        [field]: value
      }
    }))
  }

  const addArrayItem = (field: keyof MedicalHistory, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData.medical_history[field] as string[]
      handleMedicalHistoryChange(field, [...currentArray, value.trim()])
      setter("")
    }
  }

  const removeArrayItem = (field: keyof MedicalHistory, index: number) => {
    const currentArray = formData.medical_history[field] as string[]
    handleMedicalHistoryChange(field, currentArray.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('http://localhost:8000/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ProfileApiResponse = await response.json()
      
      setMessage({ 
        type: 'success', 
        text: `Profile created successfully! User ID: ${result.user_id}` 
      })
      
      // Store hardcoded user ID in localStorage for demo purposes
      const demoUserId = "demo-user-12345"
      localStorage.setItem('user_id', demoUserId)
      
      if (onProfileCreated) {
        onProfileCreated(result.user_id)
      }

    } catch (error) {
      console.error('Error creating profile:', error)
      setMessage({ 
        type: 'error', 
        text: 'Failed to create profile. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const ArrayInput = ({ 
    label, 
    items, 
    newValue, 
    setNewValue, 
    field,
    placeholder 
  }: {
    label: string
    items: string[]
    newValue: string
    setNewValue: (value: string) => void
    field: keyof MedicalHistory
    placeholder: string
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addArrayItem(field, newValue, setNewValue)
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(field, newValue, setNewValue)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary" className="pr-1">
            {item}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeArrayItem(field, index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Please provide your basic personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Enter your age"
                min="0"
                max="150"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => handleInputChange('gender', value)} value={formData.gender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Medical History
          </CardTitle>
          <CardDescription>
            Please provide your medical history information to help with analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ArrayInput
            label="Medical Conditions"
            items={formData.medical_history.conditions}
            newValue={newCondition}
            setNewValue={setNewCondition}
            field="conditions"
            placeholder="e.g., Diabetes, Hypertension"
          />
          
          <ArrayInput
            label="Allergies"
            items={formData.medical_history.allergies}
            newValue={newAllergy}
            setNewValue={setNewAllergy}
            field="allergies"
            placeholder="e.g., Penicillin, Peanuts"
          />
          
          <ArrayInput
            label="Current Medications"
            items={formData.medical_history.medications}
            newValue={newMedication}
            setNewValue={setNewMedication}
            field="medications"
            placeholder="e.g., Metformin 500mg"
          />
          
          <ArrayInput
            label="Family History"
            items={formData.medical_history.family_history}
            newValue={newFamilyHistory}
            setNewValue={setNewFamilyHistory}
            field="family_history"
            placeholder="e.g., Father - Heart Disease"
          />
          
          <ArrayInput
            label="Previous Surgeries"
            items={formData.medical_history.surgeries}
            newValue={newSurgery}
            setNewValue={setNewSurgery}
            field="surgeries"
            placeholder="e.g., Appendectomy (2020)"
          />

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.medical_history.notes || ''}
              onChange={(e) => handleMedicalHistoryChange('notes', e.target.value)}
              placeholder="Any additional medical information you'd like to share..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Profile...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Profile
            </>
          )}
        </Button>
      </div>
    </form>
  )
}