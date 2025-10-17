import { doc, getDoc } from 'firebase/firestore';
import { db as firestoreDb } from './db';

export async function getDisplayNameFromFirestore(uid) {
  if (!uid) return null;
  const userRef = doc(firestoreDb, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return data.displayName || null;
  }
  return null;
}
