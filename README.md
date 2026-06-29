# AgriGrant AI

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![UiPath](https://img.shields.io/badge/UiPath-Automation_First-orange.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)]()

> **Submission for the UiPath AI Hackathon 2026**

AgriGrant AI is an intelligent, end-to-end automation platform designed to bridge a critical funding gap in the developing world. By leveraging UiPath RPA, Document Understanding, and Agentic AI, we automate the highly bureaucratic process of discovering, qualifying for, and securing agricultural grants for smallholder farmers.

---

## The Context: Why This Matters

To understand the impact of AgriGrant AI, one must understand the paradox of the African agricultural sector.

Smallholder farmers form the backbone of the Nigerian economy, producing over 80% of the nation's food. However, these farmers operate largely in the informal sector. They lack formal financial history, high digital literacy, and the structural organization typical of Western commercial farming.

Simultaneously, billions of dollars in agricultural development grants are deployed annually by organizations such as the World Bank, USAID, and various Federal interventions (e.g., the Anchor Borrowers' Program). 

**The Disconnect:** The farmers who desperately need this capital are the least equipped to navigate the complex application processes. They do not know these grants exist, they cannot synthesize the formal business proposals required by international donors, and they frequently fail compliance checks due to unstructured documentation. Consequently, the capital often fails to reach the grassroots level.

AgriGrant AI solves this by acting as a highly intelligent, automated proxy between the rural farmer and the institutional donor.

---

## The AgriGrant Solution

We utilize a hybrid AI-RPA architecture to completely abstract the complexity of grant applications away from the user.

1. **Intelligent Onboarding & Matching:** A farmer completes a simplified, accessible intake form. A UiPath Agent cross-references their specific data (farm size, geographical location, crop type) against a live, constantly updated database of active grants to find perfect eligibility matches.
2. **AI-Driven Proposal Generation:** The system drafts a comprehensive, highly professional business proposal and financial budget breakdown. This is tailored dynamically to meet the strict linguistic and structural requirements of the specific grant provider.
3. **Document Verification (Document Understanding):** UiPath inspects unstructured uploaded files (identity documents, land ownership proofs, bank statements) to ensure compliance and validity before the application is ever submitted, drastically reducing technical rejection rates.
4. **Human-in-the-Loop (HITL):** We recognize that high-stakes financial applications require human oversight. Before submission, Orchestrator pauses the pipeline. The drafted proposal and compliance checklist are pushed to a secure React Dashboard where a grant specialist reviews and approves the data with a single click.
5. **Automated Submission & Strategic Appeals:** UiPath executes the final submission. If a grant provider rejects the application, our AI Agent scrapes the portal for the rejection rationale, evaluates the recoverability score, and formulates a strategy for a formal appeal.

---

## System Architecture: The 5-Stage Pipeline

AgriGrant AI is built on a scalable, secure, multi-tenant architecture designed for enterprise-grade reliability. The architecture follows a strict **5-Stage Pipeline** across **3 Swimlanes** (Farmer, AI & Automation, and Human Specialist).

```mermaid
sequenceDiagram
    participant F as 👨‍🌾 Farmer (Next.js Dashboard)
    participant AI as 🤖 UiPath AI & Automation
    participant S as 👩‍💼 Human Specialist (HITL Portal)

    Note over F, S: STAGE 1: Discover & Match
    F->>AI: Submits Farm Profile
    AI-->>F: Grant Discovery Agent (Scores & Ranks Grants)
    
    Note over F, S: STAGE 2: Trust Vault (Document Upload)
    F->>AI: Uploads NIN, CAC, Bank Statements
    AI-->>AI: Document Understanding + Eligibility Agent (Extract & Validate)
    AI-->>F: Updates Trust Score (e.g., 720/1000)

    Note over F, S: STAGE 3: Proposal Draft
    AI-->>AI: Proposal Generation Agent (LLM drafts structured proposal)
    
    Note over F, S: STAGE 4: Human Review (BPMN HITL)
    AI->>S: Routes drafted proposal via secure Webhook
    S->>S: QA Checklist (Grant Alignment, Budget Justification)
    S-->>AI: Approves / Requests Revisions / Rejects

    Note over F, S: STAGE 5: Submit & Track
    AI->>AI: Submission & Follow-up Agent (RPA Web Automation)
    AI-->>F: Updates Live Tracking (Submitted / Under Review / Awarded)
```

### The UiPath Brain (`/UiPath-automation`)
Our automation logic is divided into specialized, modular UiPath Agents:
1. **Grant Discovery & Matching Agent:** Parses natural language queries and cross-references farmer data against active grant databases.
2. **Document Understanding Agent:** Extracts and validates compliance data from unstructured PDFs and images (Trust Vault).
3. **Proposal Generation Agent:** Uses LLMs to structure professional narratives and financial budgets.
4. **Nigerian AgriGrant Pipeline (BPMN):** The core Orchestrator workflow that manages state and suspends execution to wait for Human-in-the-Loop approvals from the React frontend.
5. **Submission & Follow-up Agent:** A headless RPA bot that navigates institutional funding portals to automatically fill out forms and upload annexures.

---

## Technical Innovations

To ensure enterprise-grade security and privacy, AgriGrant AI implements several advanced architectural patterns:

- **Zero-Exposure Webhooks:** The React frontend never communicates directly with UiPath. All HITL approvals are securely proxied through the Python backend, preventing malicious actors from intercepting Orchestrator URLs.
- **Strict Multi-Tenant Isolation:** The application isolates task polling using uniquely generated session identifiers. The backend dynamically filters webhook payloads, ensuring a user can absolutely never intercept or view another user's pipeline data or financial documents.

---

## Future Roadmap

Our vision for AgriGrant AI extends beyond the initial web interface:

- **USSD and SMS Integration:** Allowing completely offline farmers in deeply rural areas to interact with the UiPath Agent via basic cellular text messages, removing the requirement for internet access.
- **Localized Language Translation:** Automatically translating the drafted proposals from English to native languages (Hausa, Yoruba, Igbo) for the farmer's comprehension during the review stage, while retaining the English format for the official submission.
- **Micro-Lending Fallback Integration:** If an institutional grant is definitively rejected, automatically routing the farmer's verified profile to local micro-finance APIs to secure immediate, alternative capital.

---

## Local Setup & Deployment

### 1. Backend (Python/FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)
```bash
cd web
npm install
npm run dev
```

### 3. UiPath
- Open the `UiPath-automation` folder in UiPath Studio.
- Configure your Orchestrator credentials and publish the process.
- Map the webhooks to your live backend domain.

---

*Developed for the 2026 UiPath AI Hackathon. Empowering the foundation of the global agricultural economy through intelligent automation.*
