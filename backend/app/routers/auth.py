"""
Authentication Router
Simplified for Supabase Auth integration.
"""

from fastapi import APIRouter, HTTPException, Depends, Request
import random
from app.models.schemas import (
    LoginRequest,
    AuthResponse,
    UserProfile,
    UserRole,
    InitiateSignupRequest,
    VerifySignupRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SignupResponse,
)
from app.middleware.auth import AuthenticatedUser, get_current_user
from app.services.supabase_client import get_supabase_client, get_supabase_admin
from app.services.audit import log_audit_event
from app.services.email_service import EmailService

router = APIRouter(tags=["Authentication"])


@router.post("/auth/signup", response_model=SignupResponse)
async def signup(request: Request, body: InitiateSignupRequest):
    """
    Initiate signup with custom 6-digit OTP and bypass Supabase default email.
    """
    try:
        admin = get_supabase_admin()

        # 1. Generate 6-digit OTP
        otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])

        # 2. Check if user already exists in Auth
        users_resp = admin.auth.admin.list_users()
        existing_auth_user = next(
            (u for u in users_resp if u.email == body.email), None
        )

        if existing_auth_user:
            user_metadata = existing_auth_user.user_metadata or {}
            # If already verified, they really exist - block it
            if user_metadata.get("is_verified", False):
                raise HTTPException(
                    status_code=400,
                    detail="An account with this email already exists inside UniGPT. Please try logging in.",
                )

            # If NOT verified, update their record with new OTP and metadata
            user_id = existing_auth_user.id
            admin.auth.admin.update_user_by_id(
                user_id,
                {
                    "password": body.password,
                    "user_metadata": {
                        "full_name": body.full_name,
                        "role": body.role.value
                        if hasattr(body.role, "value")
                        else body.role,
                        "department": body.department,
                        "otp_code": otp_code,
                        "is_verified": False,
                    },
                },
            )
        else:
            # Create new unverified user (Confirmed=True skips default email)
            auth_res = admin.auth.admin.create_user(
                {
                    "email": body.email,
                    "password": body.password,
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": body.full_name,
                        "role": body.role.value
                        if hasattr(body.role, "value")
                        else body.role,
                        "department": body.department,
                        "otp_code": otp_code,
                        "is_verified": False,
                    },
                }
            )
            user_id = auth_res.user.id

        # 3. Log audit event (Use user_id=None to avoid Profile FK error)
        await log_audit_event(
            user_id=None,
            action="signup_initiated",
            payload={"target_user_id": user_id, "email": body.email},
        )

        # 4. Send professional OTP email with REAL code
        EmailService.send_otp_email(
            receiver_email=body.email, otp=otp_code, user_name=body.full_name
        )

        return SignupResponse(
            message="Verification email dispatched with your secure code.",
            email=body.email,
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auth/login", response_model=AuthResponse)
async def login(request: Request, body: LoginRequest):
    """Login with email/password via Supabase with Dummy Fallback."""
    # 1. Check for Dummy Credentials FIRST (Instant Dev Access)
    dummy_accounts = {
        "admin@unigpt.edu": {
            "pass": "admin-password-123",
            "role": "admin",
            "name": "Admin User",
            "dept": "Administration",
        },
        "faculty@unigpt.edu": {
            "pass": "faculty-password-123",
            "role": "faculty",
            "name": "Dr. Priya Sharma",
            "dept": "Computer Science",
        },
        "student@unigpt.edu": {
            "pass": "student-password-123",
            "role": "student",
            "name": "Akash Kumar",
            "dept": "Computer Science",
        },
    }

    if (
        body.email in dummy_accounts
        and body.password == dummy_accounts[body.email]["pass"]
    ):
        acc = dummy_accounts[body.email]
        return AuthResponse(
            access_token="dev-dummy-token-" + acc["role"],
            user=UserProfile(
                id="dummy-id-" + acc["role"],
                email=body.email,
                full_name=acc["name"],
                role=UserRole(acc["role"]),
                department=acc["dept"],
            ),
        )

    # 2. Attempt Real Supabase Auth
    try:
        supabase = get_supabase_client()
        auth_res = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )

        if not auth_res.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_id = auth_res.user.id

        # Fetch profile from Supabase
        admin = get_supabase_admin()
        profile = admin.table("profiles").select("*").eq("id", user_id).execute()

        if not profile.data:
            user_data = auth_res.user.user_metadata or {}
            p = {
                "id": user_id,
                "email": auth_res.user.email,
                "full_name": user_data.get("full_name", "User"),
                "role": user_data.get("role", "student"),
                "department": user_data.get("department", "General"),
            }
            try:
                admin.table("profiles").insert(p).execute()
            except Exception:
                pass  # Profile might exist but select failed
        else:
            p = profile.data[0]

        await log_audit_event(
            user_id=user_id,
            action="login",
            ip_address=request.client.host if request.client else None,
        )

        if not auth_res.session:
            raise HTTPException(
                status_code=401, detail="Authentication failed: No session"
            )

        return AuthResponse(
            access_token=auth_res.session.access_token,
            user=UserProfile(
                id=p["id"],
                email=p["email"],
                full_name=p["full_name"],
                role=UserRole(p["role"]),
                department=p.get("department"),
                created_at=str(p.get("created_at")) if p.get("created_at") else None,
            ),
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/auth/verify", response_model=AuthResponse)
async def verify_signup(request: Request, body: VerifySignupRequest):
    """Verify signup OTP with custom logic and Development Bypass."""
    try:
        admin = get_supabase_admin()

        # 1. Find user to check OTP
        users_res = admin.auth.admin.list_users()
        target_user = next((u for u in users_res if u.email == body.email), None)

        if not target_user:
            raise HTTPException(
                status_code=400, detail="User not found. Please sign up first."
            )

        user_metadata = target_user.user_metadata or {}
        stored_otp = user_metadata.get("otp_code")

        # 2. OTP Check (with Dev Bypass)
        is_verified = False
        if body.otp == "123456":
            is_verified = True
        elif stored_otp and body.otp == stored_otp:
            is_verified = True

        if not is_verified:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        user_id = target_user.id

        # 3. Update user metadata to verified
        admin.auth.admin.update_user_by_id(
            user_id, {"user_metadata": {**user_metadata, "is_verified": True}}
        )

        # 4. Check/Create profile (ensure it's there)
        profile_res = admin.table("profiles").select("*").eq("id", user_id).execute()
        if not profile_res.data:
            admin.table("profiles").insert(
                {
                    "id": user_id,
                    "email": body.email,
                    "full_name": user_metadata.get("full_name", "User"),
                    "role": user_metadata.get("role", "student"),
                    "department": user_metadata.get("department"),
                }
            ).execute()
            p = {
                "id": user_id,
                "email": body.email,
                "full_name": user_metadata.get("full_name", "User"),
                "role": user_metadata.get("role", "student"),
                "department": user_metadata.get("department"),
            }
        else:
            p = profile_res.data[0]

        await log_audit_event(user_id=user_id, action="verify_signup")
        return AuthResponse(
            access_token=f"dev-dummy-token-{p.get('role', 'student')}",
            user=UserProfile(
                id=p["id"],
                email=p.get("email", body.email),
                full_name=p.get("full_name", "User"),
                role=UserRole(p.get("role", "student")),
                department=p.get("department"),
            ),
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auth/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    """Send OTP for password recovery."""
    try:
        supabase = get_supabase_client()
        supabase.auth.reset_password_for_email(body.email)
        return {"status": "success", "message": "Recovery OTP sent if email exists"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auth/reset-password")
async def reset_password(body: ResetPasswordRequest):
    """Verify OTP and update password."""
    try:
        supabase = get_supabase_client()
        # Verify the OTP
        auth_res = supabase.auth.verify_otp(
            {"email": body.email, "token": body.otp, "type": "recovery"}
        )

        if not auth_res.user:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        # Update user's password using the new session
        supabase.auth.update_user({"password": body.new_password})

        await log_audit_event(user_id=auth_res.user.id, action="reset_password")
        return {"status": "success", "message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/auth/google")
async def google_auth():
    """Returns the authorization URL for Google OAuth."""
    try:
        supabase = get_supabase_client()
        res = supabase.auth.sign_in_with_oauth(
            {
                "provider": "google",
                "options": {"redirect_to": "http://localhost:5173/auth/callback"},
            }
        )
        return {"url": res.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user/me", response_model=UserProfile)
async def get_me(user: AuthenticatedUser = Depends(get_current_user)):
    """Return the current user profile from the authenticated JWT context."""
    return UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=UserRole(user.role),
    )
