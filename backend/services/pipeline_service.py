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


def _build_trigger_payload(form: FarmerSubmission) -> Dict[str, Any]:
    """Maps the FastAPI farmer submission into the Pipeline's expected JSON shape."""
    crops = ", ".join(form.cropOrLivestockTypes) if form.cropOrLivestockTypes else ""
    return {
        "farmerName": form.farmerName,
        "farmerEmail": getattr(form, "farmerEmail", "") or "",
        "farmLocation": getattr(form, "farmLocation", None) or form.stateOfResidence,
        "farmAddress": getattr(form, "farmAddress", "") or "",
        "farmSizeHectares": float(form.farmSizeHectares or 0),
        "farmType": form.farmType.value if hasattr(form.farmType, "value") else str(form.farmType),
        "cropOrLivestockTypes": crops,
        "yearsInOperation": int(form.farmingExperienceYears or 0),
        "annualRevenueNGN": float(form.annualRevenueNGN or 0),
        "requestedFundingAmountNGN": float(getattr(form, "requestedFundingAmountNGN", 0) or 0),
        "proposedProjectDescription": form.fundingPurpose or "",
        "hasBVN": bool(form.hasBVN),
        "hasCACRegistration": bool(form.hasCACRegistration),
        "isMemberOfCooperative": bool(form.isMemberOfCooperative),
        "hasLandDocument": bool(form.hasLandDocument),
        "isSmallholderFarmer": bool(getattr(form, "isSmallholderFarmer", False)),
        "isYouthFarmer": bool(getattr(form, "isYouthFarmer", False)),
        "isWomanFarmer": bool(getattr(form, "isWomanFarmer", False)),
        "hasExistingLoanDefault": not bool(form.hasNoLoanDefault),
        "additionalNotes": getattr(form, "additionalNotes", "") or "",
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
            user_id=getattr(form, "userId", None),
            session_id=getattr(form, "sessionId", None),
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
