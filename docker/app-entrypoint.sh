#!/bin/sh
set -eu

if [ ! -f .env ]; then
    cp .env.example .env
fi

key_file=/var/run/securecampus/app_key

mkdir -p storage/framework/cache/data storage/framework/sessions \
    storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

if [ -z "${APP_KEY:-}" ]; then
    mkdir -p "$(dirname "$key_file")"
    if [ ! -s "$key_file" ]; then
        php artisan key:generate --show --no-ansi > "$key_file"
        chmod 600 "$key_file"
    fi
    export APP_KEY
    APP_KEY="$(cat "$key_file")"
fi

php artisan migrate --force --no-interaction

exec "$@"
