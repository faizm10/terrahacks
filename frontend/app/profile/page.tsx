"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/sections/navigation"
import ProfileForm from "@/components/profile-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Calendar, Heart, FileText, Edit, Trash2, Home } from "lucide-react"
import { UserProfile } from "@/types/profile"

export default function ProfilePage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Always use demo user ID for simplicity
    const demoUserId = "demo-user-12345"
    localStorage.setItem('user_id', demoUserId)
    setUserId(demoUserId)
    fetchUserProfile(demoUserId)
  }, [])

  const fetchUserProfile = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/profile/${id}`)
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
        setIsEditing(false)
      } else {
        console.error('Failed to fetch profile')
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setIsEditing(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileCreated = (newUserId: string) => {
    setUserId(newUserId)
    fetchUserProfile(newUserId)
  }

  const handleDeleteProfile = async () => {
    if (!userId || !confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/profile/${userId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        localStorage.removeItem('user_id')
        setUserProfile(null)
        setUserId(null)
        setIsEditing(true)
      } else {
        alert('Failed to delete profile')
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      alert('Error deleting profile')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  const ProfileDisplay = ({ profile }: { profile: UserProfile }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Medical Profile</h1>
          <p className="text-text-secondary mt-2">Your personal medical information</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/')} 
            variant="outline" 
            className="hover:bg-gray-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button onClick={handleDeleteProfile} variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Name</span>
              <p className="text-text-primary text-lg font-medium">{profile.name}</p>
            </div>
            {profile.age && (
              <div className="space-y-1">
                <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Age</span>
                <p className="text-text-primary text-lg font-medium">{profile.age} years old</p>
              </div>
            )}
            {profile.gender && (
              <div className="space-y-1">
                <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Gender</span>
                <p className="text-text-primary text-lg font-medium capitalize">{profile.gender}</p>
              </div>
            )}
            {profile.date_of_birth && (
              <div className="space-y-1">
                <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Date of Birth</span>
                <p className="text-text-primary text-lg font-medium">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
              </div>
            )}
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
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show empty state if no medical history */}
          {profile.medical_history.conditions.length === 0 && 
           profile.medical_history.allergies.length === 0 && 
           profile.medical_history.medications.length === 0 && 
           profile.medical_history.family_history.length === 0 && 
           profile.medical_history.surgeries.length === 0 && 
           !profile.medical_history.notes && (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">No medical history information provided</p>
            </div>
          )}

          {profile.medical_history.conditions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wide">Medical Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {profile.medical_history.conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.medical_history.allergies.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wide">Allergies</h4>
              <div className="flex flex-wrap gap-2">
                {profile.medical_history.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.medical_history.medications.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wide">Current Medications</h4>
              <div className="flex flex-wrap gap-2">
                {profile.medical_history.medications.map((medication, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1 text-sm font-medium bg-green-50 text-green-700 border-green-300 hover:bg-green-100">
                    {medication}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.medical_history.family_history.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wide">Family History</h4>
              <div className="flex flex-wrap gap-2">
                {profile.medical_history.family_history.map((history, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200">
                    {history}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.medical_history.surgeries.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wide">Previous Surgeries</h4>
              <div className="flex flex-wrap gap-2">
                {profile.medical_history.surgeries.map((surgery, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1 text-sm font-medium bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100">
                    {surgery}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.medical_history.notes && (
            <div className="space-y-3">
              <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wide">Additional Notes</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-text-secondary text-sm leading-relaxed">
                  {profile.medical_history.notes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">User ID</span>
              <p className="text-text-primary font-mono text-sm bg-gray-100 px-2 py-1 rounded">{profile.user_id}</p>
            </div>
            {profile.created_at && (
              <div className="space-y-1">
                <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Profile Created</span>
                <p className="text-text-primary">{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-primary-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => router.push('/')} 
          variant="outline" 
          className="mb-6 hover:bg-gray-50"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {isEditing ? (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text-primary">
                {userProfile ? 'Edit Profile' : 'Create Your Medical Profile'}
              </h1>
              <p className="text-text-secondary mt-2">
                {userProfile 
                  ? 'Update your medical information' 
                  : 'Set up your medical profile to get personalized consultations'
                }
              </p>
            </div>
            <ProfileForm 
              onProfileCreated={handleProfileCreated}
              initialData={userProfile ? {
                name: userProfile.name,
                age: userProfile.age,
                gender: userProfile.gender,
                date_of_birth: userProfile.date_of_birth,
                medical_history: userProfile.medical_history
              } : undefined}
            />
            {userProfile && (
              <div className="mt-4 flex justify-center">
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : userProfile ? (
          <ProfileDisplay profile={userProfile} />
        ) : (
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">No Profile Found</h2>
            <p className="text-text-secondary mb-6">Create your medical profile to get started</p>
            <Button onClick={() => setIsEditing(true)}>
              Create Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}