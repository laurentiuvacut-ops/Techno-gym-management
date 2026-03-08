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

    // Încărcăm logo-ul pentru watermark-ul de jos
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "https://i.imgur.com/9W1ye1w.png";

    logoImg.onload = () => {
      // 1. CLEAR — Fundal 100% transparent
      ctx.clearRect(0, 0, W, H);

      // 2. SHADOW SETTINGS — Drop shadow consistent pe tot textul
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;

      ctx.textAlign = 'center';

      // 3. Calcule date
      const totalVolume = log.exercises?.reduce((sum, ex) => 
        sum + (ex.sets?.reduce((sSum, s) => sSum + ((s.weight || 0) * (s.reps || 0)), 0) || 0), 0) || 0;
      const volStr = totalVolume >= 1000 
        ? `${(totalVolume / 1000).toFixed(1)}K KG` 
        : `${totalVolume} KG`;
      
      const dateStr = format(new Date(log.date), 'EEEE, dd MMMM yyyy', { locale: ro });
      const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

      // 4. HEADER: Nume Antrenament & Dată (Sus)
      // Y = 280 -> Nume (80px)
      ctx.font = '400 80px "Bebas Neue", Impact, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(log.name.toUpperCase(), 540, 280);

      // Y = 340 -> Data (26px)
      ctx.font = '400 26px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(formattedDate, 540, 340);

      // 5. STATISTICI (Zona Centrală)
      
      // --- STAT 1: DURATĂ ---
      // Y = 520 -> Label (28px, cyan)
      ctx.font = '600 28px "Inter", sans-serif';
      ctx.fillStyle = '#00FFFF';
      // @ts-ignore - letterSpacing is supported in modern canvas but TS might complain
      if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
      ctx.fillText('DURATĂ', 540, 520);

      // Y = 610 -> Valoare (90px, alb)
      ctx.font = '400 90px "Bebas Neue", Impact, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      // @ts-ignore
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.fillText(`${log.duration} MIN`, 540, 610);

      // --- STAT 2: VOLUM / CALORII ---
      if (log.isQuickLog) {
        // Label CALORII
        ctx.font = '600 28px "Inter", sans-serif';
        ctx.fillStyle = '#00FFFF';
        // @ts-ignore
        if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
        ctx.fillText('CALORII ARSE', 540, 740);

        // Valoare CALORII
        ctx.font = '400 90px "Bebas Neue", Impact, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        // @ts-ignore
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        ctx.fillText(`${log.calories || 0} KCAL`, 540, 830);

        // Label ACTIVITATE
        ctx.font = '600 28px "Inter", sans-serif';
        ctx.fillStyle = '#00FFFF';
        // @ts-ignore
        if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
        ctx.fillText('ACTIVITATE', 540, 960);

        // Valoare ACTIVITATE
        ctx.font = '400 90px "Bebas Neue", Impact, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        // @ts-ignore
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        ctx.fillText(log.activityType?.toUpperCase() || 'FITNESS', 540, 1050);
      } else {
        // Label VOLUM
        ctx.font = '600 28px "Inter", sans-serif';
        ctx.fillStyle = '#00FFFF';
        // @ts-ignore
        if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
        ctx.fillText('VOLUM', 540, 740);

        // Valoare VOLUM
        ctx.font = '400 90px "Bebas Neue", Impact, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        // @ts-ignore
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        ctx.fillText(volStr, 540, 830);

        // Label EXERCIȚII
        ctx.font = '600 28px "Inter", sans-serif';
        ctx.fillStyle = '#00FFFF';
        // @ts-ignore
        if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
        ctx.fillText('EXERCIȚII', 540, 960);

        // Valoare EXERCIȚII
        ctx.font = '400 90px "Bebas Neue", Impact, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        // @ts-ignore
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        ctx.fillText(`${log.exercises?.length || 0}`, 540, 1050);
      }

      // 6. SEPARATOR SUBTIL
      // Y = 1150
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(440, 1150);
      ctx.lineTo(640, 1150);
      ctx.stroke();

      // 7. BEST EXERCISE (Optional)
      // Y = 1220
      if (!log.isQuickLog && log.exercises && log.exercises.length > 0) {
        let bestEx = log.exercises[0];
        let maxLoad = 0;
        log.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            if (s.weight > maxLoad) {
              maxLoad = s.weight;
              bestEx = ex;
            }
          });
        });
        const lastSet = bestEx.sets[bestEx.sets.length - 1];
        const bestStr = `${bestEx.name} · ${lastSet.weight}kg × ${lastSet.reps}`;
        
        ctx.font = '400 24px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(bestStr, 540, 1220);
      }

      // 8. WATERMARK LOGO (Jos)
      // Y = 1650 -> Icon
      const logoIconSize = 120;
      ctx.drawImage(logoImg, 540 - logoIconSize / 2, 1650 - logoIconSize / 2, logoIconSize, logoIconSize);

      // Y = 1720 -> Brand Text (44px)
      ctx.font = '400 44px "Bebas Neue", Impact, sans-serif';
      const techText = 'TECHNO';
      const gymText = ' GYM';
      const totalLogoW = ctx.measureText(techText + gymText).width;
      
      ctx.textAlign = 'left';
      const logoStartX = 540 - totalLogoW / 2;
      ctx.fillStyle = '#00FFFF';
      ctx.fillText(techText, logoStartX, 1720);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(gymText, logoStartX + ctx.measureText(techText).width, 1720);

      setImageUri(canvas.toDataURL('image/png'));
    };
  }, [log]);

  useEffect(() => {
    // Delay pentru a asigura încărcarea fonturilor
    const timer = setTimeout(generateImage, 800);
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
                {/* Simulated photo background for preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-black" />
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
                <button 
                    onClick={handleShare}
                    className="flex items-center justify-center h-14 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] hover:opacity-90 text-white font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg"
                >
                    <Instagram className="w-5 h-5" /> Partajează
                </button>
                <Button 
                    variant="outline"
                    onClick={handleDownload}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] gap-2"
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
