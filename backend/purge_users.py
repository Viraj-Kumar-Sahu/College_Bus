# purge_users.py
from sqlalchemy import text
from database import engine

# This script removes all users and related user-linked records.
# It disables FK checks, truncates dependent tables, then re-enables FK checks.

TABLES_IN_DELETE_ORDER = [
    "attendance",
    "student_bus",
    "bus_drivers",
    "students",
    "drivers",
    "users",
]

if __name__ == "__main__":
    with engine.begin() as conn:
        # Disable FK checks to allow truncation in any order
        conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        for t in TABLES_IN_DELETE_ORDER:
            conn.execute(text(f"TRUNCATE TABLE {t}"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))
    print("All users and related records have been removed.")
