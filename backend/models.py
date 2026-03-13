# models.py
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime
import enum


class RoleEnum(enum.Enum):
    admin = "admin"
    driver = "driver"
    student = "student"


class AttendanceStatus(enum.Enum):
    present = "present"
    absent = "absent"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)  # Changed from password to password_hash
    role = Column(String(50), nullable=False)  # 'admin'|'driver'|'student'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    driver_info = relationship("Driver", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student_info = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bus_assignments = relationship("BusDriver", back_populates="driver", cascade="all, delete-orphan")
    student_bus_assignments = relationship("StudentBus", back_populates="student", cascade="all, delete-orphan")


class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    license_no = Column(String(100), nullable=True)
    # Align with DB: remove vehicle_experience
    name = Column(String(100), nullable=True)
    contact = Column(String(20), nullable=True)

    # Relationship
    user = relationship("User", back_populates="driver_info")


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    roll_no = Column(String(50), nullable=True)
    name = Column(String(100), nullable=True)
    contact = Column(String(20), nullable=True)

    # Relationship
    user = relationship("User", back_populates="student_info")


class Bus(Base):
    __tablename__ = "buses"
    id = Column(Integer, primary_key=True, index=True)
    bus_no = Column(String(50), unique=True, nullable=False)  # Changed from bus_number to bus_no
    capacity = Column(Integer, default=40)
    model = Column(String(100), nullable=True)
    route = Column(Integer, ForeignKey("routes.id", ondelete="SET NULL"), nullable=True)
    driver_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

    # Relationships
    driver_assignments = relationship("BusDriver", back_populates="bus", cascade="all, delete-orphan")
    student_assignments = relationship("StudentBus", back_populates="bus", cascade="all, delete-orphan")
    # Disambiguated, view-only relation from bus.route -> routes.id; no back_populates to avoid dual M2O loop
    route_assignment = relationship(
        "Route",
        uselist=False,
        primaryjoin="Bus.route==Route.id",
        foreign_keys=[route],
        viewonly=True,
    )


class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    path = Column(Text, nullable=True)  # JSON string array of lat,lng points or description
    created_at = Column(DateTime, default=datetime.utcnow)
    bus_id = Column(Integer, ForeignKey("buses.id", ondelete="SET NULL"), nullable=True)

    # Relationship from routes.bus_id -> buses.id; do not back_populate to avoid dual M2O loop
    bus = relationship(
        "Bus",
        primaryjoin="Route.bus_id==Bus.id",
        foreign_keys=[bus_id],
    )


class BusDriver(Base):
    __tablename__ = "bus_drivers"
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id", ondelete="CASCADE"), nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bus = relationship("Bus", back_populates="driver_assignments")
    driver = relationship("User", back_populates="bus_assignments")


class StudentBus(Base):
    __tablename__ = "student_bus"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bus_id = Column(Integer, ForeignKey("buses.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="student_bus_assignments")
    bus = relationship("Bus", back_populates="student_assignments")


class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bus_id = Column(Integer, ForeignKey("buses.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), nullable=False, default="present")
    marked_at = Column(DateTime, default=datetime.utcnow)


