"""
Setup script to create the Supabase Storage bucket for farmer documents.
Run this after executing the SQL migration (001_init.sql) in the Supabase SQL Editor.

Usage:
    python migrations/setup_storage.py
"""
import os
import sys
from dotenv import load_dotenv

# Load backend .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("ERROR: Missing SUPABASE_URL or SUPABASE_KEY in backend/.env")
    sys.exit(1)

from supabase import create_client
supabase = create_client(url, key)

BUCKET_NAME = "farmer-documents"

print(f"Supabase URL: {url}")
print(f"Checking if bucket '{BUCKET_NAME}' exists...")

try:
    buckets = supabase.storage.list_buckets()
    bucket_names = [b.name for b in buckets]
    
    if BUCKET_NAME in bucket_names:
        print(f"[OK] Bucket '{BUCKET_NAME}' already exists.")
    else:
        print(f"Creating bucket '{BUCKET_NAME}'...")
        supabase.storage.create_bucket(
            BUCKET_NAME,
            options={
                "public": False,
                "file_size_limit": 5242880,  # 5MB
                "allowed_mime_types": [
                    "application/pdf",
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                ],
            },
        )
        print(f"[OK] Bucket '{BUCKET_NAME}' created successfully.")

    # Verify
    buckets = supabase.storage.list_buckets()
    print("\nAll buckets:")
    for b in buckets:
        print(f"  - {b.name} (public: {b.public})")

except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

print("\nStorage setup complete!")
