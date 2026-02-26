"""
Authentication Router
Simplified for Supabase Auth integration.
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from app.models.schemas import (
    LoginRequest, AuthResponse, UserProfile, UserRole, InitiateSignupRequest
)
from app.middleware.auth import AuthenticatedUser, get_current_user
from app.services.supabase_client import get_supabase_client, get_supabase_admin
from app.services.audit import log_audit_event

router = APIRouter(tags=["Authentication"])

@router.post("/auth/signup", response_model=AuthResponse)
async def signup(request: Request, body: InitiateSignupRequest):
    """Register via Supabase."""
    try:
        supabase = get_supabase_client()
        auth_res = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password
        })

        if not auth_res.user:
            raise HTTPException(status_code=400, detail="Signup failed")

        user_id = auth_res.user.id
        
        # Create profile
        admin = get_supabase_admin()
        admin.table("profiles").insert({
            "id": user_id,
            "email": body.email,
            "full_name": body.full_name,
            "role": body.role.value if hasattr(body.role, 'value') else body.role,
            "department": body.department
        }).execute()

        await log_audit_event(user_id=user_id, action="signup")

        return AuthResponse(
            access_token=auth_res.session.access_token if auth_res.session else "",
            user=UserProfile(
                id=user_id, email=body.email, full_name=body.full_name,
                role=UserRole(body.role), department=body.department
            )
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/auth/login", response_model=AuthResponse)
async def login(request: Request, body: LoginRequest):
    """Login with email/password via Supabase."""
    try:
        supabase = get_supabase_client()
        auth_res = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })

        if not auth_res.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_id = auth_res.user.id
        
        # Fetch profile from Supabase
        admin = get_supabase_admin()
        profile = admin.table("profiles").select("*").eq("id", user_id).execute()
        
        if not profile.data:
            # Fallback: Auto-create profile from auth metadata if missing
            user_data = auth_res.user.user_metadata or {}
            p = {
                "id": user_id,
                "email": auth_res.user.email,
                "full_name": user_data.get("full_name", "User"),
                "role": user_data.get("role", "student"),
                "department": user_data.get("department", "General")
            }
            try:
                admin.table("profiles").insert(p).execute()
            except Exception as e:
                print(f"Failed to auto-create profile: {e}")
                raise HTTPException(status_code=404, detail="Profile missing and auto-creation failed.")
        else:
            p = profile.data[0]
        
        await log_audit_event(user_id=user_id, action="login", ip_address=request.client.host if request.client else None)

        return AuthResponse(
            access_token=auth_res.session.access_token,
            user=UserProfile(
                id=p["id"], email=p["email"], full_name=p["full_name"],
                role=UserRole(p["role"]), department=p.get("department"),
                created_at=str(p.get("created_at")) if p.get("created_at") else None
            )
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/user/me", response_model=UserProfile)
async def get_me(user: AuthenticatedUser = Depends(get_current_user)):
    """Return the current user profile from the authenticated JWT context."""
    return UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=UserRole(user.role),
    )
