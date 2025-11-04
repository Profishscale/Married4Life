# Quick QR Code Display in PowerShell
param(
    [string]$URL = ""
)

if ([string]::IsNullOrEmpty($URL)) {
    # Get local IP
    $localIP = $null
    $networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"
    } | Sort-Object -Property PrefixOrigin -Descending
    
    if ($networkAdapters) {
        $localIP = $networkAdapters[0].IPAddress
    } else {
        $localIP = "192.168.0.148"
    }
    
    $URL = "exp://$localIP`:8081"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  QR Code for Expo" -ForegroundColor Yellow  
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "URL: $URL`n" -ForegroundColor Green

# Use a service that returns actual ASCII QR codes
$encoded = $URL -replace ':', '%3A' -replace '/', '%2F'

# Try multiple ASCII QR code services
$services = @(
    "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=$encoded",
    "https://api.qrserver.com/v1/create-qr-code/?size=15x15&data=$encoded&format=text"
)

$qrDisplayed = $false
foreach ($service in $services) {
    try {
        Write-Host "Generating QR code...`n" -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri $service -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        # Check if it's text (ASCII) or binary
        $content = $response.Content
        if ($content -match '^[█▀▄▌▐░▒▓\s]+$' -or $content.Length -lt 2000) {
            Write-Host $content -ForegroundColor White
            $qrDisplayed = $true
            break
        }
    } catch {
        continue
    }
}

if (-not $qrDisplayed) {
    # Fallback: Display URL in a nice box
    Write-Host "┌─────────────────────────────────────────┐" -ForegroundColor Yellow
    Write-Host "│                                         │" -ForegroundColor Yellow
    Write-Host "│  Scan this URL with Expo Go:            │" -ForegroundColor Yellow
    Write-Host "│                                         │" -ForegroundColor Yellow
    Write-Host "│  $URL" -ForegroundColor White
    Write-Host "│                                         │" -ForegroundColor Yellow
    Write-Host "└─────────────────────────────────────────┘" -ForegroundColor Yellow
    Write-Host "`nNote: For visual QR code, run: npx expo start`n" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Open Expo Go app" -ForegroundColor White
Write-Host "2. Tap 'Scan QR code'" -ForegroundColor White
Write-Host "3. Scan the code above or enter URL manually" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

