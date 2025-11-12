'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
  limit,
  startAfter,
  Query,
  DocumentData,
  FirestoreError,
  QueryConstraint,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

interface UseCollectionOptions {
  constraints?: QueryConstraint[];
  dependencies?: any[];
}

export function useCollection<T>(
  path: string,
  options?: UseCollectionOptions
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedConstraints = useMemo(() => options?.constraints || [], [JSON.stringify(options?.constraints)]);
  const memoizedDependencies = useMemo(() => options?.dependencies || [], [JSON.stringify(options?.dependencies)]);

  useEffect(() => {
    if (!firestore) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const collectionRef = collection(firestore, path);
    const q = query(collectionRef, ...memoizedConstraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching collection at ${path}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, path, JSON.stringify(memoizedConstraints), ...memoizedDependencies]);

  return { data, loading, error };
}
