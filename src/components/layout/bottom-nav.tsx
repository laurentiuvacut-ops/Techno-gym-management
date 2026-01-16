"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Home, Library, MessageSquare, ShoppingBag, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/subscriptions", label: "Plans", icon: Award },
  { href: "/workouts", label: "Workouts", icon: Library },
  { href: "/trainers", label: "Trainers", icon: Users },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-sm border-t border-border/50 z-50">
      <div className="grid grid-cols-6 h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
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
