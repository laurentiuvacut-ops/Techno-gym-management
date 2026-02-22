'use client';

import { trainers } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Users, ArrowLeft } from 'lucide-react';
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";


export default function TrainersPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
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
        <Button asChild variant="outline" className="w-fit">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi la Panou
            </Link>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <a href={trainer.instagramUrl} target="_blank" rel="noopener noreferrer" className="group">
                <Card className="overflow-hidden relative aspect-square border-0 rounded-2xl glass transition-all duration-300 hover:border-primary/30">
                    <Image
                        src={trainer.image.imageUrl}
                        alt={trainer.name}
                        data-ai-hint={trainer.image.imageHint}
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
