'use client';

import { useEffect } from 'react';

/**
 * A client component that registers the service worker.
 * This is necessary for PWA functionality, including the "Add to Home Screen" prompt.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Register the service worker as soon as the component mounts on the client,
    // rather than waiting for the 'load' event. This ensures it's ready sooner.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((registrationError) => {
          console.log('SW registration failed:', registrationError);
        });
    }
  }, []);

  return null; // This component does not render anything.
}
