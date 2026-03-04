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

    // --- BRANDING SUS (STIL STRAVA) ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 48px "Bebas Neue", sans-serif';
    
    const headerY = 80;
    const technoText = "TECHNO";
    const gymText = " GYM";
    const technoWidth = ctx.measureText(technoText).width;
    const gymWidth = ctx.measureText(gymText).width;
    const totalHeaderWidth = technoWidth + gymWidth;
    const startX = (1080 - totalHeaderWidth) / 2;

    // Drop shadow subtil pentru textul de sus (ca să fie vizibil pe orice poză)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#00FFFF';
    ctx.textAlign = 'left';
    ctx.fillText(technoText, startX, headerY);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(gymText, startX + technoWidth, headerY);

    // Reset shadow pentru restul elementelor
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // --- CARD JOS ---
    const margin = 40;
    const cardX = margin;
    const cardY = 1150; 
    const cardW = 1080 - margin * 2;
    const cardH = 720;
    const radius = 40;

    // 1. Background Card (Gradient transparent premium)
    const gradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    gradient.addColorStop(0, 'rgba(9, 9, 11, 0.92)');
    gradient.addColorStop(1, 'rgba(9, 9, 11, 0.98)');
    
    ctx.fillStyle = gradient;
    roundedRect(ctx, cardX, cardY, cardW, cardH, radius);
    ctx.fill();

    // 2. Border subtil cyan
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Top Glow Line
    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + cardW - radius, cardY);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 4. Logo în interiorul cardului (mic)
    ctx.textBaseline = 'top';
    ctx.font = 'bold 28px "Bebas Neue", sans-serif';
    const logoInsideY = cardY + 40;
    
    ctx.fillStyle = '#00FFFF';
    ctx.fillText('TECHNO', cardX + 40, logoInsideY);
    const technoInsideWidth = ctx.measureText('TECHNO').width;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(' GYM', cardX + 40 + technoInsideWidth, logoInsideY);

    // 5. Nume Antrenament
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px "Bebas Neue", sans-serif';
    let workoutName = log.name.toUpperCase();
    if (ctx.measureText(workoutName).width > cardW - 80) {
        while (ctx.measureText(workoutName + '...').width > cardW - 80 && workoutName.length > 0) {
            workoutName = workoutName.slice(0, -1);
        }
        workoutName += '...';
    }
    ctx.fillText(workoutName, cardX + 40, cardY + 100);

    // 6. Data
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '20px "Inter", sans-serif';
    const dateStr = format(new Date(log.date), 'EEEE, dd MMMM yyyy', { locale: ro });
    ctx.fillText(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), cardX + 40, cardY + 165);

    // Linie separatoare
    ctx.beginPath();
    ctx.moveTo(cardX + 40, cardY + 210);
    ctx.lineTo(cardX + cardW - 40, cardY + 210);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 7. Lista Exerciții și Seturi
    const contentY = cardY + 240;
    const maxEx = 4;
    const exerciseList = log.exercises?.slice(0, maxEx) || [];

    exerciseList.forEach((ex, i) => {
        const itemY = contentY + i * 110;
        
        // Bullet
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(cardX + 45, itemY + 15, 5, 0, Math.PI * 2);
        ctx.fill();

        // Nume Exercițiu
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px "Inter", sans-serif';
        let exName = ex.name;
        if (ctx.measureText(exName).width > cardW - 100) {
            exName = exName.slice(0, 35) + '...';
        }
        ctx.fillText(exName, cardX + 70, itemY + 5);

        // Seturi (Greutate x Repetări)
        const setsStr = ex.sets.map(s => `${s.weight}kg × ${s.reps}`).join('  •  ');
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.font = '18px "monospace"'; 
        ctx.fillText(setsStr, cardX + 70, itemY + 45);
    });

    if (log.exercises?.length > maxEx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'italic 18px "Inter", sans-serif';
        ctx.fillText(`+ încă ${log.exercises.length - maxEx} exerciții în jurnal`, cardX + 70, contentY + maxEx * 110 + 10);
    }

    // 8. Watermark Jos
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('technogymcraiova.com', 1080 / 2, cardY + cardH - 30);

    setImageUri(canvas.toDataURL('image/png'));
  }, [log, ro]);

  useEffect(() => {
    const timer = setTimeout(generateImage, 400);
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
