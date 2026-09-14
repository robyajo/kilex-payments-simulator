<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\User;
use App\Services\MidtransSignatureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display API Keys, Webhook URLs, and Integration Guides.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $merchant = $user->getOrCreateDefaultMerchant();
        $apiKey = $merchant->getOrCreateApiKey();

        return Inertia::render('settings/api-keys', [
            'merchant' => [
                'id' => $merchant->id,
                'name' => $merchant->name,
                'merchant_code' => $merchant->merchant_code,
                'notification_url' => $merchant->notification_url ?? '',
                'finish_url' => $merchant->finish_url ?? '',
                'unfinish_url' => $merchant->unfinish_url ?? '',
                'error_url' => $merchant->error_url ?? '',
            ],
            'apiKey' => [
                'id' => $apiKey->id,
                'server_key' => $apiKey->server_key,
                'client_key' => $apiKey->client_key,
                'is_production' => $apiKey->is_production,
            ],
            'appUrl' => url('/'),
        ]);
    }

    /**
     * Update merchant profile and notification URLs.
     */
    public function updateMerchant(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $merchant = $user->getOrCreateDefaultMerchant();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'notification_url' => 'nullable|url|max:2000',
            'finish_url' => 'nullable|url|max:2000',
            'unfinish_url' => 'nullable|url|max:2000',
            'error_url' => 'nullable|url|max:2000',
        ]);

        $merchant->update($validated);

        return back()->with('success', 'Merchant configuration updated successfully.');
    }

    /**
     * Regenerate API Keys (Server Key & Client Key).
     */
    public function regenerateKeys(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $merchant = $user->getOrCreateDefaultMerchant();
        $apiKey = $merchant->getOrCreateApiKey();

        $apiKey->update([
            'server_key' => ApiKey::generateServerKey(),
            'client_key' => ApiKey::generateClientKey(),
        ]);

        return back()->with('success', 'API Keys regenerated successfully.');
    }

    /**
     * Test webhook delivery ping to the configured notification URL.
     */
    public function testWebhook(
        Request $request,
        MidtransSignatureService $signatureService
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $merchant = $user->getOrCreateDefaultMerchant();

        $targetUrl = $request->input('target_url', $merchant->notification_url);

        if (empty($targetUrl)) {
            return response()->json([
                'success' => false,
                'message' => 'Notification URL is empty. Please configure a Webhook URL first.',
            ], 422);
        }

        $apiKey = $merchant->getOrCreateApiKey();
        $testOrderId = 'TEST-ORDER-'.random_int(1000, 9999);
        $testAmount = '50000.00';
        $testStatusCode = '200';

        $signatureKey = $signatureService->generate(
            $testOrderId,
            $testStatusCode,
            $testAmount,
            $apiKey->server_key
        );

        $payload = [
            'transaction_time' => now()->format('Y-m-d H:i:s'),
            'transaction_status' => 'settlement',
            'transaction_id' => '00000000-0000-0000-0000-000000000000',
            'status_message' => 'midtrans payment notification [TEST PING]',
            'status_code' => $testStatusCode,
            'signature_key' => $signatureKey,
            'payment_type' => 'bank_transfer',
            'order_id' => $testOrderId,
            'merchant_id' => $merchant->merchant_code,
            'gross_amount' => $testAmount,
            'fraud_status' => 'accept',
            'currency' => 'IDR',
            'va_numbers' => [
                [
                    'bank' => 'bca',
                    'va_number' => '700141234567',
                ],
            ],
            'settlement_time' => now()->format('Y-m-d H:i:s'),
        ];

        try {
            $startTime = microtime(true);
            $response = Http::timeout(8)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'User-Agent' => 'Midtrans-Simulator-Webhook/1.0',
                ])
                ->post($targetUrl, $payload);

            $durationMs = round((microtime(true) - $startTime) * 1000);

            return response()->json([
                'success' => true,
                'http_status' => $response->status(),
                'response_body' => substr($response->body(), 0, 2000),
                'duration_ms' => $durationMs,
                'payload_sent' => $payload,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'payload_sent' => $payload,
            ], 500);
        }
    }
}
