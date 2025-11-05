# HabitFlow Backend Setup Instructions

## 🚀 Quick Start Guide

### Step 1: Navigate to Backend Directory
```bash
cd habitflow-builder-main/backend
```

### Step 2: Create Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
The `.env` file is already created with your Neon DB connection. Verify it contains:

```env
DATABASE_URL=postgresql://neondb_owner:npg_zsT0Ft5QWnJx@ep-plain-king-a129zxcm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
SECRET_KEY=habitflow-secret-key-change-in-production-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
ENVIRONMENT=development
```

### Step 5: Initialize Database (Optional)
The app will create tables automatically, but you can also run the schema manually:

```bash
# Connect to Neon DB and run schema
psql 'postgresql://neondb_owner:npg_zsT0Ft5QWnJx@ep-plain-king-a129zxcm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' -f database_schema.sql
```

### Step 6: Run the Backend Server
```bash
# Option 1: Using the run script
python run.py

# Option 2: Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 3: Using Python module
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 7: Verify Installation
Open your browser and visit:
- **API Root**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

You should see the API documentation and be able to test endpoints.

## 🔧 Frontend Integration

### Update Frontend API Configuration
In your React frontend, update the API base URL:

```typescript
// src/lib/api.ts - Line 1
const API_BASE = "http://localhost:8000";  // Change from port 8000 to your backend port
```

### Test the Integration
1. Start the backend: `python run.py`
2. Start the frontend: `npm run dev` (in the main project directory)
3. Register a new user through the frontend
4. Create and manage habits

## 🧪 Testing the API

### Using the Interactive Documentation
1. Go to http://localhost:8000/docs
2. Click "Authorize" and enter a Bearer token (after login)
3. Test all endpoints interactively

### Using curl Commands
```bash
# Register a user
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@habitflow.com", "password": "testpassword123"}'

# Login to get token
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@habitflow.com", "password": "testpassword123"}'

# Use the returned token for authenticated requests
curl -X GET "http://localhost:8000/habits/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Error
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solution**: Verify your Neon DB connection string in `.env` file.

#### 2. Module Not Found Error
```
ModuleNotFoundError: No module named 'app'
```
**Solution**: Make sure you're in the `backend/` directory and virtual environment is activated.

#### 3. Port Already in Use
```
OSError: [Errno 48] Address already in use
```
**Solution**: 
- Kill the process using port 8000: `lsof -ti:8000 | xargs kill -9`
- Or use a different port: `uvicorn app.main:app --port 8001`

#### 4. CORS Error in Frontend
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: Verify `ALLOWED_ORIGINS` in `.env` includes your frontend URL.

#### 5. JWT Token Issues
```
Could not validate credentials
```
**Solution**: 
- Check if token is properly stored in localStorage
- Verify token format in Authorization header: `Bearer <token>`
- Check if token hasn't expired

## 📊 Database Management

### Viewing Database Tables
Connect to your Neon DB:
```bash
psql 'postgresql://neondb_owner:npg_zsT0Ft5QWnJx@ep-plain-king-a129zxcm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
```

Useful SQL commands:
```sql
-- List all tables
\dt

-- View users
SELECT * FROM users;

-- View habits
SELECT * FROM habits;

-- View habit logs
SELECT * FROM habit_logs;

-- Check habit statistics
SELECT * FROM habit_stats;
```

### Resetting Database (if needed)
```sql
-- Drop all tables (CAUTION: This deletes all data)
DROP TABLE IF EXISTS habit_logs CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then restart the backend to recreate tables.

## 🔒 Security Notes

### For Development
- The current setup is configured for development
- JWT tokens expire in 24 hours (1440 minutes)
- CORS is enabled for localhost origins

### For Production
- Change `SECRET_KEY` to a secure random string
- Use HTTPS URLs in `ALLOWED_ORIGINS`
- Set `ENVIRONMENT=production`
- Consider shorter token expiration times
- Enable proper logging and monitoring

## 📝 Next Steps

1. **Test all endpoints** using the interactive documentation
2. **Integrate with frontend** by updating API calls
3. **Add sample data** through the frontend or API
4. **Monitor logs** for any issues
5. **Deploy to production** when ready

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** - The backend shows detailed error messages
2. **Verify environment** - Ensure all environment variables are set correctly
3. **Test database connection** - Use the provided psql command
4. **Check API documentation** - Visit http://localhost:8000/docs
5. **Review the code** - All source code is well-documented

The backend is now ready to work with your HabitFlow frontend! 🎉
