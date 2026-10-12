# SecureCampus

SecureCampus is a containerized Laravel and React starter for campus safety
and operations. The default Docker Compose stack runs PHP-FPM, Nginx,
PostgreSQL, Redis, and a Vite development server. PHP, Composer, Node.js, and
PostgreSQL do not need to be installed on the host.

## Requirements

- Docker Desktop with Docker Compose v2 on Windows or macOS, or Docker Engine
  with the Compose plugin on Linux
- Git, if cloning the project

## Installation

On Windows PowerShell:

```powershell
.\scripts\install.ps1
.\scripts\start.ps1
```

On macOS or Linux:

```sh
./scripts/install.sh
./scripts/start.sh
```

The installer creates a root `.env` from `.env.example` if one does not exist.
For a local installation, the example database password is sufficient to get
started. Change it to a unique secret before deploying beyond a trusted local
environment.

You can also start the complete development stack directly:

```sh
docker compose up -d --build
```

The application generates and persists a Laravel application key on first
startup when `APP_KEY` is blank. It automatically runs pending migrations
before starting PHP-FPM.

## Development

- React development server with hot reload: <http://localhost:5173>
- Nginx and Laravel: <http://localhost:8080>
- API health check: <http://localhost:8080/api/health>
- Laravel's built-in health check: <http://localhost:8080/up>

Frontend source changes are available through the Vite server immediately.
Backend changes are bind-mounted into the PHP container. The node container
proxies `/api` requests to Nginx.

Useful commands:

```sh
docker compose ps
docker compose logs --follow
docker compose exec app php artisan about
docker compose exec app php artisan route:list
docker compose exec app composer test
docker compose exec node npm run typecheck
```

The Vite service installs frontend dependencies into a named Docker volume on
startup. To rebuild the frontend runtime image and its production assets after
changing frontend dependencies or source, run:

```sh
docker compose build --no-cache nginx
docker compose up -d
```

## Migrations and seeders

Migrations run automatically on app-container startup. To run them manually:

```sh
docker compose exec app php artisan migrate
docker compose exec app php artisan migrate:status
```

Run the database seeder when needed:

```sh
docker compose exec app php artisan db:seed
```

Production deployment uses `--force` for migrations and seeders. Do not add
sample accounts or test data to production seeders.

## Frontend build

Build the production React assets inside the Node build stage used by Nginx:

```sh
docker compose build nginx
```

The standard `docker compose up -d --build` command builds these assets and
serves them from Nginx. During development, use the Vite address on port 5173.

## Docker usage

```sh
docker compose up -d --build
docker compose down
docker compose logs --follow app nginx postgres redis node
```

`docker compose down` preserves named volumes. To inspect the PostgreSQL
database:

```sh
docker compose exec postgres psql -U securecampus -d securecampus
```

PostgreSQL and Redis are not exposed on host ports by default. Set
`APP_HTTP_PORT` and `VITE_PORT` in `.env` to change the local web addresses.

## Production deployment

Review [docs/deployment.md](./docs/deployment.md) before deployment. Set
`APP_ENV=production`, `APP_DEBUG=false`, unique database credentials, and a
protected `APP_KEY`, then run:

```sh
docker compose -f docker-compose.yml -f docker-compose.production.yml up --build --detach
```

The production override disables the Vite development server. Configure TLS
and backups before exposing the application to users. Keep PostgreSQL, Redis,
and application-key volumes persistent across deployments.

## Internationalization

English (US) is the frontend default. Translation resources for English (US),
Spanish (Mexico), Spanish (Spain), French, German, Portuguese (Brazil), and
Japanese are under `frontend/src/locales/`. The language selector persists
its selection in browser local storage. Laravel defaults to the `en_US` locale.

All new user-facing frontend text belongs in the locale resources rather than
in React components.

## Security extension points

This scaffold intentionally does not implement advanced security features.
Future work may add MFA, RBAC hardening, audit logs, encryption, OWASP
hardening, and threat detection.
