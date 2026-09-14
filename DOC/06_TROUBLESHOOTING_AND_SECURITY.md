# 06. Troubleshooting & Security Maintenance

Dokumen ini berisi panduan penyelesaian masalah umum (*troubleshooting*), pemeriksaan log server, dan skrip *backup* database otomatis.

---

## 1. Panduan Diagnosa Masalah Umum

### 1.1 Error `502 Bad Gateway`
**Penyebab:** Nginx tidak dapat terhubung ke socket PHP 8.3 FPM.
**Solusi:**
1. Cek apakah PHP 8.3 FPM sedang berjalan:
   ```bash
   sudo systemctl status php8.3-fpm
   ```
2. Pastikan file socket `/var/run/php/php8.3-fpm.sock` ada:
   ```bash
   ls -la /var/run/php/php8.3-fpm.sock
   ```
3. Restart PHP-FPM dan Nginx:
   ```bash
   sudo systemctl restart php8.3-fpm && sudo systemctl restart nginx
   ```

---

### 1.2 Error `403 Forbidden` atau `The stream or file ".../laravel.log" could not be opened`
**Penyebab:** Izin akses direktori `storage` atau `bootstrap/cache` tidak sesuai.
**Solusi:**
Reset hak akses kepemilikan ke user `www-data`:
```bash
sudo chown -R www-data:www-data /var/www/kilex-payments-simulator/storage
sudo chown -R www-data:www-data /var/www/kilex-payments-simulator/bootstrap/cache
sudo chmod -R 775 /var/www/kilex-payments-simulator/storage
sudo chmod -R 775 /var/www/kilex-payments-simulator/bootstrap/cache
```

---

### 1.3 Error `419 Page Expired` / CSRF Token Mismatch
**Penyebab:** Cache sesi tidak valid atau domain `APP_URL` dan `SESSION_DOMAIN` di `.env` tidak sesuai dengan domain di browser.
**Solusi:**
1. Pastikan `APP_URL` di `.env` menggunakan protokol `https://` yang sama dengan browser.
2. Bersihkan cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

---

### 1.4 Webhook Notifikasi Tidak Terkirim ke Merchant
**Penyebab:** Queue Worker Supervisor mati atau merchant URL unreachable / timeout.
**Solusi:**
1. Periksa status worker:
   ```bash
   sudo supervisorctl status
   ```
2. Periksa log worker:
   ```bash
   tail -n 50 /var/www/kilex-payments-simulator/storage/logs/worker.log
   ```
3. Cek daftar failed jobs:
   ```bash
   php artisan queue:failed
   ```
4. Coba jalankan ulang job yang gagal:
   ```bash
   php artisan queue:retry all
   ```

---

## 2. Monitoring Log Server Real-Time

### Log Aplikasi Laravel:
```bash
tail -f /var/www/kilex-payments-simulator/storage/logs/laravel.log
```

### Log Nginx Error & Access:
```bash
sudo tail -f /var/log/nginx/kilex_error.log
sudo tail -f /var/log/nginx/kilex_access.log
```

---

## 3. Skrip Otomatisasi Backup Database MySQL

Buat direktori backup di server:
```bash
sudo mkdir -p /var/backups/kilex-db
```

Buat file script backup di `/usr/local/bin/backup-kilex-db.sh`:
```bash
sudo nano /usr/local/bin/backup-kilex-db.sh
```

Isi dengan kode berikut:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/kilex-db"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="db_kilex_payment"
DB_USER="kilex_user"
DB_PASS="PasswordKuatAnda_123!"

# Dump database ke file terkompresi .gz
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Hapus file backup yang lebih tua dari 14 hari
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +14 -exec rm {} \;

echo "Backup completed: db_backup_$DATE.sql.gz"
```

Berikan hak eksekusi:
```bash
sudo chmod +x /usr/local/bin/backup-kilex-db.sh
```

Jadwalkan backup harian pada jam 02:00 pagi via crontab:
```bash
sudo crontab -e
```
Tambahkan baris berikut:
```text
0 2 * * * /usr/local/bin/backup-kilex-db.sh >> /var/log/db_backup.log 2>&1
```
