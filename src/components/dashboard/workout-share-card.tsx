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

    // Încărcăm logo-ul înainte de a desena
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "https://i.imgur.com/9W1ye1w.png";

    logoImg.onload = () => {
      // 1. CLEAR — Fundal complet transparent
      ctx.clearRect(0, 0, W, H);

      // 2. SHADOW SETTINGS — Pentru vizibilitate maximă pe orice poză
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;

      ctx.textAlign = 'center';

      // 3. LOGO SUPERIOR (Text pentru simetrie stil Strava)
      ctx.font = '400 42px "Bebas Neue", Impact, sans-serif';
      const topLogoX = 540;
      const topLogoY = 180;
      
      const technoW = ctx.measureText('TECHNO').width;
      const gymW = ctx.measureText(' GYM').width;
      const totalTopW = technoW + gymW;
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#00FFFF';
      ctx.fillText('TECHNO', 540 - totalTopW / 2, topLogoY);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(' GYM', 540 - totalTopW / 2 + technoW, topLogoY);

      // 4. NUME ANTRENAMENT (CENTRAL)
      ctx.textAlign = 'center';
      ctx.font = '400 110px "Bebas Neue", Impact, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(log.name.toUpperCase(), 540, 520);

      // Linie separatoare subtilă
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(440, 580);
      ctx.lineTo(640, 580);
      ctx.stroke();

      // 5. DATA
      ctx.font = '400 32px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const dateStr = format(new Date(log.date), 'EEEE, dd MMMM yyyy', { locale: ro });
      ctx.fillText(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), 540, 640);

      // 6. LISTA EXERCITII (Focus pe ultimul set)
      let currentY = 820;
      const exercisesToShow = log.exercises?.slice(0, 7) || [];

      exercisesToShow.forEach((ex) => {
          // Nume Exercitiu
          ctx.font = '600 42px "Inter", sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(ex.name, 540, currentY);
          
          // DOAR ULTIMUL SET
          const lastSet = ex.sets && ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : null;
          const setsStr = lastSet ? `${lastSet.weight}kg × ${lastSet.reps}` : '';
          
          ctx.font = '500 28px "Inter", sans-serif';
          ctx.fillStyle = 'rgba(0, 255, 255, 0.9)';
          ctx.fillText(setsStr, 540, currentY + 55);
          
          currentY += 140;
      });

      if ((log.exercises?.length || 0) > 7) {
          ctx.font = 'italic 26px "Inter", sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillText(`+ încă ${log.exercises.length - 7} exerciții`, 540, currentY);
      }

      // 7. BRANDING JOS CU LOGO IMAGINE
      const logoSize = 100;
      const logoY = 1750;
      
      // Desenăm imaginea logo
      ctx.drawImage(logoImg, 540 - logoSize / 2, logoY - 120, logoSize, logoSize);
      
      // Text branding sub logo
      ctx.font = '400 48px "Bebas Neue", Impact, sans-serif';
      const bottomTextY = logoY + 20;
      
      const bTechnoW = ctx.measureText('TECHNO').width;
      const bGymW = ctx.measureText(' GYM').width;
      const totalBottomW = bTechnoW + bGymW;
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#00FFFF';
      ctx.fillText('TECHNO', 540 - totalBottomW / 2, bottomTextY);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(' GYM', 540 - totalBottomW / 2 + bTechnoW, bottomTextY);

      // Finalizare imagine
      setImageUri(canvas.toDataURL('image/png'));
    };
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
