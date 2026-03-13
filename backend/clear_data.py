# clear_data.py
"""
Clear all application data (rows) without dropping tables.
This truncates tables in a safe order with foreign key checks disabled.

Usage:
    python clear_data.py
"""
from sqlalchemy import text
from database import engine

TABLES_IN_DELETE_ORDER = [
    # child tables first
    "attendance",
    "student_bus",
    "bus_drivers",
    # tables with FKs to each other; order doesn't matter when FK checks are off
    "routes",
    "buses",
    # profile tables
    "students",
    "drivers",
    # root table last
    "users",
]

if __name__ == "__main__":
    with engine.begin() as conn:
        # Determine existing tables to avoid errors if some tables are missing
        dbname = engine.url.database
        existing = set(
            r[0]
            for r in conn.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = :db"),
                {"db": dbname},
            )
        )

        # Disable FK checks, truncate existing tables, re-enable FK checks
        conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        for t in TABLES_IN_DELETE_ORDER:
            if t in existing:
                conn.execute(text(f"TRUNCATE TABLE `{t}`"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))
    print("✅ All data cleared. Tables remain intact.")
