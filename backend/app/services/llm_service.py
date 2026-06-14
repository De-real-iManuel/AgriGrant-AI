"""
LLM Service — Calls OpenRouter API with function calling support.
This is the BRAIN of the application.
"""
import json
import httpx
from app.config import get_settings
from app.prompts.system_prompt import get_system_prompt

settings = get_settings()

# ─── Tool Definitions ────────────────────────────────────────────────────────
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_grants",
            "description": "Search available Nigerian agricultural grants based on farmer criteria. Use when the farmer asks about grants, funding, or loans.",
            "parameters": {
                "type": "object",
                "properties": {
                    "farm_type": {"type": "string", "description": "crop, livestock, mixed, or aquaculture"},
                    "state": {"type": "string", "description": "Nigerian state of the farmer"},
                    "funding_needed": {"type": "number", "description": "Amount needed in NGN"},
                    "query": {"type": "string", "description": "Free text search query about the grant"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_eligibility",
            "description": "Check if the current farmer is eligible for a specific grant program based on their profile.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grant_name": {"type": "string", "description": "Name of the grant program"},
                },
                "required": ["grant_name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "start_application_pipeline",
            "description": "Start the full grant application pipeline: generate proposal → fill portal form → submit. ONLY call this after the farmer explicitly confirms they want to submit.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grant_name": {"type": "string", "description": "Name of the grant to apply for"},
                    "proposed_project_description": {"type": "string", "description": "Description of the farmer's project"},
                    "requested_funding_ngn": {"type": "number", "description": "Amount requested in NGN"},
                },
                "required": ["grant_name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_application_status",
            "description": "Check the current status of a submitted grant application.",
            "parameters": {
                "type": "object",
                "properties": {
                    "application_id": {"type": "string", "description": "The application ID or 'latest' for most recent"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_proposal",
            "description": "Generate a professional grant proposal based on the farmer's profile and grant requirements.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grant_name": {"type": "string", "description": "Target grant program"},
                    "project_idea": {"type": "string", "description": "Farmer's project idea in their own words"},
                },
                "required": ["grant_name", "project_idea"],
            },
        },
    },
]


async def call_openrouter(messages: list[dict], use_tools: bool = True) -> dict:
    """Call OpenRouter API with messages and optional tool definitions."""
    payload = {
        "model": settings.llm_model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048,
    }
    if use_tools:
        payload["tools"] = TOOLS
        payload["tool_choice"] = "auto"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "HTTP-Referer": "https://agrigrant.ng",
                "X-Title": "AgricGrant AI Advisor",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        return response.json()


async def chat_completion(
    conversation_history: list[dict],
    farmer_profile: dict | None = None,
) -> dict:
    """
    Run a full chat completion cycle:
    1. Build messages (system + history)
    2. Call LLM
    3. If tool_calls → execute tools → call LLM again with results
    4. Return final assistant message

    Returns: {"content": str, "suggested_actions": list, "tool_results": dict|None}
    """
    # Build messages array
    system_prompt = get_system_prompt(farmer_profile)
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history[-20:])  # Last 20 messages for context

    # First LLM call
    result = await call_openrouter(messages)
    choice = result["choices"][0]
    message = choice["message"]

    # Check for tool calls
    if message.get("tool_calls"):
        # Execute each tool call
        tool_results = []
        for tool_call in message["tool_calls"]:
            func_name = tool_call["function"]["name"]
            func_args = json.loads(tool_call["function"]["arguments"]) if isinstance(tool_call["function"]["arguments"], str) else tool_call["function"]["arguments"]

            # Execute the tool
            tool_result = await execute_tool(func_name, func_args, farmer_profile)

            tool_results.append({
                "tool_call_id": tool_call["id"],
                "role": "tool",
                "name": func_name,
                "content": json.dumps(tool_result),
            })

        # Add assistant message with tool_calls + tool results
        messages.append(message)
        messages.extend(tool_results)

        # Second LLM call with tool results
        result = await call_openrouter(messages, use_tools=False)
        choice = result["choices"][0]
        message = choice["message"]

    # Parse response
    content = message.get("content", "I'm sorry, I couldn't process that. Could you try again?")

    # Extract suggested actions from the response (LLM can embed them)
    suggested_actions = extract_suggested_actions(content, farmer_profile)

    return {
        "content": content,
        "suggested_actions": suggested_actions,
    }


async def execute_tool(func_name: str, args: dict, farmer_profile: dict | None) -> dict:
    """Execute a tool call and return the result."""
    if func_name == "search_grants":
        return await tool_search_grants(args, farmer_profile)
    elif func_name == "check_eligibility":
        return await tool_check_eligibility(args, farmer_profile)
    elif func_name == "start_application_pipeline":
        return await tool_start_pipeline(args, farmer_profile)
    elif func_name == "check_application_status":
        return await tool_check_status(args)
    elif func_name == "generate_proposal":
        return await tool_generate_proposal(args, farmer_profile)
    else:
        return {"error": f"Unknown tool: {func_name}"}


# ─── Tool Implementations ────────────────────────────────────────────────────

async def tool_search_grants(args: dict, farmer_profile: dict | None) -> dict:
    """Search grants from the database matching criteria."""
    # TODO: Replace with actual DB query when grants table is seeded
    # For now, return from built-in knowledge
    grants = [
        {
            "name": "CBN Anchor Borrowers' Programme",
            "organization": "Central Bank of Nigeria",
            "max_funding": 5000000,
            "requires": ["BVN", "Cooperative Membership"],
            "target": "Smallholder farmers growing priority crops",
        },
        {
            "name": "NIRSAL Microfinance Bank Loan",
            "organization": "NIRSAL MFB",
            "max_funding": 10000000,
            "requires": ["BVN", "Business Plan"],
            "target": "Agribusiness operators",
        },
        {
            "name": "BOA MSME Loan",
            "organization": "Bank of Agriculture",
            "max_funding": 50000000,
            "requires": ["CAC Registration", "Collateral"],
            "target": "Small/medium agri-enterprises",
        },
        {
            "name": "AGSMEIS",
            "organization": "CBN/SMEDAN",
            "max_funding": 10000000,
            "requires": ["BVN", "SMEDAN Training Certificate"],
            "target": "MSMEs including agribusiness",
        },
        {
            "name": "National Agricultural Growth Scheme (NAGS)",
            "organization": "Federal Government",
            "max_funding": 3000000,
            "requires": ["Land Document", "Age 18-35"],
            "target": "Young farmers",
        },
    ]

    # Filter based on args
    farm_type = args.get("farm_type", "").lower()
    funding_needed = args.get("funding_needed", 0)

    matched = []
    for g in grants:
        if funding_needed and g["max_funding"] < funding_needed:
            continue
        matched.append(g)

    return {"grants": matched[:5], "total_found": len(matched)}


async def tool_check_eligibility(args: dict, farmer_profile: dict | None) -> dict:
    """Check eligibility based on farmer profile."""
    if not farmer_profile:
        return {"eligible": False, "reason": "No farmer profile loaded. Cannot assess eligibility without profile data."}

    grant_name = args.get("grant_name", "").lower()
    issues = []
    meets = []

    if "anchor borrowers" in grant_name or "abp" in grant_name:
        if farmer_profile.get("hasBVN"):
            meets.append("Has BVN ✅")
        else:
            issues.append("Missing BVN — required for ABP")
        if farmer_profile.get("isMemberOfCooperative"):
            meets.append("Cooperative member ✅")
        else:
            issues.append("Not in a cooperative — required for ABP")
        if farmer_profile.get("isSmallholderFarmer"):
            meets.append("Smallholder farmer ✅")
        if farmer_profile.get("hasExistingLoanDefault"):
            issues.append("Has existing loan default — disqualifying")

    elif "nirsal" in grant_name or "nmfb" in grant_name:
        if farmer_profile.get("hasBVN"):
            meets.append("Has BVN ✅")
        else:
            issues.append("Missing BVN")

    elif "boa" in grant_name or "bank of agriculture" in grant_name:
        if farmer_profile.get("hasCACRegistration"):
            meets.append("CAC registered ✅")
        else:
            issues.append("Missing CAC registration — required")

    elif "nags" in grant_name or "growth scheme" in grant_name:
        if farmer_profile.get("isYouthFarmer"):
            meets.append("Youth farmer (18-35) ✅")
        else:
            issues.append("Not a youth farmer (must be 18-35)")
        if farmer_profile.get("hasLandDocument"):
            meets.append("Has land document ✅")
        else:
            issues.append("Missing land document")

    eligible = len(issues) == 0
    return {
        "eligible": eligible,
        "grant_name": args.get("grant_name"),
        "requirements_met": meets,
        "issues": issues,
        "recommendation": "You qualify! Ready to apply." if eligible else f"You need to resolve: {', '.join(issues)}",
    }


async def tool_start_pipeline(args: dict, farmer_profile: dict | None) -> dict:
    """Start the UiPath pipeline. Returns application ID for tracking."""
    # This will be connected to UiPath Orchestrator in production
    # For now, return a placeholder
    import uuid
    application_id = str(uuid.uuid4())
    return {
        "status": "pipeline_started",
        "application_id": application_id,
        "grant_name": args.get("grant_name"),
        "message": f"Application pipeline started for {args.get('grant_name')}. I'll update you on each step.",
        "steps": [
            {"name": "Eligibility Verification", "status": "in_progress"},
            {"name": "Proposal Generation", "status": "pending"},
            {"name": "Document Preparation", "status": "pending"},
            {"name": "Portal Form Filling", "status": "pending"},
            {"name": "Submission & Confirmation", "status": "pending"},
        ],
    }


async def tool_check_status(args: dict) -> dict:
    """Check application status from database."""
    # TODO: Query applications table
    return {
        "application_id": args.get("application_id", "latest"),
        "status": "submitted",
        "portal_reference": "NAGAP-2026-4821",
        "submitted_at": "2026-06-13T10:30:00Z",
        "message": "Your application was submitted successfully. Awaiting review by the grant body.",
    }


async def tool_generate_proposal(args: dict, farmer_profile: dict | None) -> dict:
    """Generate a proposal using a second LLM call."""
    grant_name = args.get("grant_name", "the grant")
    project_idea = args.get("project_idea", "agricultural expansion")

    farmer_context = ""
    if farmer_profile:
        farmer_context = f"""
Farmer: {farmer_profile.get('farmerName', 'N/A')}
Farm Type: {farmer_profile.get('farmType', 'N/A')}
Location: {farmer_profile.get('stateOfResidence', 'N/A')}
Farm Size: {farmer_profile.get('farmSizeHectares', 'N/A')} hectares
Annual Revenue: ₦{farmer_profile.get('annualRevenueNGN', 0):,.0f}
"""

    proposal_prompt = f"""Write a professional, compelling 400-word grant proposal for a Nigerian farmer applying to {grant_name}.

Farmer Details:
{farmer_context}

Project Idea: {project_idea}

Structure the proposal with:
1. Executive Summary (2 sentences)
2. Problem Statement (what challenge the farmer faces)
3. Proposed Solution (what they'll do with the funds)
4. Expected Impact (jobs created, revenue increase, food security contribution)
5. Budget Summary (how funds will be allocated)
6. Sustainability Plan (how the project continues after grant period)

Write in professional but accessible English. Make it specific to Nigerian agriculture."""

    messages = [{"role": "user", "content": proposal_prompt}]
    result = await call_openrouter(messages, use_tools=False)
    proposal_text = result["choices"][0]["message"]["content"]

    return {
        "proposal": proposal_text,
        "grant_name": grant_name,
        "message": "Here's your generated proposal. Review it and let me know if you'd like any changes.",
    }


def extract_suggested_actions(content: str, farmer_profile: dict | None) -> list[dict]:
    """Extract contextual suggested actions based on the response content."""
    actions = []
    content_lower = content.lower()

    if "eligible" in content_lower and "apply" in content_lower:
        actions.append({"label": "Submit Application", "action": "SUBMIT_APPLICATION"})
    if "proposal" in content_lower:
        actions.append({"label": "Generate Proposal", "action": "GENERATE_PROPOSAL"})
    if "intake form" in content_lower or "profile" in content_lower and not farmer_profile:
        actions.append({"label": "Complete Profile", "action": "GO_TO_PORTAL"})
    if "status" in content_lower or "submitted" in content_lower:
        actions.append({"label": "Check Status", "action": "CHECK_STATUS"})

    # Always offer grant search if no other action
    if not actions:
        actions.append({"label": "Find Matching Grants", "action": "SEARCH_GRANTS"})

    return actions[:3]  # Max 3 actions
