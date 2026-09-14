<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Services\VirtualAccountGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SimulatorTestController extends Controller
{
    /**
     * Show simulator sandbox creation page in dashboard.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $merchant = $user->getOrCreateDefaultMerchant();
        $apiKey = $merchant->getOrCreateApiKey();

        return Inertia::render('simulator/create', [
            'merchant' => [
                'name' => $merchant->name,
                'merchant_code' => $merchant->merchant_code,
            ],
            'apiKey' => [
                'server_key' => $apiKey->server_key,
                'client_key' => $apiKey->client_key,
            ],
            'defaultOrderId' => 'ORD-'.time().'-'.random_int(100, 999),
        ]);
    }

    /**
     * Create quick test charge or snap transaction.
     */
    public function store(Request $request, VirtualAccountGenerator $vaGenerator): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $merchant = $user->getOrCreateDefaultMerchant();

        $validated = $request->validate([
            'order_id' => 'required|string|max:100',
            'gross_amount' => 'required|numeric|min:1000',
            'payment_type' => 'required|string|in:snap,bank_transfer,qris,gopay,cstore',
            'bank' => 'nullable|string|in:bca,bni,bri,permata,mandiri,cimb',
            'customer_name' => 'nullable|string|max:150',
            'customer_email' => 'nullable|email|max:150',
            'customer_phone' => 'nullable|string|max:30',
        ]);

        $orderId = $validated['order_id'];
        $grossAmount = (float) $validated['gross_amount'];
        $paymentType = $validated['payment_type'];
        $bank = $validated['bank'] ?? 'bca';

        $customerDetails = [
            'first_name' => $validated['customer_name'] ?: 'Test Customer',
            'email' => $validated['customer_email'] ?: 'tester@example.com',
            'phone' => $validated['customer_phone'] ?: '081234567890',
        ];

        $itemDetails = [
            [
                'id' => 'ITEM-1',
                'name' => 'Sandbox Simulator Test Item',
                'price' => $grossAmount,
                'quantity' => 1,
            ],
        ];

        $snapToken = 'snap-token-'.Str::uuid()->toString();
        $vaData = $vaGenerator->generateForBank($bank, $orderId);
        $qrString = $vaGenerator->generateQrisPayload($merchant->name, $orderId, $grossAmount);

        $transaction = Transaction::create([
            'merchant_id' => $merchant->id,
            'order_id' => $orderId,
            'gross_amount' => $grossAmount,
            'payment_type' => $paymentType,
            'bank' => ($paymentType === 'bank_transfer' || $paymentType === 'snap') ? $bank : null,
            'va_number' => $vaData['va_number'] ?? null,
            'bill_key' => $vaData['bill_key'] ?? null,
            'biller_code' => $vaData['biller_code'] ?? null,
            'payment_code' => $paymentType === 'cstore' ? $vaGenerator->generateCStoreCode() : null,
            'qr_string' => $qrString,
            'transaction_status' => 'pending',
            'fraud_status' => 'accept',
            'status_code' => '201',
            'status_message' => "Success, {$paymentType} transaction is created",
            'customer_details' => $customerDetails,
            'item_details' => $itemDetails,
            'snap_token' => $snapToken,
            'expired_at' => now()->addHours(24),
        ]);

        return response()->json([
            'success' => true,
            'transaction' => $transaction,
            'snap_url' => url("/snap/v1/pay/{$snapToken}"),
        ]);
    }
}
