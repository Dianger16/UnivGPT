"""
Agent Pipeline Service
RAG Pipeline using:
- Pinecone (Vector Search with Intent Extraction)
- HuggingFace (Local Embeddings)
- Supabase (Conversation Persistence)
- OpenRouter (LLM Generation & Intent Extraction)
"""

import uuid
import json
import httpx
import logging
from datetime import datetime
from typing import Optional, Dict, Any

from app.config import settings
from app.models.schemas import SourceCitation, AgentQueryResponse
from app.middleware.rbac import get_allowed_doc_types
from app.services.pinecone_client import pinecone_client
from app.services.document_processor import get_single_embedding
from app.services.supabase_client import get_supabase_admin
from app.services.audit import log_audit_event

logger = logging.getLogger(__name__)

async def call_llm(messages: list, response_format: Optional[str] = None) -> str:
    """Helper to call OpenRouter LLM."""
    if settings.mock_llm:
        return "This is a mock response from the agent."

    payload = {
        "model": settings.openrouter_model,
        "messages": messages,
    }
    if response_format == "json":
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.openrouter_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"LLM Call failed: {e}")
            return "I'm sorry, I'm having trouble connecting to my brain right now."

async def extract_query_intent(query: str) -> Dict[str, Any]:
    """
    Extract department, course, and doc_type filters from user query.
    Returns a dict like: {"department": "...", "course": "...", "doc_type": "..."}
    """
    system_prompt = """
    You are an intent extraction assistant for a University GPT system.
    Extract filtering metadata from the user's query.
    If a field is not mentioned, return null for it.
    
    Fields to extract:
    - department: e.g. "Computer Science", "Physics"
    - course: e.g. "CS101", "BIO202"
    - doc_type: one of ["student", "faculty", "admin", "public"]
    
    Return ONLY a JSON object.
    Example: {"department": "Computer Science", "course": "CS101", "doc_type": null}
    """
    
    try:
        content = await call_llm([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Query: {query}"}
        ], response_format="json")
        
        return json.loads(content)
    except:
        return {}

async def run_agent_pipeline(
    query: str,
    user_id: str,
    user_role: str,
    conversation_id: Optional[str] = None,
    context: Optional[dict] = None,
) -> AgentQueryResponse:
    
    # 1. Intent Extraction (Clarity)
    intent = await extract_query_intent(query)
    logger.info(f"Extracted intent: {intent}")

    # 2. Search Pinecone for context
    query_vector = get_single_embedding(query)
    allowed_types = get_allowed_doc_types(user_role)
    
    # Build filter
    base_filter = {"role": {"$in": allowed_types}}
    
    # Apply extracted intent filters
    if intent.get("department"):
        base_filter["department"] = intent["department"]
    if intent.get("course"):
        base_filter["course"] = intent["course"]
    if intent.get("doc_type") and intent["doc_type"] in allowed_types:
        base_filter["role"] = intent["doc_type"]

    search_res = pinecone_client.index.query(
        vector=query_vector,
        filter=base_filter,
        top_k=5,
        include_metadata=True
    )
    
    chunks = []
    context_text = ""
    for m in search_res.get("matches", []):
        meta = m.get("metadata", {})
        chunk_content = meta.get("content", "")
        # Extract general metadata explicitly
        extra_meta = {k: v for k, v in meta.items() if k not in ["content", "filename", "document_id", "role", "chunk_index"]}
        
        chunks.append({
            "content": chunk_content,
            "filename": meta.get("filename", "Unknown"),
            "document_id": meta.get("document_id"),
            "metadata": extra_meta
        })
        
        meta_str = ", ".join(f"{k}: {v}" for k, v in extra_meta.items())
        if meta_str:
            meta_str = f" [{meta_str}]"
            
        context_text += f"\n---\nSource: {meta.get('filename')}{meta_str}\n{chunk_content}\n"

    # 3. Generate Answer (using OpenRouter)
    system_message = f"""
    You are UniGPT, a helpful assistant for University members.
    User Role: {user_role}
    Extracted Intent Filters: {json.dumps(intent)}
    
    Use the following context to answer the user's query. 
    If you don't find the answer in the context, say you don't know based on available documents.
    Always cite the document name.
    
    CRITICAL FORMATTING INSTRUCTIONS:
    - If the user asks for data that is tabular in nature, MUST use a Markdown table.
    - Always use Markdown formatting, including headers where appropriate.
    - If there are specific deadlines or release dates in the context, clearly cite them.

    CONTEXT:
    {context_text}
    """
    
    answer = await call_llm([
        {"role": "system", "content": system_message},
        {"role": "user", "content": query}
    ])

    # 4. Persistence in Supabase (Store Conversations)
    conversation_id = conversation_id or str(uuid.uuid4())
    supabase = get_supabase_admin()
    
    # Get previous messages for history window (last 10)
    existing = supabase.table("conversations").select("messages").eq("id", conversation_id).execute()
    messages = existing.data[0]["messages"] if existing.data else []
    
    messages.append({"role": "user", "content": query})
    messages.append({"role": "assistant", "content": answer})
    
    # Limit message history to prevent huge rows
    if len(messages) > 20:
        messages = messages[-20:]
    
    supabase.table("conversations").upsert({
        "id": conversation_id,
        "user_id": user_id,
        "role": user_role,
        "title": query[:50],
        "messages": messages,
        "last_active": "now()"
    }).execute()

    await log_audit_event(user_id=user_id, action="agent_query", payload={"conv_id": conversation_id, "intent": intent})

    return AgentQueryResponse(
        answer=answer,
        sources=[SourceCitation(
            document_id=str(c.get("document_id", "")), 
            title=c["filename"], 
            snippet=c["content"][:150],
            metadata=c.get("metadata", {})
        ) for c in chunks],
        conversation_id=conversation_id,
        role_badge=f"{user_role.title()} Agent"
    )
