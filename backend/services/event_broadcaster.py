"""
In-memory pub/sub broadcaster for pipeline stage events.
Streams stage updates to chat UI via Server-Sent Events.
"""
import asyncio
import json
import logging
import time
from typing import Dict, List, Any, AsyncGenerator

logger = logging.getLogger(__name__)

# job_id -> list of asyncio.Queue subscribers
_subscribers: Dict[str, List[asyncio.Queue]] = {}
# job_id -> replay buffer of past events (so late subscribers see the full history)
_history: Dict[str, List[Dict[str, Any]]] = {}
# how long to keep job history after completion (seconds)
_HISTORY_TTL = 600


# Stage catalogue — keep aligned with chat UI icons
STAGES = {
    "pipeline_started":           {"icon": "🌱", "label": "Pipeline started"},
    "eligibility_running":        {"icon": "✅", "label": "Eligibility & Risk Agent analyzing your profile"},
    "eligibility_done":           {"icon": "✅", "label": "Eligibility check complete"},
    "discovery_running":          {"icon": "🔍", "label": "Grant Discovery Agent scanning available grants"},
    "discovery_done":             {"icon": "🔍", "label": "Matching grants identified"},
    "grant_selection_required":   {"icon": "👉", "label": "Choose a grant to apply to"},
    "grant_selected":             {"icon": "✓",  "label": "Grant selected"},
    "document_running":           {"icon": "📄", "label": "Document Understanding Agent verifying your uploads"},
    "document_done":              {"icon": "📄", "label": "Documents validated"},
    "proposal_running":           {"icon": "✍️", "label": "Proposal Generation Agent drafting your application"},
    "proposal_done":              {"icon": "✍️", "label": "Proposal drafted"},
    "proposal_review_required":   {"icon": "👤", "label": "Review and approve your proposal"},
    "proposal_approved":          {"icon": "✓",  "label": "Proposal approved by farmer"},
    "approval_pending":           {"icon": "👤", "label": "Awaiting human approval"},
    "approval_granted":           {"icon": "👤", "label": "Approval granted"},
    "robot_running":              {"icon": "🤖", "label": "Submission Robot filling the grant portal"},
    "robot_submitted":            {"icon": "🤖", "label": "Robot submitted to portal — awaiting confirmation"},
    "robot_done":                 {"icon": "🤖", "label": "Robot submitted application to portal"},
    "followup_running":           {"icon": "📧", "label": "Submission & Follow-up Agent confirming submission"},
    "followup_email_sent":        {"icon": "📧", "label": "Confirmation email sent to farmer"},
    "followup_done":              {"icon": "📧", "label": "Follow-up complete"},
    "pipeline_complete":          {"icon": "🎉", "label": "Pipeline complete"},
    "pipeline_failed":            {"icon": "⚠️", "label": "Pipeline failed"},
}


def make_event(stage: str, detail: str = "", data: Dict[str, Any] | None = None) -> Dict[str, Any]:
    meta = STAGES.get(stage, {"icon": "•", "label": stage})
    return {
        "stage": stage,
        "icon": meta["icon"],
        "label": meta["label"],
        "detail": detail,
        "data": data or {},
        "timestamp": time.time(),
    }


async def publish(job_id: str, stage: str, detail: str = "", data: Dict[str, Any] | None = None) -> None:
    """Push a stage event to all subscribers of `job_id`, append to history, and persist to DB."""
    event = make_event(stage, detail, data)
    _history.setdefault(job_id, []).append(event)
    logger.info(f"[broadcaster] job={job_id} stage={stage} detail={detail}")
    queues = _subscribers.get(job_id, [])
    for q in list(queues):
        try:
            q.put_nowait(event)
        except asyncio.QueueFull:
            logger.warning(f"[broadcaster] dropping event for slow subscriber on job {job_id}")

    # Fire-and-forget DB persistence so the timeline survives backend restarts
    try:
        from services.database_service import save_pipeline_event_db
        asyncio.create_task(save_pipeline_event_db(
            job_id=job_id,
            stage=stage,
            icon=event.get("icon", ""),
            label=event.get("label", ""),
            detail=detail,
            data=data or {},
        ))
    except Exception as e:
        logger.warning(f"[broadcaster] DB persist skipped: {e}")


async def subscribe(job_id: str) -> AsyncGenerator[str, None]:
    """SSE generator. Replays history first, then streams new events until the job terminates."""
    q: asyncio.Queue = asyncio.Queue(maxsize=100)
    _subscribers.setdefault(job_id, []).append(q)

    try:
        # Replay any events that already happened
        for past in _history.get(job_id, []):
            yield f"data: {json.dumps(past)}\n\n"

        # Heartbeat + live stream
        while True:
            try:
                event = await asyncio.wait_for(q.get(), timeout=15.0)
                yield f"data: {json.dumps(event)}\n\n"
                if event["stage"] in ("pipeline_complete", "pipeline_failed"):
                    # Flush a final marker the client can use to close the stream
                    yield f"event: end\ndata: {json.dumps({'jobId': job_id})}\n\n"
                    break
            except asyncio.TimeoutError:
                # SSE keep-alive comment
                yield ": keep-alive\n\n"
    finally:
        try:
            _subscribers.get(job_id, []).remove(q)
        except ValueError:
            pass
        # garbage-collect history for completed jobs
        if _history.get(job_id) and _history[job_id][-1]["stage"] in ("pipeline_complete", "pipeline_failed"):
            asyncio.create_task(_cleanup_after(job_id, _HISTORY_TTL))


async def _cleanup_after(job_id: str, delay: int) -> None:
    await asyncio.sleep(delay)
    _history.pop(job_id, None)
    _subscribers.pop(job_id, None)
