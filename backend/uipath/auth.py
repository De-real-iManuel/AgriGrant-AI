"""UiPath authentication — uses Personal Access Token (PAT) as Bearer credential."""
import logging
from typing import Optional
import httpx
from core.config import settings

logger = logging.getLogger(__name__)

async def get_uipath_token(client: Optional[httpx.AsyncClient] = None) -> Optional[str]:
    """
    Returns the UiPath PAT as a Bearer token. PATs don't expire frequently and are
    used directly as Authorization: Bearer <pat>. No OAuth dance needed.
    """
    pat = settings.UIPATH_PAT
    if not pat:
        logger.error("UIPATH_PAT is not configured in .env")
        return None
    return pat
