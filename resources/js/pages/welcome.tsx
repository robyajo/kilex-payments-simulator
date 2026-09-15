import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import PublicLayout from "@/layouts/public-layout";
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    Code2,
    CreditCard,
    ExternalLink,
    KeyRound,
    Lock,
    PlayCircle,
    QrCode,
    RefreshCw,
    Server,
    ShieldCheck,
    Sparkles,
    Terminal,
    Webhook,
    Zap,
    Copy,
    Check,
} from "lucide-react";
import { toast } from "sonner";

export default function Welcome() {
    const { auth } = usePage().props as any;
    const [copied, setCopied] = useState<string | null>(null);
    const [selectedBank, setSelectedBank] = useState("bca");

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast.success(`${label} disalin!`);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <PublicLayout>
            <Head title="Kilex Payment Simulator - Midtrans-Compatible Mock Gateway" />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-150 bg-linear-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        {/* Left Hero Content */}
                        <div className="flex-1 text-center lg:text-left space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                                Midtrans Core API & Snap v1 Compatible
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
                                Uji Pembayaran{" "}
                                <br className="hidden sm:inline" />
                                <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Virtual Account & QRIS
                                </span>{" "}
                                <br />
                                Tanpa Uang Riil.
                            </h1>

                            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Mock payment gateway mandiri berstandar
                                Midtrans. Cukup arahkan Base URL SDK Anda ke
                                simulator ini untuk menguji checkout Snap,
                                otentikasi SHA-512, dan webhook asynchronous
                                dalam hitungan detik.
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                                <Link
                                    href={
                                        auth?.user ? "/dashboard" : "/register"
                                    }
                                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all active:scale-98"
                                >
                                    {auth?.user
                                        ? "Buka Dashboard"
                                        : "Mulai Sekarang Gratis"}
                                    <ArrowRight className="size-4" />
                                </Link>

                                <Link
                                    href="/docs"
                                    className="px-5 py-3 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 font-semibold text-xs transition-all flex items-center gap-2"
                                >
                                    <Code2 className="size-4 text-purple-500" />
                                    Dokumentasi API
                                </Link>

                                <a
                                    href="/dashboard/simulator-test"
                                    className="px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-blue-500 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                    <PlayCircle className="size-4" />
                                    Coba Sandbox
                                </a>
                            </div>

                            {/* Feature bullet summary */}
                            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-3.5 text-emerald-500" />{" "}
                                    Basic Auth Midtrans
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-3.5 text-emerald-500" />{" "}
                                    SHA-512 Signature
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-3.5 text-emerald-500" />{" "}
                                    Queue Worker Webhook
                                </div>
                            </div>
                        </div>

                        {/* Right Interactive Mock Checkout Preview Card */}
                        <div className="flex-1 max-w-md w-full">
                            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl text-neutral-100 space-y-5">
                                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs font-bold text-neutral-300">
                                            Live Mock Preview
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        HTTP 201 Created
                                    </span>
                                </div>

                                <div>
                                    <div className="text-[11px] text-neutral-400 uppercase font-semibold">
                                        Total Tagihan
                                    </div>
                                    <div className="text-2xl font-bold font-sans text-white">
                                        Rp 250.000
                                    </div>
                                    <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                                        Order ID: ORD-2026-DEMO
                                    </div>
                                </div>

                                {/* Bank selector buttons */}
                                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono font-bold">
                                    {["bca", "bni", "bri", "mandiri"].map(
                                        (b) => (
                                            <button
                                                key={b}
                                                onClick={() =>
                                                    setSelectedBank(b)
                                                }
                                                className={`py-1.5 rounded-lg border uppercase text-center transition-all cursor-pointer ${
                                                    selectedBank === b
                                                        ? "border-blue-500 bg-blue-600/30 text-blue-400"
                                                        : "border-neutral-800 bg-neutral-950 text-neutral-500 hover:text-neutral-300"
                                                }`}
                                            >
                                                {b}
                                            </button>
                                        ),
                                    )}
                                </div>

                                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                                    <div className="text-[10px] uppercase font-semibold text-neutral-400">
                                        Nomor Virtual Account (
                                        {selectedBank.toUpperCase()})
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-mono font-bold text-blue-400">
                                            {selectedBank === "bca" &&
                                                "700141234567890"}
                                            {selectedBank === "bni" &&
                                                "880812345678901"}
                                            {selectedBank === "bri" &&
                                                "020112345678902"}
                                            {selectedBank === "mandiri" &&
                                                "Bill Key: 9912345678"}
                                        </span>
                                        <button
                                            onClick={() =>
                                                copyText(
                                                    "700141234567890",
                                                    "VA Number",
                                                )
                                            }
                                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                                        >
                                            {copied === "VA Number" ? (
                                                <Check className="size-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="size-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <a
                                        href="/dashboard/simulator-test"
                                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all"
                                    >
                                        <CheckCircle2 className="size-3.5" />
                                        Simulasikan Pembayaran Sukses
                                        (Settlement)
                                    </a>
                                </div>

                                <div className="text-[10px] text-neutral-500 font-mono text-center">
                                    SHA-512 Signature Hash Included
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Cards Grid */}
            <section className="py-16 bg-white dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Fitur Utama
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                            Semua yang Dibutuhkan untuk Menguji Payment Gateway
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs sm:text-sm">
                        {/* Card 1 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <CreditCard className="size-5" />
                            </div>
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                                Snap & Core API
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                                Mendukung endpoint{" "}
                                <code>/snap/v1/transactions</code> dan{" "}
                                <code>/v2/charge</code> dengan skema payload
                                yang sama persis dengan Midtrans.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <ShieldCheck className="size-5" />
                            </div>
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                                SHA-512 Signature Hashing
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                                Menghitung dan memvalidasi hashing bawaan
                                Midtrans:{" "}
                                <code>
                                    SHA512(order_id + status_code + gross_amount
                                    + server_key)
                                </code>
                                .
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Webhook className="size-5" />
                            </div>
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                                Asynchronous Webhook Queue
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                                Background queue worker mengirimkan notifikasi
                                HTTP POST ke merchant dengan mekanisme retry
                                otomatis dan pencatatan riwayat response.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <QrCode className="size-5" />
                            </div>
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                                QRIS & Virtual Accounts
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                                Generator mock nomor VA untuk BCA, BNI, BRI,
                                Mandiri Bill, Permata, serta string QRIS
                                kompatibel standar EMVCo.
                            </p>
                        </div>

                        {/* Card 5 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Terminal className="size-5" />
                            </div>
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                                Deep Payload Inspector
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                                Periksa struktur data mentah JSON, HTTP status
                                code response merchant, dan coba kirim ulang
                                webhook dengan satu klik.
                            </p>
                        </div>

                        {/* Card 6 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                <KeyRound className="size-5" />
                            </div>
                            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                                Multi-Tenant API Keys
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                                Setiap merchant mendapatkan kredensial unik
                                (Server Key & Client Key) yang siap digunakan di
                                berbagai proyek klien.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Code Comparison Section */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                        Hanya Butuh 3 Baris Kode untuk Beralih
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Tidak perlu menginstal package baru. Gunakan library
                        Midtrans resmi yang sudah ada.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 text-neutral-400">
                        <span>PHP (midtrans-php)</span>
                        <button
                            onClick={() =>
                                copyText(
                                    `\\Midtrans\\Config::$serverKey = 'SB-Mid-server-kilex9876543210demo';\n\\Midtrans\\Config::$isProduction = false;\n\\Midtrans\\Config::$overrideNotifUrl = 'http://localhost:8001/api/snap/v1';`,
                                    "PHP Code",
                                )
                            }
                            className="hover:text-white flex items-center gap-1"
                        >
                            <Copy className="size-3" /> Salin
                        </button>
                    </div>

                    <pre className="text-neutral-300 overflow-x-auto leading-relaxed">
                        {`// Cukup ganti Server Key Anda dengan Server Key Simulator
\\Midtrans\\Config::$serverKey = 'SB-Mid-server-kilex9876543210demo';
\\Midtrans\\Config::$isProduction = false;

// Buat Transaksi Snap seperti biasa
$snapToken = \\Midtrans\\Snap::getSnapToken($params);`}
                    </pre>
                </div>
            </section>

            {/* Call to Action Banner */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Mulai Simulasi Transaksi Sekarang
                        </h2>
                        <p className="text-xs sm:text-sm text-blue-100 max-w-md">
                            Daftarkan akun merchant Anda untuk mendapatkan
                            Server Key & Client Key instan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={auth?.user ? "/dashboard" : "/register"}
                            className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-xs shadow-lg hover:bg-neutral-100 transition-all"
                        >
                            {auth?.user
                                ? "Buka Dashboard"
                                : "Daftar Merchant Gratis"}
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
