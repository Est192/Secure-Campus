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

The only requirement for local development is Docker Desktop (or Docker Engine
with Compose) running on your computer. No local PHP, Composer, Node.js,
database, or manual `.env` setup is needed.

On Windows PowerShell:

```powershell
.\scripts\install.ps1
.\scripts\start.ps1
```

On macOS or Linux:

```sh
sh ./scripts/install.sh
sh ./scripts/start.sh
```

The installer creates a root `.env` from `.env.example` if one does not exist.
The local example settings work as-is; change the database password and other
secrets before deploying beyond a trusted local environment.

You can also start the complete development stack directly:

```sh
docker compose up -d --build
```

This command also works on a fresh checkout without first running the
installer; Compose uses the local development defaults in `docker-compose.yml`.

The application generates and persists a Laravel application key on first
startup when `APP_KEY` is blank. It automatically runs pending migrations
before starting PHP-FPM.

## Development

- React development server with hot reload: <http://localhost:5173>
- Nginx and Laravel: <http://localhost:8080>
- API health check: <http://localhost:8080/api/health>
- Laravel's built-in health check: <http://localhost:8080/up>

The frontend includes a dashboard and sections for academics, grades,
<<<<<<< HEAD
documents, requests, people, groups, reports, calendar, settings, and help.
The people, documents, requests, and profile settings surfaces use the Laravel
API; several other sections still use in-memory sample data and
demonstration-only actions. Login and logout use the API. Password reset is
not available in the backend.
=======
documents, requests, people, academic groups, reports, calendar, settings,
and help. Authentication, profile, people, documents, requests, grades,
academic groups, academics, and reports use the Laravel API. Dashboard counts
are derived from visible API resources. Attendance, performance history,
recent activity, notifications, and calendar events remain clearly labeled
placeholders because the backend does not provide those data sources. A
proposed dashboard summary contract is documented in
[docs/dashboard-summary-proposal.md](./docs/dashboard-summary-proposal.md);
the endpoint has not been implemented. Login and logout use the API. Password
reset is not available in the backend.
>>>>>>> sprint-emilio

Frontend source changes are available through the Vite server immediately.
Backend changes are bind-mounted into the PHP container. The node container
proxies `/api` requests to Nginx.

## Backend API

The Laravel REST API is versioned under `/api/v1`; `/api/health` remains
available for health checks. The backend provides role-aware user, academic,
enrollment, grade, document, and request endpoints, plus summary reports.
Management endpoints require a Sanctum bearer token; API login and logout are
available at `/api/v1/auth/login` and `/api/v1/auth/logout`.

Read [docs/api-usage.md](./docs/api-usage.md) for endpoint examples and
[docs/openapi.yaml](./docs/openapi.yaml) for the OpenAPI contract. The data
model and relationships are described in
[docs/database-schema.md](./docs/database-schema.md), with the application
structure in [docs/architecture.md](./docs/architecture.md).

Run backend checks and inspect the registered endpoints inside Docker:

```sh
docker compose exec app php artisan test
docker compose exec app php artisan route:list --path=api
docker compose exec app php artisan migrate:status
```

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

The database seeder creates the Administrator, Teacher, Department Head, and
Student roles. It does not create a default account. To bootstrap an
administrator for local development, set both `BOOTSTRAP_ADMIN_EMAIL` and
`BOOTSTRAP_ADMIN_PASSWORD` in `backend/.env`, then rerun the seeder. The
password must be at least 12 characters. Remove bootstrap credentials after
the initial account is created. Production deployment uses `--force` for
migrations and seeders; do not add sample accounts or test data to production
seeders.

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
