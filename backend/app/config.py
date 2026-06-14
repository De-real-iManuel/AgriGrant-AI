from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://user:pass@localhost:5432/agrigrant"

    # OpenRouter LLM
    openrouter_api_key: str = ""
    llm_model: str = "google/gemini-2.0-flash"

    # UiPath Orchestrator
    uipath_client_id: str = ""
    uipath_client_secret: str = ""
    uipath_org: str = ""
    uipath_tenant: str = ""
    uipath_folder_id: str = "3051296"
    uipath_process_key: str = "Grant_Form_Filler_Robot"

    # Email (SMTP)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "AgricGrant AI <noreply@agrigrant.ng>"

    # App
    secret_key: str = "change-me-in-production"
    upload_dir: str = "./uploads"
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
