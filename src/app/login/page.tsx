'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    
    useEffect(() => {
        // The FirebaseClientProvider handles anonymous login automatically.
        // This page just redirects to the dashboard where the profile check happens.
        router.replace('/dashboard');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
    