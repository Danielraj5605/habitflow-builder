# HabitFlow Backend API

A comprehensive habit tracking backend built with FastAPI and PostgreSQL (Neon DB).

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Habit Management**: Full CRUD operations for habits
- **Habit Logging**: Track daily habit completions with notes
- **Streak Calculation**: Automatic streak calculation for habits
- **Database Integration**: PostgreSQL with Neon DB cloud hosting
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **CORS Support**: Configured for frontend integration

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection and session management
│   ├── auth.py              # Authentication utilities
│   ├── models/              # SQLAlchemy database models
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   └── habit.py         # Habit and HabitLog models
│   ├── schemas/             # Pydantic schemas for API validation
│   │   ├── __init__.py
│   │   ├── user.py          # User schemas
│   │   └── habit.py         # Habit schemas
│   └── routers/             # API route handlers
│       ├── __init__.py
│       ├── auth.py          # Authentication endpoints
│       └── habits.py        # Habit management endpoints
├── alembic/                 # Database migrations (if needed)
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── .env.example            # Environment variables template
├── database_schema.sql     # Complete database schema
└── README.md               # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8+
- PostgreSQL (Neon DB account)
- pip or pipenv

### 1. Clone and Navigate

```bash
cd habitflow-builder-main/backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the `.env` file with your Neon DB connection string:

```env
DATABASE_URL=postgresql://neondb_owner:npg_zsT0Ft5QWnJx@ep-plain-king-a129zxcm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ENVIRONMENT=development
```

### 5. Database Setup

The application will automatically create tables on startup. Alternatively, you can run the SQL schema manually:

```bash
# Connect to your Neon DB and run the schema
psql 'postgresql://neondb_owner:npg_zsT0Ft5QWnJx@ep-plain-king-a129zxcm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' -f database_schema.sql
```

### 6. Run the Application

```bash
# Development mode with auto-reload
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the main.py file
python app/main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and get access token |

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/habits/` | Get all user habits |
| POST | `/habits/` | Create a new habit |
| GET | `/habits/{id}` | Get specific habit |
| PUT | `/habits/{id}` | Update habit |
| DELETE | `/habits/{id}` | Delete habit (soft delete) |
| POST | `/habits/{id}/logs` | Log habit completion |
| GET | `/habits/{id}/logs` | Get habit completion logs |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `hashed_password`
- `is_active`
- `created_at`
- `updated_at`

### Habits Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `name`
- `description`
- `frequency`
- `weekly_goal`
- `is_active`
- `tags` (JSON)
- `icon`
- `streak`
- `created_at`
- `updated_at`

### Habit Logs Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `habit_id` (Foreign Key)
- `completed_date`
- `notes`
- `created_at`

## 🔧 Configuration

Key configuration options in `app/config.py`:

- `DATABASE_URL`: Neon PostgreSQL connection string
- `SECRET_KEY`: JWT signing key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `ALLOWED_ORIGINS`: CORS allowed origins

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Use secure values for production
2. **Database**: Ensure Neon DB is properly configured
3. **HTTPS**: Use HTTPS in production
4. **Logging**: Configure proper logging
5. **Monitoring**: Set up health checks and monitoring

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🧪 Testing

Run the application and test endpoints using:

1. **Swagger UI**: http://localhost:8000/docs
2. **ReDoc**: http://localhost:8000/redoc
3. **curl** or **Postman** for API testing

Example API calls:

```bash
# Register user
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword"}'

# Login
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword"}'

# Create habit (with token)
curl -X POST "http://localhost:8000/habits/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"name": "Morning Exercise", "description": "30 minutes of exercise", "frequency": "daily"}'
```

## 🤝 Frontend Integration

The backend is designed to work seamlessly with the React frontend. Update the frontend's API base URL to point to your backend:

```typescript
// In src/lib/api.ts
const API_BASE = "http://localhost:8000";
```

## 📝 License

This project is part of the HabitFlow application suite.

## 🆘 Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the database schema
3. Check application logs
4. Verify environment configuration
