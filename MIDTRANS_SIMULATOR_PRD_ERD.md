# Product Requirements Document (PRD) & Entity Relationship Diagram (ERD)
## Mock Payment Gateway Simulator (Midtrans-Compatible Architecture)
**Stack:** Laravel 11 + React Starter Kit (Inertia.js + Tailwind CSS)

---

## 1. Overview & Objectives

Payment Simulator ini dirancang dengan **standar kompatibilitas Midtrans** (Core API & Snap) sebagai perilaku *default*. Tujuannya agar aplikasi klien/merchant yang sudah siap memakai library atau SDK Midtrans dapat langsung mengarahkan *Base URL* mereka ke simulator ini tanpa perlu mengubah struktur payload request maupun verifikasi signature.

### 1.1 Key Objectives
- **Midtrans API Contract:** Menggunakan payload request (`/v2/charge`, `/snap/v1/transactions`) dan response JSON persis format Midtrans.
- **Midtrans Signature:** Mendukung verifikasi hashing SHA-512 bawaan Midtrans:
  $$\text{SHA512}(\text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{server\_key})$$
- **Snap-like Interactive UI:** Tampilan frontend React yang menyerupai popup/redirect Snap (pilihan bank VA BCA/BNI/BRI/Mandiri, QRIS Gopay/ShopeePay) dengan tombol simulator *trigger settlement/expire*.
- **Asynchronous Webhook & Logs:** Mengirimkan payload notifikasi standar Midtrans HTTP POST ke backend merchant secara andal via background queue.

---

## 2. API Contract & Midtrans Mapping

### 2.1 Endpoint Standar
1. **Snap Transaction Token:** `POST /snap/v1/transactions`
   - Request: `order_id`, `gross_amount`, `customer_details`, `item_details`
   - Response: `token`, `redirect_url`
2. **Core API Charge:** `POST /v2/charge`
   - Request: `payment_type` (`bank_transfer`, `qris`), detail bank/acquirer
   - Response: `transaction_id`, `order_id`, `gross_amount`, `va_numbers`, `qr_string`, `transaction_status: "pending"`
3. **Check Status:** `GET /v2/{order_id}/status`
4. **Cancel / Expire:** `POST /v2/{order_id}/cancel`, `POST /v2/{order_id}/expire`

### 2.2 Format Status Transaksi Midtrans
- `pending`: Menunggu pembayaran
- `settlement`: Pembayaran berhasil disimulasikan
- `expire`: Melewati batas waktu tanpa dibayar
- `cancel` / `deny`: Pembayaran ditolak atau dibatalkan

---

## 3. Entity Relationship Diagram (ERD)

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

## 4. Database Schema Specifications (Laravel Migrations Reference)

### 4.1 `users`
- `id` (BIGINT, PK, Auto Increment)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR)
- `timestamps`

### 4.2 `merchants`
- `id` (BIGINT, PK, Auto Increment)
- `user_id` (BIGINT, FK -> `users.id`, onDelete Cascade)
- `name` (VARCHAR)
- `notification_url` (VARCHAR, Nullable) - Mapping dari Midtrans Notification URL / Webhook URL
- `timestamps`

### 4.3 `api_keys`
Format penamaan meniru kredensial Midtrans Sandbox (`SB-Mid-server-...` & `SB-Mid-client-...`).
- `id` (BIGINT, PK, Auto Increment)
- `merchant_id` (BIGINT, FK -> `merchants.id`, onDelete Cascade)
- `server_key` (VARCHAR, Unique) - Format contoh: `SB-Mid-server-xxxx`
- `client_key` (VARCHAR, Unique) - Format contoh: `SB-Mid-client-xxxx`
- `is_production` (BOOLEAN, Default: false)
- `timestamps`

### 4.4 `transactions`
Menyimpan state yang kompatibel dengan atribut Midtrans Core API.
- `id` (UUID, PK) - Digunakan sebagai `transaction_id` (UUID format)
- `merchant_id` (BIGINT, FK -> `merchants.id`, onDelete Cascade)
- `order_id` (VARCHAR) - ID order dari merchant
- `gross_amount` (DECIMAL 14, 2)
- `payment_type` (VARCHAR) - `bank_transfer`, `qris`, `gopay`, `cstore`
- `bank` (VARCHAR, Nullable) - `bca`, `bni`, `bri`, `permata`, `mandiri` (echannel)
- `va_number` (VARCHAR, Nullable) - Nomor VA acak (misal: format prefix bank + angka acak)
- `bill_key` (VARCHAR, Nullable) - Khusus Mandiri Bill
- `biller_code` (VARCHAR, Nullable) - Khusus Mandiri Biller Code
- `qr_string` (TEXT, Nullable) - String payload QRIS mock
- `transaction_status` (ENUM: `pending`, `settlement`, `expire`, `cancel`, `deny`, Default: `pending`)
- `fraud_status` (VARCHAR, Default: `accept`)
- `status_code` (VARCHAR, Default: `201`) - 201 (pending), 200 (settlement), 202 (deny/cancel)
- `status_message` (VARCHAR)
- `custom_field1` (VARCHAR, Nullable)
- `custom_field2` (VARCHAR, Nullable)
- `customer_details` (JSON, Nullable)
- `item_details` (JSON, Nullable)
- `expired_at` (TIMESTAMP)
- `settlement_time` (TIMESTAMP, Nullable)
- `timestamps`

### 4.5 `webhook_logs`
- `id` (BIGINT, PK, Auto Increment)
- `transaction_id` (UUID, FK -> `transactions.id`, onDelete Cascade)
- `target_url` (VARCHAR)
- `http_status` (INT, Nullable) - Status response dari merchant (200, 500, dsb.)
- `payload_json` (JSON)
- `signature_key` (VARCHAR) - SHA512 hash yang dikirim di payload
- `response_body` (TEXT, Nullable)
- `attempt` (INT, Default: 1)
- `timestamps`

---

## 5. Midtrans Workflow & Webhook Simulation

### 5.1 Alur Request & Response

```text
[Merchant App / SDK]               [Simulator Core / Snap API]             [React Simulator UI]
         │                                       │                                   │
         │── 1. POST /snap/v1/transactions ─────►│                                   │
         │   (Basic Auth: Base64(server_key:))   │── Generate Snap Token             │
         │                                       │── Simpan Transaksi (pending, 201) │
         │◄─ 2. { token, redirect_url } ─────────│                                   │
         │                                                                           │
         │── 3. Merchant redirect / iframe Snap.js ─────────────────────────────────►│
         │                                                                           │ (Tampil UI Snap)
         │                                       │◄── 4. Klik "Bayar (Settlement)" ──│
         │                                       │                                   │
         │                                       │── status -> settlement (200)      │
         │                                       │── settlement_time = now()         │
         │                                       │── Dispatch SendMidtransWebhookJob │
         │                                       │                                   │
         │◄─ 5. POST Notification URL ───────────│                                   │
         │   (Payload JSON Midtrans + SHA512)    │── Catat di webhook_logs           │
```

### 5.2 Format Payload Webhook (Midtrans Compliant)
Payload POST ke merchant berisi atribut standar:
```json
{
  "transaction_time": "2026-09-15 03:00:00",
  "transaction_status": "settlement",
  "transaction_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "d744b... (SHA512: order_id + status_code + gross_amount + server_key)",
  "payment_type": "bank_transfer",
  "order_id": "ORDER-1001",
  "merchant_id": "G141599999",
  "gross_amount": "150000.00",
  "fraud_status": "accept",
  "currency": "IDR",
  "va_numbers": [
    {
      "bank": "bca",
      "va_number": "910128391283"
    }
  ]
}
```

---

## 6. Project Directory Structure (Laravel + React Starter Kit)

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── Midtrans/
│   │   │   ├── SnapController.php          # POST /snap/v1/transactions
│   │   │   ├── CoreApiController.php       # POST /v2/charge, GET /v2/:id/status
│   │   │   └── SimulatorActionController.php # Pemicu Bayar/Expire dari UI Snap
│   │   └── Dashboard/
│   │       ├── TransactionController.php   # Riwayat transaksi & log payload
│   │       └── SettingController.php       # Kredensial Server Key & Notification URL
│   └── Middleware/
│       └── MidtransAuthMiddleware.php      # Validasi Basic Auth Base64(ServerKey:)
├── Services/
│   ├── MidtransSignatureService.php        # Generator hash SHA-512
│   └── VirtualAccountGenerator.php         # Mock VA BCA, BNI, BRI, Mandiri
├── Jobs/
│   └── SendMidtransNotificationJob.php     # HTTP POST webhook + retry
└── Models/
    ├── Merchant.php
    ├── ApiKey.php
    ├── Transaction.php
    └── WebhookLog.php

resources/js/
├── Pages/
│   ├── Dashboard/
│   │   ├── Transactions/Index.jsx          # Daftar transaksi & filter status Midtrans
│   │   └── Settings/Index.jsx              # Kredensial Server Key & Webhook URL
│   └── Snap/
│       ├── PaymentMock.jsx                 # Simulator UI mirip popup Snap Midtrans
│       └── Components/
│           ├── BankTransferView.jsx        # Tampilan VA & Tombol "Copy & Bayar"
│           └── QrisView.jsx                # Mock QR Code & Tombol "Simulasikan Scan"
```
