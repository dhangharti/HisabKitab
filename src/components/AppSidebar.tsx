
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  SidebarTitle,
} from '@/components/ui/sidebar-new';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  User,
  CreditCard,
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import { useFirebase } from '@/firebase';

export function AppSidebar() {
  const pathname = usePathname();
  const { auth } = useFirebase();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/help', label: 'Help', icon: LifeBuoy },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <SidebarTitle>RinMitra</SidebarTitle>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  icon={<item.icon />}
                  tooltip={item.label}
                >
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => auth?.signOut()} icon={<LogOut />}>
            Sign Out
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
