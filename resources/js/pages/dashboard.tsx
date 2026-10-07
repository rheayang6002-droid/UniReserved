import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    ShoppingBag,
    ClipboardList,
    CreditCard,
    Bell,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Package,
    ChevronRight,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

type Reservation = {
    id: number;
    reference_code: string;
    status: string;
    created_at: string;
    items_count: number;
    total_amount: number;
};

type Notification = {
    id: number;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
};

type Props = {
    stats?: {
        pending_reservations: number;
        approved_reservations: number;
        total_reservations: number;
        queue_position: number | null;
        unread_notifications: number;
        total_spent: number;
    };
    recent_reservations?: Reservation[];
    recent_notifications?: Notification[];
    role?: string;
    // Admin/staff stats
    admin_stats?: {
        total_students: number;
        pending_count: number;
        today_claims: number;
        low_stock_count: number;
        total_revenue: number;
        queue_length: number;
    };
};

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700 border border-amber-200',
        approved: 'bg-blue-50 text-blue-700 border border-blue-200',
        ready_for_claiming: 'bg-green-50 text-green-700 border border-green-200',
        claimed: 'bg-gray-50 text-gray-600 border border-gray-200',
        rejected: 'bg-red-50 text-red-700 border border-red-200',
        cancelled: 'bg-gray-50 text-gray-500 border border-gray-200',
    };
    const labels: Record<string, string> = {
        pending: 'Pending',
        approved: 'Approved',
        ready_for_claiming: 'Ready to Claim',
        claimed: 'Claimed',
        rejected: 'Rejected',
        cancelled: 'Cancelled',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
            {labels[status] || status}
        </span>
    );
}

export default function Dashboard({ stats, recent_reservations, recent_notifications, role, admin_stats }: Props) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const userRole = role || user?.role || 'student';
    const isAdmin = userRole === 'admin' || userRole === 'staff';

    const studentCards = [
        {
            label: 'Total Reservations',
            value: stats?.total_reservations ?? 0,
            icon: ClipboardList,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/reservations',
        },
        {
            label: 'Pending Approval',
            value: stats?.pending_reservations ?? 0,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            href: '/reservations?status=pending',
        },
        {
            label: 'Approved',
            value: stats?.approved_reservations ?? 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
            href: '/reservations?status=approved',
        },
        {
            label: 'Queue Position',
            value: stats?.queue_position != null ? `#${stats.queue_position}` : '—',
            icon: TrendingUp,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            href: '/queue',
        },
    ];

    const adminCards = [
        {
            label: 'Total Students',
            value: admin_stats?.total_students ?? 0,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/admin/users',
        },
        {
            label: 'Pending Reservations',
            value: admin_stats?.pending_count ?? 0,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            href: '/admin/reservations?status=pending',
        },
        {
            label: "Today's Claims",
            value: admin_stats?.today_claims ?? 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
            href: '/admin/reservations?status=ready',
        },
        {
            label: 'Low Stock Items',
            value: admin_stats?.low_stock_count ?? 0,
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            href: '/admin/inventory?filter=low',
        },
        {
            label: 'Queue Length',
            value: admin_stats?.queue_length ?? 0,
            icon: TrendingUp,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            href: '/admin/queue',
        },
        {
            label: 'Total Revenue',
            value: `₱${(admin_stats?.total_revenue ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`,
            icon: CreditCard,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/admin/payments',
        },
    ];

    const cards = isAdmin ? adminCards : studentCards;

    return (
        <>
            <Head title="Dashboard — UniReserve" />
            <div className="flex flex-col gap-6 p-6">
                {/* Welcome Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-[#061432] via-[#0B2568] to-[#08193D] p-6 text-white shadow-lg border border-blue-900/30">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <img
                                    src="/images/school-logo.png"
                                    alt="DSSC"
                                    className="h-7 w-7 object-contain opacity-90"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <span className="text-blue-200 text-sm font-medium">UniReserve</span>
                            </div>
                            <h1 className="text-2xl font-bold">
                                Welcome back, {user?.name?.split(' ')[0] ?? 'User'}! 👋
                            </h1>
                            <p className="text-blue-100/80 text-sm mt-1">
                                {isAdmin
                                    ? 'Manage reservations, inventory, and student requests from here.'
                                    : 'Browse items, make reservations, and track your queue position.'}
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-xs text-blue-200">Role</div>
                                <div className="text-sm font-semibold capitalize">{userRole}</div>
                            </div>
                            {stats?.unread_notifications != null && stats.unread_notifications > 0 && (
                                <Link href="/notifications" className="relative">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                        {stats.unread_notifications}
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={`grid gap-4 ${isAdmin ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                    {cards.map((card) => (
                        <Link
                            key={card.label}
                            href={card.href}
                            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
                        </Link>
                    ))}
                </div>

                {/* Content Row */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Reservations */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-blue-600" />
                                Recent Reservations
                            </h2>
                            <Link href={isAdmin ? '/admin/reservations' : '/reservations'} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                View all →
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {(recent_reservations ?? []).length === 0 ? (
                                <div className="px-5 py-10 text-center text-gray-400">
                                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No reservations yet</p>
                                    {!isAdmin && (
                                        <Link href="/items" className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-700">
                                            Browse items to reserve →
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                (recent_reservations ?? []).slice(0, 5).map((res) => (
                                    <div key={res.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">{res.reference_code}</div>
                                            <div className="text-xs text-gray-400">
                                                {res.items_count} item{res.items_count !== 1 ? 's' : ''} · {new Date(res.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={res.status} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-blue-600" />
                                Notifications
                                {(stats?.unread_notifications ?? 0) > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                                        {stats!.unread_notifications}
                                    </span>
                                )}
                            </h2>
                            <Link href="/notifications" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                View all →
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {(recent_notifications ?? []).length === 0 ? (
                                <div className="px-5 py-10 text-center text-gray-400">
                                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            ) : (
                                (recent_notifications ?? []).slice(0, 5).map((notif) => (
                                    <div key={notif.id} className={`px-5 py-3 hover:bg-gray-50/50 transition-colors ${!notif.is_read ? 'border-l-2 border-blue-500' : ''}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className={`text-sm font-medium ${notif.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                                                    {notif.title}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{notif.message}</div>
                                            </div>
                                            <div className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                                                {new Date(notif.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions (students only) */}
                {!isAdmin && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Browse Items', icon: ShoppingBag, href: '/items', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                                { label: 'My Reservations', icon: ClipboardList, href: '/reservations', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
                                { label: 'Queue Status', icon: TrendingUp, href: '/queue', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                                { label: 'Pay Now', icon: CreditCard, href: '/payments', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                            ].map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium text-sm transition-all ${action.color}`}
                                >
                                    <action.icon className="w-6 h-6" />
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
