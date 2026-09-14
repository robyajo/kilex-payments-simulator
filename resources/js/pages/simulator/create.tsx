import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    PlayCircle,
    CreditCard,
    QrCode,
    Smartphone,
    Store,
    ArrowRight,
    ExternalLink,
    CheckCircle2,
    Copy,
    Check,
    RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Props {
    merchant: {
        name: string;
        merchant_code: string;
    };
    apiKey: {
        server_key: string;
        client_key: string;
    };
    defaultOrderId: string;
}

export default function SimulatorCreate({ merchant, apiKey, defaultOrderId }: Props) {
    const [orderId, setOrderId] = useState(defaultOrderId);
    const [amount, setAmount] = useState('150000');
    const [paymentType, setPaymentType] = useState<'snap' | 'bank_transfer' | 'qris' | 'gopay' | 'cstore'>('snap');
    const [bank, setBank] = useState('bca');
    const [customerName, setCustomerName] = useState('Budi Santoso');
    const [customerEmail, setCustomerEmail] = useState('budi@example.com');
    const [customerPhone, setCustomerPhone] = useState('081234567890');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/dashboard/simulator-test/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    order_id: orderId,
                    gross_amount: Number(amount),
                    payment_type: paymentType,
                    bank: paymentType === 'bank_transfer' || paymentType === 'snap' ? bank : undefined,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResult(data);
                toast.success('Transaksi simulasi berhasil dibuat!');
            } else {
                toast.error(data.message || 'Gagal membuat transaksi.');
            }
        } catch (err: any) {
            toast.error('Terjadi kesalahan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const copySnapUrl = () => {
        if (result?.snap_url) {
            navigator.clipboard.writeText(result.snap_url);
            setCopied(true);
            toast.success('URL Snap disalin!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Sandbox Tester', href: '/dashboard/simulator-test' },
            ]}
        >
            <Head title="Sandbox Quick Tester" />
            <Toaster position="top-right" richColors />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Sandbox Transaction Tester
                    </h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Buat tagihan uji coba instan untuk menguji popup Snap atau respons REST API secara langsung.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left 2 Cols: Creation Form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <PlayCircle className="size-5 text-blue-500" />
                            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                                Konfigurasi Transaksi Mock
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Order ID</label>
                                <input
                                    type="text"
                                    required
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Nominal Tagihan (IDR)</label>
                                <input
                                    type="number"
                                    min="1000"
                                    step="1000"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-mono font-bold"
                                />
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="space-y-2 text-xs">
                            <label className="font-semibold text-neutral-700 dark:text-neutral-300">Tipe Checkout / Pembayaran</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { id: 'snap', label: 'Snap (Semua Metode)', icon: CreditCard },
                                    { id: 'bank_transfer', label: 'Virtual Account', icon: CreditCard },
                                    { id: 'qris', label: 'QRIS Mock', icon: QrCode },
                                    { id: 'gopay', label: 'GoPay / E-Wallet', icon: Smartphone },
                                    { id: 'cstore', label: 'Indomaret / Alfamart', icon: Store },
                                ].map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setPaymentType(type.id as any)}
                                            className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                paymentType === type.id
                                                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500/30'
                                                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <Icon className="size-4" />
                                            <span>{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bank selector if bank_transfer or snap */}
                        {(paymentType === 'bank_transfer' || paymentType === 'snap') && (
                            <div className="space-y-2 text-xs">
                                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Pilihan Bank</label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {['bca', 'bni', 'bri', 'mandiri', 'permata', 'cimb'].map((b) => (
                                        <button
                                            key={b}
                                            type="button"
                                            onClick={() => setBank(b)}
                                            className={`py-2 px-2 rounded-lg border text-center text-xs uppercase font-bold transition-all cursor-pointer ${
                                                bank === b
                                                    ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                                                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customer Info */}
                        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Detail Pelanggan Mock</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <input
                                    type="text"
                                    placeholder="Nama Lengkap"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs"
                                />
                                <input
                                    type="text"
                                    placeholder="No. Telepon"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                            {loading ? <RefreshCw className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                            Generate Transaksi Simulator
                        </button>
                    </form>

                    {/* Right 1 Col: Live Result Box */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                                <h3 className="text-xs font-bold uppercase text-neutral-500">Hasil Output</h3>
                                {result && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">201 CREATED</span>}
                            </div>

                            {result ? (
                                <div className="space-y-4 text-xs">
                                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-1">
                                        <div className="font-semibold flex items-center gap-1.5">
                                            <CheckCircle2 className="size-4" /> Transaksi Berhasil Dibuat
                                        </div>
                                        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                            Status: <strong>PENDING</strong> • ID: <code className="font-mono">{result.transaction.id.substring(0, 10)}...</code>
                                        </div>
                                    </div>

                                    {result.transaction.va_number && (
                                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                            <div className="text-[10px] uppercase text-neutral-400 font-semibold">Nomor Virtual Account ({result.transaction.bank?.toUpperCase()})</div>
                                            <div className="text-lg font-mono font-bold text-blue-500 mt-0.5">{result.transaction.va_number}</div>
                                        </div>
                                    )}

                                    {result.snap_url && (
                                        <div className="space-y-2">
                                            <a
                                                href={result.snap_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all"
                                            >
                                                Buka Mock Snap UI <ExternalLink className="size-3.5" />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={copySnapUrl}
                                                className="w-full py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                                                Salin Snap URL
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-xs text-neutral-400">
                                    Isi form di samping dan klik tombol <strong>Generate Transaksi</strong> untuk membuat data tagihan uji coba.
                                </div>
                            )}
                        </div>

                        <div className="text-[10px] text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-3">
                            Merchant ID: <code>{merchant.merchant_code}</code>
                        </div>
                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
