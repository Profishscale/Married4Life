@echo off
echo ====================================
echo Marriaged4Life - Starting App
echo ====================================
echo.

echo 1. Starting Backend (Port 5000)...
start "Marriaged4Life Backend" cmd /k "cd /d C:\married4life\backend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo 2. Starting Mobile App (Port 8081)...
start "Marriaged4Life Mobile" cmd /k "cd /d C:\married4life\mobile && npx expo start"

echo.
echo ====================================
echo Both servers are starting!
echo ====================================
echo.
echo Next steps:
echo 1. Wait for QR code in the "Mobile" window
echo 2. Open Expo Go app on your phone
echo 3. Scan the QR code
echo.
echo Or press 'w' in the Mobile window to open in browser
echo.
pause

