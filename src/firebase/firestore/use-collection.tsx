import {useState, useEffect, useMemo} from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  type Firestore,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// A utility hook to memoize queries
export const useMemoFirebase = <T>(
  factory: () => T | null,
  deps: React.DependencyList
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
};


export const useCollection = <T>(
  q: Query | CollectionReference | null
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(data);
        setLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'path' in q ? q.path : 'unknown',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [q]);

  return {data, loading};
};
