'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Trash2, Save, ChevronDown, ChevronUp, Clock, X, Edit2, Copy, Share2, Users, CheckSquare, Square, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useMember } from '@/contexts/member-context';

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
  const { memberData } = useMember();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [activeSubTab, setActiveSubTab] = useState<'my-logs' | 'community'>('my-logs');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedCommunityId, setExpandedCommunityId] = useState<string | null>(null);

  // Sharing logic
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDescription, setShareDescription] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const logsRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return collection(firestore, 'members', user.phoneNumber, 'workoutLogs');
  }, [firestore, user]);

  const logsQuery = useMemo(() => {
    if (!logsRef) return null;
    return query(logsRef, orderBy('date', 'desc'), limit(50));
  }, [logsRef]);

  const { data: logs, isLoading: logsLoading } = useCollection(logsQuery);

  const sharedRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'sharedWorkouts');
  }, [firestore]);

  const sharedQuery = useMemo(() => {
    if (!sharedRef) return null;
    return query(sharedRef, orderBy('createdAt', 'desc'), limit(20));
  }, [sharedRef]);

  const { data: communityWorkouts, isLoading: communityLoading } = useCollection(sharedQuery);

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
        const newSets = e.sets.filter((_, i) => i !== setIndex);
        return { ...e, sets: newSets.length > 0 ? newSets : [{ weight: '', reps: '' }] };
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

  const resetForm = () => {
    setWorkoutName('');
    setDuration('');
    setNotes('');
    setExercises([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditLog = (log: any) => {
    setWorkoutName(log.name);
    setDuration(log.duration?.toString() || '');
    setNotes(log.notes || '');
    setExercises(log.exercises.map((ex: any) => ({
      id: Math.random().toString(36),
      name: ex.name,
      sets: ex.sets.map((s: any) => ({
        weight: s.weight.toString(),
        reps: s.reps.toString()
      }))
    })));
    setEditingId(log.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRepeatLog = (log: any) => {
    setWorkoutName(log.name);
    setDuration(log.duration?.toString() || '');
    setNotes('');
    setExercises(log.exercises.map((ex: any) => ({
      id: Math.random().toString(36),
      name: ex.name,
      sets: ex.sets.map((s: any) => ({
        weight: s.weight.toString(),
        reps: s.reps.toString()
      }))
    })));
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({ title: "Șablon încărcat", description: "Modifică greutățile pentru azi." });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logsRef || !workoutName.trim() || exercises.length === 0) {
      toast({ variant: "destructive", title: "Incomplet", description: "Adaugă un nume și cel puțin un exercițiu." });
      return;
    }

    setIsSubmitting(true);
    const data = {
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
      resetForm();
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut salva jurnalul." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!logsRef) return;
    try {
      await deleteDoc(doc(logsRef, id));
      toast({ title: "Șters", description: "Înregistrarea a fost eliminată." });
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut șterge." });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleShareSelected = async () => {
    if (!sharedRef || !user || !memberData || selectedIds.length === 0 || !shareTitle.trim()) {
      toast({ variant: "destructive", title: "Eroare", description: "Selectează antrenamente și adaugă un titlu." });
      return;
    }

    setIsSharing(true);
    const selectedWorkouts = logs?.filter(l => selectedIds.includes(l.id)) || [];

    try {
      await addDoc(sharedRef, {
        title: shareTitle,
        description: shareDescription,
        creatorName: memberData.name || 'Membru',
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        workouts: selectedWorkouts.map(w => ({
          name: w.name,
          duration: w.duration,
          notes: w.notes,
          exercises: w.exercises
        }))
      });
      toast({ title: "Publicat!", description: "Antrenamentele tale sunt acum în comunitate.", className: "bg-success text-success-foreground" });
      setSelectionMode(false);
      setSelectedIds([]);
      setShareTitle('');
      setShareDescription('');
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut partaja." });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopySharedWorkout = async (sharedWorkout: any) => {
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
      setActiveSubTab('my-logs');
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut copia antrenamentul." });
    }
  };

  if (logsLoading || (activeSubTab === 'community' && communityLoading)) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline tracking-wider flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-primary" />
            Jurnal Antrenament
          </h1>
          <p className="text-muted-foreground">Evoluează împreună cu comunitatea.</p>
        </div>
        <div className="flex gap-2">
           <Button 
            onClick={() => setActiveSubTab('my-logs')} 
            variant={activeSubTab === 'my-logs' ? 'default' : 'ghost'}
            className={cn("rounded-xl font-bold uppercase tracking-wider", activeSubTab === 'my-logs' && "glow-primary bg-gradient-primary text-primary-foreground")}
          >
            Jurnalul Meu
          </Button>
          <Button 
            onClick={() => setActiveSubTab('community')} 
            variant={activeSubTab === 'community' ? 'default' : 'ghost'}
            className={cn("rounded-xl font-bold uppercase tracking-wider", activeSubTab === 'community' && "glow-primary bg-gradient-primary text-primary-foreground")}
          >
            <Users className="w-4 h-4 mr-2" /> Comunitate
          </Button>
        </div>
      </div>

      {activeSubTab === 'my-logs' ? (
        <>
          <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-2xl">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} 
                className="glow-primary rounded-xl h-10 px-4 font-bold uppercase tracking-wider text-xs"
              >
                {showForm ? <><X className="mr-2 h-4 w-4" /> Anulează</> : <><Plus className="mr-2 h-4 w-4" /> Nou</>}
              </Button>
              <Button 
                variant="outline"
                onClick={() => { setSelectionMode(!selectionMode); setSelectedIds([]); }} 
                className={cn("rounded-xl h-10 px-4 font-bold uppercase tracking-wider text-xs border-primary/30 text-primary", selectionMode && "bg-primary/20")}
              >
                {selectionMode ? 'Renunță' : <><Share2 className="mr-2 h-4 w-4" /> Partajează</>}
              </Button>
            </div>
            {selectionMode && selectedIds.length > 0 && (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input 
                        placeholder="Titlu pachet (ex: Săptămâna 1)" 
                        value={shareTitle} 
                        onChange={e => setShareTitle(e.target.value)}
                        className="h-12 bg-background border-primary/30 text-base"
                    />
                    <Textarea 
                        placeholder="Note/Detalii pentru comunitate (opțional)..." 
                        value={shareDescription} 
                        onChange={e => setShareDescription(e.target.value)}
                        className="bg-background border-primary/30 text-base h-12 min-h-[48px]"
                    />
                </div>
                <Button onClick={handleShareSelected} disabled={isSharing} className="h-12 px-6 rounded-xl bg-success hover:bg-success/80 text-white font-bold text-sm shadow-lg shadow-success/20">
                  {isSharing ? 'Se publică...' : `Publică ${selectedIds.length} Antrenamente în Comunitate`}
                </Button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                onSubmit={handleSave} className="overflow-hidden"
              >
                <div className="glass rounded-3xl p-6 md:p-8 space-y-6 border-primary/20">
                  <h2 className="text-xl font-headline tracking-wide uppercase text-primary">
                    {editingId ? 'Editare Antrenament' : 'Antrenament Nou'}
                  </h2>
                  
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
                            <Input value={ex.name} onChange={e => updateExerciseName(ex.id, e.target.value)} placeholder="Nume exercițiu..." className="bg-transparent border-none p-0 text-lg font-bold placeholder:opacity-30 focus-visible:ring-0 text-base" />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeExercise(ex.id)} className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          <div className="space-y-2">
                            {ex.sets.map((set, setIdx) => (
                              <div key={setIdx} className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground w-4">{setIdx + 1}</span>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <Input type="number" step="any" value={set.weight} onChange={e => updateSet(ex.id, setIdx, 'weight', e.target.value)} placeholder="kg" className="h-12 bg-background/50 border-white/5 text-base text-center" />
                                  <Input type="number" value={set.reps} onChange={e => updateSet(ex.id, setIdx, 'reps', e.target.value)} placeholder="reps" className="h-12 bg-background/50 border-white/5 text-base text-center" />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSet(ex.id, setIdx)} className="h-10 w-10 opacity-30 hover:opacity-100 hover:text-destructive"><X className="h-4 w-4" /></Button>
                              </div>
                            ))}
                            <Button type="button" variant="ghost" size="sm" onClick={() => addSet(ex.id)} className="w-full h-10 text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-white/5 border border-dashed border-white/10 mt-2">+ Adaugă Set</Button>
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
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {logs && logs.length > 0 ? (
              logs.map((log) => {
                const totalVolume = log.exercises.reduce((sum: number, ex: any) => sum + ex.sets.reduce((sSum: number, s: any) => sSum + (parseFloat(s.weight) * parseInt(s.reps)), 0), 0);
                const isExpanded = expandedId === log.id;
                const isSelected = selectedIds.includes(log.id);

                return (
                  <div key={log.id} className={cn("glass rounded-2xl overflow-hidden transition-all duration-300 border-white/5 shadow-md", isSelected && "border-primary bg-primary/10")}>
                    <div className="flex items-stretch">
                      {selectionMode && (
                        <div 
                          onClick={() => toggleSelection(log.id)}
                          className="w-12 bg-white/5 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors border-r border-white/5"
                        >
                          {isSelected ? <CheckSquare className="text-primary h-6 w-6" /> : <Square className="text-muted-foreground h-6 w-6" />}
                        </div>
                      )}
                      <div className="flex-1 p-4 md:p-6 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold leading-none">{log.name}</h3>
                              <span className="text-[10px] py-0.5 px-2 bg-primary/20 text-primary rounded-full font-bold uppercase tracking-wider">{totalVolume} KG Volum</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{format(new Date(log.date), 'EEEE, dd MMMM', { locale: ro })}</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="hidden md:flex flex-col items-end text-[10px] uppercase font-bold text-muted-foreground">
                                <div>{log.duration} min</div>
                                <div className="text-primary">{log.exercises.length} Exerciții</div>
                             </div>
                             {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-white/5">
                          <div className="p-4 md:p-6 space-y-6 bg-black/20">
                            <div className="flex flex-wrap gap-2">
                               <Button variant="outline" size="sm" onClick={() => handleRepeatLog(log)} className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 h-10 px-4 text-xs font-bold uppercase"><Copy className="h-4 w-4 mr-2" /> Repetă</Button>
                               <Button variant="outline" size="sm" onClick={() => handleEditLog(log)} className="rounded-xl border-white/10 text-white hover:bg-white/5 h-10 px-4 text-xs font-bold uppercase"><Edit2 className="h-4 w-4 mr-2" /> Editează</Button>
                            </div>
                            {log.notes && <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl text-sm italic opacity-80 leading-relaxed">"{log.notes}"</div>}
                            <div className="space-y-6">
                              {log.exercises.map((ex: any, i: number) => (
                                <div key={i} className="space-y-2">
                                  <h4 className="font-bold text-primary text-sm uppercase tracking-wide">{ex.name}</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {ex.sets.map((s: any, j: number) => (
                                      <div key={j} className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] text-muted-foreground block uppercase">Set {j + 1}</span>
                                        <span className="text-xs font-bold">{s.weight}kg × {s.reps}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-4 flex justify-end">
                              <Button variant="ghost" size="sm" onClick={(e) => handleDeleteLog(e, log.id)} className="text-destructive/60 hover:text-destructive h-8 px-3 text-[10px] uppercase font-bold tracking-widest"><Trash2 className="h-4 w-4 mr-2" /> Șterge</Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="p-16 glass rounded-3xl text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center"><Dumbbell className="w-8 h-8 opacity-20" /></div>
                <p className="text-muted-foreground italic text-sm">Niciun antrenament încă. Începe azi!</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl text-center space-y-2">
            <h2 className="text-2xl font-headline tracking-wide uppercase">Inspiră-te din Comunitate</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Vezi antrenamentele publicate de antrenori și membri. Copiază-le în jurnalul tău și doboară-ți recordurile!</p>
          </div>

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
        </div>
      )}
    </motion.div>
  );
}
