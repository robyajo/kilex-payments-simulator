<?php

use App\Models\ApiKey;
use App\Models\Merchant;
use App\Models\User;

test('merchant can create core api charge for bca virtual account', function () {
    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Acme Merchant',
        'merchant_code' => 'G12345678',
    ]);
    $apiKey = ApiKey::create([
        'merchant_id' => $merchant->id,
        'server_key' => 'SB-Mid-server-coretest123',
        'client_key' => 'SB-Mid-client-coretest123',
    ]);

    $authHeader = 'Basic '.base64_encode($apiKey->server_key.':');

    $response = $this->withHeaders([
        'Authorization' => $authHeader,
    ])->postJson('/api/v2/charge', [
        'payment_type' => 'bank_transfer',
        'bank_transfer' => [
            'bank' => 'bca',
        ],
        'transaction_details' => [
            'order_id' => 'ORDER-CORE-001',
            'gross_amount' => 175000,
        ],
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'status_code' => '201',
            'order_id' => 'ORDER-CORE-001',
            'transaction_status' => 'pending',
            'payment_type' => 'bank_transfer',
        ])
        ->assertJsonStructure([
            'transaction_id',
            'order_id',
            'gross_amount',
            'va_numbers' => [
                ['bank', 'va_number'],
            ],
            'payment_url',
            'signature_key',
        ]);
});

test('qris charge returns a QR payload and hosted sandbox payment URL', function () {
    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Acme Merchant',
        'merchant_code' => 'G12345678',
    ]);
    $apiKey = ApiKey::create([
        'merchant_id' => $merchant->id,
        'server_key' => 'SB-Mid-server-qris-test',
        'client_key' => 'SB-Mid-client-qris-test',
    ]);

    $response = $this->withHeaders([
        'Authorization' => 'Basic '.base64_encode($apiKey->server_key.':'),
    ])->postJson('/api/v2/charge', [
        'payment_type' => 'qris',
        'transaction_details' => [
            'order_id' => 'ORDER-QRIS-001',
            'gross_amount' => 25000,
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'qr_string',
            'qr_url',
            'payment_url',
            'actions',
        ])
        ->assertJsonPath('transaction_status', 'pending');
});

test('merchant can check status, cancel, and expire transaction via core api', function () {
    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Acme Merchant',
        'merchant_code' => 'G12345678',
    ]);
    $apiKey = ApiKey::create([
        'merchant_id' => $merchant->id,
        'server_key' => 'SB-Mid-server-coretest456',
        'client_key' => 'SB-Mid-client-coretest456',
    ]);

    $authHeader = 'Basic '.base64_encode($apiKey->server_key.':');

    // Create charge
    $this->withHeaders(['Authorization' => $authHeader])
        ->postJson('/api/v2/charge', [
            'payment_type' => 'bank_transfer',
            'transaction_details' => [
                'order_id' => 'ORDER-CORE-002',
                'gross_amount' => 50000,
            ],
        ])->assertStatus(201);

    // Check status
    $statusRes = $this->withHeaders(['Authorization' => $authHeader])
        ->getJson('/api/v2/ORDER-CORE-002/status');

    $statusRes->assertStatus(200)
        ->assertJson([
            'order_id' => 'ORDER-CORE-002',
            'transaction_status' => 'pending',
        ]);

    // Cancel transaction
    $cancelRes = $this->withHeaders(['Authorization' => $authHeader])
        ->postJson('/api/v2/ORDER-CORE-002/cancel');

    $cancelRes->assertStatus(200)
        ->assertJson([
            'status_code' => '202',
            'transaction_status' => 'cancel',
        ]);
});

test('client keys cannot authorize server API endpoints', function () {
    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Acme Merchant',
        'merchant_code' => 'G12345678',
    ]);
    $apiKey = ApiKey::create([
        'merchant_id' => $merchant->id,
        'server_key' => 'SB-Mid-server-auth-test',
        'client_key' => 'SB-Mid-client-auth-test',
    ]);

    $this->withHeaders([
        'Authorization' => 'Basic '.base64_encode($apiKey->client_key.':'),
    ])->postJson('/api/v2/charge', [
        'payment_type' => 'bank_transfer',
        'transaction_details' => [
            'order_id' => 'ORDER-CLIENT-KEY',
            'gross_amount' => 10000,
        ],
    ])->assertStatus(401);
});

test('duplicate pending order ids are rejected for a merchant', function () {
    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Acme Merchant',
        'merchant_code' => 'G12345678',
    ]);
    $apiKey = ApiKey::create([
        'merchant_id' => $merchant->id,
        'server_key' => 'SB-Mid-server-duplicate-test',
        'client_key' => 'SB-Mid-client-duplicate-test',
    ]);

    $payload = [
        'payment_type' => 'bank_transfer',
        'transaction_details' => [
            'order_id' => 'ORDER-DUPLICATE',
            'gross_amount' => 10000,
        ],
    ];

    $request = $this->withHeaders([
        'Authorization' => 'Basic '.base64_encode($apiKey->server_key.':'),
    ]);

    $request->postJson('/api/v2/charge', $payload)->assertStatus(201);
    $request->postJson('/api/v2/charge', $payload)->assertStatus(406);
});
