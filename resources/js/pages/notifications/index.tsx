import { Head, Link } from '@inertiajs/react';
import { Bell, CheckCircle, ChevronRight } from 'lucide-react';

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
    return (
        <>
            <Head title="Notifications — UniReserve" />
            <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-blue-600" /> Notifications
                    </h1>
                    <span className="text-sm text-gray-400">{notifications.total} total</span>
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
                                <div key={n.id} className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-gray-50/50 ${!n.is_read ? 'border-l-2 border-blue-500 bg-blue-50/30' : ''}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${TYPE_COLOR[n.type] ?? TYPE_COLOR.system}`}>
                                        {TYPE_ICON[n.type] ?? '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-semibold ${!n.is_read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</div>
                                        <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(n.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                        {n.link && (
                                            <Link href={n.link} className="text-blue-600 hover:text-blue-700">
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
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
