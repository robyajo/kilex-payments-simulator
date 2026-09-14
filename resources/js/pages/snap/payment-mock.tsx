import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Copy,
    Check,
    CreditCard,
    QrCode,
    Smartphone,
    Store,
    ShieldAlert,
    ExternalLink,
    AlertCircle,
    XCircle,
    Building2,
    ChevronDown,
    ChevronUp,
    Sparkles,
    RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface BankInfo {
    bank: string;
    va_number?: string;
    bill_key?: string;
    biller_code?: string;
}

interface Props {
    transaction: {
        id: string;
        order_id: string;
        gross_amount: number;
        payment_type: string;
        bank?: string;
        va_number?: string;
        bill_key?: string;
        biller_code?: string;
        payment_code?: string;
        qr_string?: string;
        transaction_status: string;
        status_code: string;
        status_message: string;
        customer_details?: {
            first_name?: string;
            last_name?: string;
            email?: string;
            phone?: string;
        };
        item_details?: Array<{
            id: string;
            name: string;
            price: number;
            quantity: number;
        }>;
        snap_token?: string;
        expired_at: string;
        settlement_time?: string;
        created_at: string;
    };
    merchant: {
        id: string;
        name: string;
        merchant_code: string;
        finish_url?: string;
        unfinish_url?: string;
        error_url?: string;
        notification_url?: string;
    };
    bankOptions: Record<string, BankInfo>;
}

export default function PaymentMock({ transaction, merchant, bankOptions }: Props) {
    const [selectedTab, setSelectedTab] = useState<'va' | 'qris' | 'ewallet' | 'cstore'>('va');
    const [selectedBank, setSelectedBank] = useState<string>(transaction.bank || 'bca');
    const [copied, setCopied] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [status, setStatus] = useState<string>(transaction.transaction_status);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [showItems, setShowItems] = useState(false);
    const [redirectTimer, setRedirectTimer] = useState<number>(5);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate expiry timer
    useEffect(() => {
        const updateCountdown = () => {
            const expireDate = new Date(transaction.expired_at).getTime();
            const now = new Date().getTime();
            const distance = expireDate - now;

            if (distance <= 0) {
                setTimeLeft('00:00:00 (Expired)');
                if (status === 'pending') {
                    setStatus('expire');
                }
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [transaction.expired_at, status]);

    // Handle auto-redirect if finish_url is set and status is settlement
    useEffect(() => {
        if (status === 'settlement' && merchant.finish_url) {
            const timer = setInterval(() => {
                setRedirectTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        window.location.href = merchant.finish_url!;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status, merchant.finish_url]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast.success(`${label} berhasil disalin!`);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSimulatorAction = async (action: 'settle' | 'expire' | 'cancel' | 'deny') => {
        setActionLoading(action);

        const currentBankInfo = bankOptions[selectedBank] || bankOptions['bca'];

        try {
            const response = await fetch(`/simulator/action/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    transaction_id: transaction.id,
                    bank: selectedBank,
                    va_number: currentBankInfo?.va_number,
                    bill_key: currentBankInfo?.bill_key,
                    biller_code: currentBankInfo?.biller_code,
                    payment_type: selectedTab === 'va' ? 'bank_transfer' : selectedTab,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (action === 'settle') {
                    setStatus('settlement');
                    toast.success('Simulasi Pembayaran Sukses! Webhook telah dikirim ke merchant.');
                } else if (action === 'expire') {
                    setStatus('expire');
                    toast.warning('Transaksi berhasil diubah ke Expired.');
                } else if (action === 'cancel') {
                    setStatus('cancel');
                    toast.info('Transaksi telah dibatalkan.');
                } else if (action === 'deny') {
                    setStatus('deny');
                    toast.error('Transaksi ditolak oleh sistem.');
                }
            } else {
                toast.error(data.error || 'Gagal memicu aksi simulator.');
            }
        } catch (err: any) {
            toast.error('Terjadi kesalahan jaringan: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const activeBank = bankOptions[selectedBank] || bankOptions['bca'];

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-300">
            <Head title={`Checkout - ${merchant.name}`} />
            <Toaster position="top-right" richColors />

            {/* Top Sandbox Simulator Control Bar */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 backdrop-blur-md border-b border-amber-500/30 px-4 py-2.5">
                <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="size-3.5" />
                            Midtrans Sandbox Simulator
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {status === 'pending' ? (
                            <>
                                <button
                                    onClick={() => handleSimulatorAction('settle')}
                                    disabled={actionLoading !== null}
                                    className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading === 'settle' ? <RefreshCw className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                                    Simulasikan Bayar Sukses
                                </button>
                                <button
                                    onClick={() => handleSimulatorAction('expire')}
                                    disabled={actionLoading !== null}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading === 'expire' ? <RefreshCw className="size-3.5 animate-spin" /> : <Clock className="size-3.5" />}
                                    Set Expire
                                </button>
                                <button
                                    onClick={() => handleSimulatorAction('cancel')}
                                    disabled={actionLoading !== null}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading === 'cancel' ? <RefreshCw className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                                Status: <strong className="uppercase text-white">{status}</strong>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">

                    {/* Header Bar */}
                    <div className="bg-neutral-950/70 border-b border-neutral-800/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Building2 className="size-4 text-blue-400" />
                                <h1 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                                    {merchant.name}
                                </h1>
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                                {formatRupiah(transaction.gross_amount)}
                            </div>
                            <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                                <span>Order ID: <code className="text-neutral-200 font-mono">{transaction.order_id}</code></span>
                                <span>•</span>
                                <span className="font-mono text-neutral-500">UUID: {transaction.id.substring(0, 8)}...</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl text-xs font-medium text-amber-400">
                                <Clock className="size-4 text-amber-400 animate-spin" />
                                <div>
                                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Sisa Waktu</div>
                                    <div className="font-mono font-bold text-sm text-white">{timeLeft || '23:59:59'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Banners for Non-Pending */}
                    {status === 'settlement' && (
                        <div className="p-8 text-center bg-gradient-to-b from-emerald-950/30 to-neutral-900 border-b border-emerald-900/30 flex flex-col items-center">
                            <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                                <CheckCircle2 className="size-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-emerald-400">Pembayaran Berhasil!</h2>
                            <p className="text-sm text-neutral-400 max-w-md mt-2">
                                Simulasi transaksi telah berstatus <strong>Settlement</strong>. Webhook notifikasi Midtrans SHA-512 telah berhasil dikirim ke server merchant.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                {merchant.finish_url && (
                                    <a
                                        href={merchant.finish_url}
                                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all"
                                    >
                                        Kembali ke Merchant ({redirectTimer}s)
                                        <ExternalLink className="size-4" />
                                    </a>
                                )}
                                <a
                                    href="/dashboard/transactions"
                                    className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium border border-neutral-700 transition-all"
                                >
                                    Buka Dashboard Inspector
                                </a>
                            </div>
                        </div>
                    )}

                    {status === 'expire' && (
                        <div className="p-8 text-center bg-neutral-950/50 border-b border-amber-900/30 flex flex-col items-center">
                            <div className="size-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                                <AlertCircle className="size-8" />
                            </div>
                            <h2 className="text-xl font-bold text-amber-400">Transaksi Kedaluwarsa (Expired)</h2>
                            <p className="text-xs text-neutral-400 max-w-md mt-1">
                                Batas waktu pembayaran telah habis. Status transaksi adalah <code>expire</code> (HTTP 407).
                            </p>
                        </div>
                    )}

                    {status === 'cancel' && (
                        <div className="p-8 text-center bg-neutral-950/50 border-b border-rose-900/30 flex flex-col items-center">
                            <div className="size-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
                                <XCircle className="size-8" />
                            </div>
                            <h2 className="text-xl font-bold text-rose-400">Transaksi Dibatalkan</h2>
                            <p className="text-xs text-neutral-400 max-w-md mt-1">
                                Transaksi ini telah dibatalkan dengan status <code>cancel</code> (HTTP 202).
                            </p>
                        </div>
                    )}

                    {/* Order Breakdown Dropdown */}
                    <div className="border-b border-neutral-800/80 px-6 py-3 bg-neutral-950/30">
                        <button
                            onClick={() => setShowItems(!showItems)}
                            className="w-full flex items-center justify-between text-xs text-neutral-400 hover:text-neutral-200 font-medium py-1 transition-colors cursor-pointer"
                        >
                            <span>Rincian Pembelian & Pelanggan ({transaction.item_details?.length || 1} item)</span>
                            <span className="flex items-center gap-1">
                                {showItems ? 'Tutup' : 'Lihat'} {showItems ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                            </span>
                        </button>

                        {showItems && (
                            <div className="pt-3 pb-2 text-xs text-neutral-300 space-y-2 border-t border-neutral-800/60 mt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase text-neutral-500 mb-1">Item Pesanan</div>
                                        {transaction.item_details && transaction.item_details.length > 0 ? (
                                            transaction.item_details.map((item, idx) => (
                                                <div key={idx} className="flex justify-between py-1 border-b border-neutral-800/40">
                                                    <span>{item.name} x{item.quantity}</span>
                                                    <span className="font-mono">{formatRupiah(item.price * item.quantity)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex justify-between py-1">
                                                <span>Pembayaran Tagihan</span>
                                                <span className="font-mono">{formatRupiah(transaction.gross_amount)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase text-neutral-500 mb-1">Pelanggan</div>
                                        <div className="space-y-0.5 text-neutral-300">
                                            <div>{transaction.customer_details?.first_name || 'Pelanggan'} {transaction.customer_details?.last_name || ''}</div>
                                            <div className="text-neutral-400 font-mono">{transaction.customer_details?.email || '-'}</div>
                                            <div className="text-neutral-400 font-mono">{transaction.customer_details?.phone || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method Selector & Interactive Views */}
                    {status === 'pending' && (
                        <div className="p-6">
                            {/* Tabs Navigation */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-neutral-950/80 rounded-xl border border-neutral-800/80 mb-6">
                                <button
                                    onClick={() => setSelectedTab('va')}
                                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        selectedTab === 'va'
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                                    }`}
                                >
                                    <CreditCard className="size-4" />
                                    Virtual Account
                                </button>
                                <button
                                    onClick={() => setSelectedTab('qris')}
                                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        selectedTab === 'qris'
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                                    }`}
                                >
                                    <QrCode className="size-4" />
                                    QRIS
                                </button>
                                <button
                                    onClick={() => setSelectedTab('ewallet')}
                                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        selectedTab === 'ewallet'
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                                    }`}
                                >
                                    <Smartphone className="size-4" />
                                    E-Wallet
                                </button>
                                <button
                                    onClick={() => setSelectedTab('cstore')}
                                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        selectedTab === 'cstore'
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                                    }`}
                                >
                                    <Store className="size-4" />
                                    Retail Store
                                </button>
                            </div>

                            {/* Tab 1: Virtual Account */}
                            {selectedTab === 'va' && (
                                <div className="space-y-6">
                                    {/* Bank Selector */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                                            Pilih Bank Virtual Account
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {[
                                                { id: 'bca', name: 'BCA Virtual Account', badge: 'BCA' },
                                                { id: 'bni', name: 'BNI Virtual Account', badge: 'BNI' },
                                                { id: 'bri', name: 'BRI Virtual Account (BRIVA)', badge: 'BRI' },
                                                { id: 'mandiri', name: 'Mandiri Bill Payment', badge: 'Mandiri' },
                                                { id: 'permata', name: 'Permata VA', badge: 'Permata' },
                                                { id: 'cimb', name: 'CIMB Niaga VA', badge: 'CIMB' },
                                            ].map((bank) => (
                                                <button
                                                    key={bank.id}
                                                    type="button"
                                                    onClick={() => setSelectedBank(bank.id)}
                                                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                                        selectedBank === bank.id
                                                            ? 'border-blue-500 bg-blue-950/30 text-white ring-1 ring-blue-500/50'
                                                            : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                                                    }`}
                                                >
                                                    <span className="text-xs font-medium">{bank.name}</span>
                                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                                                        {bank.badge}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Virtual Account Detail Box */}
                                    <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-4">
                                        {selectedBank === 'mandiri' ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Kode Perusahaan (Biller Code)</div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xl font-mono font-bold text-amber-400">{activeBank?.biller_code || '70012'}</span>
                                                        <button
                                                            onClick={() => handleCopy(activeBank?.biller_code || '70012', 'Biller Code')}
                                                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                                                        >
                                                            {copied === 'Biller Code' ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Nomor Pelanggan (Bill Key)</div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xl font-mono font-bold text-blue-400">{activeBank?.bill_key || '9912345678'}</span>
                                                        <button
                                                            onClick={() => handleCopy(activeBank?.bill_key || '9912345678', 'Bill Key')}
                                                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                                                        >
                                                            {copied === 'Bill Key' ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-[11px] font-semibold text-neutral-400 uppercase">
                                                    Nomor Virtual Account ({selectedBank.toUpperCase()})
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-blue-400">
                                                        {activeBank?.va_number || '700141234567890'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(activeBank?.va_number || '', 'Nomor VA')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer"
                                                    >
                                                        {copied === 'Nomor VA' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                                                        {copied === 'Nomor VA' ? 'Tersalin' : 'Salin Nomor'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                                            <span>Total Pembayaran:</span>
                                            <span className="font-bold text-white font-mono text-sm">{formatRupiah(transaction.gross_amount)}</span>
                                        </div>
                                    </div>

                                    {/* Step by step Instructions */}
                                    <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/60 text-xs text-neutral-300 space-y-2">
                                        <div className="font-semibold text-neutral-200">Cara Pembayaran (Simulasi ATM / M-Banking):</div>
                                        <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                                            <li>Buka aplikasi Mobile Banking atau ATM bank Anda ({selectedBank.toUpperCase()}).</li>
                                            <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                                            <li>Masukkan Nomor VA di atas atau klik tombol <strong>"Simulasikan Bayar Sukses"</strong> di toolbar atas.</li>
                                            <li>Sistem akan memvalidasi pembayaran dan memicu webhook asinkron otomatis.</li>
                                        </ol>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: QRIS */}
                            {selectedTab === 'qris' && (
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="p-5 bg-white rounded-2xl shadow-xl flex flex-col items-center">
                                        {/* Dynamic Mock SVG QR */}
                                        <div className="size-52 bg-neutral-950 p-2 rounded-xl flex items-center justify-center">
                                            <svg className="size-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect width="100" height="100" fill="white" />
                                                <rect x="10" y="10" width="25" height="25" fill="black" />
                                                <rect x="15" y="15" width="15" height="15" fill="white" />
                                                <rect x="18" y="18" width="9" height="9" fill="black" />

                                                <rect x="65" y="10" width="25" height="25" fill="black" />
                                                <rect x="70" y="15" width="15" height="15" fill="white" />
                                                <rect x="73" y="18" width="9" height="9" fill="black" />

                                                <rect x="10" y="65" width="25" height="25" fill="black" />
                                                <rect x="15" y="70" width="15" height="15" fill="white" />
                                                <rect x="18" y="73" width="9" height="9" fill="black" />

                                                <rect x="42" y="12" width="6" height="6" fill="black" />
                                                <rect x="52" y="12" width="6" height="6" fill="black" />
                                                <rect x="42" y="24" width="6" height="6" fill="black" />
                                                <rect x="52" y="24" width="6" height="6" fill="black" />
                                                <rect x="42" y="36" width="16" height="16" fill="black" />

                                                <rect x="12" y="45" width="6" height="6" fill="black" />
                                                <rect x="24" y="45" width="6" height="6" fill="black" />
                                                <rect x="65" y="45" width="10" height="10" fill="black" />
                                                <rect x="80" y="45" width="8" height="8" fill="black" />

                                                <rect x="42" y="65" width="8" height="8" fill="black" />
                                                <rect x="55" y="65" width="12" height="12" fill="black" />
                                                <rect x="72" y="65" width="16" height="16" fill="black" />
                                                <rect x="42" y="78" width="10" height="10" fill="black" />
                                                <rect x="58" y="82" width="20" height="8" fill="black" />
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-neutral-900 font-bold text-xs tracking-wider uppercase">
                                            QRIS Standar Pembayaran Nasional
                                        </div>
                                        <div className="text-[10px] text-neutral-500 font-mono">
                                            NMID: ID1020039102910 • {merchant.name}
                                        </div>
                                    </div>

                                    <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 p-4 rounded-xl text-left space-y-2">
                                        <div className="text-xs text-neutral-400">QR String (EMVCo Payload):</div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={transaction.qr_string || '00020101021226590014ID.LINKAJA...'}
                                                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-300 select-all"
                                            />
                                            <button
                                                onClick={() => handleCopy(transaction.qr_string || '', 'QR String')}
                                                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                                            >
                                                <Copy className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSimulatorAction('settle')}
                                        disabled={actionLoading !== null}
                                        className="w-full max-w-md py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                                    >
                                        {actionLoading === 'settle' ? <RefreshCw className="size-4 animate-spin" /> : <QrCode className="size-4" />}
                                        Simulasikan Scan QR & Bayar Sukses
                                    </button>
                                </div>
                            )}

                            {/* Tab 3: E-Wallet */}
                            {selectedTab === 'ewallet' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { id: 'gopay', name: 'GoPay / GoPay App', desc: 'Scan QR atau Buka Aplikasi Gojek' },
                                            { id: 'shopeepay', name: 'ShopeePay', desc: 'Buka Aplikasi Shopee' },
                                            { id: 'ovo', name: 'OVO SmartPay', desc: 'Notifikasi Push OVO' },
                                            { id: 'dana', name: 'DANA Dompet Digital', desc: 'Redirect ke Saldo DANA' },
                                        ].map((ew) => (
                                            <div
                                                key={ew.id}
                                                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{ew.name}</div>
                                                    <div className="text-xs text-neutral-400 mt-1">{ew.desc}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleSimulatorAction('settle')}
                                                    className="mt-4 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer"
                                                >
                                                    Bayar via {ew.name}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Convenience Store */}
                            {selectedTab === 'cstore' && (
                                <div className="space-y-6">
                                    <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-4 text-center">
                                        <div className="text-xs text-neutral-400 uppercase font-semibold">
                                            Kode Pembayaran Indomaret / Alfamart
                                        </div>
                                        <div className="text-3xl font-mono font-bold text-amber-400 tracking-wider">
                                            {transaction.payment_code || 'INDO9810293810'}
                                        </div>

                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleCopy(transaction.payment_code || '', 'Kode Pembayaran')}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all"
                                            >
                                                <Copy className="size-4" />
                                                Salin Kode Pembayaran
                                            </button>
                                        </div>

                                        <div className="text-xs text-neutral-400 border-t border-neutral-800 pt-3">
                                            Tunjukkan kode pembayaran ini kepada kasir Indomaret / Alfamart terdekat.
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSimulatorAction('settle')}
                                        disabled={actionLoading !== null}
                                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Simulasikan Pembayaran di Kasir Selesai
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer security badge */}
                    <div className="bg-neutral-950/80 border-t border-neutral-800/60 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
                        <div className="flex items-center gap-1.5">
                            <ShieldAlert className="size-3.5 text-blue-400" />
                            <span>Mock Payment Gateway Simulator (Midtrans Architecture)</span>
                        </div>
                        <div className="font-mono">
                            SHA-512 Signed • Merchant Code: {merchant.merchant_code}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
