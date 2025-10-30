# app/routers/users.py
from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from bson import ObjectId
from app.db import db  # Import your database connection
from app.security import get_current_admin_user_id  # Import auth if needed
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Response model for user data
class UserOut(BaseModel):
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    profile_pic: Optional[str] = None
    birthdate: Optional[str] = None
    gender: Optional[str] = None
    status: str
    deactivation_reason: Optional[str] = None  # Added deactivation_reason
    join_date: Optional[str] = None

    class Config:
        from_attributes = True

# GET /api/users/ - Get all users from database
@router.get("/users/", response_model=List[UserOut])
async def get_all_users(
    # user_id: str = Depends(get_current_admin_user_id),  # Uncomment if you want auth
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """
    Get all users with pagination and filtering from database
    """
    try:
        # Build query filter
        query = {}
        if role:
            query["role"] = role
        if status:
            query["status"] = status
        
        # Get users from MongoDB
        cursor = db.users.find(query).skip(skip).limit(limit)
        users_list = await cursor.to_list(length=limit)
        
        # Transform MongoDB documents to response format
        users_response = []
        for user in users_list:
            users_response.append({
                "id": str(user["_id"]),
                "email": user.get("email", ""),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "role": user.get("role", "user"),
                "profile_pic": user.get("profile_pic"),
                "birthdate": user.get("birthdate"),
                "gender": user.get("gender"),
                "status": user.get("status", "active"),
                "deactivation_reason": user.get("deactivation_reason"),  # Added this line
                "join_date": user.get("created_at")  # Using created_at as join date
            })
        
        logger.info(f"Retrieved {len(users_response)} users from database")
        return users_response
        
    except Exception as e:
        logger.error(f"Error fetching users from database: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching users from database"
        )

# GET /api/users/stats/count - Get user statistics from database
@router.get("/users/stats/count")
async def get_user_stats(
    # user_id: str = Depends(get_current_admin_user_id)  # Uncomment if you want auth
):
    """
    Get user statistics (count by role and status) from database
    """
    try:
        # Count users by role
        admin_count = await db.users.count_documents({"role": "admin"})
        user_count = await db.users.count_documents({"role": "user"})
        
        # Count users by status
        active_count = await db.users.count_documents({"status": "active"})
        inactive_count = await db.users.count_documents({"status": "inactive"})
        pending_count = await db.users.count_documents({"status": "pending"})
        
        total_users = await db.users.count_documents({})
        
        stats = {
            "total_users": total_users,
            "by_role": {
                "admin": admin_count,
                "user": user_count
            },
            "by_status": {
                "active": active_count,
                "inactive": inactive_count,
                "pending": pending_count
            }
        }
        
        logger.info(f"User stats from database: {stats}")
        return stats
        
    except Exception as e:
        logger.error(f"Error fetching user stats from database: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching user statistics from database"
        )
    

# Update user status route
@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status: str = Query(..., description="User status: active or inactive"),
    deactivation_reason: Optional[str] = Query(None, description="Reason for deactivation")  # Added this parameter
    # admin_id: str = Depends(get_current_admin_user_id)  # Uncomment if using auth
):
    """
    Update user status (active/inactive)
    """
    try:
        # Validate status
        if status not in ["active", "inactive"]:
            raise HTTPException(
                status_code=400,
                detail="Status must be either 'active' or 'inactive'"
            )
        
        # Check if user exists
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        # Prepare update data
        update_data = {"status": status}
        
        # Handle deactivation reason
        if status == "inactive":
            update_data["deactivation_reason"] = deactivation_reason
        else:  # If activating, clear the deactivation reason
            update_data["deactivation_reason"] = None
        
        # Update user status
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        return {
            "message": f"User status updated to {status} successfully",
            "user_id": user_id,
            "new_status": status,
            "deactivation_reason": deactivation_reason,  # Added this line
            "user": {
                "id": str(updated_user["_id"]),
                "email": updated_user.get("email"),
                "first_name": updated_user.get("first_name"),
                "last_name": updated_user.get("last_name"),
                "role": updated_user.get("role"),
                "status": updated_user.get("status"),
                "deactivation_reason": updated_user.get("deactivation_reason")  # Added this line
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error updating user status"
        )

# Bulk update user statuses
@router.put("/users/bulk/status")
async def bulk_update_user_status(
    user_ids: List[str],
    status: str = Query(..., description="User status: active or inactive"),
    deactivation_reason: Optional[str] = Query(None, description="Reason for deactivation")  # Added this parameter
    # admin_id: str = Depends(get_current_admin_user_id)  # Uncomment if using auth
):
    """
    Update status for multiple users at once
    """
    try:
        # Validate status
        if status not in ["active", "inactive"]:
            raise HTTPException(
                status_code=400,
                detail="Status must be either 'active' or 'inactive'"
            )
        
        # Convert string IDs to ObjectId
        object_ids = [ObjectId(user_id) for user_id in user_ids]
        
        # Prepare update data
        update_data = {"status": status}
        
        # Handle deactivation reason
        if status == "inactive":
            update_data["deactivation_reason"] = deactivation_reason
        else:  # If activating, clear the deactivation reason
            update_data["deactivation_reason"] = None
        
        # Update all users
        result = await db.users.update_many(
            {"_id": {"$in": object_ids}},
            {"$set": update_data}
        )
        
        return {
            "message": f"Updated {result.modified_count} users to {status}",
            "modified_count": result.modified_count,
            "status": status,
            "deactivation_reason": deactivation_reason  # Added this line
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk status update: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error updating user statuses"
        )