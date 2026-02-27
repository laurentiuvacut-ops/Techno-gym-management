'use client';

import React, { useState, useCallback } from 'react';
import { addDoc, serverTimestamp, doc, updateDoc, type CollectionReference } from 'firebase/firestore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, Video, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMember } from '@/contexts/member-context';
import type { WorkoutLog } from '@/types/workout';

interface InternalExercise {
  id: string;
  name: string;
  videoUrl: string;
  imageUrl: string;
  showMediaInputs: boolean;
  sets: { weight: string; reps: string }[];
}

interface WorkoutFormProps {
  logsRef: CollectionReference | null;
  initialData?: Partial<WorkoutLog>;
  editingId?: string | null;
  onCancel: () => void;
  onSaved: () => void;
}

export default function WorkoutForm({ logsRef, initialData, editingId, onCancel, onSaved }: WorkoutFormProps) {
  const { toast } = useToast();
  const { isAdmin } = useMember();
  
  const [workoutName, setWorkoutName] = useState(initialData?.name || '');
  const [duration, setDuration] = useState(initialData?.duration ? initialData.duration.toString() : '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [exercises, setExercises] = useState<InternalExercise[]>(() => {
    if (!initialData?.exercises || !Array.isArray(initialData.exercises)) {
      return [{ 
        id: 'new-exercise-0', 
        name: '', 
        videoUrl: '',
        imageUrl: '',
        showMediaInputs: false,
        sets: [{ weight: '', reps: '' }] 
      }];
    }
    return initialData.exercises.map((ex: any, idx: number) => ({
      id: `existing-exercise-${idx}`,
      name: ex.name || '',
      videoUrl: ex.videoUrl || '',
      imageUrl: ex.imageUrl || '',
      showMediaInputs: !!(ex.videoUrl || ex.imageUrl),
      sets: Array.isArray(ex.sets) ? ex.sets.map((s: any) => ({
        weight: s.weight ? s.weight.toString() : '',
        reps: s.reps ? s.reps.toString() : ''
      })) : [{ weight: '', reps: '' }]
    }));
  });

  const addExercise = useCallback(() => {
    setExercises(prev => [...prev, { 
      id: `new-exercise-${Date.now()}`, 
      name: '', 
      videoUrl: '',
      imageUrl: '',
      showMediaInputs: false,
      sets: [{ weight: '', reps: '' }] 
    }]);
  }, []);

  const removeExercise = useCallback((exId: string) => {
    setExercises(prev => prev.filter(e => e.id !== exId));
  }, []);

  const updateExerciseField = useCallback((exId: string, field: keyof InternalExercise, value: any) => {
    setExercises(prev => prev.map(e => e.id === exId ? { ...e, [field]: value } : e));
  }, []);

  const addSet = useCallback((exId: string) => {
    setExercises(prev => prev.map(e => {
      if (e.id === exId) {
        return { ...e, sets: [...e.sets, { weight: '', reps: '' }] };
      }
      return e;
    }));
  }, []);

  const removeSet = useCallback((exId: string, setIndex: number) => {
    setExercises(prev => prev.map(e => {
      if (e.id === exId) {
        const newSets = e.sets.filter((_, i) => i !== setIndex);
        return { ...e, sets: newSets.length > 0 ? newSets : [{ weight: '', reps: '' }] };
      }
      return e;
    }));
  }, []);

  const updateSet = useCallback((exId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setExercises(prev => prev.map(e => {
      if (e.id === exId) {
        const newSets = [...e.sets];
        if (newSets[setIndex]) {
          newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        }
        return { ...e, sets: newSets };
      }
      return e;
    }));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logsRef || !workoutName.trim()) {
      toast({ variant: "destructive", title: "Incomplet", description: "Adaugă un nume pentru antrenament." });
      return;
    }

    setIsSubmitting(true);
    const data = {
      name: workoutName,
      duration: parseInt(duration) || 0,
      notes,
      exercises: exercises.map(e => ({
        name: e.name,
        videoUrl: e.videoUrl,
        imageUrl: e.imageUrl,
        sets: e.sets.map(s => ({
          weight: parseFloat(s.weight) || 0,
          reps: parseInt(s.reps) || 0
        }))
      }))
    };

    try {
      if (editingId) {
        await updateDoc(doc(logsRef, editingId), {
          ...data,
          updatedAt: serverTimestamp()
        });
        toast({ title: "Actualizat!", description: "Antrenamentul a fost modificat.", className: "bg-success text-success-foreground" });
      } else {
        await addDoc(logsRef, {
          ...data,
          date: format(new Date(), 'yyyy-MM-dd'),
          createdAt: serverTimestamp(),
        });
        toast({ title: "Salvat!", description: "Antrenamentul a fost înregistrat.", className: "bg-success text-success-foreground" });
      }
      onSaved();
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut salva jurnalul." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
      <form onSubmit={handleSave} className="glass rounded-3xl p-6 md:p-8 space-y-6 border-primary/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-headline tracking-wide uppercase text-primary">
            {editingId ? 'Editare Antrenament' : 'Antrenament Nou'}
          </h2>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="rounded-full h-10 w-10">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nume Antrenament</Label>
            <Input value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="ex: Push Day..." className="bg-background/50 border-white/10 text-base" required />
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
                  <Input 
                    value={ex.name} 
                    onChange={e => updateExerciseField(ex.id, 'name', e.target.value)} 
                    placeholder="Nume exercițiu..." 
                    className="bg-transparent border-none p-0 text-lg font-bold placeholder:opacity-30 focus-visible:ring-0 text-base flex-1" 
                  />
                  {isAdmin && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => updateExerciseField(ex.id, 'showMediaInputs', !ex.showMediaInputs)}
                      className={ex.showMediaInputs ? "text-primary" : "text-muted-foreground opacity-50"}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  )}
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeExercise(ex.id)} className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <AnimatePresence>
                  {ex.showMediaInputs && isAdmin && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-1 gap-2 p-3 bg-black/20 rounded-xl border border-white/5 overflow-hidden"
                    >
                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase text-muted-foreground flex items-center gap-1"><Video className="w-3 h-3" /> URL Video (YouTube/Vimeo)</Label>
                        <Input 
                          value={ex.videoUrl} 
                          onChange={e => updateExerciseField(ex.id, 'videoUrl', e.target.value)} 
                          placeholder="https://..." 
                          className="h-8 text-xs bg-background/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3 h-3" /> URL Poză Tutorial</Label>
                        <Input 
                          value={ex.imageUrl} 
                          onChange={e => updateExerciseField(ex.id, 'imageUrl', e.target.value)} 
                          placeholder="https://..." 
                          className="h-8 text-xs bg-background/50"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-4">{setIdx + 1}</span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input 
                          type="number" 
                          step="any" 
                          defaultValue={set.weight} 
                          onBlur={e => updateSet(ex.id, setIdx, 'weight', e.target.value)} 
                          placeholder="kg" 
                          className="h-12 bg-background/50 border-white/5 text-base text-center" 
                        />
                        <Input 
                          type="number" 
                          defaultValue={set.reps} 
                          onBlur={e => updateSet(ex.id, setIdx, 'reps', e.target.value)} 
                          placeholder="reps" 
                          className="h-12 bg-background/50 border-white/5 text-base text-center" 
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeSet(ex.id, setIdx)} className="h-10 w-10 opacity-30 hover:opacity-100 hover:text-destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => addSet(ex.id)} 
                    className="w-full h-10 text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-white/5 border border-dashed border-white/10 mt-2"
                  >
                    + Adaugă Set
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Note Sesiune</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-background/50 border-white/10 h-24 text-base" placeholder="Cum a fost?" />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-gradient-primary text-primary-foreground font-bold uppercase tracking-widest text-base shadow-lg shadow-primary/20">
          {isSubmitting ? 'Se salvează...' : <><Save className="mr-2 h-6 w-6" /> {editingId ? 'Actualizează' : 'Salvează'}</>}
        </Button>
      </form>
    </motion.div>
  );
}
