import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Package, CreditCard, MapPin, Clock, CheckCircle, XCircle, AlertTriangle, X, Printer } from 'lucide-react';
import { useState } from 'react';

type Product = { id: number; name: string; image_path: string | null; category: { icon: string | null } };
type Size = { size: string };
type ReservationItem = { id: number; quantity: number; unit_price: string; subtotal: string; product: Product; productSize: Size };
type QueueEntry = { queue_position: number; status: string };
type Payment = { id: number; amount: string; payment_method: string; payment_date: string; receipt_number: string };
type Reservation = {
    id: number; reference_code: string; reservation_status: string; payment_status: string;
    total_amount: string; queue_number: number; notes: string | null;
    ready_at: string | null; claimed_at: string | null; cancelled_at: string | null;
    created_at: string; items: ReservationItem[]; queueEntry: QueueEntry | null; payments: Payment[];
    user?: {
        id: number;
        name: string;
        student_id: string | null;
        email: string;
    };
};

function phpPeso(v: number | string) { return '₱' + Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 }); }

const STATUS_STEPS = ['reserved', 'pending_payment', 'paid', 'preparing', 'ready_for_claiming', 'claimed'];
const STEP_LABELS = ['Submitted', 'Awaiting Payment', 'Paid', 'Preparing', 'Ready to Claim', 'Claimed'];

const STATUS_INFO: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    reserved:           { label: 'Pending Approval', cls: 'text-amber-800 bg-amber-50 border-amber-200', icon: <Clock className="w-4 h-4" /> },
    pending_payment:    { label: 'Pending Payment',  cls: 'text-[#8B1028] bg-rose-50 border-rose-200/80', icon: <CreditCard className="w-4 h-4" /> },
    paid:               { label: 'Payment Verified', cls: 'text-blue-700 bg-blue-50 border-blue-200', icon: <CheckCircle className="w-4 h-4" /> },
    preparing:          { label: 'Being Prepared',   cls: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: <Package className="w-4 h-4" /> },
    ready_for_claiming: { label: 'Ready to Claim!',  cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <MapPin className="w-4 h-4" /> },
    claimed:            { label: 'Claimed',           cls: 'text-slate-600 bg-slate-50 border-slate-200', icon: <CheckCircle className="w-4 h-4" /> },
    cancelled:          { label: 'Cancelled',         cls: 'text-slate-500 bg-slate-100 border-slate-200', icon: <XCircle className="w-4 h-4" /> },
};

export default function ReservationShow({
    reservation,
    can_cancel,
}: {
    reservation: Reservation;
    can_cancel?: boolean;
}) {
    const info = STATUS_INFO[reservation.reservation_status] ?? STATUS_INFO.reserved;
    const currentStep = STATUS_STEPS.indexOf(reservation.reservation_status);
    const isCancelled = reservation.reservation_status === 'cancelled';
    const canCancel = (can_cancel ?? ['reserved', 'pending_payment', 'pending', 'approved'].includes(reservation.reservation_status)) && !['claimed', 'cancelled', 'rejected'].includes(reservation.reservation_status);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleConfirmCancel() {
        setIsSubmitting(true);
        router.delete(`/reservations/${reservation.id}`, {
            onFinish: () => {
                setIsSubmitting(false);
                setShowCancelModal(false);
            },
        });
    }

    return (
        <>
            <Head title={`${reservation.reference_code} — UniReserve`} />
            <div className="p-6 max-w-3xl mx-auto space-y-5">
                <Link href="/reservations" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Reservations
                </Link>

                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Reference Code</div>
                            <h1 className="text-2xl font-bold text-gray-900">{reservation.reference_code}</h1>
                            <div className="text-sm text-gray-400 mt-1">
                                Submitted {new Date(reservation.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${info.cls}`}>
                            {info.icon} {info.label}
                        </span>
                    </div>

                    {/* Progress Steps */}
                    {!isCancelled && (
                        <div className="mt-6">
                            <div className="flex items-center gap-0">
                                {STATUS_STEPS.map((step, i) => (
                                    <div key={step} className="flex items-center flex-1 last:flex-none">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${i <= currentStep ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-300'}`}>
                                            {i < currentStep ? '✓' : i + 1}
                                        </div>
                                        {i < STATUS_STEPS.length - 1 && (
                                            <div className={`h-0.5 flex-1 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-100'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-1.5">
                                {STEP_LABELS.map((label, i) => (
                                    <div key={i} className={`text-xs text-center w-7 ${i === currentStep ? 'text-blue-700 font-medium' : 'text-gray-400'}`} style={{ minWidth: 0, flexShrink: 0 }}>
                                        <span className="hidden sm:inline">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {reservation.reservation_status === 'ready_for_claiming' && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 shrink-0" />
                            Your items are ready! Please visit the school office with your reference code to claim.
                        </div>
                    )}
                </div>

                {/* Digital Reservation Slip */}
                {!isCancelled && (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-[#173B8F]/30 shadow-xs p-6 relative overflow-hidden print:border-solid print:border-black">
                        {/* Top Gradient Strip */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#173B8F] via-[#243F96] to-[#8B1028]" />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 p-1 flex items-center justify-center shrink-0">
                                    <img src="/images/beo-logo.png" alt="BEO" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-[#173B8F] tracking-wider">
                                        Davao del Sur State College • Business Enterprise Office
                                    </div>
                                    <h2 className="text-lg font-black text-slate-900">
                                        Digital Reservation Slip
                                    </h2>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print Slip</span>
                                </button>
                                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 border border-slate-200">
                                    {reservation.reference_code}
                                </span>
                            </div>
                        </div>

                        {/* Slip Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100 mb-5 text-xs">
                            <div>
                                <span className="text-slate-400 block mb-0.5">Reservation ID</span>
                                <strong className="font-mono text-slate-900 text-sm">{reservation.reference_code}</strong>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Student Name</span>
                                <strong className="text-slate-900">{reservation.user?.name ?? 'Student'}</strong>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Student ID</span>
                                <strong className="font-mono text-slate-900">{reservation.user?.student_id || '—'}</strong>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Reservation Date</span>
                                <strong className="text-slate-900">
                                    {new Date(reservation.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </strong>
                            </div>
                        </div>

                        {/* Uniform Line Items Table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2.5">Reserved Uniform</th>
                                        <th className="px-4 py-2.5">Size</th>
                                        <th className="px-4 py-2.5 text-center">Quantity</th>
                                        <th className="px-4 py-2.5 text-right">Unit Price</th>
                                        <th className="px-4 py-2.5 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reservation.items.map((it) => (
                                        <tr key={it.id}>
                                            <td className="px-4 py-2.5 font-medium text-slate-900">{it.product.name}</td>
                                            <td className="px-4 py-2.5 font-bold text-slate-700">{it.productSize.size}</td>
                                            <td className="px-4 py-2.5 text-center font-semibold">{it.quantity}</td>
                                            <td className="px-4 py-2.5 text-right text-slate-600">{phpPeso(it.unit_price)}</td>
                                            <td className="px-4 py-2.5 text-right font-bold text-slate-900">{phpPeso(it.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50 border-t border-slate-200">
                                    <tr>
                                        <td colSpan={4} className="px-4 py-3 text-right font-bold text-slate-800 text-xs">Amount Due:</td>
                                        <td className="px-4 py-3 text-right font-black text-blue-700 text-sm">{phpPeso(reservation.total_amount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Prominent Clear Instructions */}
                        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-amber-950">
                                <span>👉 Present this reservation slip to the School Cashier for payment.</span>
                            </div>
                            <p className="text-amber-800 text-[11px] leading-relaxed">
                                <strong>Note:</strong> The Reservation Slip is NOT an official receipt. It is only proof that the reservation was approved and is ready for payment processing. Once payment is settled, the School Cashier will issue your Official Receipt (OR) to present back to the BEO Staff for verification and uniform release.
                            </p>
                        </div>
                    </div>
                )}

                {/* Queue Info */}
                {reservation.queueEntry && !isCancelled && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-800 mb-3">Queue Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-black text-blue-700">#{reservation.queue_number}</div>
                                <div className="text-xs text-blue-600">Queue Number</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-lg font-semibold text-gray-700 capitalize">{reservation.queueEntry.status}</div>
                                <div className="text-xs text-gray-500">Queue Status</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Items */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <h2 className="font-semibold text-gray-800">Reserved Items ({reservation.items.length})</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {reservation.items.map(item => (
                            <div key={item.id} className="flex items-center px-5 py-3 gap-3">
                                <div className="text-2xl">{item.product?.category?.icon ?? '👔'}</div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 text-sm">{item.product?.name ?? 'Uniform Item'}</div>
                                    <div className="text-xs text-gray-400">{item.productSize?.size ?? 'Standard'} × {item.quantity} @ {phpPeso(item.unit_price)}</div>
                                </div>
                                <div className="font-semibold text-gray-900">{phpPeso(item.subtotal)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <span className="font-bold text-gray-800">Total Amount</span>
                        <span className="font-black text-xl text-blue-700">{phpPeso(reservation.total_amount)}</span>
                    </div>
                </div>

                {/* Payments */}
                {reservation.payments.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50">
                            <h2 className="font-semibold text-gray-800">Payment Records</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {reservation.payments.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Receipt #{p.receipt_number}</div>
                                        <div className="text-xs text-gray-400">{p.payment_method.replace('_', ' ')} · {new Date(p.payment_date).toLocaleDateString('en-PH')}</div>
                                    </div>
                                    <span className="font-semibold text-green-700">{phpPeso(p.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cancelled Status Notice */}
                {isCancelled && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold text-slate-900">Reservation Cancelled</div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                This reservation was cancelled{reservation.cancelled_at ? ` on ${new Date(reservation.cancelled_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}. Any reserved items and queue entries were returned to inventory.
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {canCancel && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowCancelModal(true)}
                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#8B1028] text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <XCircle className="w-4 h-4 text-[#8B1028]" />
                            <span>Cancel Reservation</span>
                        </button>
                    </div>
                )}

                {reservation.notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        <p className="font-semibold mb-1">Staff Note:</p>
                        <p>{reservation.notes}</p>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showCancelModal && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cancel-modal-title"
                >
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-[#8B1028]">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={isSubmitting}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <h2 id="cancel-modal-title" className="text-lg font-bold text-slate-900">
                                Cancel Reservation?
                            </h2>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                Are you sure you want to cancel reservation{' '}
                                <strong className="font-mono text-slate-900">
                                    {reservation.reference_code}
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
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
                            >
                                Keep Reservation
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleConfirmCancel}
                                className="px-4 py-2 bg-[#8B1028] hover:bg-[#641522] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
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

ReservationShow.layout = { breadcrumbs: [{ title: 'My Reservations', href: '/reservations' }, { title: 'Detail', href: '#' }] };
