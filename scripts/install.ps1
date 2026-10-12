$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is required. Install Docker Desktop and try again."
}

docker compose version
if ($LASTEXITCODE -ne 0) {
    throw "Docker Compose is unavailable. Update Docker Desktop and try again."
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example. Set a unique POSTGRES_PASSWORD before deployment."
}

Write-Host "Installation checks passed. Start the application with .\scripts\start.ps1."
