# routers/buses_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal, engine
from schemas import BusCreate
from typing import Generator, List, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/buses", tags=["buses"])

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _bus_columns(conn) -> Dict[str, bool]:
    # Prefer SHOW COLUMNS (works with limited permissions)
    rows = conn.execute(text("SHOW COLUMNS FROM buses")).all()
    cols = [r[0] for r in rows]  # first column is Field
    s = set(cols)
    return {
        "bus_no": "bus_no" in s,
        "bus_number": "bus_number" in s,
        "model": "model" in s,
        "capacity": "capacity" in s,
        "route": "route" in s or "route_id" in s,
        "route_id": "route_id" in s,
        "route_name": "route_name" in s,
        "driver_id": "driver_id" in s,
        "created_at": "created_at" in s,
        "updated_at": "updated_at" in s,
    }

@router.get("/", response_model=List[dict])
def get_buses(db: Session = Depends(get_db)):
    with engine.connect() as conn:
        cols = _bus_columns(conn)
        # Build SELECT dynamically
        select_parts = ["id"]
        name_col = "bus_no" if cols["bus_no"] else ("bus_number" if cols["bus_number"] else None)
        if name_col:
            select_parts.append(name_col)
        if cols["model"]: select_parts.append("model")
        if cols["capacity"]: select_parts.append("capacity")
        if cols["route"]: select_parts.append("route" if cols["route"] and not cols["route_id"] else "route_id AS route")
        if cols.get("route_name"): select_parts.append("route_name")
        if cols["driver_id"]: select_parts.append("driver_id")
        if cols["updated_at"]: select_parts.append("updated_at")
        if cols["created_at"]: select_parts.append("created_at")
        sql = f"SELECT {', '.join(select_parts)} FROM buses ORDER BY id DESC"
        rows = conn.execute(text(sql)).mappings().all()
        out: List[Dict[str, Any]] = []
        for r in rows:
            bus_no_val = r.get(name_col) if name_col else None
            out.append({
                "id": r.get("id"),
                "bus_number": bus_no_val,
                "bus_no": bus_no_val,
                "model": r.get("model"),
                "capacity": r.get("capacity"),
                "route": r.get("route"),
                "driver_id": r.get("driver_id"),
                "route_name": r.get("route_name") if "route_name" in r else None,
                "updated_at": r.get("updated_at").isoformat() if r.get("updated_at") else None,
                "created_at": r.get("created_at").isoformat() if r.get("created_at") else None,
            })
    return out

@router.get("/{bus_id}")
def get_bus(bus_id: int, db: Session = Depends(get_db)):
    with engine.connect() as conn:
        cols = _bus_columns(conn)
        name_col = "bus_no" if cols["bus_no"] else ("bus_number" if cols["bus_number"] else None)
        select_parts = ["id"]
        if name_col: select_parts.append(name_col)
        if cols["model"]: select_parts.append("model")
        if cols["capacity"]: select_parts.append("capacity")
        if cols["route"]: select_parts.append("route" if cols["route"] and not cols["route_id"] else "route_id AS route")
        if cols["driver_id"]: select_parts.append("driver_id")
        if cols["updated_at"]: select_parts.append("updated_at")
        if cols["created_at"]: select_parts.append("created_at")
        sql = f"SELECT {', '.join(select_parts)} FROM buses WHERE id=:id"
        r = conn.execute(text(sql), {"id": bus_id}).mappings().first()
        if not r:
            raise HTTPException(status_code=404, detail="Bus not found")
        bus_no_val = r.get(name_col) if name_col else None
        return {
            "id": r.get("id"),
            "bus_number": bus_no_val,
            "bus_no": bus_no_val,
            "model": r.get("model"),
            "capacity": r.get("capacity"),
            "route": r.get("route"),
            "driver_id": r.get("driver_id"),
            "updated_at": r.get("updated_at").isoformat() if r.get("updated_at") else None,
            "created_at": r.get("created_at").isoformat() if r.get("created_at") else None,
        }

@router.post("/", response_model=dict)
def create_bus(bus: BusCreate, db: Session = Depends(get_db)):
    """Create a new bus"""
    with engine.begin() as conn:
        cols = _bus_columns(conn)
        name_col = "bus_no" if cols["bus_no"] else ("bus_number" if cols["bus_number"] else None)
        if not name_col:
            raise HTTPException(status_code=500, detail="buses table missing bus number column")
        # Duplicate check
        dup = conn.execute(text(f"SELECT id FROM buses WHERE {name_col}=:bn"), {"bn": bus.bus_no}).first()
        if dup:
            raise HTTPException(status_code=400, detail="Bus number already exists")
        # Build INSERT parts dynamically
        cols_list = [name_col]
        params: Dict[str, Any] = {"bn": bus.bus_no}
        placeholders = [":bn"]
        if cols["capacity"]:
            cols_list.append("capacity"); placeholders.append(":cap"); params["cap"] = bus.capacity
        if cols["model"] and bus.model is not None:
            cols_list.append("model"); placeholders.append(":model"); params["model"] = bus.model
        if cols["route"] and bus.route is not None:
            route_col = "route" if cols["route"] and not cols["route_id"] else "route_id"
            cols_list.append(route_col); placeholders.append(":route"); params["route"] = bus.route
        if cols["driver_id"] and bus.driver_id is not None:
            cols_list.append("driver_id"); placeholders.append(":driver"); params["driver"] = bus.driver_id
        if cols["created_at"]:
            cols_list.append("created_at"); placeholders.append("NOW()")
        sql = f"INSERT INTO buses ({', '.join(cols_list)}) VALUES ({', '.join(placeholders)})"
        conn.execute(text(sql), params)
        # Fetch inserted row
        r = conn.execute(text(f"SELECT * FROM buses WHERE {name_col}=:bn ORDER BY id DESC LIMIT 1"), {"bn": bus.bus_no}).mappings().first()
        return {
            "id": r.get("id"),
            "bus_no": r.get(name_col),
            "bus_number": r.get(name_col),
            "capacity": r.get("capacity"),
            "model": r.get("model"),
            "route": r.get("route") if "route" in r else r.get("route_id"),
            "driver_id": r.get("driver_id"),
            "created_at": r.get("created_at").isoformat() if r.get("created_at") else None,
        }

@router.put("/{bus_id}", response_model=dict)
def update_bus(bus_id: int, bus_data: BusCreate, db: Session = Depends(get_db)):
    """Update a bus"""
    with engine.begin() as conn:
        cols = _bus_columns(conn)
        name_col = "bus_no" if cols["bus_no"] else ("bus_number" if cols["bus_number"] else None)
        r = conn.execute(text("SELECT * FROM buses WHERE id=:id"), {"id": bus_id}).mappings().first()
        if not r:
            raise HTTPException(status_code=404, detail="Bus not found")
        if name_col and bus_data.bus_no != r.get(name_col):
            dup = conn.execute(text(f"SELECT id FROM buses WHERE {name_col}=:bn AND id<>:id"), {"bn": bus_data.bus_no, "id": bus_id}).first()
            if dup:
                raise HTTPException(status_code=400, detail="Bus number already exists")
        sets = []
        params: Dict[str, Any] = {"id": bus_id}
        if name_col:
            sets.append(f"{name_col}=:bn"); params["bn"] = bus_data.bus_no
        if cols["capacity"]:
            sets.append("capacity=:cap"); params["cap"] = bus_data.capacity
        if cols["model"] and bus_data.model is not None:
            sets.append("model=:model"); params["model"] = bus_data.model
        if cols["route"]:
            route_col = "route" if cols["route"] and not cols["route_id"] else "route_id"
            sets.append(f"{route_col}=:route"); params["route"] = bus_data.route
        if cols["driver_id"]:
            sets.append("driver_id=:driver"); params["driver"] = bus_data.driver_id
        if cols["updated_at"]:
            sets.append("updated_at=NOW()")
        sql = f"UPDATE buses SET {', '.join(sets)} WHERE id=:id"
        conn.execute(text(sql), params)
        r2 = conn.execute(text("SELECT * FROM buses WHERE id=:id"), {"id": bus_id}).mappings().first()
        bus_no_val = r2.get(name_col) if name_col else None
    return {
            "id": r2.get("id"),
            "bus_no": bus_no_val,
            "bus_number": bus_no_val,
            "capacity": r2.get("capacity"),
            "model": r2.get("model"),
            "route": r2.get("route") if "route" in r2 else r2.get("route_id"),
            "driver_id": r2.get("driver_id"),
            "route_name": r2.get("route_name") if "route_name" in r2 else None,
            "updated_at": r2.get("updated_at").isoformat() if r2.get("updated_at") else None,
        }

@router.delete("/{bus_id}")
def delete_bus(bus_id: int, db: Session = Depends(get_db)):
    """Delete a bus"""
    with engine.begin() as conn:
        r = conn.execute(text("SELECT id FROM buses WHERE id=:id"), {"id": bus_id}).first()
        if not r:
            raise HTTPException(status_code=404, detail="Bus not found")
        conn.execute(text("DELETE FROM buses WHERE id=:id"), {"id": bus_id})
        return {"message": "Bus deleted successfully"}

