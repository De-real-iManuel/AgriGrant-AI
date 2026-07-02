# GrantApplicationContext — Pipeline Contract v1.0.0

Single source of truth for every agent in the AgriGrant pipeline.

## Files
- `grant_application_context.schema.json` — JSON Schema. Reference from any agent's input/output schema.
- `validate.js` — drop-in Node module. Use from any JavaScript activity in `Workflow.json`.

## Layer rules (enforced by validator)
| Layer | Path | Writable by |
|---|---|---|
| Human Input | `humanInput.*` | Farmer UI form ONLY — immutable to agents |
| Agent Output | `agentOutput.*` | Agents only |
| Audit Trail | `agentTrace[]` | Agents (append-only, one entry per run) |

## Usage in a JavaScript activity (between agents)

```js
const { runValidationGate, filterGrants, appendTrace } = require('./contracts/validate.js');

// 1) Snapshot humanInput BEFORE the agent runs
const snapshot = JSON.parse(JSON.stringify(ctx.humanInput));

// 2) Run the agent — produces an updated ctx

// 3) Filter any new grants through the GRANT_ONLY gate
const { kept, dropped } = filterGrants(ctx.agentOutput.discoveredGrants);
ctx.agentOutput.discoveredGrants = kept;

// 4) Agent must append a trace entry
appendTrace(ctx, "EligibilityAgent", "scored", ["agentOutput.eligibilityResult"]);

// 5) Gate before handoff to the next agent
const gate = runValidationGate(ctx, snapshot, "EligibilityAgent");
if (!gate.pass) {
  ctx.agentOutput.nextAction = "HUMAN_REVIEW_REQUIRED";
  ctx.agentOutput.submissionStatus = "BLOCKED_VALIDATION";
  // surface gate.errors to the HITL form
}
```

## GRANT_ONLY filter
A grant enters `discoveredGrants[]` only if ALL of:
- `repaymentRequired === false`
- `loanBased === false`
- `fundingType ∈ {GRANT, SUBSIDY, AWARD, NON_REPAYABLE_FUND}`
- Name/description does not match the loan-keyword denylist (`loan`, `credit facility`, `repayment`, `BOA`, `CBN intervention`, `AGSMEIS`, `CACS`, etc.).

## Acceptance test
Farmer X submits with `humanInput.farmDetails.farmSize = 5`, `fundingType = "GRANT_ONLY"`.
After refactor: `agentOutput.discoveredGrants` contains zero loan products. If no grant matches: `eligibilityResult.recommendation = "NO_GRANT_MATCHES"`, `nextAction = "EXPAND_SEARCH"`. `humanInput.farmDetails.farmSize` still equals 5.
