<?php

namespace App\Http\Middleware;

use App\Models\Merchant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class StripeAuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $authorization = $request->header('Authorization', '');
        $secretKey = str_starts_with($authorization, 'Bearer ')
            ? trim(substr($authorization, 7))
            : null;

        if (! $secretKey || ! str_starts_with($secretKey, 'sk_test_')) {
            return response()->json([
                'error' => [
                    'type' => 'invalid_request_error',
                    'message' => 'Invalid API Key provided.',
                ],
            ], 401);
        }

        $merchant = Merchant::whereNotNull('stripe_secret_key_hash')->get()
            ->first(fn (Merchant $merchant) => Hash::check($secretKey, $merchant->stripe_secret_key_hash));

        if (! $merchant) {
            return response()->json([
                'error' => [
                    'type' => 'invalid_request_error',
                    'message' => 'No such API key.',
                ],
            ], 401);
        }

        if (! $merchant->supportsProvider('stripe')) {
            return response()->json([
                'error' => [
                    'type' => 'invalid_request_error',
                    'message' => 'Stripe provider is not enabled for this merchant.',
                ],
            ], 403);
        }

        $request->attributes->set('merchant', $merchant);
        $request->attributes->set('stripeSecretKey', $secretKey);

        return $next($request);
    }
}
