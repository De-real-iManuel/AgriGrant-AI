import uuid
import logging
from datetime import datetime, timedelta, UTC
from typing import Dict, Any, List, Optional
import httpx
from core.config import settings
from api.models import ChatMessage, FarmerSubmission
from uipath.agents import invoke_agent
from services.language_service import (
    detect_pidgin,
    respond_in_pidgin,
    make_farmer_friendly,
    format_grant_for_farmer
)

from services.database_service import save_session_db, save_message_db, get_session_db, get_messages_db, delete_last_messages_db

logger = logging.getLogger(__name__)

class ChatSession:
    def __init__(self, session_id: str, farmer_name: str, farmer_profile: Optional[FarmerSubmission] = None):
        self.session_id = session_id
        self.farmer_name = farmer_name
        self.farmer_profile = farmer_profile
        self.messages: List[ChatMessage] = []
        self.created_at = datetime.now(UTC)
        self.last_active = datetime.now(UTC)

# In-memory session store
# structure: {session_id: ChatSession}
CHAT_SESSIONS: Dict[str, ChatSession] = {}

def get_session(session_id: str) -> Optional[ChatSession]:
    """
    Retrieves and updates the activity timestamp of an existing chat session.
    """
    session = CHAT_SESSIONS.get(session_id)
    if session:
        session.last_active = datetime.now(UTC)
        return session
    return None

async def get_or_create_session(farmer_name: str, farmer_profile: Optional[FarmerSubmission] = None, session_id: Optional[str] = None) -> ChatSession:
    """
    Restores a session from memory or DB if session_id is provided, else creates a new one.
    """
    import asyncio
    
    # 1. Try Memory
    if session_id and session_id in CHAT_SESSIONS:
        session = CHAT_SESSIONS[session_id]
        if farmer_profile:
            session.farmer_profile = farmer_profile
        session.last_active = datetime.now(UTC)
        return session
        
    # 2. Try DB
    if session_id:
        db_session = await get_session_db(session_id)
        if db_session:
            session = ChatSession(session_id=session_id, farmer_name=db_session.get("farmer_name", farmer_name), farmer_profile=farmer_profile)
            
            # Load messages
            db_msgs = await get_messages_db(session_id)
            for m in db_msgs:
                try:
                    ts = datetime.fromisoformat(m["timestamp"].replace("Z", "+00:00"))
                except:
                    ts = datetime.now(UTC)
                    
                msg = ChatMessage(
                    role=m["role"],
                    content=m["content"],
                    timestamp=ts,
                    suggestedActions=m.get("suggested_actions") or []
                )
                session.messages.append(msg)
                
            CHAT_SESSIONS[session_id] = session
            return session

    # 3. Create New
    new_session_id = str(uuid.uuid4())
    session = ChatSession(session_id=new_session_id, farmer_name=farmer_name, farmer_profile=farmer_profile)
    CHAT_SESSIONS[new_session_id] = session
    
    profile_data = farmer_profile.model_dump() if farmer_profile else None
    asyncio.create_task(save_session_db(new_session_id, farmer_name, profile_data))
    
    return session

def create_session(farmer_name: str, farmer_profile: Optional[FarmerSubmission] = None) -> ChatSession:
    # Deprecated sync version, kept for fallback if needed
    session_id = str(uuid.uuid4())
    session = ChatSession(session_id=session_id, farmer_name=farmer_name, farmer_profile=farmer_profile)
    CHAT_SESSIONS[session_id] = session
    import asyncio
    profile_data = farmer_profile.model_dump() if farmer_profile else None
    asyncio.create_task(save_session_db(session_id, farmer_name, profile_data))
    return session

def clean_expired_sessions():
    """
    Cleans up sessions that haven't been active for 24 hours.
    """
    now = datetime.now(UTC)
    to_delete = []
    for sid, sess in CHAT_SESSIONS.items():
        if now - sess.last_active > timedelta(hours=24):
            to_delete.append(sid)
    for sid in to_delete:
        del CHAT_SESSIONS[sid]

def generate_local_mock_response(message: str, farmer_name: str, profile: Optional[FarmerSubmission]) -> Dict[str, Any]:
    """
    Simulates a rich LLM reasoning engine in mock mode.
    Reads the farmer's profile, reasons on it, and produces highly context-aware
    natural language responses in English or Pidgin.
    """
    msg_lower = message.lower()
    is_pidgin = detect_pidgin(message)

    # 1. Start with Profile analysis
    if not profile:
        # No profile context loaded
        if "eligible" in msg_lower or "chance" in msg_lower or "qualify" in msg_lower or "score" in msg_lower:
            eng_res = (
                f"Hello {farmer_name}. I see that you have not completed your Farmer Intake Profile yet. "
                "Without your profile details, I cannot calculate a precise eligibility score or verify compliance blocks. "
                "Please go to the 'Farmer Portal' to complete the intake form. Once done, I will analyze your specific eligibility "
                "for all CBN, NIRSAL, and Bank of Agriculture programs."
            )
            suggested = [{"label": "Go to Farmer Portal", "action": "GO_TO_PORTAL"}]
        elif "grant" in msg_lower or "cbn" in msg_lower or "find" in msg_lower:
            eng_res = (
                f"I can help you discover active grants, but I need to know your farm's state, size, and type first! "
                "Please complete the Farmer Intake Form so I can run my discovery agent to match you with programs "
                "like the CBN Anchor Borrowers, NIRSAL AGSMEIS, or FMARD programs."
            )
            suggested = [{"label": "Go to Farmer Portal", "action": "GO_TO_PORTAL"}]
        else:
            eng_res = (
                f"Hello {farmer_name}! I am your AgriGrant AI Advisor. I reason over your farm profile to match you with grants "
                "and explain compliance rules. Since you haven't filled out the intake form yet, please complete it so we can "
                "begin analyzing your files and writing customized application letters!"
            )
            suggested = [{"label": "Complete Profile Form", "action": "GO_TO_PORTAL"}]
    else:
        # Profile is available! We can reason over it.
        name = profile.farmerName or farmer_name
        state = profile.stateOfResidence
        lga = profile.lga or "your local area"
        farm_address = profile.farmAddress or "your farm address"
        farm_type = profile.farmType.value if hasattr(profile.farmType, 'value') else str(profile.farmType)
        crops = ", ".join(profile.cropOrLivestockTypes) if profile.cropOrLivestockTypes else "agricultural produce"
        experience = int(profile.farmingExperienceYears or 1)
        revenue = profile.annualRevenueNGN or 0
        size = profile.farmSizeHectares or 0
        purpose = profile.fundingPurpose or "expanding operations"

        # Check default disqualifier first
        if not profile.hasNoLoanDefault:
            eng_res = (
                f"Hello {name}. I have analyzed your profile, and I see a critical compliance block: you have an active "
                "credit default recorded in the Credit Risk Management System (CRMS). \n\n"
                "Under Central Bank of Nigeria (CBN), NIRSAL, and Bank of Agriculture (BOA) guidelines, any active default "
                "results in immediate disqualification. I strongly recommend contacting your bank to resolve this outstanding "
                "CRMS record. Once cleared, you will qualify for scoring."
            )
            suggested = [{"label": "Credit Bureau Info", "action": "SUPPORT"}]
        
        # 1. Eligibility Score Check / Compliance reasoning
        elif "eligible" in msg_lower or "chance" in msg_lower or "qualify" in msg_lower or "score" in msg_lower or "default" in msg_lower:
            # Calculate a realistic score
            score = 70
            reasons = []
            
            if profile.hasBVN:
                reasons.append("✓ Your BVN is linked, which is required for all CBN/NIRSAL disbursed grants.")
            else:
                score -= 30
                reasons.append("✗ Critical: Your BVN is missing. No CBN program will disburse funds without a linked BVN.")
                
            if profile.hasCACRegistration:
                score += 15
                reasons.append("✓ You have CAC registration, unlocking premium commercial windows like NIRSAL AGSMEIS.")
            else:
                score -= 10
                reasons.append("⚠ You lack CAC registration, which restricts you to smallholder micro-grants (Anchor Borrowers).")
                
            if profile.isMemberOfCooperative:
                score += 10
                reasons.append("✓ Being in a cooperative society is a huge booster, especially for CBN Anchor Borrowers.")
            else:
                reasons.append("⚠ Joining a cooperative would increase your matching chances for input distribution programs.")

            if profile.hasLandDocument:
                score += 10
                reasons.append("✓ Holding land documents (C of O / Survey Plan) strengthens your position for BOA grants.")
            
            if profile.bankStatement:
                score += 5
                reasons.append("✓ You have uploaded a bank statement, which satisfies the cashflow compliance requirements for CBN/BOA.")
            else:
                reasons.append("⚠ Bank statement is missing: it's optional for now, but you will need to upload a 6-month statement when applying for major grants like CBN ABP or BOA MSME.")
            
            if experience >= 3:
                score += 5
                reasons.append(f"✓ Your {experience} years of experience demonstrates operational capacity to manage funding.")

            score = min(max(score, 10), 100)
            
            reasons_str = "\n".join(reasons)
            eng_res = (
                f"Based on my analysis of your profile, your **AgriGrant Readiness Score is {score}%**. "
                f"Here is how I reasoned over your specific context:\n\n"
                f"{reasons_str}\n\n"
                f"For your project in {state} targeting **\"{purpose}\"**, you have a strong fit. "
                "What specific requirement would you like to improve?"
            )
            suggested = [
                {"label": "Check matched list", "action": "VIEW_MATCHED_LIST"},
                {"label": "Help me write proposal", "action": "WRITE_PROPOSAL"}
            ]
            
        # 2. Grant Discovery / Matches
        elif "grant" in msg_lower or "money" in msg_lower or "find" in msg_lower or "cbn" in msg_lower or "nirsal" in msg_lower:
            # Let's recommend based on farm size and type
            if size > 0 and size < 5:
                # Smallholder recommendations
                eng_res = (
                    f"Since you operate a smallholder farm of {size} hectares in {state}, my recommendation is the **CBN Anchor Borrowers Programme (ABP)**. "
                    "This program distributes inputs (seeds, fertilizer, water pumps) directly to cooperative groups and guarantees off-takers. "
                    f"Given your focus on **{crops}**, you fit their key criteria. "
                    "\n\nIf you want commercial capital, you also qualify for the **Bank of Agriculture (BOA) Micro-Agriculture Grant** "
                    "(up to ₦1.5 Million), which has highly favorable terms for local farmers."
                )
                suggested = [
                    {"label": "Apply to CBN ABP", "action": "OPEN_GRANT", "data": {"grantName": "CBN Anchor Borrowers Programme"}},
                    {"label": "View BOA details", "action": "OPEN_GRANT", "data": {"grantName": "BOA Micro-Agriculture Grant"}}
                ]
            else:
                # Commercial or general recommendations
                if profile.hasCACRegistration:
                    eng_res = (
                        f"Since you have a registered agribusiness with CAC and an annual revenue of ₦{revenue:,.2f}, you are "
                        "a prime candidate for the **NIRSAL AGSMEIS** (up to ₦10 Million at 9% p.a.). This scheme supports agricultural SMEs "
                        f"with equipment procurement and operational capital, perfectly matching your goal to fund \"{purpose}\"."
                    )
                    suggested = [
                        {"label": "Apply NIRSAL AGSMEIS", "action": "OPEN_GRANT", "data": {"grantName": "NIRSAL AGSMEIS"}}
                    ]
                else:
                    eng_res = (
                        f"I see you operate a commercial farm but do not have CAC business registration. This is a critical gap. "
                        "To qualify for major capital like NIRSAL AGSMEIS or large BOA grants, you need to register a business name. "
                        "Right now, you qualify for cooperative-based CBN ABP inputs or BOA Micro-grants."
                    )
                    suggested = [
                        {"label": "View Micro-grants", "action": "VIEW_MATCHED_LIST"}
                    ]

        # 3. Help writing proposal
        elif "proposal" in msg_lower or "write" in msg_lower or "letter" in msg_lower:
            eng_res = (
                f"I can generate a professional proposal letter tailored for you. "
                f"Using your profile context ({name}, {farm_type} in {state}), I will draft an application letter addressed "
                f"to the grant administrators for your specified purpose: **\"{purpose}\"**."
            )
            suggested = [{"label": "Generate Draft Letter", "action": "WRITE_PROPOSAL"}]

        # 4. Hello / greeting
        elif any(w in msg_lower for w in ["hello", "hi", "hey", "how far", "yo"]):
            eng_res = (
                f"Hello {name}! 👋 I am your AgriGrant AI Advisor. I have loaded your profile context for your "
                f"{farm_type} in {state}. I am ready to advise you on grant options, explain eligibility details, "
                f"or draft a proposal letter for \"{purpose}\". What can I help you with?"
            )
            suggested = [
                {"label": "Am I eligible?", "action": "CHECK_ELIGIBILITY"},
                {"label": "Find matching grants", "action": "VIEW_MATCHED_LIST"}
            ]
        else:
            eng_res = (
                f"I'm keeping track of your profile as a {farm_type} farmer in {state}. "
                f"To secure funding for **\"{purpose}\"**, let's focus on meeting your compliance checkmarks "
                f"(like your {'CAC registration' if not profile.hasCACRegistration else 'BVN connection' if not profile.hasBVN else 'cooperative membership'}). "
                "Ask me about any of these guidelines, or ask to discover grants!"
            )
            suggested = [{"label": "Show checklist", "action": "CHECK_ELIGIBILITY"}]

    # Make translation checks
    friendly_response = make_farmer_friendly(eng_res)
    if is_pidgin:
        friendly_response = respond_in_pidgin(friendly_response)

    return {
        "response": friendly_response,
        "suggestedActions": suggested
    }

async def edit_last_message(session: ChatSession):
    """
    Removes the last user+assistant message pair from the session and DB.
    """
    if len(session.messages) < 2:
        return
        
    # We want to remove the last user message and anything after it (usually 1 assistant response)
    # Find the last 'user' message index
    last_user_idx = -1
    for i in range(len(session.messages)-1, -1, -1):
        if session.messages[i].role == 'user':
            last_user_idx = i
            break
            
    if last_user_idx == -1:
        return
        
    num_to_delete = len(session.messages) - last_user_idx
    session.messages = session.messages[:last_user_idx]
    
    # Delete from Supabase
    import asyncio
    asyncio.create_task(delete_last_messages_db(session.session_id, limit=num_to_delete))

async def route_and_process_chat(
    session: ChatSession,
    user_message: str,
    client: httpx.AsyncClient
) -> ChatMessage:
    """
    Routes user message to appropriate UiPath Agent key based on intent,
    performs Pidgin/English translations, and appends to session history.
    """
    is_pidgin = detect_pidgin(user_message)
    farmer_name = session.farmer_name
    profile_dict = session.farmer_profile.model_dump() if session.farmer_profile else None
    
    # Format session history for the API call
    history = []
    for msg in session.messages[-10:]: # Keep last 10 turns
        history.append({
            "role": msg.role,
            "content": msg.content
        })

    # Append user message to local history first
    user_chat_msg = ChatMessage(
        role="user",
        content=user_message,
        timestamp=datetime.now(UTC)
    )
    session.messages.append(user_chat_msg)
    session.last_active = datetime.now(UTC)

    # Database: Save user message
    import asyncio
    asyncio.create_task(save_message_db(session.session_id, "user", user_message))

    # Ensure OpenRouter credentials exist
    credentials_missing = not settings.OPENROUTER_API_KEY
    if credentials_missing:
        raise ValueError("OPENROUTER_API_KEY is not configured. Cannot process chat.")

    # Choose agent key based on keyword intent routing
    msg_lower = user_message.lower()
    is_eligibility_query = any(w in msg_lower for w in ["eligible", "chance", "qualify", "score", "default", "crms", "fit get"])
    
    agent_key = (
        settings.UIPATH_ELIGIBILITY_AGENT_KEY
        if is_eligibility_query
        else settings.UIPATH_GRANT_DISCOVERY_AGENT_KEY
    )

    # Invoke UiPath agent
    res = await invoke_agent(
        agent_key=agent_key,
        user_message=user_message,
        farmer_profile=profile_dict,
        conversation_history=history,
        client=client
    )

    if not res or "response" not in res:
        # No more fallback! Raise error explicitly.
        logger.error("Agent invocation returned invalid response.")
        raise RuntimeError("UiPath Agent invocation failed or returned invalid response.")

    raw_response = res["response"]
    tool_calls = res.get("toolCalls") or []

    # Clean the agent response & make it farmer friendly
    friendly_response = make_farmer_friendly(raw_response)
    if is_pidgin:
        friendly_response = respond_in_pidgin(friendly_response)

    # Map tool calls or metadata to suggested actions if present
    suggested_actions = []
    for tc in tool_calls:
        tc_name = tc.get("name")
        if tc_name == "recommend_grant":
            args = tc.get("arguments") or {}
            suggested_actions.append({
                "label": f"Apply to {args.get('grantName', 'Recommended Grant')}",
                "action": "OPEN_GRANT",
                "data": args
            })
    
    if not suggested_actions and is_eligibility_query:
        suggested_actions.append({"label": "Check detailed eligibility", "action": "CHECK_ELIGIBILITY"})

    assistant_msg = ChatMessage(
        role="assistant",
        content=friendly_response,
        timestamp=datetime.now(UTC),
        suggestedActions=suggested_actions
    )
    session.messages.append(assistant_msg)
    asyncio.create_task(save_message_db(session.session_id, "assistant", friendly_response, suggested_actions))
    return assistant_msg
