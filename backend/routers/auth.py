# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from schemas import RegisterIn, LoginIn, UserOut
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
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    u = User(
        name=user.name,
        email=user.email,
        password_hash=hashed,
        role=user.role or "student"
    )
    db.add(u)
    db.commit()
    db.refresh(u)

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
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"id": user.id, "role": user.role})
    user_out = {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    return {"token": token, "user": user_out}

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
