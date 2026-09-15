import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, CreditCard, LoaderCircle, ShieldCheck } from 'lucide-react';

interface Props {
    session: {
        id: string;
        amount_total: number;
        currency: string;
        payment_status: string;
        status: string;
        merchant_name: string;
    };
}

export default function StripeCheckout({ session }: Props) {
    const [processing, setProcessing] = useState(false);
    const [paid, setPaid] = useState(session.payment_status === 'paid');

    const completePayment = async () => {
        setProcessing(true);
        const response = await fetch(`/stripe/checkout/${session.id}/complete`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
            },
        });
        if (response.ok) setPaid(true);
        setProcessing(false);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
            <Head title={`Checkout - ${session.merchant_name}`} />
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-indigo-600 text-white p-6">
                    <div className="text-sm opacity-80">Stripe Test Mode</div>
                    <h1 className="text-xl font-semibold mt-1">{session.merchant_name}</h1>
                </div>
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="text-sm text-slate-500">Total pembayaran</div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(session.amount_total / 100)}
                        </div>
                    </div>
                    {paid ? (
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center">
                            <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
                            <div className="font-semibold text-emerald-600 mt-2">Payment successful</div>
                            <div className="text-xs text-slate-500 mt-1">Stripe webhook payment_intent.succeeded telah dijadwalkan.</div>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
                                <CreditCard className="size-5 text-indigo-500" />
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white">Test card</div>
                                    <div className="text-xs text-slate-500">4242 4242 4242 4242 · any future expiry · any CVC</div>
                                </div>
                            </div>
                            <button onClick={completePayment} disabled={processing} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                                {processing ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                                Pay with test card
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
