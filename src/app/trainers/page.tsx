'use client';

import { trainers } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Meet Our Trainers
        </h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
          Our certified trainers are here to help you achieve your fitness goals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {trainers.map((trainer) => (
          <Card key={trainer.id} className="flex flex-col sm:flex-row items-center gap-6 p-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={trainer.image.imageUrl} alt={trainer.name} data-ai-hint={trainer.image.imageHint} />
              <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-xl font-bold">{trainer.name}</h2>
              <Badge variant="secondary" className="mt-1">{trainer.specialty}</Badge>
            </div>
            <Button className="w-full sm:w-auto">Book Session</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
