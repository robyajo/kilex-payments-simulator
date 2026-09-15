import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    ArrowLeftRight,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    Filter,
    KeyRound,
    QrCode,
    RefreshCw,
    Search,
    Send,
    ShieldCheck,
    Webhook,
    XCircle,
    Eye,
    Copy,
    Check,
    Code2,
    FileText,
    History,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface WebhookLogItem {
    id: string;
    target_url: string;
    http_status?: number;
    signature_key: string;
    payload_json: any;
    response_body?: string;
    attempt: number;
    created_at: string;
}

interface TransactionItem {
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
    fraud_status: string;
    customer_details?: any;
    item_details?: any;
    custom_field1?: string;
    custom_field2?: string;
    custom_field3?: string;
    snap_token?: string;
    expired_at: string;
    settlement_time?: string;
    created_at: string;
    webhook_count: number;
    latest_webhook_status?: number;
    webhook_logs: WebhookLogItem[];
}

interface Props {
    transactions: {
        data: TransactionItem[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search: string;
        status: string;
        payment_type: string;
    };
    serverKey: string;
    merchant: {
        name: string;
        merchant_code: string;
    };
}

export default function TransactionsIndex({ transactions, filters, serverKey, merchant }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPaymentType, setSelectedPaymentType] = useState(filters.payment_type || 'all');
    const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
    const [inspectorTab, setInspectorTab] = useState<'details' | 'json' | 'signature' | 'webhooks'>('details');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [resendUrl, setResendUrl] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dashboard/transactions', {
            search,
            status: selectedStatus,
            payment_type: selectedPaymentType,
        }, { preserveState: true });
    };

    const handleFilterChange = (newStatus: string, newType: string) => {
        setSelectedStatus(newStatus);
        setSelectedPaymentType(newType);
        router.get('/dashboard/transactions', {
            search,
            status: newStatus,
            payment_type: newType,
        }, { preserveState: true });
    };

    const handleAction = (txId: string, actionName: 'mark-paid' | 'mark-expire' | 'mark-cancel') => {
        setActionLoading(`${txId}-${actionName}`);
        router.post(`/dashboard/transactions/${txId}/${actionName}`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Status transaksi berhasil diperbarui!');
                setActionLoading(null);
                // Update active modal tx if open
                if (selectedTx && selectedTx.id === txId) {
                    const newStatus = actionName === 'mark-paid' ? 'settlement' : (actionName === 'mark-expire' ? 'expire' : 'cancel');
                    setSelectedTx({ ...selectedTx, transaction_status: newStatus });
                }
            },
            onError: () => {
                toast.error('Gagal memperbarui transaksi.');
                setActionLoading(null);
            },
        });
    };

    const handleResendWebhook = (txId: string) => {
        setActionLoading(`resend-${txId}`);
        router.post(`/dashboard/transactions/${txId}/resend-webhook`, {
            target_url: resendUrl || undefined,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Webhook notification re-dispatched!');
                setActionLoading(null);
            },
            onError: () => {
                toast.error('Gagal mengirim ulang webhook.');
                setActionLoading(null);
            },
        });
    };

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast.success(`${label} disalin!`);
        setTimeout(() => setCopied(null), 2000);
    };

    const getStatusPill = (status: string) => {
        switch (status) {
            case 'settlement':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" /> Settlement
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="size-3" /> Pending
                    </span>
                );
            case 'expire':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
                        <Clock className="size-3" /> Expired
                    </span>
                );
            case 'cancel':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <XCircle className="size-3" /> Cancel
                    </span>
                );
            case 'deny':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <AlertCircle className="size-3" /> Deny
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-500/10 text-neutral-400">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Transactions', href: '/dashboard/transactions' },
            ]}
        >
            <Head title="Transactions Inspector - Kilex Payment Simulator" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Riwayat & Inspector Transaksi
                        </h1>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Kelola, periksa payload JSON Midtrans, verifikasi Signature SHA-512, dan pantau pengiriman webhook.
                        </p>
                    </div>

                    <a
                        href="/dashboard/simulator-test"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
                    >
                        <ArrowLeftRight className="size-3.5" />
                        Buat Transaksi Uji Coba
                    </a>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari Order ID, UUID, Nama Pelanggan, atau VA..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Status Filter Buttons */}
                            {[
                                { id: 'all', label: 'Semua Status' },
                                { id: 'settlement', label: 'Settlement' },
                                { id: 'pending', label: 'Pending' },
                                { id: 'expire', label: 'Expire' },
                                { id: 'cancel', label: 'Cancel' },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => handleFilterChange(st.id, selectedPaymentType)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                        selectedStatus === st.id
                                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider">
                                    <th className="py-3 px-4">Order ID & UUID</th>
                                    <th className="py-3 px-4">Nominal</th>
                                    <th className="py-3 px-4">Metode / Bank</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Webhook</th>
                                    <th className="py-3 px-4">Waktu Dibuat</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-neutral-500 font-sans">
                                            Tidak ada transaksi yang cocok dengan filter.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                                                    {tx.order_id}
                                                </div>
                                                <div className="text-[10px] text-neutral-400 font-mono">
                                                    {tx.id.substring(0, 13)}...
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-sans font-bold text-neutral-900 dark:text-neutral-100">
                                                {formatRupiah(tx.gross_amount)}
                                            </td>

                                            <td className="py-3.5 px-4 font-sans">
                                                <div className="capitalize font-medium text-neutral-800 dark:text-neutral-200">
                                                    {tx.bank ? `${tx.bank.toUpperCase()} VA` : tx.payment_type}
                                                </div>
                                                {tx.va_number && (
                                                    <div className="text-[10px] font-mono text-neutral-400">
                                                        VA: {tx.va_number}
                                                    </div>
                                                )}
                                                {tx.bill_key && (
                                                    <div className="text-[10px] font-mono text-neutral-400">
                                                        Bill: {tx.bill_key}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 font-sans">
                                                {getStatusPill(tx.transaction_status)}
                                            </td>

                                            <td className="py-3.5 px-4 font-sans">
                                                {tx.webhook_count > 0 ? (
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                            tx.latest_webhook_status && tx.latest_webhook_status >= 200 && tx.latest_webhook_status < 300
                                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                        }`}
                                                    >
                                                        <Webhook className="size-2.5" />
                                                        {tx.latest_webhook_status ? `HTTP ${tx.latest_webhook_status}` : 'ERR'}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-neutral-400">Belum dikirim</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 font-sans text-neutral-500 dark:text-neutral-400 text-[11px]">
                                                {new Date(tx.created_at).toLocaleString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>

                                            <td className="py-3.5 px-4 text-right font-sans">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedTx(tx)}
                                                        className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                                                        title="Buka Inspector Detail"
                                                    >
                                                        <Eye className="size-3.5" />
                                                    </button>

                                                    {tx.snap_token && tx.transaction_status === 'pending' && (
                                                        <a
                                                            href={`/snap/v1/pay/${tx.snap_token}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 transition-colors"
                                                            title="Buka UI Snap Checkout"
                                                        >
                                                            <ExternalLink className="size-3.5" />
                                                        </a>
                                                    )}

                                                    {tx.transaction_status === 'pending' && (
                                                        <button
                                                            onClick={() => handleAction(tx.id, 'mark-paid')}
                                                            disabled={actionLoading !== null}
                                                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all cursor-pointer"
                                                        >
                                                            {actionLoading === `${tx.id}-mark-paid` ? '...' : 'Bayar'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                            <div>Total: {transactions.total} transaksi</div>
                            <div className="flex items-center gap-1">
                                {transactions.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                                            link.active
                                                ? 'bg-blue-600 text-white font-semibold'
                                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Transaction Inspector Modal */}
                {selectedTx && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                            {/* Modal Header */}
                            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs uppercase font-bold text-blue-500">Inspector Transaksi</span>
                                        <span>•</span>
                                        <span className="font-mono text-xs text-neutral-400 font-semibold">{selectedTx.order_id}</span>
                                    </div>
                                    <div className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                                        {formatRupiah(selectedTx.gross_amount)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {getStatusPill(selectedTx.transaction_status)}
                                    <button
                                        onClick={() => setSelectedTx(null)}
                                        className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                    >
                                        <XCircle className="size-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Tab Buttons */}
                            <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/60 px-5 text-xs font-semibold">
                                <button
                                    onClick={() => setInspectorTab('details')}
                                    className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                                        inspectorTab === 'details'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                                >
                                    <FileText className="size-3.5" /> Detail Transaksi
                                </button>
                                <button
                                    onClick={() => setInspectorTab('signature')}
                                    className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                                        inspectorTab === 'signature'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                                >
                                    <ShieldCheck className="size-3.5" /> Signature SHA-512
                                </button>
                                <button
                                    onClick={() => setInspectorTab('json')}
                                    className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                                        inspectorTab === 'json'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Code2 className="size-3.5" /> Raw JSON Response
                                </button>
                                <button
                                    onClick={() => setInspectorTab('webhooks')}
                                    className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                                        inspectorTab === 'webhooks'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                                >
                                    <History className="size-3.5" /> Webhook Logs ({selectedTx.webhook_logs.length})
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">

                                {/* Tab 1: Detail Transaksi */}
                                {inspectorTab === 'details' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                                                <div className="text-[10px] font-bold uppercase text-neutral-400">Metadata Transaksi</div>
                                                <div className="space-y-1 text-neutral-700 dark:text-neutral-300">
                                                    <div><strong>Transaction ID (UUID):</strong> <code className="font-mono text-[11px] select-all">{selectedTx.id}</code></div>
                                                    <div><strong>Order ID:</strong> <code className="font-mono text-[11px] select-all">{selectedTx.order_id}</code></div>
                                                    <div><strong>Metode:</strong> <span className="capitalize font-semibold">{selectedTx.payment_type} {selectedTx.bank ? `(${selectedTx.bank.toUpperCase()})` : ''}</span></div>
                                                    {selectedTx.va_number && <div><strong>VA Number:</strong> <code className="font-mono font-bold text-blue-500">{selectedTx.va_number}</code></div>}
                                                    {selectedTx.bill_key && <div><strong>Bill Key / Biller Code:</strong> <code className="font-mono text-blue-500">{selectedTx.bill_key} / {selectedTx.biller_code}</code></div>}
                                                    <div><strong>Fraud Status:</strong> <span className="font-mono uppercase text-emerald-500">{selectedTx.fraud_status}</span></div>
                                                </div>
                                            </div>

                                            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                                                <div className="text-[10px] font-bold uppercase text-neutral-400">Informasi Pelanggan & Waktu</div>
                                                <div className="space-y-1 text-neutral-700 dark:text-neutral-300">
                                                    <div><strong>Nama:</strong> {selectedTx.customer_details?.first_name || '-'} {selectedTx.customer_details?.last_name || ''}</div>
                                                    <div><strong>Email:</strong> {selectedTx.customer_details?.email || '-'}</div>
                                                    <div><strong>Telepon:</strong> {selectedTx.customer_details?.phone || '-'}</div>
                                                    <div><strong>Dibuat:</strong> {new Date(selectedTx.created_at).toLocaleString('id-ID')}</div>
                                                    <div><strong>Expired At:</strong> {new Date(selectedTx.expired_at).toLocaleString('id-ID')}</div>
                                                    {selectedTx.settlement_time && <div><strong>Settlement Time:</strong> {new Date(selectedTx.settlement_time).toLocaleString('id-ID')}</div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Simulator Control Actions */}
                                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                                            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                Tindakan Simulator Cepat:
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {selectedTx.transaction_status === 'pending' && (
                                                    <button
                                                        onClick={() => handleAction(selectedTx.id, 'mark-paid')}
                                                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <CheckCircle2 className="size-3.5" /> Ubah ke Settlement (200)
                                                    </button>
                                                )}
                                                {selectedTx.transaction_status === 'pending' && (
                                                    <button
                                                        onClick={() => handleAction(selectedTx.id, 'mark-expire')}
                                                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <Clock className="size-3.5" /> Ubah ke Expire (407)
                                                    </button>
                                                )}
                                                {selectedTx.transaction_status === 'pending' && (
                                                    <button
                                                        onClick={() => handleAction(selectedTx.id, 'mark-cancel')}
                                                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition-all cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <XCircle className="size-3.5" /> Ubah ke Cancel (202)
                                                    </button>
                                                )}
                                                {selectedTx.snap_token && (
                                                    <a
                                                        href={`/snap/v1/pay/${selectedTx.snap_token}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700 font-medium transition-all flex items-center gap-1.5"
                                                    >
                                                        <ExternalLink className="size-3.5" /> Buka Halaman Snap
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab 2: Signature SHA-512 */}
                                {inspectorTab === 'signature' && (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                                            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                Midtrans Signature Algorithm:
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-neutral-900 text-emerald-400 font-mono text-xs">
                                                SHA512(order_id + status_code + gross_amount + server_key)
                                            </div>

                                            <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                                                <div><strong>1. order_id:</strong> <code className="font-mono text-blue-500">{selectedTx.order_id}</code></div>
                                                <div><strong>2. status_code:</strong> <code className="font-mono text-blue-500">{selectedTx.status_code}</code></div>
                                                <div><strong>3. gross_amount:</strong> <code className="font-mono text-blue-500">{Number(selectedTx.gross_amount).toFixed(2)}</code></div>
                                                <div><strong>4. server_key:</strong> <code className="font-mono text-neutral-400">{serverKey}</code></div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                                            <div className="text-[11px] font-semibold text-neutral-500 uppercase">Computed SHA-512 Signature Key</div>
                                            <div className="p-3 rounded-lg bg-neutral-900 text-amber-300 font-mono text-xs break-all flex items-center justify-between gap-2">
                                                <span>{selectedTx.webhook_logs[0]?.signature_key || 'Calculated when webhook triggered'}</span>
                                                {selectedTx.webhook_logs[0]?.signature_key && (
                                                    <button
                                                        onClick={() => copyText(selectedTx.webhook_logs[0].signature_key, 'Signature')}
                                                        className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                                                    >
                                                        {copied === 'Signature' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab 3: Raw JSON Response */}
                                {inspectorTab === 'json' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-neutral-500 font-semibold uppercase text-[10px]">Midtrans Standard JSON Response</span>
                                            <button
                                                onClick={() => copyText(JSON.stringify(selectedTx, null, 2), 'JSON')}
                                                className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                            >
                                                <Copy className="size-3" /> Salin JSON
                                            </button>
                                        </div>
                                        <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto border border-neutral-800">
                                            {JSON.stringify({
                                                status_code: selectedTx.status_code,
                                                status_message: selectedTx.status_message,
                                                transaction_id: selectedTx.id,
                                                order_id: selectedTx.order_id,
                                                merchant_id: merchant.merchant_code,
                                                gross_amount: Number(selectedTx.gross_amount).toFixed(2),
                                                currency: 'IDR',
                                                payment_type: selectedTx.payment_type,
                                                transaction_time: selectedTx.created_at,
                                                transaction_status: selectedTx.transaction_status,
                                                fraud_status: selectedTx.fraud_status,
                                                signature_key: selectedTx.webhook_logs[0]?.signature_key || '...',
                                                va_numbers: selectedTx.va_number ? [{ bank: selectedTx.bank, va_number: selectedTx.va_number }] : undefined,
                                                bill_key: selectedTx.bill_key || undefined,
                                                biller_code: selectedTx.biller_code || undefined,
                                                settlement_time: selectedTx.settlement_time || undefined,
                                            }, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {/* Tab 4: Webhook Logs */}
                                {inspectorTab === 'webhooks' && (
                                    <div className="space-y-4">
                                        {/* Re-trigger Webhook Bar */}
                                        <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-3">
                                            <input
                                                type="url"
                                                placeholder="Kirim ke URL custom (opsional, default: notification_url)"
                                                value={resendUrl}
                                                onChange={(e) => setResendUrl(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
                                            />
                                            <button
                                                onClick={() => handleResendWebhook(selectedTx.id)}
                                                disabled={actionLoading !== null}
                                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                            >
                                                <Send className="size-3.5" /> Kirim Ulang Webhook
                                            </button>
                                        </div>

                                        {selectedTx.webhook_logs.length === 0 ? (
                                            <div className="p-8 text-center text-neutral-500">
                                                Belum ada notifikasi webhook yang terkirim untuk transaksi ini.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedTx.webhook_logs.map((log, idx) => (
                                                    <div key={log.id || idx} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                                        log.http_status && log.http_status >= 200 && log.http_status < 300
                                                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                                    }`}
                                                                >
                                                                    {log.http_status ? `HTTP ${log.http_status}` : 'FAILED / TIMEOUT'}
                                                                </span>
                                                                <span className="font-mono text-neutral-600 dark:text-neutral-400 text-xs truncate max-w-sm">{log.target_url}</span>
                                                            </div>
                                                            <span className="text-[10px] text-neutral-400">{new Date(log.created_at).toLocaleTimeString('id-ID')}</span>
                                                        </div>

                                                        {log.response_body && (
                                                            <div className="mt-2 text-[10px] font-mono bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg text-neutral-700 dark:text-neutral-300 max-h-24 overflow-y-auto">
                                                                <strong>Response Body:</strong> {log.response_body}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-end">
                                <button
                                    onClick={() => setSelectedTx(null)}
                                    className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold"
                                >
                                    Tutup Inspector
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
