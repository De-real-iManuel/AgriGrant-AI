import logging
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from services.database_service import (
    supabase_client,
    get_farmer_profile_db,
    get_document_signed_url,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/farmer", tags=["Farmer Data"])


# ─────────────────────────────────────────────────────────────────────────────
# Applications
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/applications/{user_id}")
async def get_applications(user_id: str):
    """
    Returns all grant pipeline jobs associated with this farmer.
    Looks up the farmer name from their profile, then fetches matching jobs.
    """
    if not supabase_client:
        return {"applications": [], "total": 0}

    try:
        # Get farmer's name from their profile
        profile = await get_farmer_profile_db(user_id)
        if not profile:
            return {"applications": [], "total": 0}

        farmer_name = profile.get("farmer_name", "")
        if not farmer_name:
            return {"applications": [], "total": 0}

        # Fetch pipeline jobs by farmer name
        res = (
            supabase_client.table("pipeline_jobs")
            .select("*")
            .eq("farmer_name", farmer_name)
            .order("created_at", desc=True)
            .execute()
        )

        jobs = res.data or []

        # Build clean response
        applications = []
        for job in jobs:
            result = job.get("result") or {}
            matched_grants = result.get("matchedGrants") or []
            top_grant = matched_grants[0] if matched_grants else {}

            applications.append({
                "id": job.get("job_id"),
                "applicationReference": job.get("application_reference"),
                "grantName": top_grant.get("grantName") or "Grant Application",
                "organization": top_grant.get("grantingOrganization") or job.get("state_of_residence", ""),
                "status": _map_status(job.get("status", "PROCESSING")),
                "statusRaw": job.get("status"),
                "matchScore": top_grant.get("matchScore"),
                "fundingAmount": top_grant.get("fundingAmountRange"),
                "createdAt": job.get("created_at"),
                "matchedGrantsCount": len(matched_grants),
                "errorMessage": job.get("error_message"),
            })

        return {"applications": applications, "total": len(applications)}

    except Exception as e:
        logger.error(f"Error fetching applications for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch applications.")


def _map_status(raw: str) -> str:
    mapping = {
        "PROCESSING": "Processing",
        "COMPLETED": "Completed",
        "FAILED": "Failed",
        "DISQUALIFIED": "Disqualified",
    }
    return mapping.get(raw, raw)


# ─────────────────────────────────────────────────────────────────────────────
# Proposals (extract from pipeline results)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/proposals/{user_id}")
async def get_proposals(user_id: str):
    """
    Returns AI-generated grant proposals extracted from completed pipeline jobs.
    """
    if not supabase_client:
        return {"proposals": [], "total": 0}

    try:
        profile = await get_farmer_profile_db(user_id)
        if not profile:
            return {"proposals": [], "total": 0}

        farmer_name = profile.get("farmer_name", "")

        res = (
            supabase_client.table("pipeline_jobs")
            .select("*")
            .eq("farmer_name", farmer_name)
            .eq("status", "COMPLETED")
            .order("created_at", desc=True)
            .execute()
        )

        proposals = []
        for job in res.data or []:
            result = job.get("result") or {}
            letter = result.get("applicationLetterText")
            matched_grants = result.get("matchedGrants") or []
            top_grant = matched_grants[0] if matched_grants else {}

            proposals.append({
                "id": job.get("job_id"),
                "applicationReference": job.get("application_reference"),
                "grantName": top_grant.get("grantName") or "Grant Proposal",
                "organization": top_grant.get("grantingOrganization") or "",
                "proposalText": letter,
                "hasLetter": bool(letter),
                "matchScore": top_grant.get("matchScore"),
                "summary": result.get("summary", ""),
                "createdAt": job.get("created_at"),
            })

        return {"proposals": proposals, "total": len(proposals)}

    except Exception as e:
        logger.error(f"Error fetching proposals for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch proposals.")


# ─────────────────────────────────────────────────────────────────────────────
# Vault (farmer docs + trust score)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/vault/{user_id}")
async def get_vault(user_id: str):
    """
    Returns the farmer's verification documents, trust score, and upload status.
    """
    try:
        profile = await get_farmer_profile_db(user_id)
        if not profile:
            return {
                "trustScore": 0,
                "documents": _empty_docs(),
                "farmerName": None,
            }

        # Calculate trust score from uploaded docs + profile fields
        score = 0
        docs = []

        nin_path = profile.get("nin_document_path")
        cac_path = profile.get("cac_document_path")
        bank_path = profile.get("bank_statement_path")
        land_path = profile.get("land_document_path")

        docs.append({
            "id": "nin",
            "name": "National Identity (NIN)",
            "status": "VERIFIED" if nin_path else "MISSING",
            "url": get_document_signed_url(nin_path) if nin_path else None,
            "weight": 30,
        })
        docs.append({
            "id": "cac",
            "name": "CAC Registration",
            "status": "VERIFIED" if (cac_path and profile.get("has_cac_registration")) else "PENDING" if cac_path else "MISSING",
            "url": get_document_signed_url(cac_path) if cac_path else None,
            "weight": 25,
        })
        docs.append({
            "id": "bank",
            "name": "Bank Statement",
            "status": "VERIFIED" if bank_path else "MISSING",
            "url": get_document_signed_url(bank_path) if bank_path else None,
            "weight": 25,
        })
        docs.append({
            "id": "land",
            "name": "Land Document",
            "status": "VERIFIED" if land_path else ("PENDING" if profile.get("has_land_document") else "MISSING"),
            "url": get_document_signed_url(land_path) if land_path else None,
            "weight": 20,
        })

        score = sum(d["weight"] for d in docs if d["status"] == "VERIFIED")

        # Bonus points for profile completeness
        if profile.get("has_bvn"):
            score = min(score + 5, 100)

        return {
            "trustScore": score,
            "documents": docs,
            "farmerName": profile.get("farmer_name"),
            "hasBVN": profile.get("has_bvn", False),
            "hasNoLoanDefault": not profile.get("has_existing_loan_default", False),
        }

    except Exception as e:
        logger.error(f"Error fetching vault for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to load verification data.")


def _empty_docs():
    return [
        {"id": "nin",  "name": "National Identity (NIN)", "status": "MISSING", "url": None, "weight": 30},
        {"id": "cac",  "name": "CAC Registration",        "status": "MISSING", "url": None, "weight": 25},
        {"id": "bank", "name": "Bank Statement",           "status": "MISSING", "url": None, "weight": 25},
        {"id": "land", "name": "Land Document",            "status": "MISSING", "url": None, "weight": 20},
    ]
