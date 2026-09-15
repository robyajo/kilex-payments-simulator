<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Models\WebhookLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendStripeNotificationJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [5, 15, 30];

    public int $timeout = 20;

    public function __construct(public string $transactionId) {}

    public function handle(): void
    {
        $transaction = Transaction::with('merchant')->find($this->transactionId);
        $url = $transaction?->merchant?->notification_url;

        if (! $transaction || $transaction->provider !== 'stripe' || ! $url) {
            return;
        }

        $event = [
            'id' => 'evt_'.strtolower(str_replace('-', '', $transaction->id)),
            'object' => 'event',
            'api_version' => '2025-06-30.basil',
            'type' => 'payment_intent.succeeded',
            'created' => now()->timestamp,
            'data' => [
                'object' => [
                    'id' => $transaction->provider_reference,
                    'object' => 'payment_intent',
                    'amount' => (int) round((float) $transaction->gross_amount * 100),
                    'currency' => 'idr',
                    'status' => 'succeeded',
                    'metadata' => ['order_id' => $transaction->order_id],
                ],
            ],
        ];

        $response = null;
        $responseBody = null;
        try {
            $response = Http::connectTimeout(3)->timeout(10)->post($url, $event);
            $responseBody = substr($response->body(), 0, 5000);
        } catch (Throwable $exception) {
            Log::warning('Stripe webhook delivery failed', [
                'transaction_id' => $transaction->id,
                'attempt' => $this->attempts(),
                'exception' => $exception,
            ]);
        }

        WebhookLog::create([
            'transaction_id' => $transaction->id,
            'merchant_id' => $transaction->merchant->id,
            'target_url' => $url,
            'http_status' => $response?->status(),
            'payload_json' => $event,
            'signature_key' => $event['id'],
            'response_body' => $responseBody,
            'attempt' => $this->attempts(),
        ]);

        if (! $response || $response->failed()) {
            throw new \RuntimeException('Stripe webhook delivery failed.');
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('Stripe webhook delivery exhausted retries', [
            'transaction_id' => $this->transactionId,
            'exception' => $exception,
        ]);
    }
}
