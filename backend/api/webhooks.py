from fastapi import APIRouter, Request
import logging
import uuid
from services.database_service import save_hitl_task_db

logger = logging.getLogger(__name__)
router = APIRouter(tags=["UiPath Webhooks"])

@router.post("/{task_name}")
async def generic_uipath_webhook(task_name: str, request: Request):
    """
    Catch-all for UiPath Orchestrator HTTP Request webhooks (e.g., /v1/grant-selection).
    We accept the POST, parse the JSON, and create a pending HITL task in our DB.
    """
    # Exclude normal API prefixes so this doesn't conflict
    if task_name in ["api", "docs", "redoc", "openapi.json", "favicon.ico"]:
        return {"status": "ignored"}
    
    return await handle_webhook(task_name, request)

async def handle_webhook(task_name: str, request: Request):
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    task_id = str(uuid.uuid4())
    # Extract common fields if the UiPath dev passed them, fallback to generic
    title = payload.get("title", f"HITL Task: {task_name.replace('-', ' ').title()}")
    description = payload.get("description", "Awaiting human review")
    callback_url = payload.get("callbackUrl")

    await save_hitl_task_db(
        task_id=task_id,
        title=title,
        description=description,
        task_type=task_name,
        priority=payload.get("priority", "Medium"),
        status="Pending",
        tags=[task_name],
        actions=payload.get("actions", ["approve", "reject", "submit"]),
        callback_url=callback_url,
        metadata=payload,
        source="webhook",
    )
    logger.info(f"Webhook created HITL task '{task_name}' -> {task_id}")
    return {
        "success": True, 
        "taskId": task_id, 
        "message": f"Task {task_name} received and queued for human review."
    }
