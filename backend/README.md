# AgriGrant AI - FastAPI Backend

This directory contains the Python FastAPI backend for the AgriGrant AI platform, acting as the critical orchestration layer between the Next.js frontend and the UiPath automation pipeline.

## Purpose and Context

In the context of the AgriGrant AI architecture, the backend serves as the "Brain." While the UiPath agents execute the heavy lifting of document analysis and web automation, they require a secure, reliable intermediary to communicate with the human grant specialists.

**Why is this layer necessary?**
Directly connecting a web frontend to enterprise RPA endpoints (like UiPath Orchestrator) exposes sensitive webhook URLs and pipeline configurations to the public internet. Furthermore, the frontend is stateless and cannot reliably track the asynchronous progress of long-running automation jobs.

This backend solves these issues by:
1. **Providing Zero-Exposure Webhooks:** The frontend communicates only with this backend. The backend securely signs and proxies these requests to UiPath, entirely abstracting the Orchestrator infrastructure.
2. **Managing State:** It utilizes a Supabase PostgreSQL database to persist pipeline metadata, ensuring that if a user loses connection, their grant application state is perfectly preserved.
3. **Enforcing Multi-Tenancy:** It dynamically filters incoming webhooks and assigns them to specific session identifiers, guaranteeing that farmers and specialists only access the data assigned to their specific pipeline execution.

## Core Modules

* `api/hitl.py`: Manages the Human-in-the-Loop tasks. It receives payloads from UiPath when an agent suspends a job, stores the task, and serves it to the frontend via Server-Sent Events (SSE).
* `api/documents.py`: Handles secure document uploads, acting as a proxy for the UiPath Document Understanding models to ingest farmer compliance files.
* `services/database_service.py`: Interfaces with the Supabase PostgreSQL instance to manage user profiles, application state, and task metadata.

## Technical Stack

* **Framework:** FastAPI (Python 3.10+)
* **Database:** Supabase (PostgreSQL)
* **Migrations:** Alembic
* **Server:** Uvicorn

## Setup Instructions

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables in a `.env` file (Supabase credentials, UiPath webhook keys).
4. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
