import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

import { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';

function initializeFirebase() {
  const apps = getApps();
  // Check if firebaseConfig is populated before initializing
  const isConfigValid = firebaseConfig && firebaseConfig.apiKey;
  
  if (!isConfigValid && apps.length === 0) {
    // Return nulls if config is invalid and no app is initialized
    return { app: null, auth: null, firestore: null };
  }

  const app = apps.length ? apps[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  return { app, auth, firestore };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
  useUser,
  useCollection,
  useDoc,
};
