import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../utils/db';
// Gold Standard: Persist mock user profile locally in Dexie for offline displayName lookup

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Mock user state: always premium, admin, and signed in
  const [user] = useState({
    uid: 'mock-user',
    displayName: 'Demo User',
    email: 'demo@spicyreads.com',
    premium: true,
    admin: true,
  });
  // Persist the user profile into local Dexie users store so other parts of the app
  // (e.g., SettingsLogic) can read displayName from local DB.
  useEffect(() => {
    async function saveUser() {
      try {
        if (user && user.uid) {
          await db.users.put({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
          });
        }
      } catch (err) {
        // non-fatal
         
        console.error('Failed to persist user to Dexie', err);
      }
    }
    saveUser();
  }, [user]);
  const [loading] = useState(false);
  const [isPremium] = useState(true);
  const signOut = () => {};
  return (
    <AuthContext.Provider value={{ user, loading, isPremium, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
