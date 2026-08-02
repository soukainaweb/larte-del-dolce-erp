#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

PORT="${PORT:-80}"

echo "Starting Laravel backend (PORT=${PORT})"

mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

php artisan package:discover --ansi

echo "Running database migrations..."
for attempt in $(seq 1 30); do
  if php artisan migrate --force --no-interaction; then
    break
  fi
  if [ "$attempt" -eq 30 ]; then
    echo "Migrations failed after 30 attempts."
    exit 1
  fi
  echo "Migration attempt ${attempt} failed; retrying in 2s..."
  sleep 2
done

php artisan config:cache
php artisan route:cache
php artisan view:cache

/usr/local/bin/ensure-mpm-prefork.sh

if grep -q '^Listen ' /etc/apache2/ports.conf; then
  sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
else
  echo "Listen ${PORT}" >> /etc/apache2/ports.conf
fi

if [ -f /etc/apache2/sites-available/000-default.conf ]; then
  sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf
fi

echo "Apache listening on port ${PORT}"
exec apache2-foreground
