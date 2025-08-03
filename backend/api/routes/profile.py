from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import logging
import os
import aiohttp
import uuid
from datetime import datetime
from typing import Optional

from api.types.medical_types import (
    UserProfile, 
    CreateUserProfileRequest, 
    UpdateUserProfileRequest,
    MedicalHistory
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    logger.warning("⚠️ Supabase environment variables not configured. Profile features will be limited.")


async def get_supabase_headers():
    """Get headers for Supabase API requests"""
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }


@router.post("/create")
async def create_user_profile(request: CreateUserProfileRequest):
    """Create a new user profile"""
    try:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise HTTPException(status_code=500, detail="Supabase not configured")
        
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
        
        # Upsert into Supabase (update if exists, insert if not)
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{SUPABASE_URL}/rest/v1/user_profiles",
                headers={
                    **await get_supabase_headers(),
                    "Prefer": "resolution=merge-duplicates"  # Upsert on conflict
                },
                json=profile_data
            ) as response:
                if response.status not in [200, 201]:
                    error_text = await response.text()
                    logger.error(f"❌ Supabase profile upsert failed: {response.status} - {error_text}")
                    raise HTTPException(status_code=response.status, detail=f"Database error: {error_text}")
                
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
    """Get user profile by ID"""
    try:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise HTTPException(status_code=500, detail="Supabase not configured")
        
        logger.info(f"🔍 Retrieving user profile: {user_id}")
        
        # Query Supabase
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{SUPABASE_URL}/rest/v1/user_profiles",
                headers=await get_supabase_headers(),
                params={"user_id": f"eq.{user_id}"}
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"❌ Supabase profile query failed: {response.status} - {error_text}")
                    raise HTTPException(status_code=response.status, detail=f"Database error: {error_text}")
                
                profiles = await response.json()
                
                if not profiles:
                    raise HTTPException(status_code=404, detail="User profile not found")
                
                profile_data = profiles[0]
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
    """Update user profile"""
    try:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise HTTPException(status_code=500, detail="Supabase not configured")
        
        logger.info(f"📝 Updating user profile: {user_id}")
        
        # Prepare update data (only include non-None fields)
        update_data = {"updated_at": datetime.now().isoformat()}
        
        if request.name is not None:
            update_data["name"] = request.name
        if request.age is not None:
            update_data["age"] = request.age
        if request.gender is not None:
            update_data["gender"] = request.gender
        if request.date_of_birth is not None:
            update_data["date_of_birth"] = request.date_of_birth
        if request.medical_history is not None:
            update_data["medical_history"] = request.medical_history.model_dump()
        
        # Update in Supabase
        async with aiohttp.ClientSession() as session:
            async with session.patch(
                f"{SUPABASE_URL}/rest/v1/user_profiles",
                headers=await get_supabase_headers(),
                params={"user_id": f"eq.{user_id}"},
                json=update_data
            ) as response:
                if response.status != 204:  # Supabase PATCH returns 204 No Content
                    error_text = await response.text()
                    logger.error(f"❌ Supabase profile update failed: {response.status} - {error_text}")
                    raise HTTPException(status_code=response.status, detail=f"Database error: {error_text}")
                
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
    """Delete user profile"""
    try:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise HTTPException(status_code=500, detail="Supabase not configured")
        
        logger.info(f"🗑️ Deleting user profile: {user_id}")
        
        # Delete from Supabase
        async with aiohttp.ClientSession() as session:
            async with session.delete(
                f"{SUPABASE_URL}/rest/v1/user_profiles",
                headers=await get_supabase_headers(),
                params={"user_id": f"eq.{user_id}"}
            ) as response:
                if response.status != 204:  # Supabase DELETE returns 204 No Content
                    error_text = await response.text()
                    logger.error(f"❌ Supabase profile deletion failed: {response.status} - {error_text}")
                    raise HTTPException(status_code=response.status, detail=f"Database error: {error_text}")
                
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
    """List all user profiles (for demo purposes)"""
    try:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise HTTPException(status_code=500, detail="Supabase not configured")
        
        logger.info("📋 Listing all user profiles")
        
        # Query all profiles from Supabase
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{SUPABASE_URL}/rest/v1/user_profiles",
                headers=await get_supabase_headers(),
                params={"select": "user_id,name,age,gender,created_at", "order": "created_at.desc"}
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"❌ Supabase profiles list failed: {response.status} - {error_text}")
                    raise HTTPException(status_code=response.status, detail=f"Database error: {error_text}")
                
                profiles = await response.json()
                logger.info(f"✅ Retrieved {len(profiles)} user profiles")
                
                return JSONResponse({
                    "profiles": profiles,
                    "count": len(profiles)
                })
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Profiles listing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))