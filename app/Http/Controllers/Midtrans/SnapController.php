<?php

namespace App\Http\Controllers\Midtrans;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Services\VirtualAccountGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SnapController extends Controller
{
    /**
     * Create Snap Transaction Token and Redirect URL.
     * Endpoint: POST /snap/v1/transactions
     */
    public function createTransaction(Request $request, VirtualAccountGenerator $vaGenerator): JsonResponse
    {
        /** @var Merchant $merchant */
        $merchant = $request->attributes->get('merchant');

        $validated = $request->validate([
            'transaction_details' => 'required_without:order_id|array',
            'transaction_details.order_id' => 'required_with:transaction_details|string',
            'transaction_details.gross_amount' => 'required_with:transaction_details|numeric',
            'order_id' => 'sometimes|string',
            'gross_amount' => 'sometimes|numeric',
            'customer_details' => 'nullable|array',
            'item_details' => 'nullable|array',
            'custom_field1' => 'nullable|string',
            'custom_field2' => 'nullable|string',
            'custom_field3' => 'nullable|string',
            'expiry' => 'nullable|array',
            'enabled_payments' => 'nullable|array',
        ]);

        $orderId = $request->input('transaction_details.order_id') ?? $request->input('order_id');
        $grossAmount = (float) ($request->input('transaction_details.gross_amount') ?? $request->input('gross_amount'));

        // Determine expiry duration (default: 24 hours)
        $expiryDuration = 24;
        $expiryUnit = 'hours';
        if ($request->has('expiry.duration') && $request->has('expiry.unit')) {
            $expiryDuration = (int) $request->input('expiry.duration');
            $expiryUnit = $request->input('expiry.unit');
        }

        $expiredAt = match ($expiryUnit) {
            'minute', 'minutes' => now()->addMinutes($expiryDuration),
            'day', 'days' => now()->addDays($expiryDuration),
            default => now()->addHours($expiryDuration),
        };

        $snapToken = 'snap-token-'.Str::uuid()->toString();

        // Default default payment method metadata for snap simulation
        $bcaVa = $vaGenerator->generateForBank('bca', $orderId);
        $qrString = $vaGenerator->generateQrisPayload($merchant->name, $orderId, $grossAmount);

        $transaction = Transaction::create([
            'merchant_id' => $merchant->id,
            'order_id' => $orderId,
            'gross_amount' => $grossAmount,
            'payment_type' => 'snap',
            'bank' => 'bca',
            'va_number' => $bcaVa['va_number'] ?? null,
            'qr_string' => $qrString,
            'transaction_status' => 'pending',
            'fraud_status' => 'accept',
            'status_code' => '201',
            'status_message' => 'Success, Snap transaction is created',
            'custom_field1' => $request->input('custom_field1'),
            'custom_field2' => $request->input('custom_field2'),
            'custom_field3' => $request->input('custom_field3'),
            'customer_details' => $request->input('customer_details'),
            'item_details' => $request->input('item_details'),
            'snap_token' => $snapToken,
            'expired_at' => $expiredAt,
        ]);

        $redirectUrl = url("/snap/v1/pay/{$snapToken}");

        return response()->json([
            'token' => $snapToken,
            'redirect_url' => $redirectUrl,
        ], 201);
    }
}
