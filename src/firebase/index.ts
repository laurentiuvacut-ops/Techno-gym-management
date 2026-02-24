
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache
} from 'firebase/firestore';

export function initializeFirebase() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  let firestore;
  try {
    // Folosim o formă mai simplă de persistență, compatibilă cu toate browserele mobile
    // Eliminăm MultipleTabManager care poate cauza blocaje (hangs) în browsere non-PWA
    firestore = initializeFirestore(app, {
      localCache: persistentLocalCache({})
    });
  } catch (e) {
    firestore = getFirestore(app);
  }

  return {
    firebaseApp: app,
    auth: auth,
    firestore: firestore
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
