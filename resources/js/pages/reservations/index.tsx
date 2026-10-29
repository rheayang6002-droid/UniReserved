import { Head, Link, router } from '@inertiajs/react';
import {
    ClipboardList,
    ChevronRight,
    AlertTriangle,
    X,
    Eye,
    XCircle,
    Package,
    CreditCard,
    MapPin,
    Clock,
    CheckCircle,
    Printer,
} from 'lucide-react';
import { useState, useEffect } from 'react';

type ReservationItemDetail = {
    id: number;
    product_name: string;
    category: string;
    category_icon?: string | null;
    size: string;
    quantity: number;
    unit_price: string | number;
    subtotal: string | number;
};

type PaymentDetail = {
    id: number;
    amount: string | number;
    payment_method: string;
    receipt_number: string;
    payment_date: string | null;
};

type Reservation = {
    id: number;
    reference_code: string;
    reservation_status: string;
    payment_status: string;
    total_amount: string;
    queue_number: number;
    queue_position?: number;
    queue_status?: string;
    can_cancel?: boolean;
    created_at: string;
    ready_at?: string | null;
    claimed_at?: string | null;
    cancelled_at?: string | null;
    notes?: string | null;
    items_count: number;
    items?: ReservationItemDetail[];
    payments?: PaymentDetail[];
};

type PaginatedReservations = {
    data: Reservation[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

function formatPeso(amount: number | string) {
    return '₱' + Number(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function StatusBadge({ label, cls }: { label: string; cls: string }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${cls}`}>
            {label}
        </span>
    );
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    reserved:           { label: 'Pending Approval', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
    pending_payment:    { label: 'Pending Payment',  cls: 'bg-rose-50 text-[#8B1028] border-rose-200/80' },
    paid:               { label: 'Paid',             cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    preparing:          { label: 'Preparing',        cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ready_for_claiming: { label: 'Ready to Claim',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    claimed:            { label: 'Claimed',          cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    cancelled:          { label: 'Cancelled',        cls: 'bg-slate-100 text-slate-500 border-slate-200 line-through' },
};

const FILTER_TABS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'reserved' },
    { label: 'Payment Due', value: 'pending_payment' },
    { label: 'Ready', value: 'ready_for_claiming' },
    { label: 'Claimed', value: 'claimed' },
    { label: 'Cancelled', value: 'cancelled' },
];

export default function ReservationsIndex({
    reservations,
    filters,
}: {
    reservations: PaginatedReservations;
    filters: { status?: string };
}) {
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [cancellingRes, setCancellingRes] = useState<Reservation | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                if (selectedReservation) setSelectedReservation(null);
                if (cancellingRes) setCancellingRes(null);
            }
        }

        if (selectedReservation || cancellingRes) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedReservation, cancellingRes]);

    function setFilter(status: string) {
        router.get('/reservations', status ? { status } : {}, { preserveScroll: true });
    }

    function confirmCancel() {
        if (!cancellingRes) return;
        setIsSubmitting(true);
        router.delete(`/reservations/${cancellingRes.id}`, {
            onFinish: () => {
                setIsSubmitting(false);
                setCancellingRes(null);
            },
        });
    }

    return (
        <>
            <Head title="My Reservations — UniReserve" />
            <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-[#123B8F]" />
                            <span>My Reservations</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            Manage and track your campus uniform reservations ({reservations.total} total)
                        </p>
                    </div>
                    <Link
                        href="/items"
                        className="px-4 py-2.5 bg-[#123B8F] hover:bg-[#0e2f73] text-white rounded-xl text-sm font-semibold transition-all shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <span>+ New Reservation</span>
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                (filters.status ?? '') === tab.value
                                    ? 'bg-white text-[#123B8F] shadow-xs font-semibold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Reservations List */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    {reservations.data.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#123B8F]" />
                            <p className="font-semibold text-slate-700">No reservations found</p>
                            <p className="text-xs text-slate-400 mt-1">
                                You do not have any reservations matching this filter.
                            </p>
                            <Link
                                href="/items"
                                className="mt-3 inline-block text-xs font-bold text-[#123B8F] hover:underline"
                            >
                                Browse uniforms &amp; items →
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {reservations.data.map((res) => {
                                const s = STATUS_MAP[res.reservation_status] ?? {
                                    label: res.reservation_status,
                                    cls: 'bg-slate-50 text-slate-600 border-slate-200',
                                };
                                const isEligible = Boolean(res.can_cancel);

                                return (
                                    <div
                                        key={res.id}
                                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                                    >
                                        {/* Left: ID, items, date, queue */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                                <ClipboardList className="w-5 h-5 text-[#123B8F]" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono font-bold text-slate-900 text-sm sm:text-base tracking-wide">
                                                        {res.reference_code}
                                                    </span>
                                                    <StatusBadge {...s} />
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                    <span className="font-medium text-slate-700">
                                                        {res.items_count} Item{res.items_count !== 1 ? 's' : ''}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(res.created_at).toLocaleDateString('en-PH', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="inline-flex items-center gap-1 font-semibold text-[#123B8F]">
                                                        Queue #{res.queue_position ?? res.queue_number}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Amount & Actions */}
                                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                            <div className="text-left md:text-right">
                                                <div className="text-base sm:text-lg font-extrabold text-slate-900">
                                                    ₱{Number(res.total_amount).toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </div>
                                                <div className="text-[11px] text-slate-400 capitalize">
                                                    Payment: {res.payment_status.replace('_', ' ')}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedReservation(res)}
                                                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-[#123B8F] text-xs font-semibold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View Details</span>
                                                </button>

                                                {/* Cancel action only shown when eligible */}
                                                {isEligible && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCancellingRes(res)}
                                                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#8B1028] text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5 text-[#8B1028]" />
                                                        <span>Cancel Reservation</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {reservations.links.length > 3 && (
                    <div className="flex justify-center gap-1">
                        {reservations.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-all ${
                                    link.active
                                        ? 'bg-[#123B8F] text-white border-[#123B8F] font-semibold'
                                        : link.url
                                        ? 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                                        : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Reservation Details Modal */}
            {selectedReservation && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="reservation-details-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedReservation(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
                        {/* Top decorative gradient strip */}
                        <div className="h-1.5 bg-gradient-to-r from-[#123B8F] via-[#243F96] to-[#8B1028]" />

                        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(90vh-1.5rem)] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <ClipboardList className="w-5 h-5 text-[#123B8F]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 id="reservation-details-title" className="text-lg font-bold text-slate-900">
                                                Reservation Details
                                            </h2>
                                            <StatusBadge
                                                {...(STATUS_MAP[selectedReservation.reservation_status] ?? {
                                                    label: selectedReservation.reservation_status,
                                                    cls: 'bg-slate-50 text-slate-600 border-slate-200',
                                                })}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Reference Code:{' '}
                                            <span className="font-mono font-bold text-slate-900">
                                                {selectedReservation.reference_code}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedReservation(null)}
                                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                    aria-label="Close details"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Section 1: Reservation Overview Info */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Reservation Information
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs">
                                    <div>
                                        <div className="text-slate-400">Reservation #</div>
                                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                                            {selectedReservation.reference_code}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Date Reserved</div>
                                        <div className="font-medium text-slate-800 mt-0.5">
                                            {new Date(selectedReservation.created_at).toLocaleDateString('en-PH', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Queue Position</div>
                                        <div className="font-bold text-[#123B8F] mt-0.5">
                                            Queue #{selectedReservation.queue_position ?? selectedReservation.queue_number}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Total Items</div>
                                        <div className="font-bold text-slate-900 mt-0.5">
                                            {selectedReservation.items?.reduce((sum, i) => sum + i.quantity, 0) ?? selectedReservation.items_count} item(s)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Reserved Items */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5 text-[#123B8F]" />
                                        <span>Reserved Items ({selectedReservation.items?.length ?? selectedReservation.items_count})</span>
                                    </h3>
                                    <span className="text-[11px] text-slate-400">
                                        {selectedReservation.items?.reduce((sum, it) => sum + it.quantity, 0) ?? selectedReservation.items_count} pcs total
                                    </span>
                                </div>
                                <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                                            <tr>
                                                <th className="px-3.5 py-2.5">Item</th>
                                                <th className="px-3.5 py-2.5 hidden sm:table-cell">Category</th>
                                                <th className="px-3.5 py-2.5">Size</th>
                                                <th className="px-3.5 py-2.5 text-center">Qty</th>
                                                <th className="px-3.5 py-2.5 text-right hidden sm:table-cell">Unit Price</th>
                                                <th className="px-3.5 py-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedReservation.items && selectedReservation.items.length > 0 ? (
                                                selectedReservation.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                                        <td className="px-3.5 py-2.5">
                                                            <div className="font-semibold text-slate-900">{item.product_name}</div>
                                                            <div className="text-[10px] text-slate-400 sm:hidden">
                                                                {item.category} · @ {formatPeso(item.unit_price)}
                                                            </div>
                                                        </td>
                                                        <td className="px-3.5 py-2.5 text-slate-600 hidden sm:table-cell">
                                                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                                                                <span>{item.category_icon || '👔'}</span>
                                                                <span>{item.category}</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-3.5 py-2.5 font-bold text-slate-700">
                                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                                                {item.size}
                                                            </span>
                                                        </td>
                                                        <td className="px-3.5 py-2.5 text-center font-medium text-slate-800">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-3.5 py-2.5 text-right text-slate-600 hidden sm:table-cell">
                                                            {formatPeso(item.unit_price)}
                                                        </td>
                                                        <td className="px-3.5 py-2.5 font-bold text-slate-900 text-right">
                                                            {formatPeso(item.subtotal)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-3 text-center text-slate-400 italic">
                                                        {selectedReservation.items_count} item(s) reserved
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-slate-50/80 border-t border-slate-200 text-xs font-semibold">
                                            <tr>
                                                <td colSpan={3} className="px-3.5 py-2.5 text-slate-600 sm:table-cell hidden">
                                                    Total Amount
                                                </td>
                                                <td colSpan={2} className="px-3.5 py-2.5 text-slate-600 sm:hidden">
                                                    Total Amount
                                                </td>
                                                <td className="px-3.5 py-2.5 text-center text-slate-800 sm:table-cell hidden">
                                                    {selectedReservation.items?.reduce((sum, it) => sum + it.quantity, 0) ?? selectedReservation.items_count}
                                                </td>
                                                <td className="hidden sm:table-cell"></td>
                                                <td className="px-3.5 py-2.5 font-extrabold text-[#123B8F] text-right text-sm">
                                                    {formatPeso(selectedReservation.total_amount)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Section 3: Payment Information */}
                            <div className="space-y-2.5">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-[#123B8F]" />
                                    <span>Payment Information</span>
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                                        <div>
                                            <div className="text-xs text-slate-500">Payment Status</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${
                                                        selectedReservation.payment_status === 'paid'
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                            : 'bg-rose-50 text-[#8B1028] border-rose-200'
                                                    }`}
                                                >
                                                    {selectedReservation.payment_status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="sm:text-right">
                                            <div className="text-xs text-slate-500">Total Amount Due</div>
                                            <div className="text-lg font-black text-slate-900 mt-0.5">
                                                {formatPeso(selectedReservation.total_amount)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Existing Payment Records if any */}
                                    {selectedReservation.payments && selectedReservation.payments.length > 0 ? (
                                        <div className="space-y-2 pt-1">
                                            <div className="text-[11px] font-bold text-slate-600 uppercase">Payment Record</div>
                                            {selectedReservation.payments.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="bg-white p-2.5 rounded-lg border border-slate-200/70 flex items-center justify-between text-xs"
                                                >
                                                    <div>
                                                        <span className="font-mono font-bold text-slate-900">
                                                            Official Receipt: {p.receipt_number}
                                                        </span>
                                                        <div className="text-[11px] text-slate-500 capitalize">
                                                            Method: {p.payment_method.replace('_', ' ')}
                                                            {p.payment_date
                                                                ? ` · ${new Date(p.payment_date).toLocaleDateString('en-PH')}`
                                                                : ''}
                                                        </div>
                                                    </div>
                                                    <span className="font-extrabold text-emerald-700">
                                                        {formatPeso(p.amount)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        selectedReservation.payment_status !== 'paid' && (
                                            <div className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-lg flex items-start gap-2">
                                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                <span>
                                                    Please present reference code{' '}
                                                    <strong className="font-mono font-bold text-slate-900">
                                                        {selectedReservation.reference_code}
                                                    </strong>{' '}
                                                    to the School Cashier to settle payment.
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Section 4: Queue & Pickup Status */}
                            <div className="space-y-2.5">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#123B8F]" />
                                    <span>Queue &amp; Pickup Status</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#123B8F] text-white flex items-center justify-center font-black text-sm shrink-0">
                                            #{selectedReservation.queue_position ?? selectedReservation.queue_number}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-blue-900">Queue Ticket</div>
                                            <div className="text-xs text-blue-700 capitalize">
                                                Status: <strong className="font-semibold">{selectedReservation.queue_status ?? 'Waiting'}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                                            <Clock className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-slate-600">Current Status</div>
                                            <div className="text-xs font-bold text-slate-800">
                                                {STATUS_MAP[selectedReservation.reservation_status]?.label ?? selectedReservation.reservation_status}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contextual Status Alerts */}
                                {selectedReservation.reservation_status === 'ready_for_claiming' && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-emerald-950">Items Ready to Claim!</div>
                                            <div>
                                                Your uniform package is ready. Please visit the Business Enterprise Office (BEO) with reference code{' '}
                                                <strong className="font-mono">{selectedReservation.reference_code}</strong>.
                                                {selectedReservation.ready_at &&
                                                    ` Marked ready on ${new Date(selectedReservation.ready_at).toLocaleDateString('en-PH', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}.`}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedReservation.reservation_status === 'claimed' && (
                                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
                                        <CheckCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-slate-900">Uniform Claimed</div>
                                            <div>
                                                This reservation has been successfully claimed and completed.
                                                {selectedReservation.claimed_at &&
                                                    ` Claimed on ${new Date(selectedReservation.claimed_at).toLocaleDateString('en-PH', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}.`}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedReservation.reservation_status === 'cancelled' && (
                                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                                        <XCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-slate-800">Reservation Cancelled</div>
                                            <div>
                                                This reservation was cancelled.
                                                {selectedReservation.cancelled_at &&
                                                    ` Cancelled on ${new Date(selectedReservation.cancelled_at).toLocaleDateString('en-PH', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}.`}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedReservation.reservation_status === 'preparing' && (
                                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-start gap-2.5">
                                        <Package className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-indigo-950">Preparation in Progress</div>
                                            <div>Our BEO staff is preparing and sorting your uniform items. You will be notified once ready for claiming.</div>
                                        </div>
                                    </div>
                                )}

                                {selectedReservation.notes && (
                                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <span className="font-bold text-slate-700">Notes:</span> {selectedReservation.notes}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                <Link
                                    href={`/reservations/${selectedReservation.id}`}
                                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#123B8F] hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Print / Digital Slip</span>
                                </Link>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    {selectedReservation.can_cancel && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const resToCancel = selectedReservation;
                                                setSelectedReservation(null);
                                                setCancellingRes(resToCancel);
                                            }}
                                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#8B1028] text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                                        >
                                            <XCircle className="w-3.5 h-3.5 text-[#8B1028]" />
                                            <span>Cancel Reservation</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedReservation(null)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {cancellingRes && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-[#8B1028]">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => setCancellingRes(null)}
                                disabled={isSubmitting}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <h2 id="modal-title" className="text-lg font-bold text-slate-900">
                                Cancel Reservation?
                            </h2>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                Are you sure you want to cancel reservation{' '}
                                <strong className="font-mono text-slate-900">
                                    {cancellingRes.reference_code}
                                </strong>
                                ?
                            </p>
                        </div>

                        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                                This action cannot be undone. Your reserved stock will be returned to inventory and your queue ticket will be released.
                            </span>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setCancellingRes(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                                Keep Reservation
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={confirmCancel}
                                className="px-4 py-2 bg-[#8B1028] hover:bg-[#641522] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>{isSubmitting ? 'Cancelling...' : 'Cancel Reservation'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

ReservationsIndex.layout = { breadcrumbs: [{ title: 'My Reservations', href: '/reservations' }] };
