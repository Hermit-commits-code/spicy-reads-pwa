// Firestore helpers for blocking/unblocking users
import { db } from './db';
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from 'firebase/firestore';

export async function blockUser(userId, blockedUserId) {
  return setDoc(doc(db, `users/${userId}/blocked/${blockedUserId}`), {
    blockedAt: Date.now(),
  });
}

export async function unblockUser(userId, blockedUserId) {
  return deleteDoc(doc(db, `users/${userId}/blocked/${blockedUserId}`));
}

export async function getBlockedUsers(userId) {
  const snapshot = await getDocs(collection(db, `users/${userId}/blocked`));
  return snapshot.docs.map((doc) => doc.id);
}
