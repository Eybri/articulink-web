from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from app.db import db
from app.security import get_current_admin_user_id
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pronunciation", tags=["pronunciation"])

class AudioClipResponse(BaseModel):
    id: str
    user_id: str
    audio_url: str
    transcript: Optional[str] = None
    corrected_transcript: Optional[str] = None
    speech_type: Optional[str] = None
    duration_seconds: Optional[float] = None
    processing_status: str
    device_type: Optional[str] = None
    language: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/audio-clips", response_model=List[AudioClipResponse])
async def get_audio_clips(
    admin_id: str = Depends(get_current_admin_user_id),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    language: Optional[str] = None
):
    """Get all audio clips (admin only)"""
    try:
        # Build query
        query = {}
        if status:
            query["processing_status"] = status
        if language:
            query["language"] = language

        # Get clips from database
        cursor = db.audio_clips.find(query).sort("created_at", -1).skip(skip).limit(limit)
        clips = await cursor.to_list(length=limit)

        # Format response
        response = []
        for clip in clips:
            response.append({
                "id": str(clip["_id"]),
                "user_id": str(clip.get("user_id", "")),
                "audio_url": clip.get("audio_url", ""),
                "transcript": clip.get("transcript"),
                "corrected_transcript": clip.get("corrected_transcript"),
                "speech_type": clip.get("speech_type"),
                "duration_seconds": clip.get("duration_seconds"),
                "processing_status": clip.get("processing_status", "unknown"),
                "device_type": clip.get("device_type"),
                "language": clip.get("language"),
                "created_at": clip.get("created_at").isoformat() if clip.get("created_at") else None
            })

        return response

    except Exception as e:
        logger.error(f"Error fetching audio clips: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching audio clips")

@router.get("/audio-clips/{clip_id}", response_model=AudioClipResponse)
async def get_audio_clip(
    clip_id: str,
    admin_id: str = Depends(get_current_admin_user_id)
):
    """Get single audio clip by ID"""
    try:
        clip = await db.audio_clips.find_one({"_id": ObjectId(clip_id)})
        if not clip:
            raise HTTPException(status_code=404, detail="Audio clip not found")

        return {
            "id": str(clip["_id"]),
            "user_id": str(clip.get("user_id", "")),
            "audio_url": clip.get("audio_url", ""),
            "transcript": clip.get("transcript"),
            "corrected_transcript": clip.get("corrected_transcript"),
            "speech_type": clip.get("speech_type"),
            "duration_seconds": clip.get("duration_seconds"),
            "processing_status": clip.get("processing_status", "unknown"),
            "device_type": clip.get("device_type"),
            "language": clip.get("language"),
            "created_at": clip.get("created_at").isoformat() if clip.get("created_at") else None
        }

    except Exception as e:
        logger.error(f"Error fetching audio clip: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching audio clip")

@router.delete("/audio-clips/{clip_id}")
async def delete_audio_clip(
    clip_id: str,
    admin_id: str = Depends(get_current_admin_user_id)
):
    """Delete audio clip"""
    try:
        result = await db.audio_clips.delete_one({"_id": ObjectId(clip_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Audio clip not found")

        return {"message": "Audio clip deleted successfully"}

    except Exception as e:
        logger.error(f"Error deleting audio clip: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting audio clip")