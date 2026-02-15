'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Home,
  ShoppingBag,
  CreditCard,
  Dumbbell,
  Users,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', label: 'Acasă', icon: Home },
  { href: '/dashboard/shop', label: 'Shop & Stoc', icon: ShoppingBag },
  { href: '/dashboard/plans', label: 'Abonamente', icon: CreditCard },
  { href: '/dashboard/workouts', label: 'Antrenamente', icon: Dumbbell },
  { href: '/dashboard/trainers', label: 'Antrenori', icon: Users },
  { href: '/dashboard/feedback', label: 'Trimite Feedback', icon: MessageSquare },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-6 border-b border-[#1f2937]">
          <Link href="/dashboard" className="flex items-center gap-4">
              <div className="relative w-10 h-10">
                <Image 
                  src="https://i.imgur.com/9W1ye1w.png" 
                  alt="Techno Gym Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                TECHNO GYM
              </span>
          </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  "w-full justify-start h-auto px-4 py-3 rounded-xl transition-all duration-200 text-base gap-4",
                  pathname === item.href
                    ? "bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-400 shadow-sm shadow-cyan-500/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6 mt-auto border-t border-[#1f2937]">
        {user && (
          <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                <AvatarFallback className="font-medium bg-gradient-to-br from-cyan-400 to-cyan-600 text-white">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'L'}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium text-white truncate">{user.displayName || 'Membru'}</p>
                <p className="text-xs text-gray-400">Membru Premium</p>
              </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
