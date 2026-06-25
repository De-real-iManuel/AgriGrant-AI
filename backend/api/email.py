"""
Email API — exposes send-otp + admin helpers for sending branded emails.
"""
import logging
import random
import time
from typing import Optional, Dict

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr, Field

from services.email_service import EmailService, EmailServiceError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/email", tags=["email"])

# In-memory OTP store. For prod, move to Redis or Supabase.
_OTP_STORE: Dict[str, Dict] = {}  # email -> {code, expires_at}
OTP_TTL_SECONDS = 600  # 10 minutes


class SendOtpRequest(BaseModel):
    email: EmailStr
    farmer_name: str = Field(default="there", max_length=80)


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=8)


class ApplicationReceivedRequest(BaseModel):
    email: EmailStr
    farmer_name: str
    application_reference: str
    grant_program: Optional[str] = ""
    dashboard_url: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    email: EmailStr
    farmer_name: str
    application_reference: str
    stage: str
    message: str
    action_url: Optional[str] = None
    action_label: Optional[str] = None


@router.post("/send-otp", summary="Send a one-time verification code")
async def send_otp(payload: SendOtpRequest):
    code = f"{random.randint(0, 999999):06d}"
    _OTP_STORE[payload.email.lower()] = {
        "code": code,
        "expires_at": time.time() + OTP_TTL_SECONDS,
    }
    try:
        result = await EmailService.send_otp(
            to=payload.email,
            farmer_name=payload.farmer_name,
            otp_code=code,
            expires_minutes=OTP_TTL_SECONDS // 60,
        )
    except EmailServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return {"ok": True, "expires_in": OTP_TTL_SECONDS, "delivery": result}


@router.post("/verify-otp", summary="Verify a one-time code")
async def verify_otp(payload: VerifyOtpRequest):
    entry = _OTP_STORE.get(payload.email.lower())
    if not entry:
        raise HTTPException(status_code=404, detail="No OTP requested for this email")
    if time.time() > entry["expires_at"]:
        _OTP_STORE.pop(payload.email.lower(), None)
        raise HTTPException(status_code=410, detail="OTP expired — request a new one")
    if entry["code"] != payload.code:
        raise HTTPException(status_code=400, detail="Incorrect code")
    _OTP_STORE.pop(payload.email.lower(), None)
    return {"ok": True, "verified": True}


@router.post("/application-received", summary="Send application-received confirmation")
async def send_application_received(payload: ApplicationReceivedRequest):
    try:
        result = await EmailService.send_application_received(
            to=payload.email,
            farmer_name=payload.farmer_name,
            application_reference=payload.application_reference,
            grant_program=payload.grant_program or "",
            dashboard_url=payload.dashboard_url,
        )
    except EmailServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return {"ok": True, "delivery": result}


@router.post("/status-update", summary="Send a pipeline-stage status email")
async def send_status_update(payload: StatusUpdateRequest):
    try:
        result = await EmailService.send_status_update(
            to=payload.email,
            farmer_name=payload.farmer_name,
            application_reference=payload.application_reference,
            stage=payload.stage,
            message=payload.message,
            action_url=payload.action_url,
            action_label=payload.action_label,
        )
    except EmailServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return {"ok": True, "delivery": result}


@router.get("/preview/{template}", summary="Preview an email template in browser (dev only)")
async def preview_template(template: str):
    """Render a template with sample data so you can preview it in a browser."""
    from fastapi.responses import HTMLResponse

    sample_data = {
        "otp": {
            "title": "Verify your account",
            "farmer_name": "Adaeze",
            "otp_code": "382715",
            "expires_minutes": 10,
        },
        "application_received": {
            "title": "Application received",
            "farmer_name": "Adaeze Okeke",
            "application_reference": "AG-2026-A4F92K",
            "grant_program": "USAID Feed the Future Nigeria",
            "submitted_at": "21 Jun 2026, 06:30 UTC",
            "dashboard_url": "https://agrigrant.xyz/dashboard",
        },
        "status_update": {
            "title": "Application update",
            "farmer_name": "Adaeze",
            "application_reference": "AG-2026-A4F92K",
            "stage": "Eligibility & Risk Assessment",
            "message": "Our Eligibility agent has finished scoring your profile — you scored 87/100. Documents verified.",
            "action_url": "https://agrigrant.xyz/dashboard",
            "action_label": "View score breakdown →",
        },
        "application_approved": {
            "title": "Application approved 🎉",
            "farmer_name": "Adaeze",
            "application_reference": "AG-2026-A4F92K",
            "grant_program": "USAID Feed the Future Nigeria",
            "funding_amount": "NGN 2,500,000",
            "next_steps": "USAID will contact you within 5 business days to confirm bank details.",
        },
        "application_rejected": {
            "title": "Application update",
            "farmer_name": "Adaeze",
            "application_reference": "AG-2026-A4F92K",
            "grant_program": "AGRA Smallholder Grant",
            "reason": "Application window closed before submission could be processed.",
            "alternative_count": 4,
            "dashboard_url": "https://agrigrant.xyz/dashboard",
        },
    }

    if template not in sample_data:
        raise HTTPException(status_code=404, detail=f"Unknown template. Try one of: {list(sample_data)}")
    html = EmailService.render(f"{template}.html", **sample_data[template])
    return HTMLResponse(content=html)
