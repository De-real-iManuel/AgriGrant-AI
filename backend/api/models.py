from enum import Enum
from typing import Optional, List, Literal, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class FarmTypeEnum(str, Enum):
    CROP = "Crop Farming"
    LIVESTOCK = "Livestock"
    POULTRY = "Poultry"
    FISHERY = "Fishery"
    MIXED = "Mixed Farming"
    AGRO = "Agro-processing"
    OTHERS = "Others"

class FarmerSubmission(BaseModel):
    userId: Optional[str] = None
    farmerName: str = Field(..., max_length=100)
    stateOfResidence: str
    lga: str = ""
    farmAddress: str = ""
    farmType: FarmTypeEnum
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
    ninDocument: Optional[str] = None
    cacDocument: Optional[str] = None
    bankStatement: Optional[str] = None
    landDocument: Optional[str] = None

class MatchedGrant(BaseModel):
    grantName: str
    grantingOrganization: str
    matchScore: int  # 0-100
    fundingAmountRange: str
    applicationDeadline: str
    matchReason: str
    grantCategory: str
    applicationUrl: str

class PipelineOutput(BaseModel):
    matchedGrants: List[MatchedGrant]
    profileGaps: List[str]
    topRecommendation: str
    summary: str
    disclaimer: str
    totalMatchesFound: int
    farmerName: str
    stateOfResidence: str
    eligibilityScore: Optional[int] = None
    trustScore: Optional[int] = None
    trustScoreBreakdown: List[Dict[str, Any]] = []
    applicationLetterText: Optional[str] = None
    submissionInstructions: Optional[str] = None
    error: Optional[str] = None
    hiddenGrantsCount: int = 0

class PipelineSubmitResponse(BaseModel):
    jobId: str
    applicationReference: str
    status: str
    estimatedWaitSeconds: int
    message: str
    farmerName: str

class PipelineStatusResponse(BaseModel):
    jobId: str
    state: Literal["PROCESSING", "COMPLETED", "FAILED"]
    progress: int
    currentStep: str
    result: Optional[PipelineOutput] = None
    error: Optional[str] = None

class ChatStartRequest(BaseModel):
    farmerName: str
    farmerProfile: Optional[FarmerSubmission] = None
    sessionId: Optional[str] = None

class ChatStartResponse(BaseModel):
    sessionId: str
    token: str
    greeting: str
    messages: List[ChatMessage] = []

class ChatMessageRequest(BaseModel):
    sessionId: str
    message: str = Field(..., max_length=1000)

class ChatEditRequest(BaseModel):
    sessionId: str
    message: str = Field(..., max_length=1000)

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime
    suggestedActions: List[Dict[str, Any]] = []

class ChatMessageResponse(BaseModel):
    sessionId: str
    message: ChatMessage

class ChatHistoryResponse(BaseModel):
    sessionId: str
    messages: List[ChatMessage]
    farmerProfile: Optional[FarmerSubmission] = None
