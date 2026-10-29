import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    ClipboardList,
    Users,
    Package,
    CreditCard,
    Bell,
    Settings,
    BarChart3,
    ListOrdered,
    ShieldCheck,
    Key,
    UserCheck,
    Sparkles,
    Receipt,
    FileCheck,
    History,
    CheckCircle,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

// Role-aware navigation & identity
function useRoleNav() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const rolesArray: string[] = user?.roles ?? [];

    const isSuperAdmin = Boolean(
        user?.is_super_admin ||
        rolesArray.includes('Super Admin') ||
        user?.role === 'super_admin'
    );
    const isCashier = !isSuperAdmin && Boolean(
        user?.role === 'cashier' ||
        user?.email === 'cashier@dssc.edu.ph' ||
        rolesArray.includes('School Cashier') ||
        rolesArray.includes('Cashier')
    );
    const isStaff = !isSuperAdmin && !isCashier && Boolean(
        rolesArray.includes('Staff/Admin') ||
        user?.role === 'staff' ||
        user?.role === 'admin'
    );

    const studentItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Browse Items', href: '/items', icon: ShoppingBag },
        { title: 'My Reservations', href: '/reservations', icon: ClipboardList },
        { title: 'Queue Status', href: '/queue', icon: ListOrdered },
        { title: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
        { title: 'Payments', href: '/payments', icon: CreditCard },
        { title: 'Notifications', href: '/notifications', icon: Bell },
    ];

    const cashierItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Payments & Collections', href: '/cashier/payments', icon: CreditCard },
        { title: 'Payment Transactions', href: '/cashier/transactions', icon: Receipt },
        { title: 'Receipt Records', href: '/cashier/receipts', icon: FileCheck },
        { title: 'Payment History', href: '/cashier/history', icon: History },
        { title: 'Notifications', href: '/notifications', icon: Bell },
    ];

    const staffItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Reservations', href: '/admin/reservations', icon: ClipboardList },
        { title: 'Inventory & Stock', href: '/admin/inventory', icon: Package },
        { title: 'Queue Processing', href: '/admin/queue', icon: ListOrdered },
        { title: 'Payment Verification', href: '/admin/payments', icon: CreditCard },
        { title: 'Release / Claim', href: '/admin/reservations?status=ready_for_claiming', icon: CheckCircle },
        { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
        { title: 'Notifications', href: '/notifications', icon: Bell },
    ];

    const superAdminItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'User Management', href: '/admin/users', icon: Users },
        { title: 'Role Management', href: '/admin/roles', icon: ShieldCheck },
        { title: 'Permission Management', href: '/admin/permissions', icon: Key },
        { title: 'Create Super Admin', href: '/admin/super-admin/create', icon: UserCheck },
        { title: 'Reservations', href: '/admin/reservations', icon: ClipboardList },
        { title: 'Inventory & Stock', href: '/admin/inventory', icon: Package },
        { title: 'Queue Management', href: '/admin/queue', icon: ListOrdered },
        { title: 'Payments & Revenue', href: '/admin/payments', icon: CreditCard },
        { title: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
        { title: 'System Settings', href: '/admin/settings', icon: Settings },
        { title: 'Notifications', href: '/notifications', icon: Bell },
    ];

    if (isSuperAdmin) {
        return {
            items: superAdminItems,
            badgeText: 'Super Admin',
            badgeClass: 'bg-gradient-to-r from-[#173B8F]/10 via-[#243F96]/10 to-[#8B1028]/10 text-[#173B8F] border-[#173B8F]/25 shadow-2xs',
            sectionLabel: 'System Governance',
        };
    }
    if (isCashier) {
        return {
            items: cashierItems,
            badgeText: 'School Cashier',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
            sectionLabel: 'Payments & Collections',
        };
    }
    if (isStaff) {
        return {
            items: staffItems,
            badgeText: 'BEO Staff / Admin',
            badgeClass: 'bg-rose-50 text-[#641522] border-rose-200/80',
            sectionLabel: 'BEO Operations',
        };
    }
    return {
        items: studentItems,
        badgeText: 'Student Portal',
        badgeClass: 'bg-blue-50 text-[#123B8F] border-blue-200/80',
        sectionLabel: 'Overview',
    };
}

export function AppSidebar() {
    const { items, badgeText, badgeClass, sectionLabel } = useRoleNav();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="px-3 pt-0.5 pb-1 group-data-[collapsible=icon]:hidden">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {badgeText}
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} label={sectionLabel} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
