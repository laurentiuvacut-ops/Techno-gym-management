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
  Award,
  Home,
  LogOut,
  MessageSquare,
  ShoppingBag,
  Dumbbell,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '../ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Acasă', icon: Home },
  { href: '/dashboard/shop', label: 'Shop & Stoc', icon: ShoppingBag },
  { href: '/dashboard/plans', label: 'Abonamente', icon: Award },
  { href: '/dashboard/workouts', label: 'Antrenamente', icon: Dumbbell },
  { href: '/dashboard/trainers', label: 'Antrenori', icon: Users },
  { href: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // We need to make sure the active path is only calculated on the client
  // to avoid hydration mismatches.
  const [activePath, setActivePath] = useState('');

  useEffect(() => {
    // On client-side mount, set the active path.
    setActivePath(pathname);
  }, [pathname]);


  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
           <div className="relative w-8 h-8">
            <Image 
              src="https://i.imgur.com/9W1ye1w.png" 
              alt="Techno Gym Logo" 
              fill
              className="object-contain"
            />
           </div>
           <span className="text-xl font-bold tracking-tight text-gradient">TECHNO GYM</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={activePath === item.href}
                className="data-[active=true]:bg-primary/20 data-[active=true]:text-primary text-muted-foreground hover:text-foreground hover:bg-muted/50 h-11 text-base"
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-11 text-base" onClick={handleSignOut}>
            <LogOut className="h-6 w-6" />
            <span className="group-data-[collapsible=icon]:hidden">Deconectare</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
