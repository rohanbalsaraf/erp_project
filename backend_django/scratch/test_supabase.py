import os
from supabase import create_client, Client
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '..', '.env'))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")

print(f"DEBUG: URL={url}")

try:
    if not url:
        raise ValueError("SUPABASE_URL not found in .env")
    supabase: Client = create_client(url, key)
    buckets = supabase.storage.list_buckets()
    print("SUCCESS: Connected to Supabase via SDK")
    print(f"Buckets found: {[b.name for b in buckets]}")
except Exception as e:
    print(f"FAILURE: {str(e)}")
