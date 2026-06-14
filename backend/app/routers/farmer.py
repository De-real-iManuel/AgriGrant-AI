"""
Farmer Router — /api/farmer/profile
Manages farmer profile CRUD.
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class FarmerProfileRequest(BaseModel):
    supabaseUserId: str | None = None
    email: str
    fullName: str
    phone: str | None = None
    stateOfResidence: str | None = None
    lga: str | None = None
    farmLocation: str | None = None
    farmType: str | None = None
    farmSizeHectares: float | None = None
    cropOrLivestockTypes: str | None = None
    yearsInOperation: int | None = None
    annualRevenueNGN: float | None = None
    hasBVN: bool = False
    hasCACRegistration: bool = False
    isMemberOfCooperative: bool = False
    hasLandDocument: bool = False
    isSmallholderFarmer: bool = False
    isYouthFarmer: bool = False
    isWomanFarmer: bool = False
    hasExistingLoanDefault: bool = False


@router.post("/profile")
async def create_or_update_profile(req: FarmerProfileRequest):
    """Create or update a farmer profile."""
    # TODO: Upsert to database using email as key
    return {
        "status": "saved",
        "email": req.email,
        "message": "Profile saved successfully.",
    }


@router.get("/profile/{email}")
async def get_profile(email: str):
    """Get farmer profile by email."""
    # TODO: Query from database
    return {"status": "not_found", "message": "Profile not found. Please complete the intake form."}
