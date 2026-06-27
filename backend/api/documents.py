"""
Documents API Router
Handles file uploads from UiPath or the frontend.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("other"), 
    farmer_id: str = Form("unknown"),
):
    """
    Upload a document (NIN, CAC, bank statement, etc.).
    UiPath calls this endpoint.
    """
    upload_dir = os.path.join("./uploads", "documents", farmer_id)
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename or "file")[1]
    saved_filename = f"{document_type}_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(upload_dir, saved_filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "success": True,
        "documentId": str(uuid.uuid4()),
        "documentType": document_type,
        "filename": file.filename,
        "savedPath": file_path,
        "uploadedAt": datetime.utcnow().isoformat(),
        "url": f"https://api.agrigrant.xyz/uploads/documents/{farmer_id}/{saved_filename}"
    }
