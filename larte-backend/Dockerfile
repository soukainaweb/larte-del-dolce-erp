FROM php:8.2-apache

# System dependencies for Composer and PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    libxml2-dev \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Install only extensions not bundled in php:8.2-apache.
# mbstring, dom, fileinfo, openssl, tokenizer, ctype, json, and xml are already available.
RUN docker-php-ext-install -j"$(nproc)" \
    pdo_mysql \
    zip

RUN php -r "foreach (['pdo_mysql', 'mbstring', 'dom', 'zip'] as \$ext) { if (!extension_loaded(\$ext)) { fwrite(STDERR, \"Missing PHP extension: {\$ext}\n\"); exit(1); } }"

RUN a2enmod rewrite headers

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

COPY docker/apache-laravel.conf /etc/apache2/conf-available/laravel.conf
RUN a2enconf laravel

# mod_php requires mpm_prefork; enforce after all Apache module/conf changes
COPY docker/ensure-mpm-prefork.sh /usr/local/bin/ensure-mpm-prefork.sh
RUN chmod +x /usr/local/bin/ensure-mpm-prefork.sh \
    && /usr/local/bin/ensure-mpm-prefork.sh

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts \
    --prefer-dist

COPY . .

RUN composer dump-autoload --optimize --no-interaction \
    && mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
