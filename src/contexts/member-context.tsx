'use client';

import { createContext, useContext, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

// Numărul de telefon autorizat ca administrator
export const ADMIN_PHONE = '+40753030493';

type MemberData = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  photoURL?: string;
  expirationDate?: string;
  subscriptionType?: string;
  status?: string;
  qrCode?: string;
  [key: string]: any;
};

type MemberContextType = {
  memberData: MemberData | null;
  isLoading: boolean;
  isAdmin: boolean;
};

const MemberContext = createContext<MemberContextType>({
  memberData: null,
  isLoading: true,
  isAdmin: false,
});

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();

  const memberDocRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return doc(firestore, 'members', user.phoneNumber);
  }, [firestore, user]);

  const { data: memberData, isLoading: docLoading } = useDoc(memberDocRef);

  // Verificarea autoritară a calității de admin bazată pe numărul de telefon
  const isAdmin = useMemo(() => {
    return user?.phoneNumber === ADMIN_PHONE;
  }, [user]);

  const isLoading = authLoading || (!!user && docLoading && !memberData);

  return (
    <MemberContext.Provider value={{ memberData, isLoading, isAdmin }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  return useContext(MemberContext);
}
