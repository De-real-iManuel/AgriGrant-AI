from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.responses import StreamingResponse
from typing import Optional, Dict, Any
import httpx
from pydantic import BaseModel
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
    get_farmer_profile_db,
    save_farmer_profile_db,
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
    "ogun", "ondo", "osun", "oyo", "plateau", "rivers", "sokoto", "taraba", "yobe", "zamfara",
    "fct", "abuja", "fct abuja", "fct (abuja)",  # all common variants the frontend may send
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



# ─────────────────────── RESUBMIT (edit & re-run) ───────────────────────
# Lets a farmer make corrections to their previously-saved profile and re-submit
# without re-entering everything. Frontend just sends `{ userId, corrections }`
# where `corrections` is a partial dict — only the fields the farmer changed.

class ResubmitRequest(BaseModel):
    userId: str
    sessionId: Optional[str] = None
    corrections: Dict[str, Any] = {}    # partial overrides on top of saved profile


def _profile_row_to_submission_dict(row: Dict[str, Any]) -> Dict[str, Any]:
    """Map snake_case farmer_profiles row → camelCase FarmerSubmission shape."""
    return {
        "farmerName":             row.get("farmer_name", ""),
        "farmerEmail":            row.get("farmer_email", ""),
        "farmerPhone":            row.get("farmer_phone", ""),
        "residentialAddress":     row.get("residential_address", ""),
        "stateOfResidence":       row.get("state_of_residence", ""),
        "lga":                    row.get("lga", ""),
        "farmAddress":            row.get("farm_address", ""),
        "farmType":               row.get("farm_type") or "Mixed Farming",
        "cropOrLivestockTypes":   row.get("crop_or_livestock_types") or [],
        "farmSizeHectares":       row.get("farm_size_hectares"),
        "annualRevenueNGN":       row.get("annual_revenue_ngn"),
        "farmingExperienceYears": row.get("farming_experience_years"),
        "fundingPurpose":         row.get("funding_purpose", ""),
        "projectTitle":           row.get("project_title", ""),
        "projectDescription":     row.get("project_description", ""),
        "requestedAmount":        row.get("requested_amount"),
        "farmingChallenges":      row.get("farming_challenges", ""),
        "previousGrants":         row.get("previous_grants", ""),
        "isSmallholderFarmer":    bool(row.get("is_smallholder_farmer")),
        "isYouthFarmer":          bool(row.get("is_youth_farmer")),
        "isWomanFarmer":          bool(row.get("is_woman_farmer")),
        "hasCACRegistration":     bool(row.get("has_cac_registration")),
        "hasLandDocument":        bool(row.get("has_land_document")),
        "isMemberOfCooperative":  bool(row.get("is_member_of_cooperative")),
        "hasBVN":                 bool(row.get("has_bvn")),
        "hasNoLoanDefault":       not bool(row.get("has_existing_loan_default")),
        "additionalNotes":        row.get("additional_notes", ""),
        "submissionMethod":       row.get("submission_method", "online"),
        "submissionPortalUrl":    row.get("submission_portal_url", ""),
        "currentStatus":          row.get("current_status", "pending"),
        "documentsChecklist":     row.get("documents_checklist", ""),
        "agentAction":            row.get("agent_action", "submit_application"),
        "preferredLanguage":      row.get("preferred_language", "en"),
        "ninDocument":            row.get("nin_document_path"),
        "cacDocument":            row.get("cac_document_path"),
        "bankStatement":          row.get("bank_statement_path"),
        "landDocument":           row.get("land_document_path"),
    }


@router.post("/resubmit", response_model=PipelineSubmitResponse, status_code=202)
async def resubmit_pipeline(
    request: ResubmitRequest,
    client: httpx.AsyncClient = Depends(get_http_client),
):
    """
    Re-runs the pipeline using the farmer's previously-saved profile, with
    optional `corrections` merged on top. Persists the corrections back to the
    profile so subsequent runs use the new values.

    Frontend flow: load profile via GET /api/profile/{userId} → user edits a
    field → POST /api/pipeline/resubmit { userId, corrections: { fieldX: ... } }.
    """
    saved = await get_farmer_profile_db(request.userId)
    if not saved:
        raise HTTPException(
            status_code=404,
            detail="No saved profile for this user. Submit /api/pipeline/submit first.",
        )

    # Merge: saved profile → corrections override
    merged = _profile_row_to_submission_dict(saved)
    if request.corrections:
        merged.update({k: v for k, v in request.corrections.items() if v is not None})

    merged["userId"] = request.userId
    merged["sessionId"] = request.sessionId or ""

    # Persist the corrected version so future GETs return the latest values
    try:
        await save_farmer_profile_db(request.userId, merged, document_paths=None)
    except Exception:
        pass  # non-fatal; pipeline run continues

    # Validate + run through the same pipeline path as a fresh /submit
    try:
        submission = FarmerSubmission(**merged)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation failed: {e}")

    res_dict = await create_pipeline_submission(submission, client)
    return PipelineSubmitResponse(**res_dict)


@router.get("/resubmit/{user_id}/preview")
async def resubmit_preview(user_id: str):
    """
    Returns the saved profile in FarmerSubmission shape — frontend uses this to
    pre-fill the edit form before resubmit.
    """
    saved = await get_farmer_profile_db(user_id)
    if not saved:
        raise HTTPException(status_code=404, detail="No saved profile.")
    return _profile_row_to_submission_dict(saved)
