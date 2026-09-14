<?php

use App\Jobs\SendMidtransNotificationJob;
use App\Models\ApiKey;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;
use App\Services\MidtransSignatureService;
use Illuminate\Support\Facades\Http;

test('it sends midtrans compliant webhook post request and writes webhook logs', function () {
    Http::fake([
        'https://webhook.site/my-test-endpoint' => Http::response(['status' => 'ok'], 200),
    ]);

    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Acme Merchant',
        'merchant_code' => 'G12345678',
        'notification_url' => 'https://webhook.site/my-test-endpoint',
    ]);
    ApiKey::create([
        'merchant_id' => $merchant->id,
        'server_key' => 'SB-Mid-server-jobtest123',
        'client_key' => 'SB-Mid-client-jobtest123',
    ]);

    $transaction = Transaction::create([
        'merchant_id' => $merchant->id,
        'order_id' => 'ORDER-JOB-001',
        'gross_amount' => 300000.00,
        'payment_type' => 'bank_transfer',
        'bank' => 'bca',
        'va_number' => '700141234567',
        'transaction_status' => 'settlement',
        'status_code' => '200',
        'status_message' => 'Success, payment simulated',
        'expired_at' => now()->addDay(),
        'settlement_time' => now(),
    ]);

    $job = new SendMidtransNotificationJob($transaction->id);
    $job->handle(new MidtransSignatureService);

    Http::assertSent(function ($request) {
        return $request->url() === 'https://webhook.site/my-test-endpoint'
            && $request['order_id'] === 'ORDER-JOB-001'
            && $request['transaction_status'] === 'settlement'
            && $request['status_code'] === '200'
            && ! empty($request['signature_key']);
    });

    $this->assertDatabaseHas('webhook_logs', [
        'transaction_id' => $transaction->id,
        'merchant_id' => $merchant->id,
        'target_url' => 'https://webhook.site/my-test-endpoint',
        'http_status' => 200,
    ]);
});
