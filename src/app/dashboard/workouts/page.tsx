'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Dumbbell, Construction } from "lucide-react";
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

      <div className="flex flex-col items-center justify-center text-center p-8 glass rounded-3xl min-h-[300px]">
        <Construction className="w-20 h-20 text-primary mb-4" />
        <h2 className="text-3xl font-headline">Va Urma!</h2>
        <p className="text-muted-foreground max-w-md">Lucrăm la o bibliotecă completă de antrenamente video. Reveniți în curând pentru a descoperi noi modalități de a vă atinge obiectivele!</p>
      </div>
      
    </motion.div>
  );
}
