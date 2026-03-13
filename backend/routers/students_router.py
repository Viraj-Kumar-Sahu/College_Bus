# routers/students_router.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Student, StudentBus
from schemas import StudentCreate, StudentOut, AdminStudentCreate
from typing import Generator, List, Optional
from auth_utils import hash_password, decode_token
import secrets, string

router = APIRouter(prefix="/students", tags=["students"])

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
def get_all_students(db: Session = Depends(get_db)):
    """Get all students with their user info"""
    students = db.query(User).filter(User.role == "student").all()
    result = []
    for user in students:
        student_info = db.query(Student).filter(Student.id == user.id).first()
        bus_assignment = db.query(StudentBus).filter(StudentBus.student_id == user.id).first()
        
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "roll_no": student_info.roll_no if student_info else None,
            "contact": student_info.contact if student_info else None,
            "bus_id": bus_assignment.bus_id if bus_assignment else None,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    return result

@router.post("/", response_model=dict)
def create_student(payload: AdminStudentCreate, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Admin: Create a new student (user + student profile, optional bus assignment)"""
    current = get_current_user(authorization, db)
    if current.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create students")

    # Ensure email unique
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

# Generate password if not provided (UI doesn't collect it)
    temp_pwd = None
    gen_pwd = payload.password or ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
    if not payload.password:
        temp_pwd = gen_pwd  # remember generated password to return to admin

    u = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(gen_pwd),
        role="student",
    )
    db.add(u)
    db.commit()
    db.refresh(u)

    s = Student(
        id=u.id,
        roll_no=payload.roll_no,
        name=payload.name,
        contact=payload.contact or payload.phone,
    )
    db.add(s)

    if payload.bus_id:
        assignment = db.query(StudentBus).filter(StudentBus.student_id == u.id).first()
        if assignment:
            assignment.bus_id = payload.bus_id
        else:
            db.add(StudentBus(student_id=u.id, bus_id=payload.bus_id))

    db.commit()

    bus_assignment = db.query(StudentBus).filter(StudentBus.student_id == u.id).first()

    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "roll_no": s.roll_no,
        "contact": s.contact,
        "bus_id": bus_assignment.bus_id if bus_assignment else None,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        # Only present when password was auto-generated (admin sees it once)
        "temporary_password": locals().get("temp_pwd", None),
    }

@router.get("/{student_id}", response_model=dict)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a specific student by ID"""
    user = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_info = db.query(Student).filter(Student.id == student_id).first()
    bus_assignment = db.query(StudentBus).filter(StudentBus.student_id == student_id).first()
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "roll_no": student_info.roll_no if student_info else None,
        "contact": student_info.contact if student_info else None,
        "bus_id": bus_assignment.bus_id if bus_assignment else None,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@router.put("/{student_id}", response_model=dict)
def update_student(student_id: int, data: StudentCreate, db: Session = Depends(get_db)):
    """Update student information"""
    user = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Update or create student info
    student_info = db.query(Student).filter(Student.id == student_id).first()
    if student_info:
        student_info.roll_no = data.roll_no
        student_info.name = data.name or student_info.name
        student_info.contact = data.contact or student_info.contact
    else:
        student_info = Student(
            id=student_id,
            roll_no=data.roll_no,
            name=data.name,
            contact=data.contact,
        )
        db.add(student_info)
    
    db.commit()
    db.refresh(student_info)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "roll_no": student_info.roll_no,
        "contact": student_info.contact,
    }

@router.post("/{student_id}/assign-bus/{bus_id}")
def assign_student_to_bus(student_id: int, bus_id: int, db: Session = Depends(get_db)):
    """Assign a student to a bus"""
    # Check if student exists
    user = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if already assigned
    existing = db.query(StudentBus).filter(StudentBus.student_id == student_id).first()
    if existing:
        existing.bus_id = bus_id
    else:
        assignment = StudentBus(student_id=student_id, bus_id=bus_id)
        db.add(assignment)
    
    db.commit()

    # Sync legacy students.route and route_name with the bus's current route (if any)
    try:
        from sqlalchemy import text
        from database import engine
        with engine.begin() as conn:
            row = conn.execute(text("SELECT id, name FROM routes WHERE bus_id=:bid LIMIT 1"), {"bid": bus_id}).first()
            rid = row[0] if row else None
            rname = row[1] if row else None
            conn.execute(text("UPDATE students SET route=:rid, route_name=:rname WHERE id=:sid"), {"rid": rid, "rname": rname, "sid": student_id})
    except Exception:
        pass

    return {"message": "Student assigned to bus successfully"}

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student and all dependent records to satisfy FK constraints."""
    user = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Delete dependent rows explicitly (in case ON DELETE CASCADE isn't enforced)
    db.query(StudentBus).filter(StudentBus.student_id == student_id).delete(synchronize_session=False)
    db.query(Student).filter(Student.id == student_id).delete(synchronize_session=False)
    
    db.delete(user)
    db.commit()
    return {"message": "Student deleted successfully"}
