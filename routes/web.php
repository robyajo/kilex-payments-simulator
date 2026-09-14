<?php

use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\SettingController;
use App\Http\Controllers\Dashboard\SimulatorTestController;
use App\Http\Controllers\Dashboard\TransactionController;
use App\Http\Controllers\Simulator\SimulatorPageController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/about', 'public/about')->name('public.about');
Route::inertia('/docs', 'public/docs')->name('public.docs');

// Public Midtrans Snap Mock Payment UI & Public Simulation Trigger
Route::get('/snap/v1/pay/{token}', [SimulatorPageController::class, 'renderSnapPayment'])->name('snap.pay');
Route::post('/simulator/action/{action}', [SimulatorPageController::class, 'triggerAction'])->name('simulator.action');

// Authenticated Merchant Dashboard & Management
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Transactions
    Route::get('/dashboard/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/dashboard/transactions/{transaction}/mark-paid', [TransactionController::class, 'markPaid'])->name('transactions.mark-paid');
    Route::post('/dashboard/transactions/{transaction}/mark-expire', [TransactionController::class, 'markExpire'])->name('transactions.mark-expire');
    Route::post('/dashboard/transactions/{transaction}/mark-cancel', [TransactionController::class, 'markCancel'])->name('transactions.mark-cancel');
    Route::post('/dashboard/transactions/{transaction}/resend-webhook', [TransactionController::class, 'resendWebhook'])->name('transactions.resend-webhook');

    // Settings (API Keys, Webhook URL, Integrations)
    Route::get('/dashboard/settings/api-keys', [SettingController::class, 'index'])->name('settings.api-keys');
    Route::put('/dashboard/settings/merchant', [SettingController::class, 'updateMerchant'])->name('settings.merchant.update');
    Route::post('/dashboard/settings/regenerate-keys', [SettingController::class, 'regenerateKeys'])->name('settings.keys.regenerate');
    Route::post('/dashboard/settings/test-webhook', [SettingController::class, 'testWebhook'])->name('settings.webhook.test');

    // Simulator Sandbox Quick Creator
    Route::get('/dashboard/simulator-test', [SimulatorTestController::class, 'index'])->name('simulator.test.index');
    Route::post('/dashboard/simulator-test/create', [SimulatorTestController::class, 'store'])->name('simulator.test.create');
});

require __DIR__.'/settings.php';
