import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status
from typing import Optional, Dict
import logging
import os

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Allowed image types
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file: UploadFile) -> None:
    """Validate uploaded image file"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )
    
    extension = file.filename.split(".")[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

async def upload_profile_picture(
    file: UploadFile, 
    user_id: str,
    old_public_id: Optional[str] = None
) -> Dict[str, str]:
    """
    Upload profile picture to Cloudinary
    """
    try:
        # Validate image
        validate_image(file)
        
        # Read file content
        contents = await file.read()
        
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 5MB limit"
            )
        
        # Delete old image if exists
        if old_public_id:
            try:
                cloudinary.uploader.destroy(old_public_id)
                logger.info(f"Deleted old profile picture: {old_public_id}")
            except Exception as e:
                logger.warning(f"Failed to delete old image: {e}")
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            contents,
            folder=f"articuLink/profiles/{user_id}",
            transformation=[
                {"width": 500, "height": 500, "crop": "fill", "gravity": "face"},
                {"quality": "auto:good"},
                {"fetch_format": "auto"}
            ],
            resource_type="image"
        )
        
        logger.info(f"Successfully uploaded profile picture for user {user_id}")
        
        return {
            "secure_url": upload_result["secure_url"],
            "public_id": upload_result["public_id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cloudinary upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image"
        )

async def delete_profile_picture(public_id: str) -> bool:
    """Delete profile picture from Cloudinary"""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        logger.error(f"Failed to delete image: {e}")
        return False

def extract_public_id_from_url(url: str) -> str | None:
    """
    Extract Cloudinary public_id from URL
    """
    try:
        url_parts = url.split("/upload/")
        if len(url_parts) > 1:
            path_parts = url_parts[1].split("/", 1)
            if len(path_parts) > 1:
                return path_parts[1].rsplit(".", 1)[0]
    except Exception as e:
        logger.error(f"Failed to extract public_id from URL: {str(e)}")
    return None