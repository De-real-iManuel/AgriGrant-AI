import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

# Route Imports
from api.pipeline import router as pipeline_router
from api.chat import router as chat_router
from api.health import router as health_router
from api.profile import router as profile_router
from api.farmer import router as farmer_router

app = FastAPI(
    title="AgriGrant AI Backend",
    description="AI-powered Nigerian agricultural grant discovery and application backend",
    version="1.0.0"
)

# Configure CORS Origins as specified
origins = [
    "http://localhost:4028",  # Next.js dev server
    "http://localhost:3000",  # Fallback
    "https://agrigrant.xyz",  # Production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(pipeline_router)
app.include_router(chat_router)
app.include_router(health_router)
app.include_router(profile_router)
app.include_router(farmer_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
