"""
Chat Router — /api/chat/start and /api/chat/message
These are the endpoints your Next.js frontend already calls.
"""
import uuid
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import get_settings
from app.services.llm_service import chat_completion

settings = get_settings()
router = APIRouter()

# ─── In-memory session store (replace with DB in production) ─────────────────
sessions: dict[str, dict] = {}


class StartRequest(BaseModel):
    farmerName: str | None = None
    farmerProfile: dict | None = None


class StartResponse(BaseModel):
    sessionId: str
    token: str
    greeting: str


class MessageRequest(BaseModel):
    sessionId: str
    message: str


class MessageResponse(BaseModel):
    message: dict


# ─── POST /api/chat/start ────────────────────────────────────────────────────
@router.post("/start", response_model=StartResponse)
async def start_chat(req: StartRequest):
    """Create a new chat session and return a personalized greeting."""
    session_id = str(uuid.uuid4())

    # Generate JWT token for this session
    token = jwt.encode(
        {"session_id": session_id, "exp": datetime.utcnow() + timedelta(hours=24)},
        settings.secret_key,
        algorithm="HS256",
    )

    # Build greeting based on profile
    farmer_name = req.farmerName or "there"
    first_name = farmer_name.split(" ")[0] if farmer_name != "there" else "there"

    if req.farmerProfile:
        farm_type = req.farmerProfile.get("farmType", "")
        state = req.farmerProfile.get("stateOfResidence", "")
        size = req.farmerProfile.get("farmSizeHectares", "")

        greeting = (
            f"Hello {first_name}! 👋\n\n"
            f"I can see you're running a {size}-hectare {farm_type.lower()} farm in {state}. "
            f"I've loaded your profile and I'm ready to help you find grants, check your eligibility, "
            f"or even submit applications automatically.\n\n"
            f"What would you like to do today?"
        )
    else:
        greeting = (
            f"Hello {first_name}! 👋\n\n"
            f"I'm your AgriGrant AI Advisor. I can help you discover Nigerian agricultural grants, "
            f"check your eligibility, write proposals, and even submit applications for you.\n\n"
            f"For personalized recommendations, complete your farm profile in the intake form. "
            f"Otherwise, feel free to ask me anything about agricultural funding!"
        )

    # Store session
    sessions[session_id] = {
        "farmer_profile": req.farmerProfile,
        "farmer_name": farmer_name,
        "history": [
            {"role": "assistant", "content": greeting}
        ],
        "created_at": datetime.utcnow().isoformat(),
    }

    return StartResponse(sessionId=session_id, token=token, greeting=greeting)


# ─── POST /api/chat/message ──────────────────────────────────────────────────
@router.post("/message", response_model=MessageResponse)
async def send_message(req: MessageRequest):
    """Process a user message through the LLM and return the response."""
    session = sessions.get(req.sessionId)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Please start a new conversation.")

    # Add user message to history
    session["history"].append({"role": "user", "content": req.message})

    # Call LLM with conversation history + farmer profile
    try:
        result = await chat_completion(
            conversation_history=session["history"],
            farmer_profile=session.get("farmer_profile"),
        )
    except Exception as e:
        # Log error, return graceful fallback
        print(f"LLM Error: {e}")
        result = {
            "content": "I'm experiencing a temporary issue processing your request. Please try again in a moment.",
            "suggested_actions": [{"label": "Try Again", "action": "RETRY"}],
        }

    # Add assistant response to history
    session["history"].append({"role": "assistant", "content": result["content"]})

    return MessageResponse(
        message={
            "content": result["content"],
            "timestamp": datetime.utcnow().isoformat(),
            "suggestedActions": result.get("suggested_actions", []),
            "pipelineStatus": result.get("pipeline_status"),
        }
    )
