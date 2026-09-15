<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Jobs\SendMidtransNotificationJob;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Display a paginated listing of transactions.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $merchant = $user->getOrCreateDefaultMerchant();

        $query = Transaction::with(['webhookLogs'])
            ->where('merchant_id', $merchant->id);

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_id', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('va_number', 'like', "%{$search}%")
                    ->orWhere('customer_details', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('transaction_status', $status);
            }
        }

        // Payment type filter
        if ($paymentType = $request->input('payment_type')) {
            if ($paymentType !== 'all') {
                $query->where('payment_type', $paymentType);
            }
        }

        $transactions = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Transaction $t) => [
                'id' => $t->id,
                'order_id' => $t->order_id,
                'gross_amount' => (float) $t->gross_amount,
                'payment_type' => $t->payment_type,
                'bank' => $t->bank,
                'va_number' => $t->va_number,
                'bill_key' => $t->bill_key,
                'biller_code' => $t->biller_code,
                'payment_code' => $t->payment_code,
                'qr_string' => $t->qr_string,
                'transaction_status' => $t->transaction_status,
                'status_code' => $t->status_code,
                'status_message' => $t->status_message,
                'fraud_status' => $t->fraud_status,
                'customer_details' => $t->customer_details,
                'item_details' => $t->item_details,
                'custom_field1' => $t->custom_field1,
                'custom_field2' => $t->custom_field2,
                'custom_field3' => $t->custom_field3,
                'snap_token' => $t->snap_token,
                'expired_at' => $t->expired_at->toISOString(),
                'settlement_time' => $t->settlement_time?->toISOString(),
                'created_at' => $t->created_at->toISOString(),
                'webhook_count' => $t->webhookLogs->count(),
                'latest_webhook_status' => $t->webhookLogs->first()?->http_status,
                'webhook_logs' => $t->webhookLogs->map(fn ($w) => [
                    'id' => $w->id,
                    'target_url' => $w->target_url,
                    'http_status' => $w->http_status,
                    'signature_key' => $w->signature_key,
                    'payload_json' => $w->payload_json,
                    'response_body' => $w->response_body,
                    'attempt' => $w->attempt,
                    'created_at' => $w->created_at->toISOString(),
                ]),
            ]);

        $apiKey = $merchant->getOrCreateApiKey();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'payment_type' => $request->input('payment_type', 'all'),
            ],
            'serverKey' => $apiKey->server_key,
            'merchant' => [
                'name' => $merchant->name,
                'merchant_code' => $merchant->merchant_code,
            ],
        ]);
    }

    /**
     * Mark transaction as paid (settlement) manually from dashboard.
     */
    public function markPaid(Transaction $transaction, Request $request): RedirectResponse|JsonResponse
    {
        $this->authorizeMerchant($request, $transaction);
        if (! $transaction->canTransitionTo('settlement')) {
            return $this->invalidTransitionResponse($request, $transaction, 'settled');
        }

        $transaction->update([
            'transaction_status' => 'settlement',
            'status_code' => '200',
            'status_message' => 'Success, transaction settled from dashboard',
            'settlement_time' => now(),
        ]);

        dispatch(new SendMidtransNotificationJob($transaction->id));

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'transaction' => $transaction]);
        }

        return back()->with('success', "Transaction {$transaction->order_id} marked as Settlement.");
    }

    /**
     * Mark transaction as expired manually.
     */
    public function markExpire(Transaction $transaction, Request $request): RedirectResponse|JsonResponse
    {
        $this->authorizeMerchant($request, $transaction);
        if (! $transaction->canTransitionTo('expire')) {
            return $this->invalidTransitionResponse($request, $transaction, 'expired');
        }

        $transaction->update([
            'transaction_status' => 'expire',
            'status_code' => '407',
            'status_message' => 'Transaction expired from dashboard',
        ]);

        dispatch(new SendMidtransNotificationJob($transaction->id));

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'transaction' => $transaction]);
        }

        return back()->with('success', "Transaction {$transaction->order_id} marked as Expired.");
    }

    /**
     * Mark transaction as canceled manually.
     */
    public function markCancel(Transaction $transaction, Request $request): RedirectResponse|JsonResponse
    {
        $this->authorizeMerchant($request, $transaction);
        if (! $transaction->canTransitionTo('cancel')) {
            return $this->invalidTransitionResponse($request, $transaction, 'canceled');
        }

        $transaction->update([
            'transaction_status' => 'cancel',
            'status_code' => '202',
            'status_message' => 'Transaction canceled from dashboard',
        ]);

        dispatch(new SendMidtransNotificationJob($transaction->id));

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'transaction' => $transaction]);
        }

        return back()->with('success', "Transaction {$transaction->order_id} marked as Canceled.");
    }

    /**
     * Re-dispatch webhook notification for this transaction.
     */
    public function resendWebhook(Transaction $transaction, Request $request): RedirectResponse|JsonResponse
    {
        $this->authorizeMerchant($request, $transaction);

        $overrideUrl = $request->input('target_url');

        dispatch(new SendMidtransNotificationJob($transaction->id, $overrideUrl));

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Webhook notification re-dispatched.']);
        }

        return back()->with('success', 'Webhook notification re-dispatched successfully.');
    }

    /**
     * Authorize that the current authenticated user owns the merchant of the transaction.
     */
    protected function authorizeMerchant(Request $request, Transaction $transaction): void
    {
        /** @var User $user */
        $user = $request->user();
        $merchant = $user->getOrCreateDefaultMerchant();

        if ($transaction->merchant_id !== $merchant->id) {
            abort(403, 'Unauthorized access to transaction.');
        }
    }

    protected function invalidTransitionResponse(
        Request $request,
        Transaction $transaction,
        string $targetStatus
    ): RedirectResponse|JsonResponse {
        $message = "Transaction cannot be {$targetStatus} from its current state ({$transaction->transaction_status}).";

        if ($request->wantsJson()) {
            return response()->json([
                'success' => false,
                'message' => $message,
                'transaction_status' => $transaction->transaction_status,
            ], 412);
        }

        return back()->with('error', $message);
    }
}
