# websocket_manager.py
from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active: Dict[int, List[WebSocket]] = {}

    async def connect(self, bus_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(bus_id, []).append(websocket)

    def disconnect(self, bus_id: int, websocket: WebSocket):
        if bus_id in self.active and websocket in self.active[bus_id]:
            self.active[bus_id].remove(websocket)

    async def broadcast(self, bus_id: int, message: dict):
        if bus_id in self.active:
            to_remove = []
            for ws in list(self.active[bus_id]):
                try:
                    await ws.send_json(message)
                except Exception:
                    to_remove.append(ws)
            for ws in to_remove:
                self.disconnect(bus_id, ws)

manager = ConnectionManager()
