<?php

namespace Database\Seeders;

use App\Models\ApiKey;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WebhookLog;
use App\Services\MidtransSignatureService;
use App\Services\VirtualAccountGenerator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@kilexpay.test'],
            [
                'name' => 'Kilex Developer',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $merchant = Merchant::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'Kilex Store Official',
                'merchant_code' => 'G141599999',
                'notification_url' => 'https://webhook.site/demo-notification',
                'finish_url' => 'https://example.com/payment/finish',
                'unfinish_url' => 'https://example.com/payment/unfinish',
                'error_url' => 'https://example.com/payment/error',
            ]
        );

        $apiKey = ApiKey::firstOrCreate(
            ['merchant_id' => $merchant->id],
            [
                'server_key' => 'SB-Mid-server-kilex9876543210demo',
                'client_key' => 'SB-Mid-client-kilex1234567890demo',
                'is_production' => false,
            ]
        );

        $vaGenerator = new VirtualAccountGenerator;
        $signatureService = new MidtransSignatureService;

        // Seed 1: Settlement BCA VA
        $order1 = 'ORD-202609-1001';
        $bcaVa = $vaGenerator->generateForBank('bca', $order1);
        $t1 = Transaction::firstOrCreate(
            ['order_id' => $order1, 'merchant_id' => $merchant->id],
            [
                'gross_amount' => 250000.00,
                'payment_type' => 'bank_transfer',
                'bank' => 'bca',
                'va_number' => $bcaVa['va_number'],
                'transaction_status' => 'settlement',
                'fraud_status' => 'accept',
                'status_code' => '200',
                'status_message' => 'Success, Bank Transfer transaction is created',
                'snap_token' => 'snap-token-'.Str::uuid()->toString(),
                'expired_at' => now()->addDay(),
                'settlement_time' => now()->subMinutes(15),
                'customer_details' => [
                    'first_name' => 'Ahmad',
                    'last_name' => 'Rizki',
                    'email' => 'ahmad.rizki@example.com',
                    'phone' => '08123456789',
                ],
                'item_details' => [
                    ['id' => 'ITM-1', 'name' => 'Premium API Subscription', 'price' => 250000, 'quantity' => 1],
                ],
            ]
        );

        $sig1 = $signatureService->generate($order1, '200', '250000.00', $apiKey->server_key);
        WebhookLog::firstOrCreate(
            ['transaction_id' => $t1->id],
            [
                'merchant_id' => $merchant->id,
                'target_url' => $merchant->notification_url,
                'http_status' => 200,
                'signature_key' => $sig1,
                'payload_json' => [
                    'transaction_status' => 'settlement',
                    'order_id' => $order1,
                    'gross_amount' => '250000.00',
                    'signature_key' => $sig1,
                ],
                'response_body' => '{"status":"ok","received":true}',
                'attempt' => 1,
            ]
        );

        // Seed 2: Pending QRIS
        $order2 = 'ORD-202609-1002';
        $qrString = $vaGenerator->generateQrisPayload($merchant->name, $order2, 75000.00);
        Transaction::firstOrCreate(
            ['order_id' => $order2, 'merchant_id' => $merchant->id],
            [
                'gross_amount' => 75000.00,
                'payment_type' => 'qris',
                'qr_string' => $qrString,
                'transaction_status' => 'pending',
                'fraud_status' => 'accept',
                'status_code' => '201',
                'status_message' => 'Success, QRIS transaction is created',
                'snap_token' => 'snap-token-'.Str::uuid()->toString(),
                'expired_at' => now()->addHours(6),
                'customer_details' => [
                    'first_name' => 'Dewi',
                    'last_name' => 'Sartika',
                    'email' => 'dewi@example.com',
                    'phone' => '08987654321',
                ],
            ]
        );

        // Seed 3: Pending Mandiri Bill
        $order3 = 'ORD-202609-1003';
        $mandiri = $vaGenerator->generateForBank('mandiri', $order3);
        Transaction::firstOrCreate(
            ['order_id' => $order3, 'merchant_id' => $merchant->id],
            [
                'gross_amount' => 500000.00,
                'payment_type' => 'echannel',
                'bank' => 'mandiri',
                'biller_code' => $mandiri['biller_code'],
                'bill_key' => $mandiri['bill_key'],
                'transaction_status' => 'pending',
                'fraud_status' => 'accept',
                'status_code' => '201',
                'status_message' => 'Success, Mandiri Bill transaction is created',
                'snap_token' => 'snap-token-'.Str::uuid()->toString(),
                'expired_at' => now()->addHours(12),
            ]
        );
    }
}
