# Generate QR Code for Expo App
# This script generates a QR code for the Expo app connection URL

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Married4Life - QR Code Generator" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Get local IP address
Write-Host "Detecting local IP address..." -ForegroundColor Yellow

$localIP = $null
$networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"
} | Sort-Object -Property PrefixOrigin -Descending

if ($networkAdapters) {
    $localIP = $networkAdapters[0].IPAddress
    Write-Host "Found IP: $localIP" -ForegroundColor Green
} else {
    # Fallback: try to get IP from hostname
    try {
        $localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*","Wi-Fi*" | Where-Object { $_.IPAddress -notlike "127.*" } | Select-Object -First 1).IPAddress
        if (-not $localIP) {
            $localIP = "192.168.0.148"  # Default from your config
            Write-Host "Using default IP: $localIP" -ForegroundColor Yellow
        } else {
            Write-Host "Found IP: $localIP" -ForegroundColor Green
        }
    } catch {
        $localIP = "192.168.0.148"
        Write-Host "Using default IP: $localIP" -ForegroundColor Yellow
    }
}

# Expo URL
$expoPort = 8081
$expoURL = "exp://$localIP`:$expoPort"
# URL encode manually for common characters
$expoURLEncoded = $expoURL -replace ':', '%3A' -replace '/', '%2F'

Write-Host "`nExpo Connection URL:" -ForegroundColor Cyan
Write-Host "   $expoURL" -ForegroundColor White
Write-Host ""

# Generate QR code using online service
Write-Host "Generating QR Code..." -ForegroundColor Yellow

$qrCodeURL = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$expoURLEncoded"
$qrCodeImagePath = "$PSScriptRoot\expo_qr_code.png"

try {
    # Download QR code image
    Invoke-WebRequest -Uri $qrCodeURL -OutFile $qrCodeImagePath -UseBasicParsing
    Write-Host "QR Code generated successfully!" -ForegroundColor Green
    
    # Try to open the image
    if (Test-Path $qrCodeImagePath) {
        Write-Host "`nOpening QR Code image..." -ForegroundColor Yellow
        Start-Process $qrCodeImagePath
        
        Write-Host "`nQR Code saved to: $qrCodeImagePath" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not download QR code image" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Display ASCII QR code using online service
Write-Host "`nASCII QR Code (for terminal display):" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $asciiQRURL = "https://api.qrserver.com/v1/create-qr-code/?size=10x10&data=$expoURLEncoded&format=text"
    $asciiQR = Invoke-WebRequest -Uri $asciiQRURL -UseBasicParsing
    Write-Host $asciiQR.Content -ForegroundColor White
} catch {
    # Fallback: display URL in a box
    Write-Host ""
    Write-Host "┌─────────────────────────────────────┐" -ForegroundColor Yellow
    Write-Host "│  Scan this URL with Expo Go:       │" -ForegroundColor Yellow
    Write-Host "│                                     │" -ForegroundColor Yellow
    Write-Host "│  $expoURL" -ForegroundColor White
    Write-Host "│                                     │" -ForegroundColor Yellow
    Write-Host "└─────────────────────────────────────┘" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "   1. Open Expo Go app on your phone" -ForegroundColor White
Write-Host "   2. Tap 'Scan QR code'" -ForegroundColor White
Write-Host "   3. Scan the QR code image or" -ForegroundColor White
Write-Host "   4. Enter URL manually: $expoURL" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Option to start Expo
Write-Host "Would you like to start Expo now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "`nStarting Expo..." -ForegroundColor Green
    Write-Host "   The QR code will also appear in the Expo terminal" -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location C:\married4life\mobile
    npx expo start --lan
}
