import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import {
    BookOpen,
    Code2,
    Copy,
    Check,
    KeyRound,
    Terminal,
    Zap,
    ShieldCheck,
    Webhook,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function Docs() {
    const [copied, setCopied] = useState<string | null>(null);
    const [activeLang, setActiveLang] = useState<'php' | 'node' | 'python' | 'curl'>('php');

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopied(id);
        toast.success('Kode berhasil disalin!');
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <PublicLayout>
            <Head title="Dokumentasi API Midtrans Simulator - KilexPay" />
            <Toaster position="top-right" richColors />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left Sticky Sidebar */}
                    <aside className="lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                            Daftar Isi Dokumentasi
                        </div>
                        <nav className="space-y-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            <a href="#quickstart" className="block py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-blue-500 transition-colors">
                                1. Quickstart & Base URL
                            </a>
                            <a href="#authentication" className="block py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-blue-500 transition-colors">
                                2. Otentikasi & API Keys
                            </a>
                            <a href="#snap-api" className="block py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-blue-500 transition-colors">
                                3. Snap API Token
                            </a>
                            <a href="#core-api" className="block py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-blue-500 transition-colors">
                                4. Core API Direct Charge
                            </a>
                            <a href="#status-cancel" className="block py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-blue-500 transition-colors">
                                5. Check Status & Cancel
                            </a>
                            <a href="#signature" className="block py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-blue-500 transition-colors">
                                6. Verifikasi Signature SHA-512
                            </a>
                            <a href="#webhook" className="block py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-blue-500 transition-colors">
                                7. Webhook Notifikasi
                            </a>
                            <a href="#stripe-api" className="block py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-blue-500 transition-colors">
                                8. Stripe Test API
                            </a>
                            <a href="#sdk-examples" className="block py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-blue-500 transition-colors">
                                9. Contoh Kode SDK
                            </a>
                        </nav>

                        <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs space-y-2">
                            <div className="font-bold text-blue-600 dark:text-blue-400">Sandbox Quick Tester</div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                Buat transaksi uji coba instan tanpa menulis kode di dashboard.
                            </p>
                            <a
                                href="/dashboard/simulator-test"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Buka Sandbox Tester <ExternalLink className="size-3" />
                            </a>
                        </div>
                    </aside>

                    {/* Main Documentation Content */}
                    <div className="flex-1 space-y-12 max-w-4xl text-xs sm:text-sm">

                        {/* 1. Quickstart */}
                        <section id="quickstart" className="space-y-4 pt-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    01
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                    Quickstart & Base URL
                                </h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Simulator ini dirancang dengan standar kompatibilitas <strong>Midtrans Core API & Snap API</strong>. Untuk mengarahkan aplikasi klien Anda ke simulator ini, cukup ubah konfigurasi <code>Base URL</code> pada SDK atau HTTP Client Anda:
                            </p>
                            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                <strong className="text-indigo-600 dark:text-indigo-400">Siapa yang memilih provider?</strong>{' '}
                                Provider dipilih oleh merchant di <strong>Settings → API Keys</strong>:
                                pilih <strong>Midtrans saja</strong>, <strong>Stripe saja</strong>, atau <strong>Midtrans + Stripe</strong>.
                                Customer tidak memilih provider pada halaman pembayaran; customer memilih metode pembayaran yang ditampilkan oleh provider tersebut.
                            </div>

                            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                                <div className="text-[11px] font-bold uppercase text-neutral-400">Simulator Base URLs:</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                        <div className="text-[10px] text-neutral-500 font-sans">Snap API Base URL</div>
                                        <div className="text-blue-600 dark:text-blue-400 font-bold">http://localhost:8001/api/snap/v1</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                        <div className="text-[10px] text-neutral-500 font-sans">Core API Base URL</div>
                                        <div className="text-blue-600 dark:text-blue-400 font-bold">http://localhost:8001/api/v2</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                        <div className="text-[10px] text-neutral-500 font-sans">Stripe Test API Base URL</div>
                                        <div className="text-indigo-600 dark:text-indigo-400 font-bold">http://localhost:8001/api/stripe/v1</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="stripe-api" className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">08</span>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Stripe Test API</h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Aktifkan <strong>Stripe saja</strong> atau <strong>Midtrans + Stripe</strong> dari Settings → API Keys.
                                Simpan Secret Key Stripe test mode di backend merchant dan kirimkan dengan header <code>Authorization: Bearer sk_test_...</code>..
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                    <div className="text-indigo-500 font-bold">POST /api/stripe/v1/payment_intents</div>
                                    <div className="text-neutral-500 text-[11px] font-sans mt-1">Create PaymentIntent seperti Stripe</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                    <div className="text-indigo-500 font-bold">POST /api/stripe/v1/checkout/sessions</div>
                                    <div className="text-neutral-500 text-[11px] font-sans mt-1">Create hosted Checkout Session</div>
                                </div>
                            </div>
                            <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`curl -X POST http://localhost:8001/api/stripe/v1/payment_intents \\
  -H "Authorization: Bearer sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 150000,
    "currency": "idr",
    "metadata": { "order_id": "ORDER-STRIPE-001" }
  }'`}
                            </pre>
                            <pre className="p-4 rounded-xl bg-neutral-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-neutral-800">
{`{
  "id": "pi_...",
  "object": "payment_intent",
  "amount": 150000,
  "currency": "idr",
  "status": "requires_payment_method",
  "client_secret": "pi_..._secret_..."
}`}
                            </pre>
                            <div className="space-y-3 text-neutral-600 dark:text-neutral-400">
                                <p>
                                    Panggil <code>GET /api/stripe/v1/payment_intents/{'{id}'}</code> untuk membaca status dan
                                    <code>POST /api/stripe/v1/payment_intents/{'{id}'}/confirm</code> untuk menyelesaikan pembayaran simulasi.
                                    Status berubah menjadi <code>succeeded</code> dan <code>amount_received</code> terisi.
                                </p>
                                <p>
                                    Untuk alur Checkout Session, kirim <code>line_items</code>, <code>success_url</code>, dan <code>cancel_url</code>
                                    ke <code>POST /api/stripe/v1/checkout/sessions</code>, lalu redirect user ke field <code>url</code>.
                                    Halaman hosted sandbox menampilkan nominal dan menerima kartu test <code>4242 4242 4242 4242</code>,
                                    expiry masa depan, serta CVC apa pun.
                                </p>
                                <p>
                                    Setelah sukses, webhook <code>payment_intent.succeeded</code> dikirim ke notification URL.
                                    Pastikan queue worker aktif agar pengiriman webhook diproses.
                                </p>
                            </div>
                        </section>

                        {/* 2. Authentication */}
                        <section id="authentication" className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    02
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                    Otentikasi & API Keys
                                </h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Simulator mendukung otentikasi standar Midtrans menggunakan <strong>HTTP Basic Auth</strong> dengan format:
                            </p>

                            <div className="p-3.5 rounded-xl bg-neutral-950 text-emerald-400 font-mono text-xs">
                                Authorization: Basic Base64(YOUR_SERVER_KEY + ":")
                            </div>

                            <p className="text-neutral-600 dark:text-neutral-400">
                                Anda juga dapat mengirimkan header kustom <code>X-Server-Key: SB-Mid-server-xxxx</code> atau <code>X-Client-Key: SB-Mid-client-xxxx</code>.
                            </p>
                        </section>

                        {/* 3. Snap API */}
                        <section id="snap-api" className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    03
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                    Snap API: Create Transaction Token
                                </h2>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-xs font-bold">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">POST</span>
                                <span>/api/snap/v1/transactions</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-neutral-400">
                                    <span>Request Payload (JSON):</span>
                                    <button
                                        onClick={() => copyCode(JSON.stringify({
                                            transaction_details: {
                                                order_id: "ORDER-1001",
                                                gross_amount: 150000
                                            },
                                            customer_details: {
                                                first_name: "Budi",
                                                last_name: "Santoso",
                                                email: "budi@example.com",
                                                phone: "08123456789"
                                            }
                                        }, null, 2), 'snap-req')}
                                        className="hover:text-white flex items-center gap-1"
                                    >
                                        <Copy className="size-3" /> Salin JSON
                                    </button>
                                </div>
                                <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`{
  "transaction_details": {
    "order_id": "ORDER-1001",
    "gross_amount": 150000
  },
  "customer_details": {
    "first_name": "Budi",
    "last_name": "Santoso",
    "email": "budi@example.com",
    "phone": "08123456789"
  }
}`}
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-neutral-400">Response (HTTP 201 Created):</div>
                                <pre className="p-4 rounded-xl bg-neutral-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-neutral-800">
{`{
  "token": "snap-token-89b1c7a2-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "redirect_url": "http://localhost:8001/snap/v1/pay/snap-token-89b1c7a2-xxxx"
}`}
                                </pre>
                            </div>

                            <div className="space-y-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <div>
                                    <div className="font-bold text-blue-600 dark:text-blue-400">Alur integrasi aplikasi merchant</div>
                                    <p className="text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                                        Aplikasi merchant membuat transaksi melalui API, menampilkan identifier pembayaran kepada user,
                                        lalu membuka <code>payment_url</code> ketika tester perlu menyelesaikan pembayaran di sandbox.
                                    </p>
                                </div>
                                <ol className="list-decimal list-inside space-y-1.5 text-neutral-600 dark:text-neutral-400">
                                    <li>Kirim request charge dengan server key melalui backend merchant.</li>
                                    <li>Untuk bank, tampilkan <code>va_numbers[0].va_number</code>. Untuk Mandiri, tampilkan <code>biller_code</code> dan <code>bill_key</code>.</li>
                                    <li>Untuk QRIS, ubah <code>qr_string</code> menjadi gambar QR menggunakan library QR di aplikasi merchant.</li>
                                    <li>Sediakan tombol pembayaran yang membuka <code>payment_url</code> dari response.</li>
                                    <li>Di halaman sandbox, pilih metode pembayaran lalu klik <strong>Simulasikan Bayar Sukses</strong>.</li>
                                    <li>Terima webhook settlement atau polling endpoint status untuk mengonfirmasi pembayaran.</li>
                                </ol>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-neutral-400">Contoh Request QRIS:</div>
                                <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`curl -X POST http://localhost:8001/api/v2/charge \\
  -u "SB-Mid-server-xxxx:" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payment_type": "qris",
    "transaction_details": {
      "order_id": "ORDER-QRIS-001",
      "gross_amount": 150000
    }
  }'`}
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-neutral-400">Response QRIS:</div>
                                <pre className="p-4 rounded-xl bg-neutral-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-neutral-800">
{`{
  "status_code": "201",
  "transaction_id": "uuid-transaksi",
  "payment_type": "qris",
  "transaction_status": "pending",
  "qr_string": "000201010212...",
  "qr_url": "http://localhost:8001/snap/v1/pay/snap-token-xxxx",
  "payment_url": "http://localhost:8001/snap/v1/pay/snap-token-xxxx"
}`}
                                </pre>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                    Render <code>qr_string</code> di checkout merchant. Gunakan <code>qr_url</code> atau <code>payment_url</code>
                                    untuk membuka halaman pembayaran sandbox dan melakukan simulasi settlement.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-neutral-400">Response Mandiri E-Channel:</div>
                                <pre className="p-4 rounded-xl bg-neutral-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-neutral-800">
{`{
  "status_code": "201",
  "payment_type": "echannel",
  "transaction_status": "pending",
  "biller_code": "70012",
  "bill_key": "9912345678",
  "payment_url": "http://localhost:8001/snap/v1/pay/snap-token-xxxx"
}`}
                                </pre>
                            </div>

                            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-neutral-600 dark:text-neutral-400">
                                <strong className="text-amber-600 dark:text-amber-400">Penting untuk pengujian:</strong>{' '}
                                VA dan QRIS yang dihasilkan adalah identifier sandbox dan tidak terhubung ke jaringan bank atau QRIS nyata.
                                Pembayaran uji dilakukan melalui <code>payment_url</code>. Setelah settlement, simulator mengirim webhook
                                ke <code>notification_url</code> merchant.
                            </div>
                        </section>

                        {/* 4. Core API */}
                        <section id="core-api" className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    04
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                    Core API: Direct Charge (VA & QRIS)
                                </h2>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-xs font-bold">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">POST</span>
                                <span>/api/v2/charge</span>
                            </div>

                            <p className="text-neutral-600 dark:text-neutral-400">
                                Mendukung channel pembayaran: <code>bank_transfer</code> (bca, bni, bri, permata), <code>echannel</code> (Mandiri Bill), <code>qris</code>, <code>gopay</code>, dan <code>cstore</code>.
                            </p>
                            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-neutral-600 dark:text-neutral-400">
                                <strong className="text-amber-600 dark:text-amber-400">Catatan Virtual Account:</strong>{' '}
                                bank transfer mengembalikan <code>va_numbers</code>. Mandiri menggunakan format
                                <code> biller_code</code> dan <code>bill_key</code> melalui <code>echannel</code>.
                                Nomor tersebut adalah identifier sandbox; penyelesaian pembayaran dilakukan dari Mock Snap Simulator.
                            </div>
                            <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-neutral-600 dark:text-neutral-400">
                                <strong className="text-blue-600 dark:text-blue-400">Alur pembayaran aplikasi:</strong>{' '}
                                simpan <code>va_numbers[0].va_number</code> untuk bank atau render <code>qr_string</code> untuk QRIS.
                                Response juga menyediakan <code>payment_url</code> sebagai halaman pembayaran sandbox.
                                Buka URL tersebut saat pengujian, lalu pilih metode yang sesuai dan klik tombol simulasi pembayaran.
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-neutral-400">Contoh Request BCA Virtual Account:</div>
                                <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`{
  "payment_type": "bank_transfer",
  "bank_transfer": {
    "bank": "bca"
  },
  "transaction_details": {
    "order_id": "ORDER-CORE-101",
    "gross_amount": 250000
  }
}`}
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-neutral-400">Response (HTTP 201 Created):</div>
                                <pre className="p-4 rounded-xl bg-neutral-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-neutral-800">
{`{
  "status_code": "201",
  "status_message": "Success, Bank Transfer transaction is created",
  "transaction_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "order_id": "ORDER-CORE-101",
  "gross_amount": "250000.00",
  "currency": "IDR",
  "payment_type": "bank_transfer",
  "transaction_status": "pending",
  "va_numbers": [
    {
      "bank": "bca",
      "va_number": "700141234567890"
    }
  ],
  "signature_key": "d744be6c7a...",
  "expiry_time": "2026-09-16 04:00:00"
}`}
                                </pre>
                            </div>
                        </section>

                        {/* 5. Check Status & Cancel */}
                        <section id="status-cancel" className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    05
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                    Check Status, Cancel, & Expire
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                    <div className="text-blue-500 font-bold">GET /api/v2/:order_id/status</div>
                                    <div className="text-neutral-500 text-[11px] font-sans mt-1">Cek status transaksi saat ini</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                    <div className="text-rose-500 font-bold">POST /api/v2/:order_id/cancel</div>
                                    <div className="text-neutral-500 text-[11px] font-sans mt-1">Batalkan transaksi aktif</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                    <div className="text-amber-500 font-bold">POST /api/v2/:order_id/expire</div>
                                    <div className="text-neutral-500 text-[11px] font-sans mt-1">Ubah transaksi ke kedaluwarsa</div>
                                </div>
                            </div>
                        </section>

                        {/* 6. Signature Verification */}
                        <section id="signature" className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    06
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                    Verifikasi Signature Key (SHA-512)
                                </h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Rumus hashing Midtrans SHA-512 standar:
                            </p>

                            <div className="p-3.5 rounded-xl bg-neutral-950 text-amber-300 font-mono text-xs">
                                SHA512(order_id + status_code + gross_amount + server_key)
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-neutral-400">Contoh Verifikasi Signature di PHP:</div>
                                <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`$rawPayload = $orderId . $statusCode . $grossAmount . $serverKey;
$expectedSignature = hash('sha512', $rawPayload);

if (hash_equals($expectedSignature, $receivedSignatureKey)) {
    // Signature Valid! Pembayaran terverifikasi asli dari simulator
}`}
                                </pre>
                            </div>
                        </section>

                        {/* 7. Webhook */}
                        <section id="webhook" className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    07
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                    Webhook Delivery & Payload Format
                                </h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Ketika tester menekan tombol <strong>"Bayar Sukses"</strong> pada halaman Snap atau Dashboard, job antrean akan mengirim notifikasi HTTP POST ke <code>notification_url</code> merchant:
                            </p>

                            <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`{
  "transaction_time": "2026-09-15 04:00:00",
  "transaction_status": "settlement",
  "transaction_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "d744be6c7a...",
  "payment_type": "bank_transfer",
  "order_id": "ORDER-1001",
  "merchant_id": "G141599999",
  "gross_amount": "150000.00",
  "fraud_status": "accept",
  "currency": "IDR",
  "settlement_time": "2026-09-15 04:05:00",
  "va_numbers": [
    {
      "bank": "bca",
      "va_number": "700141234567"
    }
  ]
}`}
                            </pre>
                        </section>

                        {/* 8. SDK Examples */}
                        <section id="sdk-examples" className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    08
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                    Contoh Integrasi SDK
                                </h2>
                            </div>

                            <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 text-xs font-semibold">
                                {['php', 'node', 'python', 'curl'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setActiveLang(lang as any)}
                                        className={`py-2 px-3 border-b-2 uppercase transition-colors cursor-pointer ${
                                            activeLang === lang
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>

                            {activeLang === 'php' && (
                                <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`require_once 'vendor/autoload.php';

\\Midtrans\\Config::$serverKey = 'SB-Mid-server-kilex9876543210demo';
\\Midtrans\\Config::$isProduction = false;

$params = [
    'transaction_details' => [
        'order_id' => 'ORDER-' . time(),
        'gross_amount' => 150000,
    ],
    'customer_details' => [
        'first_name' => 'Budi Santoso',
        'email' => 'budi@example.com',
    ],
];

$snapToken = \\Midtrans\\Snap::getSnapToken($params);
$redirectUrl = "http://localhost:8001/snap/v1/pay/{$snapToken}";`}
                                </pre>
                            )}

                            {activeLang === 'node' && (
                                <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`const midtransClient = require('midtrans-client');

let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: 'SB-Mid-server-kilex9876543210demo',
    clientKey: 'SB-Mid-client-kilex1234567890demo'
});

let parameter = {
    transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: 150000
    }
};

snap.createTransaction(parameter).then((transaction) => {
    console.log("Snap Token:", transaction.token);
    console.log("Redirect URL:", transaction.redirect_url);
});`}
                                </pre>
                            )}

                            {activeLang === 'python' && (
                                <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`import requests
import base64

server_key = "SB-Mid-server-kilex9876543210demo"
auth_header = "Basic " + base64.b64encode(f"{server_key}:".encode()).decode()

payload = {
    "transaction_details": {
        "order_id": "ORDER-101",
        "gross_amount": 150000
    }
}

response = requests.post(
    "http://localhost:8001/api/snap/v1/transactions",
    headers={"Authorization": auth_header, "Content-Type": "application/json"},
    json=payload
)

print(response.json())`}
                                </pre>
                            )}

                            {activeLang === 'curl' && (
                                <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
{`curl -X POST 'http://localhost:8001/api/snap/v1/transactions' \\
  -u 'SB-Mid-server-kilex9876543210demo:' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "transaction_details": {
      "order_id": "ORDER-1001",
      "gross_amount": 150000
    }
  }'`}
                                </pre>
                            )}
                        </section>

                    </div>

                </div>
            </div>
        </PublicLayout>
    );
}
