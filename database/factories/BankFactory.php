<?php

namespace Database\Factories;

use App\Models\Bank;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bank>
 */
class BankFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $code = fake()->unique()->lexify('bank???');

        return [
            'code' => $code,
            'name' => strtoupper($code).' Virtual Account',
            'va_prefix' => (string) fake()->numberBetween(1000, 9999),
            'biller_code' => null,
            'bill_key_prefix' => null,
            'logo_url' => 'https://example.com/logo.png',
            'badge_color' => '#2563EB',
            'is_active' => true,
            'instruction_atm' => '1. Masukkan kartu ATM. 2. Pilih menu Transfer. 3. Masukkan nomor VA.',
            'instruction_mbanking' => '1. Buka m-Banking. 2. Pilih Transfer > Virtual Account.',
            'instruction_ibanking' => '1. Login ke Internet Banking. 2. Masukkan nomor VA.',
        ];
    }
}
