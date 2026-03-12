"""
Agent Router
Hybrid: Supabase (Chat History) + Pinecone (Search).
"""

from fastapi import APIRouter, HTTPException, Depends

from app.models.schemas import (
    AgentQueryRequest, AgentQueryResponse,
    ConversationResponse, ConversationListResponse, UserRole
)
from app.config import settings
from app.middleware.auth import AuthenticatedUser, get_current_user, is_academic_email
from app.services.agent_pipeline import run_agent_pipeline
from app.services.supabase_client import get_supabase_admin

router = APIRouter(tags=["Agent"])

@router.post("/agent/query", response_model=AgentQueryResponse)
async def agent_query(
    body: AgentQueryRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    try:
        if (
            settings.require_verified_academic_email_for_queries
            and not user.id.startswith("dummy-id-")
            and not is_academic_email(user.email)
        ):
            raise HTTPException(
                status_code=403,
                detail="Query access is locked until you sign in with your academic email or Microsoft college account.",
            )

        return await run_agent_pipeline(
            query=body.query,
            user_id=user.id,
            user_role=user.role,
            conversation_id=body.conversation_id,
            context=body.context,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent/history", response_model=ConversationListResponse)
async def get_history(user: AuthenticatedUser = Depends(get_current_user)):
    supabase = get_supabase_admin()
    res = supabase.table("conversations").select("*").eq("user_id", user.id).order("last_active", desc=True).execute()
    
    convs = [
        ConversationResponse(
            id=c["id"], title=c["title"], role=UserRole(c["role"]),
            messages=c.get("messages", []), last_active=str(c.get("last_active"))
        ) for c in res.data
    ]
    return ConversationListResponse(conversations=convs, total=len(convs))
