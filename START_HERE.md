# 🚀 College Bus Management System - Quick Start Guide

## ✅ What's Already Done
- ✅ Backend dependencies installed (FastAPI, MySQL, JWT, etc.)
- ✅ Frontend dependencies installed (React, Axios, Router, etc.)
- ✅ Authentication system implemented (signup/login with JWT)
- ✅ CORS configured for frontend-backend communication
- ✅ Database models created (Users, Buses)
- ✅ API endpoints ready (/auth/signup, /auth/login, /auth/me, /buses)

## 🔧 Before You Start

### 1. Update MySQL Password
Edit `backend/.env` and replace `your_mysql_password` with your actual MySQL password:
```
DB_PASSWORD=your_actual_password_here
```

### 2. Create Database
Open MySQL command line or MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS college_bus;
```

Or using command line:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS college_bus"
```

### 3. Initialize Database Tables
```bash
cd backend
python init_db.py
```

This will create the `users` and `buses` tables automatically.

## 🚀 Start the Application

### Option 1: Using Batch File (Easiest)
Just double-click `start-servers.bat` in the project root folder!

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 Access the Application

Once both servers are running:

1. **Open your browser** → http://localhost:5173

2. **Sign Up** (Register Page)
   - Click "Sign Up" or go to http://localhost:5173/register
   - Fill in: Name, Email, Password, Role (student/driver/admin)
   - Click "Create Account"
   - ✅ User is automatically saved to MySQL database
   - ✅ Automatically logged in with JWT token
   - ✅ Redirected to dashboard

3. **Login** (Login Page)
   - Go to http://localhost:5173/login
   - Enter email and password
   - Click "Sign In"
   - ✅ Credentials verified via backend API
   - ✅ JWT token stored in localStorage
   - ✅ Redirected to role-based dashboard

4. **Dashboard**
   - After login, you'll see the dashboard at /dashboard
   - Different views for admin/student/driver roles

## 🔗 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React app |
| Backend API | http://127.0.0.1:8000 | FastAPI server |
| API Docs | http://127.0.0.1:8000/docs | Swagger UI (Interactive API docs) |
| Register | http://localhost:5173/register | Sign up page |
| Login | http://localhost:5173/login | Sign in page |

## 🧪 Test the System

### 1. Test Signup Flow
```bash
# Open http://localhost:5173/register
# Fill the form and submit
# Should redirect to /dashboard
```

### 2. Test Login Flow
```bash
# Open http://localhost:5173/login
# Enter credentials
# Should redirect to /dashboard
```

### 3. Test API Directly
Open http://127.0.0.1:8000/docs and try:
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

## 📊 View Database

Check your MySQL database:
```sql
USE college_bus;

-- View all users
SELECT * FROM users;

-- View all buses
SELECT * FROM buses;
```

## 🔥 Features Implemented

✅ **User Authentication**
- Sign up with email/password
- Login with JWT tokens
- Role-based access (admin/student/driver)
- Session management with localStorage
- Protected routes

✅ **Backend API**
- FastAPI with automatic documentation
- MySQL database integration
- JWT authentication
- Password hashing (bcrypt)
- CORS enabled for frontend

✅ **Frontend**
- React with TypeScript
- Axios for API calls
- React Router for navigation
- Protected routes
- Role-based dashboards
- Beautiful UI with Tailwind CSS

✅ **Real-time Features**
- WebSocket support for live bus tracking
- Auto-redirect after login/signup
- Live reload for development

## 🛠️ Troubleshooting

### Backend won't start?
```bash
# Check Python
python --version

# Check if dependencies installed
cd backend
pip list | findstr fastapi

# Reinstall if needed
pip install -r requirements.txt
```

### Frontend won't start?
```bash
# Check Node
node --version
npm --version

# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install
```

### MySQL connection error?
1. Check MySQL is running: `mysql --version`
2. Verify password in `backend/.env`
3. Create database: `CREATE DATABASE college_bus;`
4. Run `python init_db.py` to create tables

### CORS error in browser?
Backend already configured for:
- http://localhost:5173
- http://127.0.0.1:5173

Clear browser cache if issues persist.

## 📝 Development Workflow

Both servers have **live reload** enabled:
- Backend: Changes to `.py` files auto-reload
- Frontend: Changes to `.tsx/.ts/.css` files auto-reload

Just edit and save - changes appear automatically!

## 🎯 Next Steps

Your system is now ready for:
- Adding more features (bus tracking, attendance, etc.)
- Customizing dashboards
- Adding more API endpoints
- Implementing real-time tracking
- Adding notifications

## 💡 Tips

- Keep both terminal windows open while developing
- Use http://127.0.0.1:8000/docs for API testing
- Check browser console (F12) for frontend errors
- Check terminal for backend errors
- Use React DevTools for debugging

---

**Ready to start? Run `start-servers.bat` and go to http://localhost:5173** 🚀

