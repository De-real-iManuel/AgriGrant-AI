from fastapi import APIRouter
from datetime import datetime, UTC
from uipath.auth import get_uipath_token

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def health_check():
    """
    Service health check endpoint.
    Performs standard self checks and probes UiPath auth connectivity.
    """
    uipath_connected = False
    try:
        token = await get_uipath_token()
        if token:
            uipath_connected = True
    except Exception:
        pass

    return {
        "status": "ok",
        "uipath_connected": uipath_connected,
        "version": "1.0.0",
        "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "") + "Z"
    }
