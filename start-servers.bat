@echo off
echo === College Bus Management System ===
echo Starting Backend and Frontend servers...
echo.

echo Starting Backend on http://127.0.0.1:8000
start "Backend Server" cmd /k "cd backend && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak > nul

echo Starting Frontend on http://localhost:5173
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo API Docs: http://127.0.0.1:8000/docs
echo.
echo Close the terminal windows to stop the servers.
pause

