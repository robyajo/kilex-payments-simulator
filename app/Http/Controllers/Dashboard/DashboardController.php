<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WebhookLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display merchant dashboard overview with analytics and stats.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $merchant = $user->getOrCreateDefaultMerchant();

        $merchantId = $merchant->id;

        // Analytics
        $totalTransactions = Transaction::where('merchant_id', $merchantId)->count();
        $totalVolume = (float) Transaction::where('merchant_id', $merchantId)
            ->where('transaction_status', 'settlement')
            ->sum('gross_amount');

        $settlementCount = Transaction::where('merchant_id', $merchantId)
            ->where('transaction_status', 'settlement')
            ->count();

        $pendingCount = Transaction::where('merchant_id', $merchantId)
            ->where('transaction_status', 'pending')
            ->count();

        $failedCount = Transaction::where('merchant_id', $merchantId)
            ->whereIn('transaction_status', ['expire', 'cancel', 'deny'])
            ->count();

        $conversionRate = $totalTransactions > 0
            ? round(($settlementCount / $totalTransactions) * 100, 1)
            : 0.0;

        // Webhook stats
        $totalWebhooks = WebhookLog::where('merchant_id', $merchantId)->count();
        $successfulWebhooks = WebhookLog::where('merchant_id', $merchantId)
            ->whereBetween('http_status', [200, 299])
            ->count();

        $webhookSuccessRate = $totalWebhooks > 0
            ? round(($successfulWebhooks / $totalWebhooks) * 100, 1)
            : 100.0;

        // Recent transactions
        $recentTransactions = Transaction::where('merchant_id', $merchantId)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Transaction $t) => [
                'id' => $t->id,
                'order_id' => $t->order_id,
                'gross_amount' => (float) $t->gross_amount,
                'payment_type' => $t->payment_type,
                'bank' => $t->bank,
                'va_number' => $t->va_number,
                'transaction_status' => $t->transaction_status,
                'status_code' => $t->status_code,
                'snap_token' => $t->snap_token,
                'created_at' => $t->created_at->toISOString(),
            ]);

        // Recent webhook logs
        $recentWebhooks = WebhookLog::with('transaction')
            ->where('merchant_id', $merchantId)
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (WebhookLog $w) => [
                'id' => $w->id,
                'transaction_id' => $w->transaction_id,
                'order_id' => $w->transaction?->order_id ?? 'Unknown',
                'target_url' => $w->target_url,
                'http_status' => $w->http_status,
                'signature_key' => $w->signature_key,
                'attempt' => $w->attempt,
                'created_at' => $w->created_at->toISOString(),
            ]);

        $apiKey = $merchant->getOrCreateApiKey();

        return Inertia::render('dashboard', [
            'merchant' => [
                'id' => $merchant->id,
                'name' => $merchant->name,
                'merchant_code' => $merchant->merchant_code,
                'notification_url' => $merchant->notification_url,
            ],
            'apiKey' => [
                'server_key' => $apiKey->server_key,
                'client_key' => $apiKey->client_key,
            ],
            'stats' => [
                'total_transactions' => $totalTransactions,
                'total_volume' => $totalVolume,
                'settlement_count' => $settlementCount,
                'pending_count' => $pendingCount,
                'failed_count' => $failedCount,
                'conversion_rate' => $conversionRate,
                'total_webhooks' => $totalWebhooks,
                'webhook_success_rate' => $webhookSuccessRate,
            ],
            'recentTransactions' => $recentTransactions,
            'recentWebhooks' => $recentWebhooks,
        ]);
    }
}
