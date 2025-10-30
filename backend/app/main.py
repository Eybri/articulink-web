# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users  # Import users router
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI(title="ArticuLink Admin API")

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api", tags=["users"])  # Add users router

@app.get("/")
async def root():
    return {"message": "ArticuLink API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}