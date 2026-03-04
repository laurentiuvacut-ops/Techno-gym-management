'use client';

import { useState, useMemo, useCallback } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Trash2, ChevronDown, ChevronUp, Edit2, Copy, Share2, Users, CheckSquare, Square, ArrowLeft, X, ShieldCheck, Video, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useMember } from '@/contexts/member-context';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';
import WorkoutForm from './workout-form';
import WorkoutCommunity from './workout-community';
import WorkoutShareCard from './workout-share-card';
import type { WorkoutLog, SharedWorkout } from '@/types/workout';

export default function WorkoutsTab() {
  const { user } = useUser();
  const { memberData, isAdmin } = useMember();
  const firestore = useFirestore();
  const { setActiveTab } = useDashboardNav();
  const { toast } = useToast();
  
  const [activeSubTab, setActiveSubTab] = useState<'my-logs' | 'community'>('my-logs');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<WorkoutLog | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string, title: string } | null>(null);
  const [shareLog, setShareLog] = useState<WorkoutLog | null>(null);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDescription, setShareDescription] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const logsRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return collection(firestore, 'members', user.phoneNumber, 'workoutLogs');
  }, [firestore, user]);

  const logsQuery = useMemo(() => {
    if (!logsRef) return null;
    return query(logsRef, orderBy('date', 'desc'), limit(50));
  }, [logsRef]);

  const { data: logs, isLoading: logsLoading } = useCollection<WorkoutLog>(logsQuery);

  const sharedRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'sharedWorkouts');
  }, [firestore]);

  const sharedQuery = useMemo(() => {
    if (!sharedRef) return null;
    return query(sharedRef, orderBy('createdAt', 'desc'), limit(30));
  }, [sharedRef]);

  const { data: communityData, isLoading: communityLoading } = useCollection<SharedWorkout>(sharedQuery);

  const sortedCommunityWorkouts = useMemo(() => {
    if (!communityData) return [];
    return [...communityData].sort((a, b) => {
      if (a.isOfficial && !b.isOfficial) return -1;
      if (!a.isOfficial && b.isOfficial) return 1;
      return 0;
    });
  }, [communityData]);

  const resetForm = useCallback(() => {
    setInitialFormData(null);
    setEditingId(null);
    setShowForm(false);
  }, []);

  const handleEditLog = useCallback((log: WorkoutLog) => {
    setInitialFormData(log);
    setEditingId(log.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRepeatLog = useCallback((log: WorkoutLog) => {
    setInitialFormData(log);
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({ title: "Șablon încărcat", description: "Modifică greutățile pentru azi." });
  }, [toast]);

  const handleDeleteLog = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!logsRef) return;
    if (!confirm("Sigur vrei să ștergi acest antrenament din jurnal?")) return;
    try {
      await deleteDoc(doc(logsRef, id));
      toast({ title: "Șters", description: "Înregistrarea a fost eliminată." });
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut șterge." });
    }
  }, [logsRef, toast]);

  const openVideo = (url: string, title: string) => {
    if (!url) return;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
      else videoId = url.split('/').pop() || '';
      
      setActiveVideo({ url: `https://www.youtube.com/embed/${videoId}`, title });
    } else {
      window.open(url, '_blank');
    }
  };

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const handleShareSelected = useCallback(async () => {
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
        isOfficial: isAdmin ? isOfficial : false,
        workouts: selectedWorkouts.map(w => ({
          name: w.name,
          duration: w.duration,
          notes: w.notes,
          exercises: w.exercises.map(ex => ({
            name: ex.name,
            videoUrl: ex.videoUrl || '',
            imageUrl: ex.imageUrl || '',
            sets: ex.sets
          }))
        }))
      });
      toast({ title: "Publicat!", description: "Antrenamentele tale sunt acum în comunitate.", className: "bg-success text-success-foreground" });
      setSelectionMode(false);
      setSelectedIds([]);
      setShareTitle('');
      setShareDescription('');
      setIsOfficial(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut partaja." });
    } finally {
      setIsSharing(false);
    }
  }, [sharedRef, user, memberData, selectedIds, shareTitle, shareDescription, isOfficial, isAdmin, logs, toast]);

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
      <Dialog open={!!activeVideo} onOpenChange={(o) => !o && setActiveVideo(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-black border-primary/20">
          <DialogHeader className="p-4 bg-background/80 backdrop-blur-md">
            <DialogTitle className="flex items-center gap-2 text-primary uppercase font-headline">
              <Play className="w-5 h-5" /> {activeVideo?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {activeVideo?.url.includes('embed') ? (
              <iframe 
                src={activeVideo.url} 
                className="w-full h-full border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-center p-10">
                <p>Se deschide în tab nou...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setActiveTab('home')}
        className="text-white hover:text-primary gap-2 h-9 px-4 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Acasa
      </Button>

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
                {isAdmin && (
                  <div className="flex items-center space-x-2 p-2 bg-primary/10 rounded-xl border border-primary/20">
                    <Checkbox id="official" checked={isOfficial} onCheckedChange={(c) => setIsOfficial(!!c)} />
                    <Label htmlFor="official" className="text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4" /> Marchează ca Antrenament Oficial Techno Gym
                    </Label>
                  </div>
                )}
                <Button onClick={handleShareSelected} disabled={isSharing} className="h-12 px-6 rounded-xl bg-success hover:bg-success/80 text-white font-bold text-sm shadow-lg shadow-success/20">
                  {isSharing ? 'Se publică...' : `Publică ${selectedIds.length} Antrenamente`}
                </Button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showForm && (
              <WorkoutForm 
                key={editingId || 'new'}
                logsRef={logsRef} 
                initialData={initialFormData || undefined} 
                editingId={editingId} 
                onCancel={resetForm} 
                onSaved={resetForm} 
              />
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {logs && logs.length > 0 ? (
              logs.map((log) => {
                const totalVolume = log.exercises?.reduce((sum: number, ex: any) => 
                  sum + (ex.sets?.reduce((sSum: number, s: any) => 
                    sSum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0) || 0), 0) || 0;
                
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
                                <div className="text-primary">{log.exercises?.length || 0} Exerciții</div>
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
                               <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setShareLog(log)} 
                                  className="rounded-xl border-purple-500/30 text-purple-400 hover:bg-purple-500/10 h-10 px-4 text-xs font-bold uppercase"
                                >
                                  <Share2 className="h-4 w-4 mr-2" /> Story
                                </Button>
                            </div>
                            {log.notes && <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl text-sm italic opacity-80 leading-relaxed">"{log.notes}"</div>}
                            <div className="space-y-6">
                              {log.exercises?.map((ex: any, i: number) => (
                                <div key={i} className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-primary text-sm uppercase tracking-wide">{ex.name}</h4>
                                    {ex.videoUrl && (
                                      <button 
                                        onClick={() => openVideo(ex.videoUrl, ex.name)}
                                        className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-full hover:opacity-90 transition-all shadow-md active:scale-95"
                                      >
                                        <Video className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Tutorial Video</span>
                                      </button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {ex.sets?.map((s: any, j: number) => (
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
        <WorkoutCommunity 
          communityWorkouts={sortedCommunityWorkouts} 
          logsRef={logsRef} 
          onCopied={() => setActiveSubTab('my-logs')} 
        />
      )}

      <AnimatePresence>
        {shareLog && (
          <WorkoutShareCard log={shareLog} onClose={() => setShareLog(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
