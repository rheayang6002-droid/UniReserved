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
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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

// Role-aware nav — we show sections based on the user's role
function useNavItems() {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role ?? 'student';

    const studentItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Browse Items', href: '/items', icon: ShoppingBag },
        { title: 'My Reservations', href: '/reservations', icon: ClipboardList },
        { title: 'Queue Status', href: '/queue', icon: ListOrdered },
        { title: 'Payments', href: '/payments', icon: CreditCard },
        { title: 'Notifications', href: '/notifications', icon: Bell },
    ];

    const staffItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Reservations', href: '/admin/reservations', icon: ClipboardList },
        { title: 'Inventory', href: '/admin/inventory', icon: Package },
        { title: 'Queue Management', href: '/admin/queue', icon: ListOrdered },
        { title: 'Payments', href: '/admin/payments', icon: CreditCard },
        { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
    ];

    const adminItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Reservations', href: '/admin/reservations', icon: ClipboardList },
        { title: 'Inventory', href: '/admin/inventory', icon: Package },
        { title: 'Queue Management', href: '/admin/queue', icon: ListOrdered },
        { title: 'Payments', href: '/admin/payments', icon: CreditCard },
        { title: 'User Management', href: '/admin/users', icon: Users },
        { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
        { title: 'System Settings', href: '/admin/settings', icon: Settings },
    ];

    if (role === 'admin') return adminItems;
    if (role === 'staff') return staffItems;
    return studentItems;
}

export function AppSidebar() {
    const navItems = useNavItems();

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
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
