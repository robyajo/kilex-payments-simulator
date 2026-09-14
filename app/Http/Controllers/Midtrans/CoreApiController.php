<?php

namespace App\Http\Controllers\Midtrans;

use App\Http\Controllers\Controller;
use App\Jobs\SendMidtransNotificationJob;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Services\MidtransSignatureService;
use App\Services\VirtualAccountGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CoreApiController extends Controller
{
    /**
     * Core API: Create charge transaction.
     * Endpoint: POST /v2/charge
     */
    public function charge(
        Request $request,
        VirtualAccountGenerator $vaGenerator,
        MidtransSignatureService $signatureService
    ): JsonResponse {
        /** @var Merchant $merchant */
        $merchant = $request->attributes->get('merchant');

        $paymentType = $request->input('payment_type', 'bank_transfer');
        $orderId = $request->input('transaction_details.order_id') ?? $request->input('order_id');
        $grossAmount = (float) ($request->input('transaction_details.gross_amount') ?? $request->input('gross_amount', 0));

        if (empty($orderId) || $grossAmount <= 0) {
            return response()->json([
                'status_code' => '400',
                'status_message' => 'Validation error: transaction_details.order_id and gross_amount are required.',
            ], 400);
        }

        $bank = null;
        $vaNumber = null;
        $billKey = null;
        $billerCode = null;
        $paymentCode = null;
        $qrString = null;
        $actions = [];

        // Handle Payment Methods
        if ($paymentType === 'bank_transfer') {
            $bank = strtolower((string) ($request->input('bank_transfer.bank') ?? $request->input('bank', 'bca')));
            if ($bank === 'mandiri' || $bank === 'echannel') {
                $bank = 'mandiri';
                $vaData = $vaGenerator->generateForBank('mandiri', $orderId);
                $billerCode = $vaData['biller_code'];
                $billKey = $vaData['bill_key'];
            } else {
                $vaData = $vaGenerator->generateForBank($bank, $orderId);
                $vaNumber = $vaData['va_number'] ?? null;
            }
        } elseif ($paymentType === 'echannel') {
            $bank = 'mandiri';
            $vaData = $vaGenerator->generateForBank('mandiri', $orderId);
            $billerCode = $vaData['biller_code'];
            $billKey = $vaData['bill_key'];
        } elseif ($paymentType === 'qris' || $paymentType === 'gopay' || $paymentType === 'shopeepay') {
            $qrString = $vaGenerator->generateQrisPayload($merchant->name, $orderId, $grossAmount);
            $actions = [
                [
                    'name' => 'generate-qr-code',
                    'method' => 'GET',
                    'url' => url("/api/v1/qr-code/{$orderId}"),
                ],
                [
                    'name' => 'deeplink-redirect',
                    'method' => 'GET',
                    'url' => url("/snap/v1/pay/{$orderId}"),
                ],
            ];
        } elseif ($paymentType === 'cstore') {
            $store = $request->input('cstore.store', 'indomaret');
            $paymentCode = $vaGenerator->generateCStoreCode($store);
        }

        $expiredAt = now()->addHours(24);

        $transaction = Transaction::create([
            'merchant_id' => $merchant->id,
            'order_id' => $orderId,
            'gross_amount' => $grossAmount,
            'payment_type' => $paymentType,
            'bank' => $bank,
            'va_number' => $vaNumber,
            'bill_key' => $billKey,
            'biller_code' => $billerCode,
            'payment_code' => $paymentCode,
            'qr_string' => $qrString,
            'transaction_status' => 'pending',
            'fraud_status' => 'accept',
            'status_code' => '201',
            'status_message' => "Success, {$paymentType} transaction is created",
            'custom_field1' => $request->input('custom_field1'),
            'custom_field2' => $request->input('custom_field2'),
            'custom_field3' => $request->input('custom_field3'),
            'customer_details' => $request->input('customer_details'),
            'item_details' => $request->input('item_details'),
            'expired_at' => $expiredAt,
        ]);

        $apiKey = $merchant->primaryApiKey ?? $merchant->apiKeys()->first();
        $serverKey = $apiKey ? $apiKey->server_key : '';

        $signatureKey = $signatureService->generate(
            $transaction->order_id,
            $transaction->status_code,
            $transaction->gross_amount,
            $serverKey
        );

        $responsePayload = [
            'status_code' => '201',
            'status_message' => $transaction->status_message,
            'transaction_id' => $transaction->id,
            'order_id' => $transaction->order_id,
            'merchant_id' => $merchant->merchant_code,
            'gross_amount' => number_format((float) $transaction->gross_amount, 2, '.', ''),
            'currency' => 'IDR',
            'payment_type' => $transaction->payment_type,
            'transaction_time' => $transaction->created_at->format('Y-m-d H:i:s'),
            'transaction_status' => $transaction->transaction_status,
            'fraud_status' => $transaction->fraud_status,
            'signature_key' => $signatureKey,
            'expiry_time' => $transaction->expired_at->format('Y-m-d H:i:s'),
        ];

        if ($vaNumber && $bank) {
            $responsePayload['va_numbers'] = [
                [
                    'bank' => $bank,
                    'va_number' => $vaNumber,
                ],
            ];
        }

        if ($billKey && $billerCode) {
            $responsePayload['bill_key'] = $billKey;
            $responsePayload['biller_code'] = $billerCode;
        }

        if ($paymentCode) {
            $responsePayload['payment_code'] = $paymentCode;
        }

        if ($qrString) {
            $responsePayload['qr_string'] = $qrString;
            $responsePayload['actions'] = $actions;
        }

        return response()->json($responsePayload, 201);
    }

    /**
     * Check transaction status.
     * Endpoint: GET /v2/{order_id}/status
     */
    public function getStatus(
        string $orderId,
        Request $request,
        MidtransSignatureService $signatureService
    ): JsonResponse {
        /** @var Merchant $merchant */
        $merchant = $request->attributes->get('merchant');

        $transaction = Transaction::where('merchant_id', $merchant->id)
            ->where(function ($query) use ($orderId) {
                $query->where('order_id', $orderId)
                    ->orWhere('id', $orderId)
                    ->orWhere('snap_token', $orderId);
            })
            ->latest()
            ->first();

        if (! $transaction) {
            return response()->json([
                'status_code' => '404',
                'status_message' => 'Transaction order_id not found',
            ], 404);
        }

        $apiKey = $merchant->primaryApiKey ?? $merchant->apiKeys()->first();
        $serverKey = $apiKey ? $apiKey->server_key : '';

        $signatureKey = $signatureService->generate(
            $transaction->order_id,
            $transaction->status_code,
            $transaction->gross_amount,
            $serverKey
        );

        $responsePayload = [
            'status_code' => $transaction->status_code,
            'status_message' => $transaction->status_message ?: 'midtrans payment status',
            'transaction_id' => $transaction->id,
            'order_id' => $transaction->order_id,
            'merchant_id' => $merchant->merchant_code,
            'gross_amount' => number_format((float) $transaction->gross_amount, 2, '.', ''),
            'currency' => 'IDR',
            'payment_type' => $transaction->payment_type,
            'transaction_time' => $transaction->created_at->format('Y-m-d H:i:s'),
            'transaction_status' => $transaction->transaction_status,
            'fraud_status' => $transaction->fraud_status,
            'signature_key' => $signatureKey,
            'expiry_time' => $transaction->expired_at->format('Y-m-d H:i:s'),
        ];

        if ($transaction->settlement_time) {
            $responsePayload['settlement_time'] = $transaction->settlement_time->format('Y-m-d H:i:s');
        }

        if ($transaction->va_number && $transaction->bank) {
            $responsePayload['va_numbers'] = [
                [
                    'bank' => $transaction->bank,
                    'va_number' => $transaction->va_number,
                ],
            ];
        }

        if ($transaction->bill_key && $transaction->biller_code) {
            $responsePayload['bill_key'] = $transaction->bill_key;
            $responsePayload['biller_code'] = $transaction->biller_code;
        }

        if ($transaction->payment_code) {
            $responsePayload['payment_code'] = $transaction->payment_code;
        }

        if ($transaction->qr_string) {
            $responsePayload['qr_string'] = $transaction->qr_string;
        }

        return response()->json($responsePayload, (int) $transaction->status_code);
    }

    /**
     * Cancel transaction.
     * Endpoint: POST /v2/{order_id}/cancel
     */
    public function cancel(
        string $orderId,
        Request $request,
        MidtransSignatureService $signatureService
    ): JsonResponse {
        /** @var Merchant $merchant */
        $merchant = $request->attributes->get('merchant');

        $transaction = Transaction::where('merchant_id', $merchant->id)
            ->where(function ($query) use ($orderId) {
                $query->where('order_id', $orderId)
                    ->orWhere('id', $orderId);
            })
            ->latest()
            ->first();

        if (! $transaction) {
            return response()->json([
                'status_code' => '404',
                'status_message' => 'Transaction order_id not found',
            ], 404);
        }

        $transaction->update([
            'transaction_status' => 'cancel',
            'status_code' => '202',
            'status_message' => 'Success, transaction is canceled',
        ]);

        // Dispatch webhook notification
        dispatch(new SendMidtransNotificationJob($transaction->id));

        $apiKey = $merchant->primaryApiKey ?? $merchant->apiKeys()->first();
        $serverKey = $apiKey ? $apiKey->server_key : '';

        $signatureKey = $signatureService->generate(
            $transaction->order_id,
            $transaction->status_code,
            $transaction->gross_amount,
            $serverKey
        );

        return response()->json([
            'status_code' => '202',
            'status_message' => 'Success, transaction is canceled',
            'transaction_id' => $transaction->id,
            'order_id' => $transaction->order_id,
            'merchant_id' => $merchant->merchant_code,
            'gross_amount' => number_format((float) $transaction->gross_amount, 2, '.', ''),
            'currency' => 'IDR',
            'payment_type' => $transaction->payment_type,
            'transaction_time' => $transaction->created_at->format('Y-m-d H:i:s'),
            'transaction_status' => 'cancel',
            'fraud_status' => $transaction->fraud_status,
            'signature_key' => $signatureKey,
        ], 200);
    }

    /**
     * Expire transaction.
     * Endpoint: POST /v2/{order_id}/expire
     */
    public function expire(
        string $orderId,
        Request $request,
        MidtransSignatureService $signatureService
    ): JsonResponse {
        /** @var Merchant $merchant */
        $merchant = $request->attributes->get('merchant');

        $transaction = Transaction::where('merchant_id', $merchant->id)
            ->where(function ($query) use ($orderId) {
                $query->where('order_id', $orderId)
                    ->orWhere('id', $orderId);
            })
            ->latest()
            ->first();

        if (! $transaction) {
            return response()->json([
                'status_code' => '404',
                'status_message' => 'Transaction order_id not found',
            ], 404);
        }

        $transaction->update([
            'transaction_status' => 'expire',
            'status_code' => '407',
            'status_message' => 'Success, transaction is expired',
        ]);

        // Dispatch webhook notification
        dispatch(new SendMidtransNotificationJob($transaction->id));

        $apiKey = $merchant->primaryApiKey ?? $merchant->apiKeys()->first();
        $serverKey = $apiKey ? $apiKey->server_key : '';

        $signatureKey = $signatureService->generate(
            $transaction->order_id,
            $transaction->status_code,
            $transaction->gross_amount,
            $serverKey
        );

        return response()->json([
            'status_code' => '407',
            'status_message' => 'Success, transaction is expired',
            'transaction_id' => $transaction->id,
            'order_id' => $transaction->order_id,
            'merchant_id' => $merchant->merchant_code,
            'gross_amount' => number_format((float) $transaction->gross_amount, 2, '.', ''),
            'currency' => 'IDR',
            'payment_type' => $transaction->payment_type,
            'transaction_time' => $transaction->created_at->format('Y-m-d H:i:s'),
            'transaction_status' => 'expire',
            'fraud_status' => $transaction->fraud_status,
            'signature_key' => $signatureKey,
        ], 200);
    }
}
