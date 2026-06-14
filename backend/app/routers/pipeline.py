"""
Pipeline Router — /api/pipeline/start, /status, /stream (SSE)
Triggers UiPath robot jobs and streams progress back to the frontend.
"""
import uuid
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

# In-memory pipeline tracking (replace with DB in production)
pipelines: dict[str, dict] = {}


class PipelineStartRequest(BaseModel):
    farmerId: str
    grantId: str | None = None
    grantName: str | None = None
    proposedProjectDescription: str | None = None
    requestedFundingNGN: float | None = None


class PipelineStartResponse(BaseModel):
    applicationId: str
    jobId: str | None
    status: str


@router.post("/start", response_model=PipelineStartResponse)
async def start_pipeline(req: PipelineStartRequest):
    """Start the full grant application pipeline (triggers UiPath robot)."""
    application_id = str(uuid.uuid4())

    pipelines[application_id] = {
        "status": "in_progress",
        "farmer_id": req.farmerId,
        "grant_name": req.grantName,
        "steps": [
            {"name": "Grant Discovery", "status": "completed", "icon": "🔍"},
            {"name": "Eligibility Check", "status": "completed", "icon": "📋"},
            {"name": "Proposal Generation", "status": "in_progress", "icon": "📝"},
            {"name": "Form Filling", "status": "pending", "icon": "🤖"},
            {"name": "Submission", "status": "pending", "icon": "✅"},
        ],
        "portal_reference": None,
        "error": None,
        "started_at": datetime.utcnow().isoformat(),
    }

    # TODO: Actually call UiPath Orchestrator here
    # from app.services.uipath_service import UiPathService
    # uipath = UiPathService()
    # job_id = await uipath.start_job(...)

    return PipelineStartResponse(
        applicationId=application_id,
        jobId=None,  # Will be UiPath job key
        status="started",
    )


@router.get("/status/{application_id}")
async def get_pipeline_status(application_id: str):
    """Get current pipeline status with step-by-step progress."""
    pipeline = pipelines.get(application_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Application not found")
    return pipeline


@router.get("/stream/{application_id}")
async def stream_pipeline(application_id: str):
    """SSE endpoint — streams real-time step updates to the frontend."""
    pipeline = pipelines.get(application_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Application not found")

    async def event_generator():
        """Yield SSE events as pipeline progresses."""
        # In production, this would poll UiPath job status
        # For now, simulate progression
        steps = pipeline["steps"]
        for i, step in enumerate(steps):
            if step["status"] == "pending":
                step["status"] = "in_progress"
                yield f"event: step_update\ndata: {{'step': '{step['name']}', 'status': 'in_progress'}}\n\n"
                await asyncio.sleep(3)  # Simulate work
                step["status"] = "completed"
                yield f"event: step_update\ndata: {{'step': '{step['name']}', 'status': 'completed'}}\n\n"

        pipeline["status"] = "completed"
        pipeline["portal_reference"] = "NAGAP-2026-" + str(uuid.uuid4())[:4].upper()
        yield f"event: completed\ndata: {{'portalReference': '{pipeline['portal_reference']}'}}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
