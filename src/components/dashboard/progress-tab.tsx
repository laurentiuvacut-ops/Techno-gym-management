'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { format, subDays, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, TrendingUp, Plus, ChevronDown, ChevronUp, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

export default function ProgressTab() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleToggleForm = () => {
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
    setShowForm(!showForm);
  };

  const handleSave = async (e: React.FormEvent) => {
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
  };

  const handleDelete = async (id: string) => {
    if (!user?.phoneNumber || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'members', user.phoneNumber, 'measurements', id));
      toast({ title: "Șters", description: "Înregistrarea a fost eliminată." });
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare", description: "Nu s-a putut șterge." });
    }
  };

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
                  <Input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="bg-background/50 border-white/10" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Piept (cm)</Label>
                  <Input type="number" step="0.5" value={formData.chest} onChange={e => setFormData({...formData, chest: e.target.value})} className="bg-background/50 border-white/10" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Talie (cm)</Label>
                  <Input type="number" step="0.5" value={formData.waist} onChange={e => setFormData({...formData, waist: e.target.value})} className="bg-background/50 border-white/10" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Șolduri (cm)</Label>
                  <Input type="number" step="0.5" value={formData.hips} onChange={e => setFormData({...formData, hips: e.target.value})} className="bg-background/50 border-white/10" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Braț Stâng (cm)</Label>
                  <Input type="number" step="0.1" value={formData.leftArm} onChange={e => setFormData({...formData, leftArm: e.target.value})} className="bg-background/50 border-white/10" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Braț Drept (cm)</Label>
                  <Input type="number" step="0.1" value={formData.rightArm} onChange={e => setFormData({...formData, rightArm: e.target.value})} className="bg-background/50 border-white/10" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Coapsă Stângă (cm)</Label>
                  <Input type="number" step="0.1" value={formData.leftThigh} onChange={e => setFormData({...formData, leftThigh: e.target.value})} className="bg-background/50 border-white/10" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Body Fat (%)</Label>
                  <Input type="number" step="0.1" value={formData.bodyFat} onChange={e => setFormData({...formData, bodyFat: e.target.value})} className="bg-background/50 border-white/10" placeholder="0.0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Note</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-background/50 border-white/10 h-20" placeholder="Cum te simți azi?" />
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
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="p-4">Dată</th>
                <th className="p-4">Greutate</th>
                <th className="p-4">Talie</th>
                <th className="p-4">Body Fat</th>
                <th className="p-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {measurements?.map((m) => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-sm">{format(new Date(m.date), 'dd MMM yyyy')}</td>
                  <td className="p-4 text-sm">{m.weight ? `${m.weight} kg` : '-'}</td>
                  <td className="p-4 text-sm">{m.waist ? `${m.waist} cm` : '-'}</td>
                  <td className="p-4 text-sm">{m.bodyFat ? `${m.bodyFat}%` : '-'}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
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
