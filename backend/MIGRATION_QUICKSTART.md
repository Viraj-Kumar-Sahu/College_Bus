# 🚀 Database Migration - Quick Start

## What Changed?

✅ **Updated `models.py`** with new schema including:
- `drivers` table (license_no, vehicle_experience)
- `students` table (roll_no, class, parent_contact)
- `routes` table (name, path)
- `bus_drivers` table (bus-to-driver assignments)
- `student_bus` table (student-to-bus assignments)
- `attendance` table (student attendance tracking)

✅ **Updated `buses_router.py`** to handle renamed column `bus_no`

✅ **Created `migrate_database.py`** - Safe migration script

## Run Migration (3 Steps)

### 1️⃣ Backup Database (IMPORTANT!)
```bash
mysqldump -u root -p college_bus > backup.sql
```

### 2️⃣ Stop Backend Server
Press `Ctrl+C` in the terminal running your backend.

### 3️⃣ Run Migration
```bash
cd backend
python migrate_database.py
```
Press Enter when prompted to proceed.

## What Happens?

The migration script will:
1. ✅ Add `phone` column to `users` table
2. ✅ Rename `bus_number` → `bus_no` in `buses` table  
3. ✅ Add `model` and `created_at` to `buses` table
4. ✅ Create 6 new tables (drivers, students, routes, bus_drivers, student_bus, attendance)

## After Migration

### Start Backend
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Test Your Website
1. ✅ Login/Register should work as before
2. ✅ All existing features remain functional
3. ✅ No data loss - all users, buses preserved

## Important Notes

- ⚠️ **The migration is SAFE** - it only adds new tables and columns
- ⚠️ **No data is deleted** - all existing users, buses, etc. are preserved
- ⚠️ **Backward compatible** - API returns both `bus_number` and `bus_no`
- ⚠️ **Can run multiple times** - Script checks if changes already exist

## If Something Goes Wrong

Restore from backup:
```bash
mysql -u root -p college_bus < backup.sql
```

## Verify Migration Success

After migration, check tables exist:
```sql
USE college_bus;
SHOW TABLES;
```

You should see 8 tables:
- users ✅
- buses ✅
- drivers ✅ (NEW)
- students ✅ (NEW)
- routes ✅ (NEW)
- bus_drivers ✅ (NEW)
- student_bus ✅ (NEW)
- attendance ✅ (NEW)

---

**Ready?** Run the 3 steps above! Your website will continue working normally. 🎉
