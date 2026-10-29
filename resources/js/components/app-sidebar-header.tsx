import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationBell } from '@/components/notification-bell';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="bg-white border-b border-slate-200/80 flex h-16 shrink-0 items-center justify-between gap-2 px-6 shadow-2xs transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 text-[#06142D]">
                <SidebarTrigger className="-ml-1 text-[#173B8F] hover:text-[#06142D] hover:bg-slate-100 transition-colors" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-3">
                <NotificationBell />
            </div>
        </header>
    );
}
