from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

print(f"🔍 Connecting to MySQL...")
print(f"🔍 Database URL: {settings.database_url[:50]}...")

try:
    engine = create_engine(
        settings.database_url,
        echo=settings.environment == "development",
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
    )
    
    # Test the connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 'MySQL Connected', VERSION()"))
        row = result.fetchone()
        print(f"✅ MySQL connection successful!")
        print(f"📊 Status: {row[0]}")
        print(f"🗄️  Version: {row[1][:60]}...")
        
except Exception as e:
    print(f"❌ MySQL connection failed: {e}")
    print("🚫 Database connection failed - please check your MySQL setup and connection string.")
    raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()