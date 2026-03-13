# migrate_database.py
"""
Database migration script to update schema to new structure.
Run this ONCE to migrate from old schema to new schema.
"""
from sqlalchemy import create_engine, text, inspect
from database import DATABASE_URL, Base
from models import User, Driver, Student, Bus, Route, BusDriver, StudentBus, Attendance
import sys

def check_column_exists(engine, table_name, column_name):
    """Check if a column exists in a table"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def check_table_exists(engine, table_name):
    """Check if a table exists"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()

def migrate_database():
    print("Starting database migration...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Step 1: Add new columns to users table if they don't exist
            print("\n1. Updating users table...")
            if check_table_exists(engine, 'users'):
                if not check_column_exists(engine, 'users', 'phone'):
                    conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(20)"))
                    conn.commit()
                    print("   ✓ Added 'phone' column to users table")
                else:
                    print("   - 'phone' column already exists")
            
            # Step 2: Rename bus_number to bus_no in buses table if needed
            print("\n2. Updating buses table...")
            if check_table_exists(engine, 'buses'):
                if check_column_exists(engine, 'buses', 'bus_number') and not check_column_exists(engine, 'buses', 'bus_no'):
                    conn.execute(text("ALTER TABLE buses CHANGE COLUMN bus_number bus_no VARCHAR(50)"))
                    conn.commit()
                    print("   ✓ Renamed 'bus_number' to 'bus_no' in buses table")
                elif check_column_exists(engine, 'buses', 'bus_no'):
                    print("   - 'bus_no' column already exists")
                
                # Add model column if it doesn't exist
                if not check_column_exists(engine, 'buses', 'model'):
                    conn.execute(text("ALTER TABLE buses ADD COLUMN model VARCHAR(100)"))
                    conn.commit()
                    print("   ✓ Added 'model' column to buses table")
                else:
                    print("   - 'model' column already exists")
                
                # Add created_at if it doesn't exist
                if not check_column_exists(engine, 'buses', 'created_at'):
                    conn.execute(text("ALTER TABLE buses ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
                    conn.commit()
                    print("   ✓ Added 'created_at' column to buses table")
                else:
                    print("   - 'created_at' column already exists")
                
                # Remove old driver_id foreign key if it exists
                if check_column_exists(engine, 'buses', 'driver_id'):
                    print("   - Keeping 'driver_id' for backward compatibility (will use bus_drivers for new assignments)")
            
            # Step 3: Students table column renames
            print("\n3. Updating students table...")
            if check_table_exists(engine, 'students'):
                # Rename class_name -> student_name
                if check_column_exists(engine, 'students', 'class_name') and not check_column_exists(engine, 'students', 'student_name'):
                    conn.execute(text("ALTER TABLE students CHANGE COLUMN class_name student_name VARCHAR(100)"))
                    conn.commit()
                    print("   ✓ Renamed 'class_name' to 'student_name'")
                else:
                    print("   - 'student_name' already present or 'class_name' absent")
                # Rename parent_contact -> student_contact
                if check_column_exists(engine, 'students', 'parent_contact') and not check_column_exists(engine, 'students', 'student_contact'):
                    conn.execute(text("ALTER TABLE students CHANGE COLUMN parent_contact student_contact VARCHAR(20)"))
                    conn.commit()
                    print("   ✓ Renamed 'parent_contact' to 'student_contact'")
                else:
                    print("   - 'student_contact' already present or 'parent_contact' absent")

            # Step 4: Create new tables using SQLAlchemy
            print("\n4. Creating new tables...")
            Base.metadata.create_all(bind=engine)
            print("   ✓ All new tables created (drivers, students, routes, bus_drivers, student_bus, attendance)")
            
            print("\n✅ Database migration completed successfully!")
            print("\nNOTE: The 'buses.driver_id' column is kept for backward compatibility.")
            print("New driver assignments should use the 'bus_drivers' table.")
            
        except Exception as e:
            print(f"\n❌ Migration failed: {str(e)}")
            conn.rollback()
            sys.exit(1)

if __name__ == "__main__":
    print("=" * 60)
    print("DATABASE MIGRATION SCRIPT")
    print("=" * 60)
    print("\nThis script will update your database schema.")
    print("Make sure you have a backup of your database before proceeding!")
    print("\nPress Ctrl+C to cancel, or Enter to continue...")
    
    try:
        input()
        migrate_database()
    except KeyboardInterrupt:
        print("\n\n❌ Migration cancelled by user.")
        sys.exit(0)
