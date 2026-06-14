# AgriGrant AI Backend

Production-ready FastAPI backend for **AgriGrant AI** — an AI-powered Nigerian agricultural grant discovery and application system. It coordinates five UiPath AI agents, processes farmer profile applications, translates technical grant jargon into warm, friendly English and Pidgin, and handles real-time chat sessions.

---

## Prerequisites
- **Python 3.11+** installed
- **pip** package manager

## Quick Start

1. **Clone/Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Modify the `.env` values with your credentials (see below).

4. **Run Server Local**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. **Run Tests**:
   ```bash
   pytest tests/ -v
   ```

---

## Mock Mode Configuration
To run and test the application without actual UiPath credentials:
- Set `NEXT_PUBLIC_USE_MOCK_API=true` in your `.env`.
- The endpoints will automatically simulate pipeline jobs (~8 seconds delay) and chat routing locally with realistic data.

---

## How to Get UiPath Credentials
1. Log in to [UiPath Automation Cloud](https://cloud.uipath.com).
2. Go to **Admin > Tenant > Services > API Access** to fetch your:
   - `Client ID`
   - `Client Secret`
   - `Organization Name`
   - `Tenant Name`
3. Go to **Orchestrator > Folders** to find your `Folder ID` (visible in the browser URL as `FolderId=XXXXXX` or via the folders dropdown).
4. Create processes in Orchestrator for grant discovery and get their **Release Keys** (`UIPATH_PIPELINE_PROCESS_KEY` & `UIPATH_API_WORKFLOW_PROCESS_KEY`).
5. Build Agents in **Agent Builder** and retrieve their **Agent Keys** (`UIPATH_GRANT_DISCOVERY_AGENT_KEY` & `UIPATH_ELIGIBILITY_AGENT_KEY`).

---

## API Reference

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/health` | GET | Service connectivity health status | None |
| `/api/pipeline/submit` | POST | Submit form and trigger matching pipeline | None |
| `/api/pipeline/status/{job_id}` | GET | Fetch matching pipeline progress / results | None |
| `/api/chat/start` | POST | Initialize a session and get a JWT token | None |
| `/api/chat/message` | POST | Send messages to UiPath chat agents | JWT Bearer |
| `/api/chat/history/{session_id}`| GET | Get session message history | JWT Bearer |
| `/api/chat/ws/{session_id}` | WS | WebSocket endpoint for streaming chat | Token in frame |
