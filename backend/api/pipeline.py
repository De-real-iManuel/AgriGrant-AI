from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.responses import StreamingResponse
from typing import Optional
import httpx
from api.models import (
    FarmerSubmission,
    PipelineSubmitResponse,
    PipelineStatusResponse
)
from services.pipeline_service import (
    create_pipeline_submission,
    get_pipeline_job_status
)
from services.event_broadcaster import subscribe as subscribe_events
from services.database_service import (
    get_pipeline_events_db,
    list_pipeline_jobs_for_user_db,
    list_chat_sessions_for_user_db,
    get_messages_db,
)

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline"])

# Global async client dependency
async def get_http_client():
    async with httpx.AsyncClient() as client:
        yield client

# Helper list of 36 Nigerian states + FCT
NIGERIAN_STATES = {
    "abia", "adamawa", "akwa ibom", "anambra", "bauchi", "bayelsa", "benue", "borno",
    "cross river", "delta", "ebonyi", "edo", "ekiti", "enugu", "gombe", "imo", "jigawa",
    "kaduna", "kano", "katsina", "kebbi", "kogi", "kwara", "lagos", "nasarawa", "niger",
    "ogun", "ondo", "osun", "oyo", "plateau", "rivers", "sokoto", "taraba", "yobe", "zamfara", "fct"
}

@router.post("/submit", response_model=PipelineSubmitResponse, status_code=status.HTTP_202_ACCEPTED)
async def submit_pipeline(
    submission: FarmerSubmission,
    client: httpx.AsyncClient = Depends(get_http_client)
):
    """
    Submits a farmer grant application form.
    Validates input rules and checks credit-history disqualification.
    """
    # 1. farmerName validation
    name_stripped = submission.farmerName.strip()
    if not name_stripped:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"errors": {"farmerName": "Farmer name cannot be empty"}, "status": "VALIDATION_ERROR", "message": "Validation failed"}
        )

    # 2. stateOfResidence validation
    state_clean = submission.stateOfResidence.strip().lower()
    if state_clean not in NIGERIAN_STATES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"errors": {"stateOfResidence": "Must be one of the 36 Nigerian states or FCT"}, "status": "VALIDATION_ERROR", "message": "Validation failed"}
        )

    # 3. fundingPurpose validation
    if len(submission.fundingPurpose.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"errors": {"fundingPurpose": "Funding purpose must be at least 3 characters long"}, "status": "VALIDATION_ERROR", "message": "Validation failed"}
        )

    # 4. Credit-history disqualification check (CRMS clearance required for federal grants)
    if not submission.hasNoLoanDefault:
        return PipelineSubmitResponse(
            jobId="disqualified-credit-history",
            applicationReference="AGR-000000",
            status="DISQUALIFIED",
            estimatedWaitSeconds=0,
            message="Federal grant programmes (CBN/NIRSAL/BOA) require CRMS clearance. Please resolve your outstanding credit record before applying.",
            farmerName=submission.farmerName
        )

    # Submit job through service
    res_dict = await create_pipeline_submission(submission, client)
    return PipelineSubmitResponse(**res_dict)

@router.get("/status/{job_id}", response_model=PipelineStatusResponse)
async def pipeline_status(
    job_id: str,
    application_ref: Optional[str] = None,
    client: httpx.AsyncClient = Depends(get_http_client)
):
    """
    Retrieves the status and result output of a grant matching job.
    """
    if job_id in ("disqualified-credit-history", "disqualified-loan-default"):
        return PipelineStatusResponse(
            jobId=job_id,
            state="FAILED",
            progress=100,
            currentStep="Disqualified",
            result=None,
            error="Federal grant programmes (CBN/NIRSAL/BOA) require CRMS clearance. Please resolve your outstanding credit record before applying."
        )

    res_dict = await get_pipeline_job_status(job_id, client)
    return PipelineStatusResponse(**res_dict)


@router.get("/events/{job_id}")
async def pipeline_events(job_id: str):
    """
    Server-Sent Events stream of live pipeline stage updates for a given job.
    The chat UI subscribes here to render agent/robot activity in real time.
    """
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",  # disable proxy buffering
    }
    return StreamingResponse(
        subscribe_events(job_id),
        media_type="text/event-stream",
        headers=headers,
    )


# ─────────────────────── HISTORY ENDPOINTS ───────────────────────
# Used by the chat UI to let a returning farmer review past pipeline runs
# and pick up the conversation where they left off.

@router.get("/events-history/{job_id}")
async def pipeline_events_history(job_id: str):
    """Persisted timeline of every stage event that fired for this job."""
    events = await get_pipeline_events_db(job_id)
    return {"jobId": job_id, "events": events, "count": len(events)}


@router.get("/history/{user_id}")
async def pipeline_history_for_user(user_id: str, limit: int = 50):
    """All past pipeline jobs for a farmer, newest first — drives the history sidebar."""
    jobs = await list_pipeline_jobs_for_user_db(user_id, limit=limit)
    return {"userId": user_id, "jobs": jobs, "count": len(jobs)}


@router.get("/full-history/{user_id}")
async def full_history_for_user(user_id: str, limit: int = 25):
    """
    One-shot payload for the chat history view: past chat sessions
    (with their messages) + linked pipeline jobs (with their event timelines).
    Lets the farmer reopen any conversation and continue from where they left off.
    """
    sessions = await list_chat_sessions_for_user_db(user_id, limit=limit)
    jobs = await list_pipeline_jobs_for_user_db(user_id, limit=limit)

    # Hydrate each session with its messages
    hydrated_sessions = []
    for s in sessions:
        sid = s.get("session_id")
        msgs = await get_messages_db(sid) if sid else []
        hydrated_sessions.append({**s, "messages": msgs})

    # Hydrate each job with its event timeline
    hydrated_jobs = []
    for j in jobs:
        jid = j.get("job_id")
        events = await get_pipeline_events_db(jid) if jid else []
        hydrated_jobs.append({**j, "events": events})

    return {
        "userId": user_id,
        "sessions": hydrated_sessions,
        "jobs": hydrated_jobs,
    }
