'use client';

import { shopItems } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const getStockVariant = (stock: string) => {
    if (stock === "In Stock") return "success";
    if (stock === "Low Stock") return "warning";
    return "destructive";
};

export default function ShopPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Gym Shop
        </h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
          Fuel your workout with our selection of supplements and gear.
        </p>
      </div>

      <div className="glass rounded-lg">
        <ul className="divide-y divide-border/50">
          {shopItems.map((item) => (
            <li key={item.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.price}</p>
              </div>
              <Badge variant={getStockVariant(item.stock)}>{item.stock}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
