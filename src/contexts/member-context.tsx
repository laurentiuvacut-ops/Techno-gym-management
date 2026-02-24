
'use client';

import { createContext, useContext, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

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
};

const MemberContext = createContext<MemberContextType>({
  memberData: null,
  isLoading: true,
});

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();

  const memberDocRef = useMemo(() => {
    if (!firestore || !user?.phoneNumber) return null;
    return doc(firestore, 'members', user.phoneNumber);
  }, [firestore, user]);

  const { data: memberData, isLoading: docLoading } = useDoc(memberDocRef);

  // Optimizăm starea de loading: nu blocăm aplicația dacă baza de date este lentă.
  // Suntem în loading DOAR dacă Auth încă se verifică.
  // Odată ce avem user, lăsăm tab-urile să se randeze cu Skeletons până vin datele din Firestore.
  const isLoading = authLoading || (!!user && docLoading && !memberData);

  return (
    <MemberContext.Provider value={{ memberData, isLoading }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  return useContext(MemberContext);
}
