<?php

namespace App\Services;

use App\Models\Bank;

class VirtualAccountGenerator
{
    /**
     * Generate Virtual Account numbers and metadata by bank name.
     *
     * @return array{bank: string, va_number?: string, bill_key?: string, biller_code?: string, bank_name?: string, logo_url?: string}
     */
    public function generateForBank(string $bank, string $orderId): array
    {
        $normalizedBank = strtolower(trim($bank));
        if ($normalizedBank === 'echannel') {
            $normalizedBank = 'mandiri';
        }

        // Generate deterministic numeric seed based on orderId
        $numericSeed = substr(preg_replace('/\D/', '', md5($orderId)), 0, 8);
        if (strlen($numericSeed) < 8) {
            $numericSeed = str_pad($numericSeed, 8, '7', STR_PAD_RIGHT);
        }

        // 1. Look up dynamic bank configuration from Database
        try {
            $dbBank = Bank::where('code', $normalizedBank)->first();
            if ($dbBank) {
                if (! empty($dbBank->biller_code)) {
                    $billPrefix = $dbBank->bill_key_prefix ?: '99';

                    return [
                        'bank' => $dbBank->code,
                        'bank_name' => $dbBank->name,
                        'logo_url' => $dbBank->logo_url,
                        'biller_code' => $dbBank->biller_code,
                        'bill_key' => $billPrefix.substr($numericSeed, 0, 8),
                    ];
                }

                $prefix = $dbBank->va_prefix ?: '70014';

                return [
                    'bank' => $dbBank->code,
                    'bank_name' => $dbBank->name,
                    'logo_url' => $dbBank->logo_url,
                    'va_number' => $prefix.substr($numericSeed, 0, 8),
                ];
            }
        } catch (\Throwable) {
            // Fallback gracefully if database table is not ready
        }

        // 2. Default Fallback Generator
        return match ($normalizedBank) {
            'bca' => [
                'bank' => 'bca',
                'bank_name' => 'Bank Central Asia (BCA)',
                'va_number' => '70014'.substr($numericSeed, 0, 7),
            ],
            'bni' => [
                'bank' => 'bni',
                'bank_name' => 'Bank Negara Indonesia (BNI)',
                'va_number' => '8808'.substr($numericSeed, 0, 8),
            ],
            'bri' => [
                'bank' => 'bri',
                'bank_name' => 'Bank Rakyat Indonesia (BRI)',
                'va_number' => '0201'.substr($numericSeed, 0, 8),
            ],
            'permata' => [
                'bank' => 'permata',
                'bank_name' => 'Permata Bank',
                'va_number' => '8778'.substr($numericSeed, 0, 8),
            ],
            'mandiri', 'echannel' => [
                'bank' => 'mandiri',
                'bank_name' => 'Bank Mandiri',
                'biller_code' => '70012',
                'bill_key' => '99'.substr($numericSeed, 0, 8),
            ],
            'cimb' => [
                'bank' => 'cimb',
                'bank_name' => 'CIMB Niaga',
                'va_number' => '5919'.substr($numericSeed, 0, 8),
            ],
            default => [
                'bank' => $normalizedBank,
                'bank_name' => strtoupper($normalizedBank),
                'va_number' => '9900'.substr($numericSeed, 0, 8),
            ],
        };
    }

    /**
     * Generate standard QRIS mock string payload (EMVCo format compatible).
     */
    public function generateQrisPayload(string $merchantName, string $orderId, float $amount): string
    {
        $sanitizedMerchant = strtoupper(substr(preg_replace('/[^A-Za-z0-9 ]/', '', $merchantName), 0, 20));
        if (empty($sanitizedMerchant)) {
            $sanitizedMerchant = 'MOCK MERCHANT';
        }

        $formattedAmount = number_format($amount, 0, '', '');

        return '00020101021226590014ID.LINKAJA.WWW01189360091100223456780215'.$orderId.'52045812530336054'.str_pad((string) strlen($formattedAmount), 2, '0', STR_PAD_LEFT).$formattedAmount.'5802ID59'.str_pad((string) strlen($sanitizedMerchant), 2, '0', STR_PAD_LEFT).$sanitizedMerchant.'6007JAKARTA61051234062070703A016304'.strtoupper(substr(md5($orderId), 0, 4));
    }

    /**
     * Generate Convenience Store (Alfamart / Indomaret) payment code.
     */
    public function generateCStoreCode(string $store = 'indomaret'): string
    {
        $prefix = strtolower($store) === 'alfamart' ? 'ALFA' : 'INDO';

        return $prefix.random_int(1000000000, 9999999999);
    }
}
