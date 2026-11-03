# Deployment

SecureCampus can be deployed with Docker Compose without installing PHP,
Composer, Node.js, or PostgreSQL on the host. Production runs the compiled
React application from Nginx and does not publish the Vite development server.

## Prepare production settings

1. Install Docker Engine with the Docker Compose plugin.
2. Copy `.env.example` to `.env`.
3. Set `APP_ENV=production`, `APP_DEBUG=false`, a unique `POSTGRES_PASSWORD`,
   and an externally managed `APP_KEY`.
4. Restrict access to the host port configured by `APP_HTTP_PORT` and terminate
   TLS at a trusted reverse proxy or load balancer.
5. Back up the PostgreSQL and Redis volumes according to the deployment's
   recovery requirements.

The app container creates an application key in its persistent named volume
when `APP_KEY` is not supplied. Set and protect an explicit `APP_KEY` for
production, and back up that key separately from the database.

## Build and start

```sh
docker compose -f docker-compose.yml -f docker-compose.production.yml up --build --detach
```

The production override sets Laravel's production environment and disables
the Vite development service. Nginx serves the frontend build and forwards
`/api/` requests to Laravel. Laravel migrations run automatically when the
application container starts; a failed migration prevents the app from
starting.

Check service health and logs:

```sh
docker compose ps
docker compose logs --follow app nginx
```

## Database operations

Run migrations or seeders explicitly as needed:

```sh
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --force
docker compose exec app php artisan migrate:status
```

Do not seed production with sample or test accounts. Design and review
production seed data separately before adding it.

## Operational notes

- PostgreSQL and Redis are only reachable on the internal Compose network;
  neither publishes a host port by default.
- Preserve the `postgres_data`, `redis_data`, and `app_key` volumes when
  recreating services.
- Build and deploy immutable, reviewed image versions through the
  organization's release process.
- Configure TLS, secrets, backups, monitoring, and host-level firewall rules
  before exposing the service to users.
- SECURITY_EXTENSION_POINT: future work may add MFA, RBAC hardening, audit
  logs, encryption, OWASP hardening, and threat detection.
