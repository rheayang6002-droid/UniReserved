import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ListOrdered,
    Volume2,
    CheckCircle2,
    SkipForward,
    Clock,
    User,
    RefreshCw,
    AlertCircle,
    ArrowRight,
    ShoppingBag,
} from 'lucide-react';

type QueueEntry = {
    id: number;
    queue_position: number;
    status: string; // 'waiting' | 'serving'
    created_at: string;
    reservation?: {
        id: number;
        reference_code: string;
        queue_number: number;
        reservation_status: string;
        payment_status: string;
        total_amount: string | number;
        user?: {
            name: string;
            student_id: string | null;
            course_program: string | null;
        };
        items?: Array<{
            id: number;
            quantity: number;
            product?: { name: string };
        }>;
    };
};

type Paginated = {
    data: QueueEntry[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

type Props = {
    entries: Paginated;
    total_waiting: number;
    serving: number;
};

export default function AdminQueueIndex({ entries, total_waiting, serving }: Props) {
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Auto refresh every 15 seconds if enabled
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            router.reload({ only: ['entries', 'total_waiting', 'serving'] });
        }, 15000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const handleServe = (entry: QueueEntry) => {
        router.post(`/admin/queue/${entry.id}/process`, {}, { preserveScroll: true });
    };

    const handleSkip = (entry: QueueEntry) => {
        if (confirm(`Skip and cancel Queue Ticket #${entry.reservation?.queue_number || entry.queue_position}?`)) {
            router.post(`/admin/queue/${entry.id}/skip`, {}, { preserveScroll: true });
        }
    };

    const currentlyServing = entries.data.find((e) => e.status === 'serving');
    const waitingList = entries.data.filter((e) => e.status === 'waiting');

    return (
        <>
            <Head title="Live Queue Management — UniReserve Admin" />
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ListOrdered className="w-6 h-6 text-blue-600" />
                            Live Queue Management Counter
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Call students to the releasing counter, process tickets, and manage pickup traffic in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white px-3 py-2 rounded-xl border border-gray-200 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>Auto-refresh (15s)</span>
                        </label>

                        <button
                            onClick={() => router.reload()}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                        >
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                    </div>
                </div>

                {/* Counter Hero: Now Serving vs Waiting */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Now Serving Highlight */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-4 top-4 opacity-10">
                            <Volume2 className="w-36 h-36" />
                        </div>

                        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                                    <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Counter 1 — Now Calling
                                </span>
                                <span className="text-xs text-blue-200 font-mono">
                                    {serving > 0 ? 'Active Service' : 'Idle Counter'}
                                </span>
                            </div>

                            {currentlyServing ? (
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-4 flex-wrap">
                                        <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                                            #{currentlyServing.reservation?.queue_number || currentlyServing.queue_position}
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-xl font-bold text-blue-100">
                                                {currentlyServing.reservation?.user?.name || 'Student Customer'}
                                            </div>
                                            <div className="text-xs text-blue-200/80 font-mono">
                                                {currentlyServing.reservation?.reference_code} · {currentlyServing.reservation?.user?.student_id || 'ID N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <Link
                                            href={`/admin/reservations/${currentlyServing.reservation?.id}`}
                                            className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-sm"
                                        >
                                            View Reservation Items
                                        </Link>

                                        {waitingList[0] && (
                                            <button
                                                onClick={() => handleServe(waitingList[0])}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                                            >
                                                Call Next #{waitingList[0].reservation?.queue_number || waitingList[0].queue_position}
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 space-y-3">
                                    <div className="text-2xl font-bold text-blue-100">
                                        No student currently at counter
                                    </div>
                                    <p className="text-xs text-blue-200/80 max-w-md">
                                        Click "Call Ticket" on the waiting list below to invite the next waiting student to the claiming window.
                                    </p>
                                    {waitingList[0] && (
                                        <button
                                            onClick={() => handleServe(waitingList[0])}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
                                        >
                                            <Volume2 className="w-4 h-4 text-blue-600" />
                                            Call Next Ticket #{waitingList[0].reservation?.queue_number || waitingList[0].queue_position}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Panel */}
                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-medium">Students in Line</div>
                                <div className="text-2xl font-bold text-gray-900">{total_waiting} Waiting</div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-medium">Serving Window Status</div>
                                <div className="text-base font-bold text-gray-900">
                                    {serving > 0 ? 'Currently Active' : 'Ready for Next'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Waiting Queue List */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-gray-900 text-base">Waiting Queue Tickets</h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Students waiting for claim releasing in ordered queue.
                            </p>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                            {waitingList.length} in queue
                        </span>
                    </div>

                    {waitingList.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 px-4">
                            <ListOrdered className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-600" />
                            <p className="font-semibold text-gray-700">Queue line is clear!</p>
                            <p className="text-xs text-gray-400 mt-1">
                                No students are currently in the waiting queue.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {waitingList.map((entry, idx) => (
                                <div
                                    key={entry.id}
                                    className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 font-mono font-black text-xl flex items-center justify-center shrink-0">
                                            #{entry.reservation?.queue_number || entry.queue_position}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 text-sm sm:text-base">
                                                    {entry.reservation?.user?.name || 'Student'}
                                                </span>
                                                <span className="text-xs text-gray-400 font-mono">
                                                    ({entry.reservation?.reference_code})
                                                </span>
                                                {idx === 0 && (
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                                        Next in Line
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                {entry.reservation?.user?.course_program && (
                                                    <span>{entry.reservation.user.course_program}</span>
                                                )}
                                                <span>
                                                    {entry.reservation?.items?.length || 0} item(s) to release
                                                </span>
                                                <span className="text-gray-400">
                                                    Joined {new Date(entry.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        <button
                                            onClick={() => handleSkip(entry)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                            title="Skip or cancel ticket"
                                        >
                                            <SkipForward className="w-3.5 h-3.5" /> Skip
                                        </button>

                                        <button
                                            onClick={() => handleServe(entry)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                                        >
                                            <Volume2 className="w-4 h-4" /> Call to Window
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
