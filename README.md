# HabitFlow Tracker 🎯

A comprehensive full-stack habit tracking application with streak tracking, analytics, and weekly goals.

![Tech Stack](https://img.shields.io/badge/React-18.3-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)

## 🚀 Features

- ✅ **User Authentication** - Secure JWT-based authentication
- 📊 **Habit Tracking** - Create and track daily habits
- 🔥 **Streak Calculation** - Automatic streak tracking and visualization
- 📈 **Analytics Dashboard** - Detailed charts and statistics
- 🎨 **Modern UI** - Beautiful, responsive design with TailwindCSS
- ☁️ **Cloud Database** - Powered by Neon PostgreSQL
- 📱 **Mobile Responsive** - Works seamlessly on all devices

## 🏗️ Architecture

```
habitflow-tracker/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/      # SQLAlchemy models
│   │   ├── routers/     # API endpoints
│   │   ├── schemas/     # Pydantic schemas
│   │   └── main.py      # Application entry
│   └── requirements.txt
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── pages/          # Page components
│   ├── contexts/       # State management
│   └── lib/            # Utilities
└── PROJECT_OVERVIEW.md # Detailed documentation
```

## 📋 Prerequisites

- **Python 3.8+** for backend
- **Node.js 18+** for frontend
- **PostgreSQL** (Neon DB account)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Danielraj5605/habitflow-builder.git
cd habitflow-builder
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create .env file with:
DATABASE_URL=postgresql://neondb_owner:npg_4lUXyBkMJI9c@ep-still-union-aixilbd8-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ENVIRONMENT=development

# Run the backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**  
API Documentation: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
# From project root
npm install

# Run the frontend
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## 🗄️ Database Setup

The application uses **Neon PostgreSQL** cloud database. Tables are automatically created on first run.

To manually run the schema:

```bash
psql 'postgresql://neondb_owner:npg_4lUXyBkMJI9c@ep-still-union-aixilbd8-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require' -f backend/database_schema.sql
```

## 📚 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `GET /users/me` - Get current user profile

### Habits
- `GET /habits/` - Get all user habits
- `POST /habits/` - Create new habit
- `GET /habits/{id}` - Get specific habit
- `PUT /habits/{id}` - Update habit
- `DELETE /habits/{id}` - Delete habit

### Habit Logs
- `POST /habits/{id}/logs` - Log habit completion
- `GET /habits/{id}/logs` - Get all logs for habit
- `DELETE /habits/{id}/logs/{log_id}` - Delete specific log

See [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for detailed API documentation.

## 🎨 Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Radix UI** - Accessible components
- **TanStack Query** - Server state management
- **React Router** - Routing
- **Recharts** - Data visualization

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Uvicorn** - ASGI server

### Database
- **PostgreSQL** - Neon DB cloud database
- **asyncpg** - Async PostgreSQL driver

## 📖 Documentation

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Comprehensive project documentation
- [backend/README.md](backend/README.md) - Backend-specific documentation
- [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) - API reference
- [backend/SETUP_INSTRUCTIONS.md](backend/SETUP_INSTRUCTIONS.md) - Detailed setup guide

## 🚀 Deployment

### Backend (Render/Railway/Fly.io)

1. Set environment variables
2. Deploy from GitHub
3. Run database migrations

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set `VITE_API_BASE_URL` environment variable

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
npm run test
```

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Daniel Raj**
- GitHub: [@Danielraj5605](https://github.com/Danielraj5605)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ using React, FastAPI, and PostgreSQL**
