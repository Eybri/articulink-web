# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from app.models.user import (
    UserOut, Token, LoginRequest, 
    UserUpdate, UserUpdateResponse,
    get_user_by_email, get_user_by_id, update_user
)
from app.utils.password import verify_password, hash_password
from app.security import create_access_token, get_current_user_id, require_auth, require_admin, get_current_admin_user_id
from app.utils.cloudinary_helper import upload_profile_picture, delete_profile_picture, extract_public_id_from_url
import logging

logger = logging.getLogger(__name__)
router = APIRouter( tags=["auth"])

@router.post("/login", response_model=Token)
async def login(payload: LoginRequest):
    """Login user - ADMIN ONLY"""
    try:
        print(f"=== LOGIN ATTEMPT ===")
        print(f"Email: {payload.email}")
        
        # Debug database connection
        from app.db import db
        print(f"Database object: {db is not None}")
        
        # Test database connection
        try:
            # Try to ping the database
            await db.command("ping")
            print("✅ Database ping successful")
        except Exception as e:
            print(f"❌ Database ping failed: {e}")
            raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")
        
        user = await get_user_by_email(payload.email)
        print(f"User found: {user is not None}")
        
        if not user:
            print("User not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        print(f"User role: {user.get('role')}")
        print(f"User has password field: {'password' in user}")
        
        # Check if user is admin
        if user.get("role") != "admin":
            print(f"User is not admin, role is: {user.get('role')}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        print("Verifying password...")
        password_valid = verify_password(payload.password, user["password"])
        print(f"Password valid: {password_valid}")
        
        if not password_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create access token
        token_data = {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user.get("role", "admin")
        }
        print(f"Creating token for: {token_data}")
        
        access_token = create_access_token(token_data)
        print("Token created successfully")
        
        # Prepare user data for response
        user_response = {
            "id": str(user["_id"]),
            "email": user["email"],
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "role": user.get("role"),
            "profile_pic": user.get("profile_pic"),
            "birthdate": user.get("birthdate"),
            "gender": user.get("gender")
        }
        
        print("Login successful!")
        print("===================")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"❌ UNHANDLED ERROR in login: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/me")
async def get_current_user_profile(user_id: str = Depends(get_current_user_id)):
    """Get current user profile - ADMIN ONLY"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify user is admin
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "role": user.get("role"),
        "profile_pic": user.get("profile_pic"),
        "birthdate": user.get("birthdate"),
        "gender": user.get("gender")
    }

@router.put("/profile", response_model=UserUpdateResponse, dependencies=[Depends(require_admin)])
async def update_profile(
    profile_data: UserUpdate,
    user_id: str = Depends(get_current_admin_user_id)
):
    """Update user profile details (name, birthdate, gender) - ADMIN ONLY"""
    logger.info(f"Update profile request for admin user: {user_id}")
    
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = profile_data.dict(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    logger.info(f"Updating admin user {user_id} with data: {update_data}")
    
    updated_user = await update_user(user_id, update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return UserUpdateResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        first_name=updated_user.get("first_name"),
        last_name=updated_user.get("last_name"),
        role=updated_user.get("role"),
        profile_pic=updated_user.get("profile_pic"),
        birthdate=updated_user.get("birthdate"),
        gender=updated_user.get("gender"),
        message="Profile updated successfully"
    )

@router.post("/profile/picture", response_model=UserUpdateResponse, dependencies=[Depends(require_admin)])
async def upload_profile_pic(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_admin_user_id)
):
    """Upload or update profile picture - ADMIN ONLY"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Extract old public_id for cleanup
    old_public_id = None
    if user.get("profile_pic"):
        old_public_id = extract_public_id_from_url(user["profile_pic"])
    
    # Upload to Cloudinary (will replace old image if old_public_id provided)
    upload_result = await upload_profile_picture(file, user_id, old_public_id)
    
    # Update user with new profile picture URL
    update_data = {"profile_pic": upload_result["secure_url"]}
    updated_user = await update_user(user_id, update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile picture"
        )
    
    return UserUpdateResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        first_name=updated_user.get("first_name"),
        last_name=updated_user.get("last_name"),
        role=updated_user.get("role"),
        profile_pic=updated_user.get("profile_pic"),
        birthdate=updated_user.get("birthdate"),
        gender=updated_user.get("gender"),
        message="Profile picture updated successfully"
    )

@router.delete("/profile/picture", response_model=dict, dependencies=[Depends(require_admin)])
async def delete_profile_pic(user_id: str = Depends(get_current_admin_user_id)):
    """Delete profile picture - ADMIN ONLY"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.get("profile_pic"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No profile picture to delete"
        )
    
    # Extract public_id from Cloudinary URL
    old_public_id = extract_public_id_from_url(user["profile_pic"])
    
    # Delete from Cloudinary
    if old_public_id:
        await delete_profile_picture(old_public_id)
    
    # Remove profile_pic from user document
    await update_user(user_id, {"profile_pic": None})
    
    return {"message": "Profile picture deleted successfully"}

@router.put("/change-password")
async def change_password(
    password_data: dict,
    user_id: str = Depends(get_current_admin_user_id)
):
    """Change admin password"""
    try:
        # Validate passwords
        if password_data.get("new_password") != password_data.get("confirm_password"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New passwords do not match"
            )
        
        # Get user
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify current password
        if not verify_password(password_data["current_password"], user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        hashed_password = hash_password(password_data["new_password"])
        
        # Update password
        await update_user(user_id, {"password": hashed_password})
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error changing password"
        )