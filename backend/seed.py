from app.services.supabase_client import get_supabase_admin
import sys


def seed():
    admin = get_supabase_admin()

    dummy_users = {
        "admin@unigpt.edu": {
            "password": "admin-password-123",
            "full_name": "Admin User",
            "role": "admin",
            "department": "Administration",
        },
        "faculty@unigpt.edu": {
            "password": "faculty-password-123",
            "full_name": "Faculty User",
            "role": "faculty",
            "department": "Computer Science",
        },
        "student@unigpt.edu": {
            "password": "student-password-123",
            "full_name": "Student User",
            "role": "student",
            "department": "Computer Science",
        },
    }

    print("🌱 Seeding dummy users...")

    # 1. Try to list existing auth users to get their IDs
    existing_meta = {}
    try:
        users_resp = admin.auth.admin.list_users()
        for u in users_resp:
            if u.email in dummy_users:
                existing_meta[u.email] = u.id
                print(f"Found existing auth user: {u.email} -> {u.id}")
    except Exception as e:
        print(f"⚠️ Could not list users: {e}")

    for email, data in dummy_users.items():
        user_id = existing_meta.get(email)

        if not user_id:
            print(f"Creating Auth user for {email}...")
            try:
                auth_user = admin.auth.admin.create_user(
                    {
                        "email": email,
                        "password": data["password"],
                        "email_confirm": True,
                        "user_metadata": {
                            "full_name": data["full_name"],
                            "role": data["role"],
                        },
                    }
                )
                user_id = auth_user.user.id
                print(f"✅ Created: {user_id}")
            except Exception as e:
                print(f"❌ Failed to create auth for {email}: {e}")
                continue

        # 2. Upsert Profile
        try:
            admin.table("profiles").upsert(
                {
                    "id": user_id,
                    "email": email,
                    "full_name": data["full_name"],
                    "role": data["role"],
                    "department": data["department"],
                }
            ).execute()
            print(f"✅ Profile synced for {email}")
        except Exception as e:
            print(f"❌ Profile sync failed for {email}: {e}")

    print("🏁 Seeding complete!")


if __name__ == "__main__":
    seed()
