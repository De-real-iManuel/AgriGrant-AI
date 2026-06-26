"""
Pipeline service — kicks off the Nigerian AgriGrant Pipeline (Maestro)
via the published API trigger URL. The Pipeline orchestrates all 5 agents
+ the Form Filler Robot internally.

Real UiPath calls only — no demo/mock paths.
"""
import asyncio
import json
import logging
import random
from typing import Dict, Any
import httpx

from core.config import settings
from api.models import FarmerSubmission
from services.event_broadcaster import publish as publish_stage

logger = logging.getLogger(__name__)


def _orchestrator_url(path: str) -> str:
    base = settings.UIPATH_BASE_URL.rstrip('/')
    return f"{base}/{settings.UIPATH_ORGANIZATION}/{settings.UIPATH_TENANT}/orchestrator_/{path.lstrip('/')}"


def _auth_headers(json_body: bool = False) -> Dict[str, str]:
    headers = {
        "Authorization": f"Bearer {settings.UIPATH_PAT}",
        "Accept": "application/json",
        "X-UIPATH-OrganizationUnitId": str(settings.UIPATH_FOLDER_ID),
    }
    if json_body:
        headers["Content-Type"] = "application/json"
    return headers


_FARM_TYPE_SLUG: Dict[str, str] = {
    "crop farming":    "crop",
    "livestock":       "livestock",
    "poultry":         "poultry",
    "fishery":         "fishery/aquaculture",
    "mixed farming":   "mixed",
    "horticulture":    "horticulture",
    "agro-processing": "agro-processing",
    "cooperative":     "cooperative",
    "agribusiness":    "agribusiness",
    "others":          "other",
    "other":           "other",
}


def _normalise_farm_type(raw: str) -> str:
    """Convert FarmTypeEnum display value → lowercase slug UiPath expects."""
    return _FARM_TYPE_SLUG.get(raw.lower().strip(), raw.lower().strip()) or "other"


def _build_trigger_payload(form: FarmerSubmission) -> Dict[str, Any]:
    """
    Maps the FastAPI farmer submission into the exact JSON shape the Maestro
    Pipeline + Grant Form Filler Robot expect.

    Keys use the `in_` prefix so they map 1:1 to the robot's Main.xaml
    arguments — Maestro can pass them through with no translation.
    Bare (no-prefix) copies of key fields are also included so UiPath's
    DynamicType_0 schema validation passes for sub-agent invocations.
    """
    crops_str = ", ".join(form.cropOrLivestockTypes) if form.cropOrLivestockTypes else ""
    raw_farm_type = form.farmType.value if hasattr(form.farmType, "value") else str(form.farmType)
    farm_type_slug = _normalise_farm_type(raw_farm_type)
    farm_type = farm_type_slug or "other"

    is_youth  = bool(form.isYouthFarmer)
    is_woman  = bool(form.isWomanFarmer)

    return {
        # Identity / session
        "in_userId": form.userId or "",
        "in_sessionId": form.sessionId or "",
        # bare aliases (required by UiPath DynamicType_0 sub-agent schema)
        "userId": form.userId or "",
        "sessionId": form.sessionId or "",

        # Contact
        "in_farmerName": form.farmerName,
        "in_farmerEmail": form.farmerEmail or "",
        "in_farmerPhone": form.farmerPhone or "",
        "in_residentialAddress": form.residentialAddress or "",
        # bare aliases
        "farmerName": form.farmerName,
        "farmerEmail": form.farmerEmail or "",
        "stateOfResidence": form.stateOfResidence,

        # Location
        "in_stateOfResidence": form.stateOfResidence,
        "in_lga": form.lga or "",
        "in_farmAddress": form.farmAddress or "",
        "in_farmLocation": form.farmAddress or form.stateOfResidence,
        # bare aliases
        "lga": form.lga or "",

        # Farm profile
        "in_farmType": farm_type,
        "in_cropOrLivestockTypes": crops_str,
        "in_farmSizeHectares": float(form.farmSizeHectares or 0),
        "in_annualRevenueNGN": float(form.annualRevenueNGN or 0),
        "in_farmingExperienceYears": float(form.farmingExperienceYears or 0),
        "in_yearsInOperation": int(form.farmingExperienceYears or 0),
        # bare aliases — farmType must be the slug UiPath expects
        "farmType": farm_type,
        "annualRevenueNGN": int(form.annualRevenueNGN or 0),
        "farmExperienceYears": int(form.farmingExperienceYears or 0),
        "farmerSizeHecaters": int(form.farmSizeHectares or 0),

        # Funding ask
        "in_fundingPurpose": form.fundingPurpose or "",
        "in_projectTitle": form.projectTitle or "",
        "in_projectDescription": form.projectDescription or form.fundingPurpose or "",
        "in_proposedProjectDescription": form.projectDescription or form.fundingPurpose or "",
        "in_requestedAmount": float(form.requestedAmount or 0),
        "in_requestedFundingAmountNGN": float(form.requestedAmount or 0),
        "in_farmingChallenges": form.farmingChallenges or "",
        "in_previousGrants": form.previousGrants or "",
        # bare aliases
        "fundingPurpose": form.fundingPurpose or "",
        "ProjectTittle": form.projectTitle or "",
        "projectDescription": form.projectDescription or form.fundingPurpose or "",
        "requestedAmount": int(form.requestedAmount or 0),
        "farmingChallenges": form.farmingChallenges or "",
        "previousGrants": form.previousGrants or "",

        # Eligibility flags
        "in_isSmallholderFarmer": bool(form.isSmallholderFarmer),
        "in_isYouthFarmer": is_youth,
        "in_isWomanFarmer": is_woman,
        "in_hasCACRegistration": bool(form.hasCACRegistration),
        "in_hasLandDocument": bool(form.hasLandDocument),
        "in_isMemberOfCooperative": bool(form.isMemberOfCooperative),
        "in_hasBVN": bool(form.hasBVN),
        "in_hasNoLoanDefault": bool(form.hasNoLoanDefault),
        "in_hasExistingLoanDefault": not bool(form.hasNoLoanDefault),
        "in_additionalNotes": form.additionalNotes or "",
        # bare aliases — these are the fields DynamicType_0 marks required
        "isSmallholderFarmer": bool(form.isSmallholderFarmer),
        "isYouthFarmer": is_youth,
        "isWomanFarmer": is_woman,
        "hasCACRegistration": bool(form.hasCACRegistration),
        "hasLandDocument": bool(form.hasLandDocument),
        "isMemberOfCooperative": bool(form.isMemberOfCooperative),
        "additionalNotes": form.additionalNotes or "",

        # Submission preferences
        "in_submissionMethod": form.submissionMethod or "online",
        "in_submissionPortalUrl": form.submissionPortalUrl or "",
        "in_targetPortalURL": form.submissionPortalUrl or "",
        "in_currentStatus": form.currentStatus or "pending",
        "in_documentsChecklist": form.documentsChecklist or "",
        "in_agentAction": form.agentAction or "submit_application",
        "in_preferredLanguage": form.preferredLanguage or "en",
        # bare aliases
        "submissionMethod": form.submissionMethod or "online",
        "submissionPortalUrl": form.submissionPortalUrl or "",
        "currentStatus": form.currentStatus or "pending",
        "agentAction": form.agentAction or "submit_application",
        "pererredLanguage": form.preferredLanguage or "en",  # matches entry-points.json typo

        # Document paths
        "in_ninDocumentPath": form.ninDocument or "",
        "in_cacDocumentPath": form.cacDocument or "",
        "in_bankStatementPath": form.bankStatement or "",
        "in_landDocumentPath": form.landDocument or "",
        "in_declarationAgreed": True,
    }


async def _trigger_pipeline(form: FarmerSubmission, client: httpx.AsyncClient) -> Dict[str, Any]:
    """POSTs the farmer submission to the Pipeline's API trigger URL."""
    if not settings.UIPATH_PIPELINE_TRIGGER_URL:
        raise RuntimeError("UIPATH_PIPELINE_TRIGGER_URL missing in .env")
    if not settings.UIPATH_PAT:
        raise RuntimeError("UIPATH_PAT missing in .env")

    payload = _build_trigger_payload(form)
    logger.info(f"Triggering Pipeline → {settings.UIPATH_PIPELINE_TRIGGER_URL}")

    response = await client.post(
        settings.UIPATH_PIPELINE_TRIGGER_URL,
        headers=_auth_headers(json_body=True),
        json=payload,
        timeout=30.0,
    )

    if response.status_code not in (200, 201, 202):
        raise RuntimeError(f"Pipeline trigger failed: HTTP {response.status_code} — {response.text[:500]}")

    data = response.json()
    job_id = str(data.get("id") or data.get("Id") or data.get("key") or "")
    if not job_id:
        raise RuntimeError(f"Pipeline trigger returned no job ID: {data}")

    logger.info(f"Pipeline job started. ID={job_id} state={data.get('state')}")
    return {"jobId": job_id, "raw": data}


async def _poll_job(job_id: str, client: httpx.AsyncClient) -> Dict[str, Any]:
    """Polls Orchestrator for a job's state."""
    url = _orchestrator_url(f"odata/Jobs({job_id})")
    response = await client.get(url, headers=_auth_headers(), timeout=15.0)
    if response.status_code != 200:
        raise RuntimeError(f"Job poll failed: HTTP {response.status_code} — {response.text[:300]}")

    data = response.json()
    output: Dict[str, Any] = {}
    raw_output = data.get("OutputArguments")
    if raw_output:
        try:
            output = json.loads(raw_output) if isinstance(raw_output, str) else raw_output
        except Exception:
            logger.warning(f"Could not parse OutputArguments for job {job_id}")

    info = data.get("Info")
    info_message = info.get("Message") if isinstance(info, dict) else info

    return {
        "state": data.get("State", "Unknown"),
        "output": output,
        "info_message": info_message,
    }


async def _track_pipeline_stages(job_id: str, farmer_name: str) -> None:
    """
    Background coroutine: tracks pipeline lifecycle and broadcasts SSE stage events.
    Polls every 3s up to ~5 minutes.
    """
    try:
        await publish_stage(job_id, "pipeline_started", f"Submission accepted for {farmer_name}")
        await publish_stage(job_id, "pipeline_running", "Nigerian AgriGrant Pipeline is orchestrating the agents")

        async with httpx.AsyncClient() as poll_client:
            for _ in range(100):  # ~5 min @ 3s interval
                await asyncio.sleep(3)
                try:
                    status = await _poll_job(job_id, poll_client)
                except Exception as e:
                    logger.warning(f"Poll error for job {job_id}: {e}")
                    continue

                state = status["state"]
                logger.info(f"Job {job_id} state: {state}")

                if state == "Successful":
                    output = status.get("output", {}) or {}
                    app_ref = (
                        output.get("applicationReference")
                        or output.get("portalReference")
                        or output.get("out_portalReference")
                        or "submitted"
                    )
                    await publish_stage(job_id, "pipeline_complete",
                                        f"Application reference: {app_ref}",
                                        {"applicationReference": app_ref, "output": output})
                    return
                elif state in ("Faulted", "Stopped"):
                    err = status.get("info_message") or "Pipeline ended with error"
                    await publish_stage(job_id, "pipeline_failed", err)
                    return
                # Pending / Running → keep polling
            await publish_stage(job_id, "pipeline_failed", "Timed out waiting for pipeline (5 minutes)")
    except asyncio.CancelledError:
        pass
    except Exception as e:
        logger.error(f"Stage tracker error for job {job_id}: {e}")
        try:
            await publish_stage(job_id, "pipeline_failed", str(e))
        except Exception:
            pass


# ───────────── Public API ─────────────
async def create_pipeline_submission(form: FarmerSubmission, client: httpx.AsyncClient) -> Dict[str, Any]:
    """
    Real UiPath submission via the Pipeline API trigger.
    The Pipeline (Maestro) orchestrates: Eligibility → Discovery → Doc Understanding →
    Proposal → Submission/Form Filler. Returns the live job ID for SSE subscription.
    """
    app_ref = f"AGR-{random.randint(100000, 999999)}"
    result = await _trigger_pipeline(form, client)
    job_id = result["jobId"]

    asyncio.create_task(_track_pipeline_stages(job_id, form.farmerName))

    # Persist a pipeline_jobs row immediately, linked to user + chat session, so
    # the history view can list this run even before the first event lands.
    try:
        from services.database_service import save_pipeline_job_with_user_db
        await save_pipeline_job_with_user_db(
            job_id=job_id,
            app_ref=app_ref,
            user_id=form.userId,
            session_id=form.sessionId,
            farmer_name=form.farmerName,
            state=form.stateOfResidence,
            status="PROCESSING",
            profile=form.model_dump(mode="json"),
        )
    except Exception as e:
        logger.warning(f"Could not persist pipeline_jobs row: {e}")

    return {
        "jobId": job_id,
        "applicationReference": app_ref,
        "status": "PROCESSING",
        "estimatedWaitSeconds": 60,
        "message": "Your application is being processed by the Nigerian AgriGrant Pipeline. Watch live stages in chat.",
        "farmerName": form.farmerName,
    }


async def get_pipeline_job_status(job_id: str, client: httpx.AsyncClient) -> Dict[str, Any]:
    """
    Direct poll endpoint used by /api/pipeline/status/{job_id}.
    """
    status = await _poll_job(job_id, client)
    state = status["state"]

    if state == "Successful":
        return {
            "jobId": job_id,
            "state": "COMPLETED",
            "progress": 100,
            "currentStep": "Pipeline completed.",
            "result": status.get("output"),
            "error": None,
        }
    elif state in ("Faulted", "Stopped"):
        return {
            "jobId": job_id,
            "state": "FAILED",
            "progress": 100,
            "currentStep": "Failed",
            "result": None,
            "error": status.get("info_message") or "Pipeline failed",
        }
    else:
        return {
            "jobId": job_id,
            "state": "PROCESSING",
            "progress": 50,
            "currentStep": f"Pipeline state: {state}",
            "result": None,
            "error": None,
        }
