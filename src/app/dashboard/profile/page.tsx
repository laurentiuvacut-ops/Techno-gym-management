'use client';

import { useUser, useFirestore, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuth, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Award, LogOut, Check, Home, ShoppingBag, Camera, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { subscriptions } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const memberDocRef = useMemo(() => {
        if (!firestore || !user?.phoneNumber) return null;
        return doc(firestore, 'members', user.phoneNumber);
    }, [firestore, user]);

    const { data: memberData, isLoading: memberLoading } = useDoc(memberDocRef);
    
    const currentSubscription = useMemo(() => {
        if (!memberData || !memberData.subscriptionType) return null;
        return subscriptions.find(sub => sub.title === memberData.subscriptionType);
    }, [memberData]);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);
    
    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/');
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const resizeImage = (dataUrl: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 400;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = dataUrl;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !memberDocRef) return;

        setIsUploading(true);
        const reader = new FileReader();
        
        reader.onloadend = async () => {
            try {
                const base64Original = reader.result as string;
                const compressedBase64 = await resizeImage(base64Original);
                
                const updateData = { photoURL: compressedBase64 };
                await updateDoc(memberDocRef, updateData);
                
                toast({
                    title: "Profil actualizat",
                    description: "Poza de profil a fost salvată cu succes.",
                });
            } catch (error) {
                console.error("Error updating profile photo:", error);
                const permissionError = new FirestorePermissionError({
                    path: memberDocRef.path,
                    operation: 'update',
                    requestResourceData: { photoURL: 'base64_data' }
                });
                errorEmitter.emit('permission-error', permissionError);
                
                toast({
                    variant: "destructive",
                    title: "Eroare",
                    description: "Nu am putut salva poza. Încercați din nou.",
                });
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        
        reader.readAsDataURL(file);
    };

    const loading = isUserLoading || memberLoading;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || (!memberLoading && !memberData)) return null;

    const displayName = memberData?.name || user.displayName;
    const displayPhone = memberData?.phone || user.phoneNumber;
    const displayPhotoUrl = memberData?.photoURL || user.photoURL;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-4 pb-4"
        >
            <Button asChild variant="ghost" size="sm" className="w-fit">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi
                </Link>
            </Button>
            
            <Card className="glass rounded-3xl border-0 overflow-hidden shadow-xl">
                <CardHeader className="items-center text-center pb-2 bg-foreground/5 pt-6">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <Avatar className="w-24 h-24 border-3 border-primary/20 shadow-lg transition-all duration-300 group-hover:border-primary">
                            <AvatarImage src={displayPhotoUrl || ''} alt={displayName || ''} className="object-cover" />
                            <AvatarFallback className="text-3xl bg-muted font-headline">
                                {displayName?.charAt(0) || 'T'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : (
                                <Camera className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                    <div className="pt-3 space-y-1">
                        <CardTitle className="text-3xl font-headline tracking-wide">{displayName}</CardTitle>
                        <CardDescription className="text-sm font-medium text-primary/80">{displayPhone}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                     {currentSubscription ? (
                        <div className="space-y-4">
                            <div className="space-y-2 text-center bg-primary/10 rounded-xl p-4 border border-primary/10">
                                <h4 className="text-[10px] font-bold text-primary flex items-center justify-center gap-1.5 uppercase tracking-wider">
                                    <Award className="h-4 w-4" />
                                    Plan Activ
                                </h4>
                                <Badge className="text-base font-semibold py-1 px-4 bg-primary text-primary-foreground border-none" variant="default">
                                    {currentSubscription.title}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 border-b border-border/30 pb-1.5">
                                    Beneficii Abonament
                                </h4>
                                <ul className="space-y-2">
                                    {currentSubscription.benefits.slice(0, 4).map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                                            <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="h-3 w-3 text-primary" />
                                            </div>
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-destructive/10 rounded-xl border border-destructive/10">
                            <p className="text-sm font-medium text-destructive">Niciun abonament activ.</p>
                        </div>
                    )}
                    
                    <Separator className="bg-border/20" />

                    <Button 
                      variant="destructive" 
                      className="w-full h-12 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all duration-200 border border-destructive/10 font-bold text-sm" 
                      onClick={handleSignOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Deconectare Cont
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard">
                    <div className="glass p-4 rounded-[2rem] flex flex-col items-center justify-center gap-3 h-28 transition-all duration-200 hover:border-primary/40 active:scale-[0.96] group shadow-lg">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Home className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xs font-headline tracking-widest uppercase">Acasa</span>
                    </div>
                </Link>
                <Link href="/dashboard/shop">
                    <div className="glass p-4 rounded-[2rem] flex flex-col items-center justify-center gap-3 h-28 transition-all duration-200 hover:border-primary/40 active:scale-[0.96] group shadow-lg">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <ShoppingBag className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xs font-headline tracking-widest uppercase">Shop & Stoc</span>
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}
