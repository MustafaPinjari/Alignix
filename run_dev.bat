@echo off
echo Starting Alignix...

start "Alignix Backend" cmd /k "cd backend && venv\Scripts\python.exe main.py"

timeout /t 2 /nobreak >nul

cd frontend
npm run dev
