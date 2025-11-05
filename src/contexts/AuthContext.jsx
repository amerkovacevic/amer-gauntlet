import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = doc(db, 'amerGauntlet_users', firebaseUser.uid);
        const snapshot = await getDoc(userDoc);
        if (!snapshot.exists()) {
          await setDoc(userDoc, {
            displayName: firebaseUser.displayName || 'Adventurer',
            streak: 0,
            lastCompleted: null,
            createdAt: serverTimestamp(),
          });
        }
      }
      setUser(firebaseUser);
      setInitializing(false);
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      async signIn(displayName) {
        if (displayName) {
          const credential = await signInWithPopup(auth, googleProvider);
          if (!credential.user.displayName) {
            await updateProfile(credential.user, { displayName });
          }
          return credential.user;
        }
        const credential = await signInWithPopup(auth, googleProvider);
        return credential.user;
      },
      signOut: () => firebaseSignOut(auth),
    }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
