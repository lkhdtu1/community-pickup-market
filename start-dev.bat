@echo off
echo Starting Community Pickup Market Development Environment...

REM Start backend server in new window
start "Backend Server" cmd /k "cd /d \"d:\git\community-pickup-market\server\" && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend server
cd /d "d:\git\community-pickup-market"
echo Starting frontend server...
npm run dev