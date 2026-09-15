<?php

namespace App\Http\Controllers\Stripe;

use App\Jobs\SendStripeNotificationJob;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class StripeCheckoutController
{
    public function show(string $sessionId): Response
    {
        $transaction = Transaction::where('provider', 'stripe')
            ->where('provider_reference', $sessionId)
            ->firstOrFail();

        return Inertia::render('stripe/checkout', [
            'session' => [
                'id' => $sessionId,
                'amount_total' => (int) round((float) $transaction->gross_amount * 100),
                'currency' => 'idr',
                'payment_status' => $transaction->transaction_status === 'settlement' ? 'paid' : 'unpaid',
                'status' => $transaction->transaction_status === 'settlement' ? 'complete' : 'open',
                'merchant_name' => $transaction->merchant->name,
            ],
        ]);
    }

    public function complete(string $sessionId): JsonResponse
    {
        $transaction = Transaction::where('provider', 'stripe')
            ->where('provider_reference', $sessionId)
            ->firstOrFail();

        if ($transaction->canTransitionTo('settlement')) {
            $transaction->update([
                'transaction_status' => 'settlement',
                'status_message' => 'Checkout Session completed',
                'settlement_time' => now(),
            ]);
            SendStripeNotificationJob::dispatch($transaction->id);
        }

        return response()->json([
            'id' => $sessionId,
            'status' => 'complete',
            'payment_status' => 'paid',
        ]);
    }
}
