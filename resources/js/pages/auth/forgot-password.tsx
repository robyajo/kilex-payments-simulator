import { Form, Head } from '@inertiajs/react';
import { Mail, ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa Kata Sandi - Kilex Payments Simulator" />

            {status && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <Form {...email.form()} className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        autoFocus
                                        placeholder="nama@perusahaan.com"
                                        className="pl-10 h-10 text-xs sm:text-sm rounded-xl border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/80 focus:border-blue-500"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 mt-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner />
                                        <span>Mengirim tautan...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Kirim Tautan Reset Password</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                            Ingat kata sandi Anda?{' '}
                            <TextLink
                                href={login()}
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Kembali ke halaman login
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Kata Sandi',
    description: 'Masukkan email akun Anda untuk menerima tautan reset kata sandi',
};
