import React, { useRef } from 'react';
import { Form, Head } from '@inertiajs/react';
import { Mail, Lock, Sparkles, User, Shield, ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const fillDemo = (emailVal: string, passVal: string) => {
        if (emailRef.current) {
            emailRef.current.value = emailVal;
            emailRef.current.dispatchEvent(new Event('input', { bubbles: true }));
            emailRef.current.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (passwordRef.current) {
            passwordRef.current.value = passVal;
            passwordRef.current.dispatchEvent(new Event('input', { bubbles: true }));
            passwordRef.current.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    return (
        <>
            <Head title="Masuk - Kilex Payments Simulator" />

            <PasskeyVerify />

            {/* Quick Demo Credentials Box */}
            <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 dark:bg-blue-500/10 space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Sparkles className="size-3.5" />
                        Quick Demo Accounts
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-mono text-neutral-400">
                        1-Click Fill
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => fillDemo('admin@kilexpay.test', 'password')}
                        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left hover:border-blue-500 hover:shadow-xs transition-all group"
                    >
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-900 dark:text-white group-hover:text-blue-500">
                            <Shield className="size-3 text-purple-500" />
                            Admin Demo
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate font-mono">
                            admin@kilexpay.test
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => fillDemo('user@kilexpay.test', 'password')}
                        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left hover:border-blue-500 hover:shadow-xs transition-all group"
                    >
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-900 dark:text-white group-hover:text-blue-500">
                            <User className="size-3 text-blue-500" />
                            Merchant Demo
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate font-mono">
                            user@kilexpay.test
                        </div>
                    </button>
                </div>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
                                    <Input
                                        ref={emailRef}
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@perusahaan.com"
                                        className="pl-10 h-10 text-xs sm:text-sm rounded-xl border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/80 focus:border-blue-500"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <PasswordInput
                                        ref={passwordRef}
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="h-10 text-xs sm:text-sm rounded-xl border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/80 focus:border-blue-500"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded-md border-neutral-300 dark:border-neutral-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label htmlFor="remember" className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-10 mt-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Masuk ke Dashboard</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Sign up link */}
                        <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                            Belum memiliki akun merchant?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={6}
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Daftar Sekarang
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Akun',
    description: 'Akses dashboard merchant & kunci API simulasi Anda',
};
