import { Form, Head } from '@inertiajs/react';
import { User, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Daftar Akun Baru - Kilex Payments Simulator" />

            {/* Sandbox Sandbox Auto-provision Reassurance */}
            <div className="mb-6 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs flex items-start gap-2.5">
                <Sparkles className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
                    Setiap pendaftaran otomatis mendapatkan <strong className="text-neutral-900 dark:text-white">Sandbox Merchant</strong>, <strong className="text-neutral-900 dark:text-white">Server Key</strong>, dan <strong className="text-neutral-900 dark:text-white">Client Key</strong> siap pakai untuk testing.
                </div>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Nama Lengkap / Bisnis
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="cth. PT Kilex Niaga / Budi Santoso"
                                        className="pl-10 h-10 text-xs sm:text-sm rounded-xl border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/80 focus:border-blue-500"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="nama@domain.com"
                                        className="pl-10 h-10 text-xs sm:text-sm rounded-xl border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/80 focus:border-blue-500"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minimal 8 karakter"
                                    passwordrules={passwordRules}
                                    className="h-10 text-xs sm:text-sm rounded-xl border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/80 focus:border-blue-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Konfirmasi Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi kata sandi"
                                    passwordrules={passwordRules}
                                    className="h-10 text-xs sm:text-sm rounded-xl border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/80 focus:border-blue-500"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-10 mt-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                tabIndex={5}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner />
                                        <span>Membuat Akun Sandbox...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Daftar Akun Merchant</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Sign in link */}
                        <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                            Sudah memiliki akun?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Masuk di sini
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Daftar Akun Merchant',
    description: 'Mulai simulasi dan integrasi Midtrans dalam hitungan detik',
};
