import psycopg2
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()


def migrate():
    # We use the hardcoded IPv6 address because local DNS resolution for Supabase is failing
    # Address resolved via powershell (Resolve-DnsName)
    DB_IPV6 = "2406:da18:243:7400:c2ae:b689:cc3:e62c"

    db_params = {
        "host": DB_IPV6,
        "port": "6543",
        "database": (os.getenv("DB_NAME") or "postgres").strip(),
        "user": (os.getenv("DB_USER") or "postgres").strip(),
        "password": (os.getenv("DB_PASSWORD") or "").strip(),
        "sslmode": "require",
    }

    # Path to schema file
    backend_dir = Path(__file__).parent
    sql_file = backend_dir.parent / "database_schema.sql"

    print(
        f"DEBUG: Host='{db_params['host']}', Port='{db_params['port']}', User='{db_params['user']}', DB='{db_params['database']}'"
    )
    print(f"Connecting to Supabase (via IPv6: {DB_IPV6})...")

    if not db_params["password"]:
        print("❌ Error: Missing DB_PASSWORD in .env file.")
        return

    try:
        conn = psycopg2.connect(**db_params)
        conn.autocommit = True
        cur = conn.cursor()

        print(f"Reading {sql_file.name}...")
        if not sql_file.exists():
            print(f"❌ Error: SQL file {sql_file} not found at {sql_file}")
            return

        with open(sql_file, "r") as f:
            sql = f.read()

        print("Executing migration...")
        cur.execute(sql)
        print("✅ Migration successful!")

        # Add the Service Role policy, Triggers for Google Login
        print("Adding Database Triggers and Policies...")
        extra_sql = """
        -- 1. Function to handle new user profiles automatically for Google/Social log-ins
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, full_name, role)
          VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Google User'),
            'student'
          )
          ON CONFLICT (id) DO NOTHING;
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- 2. Trigger to execute when a user is created in auth.users
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

        -- 3. Policies
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access' AND tablename = 'profiles') THEN
                CREATE POLICY "Service role full access" ON public.profiles USING (true) WITH CHECK (true);
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'profiles') THEN
                CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
                CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone' AND tablename = 'profiles') THEN
                CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
            END IF;
        END $$;
        """
        cur.execute(extra_sql)
        print("✅ Triggers and Policies updated!")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Migration FAILED: {e}")


if __name__ == "__main__":
    migrate()
