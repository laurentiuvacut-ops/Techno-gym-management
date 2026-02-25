'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Trash2, Save, ChevronDown, ChevronUp, Clock, History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Set {
  weight: string;
  reps: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export default function WorkoutsTab() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const logsRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return collection(firestore, 'members', user.phoneNumber, 'workoutLogs');
  }, [firestore, user]);

  const logsQuery = useMemo(() => {
    if (!logsRef) return null;
    return query(logsRef, orderBy('date', 'desc'), limit(20));
  }, [logsRef]);

  const { data: logs, isLoading } = useCollection(logsQuery);

  const addExercise = () => {
    setExercises([...exercises, { id: Math.random().toString(36), name: '', sets: [{ weight: '', reps: '' }] }]);
  };

  const removeExercise = (exId: string) => {
    setExercises(exercises.filter(e => e.id !== exId));
  };

  const updateExerciseName = (exId: string, name: string) => {
    setExercises(exercises.map(e => e.id === exId ? { ...e, name } : e));
  };

  const addSet = (exId: string) => {
    setExercises(exercises.map(e => {
      if (e.id === exId) {
        return { ...e, sets: [...e.sets, { weight: '', reps: '' }] };
      }
      return e;
    }));
  };

  const removeSet = (exId: string, setIndex: number) => {
    setExercises(exercises.map(e => {
      if (e.id === exId) {
        return { ...e, sets: e.sets.filter((_, i) => i !== setIndex) };
      }
      return e;
    }));
  };

  const updateSet = (exId: string, setIndex: number, field: keyof Set, value: string) => {
    setExercises(exercises.map(e => {
      if (e.id === exId) {
        const newSets = [...e.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...e, sets: newSets };
      }
      return e;
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logsRef || !workoutName.trim() || exercises.length === 0) {
      toast({ variant: "destructive", title: "Incomplet", description: "Adaugă un nume și cel puțin un exercițiu." });
      return;
    }

    setIsSubmitting(true);
    const data = {
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: serverTimestamp(),
      name: workoutName,
      duration: parseInt(duration) || 0,
      notes,
      exercises: exercises.map(e => ({
        name: e.name,
        sets: e.sets.map(s => ({
          weight: parseFloat(s.weight) || 0,
          reps: parseInt(s.reps) || 0
        }))
      }))
    };

    try {
      await addDoc(logsRef, data);
      toast({ title: "Salvat!", description: "Antrenamentul a fost înregistrat.", className: "bg-success text-success-foreground" });
      setShowForm(false);
      setWorkoutName('');
      setDuration('');
      setExercises([]);
      setNotes('');
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut salva jurnalul." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!logsRef) return;
    try {
      await deleteDoc(doc(logsRef, id));
      toast({ title: "Șters", description: "Înregistrarea a fost eliminată." });
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut șterge." });
    }
  };

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-12 w-64"/><Skeleton className="h-96 w-full rounded-3xl"/></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline tracking-wider flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-primary" />
            Jurnal Antrenament
          </h1>
          <p className="text-muted-foreground">Documentează-ți fiecare sesiune de efort.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="glow-primary rounded-xl h-12 px-6 font-bold uppercase tracking-wider">
          {showForm ? <><X className="mr-2 h-5 w-5" /> Închide</> : <><Plus className="mr-2 h-5 w-5" /> Antrenament Nou</>}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSave} className="overflow-hidden"
          >
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6 border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nume Antrenament</Label>
                  <Input value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="ex: Push Day, Legs..." className="bg-background/50 border-white/10 text-base" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Durată (minute)</Label>
                  <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60" className="bg-background/50 border-white/10 text-base" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline tracking-wide uppercase text-primary">Exerciții</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addExercise} className="rounded-lg border-primary/30 text-primary hover:bg-primary/10">
                    <Plus className="h-4 w-4 mr-1" /> Adaugă Exercițiu
                  </Button>
                </div>

                <div className="space-y-4">
                  {exercises.map((ex, exIdx) => (
                    <div key={ex.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input value={ex.name} onChange={e => updateExerciseName(ex.id, e.target.value)} placeholder="Nume exercițiu..." className="bg-transparent border-none p-0 text-lg font-bold placeholder:opacity-30 focus-visible:ring-0 text-base" />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExercise(ex.id)} className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {ex.sets.map((set, setIdx) => (
                          <div key={setIdx} className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-4">{setIdx + 1}</span>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input type="number" value={set.weight} onChange={e => updateSet(ex.id, setIdx, 'weight', e.target.value)} placeholder="kg" className="h-10 md:h-8 bg-background/50 border-white/5 text-base md:text-sm text-center" />
                              <Input type="number" value={set.reps} onChange={e => updateSet(ex.id, setIdx, 'reps', e.target.value)} placeholder="reps" className="h-10 md:h-8 bg-background/50 border-white/5 text-base md:text-sm text-center" />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSet(ex.id, setIdx)} className="h-8 w-8 opacity-30 hover:opacity-100 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="ghost" size="sm" onClick={() => addSet(ex.id)} className="w-full h-8 text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-white/5">
                          + Adaugă Set
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Note Sesiune</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-background/50 border-white/10 h-16 text-base" placeholder="Cum a fost?" />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-gradient-primary text-primary-foreground font-bold uppercase tracking-widest">
                {isSubmitting ? 'Se salvează...' : <><Save className="mr-2 h-5 w-5" /> Salvează Antrenamentul</>}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h2 className="text-xl font-headline tracking-wide uppercase flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Istoric Antrenamente
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {logs && logs.length > 0 ? (
            logs.map((log) => {
              const totalVolume = log.exercises.reduce((sum: number, ex: any) => 
                sum + ex.sets.reduce((sSum: number, s: any) => sSum + (parseFloat(s.weight) * parseInt(s.reps)), 0), 0);
              const isExpanded = expandedId === log.id;

              return (
                <div key={log.id} className="glass rounded-2xl overflow-hidden transition-all duration-300 border-white/5">
                  <div className="p-4 md:p-6 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold leading-none">{log.name}</h3>
                          <span className="text-[10px] py-0.5 px-2 bg-primary/20 text-primary rounded-full font-bold uppercase tracking-wider">{totalVolume} KG Volum</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{format(new Date(log.date), 'EEEE, dd MMMM', { locale: ro })}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                           <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" /> {log.duration} min
                           </div>
                           <div className="text-[10px] text-primary uppercase font-bold">{log.exercises.length} Exerciții</div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-white/5">
                        <div className="p-4 md:p-6 space-y-6 bg-black/20">
                          {log.notes && (
                            <div className="p-3 bg-primary/5 border-l-2 border-primary rounded-r-lg text-xs italic opacity-80">
                              "{log.notes}"
                            </div>
                          )}
                          <div className="space-y-4">
                            {log.exercises.map((ex: any, i: number) => (
                              <div key={i} className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-md bg-primary/20 text-[10px] flex items-center justify-center">{i + 1}</span>
                                  {ex.name}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                  {ex.sets.map((s: any, j: number) => (
                                    <div key={j} className="p-2 rounded-lg bg-white/5 text-[10px] text-center">
                                      <span className="text-muted-foreground block uppercase mb-1">Set {j + 1}</span>
                                      <span className="font-bold text-white">{s.weight}kg × {s.reps}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="pt-4 flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLog(log.id)} className="text-destructive hover:bg-destructive/10 rounded-xl h-9 px-4">
                              <Trash2 className="h-4 w-4 mr-2" /> Șterge Jurnal
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="p-12 glass rounded-3xl text-center flex flex-col items-center gap-3">
              <Dumbbell className="w-12 h-12 opacity-10" />
              <p className="text-muted-foreground italic">Niciun antrenament înregistrat încă.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
