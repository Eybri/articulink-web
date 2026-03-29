import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from app.utils.password import hash_password  # Import your password hashing

load_dotenv()

async def reset_password():
    uri = os.getenv("MONGO_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    
    # Find the admin user
    admin = await db.users.find_one({"email": "admin@gmail.com"})
    
    if admin:
        # Reset password to something simple
        from app.utils.password import hash_password
        new_password = "admin123"
        hashed = hash_password(new_password)
        
        await db.users.update_one(
            {"_id": admin["_id"]},
            {"$set": {"password": hashed}}
        )
        print(f"✅ Password reset for admin@gmail.com to: {new_password}")
    else:
        print("❌ Admin user not found")
    
    await client.close()

asyncio.run(reset_password())