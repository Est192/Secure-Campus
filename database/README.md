# Database

PostgreSQL is the authoritative relational database. The Compose service is
named `postgres`; Laravel migrations and seeders are maintained in
`backend/database/`.

Use the application container for schema changes:

```sh
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
```

The database service is not published to the host by default. Use
`docker compose exec postgres psql -U securecampus -d securecampus` for
administrative access in a local development environment.
