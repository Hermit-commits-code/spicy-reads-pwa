import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { db as firestoreDb } from './db';

// Fetch all users (admin dashboard)
export async function getAllUsers() {
  const usersRef = collection(firestoreDb, 'users');
  const snap = await getDocs(usersRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Update user display name
export async function updateUserDisplayName(userId, displayName) {
  const userRef = doc(firestoreDb, 'users', userId);
  await setDoc(userRef, { displayName }, { merge: true });
}

/**
 * Ensure a user profile exists in Firestore for the given user.
 * @param {object} user - Firebase Auth user object
 */
export async function ensureUserProfile(user) {
  if (!user || !user.uid) return;
  const userRef = doc(firestoreDb, 'users', user.uid);
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
  const userRef = doc(firestoreDb, 'users', uid);
  const updates = {};
  // All users are premium in paid/early access
  if (premium !== undefined) updates.premium = true;
  if (admin !== undefined) updates.admin = admin;
  await setDoc(userRef, updates, { merge: true });
}

// Lookup userId by email
export async function getUserIdByEmail(email) {
  const q = query(
    collection(firestoreDb, 'users'),
    where('email', '==', email),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}

// Fetch user profile by userId
export async function getUserProfile(userId) {
  const userRef = doc(firestoreDb, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return { id: userSnap.id, ...userSnap.data() };
}
