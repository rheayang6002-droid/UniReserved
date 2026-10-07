import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ClipboardList,
    Search,
    Clock,
    CheckCircle2,
    PackageCheck,
    Archive,
    Check,
    X,
    Eye,
    ChevronRight,
    AlertCircle,
    User,
    ChevronDown,
} from 'lucide-react';

type ReservationItem = {
    id: number;
    reference_code: string;
    reservation_status: string;
    payment_status: string;
    total_amount: string | number;
    queue_number: number;
    created_at: string;
    items_count: number;
    student_name: string | null;
    student_email: string | null;
    queue_position: number | null;
};

type Paginated = {
    data: ReservationItem[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    current_page: number;
    last_page: number;
};

type Props = {
    reservations: Paginated;
    filters: { status?: string; search?: string };
    stats: {
        pending: number;
        approved: number;
        ready: number;
        claimed: number;
    };
};

const STATUS_MAP: Record<string, { label: string; badgeCls: string }> = {
    reserved: { label: 'Pending Approval', badgeCls: 'bg-amber-50 text-amber-700 border-amber-200' },
    pending_payment: { label: 'Awaiting Payment', badgeCls: 'bg-orange-50 text-orange-700 border-orange-200' },
    paid: { label: 'Paid', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200' },
    preparing: { label: 'Preparing Items', badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ready_for_claiming: { label: 'Ready to Claim', badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    claimed: { label: 'Claimed', badgeCls: 'bg-gray-100 text-gray-700 border-gray-200' },
    cancelled: { label: 'Cancelled', badgeCls: 'bg-red-50 text-red-700 border-red-200' },
};

export default function AdminReservationsIndex({ reservations, filters, stats }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/reservations',
            { ...filters, search: searchTerm },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusFilter = (status: string) => {
        router.get(
            '/admin/reservations',
            { ...filters, status: status || undefined, search: searchTerm || undefined },
            { preserveState: true }
        );
    };

    const handleApprove = (id: number) => {
        if (confirm('Approve this reservation? The student will be notified to proceed with payment.')) {
            router.post(`/admin/reservations/${id}/approve`, {}, { preserveScroll: true });
        }
    };

    const handleMarkReady = (id: number) => {
        if (confirm('Mark this reservation as ready for claiming? The student will be notified.')) {
            router.post(`/admin/reservations/${id}/ready`, {}, { preserveScroll: true });
        }
    };

    const handleMarkClaimed = (id: number) => {
        if (confirm('Confirm items have been handed over to student and mark as claimed?')) {
            router.post(`/admin/reservations/${id}/claim`, {}, { preserveScroll: true });
        }
    };

    const submitReject = () => {
        if (!rejectingId) return;
        setIsSubmitting(true);
        router.post(
            `/admin/reservations/${rejectingId}/reject`,
            { reason: rejectReason },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setRejectingId(null);
                    setRejectReason('');
                },
            }
        );
    };

    return (
        <>
            <Head title="Reservation Management — UniReserve Admin" />
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-blue-600" />
                            Reservation Management
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Review, approve, and manage fulfillment of student school uniform and supplies orders.
                        </p>
                    </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <button
                        onClick={() => handleStatusFilter('reserved')}
                        className={`p-4 rounded-xl border text-left transition-all ${
                            filters.status === 'reserved'
                                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                                : 'bg-white border-gray-100 shadow-sm hover:border-amber-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-amber-700">Pending Approval</div>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-2">{stats.pending}</div>
                    </button>

                    <button
                        onClick={() => handleStatusFilter('paid')}
                        className={`p-4 rounded-xl border text-left transition-all ${
                            filters.status === 'paid' || filters.status === 'preparing'
                                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                                : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-blue-700">In Preparation</div>
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-2">{stats.approved}</div>
                    </button>

                    <button
                        onClick={() => handleStatusFilter('ready_for_claiming')}
                        className={`p-4 rounded-xl border text-left transition-all ${
                            filters.status === 'ready_for_claiming'
                                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                                : 'bg-white border-gray-100 shadow-sm hover:border-emerald-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-emerald-700">Ready for Claiming</div>
                            <PackageCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-2">{stats.ready}</div>
                    </button>

                    <button
                        onClick={() => handleStatusFilter('claimed')}
                        className={`p-4 rounded-xl border text-left transition-all ${
                            filters.status === 'claimed'
                                ? 'bg-gray-100 border-gray-300 ring-2 ring-gray-200'
                                : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-gray-600">Claimed Orders</div>
                            <Archive className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-2">{stats.claimed}</div>
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    {/* Status Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {[
                            { label: 'All', value: '' },
                            { label: 'Pending', value: 'reserved' },
                            { label: 'Payment Due', value: 'pending_payment' },
                            { label: 'Paid', value: 'paid' },
                            { label: 'Preparing', value: 'preparing' },
                            { label: 'Ready', value: 'ready_for_claiming' },
                            { label: 'Claimed', value: 'claimed' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => handleStatusFilter(tab.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                                    (filters.status || '') === tab.value
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex gap-2 min-w-[240px] sm:w-72">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Ref code or student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Reservations List */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {reservations.data.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 px-4">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-600" />
                            <p className="font-semibold text-gray-700">No reservations found</p>
                            <p className="text-xs text-gray-400 mt-1">Try changing the status filter or search keyword.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 text-gray-600 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                                        <th className="py-3 px-4">Reference & Student</th>
                                        <th className="py-3 px-4">Items / Total</th>
                                        <th className="py-3 px-4">Queue</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Payment</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reservations.data.map((res) => {
                                        const statusInfo = STATUS_MAP[res.reservation_status] || {
                                            label: res.reservation_status,
                                            badgeCls: 'bg-gray-100 text-gray-700 border-gray-200',
                                        };

                                        return (
                                            <tr key={res.id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-gray-900 font-mono text-sm">
                                                        {res.reference_code}
                                                    </div>
                                                    <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                                        <User className="w-3 h-3 text-gray-400" />
                                                        <span className="font-medium text-gray-800">{res.student_name || 'Student'}</span>
                                                    </div>
                                                    <div className="text-[11px] text-gray-400">
                                                        {new Date(res.created_at).toLocaleDateString('en-PH', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-gray-900">
                                                        ₱{Number(res.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {res.items_count} item{res.items_count !== 1 ? 's' : ''}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold font-mono border border-blue-100">
                                                        #{res.queue_number}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.badgeCls}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                                        res.payment_status === 'paid'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                        {res.payment_status}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                        {/* Decision buttons for Admin */}
                                                        {res.reservation_status === 'reserved' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(res.id)}
                                                                    title="Approve Reservation"
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" />
                                                                    Approve
                                                                </button>

                                                                <button
                                                                    onClick={() => setRejectingId(res.id)}
                                                                    title="Reject Reservation"
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        {(res.reservation_status === 'paid' || res.reservation_status === 'preparing') && (
                                                            <button
                                                                onClick={() => handleMarkReady(res.id)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                                            >
                                                                <PackageCheck className="w-3.5 h-3.5" />
                                                                Ready to Claim
                                                            </button>
                                                        )}

                                                        {res.reservation_status === 'ready_for_claiming' && (
                                                            <button
                                                                onClick={() => handleMarkClaimed(res.id)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                                            >
                                                                <Archive className="w-3.5 h-3.5" />
                                                                Mark Claimed
                                                            </button>
                                                        )}

                                                        <Link
                                                            href={`/admin/reservations/${res.id}`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Details
                                                        </Link>
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
                {reservations.links && reservations.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 pt-2 flex-wrap">
                        {reservations.links.map((link, idx) => (
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

                {/* Reject Modal Dialog */}
                {rejectingId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">Reject Reservation</h3>
                                    <p className="text-xs text-gray-500">Provide an optional reason for the student</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Reason for rejection (e.g. Size out of stock, incorrect details)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                    placeholder="Enter note for student..."
                                    className="w-full p-3 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRejectingId(null);
                                        setRejectReason('');
                                    }}
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
