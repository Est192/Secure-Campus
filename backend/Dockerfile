FROM php:8.4-fpm-alpine

ARG APP_ENV=production

RUN apk add --no-cache $PHPIZE_DEPS icu-dev libpq-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install -j"$(nproc)" bcmath intl mbstring opcache pcntl pdo_pgsql zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend/composer.json ./
RUN if [ "$APP_ENV" = "local" ]; then \
        composer install --prefer-dist --no-interaction --no-progress --no-scripts; \
    else \
        composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts; \
    fi

COPY backend/ ./

RUN if [ "$APP_ENV" = "local" ]; then \
        composer dump-autoload --classmap-authoritative; \
    else \
        composer dump-autoload --classmap-authoritative --no-dev; \
    fi \
    && mkdir -p storage/framework/cache/data storage/framework/sessions \
        storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/app-entrypoint.sh /usr/local/bin/securecampus-entrypoint
RUN chmod +x /usr/local/bin/securecampus-entrypoint

EXPOSE 9000

ENTRYPOINT ["securecampus-entrypoint"]
CMD ["php-fpm", "-F"]
