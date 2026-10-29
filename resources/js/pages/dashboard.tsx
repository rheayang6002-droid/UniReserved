import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    ShoppingBag,
    ClipboardList,
    CreditCard,
    Bell,
    Clock,
    CheckCircle,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Package,
    ChevronRight,
    Crown,
    ShieldCheck,
    UserCheck,
    Key,
    Shield,
    Sparkles,
    Receipt,
    ListOrdered,
    Users,
    ArrowRight,
    BarChart3,
    Settings,
    FileCheck,
    X,
    Eye,
} from 'lucide-react';

type Reservation = {
    id: number;
    reference_code: string;
    status: string;
    created_at: string;
    items_count: number;
    total_amount: number;
    student_name?: string;
};

type Notification = {
    id: number;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
};

type AuditActivity = {
    id: number;
    action: string;
    module: string;
    description: string;
    user_name: string;
    created_at: string;
};

type PaymentRecord = {
    id: number;
    receipt_number: string;
    reference_code: string;
    student_name: string;
    amount: number;
    payment_method: string;
    created_at: string;
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
    recent_activity?: AuditActivity[];
    recent_payments?: PaymentRecord[];
    role?: string;
    is_super_admin?: boolean;
    is_cashier?: boolean;
    is_student?: boolean;
    // Admin/staff/cashier stats
    admin_stats?: {
        total_users?: number;
        total_students: number;
        total_staff?: number;
        total_super_admins?: number;
        pending_count: number;
        approved_count?: number;
        today_claims: number;
        low_stock_count: number;
        total_revenue: number;
        queue_length: number;
        today_transactions?: number;
        today_revenue?: number;
        pending_payments?: number;
        verified_today?: number;
    };
    cashier_stats?: {
        pending_payments: number;
        payments_today: number;
        total_collections_today: number;
        receipts_issued: number;
        total_revenue?: number;
    };
    pending_payments?: Array<{
        id: number;
        reference_code: string;
        student_name: string;
        student_id: string;
        student_email: string;
        course_program: string;
        year_level: string;
        reservation_date: string;
        total_amount: number;
        reservation_status: string;
        payment_status: string;
        items: Array<{
            id: number;
            product_name: string;
            size: string;
            quantity: number;
            unit_price: number;
            subtotal: number;
        }>;
    }>;
    next_receipt_number?: string;
};

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        reserved: 'bg-amber-50 text-amber-800 border-amber-200/80',
        pending: 'bg-amber-50 text-amber-800 border-amber-200/80',
        approved: 'bg-blue-50 text-blue-800 border-blue-200/80',
        paid: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        preparing: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
        ready_for_claiming: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        claimed: 'bg-slate-100 text-slate-700 border-slate-200',
        rejected: 'bg-rose-50 text-rose-800 border-rose-200/80',
        cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    const labels: Record<string, string> = {
        reserved: 'Pending Payment',
        pending: 'Pending Approval',
        approved: 'Approved',
        paid: 'Paid',
        preparing: 'Preparing',
        ready_for_claiming: 'Ready to Claim',
        claimed: 'Claimed',
        rejected: 'Rejected',
        cancelled: 'Cancelled',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {labels[status] || status}
        </span>
    );
}

export default function Dashboard({
    stats,
    recent_reservations,
    recent_notifications,
    recent_activity,
    recent_payments,
    role,
    is_super_admin,
    is_cashier,
    admin_stats,
    cashier_stats,
    pending_payments,
    next_receipt_number,
}: Props) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const rolesArray: string[] = user?.roles ?? [];

    const isSuperAdmin = Boolean(
        is_super_admin ||
        user?.is_super_admin ||
        rolesArray.includes('Super Admin') ||
        role === 'super_admin' ||
        user?.role === 'super_admin'
    );

    const isCashierRole = !isSuperAdmin && Boolean(
        is_cashier ||
        role === 'cashier' ||
        user?.role === 'cashier' ||
        user?.email === 'cashier@dssc.edu.ph' ||
        rolesArray.includes('School Cashier') ||
        rolesArray.includes('Cashier')
    );

    const isStaffAdmin = !isSuperAdmin && !isCashierRole && Boolean(
        role === 'staff' ||
        role === 'admin' ||
        user?.role === 'staff' ||
        user?.role === 'admin' ||
        rolesArray.includes('Staff/Admin')
    );

    const isStudent = !isSuperAdmin && !isCashierRole && !isStaffAdmin;

    const firstName = user?.name?.split(' ')[0] ?? 'User';

    // Cashier Modals State
    const [cashierVerificationItem, setCashierVerificationItem] = useState<any | null>(null);
    const [cashierPaymentItem, setCashierPaymentItem] = useState<any | null>(null);
    const [cashierReceiptNo, setCashierReceiptNo] = useState('');
    const [cashierAmount, setCashierAmount] = useState<string | number>('');
    const [cashierDate, setCashierDate] = useState(new Date().toISOString().split('T')[0]);
    const [cashierMethod, setCashierMethod] = useState<'cash' | 'gcash' | 'bank_transfer'>('cash');
    const [cashierNotes, setCashierNotes] = useState('');
    const [cashierSubmitting, setCashierSubmitting] = useState(false);
    const [cashierError, setCashierError] = useState<string | null>(null);
    const [cashierSuccessInfo, setCashierSuccessInfo] = useState<{ receipt_number: string; reference_code: string } | null>(null);

    const openCashierPaymentModal = (item: any) => {
        setCashierPaymentItem(item);
        setCashierAmount(item.total_amount);
        setCashierReceiptNo(next_receipt_number || `OR-${new Date().getFullYear()}-${String(item.id).padStart(5, '0')}`);
        setCashierDate(new Date().toISOString().split('T')[0]);
        setCashierMethod('cash');
        setCashierNotes('');
        setCashierError(null);
    };

    const handleCashierConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cashierPaymentItem) return;

        if (!cashierReceiptNo.trim()) {
            setCashierError('Please enter an Official Receipt (OR) Number.');
            return;
        }

        const amt = Number(cashierAmount);
        if (isNaN(amt) || amt <= 0) {
            setCashierError('Please enter a valid payment amount.');
            return;
        }

        setCashierSubmitting(true);
        setCashierError(null);

        router.post(
            `/cashier/payments/${cashierPaymentItem.id}/record`,
            {
                receipt_number: cashierReceiptNo.trim(),
                amount: amt,
                payment_method: cashierMethod,
                payment_date: cashierDate,
                notes: cashierNotes.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setCashierSuccessInfo({
                        receipt_number: cashierReceiptNo.trim(),
                        reference_code: cashierPaymentItem.reference_code,
                    });
                    setCashierSubmitting(false);
                    setCashierPaymentItem(null);
                    setCashierVerificationItem(null);
                },
                onError: (errs) => {
                    setCashierSubmitting(false);
                    const first = Object.values(errs)[0];
                    setCashierError(typeof first === 'string' ? first : 'Error recording payment.');
                },
            }
        );
    };

    // ─────────────────────────────────────────────────────────────
    // 1. STUDENT DASHBOARD VIEW
    // ─────────────────────────────────────────────────────────────
    if (isStudent) {
        const studentCards = [
            {
                label: 'My Reservations',
                value: stats?.total_reservations ?? 0,
                desc: 'All-time reservations',
                icon: ClipboardList,
                color: 'text-[#123B8F]',
                bg: 'bg-blue-50',
                border: 'border-blue-100',
                href: '/reservations',
            },
            {
                label: 'Pending Approval',
                value: stats?.pending_reservations ?? 0,
                desc: 'Awaiting verification',
                icon: Clock,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                border: 'border-amber-100',
                href: '/reservations?status=pending',
            },
            {
                label: 'Approved / Ready',
                value: stats?.approved_reservations ?? 0,
                desc: 'Ready for campus pickup',
                icon: CheckCircle2,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                href: '/reservations?status=approved',
            },
            {
                label: 'Queue Position',
                value: stats?.queue_position != null ? `#${stats.queue_position}` : '—',
                desc: stats?.queue_position != null ? 'Active FCFS Ticket' : 'No active ticket',
                icon: TrendingUp,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-100',
                href: '/queue',
            },
        ];

        return (
            <>
                <Head title="Student Dashboard — UniReserve" />
                <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                    {/* Student Welcome Banner (DSSC Blue Identity) */}
                    <div className="rounded-2xl bg-gradient-to-r from-[#123B8F] via-[#1a4bb5] to-[#0A225C] p-6 text-white shadow-md relative overflow-hidden border border-blue-900/40">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm p-1 border border-white/20 flex items-center justify-center shadow-sm">
                                    <img
                                        src="/images/school-logo.png"
                                        alt="DSSC"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-white/15 text-blue-100 text-[10px] font-bold rounded-md tracking-wider uppercase border border-white/20">
                                            Student Portal
                                        </span>
                                        <span className="text-blue-200/90 text-xs font-medium">
                                            DSSC • Business Enterprise Office
                                        </span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Welcome back, {firstName}! 👋
                                    </h1>
                                    <p className="text-blue-100/80 text-xs sm:text-sm mt-1 max-w-xl">
                                        Reserve your official DSSC uniforms, track live queue tickets, and claim supplies conveniently.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center">
                                <Link
                                    href="/items"
                                    className="px-4 py-2.5 bg-white text-[#123B8F] hover:bg-blue-50 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>Browse Uniforms</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Student Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {studentCards.map((card) => (
                            <Link
                                key={card.label}
                                href={card.href}
                                className={`bg-white rounded-xl border ${card.border} p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                                        <card.icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        {card.value}
                                    </div>
                                    <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                                        {card.label}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                        {card.desc}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Queue Status Spotlight Card */}
                    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#123B8F] flex items-center justify-center shrink-0">
                                <ListOrdered className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                        First-Come, First-Served Queue Status
                                    </h3>
                                    {stats?.queue_position != null ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            Ticket Active
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                            No Queue
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {stats?.queue_position != null
                                        ? `You are currently number #${stats.queue_position} in line. Present your reservation slip at the campus cashier.`
                                        : 'Place a reservation to receive an automated ticket number for faster campus claiming.'}
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/queue"
                            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors shrink-0"
                        >
                            View Queue Board →
                        </Link>
                    </div>

                    {/* Quick Student Actions */}
                    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
                        <h2 className="font-bold text-sm text-slate-900 mb-3">Quick Actions</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                                { label: 'Browse Items', icon: ShoppingBag, href: '/items', bg: 'bg-blue-50 text-[#123B8F] hover:bg-blue-100' },
                                { label: 'My Reservations', icon: ClipboardList, href: '/reservations', bg: 'bg-slate-50 text-slate-700 hover:bg-slate-100' },
                                { label: 'Queue Status', icon: ListOrdered, href: '/queue', bg: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
                                { label: 'AI Assistant', icon: Sparkles, href: '/ai-assistant', bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                                { label: 'Pay Now', icon: CreditCard, href: '/payments', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                            ].map((a) => (
                                <Link
                                    key={a.label}
                                    href={a.href}
                                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl font-semibold text-xs transition-colors border border-transparent ${a.bg}`}
                                >
                                    <a.icon className="w-5 h-5" />
                                    <span>{a.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Content Row: Recent Reservations & Notifications */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Recent Reservations */}
                        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-[#123B8F]" />
                                    My Recent Reservations
                                </h2>
                                <Link href="/reservations" className="text-xs text-[#123B8F] hover:underline font-semibold">
                                    View all →
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {(recent_reservations ?? []).length === 0 ? (
                                    <div className="px-5 py-10 text-center text-slate-400">
                                        <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                                        <p className="text-xs font-medium">No reservations placed yet</p>
                                        <Link href="/items" className="mt-2 inline-block text-xs text-[#123B8F] font-semibold hover:underline">
                                            Start reserving supplies →
                                        </Link>
                                    </div>
                                ) : (
                                    (recent_reservations ?? []).slice(0, 5).map((res) => (
                                        <div key={res.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 font-mono">
                                                    {res.reference_code}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {res.items_count} item{res.items_count !== 1 ? 's' : ''} • ₱{Number(res.total_amount).toFixed(2)} • {new Date(res.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <StatusBadge status={res.status} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Notifications */}
                        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-[#123B8F]" />
                                    Notifications
                                    {(stats?.unread_notifications ?? 0) > 0 && (
                                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                                            {stats!.unread_notifications}
                                        </span>
                                    )}
                                </h2>
                                <Link href="/notifications" className="text-xs text-[#123B8F] hover:underline font-semibold">
                                    View all →
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {(recent_notifications ?? []).length === 0 ? (
                                    <div className="px-5 py-10 text-center text-slate-400">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                                        <p className="text-xs font-medium">No new notifications</p>
                                    </div>
                                ) : (
                                    (recent_notifications ?? []).slice(0, 5).map((notif) => (
                                        <div key={notif.id} className={`px-5 py-3 hover:bg-slate-50/70 transition-colors ${!notif.is_read ? 'border-l-2 border-[#123B8F]' : ''}`}>
                                            <div className="text-xs font-semibold text-slate-800 line-clamp-1">{notif.title}</div>
                                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{notif.message}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CASHIER DASHBOARD VIEW
    // ─────────────────────────────────────────────────────────────
    if (isCashierRole) {
        const cashierCards = [
            {
                label: 'Pending Payments',
                value: cashier_stats?.pending_payments ?? admin_stats?.pending_count ?? 0,
                desc: 'Awaiting student payment',
                icon: Clock,
                color: 'text-amber-700',
                bg: 'bg-amber-50',
                border: 'border-amber-200/80',
                href: '/cashier/payments',
            },
            {
                label: 'Payments Today',
                value: cashier_stats?.payments_today ?? admin_stats?.today_transactions ?? 0,
                desc: 'Official Receipts issued today',
                icon: Receipt,
                color: 'text-[#173B8F]',
                bg: 'bg-blue-50',
                border: 'border-blue-200/80',
                href: '/cashier/transactions',
            },
            {
                label: 'Total Collections Today',
                value: `₱${(cashier_stats?.total_collections_today ?? admin_stats?.today_revenue ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                desc: 'Reconciled shift collections',
                icon: CreditCard,
                color: 'text-emerald-700',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200/80',
                href: '/cashier/transactions',
            },
            {
                label: 'Receipts Issued',
                value: cashier_stats?.receipts_issued ?? (recent_payments?.length ?? 0),
                desc: 'All-time official receipts logged',
                icon: FileCheck,
                color: 'text-[#8B1028]',
                bg: 'bg-rose-50',
                border: 'border-rose-200/80',
                href: '/cashier/receipts',
            },
        ];

        return (
            <>
                <Head title="Cashier Dashboard — UniReserve" />
                <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                    {/* Cashier Welcome Header (Royal Blue to Deep Maroon Accent) */}
                    <div className="rounded-2xl bg-gradient-to-r from-[#173B8F] via-[#243F96] to-[#8B1028] p-6 text-white shadow-md relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm p-1 border border-white/20 flex items-center justify-center shadow-sm">
                                    <img
                                        src="/images/beo-logo.png"
                                        alt="BEO"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 bg-white/15 text-white text-[10px] font-bold rounded-md tracking-wider uppercase border border-white/20">
                                            School Cashier Desk
                                        </span>
                                        <span className="text-blue-100 text-xs font-medium">
                                            Davao del Sur State College • Business Enterprise Office
                                        </span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                        Good day, Cashier! 👋
                                    </h1>
                                    <p className="text-blue-100/90 text-xs sm:text-sm mt-1 max-w-xl">
                                        Payment &amp; Collection Overview — Verify student reservation slips, collect uniform payments, and issue Official Receipts.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <Link
                                    href="/cashier/payments"
                                    className="px-4 py-2.5 bg-white text-[#173B8F] hover:bg-blue-50 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span>Pending Payments</span>
                                </Link>
                                <Link
                                    href="/cashier/transactions"
                                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold transition-all border border-white/20 flex items-center gap-1.5"
                                >
                                    <Receipt className="w-4 h-4" />
                                    <span>Transactions</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Success Notice after Payment Recording */}
                    {cashierSuccessInfo && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-3 text-xs sm:text-sm text-emerald-900 shadow-2xs">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-emerald-950">Payment Recorded Successfully</div>
                                    <div className="mt-0.5 text-emerald-800">
                                        Official Receipt: <strong className="font-mono">{cashierSuccessInfo.receipt_number}</strong>
                                    </div>
                                    <div className="mt-0.5 text-emerald-800">
                                        Payment Status: <strong>PAID / RECEIPT RECORDED</strong> (for reservation {cashierSuccessInfo.reference_code})
                                    </div>
                                    <div className="mt-1 text-xs text-emerald-700">
                                        Note: Please instruct the student to return to the Business Enterprise Office (BEO) to present this Official Receipt for verification and uniform release.
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setCashierSuccessInfo(null)}
                                className="text-emerald-500 hover:text-emerald-700 p-1 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Clean Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {cashierCards.map((card) => (
                            <Link
                                key={card.label}
                                href={card.href}
                                className={`bg-white rounded-xl border ${card.border} p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                                        <card.icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        {card.value}
                                    </div>
                                    <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                                        {card.label}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                        {card.desc}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Prominent Section: Pending Payments */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    Pending Payments
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Students with approved reservations awaiting Official Receipt issuance at Cashier desk.
                                </p>
                            </div>
                            <Link href="/cashier/payments" className="text-xs text-[#173B8F] hover:underline font-bold">
                                View all pending →
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3">Reservation ID</th>
                                        <th className="px-5 py-3">Student Name</th>
                                        <th className="px-5 py-3">Student ID</th>
                                        <th className="px-5 py-3">Reservation Date</th>
                                        <th className="px-5 py-3">Amount Due</th>
                                        <th className="px-5 py-3">Payment Status</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(!pending_payments || pending_payments.length === 0) ? (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                                                <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                <p className="font-semibold text-slate-700">No pending payments</p>
                                                <p className="text-xs text-slate-400 mt-0.5">All uniform reservations are currently settled.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        pending_payments.map((r) => (
                                            <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                                                    {r.reference_code}
                                                </td>
                                                <td className="px-5 py-3.5 font-bold text-slate-900">
                                                    {r.student_name}
                                                </td>
                                                <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                                                    {r.student_id || '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-500">
                                                    {new Date(r.reservation_date).toLocaleDateString('en-PH', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-5 py-3.5 font-black text-slate-900 text-sm">
                                                    ₱{Number(r.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                                        Awaiting Payment
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setCashierVerificationItem(r)}
                                                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>View</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openCashierPaymentModal(r)}
                                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <CreditCard className="w-3.5 h-3.5" />
                                                            <span>Record Payment</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Payment Transactions Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-[#173B8F]" />
                                    Recent Payment Transactions
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Recent payments recorded and Official Receipts issued.
                                </p>
                            </div>
                            <Link href="/cashier/transactions" className="text-xs text-[#173B8F] hover:underline font-bold">
                                View all transactions →
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3">Receipt / Ref</th>
                                        <th className="px-5 py-3">Student Name</th>
                                        <th className="px-5 py-3">Payment Method</th>
                                        <th className="px-5 py-3">Amount</th>
                                        <th className="px-5 py-3">Timestamp</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(recent_payments ?? []).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                                                No transactions logged today.
                                            </td>
                                        </tr>
                                    ) : (
                                        (recent_payments ?? []).map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-5 py-3 font-mono font-bold text-slate-900">
                                                    {p.receipt_number || p.reference_code}
                                                </td>
                                                <td className="px-5 py-3 font-medium text-slate-800">
                                                    {p.student_name}
                                                </td>
                                                <td className="px-5 py-3 uppercase font-semibold text-slate-500">
                                                    {p.payment_method}
                                                </td>
                                                <td className="px-5 py-3 font-bold text-emerald-700">
                                                    ₱{p.amount.toFixed(2)}
                                                </td>
                                                <td className="px-5 py-3 text-slate-400">
                                                    {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <Link
                                                        href="/cashier/transactions"
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                                                    >
                                                        Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Cashier Reservation Verification Modal */}
                {cashierVerificationItem && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-200">
                                        Cashier Verification Desk
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                                        Reservation: {cashierVerificationItem.reference_code}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setCashierVerificationItem(null)}
                                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Reservation Information */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Reservation Information
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                                    <div>
                                        <div className="text-slate-400">Reservation ID</div>
                                        <div className="font-mono font-bold text-slate-900 mt-0.5">{cashierVerificationItem.reference_code}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Student Name</div>
                                        <div className="font-bold text-slate-900 mt-0.5">{cashierVerificationItem.student_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Student ID</div>
                                        <div className="font-mono font-semibold text-slate-900 mt-0.5">{cashierVerificationItem.student_id || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Reservation Date</div>
                                        <div className="font-medium text-slate-800 mt-0.5">
                                            {new Date(cashierVerificationItem.reservation_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Amount Due</div>
                                        <div className="font-black text-emerald-700 text-sm mt-0.5">
                                            ₱{Number(cashierVerificationItem.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reserved Uniform Items */}
                            {cashierVerificationItem.items && cashierVerificationItem.items.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Reserved Uniforms ({cashierVerificationItem.items.length})
                                    </h4>
                                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-2">Uniform</th>
                                                    <th className="px-4 py-2">Size</th>
                                                    <th className="px-4 py-2">Quantity</th>
                                                    <th className="px-4 py-2 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {cashierVerificationItem.items.map((it: any) => (
                                                    <tr key={it.id}>
                                                        <td className="px-4 py-2 font-medium text-slate-900">{it.product_name}</td>
                                                        <td className="px-4 py-2 font-bold text-slate-600">{it.size}</td>
                                                        <td className="px-4 py-2">{it.quantity}</td>
                                                        <td className="px-4 py-2 font-bold text-slate-900 text-right">
                                                            ₱{Number(it.subtotal).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Payment Information */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Payment Information
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200/70 text-xs">
                                    <div>
                                        <span className="text-amber-800 font-semibold">Payment Status</span>
                                        <div className="font-bold text-amber-950 mt-0.5">AWAITING PAYMENT</div>
                                    </div>
                                    <div>
                                        <span className="text-amber-800 font-semibold">Amount Due</span>
                                        <div className="font-black text-amber-950 mt-0.5 text-sm">
                                            ₱{Number(cashierVerificationItem.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-amber-800 font-semibold">Official Receipt</span>
                                        <div className="font-mono font-bold text-amber-950 mt-0.5">
                                            {next_receipt_number || 'Auto-generated on save'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCashierVerificationItem(null)}
                                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const tgt = cashierVerificationItem;
                                        setCashierVerificationItem(null);
                                        openCashierPaymentModal(tgt);
                                    }}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span>Record Payment</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Record Payment Form Modal */}
                {cashierPaymentItem && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase border border-emerald-200">
                                        Official Receipt Issue
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                                        Record Payment
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setCashierPaymentItem(null)}
                                    disabled={cashierSubmitting}
                                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {cashierError && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span>{cashierError}</span>
                                </div>
                            )}

                            <form onSubmit={handleCashierConfirmPayment} className="space-y-4">
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-slate-400">Reservation ID</span>
                                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                                            {cashierPaymentItem.reference_code}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Student Name</span>
                                        <div className="font-bold text-slate-900 mt-0.5 truncate">
                                            {cashierPaymentItem.student_name}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Amount Due</span>
                                        <div className="font-black text-slate-900 mt-0.5">
                                            ₱{Number(cashierPaymentItem.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Official Receipt (OR) Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={cashierReceiptNo}
                                        onChange={(e) => setCashierReceiptNo(e.target.value)}
                                        placeholder="e.g. OR-2026-00001"
                                        className="w-full px-3.5 py-2 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F]"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Must match the official receipt issued to the student.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Payment Amount (₱) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={cashierAmount}
                                            onChange={(e) => setCashierAmount(e.target.value)}
                                            className="w-full px-3.5 py-2 font-bold text-slate-900 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Payment Date *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={cashierDate}
                                            onChange={(e) => setCashierDate(e.target.value)}
                                            className="w-full px-3.5 py-2 text-slate-900 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Payment Method *
                                    </label>
                                    <select
                                        value={cashierMethod}
                                        onChange={(e) => setCashierMethod(e.target.value as any)}
                                        className="w-full px-3.5 py-2 font-medium text-slate-900 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F] cursor-pointer"
                                    >
                                        <option value="cash">Cash (On-Campus Cashier Window)</option>
                                        <option value="gcash">GCash (School Merchant)</option>
                                        <option value="bank_transfer">Bank Transfer / Dep Slip</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Cashier Remarks / Notes (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={cashierNotes}
                                        onChange={(e) => setCashierNotes(e.target.value)}
                                        placeholder="Optional cashier notes..."
                                        className="w-full px-3.5 py-2 text-slate-900 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#173B8F] focus:ring-1 focus:ring-[#173B8F]"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setCashierPaymentItem(null)}
                                        disabled={cashierSubmitting}
                                        className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={cashierSubmitting}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {cashierSubmitting ? 'Recording...' : 'Confirm Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 3. STAFF ADMIN DASHBOARD VIEW
    // ─────────────────────────────────────────────────────────────
    if (isStaffAdmin) {
        const staffCards = [
            {
                label: 'Pending Reservations',
                value: admin_stats?.pending_count ?? 0,
                desc: 'Awaiting stock approval',
                icon: Clock,
                color: 'text-amber-700',
                bg: 'bg-amber-50',
                border: 'border-amber-200/80',
                href: '/admin/reservations?status=reserved',
            },
            {
                label: "Today's Claimed",
                value: admin_stats?.today_claims ?? 0,
                desc: 'Uniforms released today',
                icon: CheckCircle,
                color: 'text-emerald-700',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200/80',
                href: '/admin/reservations?status=claimed',
            },
            {
                label: 'Low Stock Items',
                value: admin_stats?.low_stock_count ?? 0,
                desc: (admin_stats?.low_stock_count ?? 0) > 0 ? 'Urgent restock needed' : 'All items well stocked',
                icon: AlertCircle,
                color: (admin_stats?.low_stock_count ?? 0) > 0 ? 'text-rose-700' : 'text-slate-600',
                bg: (admin_stats?.low_stock_count ?? 0) > 0 ? 'bg-rose-50' : 'bg-slate-50',
                border: (admin_stats?.low_stock_count ?? 0) > 0 ? 'border-rose-200/80' : 'border-slate-200',
                href: '/admin/inventory?filter=low',
            },
            {
                label: 'Active Queue Waiting',
                value: admin_stats?.queue_length ?? 0,
                desc: 'Students waiting in queue',
                icon: ListOrdered,
                color: 'text-indigo-700',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200/80',
                href: '/admin/queue',
            },
        ];

        return (
            <>
                <Head title="Staff Dashboard — UniReserve" />
                <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                    {/* Staff Welcome Banner (Operations Identity: BEO Maroon + Navy) */}
                    <div className="rounded-2xl bg-gradient-to-r from-[#641522] via-[#45142a] to-[#06142D] p-6 text-white shadow-md relative overflow-hidden border border-rose-950/40">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm p-1 border border-white/20 flex items-center justify-center shadow-sm">
                                    <img
                                        src="/images/beo-logo.png"
                                        alt="BEO"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-white/15 text-rose-100 text-[10px] font-bold rounded-md tracking-wider uppercase border border-white/20">
                                            Staff Operations
                                        </span>
                                        <span className="text-slate-200 text-xs font-medium">
                                            Business Enterprise Office • Inventory &amp; Queue Management
                                        </span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Uniform Operations Center
                                    </h1>
                                    <p className="text-slate-200/80 text-xs sm:text-sm mt-1 max-w-xl">
                                        Process student pickup requests, maintain warehouse inventory counts, and manage campus queue numbers.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <Link
                                    href="/admin/reservations"
                                    className="px-4 py-2.5 bg-white text-[#641522] hover:bg-rose-50 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
                                >
                                    <ClipboardList className="w-4 h-4" />
                                    <span>Manage Orders</span>
                                </Link>
                                <Link
                                    href="/admin/queue"
                                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold transition-all border border-white/20 flex items-center gap-1.5"
                                >
                                    <ListOrdered className="w-4 h-4" />
                                    <span>Queue Calling</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Operational Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {staffCards.map((card) => (
                            <Link
                                key={card.label}
                                href={card.href}
                                className={`bg-white rounded-xl border ${card.border} p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                                        <card.icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        {card.value}
                                    </div>
                                    <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                                        {card.label}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                        {card.desc}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Operational Hub Quick Links */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Link
                            href="/admin/reservations"
                            className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 shadow-xs flex items-center gap-3 transition-colors"
                        >
                            <ClipboardList className="w-5 h-5 text-[#641522]" />
                            <div>
                                <div className="text-xs font-bold text-slate-900">Reservations</div>
                                <div className="text-[10px] text-slate-400">Review requests</div>
                            </div>
                        </Link>
                        <Link
                            href="/admin/inventory"
                            className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 shadow-xs flex items-center gap-3 transition-colors"
                        >
                            <Package className="w-5 h-5 text-[#123B8F]" />
                            <div>
                                <div className="text-xs font-bold text-slate-900">Inventory</div>
                                <div className="text-[10px] text-slate-400">Stocks &amp; Sizing</div>
                            </div>
                        </Link>
                        <Link
                            href="/admin/queue"
                            className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 shadow-xs flex items-center gap-3 transition-colors"
                        >
                            <ListOrdered className="w-5 h-5 text-indigo-600" />
                            <div>
                                <div className="text-xs font-bold text-slate-900">Queue Station</div>
                                <div className="text-[10px] text-slate-400">Call next ticket</div>
                            </div>
                        </Link>
                        <Link
                            href="/admin/reports"
                            className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 shadow-xs flex items-center gap-3 transition-colors"
                        >
                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                            <div>
                                <div className="text-xs font-bold text-slate-900">Daily Reports</div>
                                <div className="text-[10px] text-slate-400">Export statistics</div>
                            </div>
                        </Link>
                    </div>

                    {/* Operational Tables: Reservations & Queue */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Recent Reservations */}
                        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-[#641522]" />
                                    Incoming Student Requests
                                </h2>
                                <Link href="/admin/reservations" className="text-xs text-[#641522] hover:underline font-bold">
                                    View all →
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {(recent_reservations ?? []).length === 0 ? (
                                    <div className="px-5 py-8 text-center text-slate-400 text-xs">
                                        No recent reservation requests.
                                    </div>
                                ) : (
                                    (recent_reservations ?? []).slice(0, 5).map((res) => (
                                        <div key={res.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/70 transition-colors">
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 font-mono">
                                                    {res.reference_code}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {res.student_name} • {res.items_count} items • ₱{Number(res.total_amount).toFixed(2)}
                                                </div>
                                            </div>
                                            <StatusBadge status={res.status} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Inventory & Low Stock Alerts */}
                        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                    <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-[#123B8F]" />
                                        Warehouse Inventory Health
                                    </h2>
                                    <Link href="/admin/inventory" className="text-xs text-[#123B8F] hover:underline font-semibold">
                                        Inventory table →
                                    </Link>
                                </div>
                                <div className="p-5 space-y-3">
                                    {(admin_stats?.low_stock_count ?? 0) > 0 ? (
                                        <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-xs font-bold text-rose-900">
                                                    {admin_stats!.low_stock_count} item size variants are low on stock
                                                </div>
                                                <p className="text-[11px] text-rose-700 mt-0.5">
                                                    Items with stock ≤ 5 should be replenished promptly to avoid order backlogs.
                                                </p>
                                                <Link
                                                    href="/admin/inventory?filter=low"
                                                    className="inline-block mt-2 px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 transition-colors"
                                                >
                                                    View Low Stock Variants
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <div className="text-xs font-semibold text-emerald-900">
                                                All uniform catalog sizes currently have adequate inventory stock.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>Total Revenue Handled: <strong>₱{(admin_stats?.total_revenue ?? 0).toLocaleString()}</strong></span>
                                <Link href="/admin/reports" className="text-slate-700 hover:text-slate-900 font-semibold">
                                    Generate Report →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 4. SUPER ADMIN DASHBOARD VIEW (Institutional Royal Blue + Maroon Theme)
    // ─────────────────────────────────────────────────────────────
    const superAdminCards = [
        {
            label: 'Total System Users',
            value: admin_stats?.total_users ?? 0,
            desc: 'Registered institutional accounts',
            icon: ShieldCheck,
            href: '/admin/users',
        },
        {
            label: 'Active Students',
            value: admin_stats?.total_students ?? 0,
            desc: 'Verified student users',
            icon: Users,
            href: '/admin/users',
        },
        {
            label: 'Staff & Admin Accounts',
            value: admin_stats?.total_staff ?? 0,
            desc: 'Operational personnel',
            icon: UserCheck,
            href: '/admin/users',
        },
        {
            label: 'Super Administrators',
            value: admin_stats?.total_super_admins ?? 1,
            desc: 'Governance authorities',
            icon: Crown,
            href: '/admin/super-admin/create',
        },
    ];

    return (
        <>
            <Head title="Super Admin Console — UniReserve" />
            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Super Admin Welcome Banner (Royal Blue → Deep Royal Blue → Maroon Gradient) */}
                <div className="rounded-2xl bg-gradient-to-r from-[#173B8F] via-[#243F96] to-[#7A1738] p-6 text-white shadow-md relative overflow-hidden border border-white/10">
                    {/* Selective ambient depth glows */}
                    <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-[#8B1028]/35 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-8 -top-8 w-60 h-60 bg-[#173B8F]/30 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Crown with clean white/light accent */}
                            <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm p-2 border border-white/25 flex items-center justify-center shadow-inner">
                                <Crown className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <span className="px-2.5 py-0.5 bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold rounded-md tracking-wider uppercase border border-white/20 shadow-2xs">
                                        Super Admin Governance
                                    </span>
                                    <span className="text-blue-100 text-xs font-medium">
                                        Davao del Sur State College • System Oversight
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                    Governance &amp; Security Console
                                </h1>
                                <p className="text-blue-100/90 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                                    Centralized governance over user accounts, Spatie RBAC policies, security audit logs, and institutional operations.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <Link
                                href="/admin/super-admin/create"
                                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-[#173B8F] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
                            >
                                <UserCheck className="w-4 h-4 text-[#173B8F]" />
                                <span>Promote Admin</span>
                            </Link>
                            <Link
                                href="/admin/roles"
                                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs sm:text-sm font-bold transition-all border border-white/20 backdrop-blur-sm flex items-center gap-1.5"
                            >
                                <ShieldCheck className="w-4 h-4 text-white" />
                                <span>RBAC Matrix</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Unified Governance Summary Cards (Royal Blue icons, Maroon accents, subtle hover) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {superAdminCards.map((card) => (
                        <Link
                            key={card.label}
                            href={card.href}
                            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-[#173B8F]/40 transition-all group flex flex-col justify-between relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-[#173B8F] group-hover:to-[#8B1028] transition-all" />
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[#173B8F]/8 border border-[#173B8F]/15 flex items-center justify-center text-[#173B8F] group-hover:bg-[#173B8F] group-hover:text-white transition-all shadow-2xs">
                                    <card.icon className="w-5 h-5 transition-colors" />
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#8B1028] group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    {card.value}
                                </div>
                                <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                                    {card.label}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-[#8B1028]/60" />
                                    <span>{card.desc}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Super Admin Quick Governance Bar (Royal Blue → Maroon Accent) */}
                <div className="bg-gradient-to-r from-[#173B8F]/5 via-white to-[#8B1028]/5 border border-[#173B8F]/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#173B8F] to-[#8B1028] text-white flex items-center justify-center font-bold shadow-xs">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                                Governance Quick Actions
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                Manage user accounts, Spatie permissions, security audit trails, and core settings.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Secondary: White with Royal Blue border/text */}
                        <Link
                            href="/admin/users"
                            className="px-3 py-1.5 bg-white border border-[#173B8F]/30 hover:bg-[#173B8F]/5 text-[#173B8F] text-xs font-semibold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5"
                        >
                            <Users className="w-3.5 h-3.5 text-[#173B8F]" />
                            <span>Users</span>
                        </Link>

                        {/* Secondary: White with Royal Blue border/text */}
                        <Link
                            href="/admin/roles"
                            className="px-3 py-1.5 bg-white border border-[#173B8F]/30 hover:bg-[#173B8F]/5 text-[#173B8F] text-xs font-semibold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#173B8F]" />
                            <span>Roles &amp; RBAC</span>
                        </Link>

                        {/* Primary: Royal Blue */}
                        <Link
                            href="/admin/permissions"
                            className="px-3 py-1.5 bg-[#173B8F] hover:bg-[#122e70] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5"
                        >
                            <Key className="w-3.5 h-3.5 text-white" />
                            <span>Permissions</span>
                        </Link>

                        {/* High-priority action: Royal Blue → Maroon gradient */}
                        <Link
                            href="/admin/super-admin/create"
                            className="px-3 py-1.5 bg-gradient-to-r from-[#173B8F] to-[#7A1738] hover:opacity-95 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all inline-flex items-center gap-1.5"
                        >
                            <UserCheck className="w-3.5 h-3.5 text-white" />
                            <span>New Super Admin</span>
                        </Link>

                        {/* Secondary: White with subtle border */}
                        <Link
                            href="/admin/settings"
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5"
                        >
                            <Settings className="w-3.5 h-3.5 text-slate-600" />
                            <span>Settings</span>
                        </Link>
                    </div>
                </div>

                {/* Audit Logs Stream & System Reservations Overview */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Security & Audit Activity Logs */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#173B8F]" />
                                <span>Security &amp; System Audit Activity</span>
                            </h2>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#173B8F]/10 text-[#173B8F] border border-[#173B8F]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#173B8F] animate-pulse" />
                                Real-time Stream
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {(recent_activity ?? []).length === 0 ? (
                                <div className="px-5 py-8 text-center text-slate-400 text-xs">
                                    No audit entries recorded recently.
                                </div>
                            ) : (
                                (recent_activity ?? []).slice(0, 6).map((act) => {
                                    const isSecurity =
                                        /role|permission|auth|login|destroy|delete|super|security/i.test(
                                            `${act.action} ${act.module} ${act.description}`
                                        );
                                    return (
                                        <div
                                            key={act.id}
                                            className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/70 transition-colors gap-3"
                                        >
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <div
                                                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                                        isSecurity
                                                            ? 'bg-[#8B1028] ring-2 ring-[#8B1028]/20'
                                                            : 'bg-[#173B8F] ring-2 ring-[#173B8F]/20'
                                                    }`}
                                                />
                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                                        <span
                                                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border ${
                                                                isSecurity
                                                                    ? 'bg-[#8B1028]/10 text-[#8B1028] border-[#8B1028]/20'
                                                                    : 'bg-[#173B8F]/10 text-[#173B8F] border-[#173B8F]/20'
                                                            }`}
                                                        >
                                                            {act.module}
                                                        </span>
                                                        <span className="truncate">{act.description}</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        Actor: <strong className="text-slate-600 font-medium">{act.user_name}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                                                {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* System Reservations Oversight */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-[#173B8F]" />
                                <span>System Reservation Stream</span>
                            </h2>
                            <Link
                                href="/admin/reservations"
                                className="text-xs text-[#173B8F] hover:text-[#8B1028] font-semibold transition-colors"
                            >
                                View all →
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {(recent_reservations ?? []).length === 0 ? (
                                <div className="px-5 py-8 text-center text-slate-400 text-xs">
                                    No reservations in system.
                                </div>
                            ) : (
                                (recent_reservations ?? []).slice(0, 6).map((res) => {
                                    const isAwaitingPayment = res.status === 'reserved' || res.status === 'pending';
                                    return (
                                        <div
                                            key={res.id}
                                            className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/70 transition-colors gap-3"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                                        isAwaitingPayment
                                                            ? 'bg-[#8B1028]/10 text-[#8B1028]'
                                                            : 'bg-[#173B8F]/10 text-[#173B8F]'
                                                    }`}
                                                >
                                                    <ShoppingBag className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-slate-900 font-mono tracking-wide">
                                                        {res.reference_code}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate">
                                                        {res.student_name} • {res.items_count} items • ₱{Number(res.total_amount).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <StatusBadge status={res.status} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
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

