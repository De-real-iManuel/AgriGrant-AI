"""
Email service — renders Jinja2 templates and sends via SendGrid REST API.

Usage:
    from services.email_service import EmailService
    await EmailService.send_otp(to="x@y.com", farmer_name="Ada", otp_code="123456")
"""
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from jinja2 import Environment, FileSystemLoader, select_autoescape

from core.config import settings

logger = logging.getLogger(__name__)

# ── Jinja env (templates/emails/*.html) ───────────────────────────────────
_TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "emails"
_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
    trim_blocks=True,
    lstrip_blocks=True,
)

SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send"


class EmailServiceError(Exception):
    pass


class EmailService:
    """Thin wrapper around SendGrid + Jinja2 templates."""

    @staticmethod
    def render(template_name: str, **ctx) -> str:
        ctx.setdefault("year", datetime.now(timezone.utc).year)
        template = _env.get_template(template_name)
        return template.render(**ctx)

    @staticmethod
    async def send(
        to: str,
        subject: str,
        html: str,
        from_email: Optional[str] = None,
        from_name: str = "AgriGrant AI",
        reply_to: Optional[str] = None,
    ) -> dict:
        api_key = getattr(settings, "SENDGRID_API_KEY", None)
        sender = from_email or getattr(settings, "SENDGRID_FROM_EMAIL", "info@agrigrant.xyz")

        if not api_key:
            logger.warning("SENDGRID_API_KEY not set — email skipped (to=%s, subject=%s)", to, subject)
            return {"skipped": True, "reason": "no_api_key"}

        payload = {
            "personalizations": [{"to": [{"email": to}], "subject": subject}],
            "from": {"email": sender, "name": from_name},
            "content": [{"type": "text/html", "value": html}],
        }
        if reply_to:
            payload["reply_to"] = {"email": reply_to}

        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(
                SENDGRID_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )

        if r.status_code >= 400:
            logger.error("SendGrid error %s: %s", r.status_code, r.text)
            raise EmailServiceError(f"SendGrid {r.status_code}: {r.text}")

        logger.info("Email sent to=%s subject=%r status=%s", to, subject, r.status_code)
        return {"ok": True, "status_code": r.status_code, "message_id": r.headers.get("X-Message-Id")}

    # ── High-level helpers (one per template) ─────────────────────────────
    @classmethod
    async def send_otp(cls, *, to: str, farmer_name: str, otp_code: str, expires_minutes: int = 10) -> dict:
        html = cls.render(
            "otp.html",
            title="Verify your account",
            subject="Your AgriGrant AI verification code",
            farmer_name=farmer_name,
            otp_code=otp_code,
            expires_minutes=expires_minutes,
        )
        return await cls.send(to=to, subject=f"Your AgriGrant AI verification code: {otp_code}", html=html)

    @classmethod
    async def send_application_received(
        cls, *, to: str, farmer_name: str, application_reference: str,
        grant_program: str = "", submitted_at: Optional[str] = None,
        dashboard_url: Optional[str] = None,
    ) -> dict:
        submitted_at = submitted_at or datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC")
        html = cls.render(
            "application_received.html",
            title="Application received",
            subject=f"Your AgriGrant application {application_reference} has been received",
            farmer_name=farmer_name,
            application_reference=application_reference,
            grant_program=grant_program,
            submitted_at=submitted_at,
            dashboard_url=dashboard_url,
        )
        return await cls.send(
            to=to,
            subject=f"Your AgriGrant application {application_reference} has been received",
            html=html,
        )

    @classmethod
    async def send_status_update(
        cls, *, to: str, farmer_name: str, application_reference: str, stage: str,
        message: str, action_url: Optional[str] = None, action_label: Optional[str] = None,
    ) -> dict:
        html = cls.render(
            "status_update.html",
            title="Application update",
            subject=f"Update on your application {application_reference}",
            farmer_name=farmer_name,
            application_reference=application_reference,
            stage=stage,
            message=message,
            action_url=action_url,
            action_label=action_label,
        )
        return await cls.send(
            to=to,
            subject=f"Update on your application {application_reference}",
            html=html,
        )

    @classmethod
    async def send_approval(
        cls, *, to: str, farmer_name: str, application_reference: str, grant_program: str,
        funding_amount: Optional[str] = None, next_steps: Optional[str] = None,
    ) -> dict:
        html = cls.render(
            "application_approved.html",
            title="Application approved 🎉",
            subject=f"Your {grant_program} application has been approved!",
            farmer_name=farmer_name,
            application_reference=application_reference,
            grant_program=grant_program,
            funding_amount=funding_amount,
            next_steps=next_steps,
        )
        return await cls.send(
            to=to,
            subject=f"🎉 Your {grant_program} application has been approved!",
            html=html,
        )

    @classmethod
    async def send_rejection(
        cls, *, to: str, farmer_name: str, application_reference: str, grant_program: str,
        reason: Optional[str] = None, alternative_count: int = 3,
        dashboard_url: Optional[str] = None,
    ) -> dict:
        html = cls.render(
            "application_rejected.html",
            title="Application update",
            subject=f"Update on your {grant_program} application",
            farmer_name=farmer_name,
            application_reference=application_reference,
            grant_program=grant_program,
            reason=reason,
            alternative_count=alternative_count,
            dashboard_url=dashboard_url,
        )
        return await cls.send(
            to=to,
            subject=f"Update on your {grant_program} application — {alternative_count} alternatives ready",
            html=html,
        )
