<?php

namespace Database\Seeders;

use App\Models\ApiKey;
use App\Models\Merchant;
use App\Models\Transaction;
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
        // 1. Call User Seeder (Seeds 1 Admin and 1 User)
        $this->call(UserSeeder::class);

        // 2. Seed Sample Demo Transactions
        $adminMerchant = Merchant::where('merchant_code', 'G141599999')->first();
        $adminApiKey = ApiKey::where('merchant_id', $adminMerchant?->id)->first();
        $userMerchant = Merchant::where('merchant_code', 'G283910293')->first();

        if (! $adminMerchant || ! $adminApiKey || ! $userMerchant) {
            return;
        }

        $vaGenerator = new VirtualAccountGenerator;
        $signatureService = new MidtransSignatureService;

        // Seed 1: Settlement BCA VA (Admin Merchant)
        $order1 = 'ORD-202609-1001';
        $bcaVa = $vaGenerator->generateForBank('bca', $order1);
        $t1 = Transaction::firstOrCreate(
            ['order_id' => $order1, 'merchant_id' => $adminMerchant->id],
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

        $sig1 = $signatureService->generate($order1, '200', '250000.00', $adminApiKey->server_key);
        WebhookLog::firstOrCreate(
            ['transaction_id' => $t1->id],
            [
                'merchant_id' => $adminMerchant->id,
                'target_url' => $adminMerchant->notification_url,
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

        // Seed 2: Pending QRIS (Admin Merchant)
        $order2 = 'ORD-202609-1002';
        $qrString = $vaGenerator->generateQrisPayload($adminMerchant->name, $order2, 75000.00);
        Transaction::firstOrCreate(
            ['order_id' => $order2, 'merchant_id' => $adminMerchant->id],
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

        // Seed 3: Pending Mandiri Bill (User Merchant)
        $order3 = 'ORD-202609-1003';
        $mandiri = $vaGenerator->generateForBank('mandiri', $order3);
        Transaction::firstOrCreate(
            ['order_id' => $order3, 'merchant_id' => $userMerchant->id],
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
