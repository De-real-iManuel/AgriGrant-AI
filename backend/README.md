# AgriGrant AI — Backend

Production FastAPI backend for **AgriGrant AI**. Orchestrates five UiPath AI agents, drives a BPMN pipeline, runs the Grant Form Filler RPA robot, persists farmer profiles in Supabase, and sends branded transactional email via SendGrid.

Live at **https://api.agrigrant.xyz/v1**.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | FastAPI |
| Runtime | Python 3.12 (Docker) / 3.11+ (local) |
| Database | Supabase (Postgres) |
| Auth | Supabase JWT (verified per-request) |
| Email | SendGrid HTTP API + Jinja2 templates |
| RPA / Agents | UiPath Orchestrator (staging cloud) |
| Hosting | Render (Docker, Frankfurt region) |
| Streaming | Server-Sent Events for chat & pipeline status |

---

## Quick Start (local)

### 1. Prerequisites

- **Python 3.11+**
- **pip**

### 2. Install

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env       # then fill in values (see below)
```

### 3. Run

```bash
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000/docs** for the auto-generated Swagger UI.

### 4. Test

```bash
pytest tests/ -v
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# UiPath
UIPATH_PAT=rt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
UIPATH_BASE_URL=https://staging.uipath.com
UIPATH_ORG=hackathon26_384
UIPATH_TENANT=DefaultTenant
UIPATH_FOLDER_ID=3081039
UIPATH_FOLDER_KEY=dd54a73f-e35f-4207-bce8-6f2ed38feaec
UIPATH_PIPELINE_TRIGGER_URL=https://staging.uipath.com/.../t/<folder-key>/submit-grant
UIPATH_API_TRIGGER_URL=https://staging.uipath.com/.../t/<folder-key>/agrigrant-api

# Per-agent process keys
AGENT_DISCOVERY_KEY=<uuid>
AGENT_ELIGIBILITY_KEY=<uuid>
AGENT_DOCUMENT_KEY=<uuid>
AGENT_PROPOSAL_KEY=<uuid>
AGENT_SUBMISSION_KEY=<uuid>
PIPELINE_PROCESS_KEY=<uuid>
APPROVAL_APP_KEY=<uuid>

# LLM
OPENROUTER_API_KEY=sk-or-v1-...

# Database
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...   # service_role key — backend ONLY

# Email
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=info@agrigrant.xyz

# CORS
CORS_ORIGINS=https://agrigrant.xyz,https://www.agrigrant.xyz,http://localhost:4028
```

### Where to get each credential

| Variable | Source |
|---|---|
| `UIPATH_PAT` | UiPath Cloud → Profile → Preferences → Personal Access Tokens → Generate new (scopes: `OR.Jobs`, `OR.Folders.Read`, `OR.Execution`, `OR.Assets.Read`, `OR.Queues`, `OR.Users.Read`) |
| `UIPATH_FOLDER_ID` / `_KEY` | Orchestrator → Tenant → Folders → click the folder → ID is in URL, Folder Key is in details panel |
| `UIPATH_*_TRIGGER_URL` | Orchestrator → Automations → Triggers → API Triggers → click trigger → copy Invocation URL |
| `AGENT_*_KEY` | Orchestrator → Automations → Processes → click each agent → copy Process Key (UUID) |
| `OPENROUTER_API_KEY` | https://openrouter.ai → Keys → Create key |
| `SUPABASE_*` | Supabase Dashboard → Project Settings → API → use **`service_role`** key (never expose to frontend) |
| `SENDGRID_API_KEY` | https://app.sendgrid.com → Settings → API Keys → Create (Mail Send permission) |

> 🚨 **Never** commit a real `.env` to git. The `.gitignore` excludes it; only `.env.example` is tracked.

---

## API Reference

All routes are mounted under both `/api/...` (legacy) and `/v1/api/...` (current). Frontend should always use `/v1`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/health` | Liveness probe — returns `{"status":"ok"}` |

### Pipeline

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/api/pipeline/submit` | Submit a farmer profile, kick off the 5-agent pipeline |
| `GET` | `/v1/api/pipeline/status/{job_id}` | Poll pipeline state (also available as SSE stream) |
| `POST` | `/v1/api/pipeline/resubmit` | Re-run pipeline with an updated profile |
| `GET` | `/v1/api/pipeline/full-history/{user_id}` | All past pipeline runs for a user |

### Chat

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/api/chat/start` | Initialize a chat session, returns a JWT |
| `POST` | `/v1/api/chat/message` | Send a message (Bearer JWT required) |
| `GET` | `/v1/api/chat/history/{session_id}` | Session message history |
| `WS` | `/v1/api/chat/ws/{session_id}` | WebSocket for streaming responses |

### Email

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/api/email/send-otp` | Send a 6-digit OTP via SendGrid |
| `POST` | `/v1/api/email/verify-otp` | Verify a code |
| `POST` | `/v1/api/email/application-received` | Branded confirmation email |
| `POST` | `/v1/api/email/status-update` | Pipeline-stage status email |
| `GET` | `/v1/api/email/preview/{template}` | Render a template with sample data (dev-only) |

---

## Project Structure

```
backend/
├── api/                      # FastAPI routers
│   ├── pipeline.py
│   ├── chat.py
│   ├── email.py
│   └── models.py             # Pydantic schemas
├── services/
│   ├── pipeline_service.py   # UiPath trigger payloads + status polling
│   ├── database_service.py   # Supabase reads/writes
│   ├── email_service.py      # Jinja2 + SendGrid HTTP API
│   └── llm_service.py        # OpenRouter wrapper for chat
├── core/
│   └── config.py             # Settings via pydantic-settings
├── templates/
│   └── emails/               # Branded HTML templates (Jinja2)
│       ├── base.html
│       ├── otp.html
│       ├── application_received.html
│       ├── status_update.html
│       ├── application_approved.html
│       └── application_rejected.html
├── tests/
├── main.py                   # App entrypoint, CORS, router mounting
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## Pipeline Submission Payload

The body for `POST /v1/api/pipeline/submit`:

```json
{
  "farmerName": "Adamu Livestock",
  "farmerEmail": "test@example.com",
  "farmerPhone": "+2348012345678",
  "stateOfResidence": "Rivers State",
  "lga": "Port Harcourt",
  "farmLocation": "Rivers State, Port Harcourt LGA",
  "farmType": "Mixed Farming",
  "farmSizeHectares": 3.2,
  "cropOrLivestockTypes": "Cattle, Poultry, Cassava",
  "yearsInOperation": 4,
  "annualRevenueNGN": 14200000,
  "requestedFundingAmountNGN": 5000000,
  "proposedProjectDescription": "Cattle expansion + poultry capacity",
  "hasBVN": true,
  "hasCACRegistration": true,
  "isMemberOfCooperative": true,
  "hasLandDocument": true,
  "isSmallholderFarmer": true,
  "isYouthFarmer": true,
  "isWomanFarmer": false,
  "hasNoLoanDefault": true,
  "additionalNotes": "Standing off-taker agreement with local hotel"
}
```

The backend translates each field to the matching `in_*` argument expected by the UiPath robot (e.g., `farmerName` → `in_farmerName`).

---

## Deployment (Render)

The backend ships as a Docker image and runs on Render's free tier (Frankfurt).

```bash
# Build
docker build -t derealimanuel/agrigrant-ai:v1.x.x .

# Push
docker push derealimanuel/agrigrant-ai:v1.x.x
docker tag derealimanuel/agrigrant-ai:v1.x.x derealimanuel/agrigrant-ai:latest
docker push derealimanuel/agrigrant-ai:latest

# In Render Dashboard → Service → Settings → update Image URL → Deploy latest commit
```

Health-check path: `/v1/health`. UptimeRobot pings it every 5 minutes to prevent cold starts on the free tier.

### Render env vars

Settings → Environment → add every variable from the `.env` block above. Click **Save Changes** → Render auto-redeploys.

---

## Verifying Each Credential

```bash
# UiPath PAT (should return JSON, not 401)
curl -H "Authorization: Bearer $UIPATH_PAT" \
  "$UIPATH_BASE_URL/$UIPATH_ORG/$UIPATH_TENANT/orchestrator_/odata/Folders"

# Supabase service key
curl -H "apikey: $SUPABASE_SERVICE_KEY" \
  "$SUPABASE_URL/rest/v1/farmer_profiles?select=count"

# OpenRouter
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/models | head -c 200

# SendGrid (sends a real email)
curl -X POST https://api.agrigrant.xyz/v1/api/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@gmail.com","farmer_name":"Test"}'
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ModuleNotFoundError: supabase` | Missing dep | `pip install -r requirements.txt` (must include `supabase==2.9.1`) |
| Pipeline returns "no grants found" | Bad model name in agent JSON | Confirm `model: "gpt-5-2025-08-07"` (not `gpt-5.4`) |
| `401` from UiPath | PAT expired or wrong scopes | Regenerate with full `OR.*` scope set |
| `403` from Supabase | Used `anon` instead of `service_role` | Backend must use `service_role` (RLS bypass) |
| OTP email never arrives | Supabase free-tier limit | Configure SendGrid SMTP in Supabase Auth → SMTP Settings |
| Cold-start latency on Render | Free-tier sleep after 15 min idle | UptimeRobot ping every 5 min |

---

## Security Notes

- `service_role` key bypasses Row Level Security — backend only, **never** ship to the browser.
- All UiPath / SendGrid / OpenRouter keys live in environment variables, never in code.
- API rotates SendGrid keys when GitHub secret-scanner flags a leak; old keys are revoked in the SendGrid dashboard immediately.
- CORS is locked to the four production / dev origins listed in `CORS_ORIGINS`.

---

## License

Built by **REM Labs** · UiPath Agentic Automation hackathon entry.
