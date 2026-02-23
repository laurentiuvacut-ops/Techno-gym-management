'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import StarRating from '@/components/star-rating';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ArrowLeft, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

type Feedback = {
  id: string;
  rating: number;
  comment: string;
  createdAt: any;
};

export default function ViewFeedbackPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const feedbackQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: feedbackData, isLoading: feedbackLoading } = useCollection<Feedback>(feedbackQuery);

  if (!user || !mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <Button asChild variant="outline" className="w-fit">
          <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la Panou
          </Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-4xl font-headline tracking-wider flex items-center gap-3">
          <Inbox className="w-8 h-8" />
          Feedback Primit
        </h1>
        <p className="text-muted-foreground">Recenziile lăsate de membri.</p>
      </div>

      {feedbackLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl glass" />
            ))}
        </div>
      ) : feedbackData && feedbackData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackData.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
                <Card className="glass h-full flex flex-col">
                    <CardHeader className="items-center pb-2">
                        <StarRating rating={feedback.rating} />
                    </CardHeader>
                    <CardContent className="flex-1 text-center">
                        <p className="italic text-foreground/80 leading-relaxed">"{feedback.comment}"</p>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground justify-end pt-4 border-t border-border/30">
                        {feedback.createdAt ? (
                             <p suppressHydrationWarning>
                                {formatDistanceToNow(feedback.createdAt.toDate ? feedback.createdAt.toDate() : new Date(feedback.createdAt.seconds * 1000), { locale: ro, addSuffix: true })}
                            </p>
                        ) : (
                            <p>Recent</p>
                        )}
                    </CardFooter>
                </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-12 glass rounded-3xl min-h-[300px]">
            <Inbox className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-2xl font-headline">Niciun Feedback</h2>
            <p className="text-muted-foreground">Momentan nu există recenzii.</p>
        </div>
      )}
    </motion.div>
  );
}
