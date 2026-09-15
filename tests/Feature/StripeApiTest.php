<?php

use App\Models\Merchant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

function stripeMerchant(): array
{
    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Stripe Test Merchant',
        'merchant_code' => 'GSTRIPE01',
        'payment_providers' => 'both',
        'stripe_secret_key' => 'sk_test_'.str_repeat('a', 32),
        'stripe_secret_key_hash' => Hash::make('sk_test_'.str_repeat('a', 32)),
        'stripe_publishable_key' => 'pk_test_'.str_repeat('b', 32),
    ]);

    return [$merchant, 'Bearer sk_test_'.str_repeat('a', 32)];
}

test('stripe payment intent follows test mode lifecycle', function () {
    [$merchant, $authorization] = stripeMerchant();

    $create = $this->withHeaders(['Authorization' => $authorization])
        ->postJson('/api/stripe/v1/payment_intents', [
            'amount' => 150000,
            'currency' => 'idr',
            'metadata' => ['order_id' => 'STRIPE-001'],
        ])
        ->assertOk()
        ->assertJsonPath('status', 'requires_payment_method');

    $id = $create->json('id');

    $this->withHeaders(['Authorization' => $authorization])
        ->postJson("/api/stripe/v1/payment_intents/{$id}/confirm")
        ->assertOk()
        ->assertJsonPath('status', 'succeeded')
        ->assertJsonPath('amount_received', 150000);

    $this->assertDatabaseHas('transactions', [
        'merchant_id' => $merchant->id,
        'provider' => 'stripe',
        'provider_reference' => $id,
        'transaction_status' => 'settlement',
    ]);
});

test('stripe checkout session returns hosted test checkout url', function () {
    [, $authorization] = stripeMerchant();

    $this->withHeaders(['Authorization' => $authorization])
        ->postJson('/api/stripe/v1/checkout/sessions', [
            'line_items' => [[
                'price_data' => [
                    'currency' => 'idr',
                    'unit_amount' => 50000,
                    'product_data' => ['name' => 'Test item'],
                ],
                'quantity' => 1,
            ]],
            'success_url' => 'https://merchant.test/success',
            'cancel_url' => 'https://merchant.test/cancel',
        ])
        ->assertOk()
        ->assertJsonStructure(['id', 'url', 'amount_total', 'payment_status'])
        ->assertJsonPath('payment_status', 'unpaid');
});

test('stripe rejects a merchant that only enabled midtrans', function () {
    $user = User::factory()->create();
    $key = 'sk_test_'.str_repeat('c', 32);
    Merchant::create([
        'user_id' => $user->id,
        'name' => 'Midtrans Only',
        'merchant_code' => 'GMIDONLY',
        'payment_providers' => 'midtrans',
        'stripe_secret_key_hash' => Hash::make($key),
    ]);

    $this->withHeaders(['Authorization' => "Bearer {$key}"])
        ->postJson('/api/stripe/v1/payment_intents', [
            'amount' => 10000,
            'currency' => 'idr',
        ])
        ->assertForbidden()
        ->assertJsonPath('error.message', 'Stripe provider is not enabled for this merchant.');
});
