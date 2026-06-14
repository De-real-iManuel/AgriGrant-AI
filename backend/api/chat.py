from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
import httpx
import json
import asyncio
import logging
from datetime import datetime, UTC

logger = logging.getLogger(__name__)

from core.security import create_chat_token, decode_chat_token
from api.models import (
    ChatStartRequest,
    ChatStartResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    ChatHistoryResponse,
    ChatMessage
)
from services.chat_service import (
    create_session,
    get_or_create_session,
    get_session,
    route_and_process_chat,
    edit_last_message
)

router = APIRouter(prefix="/api/chat", tags=["Chat"])
security = HTTPBearer()

async def get_http_client():
    async with httpx.AsyncClient() as client:
        yield client

def get_current_session_payload(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Dependency to validate JWT session token.
    """
    token = credentials.credentials
    return decode_chat_token(token)

@router.post("/start", response_model=ChatStartResponse)
async def start_chat(payload: ChatStartRequest):
    """
    Starts a new chat session and issues a 24-hour JWT token.
    """
    session = await get_or_create_session(
        farmer_name=payload.farmerName, 
        farmer_profile=payload.farmerProfile,
        session_id=payload.sessionId
    )
    
    # Generate token containing session identity
    token_data = {"session_id": session.session_id, "farmer_name": payload.farmerName}
    token = create_chat_token(token_data)

    greeting = (
        f"Hello {payload.farmerName}! I am AgriGrant AI. Tell me about your farm and I will help "
        f"you find grants you can apply for. You can ask me things like: 'What grants can I "
        f"get for poultry farming in Oyo State?' or 'Am I eligible for CBN Anchor Borrowers?'"
    )

    # Pre-populate session with the initial system/assistant greeting ONLY if it's a new session
    if len(session.messages) == 0:
        assistant_greeting = ChatMessage(
            role="assistant",
            content=greeting,
            timestamp=datetime.now(UTC)
        )
        session.messages.append(assistant_greeting)

    return ChatStartResponse(
        sessionId=session.session_id,
        token=token,
        greeting=greeting,
        messages=session.messages
    )

@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(
    payload: ChatMessageRequest,
    token_payload: Dict[str, Any] = Depends(get_current_session_payload),
    client: httpx.AsyncClient = Depends(get_http_client)
):
    """
    Sends a standard message, routes it to the agent, translates, and returns the response.
    """
    session = get_session(payload.sessionId)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found or expired")

    # Double check token authorization for this specific sessionId
    if token_payload.get("session_id") != payload.sessionId:
        raise HTTPException(status_code=403, detail="Not authorized for this session ID")

    response_msg = await route_and_process_chat(session, payload.message, client)
    return ChatMessageResponse(sessionId=payload.sessionId, message=response_msg)

@router.post("/edit", response_model=ChatMessageResponse)
async def edit_chat_message(
    payload: ChatMessageRequest,
    token_payload: Dict[str, Any] = Depends(get_current_session_payload),
    client: httpx.AsyncClient = Depends(get_http_client)
):
    """
    Edits the last user message by removing it and generating a new response.
    Reuses ChatMessageRequest since the structure is the same.
    """
    session = get_session(payload.sessionId)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found or expired")

    if token_payload.get("session_id") != payload.sessionId:
        raise HTTPException(status_code=403, detail="Not authorized for this session ID")

    # Remove the last user message and the AI response after it
    await edit_last_message(session)
    
    # Process the new edited message as usual
    response_msg = await route_and_process_chat(session, payload.message, client)
    return ChatMessageResponse(sessionId=payload.sessionId, message=response_msg)

@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    token_payload: Dict[str, Any] = Depends(get_current_session_payload)
):
    """
    Retrieves full conversation history.
    """
    if token_payload.get("session_id") != session_id:
        raise HTTPException(status_code=403, detail="Not authorized for this session ID")

    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return ChatHistoryResponse(
        sessionId=session_id,
        messages=session.messages,
        farmerProfile=session.farmer_profile
    )

@router.websocket("/ws/{session_id}")
async def websocket_chat_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket streaming endpoint for real-time chat interactions.
    Handles JWT validation on connect frame.
    """
    await websocket.accept()
    session = get_session(session_id)
    if not session:
        await websocket.send_json({"type": "error", "message": "Chat session not found or expired"})
        await websocket.close()
        return

    try:
        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            token = data.get("token")
            user_msg = data.get("message")

            if not token or not user_msg:
                await websocket.send_json({"type": "error", "message": "Missing token or message"})
                continue

            # Validate JWT
            try:
                payload = decode_chat_token(token)
                if payload.get("session_id") != session_id:
                    await websocket.send_json({"type": "error", "message": "Unauthorized token for this session"})
                    continue
            except Exception as e:
                await websocket.send_json({"type": "error", "message": f"Token verification failed: {str(e)}"})
                continue

            # Process chat message asynchronously. Since stream endpoint uses httpx, we trigger standard logic.
            # If streaming is not natively provided by Agent Hub's REST client (it uses complete response block),
            # we send a simulated series of chunks followed by the final 'done' event as defined in requirements.
            async with httpx.AsyncClient() as client:
                # Trigger the response fetch
                task = asyncio.create_task(route_and_process_chat(session, user_msg, client))
                
                # Send typing / planning chunks to keep client engaged
                await websocket.send_json({"type": "chunk", "content": "Thinking..."})
                await asyncio.sleep(0.5)
                await websocket.send_json({"type": "chunk", "content": "Analyzing farm profile..."})
                
                assistant_msg = await task
                
                # Stream actual content chunks
                words = assistant_msg.content.split(" ")
                current_text = ""
                for word in words:
                    current_text += word + " "
                    await websocket.send_json({"type": "chunk", "content": word + " "})
                    await asyncio.sleep(0.05) # simulate typing

                # Send standard complete done response
                await websocket.send_json({
                    "type": "done",
                    "content": assistant_msg.content,
                    "suggestedActions": assistant_msg.suggestedActions
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from session: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass
