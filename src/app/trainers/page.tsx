'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToDashboardTrainers() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/dashboard/trainers');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
