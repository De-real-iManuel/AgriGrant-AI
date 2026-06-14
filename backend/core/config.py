import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # UiPath OAuth2
    UIPATH_CLIENT_ID: str = ""
    UIPATH_CLIENT_SECRET: str = ""
    UIPATH_ORGANIZATION: str = ""
    UIPATH_TENANT: str = ""

    # UiPath Orchestrator
    UIPATH_FOLDER_ID: str = "3051296"
    UIPATH_PIPELINE_PROCESS_KEY: str = ""
    UIPATH_API_WORKFLOW_PROCESS_KEY: str = ""

    # UiPath Agents
    UIPATH_GRANT_DISCOVERY_AGENT_KEY: str = ""
    UIPATH_ELIGIBILITY_AGENT_KEY: str = ""

    # Email
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "info@agrigrant.xyz"
    SENDGRID_FROM_NAME: str = "AgriGrant AI"

    # Supabase Integration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # App Settings
    CHAT_SESSION_SECRET: str  # Required — set in .env, never use a default here
    PORT: int = 8000

    # LLM Integration (OpenRouter)
    OPENROUTER_API_KEY: str = ""
    LLM_MODEL: str = "google/gemini-2.5-flash"

    # Pydantic Settings Configuration
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
