'use client';

import { useState, useEffect } from 'react';

/**
 * Hook care detectează dacă aplicația rulează într-un mediu nativ (Capacitor/Native Bridge).
 * Utilizat pentru a ascunde funcționalități interzise de App Store (ex: plăți externe).
 */
export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);
  
  useEffect(() => {
    // Verificăm prezența obiectului Capacitor pus la dispoziție de bridge-ul nativ
    const native = !!(
      typeof window !== 'undefined' &&
      ((window as any).Capacitor?.isNativePlatform?.() || (window as any).webkit?.messageHandlers)
    );
    setIsNative(native);
  }, []);
  
  return isNative;
}
