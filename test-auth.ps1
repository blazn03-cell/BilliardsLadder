# Test script to verify authentication fixes
Write-Host "🧪 Testing Authentication Fixes..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Testing /api/billing/checkout without authentication..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/billing/checkout" -Method POST -ContentType "application/json" -Body '{"description":"test"}' -ErrorAction Stop
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

Write-Host "2. Testing /api/players without authentication..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/players" -ErrorAction Stop
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

Write-Host "3. Testing rate limiting with invalid requests..." -ForegroundColor Yellow
for ($i = 1; $i -le 3; $i++) {
    Write-Host "Request $i:" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/players" -Method POST -ContentType "application/json" -Body '{"invalid":"data"}' -ErrorAction Stop
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 200
}
Write-Host ""

Write-Host "4. Testing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/healthz" -ErrorAction Stop
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🏁 Authentication tests complete!" -ForegroundColor Cyan