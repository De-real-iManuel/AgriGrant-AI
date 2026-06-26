"""Deprecated — root main.py is the canonical entry point.
Kept for backward compatibility of internal app imports only.
Do NOT register routes here; all API routes live under /v1 in root main.py.
"""
from fastapi import FastAPI

app = FastAPI(
    title="AgricGrant AI Backend (deprecated entry)",
    description="Use root main.py for all API routes",
    version="1.0.0",
)
