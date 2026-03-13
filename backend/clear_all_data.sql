-- Clear All Data from Campus Track Database
-- This script removes all data but keeps the table structure intact
-- Run this to reset the database for a fresh demo

USE college_bus;

-- Disable foreign key checks temporarily to avoid constraint errors
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all tables in the correct order
TRUNCATE TABLE attendance;
TRUNCATE TABLE student_bus;
TRUNCATE TABLE bus_drivers;
TRUNCATE TABLE students;
TRUNCATE TABLE drivers;
TRUNCATE TABLE buses;
TRUNCATE TABLE routes;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify all tables are empty
SELECT 'users' AS table_name, COUNT(*) AS remaining_records FROM users
UNION ALL
SELECT 'drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'buses', COUNT(*) FROM buses
UNION ALL
SELECT 'routes', COUNT(*) FROM routes
UNION ALL
SELECT 'bus_drivers', COUNT(*) FROM bus_drivers
UNION ALL
SELECT 'student_bus', COUNT(*) FROM student_bus
UNION ALL
SELECT 'attendance', COUNT(*) FROM attendance;

SELECT 'Database cleared successfully! Ready for fresh signups.' AS status;
