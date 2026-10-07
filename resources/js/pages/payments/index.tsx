import { Head, Link } from '@inertiajs/react';
import { CreditCard, Receipt, Calendar, ArrowUpRight, CheckCircle2, DollarSign } from 'lucide-react';

type Payment = {
    id: number;
    reservation_id: number;
    amount: string | number;
    payment_method: string;
    reference_number: string | null;
    receipt_number: string;
    payment_date: string;
    notes: string | null;
    reservation?: {
        id: number;
        reference_code: string;
        reservation_status: string;
        payment_status: string;
    };
};

type PaginatedPayments = {
    data: Payment[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    current_page: number;
    last_page: number;
};

const METHOD_LABELS: Record<string, { label: string; badgeCls: string }> = {
    cash: { label: 'Cash at Cashier', badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    gcash: { label: 'GCash', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200' },
    bank_transfer: { label: 'Bank Transfer', badgeCls: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function StudentPaymentsIndex({ payments }: { payments: PaginatedPayments }) {
    return (
        <>
            <Head title="Payment History — UniReserve" />
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                            Payment History
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Review your official receipts and verified payments for UniReserve orders.
                        </p>
                    </div>
                    <Link
                        href="/reservations"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                    >
                        View My Reservations
                    </Link>
                </div>

                {/* Total Stats Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-medium">Total Receipts</div>
                            <div className="text-2xl font-bold text-gray-900">{payments.total}</div>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-medium">Total Paid Recorded</div>
                            <div className="text-2xl font-bold text-gray-900">
                                ₱{payments.data.reduce((acc, p) => acc + Number(p.amount || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-medium">Verification Status</div>
                            <div className="text-sm font-semibold text-emerald-600 mt-1">Official & Verified</div>
                        </div>
                    </div>
                </div>

                {/* List of Payments */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Transaction Records</h2>
                        <span className="text-xs text-gray-400">{payments.data.length} records</span>
                    </div>

                    {payments.data.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 px-4">
                            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-600" />
                            <p className="font-medium text-gray-700">No payment records yet</p>
                            <p className="text-xs text-gray-400 mt-1">Payments made at the school cashier will be listed here.</p>
                            <Link href="/items" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">
                                Browse Items to Reserve →
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {payments.data.map((payment) => {
                                const method = METHOD_LABELS[payment.payment_method] || {
                                    label: payment.payment_method,
                                    badgeCls: 'bg-gray-50 text-gray-700 border-gray-200',
                                };
                                return (
                                    <div
                                        key={payment.id}
                                        className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                                <Receipt className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-sm sm:text-base font-mono">
                                                        Receipt #{payment.receipt_number}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${method.badgeCls}`}>
                                                        {method.label}
                                                    </span>
                                                </div>

                                                <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    {payment.reservation && (
                                                        <span>
                                                            Reservation:{' '}
                                                            <Link
                                                                href={`/reservations/${payment.reservation.id}`}
                                                                className="text-blue-600 hover:underline font-semibold"
                                                            >
                                                                {payment.reservation.reference_code}
                                                            </Link>
                                                        </span>
                                                    )}
                                                    {payment.reference_number && (
                                                        <span className="text-gray-400">
                                                            Ref: <span className="font-mono">{payment.reference_number}</span>
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1 text-gray-400">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(payment.payment_date).toLocaleDateString('en-PH', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                            <div className="text-left sm:text-right">
                                                <div className="text-lg sm:text-xl font-bold text-gray-900">
                                                    ₱{Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 sm:justify-end">
                                                    <CheckCircle2 className="w-3 h-3" /> Payment Verified
                                                </div>
                                            </div>

                                            <Link
                                                href={`/payments/${payment.id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
                                            >
                                                Receipt
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {payments.links && payments.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 pt-2 flex-wrap">
                        {payments.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : link.url
                                        ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        : 'text-gray-400 opacity-50 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
