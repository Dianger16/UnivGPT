import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

dummy_users = [
    {
        "email": "admin@unigpt.edu",
        "data": {"full_name": "System Admin", "role": "admin", "department": "IT"}
    },
    {
        "email": "faculty@unigpt.edu",
        "data": {"full_name": "Professor X", "role": "faculty", "department": "Science"}
    },
    {
        "email": "student@unigpt.edu",
        "data": {"full_name": "John Doe", "role": "student", "department": "Computer Science"}
    }
]

for user_data in dummy_users:
    # Find user ID by email
    res = supabase.auth.admin.list_users()
    user = next((u for u in res if u.email == user_data["email"]), None)
    
    if user:
        print(f"Updating profile for {user.email} ({user.id})")
        supabase.table("profiles").upsert({
            "id": user.id,
            "email": user.email,
            "full_name": user_data["data"]["full_name"],
            "role": user_data["data"]["role"],
            "department": user_data["data"]["department"]
        }).execute()
    else:
        print(f"User {user_data['email']} not found in Auth.")
