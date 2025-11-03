# app/routers/users.py
from fastapi import APIRouter, Query, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timedelta
from app.db import db
from app.security import get_current_admin_user_id
import logging
from app.models.user import DeactivateRequest, auto_reactivate_users

router = APIRouter()
logger = logging.getLogger(__name__)

# In app/routers/users.py - Update the UserOut model
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
    deactivation_reason: Optional[str] = None
    deactivation_type: Optional[str] = None
    deactivation_end_date: Optional[str] = None
    created_at: Optional[str] = None  # Change from join_date to created_at

    class Config:
        from_attributes = True
# Helper function to convert datetime to string
def format_datetime_for_response(dt):
    if dt is None:
        return None
    if isinstance(dt, datetime):
        return dt.isoformat()
    return dt

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
        # Run auto-reactivation before fetching users
        await auto_reactivate_users()
        
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
                "deactivation_reason": user.get("deactivation_reason"),
                "deactivation_type": user.get("deactivation_type"),
                "deactivation_end_date": format_datetime_for_response(user.get("deactivation_end_date")),
                "created_at": format_datetime_for_response(user.get("created_at"))  # Use created_at instead of join_date
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
        # Run auto-reactivation before getting stats
        await auto_reactivate_users()
        
        # Count users by role
        admin_count = await db.users.count_documents({"role": "admin"})
        user_count = await db.users.count_documents({"role": "user"})
        
        # Count users by status
        active_count = await db.users.count_documents({"status": "active"})
        inactive_count = await db.users.count_documents({"status": "inactive"})
        pending_count = await db.users.count_documents({"status": "pending"})
        
        # Count temporary deactivations
        temporary_deactivated = await db.users.count_documents({
            "status": "inactive", 
            "deactivation_type": "temporary"
        })
        permanent_deactivated = await db.users.count_documents({
            "status": "inactive", 
            "deactivation_type": "permanent"
        })
        
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
            },
            "by_deactivation_type": {
                "temporary": temporary_deactivated,
                "permanent": permanent_deactivated
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

# New endpoint for deactivating users with type and duration
@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    deactivate_request: DeactivateRequest,
    background_tasks: BackgroundTasks,
    # admin_id: str = Depends(get_current_admin_user_id)  # Uncomment if using auth
):
    """
    Deactivate user with option for temporary or permanent deactivation
    """
    try:
        # Validate deactivation type
        if deactivate_request.deactivation_type not in ["permanent", "temporary"]:
            raise HTTPException(
                status_code=400,
                detail="Deactivation type must be either 'permanent' or 'temporary'"
            )
        
        # Check if user exists
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        # Prepare update data
        update_data = {
            "status": "inactive",
            "deactivation_type": deactivate_request.deactivation_type,
            "deactivation_reason": deactivate_request.deactivation_reason
        }
        
        end_date = None
        
        # Calculate end date for temporary deactivation
        if deactivate_request.deactivation_type == "temporary":
            if not deactivate_request.duration or deactivate_request.duration not in ["1day", "1week", "1month", "1year"]:
                raise HTTPException(
                    status_code=400,
                    detail="Duration is required for temporary deactivation and must be one of: 1day, 1week, 1month, 1year"
                )
            
            # Calculate end date based on duration
            now = datetime.now()
            
            if deactivate_request.duration == "1day":
                end_date = now + timedelta(days=1)
            elif deactivate_request.duration == "1week":
                end_date = now + timedelta(weeks=1)
            elif deactivate_request.duration == "1month":
                end_date = now + timedelta(days=30)  # Approximate month
            elif deactivate_request.duration == "1year":
                end_date = now + timedelta(days=365)
            
            update_data["deactivation_end_date"] = end_date
        
        # Update user
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        response_message = f"User deactivated successfully"
        if deactivate_request.deactivation_type == "temporary":
            response_message += f" until {end_date.strftime('%Y-%m-%d %H:%M:%S')}"
        
        return {
            "message": response_message,
            "user_id": user_id,
            "deactivation_type": deactivate_request.deactivation_type,
            "duration": deactivate_request.duration,
            "deactivation_end_date": format_datetime_for_response(end_date),
            "user": {
                "id": str(updated_user["_id"]),
                "email": updated_user.get("email"),
                "first_name": updated_user.get("first_name"),
                "last_name": updated_user.get("last_name"),
                "status": updated_user.get("status"),
                "deactivation_type": updated_user.get("deactivation_type"),
                "deactivation_end_date": format_datetime_for_response(updated_user.get("deactivation_end_date"))
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deactivating user: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error deactivating user"
        )

# New endpoint for activating users
@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    # admin_id: str = Depends(get_current_admin_user_id)  # Uncomment if using auth
):
    """
    Activate user and clear all deactivation fields
    """
    try:
        # Check if user exists
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        # Update user to active and clear deactivation fields
        update_data = {
            "status": "active",
            "deactivation_type": None,
            "deactivation_reason": None,
            "deactivation_end_date": None
        }
        
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        return {
            "message": "User activated successfully",
            "user_id": user_id,
            "user": {
                "id": str(updated_user["_id"]),
                "email": updated_user.get("email"),
                "first_name": updated_user.get("first_name"),
                "last_name": updated_user.get("last_name"),
                "status": updated_user.get("status"),
                "deactivation_type": updated_user.get("deactivation_type"),
                "deactivation_end_date": format_datetime_for_response(updated_user.get("deactivation_end_date"))
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:  # FIXED: Added 'as' keyword
        logger.error(f"Error activating user: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error activating user"
        )

# Endpoint to manually trigger auto-reactivation
@router.post("/users/auto-reactivate")
async def trigger_auto_reactivate(
    # admin_id: str = Depends(get_current_admin_user_id)  # Uncomment if using auth
):
    """
    Manually trigger auto-reactivation of users
    """
    try:
        reactivated_count = await auto_reactivate_users()
        return {
            "message": f"Auto-reactivation completed",
            "reactivated_count": reactivated_count
        }
    except Exception as e:
        logger.error(f"Error in auto-reactivation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error during auto-reactivation"
        )

# Update user status route (keep existing for backward compatibility)
@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status: str = Query(..., description="User status: active or inactive"),
    deactivation_reason: Optional[str] = Query(None, description="Reason for deactivation")
    # admin_id: str = Depends(get_current_admin_user_id)  # Uncomment if using auth
):
    """
    Update user status (active/inactive) - Legacy endpoint
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
            update_data["deactivation_type"] = "permanent"  # Default to permanent for legacy endpoint
        else:  # If activating, clear all deactivation fields
            update_data["deactivation_reason"] = None
            update_data["deactivation_type"] = None
            update_data["deactivation_end_date"] = None
        
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
            "deactivation_reason": deactivation_reason,
            "user": {
                "id": str(updated_user["_id"]),
                "email": updated_user.get("email"),
                "first_name": updated_user.get("first_name"),
                "last_name": updated_user.get("last_name"),
                "role": updated_user.get("role"),
                "status": updated_user.get("status"),
                "deactivation_reason": updated_user.get("deactivation_reason")
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

# Bulk update user statuses (keep existing)
@router.put("/users/bulk/status")
async def bulk_update_user_status(
    user_ids: List[str],
    status: str = Query(..., description="User status: active or inactive"),
    deactivation_reason: Optional[str] = Query(None, description="Reason for deactivation")
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
            update_data["deactivation_type"] = "permanent"  # Default to permanent for bulk
        else:  # If activating, clear the deactivation reason
            update_data["deactivation_reason"] = None
            update_data["deactivation_type"] = None
            update_data["deactivation_end_date"] = None
        
        # Update all users
        result = await db.users.update_many(
            {"_id": {"$in": object_ids}},
            {"$set": update_data}
        )
        
        return {
            "message": f"Updated {result.modified_count} users to {status}",
            "modified_count": result.modified_count,
            "status": status,
            "deactivation_reason": deactivation_reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk status update: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error updating user statuses"
        )
    
@router.get("/dashboard/gender-demographics")
async def get_gender_demographics(
    # user_id: str = Depends(get_current_admin_user_id)  # Uncomment if using auth
):
    """
    Get gender demographics for dashboard chart
    """
    try:
        # Run auto-reactivation before getting stats
        await auto_reactivate_users()
        
        # Aggregate gender counts
        pipeline = [
            {
                "$group": {
                    "_id": "$gender",
                    "count": {"$sum": 1}
                }
            },
            {
                "$project": {
                    "gender": {
                        "$ifNull": ["$_id", "Not Specified"]
                    },
                    "count": 1,
                    "_id": 0
                }
            },
            {
                "$sort": {"count": -1}
            }
        ]
        
        cursor = db.users.aggregate(pipeline)
        gender_data = await cursor.to_list(length=None)
        
        # Format response
        total_users = await db.users.count_documents({})
        
        # Calculate percentages
        for item in gender_data:
            item["percentage"] = round((item["count"] / total_users) * 100, 2) if total_users > 0 else 0
        
        return {
            "total_users": total_users,
            "gender_distribution": gender_data
        }
        
    except Exception as e:
        logger.error(f"Error fetching gender demographics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching gender demographics"
        )

@router.get("/dashboard/user-growth")
async def get_user_growth_over_time(
    timeframe: str = Query("monthly", description="Timeframe: monthly, weekly, or daily"),
    # user_id: str = Depends(get_current_admin_user_id)  # Uncomment if using auth
):
    """
    Get user growth over time for dashboard line/area chart
    """
    try:
        # Run auto-reactivation before getting stats
        await auto_reactivate_users()
        
        # Define date format based on timeframe
        if timeframe == "daily":
            date_format = "%Y-%m-%d"
        elif timeframe == "weekly":
            date_format = "%Y-%U"  # Year-Week number
        else:  # monthly
            date_format = "%Y-%m"
        
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": date_format,
                            "date": "$created_at"
                        }
                    },
                    "count": {"$sum": 1},
                    "date": {"$first": "$created_at"}
                }
            },
            {
                "$project": {
                    "period": "$_id",
                    "count": 1,
                    "date": 1,
                    "_id": 0
                }
            },
            {
                "$sort": {"date": 1}
            }
        ]
        
        cursor = db.users.aggregate(pipeline)
        growth_data = await cursor.to_list(length=None)
        
        # Calculate cumulative growth
        cumulative = 0
        for item in growth_data:
            cumulative += item["count"]
            item["cumulative"] = cumulative
        
        return {
            "timeframe": timeframe,
            "growth_data": growth_data,
            "total_periods": len(growth_data)
        }
        
    except Exception as e:
        logger.error(f"Error fetching user growth data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching user growth data"
        )

@router.get("/dashboard/age-distribution")
async def get_age_distribution(
    # user_id: str = Depends(get_current_admin_user_id)  # Uncomment if using auth
):
    """
    Get age distribution for dashboard histogram/bar chart
    """
    try:
        # Run auto-reactivation before getting stats
        await auto_reactivate_users()
        
        # Get users with birthdate
        users_with_birthdate = await db.users.find({
            "birthdate": {"$exists": True, "$ne": None}
        }).to_list(length=None)
        
        # Calculate ages and group into ranges
        age_ranges = {
            "Under 18": 0,
            "18-25": 0,
            "26-35": 0,
            "36-45": 0,
            "46-55": 0,
            "56-65": 0,
            "Over 65": 0
        }
        
        current_date = datetime.now()
        
        for user in users_with_birthdate:
            birthdate_str = user.get("birthdate")
            if birthdate_str:
                try:
                    # Parse birthdate (assuming ISO format or similar)
                    if isinstance(birthdate_str, str):
                        birthdate = datetime.fromisoformat(birthdate_str.replace('Z', '+00:00'))
                    else:
                        birthdate = birthdate_str
                    
                    # Calculate age
                    age = current_date.year - birthdate.year
                    # Adjust if birthday hasn't occurred this year
                    if (current_date.month, current_date.day) < (birthdate.month, birthdate.day):
                        age -= 1
                    
                    # Assign to age range
                    if age < 18:
                        age_ranges["Under 18"] += 1
                    elif 18 <= age <= 25:
                        age_ranges["18-25"] += 1
                    elif 26 <= age <= 35:
                        age_ranges["26-35"] += 1
                    elif 36 <= age <= 45:
                        age_ranges["36-45"] += 1
                    elif 46 <= age <= 55:
                        age_ranges["46-55"] += 1
                    elif 56 <= age <= 65:
                        age_ranges["56-65"] += 1
                    else:
                        age_ranges["Over 65"] += 1
                        
                except Exception as e:
                    logger.warning(f"Error parsing birthdate for user {user.get('email')}: {str(e)}")
                    continue
        
        # Convert to list format for frontend
        age_distribution = []
        total_with_birthdate = sum(age_ranges.values())
        
        for range_name, count in age_ranges.items():
            percentage = round((count / total_with_birthdate) * 100, 2) if total_with_birthdate > 0 else 0
            age_distribution.append({
                "age_range": range_name,
                "count": count,
                "percentage": percentage
            })
        
        return {
            "age_distribution": age_distribution,
            "total_users_with_birthdate": total_with_birthdate,
            "total_users": await db.users.count_documents({}),
            "users_without_birthdate": await db.users.count_documents({"birthdate": {"$exists": False}}) + 
                                      await db.users.count_documents({"birthdate": None})
        }
        
    except Exception as e:
        logger.error(f"Error fetching age distribution: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching age distribution"
        )
    
