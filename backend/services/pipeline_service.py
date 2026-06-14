import random
import logging
from typing import Dict, Any, Optional
import httpx
from core.config import settings
from api.models import FarmerSubmission, PipelineOutput, MatchedGrant, FarmTypeEnum
from uipath.orchestrator import start_pipeline_job, poll_job_status
from services.language_service import translate_pipeline_output, make_farmer_friendly

logger = logging.getLogger(__name__)

# Cache/Storage for pipeline jobs that are run in mock mode
# structure: {job_id: {"status": str, "progress": int, "started_at": float, "result": PipelineOutput}}
MOCK_JOBS_STORE: Dict[str, Dict[str, Any]] = {}

def compute_mock_eligibility(form: FarmerSubmission) -> int:
    """
    Locally calculates a realistic eligibility score based on form factors.
    """
    score = 70  # Baseline
    if form.hasExistingLoanDefault:
        return 0
    if form.hasCACRegistration:
        score += 10
    else:
        score -= 10
    if form.hasLandDocument:
        score += 10
    if form.isMemberOfCooperative:
        score += 10
    if form.farmingExperienceYears and form.farmingExperienceYears >= 2:
        score += 5
    if form.farmSizeHectares and form.farmSizeHectares > 5:
        score += 5
    return min(max(score, 10), 100)

def compute_mock_trust_score(form: FarmerSubmission) -> tuple[int, list[dict]]:
    """
    Hackathon Mock: Generates a B2B 'Trust Score' based on verification points.
    In prod, this hits NIMC, CRMS, Satellite APIs.
    """
    score = 0
    breakdown = []
    
    if form.ninDocument:
        score += 20
        breakdown.append({"item": "National ID (NIN)", "points": 20, "status": "Verified (Mock NIMC API)"})
    else:
        breakdown.append({"item": "National ID (NIN)", "points": 0, "status": "Missing/Unverified"})
        
    if form.cacDocument or form.hasCACRegistration:
        score += 20
        breakdown.append({"item": "CAC Registry", "points": 20, "status": "Verified (Mock CAC API)"})
    else:
        breakdown.append({"item": "CAC Registry", "points": 0, "status": "Not Registered"})
        
    if form.hasBVN:
        score += 20
        breakdown.append({"item": "Bank Verification (BVN)", "points": 20, "status": "Verified"})
        
    if form.farmSizeHectares and form.farmSizeHectares > 0:
        score += 20
        breakdown.append({"item": "Farm Geo-Location", "points": 20, "status": "Geospatial coordinate match: 85% confidence"})
        
    if form.bankStatement:
        score += 20
        breakdown.append({"item": "Financial Health", "points": 20, "status": "6-month cash flow verified"})
        
    # Baseline floor
    if score == 0:
        score = 10
        
    return (score, breakdown)

def generate_mock_pipeline_output(form: FarmerSubmission) -> PipelineOutput:
    """
    Generates a high quality mock PipelineOutput matching the shape of the real UiPath response.
    """
    score = compute_mock_eligibility(form)
    trust_score, trust_breakdown = compute_mock_trust_score(form)
    
    all_grants = [
        MatchedGrant(
            grantName="CBN Anchor Borrowers Programme",
            grantingOrganization="Central Bank of Nigeria",
            matchScore=score,
            fundingAmountRange="₦500,000 – ₦5,000,000",
            applicationDeadline="Rolling — apply via DMB",
            matchReason=f"Strong match for {form.farmType} farmers in {form.stateOfResidence}. Smallholder focus aligns with your profile.",
            grantCategory="Federal Credit Scheme",
            applicationUrl="https://www.cbn.gov.ng"
        ),
        MatchedGrant(
            grantName="NIRSAL Agro-Geo-Cooperative Scheme",
            grantingOrganization="NIRSAL Plc",
            matchScore=score + 5 if form.isMemberOfCooperative else max(score - 15, 10),
            fundingAmountRange="₦1,000,000 – ₦50,000,000",
            applicationDeadline="Q3 2025",
            matchReason="Cooperative membership significantly increases eligibility under NIRSAL AGCS terms." if form.isMemberOfCooperative else "Partial match — joining a cooperative would improve eligibility significantly.",
            grantCategory="Guarantee & Credit",
            applicationUrl="https://www.nirsal.com"
        ),
        MatchedGrant(
            grantName="Bank of Agriculture MSME Loan",
            grantingOrganization="Bank of Agriculture (BOA)",
            matchScore=score + 8 if form.hasLandDocument else score,
            fundingAmountRange="₦200,000 – ₦20,000,000",
            applicationDeadline="Open — visit nearest BOA branch",
            matchReason=f"BOA specifically targets {form.stateOfResidence} farmers. { 'Land document strengthens collateral.' if form.hasLandDocument else '' }",
            grantCategory="Development Finance",
            applicationUrl="https://www.boanigeria.com"
        ),
        MatchedGrant(
            grantName="FMARD Youth in Agri-Business (PYXERA)",
            grantingOrganization="Federal Ministry of Agriculture & Rural Development",
            matchScore=score + 10 if form.isYouthFarmer else max(score - 20, 10),
            fundingAmountRange="₦250,000 – ₦2,000,000",
            applicationDeadline="April 30, 2025",
            matchReason="Youth farmer designation gives you priority under FMARD youth agri-business programme." if form.isYouthFarmer else "Age criteria not confirmed — verify if you qualify as a youth farmer (18–35).",
            grantCategory="Youth Empowerment",
            applicationUrl="https://www.fmard.gov.ng"
        ),
        MatchedGrant(
            grantName="AGSMEIS Women's Agri-Enterprise Grant",
            grantingOrganization="Bankers Committee / CBN",
            matchScore=score + 15 if form.isWomanFarmer else max(score - 30, 10),
            fundingAmountRange="₦500,000 – ₦10,000,000",
            applicationDeadline="June 15, 2025",
            matchReason="Designed specifically for women-led agricultural enterprises." if form.isWomanFarmer else "Limited eligibility without woman-led farm designation.",
            grantCategory="Women's Enterprise",
            applicationUrl="https://www.cbn.gov.ng/agsmeis"
        )
    ]
    # Sort by matchScore descending
    all_grants.sort(key=lambda g: g.matchScore, reverse=True)

    visible_grants = all_grants

    profile_gaps: list[str] = []
    if not form.hasCACRegistration:
        profile_gaps.append("Register with the Corporate Affairs Commission (CAC) to unlock federal grants.")
    if not form.hasLandDocument:
        profile_gaps.append("Obtain a Certificate of Occupancy (C of O) or Survey Plan to strengthen collateral.")
    if not form.isMemberOfCooperative:
        profile_gaps.append("Join a registered cooperative — many programmes prioritise cooperative members.")
    if not form.isYouthFarmer and not form.isWomanFarmer:
        profile_gaps.append("Demographic-specific grants (Youth, Women) are unavailable for your profile.")
    if form.farmingExperienceYears and form.farmingExperienceYears < 2:
        profile_gaps.append("Some programmes require ≥2 years farming experience.")
    if not form.bankStatement:
        required_by = []
        for grant in visible_grants:
            if grant.grantName in ["CBN Anchor Borrowers Programme", "Bank of Agriculture MSME Loan", "NIRSAL Agro-Geo-Cooperative Scheme", "AGSMEIS Women's Agri-Enterprise Grant"]:
                required_by.append(grant.grantName)
        if required_by:
            profile_gaps.append(f"Upload a 6-month bank statement (required for {', '.join(required_by)}).")

    top_grant = all_grants[0]
    top_recommendation = f"Apply immediately to the {top_grant.grantName} — {top_grant.matchScore}% match. {top_grant.matchReason}"

    summary = (
        f"We found {len(all_grants)} grant programmes matching your profile as a {form.farmType.value} farmer in {form.stateOfResidence}. "
        f"The {top_grant.grantName} offers the strongest match at {top_grant.matchScore}%. "
        f"{ f'Your stated need — \"{form.fundingPurpose}\" — aligns with multiple federal and state-level disbursement windows.' if form.fundingPurpose else '' }"
    )


    app_letter = (
        f"Application Letter for {top_grant.grantName}\n\n"
        f"Dear Administrator,\n\n"
        f"I, {form.farmerName}, write to formally apply for the {top_grant.grantName}. "
        f"I run a {form.farmType.value} enterprise located in {form.stateOfResidence}. "
        f"My farm focuses on {', '.join(form.cropOrLivestockTypes) if form.cropOrLivestockTypes else 'agricultural production'}.\n\n"
        f"With {form.farmingExperienceYears or 1} years of experience, I seek this funding for {form.fundingPurpose}.\n\n"
        f"Thank you for considering my application.\n\n"
        f"Sincerely,\n{form.farmerName}"
    )

    return PipelineOutput(
        matchedGrants=visible_grants,
        profileGaps=[make_farmer_friendly(gap) for gap in profile_gaps],
        topRecommendation=make_farmer_friendly(top_recommendation),
        summary=make_farmer_friendly(summary),
        disclaimer="Grant availability, amounts, and deadlines are subject to change without notice. AgriGrant AI provides eligibility guidance only and does not guarantee approval.",
        totalMatchesFound=len(all_grants),
        farmerName=form.farmerName,
        stateOfResidence=form.stateOfResidence,
        eligibilityScore=score,
        trustScore=trust_score,
        trustScoreBreakdown=trust_breakdown,
        applicationLetterText=make_farmer_friendly(app_letter),
        submissionInstructions="Submit the generated proposal letter along with your CAC registration documents and land Survey Plan to your nearest Commercial bank or via the online portal.",
        followUpSchedule="Check application status 14 days after submission. Standard processing time is 45-60 business days.",
        hiddenGrantsCount=0
    )

async def create_pipeline_submission(form: FarmerSubmission, client: httpx.AsyncClient) -> Dict[str, Any]:
    """
    Submits a grant analysis job via UiPath Orchestrator.
    Falls back to local computation only if UiPath credentials are absent or the call fails.
    """
    import time
    app_ref = f"AGR-{random.randint(100000, 999999)}"

    # Only use local computation if UiPath credentials are not configured
    credentials_missing = not settings.UIPATH_CLIENT_ID or not settings.UIPATH_PIPELINE_PROCESS_KEY

    if credentials_missing:
        logger.error("UiPath credentials not configured.")
        raise ValueError("UiPath credentials not configured.")

    # Real UiPath path — always try first
    job_id = await start_pipeline_job(form.model_dump(), client)
    if job_id:
        logger.info(f"Submitted UiPath job. Job ID: {job_id}, Ref: {app_ref}")
        return {
            "jobId": job_id,
            "applicationReference": app_ref,
            "status": "PROCESSING",
            "estimatedWaitSeconds": 45,
            "message": "We are searching for your best grants now. You'll get the results in about 45 seconds.",
            "farmerName": form.farmerName
        }
    else:
        logger.error("UiPath returned no job ID.")
        raise RuntimeError("UiPath submission failed or returned no job ID.")

async def get_pipeline_job_status(job_id: str, client: httpx.AsyncClient) -> Dict[str, Any]:
    """
    Checks the status of the job via UiPath Orchestrator polling.
    """
    status_dict = await poll_job_status(job_id, client)
    state = status_dict.get("state", "PROCESSING")
    
    if state == "COMPLETED":
        raw_output = status_dict.get("output") or {}
        translated_res = translate_pipeline_output(raw_output)
        return {
            "jobId": job_id,
            "state": "COMPLETED",
            "progress": 100,
            "currentStep": "Completed successfully.",
            "result": translated_res,
            "error": None
        }
    elif state == "FAILED":
        return {
            "jobId": job_id,
            "state": "FAILED",
            "progress": 100,
            "currentStep": "Failed",
            "result": None,
            "error": status_dict.get("error") or "Job failed."
        }
    else:
        # Estimate progress over 45 seconds
        return {
            "jobId": job_id,
            "state": "PROCESSING",
            "progress": 30, # default placeholder for processing
            "currentStep": "Running UiPath agent matching pipeline...",
            "result": None,
            "error": None
        }
