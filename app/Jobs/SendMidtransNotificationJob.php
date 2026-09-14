<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Models\WebhookLog;
use App\Services\MidtransSignatureService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendMidtransNotificationJob implements ShouldQueue
{
    use Queueable;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 5;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $transactionId,
        public ?string $overrideUrl = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(MidtransSignatureService $signatureService): void
    {
        $transaction = Transaction::with(['merchant.apiKeys'])->find($this->transactionId);

        if (! $transaction) {
            Log::warning("SendMidtransNotificationJob: Transaction {$this->transactionId} not found.");

            return;
        }

        $merchant = $transaction->merchant;
        if (! $merchant) {
            return;
        }

        $targetUrl = $this->overrideUrl ?? $merchant->notification_url;

        if (empty($targetUrl)) {
            Log::info("SendMidtransNotificationJob: No notification_url configured for merchant {$merchant->id}.");

            return;
        }

        $apiKey = $merchant->primaryApiKey ?? $merchant->apiKeys()->first();
        $serverKey = $apiKey ? $apiKey->server_key : '';

        // Generate valid Midtrans SHA-512 signature
        $signatureKey = $signatureService->generate(
            $transaction->order_id,
            $transaction->status_code,
            $transaction->gross_amount,
            $serverKey
        );

        // Build Midtrans standard webhook payload
        $payload = [
            'transaction_time' => $transaction->created_at?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s'),
            'transaction_status' => $transaction->transaction_status,
            'transaction_id' => $transaction->id,
            'status_message' => $transaction->status_message ?: 'midtrans payment notification',
            'status_code' => $transaction->status_code,
            'signature_key' => $signatureKey,
            'payment_type' => $transaction->payment_type,
            'order_id' => $transaction->order_id,
            'merchant_id' => $merchant->merchant_code,
            'gross_amount' => number_format((float) $transaction->gross_amount, 2, '.', ''),
            'fraud_status' => $transaction->fraud_status,
            'currency' => 'IDR',
        ];

        if ($transaction->settlement_time) {
            $payload['settlement_time'] = $transaction->settlement_time->format('Y-m-d H:i:s');
        }

        if ($transaction->va_number && $transaction->bank) {
            $payload['va_numbers'] = [
                [
                    'bank' => $transaction->bank,
                    'va_number' => $transaction->va_number,
                ],
            ];
        }

        if ($transaction->bill_key && $transaction->biller_code) {
            $payload['bill_key'] = $transaction->bill_key;
            $payload['biller_code'] = $transaction->biller_code;
        }

        if ($transaction->payment_code) {
            $payload['payment_code'] = $transaction->payment_code;
        }

        if ($transaction->qr_string) {
            $payload['qr_string'] = $transaction->qr_string;
        }

        if ($transaction->custom_field1) {
            $payload['custom_field1'] = $transaction->custom_field1;
        }
        if ($transaction->custom_field2) {
            $payload['custom_field2'] = $transaction->custom_field2;
        }
        if ($transaction->custom_field3) {
            $payload['custom_field3'] = $transaction->custom_field3;
        }

        $httpStatus = null;
        $responseBody = null;

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'User-Agent' => 'Midtrans-Simulator-Webhook/1.0',
                ])
                ->post($targetUrl, $payload);

            $httpStatus = $response->status();
            $responseBody = substr($response->body(), 0, 5000);
        } catch (\Throwable $e) {
            $responseBody = 'Webhook delivery error: '.$e->getMessage();
            Log::error("SendMidtransNotificationJob Exception for {$targetUrl}: ".$e->getMessage());
        }

        // Record audit webhook log
        WebhookLog::create([
            'transaction_id' => $transaction->id,
            'merchant_id' => $merchant->id,
            'target_url' => $targetUrl,
            'http_status' => $httpStatus,
            'payload_json' => $payload,
            'signature_key' => $signatureKey,
            'response_body' => $responseBody,
            'attempt' => $this->attempts(),
        ]);
    }
}
