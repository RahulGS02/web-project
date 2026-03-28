@echo off
echo ========================================
echo   RAJINI PHARMA - Starting Servers
echo ========================================
echo.

echo [1/2] Starting Backend Server on port 5000...
start "RAJINI PHARMA Backend" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server on port 3000...
start "RAJINI PHARMA Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servers are starting...
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul

