"""
Database Initialization Script
Creates all tables defined in models.py
"""
import sys
from database import engine, Base, DATABASE_URL
from models import User, Bus

def init_database():
    """Initialize database tables"""
    print("=== Initializing Database ===")
    print(f"Database URL: {DATABASE_URL.replace(':your_mysql_password@', ':****@')}")
    
    try:
        # Create all tables
        print("\nCreating tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully!")
        
        # List created tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n📋 Created tables: {', '.join(tables)}")
        
        print("\n✅ Database initialization complete!")
        print("\nYou can now start the backend server with:")
        print("  python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPlease check:")
        print("  1. MySQL is running")
        print("  2. Database 'college_bus' exists")
        print("  3. DB_PASSWORD in .env is correct")
        sys.exit(1)

if __name__ == "__main__":
    init_database()

