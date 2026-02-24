'use client';

import { useMemo } from 'react';
import { motion } from "framer-motion";
import { Package, Droplet, Zap, Dna, Shirt, ShoppingBag, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// Mapping icons based on product names
const productIcons: { [key: string]: React.FC<any> } = {
  "Protein Whey 2kg": Package,
  "Apă minerală 0.5L": Droplet,
  "Baton proteic": Zap,
  "BCAA 500g": Dna,
  "Pre-workout": Zap,
  "Default": Shirt
};

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  category: string;
  order: number;
}

export default function ShopPage() {
  const firestore = useFirestore();

  // Create memoized query to fetch products sorted by 'order'
  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <Button asChild variant="outline" className="w-fit">
          <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la Panou
          </Link>
      </Button>
      
      <div className="space-y-1">
        <h1 className="text-4xl font-headline tracking-wider flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" />
          Shop & Stoc
        </h1>
        <p className="text-muted-foreground">Verifică disponibilitatea produselor noastre în timp real.</p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border/20 bg-foreground/5 p-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : products && products.length > 0 ? (
          products.map((item, index) => {
            const Icon = productIcons[item.name] || productIcons.Default;
            const isInStock = item.stock > 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-4 rounded-xl border border-border/20 bg-foreground/5 p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border/20 bg-background">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.price} RON</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", isInStock ? "bg-primary" : "bg-destructive")} />
                  <span className={cn("text-sm font-medium", isInStock ? "text-primary" : "text-destructive")}>
                    {isInStock ? `${item.stock} în stoc` : 'Stoc epuizat'}
                  </span>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 glass rounded-3xl">
            <p className="text-muted-foreground">Nu există produse disponibile momentan.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
