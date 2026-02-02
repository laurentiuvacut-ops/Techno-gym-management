'use client';

import { workouts } from "@/lib/data";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Workout Library
        </h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
          Find your next challenge. Browse our library of guided workouts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {workouts.map((workout) => (
          <Link href="#" key={workout.id}>
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
        ))}
      </div>
    </div>
  );
}
