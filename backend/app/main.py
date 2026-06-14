from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import chat, pipeline, documents, farmer

settings = get_settings()

app = FastAPI(
    title="AgricGrant AI Backend",
    description="LLM-powered backend for Nigerian Agricultural Grant Application Platform",
    version="1.0.0",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(pipeline.router, prefix="/api/pipeline", tags=["Pipeline"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(farmer.router, prefix="/api/farmer", tags=["Farmer"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "agrigrant-ai-backend"}
