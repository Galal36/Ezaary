# PowerShell script to test Izaar API endpoints

Write-Host "Testing Izaar Backend API..." -ForegroundColor Green
Write-Host "============================`n" -ForegroundColor Green

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health/" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)`n" -ForegroundColor White
} catch {
    Write-Host "   Error: $_`n" -ForegroundColor Red
}

# Test 2: Admin Login
Write-Host "2. Testing Admin Login..." -ForegroundColor Cyan
try {
    $loginData = @{
        email = "admin@gmail.com"
        password = "13579A"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/admin/login/" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -UseBasicParsing
    
    $result = $response.Content | ConvertFrom-Json
    $token = $result.token
    
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Token: $token" -ForegroundColor White
    Write-Host "   User: $($result.user.email) ($($result.user.role))`n" -ForegroundColor White
    
    # Test 3: Get Categories (with auth)
    Write-Host "3. Testing Get Categories..." -ForegroundColor Cyan
    $headers = @{
        "Authorization" = "Token $token"
    }
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/categories/" `
        -Headers $headers `
        -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)`n" -ForegroundColor White
    
    # Test 4: Get Products
    Write-Host "4. Testing Get Products..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/products/" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)`n" -ForegroundColor White
    
} catch {
    Write-Host "   Error: $_`n" -ForegroundColor Red
}

Write-Host "`n============================`n" -ForegroundColor Green
Write-Host "API Testing Complete!" -ForegroundColor Green
Write-Host "`nAdmin Credentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@gmail.com" -ForegroundColor White
Write-Host "  Password: 13579A" -ForegroundColor White
Write-Host "`nAPI Base URL: http://localhost:8000/api/" -ForegroundColor Yellow
Write-Host "Admin Panel: http://localhost:8000/admin/" -ForegroundColor Yellow





