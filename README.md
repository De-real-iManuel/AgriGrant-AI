# AgriGrant AI 🌾🤖

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![UiPath](https://img.shields.io/badge/UiPath-Automation_First-orange.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)]()

> **Submission for the UiPath AI Hackathon 2026**

AgriGrant AI is an intelligent, end-to-end automation platform designed to bridge the funding gap for Nigerian smallholder farmers. By leveraging **UiPath RPA**, **Document Understanding**, and **Agentic AI**, we automate the extremely complex and bureaucratic process of finding, applying for, and securing agricultural grants.

---

## 🎯 The Problem
In Nigeria, millions of smallholder farmers struggle to secure funding from Federal (e.g., CBN Anchor Borrowers), State, and Private/International (USAID, World Bank) programs. The barriers are immense:
1. **Discoverability:** Farmers don't know which grants they qualify for.
2. **Bureaucracy & Literacy:** Crafting a professional, high-quality business proposal is nearly impossible for a rural farmer.
3. **Compliance:** 90% of applications fail due to missing compliance documents (CAC, NIN, Bank Statements) or poorly drafted budgets.

## 🚀 The AgriGrant Solution
AgriGrant AI completely automates this lifecycle using a hybrid AI-RPA architecture with seamless Human-in-the-Loop (HITL) integration.

1. **Intelligent Onboarding & Matching:** A farmer fills out a simple form. Our UiPath Agent cross-references their farm size, location, and crops against a live database of grants to find perfect matches.
2. **AI Proposal Generation:** The system drafts a highly professional, tailored business proposal and budget breakdown based on the specific grant's strict requirements.
3. **Document QA (Document Understanding):** UiPath inspects uploaded files (NIN, Bank Statements, CAC) to ensure they are valid and up-to-date before submission.
4. **Human-in-the-Loop (HITL):** Before submitting the final application, the Orchestrator pauses. The drafted proposal and checklist are pushed to a beautiful React Dashboard where a grant specialist (or the farmer) reviews, edits, and approves the proposal with a single click.
5. **Automated Submission & Appeals:** UiPath submits the application. If the grant provider rejects it, the AI Agent scrapes the rejection reason, evaluates the recoverability, and suggests grounds for a formal appeal.

---

## 🏗️ System Architecture

AgriGrant AI is built on a scalable, secure, multi-tenant architecture:

* **The Engine (UiPath Orchestrator & Studio):** Drives the BPMN pipeline, executes the AI Document Understanding, and orchestrates the web-scraping/submission bots.
* **The Brain (FastAPI Python Backend):** Handles complex data routing, orchestrates secure webhooks between the React frontend and UiPath Orchestrator, and manages the Supabase PostgreSQL database.
* **The Dashboard (Next.js & React):** A real-time, responsive web app featuring Server-Sent Events (SSE). It serves as the primary interface for the farmer and the Grant Specialist to interact with the UiPath HITL tasks.

---

## 💻 Tech Stack

| Component | Technologies Used |
| :--- | :--- |
| **Automation & AI** | UiPath Studio, UiPath Orchestrator, Document Understanding, BPMN |
| **Backend API** | Python, FastAPI, Uvicorn, Pydantic |
| **Frontend Web** | Next.js, React, Tailwind CSS, Server-Sent Events (SSE) |
| **Database** | Supabase (PostgreSQL), Alembic (Migrations) |
| **Infrastructure** | Docker, Vercel, Docker Hub |

---

## 🔐 Security & Multi-Tenancy
To ensure enterprise-grade security and privacy:
- **Zero-Exposure Webhooks:** The React frontend never communicates directly with UiPath. All HITL approvals are securely proxied through the Python backend.
- **Multi-Tenant Isolation:** The application strictly isolates task polling using uniquely generated `jobId` sessions. A farmer can absolutely never intercept or view another farmer's pipeline data.

---

## 🔮 Future Roadmap
- **USSD/SMS Integration:** Allowing completely offline farmers to interact with the UiPath Agent via simple text messages.
- **Local Language Translation:** Automatically translating the drafted proposals from English to Hausa, Yoruba, or Igbo for the farmer's review, while submitting in English.
- **Micro-Lending Integration:** If a grant is rejected, automatically routing the farmer's profile to local micro-finance APIs for immediate alternative capital.

---

## 🛠️ Local Setup & Deployment

### 1. Backend (Python/FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*(Or use Docker: `docker build -t agrigrant-backend . && docker run -p 8000:8000 agrigrant-backend`)*

### 2. Frontend (Next.js)
```bash
cd web
npm install
npm run dev
```

### 3. UiPath
- Open the `UiPath-automation` folder in UiPath Studio.
- Configure your Orchestrator credentials and publish the process.
- Map the webhooks to your live backend domain (e.g., `https://api.agrigrant.xyz`).

---

### Developed for the 2026 UiPath AI Hackathon
*Empowering the backbone of the African economy with automation.*
