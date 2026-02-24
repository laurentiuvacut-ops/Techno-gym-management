'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrainersRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard' + window.location.search);
    }, [router]);
    return null;
}
