'use client';

import { trainers } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Users } from 'lucide-react';
import { motion } from "framer-motion";

export default function TrainersPage() {
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
          <Users className="w-8 h-8" />
          Antrenori
        </h1>
        <p className="text-muted-foreground">Experții noștri certificați sunt dedicați să te ajute să îți atingi obiectivele.</p>
      </div>

      <div className="flex flex-col gap-3">
        {trainers.map((trainer, index) => (
          <motion.div
            key={trainer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="flex flex-col sm:flex-row items-center gap-6 p-6 glass">
              <a href={trainer.instagramUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                <Avatar className="w-24 h-24 border-4 border-primary hover:border-accent transition-colors">
                  <AvatarImage src={trainer.image.imageUrl} alt={trainer.name} data-ai-hint={trainer.image.imageHint} />
                  <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </a>
              <div className="flex-grow text-center sm:text-left">
                <h2 className="text-xl font-bold">{trainer.name}</h2>
                <Badge variant="secondary" className="mt-1">{trainer.specialty}</Badge>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <a href={trainer.instagramUrl} target="_blank" rel="noopener noreferrer">
                  Rezervă o ședință
                </a>
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
