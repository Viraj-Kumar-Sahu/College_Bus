# backfill_routes.py
"""
Backfill legacy 'route' columns in buses, drivers, and students based on
current assignments:
- buses.route := routes.id where routes.bus_id = buses.id
- drivers.route := routes.id where driver is assigned to a bus that has a route
- students.route := routes.id where student is assigned to a bus that has a route

Usage:
    python backfill_routes.py
"""
from sqlalchemy import text
from database import engine

if __name__ == "__main__":
    with engine.begin() as conn:
        # Buses
        conn.execute(text(
            """
            UPDATE buses b
            LEFT JOIN routes r ON r.bus_id = b.id
            SET b.route = r.id, b.route_name = r.name
            """
        ))
        # Drivers
        conn.execute(text(
            """
            UPDATE drivers d
            LEFT JOIN bus_drivers bd ON bd.driver_id = d.id
            LEFT JOIN routes r ON r.bus_id = bd.bus_id
            SET d.route = r.id, d.route_name = r.name
            """
        ))
        # Students
        conn.execute(text(
            """
            UPDATE students s
            LEFT JOIN student_bus sb ON sb.student_id = s.id
            LEFT JOIN routes r ON r.bus_id = sb.bus_id
            SET s.route = r.id, s.route_name = r.name
            """
        ))
    print("✅ Backfilled route columns for buses, drivers, and students.")
