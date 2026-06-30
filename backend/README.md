# AgriGrant AI — FastAPI Backend

This directory contains the Python FastAPI backend for the AgriGrant AI platform — the secure orchestration layer between the Next.js frontend and the UiPath Maestro pipeline.

## Purpose and Context

In the AgriGrant AI architecture, the backend is the **PAT-gated proxy** that lets the browser see and act on UiPath Action Center tasks **without ever holding a UiPath credential**.

**Why is this layer necessary?**
A web frontend should never carry an Orchestrator Personal Access Token. If it did, anyone inspecting the browser could list, mutate, or complete tasks across the entire tenant. By keeping the PAT and `OrganizationUnitId` strictly server-side, this backend:

1. **Gates every Orchestrator call** with the right tenant credential.
2. **Filters tasks by `ExternalTag`** so a farmer only ever sees their own pending HITLs (multi-tenant isolation by design).
3. **Reshapes the Orchestrator OData responses** into a clean, frontend-friendly envelope (`task_id`, `task_type`, `payload`).
4. **Persists pipeline metadata** in Supabase (job state, document references, farmer profile) so a dropped browser session never loses context.

## Core Modules

```
backend/
├── api/
│   ├── hitl.py          # Action Center proxy — list pending, get one, complete
│   ├── pipeline.py      # POST /pipeline/submit (validates + triggers Maestro)
│   ├── documents.py     # Document upload → Supabase storage
│   ├── chat.py          # LLM advisor (OpenRouter) for farmer Q&A
│   ├── farmer.py        # Farmer profile CRUD
│   └── health.py        # Liveness + Orchestrator connectivity probe
├── uipath/
│   ├── auth.py          # PAT-as-bearer (no OAuth dance for hackathon speed)
│   ├── orchestrator.py  # Job triggering, Tasks API client
│   └── agents.py        # Per-agent input/output schemas
├── services/
│   ├── database_service.py   # Supabase persistence layer
│   ├── pipeline_service.py   # Composes agent calls + Maestro triggers
│   └── event_broadcaster.py  # SSE for live pipeline progress
└── main.py              # FastAPI app, /v1 router mount, CORS
```

### `api/hitl.py` — the Action Center proxy

Four routes, all under `/v1/api/hitl`:

| Method | Path | What it does |
|---|---|---|
| `GET` | `/actioncenter/pending?tag={jobId}` | Lists Unassigned/Pending Action Center tasks where `ExternalTag = {jobId}`. Reshapes each into `{task_id, task_type, payload, …}` so the frontend doesn't need to parse OData. |
| `GET` | `/actioncenter/task/{id}` | Fetches one task by Orchestrator Id — used for deep-links and debugging. |
| `POST` | `/actioncenter/complete` | Body: `{taskId, action, data}`. Calls Orchestrator's `tasks/AppTasks/CompleteAppTask` — Maestro auto-resumes the moment this succeeds. |
| `GET` | `/health` | Hits `/odata/Tasks?$top=1` with the PAT — proves the credential is alive. |

**No webhook receivers, no Supabase HITL table, no SSE for HITL.** Maestro Action Center is the truth source; this proxy is stateless with respect to HITL.

## Technical Stack

| Concern | Choice |
|---|---|
| Framework | FastAPI (Python 3.11+) |
| HTTP client | `httpx` async |
| Database | Supabase (Postgres) for pipeline state, document refs, farmer profile |
| LLM | OpenRouter (`google/gemini-2.0-flash`) for the chat advisor |
| Real-time | Server-Sent Events for pipeline progress (not for HITL — HITL is poll-based) |
| Auth | PAT bearer + `X-UIPATH-OrganizationUnitId` header (server-side only) |
| Server | Uvicorn |

## Environment Variables

Required in `.env` (see `.env.example`):

```env
# UiPath Orchestrator
UIPATH_PAT=rt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
UIPATH_ORGANIZATION=hackathon26_384
UIPATH_TENANT=DefaultTenant
UIPATH_FOLDER_ID=3081039
UIPATH_APPROVAL_APP_KEY=132cc7bb-f01c-47fa-8f5e-b77961d33ca2

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# OpenRouter (chat advisor)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
```

## Setup Instructions

1. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate          # Windows: .\venv\Scripts\activate
   ```
2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure environment variables**
   Copy `.env.example` → `.env` and fill in the values above.
4. **Run the development server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
5. **Probe Orchestrator connectivity**
   ```bash
   curl http://localhost:8000/v1/api/hitl/health
   # → {"ok": true, "orchestrator_status": 200, ...}
   ```

## How a HITL roundtrip works (one paragraph)

The Maestro process hits a `Create App Task` node and pauses. The task lands in Action Center tagged with the farmer's `jobId`. The frontend polls `GET /v1/api/hitl/actioncenter/pending?tag={jobId}` every 10s and renders the appropriate screen based on the task's `taskType` field. When the farmer submits a decision, the frontend POSTs `/v1/api/hitl/actioncenter/complete` with `{taskId, action: "Approved"|"Rejected", data: {…}}`. The backend forwards this to Orchestrator's `CompleteAppTask` endpoint. Maestro's blocked instance resumes within seconds, and the App outputs populate the downstream variables the next agent reads.
