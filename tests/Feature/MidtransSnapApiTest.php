<?php

use App\Models\ApiKey;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;

test('merchant can create snap transaction token with midtrans basic auth', function () {
    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Acme Merchant',
        'merchant_code' => 'G12345678',
    ]);
    $apiKey = ApiKey::create([
        'merchant_id' => $merchant->id,
        'server_key' => 'SB-Mid-server-unittesting123',
        'client_key' => 'SB-Mid-client-unittesting123',
    ]);

    $authHeader = 'Basic '.base64_encode($apiKey->server_key.':');

    $response = $this->withHeaders([
        'Authorization' => $authHeader,
    ])->postJson('/api/snap/v1/transactions', [
        'transaction_details' => [
            'order_id' => 'ORDER-SNAP-001',
            'gross_amount' => 200000,
        ],
        'customer_details' => [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['token', 'redirect_url']);

    $this->assertDatabaseHas('transactions', [
        'merchant_id' => $merchant->id,
        'order_id' => 'ORDER-SNAP-001',
        'gross_amount' => 200000.00,
        'transaction_status' => 'pending',
    ]);
});

test('snap simulator action requires the transaction action token and only allows one terminal transition', function () {
    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Acme Merchant',
        'merchant_code' => 'G12345678',
    ]);
    $apiKey = ApiKey::create([
        'merchant_id' => $merchant->id,
        'server_key' => 'SB-Mid-server-action-test',
        'client_key' => 'SB-Mid-client-action-test',
    ]);

    $create = $this->withHeaders([
        'Authorization' => 'Basic '.base64_encode($apiKey->server_key.':'),
    ])->postJson('/api/snap/v1/transactions', [
        'transaction_details' => [
            'order_id' => 'ORDER-ACTION-001',
            'gross_amount' => 200000,
        ],
    ])->assertStatus(201);

    $token = $create->json('token');
    $transaction = Transaction::where('snap_token', $token)->firstOrFail();

    $this->postJson('/api/simulator/action/settle', [
        'transaction_id' => $transaction->id,
    ])->assertStatus(422);

    $this->postJson('/api/simulator/action/settle', [
        'transaction_id' => $transaction->id,
        'action_token' => $token,
    ])->assertStatus(200);

    $this->postJson('/api/simulator/action/expire', [
        'transaction_id' => $transaction->id,
        'action_token' => $token,
    ])->assertStatus(412);
});
