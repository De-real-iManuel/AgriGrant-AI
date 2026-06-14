import logging
from typing import Optional, Any
from supabase import create_client, Client
from core.config import settings

logger = logging.getLogger(__name__)

# Global Supabase client instance or fallback
supabase_client: Optional[Client] = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_KEY and "mockproject" not in settings.SUPABASE_URL:
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Successfully initialized production Supabase client.")
    else:
        logger.warning("Supabase URL or Key not set. Running database client in offline/mock mode.")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}. Fallback to mock.")

# ---------------------------------------------------------------------------
# Supabase SQL Schema for your Reference (you can run this in Supabase Editor):
# ---------------------------------------------------------------------------
#
# CREATE TABLE chat_sessions (
#     session_id UUID PRIMARY KEY,
#     farmer_name VARCHAR(100) NOT NULL,
#     farmer_profile JSONB,
#     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
#     last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
# );
#
# CREATE TABLE chat_messages (
#     id BIGSERIAL PRIMARY KEY,
#     session_id UUID REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
#     role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
#     content TEXT NOT NULL,
#     timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
#     suggested_actions JSONB DEFAULT '[]'::jsonb
# );
#
# CREATE TABLE pipeline_jobs (
#     job_id VARCHAR(100) PRIMARY KEY,
#     application_reference VARCHAR(50) UNIQUE NOT NULL,
#     farmer_name VARCHAR(100) NOT NULL,
#     state_of_residence VARCHAR(50) NOT NULL,
#     status VARCHAR(20) NOT NULL, -- 'PROCESSING', 'COMPLETED', 'FAILED', 'DISQUALIFIED'
#     farmer_profile JSONB NOT NULL,
#     result JSONB,
#     error_message TEXT,
#     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
# );
# ---------------------------------------------------------------------------

async def save_session_db(session_id: str, farmer_name: str, farmer_profile: Optional[dict] = None) -> bool:
    """
    Saves or updates a chat session in Supabase.
    """
    if not supabase_client:
        return False
    try:
        data = {
            "session_id": session_id,
            "farmer_name": farmer_name,
            "farmer_profile": farmer_profile,
            "last_active": "now()"
        }
        res = supabase_client.table("chat_sessions").upsert(data).execute()
        return bool(res.data)
    except Exception as e:
        logger.error(f"Database error in save_session_db: {e}")
        return False

async def get_session_db(session_id: str) -> Optional[dict]:
    """
    Fetches a session from Supabase.
    """
    if not supabase_client:
        return None
    try:
        res = supabase_client.table("chat_sessions").select("*").eq("session_id", session_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        logger.error(f"Database error in get_session_db: {e}")
    return None

async def save_message_db(session_id: str, role: str, content: str, suggested_actions: list = []) -> bool:
    """
    Saves a new chat message to the session in Supabase.
    """
    if not supabase_client:
        return False
    try:
        data = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "suggested_actions": suggested_actions,
            "timestamp": "now()"
        }
        res = supabase_client.table("chat_messages").insert(data).execute()
        return bool(res.data)
    except Exception as e:
        logger.error(f"Database error in save_message_db: {e}")
        return False

async def get_messages_db(session_id: str) -> list:
    """
    Fetches all messages of a chat session from Supabase.
    """
    if not supabase_client:
        return []
    try:
        res = supabase_client.table("chat_messages").select("*").eq("session_id", session_id).order("timestamp").execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Database error in get_messages_db: {e}")
        return []

async def delete_last_messages_db(session_id: str, limit: int = 2) -> bool:
    """
    Deletes the last `limit` messages from a session in Supabase.
    Used for 'Edit last message' functionality.
    """
    if not supabase_client:
        return False
    try:
        # Get the IDs of the last 'limit' messages
        res = supabase_client.table("chat_messages").select("id").eq("session_id", session_id).order("timestamp", desc=True).limit(limit).execute()
        if not res.data:
            return True
            
        ids_to_delete = [row["id"] for row in res.data]
        if ids_to_delete:
            del_res = supabase_client.table("chat_messages").delete().in_("id", ids_to_delete).execute()
            return bool(del_res.data)
        return True
    except Exception as e:
        logger.error(f"Database error in delete_last_messages_db: {e}")
        return False

async def save_pipeline_job_db(
    job_id: str,
    app_ref: str,
    farmer_name: str,
    state: str,
    status: str,
    profile: dict,
    result: Optional[dict] = None,
    error: Optional[str] = None
) -> bool:
    """
    Inserts or updates a pipeline grant discovery job status in Supabase.
    """
    if not supabase_client:
        return False
    try:
        data = {
            "job_id": job_id,
            "application_reference": app_ref,
            "farmer_name": farmer_name,
            "state_of_residence": state,
            "status": status,
            "farmer_profile": profile,
            "result": result,
            "error_message": error
        }
        res = supabase_client.table("pipeline_jobs").upsert(data).execute()
        return bool(res.data)
    except Exception as e:
        logger.error(f"Database error in save_pipeline_job_db: {e}")
        return False

async def get_pipeline_job_db(job_id: str) -> Optional[dict]:
    """
    Gets a pipeline job by its unique Job ID from Supabase.
    """
    if not supabase_client:
        return None
    try:
        res = supabase_client.table("pipeline_jobs").select("*").eq("job_id", job_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        logger.error(f"Database error in get_pipeline_job_db: {e}")
    return None


# ---------------------------------------------------------------------------
# Farmer Profile CRUD
# ---------------------------------------------------------------------------
async def save_farmer_profile_db(
    user_id: str,
    profile_data: dict,
    document_paths: Optional[dict] = None
) -> Optional[dict]:
    """
    Saves or updates a farmer profile in Supabase.
    Uses upsert on user_id to allow re-submissions.
    """
    if not supabase_client:
        logger.warning("Supabase not connected. Farmer profile not saved to DB.")
        return None
    try:
        data = {
            "user_id": user_id,
            "farmer_name": profile_data.get("farmerName", ""),
            "state_of_residence": profile_data.get("stateOfResidence", ""),
            "lga": profile_data.get("lga", ""),
            "farm_type": profile_data.get("farmType", ""),
            "crop_or_livestock_types": profile_data.get("cropOrLivestockTypes", []),
            "farm_size_hectares": profile_data.get("farmSizeHectares") or None,
            "annual_revenue_ngn": profile_data.get("annualRevenueNGN") or None,
            "farming_experience_years": profile_data.get("farmingExperienceYears") or None,
            "funding_purpose": profile_data.get("fundingPurpose", ""),
            "is_smallholder_farmer": profile_data.get("isSmallholderFarmer", False),
            "is_youth_farmer": profile_data.get("isYouthFarmer", False),
            "is_woman_farmer": profile_data.get("isWomanFarmer", False),
            "has_cac_registration": profile_data.get("hasCACRegistration", False),
            "has_land_document": profile_data.get("hasLandDocument", False),
            "is_member_of_cooperative": profile_data.get("isMemberOfCooperative", False),
            "has_bvn": profile_data.get("hasBVN", False),
            "has_existing_loan_default": profile_data.get("hasExistingLoanDefault", False),
            "additional_notes": profile_data.get("additionalNotes", ""),
        }
        if document_paths:
            if document_paths.get("ninDocumentPath"):
                data["nin_document_path"] = document_paths["ninDocumentPath"]
            if document_paths.get("cacDocumentPath"):
                data["cac_document_path"] = document_paths["cacDocumentPath"]
            if document_paths.get("bankStatementPath"):
                data["bank_statement_path"] = document_paths["bankStatementPath"]
            if document_paths.get("landDocumentPath"):
                data["land_document_path"] = document_paths["landDocumentPath"]

        res = supabase_client.table("farmer_profiles").upsert(
            data, on_conflict="user_id"
        ).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.error(f"Database error in save_farmer_profile_db: {e}")
        return None


async def get_farmer_profile_db(user_id: str) -> Optional[dict]:
    """
    Fetches a farmer profile by user_id from Supabase.
    """
    if not supabase_client:
        return None
    try:
        res = supabase_client.table("farmer_profiles").select("*").eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        logger.error(f"Database error in get_farmer_profile_db: {e}")
    return None


def get_document_signed_url(file_path: str, expires_in: int = 3600) -> Optional[str]:
    """
    Generates a signed URL for a file in the farmer-documents bucket.
    Returns None if supabase is not connected or the file doesn't exist.
    """
    if not supabase_client or not file_path:
        return None
    try:
        res = supabase_client.storage.from_("farmer-documents").create_signed_url(
            file_path, expires_in
        )
        return res.get("signedURL") or res.get("signedUrl")
    except Exception as e:
        logger.error(f"Error creating signed URL for {file_path}: {e}")
        return None

