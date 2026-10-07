import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, ChevronRight, Filter } from 'lucide-react';

type Reservation = {
    id: number; reference_code: string; reservation_status: string;
    payment_status: string; total_amount: string; queue_number: number;
    created_at: string; items_count: number;
};
type PaginatedReservations = { data: Reservation[]; links: { url: string | null; label: string; active: boolean }[]; total: number };

function StatusBadge({ label, cls }: { label: string; cls: string }) {
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>{label}</span>;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    reserved:           { label: 'Pending Approval', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    pending_payment:    { label: 'Pending Payment',  cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    paid:               { label: 'Paid',             cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    preparing:          { label: 'Preparing',         cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ready_for_claiming: { label: 'Ready to Claim',   cls: 'bg-green-50 text-green-700 border-green-200' },
    claimed:            { label: 'Claimed',           cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    cancelled:          { label: 'Cancelled',         cls: 'bg-red-50 text-red-600 border-red-200' },
};

const FILTER_TABS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'reserved' },
    { label: 'Payment Due', value: 'pending_payment' },
    { label: 'Ready', value: 'ready_for_claiming' },
    { label: 'Claimed', value: 'claimed' },
    { label: 'Cancelled', value: 'cancelled' },
];

export default function ReservationsIndex({ reservations, filters }: { reservations: PaginatedReservations; filters: { status?: string } }) {
    function setFilter(status: string) {
        router.get('/reservations', status ? { status } : {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="My Reservations — UniReserve" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-blue-600" /> My Reservations
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{reservations.total} total reservations</p>
                    </div>
                    <Link href="/reservations/create" className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm">
                        + New Reservation
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
                    {FILTER_TABS.map(tab => (
                        <button key={tab.value} onClick={() => setFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${(filters.status ?? '') === tab.value ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {reservations.data.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No reservations found</p>
                            <Link href="/items" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700">Browse items to reserve →</Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {reservations.data.map(res => {
                                const s = STATUS_MAP[res.reservation_status] ?? { label: res.reservation_status, cls: 'bg-gray-50 text-gray-600 border-gray-200' };
                                return (
                                    <Link key={res.id} href={`/reservations/${res.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                                <ClipboardList className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{res.reference_code}</div>
                                                <div className="text-sm text-gray-400 mt-0.5">
                                                    {res.items_count} item{res.items_count !== 1 ? 's' : ''} ·
                                                    Queue #{res.queue_number} ·
                                                    {new Date(res.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right hidden sm:block">
                                                <div className="font-semibold text-gray-900">₱{Number(res.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                                                <div className="text-xs text-gray-400">Payment: {res.payment_status}</div>
                                            </div>
                                            <StatusBadge {...s} />
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {reservations.links.length > 3 && (
                    <div className="flex justify-center gap-1">
                        {reservations.links.map((link, i) => (
                            <button key={i} disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${link.active ? 'bg-blue-700 text-white border-blue-700' : link.url ? 'bg-white text-gray-600 border-gray-200 hover:border-blue-300' : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ReservationsIndex.layout = { breadcrumbs: [{ title: 'My Reservations', href: '/reservations' }] };
