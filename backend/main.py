import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv

from database import engine, Base, SessionLocal  # ✅ fixed import

from websocket_manager import manager
from auth_utils import decode_token
from sqlalchemy.orm import Session

# Import all models to ensure tables are created
from models import (
    User, Driver, Student, Bus, Route, 
    BusDriver, StudentBus
)

load_dotenv()

API_PREFIX = os.getenv("API_PREFIX", "/api")

# Run lightweight migrations then create DB tables
from migrations import run_migrations
run_migrations(engine)
Base.metadata.create_all(bind=engine)

# Initialize app
app = FastAPI(title="College Bus Backend")

# Determine allowed CORS origins from env for production readiness
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173",
)
ALLOWED_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routers
from routers.auth_router import router as auth_router
from routers.buses_router import router as buses_router
from routers.students_router import router as students_router
from routers.drivers_router import router as drivers_router
from routers.routes_router import router as routes_router
from routers.attendance_router import router as attendance_router

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(buses_router, prefix=API_PREFIX)
app.include_router(students_router, prefix=API_PREFIX)
app.include_router(drivers_router, prefix=API_PREFIX)
app.include_router(routes_router, prefix=API_PREFIX)
app.include_router(attendance_router, prefix=API_PREFIX)

# ✅ Root endpoint
@app.get("/")
def read_root():
    return {"message": "College Bus Backend API", "docs": "/docs"}

# ✅ WebSocket endpoint
@app.websocket(f"{API_PREFIX}/ws/bus/{{bus_id}}")
async def bus_ws(websocket: WebSocket, bus_id: int, token: str = None):
    # token passed as query param: /api/ws/bus/1?token=...
    if not token:
        await websocket.close(code=1008)
        return

    payload = decode_token(token)
    if not payload:
        await websocket.close(code=1008)
        return

    await manager.connect(bus_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            if isinstance(data, dict) and data.get("type") == "location":
                # ✅ Broadcast to connected clients (location tracking removed from DB)
                await manager.broadcast(
                    bus_id,
                    {
                        "type": "location",
                        "lat": data.get("lat"),
                        "lng": data.get("lng"),
                        "ts": data.get("ts"),
                    },
                )
            else:
                await manager.broadcast(
                    bus_id, {"type": "message", "payload": data}
                )

    except WebSocketDisconnect:
        manager.disconnect(bus_id, websocket)
