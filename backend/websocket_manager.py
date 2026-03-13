# websocket_manager.py
from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # bus_id -> list of websocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, bus_id: int, websocket: WebSocket):
        await websocket.accept()
        if bus_id not in self.active_connections:
            self.active_connections[bus_id] = []
        self.active_connections[bus_id].append(websocket)

    def disconnect(self, bus_id: int, websocket: WebSocket):
        if bus_id in self.active_connections:
            if websocket in self.active_connections[bus_id]:
                self.active_connections[bus_id].remove(websocket)
            if not self.active_connections[bus_id]:
                del self.active_connections[bus_id]

    async def broadcast(self, bus_id: int, message: dict):
        if bus_id in self.active_connections:
            for connection in self.active_connections[bus_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

