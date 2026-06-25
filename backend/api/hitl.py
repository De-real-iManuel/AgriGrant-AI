"""HITL — fetch and complete Action Center tasks for the frontend HITL page.

Browser → FastAPI → Orchestrator. The PAT never leaves the backend.
"""
import json
import logging
from typing import Any, Dict
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from core.config import settings
from uipath.auth import get_uipath_token

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

    return {"success": True, "taskId": task_id, "status": "completed"}
