'use client';

import { trainers } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Users, ArrowLeft } from 'lucide-react';
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';

export default function TrainersTab() {
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
        className="text-white hover:text-primary gap-2 h-9 px-4 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Acasa
      </Button>

       <div className="space-y-1">
        <h1 className="text-4xl font-headline tracking-wider flex items-center gap-3">
          <Users className="w-8 h-8" />
          Antrenori
        </h1>
        <p className="text-muted-foreground">Experții noștri certificați sunt dedicați să te ajute să îți atingi obiectivele.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer, index) => (
          <motion.div
            key={trainer.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <a href={trainer.instagramUrl} target="_blank" rel="noopener noreferrer" className="group">
                <Card className="overflow-hidden relative aspect-square border-0 rounded-2xl glass transition-all duration-300 hover:border-primary/30">
                    <Image
                        src={trainer.image.imageUrl}
                        alt={trainer.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                        <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
                        <p className="text-primary font-semibold text-sm">{trainer.specialty}</p>
                    </div>
                </Card>
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
// FIX #18: Eliminat data-ai-hint nefolosit în producție
