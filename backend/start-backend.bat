@echo off
echo Starting Blue Carbon Registry Backend...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo .env file not found!
    echo Copying from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env file and add your configuration:
    echo - MONGODB_URI
    echo - EMAIL_USER
    echo - EMAIL_PASS
    echo.
    pause
    exit /b 1
)

echo Starting server...
echo.
call npm run dev
