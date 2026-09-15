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

For Core API sandbox testing, use the response as follows:

- `bank_transfer`: read `va_numbers[0].va_number` and show it in your checkout. Open `payment_url` when the tester needs to complete the simulated payment.
- `echannel`/Mandiri: read `biller_code` and `bill_key`, then open `payment_url`.
- `qris`: send `qr_string` to your QR renderer. `qr_url`/`payment_url` opens the simulator page that displays the QR payment and provides the sandbox settlement action.

The simulator does not connect to real bank or QRIS networks. The hosted payment URL is the sandbox payment surface; after the tester chooses **Simulasikan Bayar Sukses**, the transaction becomes `settlement` and the configured webhook is queued.

## Stripe test mode

Choose **Stripe saja** or **Midtrans + Stripe** under dashboard settings. The simulator generates `sk_test_` and `pk_test_` credentials. Stripe requests use:

```text
Authorization: Bearer sk_test_...
```

Supported endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/stripe/v1/payment_intents` | Create a PaymentIntent |
| GET | `/api/stripe/v1/payment_intents/{id}` | Retrieve a PaymentIntent |
| POST | `/api/stripe/v1/payment_intents/{id}/confirm` | Simulate confirmation/success |
| POST | `/api/stripe/v1/checkout/sessions` | Create a hosted Checkout Session |

PaymentIntent responses include Stripe-style `id`, `client_secret`, `status`, and `amount_received`. Checkout Session responses include a `url`; opening it is the sandbox checkout surface. Confirming a PaymentIntent changes it to `succeeded` and queues a Stripe-style `payment_intent.succeeded` webhook. This is a test-mode compatibility module and does not connect to Stripe's network.

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
