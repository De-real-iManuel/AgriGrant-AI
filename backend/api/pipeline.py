from fastapi import APIRouter, Depends, HTTPException, status, Header
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
    Validates input rules and checks for automatic loan disqualifications.
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

    # 4. Check for automatic loan defaults
    if submission.hasExistingLoanDefault:
        return PipelineSubmitResponse(
            jobId="disqualified-loan-default",
            applicationReference="AGR-000000",
            status="DISQUALIFIED",
            estimatedWaitSeconds=0,
            message="Existing loan default disqualifies from CBN/NIRSAL/BOA programs. Please resolve outstanding CRMS record first.",
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
    if job_id == "disqualified-loan-default":
        return PipelineStatusResponse(
            jobId=job_id,
            state="FAILED",
            progress=100,
            currentStep="Disqualified",
            result=None,
            error="Existing loan default disqualifies from CBN/NIRSAL/BOA programs. Please resolve outstanding CRMS record first."
        )

    res_dict = await get_pipeline_job_status(job_id, client)
    return PipelineStatusResponse(**res_dict)
