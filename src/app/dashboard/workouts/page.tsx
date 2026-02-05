'use client';

import { workouts } from "@/lib/data";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkoutsPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="space-y-1">
        <h1 className="text-4xl font-headline tracking-wider flex items-center gap-3">
          <Dumbbell className="w-8 h-8" />
          Antrenamente
        </h1>
        <p className="text-muted-foreground">Găsește-ți următoarea provocare. Răsfoiește biblioteca noastră de antrenamente ghidate.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link href="#">
              <Card className="relative overflow-hidden group h-64 glass">
                <Image
                  src={workout.image.imageUrl}
                  alt={workout.image.description}
                  data-ai-hint={workout.image.imageHint}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h2 className="text-2xl font-bold text-white">
                    {workout.category}
                  </h2>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
