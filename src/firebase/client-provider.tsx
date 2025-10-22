'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const init = async () => {
      const services = await initializeFirebase();
      setFirebaseServices(services);
    };

    init();
  }, []);

  if (!isMounted || !firebaseServices) {
    // Child components are responsible for their own loading UI, 
    // but we need to provide something for the initial render to avoid mismatches.
    // Returning null while the server renders children causes the hydration error.
    // We will let the pages themselves show a loading indicator.
    // However, until firebaseServices are ready, the children can't render correctly.
    // Let's render children, but the hooks within them will handle the loading state.
    // This can still be tricky. The safest bet is to wait for mount.
    return null; // Don't render children until mounted and services are ready.
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
