import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp;

export function FirebaseProvider({ children }) {
  const [user, setUser] = useState(null);

  if (!firebaseApp) {
    const missingKeys = Object.entries(firebaseConfig)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      console.warn(
        `Firebase configuration is incomplete. Missing values for: ${missingKeys.join(', ')}. ` +
          'Create a .env.local file with your project credentials.'
      );
    }

    firebaseApp = initializeApp(firebaseConfig);
  }

  const auth = useMemo(() => getAuth(firebaseApp), []);
  const db = useMemo(() => getFirestore(firebaseApp), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, [auth]);

  const value = useMemo(() => ({
    auth,
    db,
    user,
    signIn: async () => {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    },
    signOut: async () => {
      await firebaseSignOut(auth);
    },
  }), [auth, db, user]);

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
