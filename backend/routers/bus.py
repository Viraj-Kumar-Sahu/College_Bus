# routers/buses_router.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import SessionLocal   # ✅ Fixed import
from models import Bus, User
from typing import List, Optional
from datetime import datetime
from auth_utils import decode_token

router = APIRouter(prefix="/buses", tags=["buses"])

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility to extract current logged-in user
def get_current_user(authorization: Optional[str], db: Session):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1] if " " in authorization else authorization
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("id")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ✅ Admin can create new bus
@router.post("/", response_model=dict)
def create_bus(
    bus_number: str,
    route: Optional[str] = None,
    capacity: Optional[int] = 40,
    driver_id: Optional[int] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = get_current_user(authorization, db)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create buses")
    
    existing = db.query(Bus).filter(Bus.bus_number == bus_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bus number already exists")
    
    b = Bus(bus_number=bus_number, route=route, capacity=capacity, driver_id=driver_id)
    db.add(b)
    db.commit()
    db.refresh(b)
    return {"id": b.id, "bus_number": b.bus_number}

# ✅ Anyone (admin/student) can list all buses
@router.get("/", response_model=List[dict])
def list_buses(db: Session = Depends(get_db)):
    buses = db.query(Bus).all()
    result = []
    for b in buses:
        result.append({
            "id": b.id,
            "bus_number": b.bus_number,
            "route": b.route,
            "capacity": b.capacity,
            "current_lat": b.current_lat,
            "current_lng": b.current_lng,
            "driver_id": b.driver_id
        })
    return result

# ✅ Only driver or admin can update location
@router.post("/{bus_id}/location")
def update_location(
    bus_id: int,
    lat: float,
    lng: float,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = get_current_user(authorization, db)
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    if not (user.role == "admin" or (user.role == "driver" and bus.driver_id == user.id)):
        raise HTTPException(status_code=403, detail="Not authorized to update this bus")
    
    bus.current_lat = lat
    bus.current_lng = lng
    bus.updated_at = datetime.utcnow()
    db.add(bus)
    db.commit()
    db.refresh(bus)
    return {"ok": True, "bus_id": bus.id, "updated_at": str(bus.updated_at)}
