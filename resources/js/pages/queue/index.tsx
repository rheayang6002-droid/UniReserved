import { Head, Link } from '@inertiajs/react';
import { TrendingUp, Clock, Users, CheckCircle } from 'lucide-react';

type QueueEntry = { id: number; queue_position: number; status: string; reservation: { reference_code: string } };

type Props = {
    my_entry: QueueEntry | null;
    queue_position: number | null;
    currently_serving: QueueEntry | null;
    total_waiting: number;
};

export default function QueueIndex({ my_entry, queue_position, currently_serving, total_waiting }: Props) {
    return (
        <>
            <Head title="Queue Status — UniReserve" />
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" /> Queue Status
                </h1>

                {/* Currently Serving */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <h2 className="font-semibold text-gray-800">Currently Serving</h2>
                    </div>
                    {currently_serving ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <div className="text-4xl font-black text-green-700">#{currently_serving.queue_position}</div>
                            <div className="text-sm text-green-600 mt-1 font-medium">{currently_serving.reservation.reference_code}</div>
                            <div className="text-xs text-green-500 mt-0.5">Being processed now</div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No one is currently being served</p>
                        </div>
                    )}
                </div>

                {/* My Position */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-800 mb-3">My Queue Position</h2>
                    {my_entry ? (
                        <div className="text-center">
                            <div className={`inline-block rounded-2xl p-6 ${my_entry.status === 'serving' ? 'bg-green-50 border-2 border-green-400' : 'bg-blue-50 border-2 border-blue-200'}`}>
                                <div className={`text-6xl font-black ${my_entry.status === 'serving' ? 'text-green-700' : 'text-blue-700'}`}>
                                    #{queue_position ?? my_entry.queue_position}
                                </div>
                                {my_entry.status === 'serving' ? (
                                    <div className="mt-2 text-green-600 font-semibold text-sm flex items-center gap-1 justify-center">
                                        <CheckCircle className="w-4 h-4" /> It's your turn!
                                    </div>
                                ) : (
                                    <div className="mt-2 text-blue-600 text-sm">
                                        {queue_position && queue_position > 1
                                            ? `${queue_position - 1} person${queue_position - 1 !== 1 ? 's' : ''} ahead of you`
                                            : 'You are next!'}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                                Reservation: <span className="font-medium text-gray-700">{my_entry.reservation.reference_code}</span>
                            </div>
                            {my_entry.status === 'serving' && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                                    🎉 Please proceed to the office now!
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                            <p className="text-gray-500 font-medium">You are not in the queue</p>
                            <p className="text-gray-400 text-sm mt-1">Make a reservation to join the queue</p>
                            <Link href="/reservations/create" className="inline-block mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all">
                                Make a Reservation →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                        <Users className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                        <div className="text-2xl font-bold text-gray-900">{total_waiting}</div>
                        <div className="text-xs text-gray-400 mt-0.5">People Waiting</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                        <Clock className="w-6 h-6 mx-auto text-amber-500 mb-1" />
                        <div className="text-2xl font-bold text-gray-900">~{Math.ceil(total_waiting * 5)} min</div>
                        <div className="text-xs text-gray-400 mt-0.5">Est. Wait Time</div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                    <p className="font-semibold mb-1">ℹ️ About the Queue System</p>
                    <p className="text-blue-600">UniReserve uses a First-Come, First-Served (FCFS) system. Your position is determined by when you submitted your reservation. Refresh this page to see updates.</p>
                </div>
            </div>
        </>
    );
}

QueueIndex.layout = { breadcrumbs: [{ title: 'Queue Status', href: '/queue' }] };
