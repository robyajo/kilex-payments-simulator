<?php

use App\Http\Controllers\Stripe\StripeApiController;
use App\Http\Middleware\StripeAuthMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(StripeAuthMiddleware::class)->prefix('stripe/v1')->group(function () {
    Route::post('/payment_intents', [StripeApiController::class, 'createPaymentIntent']);
    Route::get('/payment_intents/{id}', [StripeApiController::class, 'retrievePaymentIntent']);
    Route::post('/payment_intents/{id}/confirm', [StripeApiController::class, 'confirmPaymentIntent']);
    Route::post('/checkout/sessions', [StripeApiController::class, 'createCheckoutSession']);
});
