'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, Instagram, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { WorkoutLog } from '@/types/workout';

interface WorkoutShareCardProps {
  log: WorkoutLog;
  onClose: () => void;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function WorkoutShareCard({ log, onClose }: WorkoutShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensiuni Story: 1080x1920
    ctx.clearRect(0, 0, 1080, 1920);

    const margin = 40;
    const cardX = margin;
    const cardY = 1200;
    const cardW = 1080 - margin * 2;
    const cardH = 660;
    const radius = 40;

    // 1. Background Card (Gradient)
    const gradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    gradient.addColorStop(0, 'rgba(9, 9, 11, 0.88)');
    gradient.addColorStop(1, 'rgba(9, 9, 11, 0.95)');
    
    ctx.fillStyle = gradient;
    roundedRect(ctx, cardX, cardY, cardW, cardH, radius);
    ctx.fill();

    // 2. Border
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Top Glow Line
    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + cardW - radius, cardY);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 4. Logo
    ctx.textBaseline = 'top';
    ctx.font = 'bold 28px "Bebas Neue", sans-serif';
    const logoY = cardY + 40;
    
    ctx.fillStyle = '#00FFFF';
    ctx.fillText('TECHNO', cardX + 40, logoY);
    const technoWidth = ctx.measureText('TECHNO').width;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(' GYM', cardX + 40 + technoWidth, logoY);

    // Separator sub logo
    ctx.beginPath();
    ctx.moveTo(cardX + 40, logoY + 45);
    ctx.lineTo(cardX + 140, logoY + 45);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Workout Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px "Bebas Neue", sans-serif';
    let workoutName = log.name.toUpperCase();
    if (ctx.measureText(workoutName).width > cardW - 80) {
        while (ctx.measureText(workoutName + '...').width > cardW - 80 && workoutName.length > 0) {
            workoutName = workoutName.slice(0, -1);
        }
        workoutName += '...';
    }
    ctx.fillText(workoutName, cardX + 40, cardY + 110);

    // 6. Data
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '22px "Inter", sans-serif';
    const dateStr = format(new Date(log.date), 'EEEE, dd MMMM yyyy', { locale: ro });
    ctx.fillText(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), cardX + 40, cardY + 175);

    // 7. Stats
    const statsY = cardY + 240;
    const colW = cardW / 3;

    const totalVolume = log.exercises?.reduce((sum, ex) =>
      sum + (ex.sets?.reduce((sSum, s) =>
        sSum + ((s.weight || 0) * (s.reps || 0)), 0) || 0), 0) || 0;
    const totalSets = log.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0;

    const formatVolume = (val: number) => {
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val.toString();
    };

    ctx.textAlign = 'center';
    // Durată
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px "Bebas Neue", sans-serif';
    ctx.fillText(log.duration.toString(), cardX + colW / 2, statsY);
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.fillText('MIN', cardX + colW / 2, statsY + 65);

    // Separator vertical 1
    ctx.beginPath();
    ctx.moveTo(cardX + colW, statsY + 10);
    ctx.lineTo(cardX + colW, statsY + 60);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Volum
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px "Bebas Neue", sans-serif';
    ctx.fillText(formatVolume(totalVolume), cardX + colW + colW / 2, statsY);
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.fillText('KG VOLUM', cardX + colW + colW / 2, statsY + 65);

    // Separator vertical 2
    ctx.beginPath();
    ctx.moveTo(cardX + colW * 2, statsY + 10);
    ctx.lineTo(cardX + colW * 2, statsY + 60);
    ctx.stroke();

    // Seturi
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px "Bebas Neue", sans-serif';
    ctx.fillText(totalSets.toString(), cardX + colW * 2 + colW / 2, statsY);
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.fillText('SETURI', cardX + colW * 2 + colW / 2, statsY + 65);

    // 8. Lista Exerciții
    ctx.textAlign = 'left';
    const exercisesY = cardY + 360;
    const maxEx = 5;
    const exerciseList = log.exercises?.slice(0, maxEx) || [];

    exerciseList.forEach((ex, i) => {
        const itemY = exercisesY + i * 45;
        
        // Bullet
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(cardX + 45, itemY + 15, 4, 0, Math.PI * 2);
        ctx.fill();

        // Nume
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '20px "Inter", sans-serif';
        let exName = ex.name;
        if (ctx.measureText(exName).width > 600) {
            exName = exName.slice(0, 40) + '...';
        }
        ctx.fillText(exName, cardX + 70, itemY + 5);

        // Best Set
        const bestSet = ex.sets?.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), ex.sets[0]);
        if (bestSet) {
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
            ctx.font = '18px "monospace"'; 
            ctx.fillText(`${bestSet.weight}kg × ${bestSet.reps}`, cardX + cardW - 40, itemY + 7);
            ctx.textAlign = 'left';
        }
    });

    if (log.exercises?.length > maxEx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'italic 18px "Inter", sans-serif';
        ctx.fillText(`+ încă ${log.exercises.length - maxEx} exerciții`, cardX + 70, exercisesY + maxEx * 45 + 5);
    }

    // 9. Watermark
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('technogymcraiova.com', 1080 / 2, cardY + cardH - 30);

    setImageUri(canvas.toDataURL('image/png'));
  }, [log, ro]);

  useEffect(() => {
    // Așteptăm puțin pentru a ne asigura că fonturile sunt încărcate în browser
    const timer = setTimeout(generateImage, 300);
    return () => clearTimeout(timer);
  }, [generateImage]);

  const handleShare = async () => {
    if (!canvasRef.current) return;
    const blob = await new Promise<Blob>((resolve) =>
      canvasRef.current!.toBlob((b) => resolve(b!), 'image/png')
    );
    const file = new File([blob], 'techno-gym-workout.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ 
            files: [file], 
            title: `${log.name} — Techno Gym`,
            text: `Uite antrenamentul meu de azi de la Techno Gym!`
        });
      } catch (e) {
        // Fallback la download dacă share-ul e anulat
      }
    } else {
      handleDownload();
    }
  };

  const handleDownload = () => {
    if (!imageUri) return;
    const link = document.createElement('a');
    link.download = `techno-gym-${log.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = imageUri;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-lg"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm bg-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-6 pb-2">
            <h3 className="text-xl font-headline tracking-widest uppercase">Preview Story</h3>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 pt-2 space-y-6">
            <div className="relative aspect-[9/16] w-full rounded-3xl bg-neutral-900 border border-white/5 overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/10 font-headline text-3xl uppercase tracking-tighter text-center px-10 leading-none">
                        Poza ta de la antrenament apare aici
                    </p>
                </div>
                
                {imageUri && (
                    <img 
                        src={imageUri} 
                        alt="Workout Card" 
                        className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button 
                    onClick={handleShare}
                    className="h-14 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] hover:opacity-90 text-white font-bold uppercase tracking-widest text-xs gap-2 shadow-lg"
                >
                    <Instagram className="w-5 h-5" /> Partajează
                </Button>
                <Button 
                    variant="outline"
                    onClick={handleDownload}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-xs gap-2"
                >
                    <Download className="w-5 h-5" /> Download
                </Button>
            </div>
        </div>

        <canvas 
            ref={canvasRef} 
            width={1080} 
            height={1920} 
            className="hidden" 
        />
      </motion.div>
    </div>
  );
}
