import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def get_supabase_client():
    """
    Returns a Supabase client if environment variables are present,
    otherwise returns None for in-memory / mock operation.
    """
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and not SUPABASE_URL.startswith("https://your-supabase"):
        try:
            from supabase import create_client
            return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        except Exception as e:
            print(f"Warning: Failed to initialize Supabase client: {e}")
            return None
    return None
