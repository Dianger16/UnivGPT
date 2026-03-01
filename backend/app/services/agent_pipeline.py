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
                timeout=8.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"LLM Call failed: {e}")
            return "I'm sorry, I'm having trouble connecting to my brain right now."


async def extract_query_intent(query: str, history_context: str = "") -> Dict[str, Any]:
    """
    Extract dynamic filtering metadata from the user's query.
    Returns any potential metadata filters as a JSON object.
    """
    system_prompt = f"""
    You are an intent extraction and safety moderation assistant for a University GPT system.
    Recent conversation history for context:
    {history_context}

    Task 1 (Moderation): Analyze the user's latest query for explicit hate speech, severe harassment, direct threats, or extreme toxicity directed at the university or its staff. Do NOT flag questions, apologies, mild frustration, general complaints, or references to the moderation/flagging system itself. If an explicit and severe violation is detected, set `"is_flagged": true`. Otherwise, set it to `false`.
    Task 2 (Context Extraction): Extract ANY relevant and specific filtering metadata from the user's query (e.g., 'department', 'course', 'tag', 'urgency', 'year', 'topic').

    Return ONLY a valid JSON object. 
    Example 1: {{"department": "Computer Science", "course": "CS101", "is_flagged": false}}
    Example 2: {{"is_flagged": true, "reason": "Severe hate speech"}}
    """

    try:
        content = await call_llm(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Query: {query}"},
            ],
            response_format="json",
        )

        return json.loads(content)
    except Exception as e:
        logger.warning(f"Intent extraction/moderation failed: {e}")
        return {}


async def run_agent_pipeline(
    query: str,
    user_id: str,
    user_role: str,
    conversation_id: Optional[str] = None,
    context: Optional[dict] = None,
) -> AgentQueryResponse:

    conversation_id = conversation_id or str(uuid.uuid4())
    supabase = get_supabase_admin()

    # Get previous messages for history window early for moderation
    existing = (
        supabase.table("conversations")
        .select("messages")
        .eq("id", conversation_id)
        .execute()
    )
    messages = existing.data[0]["messages"] if existing.data else []

    # Format history for intent extractor
    history_text = "\n".join([f"{m['role']}: {m['content']}" for m in messages[-4:]])

    # 1. Intent Extraction & Moderation (Clarity)
    intent = await extract_query_intent(query, history_context=history_text)
    logger.info(f"Extracted dynamic intent: {intent}")

    # Moderation Intercept
    if intent.get("is_flagged") is True:
        logger.warning(f"Flagged query from {user_id}: {query}")

        supabase = get_supabase_admin()
        profile_res = (
            supabase.table("profiles")
            .select("email, full_name")
            .eq("id", user_id)
            .execute()
        )
        user_email = profile_res.data[0]["email"] if profile_res.data else "Unknown"
        user_name = profile_res.data[0]["full_name"] if profile_res.data else "Unknown"

        # Send Email Alert to Admin asynchronously
        from app.services.email_service import EmailService
        import asyncio

        asyncio.create_task(
            asyncio.to_thread(
                EmailService.send_flagged_alert_email,
                user_id,
                user_role,
                query,
                user_name,
                user_email,
            )
        )

        answer = "SAFETY ALERT: Your message has been flagged by our automated moderation system for violating the UnivGPT professional conduct policies. Any further attempts to use inappropriate language, harass, or disrespect faculty/staff will result in account suspension. A detailed report of this incident has been forwarded to the University Administration."

        # Save to history and return
        conversation_id = conversation_id or str(uuid.uuid4())
        # The supabase client is already initialized above, no need to re-initialize here.
        existing = (
            supabase.table("conversations")
            .select("messages")
            .eq("id", conversation_id)
            .execute()
        )
        messages = existing.data[0]["messages"] if existing.data else []
        messages.extend(
            [
                {"role": "user", "content": query},
                {"role": "assistant", "content": answer},
            ]
        )

        supabase.table("conversations").upsert(
            {
                "id": conversation_id,
                "user_id": user_id,
                "role": user_role,
                "title": "Flagged Interaction",
                "messages": messages[-20:],
                "last_active": "now()",
            }
        ).execute()

        await log_audit_event(
            user_id=user_id, action="flagged_query", payload={"query": query}
        )

        return AgentQueryResponse(
            answer=answer,
            sources=[],
            conversation_id=conversation_id,
            role_badge="🛡️ UniGPT Safety",
        )

    # 2. Search Pinecone for context
    query_vector = get_single_embedding(query)
    allowed_types = get_allowed_doc_types(user_role)

    # Build filter dynamically
    base_filter = {"role": {"$in": allowed_types}}

    # Apply all dynamically extracted intent filters, ensuring we don't accidentally override RBAC completely
    for key, value in intent.items():
        if value is None:
            continue
        # If the LLM guessed a generic doc_type or role, we MUST ensure the user has permission to see it
        if key in ["doc_type", "role"]:
            if value in allowed_types:
                base_filter["role"] = value
        else:
            base_filter[key] = value

    chunks = []
    context_text = ""

    if pinecone_client.index:
        try:
            search_res = pinecone_client.index.query(
                vector=query_vector, filter=base_filter, top_k=5, include_metadata=True
            )

            for m in search_res.get("matches", []):
                meta = m.get("metadata", {})
                chunk_content = meta.get("content", "")
                # Extract general metadata explicitly
                extra_meta = {
                    k: v
                    for k, v in meta.items()
                    if k
                    not in ["content", "filename", "document_id", "role", "chunk_index"]
                }

                chunks.append(
                    {
                        "content": chunk_content,
                        "filename": meta.get("filename", "Unknown"),
                        "document_id": meta.get("document_id"),
                        "metadata": extra_meta,
                    }
                )

                meta_str = ", ".join(f"{k}: {v}" for k, v in extra_meta.items())
                if meta_str:
                    meta_str = f" [{meta_str}]"

                context_text += f"\n---\nSource: {meta.get('filename')}{meta_str}\n{chunk_content}\n"
        except Exception as e:
            logger.error(f"Pinecone query failed: {e}")
            context_text = (
                "\n[System Note: Vector database unavailable pending configuration]\n"
            )
    else:
        logger.warning("Pinecone index not initialized. Skipping vector search.")

    if not chunks:
        context_text += "\n[System Note: No specific university documents matched the query or the database is currently empty. Provide general helpful assistance if a general question was asked. If a question specifically asks for internal university data (policies, curriculum, deadlines), clarify that you don't have access to documents yet.]\n"

    # 3. Generate Answer (using OpenRouter)
    import datetime

    now = datetime.datetime.now()
    current_time_str = f"Current Date: {now.strftime('%A, %B %d, %Y')}. Current Time: {now.strftime('%I:%M %p')}"

    system_message = f"""
    You are UniGPT, the official, professional AI assistant for the University.
    You are interacting with a user whose role is: {user_role}. Focus on providing accurate, helpful, and polite assistance.

    SYSTEM CONTEXT:
    - {current_time_str}

    CRITICAL GUARDRAILS & STRICT RULES:
    1. Professionalism: NEVER speak negatively, disrespectfully, or spread rumors about any faculty member, staff, student, or the university itself. Maintain a strictly professional, supportive, and objective tone at all times.
    2. Strict Relevance: You are ONLY for the University. If the user asks for general coding, external technical problems, or tasks completely unrelated to academics/campus, you MUST politely decline and steer them back to university queries. Do NOT perform general coding tasks or answer complex unrelated technical questions.
    3. Accuracy (No Hallucinations): If the user asks about internal university policies, deadlines, specific events, or curriculum, you MUST rely ONLY on the provided context. If the answer is not in the context, explicitly state: "I'm sorry, but I don't have access to the specific documents containing that information right now." Do NOT guess or make up university data.
    4. Conversational Context & Memory: You possess the history of this conversation. You MAY engage in polite conversation (greetings, referencing previous messages) as long as it stays grounded in your role as a University Assistant. Keep it strictly professional and helpful.

    Extracted Intent Filters: {json.dumps(intent)}

    CONTEXT FROM DATABASE:
    {context_text}
    
    CRITICAL FORMATTING INSTRUCTIONS:
    - Engage naturally! If the user asks a conversational question (e.g., "how are you?"), just respond politely and naturally (e.g., "I'm doing well, thank you!"). Do NOT mechanically quote their text back to them.
    - You MUST use suitable emojis throughout your response to make the conversation friendly, engaging, and modern.
    - Heavily utilize varied clean Markdown formatting (e.g., bullet points, bold text, italics) to organize information beautifully.
    - If the user asks for tabular data, MUST use a Markdown table.
    - If you extract actual information from the database context, explicitly cite the exact Source document name.
    """

    llm_messages = [{"role": "system", "content": system_message}]
    for m in messages[-8:]:
        llm_messages.append({"role": m["role"], "content": m["content"]})

    llm_messages.append({"role": "user", "content": query})

    answer = await call_llm(llm_messages)

    # If the LLM failed (e.g. 401 Unauthorized because of bad API keys)
    if answer == "I'm sorry, I'm having trouble connecting to my brain right now.":
        answer = "I'm currently unable to connect to my AI provider (Invalid API Key or out of credits). Please update the `OPENROUTER_API_KEY` in the `.env` file to restore my functionality."

    # 4. Persistence in Supabase (Store Conversations)
    messages.append({"role": "user", "content": query})
    messages.append({"role": "assistant", "content": answer})

    # Limit message history to prevent huge rows
    if len(messages) > 20:
        messages = messages[-20:]

    supabase.table("conversations").upsert(
        {
            "id": conversation_id,
            "user_id": user_id,
            "role": user_role,
            "title": query[:50],
            "messages": messages,
            "last_active": "now()",
        }
    ).execute()

    await log_audit_event(
        user_id=user_id,
        action="agent_query",
        payload={"conv_id": conversation_id, "intent": intent},
    )

    return AgentQueryResponse(
        answer=answer,
        sources=[
            SourceCitation(
                document_id=str(c.get("document_id", "")),
                title=c["filename"],
                snippet=c["content"][:150],
                metadata=c.get("metadata", {}),
            )
            for c in chunks
        ],
        conversation_id=conversation_id,
        role_badge=f"{user_role.title()} Agent",
    )
