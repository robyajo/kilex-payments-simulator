<?php

namespace Database\Seeders;

use App\Models\Bank;
use Illuminate\Database\Seeder;

class BankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banks = [
            [
                'code' => 'bca',
                'name' => 'Bank Central Asia (BCA)',
                'va_prefix' => '70014',
                'biller_code' => null,
                'bill_key_prefix' => null,
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
                'badge_color' => 'blue',
                'is_active' => true,
                'instruction_atm' => '1. Masukkan Kartu ATM & PIN BCA Anda.\n2. Pilih menu Transfer > Ke Rek BCA Virtual Account.\n3. Masukkan Nomor VA dan konfirmasi nominal transfer.',
                'instruction_mbanking' => '1. Buka aplikasi BCA Mobile (m-BCA).\n2. Pilih m-Transfer > BCA Virtual Account.\n3. Masukkan Nomor VA dan PIN m-BCA Anda.',
                'instruction_ibanking' => '1. Login ke KlikBCA Individual.\n2. Pilih Transfer Dana > Transfer ke BCA Virtual Account.\n3. Masukkan Nomor VA dan selesaikan dengan KeyBCA.',
            ],
            [
                'code' => 'bni',
                'name' => 'Bank Negara Indonesia (BNI)',
                'va_prefix' => '8808',
                'biller_code' => null,
                'bill_key_prefix' => null,
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/5/5c/BNI_logo.svg',
                'badge_color' => 'teal',
                'is_active' => true,
                'instruction_atm' => '1. Masukkan Kartu ATM & PIN BNI.\n2. Pilih menu Lainnya > Transfer > Virtual Account Billing.\n3. Masukkan Nomor VA BNI.',
                'instruction_mbanking' => '1. Buka BNI Mobile Banking.\n2. Pilih menu Pembayaran > Virtual Account Billing.\n3. Masukkan Nomor VA dan Password Transaksi.',
                'instruction_ibanking' => '1. Akses BNI Internet Banking.\n2. Pilih Transaksi > Pembayaran Tagihan > Virtual Account Billing.',
            ],
            [
                'code' => 'bri',
                'name' => 'Bank Rakyat Indonesia (BRI)',
                'va_prefix' => '0201',
                'biller_code' => null,
                'bill_key_prefix' => null,
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg',
                'badge_color' => 'blue',
                'is_active' => true,
                'instruction_atm' => '1. Masukkan Kartu ATM & PIN BRI.\n2. Pilih Transaksi Lain > Pembayaran > Lainnya > BRIVA.\n3. Masukkan Nomor BRIVA.',
                'instruction_mbanking' => '1. Buka aplikasi BRImo.\n2. Pilih menu Pembayaran > BRIVA.\n3. Masukkan Nomor BRIVA dan PIN BRImo Anda.',
                'instruction_ibanking' => '1. Login ke Internet Banking BRI.\n2. Pilih menu Pembayaran Tagihan > Pembayaran > BRIVA.',
            ],
            [
                'code' => 'mandiri',
                'name' => 'Bank Mandiri (Bill Payment)',
                'va_prefix' => '70012',
                'biller_code' => '70012',
                'bill_key_prefix' => '99',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
                'badge_color' => 'amber',
                'is_active' => true,
                'instruction_atm' => '1. Masukkan Kartu ATM & PIN Mandiri.\n2. Pilih menu Bayar/Beli > Multi Payment.\n3. Masukkan Kode Perusahaan (Biller Code) 70012 dan Nomor Pelanggan (Bill Key).',
                'instruction_mbanking' => '1. Buka aplikasi Livin by Mandiri.\n2. Pilih menu Bayar > Multi Payment.\n3. Pilih Penyedia Jasa 70012 dan masukkan Nomor Pelanggan.',
                'instruction_ibanking' => '1. Login Mandiri Internet Banking.\n2. Masuk ke menu Bayar > Multi Payment > Masukkan Kode Perusahaan dan Bill Key.',
            ],
            [
                'code' => 'permata',
                'name' => 'Permata Bank',
                'va_prefix' => '8778',
                'biller_code' => null,
                'bill_key_prefix' => null,
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Permata_Bank_logo.svg',
                'badge_color' => 'emerald',
                'is_active' => true,
                'instruction_atm' => '1. Masukkan Kartu ATM & PIN Permata.\n2. Pilih menu Transfer > Virtual Account.\n3. Masukkan Nomor Permata VA.',
                'instruction_mbanking' => '1. Buka PermataMobile X.\n2. Pilih menu Bayar Tagihan > Virtual Account.\n3. Masukkan Nomor VA dan otentikasi.',
                'instruction_ibanking' => '1. Login ke PermataNet.\n2. Pilih Pembayaran Tagihan > Virtual Account.',
            ],
            [
                'code' => 'cimb',
                'name' => 'CIMB Niaga',
                'va_prefix' => '5919',
                'biller_code' => null,
                'bill_key_prefix' => null,
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/3/38/CIMB_Niaga_logo.svg',
                'badge_color' => 'rose',
                'is_active' => true,
                'instruction_atm' => '1. Masukkan Kartu ATM & PIN CIMB Niaga.\n2. Pilih menu Pembayaran > Lanjut > Virtual Account.\n3. Masukkan Nomor Virtual Account.',
                'instruction_mbanking' => '1. Buka OCTO Mobile.\n2. Pilih menu Bayar Tagihan > Virtual Account.\n3. Masukkan Nomor VA CIMB Niaga.',
                'instruction_ibanking' => '1. Login ke OCTO Clicks.\n2. Pilih Bayar Tagihan > Virtual Account.',
            ],
            [
                'code' => 'bsi',
                'name' => 'Bank Syariah Indonesia (BSI)',
                'va_prefix' => '4510',
                'biller_code' => null,
                'bill_key_prefix' => null,
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg',
                'badge_color' => 'teal',
                'is_active' => true,
                'instruction_atm' => '1. Masukkan Kartu ATM & PIN BSI.\n2. Pilih menu Pembayaran/Beli > Virtual Account.\n3. Masukkan Nomor BSI VA.',
                'instruction_mbanking' => '1. Buka BSI Mobile.\n2. Pilih menu Bayar > BSI Virtual Account.\n3. Masukkan Nomor VA dan PIN Transaksi.',
                'instruction_ibanking' => '1. Login ke BSI NetBanking.\n2. Pilih Pembayaran > Virtual Account.',
            ],
            [
                'code' => 'danamon',
                'name' => 'Bank Danamon',
                'va_prefix' => '8901',
                'biller_code' => null,
                'bill_key_prefix' => null,
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/8/87/Bank_Danamon_logo.svg',
                'badge_color' => 'amber',
                'is_active' => true,
                'instruction_atm' => '1. Masukkan Kartu ATM & PIN Danamon.\n2. Pilih menu Pembayaran > Virtual Account.\n3. Masukkan Nomor VA Danamon.',
                'instruction_mbanking' => '1. Buka aplikasi D-Bank PRO.\n2. Pilih menu Virtual Account.\n3. Masukkan Nomor VA dan konfirmasi transaksi.',
                'instruction_ibanking' => '1. Login Danamon Online Banking.\n2. Pilih Pembayaran > Virtual Account.',
            ],
        ];

        foreach ($banks as $bankData) {
            Bank::firstOrCreate(
                ['code' => $bankData['code']],
                $bankData
            );
        }
    }
}
