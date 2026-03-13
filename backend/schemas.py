# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Authentication Schemas
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "student"
    phone: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ResetPasswordIn(BaseModel):
    email: EmailStr
    new_password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    class Config:
        from_attributes = True

# Driver Schemas
class DriverCreate(BaseModel):
    license_no: Optional[str] = None
    name: Optional[str] = None
    contact: Optional[str] = None

class DriverOut(BaseModel):
    id: int
    license_no: Optional[str]
    name: Optional[str]
    contact: Optional[str]
    class Config:
        from_attributes = True

# Student Schemas
class StudentCreate(BaseModel):
    roll_no: Optional[str] = None
    name: Optional[str] = None
    contact: Optional[str] = None

class StudentOut(BaseModel):
    id: int
    roll_no: Optional[str]
    name: Optional[str]
    contact: Optional[str]
    class Config:
        from_attributes = True

# Admin create payloads (to support admin add flows)
class AdminStudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None  # optional to support current UI (auto-generate)
    phone: Optional[str] = None
    roll_no: Optional[str] = None
    contact: Optional[str] = None
    bus_id: Optional[int] = None

class AdminDriverCreate(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None  # optional to support current UI (auto-generate)
    phone: Optional[str] = None
    license_no: Optional[str] = None
    contact: Optional[str] = None
    bus_id: Optional[int] = None
# Bus Schemas
class BusCreate(BaseModel):
    bus_no: str
    capacity: int = 40
    model: Optional[str] = None
    route: Optional[int] = None
    driver_id: Optional[int] = None

class BusOut(BaseModel):
    id: int
    bus_no: str
    capacity: int
    model: Optional[str]
    route: Optional[int]
    driver_id: Optional[int]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

# Route Schemas
class RouteCreate(BaseModel):
    name: str
    path: Optional[str] = None  # JSON string
    bus_id: Optional[int] = None

class RouteOut(BaseModel):
    id: int
    name: str
    path: Optional[str]
    bus_id: Optional[int]
    created_at: Optional[datetime]
    class Config:
        from_attributes = True

# Bus Driver Assignment Schemas
class BusDriverCreate(BaseModel):
    bus_id: int
    driver_id: int

class BusDriverOut(BaseModel):
    id: int
    bus_id: int
    driver_id: int
    assigned_at: Optional[datetime]
    class Config:
        from_attributes = True

# Student Bus Assignment Schemas
class StudentBusCreate(BaseModel):
    student_id: int
    bus_id: int

class StudentBusOut(BaseModel):
    id: int
    student_id: int
    bus_id: int
    assigned_at: Optional[datetime]
    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceCreate(BaseModel):
    student_id: int
    bus_id: Optional[int] = None
    status: str = "present"  # 'present' | 'absent'

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    bus_id: Optional[int]
    status: str
    marked_at: Optional[datetime]
    class Config:
        from_attributes = True

