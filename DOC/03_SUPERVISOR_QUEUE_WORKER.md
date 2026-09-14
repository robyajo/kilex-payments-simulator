# 03. Supervisor Queue Worker & Cron Scheduler

Aplikasi Kilex Payment Simulator menggunakan antrean asinkron (*Queue Worker*) untuk mengirim notifikasi HTTP POST webhook ke server merchant (`SendMidtransNotificationJob`). Supervisor bertugas memastikan proses worker selalu aktif di background dan otomatis restart jika terjadi crash atau server reboot.

---

## 1. Instalasi Supervisor

Install paket Supervisor di VPS:
```bash
sudo apt install -y supervisor
sudo systemctl enable supervisor
sudo systemctl start supervisor
```

---

## 2. Membuat Konfigurasi Queue Worker

Buat file konfigurasi Supervisor baru di `/etc/supervisor/conf.d/kilex-worker.conf`:
```bash
sudo nano /etc/supervisor/conf.d/kilex-worker.conf
```

Isi dengan konfigurasi berikut:

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
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
stopwaitsecs=3600
```

### Penjelasan Parameter:
- `numprocs=2`: Menjalankan 2 proses worker paralel untuk memproses webhook secara simultan.
- `--sleep=3`: Worker akan istirahat 3 detik jika tidak ada job di antrean.
- `--tries=3`: Percobaan pengiriman maksimal 3 kali sebelum job dianggap gagal (*failed job*).
- `--max-time=3600`: Worker di-restart tiap 1 jam untuk mencegah kebocoran memori (*memory leak*).
- `user=www-data`: Dijalankan dengan hak akses web server untuk keamanan.

---

## 3. Memuat & Menjalankan Worker

Muat konfigurasi baru ke Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
```

Cek status worker:
```bash
sudo supervisorctl status
```

Output yang diharapkan:
```text
kilex-worker:kilex-worker_00   RUNNING   pid 18234, uptime 0:01:12
kilex-worker:kilex-worker_01   RUNNING   pid 18235, uptime 0:01:12
```

### Perintah Berguna Supervisor:
```bash
# Restart seluruh worker setelah deploy kode baru
sudo supervisorctl restart kilex-worker:*

# Stop worker
sudo supervisorctl stop kilex-worker:*

# Start worker
sudo supervisorctl start kilex-worker:*
```

---

## 4. Konfigurasi Cron Scheduler (Laravel Task Scheduling)

Laravel menyediakan penjadwalan otomatis untuk membersihkan token lama, mengecek transaksi kedaluwarsa, dsb.

Buka cron editor user `www-data`:
```bash
sudo crontab -u www-data -e
```

Tambahkan baris berikut di bagian paling bawah:
```text
* * * * * cd /var/www/kilex-payments-simulator && php artisan schedule:run >> /dev/null 2>&1
```

Simpan dan tutup editor. Cron ini akan berjalan setiap 1 menit secara otomatis.
