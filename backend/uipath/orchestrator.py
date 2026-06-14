import json
import logging
from typing import Optional, Dict, Any
import httpx
from core.config import settings
from uipath.auth import get_uipath_token

logger = logging.getLogger(__name__)

async def start_pipeline_job(farmer_data: Dict[str, Any], client: httpx.AsyncClient) -> Optional[str]:
    """
    Triggers a UiPath orchestrator job for grant discovery/matching.
    Returns the Job ID if successful, or None on failure.
    """
    token = await get_uipath_token(client)
    if not token:
        logger.warning("Could not get access token for starting job. Failing gracefully.")
        return None

    # Base URL for orchestrator Jobs endpoint
    org = settings.UIPATH_ORGANIZATION
    tenant = settings.UIPATH_TENANT
    url = f"https://cloud.uipath.com/{org}/{tenant}/orchestrator_/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs"

    headers = {
        "Authorization": f"Bearer {token}",
        "X-UIPATH-OrganizationUnitId": str(settings.UIPATH_FOLDER_ID),
        "Content-Type": "application/json"
    }

    body = {
        "startInfo": {
            "ReleaseKey": settings.UIPATH_PIPELINE_PROCESS_KEY,
            "Strategy": "All",
            "JobsCount": 1,
            "InputArguments": json.dumps({"farmerData": farmer_data})
        }
    }

    try:
        logger.info("Sending start jobs request to UiPath...")
        response = await client.post(url, headers=headers, json=body, timeout=15.0)
        if response.status_code in (200, 201):
            data = response.json()
            jobs = data.get("value", []) or data.get("Jobs", [])
            if jobs and len(jobs) > 0:
                job_id = str(jobs[0].get("Id"))
                logger.info(f"Successfully started UiPath job. ID: {job_id}")
                return job_id
            else:
                logger.error(f"UiPath start response did not contain jobs. Body: {response.text}")
                return None
        else:
            logger.error(f"UiPath start job failed. Status: {response.status_code}, Body: {response.text}")
            return None
    except Exception as e:
        logger.error(f"Exception during UiPath job starting: {str(e)}")
        return None

async def poll_job_status(job_id: str, client: httpx.AsyncClient) -> Dict[str, Any]:
    """
    Polls the status of the specified Job ID.
    Returns a dict with state information and potential outputs.
    """
    token = await get_uipath_token(client)
    if not token:
        return {"state": "FAILED", "error": "Authentication failed"}

    org = settings.UIPATH_ORGANIZATION
    tenant = settings.UIPATH_TENANT
    url = f"https://cloud.uipath.com/{org}/{tenant}/orchestrator_/odata/Jobs({job_id})"

    headers = {
        "Authorization": f"Bearer {token}",
        "X-UIPATH-OrganizationUnitId": str(settings.UIPATH_FOLDER_ID),
        "Accept": "application/json"
    }

    try:
        response = await client.get(url, headers=headers, timeout=10.0)
        if response.status_code == 200:
            data = response.json()
            state = data.get("Info", {}).get("State") or data.get("State")
            logger.info(f"UiPath job {job_id} current state: {state}")

            if state in ("Pending", "Running"):
                return {"state": "PROCESSING"}
            elif state == "Successful":
                output_args_str = data.get("OutputArguments")
                output_args = {}
                if output_args_str:
                    try:
                        output_args = json.loads(output_args_str)
                    except Exception as e:
                        logger.error(f"Failed to parse OutputArguments: {output_args_str}. Error: {e}")
                return {"state": "COMPLETED", "output": output_args}
            elif state in ("Faulted", "Stopped"):
                error_msg = data.get("Info", {}).get("Message") or "Job stopped or faulted."
                return {"state": "FAILED", "error": error_msg}
            else:
                return {"state": "PROCESSING"}
        else:
            logger.error(f"Failed to poll job status. Status: {response.status_code}, Body: {response.text}")
            return {"state": "PROCESSING"}
    except Exception as e:
        logger.error(f"Exception while polling job status {job_id}: {str(e)}")
        return {"state": "PROCESSING"}
