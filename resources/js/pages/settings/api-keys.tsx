import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    KeyRound,
    Webhook,
    Copy,
    Check,
    RefreshCw,
    Send,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    BookOpen,
    Code2,
    Building2,
    Link as LinkIcon,
    ShieldAlert
    ,CreditCard
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Props {
    merchant: {
        id: string;
        name: string;
        merchant_code: string;
        notification_url: string;
        finish_url: string;
        unfinish_url: string;
        error_url: string;
        payment_providers: 'midtrans' | 'stripe' | 'both';
        stripe_secret_key: string;
        stripe_publishable_key: string;
    };
    apiKey: {
        id: string;
        server_key: string;
        client_key: string;
        is_production: boolean;
    };
    appUrl: string;
}

export default function ApiKeysSettings({ merchant, apiKey, appUrl }: Props) {
    const [showServerKey, setShowServerKey] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [activeCodeTab, setActiveCodeTab] = useState<'php' | 'node' | 'curl' | 'verify'>('php');
    const [pingLoading, setPingLoading] = useState(false);
    const [pingResult, setPingResult] = useState<any>(null);
    const [activeProvider, setActiveProvider] = useState<'midtrans' | 'stripe'>(
        merchant.payment_providers === 'stripe' ? 'stripe' : 'midtrans',
    );

    const { data, setData, put, processing, errors } = useForm({
        name: merchant.name || '',
        notification_url: merchant.notification_url || '',
        finish_url: merchant.finish_url || '',
        unfinish_url: merchant.unfinish_url || '',
        error_url: merchant.error_url || '',
        payment_providers: merchant.payment_providers || 'midtrans',
    });

    const handleSaveMerchant = (e: React.FormEvent) => {
        e.preventDefault();
        put('/dashboard/settings/merchant', {
            onSuccess: () => toast.success('Konfigurasi merchant berhasil disimpan!'),
            onError: () => toast.error('Gagal menyimpan konfigurasi merchant.'),
        });
    };

    const handleRegenerateKeys = () => {
        if (confirm('PERINGATAN: Mengenerate ulang Server Key & Client Key akan membatalkan kunci lama. Lanjutkan?')) {
            router.post('/dashboard/settings/regenerate-keys', {}, {
                onSuccess: () => toast.success('API Keys berhasil diperbarui!'),
            });
        }
    };

    const handleTestWebhook = async () => {
        setPingLoading(true);
        setPingResult(null);

        try {
            const response = await fetch('/dashboard/settings/test-webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    target_url: data.notification_url,
                }),
            });

            const resData = await response.json();
            setPingResult(resData);

            if (resData.success) {
                toast.success(`Webhook test terkirim! Status: HTTP ${resData.http_status}`);
            } else {
                toast.error(resData.message || 'Webhook test gagal.');
            }
        } catch (err: any) {
            toast.error('Gagal memicu webhook test: ' + err.message);
        } finally {
            setPingLoading(false);
        }
    };

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast.success(`${label} disalin ke clipboard!`);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'API Keys & Webhooks', href: '/dashboard/settings/api-keys' },
            ]}
        >
            <Head title="API Keys & Webhook Settings" />
            <Toaster position="top-right" richColors />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        API Credentials & Webhook Settings
                    </h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Pilih provider yang digunakan aplikasi, kelola kredensial API, konfigurasi webhook, dan contoh integrasi SDK.
                    </p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                    <div className="flex items-center gap-2">
                        <CreditCard className="size-5 text-blue-500" />
                        <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Provider pembayaran aplikasi</h2>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                        Pemilik aplikasi memilih Midtrans, Stripe, atau keduanya di field <strong>Payment Provider</strong> pada form di bawah.
                        Pilihan ini menentukan API dan kredensial yang boleh digunakan aplikasi merchant. Customer tidak memilih provider di halaman pembayaran;
                        customer memilih metode pembayaran yang tersedia di dalam provider tersebut.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <button
                        type="button"
                        onClick={() => setActiveProvider('midtrans')}
                        disabled={merchant.payment_providers === 'stripe'}
                        className={`flex-1 min-w-40 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
                            activeProvider === 'midtrans'
                                ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40'
                        }`}
                    >
                        Midtrans Sandbox
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveProvider('stripe')}
                        disabled={merchant.payment_providers === 'midtrans'}
                        className={`flex-1 min-w-40 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
                            activeProvider === 'stripe'
                                ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40'
                        }`}
                    >
                        Stripe Test Mode
                    </button>
                </div>

                {activeProvider === 'midtrans' && merchant.payment_providers !== 'stripe' && (
                <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/90 border border-amber-500/20 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <KeyRound className="size-5 text-amber-500" />
                            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                                Kredensial Midtrans Sandbox
                            </h2>
                        </div>
                        <button
                            onClick={handleRegenerateKeys}
                            className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="size-3.5" /> Regenerate Keys
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Server Key */}
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold uppercase text-neutral-500 text-[10px]">Server Key (Backend API)</span>
                                <button
                                    onClick={() => setShowServerKey(!showServerKey)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1 text-[11px]"
                                >
                                    {showServerKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                    {showServerKey ? 'Sembunyikan' : 'Tampilkan'}
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono">
                                <span className="truncate mr-2">
                                    {showServerKey ? apiKey.server_key : '••••••••••••••••••••••••••••••••'}
                                </span>
                                <button
                                    onClick={() => copyText(apiKey.server_key, 'Server Key')}
                                    className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                                >
                                    {copied === 'Server Key' ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Client Key */}
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold uppercase text-neutral-500 text-[10px]">Client Key (Frontend Checkout)</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono">
                                <span className="truncate mr-2">{apiKey.client_key}</span>
                                <button
                                    onClick={() => copyText(apiKey.client_key, 'Client Key')}
                                    className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                                >
                                    {copied === 'Client Key' ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {activeProvider === 'stripe' && merchant.payment_providers !== 'midtrans' && (
                    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/90 border border-indigo-500/20 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <CreditCard className="size-5 text-indigo-500" />
                            <div>
                                <h2 className="text-base font-bold text-neutral-900 dark:text-white">Stripe Test Mode</h2>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Gunakan Bearer Secret Key hanya dari backend merchant.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <div className="text-[10px] font-bold uppercase text-neutral-500">Secret Key</div>
                                <code className="block mt-2 break-all text-indigo-600 dark:text-indigo-400">{merchant.stripe_secret_key}</code>
                            </div>
                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <div className="text-[10px] font-bold uppercase text-neutral-500">Publishable Key</div>
                                <code className="block mt-2 break-all text-indigo-600 dark:text-indigo-400">{merchant.stripe_publishable_key}</code>
                            </div>
                        </div>
                    </div>
                )}

                {/* Webhook & URLs Configuration Form */}
                <form onSubmit={handleSaveMerchant} className="p-6 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                        <Webhook className="size-5 text-blue-500" />
                        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                            Konfigurasi Webhook & Notification URL
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                            <label className="font-semibold text-neutral-700 dark:text-neutral-300">Payment Provider (dipilih merchant)</label>
                            <select
                                value={data.payment_providers}
                                onChange={(e) => setData('payment_providers', e.target.value as 'midtrans' | 'stripe' | 'both')}
                                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
                            >
                                <option value="midtrans">Midtrans saja</option>
                                <option value="stripe">Stripe saja</option>
                                <option value="both">Midtrans + Stripe</option>
                            </select>
                            <p className="text-[11px] leading-relaxed text-neutral-500">
                                Pilih <strong>Midtrans + Stripe</strong> jika aplikasi Anda memanggil kedua API.
                            </p>
                            {errors.payment_providers && <span className="text-rose-500 text-[11px]">{errors.payment_providers}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-neutral-700 dark:text-neutral-300">Nama Merchant</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
                                placeholder="Nama Toko atau Aplikasi"
                            />
                            {errors.name && <span className="text-rose-500 text-[11px]">{errors.name}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-neutral-700 dark:text-neutral-300">Notification / Webhook URL (POST)</label>
                            <input
                                type="url"
                                value={data.notification_url}
                                onChange={(e) => setData('notification_url', e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 font-mono"
                                placeholder="https://api.yourdomain.com/payment/midtrans-notification"
                            />
                            {errors.notification_url && <span className="text-rose-500 text-[11px]">{errors.notification_url}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-neutral-700 dark:text-neutral-300">Finish Redirect URL</label>
                            <input
                                type="url"
                                value={data.finish_url}
                                onChange={(e) => setData('finish_url', e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 font-mono"
                                placeholder="https://yourstore.com/checkout/success"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-neutral-700 dark:text-neutral-300">Unfinish / Error Redirect URL</label>
                            <input
                                type="url"
                                value={data.unfinish_url}
                                onChange={(e) => setData('unfinish_url', e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 font-mono"
                                placeholder="https://yourstore.com/checkout/pending"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={handleTestWebhook}
                            disabled={pingLoading || !data.notification_url}
                            className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                            {pingLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <Send className="size-3.5 text-blue-500" />}
                            Kirim Test Webhook Ping
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>

                    {/* Test Webhook Result Output */}
                    {pingResult && (
                        <div className="p-4 rounded-xl bg-neutral-950 text-neutral-300 font-mono text-xs space-y-2 border border-neutral-800">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-white uppercase text-[10px]">Hasil Uji Coba Webhook:</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pingResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    HTTP {pingResult.http_status || 'ERROR'} ({pingResult.duration_ms}ms)
                                </span>
                            </div>
                            <div className="text-[11px] text-neutral-400">Response Body:</div>
                            <div className="bg-neutral-900 p-2.5 rounded-lg text-emerald-400 overflow-x-auto max-h-32">
                                {pingResult.response_body || pingResult.error || 'No response body'}
                            </div>
                        </div>
                    )}
                </form>

                {/* Integration Code Snippets & Verification Guide */}
                <div id="docs" className="p-6 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                        <BookOpen className="size-5 text-purple-500" />
                        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                            Panduan Integrasi SDK (Midtrans-Compatible)
                        </h2>
                    </div>

                    <div className="flex border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold gap-2">
                        {[
                            { id: 'php', label: 'PHP (midtrans-php)' },
                            { id: 'node', label: 'Node.js (midtrans-client)' },
                            { id: 'curl', label: 'cURL / REST' },
                            { id: 'verify', label: 'Verifikasi SHA-512' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveCodeTab(t.id as any)}
                                className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
                                    activeCodeTab === t.id
                                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* PHP Snippet */}
                    {activeCodeTab === 'php' && (
                        <div className="space-y-2">
                            <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto border border-neutral-800">
{`// 1. Install via Composer
// composer require midtrans/midtrans-php

require_once 'vendor/autoload.php';

\\Midtrans\\Config::$serverKey = '${apiKey.server_key}';
\\Midtrans\\Config::$isProduction = false;
\\Midtrans\\Config::$isSanitized = true;
\\Midtrans\\Config::$is3ds = true;

// Override Base URL ke Simulator ini
\\Midtrans\\Config::$curlOptions[CURLOPT_HTTPHEADER][] = 'Host: localhost';

$params = [
    'transaction_details' => [
        'order_id' => 'ORDER-' . time(),
        'gross_amount' => 150000,
    ],
    'customer_details' => [
        'first_name' => 'Budi',
        'email' => 'budi@example.com',
    ],
];

// Buat Snap Token
$snapToken = \\Midtrans\\Snap::getSnapToken($params);
$snapUrl = '${appUrl}/snap/v1/pay/' . $snapToken;`}
                            </pre>
                        </div>
                    )}

                    {/* Node.js Snippet */}
                    {activeCodeTab === 'node' && (
                        <div className="space-y-2">
                            <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto border border-neutral-800">
{`// 1. Direct REST Call with Fetch
const response = await fetch('${appUrl}/snap/v1/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from('${apiKey.server_key}:').toString('base64')
  },
  body: JSON.stringify({
    transaction_details: {
      order_id: 'ORDER-' + Date.now(),
      gross_amount: 150000
    },
    customer_details: {
      first_name: 'Budi',
      email: 'budi@example.com'
    }
  })
});

const data = await response.json();
console.log('Snap Token:', data.token);
console.log('Redirect URL:', data.redirect_url);`}
                            </pre>
                        </div>
                    )}

                    {/* cURL Snippet */}
                    {activeCodeTab === 'curl' && (
                        <div className="space-y-2">
                            <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto border border-neutral-800">
{`curl -X POST '${appUrl}/v2/charge' \\
  -u '${apiKey.server_key}:' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "payment_type": "bank_transfer",
    "bank_transfer": {
      "bank": "bca"
    },
    "transaction_details": {
      "order_id": "ORDER-101",
      "gross_amount": 100000
    }
  }'`}
                            </pre>
                        </div>
                    )}

                    {/* Signature Verification Snippet */}
                    {activeCodeTab === 'verify' && (
                        <div className="space-y-2">
                            <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto border border-neutral-800">
{`// Verifikasi Signature Webhook Midtrans di Backend Anda (PHP)
$orderId = $notification['order_id'];
$statusCode = $notification['status_code'];
$grossAmount = $notification['gross_amount'];
$signatureKey = $notification['signature_key'];
$serverKey = '${apiKey.server_key}';

// Kalkulasi Hash SHA-512
$expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

if (hash_equals($expectedSignature, $signatureKey)) {
    // Signature VALID! Update status pesanan di database Anda
    if ($notification['transaction_status'] === 'settlement') {
        // Tandai pesanan lunas
    }
} else {
    // Signature INVALID! Tolak request (status 403 / 400)
}`}
                            </pre>
                        </div>
                    )}

                </div>

            </div>
        </AppLayout>
    );
}
