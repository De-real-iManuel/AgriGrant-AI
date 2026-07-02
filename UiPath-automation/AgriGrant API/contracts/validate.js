/**
 * GrantApplicationContext validator — v1.0.0
 * 
 * Drop-in JavaScript module for AgriGrant API workflows.
 * Use inside any JavaScript activity in a Workflow.json:
 *
 *   const { validateContext, enforceLayerSeparation, appendTrace, filterGrants }
 *     = require('./contracts/validate.js');
 *
 * All functions are PURE except appendTrace which mutates the context's agentTrace.
 */

const SCHEMA_VERSION = "1.0.0";

const ALLOWED_FUNDING_TYPES = ["GRANT", "SUBSIDY", "AWARD", "NON_REPAYABLE_FUND"];

const LOAN_KEYWORDS = [
  "loan", "credit facility", "financing scheme", "repayment",
  "boa ", "cbn intervention", "anchor borrowers", "commercial agriculture lending",
  "agsmeis", "cacs"
];

/* ───────────────────────── validation ───────────────────────── */

function validateContext(ctx) {
  const errors = [];

  if (!ctx || typeof ctx !== "object") {
    return { ok: false, errors: ["Context is not an object"] };
  }
  if (ctx.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion mismatch: expected ${SCHEMA_VERSION}, got ${ctx.schemaVersion}`);
  }
  if (!ctx.applicationId) errors.push("applicationId missing");

  // humanInput required tree
  const hi = ctx.humanInput || {};
  const mustHave = [
    ["humanInput.farmerProfile.fullName", hi.farmerProfile?.fullName],
    ["humanInput.farmerProfile.email",    hi.farmerProfile?.email],
    ["humanInput.farmerProfile.state",    hi.farmerProfile?.state],
    ["humanInput.farmDetails.farmType",   hi.farmDetails?.farmType],
    ["humanInput.farmDetails.farmSize",   hi.farmDetails?.farmSize],
    ["humanInput.grantPreferences.fundingType",    hi.grantPreferences?.fundingType],
    ["humanInput.grantPreferences.requestedAmount", hi.grantPreferences?.requestedAmount]
  ];
  for (const [path, val] of mustHave) {
    if (val === undefined || val === null || val === "") {
      errors.push(`Required field empty: ${path}`);
    }
  }

  // Hard rule: fundingType must be GRANT_ONLY
  if (hi.grantPreferences && hi.grantPreferences.fundingType !== "GRANT_ONLY") {
    errors.push(`humanInput.grantPreferences.fundingType must be 'GRANT_ONLY'`);
  }

  // agentOutput.discoveredGrants — every grant must pass the allowlist
  const grants = ctx.agentOutput?.discoveredGrants || [];
  grants.forEach((g, i) => {
    if (g.repaymentRequired === true) errors.push(`discoveredGrants[${i}] has repaymentRequired=true`);
    if (g.loanBased === true)         errors.push(`discoveredGrants[${i}] has loanBased=true`);
    if (!ALLOWED_FUNDING_TYPES.includes(g.fundingType)) {
      errors.push(`discoveredGrants[${i}].fundingType '${g.fundingType}' not in allowlist`);
    }
  });

  return { ok: errors.length === 0, errors };
}

/* ──────────────── layer separation enforcement ──────────────── */
/**
 * Compare current humanInput to a snapshot taken before the agent ran.
 * Returns list of mutated paths (empty = clean).
 */
function enforceLayerSeparation(snapshotHumanInput, currentHumanInput) {
  const mutated = [];
  function walk(a, b, path) {
    if (a === b) return;
    if (typeof a !== typeof b) { mutated.push(path); return; }
    if (a && typeof a === "object") {
      const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
      keys.forEach(k => walk(a?.[k], b?.[k], path ? `${path}.${k}` : k));
    } else if (a !== b) {
      mutated.push(path);
    }
  }
  walk(snapshotHumanInput, currentHumanInput, "humanInput");
  return mutated;
}

/* ──────────────── grant filter (GRANT_ONLY) ──────────────── */

function filterGrants(candidates) {
  const kept = [];
  const dropped = [];

  for (const g of candidates || []) {
    const reason = whyReject(g);
    if (reason) dropped.push({ grant: g.grantName || "(unnamed)", reason });
    else kept.push(g);
  }
  return { kept, dropped };
}

function whyReject(g) {
  if (!g) return "null grant";
  if (g.repaymentRequired === true) return "repaymentRequired=true";
  if (g.loanBased === true)         return "loanBased=true";
  if (!ALLOWED_FUNDING_TYPES.includes(g.fundingType)) {
    return `fundingType '${g.fundingType}' not in allowlist`;
  }
  // secondary heuristic — keyword denylist
  const hay = `${g.grantName || ""} ${g.description || ""} ${g.fundingBody || ""}`.toLowerCase();
  for (const kw of LOAN_KEYWORDS) {
    if (hay.includes(kw)) return `keyword denylist hit: '${kw.trim()}'`;
  }
  return null;
}

/* ──────────────── trace append ──────────────── */

function appendTrace(ctx, agent, action, fieldsWritten) {
  if (!ctx.agentTrace) ctx.agentTrace = [];
  ctx.agentTrace.push({
    agent,
    action,
    fieldsWritten: fieldsWritten || [],
    timestamp: new Date().toISOString(),
    schemaVersionSeen: ctx.schemaVersion || "unknown"
  });
  return ctx;
}

/* ──────────────── gate helper ────────────────
 * One-call entry point for a BPMN JavaScript activity between agents.
 *   const gate = runValidationGate(ctx, snapshotHumanInput, "EligibilityAgent");
 *   if (!gate.pass) { ctx.agentOutput.nextAction = "HUMAN_REVIEW_REQUIRED"; ... }
 */
function runValidationGate(ctx, snapshotHumanInput, agentName) {
  const v = validateContext(ctx);
  const mutated = enforceLayerSeparation(snapshotHumanInput, ctx.humanInput);
  const traceOk = (ctx.agentTrace || []).some(
    t => t.agent === agentName && t.schemaVersionSeen === SCHEMA_VERSION
  );

  const errors = [...v.errors];
  if (mutated.length) errors.push(`Immutable humanInput fields mutated: ${mutated.join(", ")}`);
  if (!traceOk)       errors.push(`Agent '${agentName}' did not append a v${SCHEMA_VERSION} trace entry`);

  return { pass: errors.length === 0, errors };
}

module.exports = {
  SCHEMA_VERSION,
  ALLOWED_FUNDING_TYPES,
  validateContext,
  enforceLayerSeparation,
  filterGrants,
  appendTrace,
  runValidationGate
};
