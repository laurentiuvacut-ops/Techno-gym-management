'use client';

import { Dumbbell, Construction, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';

export default function WorkoutsTab() {
  const { setActiveTab } = useDashboardNav();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setActiveTab('home')}
        className="text-muted-foreground hover:text-primary p-0 h-auto gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Button>

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
