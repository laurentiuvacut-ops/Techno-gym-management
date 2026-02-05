'use client';

import { useEffect } from 'react';

/**
 * A client component that registers the service worker.
 * This is necessary for PWA functionality, including the "Add to Home Screen" prompt.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('Service Worker registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return null; // This component does not render anything.
}
