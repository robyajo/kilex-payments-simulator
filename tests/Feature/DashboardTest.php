<?php

use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('cancelling a terminal transaction redirects with a useful error', function () {
    $user = User::factory()->create();
    $merchant = Merchant::create([
        'user_id' => $user->id,
        'name' => 'Acme Merchant',
        'merchant_code' => 'G12345678',
    ]);
    $transaction = Transaction::create([
        'merchant_id' => $merchant->id,
        'order_id' => 'ORDER-DASHBOARD-CANCEL-001',
        'gross_amount' => 10000,
        'payment_type' => 'bank_transfer',
        'transaction_status' => 'settlement',
        'status_code' => '200',
        'status_message' => 'Success',
        'expired_at' => now()->addDay(),
        'settlement_time' => now(),
    ]);

    $response = $this->actingAs($user)->post(route('transactions.mark-cancel', $transaction));

    $response->assertRedirect()
        ->assertSessionHas('error', 'Transaction cannot be canceled from its current state (settlement).');
    $this->assertDatabaseHas('transactions', [
        'id' => $transaction->id,
        'transaction_status' => 'settlement',
    ]);
});
