# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.scheduler import start_scheduler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Your App API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include your routers
from app.routers import users, auth  # adjust based on your actual routers

app.include_router(users.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")

# Start the scheduler when the app starts
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting application...")
    start_scheduler()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Application shutting down...")

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)