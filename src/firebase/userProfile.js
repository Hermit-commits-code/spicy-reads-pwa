// Firestore user profile helpers
import { doc, setDoc, getDoc } from 'firebase/firestore';
import db from './db';

/**
 * Ensure a user profile exists in Firestore for the given user.
 * @param {object} user - Firebase Auth user object
 */
export async function ensureUserProfile(user) {
  if (!user || !user.uid) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const adminValue = user.email === 'hotcupofjoe2013@gmail.com';
  const premiumValue = true; // All users are premium in paid/early access
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      premium: true,
      admin: adminValue,
      createdAt: new Date().toISOString(),
    });
  } else {
    // Always update admin and premium fields on login
    await setDoc(
      userRef,
      { admin: adminValue, premium: true },
      { merge: true },
    );
  }
}

// Helper to grant/revoke admin or premium status (call from admin UI or script)
export async function setUserRole(uid, { premium, admin }) {
  const userRef = doc(db, 'users', uid);
  const updates = {};
  // All users are premium in paid/early access
  if (premium !== undefined) updates.premium = true;
  if (admin !== undefined) updates.admin = admin;
  await setDoc(userRef, updates, { merge: true });
}
