@echo off
echo 🚀 Starting Bug to PR Services...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Start Python AI service
echo 🐍 Starting Python AI service on port 8000...
cd src\ai
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Check if GROQ_API_KEY is set
if "%GROQ_API_KEY%"=="" (
    echo ⚠️  Warning: GROQ_API_KEY environment variable is not set
    echo    Please set it before running the AI service:
    echo    set GROQ_API_KEY=your_api_key_here
)

REM Start AI service
start "AI Service" cmd /k "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..\..

REM Wait a moment for AI service to start
timeout /t 3 /nobreak >nul

REM Start NestJS backend
echo 🟢 Starting NestJS backend on port 3001...
cd src\backend
npm install
start "Backend" cmd /k "npm run start:dev"
cd ..\..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Next.js frontend
echo ⚛️  Starting Next.js frontend on port 3000...
cd src\frontend
npm install
start "Frontend" cmd /k "npm run dev"
cd ..\..

echo.
echo 🎉 All services started!
echo    AI Service:     http://localhost:8000
echo    Backend API:    http://localhost:3001
echo    Frontend:       http://localhost:3000
echo.
echo Close the command windows to stop the services
pause 