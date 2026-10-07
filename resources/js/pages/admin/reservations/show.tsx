import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ClipboardList,
    User,
    Calendar,
    Check,
    X,
    PackageCheck,
    Archive,
    CreditCard,
    Clock,
    AlertCircle,
    Printer,
    CheckCircle2,
    ShieldAlert,
} from 'lucide-react';

type ReservationItem = {
    id: number;
    quantity: number;
    unit_price: string | number;
    subtotal: string | number;
    product?: {
        name: string;
        gender: string;
    };
    product_size?: {
        size: string;
    };
};

type Payment = {
    id: number;
    receipt_number: string;
    amount: string | number;
    payment_method: string;
    payment_date: string;
    reference_number: string | null;
};

type Reservation = {
    id: number;
    reference_code: string;
    total_amount: string | number;
    payment_status: string;
    reservation_status: string;
    queue_number: number;
    created_at: string;
    ready_at: string | null;
    claimed_at: string | null;
    cancelled_at: string | null;
    notes: string | null;
    user?: {
        id: number;
        name: string;
        email: string;
        student_id: string | null;
        phone: string | null;
        course_program: string | null;
        year_level: string | null;
    };
    items?: ReservationItem[];
    payments?: Payment[];
    queue_entry?: {
        queue_position: number;
        status: string;
    };
};

const STATUS_MAP: Record<string, { label: string; badgeCls: string }> = {
    reserved: { label: 'Pending Approval', badgeCls: 'bg-amber-50 text-amber-700 border-amber-200' },
    pending_payment: { label: 'Pending Payment', badgeCls: 'bg-orange-50 text-orange-700 border-orange-200' },
    paid: { label: 'Paid & Confirmed', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200' },
    preparing: { label: 'Preparing Items', badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ready_for_claiming: { label: 'Ready for Claiming', badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    claimed: { label: 'Claimed / Released', badgeCls: 'bg-gray-100 text-gray-700 border-gray-200' },
    cancelled: { label: 'Cancelled / Rejected', badgeCls: 'bg-red-50 text-red-700 border-red-200' },
};

export default function AdminReservationShow({ reservation }: { reservation: Reservation }) {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = () => {
        if (confirm('Approve this reservation? The student will be instructed to proceed with payment.')) {
            router.post(`/admin/reservations/${reservation.id}/approve`);
        }
    };

    const handleMarkReady = () => {
        if (confirm('Mark this reservation as ready for claiming?')) {
            router.post(`/admin/reservations/${reservation.id}/ready`);
        }
    };

    const handleMarkClaimed = () => {
        if (confirm('Mark this reservation as claimed and release inventory?')) {
            router.post(`/admin/reservations/${reservation.id}/claim`);
        }
    };

    const submitReject = () => {
        setIsSubmitting(true);
        router.post(
            `/admin/reservations/${reservation.id}/reject`,
            { reason: rejectReason },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowRejectModal(false);
                },
            }
        );
    };

    const statusInfo = STATUS_MAP[reservation.reservation_status] || {
        label: reservation.reservation_status,
        badgeCls: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <>
            <Head title={`Reservation ${reservation.reference_code} — UniReserve Admin`} />
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
                {/* Header Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <Link
                        href="/admin/reservations"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Reservations List
                    </Link>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                        >
                            <Printer className="w-4 h-4" /> Print Slip
                        </button>

                        {/* Decision Buttons */}
                        {reservation.reservation_status === 'reserved' && (
                            <>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" /> Reject Order
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                                >
                                    <Check className="w-4 h-4" /> Approve Order
                                </button>
                            </>
                        )}

                        {(reservation.reservation_status === 'paid' || reservation.reservation_status === 'preparing') && (
                            <button
                                onClick={handleMarkReady}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                            >
                                <PackageCheck className="w-4 h-4" /> Mark Ready for Claiming
                            </button>
                        )}

                        {reservation.reservation_status === 'ready_for_claiming' && (
                            <button
                                onClick={handleMarkClaimed}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                            >
                                <Archive className="w-4 h-4" /> Confirm Claimed & Release
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    {/* Top Order Title Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">
                                    {reservation.reference_code}
                                </h1>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeCls}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                Placed on {new Date(reservation.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-left sm:text-right">
                                <div className="text-xs text-gray-400">Assigned Queue No.</div>
                                <div className="text-2xl font-black text-blue-700 font-mono">
                                    #{reservation.queue_number}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Info & Timeline Grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Student Details */}
                        <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100 space-y-3">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-blue-600" /> Student Information
                            </h2>

                            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div>
                                    <span className="text-gray-400 block text-xs">Full Name</span>
                                    <span className="font-semibold text-gray-800">{reservation.user?.name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs">Student ID</span>
                                    <span className="font-mono font-medium text-gray-800">{reservation.user?.student_id || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs">Course & Program</span>
                                    <span className="font-medium text-gray-800">{reservation.user?.course_program || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs">Year Level</span>
                                    <span className="font-medium text-gray-800">{reservation.user?.year_level || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs">Email</span>
                                    <span className="font-medium text-gray-800">{reservation.user?.email || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs">Phone</span>
                                    <span className="font-medium text-gray-800">{reservation.user?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Fulfillment Status & History */}
                        <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100 space-y-3">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-600" /> Fulfillment Timeline
                            </h2>

                            <div className="space-y-2.5 text-xs sm:text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Payment Status:</span>
                                    <span className={`font-semibold capitalize px-2 py-0.5 rounded text-xs border ${
                                        reservation.payment_status === 'paid'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {reservation.payment_status}
                                    </span>
                                </div>

                                {reservation.ready_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Marked Ready:</span>
                                        <span className="font-medium text-gray-800">
                                            {new Date(reservation.ready_at).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                )}

                                {reservation.claimed_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Claimed & Released:</span>
                                        <span className="font-medium text-emerald-700">
                                            {new Date(reservation.claimed_at).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                )}

                                {reservation.notes && (
                                    <div className="pt-2 border-t border-gray-200">
                                        <span className="text-xs text-gray-400 block">Remarks / Notes:</span>
                                        <p className="text-xs text-gray-700 mt-0.5 italic">{reservation.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Reserved Items ({(reservation.items || []).length})
                        </h2>

                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200 font-semibold">
                                    <tr>
                                        <th className="py-2.5 px-4">Item Name</th>
                                        <th className="py-2.5 px-4">Size</th>
                                        <th className="py-2.5 px-4 text-center">Quantity</th>
                                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(reservation.items || []).map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                            <td className="py-3 px-4 font-medium text-gray-900">
                                                {item.product?.name || 'Item'}
                                                {item.product?.gender && item.product.gender !== 'unisex' && (
                                                    <span className="ml-1 text-xs text-gray-400 capitalize">
                                                        ({item.product.gender})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold">
                                                    {item.product_size?.size || 'Standard'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center font-semibold text-gray-800">
                                                {item.quantity}
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-600">
                                                ₱{Number(item.unit_price).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-gray-900">
                                                ₱{Number(item.subtotal).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                                    <tr>
                                        <td colSpan={4} className="py-3 px-4 text-right text-gray-700">
                                            Total Amount Due:
                                        </td>
                                        <td className="py-3 px-4 text-right text-blue-700 text-base font-mono">
                                            ₱{Number(reservation.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Payments History */}
                    {(reservation.payments || []).length > 0 && (
                        <div className="space-y-3 pt-2">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Linked Cashier Payments
                            </h2>
                            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                                {reservation.payments!.map((p) => (
                                    <div key={p.id} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                                        <div>
                                            <div className="font-bold text-gray-900 font-mono">Receipt #{p.receipt_number}</div>
                                            <div className="text-gray-400 text-xs">
                                                Paid via {p.payment_method} on {new Date(p.payment_date).toLocaleDateString('en-PH')}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-emerald-600">
                                                ₱{Number(p.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </div>
                                            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                Verified
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Reject Dialog */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">Reject Reservation</h3>
                                    <p className="text-xs text-gray-500">Provide an explanation for the rejection</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Reason for rejection (will be sent to student)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                    placeholder="Enter reason..."
                                    className="w-full p-3 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={submitReject}
                                    className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
