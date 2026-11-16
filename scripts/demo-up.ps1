# scripts/demo-up.ps1
# Starts DB if needed, starts backend on 8080 with demo DB, starts Vite on 3000, waits for login 200

Write-Output "[*] Executing demo-up..."

# 1. Verify demo DB
& "video\.venv\Scripts\python" scripts/demo_db_helper.py --check
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to connect to incidentzero_demo!"
    exit 1
}

# 2. Check if backend on 8080 is already responding
$loginBody = '{"email":"emp@bits.campus","password":"Bits@2026"}'
$backendUp = $false
try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 3 -ErrorAction Stop
    if ($res.accessToken -or $res.token) {
        $backendUp = $true
        Write-Output "[OK] Backend already running on 8080 and answering login."
    }
} catch {
    $backendUp = $false
}

if (-not $backendUp) {
    Write-Output "[*] Starting backend on 8080..."
    Start-Process -FilePath "video\.venv\Scripts\python" -ArgumentList "scripts/run_backend_demo.py" -NoNewWindow
    for ($i = 0; $i -lt 45; $i++) {
        Start-Sleep -Seconds 2
        try {
            $res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 3 -ErrorAction Stop
            if ($res.accessToken -or $res.token) {
                Write-Output "[OK] Backend is ready and login answered 200."
                $backendUp = $true
                break
            }
        } catch {}
    }
    if (-not $backendUp) {
        Write-Error "[X] Backend failed to start!"
        exit 1
    }
}

# 3. Check if frontend on 3000 is running
$frontendUp = $false
try {
    $fe = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($fe.StatusCode -eq 200) {
        $frontendUp = $true
        Write-Output "[OK] Frontend already running on 3000."
    }
} catch {
    $frontendUp = $false
}

if (-not $frontendUp) {
    Write-Output "[*] Starting Vite frontend dev server on port 3000..."
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm --prefix frontend run dev" -NoNewWindow
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Seconds 1
        try {
            $fe = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($fe.StatusCode -eq 200) {
                Write-Output "[OK] Frontend is ready on port 3000."
                $frontendUp = $true
                break
            }
        } catch {}
    }
}

Write-Output "[OK] demo-up completed. Stack is running!"
