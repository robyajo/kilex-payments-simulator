#!/bin/bash
set -e

# ==============================================================================
# Kilex Payment Simulator - Production VPS Deployment Script
# ==============================================================================

echo "--------------------------------------------------------"
echo "🚀 [$(date +'%Y-%m-%d %H:%M:%S')] Starting Deployment..."
echo "--------------------------------------------------------"

# 1. Put Application into Maintenance Mode
echo "🛑 Putting application into maintenance mode..."
php artisan down --retry=10 || true

# 2. Pull Latest Commits from Git
echo "📥 Pulling latest commits from Git..."
git pull origin main

# 3. Install PHP Dependencies (No Dev, Optimized Autoloader)
echo "📦 Installing PHP dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# 4. Run Database Migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# 5. Build Frontend React / Inertia Assets
echo "🎨 Building frontend assets..."
npm ci --prefer-offline --no-audit
npm run build

# 6. Clear and Cache Configuration, Routes, Views
echo "⚡ Rebuilding Laravel configuration caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 7. Restart Queue Workers & Supervisor
echo "🔄 Restarting queue workers..."
php artisan queue:restart
if command -v supervisorctl &> /dev/null; then
    sudo supervisorctl restart kilex-worker:* || true
fi

# 8. Exit Maintenance Mode
echo "✅ Bringing application out of maintenance mode..."
php artisan up

echo "--------------------------------------------------------"
echo "🎉 [$(date +'%Y-%m-%d %H:%M:%S')] Deployment Completed Successfully!"
echo "--------------------------------------------------------"
