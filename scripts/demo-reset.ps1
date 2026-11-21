# scripts/demo-reset.ps1
# Stops the backend, drops and recreates schema public on incidentzero_demo, restarts backend, waits for login 200

Write-Output "[*] Executing demo-reset..."

# 1. Stop backend process listening on 8080
$port8080 = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($port8080) {
    $pids = $port8080.OwningProcess | Select-Object -Unique
    foreach ($p in $pids) {
        Write-Output "[*] Stopping existing backend process PID $p..."
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# 2. Reset database schema
& ".venv\\Scripts\\python" scripts/demo_db_helper.py --reset
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to reset demo database schema!"
    exit 1
}

# 3. Start backend daemon
Write-Output "[*] Launching backend against incidentzero_demo..."
$backendJob = Start-Process -FilePath ".venv\\Scripts\\python" -ArgumentList "scripts/run_backend_demo.py" -PassThru -NoNewWindow

# 4. Poll until login responds 200
$loginBody = '{"email":"emp@bits.campus","password":"Bits@2026"}'
$ready = $false
for ($i = 0; $i -lt 45; $i++) {
    Start-Sleep -Seconds 2
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 3 -ErrorAction Stop
        if ($res.accessToken -or $res.token) {
            Write-Output "[OK] Backend is ready and login answered 200 (Token received)."
            $ready = $true
            break
        }
    } catch {
        # continue waiting
    }
}

if (-not $ready) {
    Write-Error "[FAIL] Backend failed to answer 200 on /api/v1/auth/login within 90 seconds!"
    exit 1
}

Write-Output "[OK] demo-reset completed successfully."
