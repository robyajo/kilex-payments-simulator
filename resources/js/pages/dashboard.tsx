import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
    ArrowUpRight,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    ExternalLink,
    KeyRound,
    PlayCircle,
    QrCode,
    RefreshCw,
    Send,
    TrendingUp,
    Webhook,
    XCircle,
    Copy,
    Check,
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface DashboardProps {
    merchant: {
        id: string;
        name: string;
        merchant_code: string;
        notification_url?: string;
    };
    apiKey: {
        server_key: string;
        client_key: string;
    };
    stats: {
        total_transactions: number;
        total_volume: number;
        settlement_count: number;
        pending_count: number;
        failed_count: number;
        conversion_rate: number;
        total_webhooks: number;
        webhook_success_rate: number;
    };
    recentTransactions: Array<{
        id: string;
        order_id: string;
        gross_amount: number;
        payment_type: string;
        bank?: string;
        va_number?: string;
        transaction_status: string;
        status_code: string;
        snap_token?: string;
        created_at: string;
    }>;
    recentWebhooks: Array<{
        id: string;
        transaction_id: string;
        order_id: string;
        target_url: string;
        http_status?: number;
        signature_key: string;
        attempt: number;
        created_at: string;
    }>;
}

export default function Dashboard({
    merchant,
    apiKey,
    stats,
    recentTransactions,
    recentWebhooks,
}: DashboardProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(label);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "settlement":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" /> Settlement
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="size-3" /> Pending
                    </span>
                );
            case "expire":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
                        <Clock className="size-3" /> Expired
                    </span>
                );
            case "cancel":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <XCircle className="size-3" /> Canceled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}>
            <Head title="Simulator Dashboard - Kilex Payment Gateway" />
            <Toaster position="top-right" richColors />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                {/* Hero / Merchant Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-500/20 p-6 sm:p-8 backdrop-blur-md">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                                    Midtrans Sandbox Mode
                                </span>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    ID:{" "}
                                    <code className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold">
                                        {merchant.merchant_code}
                                    </code>
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-2">
                                {merchant.name}
                            </h1>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
                                Full mock payment engine for Midtrans Core API
                                and Snap. Test checkout, Virtual Accounts
                                (BCA/BNI/BRI/Mandiri), QRIS, and asynchronous
                                webhook delivery seamlessly.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/dashboard/simulator-test"
                                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all active:scale-98"
                            >
                                <PlayCircle className="size-4" />
                                Launch Sandbox Tester
                            </Link>
                            <Link
                                href="/dashboard/settings/api-keys"
                                className="px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 text-sm font-medium transition-all flex items-center gap-2"
                            >
                                <KeyRound className="size-4 text-amber-500" />
                                API Credentials
                            </Link>
                        </div>
                    </div>

                    {/* Quick Copy Credential Strip */}
                    <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                                    Server Key:
                                </span>
                                <code className="font-mono text-neutral-800 dark:text-neutral-200 truncate">
                                    {apiKey.server_key}
                                </code>
                            </div>
                            <button
                                onClick={() =>
                                    copyToClipboard(
                                        apiKey.server_key,
                                        "Server Key",
                                    )
                                }
                                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                title="Copy Server Key"
                            >
                                {copiedKey === "Server Key" ? (
                                    <Check className="size-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="size-3.5" />
                                )}
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                                    Client Key:
                                </span>
                                <code className="font-mono text-neutral-800 dark:text-neutral-200 truncate">
                                    {apiKey.client_key}
                                </code>
                            </div>
                            <button
                                onClick={() =>
                                    copyToClipboard(
                                        apiKey.client_key,
                                        "Client Key",
                                    )
                                }
                                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                title="Copy Client Key"
                            >
                                {copiedKey === "Client Key" ? (
                                    <Check className="size-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="size-3.5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Card 1: Total Settled Volume */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                Volume Settlement
                            </span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <DollarSign className="size-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {formatRupiah(stats.total_volume)}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                Total pembayaran sukses disimulasikan
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Total Transactions */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                Total Transaksi
                            </span>
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <TrendingUp className="size-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {stats.total_transactions}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
                                <span className="text-emerald-500 font-semibold">
                                    {stats.settlement_count} paid
                                </span>
                                <span>•</span>
                                <span className="text-amber-500 font-semibold">
                                    {stats.pending_count} pending
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Settlement Conversion Rate */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                Settlement Rate
                            </span>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {stats.conversion_rate}%
                            </div>
                            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(stats.conversion_rate, 100)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Webhook Delivery Success */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                Webhook Success
                            </span>
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Webhook className="size-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {stats.webhook_success_rate}%
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {stats.total_webhooks} total delivery attempts
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2 Column Layout: Recent Transactions & Webhook Deliveries */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Left 2 Cols: Recent Transactions Table */}
                    <div className="lg:col-span-2 bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Transaksi Terkini
                                </h2>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Daftar transaksi charge & snap simulator
                                    terbaru
                                </p>
                            </div>
                            <Link
                                href="/dashboard/transactions"
                                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                Lihat Semua ({stats.total_transactions})
                                <ArrowUpRight className="size-3.5" />
                            </Link>
                        </div>

                        {recentTransactions.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-xs">
                                Belum ada transaksi yang dibuat. Buat transaksi
                                pertama via Sandbox Tester atau Midtrans API.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px]">
                                            <th className="py-2.5 px-3">
                                                Order ID
                                            </th>
                                            <th className="py-2.5 px-3">
                                                Nominal
                                            </th>
                                            <th className="py-2.5 px-3">
                                                Metode
                                            </th>
                                            <th className="py-2.5 px-3">
                                                Status
                                            </th>
                                            <th className="py-2.5 px-3 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono">
                                        {recentTransactions.map((tx) => (
                                            <tr
                                                key={tx.id}
                                                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                                            >
                                                <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                                                    {tx.order_id}
                                                </td>
                                                <td className="py-3 px-3 font-sans font-bold text-neutral-800 dark:text-neutral-200">
                                                    {formatRupiah(
                                                        tx.gross_amount,
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 font-sans capitalize text-neutral-600 dark:text-neutral-400">
                                                    {tx.bank
                                                        ? `${tx.bank.toUpperCase()} VA`
                                                        : tx.payment_type}
                                                </td>
                                                <td className="py-3 px-3 font-sans">
                                                    {getStatusBadge(
                                                        tx.transaction_status,
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-right font-sans">
                                                    {tx.snap_token &&
                                                    tx.transaction_status ===
                                                        "pending" ? (
                                                        <a
                                                            href={`/snap/v1/pay/${tx.snap_token}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 text-xs font-medium transition-colors"
                                                        >
                                                            Buka Snap{" "}
                                                            <ExternalLink className="size-3" />
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            href="/dashboard/transactions"
                                                            className="text-neutral-400 hover:text-neutral-200 text-xs font-medium"
                                                        >
                                                            Detail
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right 1 Col: Recent Webhook Logs */}
                    <div className="bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Aktivitas Webhook
                                </h2>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Log pengiriman notifikasi Midtrans POST
                                </p>
                            </div>
                            <Link
                                href="/dashboard/settings/api-keys"
                                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Config
                            </Link>
                        </div>

                        {recentWebhooks.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-xs">
                                Belum ada pengiriman webhook tercatat.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentWebhooks.map((log) => (
                                    <div
                                        key={log.id}
                                        className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 text-xs space-y-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-200 truncate max-w-35">
                                                {log.order_id}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                    log.http_status &&
                                                    log.http_status >= 200 &&
                                                    log.http_status < 300
                                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                        : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                                }`}
                                            >
                                                {log.http_status
                                                    ? `HTTP ${log.http_status}`
                                                    : "FAILED"}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
                                            {log.target_url}
                                        </div>
                                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center justify-between">
                                            <span>Attempt #{log.attempt}</span>
                                            <span>
                                                {new Date(
                                                    log.created_at,
                                                ).toLocaleTimeString("id-ID")}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
