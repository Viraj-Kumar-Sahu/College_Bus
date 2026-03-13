# ✅ College Bus Management System - Launch Checklist

## Before First Run (Do Once)

### 1. MySQL Setup
- [ ] MySQL Server is installed and running
- [ ] Open MySQL command line or MySQL Workbench
- [ ] Create database:
  ```sql
  CREATE DATABASE college_bus;
  ```

### 2. Configure Backend
- [ ] Open `backend/.env` file
- [ ] Replace `your_mysql_password` with your actual MySQL root password
- [ ] Save the file

### 3. Initialize Database
- [ ] Open terminal/command prompt
- [ ] Navigate to backend folder: `cd backend`
- [ ] Run initialization script: `python init_db.py`
- [ ] Verify you see "✅ Tables created successfully!"

## Start the Application

### Option 1: Easy Way (Recommended)
- [ ] Double-click `start-servers.bat` in project root
- [ ] Wait for both terminal windows to open
- [ ] Backend starts on http://127.0.0.1:8000
- [ ] Frontend starts on http://localhost:5173

### Option 2: Manual Way
- [ ] Open two terminal/command prompt windows

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

## Test the System

### 1. Verify Servers Running
- [ ] Backend accessible at http://127.0.0.1:8000
- [ ] API docs visible at http://127.0.0.1:8000/docs
- [ ] Frontend accessible at http://localhost:5173

### 2. Test Signup
- [ ] Go to http://localhost:5173/register
- [ ] Fill in form:
  - Name: Test User
  - Email: test@example.com
  - Password: test123
  - Confirm Password: test123
  - Role: Student
- [ ] Click "Create Account"
- [ ] Should show success message
- [ ] Should auto-redirect to /dashboard

### 3. Test Login
- [ ] Go to http://localhost:5173/login
- [ ] Enter credentials from signup
- [ ] Click "Sign In"
- [ ] Should redirect to dashboard

### 4. Verify Database
- [ ] Open MySQL and run:
  ```sql
  USE college_bus;
  SELECT * FROM users;
  ```
- [ ] Should see your test user

## Troubleshooting

### Backend won't start?
- [ ] Check Python installed: `python --version`
- [ ] Check dependencies: `cd backend && pip list`
- [ ] Reinstall: `pip install -r requirements.txt`

### Frontend won't start?
- [ ] Check Node/npm installed: `node --version && npm --version`
- [ ] Check dependencies: `cd frontend && npm list`
- [ ] Reinstall: `npm install`

### Can't connect to database?
- [ ] MySQL running: Open MySQL Workbench or run `mysql --version`
- [ ] Password correct in `backend/.env`
- [ ] Database exists: `SHOW DATABASES;` should show `college_bus`
- [ ] Run `python init_db.py` again

### Login not working?
- [ ] Check both servers running
- [ ] Check browser console (F12) for errors
- [ ] Verify API URL in `frontend/.env`: `VITE_API_BASE_URL=http://127.0.0.1:8000/api`
- [ ] Clear browser localStorage and try again

### CORS errors?
- [ ] Verify `backend/main.py` has both:
  - http://localhost:5173
  - http://127.0.0.1:5173
- [ ] Restart backend server

## Files to Check

### Backend Files
```
✅ backend/main.py                   - Main server file
✅ backend/.env                      - Database config (CHECK PASSWORD!)
✅ backend/requirements.txt          - Dependencies list
✅ backend/models.py                 - Database models
✅ backend/routers/auth_router.py    - Auth endpoints
✅ backend/init_db.py                - Database setup
```

### Frontend Files
```
✅ frontend/src/App.tsx              - Main app
✅ frontend/.env                     - API URL config
✅ frontend/package.json             - Dependencies
✅ frontend/src/utils/api.ts         - Axios setup
✅ frontend/src/contexts/AuthContext.tsx - Auth state
```

## Quick Commands Reference

### Backend
```bash
cd backend
python -m uvicorn main:app --reload          # Start server
python init_db.py                            # Create tables
pip install -r requirements.txt              # Install deps
```

### Frontend
```bash
cd frontend
npm run dev                                  # Start dev server
npm install                                  # Install deps
npm run build                                # Build for production
```

## Success Indicators

✅ Backend running when you see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ Frontend running when you see:
```
VITE vX.X.X ready in XXX ms
➜  Local:   http://localhost:5173/
```

✅ Database working when you see:
```
✅ Tables created successfully!
📋 Created tables: buses, users
```

## Important URLs

| What | URL | Use For |
|------|-----|---------|
| Frontend | http://localhost:5173 | Main application |
| Login | http://localhost:5173/login | User login |
| Register | http://localhost:5173/register | User signup |
| Backend | http://127.0.0.1:8000 | API server |
| API Docs | http://127.0.0.1:8000/docs | Test API endpoints |

## Need Help?

1. Read `START_HERE.md` for detailed instructions
2. Read `SETUP.md` for technical details
3. Read `PROJECT_SUMMARY.md` for architecture overview
4. Check terminal/console for error messages
5. Verify all checkboxes above are checked ✅

---

**Once all checkboxes are checked, your system is ready!** 🎉

**Quick Start Command:**
```bash
start-servers.bat
```

Then open: http://localhost:5173

