'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifică dacă e deja instalată (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    // navigator.standalone pentru iOS
    if ((navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Detectare iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Interceptăm prompt-ul nativ (Android/Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Detectăm dacă s-a instalat
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    return choice.outcome === 'accepted';
  };

  return {
    canPromptNative: !!deferredPrompt,  // true = Android/Chrome, poate arăta prompt nativ
    isIOS,                                // true = iOS, arată instrucțiuni manuale
    isInstalled,                          // true = deja instalată, ascunde butonul
    promptInstall,                        // funcție care declanșează prompt-ul nativ
    showButton: !isInstalled && (!!deferredPrompt || isIOS),  // arată butonul?
  };
}
