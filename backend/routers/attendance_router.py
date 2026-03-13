# routers/attendance_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal, engine
from models import Attendance, User
from schemas import AttendanceCreate, AttendanceOut
from typing import Generator, List
from datetime import datetime, date
from sqlalchemy import text

router = APIRouter(prefix="/attendance", tags=["attendance"])

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[dict])
def get_all_attendance(db: Session = Depends(get_db), date_filter: str = None):
    """Get all attendance records, optionally filtered by date"""
    query = db.query(Attendance).join(User, Attendance.student_id == User.id)
    
    if date_filter:
        try:
            filter_date = datetime.strptime(date_filter, "%Y-%m-%d").date()
            query = query.filter(func.date(Attendance.marked_at) == filter_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    attendance_records = query.all()
    result = []
    
    for record in attendance_records:
        student = db.query(User).filter(User.id == record.student_id).first()
        result.append({
            "id": record.id,
            "student_id": record.student_id,
            "student_name": student.name if student else "Unknown",
            "bus_id": record.bus_id,
            "status": record.status,
            "marked_at": record.marked_at.isoformat() if record.marked_at else None
        })
    
    return result

@router.get("/student/{student_id}", response_model=List[dict])
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    """Get attendance records for a specific student"""
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    return [
        {
            "id": r.id,
            "student_id": r.student_id,
            "bus_id": r.bus_id,
            "status": r.status,
            "marked_at": r.marked_at.isoformat() if r.marked_at else None
        }
        for r in records
    ]

@router.post("/", response_model=dict)
def mark_attendance(attendance_data: AttendanceCreate, db: Session = Depends(get_db)):
    """Mark student attendance"""
    # Check if student exists
    student = db.query(User).filter(User.id == attendance_data.student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if already marked today
    today = date.today()
    existing = db.query(Attendance).filter(
        Attendance.student_id == attendance_data.student_id,
        func.date(Attendance.marked_at) == today
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for today")
    
    # Insert using raw SQL to avoid ORM/table sync edge cases
    with engine.begin() as conn:
        conn.execute(text(
            """
            CREATE TABLE IF NOT EXISTS attendance (
              id INT AUTO_INCREMENT PRIMARY KEY,
              student_id INT NOT NULL,
              bus_id INT NULL,
              status VARCHAR(20) NOT NULL,
              marked_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        ))
        conn.execute(text(
            "INSERT INTO attendance (student_id, bus_id, status, marked_at) VALUES (:sid, :bid, :status, NOW())"
        ), {"sid": attendance_data.student_id, "bid": attendance_data.bus_id, "status": attendance_data.status})
        r = conn.execute(text("SELECT * FROM attendance WHERE student_id=:sid ORDER BY id DESC LIMIT 1"), {"sid": attendance_data.student_id}).mappings().first()
    return {
        "id": r["id"],
        "student_id": r["student_id"],
        "bus_id": r["bus_id"],
        "status": r["status"],
        "marked_at": r["marked_at"].isoformat() if r["marked_at"] else None
    }

@router.put("/{attendance_id}", response_model=dict)
def update_attendance(attendance_id: int, status: str, db: Session = Depends(get_db)):
    """Update attendance status"""
    if status not in ["present", "absent"]:
        raise HTTPException(status_code=400, detail="Status must be 'present' or 'absent'")
    
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    attendance.status = status
    db.commit()
    db.refresh(attendance)
    
    return {
        "id": attendance.id,
        "student_id": attendance.student_id,
        "bus_id": attendance.bus_id,
        "status": attendance.status,
        "marked_at": attendance.marked_at.isoformat() if attendance.marked_at else None
    }

@router.delete("/{attendance_id}")
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    """Delete an attendance record"""
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    db.delete(attendance)
    db.commit()
    return {"message": "Attendance record deleted successfully"}
