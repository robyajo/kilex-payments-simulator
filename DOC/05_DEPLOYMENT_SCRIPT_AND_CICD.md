# 05. Deployment Script & CI/CD Pipeline

Dokumen ini menyediakan panduan konfigurasi file `.env` production, script deployment otomatis zero-downtime (`deploy.sh`), dan workflow GitHub Actions CI/CD.

---

## 1. Konfigurasi Environment Production (`.env`)

Buka file `/var/www/kilex-payments-simulator/.env`:
```bash
sudo nano /var/www/kilex-payments-simulator/.env
```

Pastikan variabel-variabel kunci diatur sebagai berikut:

```dotenv
APP_NAME="Kilex Payment Simulator"
APP_ENV=production
APP_KEY=base64:uZlTFP+F0Y5UJXOH2KaK/Zkixzjdu42dG7xQaEa+370=
APP_DEBUG=false
APP_URL=https://simulator.domainanda.com

LOG_CHANNEL=daily
LOG_LEVEL=error

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_kilex_payment
DB_USERNAME=kilex_user
DB_PASSWORD=PasswordKuatAnda_123!

# Session, Cache & Queue Driver
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=redis
QUEUE_CONNECTION=database
# Atau gunakan redis jika redis-server aktif:
# QUEUE_CONNECTION=redis

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

VITE_APP_NAME="${APP_NAME}"
```

---

## 2. Script Deployment Otomatis (`deploy.sh`)

Buat file script `deploy.sh` di root direktori proyek:
```bash
sudo nano /var/www/kilex-payments-simulator/deploy.sh
```

Isi dengan konten berikut:

```bash
#!/bin/bash
set -e

PROJECT_DIR="/var/www/kilex-payments-simulator"
cd $PROJECT_DIR

echo "--------------------------------------------------------"
echo "🚀 [$(date +'%Y-%m-%d %H:%M:%S')] Starting Deployment..."
echo "--------------------------------------------------------"

# 1. Aktifkan Maintenance Mode
echo "🛑 Putting application into maintenance mode..."
php artisan down --render="errors::503" --retry=10 || true

# 2. Pull Kode Terbaru dari Repository Git
echo "📥 Pulling latest commits from Git..."
git pull origin main

# 3. Install & Optimize Composer Dependencies
echo "📦 Installing PHP composer dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# 4. Jalankan Migrasi Database
echo "🗄️ Running database migrations..."
php artisan migrate --force

# 5. Install & Build Frontend Assets (Vite / React)
echo "🎨 Building frontend assets..."
npm ci --prefer-offline --no-audit
npm run build

# 6. Rebuild Cache Konfigurasi & Rute
echo "⚡ Rebuilding Laravel configuration caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 7. Restart Queue Worker di Supervisor
echo "🔄 Restarting queue workers..."
php artisan queue:restart
sudo supervisorctl restart kilex-worker:*

# 8. Matikan Maintenance Mode
echo "✅ Bringing application out of maintenance mode..."
php artisan up

echo "--------------------------------------------------------"
echo "🎉 [$(date +'%Y-%m-%d %H:%M:%S')] Deployment Completed!"
echo "--------------------------------------------------------"
```

Berikan hak eksekusi pada script:
```bash
sudo chmod +x /var/www/kilex-payments-simulator/deploy.sh
```

Kapan pun Anda ingin melakukan update aplikasi di server, cukup jalankan:
```bash
./deploy.sh
```

---

## 3. Otomasi CI/CD via GitHub Actions (Opsional)

Jika repository Anda di-host di GitHub, Anda dapat mengotomatiskan proses deploy setiap kali push ke branch `main`.

Buat file `.github/workflows/deploy.yml` di repository:

```yaml
name: Deploy to Production VPS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest

    steps:
      - name: SSH and Deploy Application
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_PRIVATE_KEY }}
          port: ${{ secrets.VPS_SSH_PORT || 22 }}
          script: |
            cd /var/www/kilex-payments-simulator
            ./deploy.sh
```

### Konfigurasi GitHub Repository Secrets:
Buka **GitHub Repository > Settings > Secrets and variables > Actions**:
- `VPS_HOST`: IP Public Server VPS Anda.
- `VPS_USERNAME`: User SSH (misal: `deployer`).
- `VPS_SSH_PRIVATE_KEY`: Private SSH Key dari user `deployer`.
- `VPS_SSH_PORT`: Port SSH (default: `22`).
