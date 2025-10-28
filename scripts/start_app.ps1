# Marriaged4Life - Quick Start Script
# Detects environment and starts backend + frontend

Write-Host "🔍 Marriaged4Life Environment Detection" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# 1. Check Expo CLI
Write-Host "`n1️⃣ Checking Expo CLI..." -ForegroundColor Yellow
$expoVersion = npx expo --version 2>$null
if ($expoVersion) {
    Write-Host "   ✅ Expo CLI: $expoVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Expo CLI not found" -ForegroundColor Red
    exit 1
}

# 2. Check Backend
Write-Host "`n2️⃣ Checking Backend Server..." -ForegroundColor Yellow
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 2 -UseBasicParsing
    $backendRunning = $true
    Write-Host "   ✅ Backend is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Backend not running - will start it" -ForegroundColor Yellow
}

# 3. Get Local IP
Write-Host "`n3️⃣ Getting Local IP..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"}).IPAddress | Select-Object -First 1
if ($ipAddress) {
    Write-Host "   📍 Local IP: $ipAddress" -ForegroundColor Green
} else {
    $ipAddress = "192.168.0.148"
    Write-Host "   📍 Using default IP: $ipAddress" -ForegroundColor Yellow
}

# 4. Check Network Connection
Write-Host "`n4️⃣ Network Information..." -ForegroundColor Yellow
Write-Host "   📱 Phone and computer must be on same Wi-Fi" -ForegroundColor Cyan
Write-Host "   💡 If not, use tunnel mode: npx expo start --tunnel" -ForegroundColor Cyan

# 5. Start Backend if not running
if (-not $backendRunning) {
    Write-Host "`n🔄 Starting Backend Server..." -ForegroundColor Yellow
    Write-Host "   Note: Backend may have database connection issues" -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\married4life\backend; npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

# 6. Start Expo
Write-Host "`n5️⃣ Starting Expo..." -ForegroundColor Yellow
Write-Host "   🚀 Server will start on: http://localhost:8081" -ForegroundColor Green
Write-Host "   📱 Scan QR code with Expo Go app on your phone" -ForegroundColor Green
Write-Host "   🌐 Or press 'w' to open in web browser" -ForegroundColor Green
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "Starting Expo in 3 seconds..." -ForegroundColor Yellow
Write-Host "=======================================`n" -ForegroundColor Cyan

cd C:\married4life\mobile
npx expo start

