"""
Documents Router — /api/documents/upload
Handles file uploads (NIN, CAC, bank statements, land documents).
"""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.config import get_settings

settings = get_settings()
router = APIRouter()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),  # nin, cac, bank_statement, land_document, other
    farmer_id: str = Form(...),
):
    """Upload a farmer document (NIN, CAC, bank statement, etc.)."""
    # Validate document type
    valid_types = ["nin", "cac", "bank_statement", "land_document", "other"]
    if document_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid document_type. Must be one of: {valid_types}")

    # Create upload directory
    upload_dir = os.path.join(settings.upload_dir, "documents", farmer_id)
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    file_ext = os.path.splitext(file.filename or "file")[1]
    saved_filename = f"{document_type}_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(upload_dir, saved_filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # TODO: Save to database (documents table)

    return {
        "documentId": str(uuid.uuid4()),
        "documentType": document_type,
        "filename": file.filename,
        "savedPath": file_path,
        "uploadedAt": datetime.utcnow().isoformat(),
    }
