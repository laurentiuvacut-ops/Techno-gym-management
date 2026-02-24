'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from '@/components/star-rating';
import { sendFeedbackEmail } from '@/ai/flows/send-feedback-email';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';

export default function FeedbackTab() {
  const firestore = useFirestore();
  const { setActiveTab } = useDashboardNav();
  const { toast } = useToast();
  
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!firestore || !comment.trim() || rating === 0) {
      toast({
            variant: "destructive",
            title: "Informații Incomplete",
            description: "Vă rugăm să selectați un rating și să adăugați un comentariu.",
        });
      return;
    };
    
    setIsSubmitting(true);
    try {
        const feedbackData = {
            rating: rating,
            comment,
            createdAt: serverTimestamp(),
        };

        const feedbackCollection = collection(firestore, 'feedback');
        await addDoc(feedbackCollection, feedbackData);
        
        sendFeedbackEmail({ rating, comment }).then(result => {
          if (!result.success) {
            console.error("Failed to send feedback email:", result.error);
          }
        });

        setIsSubmitted(true);
    } catch (error) {
        console.error("Error submitting feedback:", error);
        toast({
            variant: "destructive",
            title: "Eroare la trimitere",
            description: "A apărut o problemă. Vă rugăm să încercați din nou.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-6"
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

      <div className="space-y-1 text-center">
        <h1 className="text-4xl font-headline tracking-wider">Feedback</h1>
        <p className="text-muted-foreground">Lăsați o recenzie despre experiența dumneavoastră.</p>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center text-center p-8 glass rounded-3xl min-h-[300px]"
          >
            <CheckCircle className="w-20 h-20 text-primary mb-4" />
            <h2 className="text-3xl font-headline">Mulțumim!</h2>
            <p className="text-muted-foreground">Feedback-ul tău a fost trimis cu succes.</p>
            <Button onClick={() => setActiveTab('home')} className="mt-6">Dashboard</Button>
          </motion.div>
        ) : (
          <motion.div key="form" className="space-y-6">
            <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/10 p-4">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">100% Anonim</h3>
                <p className="text-sm text-primary/80">Feedback-ul este trimis anonim. Folosim aceste date strict pentru a ne îmbunătăți serviciile.</p>
              </div>
            </div>

            <div className="space-y-4 glass rounded-xl p-6">
              <label className="text-center block font-medium">Cum evaluezi experiența ta?</label>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            <div>
              <Textarea
                placeholder="Spune-ne cum ne descurcăm sau ce am putea îmbunătăți..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="bg-foreground/5 border-border/30 focus-visible:ring-primary text-base"
              />
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !comment.trim() || rating === 0} 
              className="w-full bg-gradient-primary text-primary-foreground text-base py-6"
            >
              {isSubmitting ? 'Se trimite...' : 'Trimite Feedback'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
