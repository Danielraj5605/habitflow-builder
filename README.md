# 🌊 HabitFlow Builder

A full-stack habit tracking application built with a **React + TypeScript** frontend and a **FastAPI + MySQL** backend. HabitFlow lets users create habits, log daily completions, track streaks, visualise weekly progress, and view analytics summaries — all behind a sleek, dark-themed UI.

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Running the App](#-running-the-app)
- [API Reference](#-api-reference)
- [Key Features](#-key-features)
- [Architecture Overview](#-architecture-overview)
- [Troubleshooting](#-troubleshooting)

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| TailwindCSS | 3.x | Styling |
| Framer Motion | 12.x | Animations |
| React Router DOM | 6.x | Client-side routing |
| TanStack React Query | 5.x | Server-state management |
| Radix UI | Various | Accessible UI primitives |
| Recharts | 2.x | Charts & analytics |
| React Activity Calendar | 3.x | Heatmap calendar |
| Zod + React Hook Form | Latest | Form validation |
| Axios | 1.x | HTTP client |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.8+ | Runtime |
| FastAPI | 0.104 | API framework |
| Uvicorn | 0.24 | ASGI server |
| SQLAlchemy | 2.0 | ORM |
| Alembic | 1.12 | Database migrations |
| Pydantic v2 | 2.8+ | Data validation |
| PyMySQL | 1.1 | MySQL driver |
| python-jose | 3.3 | JWT tokens |
| passlib + bcrypt | 1.7 | Password hashing |

### Database
- **MySQL** (local development)
- The schema auto-creates on backend startup via SQLAlchemy

---

## 📁 Project Structure

```
habitflow-builder-main/
├── .env                        # Frontend env vars (VITE_API_BASE_URL)
├── .gitignore
├── index.html                  # HTML entry point
├── package.json                # Frontend dependencies & scripts
├── vite.config.ts              # Vite config (dev proxy → backend)
├── tailwind.config.ts          # Tailwind design tokens
├── tsconfig.json
│
├── src/                        # React frontend source
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component & routing
│   ├── index.css               # Global styles & design system
│   │
│   ├── pages/                  # Route-level page components
│   │   ├── Dashboard.tsx       # Overview + streak summary
│   │   ├── HabitTracker.tsx    # Weekly habit grid
│   │   ├── AddHabit.tsx        # Habit creation form
│   │   ├── Summary.tsx         # Analytics & charts
│   │   ├── Account.tsx         # User profile management
│   │   ├── Settings.tsx        # App settings
│   │   ├── Login.tsx           # Login page
│   │   ├── Signup.tsx          # Registration page
│   │   └── NotFound.tsx        # 404 page
│   │
│   ├── components/             # Shared UI components
│   │   ├── AppSidebar.tsx      # Navigation sidebar
│   │   ├── BottomNav.tsx       # Mobile navigation bar
│   │   ├── Layout.tsx          # Page layout wrapper
│   │   ├── PrivateRoute.tsx    # Auth-protected route wrapper
│   │   ├── EditHabitDialog.tsx # Edit habit modal
│   │   ├── ActivityHeatmap.tsx # Activity calendar
│   │   └── ui/                 # 49 Radix UI-based primitives
│   │
│   ├── contexts/
│   │   ├── HabitContext.tsx    # Global habit state & API calls
│   │   └── UserContext.tsx     # Current user state
│   │
│   ├── hooks/
│   │   ├── use-toast.ts        # Toast notification hook
│   │   └── use-mobile.tsx      # Responsive breakpoint hook
│   │
│   └── lib/
│       ├── api.ts              # All backend API call functions
│       ├── auth.ts             # Auth utilities (token management)
│       └── utils.ts            # Shared utility helpers
│
└── backend/                    # FastAPI backend
    ├── .env                    # Backend env vars (DB, JWT, etc.)
    ├── requirements.txt        # Python dependencies
    ├── run.py                  # Quick start script
    ├── Dockerfile              # Container definition
    ├── docker-compose.yml      # Docker Compose config
    ├── database_schema_mysql.sql   # MySQL schema (optional manual setup)
    ├── database_schema.sql         # PostgreSQL schema (legacy)
    ├── populate_database.py    # Seed script (demo data)
    ├── test_api.py             # API integration tests
    ├── test_api_response.py    # Response format tests
    ├── alembic/                # DB migration scripts
    ├── alembic.ini
    └── app/
        ├── main.py             # FastAPI application + CORS + routes
        ├── config.py           # Settings via pydantic-settings
        ├── database.py         # SQLAlchemy engine & session
        ├── auth.py             # JWT creation & verification
        ├── models/
        │   ├── user.py         # User ORM model
        │   ├── habit.py        # Habit + HabitLog ORM models
        │   ├── habit_summary.py
        │   └── identity.py     # Identity ORM model
        ├── schemas/            # Pydantic request/response schemas
        ├── routers/
        │   ├── auth.py         # POST /register, POST /login
        │   ├── habits.py       # CRUD + logging for habits
        │   ├── summary.py      # Analytics & summary endpoints
        │   ├── users.py        # User profile endpoints
        │   └── identities.py   # Identity CRUD endpoints
        └── services/
            └── consistency.py  # Streak & consistency calculations
```

---

## ✅ Prerequisites

Make sure you have the following installed before proceeding:

| Tool | Minimum Version | Check |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Python | 3.8+ | `python --version` |
| MySQL | 8.0+ | `mysql --version` |
| Git | Any | `git --version` |

> **Windows Users:** All commands below use standard terminals (PowerShell or CMD). Make sure Python and MySQL are on your `PATH`.

---

## 🔐 Environment Variables

### Frontend — `.env` (root directory)

```env
# The Vite dev server proxies /api/* → http://127.0.0.1:8000
VITE_API_BASE_URL=/api
```

> This file is already present. The Vite proxy in `vite.config.ts` rewrites `/api/...` requests to `http://127.0.0.1:8000/...` so you never need to hardcode the backend URL in the frontend.

---

### Backend — `backend/.env`

Create or update this file with your settings:

```env
# MySQL connection string
DATABASE_URL="mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>"

# JWT Secret — change this in production!
SECRET_KEY="habitflow-secret-key"
ALGORITHM="HS256"

# Token expiry in minutes (1440 = 24 hours)
ACCESS_TOKEN_EXPIRE_MINUTES="1440"

# CORS — comma-separated list of allowed frontend origins
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

ENVIRONMENT="development"
```

**Example for a local MySQL setup (default):**
```env
DATABASE_URL="mysql+pymysql://root:1234@localhost:3306/habitflow"
```

> ⚠️ Never commit your real `.env` files. They are already listed in `.gitignore`.

---

## 🗄️ Database Setup

### 1. Create the MySQL Database

Log into MySQL and run:

```sql
CREATE DATABASE habitflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. (Option A) — Let SQLAlchemy Auto-Create Tables

The backend automatically runs `Base.metadata.create_all()` on startup, which creates all required tables. Just start the backend server (see below) and the tables will be created.

### 3. (Option B) — Run the SQL Schema Manually

If you prefer to initialise the schema manually:

```bash
mysql -u root -p habitflow < backend/database_schema_mysql.sql
```

This creates the following tables:
- `users` — Registered accounts
- `habits` — Habit definitions, icons, frequency, weekly goals
- `habit_logs` — Per-day completion records
- `habit_summary` — Aggregated analytics per habit per day
- `identities` — User-defined identity labels linked to habits

### 4. (Optional) Seed with Demo Data

To populate the database with a demo user and sample habits:

```bash
cd backend
python populate_database.py
```

This creates:
- **Demo user:** `demo@habitflow.com` / `demo123`
- **8 sample habits** with 30 days of logs and calculated streaks

---

## 🐍 Backend Setup

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create a Python virtual environment
python -m venv venv

# 3. Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Make sure backend/.env is configured (see section above)
```

---

## ⚛️ Frontend Setup

```bash
# From the project root (habitflow-builder-main/)

# Install Node dependencies
npm install
```

---

## 🚀 Running the App

You need **two terminals running simultaneously** — one for the backend, one for the frontend.

### Terminal 1 — Start the Backend

```bash
cd backend
venv\Scripts\activate       # Windows
# or: source venv/bin/activate  (macOS/Linux)

python run.py
# OR equivalently:
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Root:** http://localhost:8000
- **Swagger UI (interactive docs):** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

### Terminal 2 — Start the Frontend

```bash
# From the project root
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:8080

> The Vite dev server runs on port **8080** (configured in `vite.config.ts`). All `/api/*` requests are automatically proxied to the backend on port **8000**, so no manual CORS or URL configuration is needed in the browser.

---

## 📚 API Reference

### Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/register` | `{ email, password, name? }` | Register a new user |
| `POST` | `/login` | `{ email, password }` | Returns a JWT `access_token` |
| `GET` | `/users/me` | — | Get current authenticated user |

### Habits

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/habits/` | ✅ | Get all active habits for current user |
| `POST` | `/habits/` | ✅ | Create a new habit |
| `GET` | `/habits/{id}` | ✅ | Get a single habit |
| `PUT` | `/habits/{id}` | ✅ | Update a habit |
| `DELETE` | `/habits/{id}` | ✅ | Soft-delete a habit (`is_active = false`) |
| `POST` | `/habits/{id}/logs` | ✅ | Log a habit completion for a given date |
| `GET` | `/habits/{id}/logs` | ✅ | Get all completion logs for a habit |
| `DELETE` | `/habits/{id}/logs/{log_id}` | ✅ | Delete a specific log entry |
| `DELETE` | `/habits/{id}/logs/by-date` | ✅ | Delete a log by date (used for toggle) |

### Summary & Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/summary/` | ✅ | All summaries (optional `start_date`, `end_date`) |
| `GET` | `/summary/overall` | ✅ | Aggregate stats (total habits, streaks, completions) |
| `GET` | `/summary/weekly` | ✅ | Weekly completion rates for past 4 weeks |
| `GET` | `/summary/top-habits` | ✅ | Top 5 habits by completion rate |
| `GET` | `/summary/daily-completions` | ✅ | Daily completions for a date range |
| `GET` | `/summary/daily` | ✅ | Summaries for a specific date (`?date=YYYY-MM-DD`) |
| `GET` | `/summary/habit/{id}` | ✅ | All summaries for a specific habit |

### Identities

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/identities/` | ✅ | Get all user identities |
| `POST` | `/identities/` | ✅ | Create a new identity |
| `GET` | `/identities/{id}` | ✅ | Get a specific identity |
| `PUT` | `/identities/{id}` | ✅ | Update an identity |
| `DELETE` | `/identities/{id}` | ✅ | Delete an identity |

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API info |
| `GET` | `/health` | Health check |

### Authentication Header

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The token is stored in `localStorage` under the key `"token"` by the frontend.

---

## ✨ Key Features

- **JWT Authentication** — Secure login/signup with 24-hour token expiry
- **Habit CRUD** — Create, edit, and soft-delete habits with custom icon, frequency, tags, and weekly goal
- **Daily Logging & Toggle** — Click any day in the weekly grid to log or un-log a completion
- **7-Day Consistency Score** — Auto-calculated rolling percentage per habit (updated on every log action)
- **Streak Tracking** — Current consecutive-day streaks calculated server-side
- **Rest Tokens** — Users earn 1 rest token per 7-day streak milestone; tokens can preserve streaks on missed days
- **Identities** — Habit grouping by identity label (e.g. "Athlete", "Creator")
- **Analytics Dashboard** — Recharts-powered bar charts, completion heatmaps, and summary cards
- **Responsive UI** — Desktop sidebar + mobile bottom navigation
- **Dark Theme** — Royal Obsidian design system with glassmorphism and Framer Motion animations

---

## 🏗 Architecture Overview

```
Browser (port 8080)
      │
      │  /api/* requests
      ▼
Vite Dev Server (proxy)
      │
      │  rewrites path, forwards to port 8000
      ▼
FastAPI Backend (port 8000)
      │
      ├── JWT authentication middleware
      ├── CORS middleware
      ├── Routers (auth, habits, summary, users, identities)
      ├── Pydantic validation
      └── SQLAlchemy ORM
             │
             ▼
         MySQL Database
```

**Frontend State Management:**
- `HabitContext` — Global habit list, loading/error states, and all habit mutation functions
- `UserContext` — Current user profile data
- `TanStack React Query` — Used for some server-state caching
- `localStorage` — JWT token persistence

---

## 🐳 Docker Deployment (Optional)

The backend includes a `Dockerfile` and `docker-compose.yml` for containerised deployment.

```bash
cd backend

# Build and run the backend container
docker-compose up --build
```

The container:
- Exposes port `8000`
- Reads environment variables from `backend/.env`
- Includes a health check at `/health`
- Runs as a non-root user

> Note: The Docker Compose file does not include a MySQL container by default. Point `DATABASE_URL` to an external MySQL instance, or uncomment and configure the postgres service block for a local database.

---

## 🔧 Troubleshooting

### Backend won't start

- **MySQL not running:** Ensure your MySQL server is started and the credentials in `backend/.env` are correct.
- **Missing `DATABASE_URL`:** The config will print `❌ No DATABASE_URL found` — check your `backend/.env` file.
- **Virtual env not activated:** Ensure `venv\Scripts\activate` was run before `python run.py`.
- **Port already in use:** Kill any process on port 8000 or change the port in `run.py`.

### Frontend shows `401 Unauthorized`

- Your JWT token may have expired — clear `localStorage` in browser DevTools and log in again.
- The backend must be running before the frontend makes any API calls.

### Frontend can't reach backend

- Verify the backend is running on port `8000`.
- The Vite proxy configuration in `vite.config.ts` routes `/api` → `http://127.0.0.1:8000`. Do not change `VITE_API_BASE_URL` to an absolute URL unless you disable the proxy.

### Habits not appearing after login

1. Restart the backend server to pick up any schema changes.
2. Clear browser cache and `localStorage`.
3. Test the API directly: `python backend/test_api_response.py`
4. Check backend logs in the terminal for database errors.

### Database table errors on startup

Run the MySQL schema manually to ensure all tables exist:

```bash
mysql -u root -p habitflow < backend/database_schema_mysql.sql
```

---

## 📝 Notes

- The `repomix-output.xml` file in the project root is an auto-generated codebase snapshot — it is listed in `.gitignore` and safe to delete.
- The `backend/populate_database.py` and test scripts (`test_api.py`, `test_api_response.py`, `debug_schema.py`) are development utilities and are not required for production.
- The `backend/alembic/` directory contains migration infrastructure. Migrations are not required for fresh setups since SQLAlchemy auto-creates tables on startup.
