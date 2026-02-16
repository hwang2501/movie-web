# Movie Web - Chạy full stack (Windows)
# Chạy: .\scripts\run.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Movie Web - Run ===" -ForegroundColor Cyan

# 1. Docker
Write-Host "`n[1] Docker compose..." -ForegroundColor Yellow
docker compose up -d
Start-Sleep -Seconds 5

# 2. Backend - migrate + seed
Write-Host "`n[2] Backend migrate + seed..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm install 2>$null | Out-Null
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
Set-Location ..

# 3. Start backend (background)
Write-Host "`n[3] Start backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev" -WindowStyle Normal

# 4. Start frontend
Write-Host "`n[4] Start frontend..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path .env.local)) { "NEXT_PUBLIC_API_URL=http://localhost:3001" | Out-File .env.local }
npm install 2>$null | Out-Null
npm run dev
