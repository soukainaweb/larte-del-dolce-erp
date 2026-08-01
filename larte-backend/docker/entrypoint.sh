#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

PORT="${PORT:-80}"

echo "Starting Laravel backend (APP_ENV=${APP_ENV:-unset}, PORT=${PORT})"

# Ensure writable Laravel directories
mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Discover packages after runtime env is available
php artisan package:discover --ansi

# Public storage symlink (safe to rerun)
php artisan storage:link --force 2>/dev/null || true

# Run migrations with retries while the database becomes available
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  for attempt in $(seq 1 30); do
    if php artisan migrate --force --no-interaction; then
      echo "Migrations completed successfully."
      break
    fi

    if [ "$attempt" -eq 30 ]; then
      echo "Database migrations failed after ${attempt} attempts."
      exit 1
    fi

    echo "Migration attempt ${attempt} failed; retrying in 2s..."
    sleep 2
  done
else
  echo "Skipping migrations (RUN_MIGRATIONS=${RUN_MIGRATIONS})."
fi

# Production optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Configure Apache to listen on Render's dynamic port
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
