'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, TrendingUp, Plus, ChevronDown, ChevronUp, Trash2, Save, X, Info, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useDashboardNav } from '@/contexts/dashboard-nav-context';

export default function ProgressTab() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { setActiveTab } = useDashboardNav();
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    leftArm: '',
    rightArm: '',
    leftThigh: '',
    rightThigh: '',
    bodyFat: '',
    notes: ''
  });

  const measurementsRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return collection(firestore, 'members', user.phoneNumber, 'measurements');
  }, [firestore, user]);

  const measurementsQuery = useMemo(() => {
    if (!measurementsRef) return null;
    return query(measurementsRef, orderBy('date', 'desc'), limit(30));
  }, [measurementsRef]);

  const { data: measurements, isLoading } = useCollection(measurementsQuery);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const handleToggleForm = useCallback(() => {
    if (!showForm) {
      const todayEntry = measurements?.find(m => m.date === todayStr);
      if (todayEntry) {
        setFormData({
          weight: todayEntry.weight?.toString() || '',
          chest: todayEntry.chest?.toString() || '',
          waist: todayEntry.waist?.toString() || '',
          hips: todayEntry.hips?.toString() || '',
          leftArm: todayEntry.leftArm?.toString() || '',
          rightArm: todayEntry.rightArm?.toString() || '',
          leftThigh: todayEntry.leftThigh?.toString() || '',
          rightThigh: todayEntry.rightThigh?.toString() || '',
          bodyFat: todayEntry.bodyFat?.toString() || '',
          notes: todayEntry.notes || ''
        });
      }
    }
    setShowForm(prev => !prev);
  }, [showForm, measurements, todayStr]);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.phoneNumber || !firestore) return;

    setIsSubmitting(true);
    const docRef = doc(firestore, 'members', user.phoneNumber, 'measurements', todayStr);
    
    const dataToSave = {
      date: todayStr,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      chest: formData.chest ? parseFloat(formData.chest) : null,
      waist: formData.waist ? parseFloat(formData.waist) : null,
      hips: formData.hips ? parseFloat(formData.hips) : null,
      leftArm: formData.leftArm ? parseFloat(formData.leftArm) : null,
      rightArm: formData.rightArm ? parseFloat(formData.rightArm) : null,
      leftThigh: formData.leftThigh ? parseFloat(formData.leftThigh) : null,
      rightThigh: formData.rightThigh ? parseFloat(formData.rightThigh) : null,
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
      notes: formData.notes
    };

    try {
      await setDoc(docRef, dataToSave, { merge: true });
      toast({ title: "Salvat!", description: "Măsurătorile au fost înregistrate." });
      setShowForm(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut salva." });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, firestore, todayStr, formData, toast]);

  const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!user?.phoneNumber || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'members', user.phoneNumber, 'measurements', id));
      toast({ title: "Șters", description: "Înregistrarea a fost eliminată." });
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut șterge." });
    }
  }, [user, firestore, expandedId, toast]);

  const chartData = useMemo(() => {
    if (!measurements) return [];
    return [...measurements]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(m => ({
        date: format(new Date(m.date), 'dd MMM'),
        value: m[selectedMetric] || 0
      }));
  }, [measurements, selectedMetric]);

  const metrics = [
    { id: 'weight', label: 'Greutate (kg)' },
    { id: 'chest', label: 'Piept (cm)' },
    { id: 'waist', label: 'Talie (cm)' },
    { id: 'hips', label: 'Șolduri (cm)' },
    { id: 'leftArm', label: 'Braț Stâng (cm)' },
    { id: 'rightArm', label: 'Braț Drept (cm)' },
    { id: 'leftThigh', label: 'Coapsă Stângă (cm)' },
    { id: 'rightThigh', label: 'Coapsă Dreaptă (cm)' },
    { id: 'bodyFat', label: 'Body Fat (%)' },
  ];

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64 rounded-xl" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-96 w-full rounded-3xl" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-10">
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
            <Ruler className="w-8 h-8 text-primary" />
            Progresul Meu
          </h1>
          <p className="text-muted-foreground">Urmărește evoluția ta corporală.</p>
        </div>
        <Button onClick={handleToggleForm} className="glow-primary rounded-xl h-12 px-6 font-bold uppercase tracking-wider">
          {showForm ? <><X className="mr-2 h-5 w-5" /> Închide</> : <><Plus className="mr-2 h-5 w-5" /> Adaugă Măsurători</>}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSave}
            className="overflow-hidden"
          >
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6 border-primary/20">
              <h2 className="text-xl font-headline tracking-wide uppercase">Măsurători Azi: {format(new Date(), 'dd MMMM yyyy')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Greutate (kg)</Label>
                  <Input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="bg-background/50 border-white/10 text-base" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Piept (cm)</Label>
                  <Input type="number" step="0.5" value={formData.chest} onChange={e => setFormData({...formData, chest: e.target.value})} className="bg-background/50 border-white/10 text-base" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Talie (cm)</Label>
                  <Input type="number" step="0.5" value={formData.waist} onChange={e => setFormData({...formData, waist: e.target.value})} className="bg-background/50 border-white/10 text-base" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Șolduri (cm)</Label>
                  <Input type="number" step="0.5" value={formData.hips} onChange={e => setFormData({...formData, hips: e.target.value})} className="bg-background/50 border-white/10 text-base" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Braț Stâng (cm)</Label>
                  <Input type="number" step="0.1" value={formData.leftArm} onChange={e => setFormData({...formData, leftArm: e.target.value})} className="bg-background/50 border-white/10 text-base" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Braț Drept (cm)</Label>
                  <Input type="number" step="0.1" value={formData.rightArm} onChange={e => setFormData({...formData, rightArm: e.target.value})} className="bg-background/50 border-white/10 text-base" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Coapsă Stângă (cm)</Label>
                  <Input type="number" step="0.1" value={formData.leftThigh} onChange={e => setFormData({...formData, leftThigh: e.target.value})} className="bg-background/50 border-white/10 text-base" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Body Fat (%)</Label>
                  <Input type="number" step="0.1" value={formData.bodyFat} onChange={e => setFormData({...formData, bodyFat: e.target.value})} className="bg-background/50 border-white/10 text-base" placeholder="0.0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Note</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-background/50 border-white/10 h-20 text-base" placeholder="Cum te simți azi?" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-gradient-primary text-primary-foreground font-bold uppercase tracking-widest">
                {isSubmitting ? 'Se salvează...' : <><Save className="mr-2 h-5 w-5" /> Salvează Măsurătorile</>}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-headline tracking-wide uppercase">Evoluție Grafică</h2>
          </div>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[180px] bg-background/50 border-white/10 rounded-xl">
              <SelectValue placeholder="Selectează Metrică" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10">
              {metrics.map(m => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="h-[300px] w-full mt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
              Adaugă cel puțin două măsurători pentru a vedea graficul.
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border-white/5">
        <div className="p-6 border-b border-white/5">
           <h2 className="text-xl font-headline tracking-wide uppercase">Istoric Măsurători</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="p-4">Dată</th>
                <th className="p-4">Greutate</th>
                <th className="p-4">Talie</th>
                <th className="p-4">Body Fat</th>
                <th className="p-4 text-right">Detalii</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {measurements?.map((m) => {
                const isExpanded = expandedId === m.id;
                return (
                  <React.Fragment key={m.id}>
                    <tr 
                      className={cn(
                        "hover:bg-white/5 transition-colors cursor-pointer",
                        isExpanded && "bg-white/5"
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : m.id)}
                    >
                      <td className="p-4 font-medium text-sm">{format(new Date(m.date), 'dd MMM yyyy')}</td>
                      <td className="p-4 text-sm font-bold text-primary">{m.weight ? `${m.weight} kg` : '-'}</td>
                      <td className="p-4 text-sm">{m.waist ? `${m.waist} cm` : '-'}</td>
                      <td className="p-4 text-sm">{m.bodyFat ? `${m.bodyFat}%` : '-'}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                             {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                           </Button>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0 border-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-black/20"
                            >
                              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Piept</p>
                                  <p className="text-sm font-bold">{m.chest ? `${m.chest} cm` : '-'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Șolduri</p>
                                  <p className="text-sm font-bold">{m.hips ? `${m.hips} cm` : '-'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Braț Stâng</p>
                                  <p className="text-sm font-bold">{m.leftArm ? `${m.leftArm} cm` : '-'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Braț Drept</p>
                                  <p className="text-sm font-bold">{m.rightArm ? `${m.rightArm} cm` : '-'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Coapsă Stângă</p>
                                  <p className="text-sm font-bold">{m.leftThigh ? `${m.leftThigh} cm` : '-'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Coapsă Dreaptă</p>
                                  <p className="text-sm font-bold">{m.rightThigh ? `${m.rightThigh} cm` : '-'}</p>
                                </div>
                                {m.notes && (
                                  <div className="col-span-2 sm:col-span-4 p-3 bg-white/5 rounded-xl border-l-2 border-primary mt-2">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                                      <Info className="w-3 h-3" /> Note
                                    </p>
                                    <p className="text-xs italic opacity-80">"{m.notes}"</p>
                                  </div>
                                )}
                                <div className="col-span-2 sm:col-span-4 flex justify-end">
                                   <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={(e) => handleDelete(e, m.id)} 
                                      className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 px-3 rounded-lg text-[10px] uppercase font-bold tracking-widest"
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" /> Șterge Înregistrarea
                                    </Button>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
              {(!measurements || measurements.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground italic">Nicio măsurătoare salvată.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
