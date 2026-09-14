<?php

namespace App\Services;

class MidtransSignatureService
{
    /**
     * Generate Midtrans SHA-512 signature key.
     * Formula: SHA512(order_id + status_code + gross_amount + server_key)
     *
     * @param  string  $orderId  Merchant Order ID
     * @param  string  $statusCode  Midtrans HTTP/Status code (e.g. '200', '201', '202', '407')
     * @param  string|float|int  $grossAmount  Gross transaction amount (e.g. '150000.00' or 150000)
     * @param  string  $serverKey  Merchant Server Key (e.g. 'SB-Mid-server-...')
     */
    public function generate(string $orderId, string $statusCode, string|float|int $grossAmount, string $serverKey): string
    {
        $formattedAmount = is_numeric($grossAmount)
            ? (str_contains((string) $grossAmount, '.') ? (string) $grossAmount : number_format((float) $grossAmount, 2, '.', ''))
            : (string) $grossAmount;

        $rawPayload = $orderId.$statusCode.$formattedAmount.$serverKey;

        return hash('sha512', $rawPayload);
    }

    /**
     * Verify Midtrans SHA-512 signature key.
     */
    public function verify(string $signature, string $orderId, string $statusCode, string|float|int $grossAmount, string $serverKey): bool
    {
        $expected = $this->generate($orderId, $statusCode, $grossAmount, $serverKey);

        return hash_equals($expected, $signature);
    }
}
