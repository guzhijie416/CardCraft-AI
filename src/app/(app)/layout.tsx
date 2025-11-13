'use client';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  CreditCard,
  Beaker,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/create', label: 'Create New Card', icon: PlusCircle },
    { href: '/history', label: 'My History', icon: History },
    { href: '/account', label: 'My Account', icon: User },
    { href: '/pricing', label: 'Billing & Plans', icon: CreditCard },
    { href: '/dev/template-generator', label: 'Template Generator', icon: Beaker },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="p-4 sm:px-6 sm:py-0 space-y-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
