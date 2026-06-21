# AgriGrant AI — UiPath Automation

This folder mirrors the UiPath Studio solution for **AgriGrant AI**: five AI agents, one BPMN process orchestrator, one API workflow, one RPA robot, and a low-code approval app.

The canonical source of truth lives in UiPath Studio at:

```
C:\Users\<you>\Documents\UiPath\Solution1\
```

This `UiPath-automation/` folder is the version-controlled mirror — generated artifacts (`.entities`, `.project`, `.app`, build outputs, archives) are intentionally excluded via the repo `.gitignore`.

---

## Solution Layout

| Project | Type | What it does |
|---|---|---|
| **AgriGrant API** | API Workflow (Studio Web) | Validates farmer input, generates a draft application letter, sends a confirmation email, returns a reference number — synchronous, called by the FastAPI backend |
| **Grant Discovery & Matching Agent** | Agent | Searches the live web for Nigerian agricultural grants matching the farmer's profile |
| **Eligibility & Risk Assessment Agent** | Agent | Scores eligibility 0–100 against Nigerian compliance requirements (BVN, CAC, CRMS, cooperative, land docs) |
| **Document Understanding Agent** | Agent | Extracts and validates uploaded documents (NIN, CAC, bank statements, C of O) |
| **Proposal Generation Agent** | Agent | Writes print-ready application letters tailored to each grant body |
| **Submission & Follow-up Agent** | Agent | Builds submission instructions and a follow-up schedule; emits the email payload |
| **Nigerian AgriGrant Pipeline** | Process Orchestration (BPMN) | Sequences the five agents end-to-end with conditional branching, retries, timer events |
| **Grant Form Filler Robot** | Process (CrossPlatform RPA) | Automates submission of the completed application to government grant portals |
| **SimpleApprovalApp** | Web App | Low-code human approval gate before RPA submission |

---

## Agent Configuration

Each agent has an `agent.json` with the LLM model, system prompt, tools, and inputs/outputs. **Always use a real, current model name** — invalid model names cause the agent to silently return empty results.

| Agent | Model | Temperature |
|---|---|---|
| Grant Discovery & Matching | `gpt-5-2025-08-07` | 0.3 |
| Eligibility & Risk Assessment | `gpt-5-2025-08-07` | 0 |
| Document Understanding | `gpt-4o` | 0.1 |
| Proposal Generation | `claude-sonnet-4-6` | 0.4 |
| Submission & Follow-up | `claude-haiku` | 0.3 |

> ⚠️ Don't invent versions like `gpt-5.4` — they fail silently. Use the published model identifiers from your LLM provider.

---

## Grant Form Filler Robot (RPA)

CrossPlatform RPA project that fills government portal forms with structured farmer data.

### Inputs (Main.xaml arguments)

All `in_*` arguments mirror the field names the FastAPI backend sends. Highlights:

| Argument | Type | Notes |
|---|---|---|
| `in_farmerName`, `in_farmerEmail`, `in_farmerPhone` | String | Identity |
| `in_stateOfResidence`, `in_lga`, `in_farmLocation` | String | Location |
| `in_farmType`, `in_cropOrLivestockTypes` | String | Activity |
| `in_farmSizeHectares` | Double | Area |
| `in_yearsInOperation` | Int32 | Experience |
| `in_annualRevenueNGN`, `in_requestedFundingAmountNGN` | Double | Financials |
| `in_grantProgram` | String | Selected grant |
| `in_proposedProjectDescription`, `in_additionalNotes` | String | Free text |
| `in_hasBVN`, `in_hasCACRegistration`, `in_isMemberOfCooperative`, `in_hasLandDocument`, `in_isSmallholderFarmer`, `in_isYouthFarmer`, `in_isWomanFarmer`, `in_hasNoLoanDefault` | Boolean | Compliance flags |
| `in_ninDocumentPath`, `in_cacDocumentPath`, `in_bankStatementPath`, `in_landDocumentPath` | String | Document paths |
| `in_declarationAgreed` | Boolean | Consent |
| `in_targetPortalURL` | String | Portal to submit to |

### Outputs

| Argument | Type | Notes |
|---|---|---|
| `out_portalReference` | String | Confirmation number from the portal |
| `out_submissionStatus` | String | `Success` / `Failed` / `RequiresHuman` |
| `out_screenshotPath` | String | Audit trail screenshot |
| `out_errorMessage` | String | Populated on failure |

### Target portals

- NIRSAL Portal (`nirsal.com`)
- CBN Anchor Borrowers Programme platform
- Bank of Agriculture (BOA) portal
- 36 State Ministry of Agriculture sites
- FMARD online application system
- Demo portal for hackathon: `portal.agrigrant.xyz/apply`

---

## Connecting the Pipeline to the FastAPI Backend

The FastAPI backend (`/backend`) calls UiPath via two HTTP triggers:

| Trigger | URL pattern | Purpose |
|---|---|---|
| `submit-grant` | `…/t/<folder-key>/submit-grant` | Kicks off the **Nigerian AgriGrant Pipeline** (full 5-agent orchestration) |
| `agrigrant-api` | `…/t/<folder-key>/agrigrant-api` | Calls the synchronous **AgriGrant API** workflow for the immediate confirmation response |

The PAT used by the backend must have these scopes: `OR.Jobs`, `OR.Folders.Read`, `OR.Execution`, `OR.Assets.Read`, `OR.Queues`, `OR.Users.Read`.

---

## Publishing Changes from Studio

1. **Studio Desktop / Web** → open the project → click **Publish**
2. Pick **Orchestrator** as the destination
3. Bump the version (semantic: `1.2.3`)
4. Confirm the new version appears in **Orchestrator → Automations → Processes** (or **Agents** for agent projects)
5. The HTTP trigger always points at the latest published version — no extra wiring required

> Studio Web's Publish button is the supported flow. The CLI `uip rpa publish` command does **not** exist in CLI 1.195 and earlier.

---

## Versioning Policy

| Component | Versioning |
|---|---|
| Agents | SemVer; bump minor on prompt changes, major on contract changes |
| BPMN Pipeline | SemVer; bump major if step ordering changes |
| Grant Form Filler Robot | SemVer; bump minor when adding new portal flows |
| AgriGrant API workflow | SemVer; bump major on input/output schema change |

---

## Files Tracked vs Ignored

✅ **Tracked**:
- `agent.json` (per agent)
- `Workflow.json` (API workflow)
- `Main.xaml` (RPA robot)
- `*.bpmn` (orchestrator)
- `project.json` (project manifest)

❌ **Ignored**:
- `.entities/`, `.project/`, `.app/`, `.git/`
- `obj/`, `bin/`, `*.nupkg`
- Compiled artifacts and Studio caches

If a generated file genuinely needs to ship, add it explicitly and remove the matching `.gitignore` line.

---

## License

Built by **REM Labs** · UiPath Agentic Automation hackathon entry.
