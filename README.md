# 🚌 College Bus Management System

A full-stack web application for managing college bus operations with **real-time tracking**, **user authentication**, and **role-based dashboards**.

---

## 🚀 Quick Start

### 1️⃣ Setup Database (One-time)
```bash
# Open MySQL and create database
mysql -u root -p -e "CREATE DATABASE college_bus"

# Update backend/.env with your MySQL password
# Then initialize tables:
cd backend
python init_db.py
```

### 2️⃣ Start Application
```bash
# Easy way: Double-click this file
start-servers.bat

# Or manually in two terminals:
# Terminal 1: cd backend && python -m uvicorn main:app --reload
# Terminal 2: cd frontend && npm run dev
```

### 3️⃣ Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **[START_HERE.md](START_HERE.md)** | 📘 Complete quick start guide (READ THIS FIRST) |
| **[CHECKLIST.md](CHECKLIST.md)** | ✅ Step-by-step launch checklist |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | 📊 Full technical overview |
| **[SETUP.md](SETUP.md)** | 🔧 Detailed setup instructions |

---

## ✨ Features

### ✅ Implemented
- **User Authentication** (JWT tokens, bcrypt hashing)
- **Signup/Login** with auto-redirect to dashboard
- **Role-based Access** (Admin, Student, Driver)
- **MySQL Database** integration
- **RESTful API** with FastAPI
- **React Frontend** with TypeScript
- **Protected Routes**
- **CORS Configured**
- **Live Reload** (both servers)
- **Beautiful UI** (Tailwind CSS + Shadcn/ui)

### 🔄 Ready to Add
- Real-time bus tracking (WebSocket ready)
- Attendance management
- Route management
- Notifications system
- Analytics & reports

---

## 🛠️ Tech Stack

**Backend:**
- Python 3.13 + FastAPI
- MySQL + SQLAlchemy
- JWT Authentication
- WebSocket Support

**Frontend:**
- React 18 + TypeScript
- Vite + Tailwind CSS
- Axios + React Router
- Shadcn/ui Components

---

## 📦 What's Included

```
express-campus-track-main (1)/
├── backend/                    # FastAPI backend
│   ├── main.py                 # Server entry point
│   ├── models.py               # Database models
│   ├── routers/                # API endpoints
│   ├── requirements.txt        # Dependencies
│   ├── .env                    # Configuration
│   └── init_db.py              # DB initialization
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── contexts/           # State management
│   │   ├── pages/              # Pages
│   │   └── utils/              # API & auth utilities
│   ├── package.json            # Dependencies
│   └── .env                    # Configuration
├── start-servers.bat           # Launch script
├── START_HERE.md               # Quick start guide
├── CHECKLIST.md                # Launch checklist
├── PROJECT_SUMMARY.md          # Technical overview
└── README.md                   # This file
```

---

## 🎯 How It Works

### Signup Flow
1. User registers at `/register`
2. Data saved to MySQL `users` table
3. JWT token generated
4. Auto-redirect to dashboard

### Login Flow
1. User logs in at `/login`
2. Backend verifies credentials
3. JWT token returned
4. Stored in localStorage
5. Redirects to role-based dashboard

### Authentication
- JWT tokens for sessions
- Bcrypt password hashing
- Protected API routes
- Auto-logout on token expiry

---

## 🧪 Test the System

1. **Start servers**: `start-servers.bat`
2. **Open**: http://localhost:5173/register
3. **Sign up** with test data
4. **Verify** auto-redirect to dashboard
5. **Check database**: `SELECT * FROM users;`

---

## 🆘 Troubleshooting

### Backend won't start?
- Check MySQL is running
- Verify password in `backend/.env`
- Run `python init_db.py`

### Frontend won't start?
- Run `npm install` in frontend folder
- Check Node.js is installed

### Login not working?
- Check both servers are running
- Verify API URL in `frontend/.env`
- Clear browser localStorage (F12 → Application → Local Storage)

**For detailed troubleshooting, see [START_HERE.md](START_HERE.md)**

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create user account |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/buses` | List all buses |
| GET | `/api/buses/{id}` | Get bus details |
| WS | `/api/ws/bus/{id}` | Real-time tracking |

**Interactive API docs**: http://127.0.0.1:8000/docs

---

## 🎓 Database Schema

**Users Table:**
- id, name, email, password_hash, role, created_at

**Buses Table:**
- id, bus_number, route, capacity, current_lat, current_lng, driver_id, updated_at

---

## 📝 Development

Both servers have **live reload**:
- Edit backend `.py` files → auto-reload
- Edit frontend `.tsx/.ts` files → hot module reload

No need to restart servers!

---

## 🤝 Contributing

To add features:
1. Backend: Add routes in `backend/routers/`
2. Frontend: Add components in `frontend/src/components/`
3. Database: Update models in `backend/models.py`

---

## 📞 Need Help?

1. Read **[START_HERE.md](START_HERE.md)** for detailed guide
2. Check **[CHECKLIST.md](CHECKLIST.md)** for step-by-step instructions
3. Review **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** for architecture
4. Look at terminal/console errors
5. Test API at http://127.0.0.1:8000/docs

---

## 🏆 Project Status

✅ **FULLY FUNCTIONAL** - All core features implemented and tested

- ✅ Backend server (FastAPI)
- ✅ Frontend app (React)
- ✅ Database integration (MySQL)
- ✅ Authentication (JWT)
- ✅ CORS configuration
- ✅ Dependencies installed
- ✅ Documentation complete

**Ready to use! Just follow [START_HERE.md](START_HERE.md)** 🎉
