# ✅ Database Setup Verification Checklist

## 🗄️ Database Tables Status

Run this in MySQL Workbench to verify all tables exist:

```sql
USE college_bus;
SHOW TABLES;
```

**Expected 8 tables:**
- ✅ `users` - Store user accounts (admin, driver, student)
- ✅ `drivers` - Store driver-specific info (license, experience)
- ✅ `students` - Store student-specific info (roll no, class, parent contact)
- ✅ `buses` - Store bus information
- ✅ `routes` - Store bus routes
- ✅ `bus_drivers` - Link drivers to buses
- ✅ `student_bus` - Link students to buses
- ✅ `attendance` - Track student attendance

## 🔍 Verify Table Structure

```sql
-- Check users table has phone column
DESCRIBE users;

-- Check buses table has correct columns
DESCRIBE buses;

-- Should see: id, bus_no, capacity, model, current_lat, current_lng, created_at, updated_at
```

## 📊 Test Data Flow

### 1. User Registration (Frontend → Database)

When a user registers on the website:
- ✅ Data goes to: `/api/auth/signup`
- ✅ Stored in: `users` table
- ✅ Fields: name, email, password_hash, role, phone, created_at

**Test:**
1. Go to `http://localhost:8080/register`
2. Fill in registration form
3. Click "Create Account"
4. Check database:
```sql
SELECT * FROM users ORDER BY id DESC LIMIT 1;
```
You should see your new user!

### 2. User Login (Authentication)

When a user logs in:
- ✅ Endpoint: `/api/auth/login`
- ✅ Checks: `users` table for email and password
- ✅ Returns: JWT token + user data
- ✅ Token stored in: browser localStorage as `auth_token`

**Test:**
1. Go to `http://localhost:8080/login`
2. Enter email and password
3. Should redirect to dashboard
4. Open browser DevTools → Console, type:
```javascript
localStorage.getItem('auth_token')
localStorage.getItem('user')
```
Both should have values!

### 3. Role-Based Data

Depending on role selected during registration:
- **Student** → Can add data to `students` table (future feature)
- **Driver** → Can add data to `drivers` table (future feature)  
- **Admin** → Full access

## 🔧 Backend Configuration Check

### Models Imported ✅
File: `backend/main.py` (line 13-16)
```python
from models import (
    User, Driver, Student, Bus, Route, 
    BusDriver, StudentBus, Attendance
)
```

### Tables Auto-Created ✅
File: `backend/main.py` (line 23)
```python
Base.metadata.create_all(bind=engine)
```
This creates all tables automatically when backend starts!

### CORS Configured ✅
File: `backend/main.py` (line 28-41)
- Allows requests from `localhost:8080` (frontend)
- Credentials enabled for JWT tokens

## 🧪 Complete Test Sequence

### Test 1: Fresh User Registration
```
1. Register new user "Test Student" with email test@example.com
2. Check database: SELECT * FROM users WHERE email = 'test@example.com';
3. ✅ User should exist with role = 'student'
```

### Test 2: Login Test
```
1. Login with test@example.com
2. Should redirect to dashboard
3. Check browser localStorage has token
4. ✅ Login successful
```

### Test 3: Database Persistence
```
1. Close browser
2. Open again and go to http://localhost:8080
3. Should still be logged in (token persists)
4. ✅ Session maintained
```

## 🚨 Common Issues & Solutions

### Issue: "Table doesn't exist" error
**Solution:** Restart backend server
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Issue: CORS error in browser
**Solution:** Check CORS origins in `main.py` match your frontend URL

### Issue: Can't register/login
**Solution:** Check backend logs for errors:
```bash
# Look for errors in terminal where backend is running
```

### Issue: Data not saving
**Solution:** Verify database connection in `.env`:
```
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=college_bus
```

## ✅ Final Verification SQL

Run all these to confirm everything works:

```sql
USE college_bus;

-- 1. Check all tables exist
SHOW TABLES;

-- 2. Check users table is empty and ready
SELECT COUNT(*) as total_users FROM users;

-- 3. Verify table structures are correct
SHOW CREATE TABLE users;
SHOW CREATE TABLE drivers;
SHOW CREATE TABLE students;
SHOW CREATE TABLE buses;
SHOW CREATE TABLE routes;
SHOW CREATE TABLE bus_drivers;
SHOW CREATE TABLE student_bus;
SHOW CREATE TABLE attendance;

-- 4. Test insert (will be done automatically by website)
-- DO NOT RUN THIS - just for reference
-- INSERT INTO users (name, email, password_hash, role) 
-- VALUES ('Test', 'test@test.com', 'hashed_password', 'student');
```

## 🎉 Success Criteria

✅ All 8 tables exist in database
✅ Backend starts without errors
✅ Frontend can register new users
✅ Frontend can login users
✅ User data appears in `users` table
✅ No CORS errors in browser console
✅ Authentication works (redirect to dashboard)

---

**Status:** Database schema is ready! 
**Action:** Test registration and login on your website.
**Expected:** All user data will automatically store in the database.

**Last Updated:** 2025-11-01
