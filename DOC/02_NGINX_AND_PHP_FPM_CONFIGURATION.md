# 02. Nginx & PHP 8.3 FPM Configuration

Dokumen ini menjelaskan konfigurasi web server Nginx dan tuning PHP 8.3 FPM agar Laravel 11/12 + Inertia.js dapat berjalan dengan performa tinggi, aman, dan tanpa error perutean SPA.

---

## 1. Menyiapkan Direktori Aplikasi

Clone proyek ke `/var/www/kilex-payments-simulator`:

```bash
cd /var/www
sudo git clone https://github.com/username/kilex-payments-simulator.git
cd kilex-payments-simulator

# Buat file .env dari template
sudo cp .env.example .env

# Set permission kepemilikan user www-data (Nginx & PHP-FPM)
sudo chown -R www-data:www-data /var/www/kilex-payments-simulator
sudo chmod -R 775 /var/www/kilex-payments-simulator/storage
sudo chmod -R 775 /var/www/kilex-payments-simulator/bootstrap/cache

# Tambahkan user deployer ke grup www-data agar bisa mengedit file
sudo usermod -aG www-data deployer
```

---

## 2. Membuat Konfigurasi Virtual Host Nginx

Buat file konfigurasi baru di `/etc/nginx/sites-available/kilex-payments-simulator`:
```bash
sudo nano /etc/nginx/sites-available/kilex-payments-simulator
```

Isi dengan konfigurasi Nginx berikut (ganti `simulator.domainanda.com` dengan domain atau IP Anda):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name simulator.domainanda.com;

    # Point root ke folder /public Laravel
    root /var/www/kilex-payments-simulator/public;

    index index.php index.html;
    charset utf-8;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Batas ukuran upload (misal: 20MB)
    client_max_body_size 20M;

    # Log files
    access_log /var/log/nginx/kilex_access.log;
    error_log /var/log/nginx/kilex_error.log error;

    # Inertia & SPA Fallback routing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # PHP 8.3 FPM handler
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;

        # FastCGI Buffers Optimization
        fastcgi_buffer_size 32k;
        fastcgi_buffers 16 16k;
        fastcgi_busy_buffers_size 64k;
        fastcgi_temp_file_write_size 64k;
        fastcgi_read_timeout 120s;
        fastcgi_hide_header X-Powered-By;
    }

    # Block akses ke file tersembunyi (.env, .git, dll)
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Static Assets Caching (Vite build output)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 3. Mengaktifkan Virtual Host Nginx

Buat symlink dari `sites-available` ke `sites-enabled`:
```bash
sudo ln -s /etc/nginx/sites-available/kilex-payments-simulator /etc/nginx/sites-enabled/
```

Hapus konfigurasi default jika tidak digunakan:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Test integritas konfigurasi Nginx:
```bash
sudo nginx -t
```
*Pastikan output: `nginx: configuration file /etc/nginx/nginx.conf test is successful`*.

Reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## 4. Tuning PHP 8.3 FPM & OPcache

Buka file konfigurasi PHP FPM `php.ini`:
```bash
sudo nano /etc/php/8.3/fpm/php.ini
```

Sesuaikan parameter berikut untuk performa production:
```ini
max_execution_time = 60
max_input_time = 60
memory_limit = 256M
post_max_size = 25M
upload_max_filesize = 20M

; OPcache Settings (Wajib untuk performa tinggi Laravel)
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=1
```

Buka konfigurasi pool `www.conf`:
```bash
sudo nano /etc/php/8.3/fpm/pool.d/www.conf
```

Pastikan user dan socket sesuai:
```ini
user = www-data
group = www-data
listen = /var/run/php/php8.3-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 20
pm.start_servers = 4
pm.min_spare_servers = 2
pm.max_spare_servers = 6
pm.max_requests = 1000
```

Restart service PHP-FPM:
```bash
sudo systemctl restart php8.3-fpm
```
