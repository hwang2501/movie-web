# Movie Web - Chạy full stack (Windows)
# Chạy từ thư mục gốc repo: .\scripts\run.ps1

$ErrorActionPreference = "Stop"

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

Write-Host "=== Movie Web - Run ===" -ForegroundColor Cyan

# Đọc PORT backend từ backend/.env (mặc định 3001)
$apiPort = "3001"
$backendEnv = Join-Path $Root "backend\.env"
if (Test-Path $backendEnv) {
  $portLine = Get-Content $backendEnv -ErrorAction SilentlyContinue | Where-Object { $_ -match '^\s*PORT\s*=' }
  if ($portLine -match 'PORT\s*=\s*(\d+)') { $apiPort = $matches[1] }
} elseif (-not (Test-Path $backendEnv)) {
  Copy-Item (Join-Path $Root "backend\.env.example") $backendEnv
}

$frontendPort = if ($env:MOVIE_WEB_FRONTEND_PORT) { $env:MOVIE_WEB_FRONTEND_PORT } else { "3010" }

# 1. Docker
Write-Host "`n[1] Docker compose..." -ForegroundColor Yellow
docker compose up -d
Start-Sleep -Seconds 2

# 2. Backend - generate + migrate (không prompt tên migration)
Write-Host "`n[2] Backend prisma..." -ForegroundColor Yellow
Set-Location (Join-Path $Root "backend")
npm install 2>$null | Out-Null
npx prisma generate
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
  Write-Host "migrate deploy failed, try: npx prisma migrate dev" -ForegroundColor Red
  exit $LASTEXITCODE
}
npx prisma db seed
Set-Location $Root

# Đồng bộ frontend gọi đúng API
$envLocal = Join-Path $Root "frontend\.env.local"
"NEXT_PUBLIC_API_URL=http://localhost:$apiPort" | Set-Content $envLocal -Encoding utf8
Write-Host "Wrote $envLocal -> http://localhost:$apiPort" -ForegroundColor DarkGray

# 3. Start backend (cửa sổ mới)
Write-Host "`n[3] Start backend (port $apiPort)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command", "Set-Location '$Root\backend'; npm run start:dev"
) -WindowStyle Normal

# 4. Start frontend (cổng $frontendPort — tránh xung đột với app khác trên 3000)
Write-Host "`n[4] Start frontend (http://localhost:$frontendPort)..." -ForegroundColor Yellow
Set-Location (Join-Path $Root "frontend")
npm install 2>$null | Out-Null
npm run dev -- --port $frontendPort
