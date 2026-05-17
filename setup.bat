@echo off
echo ============================================
echo  Alignix — Setup
echo ============================================

echo.
echo [1/3] Setting up Python backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo.
echo [2/3] Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo [3/3] Setup complete!
echo.
echo To run Alignix in development mode:
echo   run_dev.bat
echo.
pause
