"""HITL — fetch and complete Action Center tasks for the frontend HITL page.

Browser → FastAPI → Orchestrator. The PAT never leaves the backend.
Also exposes webhooks so UiPath workflows/agents can call back into the backend.
All backend-native tasks are persisted in Supabase (hitl_tasks table).
"""
import json
import logging
import uuid
from typing import Any, Dict, List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from core.config import settings
from uipath.auth import get_uipath_token
from services.database_service import (
    save_hitl_task_db,
    get_hitl_task_db,
    list_hitl_tasks_db,
    update_hitl_task_status_db,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/hitl", tags=["HITL"])


async def _get_http_client():
    async with httpx.AsyncClient() as client:
        yield client


def _orchestrator_base() -> str:
    return f"https://cloud.uipath.com/{settings.UIPATH_ORGANIZATION}/{settings.UIPATH_TENANT}/orchestrator_"


def _headers(token: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "X-UIPATH-OrganizationUnitId": str(settings.UIPATH_FOLDER_ID),
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _build_envelope(task: Dict[str, Any]) -> Dict[str, Any]:
    """Shape the Orchestrator task into the envelope the HITL frontend expects."""
    raw_data = task.get("Data")
    parsed: Dict[str, Any] = {}
    if isinstance(raw_data, str):
        try:
            parsed = json.loads(raw_data)
        except Exception:
            parsed = {"_parseError": True, "_raw": raw_data}
    elif isinstance(raw_data, dict):
        parsed = raw_data

    assigned = task.get("AssignedToUser") or {}
    return {
        "taskId": task.get("Id"),
        "title": task.get("Title", ""),
        "status": task.get("Status", ""),
        "priority": task.get("Priority", ""),
        "creationTime": task.get("CreationTime"),
        "lastModificationTime": task.get("LastModificationTime"),
        "assignedToUser": {
            "id": assigned.get("Id"),
            "userName": assigned.get("UserName"),
            "name": assigned.get("Name"),
            "emailAddress": assigned.get("EmailAddress"),
        } if assigned else None,
        "tags": task.get("Tags", []),
        "taskType": task.get("Type", "FormTask"),
        "actions": task.get("Actions", []),
        "body": parsed,
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  Pydantic models for webhooks / callbacks
# ═══════════════════════════════════════════════════════════════════════════════

class HITLTaskCreateRequest(BaseModel):
    title: str = Field(..., description="Task title shown in Action Center")
    description: Optional[str] = Field("", description="Task body / form data")
    taskType: str = Field("FormTask", description="Task type: FormTask, ExternalTask, etc.")
    priority: str = Field("Medium", description="Low | Medium | High")
    assignedToUserId: Optional[int] = Field(None, description="Orchestrator user ID to assign")
    tags: List[str] = Field(default_factory=list)
    actions: List[str] = Field(default_factory=list)
    callbackUrl: Optional[str] = Field(None, description="URL for UiPath to call when task completes")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Extra context passed through")


class HITLTaskCreatedResponse(BaseModel):
    success: bool
    taskId: str
    status: str
    message: str


class HITLTaskCompleteWebhook(BaseModel):
    taskId: str
    decision: str
    completedBy: Optional[str] = None
    completedAt: Optional[str] = None
    formData: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HITLTaskStatusUpdate(BaseModel):
    taskId: str
    status: str
    assignee: Optional[str] = None
    updatedAt: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ═══════════════════════════════════════════════════════════════════════════════
#  Orchestrator proxy endpoints (frontend → backend → Orchestrator)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/tasks/{task_id}")
async def get_task(task_id: str, client: httpx.AsyncClient = Depends(_get_http_client)):
    """Fetch a single Action Center task and return a clean envelope for the HITL UI."""
    token = await get_uipath_token(client)
    if not token:
        raise HTTPException(status_code=502, detail={"code": "UPSTREAM_AUTH_FAILED", "message": "Could not obtain UiPath access token"})

    url = f"{_orchestrator_base()}/odata/Tasks({task_id})?$expand=AssignedToUser,Tags"
    try:
        r = await client.get(url, headers=_headers(token), timeout=15.0)
    except Exception as e:
        logger.error(f"HITL get_task transport error: {e}")
        raise HTTPException(status_code=502, detail={"code": "UPSTREAM_FAILED", "message": str(e)})

    if r.status_code == 404:
        raise HTTPException(status_code=404, detail={"code": "TASK_NOT_FOUND", "message": f"Task {task_id} not found"})
    if r.status_code == 401:
        raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED", "message": "Orchestrator rejected the token"})
    if r.status_code >= 400:
        logger.error(f"HITL get_task upstream {r.status_code}: {r.text}")
        raise HTTPException(status_code=502, detail={"code": "UPSTREAM_FAILED", "message": f"Orchestrator returned {r.status_code}", "details": r.text})

    return {"success": True, "envelope": _build_envelope(r.json())}


@router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str, payload: Dict[str, Any], client: httpx.AsyncClient = Depends(_get_http_client)):
    """Complete an Action Center task. Payload: { taskType, decision }."""
    task_type = payload.get("taskType")
    decision = payload.get("decision")
    if not task_type or decision is None:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_FAILED", "message": "taskType and decision are required"})

    token = await get_uipath_token(client)
    if not token:
        raise HTTPException(status_code=502, detail={"code": "UPSTREAM_AUTH_FAILED", "message": "Could not obtain UiPath access token"})

    url = f"{_orchestrator_base()}/odata/Tasks({task_id})/UiPath.Server.Configuration.OData.CompleteTask"
    body = {
        "action": "complete",
        "data": json.dumps({
            "taskType": task_type,
            "decision": decision,
        }),
    }
    try:
        r = await client.post(url, headers=_headers(token), json=body, timeout=15.0)
    except Exception as e:
        logger.error(f"HITL complete_task transport error: {e}")
        raise HTTPException(status_code=502, detail={"code": "UPSTREAM_FAILED", "message": str(e)})

    if r.status_code == 404:
        raise HTTPException(status_code=404, detail={"code": "TASK_NOT_FOUND", "message": f"Task {task_id} not found"})
    if r.status_code == 409:
        raise HTTPException(status_code=409, detail={"code": "TASK_ALREADY_COMPLETED", "message": "Task already completed"})
    if r.status_code >= 400:
        logger.error(f"HITL complete_task upstream {r.status_code}: {r.text}")
        raise HTTPException(status_code=502, detail={"code": "UPSTREAM_FAILED", "message": f"Orchestrator returned {r.status_code}", "details": r.text})

    # Also update local DB record if we tracked this task
    await update_hitl_task_status_db(task_id, status="Completed", decision=decision)

    return {"success": True, "taskId": task_id, "status": "completed"}


# ═══════════════════════════════════════════════════════════════════════════════
#  Backend-native HITL endpoints (UiPath calls these)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/tasks", response_model=HITLTaskCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_hitl_task(request: HITLTaskCreateRequest):
    """
    Create a HITL task record in the backend.
    UiPath workflows/agents call this to register a task that needs human approval.
    """
    task_id = str(uuid.uuid4())
    await save_hitl_task_db(
        task_id=task_id,
        title=request.title,
        description=request.description,
        task_type=request.taskType,
        priority=request.priority,
        status="Pending",
        assigned_to_user_id=request.assignedToUserId,
        tags=request.tags,
        actions=request.actions or ["approve", "reject"],
        callback_url=request.callbackUrl,
        metadata=request.metadata,
        source="backend",
    )
    logger.info(f"HITL task created: {task_id} — {request.title}")
    return HITLTaskCreatedResponse(
        success=True,
        taskId=task_id,
        status="Pending",
        message="Task registered. Awaiting human approval.",
    )


@router.get("/tasks")
async def list_hitl_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    task_type: Optional[str] = Query(None, alias="taskType"),
    job_id: Optional[str] = Query(None, alias="jobId"),
    limit: int = Query(50, ge=1, le=200),
):
    """List HITL tasks stored in the backend (from Supabase). Isolates tasks by jobId for multi-tenant safety."""
    tasks = await list_hitl_tasks_db(
        status_filter=status_filter, 
        task_type=task_type, 
        job_id=job_id,
        limit=limit
    )
    return {"success": True, "count": len(tasks), "tasks": tasks}


@router.get("/tasks/backend/{task_id}")
async def get_backend_task(task_id: str):
    """Fetch a single backend-stored HITL task (not Orchestrator)."""
    task = await get_hitl_task_db(task_id)
    if not task:
        raise HTTPException(status_code=404, detail={"code": "TASK_NOT_FOUND", "message": f"Backend task {task_id} not found"})
    return {"success": True, "task": task}


@router.post("/tasks/backend/{task_id}/complete")
async def complete_backend_task(task_id: str, payload: Dict[str, Any]):
    """
    Complete a backend-stored HITL task directly (no Orchestrator involved).
    Frontend calls this when the user approves/rejects via your custom UI.
    """
    task = await get_hitl_task_db(task_id)
    if not task:
        raise HTTPException(status_code=404, detail={"code": "TASK_NOT_FOUND", "message": f"Backend task {task_id} not found"})

    decision = payload.get("decision")
    if decision is None:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_FAILED", "message": "decision is required"})

    await update_hitl_task_status_db(
        task_id=task_id,
        status="Completed",
        decision=decision,
        form_data=payload.get("formData", {}),
    )

    # If a callback URL was registered (or default to Orchestrator PORTAL_URL), fire it securely from the backend
    callback_url = task.get("callback_url") or "https://www.api.agrigrant.xyz/v1"
    
    if callback_url and payload.get("formData"):
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    callback_url,
                    json=payload.get("formData", {}),
                    timeout=10.0,
                )
            logger.info(f"HITL secure relay fired for task {task_id} → {callback_url}")
        except Exception as e:
            logger.warning(f"HITL secure relay failed for task {task_id}: {e}")

    return {"success": True, "taskId": task_id, "status": "completed", "decision": decision}


# ═══════════════════════════════════════════════════════════════════════════════
#  Webhooks — UiPath calls these to push status updates into the backend
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/webhook/task-created")
async def webhook_task_created(payload: HITLTaskCreateRequest):
    """
    Webhook: UiPath Action Center / Maestro calls this when a new task is created.
    Stores the task in backend so the frontend can discover it.
    """
    task_id = str(uuid.uuid4())
    await save_hitl_task_db(
        task_id=task_id,
        title=payload.title,
        description=payload.description,
        task_type=payload.taskType,
        priority=payload.priority,
        status="Pending",
        assigned_to_user_id=payload.assignedToUserId,
        tags=payload.tags,
        actions=payload.actions,
        callback_url=payload.callbackUrl,
        metadata=payload.metadata,
        source="webhook",
    )
    logger.info(f"Webhook: HITL task created from UiPath — {task_id}")
    return {"success": True, "taskId": task_id, "message": "Task recorded"}


@router.post("/webhook/task-completed")
async def webhook_task_completed(payload: HITLTaskCompleteWebhook):
    """
    Webhook: UiPath calls this when a human completes a task in Action Center.
    """
    task_id = payload.taskId
    task = await get_hitl_task_db(task_id)
    if not task:
        # Accept unknown tasks — create a minimal record
        await save_hitl_task_db(
            task_id=task_id,
            title="Unknown Task",
            status="Completed",
            source="webhook",
        )
        logger.info(f"Webhook: unknown task completed — {task_id}")
    await update_hitl_task_status_db(
        task_id=task_id,
        status="Completed",
        decision=payload.decision,
        completed_by=payload.completedBy,
        form_data=payload.formData,
    )
    logger.info(f"Webhook: task completed — {task_id} → decision={payload.decision}")
    return {"success": True, "taskId": task_id, "status": "completed"}


@router.post("/webhook/task-status")
async def webhook_task_status(payload: HITLTaskStatusUpdate):
    """
    Webhook: UiPath calls this on task status changes (assigned, unassigned, etc.).
    """
    task_id = payload.taskId
    task = await get_hitl_task_db(task_id)
    if not task:
        await save_hitl_task_db(
            task_id=task_id,
            title="Status Update Task",
            status=payload.status,
            source="webhook",
        )
        logger.info(f"Webhook: new task status — {task_id} → {payload.status}")
    else:
        await update_hitl_task_status_db(task_id=task_id, status=payload.status)
        logger.info(f"Webhook: task status update — {task_id} → {payload.status}")

    return {"success": True, "taskId": task_id, "status": payload.status}
