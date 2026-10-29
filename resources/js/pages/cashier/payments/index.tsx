import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CreditCard,
    Search,
    Clock,
    CheckCircle2,
    Receipt,
    Eye,
    TrendingUp,
    FileCheck,
    X,
    AlertCircle,
    User,
    Calendar,
    ArrowRight,
} from 'lucide-react';

type ReservationItem = {
    id: number;
    product_name: string;
    size: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
};

type ReservationRecord = {
    id: number;
    reference_code: string;
    student_name: string;
    student_id: string;
    student_email: string;
    course_program: string;
    year_level: string;
    reservation_date: string;
    total_amount: number;
    reservation_status: string;
    payment_status: string;
    items: ReservationItem[];
};

type Props = {
    reservations: {
        data: ReservationRecord[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        search?: string;
    };
    next_receipt_number: string;
    stats: {
        pending_count: number;
        today_recorded: number;
        today_collections: number;
        total_receipts: number;
    };
};

function formatPeso(amount: number | string) {
    return '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CashierPaymentsIndex({
    reservations,
    filters,
    next_receipt_number,
    stats,
}: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');

    // Modal states
    const [viewReservation, setViewReservation] = useState<ReservationRecord | null>(null);
    const [paymentModalReservation, setPaymentModalReservation] = useState<ReservationRecord | null>(null);

    // Payment Form state
    const [receiptNumber, setReceiptNumber] = useState(next_receipt_number || '');
    const [paymentAmount, setPaymentAmount] = useState<number | string>('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'bank_transfer'>('cash');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/cashier/payments',
            { search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    const openRecordPaymentModal = (reservation: ReservationRecord) => {
        setPaymentModalReservation(reservation);
        setPaymentAmount(reservation.total_amount);
        setReceiptNumber(next_receipt_number || `OR-${new Date().getFullYear()}-${String(reservation.id).padStart(5, '0')}`);
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('cash');
        setNotes('');
        setErrorMessage(null);
    };

    const handleConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentModalReservation) return;

        if (!receiptNumber.trim()) {
            setErrorMessage('Please enter an Official Receipt Number.');
            return;
        }

        const amt = Number(paymentAmount);
        if (isNaN(amt) || amt <= 0) {
            setErrorMessage('Please enter a valid payment amount.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        router.post(
            `/cashier/payments/${paymentModalReservation.id}/record`,
            {
                receipt_number: receiptNumber.trim(),
                amount: amt,
                payment_method: paymentMethod,
                payment_date: paymentDate,
                notes: notes.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    setPaymentModalReservation(null);
                    setViewReservation(null);
                },
                onError: (errs) => {
                    setIsSubmitting(false);
                    const firstErr = Object.values(errs)[0];
                    setErrorMessage(typeof firstErr === 'string' ? firstErr : 'Failed to record payment. Please try again.');
                },
            }
        );
    };

    return (
        <>
            <Head title="Payments & Collections — School Cashier" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Header Banner - Royal Blue to Deep Maroon Accent */}
                <div className="rounded-2xl bg-gradient-to-r from-[#173B8F] via-[#243F96] to-[#8B1028] p-6 text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 bg-white/15 text-white text-[10px] font-bold rounded-md tracking-wider uppercase border border-white/20">
                                    School Cashier Desk
                                </span>
                                <span className="text-blue-100 text-xs font-medium">
                                    Davao del Sur State College • Business Enterprise Office
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Payments &amp; Collections
                            </h1>
                            <p className="text-blue-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
                                Verify student uniform reservation slips, collect campus payments, and issue Official Receipts (OR).
                            </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-3">
                            <div className="px-4 py-2.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 text-xs text-white flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-emerald-300" />
                                <span>Next OR: <strong>{next_receipt_number}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Success Message with Clear Next Step */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-3 text-xs sm:text-sm text-emerald-900 shadow-2xs">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold text-emerald-950">Payment Recorded Successfully!</div>
                                <div className="mt-0.5 text-emerald-800">{flash.success}</div>
                                <div className="mt-1.5 text-xs text-emerald-700 font-medium">
                                    Reminder: The student should now return to the Business Enterprise Office (BEO) to present their Official Receipt for payment verification and uniform release.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cashier Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-700" />
                            </div>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                                Pending
                            </span>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                {stats?.pending_count ?? 0}
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                                Pending Payments
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                Reservations awaiting cashier collection
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Receipt className="w-5 h-5 text-[#173B8F]" />
                            </div>
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                                Today
                            </span>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                {stats?.today_recorded ?? 0}
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                                Payments Today
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                Receipts issued during this shift
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-emerald-700" />
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                Daily Revenue
                            </span>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
                                {formatPeso(stats?.today_collections ?? 0)}
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                                Total Collections Today
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                Reconciled uniform receipts
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-rose-200/80 p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                                <FileCheck className="w-5 h-5 text-[#8B1028]" />
                            </div>
                            <span className="text-[11px] font-bold text-[#8B1028] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                                Total Issued
                            </span>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                {stats?.total_receipts ?? 0}
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                                Receipts Issued
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                All-time official receipts logged
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prominent Section: Pending Payments */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-600" />
                                Pending Payments
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Reservations submitted or approved by BEO Staff that are awaiting student payment at the Cashier window.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search Reservation ID or Student..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-3.5 py-2 bg-[#173B8F] hover:bg-[#243F96] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Reservation ID</th>
                                    <th className="px-5 py-3.5">Student Details</th>
                                    <th className="px-5 py-3.5">Student ID</th>
                                    <th className="px-5 py-3.5">Reservation Date</th>
                                    <th className="px-5 py-3.5">Amount Due</th>
                                    <th className="px-5 py-3.5">Payment Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reservations.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                            <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                            <p className="font-semibold text-slate-700">No pending reservations found</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                All reservations have been processed, or match keyword search.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    reservations.data.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4 font-mono font-bold text-slate-900">
                                                {r.reference_code}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900">{r.student_name}</div>
                                                <div className="text-xs text-slate-400">{r.student_email}</div>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs text-slate-600">
                                                {r.student_id || '—'}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500">
                                                {new Date(r.reservation_date).toLocaleDateString('en-PH', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-5 py-4 font-black text-slate-900 text-sm">
                                                {formatPeso(r.total_amount)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                                    Awaiting Payment
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewReservation(r)}
                                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>View</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openRecordPaymentModal(r)}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <CreditCard className="w-3.5 h-3.5" />
                                                        <span>Record Payment</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal 1: Reservation Verification Details */}
            {viewReservation && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-200">
                                    Cashier Verification Desk
                                </span>
                                <h2 className="text-xl font-bold text-slate-900 mt-1">
                                    Reservation Slip: {viewReservation.reference_code}
                                </h2>
                            </div>
                            <button
                                onClick={() => setViewReservation(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Reservation Information */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Reservation Information
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                                <div>
                                    <div className="text-slate-400">Reservation ID</div>
                                    <div className="font-mono font-bold text-slate-900 mt-0.5">{viewReservation.reference_code}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Student Name</div>
                                    <div className="font-bold text-slate-900 mt-0.5">{viewReservation.student_name}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Student ID</div>
                                    <div className="font-mono font-semibold text-slate-900 mt-0.5">{viewReservation.student_id || '—'}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Program / Year</div>
                                    <div className="font-medium text-slate-800 mt-0.5">{viewReservation.course_program || '—'} ({viewReservation.year_level || '—'})</div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Reservation Date</div>
                                    <div className="font-medium text-slate-800 mt-0.5">
                                        {new Date(viewReservation.reservation_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Amount Due</div>
                                    <div className="font-black text-emerald-700 text-sm mt-0.5">{formatPeso(viewReservation.total_amount)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Reserved Uniform Items */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Uniform Items ({viewReservation.items.length})
                            </h3>
                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-2.5">Uniform</th>
                                            <th className="px-4 py-2.5">Size</th>
                                            <th className="px-4 py-2.5">Quantity</th>
                                            <th className="px-4 py-2.5">Unit Price</th>
                                            <th className="px-4 py-2.5 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {viewReservation.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2.5 font-medium text-slate-900">{item.product_name}</td>
                                                <td className="px-4 py-2.5 font-bold text-slate-600">{item.size}</td>
                                                <td className="px-4 py-2.5">{item.quantity}</td>
                                                <td className="px-4 py-2.5">{formatPeso(item.unit_price)}</td>
                                                <td className="px-4 py-2.5 font-bold text-slate-900 text-right">{formatPeso(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Payment Information
                            </h3>
                            <div className="grid grid-cols-2 gap-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200/70 text-xs">
                                <div>
                                    <div className="text-amber-800 font-semibold">Payment Status</div>
                                    <div className="font-bold text-amber-900 mt-0.5">AWAITING PAYMENT</div>
                                </div>
                                <div>
                                    <div className="text-amber-800 font-semibold">Total Amount Due</div>
                                    <div className="font-black text-amber-950 text-base mt-0.5">{formatPeso(viewReservation.total_amount)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setViewReservation(null)}
                                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const target = viewReservation;
                                    setViewReservation(null);
                                    openRecordPaymentModal(target);
                                }}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>Record Payment</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2: Record Payment Modal/Form */}
            {paymentModalReservation && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase border border-emerald-200">
                                    Official Receipt Issue
                                </span>
                                <h2 className="text-xl font-bold text-slate-900 mt-1">
                                    Record Payment
                                </h2>
                            </div>
                            <button
                                onClick={() => setPaymentModalReservation(null)}
                                disabled={isSubmitting}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleConfirmPayment} className="space-y-4">
                            {/* Read-only reservation info */}
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-slate-400">Reservation ID</span>
                                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                                        {paymentModalReservation.reference_code}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-400">Student Name</span>
                                    <div className="font-bold text-slate-900 mt-0.5 truncate">
                                        {paymentModalReservation.student_name}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-400">Amount Due</span>
                                    <div className="font-black text-slate-900 mt-0.5">
                                        {formatPeso(paymentModalReservation.total_amount)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-400">Items Count</span>
                                    <div className="font-semibold text-slate-900 mt-0.5">
                                        {paymentModalReservation.items.length} Uniform Item(s)
                                    </div>
                                </div>
                            </div>

                            {/* Official Receipt Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Official Receipt (OR) Number *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={receiptNumber}
                                    onChange={(e) => setReceiptNumber(e.target.value)}
                                    placeholder="e.g. OR-2026-00001"
                                    className="w-full px-3.5 py-2 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F]"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Must match the official receipt issued to the student.
                                </p>
                            </div>

                            {/* Payment Amount & Payment Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Payment Amount (₱) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full px-3.5 py-2 font-bold text-slate-900 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Payment Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full px-3.5 py-2 text-slate-900 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F]"
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Payment Method *
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                                    className="w-full px-3.5 py-2 font-medium text-slate-900 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F] cursor-pointer"
                                >
                                    <option value="cash">Cash (On-Campus Cashier Window)</option>
                                    <option value="gcash">GCash (School Merchant)</option>
                                    <option value="bank_transfer">Bank Transfer / Dep Slip</option>
                                </select>
                            </div>

                            {/* Remarks / Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Cashier Remarks / Notes (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Optional cashier notes..."
                                    className="w-full px-3.5 py-2 text-slate-900 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F]"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModalReservation(null)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    {isSubmitting ? 'Recording...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
