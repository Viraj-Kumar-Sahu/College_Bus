# Database Migration Guide

## Overview
This guide explains how to migrate your existing database to the new enhanced schema that includes:
- **Drivers** table for driver-specific information
- **Students** table for student-specific information  
- **Routes** table for bus routes
- **BusDriver** table for bus-to-driver assignments
- **StudentBus** table for student-to-bus assignments
- **Attendance** table for tracking student attendance

## Before You Start

### ⚠️ IMPORTANT: Backup Your Database
```sql
-- MySQL backup command
mysqldump -u root -p college_bus > backup_$(date +%Y%m%d_%H%M%S).sql

-- Or using MySQL Workbench: Server -> Data Export
```

## Migration Steps

### Step 1: Stop the Backend Server
Make sure your FastAPI backend is not running during migration.

### Step 2: Run the Migration Script
```bash
cd backend
python migrate_database.py
```

The script will:
1. Add `phone` column to `users` table
2. Rename `bus_number` to `bus_no` in `buses` table
3. Add `model` and `created_at` columns to `buses` table
4. Create new tables: `drivers`, `students`, `routes`, `bus_drivers`, `student_bus`, `attendance`

### Step 3: Verify Migration
Check that all tables were created successfully:
```sql
SHOW TABLES;
```

You should see:
- users
- drivers
- students
- buses
- routes
- bus_drivers
- student_bus
- attendance

### Step 4: Restart Backend
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## New Schema Details

### Updated Tables

#### `users` table
- Added: `phone VARCHAR(20)` - Optional phone number

#### `buses` table
- Renamed: `bus_number` → `bus_no`
- Added: `model VARCHAR(100)` - Bus model
- Added: `created_at TIMESTAMP` - Creation timestamp
- Kept: `driver_id` for backward compatibility (use `bus_drivers` table for new assignments)

### New Tables

#### `drivers` table
```sql
- id (FK to users.id)
- license_no VARCHAR(100)
- vehicle_experience INT
```

#### `students` table
```sql
- id (FK to users.id)
- roll_no VARCHAR(50)
- class VARCHAR(50)
- parent_contact VARCHAR(20)
```

#### `routes` table
```sql
- id
- name VARCHAR(100)
- path TEXT (JSON array of coordinates)
- created_at TIMESTAMP
- bus_id (FK to buses.id)
```

#### `bus_drivers` table
```sql
- id
- bus_id (FK to buses.id)
- driver_id (FK to users.id)
- assigned_at TIMESTAMP
```

#### `student_bus` table
```sql
- id
- student_id (FK to users.id)
- bus_id (FK to buses.id)
- assigned_at TIMESTAMP
```

#### `attendance` table
```sql
- id
- student_id (FK to users.id)
- bus_id INT
- status ENUM('present', 'absent')
- marked_at TIMESTAMP
```

## API Compatibility

The migration maintains backward compatibility:
- API still returns `bus_number` field (mapped from `bus_no`)
- Existing authentication and user management works unchanged
- All existing routes continue to function

## Rollback Instructions

If you need to rollback:
```sql
-- Restore from backup
mysql -u root -p college_bus < backup_YYYYMMDD_HHMMSS.sql
```

## Testing After Migration

1. **Test User Registration**: Create a new student/driver account
2. **Test Login**: Verify authentication still works
3. **Test Bus Listing**: Check `/api/buses` endpoint
4. **Check New Tables**: Verify new tables are accessible

## Common Issues

### Issue: Migration script fails with "column already exists"
**Solution**: The script is idempotent. If it partially completed, just run it again.

### Issue: Foreign key constraint error
**Solution**: Make sure you have no orphaned records. Check:
```sql
-- Find users without valid roles
SELECT * FROM users WHERE role NOT IN ('admin', 'driver', 'student');
```

### Issue: Backend won't start after migration
**Solution**: Check for import errors in models.py. Make sure all relationships are correctly defined.

## Next Steps

After successful migration:
1. Test all existing functionality
2. Start using new tables for enhanced features
3. Implement new endpoints for drivers, students, routes, etc.
4. Update frontend to utilize new features

## Support

If you encounter any issues during migration:
1. Check the error message carefully
2. Verify your database backup exists
3. Review the migration script logs
4. Check database connection settings in `.env`

---

**Last Updated**: 2025-11-01
