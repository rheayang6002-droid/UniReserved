import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

function FlashBanner() {
    const { flash } = usePage().props as any;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(t);
        }
        if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 6000);
            return () => clearTimeout(t);
        }
    }, [flash?.success, flash?.error]);

    if (!visible || !message) return null;

    const isSuccess = type === 'success';
    return (
        <div className={`fixed top-4 right-4 z-[9999] flex items-start gap-3 max-w-md rounded-xl border shadow-lg px-4 py-3 text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 ${
            isSuccess
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
        }`}>
            {isSuccess
                ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                : <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            }
            <span className="flex-1 leading-snug">{message}</span>
            <button onClick={() => setVisible(false)} className="ml-1 text-current opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <FlashBanner />
        </AppShell>
    );
}
