import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({ items, label }: { items: NavItem[]; label?: string }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
                {label ?? 'Platform'}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={cn(
                                    'transition-all text-xs font-medium rounded-lg px-3 py-2 relative',
                                    active
                                        ? 'bg-[#173B8F]/10 text-[#173B8F] font-semibold hover:bg-[#173B8F]/15 hover:text-[#173B8F] shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
                                )}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-2.5 w-full">
                                    {item.icon && (
                                        <item.icon
                                            className={cn(
                                                'w-4 h-4 shrink-0 transition-colors',
                                                active ? 'text-[#173B8F]' : 'text-slate-500',
                                            )}
                                        />
                                    )}
                                    <span className="truncate flex-1">{item.title}</span>
                                    {active && (
                                        <span
                                            aria-hidden="true"
                                            className="w-1 h-3.5 rounded-full bg-gradient-to-b from-[#173B8F] to-[#8B1028] shrink-0"
                                        />
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
