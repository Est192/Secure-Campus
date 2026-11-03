#!/bin/sh
set -eu

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required. Install Docker Engine and the Compose plugin, then try again." >&2
    exit 1
fi

docker compose version

if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example. Set a unique POSTGRES_PASSWORD before deployment."
fi

echo "Installation checks passed. Start the application with ./scripts/start.sh."
