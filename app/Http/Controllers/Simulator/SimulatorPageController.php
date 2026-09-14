<?php

namespace App\Http\Controllers\Simulator;

use App\Http\Controllers\Controller;
use App\Jobs\SendMidtransNotificationJob;
use App\Models\Transaction;
use App\Services\VirtualAccountGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SimulatorPageController extends Controller
{
    /**
     * Render Snap Mock Payment Page.
     * Route: GET /snap/v1/pay/{token}
     */
    public function renderSnapPayment(
        string $token,
        VirtualAccountGenerator $vaGenerator
    ): Response|RedirectResponse {
        $transaction = Transaction::with('merchant')
            ->where('snap_token', $token)
            ->orWhere('id', $token)
            ->orWhere('order_id', $token)
            ->first();

        if (! $transaction) {
            abort(404, 'Transaction not found or expired.');
        }

        // Auto expire if past deadline
        if ($transaction->transaction_status === 'pending' && $transaction->expired_at->isPast()) {
            $transaction->update([
                'transaction_status' => 'expire',
                'status_code' => '407',
                'status_message' => 'Transaction is expired',
            ]);
            dispatch(new SendMidtransNotificationJob($transaction->id));
        }

        $merchant = $transaction->merchant;

        // Fetch active banks from database
        $activeBanks = \App\Models\Bank::where('is_active', true)->orderBy('name', 'asc')->get();

        $bankOptions = [];
        $bankList = [];

        if ($activeBanks->isNotEmpty()) {
            foreach ($activeBanks as $b) {
                $generated = $vaGenerator->generateForBank($b->code, $transaction->order_id);
                $bankOptions[$b->code] = $generated;
                $bankList[] = [
                    'id' => $b->id,
                    'code' => $b->code,
                    'name' => $b->name,
                    'va_prefix' => $b->va_prefix,
                    'biller_code' => $b->biller_code,
                    'bill_key_prefix' => $b->bill_key_prefix,
                    'logo_url' => $b->logo_url,
                    'badge_color' => $b->badge_color ?? 'blue',
                    'va_number' => $generated['va_number'] ?? null,
                    'bill_key' => $generated['bill_key'] ?? null,
                    'instruction_atm' => $b->instruction_atm,
                    'instruction_mbanking' => $b->instruction_mbanking,
                    'instruction_ibanking' => $b->instruction_ibanking,
                ];
            }
        } else {
            // Fallback default banks if none seeded
            foreach (['bca', 'bni', 'bri', 'permata', 'mandiri', 'cimb'] as $code) {
                $generated = $vaGenerator->generateForBank($code, $transaction->order_id);
                $bankOptions[$code] = $generated;
                $bankList[] = [
                    'id' => $code,
                    'code' => $code,
                    'name' => strtoupper($code).' Virtual Account',
                    'va_prefix' => '70014',
                    'biller_code' => $code === 'mandiri' ? '70012' : null,
                    'bill_key_prefix' => $code === 'mandiri' ? '99' : null,
                    'logo_url' => null,
                    'badge_color' => 'blue',
                    'va_number' => $generated['va_number'] ?? null,
                    'bill_key' => $generated['bill_key'] ?? null,
                    'instruction_atm' => null,
                    'instruction_mbanking' => null,
                    'instruction_ibanking' => null,
                ];
            }
        }

        $qrString = $transaction->qr_string ?: $vaGenerator->generateQrisPayload($merchant?->name ?? 'Merchant', $transaction->order_id, (float) $transaction->gross_amount);
        $cstoreCode = $transaction->payment_code ?: $vaGenerator->generateCStoreCode('indomaret');

        return Inertia::render('snap/payment-mock', [
            'transaction' => [
                'id' => $transaction->id,
                'order_id' => $transaction->order_id,
                'gross_amount' => (float) $transaction->gross_amount,
                'payment_type' => $transaction->payment_type,
                'bank' => $transaction->bank,
                'va_number' => $transaction->va_number,
                'bill_key' => $transaction->bill_key,
                'biller_code' => $transaction->biller_code,
                'payment_code' => $cstoreCode,
                'qr_string' => $qrString,
                'transaction_status' => $transaction->transaction_status,
                'status_code' => $transaction->status_code,
                'status_message' => $transaction->status_message,
                'customer_details' => $transaction->customer_details,
                'item_details' => $transaction->item_details,
                'snap_token' => $transaction->snap_token,
                'expired_at' => $transaction->expired_at->toISOString(),
                'settlement_time' => $transaction->settlement_time?->toISOString(),
                'created_at' => $transaction->created_at->toISOString(),
            ],
            'merchant' => [
                'id' => $merchant?->id,
                'name' => $merchant?->name ?? 'Demo Merchant',
                'merchant_code' => $merchant?->merchant_code ?? 'G00000000',
                'finish_url' => $merchant?->finish_url,
                'unfinish_url' => $merchant?->unfinish_url,
                'error_url' => $merchant?->error_url,
                'notification_url' => $merchant?->notification_url,
            ],
            'bankOptions' => $bankOptions,
            'bankList' => $bankList,
        ]);
    }

    /**
     * Trigger simulation action from checkout simulator or API.
     * Route: POST /simulator/action/{action}
     */
    public function triggerAction(Request $request, string $action): JsonResponse
    {
        $validated = $request->validate([
            'transaction_id' => 'required|string',
            'bank' => 'nullable|string',
            'va_number' => 'nullable|string',
            'bill_key' => 'nullable|string',
            'biller_code' => 'nullable|string',
            'payment_type' => 'nullable|string',
        ]);

        $transaction = Transaction::where('id', $validated['transaction_id'])
            ->orWhere('snap_token', $validated['transaction_id'])
            ->orWhere('order_id', $validated['transaction_id'])
            ->firstOrFail();

        $updateData = [];

        if (! empty($validated['bank'])) {
            $updateData['bank'] = $validated['bank'];
        }
        if (! empty($validated['va_number'])) {
            $updateData['va_number'] = $validated['va_number'];
        }
        if (! empty($validated['bill_key'])) {
            $updateData['bill_key'] = $validated['bill_key'];
        }
        if (! empty($validated['biller_code'])) {
            $updateData['biller_code'] = $validated['biller_code'];
        }
        if (! empty($validated['payment_type'])) {
            $updateData['payment_type'] = $validated['payment_type'];
        }

        switch (strtolower($action)) {
            case 'settle':
            case 'pay':
                $updateData['transaction_status'] = 'settlement';
                $updateData['status_code'] = '200';
                $updateData['status_message'] = 'Success, payment simulated successfully';
                $updateData['settlement_time'] = now();
                break;

            case 'expire':
                $updateData['transaction_status'] = 'expire';
                $updateData['status_code'] = '407';
                $updateData['status_message'] = 'Payment has expired';
                break;

            case 'cancel':
                $updateData['transaction_status'] = 'cancel';
                $updateData['status_code'] = '202';
                $updateData['status_message'] = 'Payment was canceled by user';
                break;

            case 'deny':
                $updateData['transaction_status'] = 'deny';
                $updateData['status_code'] = '202';
                $updateData['status_message'] = 'Payment was denied by provider';
                break;

            default:
                return response()->json(['error' => 'Unknown action'], 400);
        }

        $transaction->update($updateData);

        // Dispatch asynchronous webhook notification
        dispatch(new SendMidtransNotificationJob($transaction->id));

        return response()->json([
            'success' => true,
            'message' => "Transaction status changed to {$transaction->transaction_status}",
            'transaction' => $transaction->fresh(),
        ]);
    }

    /**
     * Poll transaction status from checkout UI.
     * Route: GET /simulator/status/{id}
     */
    public function getStatus(string $id): JsonResponse
    {
        $transaction = Transaction::where('id', $id)
            ->orWhere('snap_token', $id)
            ->orWhere('order_id', $id)
            ->first();

        if (! $transaction) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        return response()->json([
            'status' => $transaction->transaction_status,
            'status_code' => $transaction->status_code,
            'settlement_time' => $transaction->settlement_time?->toISOString(),
            'expired_at' => $transaction->expired_at->toISOString(),
        ]);
    }
}
