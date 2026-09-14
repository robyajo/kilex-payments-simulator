# Product Requirements Document (PRD) & Entity Relationship Diagram (ERD)
## Mock Payment Gateway Simulator (Laravel + React Starter Kit)

---

## 1. Overview & Objectives

**Payment Simulator** adalah platform *mock payment gateway* mandiri yang memungkinkan developer menguji alur checkout, transaksi, dan integrasi webhook (QRIS & Virtual Account) secara lokal maupun staging tanpa menggunakan uang riil.

### 1.1 Key Objectives
- Menyediakan endpoint REST API mandiri yang meniru arsitektur payment gateway komersial (seperti Midtrans, Xendit, Stripe).
- Menyediakan halaman simulasi interaktif (checkout UI) untuk memicu skenario pembayaran sukses, gagal, atau kedaluwarsa.
- Menjamin keandalan pengujian webhook melalui mekanisme antrean asinkron (*Queue Worker*) dan penandatanganan payload (*HMAC-SHA256 signature*).
- Menyediakan dashboard inspeksi transaksi dan log pengiriman webhook secara transparan untuk mempermudah debugging.

---

## 2. Tech Stack & Architecture

- **Backend Framework:** Laravel 11.x (PHP 8.2+)
- **Frontend / Starter Kit:** Laravel React Starter Kit (Inertia.js v2, React 18/19, Tailwind CSS)
- **Database:** PostgreSQL / MySQL
- **Queue & Caching:** Redis + Laravel Horizon
- **Authentication:** Laravel Breeze / Fortify bawaan starter kit + Laravel Sanctum untuk API token merchant

---

## 3. Core Features & Functional Requirements

| Modul | Fitur | Deskripsi |
| :--- | :--- | :--- |
| **Merchant Management** | Multi-tenant Client & API Keys | Developer dapat membuat profil merchant dan memperoleh sepasang kredensial: `Server Key` (Backend API) dan `Client Key` (Frontend Checkout). |
| **Transaction Engine** | Create Charge API | Menerima payload transaksi (`order_id`, `gross_amount`, `payment_type`, dsb.) dan mengembalikan payment token, nomor Virtual Account, atau string QRIS. |
| **Payment Simulator UI** | Interactive Sandbox Page | Halaman publik responsif tempat tester/developer dapat mengklik tombol simulasi: **"Bayar Sukses"**, **"Simulasikan Gagal"**, atau **"Biarkan Expired"**. |
| **Webhook Delivery** | Webhook Dispatcher & Retry | Background job mengirimkan event status transaksi ke `webhook_url` merchant lengkap dengan header signature `X-Signature: HMAC-SHA256`. Dilengkapi mekanisme *retry* eksponensial jika merchant down. |
| **Audit & Inspector** | Webhook & Transaction Logs | Tampilan dashboard Inertia React untuk melihat histori request API, payload JSON, HTTP status code response, dan log pengiriman webhook. |

---

## 4. Entity Relationship Diagram (ERD)

### 4.1 ASCII Relational Diagram

```text
  ┌───────────────────────┐
  │         users         │
  └───────────┬───────────┘
              │ 1
              │
              │ hasMany
              ▼ N
  ┌───────────────────────┐         1:N          ┌───────────────────────┐
  │       merchants       ├─────────────────────►│     transactions      │
  └───────────┬───────────┘                      └───────────┬───────────┘
              │ 1                                            │ 1
              │                                              │
              │ hasMany                                      │ hasMany
              ▼ N                                            ▼ N
  ┌───────────────────────┐                      ┌───────────────────────┐
  │       api_keys        │                      │     webhook_logs      │
  └───────────────────────┘                      └───────────────────────┘
```

---

## 5. Database Schema Specifications (Laravel Migrations Reference)

### 5.1 `users`
Tabel autentikasi bawaan Laravel Starter Kit.
- `id` (BIGINT, PK, Auto Increment)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR)
- `timestamps`

### 5.2 `merchants`
Mewakili profil toko atau aplikasi merchant yang terdaftar.
- `id` (BIGINT, PK, Auto Increment)
- `user_id` (BIGINT, FK -> `users.id`, onDelete Cascade)
- `name` (VARCHAR) - Nama merchant / proyek
- `webhook_url` (VARCHAR, Nullable) - Endpoint penerima notifikasi merchant
- `webhook_secret` (VARCHAR) - Secret key untuk kalkulasi HMAC-SHA256
- `timestamps`

### 5.3 `api_keys`
Menyimpan kredensial API untuk otentikasi request transaksi.
- `id` (BIGINT, PK, Auto Increment)
- `merchant_id` (BIGINT, FK -> `merchants.id`, onDelete Cascade)
- `name` (VARCHAR) - Identifier kunci (misal: "Default Sandbox")
- `server_key` (VARCHAR, Unique) - Digunakan pada backend merchant
- `client_key` (VARCHAR, Unique) - Digunakan pada checkout client merchant
- `is_active` (BOOLEAN, Default: true)
- `timestamps`

### 5.4 `transactions`
Menyimpan seluruh data tagihan dan status simulasi.
- `id` (UUID, PK) - ID transaksi acak yang digunakan sebagai referensi
- `merchant_id` (BIGINT, FK -> `merchants.id`, onDelete Cascade)
- `order_id` (VARCHAR) - ID referensi dari merchant
- `payment_type` (ENUM: `qris`, `bank_transfer_bca`, `bank_transfer_bni`, `bank_transfer_bri`, `bank_transfer_mandiri`)
- `gross_amount` (DECIMAL 14, 2)
- `status` (ENUM: `pending`, `settlement`, `failed`, `expired`, Default: `pending`)
- `payment_code` (VARCHAR, Nullable) - Nomor Virtual Account atau raw string QRIS
- `expired_at` (TIMESTAMP) - Waktu kedaluwarsa tagihan (default: +15 menit)
- `paid_at` (TIMESTAMP, Nullable) - Waktu perubahan ke settlement
- `payload_meta` (JSON, Nullable) - Parameter tambahan dari merchant (customer detail, items)
- `timestamps`

### 5.5 `webhook_logs`
Mencatat histori pengiriman webhook untuk kebutuhan audit dan debugging.
- `id` (BIGINT, PK, Auto Increment)
- `transaction_id` (UUID, FK -> `transactions.id`, onDelete Cascade)
- `endpoint_url` (VARCHAR)
- `event_type` (VARCHAR) - Contoh: `transaction.settlement`
- `request_payload` (JSON)
- `request_signature` (VARCHAR)
- `response_status` (INT, Nullable) - HTTP response code (200, 500, dsb.)
- `response_body` (TEXT, Nullable)
- `attempt` (INT, Default: 1)
- `timestamps`

---

## 6. System Flow & Sequence Diagram

```text
[Merchant Server]                  [Simulator Backend]                  [Simulator UI (React)]
        │                                   │                                      │
        │─── 1. POST /api/v1/charge ───────►│                                      │
        │    (Header: X-Server-Key)         │── Generate Token & VA/QRIS           │
        │                                   │── Simpan State (pending)             │
        │◄── 2. Response payment_url / id ──│                                      │
        │                                                                          │
        │─── 3. Redirect / Buka Halaman Simulator Checkout ───────────────────────►│
        │                                                                          │
        │                                   │◄── 4. Klik Action: "Bayar Sukses" ───│
        │                                   │                                      │
        │                                   │── Update State: settlement           │
        │                                   │── Dispatch Job: SendWebhookJob       │
        │                                   │                                      │
        │◄── 5. POST Webhook URL ───────────│                                      │
        │    (Header: X-Signature)          │── Catat di webhook_logs              │
        │                                                                          │
        │─── 6. Return 200 OK ─────────────►│                                      │
```

---

## 7. Project Structure (Laravel + React Inertia)

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   └── ChargeController.php        # API create charge & status check
│   │   ├── Dashboard/
│   │   │   ├── MerchantController.php      # Kelola profil & webhook secret
│   │   │   ├── TransactionController.php   # List transaksi & log inspector
│   │   │   └── ApiKeyController.php        # Regenerate API Keys
│   │   └── Simulator/
│   │       └── SimulatorController.php     # Render React Checkout Simulator
│   └── Middleware/
│       └── AuthenticateServerKey.php       # Validasi kredensial merchant di API
├── Jobs/
│   └── SendWebhookJob.php                  # Mengirim webhook + signature HMAC
└── Models/
    ├── Merchant.php
    ├── ApiKey.php
    ├── Transaction.php
    └── WebhookLog.php

resources/js/
├── Pages/
│   ├── Dashboard/
│   │   ├── Index.jsx                       # Analytics & ringkasan volume
│   │   ├── Transactions/
│   │   │   ├── Index.jsx                   # Tabel histori transaksi
│   │   │   └── Show.jsx                    # Inspector detail transaksi & webhook log
│   │   └── Settings/
│   │       └── ApiKeys.jsx                 # Kredensial & konfigurasi webhook URL
│   └── Simulator/
│       └── Checkout.jsx                    # Halaman publik simulasi bayar (QRIS/VA)
```
