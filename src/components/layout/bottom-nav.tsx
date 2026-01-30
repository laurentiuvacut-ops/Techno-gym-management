"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Home, Dumbbell, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

const navItems = [
  { href: "/", label: "Acasă", icon: Home },
  { href: "/workouts", label: "Antrenament", icon: Dumbbell },
  { href: "/subscriptions", label: "Planuri", icon: Award },
  { href: "/shop", label: "Magazin", icon: ShoppingBag },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  const profileItem = loading 
    ? { href: "/login", label: "Profil", icon: User, disabled: true }
    : user 
    ? { href: "/profile", label: "Profil", icon: User }
    : { href: "/login", label: "Login", icon: User };

  const allNavItems = [...navItems, profileItem];


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-sm border-t border-border/50 z-50">
      <div className="grid grid-cols-5 h-full">
        {allNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary",
                item.disabled && "pointer-events-none opacity-50"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
