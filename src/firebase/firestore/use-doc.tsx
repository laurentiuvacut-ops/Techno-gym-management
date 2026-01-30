import {useState, useEffect} from 'react';
import {
  onSnapshot,
  doc,
  type Firestore,
  type DocumentReference,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export const useDoc = <T>(ref: DocumentReference | null) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = {
          ...snapshot.data(),
          id: snapshot.id,
        } as T;
        setData(data);
        setLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return {data, loading};
};
