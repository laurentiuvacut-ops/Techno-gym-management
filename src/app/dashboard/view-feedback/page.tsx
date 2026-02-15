'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowLeft, Inbox, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Helper component for displaying star ratings
const DisplayStars = ({ rating, className }: { rating: number; className?: string }) => (
  <div className={`flex items-center gap-0.5 ${className}`}>
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/50'}`}
      />
    ))}
  </div>
);

export default function ViewFeedbackPage() {
  const firestore = useFirestore();

  const feedbackQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: feedbackData, isLoading } = useCollection(feedbackQuery);

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
          <Inbox className="w-8 h-8" />
          Mesaje Feedback
        </h1>
        <p className="text-muted-foreground">Iată ce spun membrii tăi.</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && (!feedbackData || feedbackData.length === 0) && (
        <div className="flex flex-col items-center justify-center text-center p-8 glass rounded-3xl min-h-[300px]">
          <MessageSquare className="w-20 h-20 text-primary mb-4" />
          <h2 className="text-3xl font-headline">Niciun feedback</h2>
          <p className="text-muted-foreground max-w-md">
            Nu a fost primit niciun feedback încă. Când membrii vor trimite opinii, ele vor apărea aici.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {feedbackData?.map((feedback) => (
          <Card key={feedback.id} className="glass">
            <CardHeader className="flex-row items-center justify-between pb-2">
                <DisplayStars rating={feedback.rating} />
                 {feedback.createdAt && (
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(feedback.createdAt.toDate(), { addSuffix: true, locale: ro })}
                    </p>
                )}
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90">{feedback.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
