#!/bin/sh
set -eu

if [ ! -f .env ]; then
    "$(dirname "$0")/install.sh"
fi

docker compose up --build --detach
echo "SecureCampus is starting. Frontend: http://localhost:5173  API: http://localhost:8080/api/health"
