import { Link } from "@inertiajs/react";
import { ArrowLeft, Moon, Sun, ShieldCheck } from "lucide-react";
import AppLogoIcon from "@/components/app-logo-icon";
import { useAppearance } from "@/hooks/use-appearance";
import { home } from "@/routes";
import type { AuthLayoutProps } from "@/types";

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div className="relative min-h-screen flex flex-col justify-between bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 antialiased selection:bg-blue-500 selection:text-white transition-colors">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-120 bg-linear-to-tr from-blue-600/15 via-indigo-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-40 right-10 size-96 bg-linear-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[28px_28px]" />
            </div>

            {/* Top Navigation Bar */}
            <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors group"
                >
                    <div className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 group-hover:border-blue-500 transition-colors">
                        <ArrowLeft className="size-4 text-neutral-500 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <span>Kembali ke Beranda</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            updateAppearance(
                                appearance === "dark" ? "light" : "dark",
                            )
                        }
                        className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-blue-500 transition-colors"
                        title="Toggle Tema"
                    >
                        {appearance === "dark" ? (
                            <Sun className="size-4 text-amber-400" />
                        ) : (
                            <Moon className="size-4 text-blue-600" />
                        )}
                    </button>
                </div>
            </header>

            {/* Main Auth Container */}
            <main className="w-full max-w-md mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
                <div className="w-full rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-6">
                    {/* Header: Brand & Title */}
                    <div className="flex flex-col items-center text-center space-y-3">
                        <Link
                            href={home()}
                            className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 group hover:scale-105 transition-transform"
                        >
                            <AppLogoIcon className="size-7 fill-current text-white" />
                        </Link>

                        <div className="space-y-1">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Auth Body (Form) */}
                    <div>{children}</div>
                </div>
            </main>

            {/* Footer Reassurance */}
            <footer className="w-full max-w-6xl mx-auto px-4 py-6 text-center text-xs text-neutral-400 dark:text-neutral-500 flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="inline-flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>Kilex Payments Simulator</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span>Midtrans Sandbox & API Testing Environment</span>
            </footer>
        </div>
    );
}
