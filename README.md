# Kilex Payments Simulator

Midtrans-compatible sandbox simulator built with Laravel, Inertia, React, and Tailwind CSS. It is intended for local and controlled integration testing; it is **not** a payment processor and must not receive production credentials or real payments.

## Quick start

Requirements: PHP 8.3+, Composer, Node.js 20+, and SQLite/MySQL.

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
npm install
npm run build
php artisan serve --port=8001
```

Run a queue worker in another terminal so webhook delivery is processed:

```bash
php artisan queue:work --tries=3
```

The public documentation is available at `/docs`. Register a user, open **Sandbox Tester**, and create a test transaction. The dashboard exposes generated sandbox server/client keys.

## Midtrans-compatible endpoints

Use the generated **server key** with HTTP Basic authentication (`server_key:`):

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/snap/v1/transactions` | Create Snap token |
| POST | `/api/v2/charge` | Create Core API charge |
| GET | `/api/v2/{order_id}/status` | Read transaction status |
| POST | `/api/v2/{order_id}/cancel` | Cancel a pending transaction |
| POST | `/api/v2/{order_id}/expire` | Expire a pending transaction |

The response shape, status codes, signature key, virtual-account metadata, QRIS payload, and webhook payload follow the documented Midtrans sandbox conventions. The simulator adds the public Snap mock page at `/snap/v1/pay/{token}`.

## Webhooks

Configure a notification URL under **Settings → API Keys**. Settlement, cancellation, expiration, and denial enqueue a signed notification. Failed or non-2xx deliveries are retried by the queue and recorded in `webhook_logs`.

Do not configure a webhook URL pointing to internal infrastructure in an exposed deployment. Use HTTPS and restrict the simulator behind authentication/network controls.

## Tests and checks

```bash
php artisan test
npm run types:check
composer run lint:check
```

The project deliberately implements a compatible simulator contract, not Midtrans production infrastructure, acquiring, fraud decisions, or real settlement.
