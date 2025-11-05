from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth, habits, users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
from app.config import settings
from app.database import engine, Base
from app.routers import auth, habits, summary, users

# Create database tables
try:
    if engine:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    else:
        print("⚠️  Database engine not available - tables not created")
except Exception as e:
    print(f"⚠️  Database table creation failed: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="HabitFlow API",
    description="A comprehensive habit tracking API built with FastAPI and PostgreSQL",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
cors_origins = [
    "http://localhost:5173",
    "http://localhost:3000", 
    "http://127.0.0.1:5173",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8001"
]
print(f"🔧 CORS Origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(summary.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Welcome to HabitFlow API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "environment": settings.environment}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development"
    )
