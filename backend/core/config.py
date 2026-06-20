import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # UiPath Auth
    UIPATH_CLIENT_ID: str = ""
    UIPATH_CLIENT_SECRET: str = ""
    UIPATH_PAT: str = ""  # Personal Access Token — primary auth
    UIPATH_ORGANIZATION: str = ""
    UIPATH_TENANT: str = ""
    UIPATH_BASE_URL: str = "https://cloud.uipath.com"

    # UiPath Orchestrator
    UIPATH_FOLDER_ID: str = "3081039"
    UIPATH_FOLDER_KEY: str = ""
    UIPATH_PIPELINE_PROCESS_KEY: str = ""
    UIPATH_FORM_FILLER_ROBOT_KEY: str = ""
    UIPATH_API_WORKFLOW_PROCESS_KEY: str = ""

    # API trigger URLs (preferred path — kicks off the Maestro Pipeline directly)
    UIPATH_PIPELINE_TRIGGER_URL: str = ""
    UIPATH_API_TRIGGER_URL: str = ""

    # UiPath Agents
    UIPATH_GRANT_DISCOVERY_AGENT_KEY: str = ""
    UIPATH_ELIGIBILITY_AGENT_KEY: str = ""
    UIPATH_DOCUMENT_UNDERSTANDING_AGENT_KEY: str = ""
    UIPATH_PROPOSAL_AGENT_KEY: str = ""
    UIPATH_SUBMISSION_AGENT_KEY: str = ""

    # Email
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "info@agrigrant.xyz"
    SENDGRID_FROM_NAME: str = "AgriGrant AI"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # App
    CHAT_SESSION_SECRET: str
    PORT: int = 8000

    # LLM
    OPENROUTER_API_KEY: str = ""
    LLM_MODEL: str = "google/gemini-2.5-flash"


    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
