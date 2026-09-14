import React from "react";
import { Head, Link } from "@inertiajs/react";
import PublicLayout from "@/layouts/public-layout";
import {
    ShieldCheck,
    CreditCard,
    Zap,
    Cpu,
    ArrowRight,
    CheckCircle2,
    Lock,
    Webhook,
    Server,
    Sparkles,
    Layers,
    Code2,
    RefreshCw,
    Building2,
    QrCode,
} from "lucide-react";

export default function About() {
    return (
        <PublicLayout>
            <Head title="Tentang Platform - Kilex Payment Simulator" />

            <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Hero / Header */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                        <Sparkles className="size-3.5" /> Arsitektur Mock
                        Payment Gateway
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                        Simulasi Transaksi Midtrans Tanpa Batasan Sandbox
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Kilex Payment Simulator diciptakan untuk developer, QA
                        engineer, dan startup yang ingin menguji alur checkout,
                        Virtual Account, QRIS, dan integrasi webhook secara
                        cepat, andal, dan 100% kompatibel dengan Midtrans SDK.
                    </p>
                </div>

                {/* Problem vs Solution Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* The Problem */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                        <div className="size-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                            ⚠️
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                            Tantangan Testing Sandbox Konvensional
                        </h2>
                        <ul className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 font-bold">
                                    •
                                </span>
                                <span>
                                    Perlu login ke simulator pihak ketiga
                                    terpisah yang sering mengalami rate-limit
                                    atau maintenance tak terduga.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 font-bold">
                                    •
                                </span>
                                <span>
                                    Tidak bisa melakukan pengujian di lingkungan
                                    lokal/offline saat server testing internet
                                    down.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 font-bold">
                                    •
                                </span>
                                <span>
                                    Sulit memeriksa payload mentah (*raw JSON*)
                                    dan memverifikasi kalkulasi hash SHA-512
                                    secara transparan saat debugging webhook.
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* The Solution */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-500/20 shadow-sm space-y-4">
                        <div className="size-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                            ✨
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                            Solusi Kilex Payment Simulator
                        </h2>
                        <ul className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>
                                    <strong>Midtrans API Contract 100%:</strong>{" "}
                                    Gunakan library `midtrans-php` atau
                                    `midtrans-client` langsung tanpa mengubah
                                    struktur request.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>
                                    <strong>Instant Simulator Trigger:</strong>{" "}
                                    Klik tombol *Bayar Sukses (Settlement)*,
                                    *Expire*, atau *Cancel* langsung dari UI
                                    popup Snap.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>
                                    <strong>Asynchronous Webhook Queue:</strong>{" "}
                                    Job background mengirimkan payload
                                    notifikasi bertanda tangan SHA-512 dengan
                                    riwayat audit lengkap.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* System Architecture Diagram */}
                <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 dark:bg-neutral-900/90 text-white border border-neutral-800 space-y-8">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                        <div className="text-xs uppercase font-bold text-blue-400 tracking-wider">
                            Arsitektur & Alur Kerja
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            Bagaimana Simulator Bekerja
                        </h2>
                        <p className="text-xs text-neutral-400">
                            Alur integrasi mulus antara aplikasi backend
                            merchant, simulator Core/Snap API, dan background
                            queue worker.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                        {/* Step 1 */}
                        <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
                            <div className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold font-sans text-xs">
                                1
                            </div>
                            <div className="font-sans font-bold text-sm text-white">
                                Create Charge / Snap Token
                            </div>
                            <div className="text-neutral-400 text-[11px] font-sans">
                                Merchant SDK mengirim request ke{" "}
                                <code>POST /snap/v1/transactions</code> atau{" "}
                                <code>/v2/charge</code> dengan otentikasi Basic
                                Auth Server Key.
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
                            <div className="size-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold font-sans text-xs">
                                2
                            </div>
                            <div className="font-sans font-bold text-sm text-white">
                                Generate Mock VA & Snap UI
                            </div>
                            <div className="text-neutral-400 text-[11px] font-sans">
                                Simulator membuat transaksi status{" "}
                                <code>pending</code> (HTTP 201), nomor VA unik
                                (BCA, BNI, BRI, Mandiri), dan URL Snap Checkout.
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
                            <div className="size-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold font-sans text-xs">
                                3
                            </div>
                            <div className="font-sans font-bold text-sm text-white">
                                Simulasikan Pembayaran
                            </div>
                            <div className="text-neutral-400 text-[11px] font-sans">
                                Tester membuka halaman Snap UI dan mengklik
                                tombol simulator: <em>"Bayar Sukses"</em> atau{" "}
                                <em>"Expire"</em>.
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
                            <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold font-sans text-xs">
                                4
                            </div>
                            <div className="font-sans font-bold text-sm text-white">
                                Webhook POST + SHA-512
                            </div>
                            <div className="text-neutral-400 text-[11px] font-sans">
                                Queue Worker mengirim notifikasi HTTP POST ke{" "}
                                <code>notification_url</code> merchant dengan
                                signature SHA-512 yang valid.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Supported Payment Channels Grid */}
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Kanal Pembayaran yang Didukung
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Semua format data nomor tagihan dan respons JSON
                            disesuaikan persis dengan standar perbankan
                            Indonesia.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
                        {[
                            {
                                name: "BCA VA",
                                desc: "Prefix 70014",
                                icon: Building2,
                            },
                            {
                                name: "BNI VA",
                                desc: "Prefix 8808",
                                icon: Building2,
                            },
                            {
                                name: "BRI VA (BRIVA)",
                                desc: "Prefix 0201",
                                icon: Building2,
                            },
                            {
                                name: "Mandiri Bill",
                                desc: "Biller Code 70012",
                                icon: Building2,
                            },
                            {
                                name: "Permata & CIMB",
                                desc: "Permata VA",
                                icon: Building2,
                            },
                            {
                                name: "QRIS & E-Wallet",
                                desc: "EMVCo QR Payload",
                                icon: QrCode,
                            },
                        ].map((ch, idx) => {
                            const Icon = ch.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center justify-center space-y-2"
                                >
                                    <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <Icon className="size-5" />
                                    </div>
                                    <div className="font-bold text-neutral-900 dark:text-white">
                                        {ch.name}
                                    </div>
                                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                                        {ch.desc}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-r from-blue-600 to-indigo-600 text-white text-center space-y-6 shadow-xl shadow-blue-600/20">
                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                        Siap Menguji Integrasi Pembayaran Anda?
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
                        Dapatkan Server Key & Client Key Anda dalam hitungan
                        detik. Coba simulasi checkout Snap interaktif sekarang.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/register"
                            className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-xs shadow-lg hover:bg-neutral-100 transition-all"
                        >
                            Daftar Akun Merchant Gratis
                        </Link>
                        <Link
                            href="/docs"
                            className="px-6 py-3 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-xs border border-blue-400/30 transition-all flex items-center gap-1.5"
                        >
                            <Code2 className="size-4" /> Buka Dokumentasi API
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
