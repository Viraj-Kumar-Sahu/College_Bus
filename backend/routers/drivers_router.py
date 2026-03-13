# routers/drivers_router.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Driver, BusDriver
from schemas import DriverCreate, DriverOut, AdminDriverCreate
from typing import Generator, List, Optional
from auth_utils import hash_password, decode_token
import secrets, string

router = APIRouter(prefix="/drivers", tags=["drivers"])

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

@router.get("/", response_model=List[dict])
def get_all_drivers(db: Session = Depends(get_db)):
    """Get all drivers with their user info"""
    drivers = db.query(User).filter(User.role == "driver").all()
    result = []
    for user in drivers:
        driver_info = db.query(Driver).filter(Driver.id == user.id).first()
        bus_assignment = db.query(BusDriver).filter(BusDriver.driver_id == user.id).first()
        
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "license_no": driver_info.license_no if driver_info else None,
            "contact": driver_info.contact if driver_info else None,
            "bus_id": bus_assignment.bus_id if bus_assignment else None,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    return result

@router.post("/", response_model=dict)
def create_driver(payload: AdminDriverCreate, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Admin: Create a new driver (user + driver profile, optional bus assignment)"""
    current = get_current_user(authorization, db)
    if current.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create drivers")

    # Handle existing user by email
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        # If user exists with driver role, reuse and update basic fields
        if existing_user.role == "driver":
            u = existing_user
            # Update optional fields
            u.name = payload.name or u.name
        else:
            # Convert role to driver (admin action)
            u = existing_user
            u.role = "driver"
            u.name = payload.name or u.name
        db.commit()
        db.refresh(u)
    else:
        # Create new driver user
        temp_pwd = None
        gen_pwd = payload.password or ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
        if not payload.password:
            temp_pwd = gen_pwd  # remember generated password to return to admin
        u = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(gen_pwd),
            role="driver",
        )
        db.add(u)
        db.commit()
        db.refresh(u)

    # Upsert driver profile
    d = db.query(Driver).filter(Driver.id == u.id).first()
    if d:
        d.license_no = payload.license_no if payload.license_no is not None else d.license_no
        d.name = payload.name or d.name
        d.contact = payload.contact or payload.phone or d.contact
    else:
        d = Driver(
            id=u.id,
            license_no=payload.license_no,
            name=payload.name,
            contact=payload.contact or payload.phone,
        )
        db.add(d)
    if payload.bus_id:
        assignment = db.query(BusDriver).filter(BusDriver.driver_id == u.id).first()
        if assignment:
            assignment.bus_id = payload.bus_id
        else:
            db.add(BusDriver(driver_id=u.id, bus_id=payload.bus_id))

    db.commit()

    bus_assignment = db.query(BusDriver).filter(BusDriver.driver_id == u.id).first()

    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "license_no": d.license_no,
        "contact": d.contact,
        "bus_id": bus_assignment.bus_id if bus_assignment else None,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        # Only present when password was auto-generated (admin sees it once)
        "temporary_password": locals().get("temp_pwd", None),
    }

@router.get("/{driver_id}", response_model=dict)
def get_driver(driver_id: int, db: Session = Depends(get_db)):
    """Get a specific driver by ID"""
    user = db.query(User).filter(User.id == driver_id, User.role == "driver").first()
    if not user:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    driver_info = db.query(Driver).filter(Driver.id == driver_id).first()
    bus_assignment = db.query(BusDriver).filter(BusDriver.driver_id == driver_id).first()
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "license_no": driver_info.license_no if driver_info else None,
        "contact": driver_info.contact if driver_info else None,
        "bus_id": bus_assignment.bus_id if bus_assignment else None,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@router.put("/{driver_id}", response_model=dict)
def update_driver(driver_id: int, data: DriverCreate, db: Session = Depends(get_db)):
    """Update driver information"""
    user = db.query(User).filter(User.id == driver_id, User.role == "driver").first()
    if not user:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Update or create driver info
    driver_info = db.query(Driver).filter(Driver.id == driver_id).first()
    if driver_info:
        driver_info.license_no = data.license_no
        driver_info.name = data.name or driver_info.name
        driver_info.contact = data.contact or driver_info.contact
    else:
        driver_info = Driver(
            id=driver_id,
            license_no=data.license_no,
            name=data.name,
            contact=data.contact,
        )
        db.add(driver_info)
    
    db.commit()
    db.refresh(driver_info)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "license_no": driver_info.license_no,
        "contact": driver_info.contact,
    }

@router.post("/{driver_id}/assign-bus/{bus_id}")
def assign_driver_to_bus(driver_id: int, bus_id: int, db: Session = Depends(get_db)):
    """Assign a driver to a bus"""
    # Check if driver exists
    user = db.query(User).filter(User.id == driver_id, User.role == "driver").first()
    if not user:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Check if already assigned
    existing = db.query(BusDriver).filter(BusDriver.driver_id == driver_id).first()
    if existing:
        existing.bus_id = bus_id
    else:
        assignment = BusDriver(driver_id=driver_id, bus_id=bus_id)
        db.add(assignment)
    
    db.commit()

    # Sync legacy drivers.route and route_name and set buses.driver_id
    try:
        from sqlalchemy import text
        from database import engine
        with engine.begin() as conn:
            row = conn.execute(text("SELECT id, name FROM routes WHERE bus_id=:bid LIMIT 1"), {"bid": bus_id}).first()
            rid = row[0] if row else None
            rname = row[1] if row else None
            conn.execute(text("UPDATE drivers SET route=:rid, route_name=:rname WHERE id=:did"), {"rid": rid, "rname": rname, "did": driver_id})
            conn.execute(text("UPDATE buses SET driver_id=:did WHERE id=:bid"), {"did": driver_id, "bid": bus_id})
    except Exception:
        pass

    return {"message": "Driver assigned to bus successfully"}

@router.delete("/{driver_id}")
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    """Delete a driver and dependent records to satisfy FK constraints."""
    user = db.query(User).filter(User.id == driver_id, User.role == "driver").first()
    if not user:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Remove any bus assignments and driver profile explicitly
    db.query(BusDriver).filter(BusDriver.driver_id == driver_id).delete(synchronize_session=False)
    db.query(Driver).filter(Driver.id == driver_id).delete(synchronize_session=False)
    
    db.delete(user)
    db.commit()
    return {"message": "Driver deleted successfully"}
