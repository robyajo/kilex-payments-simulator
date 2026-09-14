# Dokumentasi Deployment VPS: Kilex Payment Simulator

Dokumentasi ini adalah panduan lengkap *step-by-step* untuk melakukan deployment **Kilex Payment Simulator (Midtrans-Compatible Architecture)** ke server VPS Linux (Ubuntu 22.04 / 24.04 LTS atau Debian 12) dengan konfigurasi standar industri.

---

## 📚 Daftar Isi Panduan

| No | Modul Dokumentasi | Deskripsi |
| :--- | :--- | :--- |
| **01** | [**01_VPS_SERVER_PREREQUISITES.md**](./01_VPS_SERVER_PREREQUISITES.md) | Persiapan OS, hardening SSH, Firewall UFW, instalasi PHP 8.3 + ekstensi, Composer, Node.js 20+, MySQL 8.0, dan Redis. |
| **02** | [**02_NGINX_AND_PHP_FPM_CONFIGURATION.md**](./02_NGINX_AND_PHP_FPM_CONFIGURATION.md) | Konfigurasi virtual host Nginx (Server Block), optimasi FastCGI PHP 8.3 FPM, OPcache, dan security headers. |
| **03** | [**03_SUPERVISOR_QUEUE_WORKER.md**](./03_SUPERVISOR_QUEUE_WORKER.md) | Setup Supervisor background worker untuk memproses antrean webhook notifikasi (`queue:work`) dan Cron Scheduler. |
| **04** | [**04_SSL_HTTPS_SETUP.md**](./04_SSL_HTTPS_SETUP.md) | Konfigurasi DNS domain, instalasi sertifikat SSL gratis via Certbot (Let's Encrypt), auto-renew, dan force HTTPS. |
| **05** | [**05_DEPLOYMENT_SCRIPT_AND_CICD.md**](./05_DEPLOYMENT_SCRIPT_AND_CICD.md) | Konfigurasi `.env` production, script deploy otomatis zero-downtime (`deploy.sh`), dan integrasi GitHub Actions CI/CD. |
| **06** | [**06_TROUBLESHOOTING_AND_SECURITY.md**](./06_TROUBLESHOOTING_AND_SECURITY.md) | Panduan audit permissions storage, diagnosa error 502 Bad Gateway / 419 Page Expired, automated database backup, dan log monitoring. |

---

## 🚀 Ringkasan Arsitektur Production

```text
                                  ┌─────────────────────────────┐
                                  │      Client / Merchant      │
                                  └──────────────┬──────────────┘
                                                 │ HTTPS (Port 443)
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │   Nginx Reverse Proxy & SSL │
                                  └──────────────┬──────────────┘
                                                 │ FastCGI Unix Socket
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │         PHP 8.3 FPM         │
                                  │   (Laravel 11 + Inertia)    │
                                  └──────┬───────────────┬──────┘
                                         │               │
                     ┌───────────────────┴───┐       ┌───┴───────────────────┐
                     ▼                       ▼       ▼                       ▼
            ┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
            │   MySQL 8.0 DB  │    │  Redis / DB Queue │    │   Supervisor    │
            │   (Data Store)  │    │     (Jobs Msg)    │    │ (Queue Workers) │
            └─────────────────┘    └───────────────────┘    └────────┬────────┘
                                                                     │ POST Webhook
                                                                     ▼
                                                            [Merchant Endpoint]
```

---

## ⚡ Quickstart Commands (Untuk yang Sudah Terbiasa)

```bash
# 1. Masuk ke direktori web root
cd /var/www
git clone <repository-url> kilex-payments-simulator
cd kilex-payments-simulator

# 2. Setup Environment & Permissions
cp .env.example .env
sudo chown -R www-data:www-data /var/www/kilex-payments-simulator
sudo chmod -R 775 storage bootstrap/cache

# 3. Install & Build
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
npm ci && npm run build
php artisan config:cache && php artisan route:cache && php artisan view:cache

# 4. Jalankan Worker
sudo supervisorctl reread && sudo supervisorctl update
```
