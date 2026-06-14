import logging
import time
from typing import Optional, Dict, Any
import httpx
from core.config import settings

logger = logging.getLogger(__name__)

# Simple in-memory token cache
# Structure: {"access_token": str, "expires_at": float}
_TOKEN_CACHE: Dict[str, Any] = {}

async def get_uipath_token(client: Optional[httpx.AsyncClient] = None) -> Optional[str]:
    """
    Fetches the UiPath OAuth2 access token using client credentials.
    Uses in-memory cache and proactively refreshes if token expires within 60 seconds.
    Returns None if fetch fails.
    """
    global _TOKEN_CACHE
    now = time.time()

    # Check cache validity (with 60 seconds buffer)
    if _TOKEN_CACHE.get("access_token") and _TOKEN_CACHE.get("expires_at", 0) > now + 60:
        return _TOKEN_CACHE["access_token"]

    url = "https://cloud.uipath.com/identity_/connect/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": settings.UIPATH_CLIENT_ID,
        "client_secret": settings.UIPATH_CLIENT_SECRET,
        "scope": "OR.Jobs OR.Execution OR.Robots OR.Folders"
    }

    own_client = False
    if client is None:
        client = httpx.AsyncClient()
        own_client = True

    try:
        logger.info("Fetching new UiPath OAuth2 token...")
        response = await client.post(url, headers=headers, data=data, timeout=10.0)
        if response.status_code == 200:
            res_data = response.json()
            access_token = res_data["access_token"]
            expires_in = res_data.get("expires_in", 3600)
            
            # Cache the token
            _TOKEN_CACHE["access_token"] = access_token
            _TOKEN_CACHE["expires_at"] = now + expires_in
            logger.info("Successfully fetched and cached UiPath OAuth2 token.")
            return access_token
        else:
            logger.error(f"Failed to fetch UiPath token. Status: {response.status_code}, Body: {response.text}")
            return None
    except Exception as e:
        logger.error(f"Exception while fetching UiPath token: {str(e)}")
        return None
    finally:
        if own_client:
            await client.aclose()
