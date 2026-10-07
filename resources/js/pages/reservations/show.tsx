import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Package, CreditCard, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';

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
};

function phpPeso(v: number | string) { return '₱' + Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 }); }

const STATUS_STEPS = ['reserved', 'pending_payment', 'paid', 'preparing', 'ready_for_claiming', 'claimed'];
const STEP_LABELS = ['Submitted', 'Awaiting Payment', 'Paid', 'Preparing', 'Ready to Claim', 'Claimed'];

const STATUS_INFO: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    reserved:           { label: 'Pending Approval', cls: 'text-amber-700 bg-amber-50 border-amber-200', icon: <Clock className="w-4 h-4" /> },
    pending_payment:    { label: 'Pending Payment',  cls: 'text-orange-700 bg-orange-50 border-orange-200', icon: <CreditCard className="w-4 h-4" /> },
    paid:               { label: 'Payment Verified', cls: 'text-blue-700 bg-blue-50 border-blue-200', icon: <CheckCircle className="w-4 h-4" /> },
    preparing:          { label: 'Being Prepared',   cls: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: <Package className="w-4 h-4" /> },
    ready_for_claiming: { label: 'Ready to Claim!',  cls: 'text-green-700 bg-green-50 border-green-200', icon: <MapPin className="w-4 h-4" /> },
    claimed:            { label: 'Claimed',           cls: 'text-gray-600 bg-gray-50 border-gray-200', icon: <CheckCircle className="w-4 h-4" /> },
    cancelled:          { label: 'Cancelled',         cls: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle className="w-4 h-4" /> },
};

export default function ReservationShow({ reservation }: { reservation: Reservation }) {
    const info = STATUS_INFO[reservation.reservation_status] ?? STATUS_INFO.reserved;
    const currentStep = STATUS_STEPS.indexOf(reservation.reservation_status);
    const isCancelled = reservation.reservation_status === 'cancelled';
    const canCancel = ['reserved', 'pending_payment'].includes(reservation.reservation_status);

    function cancel() {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;
        router.delete(`/reservations/${reservation.id}`);
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
                                <div className="text-2xl">{item.product.category.icon ?? '👔'}</div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 text-sm">{item.product.name}</div>
                                    <div className="text-xs text-gray-400">{item.productSize.size} × {item.quantity} @ {phpPeso(item.unit_price)}</div>
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

                {/* Actions */}
                {canCancel && (
                    <div className="flex justify-end">
                        <button onClick={cancel} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all">
                            Cancel Reservation
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
        </>
    );
}

ReservationShow.layout = { breadcrumbs: [{ title: 'My Reservations', href: '/reservations' }, { title: 'Detail', href: '#' }] };
