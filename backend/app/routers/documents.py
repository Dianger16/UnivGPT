"""
Documents Router
Hybrid: Supabase (Metadata) + Pinecone (Vectors).
"""

import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from typing import Optional

from app.models.schemas import (
    DocumentResponse, DocumentListResponse, UserRole, DocType
)
from app.middleware.auth import AuthenticatedUser, get_current_user
from app.middleware.rbac import require_roles, get_allowed_doc_types
from app.services.supabase_client import get_supabase_admin
from app.services.pinecone_client import pinecone_client
from app.services.document_processor import process_document
from app.services.audit import log_audit_event

router = APIRouter(tags=["Documents"])

@router.post("/admin/documents", response_model=DocumentResponse)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    department: str = Form(""),
    course: str = Form(""),
    tags: str = Form("[]"),
    metadata: str = Form("{}"),
    user: AuthenticatedUser = Depends(require_roles(UserRole.ADMIN, UserRole.FACULTY)),
):
    try:
        validated_doc_type = DocType(doc_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid doc_type")

    file_bytes = await file.read()
    document_id = str(uuid.uuid4())
    filename = file.filename or "unknown"

    import json
    try:
        parsed_tags = json.loads(tags) if tags else []
    except:
        parsed_tags = []
        
    try:
        parsed_metadata = json.loads(metadata) if metadata else {}
    except:
        parsed_metadata = {}

    # 1. Save metadata to Supabase Postgres
    supabase = get_supabase_admin()
    supabase.table("documents").insert({
        "id": document_id,
        "uploader_id": user.id,
        "filename": filename,
        "doc_type": doc_type,
        "department": department,
        "course": course,
        "tags": parsed_tags,
        "metadata": parsed_metadata,
    }).execute()

    # 2. Process and index to Pinecone (HuggingFace local embeddings)
    await process_document(
        file_bytes=file_bytes, filename=filename, document_id=document_id,
        doc_type=doc_type, department=department, course=course, tags=parsed_tags,
        metadata=parsed_metadata
    )

    await log_audit_event(user_id=user.id, action="document_upload", payload={"doc_id": document_id})

    return DocumentResponse(
        id=document_id, filename=filename, doc_type=validated_doc_type,
        department=department, course=course, tags=parsed_tags, visibility=True
    )

@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    page: int = 1, per_page: int = 20, doc_type: str = None, 
    user: AuthenticatedUser = Depends(get_current_user)
):
    allowed_types = get_allowed_doc_types(user.role)
    supabase = get_supabase_admin()
    
    query = supabase.table("documents").select("*", count="exact").in_("doc_type", allowed_types)
    if doc_type:
        query = query.eq("doc_type", doc_type)
        
    offset = (page - 1) * per_page
    res = query.range(offset, offset + per_page - 1).execute()

    docs = [
        DocumentResponse(
            id=d["id"], filename=d["filename"], doc_type=d["doc_type"],
            department=d.get("department"), course=d.get("course"), tags=d.get("tags", []),
            uploaded_at=str(d.get("uploaded_at", ""))
        ) for d in res.data
    ]

    return DocumentListResponse(documents=docs, total=res.count or len(docs), page=page, per_page=per_page)
