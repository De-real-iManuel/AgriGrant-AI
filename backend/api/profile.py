import logging
from fastapi import APIRouter, HTTPException, status
from typing import Optional, List
from pydantic import BaseModel, Field
from services.database_service import (
    save_farmer_profile_db,
    get_farmer_profile_db,
    get_document_signed_url,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["Profile"])


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class FarmerProfileRequest(BaseModel):
    userId: str
    farmerName: str = Field(..., max_length=200)
    stateOfResidence: str
    lga: str = ""
    farmAddress: str = ""
    farmType: str
    cropOrLivestockTypes: List[str] = []
    farmSizeHectares: Optional[float] = None
    annualRevenueNGN: Optional[float] = None
    farmingExperienceYears: Optional[float] = None
    fundingPurpose: str = Field(..., min_length=3)
    isSmallholderFarmer: bool = False
    isYouthFarmer: bool = False
    isWomanFarmer: bool = False
    hasCACRegistration: bool = False
    hasLandDocument: bool = False
    isMemberOfCooperative: bool = False
    hasBVN: bool = False
    hasNoLoanDefault: bool = True
    additionalNotes: str = ""
    # Document storage paths (set by frontend after Supabase Storage upload)
    ninDocumentPath: Optional[str] = None
    cacDocumentPath: Optional[str] = None
    bankStatementPath: Optional[str] = None
    landDocumentPath: Optional[str] = None


class FarmerProfileResponse(BaseModel):
    success: bool
    message: str
    profileId: Optional[str] = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("/save", response_model=FarmerProfileResponse)
async def save_profile(request: FarmerProfileRequest):
    """
    Saves or updates the farmer profile in the database.
    Called by the frontend after files have been uploaded to Supabase Storage.
    """
    profile_data = request.model_dump(
        exclude={
            "userId",
            "ninDocumentPath",
            "cacDocumentPath",
            "bankStatementPath",
            "landDocumentPath",
        }
    )
    document_paths = {
        "ninDocumentPath": request.ninDocumentPath,
        "cacDocumentPath": request.cacDocumentPath,
        "bankStatementPath": request.bankStatementPath,
        "landDocumentPath": request.landDocumentPath,
    }

    result = await save_farmer_profile_db(request.userId, profile_data, document_paths)
    if result:
        logger.info(f"Farmer profile saved for user {request.userId}")
        return FarmerProfileResponse(
            success=True,
            message="Farmer profile saved successfully.",
            profileId=result.get("id"),
        )

    # If Supabase is offline, still return success (data lives in localStorage)
    logger.warning(f"Supabase offline -- profile for {request.userId} not persisted.")
    return FarmerProfileResponse(
        success=True,
        message="Profile saved locally. Database sync will happen when connection is restored.",
        profileId=None,
    )


@router.get("/{user_id}")
async def get_profile(user_id: str):
    """
    Retrieves a farmer profile by user ID.
    Also generates temporary signed URLs for any uploaded documents.
    """
    profile = await get_farmer_profile_db(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No farmer profile found for this user.",
        )

    # Generate signed download URLs for stored documents (valid for 1 hour)
    doc_fields = [
        "nin_document_path",
        "cac_document_path",
        "bank_statement_path",
        "land_document_path",
    ]
    for field in doc_fields:
        path = profile.get(field)
        if path:
            url_key = field.replace("_path", "_url")
            profile[url_key] = get_document_signed_url(path)

    return profile
