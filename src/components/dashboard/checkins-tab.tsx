'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isFuture, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { CalendarCheck, ChevronLeft, ChevronRight, Check, History, TrendingUp, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CheckinsTab() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const checkinsRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return collection(firestore, 'members', user.phoneNumber, 'checkins');
  }, [firestore, user]);

  const checkinsQuery = useMemo(() => {
    if (!checkinsRef) return null;
    return query(checkinsRef, orderBy('date', 'desc'), limit(100));
  }, [checkinsRef]);

  const { data: checkins, isLoading } = useCollection(checkinsQuery);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const hasCheckedInToday = checkins?.some(c => c.date === todayStr);

  const stats = useMemo(() => {
    if (!checkins) return { monthly: 0, weekly: 0, streak: 0 };

    const now = new Date();
    const monthStart = startOfMonth(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    const monthly = checkins.filter(c => new Date(c.date) >= monthStart).length;
    const weekly = checkins.filter(c => new Date(c.date) >= weekStart).length;

    // Calculate streak
    let streak = 0;
    const sortedDates = checkins
      .map(c => c.date)
      .sort((a, b) => b.localeCompare(a));

    if (sortedDates.length > 0) {
      let currentCheck = new Date();
      if (sortedDates[0] !== format(currentCheck, 'yyyy-MM-dd')) {
        currentCheck = subMonths(currentCheck, 0); // No change, just a helper
      }

      // Check for current day or yesterday to continue streak
      const lastCheck = new Date(sortedDates[0]);
      const diffDays = differenceInDays(new Date(format(new Date(), 'yyyy-MM-dd')), lastCheck);

      if (diffDays <= 1) {
        streak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
          const d1 = new Date(sortedDates[i]);
          const d2 = new Date(sortedDates[i+1]);
          if (differenceInDays(d1, d2) === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return { monthly, weekly, streak };
  }, [checkins]);

  const handleCheckin = async () => {
    if (!user?.phoneNumber || !firestore) return;

    try {
      await setDoc(doc(firestore, 'members', user.phoneNumber, 'checkins', todayStr), {
        date: todayStr,
        time: format(new Date(), 'HH:mm'),
        source: 'manual'
      });
      toast({ title: "Check-in Reușit!", description: "Prezența ta a fost înregistrată.", className: "bg-success text-success-foreground" });
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut face check-in." });
    }
  };

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Fill in days from previous month to align with Monday
    const startDay = (start.getDay() + 6) % 7; // Adjust for Monday start
    const padding = Array.from({ length: startDay }).map((_, i) => null);
    
    return [...padding, ...days];
  }, [currentMonth]);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-32 w-full rounded-3xl"/><Skeleton className="h-96 w-full rounded-3xl"/></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-10">
      <div className="space-y-1">
        <h1 className="text-4xl font-headline tracking-wider flex items-center gap-3">
          <CalendarCheck className="w-8 h-8 text-primary" />
          Prezențe
        </h1>
        <p className="text-muted-foreground">Monitorizează-ți consistența la antrenamente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="text-primary w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Luna Aceasta</p>
            <p className="text-2xl font-headline text-white">{stats.monthly} Vizite</p>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CalendarCheck className="text-primary w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Săptămâna Aceasta</p>
            <p className="text-2xl font-headline text-white">{stats.weekly} Zile</p>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <Flame className="text-orange-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Serie Curentă</p>
            <p className="text-2xl font-headline text-white">{stats.streak} Zile Consecutive</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline tracking-wide uppercase">{format(currentMonth, 'MMMM yyyy', { locale: ro })}</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl bg-white/5 hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl bg-white/5 hover:bg-white/10"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="text-[10px] font-bold text-muted-foreground py-2">{d}</div>)}
            {daysInMonth.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} className="aspect-square" />;
              
              const dayStr = format(day, 'yyyy-MM-dd');
              const checked = checkins?.some(c => c.date === dayStr);
              const today = isToday(day);
              const future = isFuture(day);

              return (
                <div 
                  key={dayStr} 
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all",
                    checked ? "bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground",
                    today && !checked && "border border-primary/50 text-primary",
                    future && "opacity-20 cursor-default"
                  )}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>

          <Button 
            onClick={handleCheckin} 
            disabled={hasCheckedInToday} 
            className={cn(
              "w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-base",
              hasCheckedInToday ? "bg-success/20 text-success border border-success/30" : "glow-primary bg-gradient-primary text-primary-foreground"
            )}
          >
            {hasCheckedInToday ? <><Check className="mr-2 h-6 w-6" /> Prezent Astăzi</> : "Check-in Azi"}
          </Button>
        </div>

        <div className="glass rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-headline tracking-wide uppercase">Istoric Prezențe</h2>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[440px]">
            {checkins && checkins.length > 0 ? (
              <div className="divide-y divide-white/5">
                {checkins.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <p className="font-bold text-sm">{format(new Date(c.date), 'EEEE, dd MMMM', { locale: ro })}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ora: {c.time}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="text-primary h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-muted-foreground italic text-sm">Nicio prezență înregistrată.</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}