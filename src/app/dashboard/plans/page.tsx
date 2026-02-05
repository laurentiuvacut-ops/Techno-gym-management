'use client';
import { subscriptions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { doc, updateDoc } from "firebase/firestore";
import { useMemo, useState, useEffect } from 'react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function PlansPage() {
  const { user, loading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const memberDocRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'members', user.uid);
  }, [firestore, user]);

  const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleUpdateSubscription = async (plan: any) => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a schimba planul.",
      });
      return;
    }

    setIsUpdating(plan.id);
    const memberDocRef = doc(firestore, 'members', user.uid);

    try {
      await updateDoc(memberDocRef, {
        subscriptionId: plan.id,
        status: "Active",
        daysRemaining: 30,
      });

      toast({
        title: "Felicitări!",
        description: `Abonamentul tău ${plan.title} este acum activ.`,
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        variant: "destructive",
        title: "Eroare la actualizare",
        description: "A apărut o problemă. Vă rugăm să încercați din nou.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  if (loading || memberLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentPlanId = memberData?.subscriptionId;

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
      <div className="space-y-1 text-center">
        <h1 className="text-4xl font-headline tracking-wider">Abonamente</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Alege planul care ți se potrivește. Poți anula sau schimba oricând.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptions.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPopular = plan.popular;
          const isFeatured = isCurrent || isPopular;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative p-6 rounded-3xl h-full flex flex-col transition-all duration-300",
                isFeatured ? "bg-gradient-primary text-primary-foreground glow-primary" : "glass"
              )}
            >
              {isCurrent && (
                <Badge variant="secondary" className="absolute top-4 right-4">Planul Actual</Badge>
              )}
               {isPopular && !isCurrent && (
                <Badge variant="secondary" className="absolute top-4 right-4 flex items-center gap-1">
                  <Star className="w-3 h-3"/> Popular
                </Badge>
              )}
              
              <div className="flex-grow">
                <h3 className="text-2xl font-headline">{plan.title}</h3>
                <p className={cn("text-sm", isFeatured ? "text-primary-foreground/80" : "text-muted-foreground")}>{plan.description}</p>
                
                <div className="my-6">
                  <span className={cn("text-5xl font-bold", !isFeatured && "text-gradient")}>{plan.price.split(' ')[0]}</span>
                  <span className={cn("text-lg", isFeatured ? "text-primary-foreground/80" : "text-muted-foreground")}> {plan.price.split(' ')[1]}{plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", isFeatured ? "bg-white/20" : "bg-primary/20")}>
                        <Check className={cn("w-3.5 h-3.5", isFeatured ? "text-primary-foreground" : "text-primary")} />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button 
                  onClick={() => handleUpdateSubscription(plan)}
                  disabled={isUpdating === plan.id}
                  className={cn("w-full", isFeatured ? "bg-primary-foreground text-primary hover:bg-white/90" : "bg-primary/20 text-primary hover:bg-primary/30")}
                >
                  {isUpdating === plan.id 
                    ? 'Se activează...' 
                    : isCurrent 
                      ? 'Reînnoiește' 
                      : plan.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
