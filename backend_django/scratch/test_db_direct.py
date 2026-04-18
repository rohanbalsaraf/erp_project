import os
import psycopg2
from dotenv import load_dotenv

# Re-load .env
load_dotenv()

db_url = os.getenv('DATABASE_URL')
print(f"DEBUG: Attempting to connect to: {db_url}")

try:
    conn = psycopg2.connect(db_url)
    print("SUCCESS: Psycopg2 connected to Supabase!")
    conn.close()
except Exception as e:
    print(f"FAILURE: Psycopg2 error: {str(e)}")
