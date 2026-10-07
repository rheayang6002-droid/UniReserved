import { Head, Link, router } from '@inertiajs/react';
import {
    CreditCard,
    Receipt,
    CheckCircle2,
    XCircle,
    User,
    Calendar,
    DollarSign,
    Check,
    X,
} from 'lucide-react';

type Payment = {
    id: number;
    amount: string | number;
    payment_method: string;
    reference_number: string | null;
    receipt_number: string;
    payment_date: string;
    notes: string | null;
    reservation?: {
        id: number;
        reference_code: string;
        payment_status: string;
        reservation_status: string;
        user?: {
            name: string;
            student_id: string | null;
            email: string;
        };
    };
};

type PaginatedPayments = {
    data: Payment[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

const METHOD_LABELS: Record<string, { label: string; badgeCls: string }> = {
    cash: { label: 'Cash Counter', badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    gcash: { label: 'GCash', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200' },
    bank_transfer: { label: 'Bank Transfer', badgeCls: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function AdminPaymentsIndex({ payments }: { payments: PaginatedPayments }) {
    const handleVerify = (paymentId: number) => {
        if (confirm('Verify and approve this payment transaction? This will mark the reservation as paid.')) {
            router.post(`/admin/payments/${paymentId}/verify`, {}, { preserveScroll: true });
        }
    };

    const handleReject = (paymentId: number) => {
        if (confirm('Reject this payment? The student will be notified to resubmit.')) {
            router.post(`/admin/payments/${paymentId}/reject`, {}, { preserveScroll: true });
        }
    };

    const totalRevenue = payments.data.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return (
        <>
            <Head title="Payment Transactions — UniReserve Admin" />
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                            Payments & Cashier Records
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Verify cashier payments, check official receipt logs, and track school supplies revenue.
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-medium">Logged Receipts</div>
                            <div className="text-2xl font-bold text-gray-900">{payments.total}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-medium">Total Paid Recorded</div>
                            <div className="text-2xl font-bold text-gray-900 font-mono">
                                ₱{totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-medium">Verification Mode</div>
                            <div className="text-sm font-semibold text-gray-800 mt-0.5">Admin & Cashier Guarded</div>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Transactions Log</h2>
                        <span className="text-xs text-gray-400">{payments.data.length} transactions</span>
                    </div>

                    {payments.data.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 px-4">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-600" />
                            <p className="font-semibold text-gray-700">No payment records logged</p>
                            <p className="text-xs text-gray-400 mt-1">Cashier payments will appear here once recorded.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 text-gray-600 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                                        <th className="py-3 px-4">Receipt #</th>
                                        <th className="py-3 px-4">Student</th>
                                        <th className="py-3 px-4">Reservation Ref</th>
                                        <th className="py-3 px-4">Method</th>
                                        <th className="py-3 px-4">Amount</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.data.map((p) => {
                                        const method = METHOD_LABELS[p.payment_method] || {
                                            label: p.payment_method,
                                            badgeCls: 'bg-gray-100 text-gray-700 border-gray-200',
                                        };
                                        const isPaid = p.reservation?.payment_status === 'paid';

                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                                                    #{p.receipt_number}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-gray-800">
                                                        {p.reservation?.user?.name || 'Student'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {p.reservation?.user?.student_id || p.reservation?.user?.email}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    {p.reservation ? (
                                                        <Link
                                                            href={`/admin/reservations/${p.reservation.id}`}
                                                            className="text-blue-600 hover:underline font-mono font-semibold text-xs"
                                                        >
                                                            {p.reservation.reference_code}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${method.badgeCls}`}>
                                                        {method.label}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                                                    ₱{Number(p.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </td>

                                                <td className="py-3.5 px-4 text-xs text-gray-500">
                                                    {new Date(p.payment_date).toLocaleDateString('en-PH', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {isPaid ? (
                                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleVerify(p.id)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" /> Verify
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(p.id)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                                                >
                                                                    <X className="w-3.5 h-3.5" /> Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
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
