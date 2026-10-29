import { Head, Link, router } from '@inertiajs/react';
import { Bell, CheckCircle, ChevronRight, CheckCheck } from 'lucide-react';

type Notification = { id: number; title: string; message: string; type: string; is_read: boolean; link: string | null; created_at: string };
type Paginated = { data: Notification[]; total: number };

const TYPE_COLOR: Record<string, string> = {
    queue:    'bg-blue-100 text-blue-600',
    payment:  'bg-green-100 text-green-600',
    claiming: 'bg-purple-100 text-purple-600',
    system:   'bg-gray-100 text-gray-600',
};

const TYPE_ICON: Record<string, string> = {
    queue: '📋', payment: '💳', claiming: '📦', system: '🔔',
};

export default function NotificationsIndex({ notifications }: { notifications: Paginated }) {
    const unreadCount = notifications.data.filter(n => !n.is_read).length;

    function markRead(id: number) {
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    }

    function markAllRead() {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Notifications — UniReserve" />
            <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Bell className="w-6 h-6 text-blue-600" /> Notifications
                            {unreadCount > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">{notifications.total} total notifications</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all cursor-pointer"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark All Read
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {notifications.data.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.data.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        if (!n.is_read) markRead(n.id);
                                        if (n.link) router.visit(n.link);
                                    }}
                                    className={`flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer ${
                                        !n.is_read
                                            ? 'border-l-3 border-[#173B8F] bg-blue-50/30 hover:bg-blue-50/60'
                                            : 'hover:bg-slate-50/80'
                                    }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${TYPE_COLOR[n.type] ?? TYPE_COLOR.system}`}>
                                        {TYPE_ICON[n.type] ?? '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</div>
                                        <div className="text-sm text-gray-600 mt-0.5 leading-relaxed">{n.message}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(n.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 self-center">
                                        {!n.is_read && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-blue-100" />}
                                        {n.is_read && <CheckCircle className="w-4 h-4 text-emerald-500 opacity-60" />}
                                        {n.link && (
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        )}
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

NotificationsIndex.layout = { breadcrumbs: [{ title: 'Notifications', href: '/notifications' }] };
