# College Bus Management System - Setup Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ and npm installed
- MySQL Server running (localhost:3306)

## Quick Start

### 1. Database Setup
Make sure MySQL is running and create the database:

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE IF NOT EXISTS college_bus;
exit;
```

### 2. Configure Environment
Update `backend/.env` with your MySQL password:
```
DB_PASSWORD=your_mysql_password
```

### 3. Start Both Servers
**Option A: Using Batch File (Windows)**
```bash
start-servers.bat
```

**Option B: Manual Start**

Terminal 1 (Backend):
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

## Features

### Authentication
- **Signup**: Create account at http://localhost:5173/register
  - Automatically stores user in MySQL database
  - Auto-redirects to dashboard after signup
  - JWT token stored in localStorage

- **Login**: Access at http://localhost:5173/login
  - Verifies credentials via backend API
  - JWT authentication
  - Role-based dashboard redirect (admin/student/driver)

### API Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `GET /api/buses` - Get all buses
- `GET /api/buses/{bus_id}` - Get specific bus

## Tech Stack

### Backend
- FastAPI (Python web framework)
- MySQL (Database)
- SQLAlchemy (ORM)
- JWT (Authentication)
- Bcrypt (Password hashing)
- WebSockets (Real-time tracking)

### Frontend
- React 18
- TypeScript
- Vite (Build tool)
- Axios (HTTP client)
- React Router (Routing)
- Tailwind CSS + Shadcn/ui (Styling)

## CORS Configuration
Backend is configured to accept requests from:
- http://localhost:5173
- http://127.0.0.1:5173

## Database Schema

### Users Table
- id (Primary Key)
- name
- email (Unique)
- password_hash
- role (admin/student/driver)
- created_at

### Buses Table
- id (Primary Key)
- bus_number (Unique)
- route
- capacity
- current_lat, current_lng (Location)
- driver_id (Foreign Key to Users)
- updated_at

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running
- Check DB_PASSWORD in backend/.env
- Verify database 'college_bus' exists

### Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Change port in frontend/vite.config.ts

### CORS Issues
- Verify frontend URL in backend/main.py CORS middleware
- Clear browser cache

## Development Notes
- Backend uses hot-reload (--reload flag)
- Frontend uses Vite hot module replacement
- Both servers support live reload automatically

