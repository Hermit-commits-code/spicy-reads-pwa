import { doc, getDoc } from 'firebase/firestore';
import { db as firestoreDb } from './db';

export async function getDisplayNameFromFirestore(uid) {
  if (!uid) return null;
  const userRef = doc(firestoreDb, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    console.log('[FIRESTORE] Read displayName for', uid, ':', data.displayName);
    return data.displayName || null;
  }
  console.log('[FIRESTORE] No user doc for', uid);
  return null;
}
