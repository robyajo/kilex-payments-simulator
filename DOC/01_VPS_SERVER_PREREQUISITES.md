# 01. VPS Server Prerequisites & Environment Setup

Dokumen ini menjelaskan langkah persiapan server Linux VPS baru (Ubuntu 22.04 LTS / Ubuntu 24.04 LTS) dari nol sebelum melakukan instalasi aplikasi Kilex Payment Simulator.

---

## 1. Update Sistem Operasi & Buat User Non-Root

Login ke VPS via SSH sebagai `root`:
```bash
ssh root@YOUR_SERVER_IP
```

Lakukan update seluruh paket sistem:
```bash
apt update && apt upgrade -y
```

Buat user administrator baru (misal: `deployer`) dan berikan akses `sudo`:
```bash
adduser deployer
usermod -aG sudo deployer
```

Salin SSH key root ke user `deployer`:
```bash
rsync --archive --chown=deployer:deployer ~/.ssh /home/deployer
```

---

## 2. Hardening SSH & Firewall (UFW)

Buka file konfigurasi SSH:
```bash
sudo nano /etc/ssh/sshd_config
```
Ubah atau pastikan konfigurasi berikut aktif:
```text
PermitRootLogin no
PasswordAuthentication no
```
Restart service SSH:
```bash
sudo systemctl restart ssh
```

Konfigurasi Firewall UFW:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 3. Instalasi PHP 8.3 & Ekstensi yang Dibutuhkan

Tambahkan PPA Ondřej Surý untuk PHP 8.3:
```bash
sudo apt install -y software-properties-common lsb-release ca-certificates apt-transport-https
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
```

Install PHP 8.3 FPM, CLI, dan ekstensi lengkap Laravel:
```bash
sudo apt install -y php8.3-fpm php8.3-cli php8.3-common \
    php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl \
    php8.3-zip php8.3-bcmath php8.3-intl php8.3-gd \
    php8.3-redis php8.3-soap php8.3-sqlite3
```

Verifikasi instalasi PHP:
```bash
php -v
# Output harus PHP 8.3.x
```

---

## 4. Instalasi Composer (PHP Dependency Manager)

Download dan install Composer 2 secara global:
```bash
curl -sS https://getcomposer.org/installer -o composer-setup.php
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
rm composer-setup.php

composer --version
```

---

## 5. Instalasi Node.js 20+ LTS & NPM

Tambahkan repository NodeSource untuk Node.js 20.x:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node -v
npm -v
```

---

## 6. Instalasi Database MySQL 8.0 & Redis

### 6.1 MySQL 8.0
Install MySQL Server:
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Login ke MySQL dan buat database & user untuk aplikasi:
```bash
sudo mysql
```

Eksekusi perintah SQL berikut:
```sql
CREATE DATABASE db_kilex_payment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kilex_user'@'localhost' IDENTIFIED BY 'PasswordKuatAnda_123!';
GRANT ALL PRIVILEGES ON db_kilex_payment.* TO 'kilex_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 6.2 Redis Server (Untuk Cache & Horizon / Queue)
Install Redis Server:
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test koneksi redis
redis-cli ping
# Output: PONG
```

---

## 7. Instalasi Nginx & Git

```bash
sudo apt install -y nginx git unzip
sudo systemctl enable nginx
sudo systemctl start nginx
```

Setelah langkah di atas selesai, server VPS Anda telah siap untuk tahap konfigurasi Nginx dan aplikasi pada [**02_NGINX_AND_PHP_FPM_CONFIGURATION.md**](./02_NGINX_AND_PHP_FPM_CONFIGURATION.md).
