'use client';

import React, {useState, useEffect} from 'react';
import type {FirebaseApp} from 'firebase/app';
import type {Auth} from 'firebase/auth';
import type {Firestore} from 'firebase/firestore';
import {initializeFirebase} from '@/firebase';
import {FirebaseProvider} from './provider';
import { Skeleton } from '@/components/ui/skeleton';

interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

export function FirebaseClientProvider({children}: FirebaseClientProviderProps) {
  const [firebaseInstances, setFirebaseInstances] = useState<{
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    const instances = initializeFirebase();
    setFirebaseInstances(instances);
  }, []);

  if (!firebaseInstances) {
    // Render a loading state while firebase is initializing
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Skeleton className="h-10 w-48 mb-4" />
            <div className="space-y-6 w-full max-w-md px-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseInstances.firebaseApp}
      auth={firebaseInstances.auth}
      firestore={firebaseInstances.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
