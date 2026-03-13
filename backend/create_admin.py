# create_admin.py
"""
Create or update a default admin user for local development.
Usage:
    python create_admin.py [email] [password]
Defaults:
    email=admin@example.com, password=admin123
"""
import sys
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from auth_utils import hash_password


def ensure_admin(email: str, password: str) -> None:
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.role = "admin"
            user.password_hash = hash_password(password)
            if not user.name:
                user.name = "Admin"
            db.add(user)
            db.commit()
            print(f"✅ Updated existing user '{email}' to admin with a new password.")
        else:
            user = User(
                name="Admin",
                email=email,
                role="admin",
                password_hash=hash_password(password),
            )
            db.add(user)
            db.commit()
            print(f"✅ Created admin user '{email}'.")
        print("You can now log in with these credentials in the UI.")
    finally:
        db.close()


if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "admin@example.com"
    password = sys.argv[2] if len(sys.argv) > 2 else "admin123"
    ensure_admin(email, password)
