import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    ShieldCheck,
    CreditCard,
    BookOpen,
    Info,
    LayoutGrid,
    LogIn,
    UserPlus,
    Moon,
    Sun,
    Menu,
    X,
    ExternalLink,
    PlayCircle,
    ArrowRight,
    Terminal,
    Sparkles,
} from "lucide-react";
import { useAppearance } from "@/hooks/use-appearance";
import { Toaster } from "sonner";

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { auth } = usePage().props as any;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === "dark" ? "light" : "dark");
    };

    return (
        <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200 selection:bg-blue-500/30 selection:text-blue-500">
            <Toaster position="top-right" richColors />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800/80 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="size-9 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <CreditCard className="size-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white">
                                    KilexPay
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    Simulator
                                </span>
                            </div>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block -mt-1 font-medium">
                                Midtrans Compatible Engine
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                        <Link
                            href="/"
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/about"
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Tentang Platform
                        </Link>
                        <Link
                            href="/docs"
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Dokumentasi API
                        </Link>
                        <a
                            href="/dashboard/simulator-test"
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 text-purple-600 dark:text-purple-400"
                        >
                            <Sparkles className="size-3.5" /> Sandbox Tester
                        </a>
                    </nav>

                    {/* Right Controls: Theme Toggle & Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
                            aria-label="Toggle Theme"
                        >
                            {resolvedAppearance === "dark" ? (
                                <Sun className="size-4 text-amber-400" />
                            ) : (
                                <Moon className="size-4 text-blue-600" />
                            )}
                        </button>

                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
                            >
                                <LayoutGrid className="size-3.5" /> Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-semibold shadow-sm transition-all"
                                >
                                    Daftar Merchant
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300"
                        >
                            {resolvedAppearance === "dark" ? (
                                <Sun className="size-4 text-amber-400" />
                            ) : (
                                <Moon className="size-4 text-blue-600" />
                            )}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
                        >
                            {mobileMenuOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-4 space-y-3">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/about"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                        >
                            Tentang Platform
                        </Link>
                        <Link
                            href="/docs"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                        >
                            Dokumentasi API
                        </Link>
                        <Link
                            href="/dashboard/simulator-test"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-medium text-purple-600 dark:text-purple-400"
                        >
                            Sandbox Tester
                        </Link>

                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
                            {auth?.user ? (
                                <Link
                                    href="/dashboard"
                                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-center text-xs font-semibold"
                                >
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-center text-xs font-semibold"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-center text-xs font-semibold"
                                    >
                                        Daftar Merchant Baru
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Page Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 text-xs transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="space-y-3 md:col-span-2">
                            <div className="flex items-center gap-2">
                                <div className="size-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                    <CreditCard className="size-3.5" />
                                </div>
                                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                                    Kilex Payment Gateway Simulator
                                </span>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                                Platform simulasi transaksi payment gateway
                                mandiri berstandar kompatibilitas Midtrans Core
                                API & Snap. Menguji alur checkout, Virtual
                                Account, QRIS, dan Webhook tanpa uang riil.
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Midtrans Contract v2 & Snap v1 Ready
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold uppercase text-[11px] text-neutral-900 dark:text-white tracking-wider mb-3">
                                Navigasi Cepat
                            </h3>
                            <ul className="space-y-2 text-neutral-500 dark:text-neutral-400">
                                <li>
                                    <Link
                                        href="/"
                                        className="hover:text-blue-500 transition-colors"
                                    >
                                        Beranda
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/about"
                                        className="hover:text-blue-500 transition-colors"
                                    >
                                        Tentang Simulator
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/docs"
                                        className="hover:text-blue-500 transition-colors"
                                    >
                                        Dokumentasi API
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="/dashboard/simulator-test"
                                        className="hover:text-blue-500 transition-colors"
                                    >
                                        Sandbox Quick Tester
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold uppercase text-[11px] text-neutral-900 dark:text-white tracking-wider mb-3">
                                API & Spesifikasi
                            </h3>
                            <ul className="space-y-2 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                                <li>POST /snap/v1/transactions</li>
                                <li>POST /v2/charge</li>
                                <li>GET /v2/:order_id/status</li>
                                <li>SHA-512 Signature Hashing</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
                        <div>
                            &copy; {new Date().getFullYear()} Kilex Payments
                            Simulator. Built with Laravel 11, React 19 &
                            Inertia.js.
                        </div>
                        <div className="flex items-center gap-4">
                            <span>
                                BCA • BNI • BRI • Mandiri • Permata • QRIS
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
