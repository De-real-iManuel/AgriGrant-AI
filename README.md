# AgriGrant AI

**AI-Powered Nigerian Agricultural Grant Discovery & Application System**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Built with UiPath](https://img.shields.io/badge/Built%20with-UiPath%20Agentic%20Automation-orange?style=for-the-badge)](https://uipath.com)

---

## Overview

AgriGrant AI is an end-to-end intelligent platform that helps Nigerian smallholder farmers discover, assess eligibility for, and submit agricultural grant applications — in under 10 minutes.

The system is built on **UiPath Agentic Automation**, orchestrating five specialized AI agents across a BPMN pipeline. Each agent handles a distinct stage of the grant application process: discovery, eligibility scoring, document validation, proposal writing, and submission packaging.

---

## The Problem

Nigerian smallholder farmers lose significant agricultural grant funding annually due to:

- Limited awareness of available programs (CBN, NIRSAL, BOA, FMARD, state and international donors)
- Inability to self-assess eligibility against complex Nigerian compliance requirements (BVN, CAC, CRMS clean record, cooperative membership)
- No access to formal application letter writing at government standards
- Unclear submission channels — online portals vs. physical ministry offices
- Document preparation barriers (NIN, CAC certificate, bank statements, C of O, cooperative letters)

---

## Solution

AgriGrant AI removes these barriers through a five-agent AI pipeline:

1. **Discovers** matching grants from the web based on the farmer's specific profile
2. **Scores** eligibility (0–100) against Nigerian compliance requirements, with hard disqualifiers enforced
3. **Validates** uploaded documents (NIN, CAC, bank statements, C of O, cooperative letters)
4. **Generates** complete, print-ready application letters tailored to each grant body
5. **Packages** submission instructions, follow-up schedule, and delivers everything via email

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AgriGrant AI — System Architecture            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FRONTEND LAYER                                                  │
│  ┌──────────────────────┐    ┌────────────────────────┐         │
│  │  UiPath App          │    │  Custom Web App         │         │
│  │  (SimpleApprovalApp) │    │  (Next.js/React)        │         │
│  │  - Farmer form       │    │  - Multi-step form      │         │
│  │  - Results display   │    │  - Real-time status     │         │
│  │  - Letter download   │    │  - Mobile responsive    │         │
│  └──────────┬───────────┘    └──────────┬─────────────┘         │
│             │                            │                       │
│             ▼                            ▼                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              AgriGrant API Workflow (Backend)          │       │
│  │  - Input validation                                    │       │
│  │  - Draft letter generation                             │       │
│  │  - SendGrid email confirmation                         │       │
│  │  - Application reference generation (AGR-XXXXXX)       │       │
│  └──────────────────────────┬───────────────────────────┘       │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────┐       │
│  │     Nigerian AgriGrant Pipeline (BPMN Orchestration)  │       │
│  │                                                        │       │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐             │       │
│  │  │ Agent 1 │──▶│ Agent 2 │──▶│ Agent 3 │             │       │
│  │  │  Grant  │   │Eligblty │   │  Doc    │             │       │
│  │  │Discovery│   │& Risk   │   │Underst. │             │       │
│  │  └─────────┘   └─────────┘   └────┬────┘             │       │
│  │                                    │                  │       │
│  │  ┌─────────┐   ┌─────────┐        │                  │       │
│  │  │ Agent 5 │◀──│ Agent 4 │◀───────┘                  │       │
│  │  │Submitn  │   │Proposal │                            │       │
│  │  │&Followup│   │  Gen.   │                            │       │
│  │  └────┬────┘   └─────────┘                            │       │
│  │       │                                               │       │
│  │       ▼                                               │       │
│  │  ┌──────────────────┐                                │       │
│  │  │  SendGrid Email   │                                │       │
│  │  │  (Full Report)    │                                │       │
│  │  └──────────────────┘                                │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  RPA Robot (UiPath Studio Desktop)                               │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Portal Form Filler — Automates government portals    │       │
│  │  (NIRSAL, CBN, State Ministry websites)               │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Five UiPath Agents

All agents are built on **UiPath Agentic Automation** and orchestrated via **UiPath BPMN Process Orchestration**.

### Agent 1 — Grant Discovery & Matching
Searches the live web for Nigerian agricultural grant programs matching the farmer's profile.

- Tool: UiPath GenAI Web Search
- Output: `matchedGrants[]`, `topRecommendation`, `profileGaps`, `totalMatchesFound`
- Coverage: CBN ABP, NIRSAL AGSMEIS/AMSMES, BOA, FMARD APPEALS, IFAD VCDP, all 36 state programs, GIZ, FAO, USAID, World Bank

### Agent 2 — Eligibility & Risk Assessment
Scores farmer eligibility (0–100) against Nigerian compliance requirements. Hard disqualifiers are enforced strictly.

- Output: `overallEligibilityScore`, `eligibilityVerdict`, `nigerianComplianceFlags`, `strengths[]`, `riskFactors[]`, `missingItems[]`, `analystNarrative`

| Scoring Category | Weight |
|------------------|--------|
| Farm Profile Alignment | 25% |
| Financial Eligibility | 20% |
| Project Relevance | 25% |
| Documentation Readiness | 15% |
| Compliance & Planning | 15% |

Hard disqualifiers: No BVN → compliance capped at 20 | Loan default → score capped at 0 | No CAC (when required) → capped at 25

### Agent 3 — Document Understanding
Extracts, validates, and cross-references uploaded Nigerian identity and compliance documents.

- Tools: UiPath Analyze Files (single-page), DeepRAG (multi-page PDFs)
- Supported documents: NIN Slip, PVC, Passport, Driver's Licence, C of O, R of O, Survey Plan, CAC Certificate, Bank Statement, NIRSAL/CBN Loan Docs, Cooperative Certificate, NAFDAC Permit
- Output: `documentResults[]`, `consolidatedFarmerProfile`, `crossDocumentInconsistencies[]`, `overallDocumentScore`, `documentVerdict`

### Agent 4 — Proposal Generation
Writes complete, print-ready application letters tailored to specific Nigerian grant bodies.

- Tools: UiPath Analyze Files, Batch Transform
- Output: `applicationLetters[]`, `preparationChecklist`, `submissionInstructions`
- Letter formats: formal government, state ministry, microfinance, NGO expression of interest, development bank

### Agent 5 — Submission & Follow-up
Builds the complete submission package — where to submit, how, and a follow-up schedule.

- Tool: UiPath GenAI Web Search
- Output: `submissionInstructions`, `followUpSchedule`, `emailPayload` (ready for SendGrid)
- Language support: English, Pidgin English, Bilingual

---

## Pipeline Flow (BPMN)

```
START — Farmer Profile Received
    ↓
1. Discover Matching Grants         [Agent 1]
    ↓
2. Assess Eligibility & Risk        [Agent 2]
    ↓
3. ◆ Documents Uploaded?
   ├── YES → Verify Documents       [Agent 3]
   └── NO  → skip
    ↓
4. Generate Application Letters     [Agent 4]
    ↓
5. Prepare Submission Package       [Agent 5]
    ↓
6. Send Email via SendGrid          [HTTP POST]
    ↓
END — Grant Package Delivered
```

---

## AgriGrant API Workflow

**Type:** UiPath Studio Web — API Project

Handles synchronous response on submission: validates input, generates a draft letter, sends a confirmation email, and returns a reference number — before the full pipeline completes in the background.

### API Inputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| farmerName | string | ✅ | Full legal name |
| farmerEmail | string | ✅ | Email for notifications |
| farmLocation | string | ✅ | Nigerian state & LGA |
| farmSizeHectares | number | ✅ | Farm area in hectares |
| farmType | string | ✅ | crop / livestock / poultry / mixed |
| cropOrLivestockTypes | string | ✅ | Comma-separated types |
| yearsInOperation | number | ✅ | Years actively farming |
| annualRevenueNGN | number | ✅ | Annual revenue in Naira |
| requestedFundingAmountNGN | number | ✅ | Grant amount requested |
| proposedProjectDescription | string | ✅ | How funds will be used |
| hasBVN | boolean | ✅ | Has Bank Verification Number |
| hasCACRegistration | boolean | ✅ | CAC registered |
| isMemberOfCooperative | boolean | ✅ | Cooperative society member |
| hasLandDocument | boolean | ✅ | Holds C of O / R of O / Survey Plan |
| isSmallholderFarmer | boolean | ✅ | Under 5 hectares |
| isYouthFarmer | boolean | ✅ | Aged 18–35 |
| isWomanFarmer | boolean | ✅ | Woman/woman-led farm |
| hasExistingLoanDefault | boolean | ✅ | Existing CRMS loan default |
| additionalNotes | string | ❌ | Any extra context |

### API Outputs

| Field | Description |
|-------|-------------|
| `applicationReference` | e.g. "AGR-843921" |
| `confirmationEmailSent` | true / false |
| `submissionStatus` | "Received" / "Email Failed" |
| `applicationLetterText` | Full draft letter |
| `farmerName`, `farmerEmail`, `farmLocation` | Echoed back |
| `message` | Human-readable result |

---

## Email Delivery

| Parameter | Value |
|-----------|-------|
| Provider | SendGrid |
| Endpoint | POST https://api.sendgrid.com/v3/mail/send |
| From | info@agrigrant.xyz |
| Success Code | 202 |

Two-stage delivery:

1. **Immediate** — Confirmation + draft letter + reference number (from API workflow, synchronous)
2. **Full Report** — AI-refined report with matched grants, eligibility score, final letter, and submission instructions (from pipeline, asynchronous)

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| AI Agents | UiPath Agentic Automation | 5 specialized AI agents |
| Orchestration | UiPath BPMN Process Orchestration | Pipeline sequencing with conditional branching |
| Backend API | UiPath Studio Web (API Project) | Input validation, email, letter generation |
| Frontend (A) | UiPath Apps | Low-code farmer form |
| Frontend (B) | Next.js 14 + TypeScript + Tailwind CSS | Custom web application |
| Email | SendGrid API | Transactional email delivery |
| RPA | UiPath Studio Desktop | Government portal automation |
| LLM | UiPath GenAI (GPT-4o / Claude) | Powers all 5 agents |
| Document AI | UiPath Analyze Files + DeepRAG | Document extraction and validation |
| Web Search | UiPath GenAI Web Search | Live grant discovery |

---

## Nigerian Grant Programs Supported

| Program | Body | Target | Max Amount |
|---------|------|--------|-----------|
| Anchor Borrowers Programme (ABP) | CBN | Smallholders in cooperatives | Varies by commodity |
| AGSMEIS | NIRSAL | SMEs with CAC | ₦10,000,000 |
| AMSMES | NIRSAL | Larger agribusinesses | Varies |
| Micro-Agriculture Loan | BOA | Smallholders | ₦50,000–₦500,000 |
| Small/Medium Loan | BOA | CAC-registered farms | ₦500,000–₦5,000,000 |
| CACS | CBN | Large agribusiness (₦100M+ turnover) | Varies |
| APPEALS | FMARD / World Bank | Smallholders in 6 states | Varies |
| VCDP | IFAD | Cassava/rice value chains | Varies |
| State Programs | 36 State Ministries | Varies | Varies |
| International | GIZ, FAO, USAID, ActionAid | Various | Varies |

---

## Nigerian Compliance Framework

| Requirement | Document | Impact |
|-------------|----------|--------|
| BVN | 11-digit bank number | Required for all CBN/NIRSAL/BOA programs |
| NIN | 11-digit NIMC number | Required for all programs |
| CAC Registration | RC or BN number | Required for NIRSAL AGSMEIS, CBN CACS, FMARD |
| Cooperative Membership | Membership letter | Required for CBN ABP, IFAD VCDP |
| Land Document | C of O / R of O / Survey Plan | Required for BOA and land-linked grants |
| Clean CRMS Record | No loan default | Default = disqualification from CBN/NIRSAL/BOA |
| Bank Statement | 3–6 months, stamped | Required for NIRSAL, BOA medium loans |

---

## Project Structure

```
AgriGrant-AI/
├── Grant Discovery & Matching Agent/      # Agent 1 — UiPath Agentic
├── Eligibility & Risk Assessment Agent/   # Agent 2 — UiPath Agentic
├── Document Understanding Agent/          # Agent 3 — UiPath Agentic
├── Proposal Generation Agent/             # Agent 4 — UiPath Agentic
├── Submission & Follow-up Agent/          # Agent 5 — UiPath Agentic
├── Nigerian AgriGrant Pipeline/           # BPMN Process Orchestration
├── AgriGrant API/                         # UiPath Studio Web API Project
│   └── Workflow.json
├── SimpleApprovalApp/                     # UiPath App (frontend)
├── web/                                   # Next.js Custom Web App
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/               # Landing page components
│   │   │   ├── dashboard/                # Agent dashboard
│   │   │   ├── farmer-portal/            # Farmer intake & results
│   │   │   ├── sign-up-login-screen/     # Authentication
│   │   │   └── grant/[id]/               # Grant detail view
│   │   ├── components/ui/                # Shared UI components
│   │   └── context/                      # Auth, Theme, Portal contexts
│   └── public/assets/
└── README.md
```

---

## How It Works

1. Farmer opens AgriGrant AI (UiPath App or custom web app)
2. Completes a multi-step form: personal details → farm profile → compliance checklist → document upload
3. Clicks **"Submit My Application"**
4. Immediately receives a reference number and confirmation email
5. In the background, the Nigerian AgriGrant Pipeline runs all five agents
6. Farmer receives a full grant report by email:
   - Top 3–5 matched grants with URLs and deadlines
   - Eligibility score (0–100) with detailed breakdown
   - Nigerian compliance flags (BVN, CAC, Cooperative, etc.)
   - Ready-to-submit application letter formatted for the specific grant body
   - Exact submission instructions (portal URL or physical office address)
   - Document checklist
   - Follow-up schedule

---

## RPA Robot — Portal Automation

The UiPath Studio Desktop robot automates direct submission to Nigerian government grant portals using the structured farmer data produced by the pipeline.

**Target portals:**
- NIRSAL Portal (nirsal.com)
- CBN Anchor Borrowers Platform
- Bank of Agriculture (BOA) portal
- State Ministry of Agriculture websites (36 states)
- FMARD online application system

**Capabilities:** Browser automation (Chrome/Edge), form filling from structured data, document upload, CAPTCHA flagging for human intervention (attended mode), screenshot capture for audit trail, confirmation number extraction.

**Demo flow:**
1. Robot receives structured farmer data from AgriGrant AI
2. Opens Chrome → navigates to the NAGAP demo portal (`portal.agrigrant.xyz/apply`)
3. Fills all form fields, uploads documents, clicks Submit
4. Reads the `applicationReference` from the success page
5. Returns the reference number to AgriGrant AI
6. AgriGrant AI emails the farmer: *"Your application has been submitted — Reference: NAGAP-XXXXXX"*

---

## Test Data

```json
{
  "farmerName": "Adamu Livestock",
  "farmerEmail": "test@example.com",
  "farmLocation": "Rivers State, Port Harcourt LGA",
  "farmSizeHectares": 3.2,
  "farmType": "Mixed Farming",
  "cropOrLivestockTypes": "Cattle, Poultry, Cassava",
  "yearsInOperation": 4,
  "annualRevenueNGN": 14200000,
  "requestedFundingAmountNGN": 5000000,
  "proposedProjectDescription": "Purchase of additional cattle for fattening and expansion of existing poultry pens to increase egg production.",
  "hasBVN": true,
  "hasCACRegistration": true,
  "isMemberOfCooperative": true,
  "hasLandDocument": true,
  "isSmallholderFarmer": true,
  "isYouthFarmer": true,
  "isWomanFarmer": false,
  "hasExistingLoanDefault": false,
  "additionalNotes": "Farm has consistent sales records for the past 2 years and a standing off-taker agreement with a local hotel."
}
```

---

## Roadmap

- [ ] Full RPA portal submission automation (NIRSAL, CBN, BOA)
- [ ] SMS notifications for farmers without email
- [ ] WhatsApp bot integration
- [ ] Offline mode for low-connectivity areas
- [ ] Batch processing for cooperative group applications
- [ ] Grant success tracking dashboard
- [ ] Integration with Nigerian agricultural extension services

---

## Team

| Name | Role | Contact |
|------|------|---------|
| Nwajari Emmanuel | Founder & Technical Lead | nwajariemmanuel355@gmail.com |
| Kodu Giobari | Operations Lead | giobarikodu@gmail.com |

---

*Built by REM Labs — Powered by UiPath Agentic Automation*
