'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Instagram, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { WorkoutLog } from '@/types/workout';

interface WorkoutShareCardProps {
  log: WorkoutLog;
  onClose: () => void;
}

export default function WorkoutShareCard({ log, onClose }: WorkoutShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1920;

    // 1. CLEAR — Fundal complet transparent
    ctx.clearRect(0, 0, W, H);

    // 2. SHADOW SETTINGS — Pentru vizibilitate pe orice poză
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    ctx.textAlign = 'center';

    // FUNCTIE HELPER PENTRU LOGO (Sus și Jos ca la Strava)
    const drawLogo = (y: number, size: number) => {
        ctx.font = `400 ${size}px "Bebas Neue", Impact, sans-serif`;
        const technoText = "TECHNO";
        const gymText = " GYM";
        
        const technoW = ctx.measureText(technoText).width;
        const gymW = ctx.measureText(gymText).width;
        const totalLogoW = technoW + gymW;
        const startX = (W - totalLogoW) / 2;

        ctx.textAlign = 'left';
        ctx.fillStyle = '#00FFFF';
        ctx.fillText(technoText, startX, y);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(gymText, startX + technoW, y);
        ctx.textAlign = 'center';
    };

    // 3. LOGO SUPERIOR
    drawLogo(180, 48);

    // 4. NUME ANTRENAMENT (CENTRAL)
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('ANTRENAMENT', 540, 420);

    ctx.font = '400 110px "Bebas Neue", Impact, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(log.name.toUpperCase(), 540, 540);

    // Linie separatoare subtilă
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(440, 600);
    ctx.lineTo(640, 600);
    ctx.stroke();

    // 5. LISTA EXERCITII (Focus principal)
    let currentY = 720;
    const exercisesToShow = log.exercises?.slice(0, 7) || [];

    exercisesToShow.forEach((ex) => {
        // Nume Exercitiu
        ctx.font = '600 38px "Inter", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(ex.name, 540, currentY);
        
        // Seturi (kg x reps)
        const setsStr = ex.sets?.map(s => `${s.weight}kg×${s.reps}`).join(' • ') || '';
        ctx.font = '400 26px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.9)';
        ctx.fillText(setsStr, 540, currentY + 50);
        
        currentY += 130;
    });

    // Indicator dacă sunt mai multe exerciții
    if ((log.exercises?.length || 0) > 7) {
        ctx.font = 'italic 26px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(`+ încă ${log.exercises.length - 7} exerciții`, 540, currentY);
    }

    // 6. DATA (Jos)
    ctx.font = '400 32px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const dateStr = format(new Date(log.date), 'EEEE, dd MMMM yyyy', { locale: ro });
    ctx.fillText(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), 540, 1680);

    // 7. LOGO INFERIOR
    drawLogo(1800, 56);

    // Finalizare imagine
    setImageUri(canvas.toDataURL('image/png'));
  }, [log]);

  useEffect(() => {
    const timer = setTimeout(generateImage, 500);
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
            text: `Antrenamentul meu de azi la Techno Gym!`
        });
      } catch (e) {}
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
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
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
            <div className="relative aspect-[9/16] w-full rounded-3xl overflow-hidden group shadow-inner">
                {/* Fundal simulat */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/5 font-headline text-4xl uppercase tracking-tighter text-center px-10 leading-none">
                        Textul va pluti direct peste poza ta
                    </p>
                </div>
                
                {imageUri && (
                    <img 
                        src={imageUri} 
                        alt="Workout Overlay" 
                        className="absolute inset-0 w-full h-full object-contain"
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
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest opacity-50">
                Fundalul este 100% transparent în fișierul final
            </p>
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
