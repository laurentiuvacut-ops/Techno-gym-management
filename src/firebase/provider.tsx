'use client';

import React, {createContext, useContext} from 'react';
import type {FirebaseApp} from 'firebase/app';
import type {Auth} from 'firebase/auth';
import type {Firestore} from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: {
  children: React.ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {
  const contextValue = { firebaseApp, auth, firestore };

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => {
    const context = useFirebase();
    if (!context.firebaseApp) {
        throw new Error('Firebase app not initialized');
    }
    return context.firebaseApp;
}

export const useAuth = () => {
    const context = useFirebase();
    if (!context.auth) {
        throw new Error('Firebase Auth not initialized');
    }
    return context.auth;
}

export const useFirestore = () => {
    const context = useFirebase();
    if (!context.firestore) {
        throw new Error('Firestore not initialized');
    }
    return context.firestore;
}
