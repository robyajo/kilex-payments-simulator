<?php

use App\Models\Bank;
use App\Models\User;

test('guests are redirected to login when visiting admin banks page', function () {
    $response = $this->get(route('admin.banks.index'));
    $response->assertRedirect(route('login'));
});

test('non-admin users get forbidden 403 when accessing admin banks page', function () {
    $user = User::factory()->create([
        'role' => 'user',
    ]);

    $this->actingAs($user);

    $response = $this->get(route('admin.banks.index'));
    $response->assertForbidden();
});

test('admin can view the banks list', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    Bank::factory()->create([
        'name' => 'Bank Neo Commerce',
        'code' => 'bnc',
    ]);

    $this->actingAs($admin);

    $response = $this->get(route('admin.banks.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/banks/index')
        ->has('banks')
    );
});

test('admin can create a new bank', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $this->actingAs($admin);

    $response = $this->post(route('admin.banks.store'), [
        'name' => 'Bank Jago Virtual Account',
        'code' => 'jago',
        'va_prefix' => '5432',
        'logo_url' => 'https://example.com/jago.png',
        'badge_color' => '#10B981',
        'is_active' => true,
        'instruction_atm' => 'Panduan ATM Jago',
        'instruction_mbanking' => 'Panduan Jago App',
        'instruction_ibanking' => 'Panduan Jago Web',
    ]);

    $response->assertRedirect(route('admin.banks.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('banks', [
        'code' => 'jago',
        'name' => 'Bank Jago Virtual Account',
        'va_prefix' => '5432',
    ]);
});

test('admin can update an existing bank', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $bank = Bank::factory()->create([
        'name' => 'Old Bank Name',
        'code' => 'oldcode',
        'va_prefix' => '1111',
    ]);

    $this->actingAs($admin);

    $response = $this->put(route('admin.banks.update', $bank), [
        'name' => 'Updated Bank Name',
        'code' => 'oldcode',
        'va_prefix' => '2222',
        'is_active' => false,
    ]);

    $response->assertRedirect(route('admin.banks.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('banks', [
        'id' => $bank->id,
        'name' => 'Updated Bank Name',
        'va_prefix' => '2222',
        'is_active' => 0,
    ]);
});

test('admin can toggle active status of a bank', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $bank = Bank::factory()->create([
        'is_active' => true,
    ]);

    $this->actingAs($admin);

    $response = $this->post(route('admin.banks.toggle', $bank));

    $response->assertRedirect();
    $this->assertDatabaseHas('banks', [
        'id' => $bank->id,
        'is_active' => 0,
    ]);

    $response2 = $this->post(route('admin.banks.toggle', $bank));
    $response2->assertRedirect();
    $this->assertDatabaseHas('banks', [
        'id' => $bank->id,
        'is_active' => 1,
    ]);
});

test('admin can soft delete a bank', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $bank = Bank::factory()->create();

    $this->actingAs($admin);

    $response = $this->delete(route('admin.banks.destroy', $bank));

    $response->assertRedirect(route('admin.banks.index'));
    $response->assertSessionHas('success');

    $this->assertSoftDeleted('banks', [
        'id' => $bank->id,
    ]);
});
