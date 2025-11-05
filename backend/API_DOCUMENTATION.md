# HabitFlow API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 🔐 Authentication Endpoints

#### Register User
```http
POST /register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

#### Login User
```http
POST /login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 📝 Habit Management Endpoints

#### Get All Habits
```http
GET /habits/
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Morning Exercise",
    "description": "30 minutes of cardio",
    "frequency": "daily",
    "weekly_goal": 7,
    "is_active": true,
    "tags": ["health", "fitness"],
    "icon": "🏃",
    "streak": 5,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
]
```

#### Create New Habit
```http
POST /habits/
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Read Books",
  "description": "Read for 30 minutes daily",
  "frequency": "daily",
  "weekly_goal": 7,
  "tags": ["learning", "books"],
  "icon": "📚"
}
```

**Response (201):**
```json
{
  "id": 2,
  "user_id": 1,
  "name": "Read Books",
  "description": "Read for 30 minutes daily",
  "frequency": "daily",
  "weekly_goal": 7,
  "is_active": true,
  "tags": ["learning", "books"],
  "icon": "📚",
  "streak": 0,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

#### Get Specific Habit
```http
GET /habits/{habit_id}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Morning Exercise",
  "description": "30 minutes of cardio",
  "frequency": "daily",
  "weekly_goal": 7,
  "is_active": true,
  "tags": ["health", "fitness"],
  "icon": "🏃",
  "streak": 5,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

#### Update Habit
```http
PUT /habits/{habit_id}
Authorization: Bearer <token>
```

**Request Body (partial update):**
```json
{
  "name": "Evening Exercise",
  "weekly_goal": 5,
  "tags": ["health", "fitness", "evening"]
}
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Evening Exercise",
  "description": "30 minutes of cardio",
  "frequency": "daily",
  "weekly_goal": 5,
  "is_active": true,
  "tags": ["health", "fitness", "evening"],
  "icon": "🏃",
  "streak": 5,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T13:00:00Z"
}
```

#### Delete Habit
```http
DELETE /habits/{habit_id}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Habit deleted successfully"
}
```

### 📊 Habit Logging Endpoints

#### Log Habit Completion
```http
POST /habits/{habit_id}/logs
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "habit_id": 1,
  "completed_date": "2024-01-01T08:00:00Z",
  "notes": "Great workout today!"
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "habit_id": 1,
  "completed_date": "2024-01-01T08:00:00Z",
  "notes": "Great workout today!",
  "created_at": "2024-01-01T08:05:00Z"
}
```

#### Get Habit Logs
```http
GET /habits/{habit_id}/logs
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "habit_id": 1,
    "completed_date": "2024-01-01T08:00:00Z",
    "notes": "Great workout today!",
    "created_at": "2024-01-01T08:05:00Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "habit_id": 1,
    "completed_date": "2023-12-31T08:00:00Z",
    "notes": "Good session",
    "created_at": "2023-12-31T08:05:00Z"
  }
]
```

### 🔧 System Endpoints

#### Root Endpoint
```http
GET /
```

**Response (200):**
```json
{
  "message": "Welcome to HabitFlow API",
  "version": "1.0.0",
  "docs": "/docs",
  "redoc": "/redoc"
}
```

#### Health Check
```http
GET /health
```

**Response (200):**
```json
{
  "status": "healthy",
  "environment": "development"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Email already registered"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Habit not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Data Models

### User
```typescript
interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Habit
```typescript
interface Habit {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  frequency: string;
  weekly_goal: number;
  is_active: boolean;
  tags: string[];
  icon: string;
  streak: number;
  created_at: string;
  updated_at: string;
}
```

### HabitLog
```typescript
interface HabitLog {
  id: number;
  user_id: number;
  habit_id: number;
  completed_date: string;
  notes?: string;
  created_at: string;
}
```

## Frontend Integration

### Setting up API calls in React

```typescript
// src/lib/api.ts
const API_BASE = "http://localhost:8000";

// Update existing functions to match backend endpoints
export async function getHabits() {
  const res = await fetch(`${API_BASE}/habits/`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addHabit(habit: any) {
  const res = await fetch(`${API_BASE}/habits/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(habit),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

## Testing with curl

### Register and Login
```bash
# Register
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Login
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'
```

### Create and Manage Habits
```bash
# Create habit (replace <TOKEN> with actual token)
curl -X POST "http://localhost:8000/habits/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Morning Jog", "description": "30 min jog", "frequency": "daily"}'

# Get all habits
curl -X GET "http://localhost:8000/habits/" \
  -H "Authorization: Bearer <TOKEN>"

# Log habit completion
curl -X POST "http://localhost:8000/habits/1/logs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"habit_id": 1, "completed_date": "2024-01-01T08:00:00Z", "notes": "Great session!"}'
```
