'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  ShoppingBag,
  CreditCard,
  Dumbbell,
  Users,
  MessageSquare,
  Ruler,
  CalendarCheck,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { useMember } from '@/contexts/member-context';
import { useDashboardNav, type DashboardTab } from '@/contexts/dashboard-nav-context';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const mainNavItems: { tab: DashboardTab; label: string; icon: any }[] = [
  { tab: 'home', label: 'Acasă', icon: Home },
  { tab: 'shop', label: 'Shop & Stoc', icon: ShoppingBag },
  { tab: 'plans', label: 'Abonamente', icon: CreditCard },
  { tab: 'workouts', label: 'Jurnal', icon: Dumbbell },
  { tab: 'progress', label: 'Progres', icon: Ruler },
  { tab: 'checkins', label: 'Prezențe', icon: CalendarCheck },
  { tab: 'trainers', label: 'Antrenori', icon: Users },
  { tab: 'feedback', label: 'Feedback', icon: MessageSquare },
];

export default function DashboardSidebar() {
  const { user } = useUser();
  const { memberData } = useMember();
  const { activeTab, setActiveTab } = useDashboardNav();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const displayPhotoUrl = memberData?.photoURL || user?.photoURL || undefined;
  const displayName = memberData?.name || user?.displayName || 'Membru';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-6 border-b border-border/50">
          <button onClick={() => { setActiveTab('home'); handleLinkClick(); }} className="flex items-center gap-4 text-left">
              <div className="relative w-10 h-10 shrink-0">
                <Image 
                  src="https://i.imgur.com/9W1ye1w.png" 
                  alt="Techno Gym Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 truncate">
                TECHNO GYM
              </span>
          </button>
      </SidebarHeader>

      <SidebarContent>
        <div className="flex-1 space-y-4 p-4">
          <SidebarMenu className="space-y-1">
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.tab}>
                <SidebarMenuButton
                  isActive={activeTab === item.tab}
                  className={cn(
                    "w-full justify-start h-auto px-4 py-3 rounded-xl transition-all duration-200 text-base gap-4",
                    activeTab === item.tab
                      ? "bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-400 shadow-sm shadow-cyan-500/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                  tooltip={item.label}
                  onClick={() => { setActiveTab(item.tab); handleLinkClick(); }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-6 mt-auto border-t border-border/50">
        {user && (
          <button onClick={() => { setActiveTab('profile'); handleLinkClick(); }} className="flex items-center gap-3 text-left w-full">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={displayPhotoUrl} alt={displayName} className="object-cover" />
                <AvatarFallback className="font-medium bg-gradient-to-br from-cyan-400 to-cyan-600 text-white">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-400">Membru Premium</p>
              </div>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
