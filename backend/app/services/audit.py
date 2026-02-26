"""
Audit Logging Service
Records all significant user actions for compliance and monitoring in Supabase.
"""

from typing import Optional
import logging
from app.services.supabase_client import get_supabase_admin

logger = logging.getLogger(__name__)

async def log_audit_event(
    user_id: Optional[str],
    action: str,
    payload: dict = None,
    ip_address: Optional[str] = None,
) -> None:
    try:
        supabase = get_supabase_admin()
        supabase.table("audit_logs").insert({
            "user_id": user_id,
            "action": action,
            "payload": payload or {},
            "ip_address": ip_address,
        }).execute()
    except Exception as e:
        logger.error(f"[AUDIT] Error logging event to Supabase: {e}")
