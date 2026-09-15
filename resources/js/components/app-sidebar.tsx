import { Link, usePage } from '@inertiajs/react';
import { ArrowLeftRight, BookOpen, Building2, KeyRound, LayoutGrid, PlayCircle, ShieldCheck } from 'lucide-react';
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
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Transactions',
        href: '/dashboard/transactions',
        icon: ArrowLeftRight,
    },
    {
        title: 'Sandbox Tester',
        href: '/dashboard/simulator-test',
        icon: PlayCircle,
    },
    {
        title: 'Bank Channels (CRUD)',
        href: '/dashboard/admin/banks',
        icon: Building2,
    },
    {
        title: 'API Keys & Webhooks',
        href: '/dashboard/settings/api-keys',
        icon: KeyRound,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Simulator Docs',
        href: '/docs',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';
    const navigationItems = isAdmin
        ? mainNavItems
        : mainNavItems.filter((item) => item.href !== '/dashboard/admin/banks');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navigationItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
