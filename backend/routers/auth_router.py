# routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal
from models import User, Student, Driver
from schemas import RegisterIn, LoginIn, UserOut, ResetPasswordIn
from auth_utils import hash_password, verify_password, create_access_token, decode_token
from typing import Generator, Optional

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup", response_model=dict)
def signup(user: RegisterIn, db: Session = Depends(get_db)):
    email_norm = user.email.strip().lower()
    existing = db.query(User).filter(User.email == email_norm).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    u = User(
        name=user.name.strip(),
        email=email_norm,
        password_hash=hashed,
        role=user.role if user.role else "student",
    )
    db.add(u)
    db.commit()
    db.refresh(u)

    # Auto-create profile row based on role for consistency with listings
    try:
        if u.role == "student" and not db.query(Student).filter(Student.id == u.id).first():
            db.add(Student(id=u.id, roll_no=None, name=u.name, contact=None))
        if u.role == "driver" and not db.query(Driver).filter(Driver.id == u.id).first():
            db.add(Driver(id=u.id, license_no=None, name=u.name, contact=None))
        db.commit()
    except Exception:
        db.rollback()

    # Auto login: create JWT token right after signup
    token = create_access_token({"id": u.id, "role": u.role})

    return {
        "token": token,
        "user": {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role
        }
    }

@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    try:
        email_norm = payload.email.strip().lower()
        user = db.query(User).filter(User.email == email_norm).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Primary check against bcrypt hash
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

        ok = verify_password(payload.password, _to_text(user.password_hash) if user.password_hash else "")

        # Fallback 1: legacy plaintext stored in password_hash (rehash and save)
        if not ok and user.password_hash:
            ph = _to_text(user.password_hash)
            if not ph.startswith("$2") and ph == payload.password:
                user.password_hash = hash_password(payload.password)
                db.commit()
                ok = True

        # Fallback 2: legacy 'password' column still present in DB
        if not ok:
            try:
                row = db.execute(text("SELECT password FROM users WHERE id = :uid"), {"uid": user.id}).fetchone()
                if row and row[0]:
                    legacy = _to_text(row[0])
                    if legacy.startswith("$2"):
                        ok = verify_password(payload.password, legacy)
                    else:
                        ok = (legacy == payload.password)
                    if ok:
                        # Persist proper bcrypt hash
                        user.password_hash = hash_password(payload.password)
                        db.commit()
            except Exception:
                pass

        if not ok:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Ensure profile row exists if created before this feature
        try:
            if user.role == "student" and not db.query(Student).filter(Student.id == user.id).first():
                db.add(Student(id=user.id, roll_no=None, name=user.name, contact=None))
            if user.role == "driver" and not db.query(Driver).filter(Driver.id == user.id).first():
                db.add(Driver(id=user.id, license_no=None, name=user.name, contact=None))
            db.commit()
        except Exception:
            db.rollback()

        token = create_access_token({"id": user.id, "role": user.role})
        user_out = {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
        return {"token": token, "user": user_out}
    except HTTPException:
        # propagate intentional HTTP errors
        raise
    except Exception as e:
        import logging, traceback
        logging.exception("Login failed: %s", e)
        raise HTTPException(status_code=500, detail="Login failed")

@router.get("/me")
def me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    parts = authorization.split()
    token = parts[1] if len(parts) > 1 else parts[0]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@router.post("/admin/reset-password")
def admin_reset_password(payload: ResetPasswordIn, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    parts = authorization.split()
    token = parts[1] if len(parts) > 1 else parts[0]
    auth = decode_token(token)
    if not auth:
        raise HTTPException(status_code=401, detail="Invalid token")
    admin = db.query(User).filter(User.id == auth.get("id")).first()
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can reset passwords")

    email_norm = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email_norm).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated"}
