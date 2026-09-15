<?php

namespace App\Http\Controllers\Stripe;

use App\Http\Controllers\Controller;
use App\Jobs\SendStripeNotificationJob;
use App\Models\Merchant;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StripeApiController extends Controller
{
    public function createPaymentIntent(Request $request): JsonResponse
    {
        /** @var Merchant $merchant */
        $merchant = $request->attributes->get('merchant');
        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:50'],
            'currency' => ['required', 'string', 'size:3'],
            'description' => ['nullable', 'string', 'max:500'],
            'metadata' => ['nullable', 'array'],
            'automatic_payment_methods' => ['nullable', 'array'],
        ]);

        $id = 'pi_'.Str::lower(Str::random(24));
        $clientSecret = $id.'_secret_'.Str::lower(Str::random(32));
        $orderId = $data['metadata']['order_id'] ?? 'stripe-'.Str::lower(Str::random(12));
        $transaction = Transaction::create([
            'merchant_id' => $merchant->id,
            'provider' => 'stripe',
            'order_id' => $orderId,
            'gross_amount' => $data['amount'] / 100,
            'payment_type' => 'stripe',
            'transaction_status' => 'pending',
            'status_code' => '200',
            'status_message' => 'PaymentIntent created',
            'fraud_status' => 'accept',
            'provider_reference' => $id,
            'provider_client_secret' => $clientSecret,
            'customer_details' => $data['metadata'] ?? null,
            'expired_at' => now()->addHours(24),
        ]);

        return response()->json($this->paymentIntentPayload($transaction, $data, $clientSecret));
    }

    public function retrievePaymentIntent(string $id, Request $request): JsonResponse
    {
        $transaction = $this->transaction($id, $request);

        return response()->json($this->paymentIntentPayload($transaction, [
            'amount' => (int) round((float) $transaction->gross_amount * 100),
            'currency' => 'idr',
        ], $transaction->provider_client_secret));
    }

    public function confirmPaymentIntent(string $id, Request $request): JsonResponse
    {
        $transaction = $this->transaction($id, $request);
        abort_unless($transaction->canTransitionTo('settlement'), 409, 'PaymentIntent cannot be confirmed.');

        $transaction->update([
            'transaction_status' => 'settlement',
            'status_message' => 'PaymentIntent succeeded',
            'settlement_time' => now(),
        ]);
        SendStripeNotificationJob::dispatch($transaction->id);

        return response()->json($this->paymentIntentPayload($transaction->fresh(), [
            'amount' => (int) round((float) $transaction->gross_amount * 100),
            'currency' => 'idr',
        ], $transaction->provider_client_secret));
    }

    public function createCheckoutSession(Request $request): JsonResponse
    {
        /** @var Merchant $merchant */
        $merchant = $request->attributes->get('merchant');
        $data = $request->validate([
            'mode' => ['nullable', 'in:payment'],
            'line_items' => ['required', 'array', 'min:1'],
            'line_items.*.price_data.currency' => ['required', 'string', 'size:3'],
            'line_items.*.price_data.unit_amount' => ['required', 'integer', 'min:50'],
            'line_items.*.price_data.product_data.name' => ['required', 'string', 'max:255'],
            'line_items.*.quantity' => ['required', 'integer', 'min:1'],
            'success_url' => ['required', 'url'],
            'cancel_url' => ['required', 'url'],
            'metadata' => ['nullable', 'array'],
        ]);

        $amount = collect($data['line_items'])->sum(
            fn (array $item) => $item['price_data']['unit_amount'] * $item['quantity']
        );
        $id = 'cs_test_'.Str::lower(Str::random(24));
        $transaction = Transaction::create([
            'merchant_id' => $merchant->id,
            'provider' => 'stripe',
            'order_id' => $data['metadata']['order_id'] ?? $id,
            'gross_amount' => $amount / 100,
            'payment_type' => 'stripe_checkout',
            'transaction_status' => 'pending',
            'status_code' => '200',
            'status_message' => 'Checkout Session created',
            'fraud_status' => 'accept',
            'provider_reference' => $id,
            'customer_details' => $data['metadata'] ?? null,
            'item_details' => $data['line_items'],
            'expired_at' => now()->addHours(24),
        ]);

        return response()->json([
            'id' => $id,
            'object' => 'checkout.session',
            'mode' => 'payment',
            'status' => 'open',
            'payment_status' => 'unpaid',
            'amount_total' => $amount,
            'currency' => strtolower($data['line_items'][0]['price_data']['currency']),
            'url' => url("/stripe/checkout/{$id}"),
            'success_url' => $data['success_url'],
            'cancel_url' => $data['cancel_url'],
        ]);
    }

    private function transaction(string $id, Request $request): Transaction
    {
        /** @var Merchant $merchant */
        $merchant = $request->attributes->get('merchant');

        return Transaction::where('merchant_id', $merchant->id)
            ->where('provider', 'stripe')
            ->where('provider_reference', $id)
            ->firstOrFail();
    }

    private function paymentIntentPayload(Transaction $transaction, array $data, ?string $clientSecret): array
    {
        return [
            'id' => $transaction->provider_reference,
            'object' => 'payment_intent',
            'amount' => $data['amount'],
            'amount_received' => $transaction->transaction_status === 'settlement' ? $data['amount'] : 0,
            'currency' => strtolower($data['currency']),
            'status' => $transaction->transaction_status === 'settlement' ? 'succeeded' : 'requires_payment_method',
            'client_secret' => $clientSecret,
            'description' => $data['description'] ?? null,
            'livemode' => false,
            'metadata' => $transaction->customer_details ?? [],
        ];
    }
}
