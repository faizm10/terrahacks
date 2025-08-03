from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import logging
from datetime import datetime
from typing import Dict

from api.types.medical_types import (
    UserProfile, 
    CreateUserProfileRequest, 
    UpdateUserProfileRequest,
    MedicalHistory
)

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage for demo purposes
profiles_store: Dict[str, dict] = {}


@router.post("/create")
async def create_user_profile(request: CreateUserProfileRequest):
    """Create a new user profile (in-memory)"""
    try:
        # Use a hardcoded default user ID for demo
        user_id = "demo-user-12345"
        now = datetime.now().isoformat()
        
        # Prepare profile data
        profile_data = {
            "user_id": user_id,
            "name": request.name,
            "age": request.age,
            "gender": request.gender,
            "date_of_birth": request.date_of_birth,
            "medical_history": request.medical_history.model_dump(),
            "created_at": now,
            "updated_at": now
        }
        
        logger.info(f"👤 Creating user profile: {request.name}")
        
        # Store in memory
        profiles_store[user_id] = profile_data
        
        logger.info(f"✅ User profile saved successfully: {user_id}")
        
        return JSONResponse({
            "user_id": user_id,
            "status": "saved",
            "message": "Profile saved successfully"
        })
                
    except Exception as e:
        logger.error(f"❌ Profile creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile by ID (in-memory)"""
    try:
        logger.info(f"🔍 Retrieving user profile: {user_id}")
        
        if user_id not in profiles_store:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile_data = profiles_store[user_id]
        logger.info(f"✅ User profile retrieved: {user_id}")
        
        # Convert to UserProfile model
        user_profile = UserProfile(
            user_id=profile_data["user_id"],
            name=profile_data["name"],
            age=profile_data.get("age"),
            gender=profile_data.get("gender"),
            date_of_birth=profile_data.get("date_of_birth"),
            medical_history=MedicalHistory(**profile_data["medical_history"]),
            created_at=profile_data.get("created_at"),
            updated_at=profile_data.get("updated_at")
        )
        
        return user_profile
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Profile retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}")
async def update_user_profile(user_id: str, request: UpdateUserProfileRequest):
    """Update user profile (in-memory)"""
    try:
        logger.info(f"📝 Updating user profile: {user_id}")
        
        if user_id not in profiles_store:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile_data = profiles_store[user_id].copy()
        profile_data["updated_at"] = datetime.now().isoformat()
        
        # Update fields if provided
        if request.name is not None:
            profile_data["name"] = request.name
        if request.age is not None:
            profile_data["age"] = request.age
        if request.gender is not None:
            profile_data["gender"] = request.gender
        if request.date_of_birth is not None:
            profile_data["date_of_birth"] = request.date_of_birth
        if request.medical_history is not None:
            profile_data["medical_history"] = request.medical_history.model_dump()
        
        profiles_store[user_id] = profile_data
        
        logger.info(f"✅ User profile updated: {user_id}")
        
        return JSONResponse({
            "user_id": user_id,
            "status": "updated",
            "message": "Profile updated successfully"
        })
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Profile update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}")
async def delete_user_profile(user_id: str):
    """Delete user profile (in-memory)"""
    try:
        logger.info(f"🗑️ Deleting user profile: {user_id}")
        
        if user_id not in profiles_store:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        del profiles_store[user_id]
        
        logger.info(f"✅ User profile deleted: {user_id}")
        
        return JSONResponse({
            "user_id": user_id,
            "status": "deleted",
            "message": "Profile deleted successfully"
        })
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Profile deletion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def list_user_profiles():
    """List all user profiles (in-memory)"""
    try:
        logger.info("📋 Listing all user profiles")
        
        profiles = []
        for user_id, profile_data in profiles_store.items():
            profiles.append({
                "user_id": profile_data["user_id"],
                "name": profile_data["name"],
                "age": profile_data.get("age"),
                "gender": profile_data.get("gender"),
                "created_at": profile_data.get("created_at")
            })
        
        logger.info(f"✅ Retrieved {len(profiles)} user profiles")
        
        return JSONResponse({
            "profiles": profiles,
            "count": len(profiles)
        })
                
    except Exception as e:
        logger.error(f"❌ Profiles listing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))