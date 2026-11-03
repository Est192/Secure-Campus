$ErrorActionPreference = "Stop"

if (-not (Test-Path ".env")) {
    & "$PSScriptRoot\install.ps1"
    if ($LASTEXITCODE -ne 0) {
        throw "Installation setup failed."
    }
}

docker compose up --build --detach
if ($LASTEXITCODE -ne 0) {
    throw "The SecureCampus containers did not start successfully."
}

Write-Host "SecureCampus is starting. Frontend: http://localhost:5173  API: http://localhost:8080/api/health"
