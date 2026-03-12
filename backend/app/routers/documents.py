"""
Documents Router
Hybrid: Supabase (Metadata) + Pinecone (Vectors).
"""

import uuid
import json
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request

from app.models.schemas import (
    DocumentResponse, DocumentListResponse, UserRole, DocType
)
from app.middleware.auth import AuthenticatedUser, get_current_user
from app.middleware.rbac import require_roles, get_allowed_doc_types
from app.services.supabase_client import get_supabase_admin
from app.services.document_processor import (
    SUPPORTED_EXTENSIONS,
    derive_document_tags,
    is_supported_document,
    process_document,
)
from app.services.audit import log_audit_event

router = APIRouter(tags=["Documents"])

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024


def get_allowed_upload_doc_types(role: str) -> list[str]:
    if role == UserRole.ADMIN.value:
        return [doc.value for doc in DocType]
    if role == UserRole.FACULTY.value:
        return [DocType.STUDENT.value, DocType.FACULTY.value, DocType.PUBLIC.value]
    return []


def parse_json_field(raw: str, default):
    try:
        return json.loads(raw) if raw else default
    except json.JSONDecodeError:
        return default

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

    allowed_upload_types = get_allowed_upload_doc_types(user.role)
    if validated_doc_type.value not in allowed_upload_types:
        raise HTTPException(
            status_code=403,
            detail=f"{user.role.title()} users cannot upload {validated_doc_type.value} documents.",
        )

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    if not is_supported_document(file.filename):
        supported = ", ".join(sorted(ext.lstrip(".") for ext in SUPPORTED_EXTENSIONS))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed formats: {supported}.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds the 25 MB upload limit")

    document_id = str(uuid.uuid4())
    filename = file.filename or "unknown"

    parsed_tags = parse_json_field(tags, [])
    if not isinstance(parsed_tags, list):
        parsed_tags = []

    parsed_metadata = parse_json_field(metadata, {})
    if not isinstance(parsed_metadata, dict):
        parsed_metadata = {}

    derived_tags = derive_document_tags(
        filename=filename,
        doc_type=validated_doc_type.value,
        department=department,
        course=course,
        tags=[str(tag) for tag in parsed_tags],
        metadata=parsed_metadata,
    )

    # 1. Save metadata to Supabase Postgres
    supabase = get_supabase_admin()
    base_payload = {
        "id": document_id,
        "uploader_id": user.id,
        "filename": filename,
        "doc_type": validated_doc_type.value,
        "department": department,
        "course": course,
        "tags": derived_tags,
        "visibility": True,
    }
    extended_payload = {
        **base_payload,
        "metadata": parsed_metadata,
        "file_size": len(file_bytes),
        "mime_type": file.content_type or "",
    }

    try:
        supabase.table("documents").insert(extended_payload).execute()
    except Exception as exc:
        # Support both the legacy schema and the richer migration schema.
        missing_column_markers = ["metadata", "file_size", "mime_type"]
        if any(marker in str(exc).lower() for marker in missing_column_markers):
            supabase.table("documents").insert(base_payload).execute()
        else:
            raise

    # 2. Process and index to Pinecone (HuggingFace local embeddings)
    processing_result = await process_document(
        file_bytes=file_bytes, filename=filename, document_id=document_id,
        doc_type=validated_doc_type.value, department=department, course=course, tags=derived_tags,
        metadata=parsed_metadata
    )

    await log_audit_event(
        user_id=user.id,
        action="document_upload",
        payload={
            "doc_id": document_id,
            "doc_type": validated_doc_type.value,
            "tags": derived_tags,
            "chunk_count": processing_result.get("chunk_count", 0),
        },
    )

    return DocumentResponse(
        id=document_id, filename=filename, doc_type=validated_doc_type,
        department=department, course=course, tags=derived_tags, visibility=True
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
