from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('website/.env')

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")
supabase = create_client(url, key)

res = supabase.table('staff').select('*').limit(1).execute()
if res.data:
    print(res.data[0].keys())
else:
    print("No data in staff table")
