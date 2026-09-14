# 04. SSL / HTTPS Setup (Certbot & Let's Encrypt)

Menggunakan protokol HTTPS wajib untuk simulator payment gateway agar SDK merchant (seperti `midtrans-php` atau `midtrans-client`) dapat mengirimkan request dengan aman dan tidak terhalang oleh kebijakan SSL/TLS di lingkungan staging maupun production.

---

## 1. Persiapan Domain & DNS Record

Pastikan Anda telah mengarahkan domain/subdomain ke IP Public VPS Anda pada penyedia DNS (Cloudflare, Niagahoster, Namecheap, Route53, dll):

| Tipe | Nama Record | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `simulator` (atau `@`) | `IP_PUBLIC_VPS_ANDA` | Auto / 300 |

*Tunggu beberapa menit hingga propagasi DNS selesai. Cek menggunakan `ping simulator.domainanda.com`*.

---

## 2. Instalasi Certbot (Let's Encrypt Client)

Install Certbot dan plugin Nginx via `snap` (metode resmi yang direkomendasikan):

```bash
# Pastikan snapd terupdate
sudo snap install core; sudo snap refresh core

# Hapus certbot versi apt lama jika ada
sudo apt remove certbot -y

# Install certbot versi snap
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

---

## 3. Generate Sertifikat SSL Otomatis untuk Nginx

Jalankan Certbot untuk memodifikasi konfigurasi Nginx secara otomatis:

```bash
sudo certbot --nginx -d simulator.domainanda.com
```

Certbot akan menanyakan beberapa hal:
1. **Email address:** Masukkan email Anda (digunakan untuk notifikasi perpanjangan jika terjadi error).
2. **Terms of Service:** Ketik `Y` untuk menyetujui.
3. **Share email:** Ketik `N` (opsional).
4. **Redirect HTTP to HTTPS:** Pilih opsi `2` (Redirect) agar semua request port 80 otomatis dialihkan ke port 443 HTTPS.

---

## 4. Verifikasi Auto-Renewal Sertifikat

Sertifikat Let's Encrypt berlaku selama 90 hari. Certbot otomatis memasang systemd timer untuk memperbarui sertifikat sebelum kedaluwarsa.

Lakukan simulasi pengujian perpanjangan (*dry run*):
```bash
sudo certbot renew --dry-run
```

*Jika output menampilkan `Congratulations, all simulated renewals succeeded`, maka SSL otomatis diperbarui tanpa intervensi manual.*

---

## 5. Hardening TLS Nginx (Opsional / Rekomendasi)

Untuk memastikan skor SSL `A+` di SSL Labs, Certbot otomatis menambahkan konfigurasi `ssl_dhparam`, `ssl_protocols TLSv1.2 TLSv1.3;`, dan cipher suites yang aman di `/etc/letsencrypt/options-ssl-nginx.conf`.

Reload Nginx:
```bash
sudo systemctl reload nginx
```

Buka URL `https://simulator.domainanda.com` di browser Anda untuk memastikan gembok hijau HTTPS aktif.
