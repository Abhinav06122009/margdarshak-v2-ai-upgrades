import torch
from sentence_transformers import SentenceTransformer
from supabase import create_client

# 1. Test the Neural Engine
print("🧠 Initializing Neural Engine...")
model = SentenceTransformer('all-MiniLM-L6-v2')
test_text = "Newton's Second Law: F = ma"
vector = model.encode(test_text).tolist()
print(f"✅ Vector generated (Dimensions: {len(vector)})")

# 2. Test the Cloud Link
# Replace with your actual Supabase credentials
SUPABASE_URL = "https://orkoqwrdfygfkqqerqvh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ya29xd3JkZnlnZmtxcWVycXZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTY2NTUyMywiZXhwIjoyMDYxMjQxNTIzfQ.jQN1dOvqz-Bm6uQM074YlLOp2LLl6oBGyRMNsuUPcC8" 

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("🛰️ Cloud Link: STABLE")
except Exception as e:
    print(f"❌ Cloud Link: FAILED ({e})")