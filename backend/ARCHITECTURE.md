# AgricGrant AI — Backend Architecture Blueprint

## Tech Stack
- **Runtime**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL (via SQLAlchemy + Alembic migrations)
- **LLM**: OpenRouter.ai (model: `google/gemini-2.0-flash` or `meta-llama/llama-4-scout`)
- **Email**: SMTP (Gmail or Resend.com)
- **File Storage**: Local disk (dev) / Cloudinary or S3 (prod)
- **Real-time**: Server-Sent Events (SSE) for pipeline progress
- **Auth**: JWT tokens (synced with Supabase user from frontend)

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Settings (env vars)
│   ├── database.py              # SQLAlchemy engine + session
│   │
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── farmer.py
│   │   ├── chat_session.py
│   │   ├── chat_message.py
│   │   ├── grant.py
│   │   ├── application.py
│   │   └── document.py
│   │
│   ├── schemas/                 # Pydantic request/response models
│   │   ├── __init__.py
│   │   ├── chat.py
│   │   ├── farmer.py
│   │   ├── pipeline.py
│   │   └── document.py
│   │
│   ├── routers/                 # API route handlers
│   │   ├── __init__.py
│   │   ├── chat.py              # /api/chat/start, /api/chat/message
│   │   ├── pipeline.py          # /api/pipeline/start, /api/pipeline/status
│   │   ├── documents.py         # /api/documents/upload
│   │   └── farmer.py            # /api/farmer/profile
│   │
│   ├── services/                # Business logic
│   │   ├── __init__.py
│   │   ├── llm_service.py       # OpenRouter LLM calls + tool routing
│   │   ├── uipath_service.py    # UiPath Orchestrator API integration
│   │   ├── email_service.py     # Send confirmation/status emails
│   │   └── pipeline_service.py  # Orchestrates the full grant pipeline
│   │
│   └── prompts/                 # LLM system prompts
│       ├── system_prompt.py
│       └── tools.py             # Function/tool definitions for LLM
│
├── alembic/                     # Database migrations
├── alembic.ini
├── requirements.txt
├── .env.example
└── Dockerfile
```

---

## Database Schema (PostgreSQL)

### farmers
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| supabase_user_id | VARCHAR | Links to Supabase auth |
| email | VARCHAR | Unique |
| full_name | VARCHAR | |
| phone | VARCHAR | |
| state_of_residence | VARCHAR | |
| lga | VARCHAR | |
| farm_location | VARCHAR | |
| farm_type | ENUM | crop, livestock, mixed, aquaculture |
| farm_size_hectares | FLOAT | |
| crop_or_livestock_types | VARCHAR | Comma-separated |
| years_in_operation | INT | |
| annual_revenue_ngn | FLOAT | |
| has_bvn | BOOLEAN | |
| has_cac_registration | BOOLEAN | |
| is_member_of_cooperative | BOOLEAN | |
| has_land_document | BOOLEAN | |
| is_smallholder_farmer | BOOLEAN | |
| is_youth_farmer | BOOLEAN | |
| is_woman_farmer | BOOLEAN | |
| has_existing_loan_default | BOOLEAN | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### chat_sessions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| farmer_id | UUID (FK) | |
| token | VARCHAR | JWT for this session |
| started_at | TIMESTAMP | |
| ended_at | TIMESTAMP | Nullable |
| status | ENUM | active, ended |

### chat_messages
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| session_id | UUID (FK) | |
| role | ENUM | user, assistant, system |
| content | TEXT | |
| suggested_actions | JSONB | Array of {label, action, data} |
| pipeline_status | JSONB | Nullable — for multi-step visibility |
| created_at | TIMESTAMP | |

### grants (knowledge base — seeded)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| name | VARCHAR | e.g. "CBN Anchor Borrowers Programme" |
| organization | VARCHAR | e.g. "Central Bank of Nigeria" |
| description | TEXT | |
| eligibility_criteria | JSONB | Structured criteria |
| max_funding_ngn | FLOAT | |
| target_farm_types | JSONB | ["crop", "livestock"] |
| target_states | JSONB | ["All"] or specific |
| requires_cooperative | BOOLEAN | |
| requires_bvn | BOOLEAN | |
| requires_cac | BOOLEAN | |
| application_url | VARCHAR | |
| deadline | DATE | Nullable |
| is_active | BOOLEAN | |
| created_at | TIMESTAMP | |

### applications
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| farmer_id | UUID (FK) | |
| grant_id | UUID (FK) | |
| status | ENUM | draft, submitted, approved, rejected, needs_changes |
| portal_reference | VARCHAR | From robot output |
| uipath_job_id | VARCHAR | Orchestrator job key |
| submission_screenshot_url | VARCHAR | |
| proposed_project_description | TEXT | |
| requested_funding_ngn | FLOAT | |
| submitted_at | TIMESTAMP | |
| last_status_update | TIMESTAMP | |
| notes | TEXT | |

### documents
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| farmer_id | UUID (FK) | |
| document_type | ENUM | nin, cac, bank_statement, land_document, other |
| file_path | VARCHAR | Server path or cloud URL |
| original_filename | VARCHAR | |
| uploaded_at | TIMESTAMP | |

---

## LLM Integration (OpenRouter)

### How it works:
1. User sends message → FastAPI receives it
2. Backend loads conversation history from DB (last 20 messages)
3. Backend builds messages array: [system_prompt, ...history, user_message]
4. Calls OpenRouter `/api/v1/chat/completions`
5. LLM responds — may include "tool calls" (function calling)
6. If tool call detected → execute action (trigger UiPath, check eligibility, etc.)
7. Return final response to frontend

### OpenRouter Call Pattern:
```python
import httpx

async def call_llm(messages: list[dict], tools: list[dict] | None = None) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://agrigrant.ng",
                "X-Title": "AgricGrant AI Advisor",
            },
            json={
                "model": "google/gemini-2.0-flash",
                "messages": messages,
                "tools": tools,
                "temperature": 0.7,
                "max_tokens": 2048,
            },
            timeout=60.0,
        )
    return response.json()
```

---

## LLM Tools (Function Calling)

The LLM can "call" these tools by responding with tool_calls:

```python
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_grants",
            "description": "Search available Nigerian agricultural grants based on farmer criteria",
            "parameters": {
                "type": "object",
                "properties": {
                    "farm_type": {"type": "string", "description": "crop, livestock, mixed, aquaculture"},
                    "state": {"type": "string", "description": "Nigerian state"},
                    "funding_needed": {"type": "number", "description": "Amount in NGN"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_eligibility",
            "description": "Check if the farmer is eligible for a specific grant program",
            "parameters": {
                "type": "object",
                "properties": {
                    "grant_id": {"type": "string"},
                },
                "required": ["grant_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "start_application_pipeline",
            "description": "Start the full grant application pipeline: proposal generation → form filling → submission. Only call when farmer explicitly confirms they want to submit.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grant_id": {"type": "string"},
                    "proposed_project_description": {"type": "string"},
                    "requested_funding_ngn": {"type": "number"},
                },
                "required": ["grant_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_application_status",
            "description": "Check the status of a submitted grant application",
            "parameters": {
                "type": "object",
                "properties": {
                    "application_id": {"type": "string"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_proposal",
            "description": "Generate a professional grant proposal based on farmer profile and grant requirements",
            "parameters": {
                "type": "object",
                "properties": {
                    "grant_id": {"type": "string"},
                    "project_idea": {"type": "string", "description": "Farmer's project idea in their own words"},
                },
                "required": ["grant_id", "project_idea"],
            },
        },
    },
]
```

---

## API Endpoints

### POST /api/chat/start
**Request:**
```json
{
  "farmerName": "Adebayo Ogundimu",
  "farmerProfile": { ...profile from localStorage... }
}
```
**Response:**
```json
{
  "sessionId": "uuid",
  "token": "jwt-token",
  "greeting": "Hello Adebayo! I can see you run a 5-hectare rice farm in Kwara State..."
}
```

### POST /api/chat/message
**Headers:** `Authorization: Bearer <session_token>`
**Request:**
```json
{
  "sessionId": "uuid",
  "message": "What grants am I eligible for?"
}
```
**Response:**
```json
{
  "message": {
    "content": "Based on your profile, you're eligible for 3 grants...",
    "timestamp": "2026-06-13T12:00:00Z",
    "suggestedActions": [
      {"label": "Apply for CBN ABP", "action": "SUBMIT_APPLICATION", "data": {"grantId": "uuid"}},
      {"label": "View all grants", "action": "GO_TO_GRANTS"}
    ],
    "pipelineStatus": null
  }
}
```

### POST /api/pipeline/start
**Request:**
```json
{
  "farmerId": "uuid",
  "grantId": "uuid",
  "proposedProjectDescription": "...",
  "requestedFundingNGN": 5000000
}
```
**Response:**
```json
{
  "applicationId": "uuid",
  "jobId": "uipath-job-key",
  "status": "started"
}
```

### GET /api/pipeline/status/{application_id}
**Response:**
```json
{
  "applicationId": "uuid",
  "status": "in_progress",
  "steps": [
    {"name": "Grant Discovery", "status": "completed", "icon": "🔍"},
    {"name": "Eligibility Check", "status": "completed", "icon": "📋"},
    {"name": "Proposal Generation", "status": "completed", "icon": "📝"},
    {"name": "Form Filling", "status": "in_progress", "icon": "🤖"},
    {"name": "Submission", "status": "pending", "icon": "✅"}
  ],
  "portalReference": null,
  "error": null
}
```

### GET /api/pipeline/stream/{application_id}
**SSE stream** — pushes real-time step updates to frontend:
```
event: step_update
data: {"step": "Form Filling", "status": "completed", "message": "All fields filled successfully"}

event: step_update
data: {"step": "Submission", "status": "in_progress", "message": "Clicking submit button..."}

event: completed
data: {"portalReference": "NAGAP-2026-4821", "screenshotUrl": "/uploads/screenshots/abc.png"}
```

### POST /api/documents/upload
**Multipart form data:**
- `file`: The uploaded file
- `document_type`: nin | cac | bank_statement | land_document | other
- `farmer_id`: UUID

**Response:**
```json
{
  "documentId": "uuid",
  "documentType": "nin",
  "filename": "my_nin.pdf",
  "uploadedAt": "2026-06-13T12:00:00Z"
}
```

---

## UiPath Orchestrator Integration

```python
# services/uipath_service.py

class UiPathService:
    TOKEN_URL = "https://cloud.uipath.com/identity_/connect/token"
    BASE_URL = "https://cloud.uipath.com/{org}/{tenant}/orchestrator_"

    async def get_token(self) -> str:
        """Get OAuth token using External Application credentials"""
        ...

    async def start_job(self, process_key: str, input_arguments: dict) -> str:
        """Start unattended robot job, return job key"""
        # POST /odata/Jobs/UiPath.Server.Configuration.OData.StartJobs
        ...

    async def get_job_status(self, job_key: str) -> dict:
        """Poll job status + output arguments"""
        # GET /odata/Jobs({job_key})
        ...
```

**Input arguments to Grant Form Filler Robot:**
```json
{
  "in_farmerName": "Adebayo Ogundimu",
  "in_farmerEmail": "adebayo@gmail.com",
  "in_farmerPhone": "08012345678",
  "in_stateOfResidence": "Kwara",
  "in_lga": "Ilorin West",
  "in_farmLocation": "Ilorin",
  "in_farmType": "Crop Farming",
  "in_farmSizeHectares": 5.0,
  "in_cropOrLivestockTypes": "Rice, Maize",
  "in_yearsInOperation": 7,
  "in_annualRevenueNGN": 3500000.0,
  "in_grantProgram": "CBN Anchor Borrowers Programme",
  "in_requestedFundingAmountNGN": 5000000.0,
  "in_proposedProjectDescription": "Expand rice production with mechanized farming...",
  "in_hasBVN": true,
  "in_hasCACRegistration": true,
  "in_isMemberOfCooperative": true,
  "in_hasLandDocument": true,
  "in_isSmallholderFarmer": true,
  "in_isYouthFarmer": false,
  "in_isWomanFarmer": false,
  "in_hasExistingLoanDefault": false,
  "in_ninDocumentPath": "/uploads/docs/farmer123/nin.pdf",
  "in_cacDocumentPath": "/uploads/docs/farmer123/cac.pdf",
  "in_bankStatementPath": "/uploads/docs/farmer123/bank.pdf",
  "in_landDocumentPath": "/uploads/docs/farmer123/land.pdf",
  "in_additionalNotes": "",
  "in_declarationAgreed": true,
  "in_targetPortalURL": "https://nagap.vercel.app/grant-application-form"
}
```

**Output arguments from robot:**
```json
{
  "out_portalReference": "NAGAP-2026-4821",
  "out_submissionStatus": "Success",
  "out_screenshotPath": "C:\\screenshots\\submission_20260613.png",
  "out_errorMessage": ""
}
```

---

## Email Service

```python
# services/email_service.py
# Triggered after robot completes submission

async def send_submission_confirmation(farmer_email: str, data: dict):
    """Send: 'Your application was submitted! Reference: NAGAP-2026-4821'"""

async def send_status_update(farmer_email: str, data: dict):
    """Send: 'Your application status changed to: Approved/Rejected/Needs Changes'"""

async def send_followup_request(farmer_email: str, data: dict):
    """Send: 'The grant body requires additional documents. Please upload X by Y date.'"""
```

---

## Frontend Changes Needed (chat/page.tsx)

### 1. Multi-step pipeline visibility
Add to ChatMessage interface:
```typescript
interface PipelineStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  icon: string;
  message?: string;
}

interface ChatMessage {
  // ...existing fields
  pipelineStatus?: PipelineStep[];  // NEW
}
```

Render a stepper component when `msg.pipelineStatus` exists.

### 2. Document upload button
Add a paperclip/attachment button next to the Send button. On click → file picker → POST to `/api/documents/upload` → show confirmation in chat.

### 3. SSE for real-time updates
When pipeline starts, connect to `/api/pipeline/stream/{applicationId}` via EventSource. Update the pipeline steps in real-time in the chat.

### 4. New suggested actions
Add handlers in `handleActionClick`:
```typescript
case 'SUBMIT_APPLICATION':
  // Call /api/pipeline/start with grant data
  break;
case 'CHECK_STATUS':
  // Call /api/pipeline/status/{id}
  break;
case 'GENERATE_PROPOSAL':
  // Send "Generate a proposal for [grant]" to chat
  break;
```

---

## Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/agrigrant

# OpenRouter LLM
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
LLM_MODEL=google/gemini-2.0-flash

# UiPath Orchestrator
UIPATH_CLIENT_ID=your-external-app-client-id
UIPATH_CLIENT_SECRET=your-secret
UIPATH_ORG=your-org-slug
UIPATH_TENANT=your-tenant-slug
UIPATH_FOLDER_ID=3051296
UIPATH_PROCESS_KEY=Grant_Form_Filler_Robot

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password
EMAIL_FROM=AgricGrant AI <noreply@agrigrant.ng>

# App
SECRET_KEY=your-jwt-secret
UPLOAD_DIR=./uploads
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

---

## Deployment Plan
1. **Dev**: Run locally with `uvicorn app.main:app --reload`
2. **Prod**: Deploy to Railway.app or Render.com (free tier PostgreSQL included)
3. **UiPath Robot**: Runs on UiPath Cloud (unattended) — triggered via API
