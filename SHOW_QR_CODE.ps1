# Display QR Code directly in PowerShell terminal
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Married4Life - QR Code" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Get local IP address
$localIP = $null
$networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"
} | Sort-Object -Property PrefixOrigin -Descending

if ($networkAdapters) {
    $localIP = $networkAdapters[0].IPAddress
} else {
    try {
        $localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*","Wi-Fi*" | Where-Object { $_.IPAddress -notlike "127.*" } | Select-Object -First 1).IPAddress
        if (-not $localIP) {
            $localIP = "192.168.0.148"
        }
    } catch {
        $localIP = "192.168.0.148"
    }
}

$expoPort = 8081
$expoURL = "exp://$localIP`:$expoPort"
# Manual URL encoding
$expoURLEncoded = $expoURL -replace ':', '%3A' -replace '/', '%2F'

Write-Host "Expo URL: $expoURL`n" -ForegroundColor Green

# Generate and display ASCII QR code
Write-Host "Scan this QR code with Expo Go:`n" -ForegroundColor Yellow

try {
    # Use qrencode-style API that returns ASCII
    $qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=15x15&data=$expoURLEncoded&format=json"
    $response = Invoke-RestMethod -Uri $qrApiUrl -Method Get
    
    # Alternative: Use qr.aecio.dev which returns ASCII directly
    $asciiQRUrl = "https://qr.aecio.dev/qr?text=$expoURLEncoded&size=small"
    
    try {
        $qrText = Invoke-RestMethod -Uri $asciiQRUrl -Method Get
        Write-Host $qrText -ForegroundColor White
    } catch {
        # Fallback: Use a different API
        $fallbackUrl = "http://api.qrserver.com/v1/create-qr-code/?size=10x10&data=$expoURLEncoded&format=text"
        try {
            $qrText = (Invoke-WebRequest -Uri $fallbackUrl -UseBasicParsing).Content
            Write-Host $qrText -ForegroundColor White
        } catch {
            # Manual ASCII QR fallback - display URL in a box
            Write-Host "┌─────────────────────────────────────┐" -ForegroundColor Yellow
            Write-Host "│                                     │" -ForegroundColor Yellow
            Write-Host "│   Scan this URL with Expo Go:      │" -ForegroundColor Yellow
            Write-Host "│                                     │" -ForegroundColor Yellow
            Write-Host "│   $expoURL" -ForegroundColor White
            Write-Host "│                                     │" -ForegroundColor Yellow
            Write-Host "└─────────────────────────────────────┘" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Error generating QR code: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease use this URL manually:" -ForegroundColor Yellow
    Write-Host "$expoURL" -ForegroundColor White
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Open Expo Go app on your phone" -ForegroundColor White
Write-Host "2. Tap 'Scan QR code'" -ForegroundColor White
Write-Host "3. Point camera at the QR code above" -ForegroundColor White
Write-Host "4. Or enter URL manually: $expoURL" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

