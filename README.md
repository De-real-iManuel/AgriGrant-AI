# 🌾 AgriGrant AI

> **AI-Powered Nigerian Agricultural Grant Discovery & Application System**

[![UiPath Hackathon 2026](https://img.shields.io/badge/UiPath%20Hackathon-2026-orange?style=for-the-badge)](https://uipath.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

## 🏆 Hackathon

**UiPath Agentic Automation Hackathon 2026**

### Team
| Name | Role | Contact |
|------|------|---------|
| NWAJARI EMMANUEL | Founder & Technical Lead | nwajariemmanuel355@gmail.com |
| KODU GIOBARI | Operations Lead | giobarikodu@gmail.com |

---

## 🔴 The Problem

Nigerian smallholder farmers lose **millions in unclaimed agricultural grants** every year because:

- 🔍 They don't know which grants exist (CBN, NIRSAL, BOA, FMARD, state programs, international donors)
- 📋 They can't assess their own eligibility against complex Nigerian compliance requirements (BVN, CAC, cooperative membership, CRMS clean record)
- ✍️ They can't write formal application letters that meet government standards
- 🏢 They don't know WHERE or HOW to submit (online portals vs physical offices)
- 📁 Document preparation is overwhelming (NIN, CAC certificate, bank statements, C of O, cooperative letters)

> **AgriGrant AI reduces the grant application process from 3–4 weeks of confusion to under 10 minutes.**

---

## ✅ The Solution

AgriGrant AI is a **5-agent AI pipeline** built on UiPath Agentic Automation that:

1. **Discovers** matching Nigerian agricultural grants from the web for a farmer's specific profile
2. **Scores** eligibility (0–100) against Nigerian compliance requirements — honestly, with hard disqualifiers
3. **Validates** uploaded documents (NIN, CAC, bank statements, C of O, cooperative letters)
4. **Generates** complete, print-ready application letters tailored to each grant body
5. **Packages** full submission instructions + follow-up schedule + email delivery via SendGrid

---

## 🏗️ System Architecture

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
│  │         AgriGrant API Workflow (Backend)               │       │
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
│  │  │ Grant   │   │Eligblty │   │Doc Undst│             │       │
│  │  │Discovery│   │& Risk   │   │(if docs)│             │       │
│  │  └─────────┘   └─────────┘   └────┬────┘             │       │
│  │                                    │                  │       │
│  │  ┌─────────┐   ┌─────────┐        │                  │       │
│  │  │ Agent 5 │◀──│ Agent 4 │◀───────┘                  │       │
│  │  │Submitn  │   │Proposal │                            │       │
│  │  │&Followup│   │Generatn │                            │       │
│  │  └────┬────┘   └─────────┘                            │       │
│  │       │                                               │       │
│  │       ▼                                               │       │
│  │  ┌──────────────────┐                                │       │
│  │  │ SendGrid Email    │                                │       │
│  │  │ (Full Report)     │                                │       │
│  │  └──────────────────┘                                │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  PHASE 2 — RPA Robot (Desktop)                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Portal Form Filler — Automates government portals    │       │
│  │  (NIRSAL, CBN, State Ministry websites)               │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 The 5 AI Agents

### Agent 1 — Grant Discovery & Matching
- **Purpose:** Searches the web for Nigerian agricultural grants matching the farmer's profile
- **Tools:** UiPath GenAI Web Search
- **Output:** `matchedGrants[]`, `topRecommendation`, `profileGaps`, `totalMatchesFound`
- **Knowledge Base:** CBN ABP, NIRSAL AGSMEIS/AMSMES, BOA, FMARD APPEALS, IFAD VCDP, state programs, GIZ, FAO, USAID, World Bank

### Agent 2 — Eligibility & Risk Assessment
- **Purpose:** Scores farmer eligibility (0–100) against Nigerian grant requirements
- **Output:** `overallEligibilityScore`, `eligibilityVerdict`, `nigerianComplianceFlags`, `strengths[]`, `riskFactors[]`, `missingItems[]`, `analystNarrative`

**Scoring Breakdown:**

| Category | Weight |
|----------|--------|
| Farm Profile Alignment | 25% |
| Financial Eligibility | 20% |
| Project Relevance | 25% |
| Documentation Readiness | 15% |
| Compliance & Planning | 15% |

**Hard Disqualifiers:** No BVN → compliance capped at 20 | Loan default → score capped at 0 | No CAC (when required) → capped at 25

### Agent 3 — Document Understanding
- **Purpose:** Extracts, validates, and cross-references uploaded Nigerian documents
- **Tools:** Analyze Files (single-page), DeepRAG (multi-page PDFs)
- **Supported Docs:** NIN Slip, PVC, Passport, Driver's Licence, C of O, R of O, Survey Plan, CAC Certificate, Bank Statement, NIRSAL/CBN Loan Docs, Cooperative Certificate, NAFDAC Permit
- **Output:** `documentResults[]`, `consolidatedFarmerProfile`, `crossDocumentInconsistencies[]`, `overallDocumentScore`, `documentVerdict`

### Agent 4 — Proposal Generation
- **Purpose:** Writes complete, print-ready application letters tailored to specific Nigerian grant bodies
- **Tools:** Analyze Files, Batch Transform
- **Output:** `applicationLetters[]`, `preparationChecklist`, `submissionInstructions`
- **Formats:** formal_government, state_ministry, microfinance, ngo_eoi, development_bank

### Agent 5 — Submission & Follow-up
- **Purpose:** Builds the full submission package — WHERE to submit, HOW, and follow-up schedule
- **Tools:** UiPath GenAI Web Search
- **Output:** `submissionInstructions`, `followUpSchedule`, `emailPayload` (always populated, ready for SendGrid)
- **Languages:** English, Pidgin English, Bilingual

---

## 🔄 Pipeline Flow (BPMN)

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

## ⚙️ AgriGrant API Workflow

**Type:** UiPath Studio Web — API Project

**Purpose:** Immediate response — validates input, generates draft letter, sends confirmation email, returns reference number.

### API Inputs (19 fields)

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

## 📧 Email Integration

| Parameter | Value |
|-----------|-------|
| Provider | SendGrid |
| Endpoint | POST https://api.sendgrid.com/v3/mail/send |
| From | info@agrigrant.xyz (AgriGrant AI) |
| Auth | Bearer token |
| Success Code | 202 |

**Two-stage delivery:**
1. **Immediate** — Confirmation + draft letter + reference number (from API workflow)
2. **Full Report** — AI-refined report with matched grants, eligibility score, final letter, submission instructions (from Pipeline)

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| AI Agents | UiPath Agentic Automation | 5 specialized AI agents |
| Orchestration | UiPath BPMN Process Orchestration | Pipeline sequencing |
| Backend API | UiPath Studio Web | Input validation, email, letter generation |
| Frontend (A) | UiPath Apps | Low-code farmer form |
| Frontend (B) | Next.js 14 + TypeScript + Tailwind CSS | Custom web application |
| Email | SendGrid API | Transactional email delivery |
| RPA (Phase 2) | UiPath Studio Desktop | Government portal automation |
| LLM | UiPath GenAI (GPT-4o / Claude) | Powers all 5 agents |
| Document AI | UiPath Analyze Files + DeepRAG | Document extraction & validation |
| Web Search | UiPath GenAI Web Search | Grant discovery from web |

---

## 🇳🇬 Nigerian Grant Programs Supported

| Program | Body | Target | Max Amount |
|---------|------|--------|-----------|
| Anchor Borrowers Programme (ABP) | CBN | Smallholders in cooperatives | Varies by commodity |
| AGSMEIS | NIRSAL | SMEs with CAC | ₦10,000,000 |
| AMSMES | NIRSAL | Larger agribusinesses | Varies |
| Micro-Agriculture Loan | BOA | Smallholders | ₦50,000–₦500,000 |
| Small/Medium Loan | BOA | CAC-registered farms | ₦500,000–₦5,000,000 |
| CACS | CBN | Large agribusiness (₦100M+ turnover) | Varies |
| APPEALS | FMARD/World Bank | Smallholders in 6 states | Varies |
| VCDP | IFAD | Cassava/rice value chains | Varies |
| State Programs | 36 State Ministries | Varies | Varies |
| International | GIZ, FAO, USAID, ActionAid | Various | Varies |

---

## 📜 Nigerian Compliance Framework

| Requirement | Document | Impact |
|-------------|----------|--------|
| BVN | 11-digit bank number | Required for ALL CBN/NIRSAL/BOA programs |
| NIN | 11-digit NIMC number | Required for all programs |
| CAC Registration | RC or BN number | Required for NIRSAL AGSMEIS, CBN CACS, FMARD |
| Cooperative Membership | Membership letter | Required for CBN ABP, IFAD VCDP |
| Land Document | C of O / R of O / Survey Plan | Required for BOA and land-linked grants |
| Clean CRMS Record | No loan default | Default = disqualification from CBN/NIRSAL/BOA |
| Bank Statement | 3–6 months, stamped | Required for NIRSAL, BOA medium loans |

---

## 📁 Project Structure

```
AgriGrant-AI/
├── Grant Discovery & Matching Agent/      # Agent 1 — UiPath Agentic
├── Eligibility & Risk Assessment Agent/   # Agent 2 — UiPath Agentic
├── Document Understanding Agent/          # Agent 3 — UiPath Agentic
├── Proposal Generation Agent/             # Agent 4 — UiPath Agentic
├── Submission & Follow-up Agent/          # Agent 5 — UiPath Agentic
├── Nigerian AgriGrant Pipeline/           # BPMN Process Orchestration
├── AgriGrant API/                         # API Workflow (backend)
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

## 🚀 How It Works — Demo Flow

1. Farmer opens the AgriGrant AI app (UiPath App or custom web app)
2. Fills a multi-step form: personal details → farm profile → compliance checklist → document upload
3. Clicks **"Submit My Application"**
4. **Instant response:** App shows reference number + confirmation email sent
5. **Background:** Nigerian AgriGrant Pipeline runs all 5 AI agents
6. **Email delivery:** Farmer receives full grant report including:
   - Top 3–5 matched grants with URLs and deadlines
   - Eligibility score (0–100) with detailed breakdown
   - Nigerian compliance flags (BVN ✅, CAC ✅, Cooperative ✅, etc.)
   - Ready-to-submit application letter (formatted for the specific grant body)
   - Exact submission instructions (portal URL or physical office address)
   - Document checklist (what to bring / upload)
   - Follow-up schedule (when to call, when to expect a response)

---

## 🧪 Test Data

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

## 🤖 RPA Robot — Phase 2

**Purpose:** Automates filling grant application forms on Nigerian government portals

**Target Portals:**
- NIRSAL Portal (nirsal.com)
- CBN Anchor Borrowers Platform
- Bank of Agriculture (BOA) portal
- State Ministry of Agriculture websites (36 states)
- FMARD online application system

**Capabilities:** Browser automation (Chrome/Edge), form filling from structured data, document upload, CAPTCHA flagging for human intervention (attended mode), screenshot capture for audit trail, confirmation number extraction

---

## 🌟 Key Differentiators

1. **Nigeria-specific** — Built entirely around Nigerian grant programs, compliance requirements, and document standards
2. **End-to-end AI** — 5 specialized agents handle the full pipeline: discovery → eligibility → documents → proposal → submission
3. **Instant value** — Draft letter in seconds, full report within minutes
4. **Accessible** — Mobile-first, supports Pidgin English, designed for low-literacy users
5. **Honest scoring** — Hard disqualifiers (no BVN, loan default) are enforced strictly — no false hope
6. **Actionable output** — Every result includes specific Nigerian context (e.g., *"Register at cac.gov.ng, costs ₦10,000–₦25,000, takes 5–10 business days"*)

---

## 🗺️ Roadmap

- [ ] Full RPA portal submission automation (NIRSAL, CBN, BOA)
- [ ] SMS notifications for farmers without email
- [ ] WhatsApp bot integration
- [ ] Offline mode for low-connectivity areas
- [ ] Batch processing for cooperative group applications
- [ ] Dashboard for grant success tracking and analytics
- [ ] Integration with Nigerian agricultural extension services

---

## 🎤 Demo Script (Hackathon Presentation)

### Opening (30 seconds)
> *"Every year, Nigerian smallholder farmers miss out on billions of naira in agricultural grants — not because they don't qualify, but because the system is too complex to navigate. AgriGrant AI changes that."*

### Live Demo (3 minutes)
1. Open the web app / UiPath App
2. Fill in the test farmer profile (use the JSON above)
3. Show the instant API response — reference number generated, confirmation email sent
4. Walk through the full AI pipeline: grant discovery → eligibility score → compliance flags → generated letter → submission instructions
5. Open the confirmation email to show the formatted draft letter

### Highlight Each Agent (1 minute each)
- **Agent 1:** *"It searches the web in real-time — here are 5 matched grants for this farmer's profile in Rivers State"*
- **Agent 2:** *"Score: 84/100 — Highly Eligible. BVN ✅, CAC ✅, Cooperative ✅ — zero hard disqualifiers"*
- **Agent 3:** *"The uploaded bank statement and CAC certificate are cross-validated — names match, no inconsistencies detected"*
- **Agent 4:** *"Here's the generated letter — formatted specifically for NIRSAL AGSMEIS, complete with the correct reference format and signatory block"*
- **Agent 5:** *"Full submission package: portal URL, office address as backup, follow-up call schedule, and the email is already sent"*

### Close (30 seconds)
> *"What used to take 3–4 weeks of confusion and multiple trips to government offices now takes under 10 minutes. AgriGrant AI — making Nigeria's agricultural grants accessible to every farmer."*

---

## 📊 Judges' Evaluation Criteria

### Innovation & Use of UiPath Agentic Automation
- 5 specialized agents built with UiPath Agentic Automation, each with distinct tools (Web Search, Analyze Files, DeepRAG, Batch Transform)
- BPMN Process Orchestration for agent pipeline sequencing with conditional branching (document upload decision gate)
- UiPath Studio Web API Project for synchronous backend response

### Real-World Impact
- Targets 34 million+ Nigerian smallholder farmers
- Addresses a documented ₦-billion problem of unclaimed agricultural grants
- Designed for low-literacy, low-connectivity, mobile-first users
- Supports Pidgin English for accessibility

### Technical Completeness
- End-to-end working system: frontend → API → pipeline → email delivery
- 19-field validated API with error handling and reference number generation
- Two-tier email delivery (immediate confirmation + full AI report)
- Compliance framework maps directly to real Nigerian grant requirements

### Scalability & Production Readiness
- Modular agent architecture — each agent can be updated independently
- Batch processing support (Agent 4 handles CSV uploads for cooperatives)
- Phase 2 RPA roadmap for full portal automation
- SendGrid integration for production email at scale

---

*Built with ❤️ for Nigerian farmers | UiPath Agentic Automation Hackathon 2026*
