import uvicorn
from fastapi import FastAPI, APIRouter
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
    version="1.1.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
origins = [
    "http://localhost:4028",        # Frontend dev server
    "http://localhost:3000",        # Fallback
    "https://agrigrant.xyz",        # Production root
    "https://www.agrigrant.xyz",    # Production www
    "https://api.agrigrant.xyz",    # Production API subdomain
    "https://v1.api.agrigrant.xyz", # Legacy versioned subdomain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────────────────────
# Versioned API — all routes live under /v1/...
# Frontend should call:  https://api.agrigrant.xyz/v1/api/pipeline/submit
# When v2 ships, add a second parent router with prefix="/v2".
# ──────────────────────────────────────────────────────────────────────────
v1 = APIRouter(prefix="/v1")
v1.include_router(pipeline_router)
v1.include_router(chat_router)
v1.include_router(health_router)
v1.include_router(profile_router)
v1.include_router(farmer_router)

app.include_router(v1)

# Backwards-compat: keep legacy un-versioned routes alive so the previous
# frontend / monitors don't break during the cutover. Remove once v2 ships.
app.include_router(pipeline_router)
app.include_router(chat_router)
app.include_router(health_router)
app.include_router(profile_router)
app.include_router(farmer_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
