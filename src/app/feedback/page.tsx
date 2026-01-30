'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/star-rating';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function FeedbackPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleSubmit = async () => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu sunteți autentificat.",
      });
      return;
    };
    
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Vă rugăm selectați un rating",
        description: "Trebuie să acorzi o evaluare de la 1 la 5 stele.",
      });
      return;
    }

    setIsSubmitting(true);

    const feedbackCollection = collection(firestore, 'feedback');
    
    addDoc(feedbackCollection, {
      userId: user.uid,
      userName: user.displayName || 'Anonim',
      rating,
      comment,
      createdAt: serverTimestamp(),
    }).then(() => {
      toast({
        title: "Mulțumim pentru feedback!",
        description: "Opinia ta este importantă pentru noi.",
      });
      setRating(0);
      setComment('');
      router.push('/dashboard');
    }).catch(error => {
      console.error("Error submitting feedback:", error);
      const requestData = {
          userId: user.uid,
          userName: user.displayName || 'Anonim',
          rating,
          comment,
      };
      const contextualError = new FirestorePermissionError({
          operation: 'create',
          path: feedbackCollection.path,
          requestResourceData: requestData
      });
      errorEmitter.emit('permission-error', contextualError);

      toast({
        variant: "destructive",
        title: "Eroare la trimitere",
        description: "A apărut o problemă. Vă rugăm să încercați din nou.",
      });
    }).finally(() => {
      setIsSubmitting(false);
    });
  };

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
       <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Feedback
        </h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
          Spune-ne cum ne descurcăm! Părerea ta contează.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Cum evaluezi experiența ta?</CardTitle>
          <CardDescription>Selectează un număr de stele.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StarRating rating={rating} onRatingChange={setRating} />
          
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">Lasă un comentariu (opțional)</label>
            <Textarea 
              id="comment"
              placeholder="Spune-ne mai multe despre experiența ta..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="w-full">
            {isSubmitting ? 'Se trimite...' : 'Trimite Feedback'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
