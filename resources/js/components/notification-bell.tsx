import { useState, useEffect, useRef, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    CreditCard,
    PackageCheck,
    Clock,
    AlertCircle,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface NotificationItem {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'queue' | 'payment' | 'claiming' | 'system' | string;
    is_read: boolean;
    link: string | null;
    created_at: string;
}

interface PollResponse {
    unread_count: number;
    notifications: NotificationItem[];
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 45) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type: string) {
    switch (type) {
        case 'queue':
            return (
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                </div>
            );
        case 'payment':
            return (
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                </div>
            );
        case 'claiming':
            return (
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <PackageCheck className="w-4 h-4" />
                </div>
            );
        case 'system':
        default:
            return (
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                </div>
            );
    }
}

export function NotificationBell() {
    const page = usePage<{ unread_notifications_count?: number }>();
    const sharedUnread = page.props.unread_notifications_count ?? 0;

    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState<number>(sharedUnread);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNewPulse, setHasNewPulse] = useState(false);

    // Keep track of the highest notification ID seen to avoid duplicate toasts
    const highestSeenIdRef = useRef<number | null>(null);
    const isFirstPollRef = useRef(true);

    // Sync with Inertia page navigation props
    useEffect(() => {
        if (typeof page.props.unread_notifications_count === 'number') {
            setUnreadCount(page.props.unread_notifications_count);
        }
    }, [page.props.unread_notifications_count]);

    // Polling function
    const fetchLatest = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setIsLoading(true);
            const response = await fetch('/notifications/poll', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) return;

            const data: PollResponse = await response.json();
            setUnreadCount(data.unread_count);
            setNotifications(data.notifications);

            if (data.notifications.length > 0) {
                const maxId = Math.max(...data.notifications.map((n) => n.id));

                if (isFirstPollRef.current) {
                    highestSeenIdRef.current = maxId;
                    isFirstPollRef.current = false;
                } else if (highestSeenIdRef.current !== null && maxId > highestSeenIdRef.current) {
                    // Find all brand new unread notifications since last check
                    const newItems = data.notifications.filter(
                        (n) => n.id > highestSeenIdRef.current! && !n.is_read
                    );

                    highestSeenIdRef.current = maxId;

                    if (newItems.length > 0) {
                        setHasNewPulse(true);
                        setTimeout(() => setHasNewPulse(false), 3000);

                        // Trigger toast for the newest item
                        const latest = newItems[0];
                        toast(latest.title, {
                            description: latest.message,
                            duration: 5000,
                            action: latest.link
                                ? {
                                      label: 'View',
                                      onClick: () => router.visit(latest.link!),
                                  }
                                : undefined,
                        });
                    }
                }
            } else {
                isFirstPollRef.current = false;
            }
        } catch {
            // Silently ignore background polling network errors
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchLatest(false);
    }, [fetchLatest]);

    // Polling interval every 15 seconds, respecting tab visibility
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchLatest(true);
            }
        }, 15000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchLatest(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchLatest]);

    // Mark single notification as read and navigate if link exists
    const handleNotificationClick = (item: NotificationItem) => {
        if (!item.is_read) {
            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            // Backend call
            router.post(
                `/notifications/${item.id}/read`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        }

        setIsOpen(false);

        if (item.link) {
            router.visit(item.link);
        }
    };

    // Mark all as read
    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);

        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('All notifications marked as read');
                },
            }
        );
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="View notifications"
                    className="relative p-2 rounded-xl text-slate-600 hover:text-[#173B8F] hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#173B8F]/20 cursor-pointer"
                >
                    <Bell className="w-5 h-5 transition-transform duration-200 active:scale-95" />

                    {unreadCount > 0 && (
                        <span
                            className={`absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-white shadow-xs ${
                                hasNewPulse ? 'animate-bounce' : ''
                            }`}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-80 sm:w-96 p-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 text-slate-800"
            >
                {/* Header */}
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#173B8F] hover:text-blue-800 transition-colors cursor-pointer"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="max-h-84 sm:max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {isLoading && notifications.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-sm">
                            <Clock className="w-6 h-6 mx-auto mb-2 opacity-40 animate-spin" />
                            Loading notifications...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-12 px-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                            <p className="text-xs text-slate-400 mt-1">
                                You have no notifications right now.
                            </p>
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleNotificationClick(item)}
                                className={`flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer ${
                                    !item.is_read
                                        ? 'bg-blue-50/40 hover:bg-blue-50/70 border-l-3 border-[#173B8F]'
                                        : 'hover:bg-slate-50'
                                }`}
                            >
                                {getNotificationIcon(item.type)}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <p
                                            className={`text-xs truncate ${
                                                !item.is_read
                                                    ? 'font-bold text-slate-900'
                                                    : 'font-medium text-slate-700'
                                            }`}
                                        >
                                            {item.title}
                                        </p>
                                        <span className="text-[10px] text-slate-400 shrink-0">
                                            {formatTimeAgo(item.created_at)}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                                        {item.message}
                                    </p>
                                </div>

                                <div className="flex items-center self-center shrink-0">
                                    {!item.is_read ? (
                                        <div className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100" />
                                    ) : item.link ? (
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(false);
                            router.visit('/notifications');
                        }}
                        className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-[#173B8F] hover:bg-blue-50 hover:text-blue-800 transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                        View all notifications
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
