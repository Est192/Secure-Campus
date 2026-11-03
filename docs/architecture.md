# SecureCampus Backend Architecture

## Overview

SecureCampus is a Laravel 13 JSON API running on PHP 8.4. PostgreSQL stores
application data, Redis provides cache and queue services, Laravel Sanctum
issues personal access tokens, and Laravel Storage handles uploaded files.
Nginx serves the React application and proxies `/api/` requests to PHP-FPM.
Docker Compose is the supported runtime; host PHP, Composer, and PostgreSQL
installations are not required.

## Request flow

1. Nginx forwards an API request to Laravel.
2. Laravel routes `/api/v1/*` requests through Sanctum authentication, except
   the rate-limited login endpoint.
3. Form Requests validate input and API controllers authorize operations.
4. Controllers use domain services for grade calculations, document storage,
   and request status transitions.
5. Eloquent models persist records in PostgreSQL and API resources serialize
   them to JSON. Password and remember-token fields are excluded.

## Application organization

| Area | Responsibility |
| --- | --- |
| `app/Models` | Eloquent records and relationships |
| `app/Http/Controllers/Api` | HTTP endpoints and orchestration |
| `app/Http/Requests` | Validation for writes and document uploads |
| `app/Http/Resources` | JSON resource serialization |
| `app/Services` | Grade averaging, document storage, and request workflow |
| `app/Policies` | Record-level access decisions |
| `database/migrations` | PostgreSQL schema evolution |
| `database/factories` | Reusable test data |
| `database/seeders` | Built-in roles and optional administrator bootstrap |
| `routes/api.php` | Health check, authentication, CRUD, and report endpoints |

## API conventions

- API version prefix: `/api/v1`.
- Authentication: `Authorization: Bearer <token>` using Sanctum.
- Successful resource responses use Laravel's `data` resource envelope;
  paginated collections include `data`, `links`, and `meta`.
- Validation errors use HTTP 422 and Laravel's JSON `message` and `errors`
  format. Authentication failures return 401; authorization failures return
  403; absent records return 404.
- List endpoints accept `per_page` (1–100; default 15). Supported list filters
  are documented in [api-usage.md](./api-usage.md).
- The API returns dates as ISO-formatted values and decimal grades as
  two-decimal strings, both suitable for explicit TypeScript parsing.

## Roles and authorization

The seeder creates Administrator, Teacher, Department Head, and Student roles.
Administrators manage role assignments and privileged user operations.
Department Heads and Administrators can manage academic records and review
requests. Students and Teachers are scoped to their own records and assigned
academic groups where supported. Policies are intentionally a basic starting
point, not hardened RBAC.

An administrator account is created only when both `BOOTSTRAP_ADMIN_EMAIL`
and `BOOTSTRAP_ADMIN_PASSWORD` are provided in `backend/.env` while running
the database seeder. The password must be at least 12 characters. No default
credentials are included.

## Extension points

`SECURITY_EXTENSION_POINT` markers identify future integration points for MFA,
RBAC hardening, audit events, encryption, OWASP controls, and monitoring.
These features are not implemented by this baseline.

## Docker lifecycle

The app entrypoint applies pending migrations before PHP-FPM starts. A
migration failure stops the app container. Roles are seeded explicitly with
`docker compose exec app php artisan db:seed --force`; seeding is idempotent.
Uploaded documents use Laravel's private `local` disk and are downloaded
through an authenticated, policy-checked API endpoint.

See [database-schema.md](./database-schema.md) for entity relationships and
[openapi.yaml](./openapi.yaml) for the API contract.
