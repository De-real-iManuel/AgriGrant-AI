import logging
from typing import Optional, Dict, Any, List
import httpx
from core.config import settings
from uipath.auth import get_uipath_token

logger = logging.getLogger(__name__)

async def invoke_agent(
    agent_key: str,
    user_message: str,
    farmer_profile: Optional[Dict[str, Any]],
    conversation_history: List[Dict[str, Any]],
    client: httpx.AsyncClient
) -> Optional[Dict[str, Any]]:
    """
    Invokes an external LLM via OpenRouter acting as our Grant Discovery / Eligibility Agent.
    """
    if not settings.OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY is missing. Cannot invoke LLM agent.")
        return None

    # Construct system prompt
    profile_text = str(farmer_profile) if farmer_profile else "No profile provided."
    system_prompt = (
        "You are AgriGrant AI, an expert agricultural grant advisor for African farmers. "
        "Your PRIMARY GOAL is to help farmers discover and secure FREE GRANTS (International, NGO, and Local Nigerian Grants). "
        "CRITICAL RULE: DO NOT recommend loans, credit facilities, or debt-based financing (e.g., avoid standard BOA loans unless they are explicitly zero-interest grants). "
        "Focus on grants from organizations like USAID, Bill & Melinda Gates Foundation, AGRA, World Bank, Federal Ministry of Agriculture, and other NGO/Government grant programs. "
        "You also help them write professional grant proposals to win these free funds. "
        f"The farmer's profile context is: {profile_text}. "
        "Please respond in a clear, concise, and professional manner, directly addressing their queries based on their profile."
    )

    messages = [{"role": "system", "content": system_prompt}]
    
    # Add history
    for msg in conversation_history:
        # OpenRouter/OpenAI API supports 'user' and 'assistant' roles
        role = "assistant" if msg.get("role") == "assistant" else "user"
        messages.append({"role": role, "content": msg.get("content", "")})
        
    messages.append({"role": "user", "content": user_message})

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "HTTP-Referer": "https://agrigrant.xyz", # Optional
        "X-Title": "AgriGrant AI", # Optional
        "Content-Type": "application/json"
    }
    body = {
        "model": settings.LLM_MODEL,
        "messages": messages,
        "max_tokens": 1000
    }

    try:
        logger.info(f"Invoking OpenRouter LLM ({settings.LLM_MODEL})...")
        response = await client.post(url, headers=headers, json=body, timeout=30.0)
        if response.status_code == 200:
            data = response.json()
            reply_text = data["choices"][0]["message"]["content"]
            logger.info("Successfully received response from OpenRouter LLM.")
            return {"response": reply_text, "toolCalls": []}
        else:
            logger.error(f"OpenRouter invocation failed. Status: {response.status_code}, Body: {response.text}")
            return None
    except Exception as e:
        logger.error(f"Exception during LLM invocation: {str(e)}")
        return None
