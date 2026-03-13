from sqlalchemy import text
from sqlalchemy.engine import Engine
from auth_utils import hash_password


def run_migrations(engine: Engine) -> None:
    """
    Lightweight, idempotent migrations without using MySQL "IF NOT EXISTS" in ALTER
    so it works across more MySQL versions.
    """
    with engine.begin() as conn:
        # Helper: does column exist?
        def column_exists(table: str, column: str) -> bool:
            q = text(
                """
                SELECT COUNT(*) AS cnt
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = :t
                  AND COLUMN_NAME = :c
                """
            )
            return bool(conn.execute(q, {"t": table, "c": column}).scalar())

        # Helper: does FK exist by name?
        def fk_exists(constraint_name: str) -> bool:
            q = text(
                """
                SELECT COUNT(*)
                FROM information_schema.REFERENTIAL_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = DATABASE()
                  AND CONSTRAINT_NAME = :n
                """
            )
            return bool(conn.execute(q, {"n": constraint_name}).scalar())

        # --- USERS: ensure password_hash exists and backfill from legacy password column ---
        if not column_exists("users", "password_hash"):
            conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL"))

        def _to_text(val):
            if isinstance(val, (bytes, bytearray)):
                try:
                    return val.decode("utf-8")
                except Exception:
                    try:
                        return val.decode("latin1")
                    except Exception:
                        return str(val)
            return str(val) if val is not None else ""

        # Strategy 1: Backfill from 'password' column if it exists
        if column_exists("users", "password"):
            rows = conn.execute(text(
                "SELECT id, password FROM users WHERE (password_hash IS NULL OR password_hash = '') AND password IS NOT NULL"
            ))
            for row in rows:
                uid = row[0]
                pwd_val = _to_text(row[1])
                if not pwd_val:
                    continue
                # If value looks like bcrypt ('$2') use as-is, else hash it
                if pwd_val.startswith("$2"):
                    new_hash = pwd_val
                else:
                    new_hash = hash_password(pwd_val)
                conn.execute(text("UPDATE users SET password_hash = :h WHERE id = :i"), {"h": new_hash, "i": uid})

        # Strategy 2: For any remaining users with empty password_hash, set a default
        remaining = conn.execute(text(
            "SELECT id, email FROM users WHERE password_hash IS NULL OR password_hash = ''"
        ))
        for row in remaining:
            uid = row[0]
            email = _to_text(row[1])
            # Use email as default password and hash it
            default_pwd = email.split('@')[0] if '@' in email else 'password123'
            new_hash = hash_password(default_pwd)
            conn.execute(text("UPDATE users SET password_hash = :h WHERE id = :i"), {"h": new_hash, "i": uid})

        # users: drop legacy phone column if present
        try:
            if column_exists("users", "phone"):
                conn.execute(text("ALTER TABLE users DROP COLUMN phone"))
        except Exception:
            pass

        # drivers: ensure columns and correct naming to match models (route, not route_id)
        if not column_exists("drivers", "name"):
            conn.execute(text("ALTER TABLE drivers ADD COLUMN name VARCHAR(100) NULL"))
        if not column_exists("drivers", "contact"):
            conn.execute(text("ALTER TABLE drivers ADD COLUMN contact VARCHAR(20) NULL"))
        # Rename route_id -> route if present
        if column_exists("drivers", "route_id") and not column_exists("drivers", "route"):
            try:
                conn.execute(text("ALTER TABLE drivers CHANGE COLUMN route_id route INT NULL"))
            except Exception:
                pass
        if not column_exists("drivers", "route"):
            conn.execute(text("ALTER TABLE drivers ADD COLUMN route INT NULL"))

        # students: ensure route column name
        if column_exists("students", "route_id") and not column_exists("students", "route"):
            try:
                conn.execute(text("ALTER TABLE students CHANGE COLUMN route_id route INT NULL"))
            except Exception:
                pass
        if not column_exists("students", "route"):
            conn.execute(text("ALTER TABLE students ADD COLUMN route INT NULL"))

        # Add FKs (ignore if already exist)
        if not fk_exists("fk_drivers_route"):
            try:
                conn.execute(text(
                    "ALTER TABLE drivers ADD CONSTRAINT fk_drivers_route FOREIGN KEY (route) REFERENCES routes(id) ON DELETE SET NULL"
                ))
            except Exception:
                pass
        if not fk_exists("fk_students_route"):
            try:
                conn.execute(text(
                    "ALTER TABLE students ADD CONSTRAINT fk_students_route FOREIGN KEY (route) REFERENCES routes(id) ON DELETE SET NULL"
                ))
            except Exception:
                pass

        # --- Add denormalized route_name columns for compatibility (VARCHAR) ---
        if not column_exists("buses", "route_name"):
            try:
                conn.execute(text("ALTER TABLE buses ADD COLUMN route_name VARCHAR(150) NULL"))
            except Exception:
                pass
        if not column_exists("drivers", "route_name"):
            try:
                conn.execute(text("ALTER TABLE drivers ADD COLUMN route_name VARCHAR(150) NULL"))
            except Exception:
                pass
        if not column_exists("students", "route_name"):
            try:
                conn.execute(text("ALTER TABLE students ADD COLUMN route_name VARCHAR(150) NULL"))
            except Exception:
                pass
