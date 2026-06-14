import re
from typing import Dict, Any, List
from api.models import PipelineOutput, MatchedGrant

def translate_pipeline_output(raw_output: Dict[str, Any], tone: str = "formal") -> PipelineOutput:
    """
    Translates raw agent JSON output to human-friendly description format.
    Standardizes default values and types for matchedGrants, profileGaps, etc.
    """
    matched_grants_raw = raw_output.get("matchedGrants", [])
    matched_grants: List[MatchedGrant] = []
    
    for g in matched_grants_raw:
        if isinstance(g, dict):
            matched_grants.append(
                MatchedGrant(
                    grantName=g.get("grantName") or g.get("name") or "Unknown Grant",
                    grantingOrganization=g.get("grantingOrganization") or g.get("organization") or g.get("issuer") or "Unknown Sponsor",
                    matchScore=int(g.get("matchScore") or g.get("score") or 0),
                    fundingAmountRange=g.get("fundingAmountRange") or g.get("amount") or "Contact sponsor",
                    applicationDeadline=g.get("applicationDeadline") or g.get("deadline") or "Rolling",
                    matchReason=g.get("matchReason") or g.get("reason") or "Matches your general profile.",
                    grantCategory=g.get("grantCategory") or g.get("category") or "General Agriculture",
                    applicationUrl=g.get("applicationUrl") or g.get("url") or "https://www.cbn.gov.ng"
                )
            )

    profile_gaps = raw_output.get("profileGaps") or []
    if not isinstance(profile_gaps, list):
        profile_gaps = [str(profile_gaps)]

    top_rec = raw_output.get("topRecommendation") or ""
    if not top_rec and matched_grants:
        top_rec = f"Apply to the {matched_grants[0].grantName} as it matches your farm best."

    summary = raw_output.get("summary") or ""
    if not summary and matched_grants:
        summary = f"Found {len(matched_grants)} grants that match your profile. Check them below."

    disclaimer = raw_output.get("disclaimer") or "Grant availability and details are subject to change."
    total_matches = raw_output.get("totalMatchesFound") or len(matched_grants)
    farmer_name = raw_output.get("farmerName") or "Farmer"
    state = raw_output.get("stateOfResidence") or ""
    eligibility_score = raw_output.get("eligibilityScore")
    if eligibility_score is not None:
        eligibility_score = int(eligibility_score)

    app_letter = raw_output.get("applicationLetterText") or raw_output.get("proposalLetter")
    sub_instr = raw_output.get("submissionInstructions") or raw_output.get("instructions")
    follow_up = raw_output.get("followUpSchedule") or raw_output.get("schedule")
    is_pro = bool(raw_output.get("isPro", False))
    hidden_count = int(raw_output.get("hiddenGrantsCount", 0))

    # Perform farm jargon cleaning on summary, recommendation, and instructions
    summary = make_farmer_friendly(summary)
    top_rec = make_farmer_friendly(top_rec)
    if app_letter:
        app_letter = make_farmer_friendly(app_letter)
    if sub_instr:
        sub_instr = make_farmer_friendly(sub_instr)

    return PipelineOutput(
        matchedGrants=matched_grants,
        profileGaps=[make_farmer_friendly(gap) for gap in profile_gaps],
        topRecommendation=top_rec,
        summary=summary,
        disclaimer=disclaimer,
        totalMatchesFound=total_matches,
        farmerName=farmer_name,
        stateOfResidence=state,
        eligibilityScore=eligibility_score,
        applicationLetterText=app_letter,
        submissionInstructions=sub_instr,
        followUpSchedule=follow_up,
        isPro=is_pro,
        hiddenGrantsCount=hidden_count
    )

def make_farmer_friendly(text: str) -> str:
    """
    Replaces technical jargon with simplified, warm descriptions.
    """
    if not text:
        return text

    # Remove jargon mapping
    replacements = {
        r"\beligibility score\b": "your chances of getting the grant",
        r"\bCRMS\b": "loan record database",
        r"\bCAC registration\b": "your business registration",
        r"\bCAC\b": "business registry",
        r"\bcollateral requirements\b": "things you need to promise the bank",
        r"\bdisbursement window\b": "grant payment period",
        r"\bdisbursement\b": "payout",
    }

    for pattern, replacement in replacements.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # Replace specific percentage statements/numbers with friendly phrases
    # Let's search for matches like "95%" or "85%"
    def percentage_replacer(match):
        val = int(match.group(1))
        if val >= 90:
            return f"{val}% (Very good chance of getting this grant)"
        elif val >= 70:
            return f"{val}% (Good chance — you meet most requirements)"
        elif val >= 50:
            return f"{val}% (Moderate chance — some things need attention)"
        else:
            return f"{val}% (Low chance right now — here's what to fix)"

    text = re.sub(r"(\d+)%", percentage_replacer, text)
    return text

def format_grant_for_farmer(grant: dict) -> str:
    """
    Returns a natural language summary of a single grant.
    """
    name = grant.get("grantName") or "This Grant"
    org = grant.get("grantingOrganization") or "the sponsor"
    amount = grant.get("fundingAmountRange") or "flexible funding"
    deadline = grant.get("applicationDeadline") or "rolling deadlines"
    score = grant.get("matchScore") or 50
    url = grant.get("applicationUrl") or "https://www.cbn.gov.ng"

    friendly_score = ""
    if score >= 90:
        friendly_score = f"{score}% (Very good chance of getting it)"
    elif score >= 70:
        friendly_score = f"{score}% (Good chance — you meet most requirements)"
    elif score >= 50:
        friendly_score = f"{score}% (Moderate chance)"
    else:
        friendly_score = f"{score}% (Low chance right now)"

    return (
        f"The {name} by {org} can give you between {amount}. "
        f"You have a {friendly_score}. The deadline is {deadline}. "
        f"Click the link to start: {url}"
    )

def detect_pidgin(text: str) -> bool:
    """
    Detects if the farmer is typing/speaking in Pidgin.
    """
    if not text:
        return False
    pidgin_keywords = ["abeg", "na", "wetin", "abi", "how far", "dey", "pikin", "waka", "chook", "sabi", "yamir", "don", "wuna"]
    text_lower = text.lower()
    return any(word in text_lower for word in pidgin_keywords)

def respond_in_pidgin(english_response: str) -> str:
    """
    Translates a standard response into simplified warm Pidgin English.
    """
    if not english_response:
        return english_response

    replacements = [
        ("You are eligible", "You fit collect dis grant"),
        ("you are eligible", "you fit collect dis grant"),
        ("Your application", "Your application"),
        ("your application", "your application"),
        ("required documents", "papers wey dem go ask you"),
        ("Please note that", "Make you know say"),
        ("please note that", "make you know say"),
        ("We recommend", "E go better if you"),
        ("we recommend", "e go better if you"),
        ("Grant amount", "How much dem fit give you"),
        ("grant amount", "how much dem fit give you"),
        ("Application deadline", "Last day to apply"),
        ("application deadline", "last day to apply"),
        ("You have a very good chance", "Your body sweet, you fit get am well well"),
        ("You have a good chance", "You dey line to get am"),
        ("You have a moderate chance", "You fit get am but work dey"),
        ("You have a low chance", "E fit hard small, but we fit arrange am"),
    ]

    pidgin_text = english_response
    for eng, pidg in replacements:
        pidgin_text = pidgin_text.replace(eng, pidg)

    return pidgin_text
