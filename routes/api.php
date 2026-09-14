<?php

use App\Http\Controllers\Midtrans\CoreApiController;
use App\Http\Controllers\Midtrans\SnapController;
use App\Http\Controllers\Simulator\SimulatorPageController;
use App\Http\Middleware\MidtransAuthMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Simulator API endpoints for UI & polling
Route::post('/simulator/action/{action}', [SimulatorPageController::class, 'triggerAction'])->name('api.simulator.action');
Route::get('/simulator/status/{id}', [SimulatorPageController::class, 'getStatus'])->name('api.simulator.status');

// Midtrans Snap API (Protected by MidtransAuthMiddleware)
Route::middleware([MidtransAuthMiddleware::class])->group(function () {
    Route::post('/snap/v1/transactions', [SnapController::class, 'createTransaction'])->name('api.midtrans.snap.create');

    // Midtrans Core API
    Route::post('/v2/charge', [CoreApiController::class, 'charge'])->name('api.midtrans.core.charge');
    Route::get('/v2/{order_id}/status', [CoreApiController::class, 'getStatus'])->name('api.midtrans.core.status');
    Route::post('/v2/{order_id}/cancel', [CoreApiController::class, 'cancel'])->name('api.midtrans.core.cancel');
    Route::post('/v2/{order_id}/expire', [CoreApiController::class, 'expire'])->name('api.midtrans.core.expire');

    // V1 aliases for compatibility
    Route::post('/v1/charge', [CoreApiController::class, 'charge'])->name('api.v1.charge');
    Route::get('/v1/{order_id}/status', [CoreApiController::class, 'getStatus'])->name('api.v1.status');
});
