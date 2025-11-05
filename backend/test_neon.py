import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    db_url = os.getenv("DATABASE_URL")
    try:
        conn = await asyncpg.connect(dsn=db_url)
        print("✅ Connection successful!")
        await conn.close()
    except Exception as e:
        print("❌ Connection failed:", e)

asyncio.run(main())
