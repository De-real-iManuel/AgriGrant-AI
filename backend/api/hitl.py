"""HITL — Action Center proxy.

Browser → FastAPI → Orchestrator Tasks API.
The PAT never leaves the backend. The Maestro process is the source of truth:
- A pending Action Center task means Maestro is paused waiting for a human.
- Completing the task via CompleteAppTask makes Maestro resume automatically.
- ExternalTag = sessionId — that's how we find a farmer's tasks.
"""
import json
import logging
from typing import Any, Dict, Optional
import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/hitl", tags=["HITL"])


# ─────────────────────────────────────────────────────────────────────────────
#  Orchestrator helpers
# ─────────────────────────────────────────────────────────────────────────────

def _orch_base() -> str:
    return (
        f"https://cloud.uipath.com/"
        f"{settings.UIPATH_ORGANIZATION}/{settings.UIPATH_TENANT}/orchestrator_"
    )


def _headers() -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {settings.UIPATH_PAT}",
        "X-UIPATH-OrganizationUnitId": str(settings.UIPATH_FOLDER_ID),
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _parse_maybe_json(value: Any) -> Any:
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return value
    return value


def _shape_task(t: Dict[str, Any]) -> Dict[str, Any]:
    """Reshape an Orchestrator Task into the envelope the HITL UI expects.

    Maestro `Create App Task` activities pass `taskType` and a stringified
    `payload` through SimpleApprovalApp inputs — we surface both here.
    """
    data = _parse_maybe_json(t.get("Data") or {})
    if not isinstance(data, dict):
        data = {"_raw": data}
    payload = _parse_maybe_json(data.get("payload") or {})
    if not isinstance(payload, dict):
        payload = {"_raw": payload}

    return {
        "task_id":      str(t.get("Id", "")),
        "task_key":     t.get("Key", ""),
        "title":        t.get("Title", ""),
        "status":       t.get("Status", ""),
        "priority":     t.get("Priority", ""),
        "task_type":    data.get("taskType", "unknown"),
        "external_tag": t.get("ExternalTag", ""),
        "data":         data,
        "payload":      payload,
        "created":      t.get("CreationTime"),
        "modified":     t.get("LastModificationTime"),
    }


# ─────────────────────────────────────────────────────────────────────────────
#  Endpoints — pure Action Center proxy
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/actioncenter/pending")
async def list_pending(
    tag: str = Query(..., description="Farmer's jobId — must match ExternalTag on Maestro's HITL node."),
):
    """List Action Center tasks waiting on this farmer.

    The frontend polls this every ~10s. Returns 0..N tasks depending on which
    HITL the Maestro process is currently paused at.
    """
    # OData filter: Unassigned/Pending and matching the farmer
    filt = (
        f"(Status eq 'Unassigned' or Status eq 'Pending') "
        f"and ExternalTag eq '{tag}'"
    )
    url = (
        f"{_orch_base()}/odata/Tasks"
        f"?$filter={filt}"
        f"&$orderby=CreationTime desc"
    )

    async with httpx.AsyncClient(timeout=15.0) as c:
        r = await c.get(url, headers=_headers())

    if r.status_code == 401:
        raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED",
                                                     "message": "PAT rejected by Orchestrator"})
    if r.status_code >= 400:
        logger.error(f"Orchestrator list tasks {r.status_code}: {r.text}")
        raise HTTPException(status_code=502, detail={"code": "UPSTREAM_FAILED",
                                                     "status": r.status_code, "body": r.text})

    raw = r.json().get("value", []) or []
    tasks = [_shape_task(t) for t in raw]
    return {"success": True, "count": len(tasks), "tasks": tasks}


@router.get("/actioncenter/task/{task_id}")
async def get_task(task_id: int):
    """Fetch one Action Center task — handy for debugging / direct deep-links."""
    url = f"{_orch_base()}/odata/Tasks({task_id})"
    async with httpx.AsyncClient(timeout=15.0) as c:
        r = await c.get(url, headers=_headers())

    if r.status_code == 404:
        raise HTTPException(status_code=404, detail={"code": "TASK_NOT_FOUND"})
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail={"code": "UPSTREAM_FAILED",
                                                     "body": r.text})
    return {"success": True, "task": _shape_task(r.json())}


class CompletePayload(BaseModel):
    taskId: int
    action: str = "Approved"          # outcome key configured on SimpleApprovalApp
    data: Dict[str, Any] = {}         # output vars Maestro will read on resume


@router.post("/actioncenter/complete")
async def complete_task(payload: CompletePayload):
    """Complete an Action Center AppTask → Maestro process auto-resumes.

    `data` becomes the App outputs in the Maestro `Create App Task` node and
    populates the variables you mapped (selectedGrantName, uploadedDocumentsJson,
    proposalDecision, appealDecision, etc.).
    """
    url = f"{_orch_base()}/tasks/AppTasks/CompleteAppTask"
    body = {"taskId": payload.taskId, "action": payload.action, "data": payload.data}

    async with httpx.AsyncClient(timeout=15.0) as c:
        r = await c.post(url, headers=_headers(), json=body)

    if r.status_code >= 400:
        logger.error(f"CompleteAppTask {r.status_code}: {r.text}")
        raise HTTPException(status_code=502, detail={"code": "UPSTREAM_FAILED",
                                                     "status": r.status_code,
                                                     "body": r.text})

    logger.info(f"AppTask {payload.taskId} completed with action={payload.action}")
    return {
        "success": True,
        "taskId":  payload.taskId,
        "action":  payload.action,
        "message": "Action Center task completed — Maestro process will resume.",
    }


@router.get("/health")
async def hitl_health():
    """Quick connectivity probe — returns 200 if the PAT can hit Orchestrator."""
    url = f"{_orch_base()}/odata/Tasks?$top=1"
    try:
        async with httpx.AsyncClient(timeout=8.0) as c:
            r = await c.get(url, headers=_headers())
        return {
            "ok": r.status_code < 400,
            "orchestrator_status": r.status_code,
            "org":     settings.UIPATH_ORGANIZATION,
            "tenant":  settings.UIPATH_TENANT,
            "folder":  str(settings.UIPATH_FOLDER_ID),
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}
