'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Dumbbell, Clock, Copy, Info, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDoc, serverTimestamp, CollectionReference } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { SharedWorkout } from '@/types/workout';

interface WorkoutCommunityProps {
  communityWorkouts: SharedWorkout[];
  logsRef: CollectionReference | null;
  onCopied: () => void;
}

export default function WorkoutCommunity({ communityWorkouts, logsRef, onCopied }: WorkoutCommunityProps) {
  const { toast } = useToast();
  const [expandedCommunityId, setExpandedCommunityId] = useState<string | null>(null);

  const handleCopySharedWorkout = useCallback(async (sharedWorkout: SharedWorkout) => {
    if (!logsRef) return;
    
    toast({ title: "Se copiază...", description: "Vă rugăm așteptați." });
    
    try {
      for (const w of sharedWorkout.workouts) {
        await addDoc(logsRef, {
          ...w,
          date: format(new Date(), 'yyyy-MM-dd'),
          createdAt: serverTimestamp(),
        });
      }
      toast({ title: "Succes!", description: "Antrenamentele au fost adăugate în jurnalul tău.", className: "bg-success text-success-foreground" });
      onCopied();
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut copia antrenamentul." });
    }
  }, [logsRef, toast, onCopied]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {communityWorkouts && communityWorkouts.length > 0 ? (
        communityWorkouts.map((shared) => {
          const isExpanded = expandedCommunityId === shared.id;
          
          return (
            <div key={shared.id} className="glass rounded-3xl overflow-hidden flex flex-col h-full border-primary/10 hover:border-primary/30 transition-all duration-300">
              <div className="p-6 border-b border-white/5 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-primary leading-tight">{shared.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      Publicat de <span className="text-white font-bold">{shared.creatorName}</span>
                      {shared.createdAt && (
                        <span className="opacity-50">• {format(shared.createdAt.toDate(), 'dd MMM', { locale: ro })}</span>
                      )}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleCopySharedWorkout(shared)}
                    className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copiază
                  </Button>
                </div>
              </div>
              <div className="p-6 flex-1 space-y-4">
                {shared.description && (
                  <div className="p-4 bg-white/5 border-l-2 border-primary rounded-r-xl text-sm italic opacity-80 flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>"{shared.description}"</span>
                  </div>
                )}
                
                <div className="flex gap-4 text-[10px] uppercase font-bold text-muted-foreground mb-2">
                   <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {shared.workouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0)} MIN</span>
                   <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {shared.workouts.length} SESIUNI</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                      onClick={() => setExpandedCommunityId(isExpanded ? null : shared.id)}
                      className="text-[10px] uppercase tracking-widest font-bold text-primary/70 hover:text-primary flex items-center gap-1 transition-colors"
                  >
                      {isExpanded ? <><ChevronUp className="w-3 h-3" /> Ascunde Detalii</> : <><ChevronDown className="w-3 h-3" /> Vezi Exerciții</>}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                         {shared.workouts.map((w: any, idx: number) => (
                           <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5">
                              <p className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{w.name}</p>
                              <div className="flex flex-wrap gap-2">
                                 {w.exercises.map((ex: any, eIdx: number) => (
                                   <span key={eIdx} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                     {ex.name}
                                   </span>
                                 ))}
                              </div>
                           </div>
                         ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full p-20 glass rounded-3xl text-center flex flex-col items-center gap-4">
          <Users className="w-16 h-16 opacity-10" />
          <p className="text-muted-foreground italic">Încă nu sunt antrenamente în comunitate. Fii tu primul!</p>
        </div>
      )}
    </div>
  );
}
// FIX #17: Tipizare strictă pentru secțiunea comunitate
