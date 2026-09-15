<?php

namespace Database\Seeders;

use App\Models\ApiKey;
use App\Models\Merchant;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $appUrl = rtrim(config('app.url'), '/');

        // 1. Seed Administrator User
        $admin = User::firstOrCreate(
            ['email' => 'admin@kilexpay.test'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $adminMerchant = Merchant::firstOrCreate(
            ['user_id' => $admin->id],
            [
                'name' => 'Kilex Official Store (Admin)',
                'merchant_code' => 'G141599999',
                'notification_url' => 'https://webhook.site/demo-notification',
                'finish_url' => 'https://example.com/payment/finish',
                'unfinish_url' => 'https://example.com/payment/unfinish',
                'error_url' => 'https://example.com/payment/error',
            ]
        );

        ApiKey::firstOrCreate(
            ['merchant_id' => $adminMerchant->id],
            [
                'server_key' => 'SB-Mid-server-kilex9876543210demo',
                'client_key' => 'SB-Mid-client-kilex1234567890demo',
                'is_production' => false,
            ]
        );

        // 2. Seed Standard Merchant User
        $user = User::firstOrCreate(
            ['email' => 'user@kilexpay.test'],
            [
                'name' => 'Merchant Demo User',
                'password' => bcrypt('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        $userMerchant = Merchant::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'Mituni Store Global',
                'merchant_code' => 'G283910293',
                'notification_url' => 'https://webhook.site/mituni-notification',
                'finish_url' => "{$appUrl}/payment/success",
                'unfinish_url' => "{$appUrl}/payment/pending",
                'error_url' => "{$appUrl}/payment/failed",
            ]
        );

        ApiKey::firstOrCreate(
            ['merchant_id' => $userMerchant->id],
            [
                'server_key' => 'SB-Mid-server-mituni88888888demo',
                'client_key' => 'SB-Mid-client-mituni88888888demo',
                'is_production' => false,
            ]
        );
    }
}
