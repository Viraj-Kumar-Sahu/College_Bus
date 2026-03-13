# Start College Bus Management System
Write-Host "=== College Bus Management System ===" -ForegroundColor Cyan
Write-Host "Starting Backend and Frontend servers..." -ForegroundColor Green

# Function to start backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\WIN11\Downloads\express-campus-track-main (1)\backend"
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
    python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
}

# Function to start frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\WIN11\Downloads\express-campus-track-main (1)\frontend"
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
    npm run dev
}

Write-Host "`n✅ Backend server starting on http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "✅ Frontend server starting on http://localhost:5173`n" -ForegroundColor Yellow

Write-Host "Press Ctrl+C to stop both servers`n" -ForegroundColor Red

# Monitor jobs and display output
try {
    while ($true) {
        # Get backend output
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Cyan
        }

        # Get frontend output
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Magenta
        }

        # Check if jobs are still running
        if ($backendJob.State -ne 'Running' -and $frontendJob.State -ne 'Running') {
            break
        }

        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host "`nStopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "Servers stopped." -ForegroundColor Green
}

