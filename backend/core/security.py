from datetime import datetime, timedelta, UTC
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from fastapi import HTTPException, status
from core.config import settings

ALGORITHM = "HS256"

def create_chat_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a JWT session token for farmer chat sessions.
    Expires by default in 24 hours.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.CHAT_SESSION_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def decode_chat_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates the chat token.
    Raises HTTPException 401 if invalid/expired.
    """
    try:
        payload = jwt.decode(token, settings.CHAT_SESSION_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
