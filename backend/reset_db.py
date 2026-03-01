from app.services.supabase_client import get_supabase_admin


def reset_db():
    admin = get_supabase_admin()

    tables = ["audit_logs", "messages", "conversations", "documents", "profiles"]

    print("🗑️ Resetting database tables...")
    for table in tables:
        try:
            # Delete all rows from the table
            admin.table(table).delete().neq(
                "id", "00000000-0000-0000-0000-000000000000"
            ).execute()
            print(f"✅ Cleared table: {table}")
        except Exception as e:
            print(f"⚠️ Could not clear {table}: {e}")

    print("👤 Deleting auth users...")
    try:
        users_resp = admin.auth.admin.list_users()
        for u in users_resp:
            # Skip dummy users if we want to keep them, but user said "delete the db"
            # We'll delete everyone then seed.py will recreate them.
            try:
                admin.auth.admin.delete_user(u.id)
                print(f"✅ Deleted auth user: {u.email}")
            except Exception as e:
                print(f"❌ Failed to delete user {u.email}: {e}")
    except Exception as e:
        print(f"⚠️ Could not list users for deletion: {e}")

    print("✨ Database reset complete!")


if __name__ == "__main__":
    reset_db()
