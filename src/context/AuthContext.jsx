import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onUserStateChanged,
  signIn,
  signUp,
  signInWithGoogle,
  signOutUser,
} from '../firebase/auth';
import { clearUserData } from '../utils/clearUserData';
import { ensureUserProfile } from '../firebase/userProfile';
import { doc, getDoc } from 'firebase/firestore';
import { db as firestoreDb } from '../firebase/db';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true); // default true for early access

  useEffect(() => {
    const unsubscribe = onUserStateChanged(async (firebaseUser) => {
      // If a new user signs in, always clear all local user data first
      await clearUserData();
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        await ensureUserProfile(firebaseUser);
        // Fetch premium flag from Firestore
        try {
          const userRef = doc(firestoreDb, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setIsPremium(!!data.premium);
          } else {
            setIsPremium(true); // fallback
          }
        } catch {
          setIsPremium(true); // fallback
        }
      } else {
        setIsPremium(true); // fallback for logged out
      }
    });
    return unsubscribe;
  }, []);

  // Enhanced signOut: clear all user data and reload
  const enhancedSignOut = async () => {
    await signOutUser();
    await clearUserData();
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPremium,
        signIn,
        signUp,
        signInWithGoogle,
        signOut: enhancedSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
