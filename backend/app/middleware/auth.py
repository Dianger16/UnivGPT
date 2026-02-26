"""
Authentication Middleware
Validates Supabase JWTs and extracts user information.
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional

from app.config import settings
from app.services.supabase_client import get_supabase_admin

security = HTTPBearer()

class AuthenticatedUser:
    def __init__(self, id: str, email: str, role: str, full_name: str = ""):
        self.id = id
        self.email = email
        self.role = role
        self.full_name = full_name

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AuthenticatedUser:
    token = credentials.credentials

    try:
        # Decode Supabase JWT
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        email = payload.get("email", "")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user ID")

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    # Fetch role and profile from Supabase profiles table
    try:
        supabase = get_supabase_admin()
        result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        
        if not result.data:
            # First-time users might not have a profile yet; let's allow extraction if it's there
            return AuthenticatedUser(id=user_id, email=email, role="student")

        p = result.data
        return AuthenticatedUser(
            id=p["id"],
            email=p["email"],
            role=p["role"],
            full_name=p.get("full_name", ""),
        )
    except Exception:
        # Fallback to defaults
        return AuthenticatedUser(id=user_id, email=email, role="student")

async def get_optional_user(request: Request) -> Optional[AuthenticatedUser]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    try:
        token = auth_header.split(" ")[1]
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        return await get_current_user(creds)
    except HTTPException:
        return None
