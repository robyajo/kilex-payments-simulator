<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MidtransAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->extractKey($request);

        if (! $key) {
            return response()->json([
                'status_code' => '401',
                'status_message' => 'Access denied due to missing client key or server key. Please provide valid authorization.',
            ], 401);
        }

        $apiKey = ApiKey::with('merchant')
            ->where('server_key', $key)
            ->first();

        if (! $apiKey || ! $apiKey->merchant) {
            return response()->json([
                'status_code' => '401',
                'status_message' => 'Access denied due to unauthorized transaction, please check client key or server key.',
            ], 401);
        }

        // Attach merchant and api_key to request attributes
        $request->attributes->set('merchant', $apiKey->merchant);
        $request->attributes->set('apiKey', $apiKey);

        return $next($request);
    }

    /**
     * Extract server key or client key from authorization headers or request body.
     */
    protected function extractKey(Request $request): ?string
    {
        // 1. Check HTTP Basic Auth or Authorization Header
        $authHeader = $request->header('Authorization');
        if ($authHeader) {
            if (str_starts_with($authHeader, 'Basic ')) {
                $decoded = base64_decode(substr($authHeader, 6), true);
                if ($decoded !== false) {
                    // Midtrans sends ServerKey as username with empty password "SB-Mid-server-xxxx:"
                    $parts = explode(':', $decoded, 2);

                    return ! empty($parts[0]) ? trim($parts[0]) : trim($decoded);
                }
            }

            if (str_starts_with($authHeader, 'Bearer ')) {
                return trim(substr($authHeader, 7));
            }
        }

        // 2. Check Custom Headers
        if ($serverKey = $request->header('X-Server-Key')) {
            return trim($serverKey);
        }

        if ($clientKey = $request->header('X-Client-Key')) {
            return trim($clientKey);
        }

        // 3. Check Request Query / Body
        if ($serverKey = $request->input('server_key')) {
            return trim($serverKey);
        }

        if ($clientKey = $request->input('client_key')) {
            return trim($clientKey);
        }

        return null;
    }
}
