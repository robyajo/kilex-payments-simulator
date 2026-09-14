---
name: deploying-to-vps
description: "Deploys and manages Laravel 11/12 applications on Ubuntu/Debian Linux VPS servers with Nginx, PHP 8.3 FPM, MySQL, Redis, Supervisor Queue Worker, and SSL Certbot. Use when the user asks how to deploy to a VPS, configure Nginx, set up Supervisor queue workers, configure SSL/HTTPS, manage environment variables, or automate deployments on a Linux server."
license: MIT
metadata:
  author: kilex-payments
---

# Deploying Laravel Applications to Linux VPS

This skill provides step-by-step guidance for deploying this Laravel 11/12 + Inertia React application to an Ubuntu/Debian VPS.

---

## 1. Quick Server Prerequisites Checklist

Ensure the VPS has the following packages installed:
- **OS:** Ubuntu 22.04 / 24.04 LTS or Debian 12
- **Web Server:** Nginx
- **PHP:** PHP 8.3 with extensions: `php8.3-fpm`, `php8.3-mysql`, `php8.3-curl`, `php8.3-mbstring`, `php8.3-xml`, `php8.3-zip`, `php8.3-bcmath`, `php8.3-intl`, `php8.3-redis`
- **Database:** MySQL 8.0+ or MariaDB 10.11+
- **Process Manager:** Supervisor (for `queue:work`)
- **Package Managers:** Composer 2.x, Node.js 20+ LTS & NPM

---

## 2. Recommended Directory & Permissions

Place the application in `/var/www/kilex-payments-simulator`:

```bash
# Clone or upload repository
cd /var/www
git clone <repo-url> kilex-payments-simulator
cd kilex-payments-simulator

# Set correct ownership & permissions
sudo chown -R www-data:www-data /var/www/kilex-payments-simulator
sudo chmod -R 775 /var/www/kilex-payments-simulator/storage /var/www/kilex-payments-simulator/bootstrap/cache
```

---

## 3. Nginx Server Configuration

Create `/etc/nginx/sites-available/kilex-payments-simulator`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name simulator.yourdomain.com;
    root /var/www/kilex-payments-simulator/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/kilex-payments-simulator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Supervisor Queue Worker Configuration

To ensure background webhook notifications (`SendMidtransNotificationJob`) are delivered reliably, configure Supervisor:

Create `/etc/supervisor/conf.d/kilex-worker.conf`:

```ini
[program:kilex-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/kilex-payments-simulator/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/kilex-payments-simulator/storage/logs/worker.log
stopwaitsecs=3600
```

Start Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start kilex-worker:*
```

---

## 5. Automated Deployment Script (`deploy.sh`)

Run this script for zero-downtime updates:

```bash
#!/bin/bash
set -e

echo "Deploying application..."

# Enter maintenance mode
php artisan down || true

# Pull latest commits
git pull origin main

# Install backend dependencies
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Run database migrations
php artisan migrate --force

# Build frontend assets
npm ci
npm run build

# Clear and rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers
php artisan queue:restart
sudo supervisorctl restart kilex-worker:*

# Exit maintenance mode
php artisan up

echo "Application deployed successfully!"
```
