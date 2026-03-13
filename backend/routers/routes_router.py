# routers/routes_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, text
from database import SessionLocal, engine
from models import Route
from schemas import RouteCreate, RouteOut
from typing import Generator, List
from websocket_manager import manager

router = APIRouter(prefix="/routes", tags=["routes"])

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[dict])
def get_all_routes(db: Session = Depends(get_db)):
    """Get all routes"""
    routes = db.query(Route).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "path": r.path,
            "bus_id": r.bus_id,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in routes
    ]

@router.get("/{route_id}", response_model=dict)
def get_route(route_id: int, db: Session = Depends(get_db)):
    """Get a specific route by ID"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    return {
        "id": route.id,
        "name": route.name,
        "path": route.path,
        "bus_id": route.bus_id,
        "created_at": route.created_at.isoformat() if route.created_at else None
    }

@router.post("/", response_model=dict)
def create_route(route_data: RouteCreate, db: Session = Depends(get_db)):
    """Create a new route"""
    new_route = Route(
        name=route_data.name,
        path=route_data.path,
        bus_id=route_data.bus_id
    )
    db.add(new_route)
    db.commit()
    db.refresh(new_route)
    
    # Notify bus channel if assigned
    if new_route.bus_id:
        try:
            import asyncio
            asyncio.create_task(manager.broadcast(new_route.bus_id, {"type": "route_update", "route_id": new_route.id}))
        except Exception:
            pass
    
    return {
        "id": new_route.id,
        "name": new_route.name,
        "path": new_route.path,
        "bus_id": new_route.bus_id,
        "created_at": new_route.created_at.isoformat() if new_route.created_at else None
    }

@router.put("/{route_id}", response_model=dict)
def update_route(route_id: int, route_data: RouteCreate, db: Session = Depends(get_db)):
    """Update a route"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    route.name = route_data.name
    route.path = route_data.path
    route.bus_id = route_data.bus_id
    
    db.commit()
    db.refresh(route)

    # Sync legacy columns if assigned
    if route.bus_id:
        try:
            with engine.begin() as conn:
                conn.execute(text("UPDATE buses SET route=:rid, route_name=:rname WHERE id=:bid"), {"rid": route.id, "rname": route.name, "bid": route.bus_id})
                conn.execute(text(
                    "UPDATE drivers d JOIN bus_drivers bd ON bd.driver_id = d.id SET d.route = :rid, d.route_name=:rname WHERE bd.bus_id = :bid"
                ), {"rid": route.id, "rname": route.name, "bid": route.bus_id})
                conn.execute(text(
                    "UPDATE students s JOIN student_bus sb ON sb.student_id = s.id SET s.route = :rid, s.route_name=:rname WHERE sb.bus_id = :bid"
                ), {"rid": route.id, "rname": route.name, "bid": route.bus_id})
        except Exception:
            pass
    
    if route.bus_id:
        try:
            import asyncio
            asyncio.create_task(manager.broadcast(route.bus_id, {"type": "route_update", "route_id": route.id}))
        except Exception:
            pass
    
    return {
        "id": route.id,
        "name": route.name,
        "path": route.path,
        "bus_id": route.bus_id,
        "created_at": route.created_at.isoformat() if route.created_at else None
    }

@router.post("/{route_id}/assign-bus/{bus_id}", response_model=dict)
def assign_route_to_bus(route_id: int, bus_id: int, db: Session = Depends(get_db)):
    """Assign a route to a bus (ensures only one route per bus)"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    # Verify bus exists without loading ORM columns that may not exist in legacy DBs
    with engine.connect() as conn:
        exists = conn.execute(text("SELECT id FROM buses WHERE id=:id LIMIT 1"), {"id": bus_id}).first()
        if not exists:
            raise HTTPException(status_code=404, detail="Bus not found")

    # Unassign any other routes currently pointing to this bus
    db.query(Route).filter(and_(Route.bus_id == bus_id, Route.id != route_id)).update({Route.bus_id: None})

    # Assign target route
    route.bus_id = bus_id
    db.commit()
    db.refresh(route)

    # Keep legacy columns in sync (buses.route, drivers.route, students.route)
    try:
        with engine.begin() as conn:
            # set buses.route and route_name
            conn.execute(text("UPDATE buses SET route=:rid, route_name=:rname WHERE id=:bid"), {"rid": route.id, "rname": route.name, "bid": bus_id})
            # set drivers.route and route_name for drivers assigned to this bus
            conn.execute(text(
                "UPDATE drivers d JOIN bus_drivers bd ON bd.driver_id = d.id SET d.route = :rid, d.route_name=:rname WHERE bd.bus_id = :bid"
            ), {"rid": route.id, "rname": route.name, "bid": bus_id})
            # set students.route and route_name for students assigned to this bus
            conn.execute(text(
                "UPDATE students s JOIN student_bus sb ON sb.student_id = s.id SET s.route = :rid, s.route_name=:rname WHERE sb.bus_id = :bid"
            ), {"rid": route.id, "rname": route.name, "bid": bus_id})
    except Exception:
        pass

    # Notify bus channel
    try:
        import asyncio
        asyncio.create_task(manager.broadcast(bus_id, {"type": "route_update", "route_id": route.id}))
    except Exception:
        pass

    return {
        "id": route.id,
        "name": route.name,
        "path": route.path,
        "bus_id": route.bus_id,
        "created_at": route.created_at.isoformat() if route.created_at else None
    }

@router.delete("/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db)):
    """Delete a route"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    bus_id = route.bus_id
    db.delete(route)
    db.commit()

    # Notify bus channel if existed
    if bus_id:
        try:
            import asyncio
            asyncio.create_task(manager.broadcast(bus_id, {"type": "route_removed"}))
        except Exception:
            pass

    return {"message": "Route deleted successfully"}
