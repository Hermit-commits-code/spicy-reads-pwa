// Firestore helpers for direct shares (private, 1-to-1)
import { db } from './db';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Fetch all direct shares received by a user
export async function fetchDirectShares(userId) {
  const q = query(
    collection(db, `directShares/${userId}/received`),
    orderBy('timestamp', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
