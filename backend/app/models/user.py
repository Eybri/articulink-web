#models/user.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
from datetime import date, datetime, timedelta
from bson import ObjectId
from app.db import db

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = "admin"
    profile_pic: Optional[str] = None
    birthdate: Optional[date] = None
    gender: Optional[str] = None
    status: Optional[str] = "active"
    deactivation_reason: Optional[str] = None
    deactivation_type: Optional[str] = None  # 'permanent' or 'temporary'
    deactivation_end_date: Optional[datetime] = None  # For auto-reactivation

    @validator('email')
    def email_to_lowercase(cls, v):
        return v.lower()

class UserOut(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    profile_pic: Optional[str] = None
    birthdate: Optional[date] = None
    gender: Optional[str] = None
    status: Optional[str] = None
    deactivation_reason: Optional[str] = None
    deactivation_type: Optional[str] = None  # Added
    deactivation_end_date: Optional[datetime] = None  # Added
    created_at: Optional[datetime] = None  # Add this field
    updated_at: Optional[datetime] = None  # Add this field

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[dict] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @validator('email')
    def email_to_lowercase(cls, v):
        return v.lower()

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birthdate: Optional[str] = None  # Keep as string for frontend compatibility
    gender: Optional[str] = None
    status: Optional[str] = None
    deactivation_reason: Optional[str] = None
    deactivation_type: Optional[str] = None
    deactivation_end_date: Optional[datetime] = None
    
    @validator('birthdate', pre=True)
    def parse_birthdate(cls, v):
        if v is None or v == "":
            return None
        # Just return the string as-is, let MongoDB handle the conversion
        return v
    
    class Config:
        from_attributes = True

class UserUpdateResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    profile_pic: Optional[str] = None
    birthdate: Optional[date] = None
    gender: Optional[str] = None
    status: Optional[str] = None
    deactivation_reason: Optional[str] = None
    deactivation_type: Optional[str] = None  # Added
    deactivation_end_date: Optional[datetime] = None  # Added
    created_at: Optional[datetime] = None  # Add this field
    updated_at: Optional[datetime] = None  # Add this field
    message: str = "Profile updated successfully"
    
    class Config:
        from_attributes = True

# Deactivation request model
class DeactivateRequest(BaseModel):
    deactivation_type: str  # 'permanent' or 'temporary'
    duration: Optional[str] = None  # '1day', '1week', '1month', '1year'
    deactivation_reason: Optional[str] = None

# MongoDB Model Functions
async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    user = await db.users.find_one({"email": email.lower()})
    return user

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        return user
    except Exception as e:
        print(f"Error getting user by ID: {e}")
        return None

async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    user_data["email"] = user_data["email"].lower()
    # Add created_at and updated_at timestamps
    current_time = datetime.now()
    user_data["created_at"] = current_time
    user_data["updated_at"] = current_time
    
    result = await db.users.insert_one(user_data)
    new_user = await db.users.find_one({"_id": result.inserted_id})
    return new_user

async def update_user(user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    try:
        # Add updated_at timestamp
        update_data["updated_at"] = datetime.now()
        
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        return await get_user_by_id(user_id)
    except Exception as e:
        print(f"Error updating user: {e}")
        return None

async def delete_user(user_id: str) -> bool:
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error deleting user: {e}")
        return False

# Auto-reactivation function
async def auto_reactivate_users():
    """
    Automatically reactivate users whose temporary deactivation period has ended
    """
    try:
        current_time = datetime.now()
        
        # Find users with expired temporary deactivation
        users_to_reactivate = await db.users.find({
            "status": "inactive",
            "deactivation_type": "temporary",
            "deactivation_end_date": {"$lte": current_time}
        }).to_list(length=None)
        
        reactivated_count = 0
        for user in users_to_reactivate:
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "status": "active",
                    "deactivation_type": None,
                    "deactivation_reason": None,
                    "deactivation_end_date": None,
                    "updated_at": datetime.now()
                }}
            )
            reactivated_count += 1
            logger.info(f"Auto-reactivated user {user.get('email', 'Unknown')}")
        
        if reactivated_count > 0:
            logger.info(f"Auto-reactivated {reactivated_count} users")
        
        return reactivated_count
        
    except Exception as e:
        logger.error(f"Error in auto-reactivation: {str(e)}")
        return 0